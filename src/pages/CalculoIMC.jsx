// src/pages/CalculoIMC.jsx
import { useState, useEffect } from 'react'
import QRScanner from '../components/QRScanner'
import { getParticipant, saveIMC, getIMCTipo } from '../firebase/helpers'

function calcIMC(peso, altura) {
  const imc = peso / (altura * altura)
  const tipo = getIMCTipo(imc)
  const statusMap = { 'bajo-peso': 'Bajo peso', 'normal': 'Normal', 'sobrepeso': 'Sobrepeso', 'obesidad': 'Obesidad' }
  const colorMap = { 'bajo-peso': 'var(--accent-blue)', 'normal': 'var(--accent-teal)', 'sobrepeso': 'var(--accent-gold)', 'obesidad': 'var(--status-danger)' }
  const grasa = Math.round((1.2 * imc + 0.23 * 20 - 5.4) * 10) / 10
  const musculo = Math.round((peso - (peso * Math.max(grasa, 5) / 100)) * 10) / 10
  return { imc: Math.round(imc * 100) / 100, status: statusMap[tipo], color: colorMap[tipo], tipo, grasa: Math.max(grasa, 5), musculo }
}

function IMCRangeBar({ imc }) {
  const VISUAL_MIN = 10
  const VISUAL_MAX = 40
  const clampedIMC = Math.min(Math.max(imc, VISUAL_MIN), VISUAL_MAX)
  const pct = ((clampedIMC - VISUAL_MIN) / (VISUAL_MAX - VISUAL_MIN)) * 100

  const ranges = [
    { label: 'Bajo peso', min: 10, max: 18.5, color: '#3b82f6', desc: '< 18.5' },
    { label: 'Normal',    min: 18.5, max: 25, color: '#00d4a0', desc: '18.5–24.9' },
    { label: 'Sobrepeso', min: 25,   max: 30, color: '#f59e0b', desc: '25–29.9' },
    { label: 'Obesidad',  min: 30,   max: 40, color: '#ef4444', desc: '≥ 30' },
  ]

  const activeColor = imc < 18.5 ? '#3b82f6' : imc < 25 ? '#00d4a0' : imc < 30 ? '#f59e0b' : '#ef4444'

  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1.5, color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: 14 }}>
        📏 Escala de IMC
      </div>

      {/* Barra */}
      <div style={{ position: 'relative', marginBottom: 32, marginTop: 8 }}>
        <div style={{ display: 'flex', height: 12, borderRadius: 8, overflow: 'hidden' }}>
          {ranges.map(r => (
            <div key={r.label} style={{ flex: r.max - r.min, background: r.color, opacity: 0.75 }} />
          ))}
        </div>

        {/* Indicador */}
        <div style={{
          position: 'absolute',
          left: `${pct}%`,
          top: '50%',
          transform: 'translate(-50%, -50%)',
          width: 22, height: 22, borderRadius: '50%',
          background: '#fff',
          border: `3px solid ${activeColor}`,
          boxShadow: `0 0 12px ${activeColor}80`,
          zIndex: 2,
          transition: 'left 0.6s ease'
        }} />

        {/* Etiqueta valor */}
        <div style={{
          position: 'absolute',
          left: `${pct}%`,
          top: 20,
          transform: 'translateX(-50%)',
          background: activeColor,
          color: '#fff',
          fontSize: 11,
          fontWeight: 700,
          padding: '3px 8px',
          borderRadius: 6,
          whiteSpace: 'nowrap',
          boxShadow: `0 2px 8px ${activeColor}60`
        }}>
          IMC {imc}
        </div>
      </div>

      {/* Etiquetas */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 8 }}>
        {ranges.map(r => {
          const active = (r.label === 'Bajo peso' && imc < 18.5) ||
                         (r.label === 'Normal' && imc >= 18.5 && imc < 25) ||
                         (r.label === 'Sobrepeso' && imc >= 25 && imc < 30) ||
                         (r.label === 'Obesidad' && imc >= 30)
          return (
            <div key={r.label} style={{
              textAlign: 'center', padding: '8px 4px', borderRadius: 10,
              background: active ? r.color + '18' : 'var(--bg-secondary)',
              border: `1px solid ${active ? r.color : 'var(--border)'}`,
              transition: 'all 0.3s'
            }}>
              <div style={{ width: 10, height: 10, borderRadius: '50%', background: r.color, margin: '0 auto 6px' }} />
              <div style={{ fontSize: 11, color: active ? r.color : 'var(--text-muted)', fontWeight: active ? 700 : 400 }}>
                {r.label}
              </div>
              <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 2 }}>{r.desc}</div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function CascadeStep({ label, value, color, delay, icon, started }) {
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    if (!started) return
    const t = setTimeout(() => setVisible(true), delay)
    return () => clearTimeout(t)
  }, [delay, started])

  return (
    <div style={{
      padding: '14px 18px', background: 'var(--bg-secondary)', borderRadius: 10, marginBottom: 10,
      borderLeft: `3px solid ${color}`,
      opacity: visible ? 1 : 0, transform: visible ? 'translateX(0)' : 'translateX(-20px)',
      transition: 'all 0.4s ease', display: 'flex', alignItems: 'center', gap: 14
    }}>
      <span style={{ fontSize: 20 }}>{icon}</span>
      <div>
        <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 3, textTransform: 'uppercase', letterSpacing: 1 }}>{label}</div>
        <div style={{ fontFamily: 'Space Grotesk', color, fontWeight: 700, fontSize: 15 }}>{value}</div>
      </div>
    </div>
  )
}

function StatCard({ label, value, sub, color, visible }) {
  return (
    <div className="card" style={{
      borderColor: color + '40', background: color + '10',
      opacity: visible ? 1 : 0, transform: visible ? 'translateY(0)' : 'translateY(10px)',
      transition: 'all 0.4s ease'
    }}>
      <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 8 }}>{label}</div>
      <div className="stat-value" style={{ fontSize: 26, color }}>{value}</div>
      <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>{sub}</div>
    </div>
  )
}

export default function CalculoIMC() {
  const [participant, setParticipant] = useState(null)
  const [result, setResult] = useState(null)
  const [saved, setSaved] = useState(false)
  const [loading, setLoading] = useState(false)
  const [showCascade, setShowCascade] = useState(false)
  const [notFound, setNotFound] = useState(false)
  const [statsVisible, setStatsVisible] = useState([false, false, false])

  const handleSearch = async (id) => {
    setResult(null); setSaved(false); setShowCascade(false)
    setNotFound(false); setParticipant(null)
    setStatsVisible([false, false, false])
    setLoading(true)
    const p = await getParticipant(id)
    setLoading(false)
    if (p) {
      setParticipant(p)
      const r = calcIMC(p.peso, p.altura)
      setResult(r)
      setTimeout(() => setShowCascade(true), 300)
      setTimeout(() => setStatsVisible([true, false, false]), 2000)
      setTimeout(() => setStatsVisible([true, true, false]), 2200)
      setTimeout(() => setStatsVisible([true, true, true]), 2400)
    } else {
      setNotFound(true)
    }
  }

  const handleSave = async () => {
    setLoading(true)
    await saveIMC(participant.id, result)
    setSaved(true)
    setLoading(false)
  }

  const STEPS = result && participant ? [
    { icon: '📋', label: 'Fórmula IMC', value: 'IMC = peso ÷ altura²', color: 'var(--text-secondary)', delay: 0 },
    { icon: '⚖️', label: 'Datos del participante', value: `Peso = ${participant.peso} kg  |  Altura = ${participant.altura} m`, color: 'var(--accent-blue)', delay: 400 },
    { icon: '🔢', label: 'Altura al cuadrado', value: `${participant.altura}² = ${(participant.altura * participant.altura).toFixed(4)} m²`, color: 'var(--accent-purple)', delay: 800 },
    { icon: '➗', label: 'División', value: `${participant.peso} ÷ ${(participant.altura * participant.altura).toFixed(4)} = ${result.imc}`, color: 'var(--accent-teal)', delay: 1200 },
    { icon: '📊', label: 'Resultado IMC', value: `${result.imc} — ${result.status}`, color: result.color, delay: 1600 },
  ] : []

  const STATS = result && participant ? [
    { label: 'Índice de Masa Corporal', value: result.imc, sub: result.status, color: result.color },
    { label: 'Grasa Corporal', value: `${result.grasa}%`, sub: 'Estimada', color: 'var(--accent-gold)' },
    { label: 'Masa Muscular', value: `${result.musculo} kg`, sub: `${Math.round(result.musculo / participant.peso * 100)}% del peso`, color: 'var(--accent-teal)' },
  ] : []

  return (
    <div className="fade-in">
      <h1 style={{ fontFamily: 'Space Grotesk', fontSize: 28, fontWeight: 700, marginBottom: 6 }}>ESTACIÓN: CÁLCULO DE IMC</h1>
      <p style={{ color: 'var(--text-secondary)', marginBottom: 28 }}>Escanea el QR para visualizar el Índice de Masa Corporal</p>

      <QRScanner onFound={handleSearch} />

      {loading && <div style={{ textAlign: 'center', padding: 40 }}><span className="spinner" /></div>}
      {notFound && <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>No se encontró participante con ese código QR</div>}

      {participant && result && (
        <div className="fade-in">
          {/* Participant */}
          <div className="card" style={{ marginBottom: 16, display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: 'linear-gradient(135deg,#00d4a0,#8b5cf6)', display:'flex',alignItems:'center',justifyContent:'center', fontSize: 18, fontWeight: 700 }}>
              {participant.nombre?.[0]?.toUpperCase()}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, fontSize: 16 }}>{participant.nombre}</div>
              <div style={{ color: 'var(--text-muted)', fontSize: 12 }}>{participant.peso} kg · {participant.altura} m · {participant.grupo}</div>
            </div>
            <div className="stat-value" style={{ fontSize: 28, color: result.color }}>{result.imc}</div>
          </div>

          {/* Cascada */}
          <div className="card" style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: 1.5, color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: 16 }}>
              📐 Análisis Corporal
            </div>
            {STEPS.map((step, i) => (
              <CascadeStep key={i} {...step} started={showCascade} />
            ))}
          </div>

          {/* Barra de rangos IMC */}
          <div className="card" style={{ marginBottom: 16 }}>
            <IMCRangeBar imc={result.imc} />
          </div>

          {/* Stats */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12, marginBottom: 16 }}>
            {STATS.map((stat, i) => (
              <StatCard key={i} {...stat} visible={statsVisible[i]} />
            ))}
          </div>

          {!saved ? (
            <button onClick={handleSave} className="btn-primary" disabled={loading}
              style={{ width: '100%', padding: 14, fontSize: 15, borderRadius: 10 }}>
              {loading ? <span className="spinner" style={{ width: 18, height: 18 }} /> : '💾 Guardar IMC en el carnet'}
            </button>
          ) : (
            <div style={{ textAlign: 'center', padding: 16, background: 'var(--accent-teal-dim)', borderRadius: 10, color: 'var(--accent-teal)', fontWeight: 600 }}>
              ✅ IMC guardado exitosamente
            </div>
          )}
        </div>
      )}
    </div>
  )
}
