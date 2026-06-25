// src/pages/Usuarios.jsx
import { useEffect, useState } from 'react'
import { getAllParticipants, deleteParticipant } from '../firebase/helpers'
import { Search, Trash2, Edit2, ExternalLink } from 'lucide-react'

const CARNET_BASE = 'https://HealthXperienceIBIME.github.io/SecMontesCarnet'

export default function Usuarios() {
  const [all, setAll] = useState([])
  const [filtered, setFiltered] = useState([])
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState(null)

  useEffect(() => {
    getAllParticipants().then(data => {
      setAll(data); setFiltered(data); setLoading(false)
    })
  }, [])

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
      <h1 style={{ fontFamily: 'Space Grotesk', fontSize: 28, fontWeight: 700, marginBottom: 6 }}>USUARIOS</h1>
      <p style={{ color: 'var(--text-secondary)', marginBottom: 20 }}>
        {all.length} participantes registrados · Edita o elimina según sea necesario
      </p>

      <div style={{ position: 'relative', marginBottom: 24 }}>
        <Search size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
        <input value={query} onChange={e => setQuery(e.target.value)}
          placeholder="Buscar por nombre, QR o grupo..."
          style={{ paddingLeft: 42 }} />
      </div>

      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 14 }}>
          {[0,1,2,3,4,5].map(i => <div key={i} className="card shimmer" style={{ height: 120 }} />)}
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 14 }}>
          {filtered.map(p => (
            <div key={p.id} className="card" style={{ position: 'relative' }}>
              {/* Header */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
                <div style={{ width: 38, height: 38, borderRadius: 10, background: 'linear-gradient(135deg,#00d4a0,#8b5cf6)', display:'flex',alignItems:'center',justifyContent:'center', fontWeight: 700, fontSize: 16, flexShrink: 0 }}>
                  {p.nombre?.[0]?.toUpperCase() || '?'}
                </div>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontWeight: 700, fontSize: 13, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.nombre || 'Sin nombre'}</div>
                  <div style={{ color: 'var(--text-muted)', fontSize: 11 }}>{p.grupo} · {p.id}</div>
                </div>
              </div>

              {/* Stats */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8, marginBottom: 14 }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 10, color: 'var(--text-muted)', marginBottom: 2 }}>IMC</div>
                  <div className="stat-value" style={{ fontSize: 16, color: IMC_COLOR(p.imc) }}>{p.imc?.toFixed(2) || '—'}</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 10, color: 'var(--text-muted)', marginBottom: 2 }}>Pruebas</div>
                  <div style={{ fontSize: 18 }}>{p.pruebas ? '✅' : '—'}</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 10, color: 'var(--text-muted)', marginBottom: 2 }}>IA</div>
                  <div style={{ fontSize: 18 }}>{p.recomendaciones ? '✨' : '—'}</div>
                </div>
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', gap: 8 }}>
                <a href={`${CARNET_BASE}/${p.id}`} target="_blank" rel="noreferrer"
                  style={{ flex: 1, padding: '8px 0', background: 'var(--accent-teal-dim)', border: '1px solid var(--accent-teal)', color: 'var(--accent-teal)', borderRadius: 8, textDecoration: 'none', fontWeight: 600, fontSize: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                  <ExternalLink size={12} /> Carnet
                </a>
                <button onClick={() => handleDelete(p.id)} className="btn-danger" disabled={deleting === p.id}
                  style={{ padding: '8px 12px' }}>
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
