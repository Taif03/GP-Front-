import { useState, useCallback, useEffect, useRef } from 'react';
import { Radio, Loader2, Camera, Sparkles } from 'lucide-react';
import MapOpsCenter from '@/components/map/MapOpsCenter';
import StatsCounter from '@/components/dashboard/StatsCounter';
import ReportsList from '@/components/dashboard/ReportsList';
import ReportModal from '@/components/dashboard/ReportModal';
import { fetchReports, fetchOfficers, simulateCameraDetection } from '@/hooks/useData';
import { useRealtimeReports } from '@/hooks/useRealtimeReports';
import { useToast } from '@/context/ToastContext';
import type { ReportWithOfficer, Officer } from '@/types';

export default function CommandDashboard() {
  const { showToast } = useToast();
  const [reports, setReports] = useState<ReportWithOfficer[]>([]);
  const [officers, setOfficers] = useState<Officer[]>([]);
  const [selectedReport, setSelectedReport] = useState<ReportWithOfficer | null>(null);
  const [loading, setLoading] = useState(true);
  const [simulating, setSimulating] = useState(false);
  const [freshReportIds, setFreshReportIds] = useState<Set<string>>(new Set());
  const knownReportIds = useRef<Set<string>>(new Set());
  const isInitialLoad = useRef(true);

  const loadData = useCallback(async () => {
    try {
      const [r, o] = await Promise.all([fetchReports(), fetchOfficers()]);
      setReports(r);
      setOfficers(o);
    } catch (err) {
      console.error('Failed to load data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    loadData();
  }, [loadData]);

  // Realtime subscription
  useRealtimeReports({
    onReports: (data) => {
      setReports(data);

      if (isInitialLoad.current) {
        knownReportIds.current = new Set(data.map((r) => r.id));
        isInitialLoad.current = false;
        return;
      }

      const newReports = data.filter((r) => !knownReportIds.current.has(r.id));
      if (newReports.length > 0) {
        const newIds = new Set([...freshReportIds]);
        const newKnownIds = new Set(knownReportIds.current);
        newReports.forEach((r) => {
          newIds.add(r.id);
          newKnownIds.add(r.id);
        });
        setFreshReportIds(newIds);
        knownReportIds.current = newKnownIds;

        // Show toast and play sound for each new report
        newReports.forEach((r) => {
          const isAutoDetected = r.reporter_name === 'نظام الكاميرات الذكي';
          if (isAutoDetected) {
            showToast(
              'warning',
              'تنبيه آلي: تم رصد حادثة جديدة بواسطة الكاميرات!',
              `${r.title} — ${r.gate_name}`,
              true
            );
          } else {
            showToast(
              'warning',
              'بلاغ جديد وارد',
              `${r.title} — ${r.gate_name}`,
              true
            );
          }
        });

        // Clear fresh highlight after 10 seconds
        setTimeout(() => {
          setFreshReportIds((prev) => {
            const next = new Set(prev);
            newReports.forEach((r) => next.delete(r.id));
            return next;
          });
        }, 10000);
      } else {
        knownReportIds.current = new Set(data.map((r) => r.id));
      }
    },
  });

  // Periodic officers refresh (reports are realtime now)
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const o = await fetchOfficers();
        setOfficers(o);
      } catch (err) {
        console.error('Failed to refresh officers:', err);
      }
    }, 15000);
    return () => clearInterval(interval);
  }, []);

  const handleSimulateCamera = async () => {
    setSimulating(true);
    try {
      await simulateCameraDetection();
    } catch (err) {
      showToast('warning', 'خطأ', 'تعذر محاكاة رصد الكاميرا. يرجى المحاولة مرة أخرى.');
    } finally {
      setSimulating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
        <Loader2 className="animate-spin text-emerald-500" size={32} />
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] pt-16 px-3 lg:px-5 pb-5 dark:bg-command-bg bg-slate-50 transition-colors duration-300">
      {/* Header Banner + Simulation Button */}
      <div className="flex items-center justify-between gap-3 mb-4 flex-wrap">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full dark:bg-emerald-950/60 dark:border dark:border-emerald-800/40 bg-emerald-50 border border-emerald-200">
            <Radio size={14} className="text-emerald-500 animate-pulse" />
            <span className="text-xs font-bold dark:text-emerald-300 text-emerald-700">مركز العمليات - المسجد الحرام</span>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full dark:bg-emerald-950/60 dark:border dark:border-emerald-800/40 bg-emerald-50 border border-emerald-200">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            <span className="text-xs font-bold dark:text-emerald-300 text-emerald-700">متصل مباشر (Realtime)</span>
          </div>
        </div>

        <button
          onClick={handleSimulateCamera}
          disabled={simulating}
          className="group flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all duration-200 dark:bg-command-card dark:border dark:border-emerald-700/40 dark:text-emerald-300 dark:hover:border-emerald-600 dark:hover:bg-emerald-900/30 bg-white border border-emerald-300 text-emerald-700 hover:border-emerald-500 hover:shadow-md disabled:opacity-50"
        >
          {simulating ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              جاري المحاكاة...
            </>
          ) : (
            <>
              <Camera size={16} className="group-hover:scale-110 transition-transform" />
              تجربة رصد كاميرا
              <Sparkles size={14} className="text-amber-400" />
            </>
          )}
        </button>
      </div>

      {/* Stats */}
      <div className="mb-4">
        <StatsCounter reports={reports} officers={officers} />
      </div>

      {/* Main Grid: Map + Reports List */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-4" style={{ height: 'calc(100vh - 18rem)' }}>
        <div className="min-h-[400px]">
          <MapOpsCenter
            reports={reports}
            officers={officers}
            onReportClick={setSelectedReport}
            freshReportIds={freshReportIds}
          />
        </div>
        <div className="h-full">
          <ReportsList reports={reports} onReportClick={setSelectedReport} />
        </div>
      </div>

      {/* Report Modal */}
      <ReportModal
        report={selectedReport}
        officers={officers}
        onClose={() => setSelectedReport(null)}
        onUpdate={loadData}
      />
    </div>
  );
}
