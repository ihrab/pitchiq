import Sidebar from '../components/Sidebar'

const FEATURES = [
  'Unlimited analyses',
  'Local + global competitor mapping',
  'PDF export',
  'Pitch deck generation (10 slides)',
  'Unlimited AI Q&A',
  'Full idea history',
  'SWOT analysis',
  'Target personas',
  'Pivot suggestions',
]

export default function PricingPage() {
  return (
    <div className="flex min-h-screen bg-bg-primary">
      <Sidebar />
      <main className="flex-1 p-8">
        <div className="max-w-2xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-accent-tint border border-accent/30 text-accent text-xs font-medium px-3 py-1.5 rounded-pill mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
            Beta — all features free
          </div>

          <h1 className="font-serif text-4xl text-text-primary mb-3">
            All features free during beta
          </h1>
          <p className="text-text-muted mb-10">
            PitchIQ is in beta. Every user gets full Pro access at no cost while we're building.
          </p>

          <div className="bg-bg-card border border-accent/30 rounded-card p-8 text-left">
            <div className="flex items-baseline gap-2 mb-6">
              <span className="font-serif text-5xl text-text-primary">Free</span>
              <span className="text-text-muted text-sm">during beta</span>
            </div>

            <ul className="space-y-3 mb-8">
              {FEATURES.map((f) => (
                <li key={f} className="flex items-center gap-3 text-sm text-text-body">
                  <svg className="w-4 h-4 text-success flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  {f}
                </li>
              ))}
            </ul>

            <p className="text-xs text-text-hint">
              Pricing will be introduced after beta. Early users will receive a discount.
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}
