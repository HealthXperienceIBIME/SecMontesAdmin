// src/pages/PruebasCalculos.jsx
import { useState, useRef, useCallback } from 'react'
import QRScanner from '../components/QRScanner'
import { getParticipant, savePruebas } from '../firebase/helpers'

function useStopwatch() {
  const [time, setTime] = useState(0)
  const [running, setRunning] = useState(false)
  const ref = useRef(null)
  const startTime = useRef(0)

  const start = () => {
    if (running) return
    startTime.current = Date.now() - time * 1000
    ref.current = setInterval(() => setTime((Date.now() - startTime.current) / 1000), 50)
    setRunning(true)
  }
  const stop = () => { clearInterval(ref.current); setRunning(false) }
  const reset = () => { clearInterval(ref.current); setRunning(false); setTime(0) }
  return { time, running, start, stop, reset }
}

function useCountdown(initial = 15) {
  const [time, setTime] = useState(initial)
  const [running, setRunning] = useState(false)
  const [done, setDone] = useState(false)
  const [count, setCount] = useState(0)
  const ref = useRef(null)

  const start = () => {
    if (running) return
    setTime(initial); setDone(false)
    const end = Date.now() + initial * 1000
    ref.current = setInterval(() => {
      const rem = Math.max(0, (end - Date.now()) / 1000)
      setTime(rem)
      if (rem <= 0) { clearInterval(ref.current); setRunning(false); setDone(true) }
    }, 50)
    setRunning(true)
  }
  const pause = () => { clearInterval(ref.current); setRunning(false) }
  const reset = () => { clearInterval(ref.current); setRunning(false); setTime(initial); setDone(false); setCount(0) }

  return { time, running, done, count, setCount, start, pause, reset }
}

export default function PruebasCalculos() {
  const [participant, setParticipant] = useState(null)
  const [lanzamiento, setLanzamiento] = useState('')
  const [saved, setSaved] = useState(false)
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState(null)

  const salto = useCountdown(15)
  const carrera = useStopwatch()

  const handleSearch = async (id) => {
    setSaved(false); setResults(null); setLanzamiento('')
    salto.reset(); carrera.reset()
    const p = await getParticipant(id)
    setParticipant(p || null)
  }

  const computeResults = () => {
    if (!participant) return null
    const peso = participant.peso
    const carreraT = parseFloat(carrera.time.toFixed(2))
    const v = carreraT > 0 ? 45 / carreraT : 0
    const a = carreraT > 0 ? v / carreraT : 0
    const f = peso * a
    const potLanz = parseFloat(lanzamiento) ? parseFloat(lanzamiento) * 8.3 : 0

    return {
      saltoCuerda: salto.count,
      ritmo: salto.count * 4,
      saltoNivel: salto.count < 10 ? 'Bajo' : salto.count < 20 ? 'Medio' : 'Alto',
      lanzamiento: parseFloat(lanzamiento) || 0,
      potLanz: Math.round(potLanz * 10) / 10,
      lanzNivel: (parseFloat(lanzamiento) || 0) < 5 ? 'Bajo' : (parseFloat(lanzamiento) || 0) < 10 ? 'Medio' : 'Alto',
      carrera: carreraT,
      velocidad: Math.round(v * 100) / 100,
      aceleracion: Math.round(a * 100) / 100,
      fuerza: Math.round(f * 100) / 100,
      carreraNivel: carreraT > 15 ? 'Bajo' : carreraT > 10 ? 'Medio' : 'Alto',
    }
  }

  const handleSave = async () => {
    const r = computeResults()
    if (!r) return
    setResults(r)
    setLoading(true)
    await savePruebas(participant.id, r)
    setSaved(true)
    setLoading(false)
  }

  const LEVEL_COLOR = (l) => l === 'Bajo' ? 'var(--status-danger)' : l === 'Medio' ? 'var(--accent-gold)' : 'var(--accent-teal)'

  return (
    <div className="fade-in">
      <h1 style={{ fontFamily: 'Space Grotesk', fontSize: 28, fontWeight: 700, marginBottom: 6 }}>ESTACIÓN: PRUEBAS Y CÁLCULOS</h1>
      <p style={{ color: 'var(--text-secondary)', marginBottom: 28 }}>Escanea el QR y registra las marcas deportivas</p>

      <QRScanner onFound={handleSearch} />

      {participant && !saved && (
        <div className="fade-in">
          {/* Participant */}
          <div className="card" style={{ marginBottom: 16, display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: 'linear-gradient(135deg,#00d4a0,#8b5cf6)', display:'flex',alignItems:'center',justifyContent:'center', fontSize: 18, fontWeight: 700 }}>
              {participant.nombre?.[0]?.toUpperCase()}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700 }}>{participant.nombre}</div>
              <div style={{ color: 'var(--text-muted)', fontSize: 12 }}>{participant.edad} años · {participant.sexo} · {participant.peso} kg · {participant.altura} m</div>
            </div>
            {participant.imc && <div className="stat-value" style={{ color: 'var(--accent-teal)', fontSize: 20 }}>IMC {participant.imc}</div>}
          </div>

          {/* 1. Salto de cuerda */}
          <div className="card" style={{ marginBottom: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ width: 24, height: 24, borderRadius: '50%', background: 'var(--accent-teal)', color: '#080d14', fontWeight: 700, display:'flex',alignItems:'center',justifyContent:'center', fontSize: 12 }}>1</span>
                <span style={{ fontWeight: 700 }}>SALTO DE CUERDA</span>
              </div>
              <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>15 segundos</span>
            </div>

            {/* Circular timer */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
              <div style={{ position: 'relative', width: 120, height: 120 }}>
                <svg width="120" height="120" style={{ transform: 'rotate(-90deg)' }}>
                  <circle cx="60" cy="60" r="52" fill="none" stroke="var(--border)" strokeWidth="8"/>
                  <circle cx="60" cy="60" r="52" fill="none"
                    stroke={salto.done ? 'var(--accent-gold)' : 'var(--accent-teal)'}
                    strokeWidth="8"
                    strokeDasharray={`${2 * Math.PI * 52}`}
                    strokeDashoffset={`${2 * Math.PI * 52 * (1 - salto.time / 15)}`}
                    strokeLinecap="round"
                    style={{ transition: 'stroke-dashoffset 0.05s' }}
                  />
                </svg>
                <div className="stat-value" style={{ position: 'absolute', inset: 0, display:'flex',alignItems:'center',justifyContent:'center', fontSize: 28, color: salto.done ? 'var(--accent-gold)' : 'var(--text-primary)' }}>
                  {Math.ceil(salto.time)}
                </div>
              </div>

              {/* Count input */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <button onClick={() => salto.setCount(Math.max(0, salto.count - 1))} style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--bg-secondary)', border: '1px solid var(--border)', color: 'var(--text-primary)', fontSize: 20, display:'flex',alignItems:'center',justifyContent:'center' }}>−</button>
                <div style={{ textAlign: 'center' }}>
                  <div className="stat-value" style={{ fontSize: 32, color: 'var(--accent-teal)' }}>{salto.count}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>repeticiones</div>
                </div>
                <button onClick={() => salto.setCount(salto.count + 1)} style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--accent-teal-dim)', border: '1px solid var(--accent-teal)', color: 'var(--accent-teal)', fontSize: 20, display:'flex',alignItems:'center',justifyContent:'center' }}>+</button>
              </div>

              <div style={{ display: 'flex', gap: 10 }}>
                {!salto.running && !salto.done && (
                  <button onClick={salto.start} className="btn-primary" style={{ padding: '8px 20px' }}>▶ Iniciar</button>
                )}
                {salto.running && (
                  <button onClick={salto.pause} style={{ background: 'var(--accent-gold-dim)', color: 'var(--accent-gold)', border: '1px solid var(--accent-gold)', borderRadius: 8, padding: '8px 20px', fontWeight: 600 }}>⏸ Pausar</button>
                )}
                <button onClick={salto.reset} style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', color: 'var(--text-secondary)', borderRadius: 8, padding: '8px 14px' }}>↺</button>
              </div>
            </div>
          </div>

          {/* 2. Lanzamiento */}
          <div className="card" style={{ marginBottom: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
              <span style={{ width: 24, height: 24, borderRadius: '50%', background: 'var(--accent-purple)', color: '#fff', fontWeight: 700, display:'flex',alignItems:'center',justifyContent:'center', fontSize: 12 }}>2</span>
              <span style={{ fontWeight: 700 }}>LANZAMIENTO</span>
            </div>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 700, letterSpacing: 1, color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: 8 }}>Distancia (metros)</label>
            <input type="number" step="0.01" value={lanzamiento} onChange={e => setLanzamiento(e.target.value)} placeholder="0.00" style={{ maxWidth: 200 }} />
          </div>

          {/* 3. Carrera 45m */}
          <div className="card" style={{ marginBottom: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
              <span style={{ width: 24, height: 24, borderRadius: '50%', background: 'var(--accent-gold)', color: '#080d14', fontWeight: 700, display:'flex',alignItems:'center',justifyContent:'center', fontSize: 12 }}>3</span>
              <span style={{ fontWeight: 700 }}>CARRERA 45 METROS</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
              <div style={{ position: 'relative', width: 120, height: 120 }}>
                <svg width="120" height="120">
                  <circle cx="60" cy="60" r="52" fill="none" stroke="var(--border)" strokeWidth="8"/>
                  {carrera.running && <circle cx="60" cy="60" r="52" fill="none" stroke="var(--accent-teal)" strokeWidth="8" strokeDasharray="4 8" strokeLinecap="round" style={{ animation: 'spin 2s linear infinite', transformOrigin:'center' }}/>}
                </svg>
                <div className="stat-value" style={{ position: 'absolute', inset: 0, display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center' }}>
                  <span style={{ fontSize: 26, color: carrera.running ? 'var(--accent-teal)' : 'var(--text-primary)' }}>
                    {Math.floor(carrera.time).toString().padStart(2, '0')}
                    <span style={{ fontSize: 14, color: 'var(--text-muted)' }}>.{Math.floor((carrera.time % 1) * 100).toString().padStart(2,'0')}</span>
                  </span>
                  <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>segundos</span>
                </div>
              </div>

              <div style={{ display: 'flex', gap: 10 }}>
                {!carrera.running && (
                  <button onClick={carrera.start} className="btn-primary" style={{ padding: '8px 20px' }}>▶ Iniciar</button>
                )}
                {carrera.running && (
                  <button onClick={carrera.stop} style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#ef4444', borderRadius: 8, padding: '8px 20px', fontWeight: 600 }}>⏹ Detener</button>
                )}
                <button onClick={carrera.reset} style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', color: 'var(--text-secondary)', borderRadius: 8, padding: '8px 14px' }}>↺</button>
              </div>
            </div>
          </div>

          {/* Save */}
          <button onClick={handleSave} disabled={loading}
            style={{ width: '100%', padding: 14, fontSize: 15, fontWeight: 700, borderRadius: 10, background: 'linear-gradient(90deg,#00d4a0,#8b5cf6)', color: '#fff', border: 'none', cursor: 'pointer' }}>
            {loading ? <span className="spinner" style={{ width: 18, height: 18 }} /> : '💾 Guardar todas las marcas'}
          </button>
        </div>
      )}

      {saved && results && (
        <div className="fade-in">
          <div style={{ background: 'var(--accent-teal-dim)', border: '1px solid var(--accent-teal)', borderRadius: 10, padding: 14, marginBottom: 20, color: 'var(--accent-teal)', fontWeight: 600, textAlign: 'center' }}>
            ✅ Marcas guardadas exitosamente
          </div>

          <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
            ⚡ RESULTADOS DE PRUEBAS
          </div>

          {/* Salto */}
          <div className="card" style={{ marginBottom: 10, background: 'rgba(245,158,11,0.08)', borderColor: 'rgba(245,158,11,0.2)' }}>
            <div style={{ fontWeight: 700, color: 'var(--accent-gold)', marginBottom: 12 }}>⚡ SALTO DE CUERDA</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16 }}>
              {[['Repeticiones', results.saltoCuerda, '/ 15s'], ['Ritmo', results.ritmo, '/ min'], ['Nivel', results.saltoNivel, results.saltoNivel === 'Bajo' ? 'Resistencia en desarrollo' : '']].map(([l,v,u]) => (
                <div key={l} style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>{l}</div>
                  <div className="stat-value" style={{ fontSize: 22, color: l === 'Nivel' ? LEVEL_COLOR(v) : 'var(--accent-gold)' }}>{v}</div>
                  {u && <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{u}</div>}
                </div>
              ))}
            </div>
          </div>

          {/* Lanzamiento */}
          <div className="card" style={{ marginBottom: 10, background: 'rgba(139,92,246,0.08)', borderColor: 'rgba(139,92,246,0.2)' }}>
            <div style={{ fontWeight: 700, color: 'var(--accent-purple)', marginBottom: 12 }}>🎯 LANZAMIENTO</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16 }}>
              {[['Distancia', results.lanzamiento, 'metros'], ['Potencia', results.potLanz, 'estimada'], ['Nivel', results.lanzNivel, '']].map(([l,v,u]) => (
                <div key={l} style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>{l}</div>
                  <div className="stat-value" style={{ fontSize: 22, color: l === 'Nivel' ? LEVEL_COLOR(v) : 'var(--accent-purple)' }}>{v}</div>
                  {u && <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{u}</div>}
                </div>
              ))}
            </div>
          </div>

          {/* Physics */}
          {[
            [`Velocidad (v = d / t)`, `v = 45 m / ${results.carrera} s → ${results.velocidad} m/s`, 'var(--accent-teal)'],
            [`Aceleración (a = v / t)`, `a = ${results.velocidad} / ${results.carrera} s → ${results.aceleracion} m/s²`, 'var(--accent-purple)'],
            [`Fuerza (F = m × a)`, `F = ${participant.peso} kg × ${results.aceleracion} m/s² → ${results.fuerza} N`, 'var(--accent-gold)'],
          ].map(([label, formula, color]) => (
            <div key={label} className="card" style={{ marginBottom: 8, borderColor: color + '30', background: color + '08' }}>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>{label}</div>
              <div style={{ fontFamily: 'Space Grotesk', color, fontWeight: 600 }}>{formula}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
