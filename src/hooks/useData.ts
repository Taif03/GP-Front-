import { supabase } from '@/lib/supabase';
import type { Officer, Report, Shift, ReportWithOfficer, ShiftWithOfficer } from '@/types';

export async function fetchOfficers(): Promise<Officer[]> {
  const { data, error } = await supabase.from('officers').select('*').order('name');
  if (error) throw error;
  return data ?? [];
}

export async function fetchReports(): Promise<ReportWithOfficer[]> {
  const { data, error } = await supabase
    .from('reports')
    .select('*, assigned_officer:officers(*)')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data ?? []) as ReportWithOfficer[];
}

export async function fetchShifts(): Promise<ShiftWithOfficer[]> {
  const { data, error } = await supabase
    .from('shifts')
    .select('*, officer:officers(*)')
    .eq('shift_date', new Date().toISOString().split('T')[0])
    .order('start_time');
  if (error) throw error;
  return (data ?? []) as ShiftWithOfficer[];
}

export async function fetchShiftsForOfficer(officerId: string): Promise<Shift[]> {
  const today = new Date().toISOString().split('T')[0];
  const { data, error } = await supabase
    .from('shifts')
    .select('*')
    .eq('officer_id', officerId)
    .eq('shift_date', today)
    .order('start_time')
    .maybeSingle();
  if (error) throw error;
  return data ? [data] : [];
}

export async function updateReportStatus(reportId: string, status: string): Promise<void> {
  const { error } = await supabase
    .from('reports')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', reportId);
  if (error) throw error;
}

export async function assignOfficerToReport(reportId: string, officerId: string): Promise<void> {
  const { error } = await supabase
    .from('reports')
    .update({
      assigned_officer_id: officerId,
      status: 'assigned',
      updated_at: new Date().toISOString(),
    })
    .eq('id', reportId);
  if (error) throw error;
}

export async function createReport(report: Partial<Report>): Promise<Report> {
  const { data, error } = await supabase.from('reports').insert(report).select().single();
  if (error) throw error;
  return data;
}

export async function updateOfficerStatus(officerId: string, status: string): Promise<void> {
  const { error } = await supabase.from('officers').update({ status }).eq('id', officerId);
  if (error) throw error;
}

export interface SimulationScenario {
  title: string;
  description: string;
  gate_name: string;
  latitude: number;
  longitude: number;
  risk_level: 'high' | 'medium' | 'low';
}

const SIMULATION_SCENARIOS: SimulationScenario[] = [
  {
    title: 'تكدس مفاجئ عند باب السلام - رصد آلي',
    description: 'رصدت كاميرات المراقبة الذكية تكدساً مفاجئاً في تدفق المعتمرين عند بوابة السلام. يُنصح بإرسال وحدات أمنية إضافية لتنظيم الحركة ومنع التدافع.',
    gate_name: 'بوابة السلام',
    latitude: 21.4135,
    longitude: 39.8232,
    risk_level: 'high',
  },
  {
    title: 'سقوط معتمر وكبار سن - رصد آلي بالكاميرا',
    description: 'تم رصد معتمر كبير في السن قد سقط أرضاً بسبب الزحام عند الساحة الشرقية. يحتاج إلى إسعاف فوري ومساعدة طبية.',
    gate_name: 'الساحة الشرقية',
    latitude: 21.4245,
    longitude: 39.8302,
    risk_level: 'high',
  },
  {
    title: 'ازدحام متزايد عند بوابة الملك فهد - رصد آلي',
    description: 'كاميرات الذكاء الاصطناعي رصدت زيادة مفاجئة في كثافة الحشود عند بوابة الملك فهد. معدل التدفق تجاوز الحد الآمن.',
    gate_name: 'بوابة الملك فهد',
    latitude: 21.4185,
    longitude: 39.8262,
    risk_level: 'high',
  },
  {
    title: 'حركة غير طبيعية في منطقة المسعى - رصد آلي',
    description: 'رصد النظام الذكي حركة عكسية في مسار المسعى قد تسبب اختناق. يُنصح بتنظيم المسارات فوراً.',
    gate_name: 'المسعى',
    latitude: 21.4220,
    longitude: 39.8180,
    risk_level: 'medium',
  },
  {
    title: 'تجمع غير مصرح به قرب بوابة العمرة - رصد آلي',
    description: 'رصدت كاميرات الأمن تجمعاً غير مصرح به في المنطقة المحيطة ببوابة العمرة. يتطلب تدخل فوري للتفريق.',
    gate_name: 'بوابة العمرة',
    latitude: 21.4110,
    longitude: 39.8200,
    risk_level: 'medium',
  },
  {
    title: 'تدفق كثيف من جهة أجياد - رصد آلي',
    description: 'كاميرات المراقبة رصدت تدفقاً كثيفاً ومتسارعاً من جهة أجياد باتجاه المسجد الحرام. الوضع يتطلب مراقبة عن كثب.',
    gate_name: 'أجياد',
    latitude: 21.4155,
    longitude: 39.8192,
    risk_level: 'low',
  },
];

export function getRandomSimulationScenario(): SimulationScenario {
  return SIMULATION_SCENARIOS[Math.floor(Math.random() * SIMULATION_SCENARIOS.length)];
}

export async function simulateCameraDetection(): Promise<Report> {
  const scenario = getRandomSimulationScenario();
  const now = new Date().toISOString();

  const { data, error } = await supabase
    .from('reports')
    .insert({
      title: scenario.title,
      description: scenario.description,
      gate_name: scenario.gate_name,
      latitude: scenario.latitude,
      longitude: scenario.longitude,
      risk_level: scenario.risk_level,
      status: 'active',
      reporter_name: 'نظام الكاميرات الذكي',
      reporter_phone: 'آلي',
      created_at: now,
      updated_at: now,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}
