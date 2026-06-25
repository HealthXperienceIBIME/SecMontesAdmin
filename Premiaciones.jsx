// src/pages/Premiaciones.jsx
import { useEffect, useState } from 'react'
import { getPremiaciones, getAllParticipants } from '../firebase/helpers'
import { Trophy, Filter } from 'lucide-react'

const MEDAL = ['🥇', '🥈', '🥉']
const MEDAL_COLOR = ['var(--accent-gold)', '#aaa', '#cd7f32']

const CATEGORIAS = [
  { key: 'salto', label: 'Salto de Cuerda', unit: 'reps', icon: '⚡', color: 'var(--accent-gold)' },
  { key: 'lanzamiento', label: 'Lanzamiento', unit: 'm', icon: '🎯', color: 'var(--accent-purple)' },
  { key: 'carrera', label: 'Carrera 45m', unit: 's', icon: '🏃', color: 'var(--accent-teal)' },
  { key: 'velocidad', label: 'Velocidad', unit: 'm/s', icon: '💨', color: 'var(--accent-teal)' },
  { key: 'aceleracion', label: 'Aceleración', unit: 'm/s²', icon: '⚡', color: 'var(--accent-purple)' },
  { key: 'fuerza', label: 'Fuerza', unit: 'N', icon: '💪', color: 'var(--accent-gold)' },
]

function getValue(p, key) {
  if (!p.pruebas) return 0
  const map = {
    salto: p.pruebas.saltoCuerda,
    lanzamiento: p.pruebas.lanzamiento,
    carrera: p.pruebas.carrera,
    velocidad: p.pruebas.velocidad,
    aceleracion: p.pruebas.aceleracion,
    fuerza: p.pruebas.fuerza,
  }
  return map[key] || 0
}

export default function Premiaciones() {
  const [data, setData] = useState(null)
  const [grupos, setGrupos] = useState([])
  const [filtro, setFiltro] = useState('Todos los grupos')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const [prem, all] = await Promise.all([getPremiaciones(), getAllParticipants()])
      setData(prem)
      const gs = ['Todos los grupos', ...new Set(all.map(p => p.grupo).filter(Boolean))]
      setGrupos(gs)
      setLoading(false)
    }
    load()
  }, [])

  const filter = (list) => {
    if (filtro === 'Todos los grupos') return list
    return list.filter(p => p.grupo === filtro)
  }

  return (
    <div className="fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28 }}>
        <div>
          <h1 style={{ fontFamily: 'Space Grotesk', fontSize: 28, fontWeight: 700, marginBottom: 6 }}>PREMIACIONES</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Mejores resultados por categoría</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Filter size={16} color="var(--text-muted)" />
          <select value={filtro} onChange={e => setFiltro(e.target.value)} style={{ width: 'auto', minWidth: 180 }}>
            {grupos.map(g => <option key={g}>{g}</option>)}
          </select>
        </div>
      </div>

      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          {[0,1,2,3,4,5].map(i => <div key={i} className="card shimmer" style={{ height: 180 }} />)}
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          {CATEGORIAS.map(({ key, label, unit, icon, color }) => {
            const list = filter(data[key] || [])
            return (
              <div key={key} className="card" style={{ borderColor: color + '30', background: color + '05' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                  <Trophy size={16} color={color} />
                  <span style={{ fontWeight: 700, fontSize: 13, letterSpacing: 1, textTransform: 'uppercase', color }}>{label}</span>
                </div>

                {list.length === 0 ? (
                  <p style={{ color: 'var(--text-muted)', fontSize: 12 }}>Sin datos para este grupo</p>
                ) : list.slice(0, 3).map((p, i) => (
                  <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: i < list.length - 1 ? '1px solid var(--border)' : 'none' }}>
                    <span style={{ fontSize: 20, width: 28, flexShrink: 0 }}>{MEDAL[i]}</span>
                    <span style={{ fontWeight: 700, color: MEDAL_COLOR[i], minWidth: 16 }}>{i + 1}°</span>
                    <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'linear-gradient(135deg,#00d4a0,#8b5cf6)', display:'flex',alignItems:'center',justifyContent:'center', fontWeight: 700, fontSize: 13, flexShrink: 0 }}>
                      {p.nombre?.[0]?.toUpperCase()}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 600, fontSize: 13, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.nombre}</div>
                      <div style={{ color: 'var(--text-muted)', fontSize: 11 }}>{p.grupo}</div>
                    </div>
                    <div className="stat-value" style={{ color, fontSize: 16, flexShrink: 0 }}>
                      {getValue(p, key).toFixed(2)} <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{unit}</span>
                    </div>
                  </div>
                ))}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
