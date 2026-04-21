import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { login, register } from '../api/auth'
import { useAuth } from '../context/AuthContext'

const STATS = [
  { value: '2,400+', label: 'ideas validated' },
  { value: '94%', label: 'accuracy rate' },
  { value: '60s', label: 'analysis time' },
]

export default function LoginPage() {
  const [tab, setTab] = useState('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)
  const { loginWithTokens } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      const res =
        tab === 'login'
          ? await login(email, password)
          : await register(email, password, name)
      loginWithTokens(res.data.access, res.data.refresh, res.data.user)
      navigate('/dashboard')
    } catch (err) {
      setError(err.response?.data?.error || 'Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Left panel — dark */}
      <div className="hidden lg:flex w-[45%] flex-col justify-between p-12 bg-[#111111]">
        <div>
          <span className="text-white font-bold text-2xl tracking-tight">Pitch IQ</span>
        </div>
        <div className="space-y-10">
          <div>
            <h1 className="text-white font-bold text-4xl leading-tight mb-4">
              Validate your startup idea with AI
            </h1>
            <p className="text-[#aaaaaa] text-lg leading-relaxed">
              Get a full viability analysis, competitor map, and investor-ready pitch deck in under 60 seconds.
            </p>
          </div>
          <div className="flex gap-10">
            {STATS.map((s) => (
              <div key={s.label}>
                <div className="text-[#c8f135] font-bold text-3xl">{s.value}</div>
                <div className="text-[#888888] text-sm mt-1">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
        <p className="text-[#555555] text-sm">© 2026 Pitch IQ</p>
      </div>

      {/* Right panel — white */}
      <div className="flex-1 flex items-center justify-center p-8 bg-white">
        <div className="w-full max-w-md">
          <div className="lg:hidden mb-8">
            <span className="text-[#1a1a1a] font-bold text-2xl">Pitch IQ</span>
          </div>

          <h2 className="text-[#1a1a1a] font-bold text-2xl mb-2">
            {tab === 'login' ? 'Welcome back' : 'Create your account'}
          </h2>
          <p className="text-[#888888] text-sm mb-8">
            {tab === 'login' ? 'Sign in to continue to Pitch IQ' : 'Start validating ideas for free'}
          </p>

          {/* Tab toggle */}
          <div className="flex bg-[#f5f5f0] rounded-[10px] p-1 mb-8">
            {['login', 'register'].map((t) => (
              <button
                key={t}
                onClick={() => { setTab(t); setError(null) }}
                className={`flex-1 py-2 text-sm font-medium rounded-[8px] transition-all ${
                  tab === t
                    ? 'bg-[#c8f135] text-[#111111] shadow-sm'
                    : 'text-[#888888] hover:text-[#444444]'
                }`}
              >
                {t === 'login' ? 'Sign in' : 'Create account'}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {tab === 'register' && (
              <div>
                <label className="block text-sm font-medium text-[#444444] mb-1.5">Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name"
                  className="w-full bg-white border border-[#e8e8e8] rounded-[8px] px-4 py-2.5 text-[#1a1a1a] placeholder-[#aaaaaa] text-sm focus:outline-none focus:border-[#c8f135] transition-colors"
                />
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-[#444444] mb-1.5">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                className="w-full bg-white border border-[#e8e8e8] rounded-[8px] px-4 py-2.5 text-[#1a1a1a] placeholder-[#aaaaaa] text-sm focus:outline-none focus:border-[#c8f135] transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#444444] mb-1.5">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 8 characters"
                required
                className="w-full bg-white border border-[#e8e8e8] rounded-[8px] px-4 py-2.5 text-[#1a1a1a] placeholder-[#aaaaaa] text-sm focus:outline-none focus:border-[#c8f135] transition-colors"
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-[8px] px-4 py-3 text-red-600 text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#c8f135] text-[#111111] rounded-[10px] py-3 text-sm font-bold hover:bg-[#b8e020] transition-colors disabled:opacity-50"
            >
              {loading ? 'Please wait…' : tab === 'login' ? 'Sign in' : 'Create account'}
            </button>
          </form>

          <div className="mt-6 flex items-center gap-3">
            <div className="flex-1 h-px bg-[#e8e8e8]" />
            <span className="text-[#aaaaaa] text-xs">or</span>
            <div className="flex-1 h-px bg-[#e8e8e8]" />
          </div>

          <button
            className="mt-4 w-full border border-[#e8e8e8] rounded-[10px] py-2.5 text-sm text-[#888888] hover:text-[#444444] hover:border-[#cccccc] transition-colors flex items-center justify-center gap-2"
            onClick={() => alert('Google OAuth requires a configured Google Client ID.')}
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Continue with Google
          </button>
        </div>
      </div>
    </div>
  )
}
