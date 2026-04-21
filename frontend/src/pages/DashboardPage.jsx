import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { listIdeas } from '../api/ideas'
import Sidebar from '../components/Sidebar'

function scoreBadgeClass(score) {
  if (score >= 7) return 'bg-[#c8f135] text-[#111111]'
  if (score >= 4) return 'bg-amber-100 text-amber-700'
  return 'bg-red-100 text-red-600'
}

const VERDICT_STYLES = {
  Strong: 'bg-green-100 text-green-700',
  Promising: 'bg-[#f7fee7] text-[#166534]',
  'Needs work': 'bg-amber-100 text-amber-700',
  Risky: 'bg-red-100 text-red-600',
}

function IdeaCard({ idea, onClick }) {
  const analysis = idea.analysis
  const verdict = analysis?.verdict
  const score = analysis?.overall_score

  return (
    <div
      onClick={onClick}
      className="bg-white border border-[#e8e8e8] rounded-[16px] p-5 shadow-[0_2px_12px_rgba(0,0,0,0.06)] hover:shadow-[0_4px_20px_rgba(0,0,0,0.10)] hover:border-[#c8f135] transition-all cursor-pointer group"
    >
      <div className="flex items-start justify-between gap-4 mb-3">
        <h3 className="text-[#1a1a1a] font-semibold group-hover:text-[#111111] transition-colors line-clamp-1">
          {idea.title}
        </h3>
        {verdict && (
          <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium flex-shrink-0 ${VERDICT_STYLES[verdict] || 'bg-gray-100 text-gray-600'}`}>
            {verdict}
          </span>
        )}
      </div>
      <p className="text-[#888888] text-sm line-clamp-2 mb-4">{idea.pitch_text}</p>
      <div className="flex items-center gap-3 text-xs text-[#aaaaaa]">
        <span className="bg-[#f5f5f0] px-2 py-0.5 rounded-full text-[#888888]">{idea.sector}</span>
        <span>{idea.business_model}</span>
        <span className="ml-auto">
          {analysis?.status === 'complete' && score != null
            ? <span className={`font-bold text-sm px-2 py-0.5 rounded-full ${scoreBadgeClass(score)}`}>{score.toFixed(1)}</span>
            : analysis?.status === 'processing' || analysis?.status === 'pending'
            ? <span className="text-amber-600 font-medium">Analysing…</span>
            : analysis?.status === 'failed'
            ? <span className="text-red-500 font-medium">Failed</span>
            : '—'}
        </span>
      </div>
      {idea.submitted_at && (
        <div className="mt-2 text-xs text-[#aaaaaa]">
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
    <div className="flex min-h-screen bg-[#f5f5f0]">
      <Sidebar />
      <main className="flex-1 p-8">
        {upgraded && (
          <div className="mb-6 bg-[#f7fee7] border border-[#c8f135] rounded-[12px] px-4 py-3 text-[#166534] text-sm font-medium">
            Welcome to Pro! Your account has been upgraded.
          </div>
        )}

        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-bold text-3xl text-[#1a1a1a]">My ideas</h1>
            <p className="text-[#888888] text-sm mt-1 italic">All your validated startup ideas</p>
          </div>
          <button
            onClick={() => navigate('/submit')}
            className="bg-[#c8f135] text-[#111111] px-5 py-2.5 rounded-[10px] text-sm font-bold hover:bg-[#b8e020] transition-colors flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            New analysis
          </button>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white border border-[#e8e8e8] rounded-[16px] p-5 animate-pulse h-40" />
            ))}
          </div>
        ) : ideas.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-16 h-16 rounded-full bg-[#f7fee7] border border-[#c8f135] flex items-center justify-center mb-4">
              <svg className="w-7 h-7 text-[#c8f135]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <h2 className="font-bold text-2xl text-[#1a1a1a] mb-2">No ideas yet</h2>
            <p className="text-[#888888] text-sm mb-6">Submit your first startup idea to get an AI-powered analysis.</p>
            <button
              onClick={() => navigate('/submit')}
              className="bg-[#c8f135] text-[#111111] px-6 py-2.5 rounded-[10px] text-sm font-bold hover:bg-[#b8e020] transition-colors"
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
