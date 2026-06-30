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

function calcularPuntos(participants) {
  const puntosPorId = {}
  participants.forEach(p => { puntosPorId[p.id] = 0 })
  CATEGORIAS.forEach(({ key, asc }) => {
    const validos = participants.filter(p => p.pruebas && p.pruebas[key] != null && p.pruebas[key] > 0)
    const ordenados = [...validos].sort((a, b) => asc ? a.pruebas[key] - b.pruebas[key] : b.pruebas[key] - a.pruebas[key])
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

function getValue(p, key) { return p.pruebas?.[key] || 0 }

// ── Modal Análisis IA (estilo terminal) ───────────────────────────────────────
function IAAnalysisPanel({ participants, filtroLabel, onClose }) {
  const [lines, setLines] = useState([])
  const valid = participants.filter(p => p.imc && p.peso && p.altura && p.edad)
  const avg = (arr, fn) => arr.length ? (arr.reduce((a, b) => a + fn(b), 0) / arr.length) : 0
  const promedioIMC = avg(valid, p => p.imc).toFixed(2)
  const promedioAltura = avg(valid, p => p.altura).toFixed(2)
  const promedioPeso = avg(valid, p => p.peso).toFixed(1)
  const promedioEdad = avg(valid, p => p.edad).toFixed(1)
  const imcStatus = promedioIMC < 18.5 ? 'bajo peso' : promedioIMC <= 24.9 ? 'normal' : promedioIMC <= 29.9 ? 'sobrepeso' : 'obesidad'
  const imcColor = promedioIMC < 18.5 ? '#3b82f6' : promedioIMC <= 24.9 ? '#00d4a0' : promedioIMC <= 29.9 ? '#f59e0b' : '#ef4444'

  const ANALYSIS_LINES = [
    { text: `Analizando datos de ${valid.length} participantes de ${filtroLabel}...`, delay: 0 },
    { text: `Procesando variables biométricas...`, delay: 800 },
    { text: `Calculando promedios grupales...`, delay: 1600 },
    { text: `▸ Edad promedio del grupo: ${promedioEdad} años`, delay: 2400, highlight: true },
    { text: `▸ Peso promedio: ${promedioPeso} kg`, delay: 3000, highlight: true },
    { text: `▸ Altura promedio: ${promedioAltura} m`, delay: 3600, highlight: true },
    { text: `▸ IMC promedio: ${promedioIMC} — Clasificación: ${imcStatus.toUpperCase()}`, delay: 4200, highlight: true, color: imcColor },
    { text: `Evaluando perfil de salud del grupo...`, delay: 5000 },
    { text: imcStatus === 'normal'
        ? `✅ El grupo presenta un perfil de salud favorable. Se recomienda mantener hábitos de actividad física y alimentación balanceada.`
        : imcStatus === 'sobrepeso'
        ? `⚠️ El grupo presenta tendencia a sobrepeso. Se recomienda reforzar actividad física y orientación nutricional.`
        : imcStatus === 'bajo peso'
        ? `⚠️ El grupo presenta tendencia a bajo peso. Se recomienda revisión nutricional y seguimiento médico.`
        : `🔴 El grupo requiere atención en hábitos alimenticios y actividad física. Se sugiere intervención nutricional.`,
      delay: 5800, highlight: true },
    { text: `Análisis completado por HealthXperience IA ✦`, delay: 6800, muted: true },
  ]

  useEffect(() => {
    ANALYSIS_LINES.forEach((line, i) => {
      setTimeout(() => setLines(prev => [...prev, line]), line.delay)
    })
  }, [])

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 20 }}>
      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--accent-purple)', borderRadius: 20, padding: 28, width: '100%', maxWidth: 520, boxShadow: '0 0 40px rgba(139,92,246,0.3)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: 'var(--accent-purple-dim)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Sparkles size={18} color="var(--accent-purple)" />
            </div>
            <div>
              <div style={{ fontFamily: 'Space Grotesk', fontWeight: 700, fontSize: 14, color: 'var(--accent-purple)' }}>Análisis IA · {filtroLabel}</div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>HealthXperience Internal Analytics</div>
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'none', color: 'var(--text-muted)', padding: 6, borderRadius: 6 }}><X size={18} /></button>
        </div>

        <div style={{ background: '#050a10', borderRadius: 12, padding: 20, minHeight: 280, fontFamily: 'monospace', fontSize: 13, lineHeight: 1.8, border: '1px solid var(--border)' }}>
          {lines.map((line, i) => (
            <div key={i} style={{ color: line.color || (line.highlight ? 'var(--accent-teal)' : line.muted ? 'var(--text-muted)' : 'var(--text-secondary)'), fontWeight: line.highlight ? 700 : 400, marginBottom: 2 }}>
              {line.text}
            </div>
          ))}
          {lines.length < ANALYSIS_LINES.length && <span style={{ color: 'var(--accent-teal)', animation: 'blink 1s infinite' }}>█</span>}
        </div>

        {lines.length >= ANALYSIS_LINES.length && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 10, marginTop: 16 }}>
            {[
              { label: 'Edad prom.', value: `${promedioEdad}`, unit: 'años', color: 'var(--accent-blue)' },
              { label: 'Peso prom.', value: `${promedioPeso}`, unit: 'kg', color: 'var(--accent-teal)' },
              { label: 'Altura prom.', value: `${promedioAltura}`, unit: 'm', color: 'var(--accent-purple)' },
              { label: 'IMC prom.', value: `${promedioIMC}`, unit: imcStatus, color: imcColor },
            ].map(({ label, value, unit, color }) => (
              <div key={label} style={{ background: color + '10', border: `1px solid ${color}30`, borderRadius: 10, padding: '10px 8px', textAlign: 'center' }}>
                <div style={{ fontSize: 10, color: 'var(--text-muted)', marginBottom: 4 }}>{label}</div>
                <div style={{ fontFamily: 'Space Grotesk', fontSize: 18, fontWeight: 700, color }}>{value}</div>
                <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 2 }}>{unit}</div>
              </div>
            ))}
          </div>
        )}
        <style>{`@keyframes blink { 0%,100%{opacity:1} 50%{opacity:0} }`}</style>
      </div>
    </div>
  )
}

// ── Modal Podium ───────────────────────────────────────────────────────────────
function PodiumModal({ top3, filtroLabel, onClose }) {
  const [stage, setStage] = useState(0)
  useEffect(() => {
    const timers = [
      setTimeout(() => setStage(1), 1200),
      setTimeout(() => setStage(2), 2600),
      setTimeout(() => setStage(3), 4000),
      setTimeout(() => setStage(4), 5400),
    ]
    return () => timers.forEach(clearTimeout)
  }, [])
  const [tercero, segundo, primero] = top3

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.88)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 20 }}>
      <div style={{ background: 'linear-gradient(135deg, #0d1520, #111827)', border: '1px solid var(--accent-gold)', borderRadius: 24, padding: 32, width: '100%', maxWidth: 600, boxShadow: '0 0 60px rgba(245,158,11,0.25)', position: 'relative' }}>
        <button onClick={onClose} style={{ position: 'absolute', top: 20, right: 20, background: 'none', color: 'var(--text-muted)', padding: 6, zIndex: 10 }}><X size={20} /></button>
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <div style={{ fontFamily: 'Space Grotesk', fontSize: 22, fontWeight: 700, color: 'var(--accent-gold)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
            <Trophy size={24} /> PODIUM GENERAL
          </div>
          <div style={{ color: 'var(--text-secondary)', fontSize: 13, marginTop: 4 }}>{filtroLabel}</div>
        </div>
        {stage < 4 && (
          <div style={{ textAlign: 'center', padding: '40px 0' }}>
            <div key={stage} style={{ fontFamily: 'Space Grotesk', fontWeight: 800, fontSize: 120, lineHeight: 1,
              color: stage === 1 ? '#cd7f32' : stage === 2 ? '#c0c0c0' : stage === 3 ? 'var(--accent-gold)' : 'var(--text-muted)',
              textShadow: stage > 0 ? `0 0 40px ${stage === 1 ? '#cd7f32' : stage === 2 ? '#c0c0c0' : 'var(--accent-gold)'}80` : 'none', animation: 'popIn 0.5s ease' }}>
              {stage === 0 ? '✦' : stage === 1 ? '3' : stage === 2 ? '2' : '1'}
            </div>
            {stage > 0 && (
              <div style={{ marginTop: 16, animation: 'fadeUp 0.5s ease' }}>
                <div style={{ fontWeight: 700, fontSize: 18 }}>{stage === 1 ? tercero?.nombre : stage === 2 ? segundo?.nombre : primero?.nombre}</div>
                <div style={{ color: 'var(--text-muted)', fontSize: 12, marginTop: 4 }}>{(stage === 1 ? tercero : stage === 2 ? segundo : primero)?.puntosTotal} puntos totales</div>
              </div>
            )}
          </div>
        )}
        {stage === 4 && (
          <div className="fade-in" style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'center', gap: 12, padding: '20px 0 10px' }}>
            <PodiumBlock person={segundo} place={2} height={120} color="#c0c0c0" medal="🥈" />
            <PodiumBlock person={primero} place={1} height={160} color="var(--accent-gold)" medal="🥇" />
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
      <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'linear-gradient(135deg,#00d4a0,#8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 22, border: `3px solid ${color}`, marginBottom: 8 }}>
        {person.nombre?.[0]?.toUpperCase()}
      </div>
      <div style={{ fontWeight: 700, fontSize: 13, textAlign: 'center', marginBottom: 2 }}>{person.nombre}</div>
      <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 10 }}>{person.grupo}</div>
      <div style={{ width: '100%', height, background: `linear-gradient(180deg, ${color}40, ${color}15)`, border: `2px solid ${color}`, borderRadius: '8px 8px 0 0', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', animation: `growUp 0.6s ease` }}>
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
  const [showIA, setShowIA] = useState(false)

  useEffect(() => {
    getAllParticipants().then(all => { setAllParticipants(all); setLoading(false) })
  }, [])

  const filtroLabel = filtro === 'todas' ? 'Todos los grupos' : PRESENTACIONES.find(p => p.id === filtro)?.label || filtro
  const participantsFiltrados = filtro === 'todas' ? allParticipants : allParticipants.filter(p => p.presentacion === filtro)
  const ranked = calcularPuntos(participantsFiltrados)
  const top3 = ranked.slice(0, 3)

  const dataPorCategoria = {}
  CATEGORIAS.forEach(({ key, asc }) => {
    const validos = participantsFiltrados.filter(p => p.pruebas && p.pruebas[key] != null && p.pruebas[key] > 0)
    dataPorCategoria[key] = [...validos].sort((a, b) => asc ? a.pruebas[key] - b.pruebas[key] : b.pruebas[key] - a.pruebas[key]).slice(0, 3)
  })

  return (
    <div className="fade-in">
      {showPodium && top3.length > 0 && <PodiumModal top3={top3} filtroLabel={filtroLabel} onClose={() => setShowPodium(false)} />}
      {showIA && <IAAnalysisPanel participants={participantsFiltrados} filtroLabel={filtroLabel} onClose={() => setShowIA(false)} />}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
        <div>
          <h1 style={{ fontFamily: 'Space Grotesk', fontSize: 28, fontWeight: 700, marginBottom: 6 }}>PREMIACIONES</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Mejores resultados por categoría · {filtroLabel}</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Filter size={16} color="var(--text-muted)" />
          <select value={filtro} onChange={e => setFiltro(e.target.value)} style={{ width: 'auto', minWidth: 200 }}>
            <option value="todas">Todas las presentaciones</option>
            {PRESENTACIONES.map(p => <option key={p.id} value={p.id}>{p.label} — {p.fecha}</option>)}
          </select>
        </div>
      </div>

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

        <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
          <button onClick={() => setShowIA(true)}
            style={{ padding: '8px 18px', borderRadius: 20, border: '1px solid var(--accent-purple)', background: 'var(--accent-purple-dim)', color: 'var(--accent-purple)', fontSize: 12, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
            <Sparkles size={14} /> Análisis IA del grupo
          </button>
          <button onClick={() => setShowPodium(true)} disabled={top3.length === 0}
            style={{ padding: '8px 20px', borderRadius: 20, border: '1px solid var(--accent-gold)', background: 'var(--accent-gold-dim)', color: 'var(--accent-gold)', fontSize: 13, fontWeight: 700,
              cursor: top3.length === 0 ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: 6, opacity: top3.length === 0 ? 0.5 : 1 }}>
            <Award size={16} /> Ver Podium 🏆
          </button>
        </div>
      </div>

      {!loading && ranked.length > 0 && (
        <div className="card" style={{ marginBottom: 20, borderColor: 'rgba(245,158,11,0.4)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
            <Award size={16} color="var(--accent-gold)" />
            <span style={{ fontWeight: 700, fontSize: 13, color: 'var(--accent-gold)' }}>RANKING GENERAL (por puntos acumulados)</span>
          </div>
          {ranked.slice(0, 5).map((p, i) => (
            <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '8px 0', borderBottom: i < 4 ? '1px solid var(--border)' : 'none' }}>
              <span style={{ width: 24, fontWeight: 700, color: i < 3 ? MEDAL_COLOR[i] : 'var(--text-muted)' }}>{i < 3 ? MEDAL[i] : `${i + 1}°`}</span>
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
