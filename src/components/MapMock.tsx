import { cn } from '@/lib/utils'
import { MapPin } from 'lucide-react'

interface Marker {
  id: string
  lat: number
  lng: number
  color: string
  label?: string
}

interface Zone {
  id: string
  lat: number
  lng: number
  radius: number
  name?: string
}

interface MapMockProps {
  className?: string
  markers?: Marker[]
  zones?: Zone[]
  showPolygon?: boolean
  route?: { start: { lat: number; lng: number }; end: { lat: number; lng: number } }
  onClick?: (lat: number, lng: number) => void
}

export function MapMock({
  className,
  markers = [],
  zones = [],
  showPolygon = false,
  route,
  onClick,
}: MapMockProps) {
  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!onClick) return
    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    const lng = (x / rect.width) * 100
    const lat = (y / rect.height) * 100
    onClick(lat, lng)
  }

  return (
    <div
      className={cn(
        'relative bg-[#e5e7eb] overflow-hidden flex items-center justify-center w-full h-full',
        className,
        onClick && 'cursor-crosshair',
      )}
      onClick={handleClick}
    >
      {/* Map Tile Pattern Simulation */}
      <div
        className="absolute inset-0 opacity-20 pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M54.627 0l.83.83v58.34h-58.34l-.83-.83V0h58.34zM29.5 29.5v-29h-29v29h29zm29 0v-29h-29v29h29zm-29 29v-29h-29v29h29zm29 0v-29h-29v29h29z' fill='%20000000' fill-opacity='0.1' fill-rule='evenodd'/%3E%3C/svg%3E")`,
        }}
      />

      <div className="absolute top-1/4 left-0 w-full h-2 bg-white/40 transform -rotate-12 pointer-events-none" />
      <div className="absolute top-1/2 left-0 w-full h-3 bg-white/50 pointer-events-none" />
      <div className="absolute left-1/3 top-0 w-2 h-full bg-white/40 transform rotate-12 pointer-events-none" />
      <div className="absolute left-2/3 top-0 w-4 h-full bg-blue-200/30 pointer-events-none" />

      {/* Zones */}
      {zones.map((z) => (
        <div
          key={z.id}
          className="absolute transform -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-destructive/80 bg-destructive/20 pointer-events-none flex items-center justify-center"
          style={{
            top: `${z.lat}%`,
            left: `${z.lng}%`,
            width: `${z.radius * 2}%`,
            height: `${z.radius * 2}%`,
          }}
        >
          {z.name && (
            <span className="text-[10px] font-bold text-destructive-foreground bg-destructive/80 px-1 rounded absolute -top-4 whitespace-nowrap">
              {z.name}
            </span>
          )}
        </div>
      ))}

      {/* Markers */}
      {markers.map((marker) => (
        <div
          key={marker.id}
          className="absolute transform -translate-x-1/2 -translate-y-1/2 group cursor-pointer z-10"
          style={{ top: `${marker.lat}%`, left: `${marker.lng}%` }}
        >
          <div className="relative">
            <div
              className="absolute inset-0 rounded-full animate-pulse-ring"
              style={{ backgroundColor: marker.color }}
            />
            <MapPin
              className="w-8 h-8 relative z-10 drop-shadow-md"
              style={{ color: marker.color, fill: 'white' }}
            />
          </div>
          {marker.label && (
            <div className="absolute top-full mt-1 left-1/2 -translate-x-1/2 bg-white px-2 py-1 rounded shadow text-xs font-bold whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
              {marker.label}
            </div>
          )}
        </div>
      ))}

      <div className="absolute bottom-4 right-4 bg-white/80 backdrop-blur text-xs px-2 py-1 rounded text-muted-foreground shadow-sm z-10 pointer-events-none">
        Map Data © Simulado
      </div>
    </div>
  )
}
