export default function PersonaCard({ persona }) {
  return (
    <div className="bg-bg-card border border-border-subtle rounded-card p-5 space-y-3">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-accent-tint border border-accent/30 flex items-center justify-center text-accent font-medium text-sm">
          {persona.name?.[0] || '?'}
        </div>
        <div>
          <div className="text-text-primary font-medium">{persona.name}</div>
          <div className="text-text-muted text-xs">{persona.age} · {persona.role}</div>
        </div>
      </div>
      <div>
        <div className="text-xs text-text-muted uppercase tracking-wider mb-1">Pain point</div>
        <p className="text-text-body text-sm leading-relaxed">{persona.pain_point}</p>
      </div>
      <div>
        <div className="text-xs text-text-muted uppercase tracking-wider mb-1">Willingness to pay</div>
        <p className="text-success text-sm font-medium">{persona.willingness_to_pay}</p>
      </div>
    </div>
  )
}
