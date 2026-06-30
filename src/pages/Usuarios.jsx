// src/pages/Usuarios.jsx
import { useEffect, useState } from 'react'
import { getAllParticipants, deleteParticipant, updateParticipant, PRESENTACIONES, getPresentacionByGrupo } from '../firebase/helpers'
import { Search, Trash2, Edit2, ExternalLink, X, Save } from 'lucide-react'

const CARNET_BASE = 'https://HealthXperienceIBIME.github.io/SecMontesCarnet'

function EditModal({ participant, onClose, onSaved }) {
  const [form, setForm] = useState({
    nombre: participant.nombre || '',
    edad: participant.edad || '',
    sexo: participant.sexo || '',
    peso: participant.peso || '',
    altura: participant.altura || '',
    grupo: participant.grupo || '',
  })
  const [loading, setLoading] = useState(false)

  const handleSave = async () => {
    setLoading(true)
    const pres = getPresentacionByGrupo(form.grupo)
    await updateParticipant(participant.id, {
      nombre: form.nombre,
      edad: parseInt(form.edad),
      sexo: form.sexo,
      peso: parseFloat(form.peso),
      altura: parseFloat(form.altura),
      grupo: form.grupo,
      presentacion: pres?.id || '',
      presentacionLabel: pres?.label || '',
    })
    setLoading(false)
    onSaved()
  }

  return (
    <div onClick={onClose} style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 20
    }}>
      <div onClick={e => e.stopPropagation()} className="card" style={{ width: '100%', maxWidth: 480, borderColor: 'var(--accent-teal)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Edit2 size={18} color="var(--accent-teal)" />
            <span style={{ fontWeight: 700, fontFamily: 'Space Grotesk' }}>Editar Participante</span>
          </div>
          <button onClick={onClose} style={{ background: 'none', color: 'var(--text-muted)', padding: 4 }}><X size={18} /></button>
        </div>

        <div style={{ display: 'grid', gap: 14 }}>
          <div>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: 6 }}>Nombre</label>
            <input value={form.nombre} onChange={e => setForm({...form, nombre: e.target.value})} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: 6 }}>Edad</label>
              <input type="number" value={form.edad} onChange={e => setForm({...form, edad: e.target.value})} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: 6 }}>Sexo</label>
              <select value={form.sexo} onChange={e => setForm({...form, sexo: e.target.value})}>
                <option value="Masculino">Masculino</option>
                <option value="Femenino">Femenino</option>
              </select>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: 6 }}>Peso (kg)</label>
              <input type="number" step="0.1" value={form.peso} onChange={e => setForm({...form, peso: e.target.value})} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: 6 }}>Altura (m)</label>
              <input type="number" step="0.01" value={form.altura} onChange={e => setForm({...form, altura: e.target.value})} />
            </div>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: 6 }}>Grupo</label>
            <select value={form.grupo} onChange={e => setForm({...form, grupo: e.target.value})}>
              {PRESENTACIONES.map(p => (
                <optgroup key={p.id} label={`${p.label} — ${p.fecha}`}>
                  {p.grupos.map(g => <option key={g} value={g}>{g}</option>)}
                </optgroup>
              ))}
            </select>
          </div>

          <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
            <button onClick={onClose} className="btn-secondary" style={{ flex: 1 }}>Cancelar</button>
            <button onClick={handleSave} disabled={loading} className="btn-primary" style={{ flex: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
              {loading ? <span className="spinner" style={{ width: 16, height: 16 }} /> : <><Save size={14} /> Guardar cambios</>}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function Usuarios() {
  const [all, setAll] = useState([])
  const [filtered, setFiltered] = useState([])
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState(null)
  const [editing, setEditing] = useState(null)

  const loadData = () => {
    getAllParticipants().then(data => {
      setAll(data); setFiltered(data); setLoading(false)
    })
  }

  useEffect(() => { loadData() }, [])

  useEffect(() => {
    const q = query.toLowerCase()
    setFiltered(all.filter(p =>
      p.nombre?.toLowerCase().includes(q) ||
      p.id?.toLowerCase().includes(q) ||
      p.grupo?.toLowerCase().includes(q)
    ))
  }, [query, all])

  const handleDelete = async (id) => {
    if (!window.confirm(`¿Eliminar a ${id}?`)) return
    setDeleting(id)
    await deleteParticipant(id)
    setAll(prev => prev.filter(p => p.id !== id))
    setDeleting(null)
  }

  const IMC_COLOR = (v) => {
    if (!v) return 'var(--text-muted)'
    if (v < 18.5) return 'var(--accent-blue)'
    if (v <= 24.9) return 'var(--accent-teal)'
    if (v <= 29.9) return 'var(--accent-gold)'
    return 'var(--status-danger)'
  }

  return (
    <div className="fade-in">
      {editing && (
        <EditModal
          participant={editing}
          onClose={() => setEditing(null)}
          onSaved={() => { setEditing(null); loadData() }}
        />
      )}

      <h1 style={{ fontFamily: 'Space Grotesk', fontSize: 28, fontWeight: 700, marginBottom: 6 }}>USUARIOS</h1>
      <p style={{ color: 'var(--text-secondary)', marginBottom: 20 }}>
        {all.length} participantes registrados · Edita o elimina según sea necesario
      </p>

      <div style={{ position: 'relative', marginBottom: 24 }}>
        <Search size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
        <input value={query} onChange={e => setQuery(e.target.value)}
          placeholder="Buscar por nombre, QR o grupo..." style={{ paddingLeft: 42 }} />
      </div>

      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 14 }}>
          {[0,1,2,3,4,5].map(i => <div key={i} className="card shimmer" style={{ height: 140 }} />)}
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 14 }}>
          {filtered.map(p => (
            <div key={p.id} className="card" style={{ position: 'relative' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
                <div style={{ width: 38, height: 38, borderRadius: 10, background: 'linear-gradient(135deg,#00d4a0,#8b5cf6)', display:'flex',alignItems:'center',justifyContent:'center', fontWeight: 700, fontSize: 16, flexShrink: 0 }}>
                  {p.nombre?.[0]?.toUpperCase() || '?'}
                </div>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontWeight: 700, fontSize: 13, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.nombre || 'Sin nombre'}</div>
                  <div style={{ color: 'var(--text-muted)', fontSize: 11 }}>{p.grupo} · {p.id}</div>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8, marginBottom: 14 }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 10, color: 'var(--text-muted)', marginBottom: 2 }}>IMC</div>
                  <div className="stat-value" style={{ fontSize: 16, color: IMC_COLOR(p.imc) }}>{p.imc?.toFixed(2) || '—'}</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 10, color: 'var(--text-muted)', marginBottom: 2 }}>Pruebas</div>
                  <div style={{ fontSize: 18 }}>{p.pruebas ? '✅' : p.pruebasOmitidas ? '⏭️' : '—'}</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 10, color: 'var(--text-muted)', marginBottom: 2 }}>IA</div>
                  <div style={{ fontSize: 18 }}>{p.recomendaciones ? '✨' : '—'}</div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: 8 }}>
                <a href={`${CARNET_BASE}/${p.id}`} target="_blank" rel="noreferrer"
                  style={{ flex: 1, padding: '8px 0', background: 'var(--accent-teal-dim)', border: '1px solid var(--accent-teal)', color: 'var(--accent-teal)', borderRadius: 8, textDecoration: 'none', fontWeight: 600, fontSize: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                  <ExternalLink size={12} /> Carnet
                </a>
                <button onClick={() => setEditing(p)}
                  style={{ padding: '8px 12px', background: 'var(--accent-purple-dim)', border: '1px solid var(--accent-purple)', color: 'var(--accent-purple)', borderRadius: 8 }}>
                  <Edit2 size={14} />
                </button>
                <button onClick={() => handleDelete(p.id)} className="btn-danger" disabled={deleting === p.id} style={{ padding: '8px 12px' }}>
                  {deleting === p.id ? <span className="spinner" style={{ width: 14, height: 14 }} /> : <Trash2 size={14} />}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {!loading && filtered.length === 0 && (
        <div style={{ textAlign: 'center', padding: 60, color: 'var(--text-muted)' }}>
          No se encontraron participantes
        </div>
      )}
    </div>
  )
}
