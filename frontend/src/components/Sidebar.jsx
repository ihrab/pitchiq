import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const PLAN_COLORS = {
  free: 'bg-text-hint text-text-muted',
  pro: 'bg-accent-tint text-accent border border-accent',
  enterprise: 'bg-yellow-900/30 text-warning border border-warning',
}

export default function Sidebar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const navClass = ({ isActive }) =>
    `flex items-center gap-3 px-4 py-2.5 rounded-chip text-sm transition-colors ${
      isActive
        ? 'bg-accent-tint text-accent border border-accent/30'
        : 'text-text-muted hover:text-text-primary hover:bg-border-subtle'
    }`

  return (
    <aside className="w-56 min-h-screen bg-bg-sidebar border-r border-border-subtle flex flex-col flex-shrink-0">
      <div className="px-5 py-5 border-b border-border-subtle">
        <NavLink to="/dashboard" className="font-serif text-xl text-text-primary tracking-tight hover:text-accent transition-colors">
          PitchIQ
        </NavLink>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        <NavLink to="/submit" className={navClass}>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          New analysis
        </NavLink>
        <NavLink to="/dashboard" className={navClass}>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7" />
          </svg>
          My ideas
        </NavLink>
        <NavLink to="/pricing" className={navClass}>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Pricing
        </NavLink>
        <NavLink to="/settings" className={navClass}>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          Settings
        </NavLink>
      </nav>

      <div className="px-4 py-4 border-t border-border-subtle">
        {user && (
          <div className="space-y-2">
            <div className="text-sm text-text-primary truncate">{user.name || user.email}</div>
            <div className="text-xs text-text-muted truncate">{user.email}</div>
            <span className={`inline-block text-xs px-2 py-0.5 rounded-pill font-medium ${PLAN_COLORS[user.plan] || PLAN_COLORS.free}`}>
              {user.plan}
            </span>
            <button
              onClick={handleLogout}
              className="block w-full text-left text-xs text-text-muted hover:text-danger transition-colors mt-2"
            >
              Sign out
            </button>
          </div>
        )}
      </div>
    </aside>
  )
}
