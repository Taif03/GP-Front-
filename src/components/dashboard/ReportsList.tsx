import { AlertTriangle, MapPin, Clock, ChevronLeft } from 'lucide-react';
import type { ReportWithOfficer } from '@/types';
import { StatusBadge, RiskBadge } from '@/components/Badges';

interface ReportsListProps {
  reports: ReportWithOfficer[];
  onReportClick: (report: ReportWithOfficer) => void;
}

export default function ReportsList({ reports, onReportClick }: ReportsListProps) {
  const active = reports.filter((r) => r.status !== 'resolved');

  return (
    <div className="rounded-2xl border dark:bg-command-surface dark:border-command-border bg-white border-slate-200 shadow-xl overflow-hidden flex flex-col h-full">
      <div className="flex items-center justify-between p-4 border-b dark:border-command-border border-slate-200">
        <div className="flex items-center gap-2">
          <AlertTriangle size={18} className="text-amber-400" />
          <h3 className="font-bold text-sm dark:text-command-cream text-gray-900">البلاغات النشطة</h3>
        </div>
        <span className="text-xs font-bold px-2 py-0.5 rounded-full dark:bg-amber-500/15 dark:text-amber-400 bg-amber-100 text-amber-700">
          {active.length}
        </span>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-2 max-h-[calc(100vh-20rem)]">
        {reports.length === 0 ? (
          <div className="text-center py-8 text-sm dark:text-emerald-200/40 text-slate-400">
            لا توجد بلاغات حالياً
          </div>
        ) : (
          reports.map((report) => (
            <button
              key={report.id}
              onClick={() => onReportClick(report)}
              className="w-full text-right p-3 rounded-xl border dark:bg-command-card dark:border-command-border dark:hover:border-emerald-700/50 bg-slate-50 border-slate-200 hover:border-emerald-400 hover:shadow-md transition-all duration-200 group"
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex items-center gap-2 min-w-0">
                  <div
                    className="w-2 h-2 rounded-full shrink-0"
                    style={{
                      backgroundColor: report.risk_level === 'high' ? '#ef4444' : report.risk_level === 'medium' ? '#f59e0b' : '#10b981',
                    }}
                  />
                  <span className="text-sm font-bold dark:text-command-cream text-gray-900 truncate">{report.title}</span>
                </div>
                <ChevronLeft size={16} className="dark:text-emerald-200/30 text-slate-400 group-hover:dark:text-emerald-400 shrink-0 mt-0.5 transition-colors" />
              </div>

              <div className="flex items-center gap-1.5 text-xs dark:text-emerald-200/40 text-slate-500 mb-2">
                <MapPin size={11} />
                {report.gate_name}
              </div>

              <div className="flex items-center justify-between gap-2 flex-wrap">
                <div className="flex items-center gap-1.5">
                  <RiskBadge level={report.risk_level} />
                  <StatusBadge status={report.status} />
                </div>
                <div className="flex items-center gap-1 text-[10px] dark:text-emerald-200/30 text-slate-400">
                  <Clock size={10} />
                  {new Date(report.created_at).toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>

              {report.assigned_officer && (
                <div className="mt-2 flex items-center gap-1.5 text-[11px] dark:text-sky-300/60 text-sky-600">
                  <span className="w-5 h-5 rounded-full bg-sky-500/15 flex items-center justify-center text-[8px] font-bold">
                    {report.assigned_officer.name.charAt(0)}
                  </span>
                  {report.assigned_officer.name}
                </div>
              )}
            </button>
          ))
        )}
      </div>
    </div>
  );
}
