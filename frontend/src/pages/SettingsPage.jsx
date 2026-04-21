import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { updateMe, deleteMe } from '../api/auth'
import { useAuth } from '../context/AuthContext'
import Sidebar from '../components/Sidebar'

export default function SettingsPage() {
  const { user, refreshUser, logout } = useAuth()
  const navigate = useNavigate()
  const [name, setName] = useState(user?.name || '')
  const [email, setEmail] = useState(user?.email || '')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [saving, setSaving] = useState(false)
  const [saveMsg, setSaveMsg] = useState(null)
  const [saveError, setSaveError] = useState(null)
  const [deleteConfirm, setDeleteConfirm] = useState(false)

  const inputClass = 'w-full bg-white border border-[#e8e8e8] rounded-[8px] px-4 py-2.5 text-[#1a1a1a] text-sm focus:outline-none focus:border-[#c8f135] transition-colors placeholder-[#aaaaaa]'

  const handleSave = async (e) => {
    e.preventDefault()
    setSaveError(null)
    setSaveMsg(null)
    if (password && password !== confirmPassword) {
      setSaveError('Passwords do not match.')
      return
    }
    setSaving(true)
    const payload = { name, email }
    if (password) payload.password = password
    try {
      await updateMe(payload)
      await refreshUser()
      setSaveMsg('Settings saved.')
      setPassword('')
      setConfirmPassword('')
    } catch (err) {
      setSaveError(err.response?.data?.error || 'Failed to save.')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    try {
      await deleteMe()
      logout()
      navigate('/login')
    } catch {
      alert('Failed to delete account.')
    }
  }

  return (
    <div className="flex min-h-screen bg-[#f5f5f0]">
      <Sidebar />
      <main className="flex-1 p-8 max-w-2xl">
        <h1 className="font-bold text-3xl text-[#1a1a1a] mb-8">Settings</h1>

        {/* Profile */}
        <section className="bg-white border border-[#e8e8e8] rounded-[16px] p-6 mb-6 shadow-[0_2px_12px_rgba(0,0,0,0.06)]">
          <h2 className="text-[#1a1a1a] font-semibold text-lg mb-5">Profile</h2>
          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[#444444] mb-1.5">Name</label>
              <input value={name} onChange={(e) => setName(e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#444444] mb-1.5">Email</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className={inputClass} />
            </div>

            <div className="pt-2 border-t border-[#e8e8e8]">
              <h3 className="text-[#888888] text-sm font-medium mb-3">Change password</h3>
              <div className="space-y-3">
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="New password (leave blank to keep current)"
                  className={inputClass}
                />
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm new password"
                  className={inputClass}
                />
              </div>
            </div>

            {saveMsg && (
              <div className="bg-[#f7fee7] border border-[#c8f135] rounded-[8px] px-4 py-2 text-[#166534] text-sm">
                {saveMsg}
              </div>
            )}
            {saveError && (
              <div className="bg-red-50 border border-red-200 rounded-[8px] px-4 py-2 text-red-600 text-sm">
                {saveError}
              </div>
            )}

            <button
              type="submit"
              disabled={saving}
              className="bg-[#c8f135] text-[#111111] px-6 py-2.5 rounded-[10px] text-sm font-bold hover:bg-[#b8e020] transition-colors disabled:opacity-50"
            >
              {saving ? 'Saving…' : 'Save changes'}
            </button>
          </form>
        </section>

        {/* Subscription */}
        <section className="bg-white border border-[#e8e8e8] rounded-[16px] p-6 mb-6 shadow-[0_2px_12px_rgba(0,0,0,0.06)]">
          <h2 className="text-[#1a1a1a] font-semibold text-lg mb-4">Subscription</h2>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-[#888888] mb-2">Current plan</div>
              <span className="bg-[#c8f135] text-[#111111] text-xs font-bold px-3 py-1 rounded-full capitalize">
                {user?.plan || 'free'}
              </span>
            </div>
            <button
              onClick={() => alert('Stripe customer portal requires a live Stripe key.')}
              className="border border-[#e8e8e8] text-[#888888] px-4 py-2 rounded-[10px] text-sm hover:text-[#444444] hover:border-[#cccccc] transition-colors"
            >
              Manage subscription
            </button>
          </div>
        </section>

        {/* Danger zone */}
        <section className="bg-white border border-red-200 rounded-[16px] p-6 shadow-[0_2px_12px_rgba(0,0,0,0.06)]">
          <h2 className="text-red-600 font-semibold text-lg mb-4">Danger zone</h2>
          <p className="text-[#888888] text-sm mb-4">
            Permanently delete your account and all associated data. This cannot be undone.
          </p>
          {!deleteConfirm ? (
            <button
              onClick={() => setDeleteConfirm(true)}
              className="border border-red-200 text-red-600 px-4 py-2 rounded-[10px] text-sm hover:bg-red-50 transition-colors"
            >
              Delete account
            </button>
          ) : (
            <div className="space-y-3">
              <p className="text-red-600 text-sm font-medium">Are you absolutely sure?</p>
              <div className="flex gap-3">
                <button
                  onClick={handleDelete}
                  className="bg-red-600 text-white px-4 py-2 rounded-[10px] text-sm font-medium hover:bg-red-700 transition-colors"
                >
                  Yes, delete my account
                </button>
                <button
                  onClick={() => setDeleteConfirm(false)}
                  className="border border-[#e8e8e8] text-[#888888] px-4 py-2 rounded-[10px] text-sm hover:text-[#444444] transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </section>
      </main>
    </div>
  )
}
