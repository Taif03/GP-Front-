import { useEffect, useRef, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { fetchReports } from '@/hooks/useData';
import type { ReportWithOfficer } from '@/types';

interface UseRealtimeReportsOptions {
  onReports: (reports: ReportWithOfficer[]) => void;
  onNewReport?: (report: ReportWithOfficer) => void;
  onUpdateReport?: (report: ReportWithOfficer) => void;
  onDeleteReport?: (reportId: string) => void;
  enabled?: boolean;
}

export function useRealtimeReports({
  onReports,
  onNewReport,
  onUpdateReport,
  onDeleteReport,
  enabled = true,
}: UseRealtimeReportsOptions) {
  const onReportsRef = useRef(onReports);
  const onNewRef = useRef(onNewReport);
  const onUpdateRef = useRef(onUpdateReport);
  const onDeleteRef = useRef(onDeleteReport);

  onReportsRef.current = onReports;
  onNewRef.current = onNewReport;
  onUpdateRef.current = onUpdateReport;
  onDeleteRef.current = onDeleteReport;

  const refresh = useCallback(async () => {
    try {
      const data = await fetchReports();
      onReportsRef.current(data);
    } catch (err) {
      console.error('Realtime refresh failed:', err);
    }
  }, []);

  useEffect(() => {
    if (!enabled) return;

    const channel = supabase
      .channel('reports-realtime')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'reports' },
        async (payload) => {
          await refresh();
          const newReport = await fetchSingleReport(payload.new.id);
          if (newReport) onNewRef.current?.(newReport);
        }
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'reports' },
        async (payload) => {
          await refresh();
          const updated = await fetchSingleReport(payload.new.id);
          if (updated) onUpdateRef.current?.(updated);
        }
      )
      .on(
        'postgres_changes',
        { event: 'DELETE', schema: 'public', table: 'reports' },
        (payload) => {
          onDeleteRef.current?.(payload.old.id);
          refresh();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [enabled, refresh]);

  return { refresh };
}

async function fetchSingleReport(id: string): Promise<ReportWithOfficer | null> {
  const { data, error } = await supabase
    .from('reports')
    .select('*, assigned_officer:officers(*)')
    .eq('id', id)
    .maybeSingle();
  if (error) return null;
  return data as ReportWithOfficer;
}
