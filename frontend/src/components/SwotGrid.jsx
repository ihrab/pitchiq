const QUADRANTS = [
  { key: 'strengths', label: 'Strengths', color: 'text-green-700', bg: 'bg-[#f0fde4]', border: 'border-[#bbf7d0]' },
  { key: 'weaknesses', label: 'Weaknesses', color: 'text-red-700', bg: 'bg-[#fef2f2]', border: 'border-[#fecaca]' },
  { key: 'opportunities', label: 'Opportunities', color: 'text-blue-700', bg: 'bg-[#eff6ff]', border: 'border-[#bfdbfe]' },
  { key: 'threats', label: 'Threats', color: 'text-amber-800', bg: 'bg-[#fffbeb]', border: 'border-[#fde68a]' },
]

export default function SwotGrid({ swot }) {
  if (!swot) return null
  return (
    <div className="grid grid-cols-2 gap-3">
      {QUADRANTS.map(({ key, label, color, bg, border }) => (
        <div key={key} className={`${bg} border ${border} rounded-[12px] p-4`}>
          <div className={`text-xs font-bold uppercase tracking-wider mb-3 ${color}`}>{label}</div>
          <ul className="space-y-1.5">
            {(swot[key] || []).map((item, i) => (
              <li key={i} className={`text-sm leading-relaxed flex gap-2 ${color}`}>
                <span className="mt-1.5 w-1.5 h-1.5 rounded-full flex-shrink-0 bg-current" />
                <span className="text-[#444444]">{item}</span>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  )
}
