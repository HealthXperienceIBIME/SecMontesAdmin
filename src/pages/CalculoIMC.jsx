// src/pages/CalculoIMC.jsx
import { useState } from 'react'
import QRScanner from '../components/QRScanner'
import { getParticipant, saveIMC } from '../firebase/helpers'

function calcIMC(peso, altura) {
  const imc = peso / (altura * altura)
  const status = imc < 18.5 ? 'Bajo peso' : imc < 25 ? 'Normal' : imc < 30 ? 'Sobrepeso' : 'Obesidad'
  const color = imc < 18.5 ? 'var(--accent-blue)' : imc < 25 ? 'var(--accent-teal)' : imc < 30 ? 'var(--accent-gold)' : 'var(--status-danger)'
  // Simplified Deurenberg formula
  const grasa = imc < 18 ? 8 : Math.round((1.2 * imc + 0.23 * 20 - 5.4) * 10) / 10
  const musculo = Math.round((peso - (peso * grasa / 100)) * 10) / 10
  return { imc: Math.round(imc * 100) / 100, status, color, grasa, musculo }
}

export default function CalculoIMC() {
  const [participant, setParticipant] = useState(null)
  const [result, setResult] = useState(null)
  const [saved, setSaved] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSearch = async (id) => {
    setResult(null); setSaved(false)
    const p = await getParticipant(id)
    setParticipant(p || null)
    if (p) {
      const r = calcIMC(p.peso, p.altura)
      setResult(r)
    }
  }

  const handleSave = async () => {
    setLoading(true)
    await saveIMC(participant.id, result)
    setSaved(true)
    setLoading(false)
  }

  const StatBox = ({ label, value, unit, color }) => (
    <div className="card" style={{ borderColor: color + '40', background: color + '10' }}>
      <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 8 }}>{label}</div>
      <div className="stat-value" style={{ fontSize: 28, color }}>{value}</div>
      {unit && <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>{unit}</div>}
    </div>
  )

  return (
    <div className="fade-in">
      <h1 style={{ fontFamily: 'Space Grotesk', fontSize: 28, fontWeight: 700, marginBottom: 6 }}>ESTACIÓN: CÁLCULO DE IMC</h1>
      <p style={{ color: 'var(--text-secondary)', marginBottom: 28 }}>Escanea el QR para visualizar el cálculo del Índice de Masa Corporal</p>

      <QRScanner onFound={handleSearch} />

      {participant && (
        <div className="fade-in">
          {/* Participant card */}
          <div className="card" style={{ marginBottom: 16, display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: 'linear-gradient(135deg,#00d4a0,#8b5cf6)', display:'flex',alignItems:'center',justifyContent:'center', fontSize: 18, fontWeight: 700 }}>
              {participant.nombre?.[0]?.toUpperCase()}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, fontSize: 16 }}>{participant.nombre}</div>
              <div style={{ color: 'var(--text-muted)', fontSize: 12 }}>{participant.peso} kg · {participant.altura} m · {participant.grupo}</div>
            </div>
            {result && <div className="stat-value" style={{ fontSize: 24, color: result.color }}>{result.imc}</div>}
          </div>

          {result && (
            <>
              {/* Fórmula steps */}
              <div className="card" style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: 1.5, color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: 16 }}>Análisis Corporal</div>
                {[
                  ['Fórmula IMC', 'IMC = peso / altura²'],
                  ['Datos', `Peso = ${participant.peso} kg  |  Altura = ${participant.altura} m`],
                  ['Cálculo', `${participant.peso} / ${(participant.altura * participant.altura).toFixed(4)} = ${result.imc}`],
                ].map(([lbl, val], i) => (
                  <div key={lbl} style={{ padding: '12px 16px', background: 'var(--bg-secondary)', borderRadius: 8, marginBottom: 8, display: 'flex', gap: 16 }}>
                    {i > 0 && <span style={{ color: 'var(--accent-teal)', fontSize: 16 }}>→</span>}
                    <div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>{lbl}</div>
                      <div style={{ fontFamily: 'Space Grotesk', color: 'var(--text-primary)' }}>{val}</div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Stats */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12, marginBottom: 16 }}>
                <StatBox label="Índice de Masa Corporal" value={result.imc} unit={result.status} color={result.color} />
                <StatBox label="Grasa Corporal" value={`${result.grasa}%`} unit="Estimada" color="var(--accent-gold)" />
                <StatBox label="Masa Muscular" value={`${result.musculo} kg`} unit={`${Math.round(result.musculo / participant.peso * 100)}% del peso`} color="var(--accent-teal)" />
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
            </>
          )}
        </div>
      )}

      {participant === null && <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>
        No se encontró participante con ese código QR
      </div>}
    </div>
  )
}
