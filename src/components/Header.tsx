import { Search, Bell, CloudOff, Wifi } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useState, useEffect } from 'react'
import { Badge } from '@/components/ui/badge'

export function Header() {
  const [isOnline, setIsOnline] = useState(true)
  const [syncing, setSyncing] = useState(false)

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true)
      setSyncing(true)
      setTimeout(() => setSyncing(false), 2000)
    }
    const handleOffline = () => setIsOnline(false)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  return (
    <header className="h-16 border-b bg-card flex items-center justify-between px-4 md:px-6 sticky top-0 z-30">
      <div className="flex items-center md:hidden gap-2">
        <div className="w-8 h-8 rounded bg-primary flex items-center justify-center text-primary-foreground font-bold">
          C
        </div>
        <span className="font-bold text-primary">CRM</span>
      </div>

      <div className="hidden md:flex flex-1 max-w-md relative">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Buscar clientes, vendedores..."
          className="pl-9 bg-muted/50 border-transparent focus-visible:bg-background"
        />
      </div>

      <div className="flex items-center gap-4 ml-auto">
        <div className="flex items-center gap-2">
          {syncing && (
            <Badge variant="secondary" className="hidden sm:flex animate-pulse">
              Sincronizando...
            </Badge>
          )}
          {isOnline ? (
            <div className="flex items-center text-success text-xs font-medium gap-1">
              <Wifi className="w-4 h-4" />
              <span className="hidden sm:inline">Online</span>
            </div>
          ) : (
            <div className="flex items-center text-destructive text-xs font-medium gap-1">
              <CloudOff className="w-4 h-4" />
              <span className="hidden sm:inline">Offline</span>
            </div>
          )}
        </div>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="w-5 h-5 text-muted-foreground" />
          <span className="absolute top-2 right-2 w-2 h-2 bg-destructive rounded-full" />
        </Button>
      </div>
    </header>
  )
}
