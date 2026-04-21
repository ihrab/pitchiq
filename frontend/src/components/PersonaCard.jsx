export default function PersonaCard({ persona }) {
  const initials = (persona.name || '?').split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()

  return (
    <div className="bg-white border-l-4 border-[#c8f135] border border-[#e8e8e8] rounded-[12px] p-4 space-y-3">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-[#c8f135] flex items-center justify-center text-[#111111] font-bold text-sm flex-shrink-0">
          {initials}
        </div>
        <div>
          <div className="text-[#1a1a1a] font-semibold">{persona.name}</div>
          <div className="text-[#888888] text-xs">{persona.age} · {persona.role}</div>
        </div>
      </div>
      <div>
        <div className="text-xs text-[#aaaaaa] uppercase tracking-wider mb-1">Pain point</div>
        <p className="text-[#444444] text-sm leading-relaxed">{persona.pain_point}</p>
      </div>
      <div>
        <div className="text-xs text-[#aaaaaa] uppercase tracking-wider mb-1">Willingness to pay</div>
        <p className="text-[#166534] text-sm font-semibold">{persona.willingness_to_pay}</p>
      </div>
    </div>
  )
}
