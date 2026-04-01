import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { updateMe, deleteMe } from '../api/auth'
import { useAuth } from '../context/AuthContext'
import Sidebar from '../components/Sidebar'
import PlanBadge from '../components/PlanBadge'

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
    <div className="flex min-h-screen bg-bg-primary">
      <Sidebar />
      <main className="flex-1 p-8 max-w-2xl">
        <h1 className="font-serif text-3xl text-text-primary mb-8">Settings</h1>

        {/* Profile */}
        <section className="bg-bg-card border border-border-subtle rounded-card p-6 mb-6">
          <h2 className="text-text-primary font-medium mb-5">Profile</h2>
          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="block text-sm text-text-muted mb-1.5">Name</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-bg-primary border border-border-input rounded-chip px-4 py-2.5 text-text-primary text-sm focus:outline-none focus:border-accent transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm text-text-muted mb-1.5">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-bg-primary border border-border-input rounded-chip px-4 py-2.5 text-text-primary text-sm focus:outline-none focus:border-accent transition-colors"
              />
            </div>

            <div className="pt-2 border-t border-border-subtle">
              <h3 className="text-text-muted text-sm font-medium mb-3">Change password</h3>
              <div className="space-y-3">
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="New password (leave blank to keep current)"
                  className="w-full bg-bg-primary border border-border-input rounded-chip px-4 py-2.5 text-text-primary placeholder-text-hint text-sm focus:outline-none focus:border-accent transition-colors"
                />
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm new password"
                  className="w-full bg-bg-primary border border-border-input rounded-chip px-4 py-2.5 text-text-primary placeholder-text-hint text-sm focus:outline-none focus:border-accent transition-colors"
                />
              </div>
            </div>

            {saveMsg && (
              <div className="bg-green-950/40 border border-green-800/30 rounded-chip px-4 py-2 text-success text-sm">
                {saveMsg}
              </div>
            )}
            {saveError && (
              <div className="bg-danger/10 border border-danger/30 rounded-chip px-4 py-2 text-danger text-sm">
                {saveError}
              </div>
            )}

            <button
              type="submit"
              disabled={saving}
              className="bg-accent text-white px-6 py-2.5 rounded-chip text-sm font-medium hover:bg-accent/90 transition-colors disabled:opacity-50"
            >
              {saving ? 'Saving…' : 'Save changes'}
            </button>
          </form>
        </section>

        {/* Subscription */}
        <section className="bg-bg-card border border-border-subtle rounded-card p-6 mb-6">
          <h2 className="text-text-primary font-medium mb-4">Subscription</h2>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-text-muted mb-1.5">Current plan</div>
              <PlanBadge plan={user?.plan || 'free'} />
            </div>
            {user?.plan === 'free' ? (
              <button
                onClick={() => navigate('/pricing')}
                className="border border-accent text-accent px-4 py-2 rounded-chip text-sm hover:bg-accent-tint transition-colors"
              >
                Upgrade to Pro
              </button>
            ) : (
              <button
                onClick={() => alert('Stripe customer portal requires a live Stripe key.')}
                className="border border-border-input text-text-muted px-4 py-2 rounded-chip text-sm hover:text-text-primary transition-colors"
              >
                Manage subscription
              </button>
            )}
          </div>
          {user?.plan === 'free' && (
            <p className="text-text-hint text-xs mt-3">
              {user.analyses_this_month}/3 analyses used this month. Resets on the 1st.
            </p>
          )}
        </section>

        {/* Danger zone */}
        <section className="bg-bg-card border border-danger/20 rounded-card p-6">
          <h2 className="text-danger font-medium mb-4">Danger zone</h2>
          <p className="text-text-muted text-sm mb-4">
            Permanently delete your account and all associated data. This cannot be undone.
          </p>
          {!deleteConfirm ? (
            <button
              onClick={() => setDeleteConfirm(true)}
              className="border border-danger/40 text-danger px-4 py-2 rounded-chip text-sm hover:bg-danger/10 transition-colors"
            >
              Delete account
            </button>
          ) : (
            <div className="space-y-3">
              <p className="text-danger text-sm font-medium">Are you absolutely sure?</p>
              <div className="flex gap-3">
                <button
                  onClick={handleDelete}
                  className="bg-danger text-white px-4 py-2 rounded-chip text-sm font-medium hover:bg-danger/80 transition-colors"
                >
                  Yes, delete my account
                </button>
                <button
                  onClick={() => setDeleteConfirm(false)}
                  className="border border-border-input text-text-muted px-4 py-2 rounded-chip text-sm hover:text-text-primary transition-colors"
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
