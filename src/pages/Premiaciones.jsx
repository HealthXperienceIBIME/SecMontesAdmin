// src/pages/Premiaciones.jsx
import { useEffect, useState } from 'react'
import { getPremiaciones, getAllParticipants, PRESENTACIONES } from '../firebase/helpers'
import { Trophy, Filter, Sparkles, X } from 'lucide-react'

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

// Panel de análisis IA simulado
function IAAnalysisPanel({ participants, filtroLabel, onClose }) {
  const [step, setStep] = useState(0)
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
      setTimeout(() => {
        setLines(prev => [...prev, line])
        setStep(i)
      }, line.delay)
    })
  }, [])

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 20
    }}>
      <div style={{
        background: 'var(--bg-card)', border: '1px solid var(--accent-purple)',
        borderRadius: 20, padding: 28, width: '100%', maxWidth: 520,
        boxShadow: '0 0 40px rgba(139,92,246,0.3)'
      }}>
        {/* Header */}
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
          <button onClick={onClose} style={{ background: 'none', color: 'var(--text-muted)', padding: 6, borderRadius: 6 }}>
            <X size={18} />
          </button>
        </div>

        {/* Terminal-style output */}
        <div style={{
          background: '#050a10', borderRadius: 12, padding: 20, minHeight: 280,
          fontFamily: 'monospace', fontSize: 13, lineHeight: 1.8,
          border: '1px solid var(--border)'
        }}>
          {lines.map((line, i) => (
            <div key={i} style={{
              color: line.color || (line.highlight ? 'var(--accent-teal)' : line.muted ? 'var(--text-muted)' : 'var(--text-secondary)'),
              fontWeight: line.highlight ? 700 : 400,
              marginBottom: 2,
              animation: 'fadeIn 0.3s ease'
            }}>
              {line.text}
            </div>
          ))}
          {lines.length < ANALYSIS_LINES.length && (
            <span style={{ color: 'var(--accent-teal)', animation: 'blink 1s infinite' }}>█</span>
          )}
        </div>

        {/* Stats grid — aparece cuando termina */}
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

        <style>{`
          @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0} }
          @keyframes fadeIn { from{opacity:0;transform:translateY(4px)} to{opacity:1;transform:translateY(0)} }
        `}</style>
      </div>
    </div>
  )
}

export default function Premiaciones() {
  const [data, setData] = useState(null)
  const [allParticipants, setAllParticipants] = useState([])
  const [filtro, setFiltro] = useState('todas')
  const [loading, setLoading] = useState(true)
  const [showIA, setShowIA] = useState(false)

  useEffect(() => {
    setLoading(true)
    Promise.all([getPremiaciones(filtro), getAllParticipants()]).then(([prem, all]) => {
      setData(prem)
      setAllParticipants(all)
      setLoading(false)
    })
  }, [filtro])

  const filtroLabel = filtro === 'todas'
    ? 'Todos los grupos'
    : PRESENTACIONES.find(p => p.id === filtro)?.label || filtro

  // Filtra participantes según presentación seleccionada
  const participantsFiltrados = filtro === 'todas'
    ? allParticipants
    : allParticipants.filter(p => p.presentacion === filtro)

  return (
    <div className="fade-in">
      {showIA && (
        <IAAnalysisPanel
          participants={participantsFiltrados}
          filtroLabel={filtroLabel}
          onClose={() => setShowIA(false)}
        />
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

      {/* Filtros rápidos */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap', alignItems: 'center' }}>
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

        {/* Botón IA */}
        <button onClick={() => setShowIA(true)}
          style={{ marginLeft: 'auto', padding: '8px 18px', borderRadius: 20, border: '1px solid var(--accent-purple)',
            background: 'var(--accent-purple-dim)', color: 'var(--accent-purple)', fontSize: 12, fontWeight: 700,
            cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
          <Sparkles size={14} /> Análisis IA del grupo
        </button>
      </div>

      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          {[0,1,2,3,4,5].map(i => <div key={i} className="card shimmer" style={{ height: 180 }} />)}
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          {CATEGORIAS.map(({ key, label, unit, color }) => {
            const list = data[key] || []
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
