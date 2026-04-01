import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { listIdeas } from '../api/ideas'
import Sidebar from '../components/Sidebar'

const VERDICT_STYLES = {
  Strong: 'bg-green-950/40 text-success border-green-800/30',
  Promising: 'bg-accent-tint text-accent border-accent/30',
  'Needs work': 'bg-yellow-950/40 text-warning border-yellow-800/30',
  Risky: 'bg-red-950/40 text-danger border-red-800/30',
}

function IdeaCard({ idea, onClick }) {
  const analysis = idea.analysis
  const verdict = analysis?.verdict
  const score = analysis?.overall_score

  return (
    <div
      onClick={onClick}
      className="bg-bg-card border border-border-subtle rounded-card p-5 hover:border-accent/40 transition-colors cursor-pointer group"
    >
      <div className="flex items-start justify-between gap-4 mb-3">
        <h3 className="text-text-primary font-medium group-hover:text-accent transition-colors line-clamp-1">
          {idea.title}
        </h3>
        {verdict && (
          <span className={`text-xs px-2.5 py-0.5 rounded-pill border flex-shrink-0 ${VERDICT_STYLES[verdict] || ''}`}>
            {verdict}
          </span>
        )}
      </div>
      <p className="text-text-muted text-sm line-clamp-2 mb-4">{idea.pitch_text}</p>
      <div className="flex items-center gap-3 text-xs text-text-hint">
        <span className="bg-border-subtle px-2 py-0.5 rounded-pill">{idea.sector}</span>
        <span>{idea.business_model}</span>
        <span className="ml-auto">
          {analysis?.status === 'complete' && score
            ? <span className="text-accent font-medium">{score.toFixed(1)}/10</span>
            : analysis?.status === 'processing' || analysis?.status === 'pending'
            ? <span className="text-warning">Analysing…</span>
            : analysis?.status === 'failed'
            ? <span className="text-danger">Failed</span>
            : '—'}
        </span>
      </div>
      {idea.submitted_at && (
        <div className="mt-2 text-xs text-text-hint">
          {new Date(idea.submitted_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
        </div>
      )}
    </div>
  )
}

export default function DashboardPage() {
  const [ideas, setIdeas] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const upgraded = searchParams.get('upgraded') === 'true'

  useEffect(() => {
    listIdeas()
      .then((res) => setIdeas(res.data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="flex min-h-screen bg-bg-primary">
      <Sidebar />
      <main className="flex-1 p-8">
        {upgraded && (
          <div className="mb-6 bg-green-950/40 border border-green-800/40 rounded-card px-4 py-3 text-success text-sm">
            Welcome to Pro! Your account has been upgraded.
          </div>
        )}

        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-serif text-3xl text-text-primary">My ideas</h1>
            <p className="text-text-muted text-sm mt-1">All your validated startup ideas</p>
          </div>
          <button
            onClick={() => navigate('/submit')}
            className="bg-accent text-white px-5 py-2.5 rounded-chip text-sm font-medium hover:bg-accent/90 transition-colors flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            New analysis
          </button>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {[1,2,3].map((i) => (
              <div key={i} className="bg-bg-card border border-border-subtle rounded-card p-5 animate-pulse h-40" />
            ))}
          </div>
        ) : ideas.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-16 h-16 rounded-full bg-accent-tint border border-accent/20 flex items-center justify-center mb-4">
              <svg className="w-7 h-7 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <h2 className="font-serif text-2xl text-text-primary mb-2">No ideas yet</h2>
            <p className="text-text-muted text-sm mb-6">Submit your first startup idea to get an AI-powered analysis.</p>
            <button
              onClick={() => navigate('/submit')}
              className="bg-accent text-white px-6 py-2.5 rounded-chip text-sm font-medium hover:bg-accent/90 transition-colors"
            >
              Run your first analysis
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {ideas.map((idea) => (
              <IdeaCard
                key={idea.id}
                idea={idea}
                onClick={() => idea.analysis?.id && navigate(`/analysis/${idea.analysis.id}`)}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
