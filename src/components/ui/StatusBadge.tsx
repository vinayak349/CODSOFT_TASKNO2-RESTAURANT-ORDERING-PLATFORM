import React from 'react';

interface StatusBadgeProps {
  status: string;
  type?: 'order' | 'payment' | 'reservation';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, type = 'order' }) => {
  let colorStyles = 'bg-stone-100 text-stone-700 border-stone-200';
  let label = status.replace(/_/g, ' ');

  switch (status) {
    case 'PLACED':
      colorStyles = 'bg-amber-50 text-amber-800 border-amber-200';
      break;
    case 'CONFIRMED':
      colorStyles = 'bg-blue-50 text-blue-800 border-blue-200';
      break;
    case 'PREPARING':
      colorStyles = 'bg-orange-50 text-orange-800 border-orange-200 animate-pulse';
      break;
    case 'READY':
      colorStyles = 'bg-emerald-50 text-emerald-800 border-emerald-200 font-medium';
      break;
    case 'COMPLETED':
      colorStyles = 'bg-green-50 text-green-800 border-green-200';
      break;
    case 'CANCELLED':
    case 'REJECTED':
    case 'PAYMENT_FAILED':
    case 'FAILED':
      colorStyles = 'bg-rose-50 text-rose-800 border-rose-200';
      break;
    case 'PAID':
      colorStyles = 'bg-emerald-50 text-emerald-800 border-emerald-200';
      break;
    case 'PENDING':
    case 'PENDING_PAYMENT':
      colorStyles = 'bg-yellow-50 text-yellow-800 border-yellow-200';
      break;
    case 'NO_SHOW':
      colorStyles = 'bg-gray-100 text-gray-700 border-gray-300';
      break;
  }

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold tracking-wide uppercase border ${colorStyles}`}
    >
      {label}
    </span>
  );
};
