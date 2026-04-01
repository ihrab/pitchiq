import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getAnalysis, getChatMessages, exportPDF, exportPPTX } from '../api/analysis'
import { useAnalysisPolling } from '../hooks/useAnalysisPolling'
import { useAuth } from '../context/AuthContext'
import Sidebar from '../components/Sidebar'
import LoadingScreen from '../components/LoadingScreen'
import ScoreBar from '../components/ScoreBar'
import SwotGrid from '../components/SwotGrid'
import CompetitorTable from '../components/CompetitorTable'
import PersonaCard from '../components/PersonaCard'
import QABox from '../components/QABox'

const VERDICT_STYLES = {
  Strong: 'bg-green-950/40 text-success border-green-800/30',
  Promising: 'bg-accent-tint text-accent border-accent/30',
  'Needs work': 'bg-yellow-950/40 text-warning border-yellow-800/30',
  Risky: 'bg-red-950/40 text-danger border-red-800/30',
}

export default function AnalysisPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [analysis, setAnalysis] = useState(null)
  const [messages, setMessages] = useState([])
  const [loadError, setLoadError] = useState(null)

  const { status } = useAnalysisPolling(id, analysis?.status || 'pending')

  // Load full analysis once complete
  useEffect(() => {
    if (status === 'complete') {
      getAnalysis(id)
        .then((res) => setAnalysis(res.data))
        .catch(() => setLoadError('Failed to load analysis.'))
    } else if (status === 'failed') {
      setLoadError('Analysis failed. Please try submitting your idea again.')
    }
  }, [status, id])

  // Load chat messages
  useEffect(() => {
    if (status === 'complete') {
      getChatMessages(id)
        .then((res) => setMessages(res.data))
        .catch(() => {})
    }
  }, [status, id])

  const handleNewMessages = (userMsg, assistantMsg) => {
    setMessages((prev) => [...prev, userMsg, assistantMsg])
  }

  const handleExport = async (type) => {
    try {
      const fn = type === 'pdf' ? exportPDF : exportPPTX
      const res = await fn(id)
      const url = res.data.url
      if (url) window.open(url, '_blank')
    } catch (err) {
      const e = err.response?.data
      if (e?.error === 'upgrade_required') {
        navigate('/pricing')
      } else {
        alert(e?.error || 'Export failed.')
      }
    }
  }

  const isPro = user?.plan === 'pro' || user?.plan === 'enterprise'

  if (loadError) {
    return (
      <div className="flex min-h-screen bg-bg-primary">
        <Sidebar />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <p className="text-danger mb-4">{loadError}</p>
            <button onClick={() => navigate('/submit')} className="text-accent text-sm hover:underline">
              Try again →
            </button>
          </div>
        </main>
      </div>
    )
  }

  if (status === 'pending' || status === 'processing' || !analysis) {
    return (
      <div className="flex min-h-screen bg-bg-primary">
        <Sidebar />
        <main className="flex-1">
          <LoadingScreen status={status} />
        </main>
      </div>
    )
  }

  const idea = analysis.idea
  const score = analysis.overall_score
  const biggestRisk = analysis.scores?.find(s => s.dimension === 'execution_risk')
  const revenueScore = analysis.scores?.find(s => s.dimension === 'revenue_potential')

  return (
    <div className="flex min-h-screen bg-bg-primary">
      <Sidebar />
      <main className="flex-1 p-8 space-y-6 overflow-y-auto">
        {/* Top bar */}
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="font-serif text-3xl text-text-primary">{idea?.title}</h1>
            <div className="flex flex-wrap items-center gap-2 mt-2 text-xs text-text-muted">
              {analysis.completed_at && (
                <span>{new Date(analysis.completed_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
              )}
              {idea?.sector && <span className="bg-border-subtle px-2 py-0.5 rounded-pill">{idea.sector}</span>}
              {idea?.business_model && <span className="bg-border-subtle px-2 py-0.5 rounded-pill">{idea.business_model}</span>}
              {analysis.verdict && (
                <span className={`px-2.5 py-0.5 rounded-pill border ${VERDICT_STYLES[analysis.verdict] || ''}`}>
                  {analysis.verdict}
                </span>
              )}
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => handleExport('pdf')}
              className={`px-4 py-2 rounded-chip text-sm border transition-colors flex items-center gap-1.5 ${
                isPro
                  ? 'border-border-input text-text-muted hover:text-text-primary hover:border-text-muted'
                  : 'border-border-subtle text-text-hint cursor-not-allowed opacity-50'
              }`}
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Export PDF {!isPro && <span className="text-xs bg-accent-tint text-accent px-1 rounded">Pro</span>}
            </button>
            <button
              onClick={() => handleExport('pptx')}
              className={`px-4 py-2 rounded-chip text-sm border transition-colors flex items-center gap-1.5 ${
                isPro
                  ? 'border-border-input text-text-muted hover:text-text-primary hover:border-text-muted'
                  : 'border-border-subtle text-text-hint cursor-not-allowed opacity-50'
              }`}
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
              Pitch deck {!isPro && <span className="text-xs bg-accent-tint text-accent px-1 rounded">Pro</span>}
            </button>
          </div>
        </div>

        {/* Metric row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard label="Overall score" value={`${score?.toFixed(1)}/10`} accent />
          <MetricCard label="Market size" value={`${analysis.scores?.find(s => s.dimension === 'market_size')?.score?.toFixed(1) || '—'}/10`} />
          <MetricCard label="Biggest risk" value={biggestRisk?.score ? `${biggestRisk.score.toFixed(1)}/10` : '—'} />
          <MetricCard label="Revenue potential" value={revenueScore?.score ? `${revenueScore.score.toFixed(1)}/10` : '—'} />
        </div>

        {/* Scores + SWOT */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <section className="bg-bg-card border border-border-subtle rounded-card p-6">
            <h2 className="text-text-primary font-medium mb-5">Viability breakdown</h2>
            <div className="space-y-5">
              {(analysis.scores || []).map((s) => (
                <ScoreBar key={s.dimension} {...s} />
              ))}
            </div>
          </section>

          <section className="bg-bg-card border border-border-subtle rounded-card p-6">
            <h2 className="text-text-primary font-medium mb-5">SWOT analysis</h2>
            <SwotGrid swot={analysis.swot} />
          </section>
        </div>

        {/* Competitors + Personas */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <section className="bg-bg-card border border-border-subtle rounded-card p-6">
            <h2 className="text-text-primary font-medium mb-5">Competitor landscape</h2>
            <CompetitorTable competitors={analysis.competitors} />
          </section>

          <section className="bg-bg-card border border-border-subtle rounded-card p-6">
            <h2 className="text-text-primary font-medium mb-5">Target personas</h2>
            <div className="space-y-4">
              {(analysis.personas || []).map((p, i) => (
                <PersonaCard key={i} persona={p} />
              ))}
            </div>
          </section>
        </div>

        {/* Pivot suggestions */}
        {analysis.pivot_suggestions?.length > 0 && (
          <section>
            <h2 className="text-text-primary font-medium mb-4">Pivot suggestions</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {analysis.pivot_suggestions.map((s, i) => (
                <div key={i} className="bg-bg-card border border-border-subtle rounded-card p-5">
                  <div className="flex items-start gap-3">
                    <span className="w-6 h-6 rounded-full bg-accent-tint border border-accent/30 flex items-center justify-center text-accent text-xs font-medium flex-shrink-0">
                      {i + 1}
                    </span>
                    <p className="text-text-body text-sm leading-relaxed">{s}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Q&A */}
        <QABox
          analysisId={id}
          messages={messages}
          onNewMessages={handleNewMessages}
        />
      </main>
    </div>
  )
}

function MetricCard({ label, value, accent }) {
  return (
    <div className={`bg-bg-card border rounded-card p-4 ${accent ? 'border-accent/30 bg-accent-tint/30' : 'border-border-subtle'}`}>
      <div className="text-text-muted text-xs mb-1">{label}</div>
      <div className={`font-serif text-2xl ${accent ? 'text-accent' : 'text-text-primary'}`}>{value}</div>
    </div>
  )
}
