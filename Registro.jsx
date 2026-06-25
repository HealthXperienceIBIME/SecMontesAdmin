// src/pages/Registro.jsx
import { useState } from 'react'
import QRScanner from '../components/QRScanner'
import { getParticipant, createParticipant, GRUPOS } from '../firebase/helpers'
import { CheckCircle, UserPlus } from 'lucide-react'

export default function Registro() {
  const [participant, setParticipant] = useState(null)
  const [qrId, setQrId] = useState('')
  const [form, setForm] = useState({ nombre: '', edad: '', sexo: '', peso: '', altura: '', grupo: '' })
  const [loading, setLoading] = useState(false)
  const [saved, setSaved] = useState(false)
  const [searching, setSearching] = useState(false)

  const handleSearch = async (id) => {
    setQrId(id)
    setSearching(true)
    setSaved(false)
    setParticipant(null)
    const p = await getParticipant(id)
    setParticipant(p || false)
    setSearching(false)
  }

  const handleSubmit = async () => {
    if (!form.nombre || !form.edad || !form.sexo || !form.peso || !form.altura || !form.grupo) return
    setLoading(true)
    await createParticipant(qrId, {
      nombre: form.nombre,
      edad: parseInt(form.edad),
      sexo: form.sexo,
      peso: parseFloat(form.peso),
      altura: parseFloat(form.altura),
      grupo: form.grupo,
    })
    setSaved(true)
    setParticipant({ qrId, ...form })
    setLoading(false)
  }

  return (
    <div className="fade-in">
      <h1 style={{ fontFamily: 'Space Grotesk', fontSize: 28, fontWeight: 700, marginBottom: 6 }}>ESTACIÓN: REGISTRO</h1>
      <p style={{ color: 'var(--text-secondary)', marginBottom: 28 }}>Escanea el QR y registra los datos del participante</p>

      <QRScanner onFound={handleSearch} />

      {searching && <div style={{ textAlign: 'center', padding: 40 }}><span className="spinner" /></div>}

      {/* Already registered */}
      {participant && participant !== false && !saved && (
        <div className="card fade-in" style={{ borderColor: 'var(--accent-teal)', marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16, color: 'var(--accent-teal)' }}>
            <CheckCircle size={18} />
            <span style={{ fontWeight: 700 }}>Participante registrado</span>
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: 13, marginBottom: 16 }}>Este QR ya tiene un participante vinculado</p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ width: 48, height: 48, borderRadius: 12, background: 'linear-gradient(135deg,#00d4a0,#8b5cf6)', display:'flex',alignItems:'center',justifyContent:'center', fontSize: 20, fontWeight: 700 }}>
              {participant.nombre?.[0]?.toUpperCase()}
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 16 }}>{participant.nombre}</div>
              <div style={{ color: 'var(--text-muted)', fontSize: 12 }}>{participant.edad} años · {participant.sexo}</div>
              <div style={{ color: 'var(--text-muted)', fontSize: 12 }}>QR: {participant.id || qrId} · Grupo: {participant.grupo}</div>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12, marginTop: 16 }}>
            {[['Peso', `${participant.peso} kg`], ['Altura', `${participant.altura} m`], ['IMC', participant.imc?.toFixed(2) || '—'], ['Estado', 'Activo']].map(([l,v]) => (
              <div key={l} style={{ textAlign: 'center' }}>
                <div style={{ color: 'var(--text-muted)', fontSize: 11, marginBottom: 4 }}>{l}</div>
                <div style={{ fontWeight: 700, color: l === 'Estado' ? 'var(--accent-teal)' : 'var(--text-primary)' }}>{v}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* New registration form */}
      {participant === false && !saved && (
        <div className="card fade-in">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24 }}>
            <div style={{ width: 40, height: 40, borderRadius: 10, background: 'var(--accent-teal-dim)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <UserPlus size={18} color="var(--accent-teal)" />
            </div>
            <div>
              <div style={{ fontWeight: 700 }}>NUEVO REGISTRO</div>
              <div style={{ color: 'var(--text-muted)', fontSize: 12 }}>QR: {qrId}</div>
            </div>
          </div>

          <div style={{ display: 'grid', gap: 16 }}>
            <div>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 700, letterSpacing: 1, color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: 6 }}>Nombre Completo</label>
              <input value={form.nombre} onChange={e => setForm({...form, nombre: e.target.value})} placeholder="Nombre y apellidos" />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 700, letterSpacing: 1, color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: 6 }}>Edad</label>
                <input type="number" value={form.edad} onChange={e => setForm({...form, edad: e.target.value})} placeholder="Años" />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 700, letterSpacing: 1, color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: 6 }}>Sexo</label>
                <select value={form.sexo} onChange={e => setForm({...form, sexo: e.target.value})}>
                  <option value="">Seleccionar</option>
                  <option value="Masculino">Masculino</option>
                  <option value="Femenino">Femenino</option>
                </select>
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 700, letterSpacing: 1, color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: 6 }}>Peso (kg)</label>
                <input type="number" step="0.1" value={form.peso} onChange={e => setForm({...form, peso: e.target.value})} placeholder="ej. 72.5" />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 700, letterSpacing: 1, color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: 6 }}>Altura (m)</label>
                <input type="number" step="0.01" value={form.altura} onChange={e => setForm({...form, altura: e.target.value})} placeholder="ej. 1.65" />
              </div>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 700, letterSpacing: 1, color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: 6 }}>Grupo del Alumno</label>
              <select value={form.grupo} onChange={e => setForm({...form, grupo: e.target.value})}>
                <option value="">Selecciona el grupo</option>
                {GRUPOS.map(g => <option key={g} value={g}>{g}</option>)}
              </select>
            </div>
            <button onClick={handleSubmit} className="btn-primary" disabled={loading}
              style={{ padding: 14, fontSize: 15, borderRadius: 10 }}>
              {loading ? <span className="spinner" style={{ width: 18, height: 18 }} /> : 'Guardar registro'}
            </button>
          </div>
        </div>
      )}

      {/* Success */}
      {saved && (
        <div className="card fade-in" style={{ textAlign: 'center', padding: 40, borderColor: 'var(--accent-teal)' }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>✅</div>
          <h2 style={{ fontFamily: 'Space Grotesk', color: 'var(--accent-teal)', marginBottom: 8 }}>¡Registro exitoso!</h2>
          <p style={{ color: 'var(--text-secondary)' }}>{form.nombre || participant?.nombre} fue registrado correctamente.</p>
          <button onClick={() => { setParticipant(null); setQrId(''); setSaved(false); setForm({nombre:'',edad:'',sexo:'',peso:'',altura:'',grupo:''}) }}
            className="btn-secondary" style={{ marginTop: 24 }}>
            Registrar otro
          </button>
        </div>
      )}
    </div>
  )
}
