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
    google: any
  }
}

export function GoogleMap({ className, markers = [], zones = [], route, onClick }: GoogleMapProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<any>(null)
  const [loaded, setLoaded] = useState(false)
  const markersRef = useRef<any[]>([])
  const zonesRef = useRef<any[]>([])
  const routeRef = useRef<any>(null)
  const clickHandlerRef = useRef(onClick)

  useEffect(() => {
    clickHandlerRef.current = onClick
  }, [onClick])

  useEffect(() => {
    if (window.google && window.google.maps) {
      setLoaded(true)
      return
    }

    const scriptId = 'google-maps-script'
    if (document.getElementById(scriptId)) {
      const checkInterval = setInterval(() => {
        if (window.google && window.google.maps) {
          clearInterval(checkInterval)
          setLoaded(true)
        }
      }, 500)
      return () => clearInterval(checkInterval)
    }

    const script = document.createElement('script')
    script.id = scriptId
    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || ''
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}`
    script.async = true
    script.defer = true
    script.onload = () => setLoaded(true)
    document.head.appendChild(script)

    return () => {}
  }, [])

  useEffect(() => {
    if (!loaded || !mapRef.current || !window.google) return

    if (!mapInstanceRef.current) {
      const center =
        markers.length > 0
          ? { lat: markers[0].lat, lng: markers[0].lng }
          : { lat: -23.55052, lng: -46.633309 }

      const map = new window.google.maps.Map(mapRef.current, {
        center,
        zoom: 12,
        mapTypeId: 'roadmap',
        disableDefaultUI: false,
      })

      map.addListener('click', (e: any) => {
        if (clickHandlerRef.current) {
          clickHandlerRef.current(e.latLng.lat(), e.latLng.lng())
        }
      })

      mapInstanceRef.current = map
    }

    const map = mapInstanceRef.current

    // Clear existing markers and zones
    markersRef.current.forEach((m) => m.setMap(null))
    markersRef.current = []

    zonesRef.current.forEach((z) => z.setMap(null))
    zonesRef.current = []

    if (routeRef.current) {
      routeRef.current.setMap(null)
      routeRef.current = null
    }

    const bounds = new window.google.maps.LatLngBounds()
    let hasBounds = false

    // Draw Zones (Circles)
    zones.forEach((zone) => {
      const circle = new window.google.maps.Circle({
        strokeColor: '#ef4444',
        strokeOpacity: 0.8,
        strokeWeight: 2,
        fillColor: '#ef4444',
        fillOpacity: 0.2,
        map,
        center: { lat: zone.lat, lng: zone.lng },
        radius: zone.radius,
      })
      zonesRef.current.push(circle)
      bounds.extend({ lat: zone.lat, lng: zone.lng })
      hasBounds = true
    })

    // Draw Markers
    markers.forEach((marker) => {
      const m = new window.google.maps.Marker({
        position: { lat: marker.lat, lng: marker.lng },
        map,
        title: marker.label || '',
        icon: {
          path: window.google.maps.SymbolPath.CIRCLE,
          fillColor: marker.color || '#10B981',
          fillOpacity: 1,
          strokeColor: '#ffffff',
          strokeWeight: 2,
          scale: 8,
        },
      })
      markersRef.current.push(m)
      bounds.extend({ lat: marker.lat, lng: marker.lng })
      hasBounds = true
    })

    // Draw Route
    if (route && route.length > 0) {
      const path = route.map((p) => ({ lat: p.lat, lng: p.lng }))
      const polyline = new window.google.maps.Polyline({
        path,
        geodesic: true,
        strokeColor: '#0ea5e9',
        strokeOpacity: 0.8,
        strokeWeight: 4,
      })
      polyline.setMap(map)
      routeRef.current = polyline

      path.forEach((p) => bounds.extend(p))
      hasBounds = true
    }

    if (hasBounds) {
      map.fitBounds(bounds)
      const listener = window.google.maps.event.addListener(map, 'idle', () => {
        if (map.getZoom() > 15) map.setZoom(15)
        window.google.maps.event.removeListener(listener)
      })
    }
  }, [loaded, markers, zones, route])

  return <div ref={mapRef} className={className} style={{ width: '100%', height: '100%' }} />
}
