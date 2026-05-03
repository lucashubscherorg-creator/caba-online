// ============================================
// GAME MAP — CABA ONLINE
// ============================================

import { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { CABA_BOUNDS } from '@shared/constants';
import { useGameStore } from '../../store/gameStore';
import { useAuthStore } from '../../store/authStore';
import NeighborhoodLayer from './NeighborhoodLayer';
import PlayerMarker from './PlayerMarker';
import EventMarker from './EventMarker';

// Fix Leaflet default icon paths broken by bundlers
delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const CABA_LATLNG_BOUNDS = L.latLngBounds(
  [CABA_BOUNDS.south, CABA_BOUNDS.west],
  [CABA_BOUNDS.north, CABA_BOUNDS.east]
);

// Subcomponent to enforce bounds and zoom limits
function MapController() {
  const map = useMap();

  useEffect(() => {
    map.setMaxBounds(CABA_LATLNG_BOUNDS);
    map.setMinZoom(12);
    map.setMaxZoom(17);
    map.on('drag', () => map.panInsideBounds(CABA_LATLNG_BOUNDS, { animate: false }));
  }, [map]);

  return null;
}

export default function GameMap() {
  const { players, activeEvents, myMissions } = useGameStore();
  const { user } = useAuthStore();
  const containerRef = useRef<HTMLDivElement>(null);

  const activeMissionIds = new Set(
    myMissions.filter((m) => m.status === 'active').map((m) => m.id)
  );

  const currentUserHasMission =
    user ? myMissions.some((m) => m.status === 'active') : false;

  return (
    <div ref={containerRef} className="w-full h-full relative">
      <MapContainer
        center={[CABA_BOUNDS.center.lat, CABA_BOUNDS.center.lng]}
        zoom={13}
        className="w-full h-full z-0"
        zoomControl={false}
        attributionControl={false}
      >
        <MapController />

        {/* OSM tiles with dark blue tint via CSS class .leaflet-tile */}
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          maxZoom={19}
        />

        {/* Neighborhood circles */}
        <NeighborhoodLayer />

        {/* Current user marker */}
        {user && user.position && (
          <PlayerMarker
            player={user}
            isCurrentUser
            hasMission={currentUserHasMission}
          />
        )}

        {/* Other players */}
        {players
          .filter((p) => p.id !== user?.id)
          .map((player) => (
            <PlayerMarker
              key={player.id}
              player={player}
              hasMission={
                activeMissionIds.has(player.id) // simplified
              }
            />
          ))}

        {/* Active event markers */}
        {activeEvents
          .filter((e) => e.isActive)
          .map((event) => (
            <EventMarker key={event.id} event={event} />
          ))}
      </MapContainer>

      {/* Attribution overlay */}
      <div className="absolute bottom-1 right-1 z-[1000] text-white/20 text-[10px] pointer-events-none">
        © OpenStreetMap contributors
      </div>
    </div>
  );
}
