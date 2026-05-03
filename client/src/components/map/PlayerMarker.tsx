// ============================================
// PLAYER MARKER — CABA ONLINE
// ============================================

import { useMemo } from 'react';
import { Marker, Tooltip } from 'react-leaflet';
import L from 'leaflet';
import { renderToStaticMarkup } from 'react-dom/server';
import type { User } from '@shared/types';

interface Props {
  player: User;
  isCurrentUser?: boolean;
  hasMission?: boolean;
}

// Color by role category (simplified by legalStatus heuristic stored in roleId)
function getRoleColor(roleId: string): string {
  if (!roleId) return '#3366ff';
  const lower = roleId.toLowerCase();
  if (lower.includes('illegal') || lower.includes('ilegal')) return '#ef4444';
  if (lower.includes('informal') || lower.includes('gray')) return '#f5c842';
  return '#3366ff'; // legal / default
}

function MarkerSvg({
  initial,
  color,
  isCurrentUser,
  hasMission,
}: {
  initial: string;
  color: string;
  isCurrentUser: boolean;
  hasMission: boolean;
}) {
  return (
    <div
      style={{
        width: 36,
        height: 36,
        borderRadius: '50%',
        background: isCurrentUser ? color : `${color}33`,
        border: `2px solid ${color}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 14,
        fontWeight: 700,
        color: isCurrentUser ? '#fff' : color,
        boxShadow: isCurrentUser ? `0 0 12px ${color}88` : undefined,
        position: 'relative',
      }}
    >
      {initial}
      {hasMission && (
        <span
          style={{
            position: 'absolute',
            top: -2,
            right: -2,
            width: 10,
            height: 10,
            borderRadius: '50%',
            background: '#f5c842',
            border: '2px solid #131c57',
          }}
        />
      )}
    </div>
  );
}

export default function PlayerMarker({ player, isCurrentUser = false, hasMission = false }: Props) {
  const color = getRoleColor(player.roleId);

  const icon = useMemo(() => {
    const html = renderToStaticMarkup(
      <MarkerSvg
        initial={player.username[0].toUpperCase()}
        color={color}
        isCurrentUser={isCurrentUser}
        hasMission={hasMission}
      />
    );
    return L.divIcon({
      html,
      className: '',
      iconSize: [36, 36],
      iconAnchor: [18, 18],
    });
  }, [player.username, color, isCurrentUser, hasMission]);

  if (!player.position?.lat || !player.position?.lng) return null;

  return (
    <Marker position={[player.position.lat, player.position.lng]} icon={icon}>
      <Tooltip direction="top" offset={[0, -20]} opacity={0.95}>
        <div className="text-xs font-semibold">{player.username}</div>
        {player.roleId && (
          <div className="text-xs text-white/60 capitalize">{player.roleId.replace(/_/g, ' ')}</div>
        )}
      </Tooltip>
    </Marker>
  );
}
