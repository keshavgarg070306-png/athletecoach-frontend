import { useState } from 'react'
import { login, register } from '../services/api'

const SPORT_DATA = {
  CRICKET:    { icon:'🏏', color:'#00ff88', roles:['BATSMAN','BOWLER','ALL_ROUNDER','WICKET_KEEPER'] },
  FOOTBALL:   { icon:'⚽', color:'#ff4500', roles:['GOALKEEPER','STRIKER','DEFENDER','MIDFIELDER'] },
  BADMINTON:  { icon:'🏸', color:'#00d4ff', roles:['SINGLES_PLAYER','DOUBLES_PLAYER'] },
  TENNIS:     { icon:'🎾', color:'#ffcc00', roles:['SINGLES_PLAYER','DOUBLES_PLAYER'] },
  BASKETBALL: { icon:'🏀', color:'#a855f7', roles:['POINT_GUARD','CENTER','FORWARD','GUARD'] },
}

export default function Login({ onLogin }) {
  const [isLogin, setIsLogin] = useState(true)
  const [form, setForm] = useState({ name:'', email:'', password:'', sport:'CRICKET', role:'BATSMAN' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const selectedSport = SPORT_DATA[form.sport]

  const handleSubmit = async () => {
    if(!form.email || !form.password) { setError('Please fill all fields!'); return }
    setLoading(true); setError('')
    try {
      const res = isLogin
        ? await login({ email: form.email.trim(), password: form.password })
        : await register({ ...form, email: form.email.trim() })
      onLogin(res.data)
    } catch (e) {
      setError(e.response?.data?.message || e.response?.data || 'Something went wrong. Check your credentials!')
    }
    setLoading(false)
  }

  const handleKey = (e) => { if(e.key === 'Enter') handleSubmit() }

  const inp = {
    width:'100%', padding:'11px 14px 11px 38px',
    background:'rgba(255,255,255,0.04)',
    border:'1px solid rgba(255,255,255,0.07)',
    borderRadius:11, color:'#fff', fontSize:13,
    outline:'none', fontFamily:'Inter,sans-serif',
    marginBottom:14, transition:'all 0.2s'
  }

  const Particle = ({color,left,dur,delay,size}) => (
    <div style={{
      position:'fixed', borderRadius:'50%',
      background:color, left, width:size, height:size,
      animationName:'pfloat', animationDuration:dur,
      animationDelay:delay, animationTimingFunction:'linear',
      animationIterationCount:'infinite',
      boxShadow:`0 0 ${size*3}px ${color}`, zIndex:0,
      pointerEvents:'none'
    }}/>
  )

  return (
    <div style={{minHeight:'100vh',background:'#030608',display:'flex',alignItems:'center',justifyContent:'center',padding:20,position:'relative',overflow:'hidden'}}>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Rajdhani:wght@600;700&family=Inter:wght@400;500;600&display=swap');
        @keyframes pfloat{0%{transform:translateY(100vh) rotate(0deg);opacity:0}10%{opacity:1}90%{opacity:1}100%{transform:translateY(-100px) rotate(720deg);opacity:0}}
        @keyframes grid-pulse{0%,100%{opacity:0.3}50%{opacity:0.7}}
        @keyframes orb{0%,100%{transform:scale(1) translate(0,0)}50%{transform:scale(1.1) translate(20px,-20px)}}
        @keyframes sf-float{0%{transform:translateY(0) rotate(0deg);opacity:0}10%{opacity:0.12}90%{opacity:0.12}100%{transform:translateY(-100vh) rotate(360deg);opacity:0}}
        @keyframes ring-glow{0%,100%{box-shadow:0 0 20px rgba(0,255,136,0.3)}50%{box-shadow:0 0 40px rgba(0,255,136,0.6),0 0 80px rgba(0,255,136,0.2)}}
        @keyframes blink{0%,100%{opacity:1}50%{opacity:0.2}}
        @keyframes bounce-sport{0%,100%{transform:translateY(0)}50%{transform:translateY(-6px)}}
        @keyframes slide-up{from{transform:translateY(30px);opacity:0}to{transform:translateY(0);opacity:1}}
        .inp-style:focus{border-color:#00ff88 !important;background:rgba(0,255,136,0.05) !important;box-shadow:0 0 0 3px rgba(0,255,136,0.08) !important}
        .inp-style::placeholder{color:#2a3550}
        .sport-btn:hover{transform:translateY(-3px) !important}
        .submit-btn:hover{transform:translateY(-2px);box-shadow:0 8px 28px rgba(0,255,136,0.45) !important}
        .tab-btn:hover{color:#fff !important}
      `}</style>

      {/* BG GRID */}
      <div style={{position:'fixed',inset:0,backgroundImage:'radial-gradient(circle,rgba(0,255,136,0.1) 1px,transparent 1px)',backgroundSize:'28px 28px',animation:'grid-pulse 4s ease-in-out infinite',zIndex:0,pointerEvents:'none'}}/>

      {/* BG ORBS */}
      <div style={{position:'fixed',width:600,height:600,borderRadius:'50%',background:'radial-gradient(circle,rgba(0,255,136,0.07),transparent 70%)',top:-200,left:-200,animation:'orb 8s ease-in-out infinite',zIndex:0,pointerEvents:'none'}}/>
      <div style={{position:'fixed',width:500,height:500,borderRadius:'50%',background:'radial-gradient(circle,rgba(168,85,247,0.07),transparent 70%)',bottom:-150,right:-150,animation:'orb 8s ease-in-out infinite reverse',zIndex:0,pointerEvents:'none'}}/>
      <div style={{position:'fixed',width:400,height:400,borderRadius:'50%',background:'radial-gradient(circle,rgba(0,212,255,0.05),transparent 70%)',top:'40%',left:'40%',animation:'orb 10s ease-in-out infinite 2s',zIndex:0,pointerEvents:'none'}}/>

      {/* SCAN LINES */}
      <div style={{position:'fixed',inset:0,background:'repeating-linear-gradient(0deg,transparent,transparent 3px,rgba(0,0,0,0.03) 3px,rgba(0,0,0,0.03) 4px)',zIndex:0,pointerEvents:'none'}}/>

      {/* FLOATING SPORTS */}
      {[['🏏','8%','12s','0s'],['⚽','85%','15s','2s'],['🏸','12%','10s','1s'],['🎾','78%','13s','3s'],['🏀','45%','11s','0.5s'],['🏆','25%','14s','1.5s'],['⚡','68%','9s','2.5s'],['🔥','55%','16s','4s']].map(([e,l,d,dl],i)=>(
        <div key={i} style={{position:'fixed',left:l,bottom:'-50px',fontSize:26,animation:`sf-float ${d} linear ${dl} infinite`,zIndex:0,pointerEvents:'none'}}>{e}</div>
      ))}

      {/* PARTICLES */}
      {[['#00ff88','10%','9s','0s',3],['#00d4ff','30%','12s','2s',2],['#a855f7','60%','10s','1s',3],['#ffcc00','80%','13s','3s',2],['#00ff88','50%','8s','4s',2]].map(([c,l,d,dl,s],i)=>(
        <Particle key={i} color={c} left={l} dur={d} delay={dl} size={s}/>
      ))}

      {/* CARD */}
      <div style={{width:'100%',maxWidth:440,position:'relative',zIndex:1,animation:'slide-up 0.6s ease forwards'}}>
        <div style={{
          background:'linear-gradient(135deg,rgba(8,13,26,0.97),rgba(5,8,16,0.99))',
          border:'1px solid rgba(0,255,136,0.12)',
          borderRadius:24,padding:32,
          boxShadow:'0 32px 80px rgba(0,0,0,0.7),0 0 0 1px rgba(0,255,136,0.04),inset 0 1px 0 rgba(255,255,255,0.04)',
          position:'relative',overflow:'hidden'
        }}>
          {/* TOP BORDER GRADIENT */}
          <div style={{position:'absolute',top:0,left:0,right:0,height:1,background:'linear-gradient(90deg,transparent,rgba(0,255,136,0.5),rgba(0,212,255,0.5),rgba(168,85,247,0.5),transparent)'}}/>

          {/* CORNERS */}
          {[['top:12px;left:12px','borderTop,borderLeft','4px 0 0 0'],['top:12px;right:12px','borderTop,borderRight','0 4px 0 0'],['bottom:12px;left:12px','borderBottom,borderLeft','0 0 0 4px'],['bottom:12px;right:12px','borderBottom,borderRight','0 0 4px 0']].map((_,i)=>(
            <div key={i} style={{position:'absolute',width:20,height:20,...(i===0?{top:12,left:12,borderTop:'1.5px solid rgba(0,255,136,0.3)',borderLeft:'1.5px solid rgba(0,255,136,0.3)',borderRadius:'4px 0 0 0'}:i===1?{top:12,right:12,borderTop:'1.5px solid rgba(0,255,136,0.3)',borderRight:'1.5px solid rgba(0,255,136,0.3)',borderRadius:'0 4px 0 0'}:i===2?{bottom:12,left:12,borderBottom:'1.5px solid rgba(0,255,136,0.3)',borderLeft:'1.5px solid rgba(0,255,136,0.3)',borderRadius:'0 0 0 4px'}:{bottom:12,right:12,borderBottom:'1.5px solid rgba(0,255,136,0.3)',borderRight:'1.5px solid rgba(0,255,136,0.3)',borderRadius:'0 0 4px 0'})}}/>
          ))}

          {/* LOGO */}
          <div style={{textAlign:'center',marginBottom:24}}>
            <div style={{width:68,height:68,borderRadius:'50%',background:'conic-gradient(#00ff88 0% 33%,#00d4ff 33% 66%,#a855f7 66% 100%)',padding:3,margin:'0 auto 12px',animation:'ring-glow 2s ease-in-out infinite',boxShadow:'0 0 30px rgba(0,255,136,0.2)'}}>
              <div style={{width:'100%',height:'100%',borderRadius:'50%',background:'#050810',display:'flex',alignItems:'center',justifyContent:'center',fontSize:26}}>⚡</div>
            </div>
            <div style={{fontFamily:'Rajdhani,sans-serif',fontSize:22,fontWeight:700,letterSpacing:4,textTransform:'uppercase',background:'linear-gradient(135deg,#00ff88,#00d4ff,#a855f7)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',backgroundClip:'text'}}>
              AthleteCoach
            </div>
            <div style={{fontSize:8,color:'#2a3550',letterSpacing:4,textTransform:'uppercase',marginTop:3}}>AI Training OS · v3</div>
          </div>

          {/* SPORTS STRIP */}
          <div style={{display:'flex',justifyContent:'center',gap:8,marginBottom:20}}>
            {Object.entries(SPORT_DATA).map(([s,d],i)=>(
              <div key={s} className="sport-btn" style={{fontSize:18,padding:'6px 8px',borderRadius:8,border:'1px solid rgba(255,255,255,0.05)',background:'rgba(255,255,255,0.02)',cursor:'default',transition:'all 0.2s',animation:`bounce-sport 1s ease-in-out ${i*0.15}s infinite`}}>
                {d.icon}
              </div>
            ))}
          </div>

          {/* TABS */}
          <div style={{display:'flex',background:'rgba(255,255,255,0.03)',borderRadius:12,padding:4,marginBottom:20,border:'1px solid rgba(255,255,255,0.05)'}}>
            {['Login','Register'].map((t,i)=>(
              <button key={t} className="tab-btn" onClick={()=>{setIsLogin(i===0);setError('')}} style={{
                flex:1,padding:'9px',border:'none',borderRadius:9,
                fontSize:13,fontWeight:700,fontFamily:'Rajdhani,sans-serif',
                letterSpacing:2,cursor:'pointer',transition:'all 0.25s',
                textTransform:'uppercase',
                background:((isLogin&&i===0)||(!isLogin&&i===1))?'linear-gradient(135deg,#00ff88,#00cc6e)':'transparent',
                color:((isLogin&&i===0)||(!isLogin&&i===1))?'#000':'#2a3550',
                boxShadow:((isLogin&&i===0)||(!isLogin&&i===1))?'0 4px 16px rgba(0,255,136,0.3)':'none'
              }}>{t}</button>
            ))}
          </div>

          {/* STATUS */}
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:16}}>
            <div style={{display:'flex',alignItems:'center',gap:5,fontSize:9,color:'#2a3550',letterSpacing:2}}>
              <div style={{width:6,height:6,borderRadius:'50%',background:'#00ff88',animation:'blink 2s infinite'}}/>
              SYSTEM ONLINE
            </div>
            <div style={{fontSize:10,color:'#00d4ff',cursor:'pointer'}}>Need help?</div>
          </div>

          {/* ERROR */}
          {error && (
            <div style={{padding:'10px 14px',background:'rgba(255,69,0,0.08)',border:'1px solid rgba(255,69,0,0.25)',borderRadius:10,color:'#ff4500',fontSize:12,marginBottom:14,display:'flex',alignItems:'center',gap:8}}>
              <span>❌</span><span>{error}</span>
            </div>
          )}

          {/* NAME (Register only) */}
          {!isLogin && (
            <div style={{position:'relative',marginBottom:0}}>
              <span style={{position:'absolute',left:13,top:'50%',transform:'translateY(-50%)',fontSize:14,opacity:0.35,pointerEvents:'none'}}>👤</span>
              <input className="inp-style" style={inp} placeholder="Full Name e.g. Keshav Garg" value={form.name} onChange={e=>setForm({...form,name:e.target.value})} onKeyPress={handleKey}/>
            </div>
          )}

          {/* EMAIL */}
          <div style={{position:'relative'}}>
            <span style={{position:'absolute',left:13,top:'42%',transform:'translateY(-50%)',fontSize:14,opacity:0.35,pointerEvents:'none'}}>📧</span>
            <input className="inp-style" style={inp} placeholder="Email address" value={form.email} onChange={e=>setForm({...form,email:e.target.value})} onKeyPress={handleKey}/>
          </div>

          {/* PASSWORD */}
          <div style={{position:'relative'}}>
            <span style={{position:'absolute',left:13,top:'42%',transform:'translateY(-50%)',fontSize:14,opacity:0.35,pointerEvents:'none'}}>🔒</span>
            <input className="inp-style" style={inp} type="password" placeholder="Password (min 6 chars)" value={form.password} onChange={e=>setForm({...form,password:e.target.value})} onKeyPress={handleKey}/>
          </div>

          {/* SPORT SELECTOR (Register only) */}
          {!isLogin && <>
            <div style={{fontSize:9,color:'#2a3550',letterSpacing:2,textTransform:'uppercase',marginBottom:8}}>Choose Your Sport</div>
            <div style={{display:'grid',gridTemplateColumns:'repeat(5,1fr)',gap:6,marginBottom:14}}>
              {Object.entries(SPORT_DATA).map(([s,d])=>(
                <button key={s} className="sport-btn" onClick={()=>setForm({...form,sport:s,role:d.roles[0]})} style={{
                  padding:'10px 4px',border:`1px solid ${form.sport===s?d.color+'55':'rgba(255,255,255,0.06)'}`,
                  borderRadius:10,background:form.sport===s?`${d.color}12`:'rgba(255,255,255,0.02)',
                  cursor:'pointer',textAlign:'center',transition:'all 0.2s',
                  boxShadow:form.sport===s?`0 4px 16px ${d.color}20`:'none'
                }}>
                  <div style={{fontSize:20,marginBottom:3}}>{d.icon}</div>
                  <div style={{fontSize:7,color:form.sport===s?d.color:'#2a3550',letterSpacing:1,textTransform:'uppercase'}}>{s.slice(0,4)}</div>
                </button>
              ))}
            </div>

            <div style={{fontSize:9,color:'#2a3550',letterSpacing:2,textTransform:'uppercase',marginBottom:6}}>Playing Role</div>
            <select value={form.role} onChange={e=>setForm({...form,role:e.target.value})} style={{width:'100%',padding:'11px 14px',background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.07)',borderRadius:11,color:'#fff',fontSize:13,outline:'none',marginBottom:14}}>
              {selectedSport.roles.map(r=><option key={r} value={r} style={{background:'#0a0f1e'}}>{r.replace(/_/g,' ')}</option>)}
            </select>
          </>}

          {/* SUBMIT */}
          <button className="submit-btn" onClick={handleSubmit} disabled={loading} style={{
            width:'100%',padding:13,
            background:loading?'rgba(0,255,136,0.3)':'linear-gradient(135deg,#00ff88,#00cc6e)',
            color:'#000',border:'none',borderRadius:12,
            fontSize:14,fontWeight:700,letterSpacing:2,
            textTransform:'uppercase',cursor:loading?'not-allowed':'pointer',
            transition:'all 0.2s',marginTop:4,
            boxShadow:loading?'none':'0 4px 20px rgba(0,255,136,0.35)',
            fontFamily:'Rajdhani,sans-serif'
          }}>
            {loading?'⏳ Please wait...':(isLogin?'⚡ Login To Train':'🚀 Create Account')}
          </button>

          {/* ENTER KEY HINT */}
          <div style={{display:'flex',alignItems:'center',justifyContent:'center',gap:6,marginTop:10,fontSize:10,color:'#2a3550'}}>
            <span>or press</span>
            <div style={{padding:'2px 8px',background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.08)',borderRadius:5,fontSize:10,color:'#4a5580'}}>Enter ↵</div>
            <span>to {isLogin?'login':'register'}</span>
          </div>

          {/* DIVIDER */}
          <div style={{display:'flex',alignItems:'center',gap:10,margin:'16px 0'}}>
            <div style={{flex:1,height:1,background:'rgba(255,255,255,0.05)'}}/>
            <div style={{fontSize:9,color:'#2a3550',letterSpacing:2}}>{isLogin?'NEW HERE?':'HAVE ACCOUNT?'}</div>
            <div style={{flex:1,height:1,background:'rgba(255,255,255,0.05)'}}/>
          </div>

          {/* SWITCH */}
          <div style={{textAlign:'center',fontSize:12,color:'#2a3550'}}>
            {isLogin?"Don't have an account? ":"Already have an account? "}
            <span style={{color:'#00ff88',cursor:'pointer',fontWeight:600}} onClick={()=>{setIsLogin(!isLogin);setError('')}}>
              {isLogin?'Register free →':'Login →'}
            </span>
          </div>

        </div>

        {/* FOOTER */}
        <div style={{textAlign:'center',marginTop:16,fontSize:10,color:'#1a2030',letterSpacing:2}}>
          AthleteCoach AI · Multi-Sport Training Platform · 2026
        </div>
      </div>
    </div>
  )
}
