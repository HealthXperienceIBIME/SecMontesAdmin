// src/components/QRScanner.jsx
import { useState, useRef, useEffect } from 'react'
import { Search, Camera, X } from 'lucide-react'

export default function QRScanner({ onFound, label = 'BUSCAR PARTICIPANTE', placeholder = 'Ej: HX-IBIME-001' }) {
  const [input, setInput] = useState('')
  const [scanning, setScanning] = useState(false)
  const scannerRef = useRef(null)
  const scannerInstance = useRef(null)

  const handleSearch = () => {
    const clean = input.trim().toUpperCase()
    if (clean) onFound(clean)
  }

  const startScanner = async () => {
    setScanning(true)
    try {
      const { Html5Qrcode } = await import('html5-qrcode')
      scannerInstance.current = new Html5Qrcode('qr-reader')
      await scannerInstance.current.start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        (decodedText) => {
          // Extract HX-IBIME-XXX from URL or raw
          const match = decodedText.match(/HX-IBIME-\d+/i)
          if (match) {
            const id = match[0].toUpperCase()
            setInput(id)
            stopScanner()
            onFound(id)
          }
        },
        () => {}
      )
    } catch (e) {
      console.error('QR error', e)
      setScanning(false)
    }
  }

  const stopScanner = async () => {
    try {
      if (scannerInstance.current) {
        await scannerInstance.current.stop()
        scannerInstance.current = null
      }
    } catch {}
    setScanning(false)
  }

  useEffect(() => () => { stopScanner() }, [])

  return (
    <div className="card" style={{ marginBottom: 20 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
        <div style={{ width: 36, height: 36, borderRadius: 8, background: 'var(--accent-teal-dim)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Search size={18} color="var(--accent-teal)" />
        </div>
        <div>
          <div style={{ fontWeight: 700, fontSize: 14 }}>{label}</div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Escanea el QR con la cámara o ingresa el código manualmente</div>
        </div>
      </div>

      {scanning && (
        <div style={{ marginBottom: 16 }}>
          <div id="qr-reader" ref={scannerRef} style={{ width: '100%', borderRadius: 10, overflow: 'hidden' }} />
          <button onClick={stopScanner} className="btn-secondary" style={{ marginTop: 10, width: '100%' }}>
            <X size={14} style={{ marginRight: 6, verticalAlign: 'middle' }} />Cancelar escaneo
          </button>
        </div>
      )}

      <div style={{ display: 'flex', gap: 10 }}>
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder={placeholder}
          onKeyDown={e => e.key === 'Enter' && handleSearch()}
          style={{ flex: 1 }}
        />
        <button onClick={startScanner} className="btn-secondary" style={{ padding: '10px 14px', flexShrink: 0 }} title="Escanear QR">
          <Camera size={16} />
        </button>
        <button onClick={handleSearch} className="btn-primary" style={{ padding: '10px 20px', flexShrink: 0 }}>
          Buscar
        </button>
      </div>
    </div>
  )
}
