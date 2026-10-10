import L from 'leaflet';

const KAABA_ICON = L.divIcon({
  className: '',
  html: `
    <div style="position: relative; display: flex; flex-direction: column; align-items: center;">
      <div style="
        width: 24px; height: 24px; border-radius: 4px;
        background: linear-gradient(135deg, #1a1a1a, #333);
        border: 2px solid #E5DFD3;
        box-shadow: 0 0 12px rgba(229, 223, 211, 0.6), 0 4px 8px rgba(0,0,0,0.3);
        display: flex; align-items: center; justify-content: center;
        font-size: 10px; color: #E5DFD3; font-weight: bold;
      ">Kaaba</div>
    </div>
  `,
  iconSize: [24, 24],
  iconAnchor: [12, 12],
});

export function createReportIcon(riskLevel: string, isFresh = false): L.DivIcon {
  const colors: Record<string, string> = { high: '#ef4444', medium: '#f59e0b', low: '#10b981' };
  const color = colors[riskLevel] || '#6b7280';
  const pulseColor = color;
  const size = isFresh ? 36 : 28;
  const innerInset = isFresh ? 6 : 4;
  const glowShadow = isFresh
    ? `box-shadow: 0 0 0 4px rgba(255,255,255,0.15), 0 0 20px 6px ${color};`
    : 'box-shadow: 0 2px 8px rgba(0,0,0,0.4);';
  const pulseAnim = isFresh ? 'pulseRing 1s ease-out infinite' : 'pulseRing 2s ease-out infinite';

  const freshRing = isFresh
    ? `<div style="
          position: absolute; inset: -8px; border-radius: 50%;
          border: 2px solid ${color}; opacity: 0.6;
          animation: pulseRing 1.5s ease-out infinite;
        "></div>`
    : '';

  return L.divIcon({
    className: '',
    html: `
      <div class="pulse-marker" style="position: relative; width: ${size}px; height: ${size}px;">
        ${freshRing}
        <div style="
          position: absolute; inset: 0; border-radius: 50%;
          background: ${pulseColor}; opacity: 0.3;
          animation: ${pulseAnim};
        "></div>
        <div style="
          position: absolute; inset: ${innerInset}px; border-radius: 50%;
          background: ${color}; border: 2px solid white;
          ${glowShadow}
          display: flex; align-items: center; justify-content: center;
        ">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
            <line x1="12" y1="9" x2="12" y2="13"/>
            <line x1="12" y1="17" x2="12.01" y2="17"/>
          </svg>
        </div>
      </div>
    `,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
}

export function createOfficerIcon(): L.DivIcon {
  return L.divIcon({
    className: '',
    html: `
      <div style="position: relative; width: 28px; height: 28px;">
        <div style="
          position: absolute; inset: 2px; border-radius: 50%;
          background: #3b82f6; border: 2px solid white;
          box-shadow: 0 2px 8px rgba(0,0,0,0.4);
          display: flex; align-items: center; justify-content: center;
        ">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
          </svg>
        </div>
      </div>
    `,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
  });
}

export function createDensityIcon(intensity: string): L.DivIcon {
  const colors: Record<string, { bg: string; ring: string }> = {
    high: { bg: 'rgba(239, 68, 68, 0.35)', ring: '#ef4444' },
    medium: { bg: 'rgba(245, 158, 11, 0.30)', ring: '#f59e0b' },
    low: { bg: 'rgba(16, 185, 129, 0.25)', ring: '#10b981' },
  };
  const c = colors[intensity] || colors.medium;
  const sizes: Record<string, number> = { high: 80, medium: 60, low: 45 };
  const size = sizes[intensity] || 60;

  return L.divIcon({
    className: '',
    html: `
      <div style="position: relative; width: ${size}px; height: ${size}px;">
        <div style="
          position: absolute; inset: 0; border-radius: 50%;
          background: ${c.bg}; border: 2px solid ${c.ring};
          animation: pulseRing 3s ease-out infinite;
        "></div>
        <div style="
          position: absolute; inset: 30%; border-radius: 50%;
          background: ${c.ring}; opacity: 0.5;
        "></div>
      </div>
    `,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
}

export { KAABA_ICON };
