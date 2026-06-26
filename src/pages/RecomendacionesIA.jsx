// src/pages/RecomendacionesIA.jsx
import { useState } from 'react'
import QRScanner from '../components/QRScanner'
import { getParticipant, saveRecomendaciones } from '../firebase/helpers'
import { Sparkles } from 'lucide-react'

const GEMINI_API_KEY = 'AQ.Ab8RN6LH-pjj99MuXxy5gY6Diu0WCdvr_S7gnJ96KscDrYbypw' // ⚠️ reemplaza con tu clave de Gemini

async function generateWithGemini(prompt) {
  const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.8, maxOutputTokens: 2048 }
    })
  })
  const data = await res.json()
  return data.candidates?.[0]?.content?.parts?.[0]?.text || 'Sin respuesta'
}

function buildPrompt(p) {
  return `Eres un experto en nutrición y salud para adolescentes mexicanos. El participante se llama ${p.nombre}, tiene ${p.edad} años, sexo ${p.sexo}, pesa ${p.peso} kg, mide ${p.altura} m, IMC de ${p.imc || 'no calculado'} (${p.imcStatus || 'Normal'}).

Sus marcas deportivas: Salto de cuerda ${p.pruebas?.saltoCuerda || 0} reps en 15s, Lanzamiento ${p.pruebas?.lanzamiento || 0} metros, Carrera 45m en ${p.pruebas?.carrera || 0} segundos.

Genera recomendaciones completas en español con estas secciones EXACTAS (usa estos títulos exactamente):

## JARRA DEL BUEN BEBER
Recomendaciones personalizadas sobre hidratación según los niveles de la Jarra del Buen Beber mexicana.

## PLATO DEL BUEN COMER  
Recomendaciones del Plato del Buen Comer NOM-043 adaptadas a sus datos: frutas/verduras, cereales, proteínas, grasas.

## DIETA SEMANAL
Una dieta completa de 7 días (Lunes a Domingo) con Desayuno, Almuerzo, Comida, Merienda y Cena para cada día.

## RECOMENDACIONES GENERALES
Consejos sobre sueño, actividad física, hábitos saludables y mejora de sus marcas deportivas.

Sé específico, motivador y adapta todo a la edad y resultados del participante. Usa formato markdown con negritas.`
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
    setLoading(true); setText('')
    const result = await generateWithGemini(buildPrompt(participant))
    setText(result)
    setLoading(false)
  }

  const handleSave = async () => {
    await saveRecomendaciones(participant.id, text)
    setSaved(true)
  }

  const renderText = (t) => {
    return t.split('\n').map((line, i) => {
      if (line.startsWith('## ')) return <h3 key={i} style={{ color: 'var(--accent-teal)', fontFamily: 'Space Grotesk', fontSize: 14, fontWeight: 700, marginTop: 20, marginBottom: 10, display: 'flex', alignItems: 'center', gap: 8 }}>
        {line.includes('JARRA') ? '💧' : line.includes('PLATO') ? '🥗' : line.includes('DIETA') ? '📅' : '✨'}
        {line.replace('## ', '')}
      </h3>
      if (line.startsWith('**') && line.endsWith('**')) return <p key={i} style={{ fontWeight: 700, marginBottom: 4, color: 'var(--text-primary)' }}>{line.replace(/\*\*/g, '')}</p>
      const parts = line.split(/\*\*(.*?)\*\*/g)
      if (parts.length > 1) return <p key={i} style={{ marginBottom: 6, color: 'var(--text-secondary)', lineHeight: 1.7 }}>
        {parts.map((p, j) => j % 2 === 1 ? <strong key={j} style={{ color: 'var(--text-primary)' }}>{p}</strong> : p)}
      </p>
      if (!line.trim()) return <div key={i} style={{ height: 6 }} />
      return <p key={i} style={{ marginBottom: 6, color: 'var(--text-secondary)', lineHeight: 1.7 }}>{line}</p>
    })
  }

  return (
    <div className="fade-in">
      <h1 style={{ fontFamily: 'Space Grotesk', fontSize: 28, fontWeight: 700, marginBottom: 6 }}>ESTACIÓN: RECOMENDACIONES IA</h1>
      <p style={{ color: 'var(--text-secondary)', marginBottom: 28 }}>Genera y guarda recomendaciones personalizadas en el carnet del usuario</p>

      <QRScanner onFound={handleSearch} />

      {participant && (
        <div className="fade-in">
          <div className="card" style={{ marginBottom: 16, display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: 'linear-gradient(135deg,#00d4a0,#8b5cf6)', display:'flex',alignItems:'center',justifyContent:'center', fontSize: 18, fontWeight: 700 }}>
              {participant.nombre?.[0]?.toUpperCase()}
            </div>
            <div>
              <div style={{ fontWeight: 700 }}>{participant.nombre}</div>
              <div style={{ color: 'var(--text-muted)', fontSize: 12 }}>{participant.grupo} · IMC: {participant.imc || '—'}</div>
            </div>
          </div>

          {!text && (
            <button onClick={handleGenerate} disabled={loading}
              style={{ width: '100%', padding: 16, fontSize: 15, fontWeight: 700, borderRadius: 12, background: 'linear-gradient(90deg,#8b5cf6,#ec4899)', color: '#fff', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
              {loading ? <><span className="spinner" style={{ width: 18, height: 18 }} /> Generando con IA...</> : <><Sparkles size={18} /> Generar recomendaciones con IA</>}
            </button>
          )}

          {text && (
            <>
              <div className="card" style={{ marginBottom: 16, borderColor: 'var(--accent-purple)', lineHeight: 1.8 }}>
                {renderText(text)}
              </div>

              <div style={{ display: 'flex', gap: 10 }}>
                <button onClick={handleGenerate} className="btn-secondary" style={{ flex: 1 }}>↺ Regenerar</button>
                {!saved ? (
                  <button onClick={handleSave} className="btn-primary" style={{ flex: 2, padding: 14 }}>
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
