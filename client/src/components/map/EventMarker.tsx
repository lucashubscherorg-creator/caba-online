// ============================================
// EVENT MARKER — CABA ONLINE
// ============================================

import { useMemo } from 'react';
import { Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { renderToStaticMarkup } from 'react-dom/server';
import type { WorldEvent, WorldEventType } from '@shared/types';

const EVENT_COLORS: Record<WorldEventType, string> = {
  marcha:             '#f97316',
  paro:               '#ef4444',
  dolar_salto:        '#f5c842',
  inflacion_pico:     '#ef4444',
  evento_cultural:    '#22c55e',
  operativo_policial: '#3366ff',
  corte_servicio:     '#f59e0b',
  crisis_economica:   '#dc2626',
  elecciones:         '#a855f7',
  noticia_real:       '#8b5cf6',
};

function EventMarkerSvg({ emoji, color }: { emoji: string; color: string }) {
  return (
    <div style={{ position: 'relative', width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      {/* Pulsing ring */}
      <div
        className="event-marker-pulse"
        style={{
          position: 'absolute',
          inset: 0,
          borderRadius: '50%',
          border: `2px solid ${color}`,
          opacity: 0.6,
        }}
      />
      {/* Inner circle */}
      <div
        style={{
          width: 32,
          height: 32,
          borderRadius: '50%',
          background: `${color}22`,
          border: `2px solid ${color}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 16,
          boxShadow: `0 0 10px ${color}44`,
        }}
      >
        {emoji}
      </div>
    </div>
  );
}

function formatDuration(_startTime: string, endTime: string): string {
  const remaining = Math.max(0, new Date(endTime).getTime() - Date.now());
  const mins = Math.floor(remaining / 60000);
  if (mins < 60) return `${mins} min restantes`;
  const hours = Math.floor(mins / 60);
  return `${hours}h ${mins % 60}m restantes`;
}

interface Props {
  event: WorldEvent;
}

export default function EventMarker({ event }: Props) {
  const color = EVENT_COLORS[event.type] ?? '#3366ff';

  const icon = useMemo(() => {
    const html = renderToStaticMarkup(
      <EventMarkerSvg emoji={event.iconEmoji} color={color} />
    );
    return L.divIcon({
      html,
      className: '',
      iconSize: [40, 40],
      iconAnchor: [20, 20],
    });
  }, [event.iconEmoji, color]);

  // Use first affected neighborhood center as fallback — events may not have a direct position
  // We'll place it at a rough CABA center offset if no position provided
  const position: [number, number] = [
    (event as unknown as { lat?: number }).lat ?? -34.6037,
    (event as unknown as { lng?: number }).lng ?? -58.3816,
  ];

  return (
    <Marker position={position} icon={icon}>
      <Popup>
        <div style={{ minWidth: 180 }}>
          <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 4, display: 'flex', gap: 6, alignItems: 'center' }}>
            <span>{event.iconEmoji}</span>
            {event.title}
          </div>
          <p style={{ fontSize: 12, color: '#ccc', lineHeight: 1.4, margin: '0 0 8px' }}>
            {event.description}
          </p>
          <div style={{ fontSize: 11, color: color }}>
            {formatDuration(event.startTime, event.endTime)}
          </div>
          {event.economicImpact !== 0 && (
            <div style={{ fontSize: 11, color: event.economicImpact > 0 ? '#22c55e' : '#ef4444', marginTop: 4 }}>
              Impacto económico: {event.economicImpact > 0 ? '+' : ''}{event.economicImpact}%
            </div>
          )}
        </div>
      </Popup>
    </Marker>
  );
}
