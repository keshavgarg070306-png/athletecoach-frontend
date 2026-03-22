import { useState } from 'react'
import { login, register } from '../services/api'

function Login({ onLogin }) {
    const [isLogin, setIsLogin] = useState(true)
    const [form, setForm] = useState({
        name: '', email: '', password: '',
        sport: 'CRICKET', role: 'BATSMAN'
    })
    const [error, setError] = useState('')

    const handleSubmit = async () => {
        try {
            setError('')
            const res = isLogin
                ? await login({ email: form.email, password: form.password })
                : await register(form)
            onLogin(res.data)
        } catch (e) {
            setError(e.response?.data?.message || 'Something went wrong')
        }
    }

    return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div className="card" style={{ width: 400 }}>
                <h2 style={{ marginBottom: 20, color: '#1B5E20' }}>🏆 AthleteCoach AI</h2>
                <h3 style={{ marginBottom: 20 }}>{isLogin ? 'Login' : 'Register'}</h3>
                {error && <p className="error">{error}</p>}
                {!isLogin && (
                    <input placeholder="Full Name" value={form.name}
                        onChange={e => setForm({...form, name: e.target.value})} />
                )}
                <input placeholder="Email" value={form.email}
                    onChange={e => setForm({...form, email: e.target.value})} />
                <input placeholder="Password" type="password" value={form.password}
                    onChange={e => setForm({...form, password: e.target.value})} />
                {!isLogin && (
                    <>
                        <select value={form.sport}
                            onChange={e => setForm({...form, sport: e.target.value})}>
                            <option value="CRICKET">Cricket</option>
                            <option value="FOOTBALL">Football</option>
                            <option value="BADMINTON">Badminton</option>
                            <option value="TENNIS">Tennis</option>
                            <option value="BASKETBALL">Basketball</option>
                        </select>
                        <select value={form.role}
                            onChange={e => setForm({...form, role: e.target.value})}>
                            <option value="BATSMAN">Batsman</option>
                            <option value="BOWLER">Bowler</option>
                            <option value="ALL_ROUNDER">All Rounder</option>
                            <option value="GOALKEEPER">Goalkeeper</option>
                            <option value="STRIKER">Striker</option>
                            <option value="SINGLES_PLAYER">Singles Player</option>
                        </select>
                    </>
                )}
                <button className="btn btn-primary" style={{ width: '100%' }}
                    onClick={handleSubmit}>
                    {isLogin ? 'Login' : 'Register'}
                </button>
                <p style={{ marginTop: 15, textAlign: 'center', fontSize: 14 }}>
                    {isLogin ? "Don't have account? " : "Already have account? "}
                    <span style={{ color: '#2E7D32', cursor: 'pointer' }}
                        onClick={() => setIsLogin(!isLogin)}>
                        {isLogin ? 'Register' : 'Login'}
                    </span>
                </p>
            </div>
        </div>
    )
}

export default Login
