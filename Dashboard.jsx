// src/pages/Dashboard.jsx
import { useEffect, useState } from 'react'
import { getDashboardStats } from '../firebase/helpers'
import { Users, CheckCircle, Clock, Scale } from 'lucide-react'

const IMC_COLOR = (v) => {
  if (v < 18.5) return 'var(--accent-blue)'
  if (v <= 24.9) return 'var(--accent-teal)'
  if (v <= 29.9) return 'var(--accent-gold)'
  return 'var(--status-danger)'
}

export default function Dashboard() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getDashboardStats().then(s => { setStats(s); setLoading(false) })
  }, [])

  const CARDS = stats ? [
    { icon: Users, label: 'Registrados', value: stats.registrados, color: 'var(--accent-teal)', bg: 'var(--accent-teal-dim)' },
    { icon: CheckCircle, label: 'Completos', value: stats.completos, color: 'var(--accent-teal)', bg: 'var(--accent-teal-dim)' },
    { icon: Clock, label: 'En proceso', value: stats.enProceso, color: 'var(--accent-gold)', bg: 'var(--accent-gold-dim)' },
    { icon: Scale, label: 'Promedio IMC', value: stats.promedioIMC, color: 'var(--accent-purple)', bg: 'var(--accent-purple-dim)' },
  ] : []

  return (
    <div className="fade-in">
      <h1 style={{ fontFamily: 'Space Grotesk', fontSize: 28, fontWeight: 700, marginBottom: 6 }}>DASHBOARD</h1>
      <p style={{ color: 'var(--text-secondary)', marginBottom: 28 }}>Resumen general del programa HEALTHXPERIENCE</p>

      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16, marginBottom: 28 }}>
          {[0,1,2,3].map(i => <div key={i} className="card shimmer" style={{ height: 100 }} />)}
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16, marginBottom: 28 }}>
          {CARDS.map(({ icon: Icon, label, value, color, bg }) => (
            <div key={label} className="card" style={{ borderColor: bg }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div style={{ color: 'var(--text-secondary)', fontSize: 12, marginBottom: 10 }}>{label}</div>
                  <div className="stat-value" style={{ fontSize: 36, color }}>{value}</div>
                </div>
                <div style={{ width: 40, height: 40, borderRadius: 10, background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Icon size={20} color={color} />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {stats && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
          {/* Recent */}
          <div className="card">
            <h3 style={{ fontSize: 12, fontWeight: 700, letterSpacing: 1.5, color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: 16 }}>Registros Recientes</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {stats.recent.map(p => (
                <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', background: 'var(--bg-secondary)', borderRadius: 10 }}>
                  <div style={{
                    width: 36, height: 36, borderRadius: '50%', flexShrink: 0,
                    background: 'linear-gradient(135deg, var(--accent-teal), var(--accent-purple))',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontWeight: 700, fontSize: 14
                  }}>
                    {p.nombre?.[0]?.toUpperCase() || '?'}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 600, fontSize: 13, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.nombre}</div>
                    <div style={{ color: 'var(--text-muted)', fontSize: 11 }}>{p.grupo} · {p.id}</div>
                  </div>
                  {p.pruebas && <span style={{ fontSize: 16 }}>✅</span>}
                </div>
              ))}
            </div>
          </div>

          {/* By group */}
          <div className="card">
            <h3 style={{ fontSize: 12, fontWeight: 700, letterSpacing: 1.5, color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: 16 }}>Participantes por Grupo</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {Object.entries(stats.byGroup).sort((a,b) => b[1]-a[1]).map(([grupo, n]) => (
                <div key={grupo} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span style={{ fontSize: 13, flex: 1, color: 'var(--text-secondary)' }}>{grupo}</span>
                  <div style={{ height: 6, flex: 3, background: 'var(--bg-secondary)', borderRadius: 3, overflow: 'hidden' }}>
                    <div style={{ width: `${Math.min(100, n * 4)}%`, height: '100%', background: 'var(--accent-teal)', borderRadius: 3 }} />
                  </div>
                  <span className="stat-value" style={{ color: 'var(--accent-teal)', minWidth: 28, textAlign: 'right', fontSize: 14 }}>{n}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
