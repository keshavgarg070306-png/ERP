import React from 'react';

interface StatusBadgeProps {
  status: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const normalized = status.toUpperCase().replace(/_/g, ' ');

  let bgClass = 'bg-[#1E2130] text-text-muted border border-border';
  let dotClass = 'bg-text-muted';

  switch (status.toUpperCase()) {
    // Success / Active states (Teal)
    case 'DELIVERED':
    case 'PAID':
    case 'IN_STOCK':
    case 'ACTIVE':
    case 'PROCESSED':
    case 'APPROVED':
    case 'CONNECTED':
      bgClass = 'bg-success/10 text-success border border-success/30';
      dotClass = 'bg-success';
      break;

    // Warning / Process states (Amber)
    case 'CONFIRMED':
    case 'SHIPPED':
    case 'SENT':
    case 'LOW_STOCK':
    case 'PENDING':
    case 'ON_LEAVE':
      bgClass = 'bg-warning/10 text-warning border border-warning/30';
      dotClass = 'bg-warning';
      break;

    // Danger / Critical states (Red)
    case 'CANCELLED':
    case 'OVERDUE':
    case 'OUT_OF_STOCK':
    case 'REJECTED':
    case 'DISCONNECTED':
      bgClass = 'bg-danger/10 text-danger border border-danger/30';
      dotClass = 'bg-danger';
      break;

    // Info / Draft states (Blue/Indigo)
    case 'DRAFT':
      bgClass = 'bg-primary/10 text-primary border border-primary/30';
      dotClass = 'bg-primary';
      break;
  }

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium tracking-wide font-mono ${bgClass}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${dotClass}`} />
      {normalized}
    </span>
  );
};
