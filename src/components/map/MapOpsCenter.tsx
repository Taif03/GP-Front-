import { MapContainer, TileLayer, Marker, Popup, CircleMarker } from 'react-leaflet';
import L from 'leaflet';
import { KAABA_ICON, createReportIcon, createOfficerIcon, createDensityIcon } from './MapIcons';
import type { ReportWithOfficer, Officer } from '@/types';
import { StatusBadge, RiskBadge } from '@/components/Badges';
import { MapPin, Shield, AlertTriangle } from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';

const KAABA_CENTER: [number, number] = [21.4225, 39.8262];

interface DensityPoint {
  position: [number, number];
  label: string;
  intensity: 'high' | 'medium' | 'low';
  count: string;
}

const DENSITY_POINTS: DensityPoint[] = [
  { position: [21.4185, 39.8262], label: 'بوابة الملك فهد', intensity: 'high', count: 'مرتفع' },
  { position: [21.4245, 39.8302], label: 'الساحة الشرقية', intensity: 'medium', count: 'متوسط' },
  { position: [21.4155, 39.8192], label: 'أجياد', intensity: 'low', count: 'منخفض' },
  { position: [21.4110, 39.8200], label: 'بوابة العمرة', intensity: 'medium', count: 'متوسط' },
  { position: [21.4135, 39.8232], label: 'بوابة السلام', intensity: 'low', count: 'منخفض' },
  { position: [21.4195, 39.8152], label: 'الساحة الغربية', intensity: 'medium', count: 'متوسط' },
];

interface MapOpsCenterProps {
  reports: ReportWithOfficer[];
  officers: Officer[];
  onReportClick: (report: ReportWithOfficer) => void;
  freshReportIds?: Set<string>;
}

export default function MapOpsCenter({ reports, officers, onReportClick, freshReportIds }: MapOpsCenterProps) {
  const { theme } = useTheme();

  return (
    <div className="relative w-full h-full rounded-2xl overflow-hidden border dark:border-command-border border-slate-200 shadow-xl">
      <MapContainer
        center={KAABA_CENTER}
        zoom={16}
        minZoom={14}
        maxZoom={19}
        zoomControl={true}
        style={{ width: '100%', height: '100%', zIndex: 1 }}
      >
        <TileLayer
          attribution='&copy; OpenStreetMap contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Kaaba center marker */}
        <Marker position={KAABA_CENTER} icon={KAABA_ICON}>
          <Popup>
            <div className="text-center">
              <div className="font-bold text-base">المسجد الحرام - الكعبة المشرفة</div>
              <div className="text-xs text-slate-500 mt-1">21.4225°N, 39.8262°E</div>
            </div>
          </Popup>
        </Marker>

        {/* Density heatmap circles */}
        {DENSITY_POINTS.map((dp, idx) => (
          <Marker key={`density-${idx}`} position={dp.position} icon={createDensityIcon(dp.intensity)}>
            <Popup>
              <div className="text-center">
                <div className="font-bold">{dp.label}</div>
                <div className="text-xs mt-1">
                  كثافة الحشود: <span className="font-bold" style={{ color: dp.intensity === 'high' ? '#ef4444' : dp.intensity === 'medium' ? '#f59e0b' : '#10b981' }}>{dp.count}</span>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}

        {/* Emergency report markers */}
        {reports.map((report) => (
          <Marker
            key={report.id}
            position={[report.latitude, report.longitude]}
            icon={createReportIcon(report.risk_level, freshReportIds?.has(report.id) ?? false)}
            zIndexOffset={freshReportIds?.has(report.id) ? 1000 : 0}
          >
            <Popup>
              <div className="min-w-[220px]" onClick={() => onReportClick(report)}>
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle size={16} className="shrink-0" style={{ color: report.risk_level === 'high' ? '#ef4444' : report.risk_level === 'medium' ? '#f59e0b' : '#10b981' }} />
                  <span className="font-bold text-sm">{report.title}</span>
                </div>
                <div className="flex items-center gap-1 text-xs text-slate-500 mb-2">
                  <MapPin size={12} />
                  {report.gate_name}
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <RiskBadge level={report.risk_level} />
                  <StatusBadge status={report.status} />
                </div>
                {report.assigned_officer && (
                  <div className="text-xs mt-2 text-slate-400">
                    المسؤول: {report.assigned_officer.name}
                  </div>
                )}
                <button className="w-full mt-3 py-2 px-3 rounded-lg bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 transition-colors">
                  إدارة البلاغ
                </button>
              </div>
            </Popup>
          </Marker>
        ))}

        {/* Online officer markers */}
        {officers
          .filter((o) => o.status === 'online')
          .map((officer) => {
            const stationCoords = getStationCoords(officer.duty_station);
            if (!stationCoords) return null;
            return (
              <Marker key={officer.id} position={stationCoords} icon={createOfficerIcon()}>
                <Popup>
                  <div className="min-w-[180px]">
                    <div className="flex items-center gap-2 mb-1">
                      <Shield size={14} className="text-blue-500" />
                      <span className="font-bold text-sm">{officer.name}</span>
                    </div>
                    <div className="text-xs text-slate-500 space-y-1">
                      <div>الرتبة: {officer.rank}</div>
                      <div>الرقم: {officer.badge_number}</div>
                      <div>الموقع: {officer.duty_station}</div>
                    </div>
                  </div>
                </Popup>
              </Marker>
            );
          })}
      </MapContainer>

      {/* Map Legend Overlay */}
      <div className={`absolute bottom-4 right-4 z-[500] ${theme === 'dark' ? 'bg-command-surface/90 border-command-border' : 'bg-white/90 border-slate-200'} backdrop-blur-md border rounded-xl p-3 shadow-xl max-w-[200px]`}>
        <p className="text-xs font-bold mb-2 dark:text-emerald-100 text-gray-700">مفتاح الخريطة</p>
        <div className="space-y-1.5">
          <div className="flex items-center gap-2 text-[11px] dark:text-emerald-100/70 text-gray-600">
            <div className="w-3 h-3 rounded-full bg-red-500 border border-white" /> بلاغ نشط (خطر عالي)
          </div>
          <div className="flex items-center gap-2 text-[11px] dark:text-emerald-100/70 text-gray-600">
            <div className="w-3 h-3 rounded-full bg-amber-500 border border-white" /> بلاغ (خطر متوسط)
          </div>
          <div className="flex items-center gap-2 text-[11px] dark:text-emerald-100/70 text-gray-600">
            <div className="w-3 h-3 rounded-full bg-emerald-500 border border-white" /> بلاغ (خطر منخفض)
          </div>
          <div className="flex items-center gap-2 text-[11px] dark:text-emerald-100/70 text-gray-600">
            <div className="w-3 h-3 rounded-full bg-blue-500 border border-white" /> رجل أمن متاح
          </div>
        </div>
      </div>

      {/* Live indicator */}
      <div className="absolute top-4 left-4 z-[500] flex items-center gap-2 px-3 py-1.5 rounded-full dark:bg-command-surface/90 bg-white/90 backdrop-blur-md border dark:border-command-border border-slate-200 shadow-lg">
        <span className="relative flex h-2.5 w-2.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
        </span>
        <span className="text-xs font-bold dark:text-emerald-100 text-gray-700">مباشر</span>
      </div>
    </div>
  );
}

function getStationCoords(station: string | null): [number, number] | null {
  if (!station) return null;
  const coords: Record<string, [number, number]> = {
    'بوابة الملك فهد': [21.4185, 39.8262],
    'الساحة الشرقية': [21.4245, 39.8302],
    'أجياد': [21.4155, 39.8192],
    'بوابة الملك عبدالعزيز': [21.4165, 39.8280],
    'بوابة السلام': [21.4135, 39.8232],
    'المسعى': [21.4220, 39.8180],
    'الساحة الغربية': [21.4195, 39.8152],
    'بوابة العمرة': [21.4110, 39.8200],
  };
  return coords[station] ?? null;
}
