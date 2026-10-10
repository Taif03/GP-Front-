import { useEffect, useState, useRef } from 'react';
import { AlertTriangle, CheckCircle2, ShieldCheck, Activity } from 'lucide-react';
import type { ReportWithOfficer, Officer } from '@/types';

interface StatsCounterProps {
  reports: ReportWithOfficer[];
  officers: Officer[];
}

export default function StatsCounter({ reports, officers }: StatsCounterProps) {
  const activeReports = reports.filter((r) => r.status === 'active').length;
  const resolvedReports = reports.filter((r) => r.status === 'resolved').length;
  const onlineOfficers = officers.filter((o) => o.status === 'online').length;
  const highRiskCount = reports.filter((r) => r.risk_level === 'high' && r.status !== 'resolved').length;

  const riskStatus = highRiskCount >= 2 ? 'critical' : highRiskCount === 1 ? 'elevated' : 'normal';
  const riskLabel = { critical: 'حرج', elevated: 'مرتفع', normal: 'طبيعي' }[riskStatus];
  const riskColor = {
    critical: 'dark:text-red-400 dark:border-red-500/30 text-red-600 border-red-200',
    elevated: 'dark:text-amber-400 dark:border-amber-500/30 text-amber-600 border-amber-200',
    normal: 'dark:text-emerald-400 dark:border-emerald-500/30 text-emerald-600 border-emerald-200',
  }[riskStatus];

  const stats = [
    { label: 'بلاغات نشطة', value: activeReports, icon: AlertTriangle, color: 'text-red-400', bg: 'dark:bg-red-500/10 bg-red-50' },
    { label: 'بلاغات تم حلها', value: resolvedReports, icon: CheckCircle2, color: 'text-emerald-400', bg: 'dark:bg-emerald-500/10 bg-emerald-50' },
    { label: 'ضباط على الخط', value: onlineOfficers, icon: ShieldCheck, color: 'text-sky-400', bg: 'dark:bg-sky-500/10 bg-sky-50' },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {stats.map((stat) => (
        <StatCard key={stat.label} {...stat} />
      ))}
      <div className={`rounded-xl p-4 border ${riskColor} dark:bg-command-card bg-white transition-colors`}>
        <div className="flex items-center justify-between mb-2">
          <Activity size={20} />
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-current/10">حالة المخاطر</span>
        </div>
        <div className="text-2xl font-black">{riskLabel}</div>
        <div className="text-xs mt-1 opacity-60">المستوى الحالي للمخاطر</div>
      </div>
    </div>
  );
}

function StatCard({ label, value, icon: Icon, color, bg }: { label: string; value: number; icon: typeof AlertTriangle; color: string; bg: string }) {
  const [displayValue, setDisplayValue] = useState(0);
  const prevValue = useRef(0);

  useEffect(() => {
    if (value === prevValue.current) return;
    const diff = value - prevValue.current;
    const steps = 20;
    const stepValue = diff / steps;
    let current = prevValue.current;
    let step = 0;

    const interval = setInterval(() => {
      step++;
      current += stepValue;
      if (step >= steps) {
        setDisplayValue(value);
        prevValue.current = value;
        clearInterval(interval);
      } else {
        setDisplayValue(Math.round(current));
      }
    }, 25);

    return () => clearInterval(interval);
  }, [value]);

  return (
    <div className={`rounded-xl p-4 border dark:border-command-border border-slate-200 dark:bg-command-card bg-white transition-colors hover:scale-[1.02] transition-transform duration-200`}>
      <div className="flex items-center justify-between mb-2">
        <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${bg}`}>
          <Icon size={18} className={color} />
        </div>
      </div>
      <div className={`text-2xl font-black ${color}`}>{displayValue}</div>
      <div className="text-xs mt-1 dark:text-emerald-100/50 text-gray-500">{label}</div>
    </div>
  );
}
