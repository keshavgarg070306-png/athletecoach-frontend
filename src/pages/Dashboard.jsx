import { useState, useEffect, useRef } from 'react'
import confetti from 'canvas-confetti'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, PieChart, Pie, Cell } from 'recharts'
import { getXp, getAchievements, getCurrentPlan, generatePlan, completeDrill, getWeaknesses, getLeaderboard, addWeakness, getFixtures, addFixture, deleteFixture } from '../services/api'

// ── CONSTANTS ─────────────────────────────────────────────────────────────────
const SPORT_DATA = {
  CRICKET:    { icon:'🏏', color:'#00ff88', bg:'linear-gradient(145deg,#0a1628,#0d1f3c)' },
  FOOTBALL:   { icon:'⚽', color:'#ff4500', bg:'linear-gradient(145deg,#1a0a0a,#2a1010)' },
  BADMINTON:  { icon:'🏸', color:'#00d4ff', bg:'linear-gradient(145deg,#0a1020,#0d1a30)' },
  TENNIS:     { icon:'🎾', color:'#ffcc00', bg:'linear-gradient(145deg,#1a1500,#2a2000)' },
  BASKETBALL: { icon:'🏀', color:'#a855f7', bg:'linear-gradient(145deg,#120a1a,#1e1028)' },
}
const LC = ['#00ff88','#00d4ff','#ff4500','#a855f7','#ffcc00','#00ffcc']
const WTags = {
  CRICKET:['WEAK_VS_SPIN','WEAK_VS_YORKER','WEAK_VS_PACE','POOR_RUNNING','NO_BALL_HABIT','WIDE_LINE_BOWLING','POOR_CATCHING','POOR_FOOTWORK'],
  FOOTBALL:['POOR_FINISHING','WEAK_LEFT_FOOT','POOR_HEADING','POOR_PASSING','POOR_DEFENDING','POOR_DRIBBLING'],
  BADMINTON:['WEAK_BACKHAND','POOR_SMASH','WEAK_NET_PLAY','POOR_FOOTWORK_BADMINTON','LOW_STAMINA'],
  TENNIS:['POOR_SERVE','WEAK_VOLLEY','POOR_BASELINE','WEAK_BACKHAND_TENNIS'],
  BASKETBALL:['POOR_DRIBBLING_BASKETBALL','WEAK_FREE_THROW','POOR_DEFENSE','POOR_REBOUNDING']
}
const Skills = {
  CRICKET:[{n:'BATTING',c:'#00ff88'},{n:'BOWLING',c:'#00d4ff'},{n:'FIELDING',c:'#ffcc00'},{n:'FITNESS',c:'#a855f7'}],
  FOOTBALL:[{n:'PACE',c:'#ff4500'},{n:'SHOOTING',c:'#00ff88'},{n:'PASSING',c:'#00d4ff'},{n:'DRIBBLING',c:'#ffcc00'},{n:'DEFENSE',c:'#a855f7'}],
  BADMINTON:[{n:'SMASH',c:'#00ff88'},{n:'FOOTWORK',c:'#00d4ff'},{n:'NET PLAY',c:'#ffcc00'},{n:'STAMINA',c:'#a855f7'}],
  TENNIS:[{n:'SERVE',c:'#00ff88'},{n:'VOLLEY',c:'#00d4ff'},{n:'BASELINE',c:'#ffcc00'},{n:'FITNESS',c:'#a855f7'}],
  BASKETBALL:[{n:'SHOOTING',c:'#00ff88'},{n:'DRIBBLING',c:'#00d4ff'},{n:'DEFENSE',c:'#ffcc00'},{n:'REBOUNDING',c:'#a855f7'}]
}
const Challenges = [
  {icon:'🔥',title:'INTENSITY CHAMPION',desc:'Complete 2 HIGH intensity drills today',reward:'+50 XP'},
  {icon:'⚡',title:'SPEED RUNNER',desc:'Complete any 3 drills today',reward:'+40 XP'},
  {icon:'💪',title:'CONSISTENCY KING',desc:'Train 3 days in a row',reward:'+60 XP'},
  {icon:'🎯',title:'WEAKNESS WARRIOR',desc:'Add a weakness and complete its drill',reward:'+45 XP'},
  {icon:'🏆',title:'PLAN MASTER',desc:'Complete your full day plan',reward:'+80 XP'},
]
const Locked = [
  {n:'On Fire',i:'🔥',d:'7 day streak'},
  {n:'Unstoppable',i:'⚡',d:'30 day streak'},
  {n:'Century',i:'💯',d:'100 drills done'},
  {n:'Elite',i:'👑',d:'Reach Level 8'}
]
const Nav = [
  {id:'dashboard',icon:'⚡',label:'Dashboard',group:'Training'},
  {id:'skills',icon:'🎯',label:'Skill Card',group:'Training'},
  {id:'plan',icon:'📋',label:'My Plan',group:'Training'},
  {id:'weaknesses',icon:'💪',label:'Weaknesses',group:'Training'},
  {id:'body',icon:'🧠',label:'Body Readiness',group:'New Features'},
  {id:'rivalry',icon:'🔥',label:'Rivalry Mode',group:'New Features'},
  {id:'gear',icon:'⚙️',label:'Gear Tracker',group:'New Features'},
  {id:'analytics',icon:'📊',label:'Analytics',group:'Progress'},
  {id:'achievements',icon:'🎖',label:'Badges',group:'Progress'},
  {id:'leaderboard',icon:'🏆',label:'Leaderboard',group:'Community'},
  {id:'fixtures',icon:'📅',label:'Fixtures',group:'Community'},
  {id:'ai',icon:'🤖',label:'AI Coach',group:'Intelligence'},
  {id:'profile',icon:'👤',label:'Profile',group:'Intelligence'},
]

// ── HELPERS ───────────────────────────────────────────────────────────────────
const initials = n => n.split(' ').map(x=>x[0]).join('').toUpperCase().slice(0,2)
const greeting = () => { const h=new Date().getHours(); return h<12?'GOOD MORNING':h<17?'GOOD AFTERNOON':'GOOD EVENING' }
const fireConfetti = () => confetti({ particleCount:80, spread:60, origin:{y:0.6}, colors:['#00ff88','#00d4ff','#ff4500','#a855f7'] })
const fireBig = () => {
  const end = Date.now()+2000
  const colors = ['#00ff88','#00d4ff','#ff4500']
  const frame = () => {
    confetti({particleCount:3,angle:60,spread:55,origin:{x:0},colors})
    confetti({particleCount:3,angle:120,spread:55,origin:{x:1},colors})
    if(Date.now()<end) requestAnimationFrame(frame)
  }
  frame()
}

// ── PARTICLES ─────────────────────────────────────────────────────────────────
const Particles = () => (
  <>
    <div className="bg-grid"/>
    <div className="bg-orbs">
      <div className="orb orb1"/><div className="orb orb2"/><div className="orb orb3"/>
    </div>
    <div className="scan-lines"/>
    {[{c:'#00ff88',l:'8%',dur:'9s',d:'0s',s:3},{c:'#00d4ff',l:'22%',dur:'13s',d:'2s',s:2},{c:'#ff4500',l:'38%',dur:'10s',d:'1s',s:3},{c:'#ffcc00',l:'55%',dur:'12s',d:'3s',s:2},{c:'#a855f7',l:'70%',dur:'11s',d:'0.5s',s:3},{c:'#00ffcc',l:'85%',dur:'14s',d:'1.5s',s:2}].map((p,i)=>(
      <div key={i} className="particle" style={{background:p.c,left:p.l,width:p.s,height:p.s,animationDuration:p.dur,animationDelay:p.d,boxShadow:`0 0 ${p.s*3}px ${p.c}`}}/>
    ))}
  </>
)

// ── SVG CHARACTERS ─────────────────────────────────────────────────────────────
const CricketChar = () => (
  <svg width="150" height="170" viewBox="0 0 150 170">
    <ellipse cx="75" cy="163" rx="36" ry="6" fill="rgba(0,0,0,0.4)"/>
    <rect x="53" y="108" width="20" height="52" rx="10" fill="#f0f0f0"/>
    <rect x="77" y="108" width="20" height="52" rx="10" fill="#f0f0f0"/>
    <ellipse cx="63" cy="159" rx="13" ry="5" fill="#111"/>
    <ellipse cx="87" cy="159" rx="13" ry="5" fill="#111"/>
    <rect x="41" y="65" width="68" height="50" rx="18" fill="#1a3a8e"/>
    <rect x="41" y="75" width="68" height="3" rx="1" fill="rgba(255,255,255,0.15)"/>
    <text x="75" y="100" textAnchor="middle" fontSize="18" fontWeight="700" fill="rgba(255,255,255,0.2)" fontFamily="Arial">7</text>
    <rect x="17" y="72" width="26" height="12" rx="6" fill="#1a3a8e" transform="rotate(-28 30 78)"/>
    <rect x="107" y="72" width="26" height="12" rx="6" fill="#1a3a8e" transform="rotate(28 120 78)"/>
    <rect x="102" y="82" width="7" height="46" rx="3" fill="#8B4513" transform="rotate(18 106 105)"/>
    <rect x="99" y="120" width="13" height="20" rx="3" fill="#D2691E" transform="rotate(18 106 130)"/>
    <rect x="66" y="53" width="18" height="18" rx="8" fill="#D2691E"/>
    <circle cx="75" cy="40" r="26" fill="#D2691E"/>
    <path d="M49 34 Q75 11 101 34 L101 44 Q75 28 49 44 Z" fill="#1a1a3e"/>
    <rect x="49" y="42" width="52" height="8" rx="3" fill="#1a1a3e"/>
    <path d="M49 46 L45 64 L55 64 L59 46" fill="none" stroke="#555" strokeWidth="2.5"/>
    <circle cx="65" cy="40" r="3.5" fill="white"/>
    <circle cx="85" cy="40" r="3.5" fill="white"/>
    <circle cx="66" cy="41" r="2" fill="#222"/>
    <circle cx="86" cy="41" r="2" fill="#222"/>
    <ellipse cx="75" cy="164" rx="32" ry="4" fill="rgba(0,255,136,0.12)"/>
  </svg>
)

const FootballChar = () => (
  <svg width="150" height="170" viewBox="0 0 150 170">
    <ellipse cx="75" cy="163" rx="36" ry="6" fill="rgba(0,0,0,0.4)"/>
    <rect x="53" y="95" width="19" height="50" rx="9" fill="#cc0000"/>
    <rect x="78" y="95" width="19" height="50" rx="9" fill="#cc0000"/>
    <rect x="53" y="121" width="19" height="24" rx="6" fill="white"/>
    <rect x="78" y="121" width="19" height="24" rx="6" fill="white"/>
    <ellipse cx="62" cy="144" rx="12" ry="5" fill="#111"/>
    <ellipse cx="87" cy="144" rx="12" ry="5" fill="#111"/>
    <rect x="41" y="60" width="68" height="44" rx="16" fill="#cc0000"/>
    <rect x="41" y="70" width="68" height="3" rx="1" fill="rgba(255,255,255,0.2)"/>
    <text x="75" y="92" textAnchor="middle" fontSize="18" fontWeight="700" fill="rgba(255,255,255,0.2)" fontFamily="Arial">9</text>
    <rect x="16" y="66" width="26" height="11" rx="5" fill="#cc0000" transform="rotate(-40 29 71)"/>
    <rect x="108" y="66" width="26" height="11" rx="5" fill="#cc0000" transform="rotate(40 121 71)"/>
    <rect x="66" y="48" width="18" height="18" rx="8" fill="#8B5A2B"/>
    <circle cx="75" cy="34" r="24" fill="#8B5A2B"/>
    <path d="M51 28 Q75 8 99 28" fill="#2a1506"/>
    <rect x="51" y="28" width="48" height="8" rx="3" fill="#2a1506"/>
    <circle cx="63" cy="34" r="3.5" fill="white"/>
    <circle cx="87" cy="34" r="3.5" fill="white"/>
    <circle cx="64" cy="35" r="2" fill="#222"/>
    <circle cx="88" cy="35" r="2" fill="#222"/>
    <circle cx="70" cy="140" r="10" fill="white" stroke="#333" strokeWidth="1.5"/>
    <path d="M64 135 L76 135 L79 144 L70 149 L61 144 Z" fill="#333"/>
    <ellipse cx="75" cy="164" rx="32" ry="4" fill="rgba(255,69,0,0.12)"/>
  </svg>
)

const BadmintonChar = () => (
  <svg width="150" height="170" viewBox="0 0 150 170">
    <ellipse cx="75" cy="163" rx="36" ry="6" fill="rgba(0,0,0,0.4)"/>
    <rect x="54" y="102" width="19" height="55" rx="9" fill="#0a5c8e"/>
    <rect x="77" y="102" width="19" height="55" rx="9" fill="#0a5c8e"/>
    <ellipse cx="63" cy="156" rx="12" ry="5" fill="#111"/>
    <ellipse cx="86" cy="156" rx="12" ry="5" fill="#111"/>
    <rect x="41" y="62" width="68" height="48" rx="17" fill="#0a5c8e"/>
    <rect x="41" y="72" width="68" height="3" rx="1" fill="rgba(255,255,255,0.2)"/>
    <text x="75" y="98" textAnchor="middle" fontSize="18" fontWeight="700" fill="rgba(255,255,255,0.2)" fontFamily="Arial">1</text>
    <rect x="16" y="74" width="25" height="11" rx="5" fill="#0a5c8e" transform="rotate(-35 28 79)"/>
    <rect x="110" y="68" width="25" height="11" rx="5" fill="#0a5c8e" transform="rotate(10 122 73)"/>
    <rect x="112" y="66" width="6" height="52" rx="3" fill="#888" transform="rotate(10 115 92)"/>
    <ellipse cx="122" cy="66" rx="11" ry="13" fill="none" stroke="#aaa" strokeWidth="2"/>
    <line x1="111" y1="60" x2="133" y2="60" stroke="#ccc" strokeWidth="1"/>
    <line x1="111" y1="66" x2="133" y2="66" stroke="#ccc" strokeWidth="1"/>
    <rect x="66" y="50" width="18" height="18" rx="8" fill="#FDBCB4"/>
    <circle cx="75" cy="36" r="24" fill="#FDBCB4"/>
    <path d="M51 30 Q75 12 99 30 L97 40 Q75 24 53 40 Z" fill="#2a1a0a"/>
    <circle cx="63" cy="36" r="3.5" fill="white"/>
    <circle cx="87" cy="36" r="3.5" fill="white"/>
    <circle cx="64" cy="37" r="2" fill="#222"/>
    <circle cx="88" cy="37" r="2" fill="#222"/>
    <ellipse cx="75" cy="164" rx="32" ry="4" fill="rgba(0,212,255,0.12)"/>
  </svg>
)

const TennisChar = () => (
  <svg width="150" height="170" viewBox="0 0 150 170">
    <ellipse cx="75" cy="163" rx="36" ry="6" fill="rgba(0,0,0,0.4)"/>
    <rect x="54" y="102" width="19" height="55" rx="9" fill="#fff"/>
    <rect x="77" y="102" width="19" height="55" rx="9" fill="#fff"/>
    <ellipse cx="63" cy="156" rx="12" ry="5" fill="#111"/>
    <ellipse cx="86" cy="156" rx="12" ry="5" fill="#111"/>
    <rect x="41" y="62" width="68" height="48" rx="17" fill="#fff"/>
    <rect x="41" y="72" width="68" height="3" rx="1" fill="rgba(0,0,0,0.08)"/>
    <text x="75" y="98" textAnchor="middle" fontSize="18" fontWeight="700" fill="rgba(0,0,0,0.1)" fontFamily="Arial">R</text>
    <rect x="17" y="70" width="24" height="11" rx="5" fill="#fff" transform="rotate(-30 29 75)"/>
    <rect x="110" y="64" width="24" height="40" rx="5" fill="#888" transform="rotate(5 122 84)"/>
    <ellipse cx="122" cy="62" rx="13" ry="13" fill="none" stroke="#aaa" strokeWidth="2.5"/>
    <line x1="109" y1="56" x2="135" y2="56" stroke="#bbb" strokeWidth="1.2"/>
    <line x1="109" y1="62" x2="135" y2="62" stroke="#bbb" strokeWidth="1.2"/>
    <line x1="109" y1="68" x2="135" y2="68" stroke="#bbb" strokeWidth="1.2"/>
    <line x1="116" y1="49" x2="116" y2="74" stroke="#bbb" strokeWidth="1.2"/>
    <line x1="122" y1="48" x2="122" y2="76" stroke="#bbb" strokeWidth="1.2"/>
    <line x1="128" y1="49" x2="128" y2="74" stroke="#bbb" strokeWidth="1.2"/>
    <circle cx="122" cy="54" r="7" fill="#c8e600" stroke="#a0b800" strokeWidth="1"/>
    <rect x="66" y="50" width="18" height="18" rx="8" fill="#D2B48C"/>
    <circle cx="75" cy="36" r="24" fill="#D2B48C"/>
    <path d="M51 32 Q75 14 99 32 L97 42 Q75 26 53 42 Z" fill="#4a2000"/>
    <circle cx="63" cy="36" r="3.5" fill="white"/>
    <circle cx="87" cy="36" r="3.5" fill="white"/>
    <circle cx="64" cy="37" r="2" fill="#222"/>
    <circle cx="88" cy="37" r="2" fill="#222"/>
    <ellipse cx="75" cy="164" rx="32" ry="4" fill="rgba(255,204,0,0.12)"/>
  </svg>
)

const BasketballChar = () => (
  <svg width="150" height="170" viewBox="0 0 150 170">
    <ellipse cx="75" cy="163" rx="36" ry="6" fill="rgba(0,0,0,0.4)"/>
    <rect x="54" y="102" width="19" height="55" rx="9" fill="#1a1a3e"/>
    <rect x="77" y="102" width="19" height="55" rx="9" fill="#1a1a3e"/>
    <ellipse cx="63" cy="156" rx="12" ry="5" fill="#111"/>
    <ellipse cx="86" cy="156" rx="12" ry="5" fill="#111"/>
    <rect x="41" y="62" width="68" height="48" rx="17" fill="#ff6600"/>
    <rect x="41" y="72" width="68" height="3" rx="1" fill="rgba(255,255,255,0.2)"/>
    <text x="75" y="97" textAnchor="middle" fontSize="18" fontWeight="700" fill="rgba(255,255,255,0.2)" fontFamily="Arial">23</text>
    <rect x="16" y="70" width="26" height="11" rx="5" fill="#ff6600" transform="rotate(-20 29 75)"/>
    <rect x="110" y="58" width="26" height="11" rx="5" fill="#ff6600" transform="rotate(-58 123 63)"/>
    <circle cx="114" cy="49" r="12" fill="#ff8c00" stroke="#cc5500" strokeWidth="1.5"/>
    <path d="M102 49 Q114 43 126 49" fill="none" stroke="#cc5500" strokeWidth="1.5"/>
    <path d="M102 49 Q114 55 126 49" fill="none" stroke="#cc5500" strokeWidth="1.5"/>
    <line x1="114" y1="37" x2="114" y2="61" stroke="#cc5500" strokeWidth="1.5"/>
    <rect x="66" y="50" width="18" height="18" rx="8" fill="#8B5A2B"/>
    <circle cx="75" cy="36" r="24" fill="#8B5A2B"/>
    <rect x="53" y="22" width="44" height="12" rx="6" fill="#1a1a1a"/>
    <rect x="57" y="32" width="36" height="8" rx="4" fill="#1a1a1a"/>
    <circle cx="63" cy="38" r="3.5" fill="white"/>
    <circle cx="87" cy="38" r="3.5" fill="white"/>
    <circle cx="64" cy="39" r="2" fill="#222"/>
    <circle cx="88" cy="39" r="2" fill="#222"/>
    <ellipse cx="75" cy="164" rx="32" ry="4" fill="rgba(168,85,247,0.12)"/>
  </svg>
)

const CHARS = { CRICKET:CricketChar, FOOTBALL:FootballChar, BADMINTON:BadmintonChar, TENNIS:TennisChar, BASKETBALL:BasketballChar }

// ── FIFA CARD ─────────────────────────────────────────────────────────────────
const FifaCard = ({ user, xp, achievements, sport }) => {
  const sd = SPORT_DATA[sport] || SPORT_DATA.CRICKET
  const Char = CHARS[sport] || CricketChar
  const attrs = Skills[sport] || Skills.CRICKET
  const base = Math.min(99, 40 + (xp?.totalXp||0)/10)
  const ratings = attrs.map((a,i) => Math.max(30, Math.min(99, Math.round(base + i*3))))
  const overall = Math.round(ratings.reduce((s,r)=>s+r,0)/ratings.length)
  const xpPct = xp ? Math.min(100,(xp.totalXp%200)/200*100) : 0
  const c = sd.color

  return (
    <div className="fifa-card" style={{background:sd.bg,border:`1px solid ${c}33`,boxShadow:`0 0 0 1px ${c}0a,0 20px 60px rgba(0,0,0,0.6),0 0 40px ${c}0d`}}>
      <div className="fifa-shimmer"/>
      <div className="fifa-holo" style={{background:`linear-gradient(125deg,transparent 20%,${c}08 35%,rgba(0,212,255,0.06) 55%,rgba(168,85,247,0.06) 70%,transparent 85%)`}}/>
      <div className="fifa-corner fc-tl" style={{borderColor:`${c}55`}}/>
      <div className="fifa-corner fc-tr" style={{borderColor:`${c}55`}}/>
      <div className="fifa-corner fc-bl" style={{borderColor:`${c}55`}}/>
      <div className="fifa-corner fc-br" style={{borderColor:`${c}55`}}/>
      <div className="fifa-header">
        <div>
          <div className="fifa-rating" style={{color:c,textShadow:`0 0 30px ${c}80,0 0 60px ${c}40`}}>{overall}</div>
          <div className="fifa-pos" style={{color:c}}>{user.role?.replace(/_/g,' ')}</div>
          <div className="fifa-sport">{sport}</div>
        </div>
        <div style={{textAlign:'right'}}>
          <div style={{fontSize:8,color:`${c}80`,letterSpacing:2}}>SEASON</div>
          <div style={{fontFamily:'Rajdhani,sans-serif',fontSize:15,fontWeight:700,color:`${c}cc`}}>2026</div>
          <div style={{marginTop:6,display:'flex',gap:4,justifyContent:'flex-end'}}>
            {achievements.slice(0,2).map((a,i)=><span key={i} style={{fontSize:14}}>{a.iconCode}</span>)}
          </div>
        </div>
      </div>
      <div className="fifa-avatar"><Char/></div>
      <div className="fifa-name-band" style={{background:`${c}18`,borderTop:`1px solid ${c}33`}}>
        <div className="fifa-player-name">{user.name}</div>
        <div className="fifa-player-sub" style={{color:c}}>AthleteCoach AI · {xp?.levelTitle||'Rookie'}</div>
      </div>
      <div className="fifa-xp-bar"><div className="fifa-xp-fill" style={{width:`${xpPct}%`,background:`linear-gradient(90deg,${c},#00ffcc)`}}/></div>
      <div className="fifa-stats">
        <div className="fifa-stat"><div className="fifa-stat-val" style={{color:c}}>{xp?.totalXp||0}</div><div className="fifa-stat-label">XP</div></div>
        <div className="fifa-stat"><div className="fifa-stat-val" style={{color:'#ff4500'}}>{xp?.currentStreak||0}</div><div className="fifa-stat-label">Streak</div></div>
        <div className="fifa-stat"><div className="fifa-stat-val" style={{color:'#a855f7'}}>{achievements.length}</div><div className="fifa-stat-label">Badges</div></div>
      </div>
      <div className="fifa-footer">
        <div className="fifa-level" style={{color:`${c}80`}}>LEVEL {xp?.currentLevel||1} · {(xp?.levelTitle||'ROOKIE').toUpperCase()}</div>
        <div className="fifa-xp-text">{xp?.totalXp||0}/{(xp?.currentLevel||1)*200} XP</div>
      </div>
    </div>
  )
}

// ── SMALL COMPONENTS ──────────────────────────────────────────────────────────
const StatCard = ({label,value,sub,icon,color}) => {
  const colorMap = {neon:'var(--neon)',fire:'var(--fire)',blue:'var(--blue)',purple:'var(--purple)'}
  const c = colorMap[color]||'var(--neon)'
  return (
    <div className={`stat-card c-${color}`}>
      <div className="stat-label">{label}</div>
      <div className={`stat-value c-${color}`}>{value}</div>
      <div className="stat-sub">{sub}</div>
      <div className="stat-icon">{icon}</div>
    </div>
  )
}

const DrillCard = ({drill,onComplete}) => (
  <div className={`ac-drill-card ${drill.completed?'done':''}`}>
    <div className={`drill-dot ${drill.intensity}`}/>
    <div className="drill-info">
      <div className="drill-name">{drill.drillName}</div>
      <div className="drill-meta">⏱ {drill.durationMinutes} min · {drill.intensity}</div>
    </div>
    <div className={`drill-check ${drill.completed?'done':''}`} onClick={()=>!drill.completed&&onComplete(drill.id)}>
      {drill.completed?'✓':''}
    </div>
  </div>
)

const Empty = ({icon,title,sub,action}) => (
  <div className="empty-state">
    <span className="empty-icon">{icon}</span>
    <div className="empty-text">{title}</div>
    <div className="empty-sub">{sub}</div>
    {action}
  </div>
)

const Toast = ({msg,onClose}) => {
  useEffect(()=>{const t=setTimeout(onClose,4000);return()=>clearTimeout(t)},[])
  return <div className="ac-toast"><div className="ac-toast-dot"/><div className="ac-toast-text">{msg}</div></div>
}

const LevelUp = ({level,title,onClose}) => {
  useEffect(()=>{fireBig()},[])
  return (
    <div className="level-up-overlay" onClick={onClose}>
      <div className="level-up-card" onClick={e=>e.stopPropagation()}>
        <div style={{fontSize:72,animation:'bounce 0.5s infinite alternate',display:'inline-block'}}>⚡</div>
        <div className="level-up-title">LEVEL UP!</div>
        <div style={{fontSize:18,color:'var(--muted2)',margin:'8px 0 4px'}}>You reached</div>
        <div style={{fontFamily:'Rajdhani,sans-serif',fontSize:28,fontWeight:700,color:'var(--neon)',letterSpacing:2}}>
          LEVEL {level} — {title?.toUpperCase()}
        </div>
        <div style={{fontSize:13,color:'var(--muted2)',marginTop:8}}>Keep training to reach the next level!</div>
        <button className="level-up-close" onClick={onClose}>🎉 AWESOME!</button>
      </div>
    </div>
  )
}

const XpPanel = ({xp}) => {
  const pct = xp ? Math.min(100,(xp.totalXp%200)/200*100) : 0
  const heatData = [1,2,0,3,1,4,2,3,1,4,2,3,4,4,2,4,3,4,4,2,4,3,4,4,4,4,3,0]
  return (
    <div className="ac-card">
      <div className="panel-title"><div className="panel-accent" style={{background:'var(--neon)'}}/> XP Progress</div>
      <div style={{fontFamily:'Rajdhani,sans-serif',fontSize:36,fontWeight:700,color:'var(--neon)',lineHeight:1}}>{xp?.totalXp||0}</div>
      <div style={{fontSize:10,color:'var(--muted2)',marginTop:4}}>XP Points Earned</div>
      <div className="xp-track"><div className="xp-fill" style={{width:pct+'%'}}/></div>
      <div className="xp-labels"><span>Lv {xp?.currentLevel||1}</span><span>{xp?.xpToNextLevel||200} to next</span></div>
      {(xp?.currentStreak||0)>=3 && <div className="streak-fire">🔥 {xp.currentStreak}-day streak! +5 XP bonus per drill</div>}
      <div style={{marginTop:14}}>
        <div style={{fontSize:9,color:'var(--muted2)',marginBottom:8,letterSpacing:'2px',textTransform:'uppercase'}}>4-Week Activity</div>
        <div className="heatmap-grid">
          {heatData.map((v,i)=><div key={i} className={`hm-cell ${v===0?'':v===1?'l1':v===2?'l2':v===3?'l3':'l4'}`}/>)}
        </div>
        <div style={{display:'flex',justifyContent:'space-between',fontSize:9,color:'var(--muted)',marginTop:6}}>
          <span>4 weeks ago</span><span>Today</span>
        </div>
      </div>
    </div>
  )
}

const SkillPanel = ({sport,weaknesses,xp}) => {
  const attrs = Skills[sport]||Skills.CRICKET
  const base = Math.min(99,40+(xp?.totalXp||0)/10)
  const ratings = attrs.map((a,i)=>{
    const pen = weaknesses.filter(w=>w.severity==='HIGH'&&w.weaknessTag.toLowerCase().includes(a.n.toLowerCase().slice(0,4))).length*8
    return Math.max(30,Math.min(99,Math.round(base-pen+(i*3))))
  })
  const overall = Math.round(ratings.reduce((s,r)=>s+r,0)/ratings.length)
  return (
    <div className="skill-card">
      <div className="panel-title"><div className="panel-accent" style={{background:'var(--neon2)'}}/> Skill Ratings</div>
      {attrs.map((a,i)=>(
        <div key={i} className="skill-rating-row">
          <div className="skill-name">{a.n}</div>
          <div className="skill-bar-track"><div className="skill-bar-fill" style={{width:ratings[i]+'%',background:a.c}}/></div>
          <div className="skill-rating-num" style={{color:a.c}}>{ratings[i]}</div>
        </div>
      ))}
      <div className="overall-rating">
        <div className="overall-num">{overall}</div>
        <div className="overall-label">Overall Rating</div>
      </div>
    </div>
  )
}

// ── MAIN ──────────────────────────────────────────────────────────────────────
export default function Dashboard({user,onLogout}) {
  const [page,setPage] = useState('dashboard')
  const [xp,setXp] = useState(null)
  const [prevLv,setPrevLv] = useState(1)
  const [ach,setAch] = useState([])
  const [plan,setPlan] = useState(null)
  const [weak,setWeak] = useState([])
  const [lb,setLb] = useState([])
  const [fix,setFix] = useState([])
  const [toast,setToast] = useState('')
  const [levelUp,setLevelUp] = useState(null)
  const [loading,setLoading] = useState(false)
  const [nw,setNw] = useState({weaknessTag:(WTags[user.sport]||WTags.CRICKET)[0],severity:'HIGH'})
  const [fx,setFx] = useState({matchDate:'',opponent:'',venue:''})
  const [mood,setMood] = useState('pumped')
  const [aiTab,setAiTab] = useState('chat')
  const [aiInput,setAiInput] = useState('')
  const [aiResult,setAiResult] = useState('')
  const [aiLoading,setAiLoading] = useState(false)
  const [chatHistory,setChatHistory] = useState([
    {role:'ai',text:`Hey ${user.name.split(' ')[0]}! 🤖 I'm your AI coach. Ask me anything about ${user.sport} training, tactics, or recovery!`}
  ])
  const chatEndRef = useRef(null)

  const tags = WTags[user.sport]||WTags.CRICKET
  const today = Challenges[new Date().getDay()%Challenges.length]
  const sd = SPORT_DATA[user.sport]||SPORT_DATA.CRICKET
  const ttStyle = {background:'var(--card)',border:'1px solid rgba(0,255,136,0.3)',borderRadius:8,color:'var(--text)'}
  const groups = [...new Set(Nav.map(n=>n.group))]

  const load = async () => {
    try {
      const [xr,ar,wr,lr,fr] = await Promise.all([
        getXp(user.email),getAchievements(user.email),
        getWeaknesses(user.email),getLeaderboard(),getFixtures(user.email)
      ])
      setXp(xr.data); setPrevLv(xr.data.currentLevel)
      setAch(ar.data); setWeak(wr.data); setLb(lr.data); setFix(fr.data)
      try{const p=await getCurrentPlan(user.email);setPlan(p.data)}catch(e){}
    }catch(e){}
  }
  useEffect(()=>{load()},[])
  useEffect(()=>{chatEndRef.current?.scrollIntoView({behavior:'smooth'})},[chatHistory])

  const msg = m => setToast(m)
  const genPlan = async () => {
    setLoading(true)
    try{const r=await generatePlan(user.email);setPlan(r.data);msg('🚀 New training plan generated!')}
    catch(e){msg('❌ '+(e.response?.data?.message||'Add weaknesses first!'))}
    setLoading(false)
  }
  const doneDrill = async id => {
    try{
      await completeDrill(user.email,id)
      const [p,xr,ar]=await Promise.all([getCurrentPlan(user.email),getXp(user.email),getAchievements(user.email)])
      setPlan(p.data); setAch(ar.data); fireConfetti()
      if(xr.data.currentLevel>prevLv) setLevelUp({level:xr.data.currentLevel,title:xr.data.levelTitle})
      setPrevLv(xr.data.currentLevel); setXp(xr.data); msg('🎉 +10 XP earned!')
    }catch(e){}
  }
  const addWeak = async () => {
    try{await addWeakness(user.email,nw);const r=await getWeaknesses(user.email);setWeak(r.data);msg('✅ Weakness added!')}
    catch(e){msg('❌ '+(e.response?.data?.message||'Error'))}
  }
  const addFix = async () => {
    if(!fx.matchDate){msg('❌ Date required!');return}
    try{await addFixture(user.email,fx);setFx({matchDate:'',opponent:'',venue:''});const r=await getFixtures(user.email);setFix(r.data);msg('✅ Fixture added!')}
    catch(e){msg('❌ Error')}
  }
  const delFix = async id => {
    try{await deleteFixture(user.email,id);const r=await getFixtures(user.email);setFix(r.data);msg('🗑 Removed')}
    catch(e){}
  }

  const askAI = (prompt) => {
  const p = prompt.toLowerCase()
  const sport = user.sport

  // GREETINGS
  if(p.match(/^(hi|hello|hey|sup|yo|hlo|hii)[\s!?]*$/))
    return `👋 Hey ${user.name.split(' ')[0]}! I'm your AI coach for ${sport}. Ask me anything about training, technique, recovery or tactics!`

  // HOW ARE YOU
  if(p.includes('how are you')||p.includes('how r u')||p.includes('whats up')||p.includes('what\'s up'))
    return `😊 I'm great and ready to help you train! You're at Level ${xp?.currentLevel||1} with ${xp?.totalXp||0} XP. Let's keep that streak going! 🔥`

  // CRICKET SPECIFIC
  if(sport==='CRICKET') {
    if(p.includes('bouncer')||p.includes('short ball')||p.includes('short pitch'))
      return '🏏 Against bouncers: Watch the ball early from the hand. Sway back and away OR hook/pull if confident. Keep eyes on the ball always. Practice with throw-downs at shoulder height daily.'
    if(p.includes('spin')||p.includes('spinner')||p.includes('turn')||p.includes('googly')||p.includes('legbreak'))
      return '🏏 Against spin: Use soft hands to kill spin. Move feet — either fully forward or back. Watch the bowler\'s wrist at release point. Play late and trust your defense first.'
    if(p.includes('yorker'))
      return '🏏 Against yorkers: Get bat down very early. Dig it out with a straight bat. Stay side-on. Practice with throw-downs at your feet daily for 15 minutes.'
    if(p.includes('pace')||p.includes('fast')||p.includes('speed')||p.includes('quick bowl'))
      return '🏏 Against pace: Watch ball from bowler\'s hand. Play as late as possible. Keep head still and weight forward. Soft hands on rising deliveries.'
    if(p.includes('bat')||p.includes('batting')||p.includes('run')||p.includes('score'))
      return '🏏 Batting tips: Pick a spot to hit, not a bowler to hit. Play each ball on merit. Rotate strike with singles. Never give your wicket away cheaply.'
    if(p.includes('bowl')||p.includes('bowling')||p.includes('wicket')||p.includes('swing'))
      return '🏏 Bowling tips: Hit the seam consistently. Vary your pace by 10-15%. Bowl to your field. A maiden is as good as a wicket — build pressure!'
    if(p.includes('field')||p.includes('catch')||p.includes('fielding')||p.includes('throw'))
      return '🏏 Fielding tips: Stay on your toes, low position. Watch the bat. Move early on contact. Practice catching 50 balls daily. A good fielder saves 20+ runs per match.'
    if(p.includes('run between')||p.includes('running between')||p.includes('run out'))
      return '🏏 Running between wickets: Call early and loud (YES/NO/WAIT). Always back up. Run hard for every single. Turn and look at the ball immediately after crossing.'
    if(p.includes('footwork'))
      return '🏏 Footwork: Practice the forward defensive and backward defensive 100 times daily. Move feet to the pitch of the ball. Quick, decisive footwork is the base of batting.'
  }

  // FOOTBALL SPECIFIC
  if(sport==='FOOTBALL') {
    if(p.includes('bouncer')||p.includes('tackle')||p.includes('defend')||p.includes('pressure'))
      return '⚽ Defending under pressure: Stay on your feet, don\'t dive in. Jockey the attacker backward. Force them to their weak foot. Only tackle when you\'re 100% sure you\'ll win the ball.'
    if(p.includes('finish')||p.includes('shoot')||p.includes('goal')||p.includes('striker'))
      return '⚽ Finishing: Placement beats power 80% of the time. Practice shooting with both feet. Create angles with your first touch. Shoot across the goalkeeper — far post is usually open.'
    if(p.includes('dribbl')||p.includes('skill')||p.includes('1v1')||p.includes('one on one'))
      return '⚽ Dribbling: Low center of gravity, small touches. Change direction explosively with inside/outside of foot. Use body feints to unbalance defender before accelerating.'
    if(p.includes('pass')||p.includes('assist')||p.includes('through ball'))
      return '⚽ Passing: Always look up before receiving. Weight your passes perfectly. Play simple when unsure. A well-weighted pass into space is better than a fancy one.'
    if(p.includes('head')||p.includes('aerial')||p.includes('cross')||p.includes('corner'))
      return '⚽ Heading: Time your run and jump. Attack the ball — don\'t wait for it. Use your forehead. Keep eyes open through contact. Flick headers use neck muscles.'
    if(p.includes('speed')||p.includes('fast')||p.includes('sprint')||p.includes('pace'))
      return '⚽ Speed: Sprint intervals 3x per week. Work on explosive first 5 meters — that\'s where most football speed matters. Resistance band drills improve acceleration fast.'
  }

  // BADMINTON SPECIFIC
  if(sport==='BADMINTON') {
    if(p.includes('smash')||p.includes('attack'))
      return '🏸 Smash improvement: Full shoulder rotation, snap wrist at contact. Jump for steeper angle. Mix pace — a slower smash to body can be more effective than a fast one to corners.'
    if(p.includes('net')||p.includes('front court')||p.includes('drop'))
      return '🏸 Net play: Dominate the front court. Quick split steps after every shot. Use a soft tumbling net shot to force opponent up. Deception is everything at the net.'
    if(p.includes('footwork')||p.includes('movement')||p.includes('court'))
      return '🏸 Footwork: Always return to center base after each shot. Use chassé steps for side movement. Practice shadow footwork 10 minutes daily — this is the foundation of badminton.'
    if(p.includes('serve')||p.includes('service'))
      return '🏸 Service: Low serve — barely clear the net, land near front line. Flick serve — same action but snap wrist at last moment for element of surprise.'
  }

  // TENNIS SPECIFIC
  if(sport==='TENNIS') {
    if(p.includes('serve')||p.includes('service')||p.includes('ace'))
      return '🎾 Serve: Consistent toss is everything — practice toss alone. Use legs for power, NOT arm. Snap wrist at contact. Target body serve to limit return angles.'
    if(p.includes('backhand')||p.includes('forehand')||p.includes('groundstroke'))
      return '🎾 Groundstrokes: Prepare early — racket back before ball bounces. Contact in front of body. Follow through completely. Topspin gives you margin over the net.'
    if(p.includes('volley')||p.includes('net'))
      return '🎾 Volley: Stay low, compact swing, punch the ball. Move forward aggressively. Angle volleys away from opponent rather than hitting hard at them.'
  }

  // BASKETBALL SPECIFIC
  if(sport==='BASKETBALL') {
    if(p.includes('free throw')||p.includes('foul shot'))
      return '🏀 Free throws: Same routine every single time. Bend knees, elbow under ball, follow through with wrist. Practice 50 per day — it\'s the most valuable skill in basketball.'
    if(p.includes('dribble')||p.includes('handle')||p.includes('crossover'))
      return '🏀 Ball handling: Practice both hands equally. Keep head UP — never look at the ball. Crossover, between legs, behind back — master each before combining them.'
    if(p.includes('defend')||p.includes('defense')||p.includes('steal'))
      return '🏀 Defense: Stay between your man and the basket. Active hands in passing lanes. Don\'t reach — move your feet. A charge taken is as good as a steal.'
  }

  // GENERAL TOPICS (all sports)
  if(p.includes('recover')||p.includes('rest')||p.includes('tired')||p.includes('sore')||p.includes('sleep'))
    return '😴 Recovery: Sleep 7-9 hours — this is when muscles grow. Ice sore areas for 15 mins. Light walking on rest days keeps blood flowing. Never underestimate recovery!'
  if(p.includes('diet')||p.includes('food')||p.includes('eat')||p.includes('nutrition')||p.includes('protein'))
    return '🥗 Nutrition: Carbs 2-3 hours before training for energy. Protein within 30 mins after for muscle repair. 3 liters water daily. Banana before training for quick energy boost.'
  if(p.includes('warm up')||p.includes('warmup')||p.includes('stretch'))
    return '🤸 Warm up: 5 min light jog → dynamic stretches (leg swings, hip circles, arm rotations) → sport-specific movements. 15 minutes total. Never skip — prevents injuries!'
  if(p.includes('mental')||p.includes('nervous')||p.includes('confident')||p.includes('pressure')||p.includes('anxiety'))
    return '🧠 Mental strength: Deep breath before high pressure moments (4 seconds in, 4 out). Positive self-talk. Focus on the PROCESS not outcome. Visualization — see yourself succeeding before doing it.'
  if(p.includes('injur')||p.includes('pain')||p.includes('hurt')||p.includes('swell'))
    return '🏥 Injury: RICE method — Rest, Ice, Compress, Elevate. See a sports doctor if pain persists beyond 48 hours. Never train through sharp or shooting pain — you\'ll make it worse!'
  if(p.includes('motivat')||p.includes('lazy')||p.includes('dont want')||p.includes('don\'t want')||p.includes('skip'))
    return '💪 Motivation: Remember WHY you started. Show up even on bad days — consistency beats perfection. Your future self will thank your current self for not quitting!'
  if(p.includes('streak')||p.includes('consistent')||p.includes('habit')||p.includes('routine'))
    return `🔥 You have a ${xp?.currentStreak||0}-day streak! Build on it — same time every day. Attach training to an existing habit (after school, before dinner). Missing once is fine, never miss twice!`
  if(p.includes('xp')||p.includes('level')||p.includes('point')||p.includes('rank'))
    return `⚡ You have ${xp?.totalXp||0} XP at Level ${xp?.currentLevel||1} (${xp?.levelTitle||'Rookie'}). Complete daily drills for +10 XP each. Streak bonus gives extra XP. You need ${xp?.xpToNextLevel||200} XP to level up!`
  if(p.includes('plan')||p.includes('drill')||p.includes('exercise')||p.includes('workout'))
    return '📋 Your training plan is auto-generated based on YOUR weaknesses. Complete all drills daily. If mood is tired — do lighter drills. Never skip more than 1 day in a row!'
  if(p.includes('weak')||p.includes('weakness')||p.includes('bad at')||p.includes('struggle'))
    return `💪 Your weaknesses are already tracked in the system. The training plan targets them automatically. Focus on your weakest skill for 30 focused days — you\'ll see major improvement!`
  if(p.includes('thank')||p.includes('thanks')||p.includes('great')||p.includes('nice')||p.includes('good'))
    return `😊 Happy to help ${user.name.split(' ')[0]}! Keep training consistently and you\'ll reach Level ${(xp?.currentLevel||1)+1} soon. Any other questions? 🏆`

  return `🎯 I'm your ${sport} coach! Ask me about technique, tactics, recovery, nutrition, mental game or your specific weaknesses. What would you like to improve?`
}

  const handleChat = async () => {
  if(!aiInput.trim()) return
  const userMsg = aiInput
  setAiInput('')
  setChatHistory(h=>[...h,{role:'user',text:userMsg}])
  setAiLoading(true)
  const r = askAI(userMsg)
  setChatHistory(h=>[...h,{role:'ai',text:r}])
  setAiLoading(false)
}

const handleAIAction = (type) => {
  setAiLoading(true)
  setAiResult('')
  
  let result = ''
  
  if(type==='weakness') {
    result = askAI(aiInput)
  }
  
  if(type==='match') {
    result = askAI(aiInput + ' match analysis cricket football')
  }
  
  if(type==='predict') {
    result = `🔮 Performance Prediction for ${user.name}:
    
📊 Current: Level ${xp?.currentLevel||1} (${xp?.levelTitle||'Rookie'}) with ${xp?.totalXp||0} XP
🔥 Streak: ${xp?.currentStreak||0} days

📈 2-Week Prediction:
${xp?.currentStreak>=5 ? '✅ You are on fire! At this pace you will reach Level '+(xp?.currentLevel+1)+' in about '+(Math.ceil((xp?.xpToNextLevel||200)/70))+' days.' : '💪 Build your streak to 5+ days for bonus XP. Estimated level up in '+(Math.ceil((xp?.xpToNextLevel||200)/50))+' days.'}

🎯 Top Focus Areas:
${weak.length>0 ? '1. '+weak[0]?.weaknessTag?.replace(/_/g,' ') : '1. Add weaknesses to get targeted advice'}
${weak.length>1 ? '2. '+weak[1]?.weaknessTag?.replace(/_/g,' ') : '2. Generate a training plan and complete drills daily'}

💬 Coach Says: ${xp?.currentStreak>=3 ? 'Great consistency! Keep this momentum going.' : 'Build your daily habit — train at the same time every day!'}`
  }
  
  if(type==='tips') {
    const sportTips = {
      CRICKET: `🏏 Top 3 Training Tips for ${user.role?.replace(/_/g,' ')||'Cricket'}:

1️⃣ Net Practice Daily: Spend 30 mins in nets focusing on your weakest delivery type. Quality over quantity.

2️⃣ Video Analysis: Record yourself batting/bowling once a week. Compare with professional players. You will spot flaws you cannot feel.

3️⃣ Fitness Base: Cricket is 70% skill 30% fitness. Run 2km daily and do agility ladder drills 3x per week.`,

      FOOTBALL: `⚽ Top 3 Training Tips for ${user.role?.replace(/_/g,' ')||'Football'}:

1️⃣ Wall Practice: Kick against a wall for 20 mins daily. First touch and passing accuracy improve dramatically within 2 weeks.

2️⃣ Weak Foot: Spend 50% of practice time on your weak foot. Elite players are comfortable with both feet.

3️⃣ Watch and Learn: Study 1 professional in your position for 15 mins daily. Copy their movement patterns.`,

      BADMINTON: `🏸 Top 3 Training Tips for ${user.role?.replace(/_/g,' ')||'Badminton'}:

1️⃣ Shadow Footwork: Practice court movement WITHOUT shuttle for 10 mins daily. Footwork is 50% of badminton.

2️⃣ Multi-Feed Drills: Have a partner feed shuttles rapidly to corners. Builds speed, accuracy and stamina together.

3️⃣ Serve Consistency: Practice low serve 100 times daily until it barely clears the net every single time.`,

      TENNIS: `🎾 Top 3 Training Tips for ${user.role?.replace(/_/g,' ')||'Tennis'}:

1️⃣ Ball Machine: 30 mins with ball machine daily for groundstroke consistency. Repetition builds muscle memory.

2️⃣ Serve Routine: Develop a consistent pre-serve routine. Toss practice alone for 10 mins daily improves serve dramatically.

3️⃣ Cross Court Rally: Rally cross court with partner until 50 consecutive shots. Builds consistency and court sense.`,

      BASKETBALL: `🏀 Top 3 Training Tips for ${user.role?.replace(/_/g,' ')||'Basketball'}:

1️⃣ Mikan Drill: Left and right hand layups alternating, 100 reps daily. Builds finishing around the basket.

2️⃣ Ball Handling: 10 mins dribbling with weak hand before every session. Becomes natural within 30 days.

3️⃣ Free Throws: End every session with 20 free throws. Track your percentage weekly to measure improvement.`
    }
    result = sportTips[user.sport] || sportTips.CRICKET
  }

  setAiResult(result)
  setAiLoading(false)
}

  const allDrills = plan?Object.values(plan.schedule).flat():[]
  const done = allDrills.filter(d=>d.completed).length
  const xpData = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map((d,i)=>({
    day:d, xp:i<=new Date().getDay()?Math.round((xp?.totalXp||0)*(i/(new Date().getDay()||1))):0
  }))
  const radarData = weak.map(w=>({subject:w.weaknessTag.replace(/_/g,' ').slice(0,10),value:w.severity==='HIGH'?90:w.severity==='MEDIUM'?60:30,fullMark:100}))
  const pieData=[{name:'Done',value:done||0},{name:'Left',value:allDrills.length-done||0}]
  const rival = lb.find(e=>e.playerName!==user.name)
  const myLbEntry = lb.find(e=>e.playerName===user.name)

  return (
    <div className="app-layout">
      <Particles/>
      {toast && <Toast msg={toast} onClose={()=>setToast('')}/>}
      {levelUp && <LevelUp level={levelUp.level} title={levelUp.title} onClose={()=>setLevelUp(null)}/>}

      {/* SIDEBAR */}
      <div className="sidebar">
        <div className="logo-area">
          <div className="logo-text">AthleteCoach</div>
          <div className="logo-sub">AI Training OS · v3</div>
        </div>
        <div className="player-zone">
  <div style={{
    width:58,height:58,borderRadius:'50%',
    background:`conic-gradient(${sd.color} 0% 35%,#00d4ff 35% 65%,#a855f7 65% 100%)`,
    padding:3,margin:'0 auto 10px',
    boxShadow:`0 0 20px ${sd.color}40`
  }}>
    <div style={{
      width:'100%',height:'100%',borderRadius:'50%',
      background:'var(--card)',
      display:'flex',alignItems:'center',justifyContent:'center',
      fontFamily:'Rajdhani,sans-serif',fontSize:18,fontWeight:700,
      color:sd.color
    }}>{initials(user.name)}</div>
  </div>
  <div className="player-name">{user.name}</div>
  <div className="player-sport-tag">{sd.icon} {user.sport} · {user.role?.replace(/_/g,' ')}</div>
  <div className="level-pill" style={{borderColor:`${sd.color}33`,color:sd.color,background:`${sd.color}0f`}}>
    <div className="level-dot" style={{background:sd.color}}/>
    LV {xp?.currentLevel||1} · {(xp?.levelTitle||'ROOKIE').toUpperCase()}
  </div>
</div>
        <div className="nav-section">
          {groups.map(group=>(
            <div key={group}>
              <div className="nav-group-label">{group}</div>
              {Nav.filter(n=>n.group===group).map(({id,icon,label})=>(
                <div key={id} className={`nav-item ${page===id?'active':''}`} onClick={()=>setPage(id)}>
                  <span className="nav-icon">{icon}</span>{label}
                </div>
              ))}
            </div>
          ))}
        </div>
        <div className="nav-bottom">
          <button className="logout-btn" onClick={onLogout}>⏻ &nbsp;Logout</button>
        </div>
      </div>

      {/* MAIN */}
      <div className="main-content">
        <div className="topbar">
          <div>
            <div className="topbar-title">{greeting()}, {user.name.split(' ')[0]}</div>
            <div className="topbar-sub">{new Date().toLocaleDateString('en-US',{weekday:'long',month:'long',day:'numeric'})}</div>
          </div>
          <div className="topbar-right">
            <div className="notif-btn">🔔<div className="notif-dot"/></div>
            <div className="xp-pill">⚡ {xp?.totalXp||0} XP</div>
          </div>
        </div>

        <div className="page-content">

          {/* ── DASHBOARD ── */}
          {page==='dashboard' && <>
            <div className="hero-banner">
              <div className="hero-text">
                <div className="challenge-badge">🔥 Daily Challenge</div>
                <div className="challenge-title">{today.title}</div>
                <div className="challenge-desc">{today.desc}</div>
                <div className="challenge-reward">🎁 {today.reward}</div>
              </div>
              <div className="hero-char-wrap">
                <span className="hero-char" style={{fontSize:64}}>{sd.icon}</span>
                <div style={{fontSize:9,color:'var(--muted2)',letterSpacing:2,textTransform:'uppercase',marginTop:4}}>{user.sport} MODE</div>
              </div>
            </div>
            <div className="stats-grid">
              <StatCard label="Total XP" value={xp?.totalXp||0} sub={`Lv ${xp?.currentLevel||1} · ${xp?.levelTitle||'Rookie'}`} icon="⚡" color="neon"/>
              <StatCard label="Training Streak" value={`🔥 ${xp?.currentStreak||0}`} sub="days in a row" icon="🔥" color="fire"/>
              <StatCard label="Plan Progress" value={`${done}/${allDrills.length}`} sub="drills done" icon="✅" color="blue"/>
              <StatCard label="Body Readiness" value="87%" sub="Ready to train" icon="💪" color="purple"/>
            </div>
            <div className="grid2">
              <div className="ac-card">
                <div className="panel-title"><div className="panel-accent" style={{background:'var(--neon)'}}/> Today's Drills</div>
                {plan ? Object.entries(plan.schedule).slice(0,2).map(([day,drills])=>(
                  <div key={day}>
                    <div className="day-badge">📅 {day}</div>
                    {drills.map((d,i)=><DrillCard key={i} drill={d} onComplete={doneDrill}/>)}
                  </div>
                )) : <Empty icon="📋" title="No Plan Yet" sub="Generate your personalized plan"
                  action={<button className="ac-gen-btn" onClick={genPlan} style={{marginTop:16}}>Generate Plan</button>}/>}

                {/* MOOD TRACKER */}
                <div style={{marginTop:16,paddingTop:14,borderTop:'1px solid rgba(255,255,255,0.05)'}}>
                  <div className="panel-title" style={{marginBottom:10}}><div className="panel-accent" style={{background:'var(--purple)'}}/> Pre-Training Mood</div>
                  <div className="mood-ring">
                    {[['😤','Pumped','pumped'],['😐','Okay','okay'],['😴','Tired','tired'],['🤕','Sore','sore']].map(([e,l,v])=>(
                      <div key={v} className={`mood-btn ${mood===v?'sel':''}`} onClick={()=>setMood(v)}>
                        <span className="mood-emoji">{e}</span>{l}
                      </div>
                    ))}
                  </div>
                  <div style={{fontSize:10,color:'var(--muted2)',marginTop:6}}>
                    {mood==='pumped'?'💪 Full intensity plan activated!'
                      :mood==='okay'?'📋 Standard plan — you got this!'
                      :mood==='tired'?'😴 Recovery mode — lighter drills today'
                      :'🤕 Rest recommended — AI will adjust your plan'}
                  </div>
                </div>
              </div>

              <div style={{display:'flex',flexDirection:'column',gap:14}}>
                <XpPanel xp={xp}/>
                <div className="ac-card">
                  <div className="panel-title"><div className="panel-accent" style={{background:'var(--fire)'}}/> Active Weaknesses</div>
                  {weak.slice(0,4).map((w,i)=>(
                    <div key={i} className="ac-weakness-item">
                      <span className="weakness-name">{w.weaknessTag.replace(/_/g,' ')}</span>
                      <span className={`ac-sev-badge ${w.severity}`}>{w.severity}</span>
                    </div>
                  ))}
                  {!weak.length && <p style={{color:'var(--muted2)',fontSize:13}}>No weaknesses added yet</p>}
                </div>
              </div>
            </div>

            {/* BOTTOM ROW */}
            <div className="grid3">
              <div className="ac-card">
                <div className="panel-title"><div className="panel-accent" style={{background:'var(--gold)'}}/> Leaderboard</div>
                {lb.slice(0,3).map((e,i)=>(
                  <div key={i} className="ac-lb-row slide-in" style={{animationDelay:`${i*0.08}s`}}>
                    <div className="lb-rank" style={{color:i===0?'#ffd700':i===1?'#c0c0c0':'#cd7f32'}}>
                      {i===0?'🥇':i===1?'🥈':'🥉'}
                    </div>
                    <div className="lb-avatar" style={{background:`linear-gradient(135deg,${LC[i]},${LC[i+2]})`}}>{initials(e.playerName)}</div>
                    <div className="lb-info">
                      <div className="lb-name">{e.playerName}{e.playerName===user.name&&<span className="you-tag">YOU</span>}</div>
                      <div className="lb-sport">{SPORT_DATA[e.sport]?.icon||'🏅'} {e.sport}</div>
                    </div>
                    <div className="lb-xp">{e.totalXp}</div>
                  </div>
                ))}
                {rival && (
                  <div style={{marginTop:12,paddingTop:10,borderTop:'1px solid rgba(255,255,255,0.04)'}}>
                    <div style={{fontSize:9,color:'var(--fire)',letterSpacing:2,marginBottom:6}}>🔥 YOUR RIVAL</div>
                    <div className="rival-card">
                      <div className="rival-av" style={{background:'rgba(255,69,0,0.15)',color:'var(--fire)'}}>{initials(rival.playerName)}</div>
                      <div><div style={{fontSize:12,fontWeight:600,color:'var(--text)'}}>{rival.playerName}</div><div style={{fontSize:10,color:'var(--muted2)'}}>{rival.sport}</div></div>
                      <div className="rival-gap">
                        {rival.totalXp > (myLbEntry?.totalXp||0) ? `+${rival.totalXp-(myLbEntry?.totalXp||0)} ahead` : `Beat by ${(myLbEntry?.totalXp||0)-rival.totalXp}`}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="ac-card">
                <div className="panel-title"><div className="panel-accent" style={{background:'var(--purple)'}}/> Body Readiness</div>
                <div className="readiness-score">
                  <div className="rs-num">87%</div>
                  <div className="rs-lbl">Ready to Train</div>
                </div>
                <div style={{fontSize:10,color:'var(--muted2)',marginBottom:6}}>Recovery Level</div>
                <div className="recovery-meter">
                  {Array.from({length:10},(_,i)=>(
                    <div key={i} className={`rm-seg ${i<4?'rm-green':i<6?'rm-yellow':''}`}/>
                  ))}
                </div>
                <div style={{marginTop:10,display:'flex',flexDirection:'column',gap:6}}>
                  {[['🦵','Legs','Slight fatigue','var(--gold)'],['💪','Core','Fully recovered','var(--neon)'],['🦶','Arms','Fully recovered','var(--neon)']].map(([i,n,s,c])=>(
                    <div key={n} style={{display:'flex',alignItems:'center',gap:8,padding:'6px 8px',background:'rgba(255,255,255,0.02)',borderRadius:8}}>
                      <span style={{fontSize:16}}>{i}</span>
                      <div style={{flex:1}}>
                        <div style={{fontSize:11,color:'var(--text)',fontWeight:500}}>{n}</div>
                        <div style={{fontSize:10,color:'var(--muted2)'}}>{s}</div>
                      </div>
                      <div style={{width:8,height:8,borderRadius:'50%',background:c}}/>
                    </div>
                  ))}
                </div>
              </div>

              <div className="ac-card">
                <div className="panel-title"><div className="panel-accent" style={{background:'var(--neon2)'}}/> Smart Gear</div>
                {[['👟','Football Boots','Nike Mercurial · 234km','76%','var(--neon)'],['⚽','Training Ball','Adidas · 89 sessions','45%','var(--gold)'],['🦺','Training Vest','Replace soon!','12%','var(--fire)']].map(([i,n,s,p,c])=>(
                  <div key={n} className="gear-item" style={{background:`${c}09`,borderColor:`${c}20`}}>
                    <div className="gear-icon-wrap">{i}</div>
                    <div><div className="gear-name">{n}</div><div className="gear-sub">{s}</div></div>
                    <div className="gear-pct" style={{color:c}}>{p}</div>
                  </div>
                ))}
              </div>
            </div>
          </>}

          {/* ── SKILL CARD ── */}
          {page==='skills' && <>
            <div className="section-title">Skill Rating Card</div>
            <div className="grid2">
              <SkillPanel sport={user.sport} weaknesses={weak} xp={xp}/>
              <div className="ac-card">
                <div className="panel-title"><div className="panel-accent" style={{background:'var(--neon2)'}}/> How Ratings Work</div>
                {[['⚡','XP Points','More XP = higher base rating'],['💪','Weaknesses','HIGH severity reduces ratings'],['🔥','Streak','Longer streak = bonus'],['📋','Drills','Complete more to improve']].map(([i,t,d])=>(
                  <div key={t} style={{display:'flex',gap:12,padding:'10px 12px',background:'var(--card2)',borderRadius:10,marginBottom:8,border:'1px solid var(--border)'}}>
                    <span style={{fontSize:18}}>{i}</span>
                    <div><div style={{fontSize:13,fontWeight:600,color:'var(--text)'}}>{t}</div><div style={{fontSize:11,color:'var(--muted2)'}}>{d}</div></div>
                  </div>
                ))}
                <button className="ac-gen-btn" onClick={()=>setPage('plan')}>📋 Go Train Now</button>
              </div>
            </div>
          </>}

          {/* ── MY PLAN ── */}
          {page==='plan' && <>
            <div className="plan-header">
              <div className="section-title" style={{margin:0}}>Training Plan</div>
              <div style={{display:'flex',alignItems:'center',gap:12}}>
                {plan && <div className="plan-stat"><div className="plan-stat-val">{done}/{allDrills.length}</div><div className="plan-stat-label">Done</div></div>}
                <button className="ac-gen-btn" style={{width:'auto',padding:'10px 20px',marginTop:0}} onClick={genPlan} disabled={loading}>
                  {loading?'⏳ Generating...':'🔄 New Plan'}
                </button>
              </div>
            </div>
            {plan ? Object.entries(plan.schedule).map(([day,drills])=>(
              <div key={day} className="ac-card" style={{marginBottom:12}}>
                <div className="panel-title">
                  <div className="day-badge" style={{margin:0}}>📅 {day}</div>
                  <span style={{fontSize:11,color:'var(--muted2)',marginLeft:'auto'}}>{drills.filter(d=>d.completed).length}/{drills.length} done</span>
                </div>
                {drills.map((d,i)=><DrillCard key={i} drill={d} onComplete={doneDrill}/>)}
              </div>
            )) : <div className="ac-card"><Empty icon="📋" title="No Active Plan" sub="Add weaknesses then generate your plan"
              action={<button className="ac-gen-btn" style={{marginTop:16,width:'auto',display:'inline-block',padding:'12px 32px'}} onClick={genPlan}>Generate Plan</button>}/></div>}
          </>}

          {/* ── WEAKNESSES ── */}
          {page==='weaknesses' && <>
            <div className="section-title">My Weaknesses</div>
            <div className="ac-card" style={{marginBottom:16}}>
              <div className="panel-title"><div className="panel-accent" style={{background:'var(--fire)'}}/> Add New Weakness</div>
              <div className="add-weakness-grid">
                <div><label className="form-label">Weakness Tag</label>
                  <select value={nw.weaknessTag} onChange={e=>setNw({...nw,weaknessTag:e.target.value})} style={{marginBottom:0}}>
                    {tags.map(t=><option key={t} value={t}>{t.replace(/_/g,' ')}</option>)}
                  </select></div>
                <div><label className="form-label">Severity</label>
                  <select value={nw.severity} onChange={e=>setNw({...nw,severity:e.target.value})} style={{marginBottom:0}}>
                    <option value="HIGH">🔴 High</option><option value="MEDIUM">🟡 Medium</option><option value="LOW">🟢 Low</option>
                  </select></div>
                <button className="add-btn" onClick={addWeak}>+ Add</button>
              </div>
            </div>
            <div className="ac-card">
              <div className="panel-title"><div className="panel-accent" style={{background:'var(--fire)'}}/> Current ({weak.length})</div>
              {weak.length>0 ? weak.map((w,i)=>(
                <div key={i} className="ac-weakness-item">
                  <div><div className="weakness-name">{w.weaknessTag.replace(/_/g,' ')}</div>
                    <div style={{fontSize:10,color:'var(--muted)',marginTop:2}}>Added {new Date(w.notedAt).toLocaleDateString()}</div></div>
                  <span className={`ac-sev-badge ${w.severity}`}>{w.severity}</span>
                </div>
              )) : <Empty icon="💪" title="No Weaknesses Yet" sub="Add weaknesses to get a personalized training plan"/>}
            </div>
          </>}

          {/* ── BODY READINESS ── */}
          {page==='body' && <>
            <div className="section-title">🧠 Body Readiness</div>
            <div className="grid2">
              <div className="ac-card">
                <div className="panel-title"><div className="panel-accent" style={{background:'var(--purple)'}}/> Today's Readiness Score</div>
                <div className="readiness-score" style={{padding:24,marginBottom:16}}>
                  <div className="rs-num" style={{fontSize:64}}>87%</div>
                  <div className="rs-lbl">Ready to Train Hard</div>
                  <div style={{marginTop:10,fontSize:12,color:'var(--muted2)'}}>AI recommends: Full intensity training</div>
                </div>
                <div style={{marginBottom:12}}>
                  <div style={{fontSize:10,color:'var(--muted2)',marginBottom:6}}>Overall Recovery</div>
                  <div className="recovery-meter">
                    {Array.from({length:10},(_,i)=><div key={i} className={`rm-seg ${i<4?'rm-green':i<6?'rm-yellow':''}`}/>)}
                  </div>
                </div>
                {[['🦵','Legs','Slight fatigue from yesterday','62%','var(--gold)'],['💪','Core','Fully recovered','95%','var(--neon)'],['🦶','Arms & Shoulders','Fully recovered','90%','var(--neon)'],['❤️','Cardiovascular','Good condition','80%','var(--blue)']].map(([i,n,s,p,c])=>(
                  <div key={n} style={{display:'flex',alignItems:'center',gap:10,padding:'10px 12px',background:'var(--card2)',borderRadius:10,marginBottom:8,border:'1px solid var(--border)'}}>
                    <span style={{fontSize:22}}>{i}</span>
                    <div style={{flex:1}}>
                      <div style={{fontSize:13,fontWeight:600,color:'var(--text)'}}>{n}</div>
                      <div style={{fontSize:11,color:'var(--muted2)'}}>{s}</div>
                    </div>
                    <div style={{fontSize:14,fontWeight:700,color:c,fontFamily:'Rajdhani,sans-serif'}}>{p}</div>
                  </div>
                ))}
              </div>
              <div style={{display:'flex',flexDirection:'column',gap:14}}>
                <div className="ac-card">
                  <div className="panel-title"><div className="panel-accent" style={{background:'var(--purple)'}}/> Pre-Training Mood</div>
                  <div className="mood-ring" style={{flexDirection:'column',gap:8}}>
                    {[['😤','Pumped — Ready to go hard!','pumped'],['😐','Okay — Normal session','okay'],['😴','Tired — Need lighter drills','tired'],['🤕','Sore — Rest recommended','sore']].map(([e,l,v])=>(
                      <div key={v} className={`mood-btn ${mood===v?'sel':''}`} style={{padding:'10px 12px',display:'flex',alignItems:'center',gap:10,textAlign:'left'}} onClick={()=>setMood(v)}>
                        <span style={{fontSize:22}}>{e}</span><span>{l}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="ac-card">
                  <div className="panel-title"><div className="panel-accent" style={{background:'var(--neon)'}}/> AI Recommendation</div>
                  <div style={{padding:14,background:'rgba(0,255,136,0.06)',borderRadius:10,border:'1px solid rgba(0,255,136,0.15)',fontSize:13,lineHeight:1.7,color:'var(--text)'}}>
                    🤖 Based on your 87% readiness score and <strong style={{color:'var(--neon)'}}>pumped</strong> mood, I recommend going full intensity today. Your core and arms are fully recovered. Just warm up your legs well before the session!
                  </div>
                  <div style={{marginTop:10,padding:10,background:'rgba(168,85,247,0.06)',borderRadius:10,border:'1px solid rgba(168,85,247,0.15)',fontSize:12,color:'var(--purple)'}}>
                    💤 Sleep Quality: 7.5/10 · Hydration: Good · Last rest day: 2 days ago
                  </div>
                </div>
              </div>
            </div>
          </>}

          {/* ── RIVALRY MODE ── */}
          {page==='rivalry' && <>
            <div className="section-title">🔥 Rivalry Mode</div>
            {rival ? (
              <div className="grid2">
                <div className="ac-card">
                  <div className="panel-title"><div className="panel-accent" style={{background:'var(--fire)'}}/> Your Current Rival</div>
                  <div style={{textAlign:'center',padding:'20px 0',borderBottom:'1px solid var(--border)',marginBottom:16}}>
                    <div style={{width:64,height:64,borderRadius:'50%',background:'linear-gradient(135deg,#ff4500,#ff6600)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:24,fontWeight:700,color:'#000',margin:'0 auto 10px',fontFamily:'Rajdhani,sans-serif'}}>
                      {initials(rival.playerName)}
                    </div>
                    <div style={{fontFamily:'Rajdhani,sans-serif',fontSize:20,fontWeight:700,color:'var(--text)'}}>{rival.playerName}</div>
                    <div style={{fontSize:12,color:'var(--muted2)',marginTop:3}}>{SPORT_DATA[rival.sport]?.icon} {rival.sport} · {rival.levelTitle}</div>
                    <div style={{marginTop:12,fontFamily:'Rajdhani,sans-serif',fontSize:32,fontWeight:700,color:'var(--fire)'}}>{rival.totalXp} XP</div>
                  </div>
                  <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'12px 0'}}>
                    <div style={{textAlign:'center'}}>
                      <div style={{fontFamily:'Rajdhani,sans-serif',fontSize:24,fontWeight:700,color:'var(--neon)'}}>{myLbEntry?.totalXp||xp?.totalXp||0}</div>
                      <div style={{fontSize:10,color:'var(--muted2)'}}>Your XP</div>
                    </div>
                    <div style={{fontSize:24}}>⚔️</div>
                    <div style={{textAlign:'center'}}>
                      <div style={{fontFamily:'Rajdhani,sans-serif',fontSize:24,fontWeight:700,color:'var(--fire)'}}>{rival.totalXp}</div>
                      <div style={{fontSize:10,color:'var(--muted2)'}}>{rival.playerName}</div>
                    </div>
                  </div>
                  <div style={{padding:12,background:'rgba(255,69,0,0.08)',borderRadius:10,border:'1px solid rgba(255,69,0,0.2)',marginTop:10,fontSize:12,color:'var(--fire)',textAlign:'center'}}>
                    {rival.totalXp > (myLbEntry?.totalXp||0)
                      ? `💪 ${rival.playerName} is ${rival.totalXp-(myLbEntry?.totalXp||0)} XP ahead! Complete ${Math.ceil((rival.totalXp-(myLbEntry?.totalXp||0))/10)} drills to overtake!`
                      : `🏆 You're ahead by ${(myLbEntry?.totalXp||0)-rival.totalXp} XP! Keep training to stay on top!`}
                  </div>
                </div>
                <div className="ac-card">
                  <div className="panel-title"><div className="panel-accent" style={{background:'var(--fire)'}}/> All Rivals</div>
                  {lb.filter(e=>e.playerName!==user.name).map((e,i)=>(
                    <div key={i} className="rival-card">
                      <div className="rival-av" style={{background:'rgba(255,69,0,0.15)',color:'var(--fire)'}}>{initials(e.playerName)}</div>
                      <div><div style={{fontSize:12,fontWeight:600,color:'var(--text)'}}>{e.playerName}</div><div style={{fontSize:10,color:'var(--muted2)'}}>{e.sport} · {e.levelTitle}</div></div>
                      <div className="rival-gap">{e.totalXp} XP</div>
                    </div>
                  ))}
                  {lb.length<=1 && <Empty icon="⚔️" title="No Rivals Yet" sub="More players need to join to enable rivalry mode"/>}
                </div>
              </div>
            ) : <div className="ac-card"><Empty icon="⚔️" title="No Rivals Yet" sub="Complete drills and climb the leaderboard to find rivals!"/></div>}
          </>}

          {/* ── GEAR TRACKER ── */}
          {page==='gear' && <>
            <div className="section-title">⚙️ Smart Gear Tracker</div>
            <div className="grid2">
              <div className="ac-card">
                <div className="panel-title"><div className="panel-accent" style={{background:'var(--neon2)'}}/> Your Equipment</div>
                {[
                  {i:'👟',n:'Football Boots',b:'Nike Mercurial Vapor',s:'234 km used · 6 months old',p:76,c:'var(--neon)',warn:false},
                  {i:'⚽',n:'Training Ball',b:'Adidas UCL',s:'89 sessions · 4 months old',p:45,c:'var(--gold)',warn:false},
                  {i:'🦺',n:'Training Vest',b:'Generic Brand',s:'Replace soon · 6 months old',p:12,c:'var(--fire)',warn:true},
                  {i:'🧤',n:'Goalkeeper Gloves',b:'Nike GK Vapor Grip',s:'45 sessions · 3 months old',p:68,c:'var(--neon)',warn:false},
                ].map((g)=>(
                  <div key={g.n} className="gear-item" style={{borderColor:g.warn?'rgba(255,69,0,0.3)':'rgba(0,212,255,0.15)',background:g.warn?'rgba(255,69,0,0.06)':'rgba(0,212,255,0.04)'}}>
                    <div className="gear-icon-wrap">{g.i}</div>
                    <div style={{flex:1}}>
                      <div className="gear-name">{g.n}</div>
                      <div className="gear-sub">{g.b} · {g.s}</div>
                      <div style={{marginTop:6,height:4,background:'rgba(255,255,255,0.06)',borderRadius:99,overflow:'hidden'}}>
                        <div style={{height:'100%',background:g.c,width:g.p+'%',borderRadius:99}}/>
                      </div>
                    </div>
                    <div className="gear-pct" style={{color:g.c}}>{g.p}%</div>
                  </div>
                ))}
              </div>
              <div style={{display:'flex',flexDirection:'column',gap:14}}>
                <div className="ac-card">
                  <div className="panel-title"><div className="panel-accent" style={{background:'var(--fire)'}}/> Replace Soon</div>
                  <div style={{padding:14,background:'rgba(255,69,0,0.08)',borderRadius:10,border:'1px solid rgba(255,69,0,0.2)',marginBottom:10}}>
                    <div style={{fontSize:22,marginBottom:6}}>🦺</div>
                    <div style={{fontSize:14,fontWeight:600,color:'var(--text)'}}>Training Vest</div>
                    <div style={{fontSize:12,color:'var(--muted2)',marginTop:2}}>Only 12% life remaining. Replace within 2 weeks for optimal performance.</div>
                  </div>
                  <button className="ac-gen-btn" style={{marginTop:0}}>🛒 Find Replacement</button>
                </div>
                <div className="ac-card">
                  <div className="panel-title"><div className="panel-accent" style={{background:'var(--neon2)'}}/> Add New Gear</div>
                  <label className="form-label">Equipment Name</label>
                  <input placeholder="e.g. Nike Football Boots"/>
                  <label className="form-label">Purchase Date</label>
                  <input type="date"/>
                  <button className="ac-gen-btn" style={{marginTop:0}}>+ Add Equipment</button>
                </div>
              </div>
            </div>
          </>}

          {/* ── ANALYTICS ── */}
          {page==='analytics' && <>
            <div className="section-title">Performance Analytics</div>
            <div className="stats-grid" style={{gridTemplateColumns:'repeat(3,1fr)',marginBottom:20}}>
              <StatCard label="Total XP" value={xp?.totalXp||0} sub="All time" icon="⚡" color="neon"/>
              <StatCard label="Best Streak" value={xp?.longestStreak||0} sub="days" icon="🔥" color="fire"/>
              <StatCard label="Weaknesses" value={weak.length} sub="tracked" icon="💪" color="blue"/>
            </div>
            <div className="grid2" style={{marginBottom:16}}>
              <div className="ac-card">
                <div className="panel-title"><div className="panel-accent" style={{background:'var(--neon)'}}/> XP Growth This Week</div>
                <ResponsiveContainer width="100%" height={200}>
                  <AreaChart data={xpData}>
                    <defs><linearGradient id="xg" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#00ff88" stopOpacity={0.3}/><stop offset="95%" stopColor="#00ff88" stopOpacity={0}/></linearGradient></defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)"/>
                    <XAxis dataKey="day" stroke="#3a3a5a" tick={{fill:'#7a85aa',fontSize:11}}/>
                    <YAxis stroke="#3a3a5a" tick={{fill:'#7a85aa',fontSize:11}}/>
                    <Tooltip contentStyle={ttStyle}/>
                    <Area type="monotone" dataKey="xp" stroke="#00ff88" fill="url(#xg)" strokeWidth={2}/>
                  </AreaChart>
                </ResponsiveContainer>
              </div>
              <div className="ac-card">
                <div className="panel-title"><div className="panel-accent" style={{background:'var(--neon2)'}}/> Plan Completion</div>
                {allDrills.length>0 ? <>
                  <ResponsiveContainer width="100%" height={160}>
                    <PieChart><Pie data={pieData} cx="50%" cy="50%" innerRadius={45} outerRadius={70} dataKey="value">
                      {pieData.map((_,i)=><Cell key={i} fill={i===0?'#00ff88':'#1a2540'}/>)}
                    </Pie><Tooltip contentStyle={ttStyle}/></PieChart>
                  </ResponsiveContainer>
                  <div style={{display:'flex',justifyContent:'center',gap:20,marginTop:8}}>
                    {[['#00ff88',`Done (${done})`],['#1a2540',`Left (${allDrills.length-done})`]].map(([c,l])=>(
                      <div key={l} style={{display:'flex',alignItems:'center',gap:6,fontSize:12}}>
                        <div style={{width:10,height:10,borderRadius:'50%',background:c,border:'1px solid rgba(255,255,255,0.1)'}}/>
                        <span style={{color:'var(--muted2)'}}>{l}</span>
                      </div>
                    ))}
                  </div>
                </> : <Empty icon="📊" title="No Plan Data" sub="Generate a plan first"/>}
              </div>
            </div>
            {radarData.length>0 && (
              <div className="ac-card">
                <div className="panel-title"><div className="panel-accent" style={{background:'var(--fire)'}}/> Weakness Radar</div>
                <ResponsiveContainer width="100%" height={280}>
                  <RadarChart data={radarData}>
                    <PolarGrid stroke="rgba(255,255,255,0.06)"/>
                    <PolarAngleAxis dataKey="subject" tick={{fill:'#7a85aa',fontSize:11}}/>
                    <PolarRadiusAxis angle={30} domain={[0,100]} tick={{fill:'#4a5580',fontSize:10}}/>
                    <Radar name="Weakness" dataKey="value" stroke="#ff4500" fill="#ff4500" fillOpacity={0.15} strokeWidth={2}/>
                    <Tooltip contentStyle={ttStyle}/>
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            )}
          </>}

          {/* ── BADGES ── */}
          {page==='achievements' && <>
            <div style={{textAlign:'center',marginBottom:24}}>
              <div className="trophy-big" style={{fontSize:56}}>🏆</div>
              <div className="section-title" style={{margin:'8px 0 4px'}}>My Badges</div>
            </div>
            <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:16}}>
              {ach.map((a,i)=>(
                <div key={i} className="ac-badge-card earned scale-in" style={{animationDelay:`${i*0.1}s`}}>
                  <span className="spin-badge ac-badge-icon">{a.iconCode}</span>
                  <div className="ac-badge-name">{a.name}</div>
                  <div className="ac-badge-desc">{a.description}</div>
                  <div style={{fontSize:10,color:'var(--muted)',marginTop:6}}>{new Date(a.earnedAt).toLocaleDateString()}</div>
                </div>
              ))}
              {Locked.filter(b=>!ach.find(a=>a.name===b.n)).map((b,i)=>(
                <div key={i} className="ac-badge-card locked">
                  <span className="ac-badge-icon">{b.i}</span>
                  <div className="ac-badge-name">{b.n}</div>
                  <div className="ac-badge-desc">{b.d}</div>
                  <div style={{fontSize:10,color:'var(--muted)',marginTop:6}}>🔒 Locked</div>
                </div>
              ))}
              {!ach.length && <div className="ac-card" style={{gridColumn:'1/-1'}}><Empty icon="🏅" title="No Badges Yet" sub="Complete drills to earn your first badge"/></div>}
            </div>
          </>}

          {/* ── LEADERBOARD ── */}
          {page==='leaderboard' && <>
            <div style={{textAlign:'center',marginBottom:24}}>
              <div className="trophy-big" style={{fontSize:64}}>🏆</div>
              <div className="section-title" style={{margin:'8px 0 4px'}}>Global Leaderboard</div>
              <div style={{fontSize:12,color:'var(--muted2)'}}>Top athletes ranked by XP</div>
            </div>
            <div className="ac-card">
              {lb.map((e,i)=>(
                <div key={i} className="ac-lb-row slide-in" style={{animationDelay:`${i*0.07}s`}}>
                  <div className="lb-rank" style={{color:i===0?'#ffd700':i===1?'#c0c0c0':i===2?'#cd7f32':'var(--muted2)'}}>
                    {i===0?'🥇':i===1?'🥈':i===2?'🥉':`#${e.rank}`}
                  </div>
                  <div className="lb-avatar" style={{background:`linear-gradient(135deg,${LC[i%LC.length]},${LC[(i+2)%LC.length]})`}}>{initials(e.playerName)}</div>
                  <div className="lb-info">
                    <div className="lb-name">{e.playerName}{e.playerName===user.name&&<span className="you-tag">YOU</span>}</div>
                    <div className="lb-sport">{SPORT_DATA[e.sport]?.icon||'🏅'} {e.sport} · {e.levelTitle}</div>
                  </div>
                  <div style={{textAlign:'right'}}>
                    <div className="lb-xp">{e.totalXp} XP</div>
                    {e.currentStreak>0&&<div style={{fontSize:10,color:'var(--fire)'}}>🔥 {e.currentStreak}</div>}
                  </div>
                </div>
              ))}
              {!lb.length && <Empty icon="🏆" title="No Players Yet" sub="Complete drills to appear here"/>}
            </div>
          </>}

          {/* ── FIXTURES ── */}
          {page==='fixtures' && <>
            <div className="section-title">Match Fixtures</div>
            <div className="ac-card" style={{marginBottom:16}}>
              <div className="panel-title"><div className="panel-accent" style={{background:'var(--neon2)'}}/> Add Fixture</div>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr auto',gap:10,alignItems:'end'}}>
                <div><label className="form-label">Date</label><input type="date" value={fx.matchDate} onChange={e=>setFx({...fx,matchDate:e.target.value})} style={{marginBottom:0}}/></div>
                <div><label className="form-label">Opponent</label><input placeholder="e.g. Punjab XI" value={fx.opponent} onChange={e=>setFx({...fx,opponent:e.target.value})} style={{marginBottom:0}}/></div>
                <div><label className="form-label">Venue</label><input placeholder="e.g. Wankhede" value={fx.venue} onChange={e=>setFx({...fx,venue:e.target.value})} style={{marginBottom:0}}/></div>
                <button className="add-btn" onClick={addFix}>+ Add</button>
              </div>
            </div>
            <div className="ac-card">
              <div className="panel-title"><div className="panel-accent" style={{background:'var(--neon2)'}}/> Upcoming ({fix.length})</div>
              {fix.length>0 ? fix.map((f,i)=>(
                <div key={i} style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'12px 0',borderBottom:'1px solid rgba(255,255,255,0.04)'}}>
                  <div style={{display:'flex',alignItems:'center',gap:14}}>
                    <div className="fixture-date-box">
                      <div className="fixture-day">{new Date(f.matchDate).getDate()}</div>
                      <div className="fixture-month">{new Date(f.matchDate).toLocaleString('default',{month:'short'})}</div>
                    </div>
                    <div>
                      <div style={{fontSize:14,fontWeight:600,color:'var(--text)'}}>vs {f.opponent||'TBD'}</div>
                      <div style={{fontSize:11,color:'var(--muted2)',marginTop:2}}>📍 {f.venue||'Venue TBD'}</div>
                    </div>
                  </div>
                  <button className="remove-btn" onClick={()=>delFix(f.id)}>Remove</button>
                </div>
              )) : <Empty icon="📅" title="No Fixtures Yet" sub="Add match dates so training plan avoids them automatically"/>}
            </div>
          </>}

          {/* ── AI COACH ── */}
          {page==='ai' && <>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:20}}>
              <div className="section-title" style={{margin:0}}>AI Coach</div>
              <div className="ai-online"><div className="level-dot"/>AI ONLINE</div>
            </div>
            <div style={{display:'flex',gap:8,marginBottom:20,flexWrap:'wrap'}}>
              {[['chat','💬','AI Chat'],['weakness','🎯','Detect Weakness'],['match','⚽','Match Analysis'],['predict','🔮','Predictions'],['tips','💡','Training Tips']].map(([id,icon,label])=>(
                <button key={id} className={`ai-tab ${aiTab===id?'active':''}`} onClick={()=>{setAiTab(id);setAiResult('');setAiInput('')}}>
                  {icon} {label}
                </button>
              ))}
            </div>
            {aiTab==='chat' && (
              <div className="ac-card">
                <div className="panel-title"><div className="panel-accent" style={{background:'var(--purple)'}}/> Chat With Your AI Coach</div>
                <div style={{height:320,overflowY:'auto',display:'flex',flexDirection:'column',gap:8,marginBottom:12,paddingRight:4}}>
                  {chatHistory.map((m,i)=>(
                    <div key={i} style={{display:'flex',justifyContent:m.role==='user'?'flex-end':'flex-start'}}>
                      <div className={`ai-msg ${m.role}`} style={{maxWidth:'78%',borderBottomRightRadius:m.role==='user'?0:12,borderBottomLeftRadius:m.role==='ai'?0:12}}>
                        {m.role==='ai'&&<span style={{marginRight:6}}>🤖</span>}{m.text}
                      </div>
                    </div>
                  ))}
                  {aiLoading&&<div style={{display:'flex',justifyContent:'flex-start'}}><div className="ai-msg bot">🤖 Thinking...</div></div>}
                  <div ref={chatEndRef}/>
                </div>
                <div className="ai-input-row">
                  <input value={aiInput} onChange={e=>setAiInput(e.target.value)} onKeyPress={e=>e.key==='Enter'&&handleChat()} placeholder="Ask your AI coach anything..." style={{marginBottom:0}}/>
                  <button className="ai-send-btn" onClick={handleChat} disabled={aiLoading}>Send ⚡</button>
                </div>
              </div>
            )}
            {aiTab!=='chat' && (
              <div className="ac-card">
                <div className="panel-title"><div className="panel-accent" style={{background:'var(--purple)'}}/>
                  {aiTab==='weakness'&&'AI Weakness Detection'}
                  {aiTab==='match'&&'Match Performance Analysis'}
                  {aiTab==='predict'&&'AI Performance Prediction'}
                  {aiTab==='tips'&&'AI Training Tips'}
                </div>
                {(aiTab==='weakness'||aiTab==='match')&&<textarea value={aiInput} onChange={e=>setAiInput(e.target.value)} placeholder={aiTab==='weakness'?'Describe your problem e.g. "I struggle against left arm spinners"':'Describe your match performance...'} style={{marginBottom:12}}/>}
                {(aiTab==='predict'||aiTab==='tips')&&(
                  <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:10,marginBottom:16}}>
                    {[['⚡',xp?.totalXp||0,'Total XP'],['🔥',xp?.currentStreak||0,'Streak'],['💪',weak.length,'Weaknesses']].map(([i,v,l])=>(
                      <div key={l} style={{background:'var(--card2)',borderRadius:10,padding:'12px',textAlign:'center',border:'1px solid var(--border)'}}>
                        <div style={{fontSize:18}}>{i}</div>
                        <div style={{fontFamily:'Rajdhani,sans-serif',fontSize:20,fontWeight:700,color:'var(--neon)',marginTop:4}}>{v}</div>
                        <div style={{fontSize:10,color:'var(--muted2)',marginTop:2}}>{l}</div>
                      </div>
                    ))}
                  </div>
                )}
                <button onClick={()=>handleAIAction(aiTab)} disabled={aiLoading} className="ac-gen-btn">
                  {aiLoading?'🤖 Processing...':`${aiTab==='weakness'?'🎯 Detect Weakness':aiTab==='match'?'⚽ Analyze Match':aiTab==='predict'?'🔮 Predict Performance':'💡 Get Training Tips'}`}
                </button>
                {aiResult&&(
                  <div style={{marginTop:16,padding:16,background:'rgba(168,85,247,0.06)',borderRadius:12,border:'1px solid rgba(168,85,247,0.2)',fontSize:13,lineHeight:1.8,color:'var(--text)',whiteSpace:'pre-wrap'}}>
                    <div style={{fontSize:9,color:'var(--purple)',marginBottom:8,letterSpacing:2,textTransform:'uppercase'}}>🤖 AI Response</div>
                    {aiResult}
                  </div>
                )}
              </div>
            )}
          </>}

          {/* ── PROFILE ── */}
          {page==='profile' && <>
            <div className="section-title">My Profile</div>
            <div className="grid2">
              <div>
                <div className="fifa-card-wrap" style={{marginBottom:16}}>
                  <FifaCard user={user} xp={xp} achievements={ach} sport={user.sport}/>
                </div>
              </div>
              <div style={{display:'flex',flexDirection:'column',gap:14}}>
                <div className="ac-card">
                  <div className="panel-title"><div className="panel-accent" style={{background:'var(--neon)'}}/> Player Info</div>
                  {[['📧','Email',user.email],['🎮','Sport',user.sport],['👤','Role',user.role?.replace(/_/g,' ')],['⚡','Total XP',xp?.totalXp||0],['🔥','Best Streak',`${xp?.longestStreak||0} days`],['🏆','Badges',ach.length],['💪','Weaknesses',weak.length]].map(([icon,label,val])=>(
                    <div key={label} style={{display:'flex',justifyContent:'space-between',padding:'9px 0',borderBottom:'1px solid rgba(255,255,255,0.04)',fontSize:13}}>
                      <span style={{color:'var(--muted2)'}}>{icon} {label}</span>
                      <span style={{color:'var(--text)',fontWeight:600}}>{val}</span>
                    </div>
                  ))}
                </div>
                <div className="ac-card">
                  <div className="panel-title"><div className="panel-accent" style={{background:'var(--gold)'}}/> Recent Badges</div>
                  {ach.length>0 ? ach.slice(0,4).map((a,i)=>(
                    <div key={i} style={{display:'flex',alignItems:'center',gap:12,padding:'8px 0',borderBottom:'1px solid rgba(255,255,255,0.04)'}}>
                      <span style={{fontSize:22}} className="bounce-char">{a.iconCode}</span>
                      <div><div style={{fontSize:13,fontWeight:600}}>{a.name}</div><div style={{fontSize:11,color:'var(--muted2)'}}>{a.description}</div></div>
                    </div>
                  )) : <p style={{color:'var(--muted2)',fontSize:13}}>No badges yet — complete drills!</p>}
                </div>
                <div className="ac-card">
                  <div className="panel-title"><div className="panel-accent" style={{background:'var(--purple)'}}/> Quick Stats</div>
                  <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}}>
                    {[['Current Streak',`🔥 ${xp?.currentStreak||0}`,'var(--fire)'],['Best Streak',`⚡ ${xp?.longestStreak||0}`,'var(--neon)'],['XP to Next',`${xp?.xpToNextLevel||200}`,'var(--neon2)'],['Weaknesses',`💪 ${weak.length}`,'var(--purple)']].map(([l,v,c])=>(
                      <div key={l} style={{background:'var(--card2)',borderRadius:10,padding:'12px',textAlign:'center',border:'1px solid var(--border)'}}>
                        <div style={{fontFamily:'Rajdhani,sans-serif',fontSize:22,fontWeight:700,color:c}}>{v}</div>
                        <div style={{fontSize:10,color:'var(--muted2)',marginTop:4}}>{l}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </>}

        </div>
      </div>
    </div>
  )
}