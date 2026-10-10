export type OfficerStatus = 'online' | 'offline' | 'on_break';
export type RiskLevel = 'high' | 'medium' | 'low';
export type ReportStatus = 'active' | 'assigned' | 'resolved';
export type ShiftStatus = 'scheduled' | 'active' | 'completed';

export interface Officer {
  id: string;
  name: string;
  badge_number: string;
  rank: string;
  phone: string | null;
  duty_station: string | null;
  status: OfficerStatus;
  created_at: string;
}

export interface Shift {
  id: string;
  officer_id: string;
  shift_date: string;
  start_time: string;
  end_time: string;
  station: string;
  status: ShiftStatus;
  created_at: string;
}

export interface Report {
  id: string;
  title: string;
  description: string | null;
  gate_name: string;
  latitude: number;
  longitude: number;
  risk_level: RiskLevel;
  status: ReportStatus;
  assigned_officer_id: string | null;
  reporter_name: string | null;
  reporter_phone: string | null;
  created_at: string;
  updated_at: string;
}

export interface ReportWithOfficer extends Report {
  assigned_officer?: Officer | null;
}

export interface ShiftWithOfficer extends Shift {
  officer?: Officer;
}
