import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { createCheckoutSession } from '../api/stripe'
import { useAuth } from '../context/AuthContext'
import Sidebar from '../components/Sidebar'

const PLANS = [
  {
    id: 'free',
    name: 'Free',
    monthly: 0,
    features: [
      '3 analyses per month',
      'Global competitors (max 3)',
      'AI Q&A (5 messages per analysis)',
      'SWOT + personas + scores',
    ],
    missing: ['Local competitors', 'PDF export', 'Pitch deck', 'Unlimited history'],
  },
  {
    id: 'pro',
    name: 'Pro',
    monthly: 12,
    annual: 8.4,
    popular: true,
    features: [
      'Unlimited analyses',
      'Local + global competitors (up to 6)',
      'PDF export (reportlab)',
      'Pitch deck (10 slides)',
      'Unlimited AI Q&A',
      'Full idea history',
    ],
    missing: [],
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    monthly: 49,
    annual: 34.3,
    features: [
      'Everything in Pro',
      'Team workspace (up to 5 users)',
      'Branded exports (logo)',
      'API access',
      'Priority support',
    ],
    missing: [],
  },
]

export default function PricingPage() {
  const [annual, setAnnual] = useState(false)
  const [loading, setLoading] = useState(null)
  const { user } = useAuth()
  const navigate = useNavigate()

  const handleUpgrade = async (planId) => {
    if (!user) { navigate('/login'); return }
    if (planId === 'free') return
    setLoading(planId)
    try {
      const res = await createCheckoutSession(planId)
      window.location.href = res.data.url
    } catch (err) {
      alert(err.response?.data?.error || 'Could not create checkout session.')
    } finally {
      setLoading(null)
    }
  }

  return (
    <div className="flex min-h-screen bg-bg-primary">
      <Sidebar />
      <main className="flex-1 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-10">
            <h1 className="font-serif text-4xl text-text-primary mb-3">Simple, transparent pricing</h1>
            <p className="text-text-muted">Start free. Upgrade when you need more power.</p>

            <div className="inline-flex items-center gap-3 mt-6 bg-bg-card border border-border-subtle rounded-pill px-1 py-1">
              <button
                onClick={() => setAnnual(false)}
                className={`px-4 py-1.5 rounded-pill text-sm transition-colors ${
                  !annual ? 'bg-accent text-white' : 'text-text-muted hover:text-text-primary'
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setAnnual(true)}
                className={`px-4 py-1.5 rounded-pill text-sm transition-colors flex items-center gap-1.5 ${
                  annual ? 'bg-accent text-white' : 'text-text-muted hover:text-text-primary'
                }`}
              >
                Annual
                <span className={`text-xs px-1.5 py-0.5 rounded-pill ${annual ? 'bg-white/20' : 'bg-success/10 text-success'}`}>
                  Save 30%
                </span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {PLANS.map((plan) => {
              const price = annual && plan.annual ? plan.annual : plan.monthly
              const isCurrent = user?.plan === plan.id
              const isUpgrade = plan.id !== 'free' && !isCurrent

              return (
                <div
                  key={plan.id}
                  className={`bg-bg-card border rounded-card p-6 relative flex flex-col ${
                    plan.popular ? 'border-accent/50' : 'border-border-subtle'
                  }`}
                >
                  {plan.popular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <span className="bg-accent text-white text-xs px-3 py-1 rounded-pill font-medium">
                        Most popular
                      </span>
                    </div>
                  )}

                  <div className="mb-6">
                    <h3 className="text-text-primary font-medium mb-1">{plan.name}</h3>
                    <div className="flex items-baseline gap-1">
                      <span className="font-serif text-4xl text-text-primary">
                        {price === 0 ? 'Free' : `£${price}`}
                      </span>
                      {price > 0 && (
                        <span className="text-text-muted text-sm">/mo{annual ? ' billed annually' : ''}</span>
                      )}
                    </div>
                  </div>

                  <ul className="space-y-2.5 flex-1 mb-6">
                    {plan.features.map((f) => (
                      <li key={f} className="flex items-start gap-2 text-sm text-text-body">
                        <svg className="w-4 h-4 text-success flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        {f}
                      </li>
                    ))}
                    {plan.missing.map((f) => (
                      <li key={f} className="flex items-start gap-2 text-sm text-text-hint line-through">
                        <svg className="w-4 h-4 text-text-hint flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                        {f}
                      </li>
                    ))}
                  </ul>

                  <button
                    onClick={() => handleUpgrade(plan.id)}
                    disabled={isCurrent || loading === plan.id || plan.id === 'free'}
                    className={`w-full py-2.5 rounded-chip text-sm font-medium transition-colors ${
                      isCurrent
                        ? 'bg-border-subtle text-text-muted cursor-default'
                        : plan.id === 'free'
                        ? 'bg-border-subtle text-text-muted cursor-default'
                        : plan.popular
                        ? 'bg-accent text-white hover:bg-accent/90'
                        : 'border border-accent text-accent hover:bg-accent-tint'
                    }`}
                  >
                    {isCurrent
                      ? 'Current plan'
                      : plan.id === 'free'
                      ? 'Free forever'
                      : loading === plan.id
                      ? 'Redirecting…'
                      : `Upgrade to ${plan.name}`}
                  </button>
                </div>
              )
            })}
          </div>
        </div>
      </main>
    </div>
  )
}
