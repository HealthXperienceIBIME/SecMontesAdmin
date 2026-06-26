// src/components/Layout.jsx
import { Outlet, NavLink } from 'react-router-dom'
import {
  LayoutDashboard, UserPlus, Calculator, Activity,
  Sparkles, Trophy, Users, Sun, Moon, LogOut
} from 'lucide-react'
import { useState } from 'react'

const NAV = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/registro', icon: UserPlus, label: 'Registro' },
  { to: '/imc', icon: Calculator, label: 'Cálculo IMC' },
  { to: '/pruebas', icon: Activity, label: 'Pruebas y Cálculos' },
  { to: '/recomendaciones', icon: Sparkles, label: 'Recomendaciones IA' },
  { to: '/premiaciones', icon: Trophy, label: 'Premiaciones' },
  { to: '/usuarios', icon: Users, label: 'Usuarios' },
]

export default function Layout({ onLogout }) {
  const [dark, setDark] = useState(true)

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      {/* Sidebar */}
      <aside style={{
        width: 220, flexShrink: 0,
        background: 'var(--bg-secondary)',
        borderRight: '1px solid var(--border)',
        display: 'flex', flexDirection: 'column',
        padding: '20px 0'
      }}>
        {/* Logo */}
        <div style={{ padding: '0 16px 20px', borderBottom: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            {/* Logo HealthXperience */}
            <img
              src="/SecMontesAdmin/logo-hx.png"
              alt="HealthXperience"
              style={{ height: 40, objectFit: 'contain' }}
            />
            {/* Logo IBIME */}
            <img
              src="/SecMontesAdmin/logo-ibime.png"
              alt="IBIME"
              style={{ height: 34, objectFit: 'contain' }}
            />
          </div>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: '16px 10px', display: 'flex', flexDirection: 'column', gap: 2 }}>
          {NAV.map(({ to, icon: Icon, label }) => (
            <NavLink key={to} to={to} style={({ isActive }) => ({
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '9px 12px', borderRadius: 8, textDecoration: 'none',
              color: isActive ? 'var(--accent-teal)' : 'var(--text-secondary)',
              background: isActive ? 'var(--accent-teal-dim)' : 'transparent',
              fontWeight: isActive ? 600 : 400, fontSize: 13,
              transition: 'all 0.15s'
            })}>
              <Icon size={16} />
              {label}
            </NavLink>
          ))}
        </nav>

        {/* Bottom */}
        <div style={{ padding: '16px 10px', borderTop: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: 2 }}>
          <button onClick={() => setDark(!dark)}
            style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 12px', borderRadius: 8, background: 'none', color: 'var(--text-secondary)', fontSize: 13, fontWeight: 400 }}>
            {dark ? <Sun size={16}/> : <Moon size={16}/>}
            {dark ? 'Modo claro' : 'Modo oscuro'}
          </button>
          <button onClick={onLogout}
            style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 12px', borderRadius: 8, background: 'none', color: 'var(--text-secondary)', fontSize: 13, fontWeight: 400 }}>
            <LogOut size={16}/>
            Cerrar sesión
          </button>
        </div>
      </aside>

      {/* Main */}
      <main style={{ flex: 1, overflow: 'auto', background: 'var(--bg-primary)' }}
        className="grid-bg">
        <div style={{ padding: '36px 40px', maxWidth: 1200 }}>
          <Outlet />
        </div>
      </main>
    </div>
  )
}
