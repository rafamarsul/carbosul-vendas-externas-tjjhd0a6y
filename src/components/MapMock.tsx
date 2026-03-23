import { cn } from '@/lib/utils'
import { MapPin } from 'lucide-react'

interface Marker {
  id: string
  lat: number
  lng: number
  color: string
  label?: string
}

export function MapMock({
  className,
  markers = [],
  showPolygon = false,
}: {
  className?: string
  markers?: Marker[]
  showPolygon?: boolean
}) {
  return (
    <div
      className={cn(
        'relative bg-[#e5e7eb] overflow-hidden flex items-center justify-center',
        className,
      )}
    >
      {/* Map Tile Pattern Simulation */}
      <div
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M54.627 0l.83.83v58.34h-58.34l-.83-.83V0h58.34zM29.5 29.5v-29h-29v29h29zm29 0v-29h-29v29h29zm-29 29v-29h-29v29h29zm29 0v-29h-29v29h29z' fill='%20000000' fill-opacity='0.1' fill-rule='evenodd'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Mock Streets */}
      <div className="absolute top-1/4 left-0 w-full h-2 bg-white/40 transform -rotate-12" />
      <div className="absolute top-1/2 left-0 w-full h-3 bg-white/50" />
      <div className="absolute left-1/3 top-0 w-2 h-full bg-white/40 transform rotate-12" />
      <div className="absolute left-2/3 top-0 w-4 h-full bg-blue-200/30" />

      {/* Mock Polygon for territory */}
      {showPolygon && (
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none"
          preserveAspectRatio="none"
        >
          <polygon
            points="20%,20% 80%,30% 70%,80% 30%,70%"
            fill="rgba(0, 74, 153, 0.15)"
            stroke="rgba(0, 74, 153, 0.5)"
            strokeWidth="2"
            strokeDasharray="4 4"
          />
        </svg>
      )}

      {/* Markers */}
      {markers.map((marker) => (
        <div
          key={marker.id}
          className="absolute transform -translate-x-1/2 -translate-y-1/2 group cursor-pointer"
          style={{ top: `${marker.lat}%`, left: `${marker.lng}%` }}
        >
          <div className="relative">
            <div
              className="absolute inset-0 rounded-full animate-pulse-ring"
              style={{ backgroundColor: marker.color }}
            />
            <MapPin
              className="w-8 h-8 relative z-10"
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

      <div className="absolute bottom-4 right-4 bg-white/80 backdrop-blur text-xs px-2 py-1 rounded text-muted-foreground shadow-sm">
        Map Data © Simulado
      </div>
    </div>
  )
}
