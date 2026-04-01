const styles = {
  free: 'bg-text-hint/20 text-text-muted',
  pro: 'bg-accent-tint text-accent border border-accent/30',
  enterprise: 'bg-yellow-900/20 text-warning border border-yellow-800/30',
}

export default function PlanBadge({ plan }) {
  return (
    <span className={`inline-block text-xs px-2.5 py-0.5 rounded-pill font-medium capitalize ${styles[plan] || styles.free}`}>
      {plan}
    </span>
  )
}
