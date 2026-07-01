// src/pages/Premiaciones.jsx
import { useEffect, useState } from 'react'
import { getAllParticipants, PRESENTACIONES } from '../firebase/helpers'
import { Trophy, Filter, Sparkles, X, Award, CheckSquare, Square } from 'lucide-react'

const MEDAL = ['🥇', '🥈', '🥉']
const MEDAL_COLOR = ['var(--accent-gold)', '#c0c0c0', '#cd7f32']

const CATEGORIAS = [
  { key: 'saltoCuerda', label: 'Salto de Cuerda', unit: 'reps', color: 'var(--accent-gold)', asc: false },
  { key: 'lanzamiento', label: 'Lanzamiento', unit: 'm', color: 'var(--accent-purple)', asc: false },
  { key: 'carrera', label: 'Carrera 45m', unit: 's', color: 'var(--accent-teal)', asc: true },
  { key: 'velocidad', label: 'Velocidad', unit: 'm/s', color: 'var(--accent-teal)', asc: false },
  { key: 'aceleracion', label: 'Aceleración', unit: 'm/s²', color: 'var(--accent-purple)', asc: false },
  { key: 'fuerza', label: 'Fuerza', unit: 'N', color: 'var(--accent-gold)', asc: false },
]

function calcularPuntos(participants) {
  const puntosPorId = {}
  participants.forEach(p => { puntosPorId[p.id] = 0 })
  CATEGORIAS.forEach(({ key, asc }) => {
    const validos = participants.filter(p => p.pruebas && p.pruebas[key] != null && p.pruebas[key] > 0)
    const ordenados = [...validos].sort((a, b) => asc ? a.pruebas[key] - b.pruebas[key] : b.pruebas[key] - a.pruebas[key])
    ordenados.forEach((p, i) => {
      puntosPorId[p.id] = (puntosPorId[p.id] || 0) + Math.max(6 - i, 1)
    })
  })
  return participants
    .map(p => ({ ...p, puntosTotal: puntosPorId[p.id] || 0 }))
    .filter(p => p.puntosTotal > 0)
    .sort((a, b) => b.puntosTotal - a.puntosTotal)
}

function getValue(p, key) { return p.pruebas?.[key] || 0 }

// ── Selector de presentaciones con checkboxes ─────────────────────────────────
function PresentacionSelector({ seleccionadas, onChange }) {
  const [open, setOpen] = useState(false)

  const toggleAll = () => {
    if (seleccionadas.length === PRESENTACIONES.length) onChange([])
    else onChange(PRESENTACIONES.map(p => p.id))
  }

  const toggle = (id) => {
    if (seleccionadas.includes(id)) onChange(seleccionadas.filter(s => s !== id))
    else onChange([...seleccionadas, id])
  }

  const label = seleccionadas.length === 0
    ? 'Todas las presentaciones'
    : seleccionadas.length === PRESENTACIONES.length
    ? 'Todas las presentaciones'
    : seleccionadas.length === 1
    ? PRESENTACIONES.find(p => p.id === seleccionadas[0])?.label
    : `${seleccionadas.length} presentaciones seleccionadas`

  return (
    <div style={{ position: 'relative' }}>
      <button onClick={() => setOpen(!open)}
        style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 16px', borderRadius: 10, border: '1px solid var(--border)', background: 'var(--bg-card)', color: 'var(--text-primary)', fontWeight: 600, fontSize: 13, cursor: 'pointer', minWidth: 260 }}>
        <Filter size={14} color="var(--accent-teal)" />
        <span style={{ flex: 1, textAlign: 'left' }}>{label}</span>
        <span style={{ color: 'var(--text-muted)' }}>{open ? '▲' : '▼'}</span>
      </button>

      {open && (
        <div style={{ position: 'absolute', top: '110%', left: 0, right: 0, background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, zIndex: 100, overflow: 'hidden', boxShadow: '0 8px 32px rgba(0,0,0,0.4)', minWidth: 300 }}>
          {/* Seleccionar todas */}
          <button onClick={toggleAll}
            style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px', background: 'var(--accent-teal-dim)', border: 'none', color: 'var(--accent-teal)', fontWeight: 700, fontSize: 13, cursor: 'pointer', borderBottom: '1px solid var(--border)' }}>
            {seleccionadas.length === PRESENTACIONES.length ? <CheckSquare size={16} /> : <Square size={16} />}
            Seleccionar todas
          </button>

          {/* Por fecha */}
          {['Miérc. 01 julio', 'Juev. 02 julio'].map(fecha => (
            <div key={fecha}>
              <div style={{ padding: '8px 16px', fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 1, background: 'var(--bg-secondary)' }}>
                📅 {fecha}
              </div>
              {PRESENTACIONES.filter(p => p.fecha === fecha).map(p => {
                const checked = seleccionadas.includes(p.id)
                return (
                  <button key={p.id} onClick={() => toggle(p.id)}
                    style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '10px 16px', background: checked ? 'var(--accent-teal-dim)' : 'none', border: 'none', color: checked ? 'var(--accent-teal)' : 'var(--text-secondary)', fontSize: 13, cursor: 'pointer', textAlign: 'left', fontWeight: checked ? 600 : 400 }}>
                    {checked ? <CheckSquare size={15} /> : <Square size={15} color="var(--text-muted)" />}
                    <span style={{ flex: 1 }}>{p.label}</span>
                    <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{p.grupos.join(', ')}</span>
                  </button>
                )
              })}
            </div>
          ))}

          <button onClick={() => setOpen(false)}
            style={{ width: '100%', padding: '10px', background: 'var(--bg-secondary)', border: 'none', borderTop: '1px solid var(--border)', color: 'var(--text-secondary)', fontSize: 12, cursor: 'pointer', fontWeight: 600 }}>
            ✓ Aplicar selección
          </button>
        </div>
      )}
    </div>
  )
}

// ── Modal Análisis IA ─────────────────────────────────────────────────────────
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

  const LINES = [
    { text: `Analizando datos de ${valid.length} participantes de ${filtroLabel}...`, delay: 0 },
    { text: `Procesando variables biométricas...`, delay: 800 },
    { text: `Calculando promedios grupales...`, delay: 1600 },
    { text: `▸ Edad promedio del grupo: ${promedioEdad} años`, delay: 2400, highlight: true },
    { text: `▸ Peso promedio: ${promedioPeso} kg`, delay: 3000, highlight: true },
    { text: `▸ Altura promedio: ${promedioAltura} m`, delay: 3600, highlight: true },
    { text: `▸ IMC promedio: ${promedioIMC} — Clasificación: ${imcStatus.toUpperCase()}`, delay: 4200, highlight: true, color: imcColor },
    { text: `Evaluando perfil de salud del grupo...`, delay: 5000 },
    { text: imcStatus === 'normal' ? `✅ El grupo presenta un perfil de salud favorable. Se recomienda mantener hábitos de actividad física y alimentación balanceada.`
        : imcStatus === 'sobrepeso' ? `⚠️ El grupo presenta tendencia a sobrepeso. Se recomienda reforzar actividad física y orientación nutricional.`
        : imcStatus === 'bajo peso' ? `⚠️ El grupo presenta tendencia a bajo peso. Se recomienda revisión nutricional y seguimiento médico.`
        : `🔴 El grupo requiere atención en hábitos alimenticios. Se sugiere intervención nutricional.`,
      delay: 5800, highlight: true },
    { text: `Análisis completado por HealthXperience IA ✦`, delay: 6800, muted: true },
  ]

  useEffect(() => {
    LINES.forEach(line => setTimeout(() => setLines(prev => [...prev, line]), line.delay))
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
          {lines.length < LINES.length && <span style={{ color: 'var(--accent-teal)', animation: 'blink 1s infinite' }}>█</span>}
        </div>
        {lines.length >= LINES.length && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 10, marginTop: 16 }}>
            {[
              { label: 'Edad prom.', value: promedioEdad, unit: 'años', color: 'var(--accent-blue)' },
              { label: 'Peso prom.', value: promedioPeso, unit: 'kg', color: 'var(--accent-teal)' },
              { label: 'Altura prom.', value: promedioAltura, unit: 'm', color: 'var(--accent-purple)' },
              { label: 'IMC prom.', value: promedioIMC, unit: imcStatus, color: imcColor },
            ].map(({ label, value, unit, color }) => (
              <div key={label} style={{ background: color + '10', border: `1px solid ${color}30`, borderRadius: 10, padding: '10px 8px', textAlign: 'center' }}>
                <div style={{ fontSize: 10, color: 'var(--text-muted)', marginBottom: 4 }}>{label}</div>
                <div style={{ fontFamily: 'Space Grotesk', fontSize: 18, fontWeight: 700, color }}>{value}</div>
                <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 2 }}>{unit}</div>
              </div>
            ))}
          </div>
        )}
        <style>{`@keyframes blink{0%,100%{opacity:1}50%{opacity:0}}`}</style>
      </div>
    </div>
  )
}

// ── Modal Podium ──────────────────────────────────────────────────────────────
function PodiumModal({ top3, filtroLabel, onClose }) {
  const [stage, setStage] = useState(0)
  useEffect(() => {
    const t = [
      setTimeout(() => setStage(1), 1200),
      setTimeout(() => setStage(2), 2600),
      setTimeout(() => setStage(3), 4000),
      setTimeout(() => setStage(4), 5400),
    ]
    return () => t.forEach(clearTimeout)
  }, [])
  const [primero, segundo, tercero] = top3

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.88)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 20 }}>
      <div style={{ background: 'linear-gradient(135deg,#0d1520,#111827)', border: '1px solid var(--accent-gold)', borderRadius: 24, padding: 32, width: '100%', maxWidth: 600, boxShadow: '0 0 60px rgba(245,158,11,0.25)', position: 'relative' }}>
        <button onClick={onClose} style={{ position: 'absolute', top: 20, right: 20, background: 'none', color: 'var(--text-muted)', padding: 6 }}><X size={20} /></button>
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <div style={{ fontFamily: 'Space Grotesk', fontSize: 22, fontWeight: 700, color: 'var(--accent-gold)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
            <Trophy size={24} /> PODIUM GENERAL
          </div>
          <div style={{ color: 'var(--text-secondary)', fontSize: 13, marginTop: 4 }}>{filtroLabel}</div>
        </div>

        {stage < 4 && (
          <div style={{ textAlign: 'center', padding: '40px 0' }}>
            <div key={stage} style={{
              fontFamily: 'Space Grotesk', fontWeight: 800, fontSize: 120, lineHeight: 1,
              color: stage === 1 ? '#cd7f32' : stage === 2 ? '#c0c0c0' : stage === 3 ? 'var(--accent-gold)' : 'var(--text-muted)',
              textShadow: stage > 0 ? `0 0 40px ${stage === 1 ? '#cd7f32' : stage === 2 ? '#c0c0c0' : 'var(--accent-gold)'}80` : 'none',
              animation: 'popIn 0.5s ease'
            }}>
              {stage === 0 ? '✦' : stage === 1 ? '3' : stage === 2 ? '2' : '1'}
            </div>
            {stage > 0 && (
              <div style={{ marginTop: 16, animation: 'fadeUp 0.5s ease' }}>
                <div style={{ fontWeight: 700, fontSize: 18 }}>{stage === 1 ? tercero?.nombre : stage === 2 ? segundo?.nombre : primero?.nombre}</div>
                <div style={{ color: 'var(--text-muted)', fontSize: 12, marginTop: 4 }}>
                  {(stage === 1 ? tercero : stage === 2 ? segundo : primero)?.puntosTotal} puntos · {(stage === 1 ? tercero : stage === 2 ? segundo : primero)?.grupo}
                </div>
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
          @keyframes popIn{0%{transform:scale(0.3);opacity:0}60%{transform:scale(1.15)}100%{transform:scale(1);opacity:1}}
          @keyframes fadeUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
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
      <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'linear-gradient(135deg,#00d4a0,#8b5cf6)', display:'flex',alignItems:'center',justifyContent:'center', fontWeight:700, fontSize:22, border:`3px solid ${color}`, marginBottom:8 }}>
        {person.nombre?.[0]?.toUpperCase()}
      </div>
      <div style={{ fontWeight:700, fontSize:13, textAlign:'center', marginBottom:2 }}>{person.nombre}</div>
      <div style={{ fontSize:11, color:'var(--text-muted)', marginBottom:6 }}>{person.grupo}</div>
      <div style={{ width:'100%', height, background:`linear-gradient(180deg,${color}40,${color}15)`, border:`2px solid ${color}`, borderRadius:'8px 8px 0 0', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', animation:'growUp 0.6s ease' }}>
        <div style={{ fontFamily:'Space Grotesk', fontSize:36, fontWeight:800, color }}>{place}°</div>
        <div style={{ fontSize:11, color:'var(--text-secondary)', marginTop:4 }}>{person.puntosTotal} pts</div>
      </div>
      <style>{`@keyframes growUp{from{transform:scaleY(0);transform-origin:bottom}to{transform:scaleY(1)}}`}</style>
    </div>
  )
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function Premiaciones() {
  const [allParticipants, setAllParticipants] = useState([])
  const [seleccionadas, setSeleccionadas] = useState([]) // [] = todas
  const [loading, setLoading] = useState(true)
  const [showPodium, setShowPodium] = useState(false)
  const [showIA, setShowIA] = useState(false)

  useEffect(() => {
    getAllParticipants().then(all => { setAllParticipants(all); setLoading(false) })
  }, [])

  // Filtra por presentaciones seleccionadas
  const participantsFiltrados = seleccionadas.length === 0
    ? allParticipants
    : allParticipants.filter(p => seleccionadas.includes(p.presentacion))

  const filtroLabel = seleccionadas.length === 0
    ? 'Todos los grupos'
    : seleccionadas.length === 1
    ? PRESENTACIONES.find(p => p.id === seleccionadas[0])?.label
    : `${seleccionadas.map(s => PRESENTACIONES.find(p => p.id === s)?.label).join(', ')}`

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
          <p style={{ color: 'var(--text-secondary)' }}>
            Resultados de: <strong style={{ color: 'var(--accent-teal)' }}>{filtroLabel}</strong>
            {' · '}{participantsFiltrados.length} participantes
          </p>
        </div>
      </div>

      {/* Selector múltiple + botones */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap', alignItems: 'flex-start' }}>
        <PresentacionSelector seleccionadas={seleccionadas} onChange={setSeleccionadas} />

        <div style={{ display: 'flex', gap: 8, marginLeft: 'auto' }}>
          <button onClick={() => setShowIA(true)}
            style={{ padding: '8px 16px', borderRadius: 20, border: '1px solid var(--accent-purple)', background: 'var(--accent-purple-dim)', color: 'var(--accent-purple)', fontSize: 12, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
            <Sparkles size={14} /> Análisis IA
          </button>
          <button onClick={() => setShowPodium(true)} disabled={top3.length === 0}
            style={{ padding: '8px 18px', borderRadius: 20, border: '1px solid var(--accent-gold)', background: 'var(--accent-gold-dim)', color: 'var(--accent-gold)', fontSize: 13, fontWeight: 700,
              cursor: top3.length === 0 ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: 6, opacity: top3.length === 0 ? 0.5 : 1 }}>
            <Award size={16} /> Ver Podium 🏆
          </button>
        </div>
      </div>

      {/* Chips de presentaciones seleccionadas */}
      {seleccionadas.length > 0 && (
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 16 }}>
          {seleccionadas.map(id => {
            const p = PRESENTACIONES.find(x => x.id === id)
            return (
              <span key={id} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 10px', borderRadius: 20, background: 'var(--accent-teal-dim)', border: '1px solid var(--accent-teal)', fontSize: 12, color: 'var(--accent-teal)', fontWeight: 600 }}>
                {p?.label}
                <button onClick={() => setSeleccionadas(prev => prev.filter(s => s !== id))}
                  style={{ background: 'none', color: 'var(--accent-teal)', padding: 0, lineHeight: 1, fontSize: 14 }}>×</button>
              </span>
            )
          })}
          <button onClick={() => setSeleccionadas([])}
            style={{ padding: '4px 10px', borderRadius: 20, background: 'none', border: '1px solid var(--border)', color: 'var(--text-muted)', fontSize: 11, cursor: 'pointer' }}>
            Limpiar
          </button>
        </div>
      )}

      {/* Ranking general */}
      {!loading && ranked.length > 0 && (
        <div className="card" style={{ marginBottom: 20, borderColor: 'rgba(245,158,11,0.4)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
            <Award size={16} color="var(--accent-gold)" />
            <span style={{ fontWeight: 700, fontSize: 13, color: 'var(--accent-gold)' }}>RANKING GENERAL — Puntos acumulados</span>
          </div>
          {ranked.slice(0, 5).map((p, i) => (
            <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '8px 0', borderBottom: i < Math.min(ranked.length, 5) - 1 ? '1px solid var(--border)' : 'none' }}>
              <span style={{ width: 28, fontWeight: 700, fontSize: 16, color: i < 3 ? MEDAL_COLOR[i] : 'var(--text-muted)' }}>{i < 3 ? MEDAL[i] : `${i + 1}°`}</span>
              <div style={{ flex: 1, fontSize: 13, fontWeight: 600 }}>{p.nombre} <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>· {p.grupo}</span></div>
              <div style={{ fontFamily: 'Space Grotesk', fontWeight: 700, color: 'var(--accent-gold)', fontSize: 15 }}>{p.puntosTotal} pts</div>
            </div>
          ))}
        </div>
      )}

      {/* Categorías */}
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
                  <p style={{ color: 'var(--text-muted)', fontSize: 12 }}>Sin datos</p>
                ) : list.map((p, i) => (
                  <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: i < list.length - 1 ? '1px solid var(--border)' : 'none' }}>
                    <span style={{ fontSize: 20, width: 28, flexShrink: 0 }}>{MEDAL[i]}</span>
                    <span style={{ fontWeight: 700, color: MEDAL_COLOR[i], minWidth: 16 }}>{i + 1}°</span>
                    <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'linear-gradient(135deg,#00d4a0,#8b5cf6)', display:'flex',alignItems:'center',justifyContent:'center', fontWeight:700, fontSize:13, flexShrink:0 }}>
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
