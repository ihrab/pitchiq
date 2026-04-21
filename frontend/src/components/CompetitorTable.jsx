function Badge({ label, variant }) {
  const styles = {
    direct: 'bg-[#fee2e2] text-[#dc2626]',
    indirect: 'bg-[#fefce8] text-[#854d0e]',
    local: 'bg-[#eff6ff] text-[#1e40af]',
    global: 'bg-[#f5f3ff] text-[#5b21b6]',
  }
  return (
    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${styles[variant] || 'bg-[#f5f5f0] text-[#888888]'}`}>
      {label}
    </span>
  )
}

export default function CompetitorTable({ competitors }) {
  if (!competitors?.length) return <p className="text-[#888888] text-sm">No competitor data.</p>
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-[#e8e8e8]">
            <th className="text-left py-2 pr-4 text-[#888888] font-medium text-xs">Company</th>
            <th className="text-left py-2 pr-4 text-[#888888] font-medium text-xs">Type</th>
            <th className="text-left py-2 pr-4 text-[#888888] font-medium text-xs">Scope</th>
            <th className="text-left py-2 pr-4 text-[#888888] font-medium text-xs">Hottest product</th>
            <th className="text-left py-2 pr-4 text-[#888888] font-medium text-xs">Stage</th>
          </tr>
        </thead>
        <tbody>
          {competitors.map((c, i) => (
            <tr key={i} className="border-b border-[#f0f0f0] hover:bg-[#fafafa] transition-colors">
              <td className="py-3 pr-4 text-[#1a1a1a] font-semibold">{c.name}</td>
              <td className="py-3 pr-4"><Badge label={c.type} variant={c.type} /></td>
              <td className="py-3 pr-4"><Badge label={c.scope} variant={c.scope} /></td>
              <td className="py-3 pr-4 text-[#444444]">{c.hottest_product || '—'}</td>
              <td className="py-3 pr-4 text-[#888888]">{c.funding_stage || '—'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
