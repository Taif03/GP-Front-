import { useState, useCallback, useEffect, useRef } from 'react';
import {
  Shield, Clock, MapPin, CheckCircle2, AlertTriangle, Loader2,
  Phone, IdCard, User, Activity, Bell, Navigation
} from 'lucide-react';
import { fetchOfficers, fetchReports, fetchShiftsForOfficer, updateReportStatus } from '@/hooks/useData';
import { useRealtimeReports } from '@/hooks/useRealtimeReports';
import { useToast } from '@/context/ToastContext';
import { useTheme } from '@/context/ThemeContext';
import { StatusBadge, RiskBadge, OfficerStatusBadge } from '@/components/Badges';
import type { Officer, ReportWithOfficer, Shift } from '@/types';

export default function OfficerPortal() {
  const { showToast } = useToast();
  const { theme } = useTheme();
  const [officers, setOfficers] = useState<Officer[]>([]);
  const [reports, setReports] = useState<ReportWithOfficer[]>([]);
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [selectedOfficerId, setSelectedOfficerId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [completingId, setCompletingId] = useState<string | null>(null);
  const prevAssignedReportIds = useRef<Set<string>>(new Set());

  const loadData = useCallback(async () => {
    try {
      const [officerList, reportList] = await Promise.all([fetchOfficers(), fetchReports()]);
      setOfficers(officerList);
      setReports(reportList);

      // Auto-select first online officer if none selected
      if (!selectedOfficerId && officerList.length > 0) {
        const firstOnline = officerList.find((o) => o.status === 'online') ?? officerList[0];
        setSelectedOfficerId(firstOnline.id);
        const shiftData = await fetchShiftsForOfficer(firstOnline.id);
        setShifts(shiftData);
      } else if (selectedOfficerId) {
        const shiftData = await fetchShiftsForOfficer(selectedOfficerId);
        setShifts(shiftData);
      }
    } catch (err) {
      console.error('Failed to load data:', err);
    } finally {
      setLoading(false);
    }
  }, [selectedOfficerId]);

  // Initial load
  useEffect(() => {
    loadData();
  }, [loadData]);

  // Realtime subscription for reports
  useRealtimeReports({
    onReports: (data) => {
      setReports(data);
    },
  });

  // Periodic officers refresh
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const officerList = await fetchOfficers();
        setOfficers(officerList);
      } catch (err) {
        console.error('Failed to refresh officers:', err);
      }
    }, 15000);
    return () => clearInterval(interval);
  }, []);

  // Check for newly assigned reports and trigger notifications
  useEffect(() => {
    if (!selectedOfficerId) return;

    const myAssignedReports = reports.filter(
      (r) => r.assigned_officer_id === selectedOfficerId && r.status === 'assigned'
    );
    const currentIds = new Set(myAssignedReports.map((r) => r.id));

    if (prevAssignedReportIds.current.size > 0) {
      const newIds = [...currentIds].filter((id) => !prevAssignedReportIds.current.has(id));
      if (newIds.length > 0) {
        const newReport = myAssignedReports.find((r) => newIds.includes(r.id));
        if (newReport) {
          showToast(
            'warning',
            'بلاغ جديد مسند إليك!',
            `${newReport.title} - ${newReport.gate_name}`,
            true
          );
        }
      }
    }
    prevAssignedReportIds.current = currentIds;
  }, [reports, selectedOfficerId, showToast]);

  const handleCompleteTask = async (reportId: string) => {
    setCompletingId(reportId);
    try {
      await updateReportStatus(reportId, 'resolved');
      showToast('success', 'تم إنجاز المهمة', 'تم تحديث حالة البلاغ إلى "تم الحل" وإبلاغ مركز القيادة');
      loadData();
    } catch (err) {
      showToast('warning', 'خطأ', 'تعذر تحديث حالة البلاغ');
    } finally {
      setCompletingId(null);
    }
  };

  const selectedOfficer = officers.find((o) => o.id === selectedOfficerId);
  const myShift = shifts[0];
  const myReports = reports.filter((r) => r.assigned_officer_id === selectedOfficerId);
  const activeTasks = myReports.filter((r) => r.status !== 'resolved');
  const completedTasks = myReports.filter((r) => r.status === 'resolved');

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
        <Loader2 className="animate-spin text-emerald-500" size={32} />
      </div>
    );
  }

  return (
    <div className={`min-h-[calc(100vh-4rem)] pt-16 px-3 lg:px-5 pb-5 ${theme === 'dark' ? 'bg-command-bg' : 'bg-slate-50'} transition-colors duration-300`}>
      {/* Officer Selector */}
      <div className="mb-4 flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          <User size={18} className="dark:text-emerald-300 text-emerald-700" />
          <span className="text-sm font-bold dark:text-emerald-100 text-gray-700">رجل الأمن:</span>
        </div>
        <select
          value={selectedOfficerId ?? ''}
          onChange={(e) => {
            setSelectedOfficerId(e.target.value);
            prevAssignedReportIds.current = new Set();
          }}
          className="px-3 py-1.5 rounded-lg text-sm font-bold dark:bg-command-surface dark:text-command-cream dark:border-command-border bg-white border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-600"
        >
          {officers.map((o) => (
            <option key={o.id} value={o.id}>
              {o.name} ({o.badge_number})
            </option>
          ))}
        </select>
      </div>

      {selectedOfficer && (
        <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-4">
          {/* Left: Profile + Shift */}
          <div className="space-y-4">
            {/* Profile Card */}
            <div className={`rounded-2xl border p-5 shadow-xl ${theme === 'dark' ? 'bg-command-surface border-command-border' : 'bg-white border-slate-200'}`}>
              <div className="flex items-center gap-4 mb-4">
                <div className="relative shrink-0">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-700 to-emerald-900 flex items-center justify-center shadow-lg dark:shadow-emerald-900/40">
                    <Shield className="text-command-cream" size={28} />
                  </div>
                  <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 ${
                    selectedOfficer.status === 'online' ? 'bg-emerald-500 dark:border-command-surface border-white' :
                    selectedOfficer.status === 'on_break' ? 'bg-amber-500 dark:border-command-surface border-white' :
                    'bg-slate-500 dark:border-command-surface border-white'
                  }`} />
                </div>
                <div className="min-w-0 flex-1">
                  <h2 className="text-lg font-black dark:text-command-cream text-gray-900 truncate">{selectedOfficer.name}</h2>
                  <p className="text-xs dark:text-emerald-200/50 text-slate-500 mt-0.5">{selectedOfficer.rank}</p>
                  <div className="mt-1.5">
                    <OfficerStatusBadge status={selectedOfficer.status} />
                  </div>
                </div>
              </div>

              <div className="space-y-2.5">
                <ProfileRow icon={IdCard} label="الرقم الوظيفي" value={selectedOfficer.badge_number} />
                <ProfileRow icon={Phone} label="رقم التواصل" value={selectedOfficer.phone ?? 'غير متاح'} />
                <ProfileRow icon={MapPin} label="محطة الخدمة" value={selectedOfficer.duty_station ?? 'غير محدد'} />
              </div>
            </div>

            {/* Shift Schedule Card */}
            <div className={`rounded-2xl border p-5 shadow-xl ${theme === 'dark' ? 'bg-command-surface border-command-border' : 'bg-white border-slate-200'}`}>
              <div className="flex items-center gap-2 mb-4">
                <Clock size={18} className="dark:text-emerald-300 text-emerald-700" />
                <h3 className="font-bold text-sm dark:text-command-cream text-gray-900">جدول المناوبة والموقع</h3>
              </div>

              {myShift ? (
                <div className="space-y-3">
                  <div className={`rounded-xl p-3 ${theme === 'dark' ? 'bg-command-card border border-command-border' : 'bg-slate-50 border border-slate-200'}`}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold dark:text-emerald-200/50 text-slate-500">تاريخ المناوبة</span>
                      <span className="text-xs dark:text-command-cream text-gray-700 font-bold">
                        {new Date(myShift.shift_date).toLocaleDateString('ar-SA', { weekday: 'long', day: 'numeric', month: 'long' })}
                      </span>
                    </div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold dark:text-emerald-200/50 text-slate-500">وقت المناوبة</span>
                      <div className="flex items-center gap-1.5">
                        <Clock size={14} className="dark:text-emerald-400 text-emerald-600" />
                        <span className="text-sm font-black dark:text-command-cream text-gray-900">
                          {myShift.start_time} - {myShift.end_time}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold dark:text-emerald-200/50 text-slate-500">موقع الخدمة</span>
                      <div className="flex items-center gap-1.5">
                        <MapPin size={14} className="dark:text-emerald-400 text-emerald-600" />
                        <span className="text-sm font-bold dark:text-command-cream text-gray-900">{myShift.station}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-xl dark:bg-command-card dark:border dark:border-command-border bg-slate-50 border border-slate-200">
                    <div className="flex items-center gap-2">
                      <Activity size={16} className="text-emerald-500" />
                      <span className="text-xs font-bold dark:text-emerald-200/50 text-slate-500">حالة المناوبة</span>
                    </div>
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                      myShift.status === 'active' ? 'dark:bg-emerald-500/15 dark:text-emerald-400 bg-emerald-100 text-emerald-700' :
                      myShift.status === 'scheduled' ? 'dark:bg-sky-500/15 dark:text-sky-400 bg-sky-100 text-sky-700' :
                      'dark:bg-slate-500/15 dark:text-slate-400 bg-slate-100 text-slate-600'
                    }`}>
                      {myShift.status === 'active' ? 'نشطة الآن' : myShift.status === 'scheduled' ? 'مجدولة' : 'مكتملة'}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="text-center py-6 text-sm dark:text-emerald-200/40 text-slate-400">
                  لا توجد مناوبة مجدولة اليوم
                </div>
              )}
            </div>
          </div>

          {/* Right: Tasks Feed */}
          <div className="space-y-4">
            {/* Tasks Summary */}
            <div className="grid grid-cols-2 gap-3">
              <div className={`rounded-xl border p-4 ${theme === 'dark' ? 'bg-command-surface border-command-border' : 'bg-white border-slate-200'}`}>
                <div className="flex items-center gap-2 mb-1">
                  <AlertTriangle size={16} className="text-amber-400" />
                  <span className="text-xs dark:text-emerald-200/50 text-slate-500">مهام نشطة</span>
                </div>
                <div className="text-2xl font-black text-amber-400">{activeTasks.length}</div>
              </div>
              <div className={`rounded-xl border p-4 ${theme === 'dark' ? 'bg-command-surface border-command-border' : 'bg-white border-slate-200'}`}>
                <div className="flex items-center gap-2 mb-1">
                  <CheckCircle2 size={16} className="text-emerald-400" />
                  <span className="text-xs dark:text-emerald-200/50 text-slate-500">مهام مكتملة</span>
                </div>
                <div className="text-2xl font-black text-emerald-400">{completedTasks.length}</div>
              </div>
            </div>

            {/* Tasks Feed */}
            <div className={`rounded-2xl border shadow-xl overflow-hidden ${theme === 'dark' ? 'bg-command-surface border-command-border' : 'bg-white border-slate-200'}`}>
              <div className="flex items-center justify-between p-4 border-b dark:border-command-border border-slate-200">
                <div className="flex items-center gap-2">
                  <Bell size={18} className="dark:text-emerald-300 text-emerald-700" />
                  <h3 className="font-bold text-sm dark:text-command-cream text-gray-900">المهمات والبلاغات المسندة</h3>
                </div>
                <span className="text-xs font-bold px-2 py-0.5 rounded-full dark:bg-emerald-500/15 dark:text-emerald-400 bg-emerald-100 text-emerald-700">
                  {myReports.length} إجمالي
                </span>
              </div>

              <div className="p-3 space-y-3 max-h-[calc(100vh-22rem)] overflow-y-auto">
                {myReports.length === 0 ? (
                  <div className="text-center py-12">
                    <CheckCircle2 size={48} className="mx-auto mb-3 dark:text-emerald-800/40 text-emerald-200" />
                    <p className="text-sm dark:text-emerald-200/40 text-slate-400">لا توجد مهام مسندة إليك حالياً</p>
                    <p className="text-xs dark:text-emerald-200/30 text-slate-400 mt-1">سيتم إشعارك فور إسناد مهمة جديدة</p>
                  </div>
                ) : (
                  myReports.map((report) => (
                    <TaskCard
                      key={report.id}
                      report={report}
                      onComplete={() => handleCompleteTask(report.id)}
                      completing={completingId === report.id}
                    />
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ProfileRow({ icon: Icon, label, value }: { icon: typeof Shield; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className="w-8 h-8 rounded-lg dark:bg-command-card dark:border dark:border-command-border bg-slate-50 flex items-center justify-center shrink-0">
        <Icon size={14} className="dark:text-emerald-300/60 text-slate-400" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[10px] font-bold dark:text-emerald-200/40 text-slate-400">{label}</p>
        <p className="text-sm dark:text-command-cream text-gray-800 truncate">{value}</p>
      </div>
    </div>
  );
}

function TaskCard({
  report,
  onComplete,
  completing,
}: {
  report: ReportWithOfficer;
  onComplete: () => void;
  completing: boolean;
}) {
  const isResolved = report.status === 'resolved';

  return (
    <div className={`rounded-xl border p-4 transition-all duration-200 ${
      isResolved
        ? 'dark:bg-command-card/50 dark:border-command-border/50 bg-slate-50/50 border-slate-200/50 opacity-70'
        : report.status === 'assigned'
        ? 'dark:bg-amber-950/20 dark:border-amber-700/30 bg-amber-50/50 border-amber-200'
        : 'dark:bg-command-card dark:border-command-border bg-slate-50 border-slate-200'
    }`}>
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <div
            className="w-2 h-2 rounded-full shrink-0"
            style={{
              backgroundColor: report.risk_level === 'high' ? '#ef4444' : report.risk_level === 'medium' ? '#f59e0b' : '#10b981',
            }}
          />
          <h4 className="text-sm font-bold dark:text-command-cream text-gray-900 leading-tight">{report.title}</h4>
        </div>
        <StatusBadge status={report.status} />
      </div>

      {report.description && (
        <p className="text-xs dark:text-emerald-100/60 text-slate-600 mb-3 leading-relaxed line-clamp-2">{report.description}</p>
      )}

      <div className="flex items-center gap-3 mb-3 flex-wrap">
        <div className="flex items-center gap-1.5 text-xs dark:text-emerald-200/50 text-slate-500">
          <MapPin size={12} />
          {report.gate_name}
        </div>
        <RiskBadge level={report.risk_level} />
      </div>

      {/* GPS coordinates + navigate button */}
      <div className="flex items-center gap-2 mb-3">
        <div className="flex items-center gap-1 text-[10px] dark:text-emerald-200/30 text-slate-400">
          <Navigation size={10} />
          {Number(report.latitude).toFixed(4)}, {Number(report.longitude).toFixed(4)}
        </div>
        <a
          href={`https://www.openstreetmap.org/?mlat=${report.latitude}&mlon=${report.longitude}#map=18/${report.latitude}/${report.longitude}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[10px] font-bold text-sky-400 hover:text-sky-300 transition-colors"
        >
          فتح في الخريطة
        </a>
      </div>

      {report.reporter_name && (
        <div className="flex items-center gap-2 text-xs dark:text-emerald-200/40 text-slate-500 mb-3">
          <Phone size={11} />
          {report.reporter_name} · {report.reporter_phone}
        </div>
      )}

      {/* Action button */}
      {!isResolved ? (
        <button
          onClick={onComplete}
          disabled={completing}
          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold bg-emerald-700 text-command-cream hover:bg-emerald-600 transition-colors disabled:opacity-50"
        >
          {completing ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              جاري التحديث...
            </>
          ) : (
            <>
              <CheckCircle2 size={16} />
              تم الإنجاز
            </>
          )}
        </button>
      ) : (
        <div className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold dark:bg-emerald-500/10 dark:text-emerald-400 bg-emerald-100 text-emerald-700">
          <CheckCircle2 size={16} />
          تم إنجاز المهمة
        </div>
      )}
    </div>
  );
}
