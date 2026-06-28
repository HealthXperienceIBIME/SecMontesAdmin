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
  return {
    imc: Math.round(imc * 100) / 100,
    status: statusMap[tipo],
    color: colorMap[tipo],
    tipo,
    grasa: Math.max(grasa, 5),
    musculo
  }
}

// Componente de cascada animada
function CascadeStep({ label, value, color, delay, icon }) {
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), delay)
    return () => clearTimeout(t)
  }, [delay])

  return (
    <div style={{
      padding: '14px 18px',
      background: 'var(--bg-secondary)',
      borderRadius: 10,
      marginBottom: 10,
      borderLeft: `3px solid ${color}`,
      opacity: visible ? 1 : 0,
      transform: visible ? 'translateX(0)' : 'translateX(-20px)',
      transition: 'all 0.4s ease',
      display: 'flex',
      alignItems: 'center',
      gap: 14
    }}>
      <span style={{ fontSize: 20 }}>{icon}</span>
      <div>
        <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 3, textTransform: 'uppercase', letterSpacing: 1 }}>{label}</div>
        <div style={{ fontFamily: 'Space Grotesk', color, fontWeight: 700, fontSize: 15 }}>{value}</div>
      </div>
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

  const handleSearch = async (id) => {
    setResult(null); setSaved(false); setShowCascade(false); setNotFound(false)
    setParticipant(null)
    const p = await getParticipant(id)
    if (p) {
      setParticipant(p)
      const r = calcIMC(p.peso, p.altura)
      setResult(r)
      setTimeout(() => setShowCascade(true), 300)
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

  return (
    <div className="fade-in">
      <h1 style={{ fontFamily: 'Space Grotesk', fontSize: 28, fontWeight: 700, marginBottom: 6 }}>ESTACIÓN: CÁLCULO DE IMC</h1>
      <p style={{ color: 'var(--text-secondary)', marginBottom: 28 }}>Escanea el QR para visualizar el Índice de Masa Corporal</p>

      <QRScanner onFound={handleSearch} />

      {notFound && (
        <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>
          No se encontró participante con ese código QR
        </div>
      )}

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

          {/* Cascada de fórmulas */}
          {showCascade && (
            <div className="card" style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: 1.5, color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: 16 }}>
                📐 Análisis Corporal
              </div>

              <CascadeStep delay={0} icon="📋" label="Fórmula IMC" value="IMC = peso ÷ altura²" color="var(--text-secondary)" />
              <CascadeStep delay={400} icon="⚖️" label="Datos del participante" value={`Peso = ${participant.peso} kg  |  Altura = ${participant.altura} m`} color="var(--accent-blue)" />
              <CascadeStep delay={800} icon="🔢" label="Altura al cuadrado" value={`${participant.altura}² = ${(participant.altura * participant.altura).toFixed(4)} m²`} color="var(--accent-purple)" />
              <CascadeStep delay={1200} icon="➗" label="División" value={`${participant.peso} ÷ ${(participant.altura * participant.altura).toFixed(4)} = ${result.imc}`} color="var(--accent-teal)" />
              <CascadeStep delay={1600} icon="📊" label="Resultado IMC" value={`${result.imc} — ${result.status}`} color={result.color} />
            </div>
          )}

          {/* Stats cards */}
          {showCascade && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12, marginBottom: 16 }}>
              {[
                { label: 'Índice de Masa Corporal', value: result.imc, sub: result.status, color: result.color, delay: 2000 },
                { label: 'Grasa Corporal', value: `${result.grasa}%`, sub: 'Estimada', color: 'var(--accent-gold)', delay: 2200 },
                { label: 'Masa Muscular', value: `${result.musculo} kg`, sub: `${Math.round(result.musculo / participant.peso * 100)}% del peso`, color: 'var(--accent-teal)', delay: 2400 },
              ].map(({ label, value, sub, color, delay }) => {
                const [vis, setVis] = useState(false)
                useEffect(() => { const t = setTimeout(() => setVis(true), delay); return () => clearTimeout(t) }, [])
                return (
                  <div key={label} className="card" style={{
                    borderColor: color + '40', background: color + '10',
                    opacity: vis ? 1 : 0, transform: vis ? 'translateY(0)' : 'translateY(10px)',
                    transition: 'all 0.4s ease'
                  }}>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 8 }}>{label}</div>
                    <div className="stat-value" style={{ fontSize: 26, color }}>{value}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>{sub}</div>
                  </div>
                )
              })}
            </div>
          )}

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
