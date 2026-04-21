const DIMENSION_LABELS = {
  market_size: 'Market size',
  differentiation: 'Differentiation',
  revenue_potential: 'Revenue potential',
  competition: 'Competition',
  execution_risk: 'Execution risk',
  timing: 'Timing',
}

function scoreColor(score) {
  if (score >= 7) return '#c8f135'
  if (score >= 4) return '#f59e0b'
  return '#ef4444'
}

export default function ScoreBar({ dimension, score, justification }) {
  const pct = Math.round((score / 10) * 100)
  const color = scoreColor(score)

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-sm">
        <span className="text-[#444444] font-medium">{DIMENSION_LABELS[dimension] || dimension}</span>
        <span className="font-bold text-sm" style={{ color }}>{score?.toFixed(1)}</span>
      </div>
      <div className="h-2 bg-[#f0f0f0] rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${pct}%`, backgroundColor: color }}
        />
      </div>
      {justification && (
        <p className="text-xs text-[#888888] leading-relaxed">{justification}</p>
      )}
    </div>
  )
}
