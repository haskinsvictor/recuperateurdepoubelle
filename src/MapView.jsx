import { useEffect } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from 'react-leaflet'
import L from 'leaflet'
import iconUrl from 'leaflet/dist/images/marker-icon.png'
import iconRetinaUrl from 'leaflet/dist/images/marker-icon-2x.png'
import shadowUrl from 'leaflet/dist/images/marker-shadow.png'
import { CITY } from './config'

// Corrige les icônes par défaut de Leaflet avec Vite
L.Icon.Default.mergeOptions({ iconUrl, iconRetinaUrl, shadowUrl })

function ClickHandler({ onPick }) {
  useMapEvents({ click: (e) => onPick([e.latlng.lat, e.latlng.lng]) })
  return null
}

// Le panneau latéral change la taille de la carte : Leaflet doit le savoir
function ResizeWatcher() {
  const map = useMap()
  useEffect(() => {
    const observer = new ResizeObserver(() => map.invalidateSize())
    observer.observe(map.getContainer())
    return () => observer.disconnect()
  }, [map])
  return null
}

// Centre la carte sur un lieu choisi dans la liste
function FlyTo({ focus }) {
  const map = useMap()
  useEffect(() => {
    if (focus) map.flyTo([focus.lat, focus.lng], Math.max(map.getZoom(), 16))
  }, [focus, map])
  return null
}

// canEdit = false pour le public : lecture seule
export default function MapView({ places, pending, adding, canEdit, focus, onPick, onEdit, onMove }) {
  return (
    <div className={adding ? 'map-wrap adding' : 'map-wrap'}>
      <MapContainer center={CITY.center} zoom={CITY.zoom} className="map">
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <ResizeWatcher />
        <FlyTo focus={focus} />
        {canEdit && adding && <ClickHandler onPick={onPick} />}

        {places.map((p) => (
          <Marker
            key={p.id}
            position={[p.lat, p.lng]}
            draggable={canEdit}
            eventHandlers={{
              dragend: async (e) => {
                const marker = e.target
                const { lat, lng } = marker.getLatLng()
                const { error } = await onMove(p.id, [lat, lng])
                if (error) marker.setLatLng([p.lat, p.lng]) // refusé : on remet en place
              },
            }}
          >
            <Popup>
              <strong>{p.name}</strong>
              {p.description && <p>{p.description}</p>}
              {canEdit && (
                <button type="button" className="btn" onClick={() => onEdit(p)}>
                  Modifier
                </button>
              )}
            </Popup>
          </Marker>
        ))}

        {pending && <Marker position={pending} opacity={0.6} />}
      </MapContainer>
    </div>
  )
}
