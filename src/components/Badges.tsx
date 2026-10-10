import type { ReportStatus, RiskLevel, OfficerStatus } from '@/types';

export function StatusBadge({ status }: { status: ReportStatus }) {
  const config = {
    active: {
      label: 'نشط',
      cls: 'dark:bg-red-500/15 dark:text-red-400 dark:border-red-500/30 bg-red-100 text-red-700 border-red-200',
    },
    assigned: {
      label: 'مُسند',
      cls: 'dark:bg-amber-500/15 dark:text-amber-400 dark:border-amber-500/30 bg-amber-100 text-amber-700 border-amber-200',
    },
    resolved: {
      label: 'تم الحل',
      cls: 'dark:bg-emerald-500/15 dark:text-emerald-400 dark:border-emerald-500/30 bg-emerald-100 text-emerald-700 border-emerald-200',
    },
  }[status];

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${config.cls}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
      {config.label}
    </span>
  );
}

export function RiskBadge({ level }: { level: RiskLevel }) {
  const config = {
    high: {
      label: 'خطر عالي',
      cls: 'dark:bg-red-500/15 dark:text-red-400 dark:border-red-500/30 bg-red-100 text-red-700 border-red-200',
    },
    medium: {
      label: 'خطر متوسط',
      cls: 'dark:bg-amber-500/15 dark:text-amber-400 dark:border-amber-500/30 bg-amber-100 text-amber-700 border-amber-200',
    },
    low: {
      label: 'خطر منخفض',
      cls: 'dark:bg-emerald-500/15 dark:text-emerald-400 dark:border-emerald-500/30 bg-emerald-100 text-emerald-700 border-emerald-200',
    },
  }[level];

  return <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold border ${config.cls}`}>{config.label}</span>;
}

export function OfficerStatusBadge({ status }: { status: OfficerStatus }) {
  const config = {
    online: {
      label: 'متصل',
      cls: 'dark:bg-emerald-500/15 dark:text-emerald-400 bg-emerald-100 text-emerald-700',
    },
    offline: {
      label: 'غير متصل',
      cls: 'dark:bg-slate-500/15 dark:text-slate-400 bg-slate-100 text-slate-600',
    },
    on_break: {
      label: 'في استراحة',
      cls: 'dark:bg-amber-500/15 dark:text-amber-400 bg-amber-100 text-amber-700',
    },
  }[status];

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${config.cls}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current" />
      {config.label}
    </span>
  );
}

export function riskColor(level: RiskLevel): string {
  return { high: '#ef4444', medium: '#f59e0b', low: '#10b981' }[level];
}
