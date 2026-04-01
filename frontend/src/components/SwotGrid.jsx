const QUADRANTS = [
  { key: 'strengths', label: 'Strengths', color: 'text-success', bg: 'bg-green-950/30', border: 'border-green-800/30' },
  { key: 'weaknesses', label: 'Weaknesses', color: 'text-danger', bg: 'bg-red-950/30', border: 'border-red-800/30' },
  { key: 'opportunities', label: 'Opportunities', color: 'text-accent', bg: 'bg-accent-tint', border: 'border-accent/20' },
  { key: 'threats', label: 'Threats', color: 'text-warning', bg: 'bg-yellow-950/30', border: 'border-yellow-800/30' },
]

export default function SwotGrid({ swot }) {
  if (!swot) return null
  return (
    <div className="grid grid-cols-2 gap-2">
      {QUADRANTS.map(({ key, label, color, bg, border }) => (
        <div key={key} className={`${bg} border ${border} rounded-card p-4`}>
          <div className={`text-xs font-medium uppercase tracking-wider mb-3 ${color}`}>{label}</div>
          <ul className="space-y-1.5">
            {(swot[key] || []).map((item, i) => (
              <li key={i} className="text-sm text-text-body leading-relaxed flex gap-2">
                <span className={`mt-1.5 w-1 h-1 rounded-full flex-shrink-0 ${color} bg-current`} />
                {item}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  )
}
