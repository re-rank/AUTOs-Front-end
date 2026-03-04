interface StatusBadgeProps {
  status: string;
}

function getBadgeClass(status: string): string {
  const s = status.toUpperCase();
  if (s === 'NEW') return 'badge badge-new';
  if (s === 'ORDERED') return 'badge badge-ordered';
  if (s === 'SHIPPED') return 'badge badge-shipped';
  if (s === 'COMPLETED') return 'badge badge-completed';
  if (s.includes('ERROR') || s.includes('FAIL')) return 'badge badge-error';
  return 'badge badge-new';
}

export default function StatusBadge({ status }: StatusBadgeProps) {
  return <span className={getBadgeClass(status)}>{status || '-'}</span>;
}
