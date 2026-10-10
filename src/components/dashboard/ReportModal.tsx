import { useState, useEffect } from 'react';
import { X, AlertTriangle, MapPin, User, Phone, Clock, Shield, Save } from 'lucide-react';
import type { ReportWithOfficer, Officer, ReportStatus } from '@/types';
import { StatusBadge, RiskBadge, OfficerStatusBadge } from '@/components/Badges';
import { useToast } from '@/context/ToastContext';
import { supabase } from '@/lib/supabase';

interface ReportModalProps {
  report: ReportWithOfficer | null;
  officers: Officer[];
  onClose: () => void;
  onUpdate: () => void;
}

export default function ReportModal({ report, officers, onClose, onUpdate }: ReportModalProps) {
  const { showToast } = useToast();
  const [selectedStatus, setSelectedStatus] = useState<ReportStatus>('active');
  const [selectedOfficerId, setSelectedOfficerId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (report) {
      setSelectedStatus(report.status);
      setSelectedOfficerId(report.assigned_officer_id);
    }
  }, [report]);

  if (!report) return null;

  const handleSave = async () => {
    if (!report) return;
    setSaving(true);
    try {
      const updates: Record<string, unknown> = {
        status: selectedStatus,
        updated_at: new Date().toISOString(),
      };
      if (selectedOfficerId !== report.assigned_officer_id) {
        updates.assigned_officer_id = selectedOfficerId;
        if (selectedOfficerId && selectedStatus === 'active') {
          updates.status = 'assigned';
        }
      }

      const { error } = await supabase.from('reports').update(updates).eq('id', report.id);
      if (error) throw error;

      showToast('success', 'تم تحديث البلاغ', `تم تحديث حالة البلاغ بنجاح`);
      onUpdate();
      onClose();
    } catch (err) {
      showToast('warning', 'خطأ', 'تعذر تحديث البلاغ. يرجى المحاولة مرة أخرى.');
    } finally {
      setSaving(false);
    }
  };

  const assignedOfficer = officers.find((o) => o.id === selectedOfficerId);
  const availableOfficers = officers.filter((o) => o.status === 'online');

  return (
    <div
      className="fixed inset-0 z-[2000] flex items-center justify-center p-4 animate-fade-in"
      onClick={onClose}
    >
      <div className="absolute inset-0 dark:bg-black/70 bg-black/40 backdrop-blur-sm" />

      <div
        className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl border dark:bg-command-surface dark:border-command-border bg-white border-slate-200 shadow-2xl animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-start justify-between p-5 border-b dark:bg-command-surface dark:border-command-border bg-white border-slate-200">
          <div className="flex items-start gap-3 flex-1">
            <div className="w-10 h-10 rounded-xl bg-red-500/15 flex items-center justify-center shrink-0">
              <AlertTriangle className="text-red-500" size={22} />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-lg dark:text-command-cream text-gray-900">{report.title}</h3>
              <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                <StatusBadge status={report.status} />
                <RiskBadge level={report.risk_level} />
              </div>
            </div>
          </div>
          <button onClick={onClose} className="dark:text-emerald-200/40 text-gray-400 hover:opacity-70 transition-opacity shrink-0">
            <X size={22} />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4">
          {/* Description */}
          {report.description && (
            <div className="dark:bg-command-card dark:border-command-border bg-slate-50 border border-slate-200 rounded-xl p-4">
              <p className="text-xs font-bold dark:text-emerald-200/50 text-slate-500 mb-1.5">الوصف</p>
              <p className="text-sm dark:text-command-cream/90 text-gray-700 leading-relaxed">{report.description}</p>
            </div>
          )}

          {/* Info Grid */}
          <div className="grid grid-cols-2 gap-3">
            <InfoItem icon={MapPin} label="الموقع" value={report.gate_name} />
            <InfoItem
              icon={Clock}
              label="وقت البلاغ"
              value={new Date(report.created_at).toLocaleString('ar-SA', { hour: '2-digit', minute: '2-digit', day: 'numeric', month: 'short' })}
            />
            <InfoItem icon={User} label="المُبلّغ" value={report.reporter_name ?? 'غير محدد'} />
            <InfoItem icon={Phone} label="رقم التواصل" value={report.reporter_phone ?? 'غير متاح'} />
          </div>

          {/* Status Control */}
          <div className="dark:bg-command-card dark:border-command-border bg-slate-50 border border-slate-200 rounded-xl p-4">
            <p className="text-xs font-bold dark:text-emerald-200/50 text-slate-500 mb-3">تغيير حالة البلاغ</p>
            <div className="grid grid-cols-3 gap-2">
              {(['active', 'assigned', 'resolved'] as ReportStatus[]).map((s) => (
                <button
                  key={s}
                  onClick={() => setSelectedStatus(s)}
                  className={`py-2.5 px-3 rounded-lg text-sm font-bold transition-all duration-200 ${
                    selectedStatus === s
                      ? 'dark:bg-emerald-800 dark:text-command-cream bg-emerald-600 text-white shadow-md'
                      : 'dark:bg-command-bg dark:text-emerald-200/40 bg-slate-100 text-slate-500 hover:dark:bg-command-border'
                  }`}
                >
                  {s === 'active' ? 'نشط' : s === 'assigned' ? 'مُسند' : 'تم الحل'}
                </button>
              ))}
            </div>
          </div>

          {/* Officer Assignment */}
          <div className="dark:bg-command-card dark:border-command-border bg-slate-50 border border-slate-200 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <Shield size={16} className="text-sky-400" />
              <p className="text-xs font-bold dark:text-emerald-200/50 text-slate-500">إسناد إلى رجل أمن</p>
            </div>
            <select
              value={selectedOfficerId ?? ''}
              onChange={(e) => setSelectedOfficerId(e.target.value || null)}
              className="w-full px-3 py-2.5 rounded-lg text-sm font-medium dark:bg-command-bg dark:text-command-cream dark:border-command-border bg-white border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-600"
            >
              <option value="">-- اختر رجل أمن --</option>
              {availableOfficers.map((officer) => (
                <option key={officer.id} value={officer.id}>
                  {officer.name} - {officer.badge_number} ({officer.duty_station})
                </option>
              ))}
              {/* Include currently assigned officer even if not online */}
              {assignedOfficer && assignedOfficer.status !== 'online' && (
                <option key={assignedOfficer.id} value={assignedOfficer.id}>
                  {assignedOfficer.name} - {assignedOfficer.badge_number} (حالي)
                </option>
              )}
            </select>

            {assignedOfficer && (
              <div className="mt-3 flex items-center gap-3 p-2.5 rounded-lg dark:bg-command-bg/60 bg-white border dark:border-command-border border-slate-200">
                <div className="w-8 h-8 rounded-full bg-sky-500/15 flex items-center justify-center shrink-0">
                  <Shield size={14} className="text-sky-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold dark:text-command-cream text-gray-900 truncate">{assignedOfficer.name}</p>
                  <p className="text-xs dark:text-emerald-200/40 text-slate-500">{assignedOfficer.rank} · {assignedOfficer.duty_station}</p>
                </div>
                <OfficerStatusBadge status={assignedOfficer.status} />
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 flex items-center gap-3 p-5 border-t dark:bg-command-surface dark:border-command-border bg-white border-slate-200">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl text-sm font-bold dark:bg-command-card dark:text-emerald-100/70 dark:border dark:border-command-border bg-slate-100 text-slate-600 hover:opacity-80 transition-opacity"
          >
            إلغاء
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold bg-emerald-700 text-command-cream hover:bg-emerald-600 transition-colors disabled:opacity-50"
          >
            <Save size={16} />
            {saving ? 'جاري الحفظ...' : 'حفظ التغييرات'}
          </button>
        </div>
      </div>
    </div>
  );
}

function InfoItem({ icon: Icon, label, value }: { icon: typeof MapPin; label: string; value: string }) {
  return (
    <div className="flex items-start gap-2.5 p-3 rounded-lg dark:bg-command-card dark:border dark:border-command-border bg-slate-50 border border-slate-200">
      <Icon size={16} className="dark:text-emerald-300/50 text-slate-400 mt-0.5 shrink-0" />
      <div className="min-w-0">
        <p className="text-[10px] font-bold dark:text-emerald-200/40 text-slate-400">{label}</p>
        <p className="text-sm dark:text-command-cream/90 text-gray-700 truncate">{value}</p>
      </div>
    </div>
  );
}
