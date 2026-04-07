import { useEffect, useRef, useState } from 'react'
import { MapMock } from './MapMock'

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
    initGoogleMap: () => void
  }
}

export function GoogleMap({
  className,
  markers = [],
  zones = [],
  showPolygon,
  onClick,
}: GoogleMapProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const [map, setMap] = useState<any>(null)
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY
  const googleMapsLoaded = useRef(false)
  const instances = useRef<{ markers: any[]; zones: any[]; route?: any }>({
    markers: [],
    zones: [],
  })

  useEffect(() => {
    if (!apiKey) return

    const initMap = () => {
      if (!mapRef.current || !window.google) return

      const center =
        markers.length > 0
          ? { lat: markers[0].lat, lng: markers[0].lng }
          : { lat: -23.55052, lng: -46.633309 }

      const newMap = new window.google.maps.Map(mapRef.current, {
        center,
        zoom: 12,
        styles: [
          { featureType: 'poi', stylers: [{ visibility: 'off' }] },
          { featureType: 'transit', stylers: [{ visibility: 'off' }] },
        ],
      })

      if (onClick) {
        newMap.addListener('click', (e: any) => {
          onClick(e.latLng.lat(), e.latLng.lng())
        })
      }

      setMap(newMap)
    }

    if (window.google && window.google.maps) {
      initMap()
    } else if (!googleMapsLoaded.current) {
      googleMapsLoaded.current = true
      window.initGoogleMap = initMap
      const script = document.createElement('script')
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&callback=initGoogleMap`
      script.async = true
      script.defer = true
      document.head.appendChild(script)
    }
  }, [apiKey]) // Omit onClick from deps to avoid re-init

  useEffect(() => {
    if (!map || !window.google) return

    // Clear old instances
    instances.current.markers.forEach((m) => m.setMap(null))
    instances.current.zones.forEach((z) => z.setMap(null))
    if (instances.current.route) {
      instances.current.route.setMap(null)
    }

    const googleMarkers = markers.map((marker) => {
      return new window.google.maps.Marker({
        position: { lat: marker.lat, lng: marker.lng },
        map,
        title: marker.label,
        icon: {
          path: window.google.maps.SymbolPath.CIRCLE,
          scale: 10,
          fillColor: marker.color || '#10B981',
          fillOpacity: 1,
          strokeWeight: 2,
          strokeColor: '#ffffff',
        },
      })
    })

    const googleZones = zones.map((zone) => {
      return new window.google.maps.Circle({
        strokeColor: '#ef4444',
        strokeOpacity: 0.8,
        strokeWeight: 2,
        fillColor: '#ef4444',
        fillOpacity: 0.2,
        map,
        center: { lat: zone.lat, lng: zone.lng },
        radius: zone.radius * 1000, // km to meters
      })
    })

    let routeLine = null
    if (route && route.length > 1) {
      routeLine = new window.google.maps.Polyline({
        path: route,
        geodesic: true,
        strokeColor: '#004A99',
        strokeOpacity: 0.8,
        strokeWeight: 4,
        map,
      })
    }

    instances.current = { markers: googleMarkers, zones: googleZones, route: routeLine }

    if (markers.length > 0) {
      const bounds = new window.google.maps.LatLngBounds()
      markers.forEach((m) => bounds.extend({ lat: m.lat, lng: m.lng }))
      map.fitBounds(bounds)
    }
  }, [map, markers, zones])

  if (!apiKey) {
    return (
      <MapMock
        className={className}
        markers={markers}
        zones={zones}
        showPolygon={showPolygon}
        onClick={onClick}
      />
    )
  }

  return <div ref={mapRef} className={className} style={{ width: '100%', height: '100%' }} />
}
