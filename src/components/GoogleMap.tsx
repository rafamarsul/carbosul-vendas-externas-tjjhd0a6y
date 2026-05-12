import { useEffect, useRef, useState } from 'react'

interface GoogleMapProps {
  className?: string
  markers?: Array<{ id: string; lat: number; lng: number; color?: string; label?: string }>
  zones?: Array<{ id: string; lat: number; lng: number; radius: number; name?: string }>
  route?: Array<{ lat: number; lng: number }>
  showPolygon?: boolean
  onClick?: (lat: number, lng: number) => void
}

declare global {
  interface Window {
    L: any
  }
}

export function GoogleMap({ className, markers = [], zones = [], route, onClick }: GoogleMapProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<any>(null)
  const [loaded, setLoaded] = useState(false)
  const markersLayerRef = useRef<any>(null)
  const zonesLayerRef = useRef<any>(null)
  const clickHandlerRef = useRef(onClick)

  useEffect(() => {
    clickHandlerRef.current = onClick
  }, [onClick])

  useEffect(() => {
    if (window.L) {
      setLoaded(true)
      return
    }

    const link = document.createElement('link')
    link.rel = 'stylesheet'
    link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'
    document.head.appendChild(link)

    const script = document.createElement('script')
    script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js'
    script.async = true
    script.onload = () => setLoaded(true)
    document.head.appendChild(script)

    return () => {}
  }, [])

  useEffect(() => {
    if (!loaded || !mapRef.current || !window.L) return

    if (!mapInstanceRef.current) {
      const center = markers.length > 0 ? [markers[0].lat, markers[0].lng] : [-23.55052, -46.633309]
      const map = window.L.map(mapRef.current).setView(center, 12)

      window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
      }).addTo(map)

      map.on('click', (e: any) => {
        if (clickHandlerRef.current) {
          clickHandlerRef.current(e.latlng.lat, e.latlng.lng)
        }
      })

      markersLayerRef.current = window.L.layerGroup().addTo(map)
      zonesLayerRef.current = window.L.layerGroup().addTo(map)

      mapInstanceRef.current = map
    }

    const map = mapInstanceRef.current
    const L = window.L

    markersLayerRef.current.clearLayers()
    zonesLayerRef.current.clearLayers()

    zones.forEach((zone) => {
      L.circle([zone.lat, zone.lng], {
        color: '#ef4444',
        fillColor: '#ef4444',
        fillOpacity: 0.2,
        radius: zone.radius,
      })
        .addTo(zonesLayerRef.current)
        .bindTooltip(zone.name || 'Zona', { permanent: false })
    })

    markers.forEach((marker) => {
      L.circleMarker([marker.lat, marker.lng], {
        radius: 8,
        color: '#fff',
        weight: 2,
        fillColor: marker.color || '#10B981',
        fillOpacity: 1,
      })
        .addTo(markersLayerRef.current)
        .bindTooltip(marker.label || '', { permanent: false })
    })

    if (route && route.length > 0) {
      const latlngs = route.map((p) => [p.lat, p.lng])
      L.polyline(latlngs, { color: '#0ea5e9', weight: 4, opacity: 0.8, dashArray: '8, 8' }).addTo(
        markersLayerRef.current,
      )
    }

    if (markers.length > 0 || zones.length > 0 || (route && route.length > 0)) {
      const group = L.featureGroup([markersLayerRef.current, zonesLayerRef.current])
      if (group.getBounds().isValid()) {
        map.fitBounds(group.getBounds(), { padding: [20, 20], maxZoom: 15 })
      }
    }
  }, [loaded, markers, zones, route])

  return (
    <>
      <style>{`
        .leaflet-container { z-index: 10 !important; }
        .leaflet-top, .leaflet-bottom { z-index: 10 !important; }
      `}</style>
      <div ref={mapRef} className={className} style={{ width: '100%', height: '100%' }} />
    </>
  )
}
