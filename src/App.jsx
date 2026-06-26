// src/App.jsx
import { useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import Registro from './pages/Registro'
import CalculoIMC from './pages/CalculoIMC'
import PruebasCalculos from './pages/PruebasCalculos'
import RecomendacionesIA from './pages/RecomendacionesIA'
import Premiaciones from './pages/Premiaciones'
import Usuarios from './pages/Usuarios'
import './index.css'

const ADMIN_PASSWORD = 'HXIBIME2026'

export default function App() {
  const [authed, setAuthed] = useState(() => sessionStorage.getItem('hx_auth') === '1')

  const handleLogin = (pw) => {
    if (pw === ADMIN_PASSWORD) {
      sessionStorage.setItem('hx_auth', '1')
      setAuthed(true)
      return true
    }
    return false
  }

  const handleLogout = () => {
    sessionStorage.removeItem('hx_auth')
    setAuthed(false)
  }

  if (!authed) return <Login onLogin={handleLogin} />

  return (
    <BrowserRouter basename="/healthxperience-admin">
      <Routes>
        <Route path="/" element={<Layout onLogout={handleLogout} />}>
          <Route index element={<Navigate to="/dashboard" />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="registro" element={<Registro />} />
          <Route path="imc" element={<CalculoIMC />} />
          <Route path="pruebas" element={<PruebasCalculos />} />
          <Route path="recomendaciones" element={<RecomendacionesIA />} />
          <Route path="premiaciones" element={<Premiaciones />} />
          <Route path="usuarios" element={<Usuarios />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
