interface StatusBadgeProps {
  status: string;
}

const STATUS_LABEL: Record<string, string> = {
  NEW: '신규',
  NO_MAPPING: '매핑없음',
  ORDERED: '주문완료',
  ORDER_FAILED: '주문실패',
  TRACKING: '송장수집',
  DISPATCHED: '발송완료',
};

function getBadgeClass(status: string): string {
  const s = status.toUpperCase();
  if (s === 'NEW') return 'badge badge-new';
  if (s === 'ORDERED') return 'badge badge-ordered';
  if (s === 'TRACKING') return 'badge badge-ordered';
  if (s === 'DISPATCHED') return 'badge badge-completed';
  if (s.includes('ERROR') || s.includes('FAIL')) return 'badge badge-error';
  if (s === 'NO_MAPPING') return 'badge badge-error';
  return 'badge badge-new';
}

export default function StatusBadge({ status }: StatusBadgeProps) {
  const label = STATUS_LABEL[status.toUpperCase()] ?? status;
  return <span className={getBadgeClass(status)}>{label || '-'}</span>;
}
