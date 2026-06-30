// src/pages/Premiaciones.jsx
import { useEffect, useState } from 'react'
import { getAllParticipants, PRESENTACIONES } from '../firebase/helpers'
import { Trophy, Filter, Sparkles, X, Award } from 'lucide-react'

const MEDAL = ['🥇', '🥈', '🥉']
const MEDAL_COLOR = ['var(--accent-gold)', '#c0c0c0', '#cd7f32']

const CATEGORIAS = [
  { key: 'saltoCuerda', label: 'Salto de Cuerda', unit: 'reps', icon: '⚡', color: 'var(--accent-gold)', asc: false },
  { key: 'lanzamiento', label: 'Lanzamiento', unit: 'm', icon: '🎯', color: 'var(--accent-purple)', asc: false },
  { key: 'carrera', label: 'Carrera 45m', unit: 's', icon: '🏃', color: 'var(--accent-teal)', asc: true },
  { key: 'velocidad', label: 'Velocidad', unit: 'm/s', icon: '💨', color: 'var(--accent-teal)', asc: false },
  { key: 'aceleracion', label: 'Aceleración', unit: 'm/s²', icon: '⚡', color: 'var(--accent-purple)', asc: false },
  { key: 'fuerza', label: 'Fuerza', unit: 'N', icon: '💪', color: 'var(--accent-gold)', asc: false },
]

// Calcula puntos por posición: 1er=6pts, 2do=5pts...6to o más=1pt
function calcularPuntos(participants) {
  const puntosPorId = {}
  participants.forEach(p => { puntosPorId[p.id] = 0 })

  CATEGORIAS.forEach(({ key, asc }) => {
    const validos = participants.filter(p => p.pruebas && p.pruebas[key] != null && p.pruebas[key] > 0)
    const ordenados = [...validos].sort((a, b) => asc
      ? a.pruebas[key] - b.pruebas[key]
      : b.pruebas[key] - a.pruebas[key]
    )
    ordenados.forEach((p, i) => {
      const pts = Math.max(6 - i, 1)
      puntosPorId[p.id] = (puntosPorId[p.id] || 0) + pts
    })
  })

  return participants
    .map(p => ({ ...p, puntosTotal: puntosPorId[p.id] || 0 }))
    .filter(p => p.puntosTotal > 0)
    .sort((a, b) => b.puntosTotal - a.puntosTotal)
}

function getValue(p, key) {
  return p.pruebas?.[key] || 0
}

// Modal del Podium con animación
function PodiumModal({ top3, filtroLabel, onClose }) {
  const [stage, setStage] = useState(0) // 0=conteo, 1=tercer, 2=segundo, 3=primero, 4=completo

  useEffect(() => {
    const timers = [
      setTimeout(() => setStage(1), 1200),  // muestra "3"
      setTimeout(() => setStage(2), 2600),  // muestra "2"
      setTimeout(() => setStage(3), 4000),  // muestra "1"
      setTimeout(() => setStage(4), 5400),  // podium completo
    ]
    return () => timers.forEach(clearTimeout)
  }, [])

  const [tercero, segundo, primero] = top3

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.88)', backdropFilter: 'blur(6px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 20
    }}>
      <div style={{
        background: 'linear-gradient(135deg, #0d1520, #111827)', border: '1px solid var(--accent-gold)',
        borderRadius: 24, padding: 32, width: '100%', maxWidth: 600,
        boxShadow: '0 0 60px rgba(245,158,11,0.25)', position: 'relative'
      }}>
        <button onClick={onClose} style={{ position: 'absolute', top: 20, right: 20, background: 'none', color: 'var(--text-muted)', padding: 6, zIndex: 10 }}>
          <X size={20} />
        </button>

        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <div style={{ fontFamily: 'Space Grotesk', fontSize: 22, fontWeight: 700, color: 'var(--accent-gold)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
            <Trophy size={24} /> PODIUM GENERAL
          </div>
          <div style={{ color: 'var(--text-secondary)', fontSize: 13, marginTop: 4 }}>{filtroLabel}</div>
        </div>

        {/* Countdown numbers */}
        {stage < 4 && (
          <div style={{ textAlign: 'center', padding: '40px 0' }}>
            <div key={stage} style={{
              fontFamily: 'Space Grotesk', fontWeight: 800,
              fontSize: 120, lineHeight: 1,
              color: stage === 1 ? '#cd7f32' : stage === 2 ? '#c0c0c0' : stage === 3 ? 'var(--accent-gold)' : 'var(--text-muted)',
              textShadow: stage > 0 ? `0 0 40px ${stage === 1 ? '#cd7f32' : stage === 2 ? '#c0c0c0' : 'var(--accent-gold)'}80` : 'none',
              animation: 'popIn 0.5s ease'
            }}>
              {stage === 0 ? '✦' : stage === 1 ? '3' : stage === 2 ? '2' : '1'}
            </div>
            {stage > 0 && (
              <div style={{ marginTop: 16, animation: 'fadeUp 0.5s ease' }}>
                <div style={{ fontWeight: 700, fontSize: 18 }}>
                  {stage === 1 ? tercero?.nombre : stage === 2 ? segundo?.nombre : primero?.nombre}
                </div>
                <div style={{ color: 'var(--text-muted)', fontSize: 12, marginTop: 4 }}>
                  {(stage === 1 ? tercero : stage === 2 ? segundo : primero)?.puntosTotal} puntos totales
                </div>
              </div>
            )}
          </div>
        )}

        {/* Podium final */}
        {stage === 4 && (
          <div className="fade-in" style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'center', gap: 12, padding: '20px 0 10px' }}>
            {/* 2do lugar */}
            <PodiumBlock person={segundo} place={2} height={120} color="#c0c0c0" medal="🥈" />
            {/* 1er lugar */}
            <PodiumBlock person={primero} place={1} height={160} color="var(--accent-gold)" medal="🥇" />
            {/* 3er lugar */}
            <PodiumBlock person={tercero} place={3} height={90} color="#cd7f32" medal="🥉" />
          </div>
        )}

        <style>{`
          @keyframes popIn { 0%{transform:scale(0.3);opacity:0} 60%{transform:scale(1.15)} 100%{transform:scale(1);opacity:1} }
          @keyframes fadeUp { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
        `}</style>
      </div>
    </div>
  )
}

function PodiumBlock({ person, place, height, color, medal }) {
  if (!person) return null
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: 140 }}>
      <div style={{ fontSize: 32, marginBottom: 8 }}>{medal}</div>
      <div style={{
        width: 56, height: 56, borderRadius: '50%', background: 'linear-gradient(135deg,#00d4a0,#8b5cf6)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 22,
        border: `3px solid ${color}`, marginBottom: 8
      }}>
        {person.nombre?.[0]?.toUpperCase()}
      </div>
      <div style={{ fontWeight: 700, fontSize: 13, textAlign: 'center', marginBottom: 2 }}>{person.nombre}</div>
      <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 10 }}>{person.grupo}</div>
      <div style={{
        width: '100%', height, background: `linear-gradient(180deg, ${color}40, ${color}15)`,
        border: `2px solid ${color}`, borderRadius: '8px 8px 0 0',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        animation: `growUp 0.6s ease`
      }}>
        <div style={{ fontFamily: 'Space Grotesk', fontSize: 36, fontWeight: 800, color }}>{place}°</div>
        <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 4 }}>{person.puntosTotal} pts</div>
      </div>
      <style>{`@keyframes growUp { from{ transform: scaleY(0); transform-origin: bottom; } to{ transform: scaleY(1); } }`}</style>
    </div>
  )
}

export default function Premiaciones() {
  const [allParticipants, setAllParticipants] = useState([])
  const [filtro, setFiltro] = useState('todas')
  const [loading, setLoading] = useState(true)
  const [showPodium, setShowPodium] = useState(false)

  useEffect(() => {
    getAllParticipants().then(all => { setAllParticipants(all); setLoading(false) })
  }, [])

  const filtroLabel = filtro === 'todas'
    ? 'Todos los grupos'
    : PRESENTACIONES.find(p => p.id === filtro)?.label || filtro

  const participantsFiltrados = filtro === 'todas'
    ? allParticipants
    : allParticipants.filter(p => p.presentacion === filtro)

  const ranked = calcularPuntos(participantsFiltrados)
  const top3 = ranked.slice(0, 3)

  // Para mostrar tablas por categoría como antes
  const dataPorCategoria = {}
  CATEGORIAS.forEach(({ key, asc }) => {
    const validos = participantsFiltrados.filter(p => p.pruebas && p.pruebas[key] != null && p.pruebas[key] > 0)
    dataPorCategoria[key] = [...validos].sort((a, b) => asc ? a.pruebas[key] - b.pruebas[key] : b.pruebas[key] - a.pruebas[key]).slice(0, 3)
  })

  return (
    <div className="fade-in">
      {showPodium && top3.length > 0 && (
        <PodiumModal top3={top3} filtroLabel={filtroLabel} onClose={() => setShowPodium(false)} />
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
        <div>
          <h1 style={{ fontFamily: 'Space Grotesk', fontSize: 28, fontWeight: 700, marginBottom: 6 }}>PREMIACIONES</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Mejores resultados por categoría · {filtroLabel}</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Filter size={16} color="var(--text-muted)" />
          <select value={filtro} onChange={e => setFiltro(e.target.value)} style={{ width: 'auto', minWidth: 200 }}>
            <option value="todas">Todas las presentaciones</option>
            {PRESENTACIONES.map(p => (
              <option key={p.id} value={p.id}>{p.label} — {p.fecha}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Filtros rápidos + botón Podium */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap', alignItems: 'center' }}>
        <button onClick={() => setFiltro('todas')}
          style={{ padding: '6px 14px', borderRadius: 20, border: '1px solid', fontSize: 12, fontWeight: 600, cursor: 'pointer',
            borderColor: filtro === 'todas' ? 'var(--accent-teal)' : 'var(--border)',
            background: filtro === 'todas' ? 'var(--accent-teal-dim)' : 'transparent',
            color: filtro === 'todas' ? 'var(--accent-teal)' : 'var(--text-secondary)' }}>
          Todas
        </button>
        {PRESENTACIONES.map(p => (
          <button key={p.id} onClick={() => setFiltro(p.id)}
            style={{ padding: '6px 14px', borderRadius: 20, border: '1px solid', fontSize: 12, fontWeight: 600, cursor: 'pointer',
              borderColor: filtro === p.id ? 'var(--accent-teal)' : 'var(--border)',
              background: filtro === p.id ? 'var(--accent-teal-dim)' : 'transparent',
              color: filtro === p.id ? 'var(--accent-teal)' : 'var(--text-secondary)' }}>
            {p.id}
          </button>
        ))}

        <button onClick={() => setShowPodium(true)} disabled={top3.length === 0}
          style={{ marginLeft: 'auto', padding: '8px 20px', borderRadius: 20, border: '1px solid var(--accent-gold)',
            background: 'var(--accent-gold-dim)', color: 'var(--accent-gold)', fontSize: 13, fontWeight: 700,
            cursor: top3.length === 0 ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: 6,
            opacity: top3.length === 0 ? 0.5 : 1 }}>
          <Award size={16} /> Ver Podium General 🏆
        </button>
      </div>

      {/* Tabla de puntos generales */}
      {!loading && ranked.length > 0 && (
        <div className="card" style={{ marginBottom: 20, borderColor: 'var(--accent-gold)40' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
            <Award size={16} color="var(--accent-gold)" />
            <span style={{ fontWeight: 700, fontSize: 13, color: 'var(--accent-gold)' }}>RANKING GENERAL (por puntos acumulados)</span>
          </div>
          {ranked.slice(0, 5).map((p, i) => (
            <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '8px 0', borderBottom: i < 4 ? '1px solid var(--border)' : 'none' }}>
              <span style={{ width: 24, fontWeight: 700, color: i < 3 ? MEDAL_COLOR[i] : 'var(--text-muted)' }}>
                {i < 3 ? MEDAL[i] : `${i + 1}°`}
              </span>
              <div style={{ flex: 1, fontSize: 13, fontWeight: 600 }}>{p.nombre} <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>· {p.grupo}</span></div>
              <div style={{ fontFamily: 'Space Grotesk', fontWeight: 700, color: 'var(--accent-gold)' }}>{p.puntosTotal} pts</div>
            </div>
          ))}
        </div>
      )}

      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          {[0,1,2,3,4,5].map(i => <div key={i} className="card shimmer" style={{ height: 180 }} />)}
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          {CATEGORIAS.map(({ key, label, unit, color }) => {
            const list = dataPorCategoria[key] || []
            return (
              <div key={key} className="card" style={{ borderColor: color + '30', background: color + '05' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                  <Trophy size={16} color={color} />
                  <span style={{ fontWeight: 700, fontSize: 13, letterSpacing: 1, textTransform: 'uppercase', color }}>{label}</span>
                </div>
                {list.length === 0 ? (
                  <p style={{ color: 'var(--text-muted)', fontSize: 12 }}>Sin datos para esta presentación</p>
                ) : list.map((p, i) => (
                  <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: i < list.length - 1 ? '1px solid var(--border)' : 'none' }}>
                    <span style={{ fontSize: 20, width: 28, flexShrink: 0 }}>{MEDAL[i]}</span>
                    <span style={{ fontWeight: 700, color: MEDAL_COLOR[i], minWidth: 16 }}>{i + 1}°</span>
                    <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'linear-gradient(135deg,#00d4a0,#8b5cf6)', display:'flex',alignItems:'center',justifyContent:'center', fontWeight: 700, fontSize: 13, flexShrink: 0 }}>
                      {p.nombre?.[0]?.toUpperCase()}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 600, fontSize: 13, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.nombre}</div>
                      <div style={{ color: 'var(--text-muted)', fontSize: 11 }}>{p.grupo} · {p.presentacionLabel}</div>
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
