import { useEffect, useRef, useState } from 'react'
import { Loader2 } from 'lucide-react'

interface GoogleMapProps {
  className?: string
  markers?: Array<{
    id: string
    lat: number
    lng: number
    color?: string
    label?: string
    salesmanName?: string
    status?: string
    contact?: string
    scheduledTime?: string
  }>
  zones?: Array<{ id: string; lat: number; lng: number; radius: number; name?: string }>
  route?: Array<{ lat: number; lng: number }>
  onClick?: (lat: number, lng: number) => void
  title?: string
  dateLabel?: string
}

declare global {
  interface Window {
    google: any
  }
}

const STATUS_COLORS: Record<string, string> = {
  Concluída: '#10B981',
  'Em Andamento': '#F59E0B',
  Agendada: '#3B82F6',
  Cancelada: '#EF4444',
}

function getStatusColor(status?: string): string {
  if (!status) return '#6B7280'
  return STATUS_COLORS[status] || '#6B7280'
}

function buildInfoContent(m: {
  label?: string
  contact?: string
  scheduledTime?: string
  status?: string
}): string {
  const color = getStatusColor(m.status)
  const statusLabel = m.status || 'Pendente'
  return `<div style="padding:8px;min-width:180px">
    <div style="font-weight:bold;font-size:14px;margin-bottom:4px">${m.label || ''}</div>
    ${m.contact ? `<div style="font-size:12px;color:#666;margin-bottom:2px">Contato: ${m.contact}</div>` : ''}
    ${m.scheduledTime ? `<div style="font-size:12px;color:#666;margin-bottom:6px">Horário: ${m.scheduledTime}</div>` : ''}
    <span style="display:inline-block;padding:2px 10px;border-radius:9999px;font-size:11px;font-weight:600;color:#fff;background-color:${color}">${statusLabel}</span>
  </div>`
}

export function GoogleMap({
  className,
  markers = [],
  zones = [],
  route,
  onClick,
  title,
  dateLabel,
}: GoogleMapProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<any>(null)
  const [loaded, setLoaded] = useState(false)
  const markersRef = useRef<any[]>([])
  const zonesRef = useRef<any[]>([])
  const routeRef = useRef<any>(null)
  const infoWindowRef = useRef<any>(null)
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
    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY
    if (!apiKey) {
      console.error('VITE_GOOGLE_MAPS_API_KEY is not defined. Map will not load.')
      setLoaded(false)
      return
    }
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=geometry`
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
          : { lat: -27.5954, lng: -48.548 }
      const map = new window.google.maps.Map(mapRef.current, {
        center,
        zoom: 12,
        mapTypeId: 'roadmap',
        disableDefaultUI: false,
        mapTypeControl: true,
      })
      map.addListener('click', (e: any) => {
        if (clickHandlerRef.current) {
          clickHandlerRef.current(e.latLng.lat(), e.latLng.lng())
        }
      })
      mapInstanceRef.current = map
    }

    const map = mapInstanceRef.current

    if (infoWindowRef.current) infoWindowRef.current.close()
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

    zones.forEach((zone) => {
      const circle = new window.google.maps.Circle({
        strokeColor: '#3B82F6',
        strokeOpacity: 0.8,
        strokeWeight: 2,
        fillColor: '#3B82F6',
        fillOpacity: 0.12,
        map,
        center: { lat: zone.lat, lng: zone.lng },
        radius: zone.radius,
      })
      zonesRef.current.push(circle)
      bounds.extend({ lat: zone.lat, lng: zone.lng })
      hasBounds = true
    })

    markers.forEach((marker) => {
      const color = marker.color || getStatusColor(marker.status)
      const m = new window.google.maps.Marker({
        position: { lat: marker.lat, lng: marker.lng },
        map,
        title: marker.label || '',
        icon: {
          path: window.google.maps.SymbolPath.CIRCLE,
          fillColor: color,
          fillOpacity: 1,
          strokeColor: '#ffffff',
          strokeWeight: 2,
          scale: 8,
        },
      })
      m.addListener('click', () => {
        if (!infoWindowRef.current) {
          infoWindowRef.current = new window.google.maps.InfoWindow()
        }
        infoWindowRef.current.setContent(buildInfoContent(marker))
        infoWindowRef.current.open(map, m)
      })
      markersRef.current.push(m)
      bounds.extend({ lat: marker.lat, lng: marker.lng })
      hasBounds = true
    })

    if (route && route.length > 0) {
      const path = route.map((p) => ({ lat: p.lat, lng: p.lng }))
      const polyline = new window.google.maps.Polyline({
        path,
        geodesic: true,
        strokeColor: '#0EA5E9',
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

  return (
    <div className={`relative ${className || ''}`} style={{ width: '100%', height: '100%' }}>
      {!loaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted/30 z-10">
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Carregando mapa...</p>
          </div>
        </div>
      )}
      {loaded && title && (
        <div className="absolute top-3 left-3 z-10 bg-background/90 backdrop-blur-sm rounded-lg shadow-md px-4 py-2 pointer-events-none">
          <p className="text-sm font-semibold text-foreground">{title}</p>
          {dateLabel && <p className="text-xs text-muted-foreground">{dateLabel}</p>}
        </div>
      )}
      <div ref={mapRef} style={{ width: '100%', height: '100%' }} />
    </div>
  )
}
