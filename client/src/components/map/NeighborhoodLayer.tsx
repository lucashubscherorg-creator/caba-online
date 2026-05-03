// ============================================
// NEIGHBORHOOD LAYER — CABA ONLINE
// ============================================

import { useMemo } from 'react';
import { Circle, Tooltip } from 'react-leaflet';
import { NEIGHBORHOODS } from '@shared/constants';
import { useAuthStore } from '../../store/authStore';
import { useUiStore } from '../../store/uiStore';

// Safety: 0 (red) → 10 (green)
function safetyColor(level: number, alpha = 0.25): string {
  const r = Math.round(255 * (1 - level / 10));
  const g = Math.round(200 * (level / 10));
  const b = 60;
  return `rgba(${r},${g},${b},${alpha})`;
}

function safetyColorHex(level: number): string {
  const r = Math.round(255 * (1 - level / 10));
  const g = Math.round(200 * (level / 10));
  const b = 60;
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}

function wealthLabel(level: number): string {
  if (level >= 9) return 'AAA';
  if (level >= 7) return 'Alto';
  if (level >= 5) return 'Medio';
  if (level >= 3) return 'Bajo';
  return 'Crítico';
}

function safetyLabel(level: number): string {
  if (level >= 9) return 'Muy seguro';
  if (level >= 7) return 'Seguro';
  if (level >= 5) return 'Moderado';
  if (level >= 3) return 'Peligroso';
  return 'Muy peligroso';
}

export default function NeighborhoodLayer() {
  const { user } = useAuthStore();
  const { selectNeighborhood, openModal } = useUiStore();

  const entries = useMemo(() => Object.entries(NEIGHBORHOODS), []);

  return (
    <>
      {entries.map(([id, hood]) => {
        const isHome = user?.neighborhoodId === id;
        const fillColor = safetyColor(hood.safetyLevel, isHome ? 0.35 : 0.18);
        const strokeColor = isHome ? '#e8b000' : safetyColorHex(hood.safetyLevel);
        const strokeWeight = isHome ? 3 : 1.5;
        // Approximate radius: larger for hoods we know are big, smaller for tiny ones
        const radius = 600;

        return (
          <Circle
            key={id}
            center={[hood.center.lat, hood.center.lng]}
            radius={radius}
            pathOptions={{
              color: strokeColor,
              weight: strokeWeight,
              fillColor,
              fillOpacity: 1,
              opacity: 0.8,
              dashArray: isHome ? undefined : '4 4',
            }}
            eventHandlers={{
              click: () => {
                selectNeighborhood(id);
                openModal('neighborhood-info', { id, ...hood });
              },
            }}
          >
            <Tooltip sticky direction="top" opacity={0.95}>
              <div className="text-xs space-y-0.5">
                <p className="font-bold text-white">{hood.name}</p>
                <p style={{ color: safetyColorHex(hood.safetyLevel) }}>
                  Seguridad: {safetyLabel(hood.safetyLevel)} ({hood.safetyLevel}/10)
                </p>
                <p className="text-white/60">
                  Nivel económico: {wealthLabel(hood.wealthLevel)}
                </p>
                {isHome && (
                  <p className="text-gold-400 font-semibold">Tu barrio</p>
                )}
              </div>
            </Tooltip>
          </Circle>
        );
      })}
    </>
  );
}
