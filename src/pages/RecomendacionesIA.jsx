// src/pages/RecomendacionesIA.jsx
import { useState } from 'react'
import QRScanner from '../components/QRScanner'
import { getParticipant, saveRecomendaciones } from '../firebase/helpers'
import { Sparkles } from 'lucide-react'

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY

async function generateRecommendationsStream(prompt, onChunk) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:streamGenerateContent?key=${GEMINI_API_KEY}`
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.7, maxOutputTokens: 2048 }
      })
    })
    if (!res.ok) {
      const err = await res.json()
      onChunk(`Error en la IA: ${err.error?.message || 'No se pudo conectar'}`)
      return
    }
    const reader = res.body.getReader()
    const decoder = new TextDecoder('utf-8')
    let buffer = ''
    let textAcumulado = ''
    while (true) {
      const { value, done } = await reader.read()
      if (done) break
      buffer += decoder.decode(value, { stream: true })
      try {
        const regex = /"text":\s*"((?:[^"\\]|\\.)*)"/g
        let match
        let nuevoTexto = ''
        while ((match = regex.exec(buffer)) !== null) {
          try { nuevoTexto += JSON.parse(`"${match[1]}"`) }
          catch { nuevoTexto += match[1] }
        }
        if (nuevoTexto) {
          textAcumulado += nuevoTexto
          onChunk(textAcumulado)
          buffer = buffer.substring(buffer.lastIndexOf('}') + 1)
        }
      } catch (e) {}
    }
  } catch (e) {
    onChunk('Error de red al conectar con la IA.')
  }
}

function buildPrompt(p) {
  const tienePruebas = p.pruebas && !p.pruebasOmitidas
  return `Eres un experto en nutrición y salud para adolescentes y adultos mexicanos.

Datos del participante:
- Nombre: ${p.nombre}
- Edad: ${p.edad} años
- Sexo: ${p.sexo}
- Peso: ${p.peso} kg
- Altura: ${p.altura} m
- IMC: ${p.imc || 'no calculado'} (${p.imcStatus || 'Normal'})
${tienePruebas ? `- Salto de cuerda: ${p.pruebas.saltoCuerda} reps en 15s
- Lanzamiento: ${p.pruebas.lanzamiento} metros
- Carrera 45m: ${p.pruebas.carrera} segundos
- Velocidad: ${p.pruebas.velocidad} m/s
- Fuerza: ${p.pruebas.fuerza} N` : '- No realizó pruebas físicas'}

Genera recomendaciones usando EXACTAMENTE estos títulos (sin asteriscos ni símbolos adicionales en los títulos):

## JARRA DEL BUEN BEBER
Recomendaciones de hidratación según la Jarra del Buen Beber NOM-043 mexicana.

## PLATO DEL BUEN COMER
Recomendaciones del Plato del Buen Comer NOM-043 para frutas/verduras, cereales, proteínas y grasas.

## DIETA SEMANAL
Plan de 7 días (Lunes a Domingo) con Desayuno, Colación, Comida, Merienda y Cena. Sé conciso.

## RECOMENDACIONES GENERALES
Consejos de sueño, actividad física y hábitos saludables${tienePruebas ? ' y mejora de marcas deportivas' : ''}.

IMPORTANTE: Adapta todo al IMC de ${p.imcStatus || 'Normal'}. Usa **negritas** para puntos clave. Los títulos deben ser EXACTAMENTE como los escribí, sin modificaciones.`
}

const SECTION_KEYS = ['JARRA DEL BUEN BEBER', 'PLATO DEL BUEN COMER', 'DIETA SEMANAL', 'RECOMENDACIONES GENERALES']
const SECTION_META = {
  'JARRA DEL BUEN BEBER':      { icon: '💧', color: '#3b82f6', bg: 'rgba(59,130,246,0.05)',  title: 'Jarra del Buen Beber' },
  'PLATO DEL BUEN COMER':      { icon: '🥗', color: '#00d4a0', bg: 'rgba(0,212,160,0.05)',   title: 'Plato del Buen Comer' },
  'DIETA SEMANAL':             { icon: '📅', color: '#8b5cf6', bg: 'rgba(139,92,246,0.05)',  title: 'Dieta Semanal' },
  'RECOMENDACIONES GENERALES': { icon: '✨', color: '#f59e0b', bg: 'rgba(245,158,11,0.05)', title: 'Recomendaciones Generales' },
}

// Parse en tiempo real — funciona con texto parcial
function parseRecomendaciones(text) {
  const result = {}
  SECTION_KEYS.forEach(k => { result[k] = '' })

  let current = null
  const lines = text.split('\n')
  lines.forEach(line => {
    const trimmed = line.replace(/^##\s*/, '').trim()
    if (SECTION_KEYS.includes(trimmed)) {
      current = trimmed
    } else if (current) {
      result[current] += line + '\n'
    }
  })
  return result
}

function RenderLines({ content }) {
  const lines = content.split('\n').filter(l => l.trim())
  if (lines.length === 0) return <p style={{ color: 'var(--text-muted)', fontSize: 13, fontStyle: 'italic' }}>Escribiendo...</p>
  return (
    <>
      {lines.map((line, i) => {
        const parts = line.split(/\*\*(.*?)\*\*/g)
        return (
          <p key={i} style={{ marginBottom: 6, color: 'var(--text-secondary)', lineHeight: 1.7, fontSize: 13 }}>
            {parts.map((p, j) => j % 2 === 1
              ? <strong key={j} style={{ color: 'var(--text-primary)' }}>{p}</strong>
              : p
            )}
          </p>
        )
      })}
    </>
  )
}

export default function RecomendacionesIA() {
  const [participant, setParticipant] = useState(null)
  const [text, setText] = useState('')
  const [loading, setLoading] = useState(false)
  const [saved, setSaved] = useState(false)

  const handleSearch = async (id) => {
    setText(''); setSaved(false)
    const p = await getParticipant(id)
    setParticipant(p || null)
  }

  const handleGenerate = async () => {
    if (!participant) return
    setLoading(true)
    setText('')
    await generateRecommendationsStream(buildPrompt(participant), (textAcumulado) => {
      setText(textAcumulado)
      if (loading) setLoading(false)
    })
    setLoading(false)
  }

  const handleSave = async () => {
    await saveRecomendaciones(participant.id, text)
    setSaved(true)
  }

  const parsed = text ? parseRecomendaciones(text) : null
  const hasAnyContent = parsed && SECTION_KEYS.some(k => parsed[k].trim().length > 0)

  return (
    <div className="fade-in">
      <h1 style={{ fontFamily: 'Space Grotesk', fontSize: 28, fontWeight: 700, marginBottom: 6 }}>ESTACIÓN: RECOMENDACIONES IA</h1>
      <p style={{ color: 'var(--text-secondary)', marginBottom: 28 }}>Genera y guarda recomendaciones personalizadas en el carnet del usuario</p>

      <QRScanner onFound={handleSearch} />

      {participant && (
        <div className="fade-in">
          {/* Participant card */}
          <div className="card" style={{ marginBottom: 16, display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: 'linear-gradient(135deg,#00d4a0,#8b5cf6)', display:'flex',alignItems:'center',justifyContent:'center', fontSize: 18, fontWeight: 700 }}>
              {participant.nombre?.[0]?.toUpperCase()}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700 }}>{participant.nombre}</div>
              <div style={{ color: 'var(--text-muted)', fontSize: 12 }}>{participant.grupo} · IMC: {participant.imc || '—'} · {participant.imcStatus || ''}</div>
              {participant.pruebasOmitidas && (
                <div style={{ fontSize: 11, color: 'var(--accent-gold)', marginTop: 2 }}>⏭️ Pruebas omitidas — IA usará solo datos de IMC</div>
              )}
            </div>
          </div>

          {/* Botón generar */}
          {!text && loading && (
            <div style={{ width: '100%', padding: 16, borderRadius: 12, background: 'var(--bg-secondary)', border: '1px solid var(--border)', textAlign: 'center', fontSize: 14, color: 'var(--text-secondary)' }}>
              <span className="spinner" style={{ width: 14, height: 14, marginRight: 8, verticalAlign: 'middle' }} /> Conectando con Gemini...
            </div>
          )}

          {!text && !loading && (
            <button onClick={handleGenerate}
              style={{ width: '100%', padding: 16, fontSize: 15, fontWeight: 700, borderRadius: 12, background: 'linear-gradient(90deg,#8b5cf6,#ec4899)', color: '#fff', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
              <Sparkles size={18} /> Generar recomendaciones con IA
            </button>
          )}

          {/* Secciones en tiempo real */}
          {hasAnyContent && (
            <>
              {SECTION_KEYS.map(key => {
                const { icon, color, bg, title } = SECTION_META[key]
                const content = parsed[key] || ''
                return (
                  <div key={key} style={{ marginBottom: 16, background: bg, border: `1px solid ${color}30`, borderRadius: 14, padding: 18 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
                      <div style={{ width: 36, height: 36, borderRadius: 10, background: color + '20', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>
                        {icon}
                      </div>
                      <h3 style={{ fontFamily: 'Space Grotesk', fontSize: 14, fontWeight: 700, color, margin: 0 }}>{title}</h3>
                      {loading && content.length === 0 && (
                        <span style={{ fontSize: 11, color: 'var(--text-muted)', fontStyle: 'italic' }}>esperando...</span>
                      )}
                    </div>
                    <RenderLines content={content} />
                  </div>
                )
              })}

              <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
                <button onClick={handleGenerate} className="btn-secondary" style={{ flex: 1 }} disabled={loading}>
                  ↺ Regenerar
                </button>
                {!saved ? (
                  <button onClick={handleSave} className="btn-primary" style={{ flex: 2, padding: 14 }} disabled={loading}>
                    💾 Guardar en el carnet
                  </button>
                ) : (
                  <div style={{ flex: 2, padding: 14, background: 'var(--accent-teal-dim)', borderRadius: 8, color: 'var(--accent-teal)', fontWeight: 600, textAlign: 'center' }}>
                    ✅ Guardado en el carnet
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  )
}
