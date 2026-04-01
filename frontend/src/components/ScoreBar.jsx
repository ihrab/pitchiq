const DIMENSION_LABELS = {
  market_size: 'Market size',
  differentiation: 'Differentiation',
  revenue_potential: 'Revenue potential',
  competition: 'Competition',
  execution_risk: 'Execution risk',
  timing: 'Timing',
}

function scoreColor(score) {
  if (score >= 7.5) return '#4ade80'
  if (score >= 5) return '#7c6af7'
  if (score >= 3) return '#fbbf24'
  return '#f87171'
}

export default function ScoreBar({ dimension, score, justification }) {
  const pct = Math.round((score / 10) * 100)
  const color = scoreColor(score)

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-sm">
        <span className="text-text-body">{DIMENSION_LABELS[dimension] || dimension}</span>
        <span className="font-medium" style={{ color }}>{score?.toFixed(1)}</span>
      </div>
      <div className="h-1.5 bg-border-subtle rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${pct}%`, backgroundColor: color }}
        />
      </div>
      {justification && (
        <p className="text-xs text-text-muted leading-relaxed">{justification}</p>
      )}
    </div>
  )
}
