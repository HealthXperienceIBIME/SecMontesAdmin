// src/pages/Login.jsx
import { useState } from 'react'
import { Lock, Eye, EyeOff } from 'lucide-react'

export default function Login({ onLogin }) {
  const [pw, setPw] = useState('')
  const [show, setShow] = useState(false)
  const [error, setError] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    await new Promise(r => setTimeout(r, 600))
    const ok = onLogin(pw)
    if (!ok) { setError(true); setLoading(false) }
  }

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'var(--bg-primary)',
      backgroundImage: 'linear-gradient(rgba(0,212,160,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(0,212,160,0.03) 1px, transparent 1px)',
      backgroundSize: '40px 40px'
    }}>
      <div style={{
        width: 440, background: 'var(--bg-card)', border: '1px solid var(--border)',
        borderRadius: 20, padding: 40, boxShadow: '0 20px 60px rgba(0,0,0,0.6)'
      }} className="fade-in">

        {/* Logos MÁS GRANDES */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, marginBottom: 28 }}>
          <img src="/SecMontesAdmin/logo-hx.png" alt="HealthXperience" style={{ height: 80, objectFit: 'contain' }} />
          <img src="/SecMontesAdmin/logo-ibime.png" alt="IBIME" style={{ height: 44, objectFit: 'contain' }} />
        </div>

        {/* Title */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <h1 style={{ fontFamily: 'Space Grotesk', fontSize: 22, fontWeight: 700, color: 'var(--accent-teal)', letterSpacing: 2 }}>
            HEALTHXPERIENCE
          </h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: 6, fontSize: 13 }}>
            Plataforma de Salud & Rendimiento
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <label style={{ display: 'block', marginBottom: 8, fontSize: 11, fontWeight: 700, letterSpacing: 1.5, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
            <Lock size={12} style={{ marginRight: 6, verticalAlign: 'middle' }} />
            Contraseña de acceso
          </label>
          <div style={{ position: 'relative', marginBottom: 20 }}>
            <input
              type={show ? 'text' : 'password'}
              value={pw}
              onChange={e => { setPw(e.target.value); setError(false) }}
              placeholder="••••••••••••"
              style={{ paddingRight: 44, borderColor: error ? 'var(--status-danger)' : undefined }}
              autoFocus
            />
            <button type="button" onClick={() => setShow(!show)}
              style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', color: 'var(--text-muted)', padding: 4 }}>
              {show ? <EyeOff size={16}/> : <Eye size={16}/>}
            </button>
          </div>
          {error && <p style={{ color: 'var(--status-danger)', fontSize: 12, marginBottom: 16, textAlign: 'center' }}>
            Contraseña incorrecta
          </p>}
          <button type="submit" className="btn-primary" disabled={loading}
            style={{ width: '100%', padding: '14px', fontSize: 15, borderRadius: 10 }}>
            {loading ? <span className="spinner" style={{ width: 18, height: 18 }} /> : 'Ingresar →'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: 24, color: 'var(--text-muted)', fontSize: 12 }}>
          🔒 Acceso exclusivo IBIME 2026
        </p>
      </div>
    </div>
  )
}
