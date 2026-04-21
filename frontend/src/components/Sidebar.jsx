import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Sidebar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const navClass = ({ isActive }) =>
    `flex items-center gap-3 px-4 py-2.5 rounded-[10px] text-sm font-medium transition-all ${
      isActive
        ? 'bg-[#c8f135] text-[#111111]'
        : 'text-[#aaaaaa] hover:text-white hover:bg-white/10'
    }`

  const initials = (user?.name || user?.email || 'U')
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()

  return (
    <aside className="w-60 min-h-screen bg-[#111111] flex flex-col flex-shrink-0">
      <div className="px-6 py-6">
        <NavLink to="/dashboard" className="text-white font-bold text-xl tracking-tight hover:text-[#c8f135] transition-colors">
          Pitch IQ
        </NavLink>
      </div>

      <nav className="flex-1 px-3 py-2 space-y-1">
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

      <div className="px-4 py-5 border-t border-white/10">
        {user && (
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-[#c8f135] flex items-center justify-center text-[#111111] font-bold text-sm flex-shrink-0">
                {initials}
              </div>
              <div className="min-w-0">
                <div className="text-white text-sm font-medium truncate">{user.name || user.email}</div>
                <div className="text-[#888888] text-xs truncate">{user.email}</div>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs bg-[#c8f135] text-[#111111] font-semibold px-2.5 py-0.5 rounded-full">
                {user.plan}
              </span>
              <button
                onClick={handleLogout}
                className="text-xs text-[#888888] hover:text-white transition-colors"
              >
                Sign out
              </button>
            </div>
          </div>
        )}
      </div>
    </aside>
  )
}
