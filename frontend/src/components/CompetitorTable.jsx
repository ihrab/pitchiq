function Badge({ label, variant }) {
  const styles = {
    direct: 'bg-danger/10 text-danger border-danger/30',
    indirect: 'bg-warning/10 text-warning border-warning/30',
    local: 'bg-accent-tint text-accent border-accent/30',
    global: 'bg-green-950/30 text-success border-green-800/30',
  }
  return (
    <span className={`text-xs px-2 py-0.5 rounded-pill border ${styles[variant] || 'bg-border-subtle text-text-muted border-border-input'}`}>
      {label}
    </span>
  )
}

export default function CompetitorTable({ competitors }) {
  if (!competitors?.length) return <p className="text-text-muted text-sm">No competitor data.</p>
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border-subtle">
            <th className="text-left py-2 pr-4 text-text-muted font-medium text-xs">Company</th>
            <th className="text-left py-2 pr-4 text-text-muted font-medium text-xs">Type</th>
            <th className="text-left py-2 pr-4 text-text-muted font-medium text-xs">Scope</th>
            <th className="text-left py-2 pr-4 text-text-muted font-medium text-xs">Hottest product</th>
            <th className="text-left py-2 pr-4 text-text-muted font-medium text-xs">Stage</th>
          </tr>
        </thead>
        <tbody>
          {competitors.map((c, i) => (
            <tr key={i} className="border-b border-border-subtle/50 hover:bg-bg-card/50 transition-colors">
              <td className="py-3 pr-4 text-text-primary font-medium">{c.name}</td>
              <td className="py-3 pr-4"><Badge label={c.type} variant={c.type} /></td>
              <td className="py-3 pr-4"><Badge label={c.scope} variant={c.scope} /></td>
              <td className="py-3 pr-4 text-text-body">{c.hottest_product || '—'}</td>
              <td className="py-3 pr-4 text-text-muted">{c.funding_stage || '—'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
