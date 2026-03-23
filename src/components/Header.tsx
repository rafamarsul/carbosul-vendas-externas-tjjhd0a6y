import { Search, Bell, CloudOff, Wifi, LogOut } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useState, useEffect } from 'react'
import { Badge } from '@/components/ui/badge'
import { useAuth } from '@/contexts/AuthContext'
import { useData } from '@/contexts/DataContext'
import { toast } from 'sonner'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

export function Header() {
  const [isOnline, setIsOnline] = useState(navigator.onLine)
  const [syncing, setSyncing] = useState(false)
  const { user, logout } = useAuth()
  const { syncVisits } = useData()

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true)
      setSyncing(true)
      syncVisits()
      setTimeout(() => {
        setSyncing(false)
        toast.success('Conexão restabelecida', {
          description: 'Dados offline sincronizados com sucesso.',
        })
      }, 2000)
    }
    const handleOffline = () => setIsOnline(false)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [syncVisits])

  return (
    <header className="h-16 border-b bg-card flex items-center justify-between px-4 md:px-6 sticky top-0 z-30 shadow-sm">
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

        <Button variant="ghost" size="icon" className="relative hidden sm:flex hover:bg-accent/50">
          <Bell className="w-5 h-5 text-muted-foreground" />
          <span className="absolute top-2 right-2 w-2 h-2 bg-destructive rounded-full" />
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full bg-primary/10 text-primary font-bold uppercase hover:bg-primary/20 transition-colors"
            >
              {user?.name.charAt(0)}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>Minha Conta</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <div className="px-2 py-1.5 text-sm">
              <p className="font-medium truncate">{user?.name}</p>
              <p className="text-xs text-muted-foreground capitalize">
                {user?.role === 'manager' ? 'Gerente' : 'Vendedor'}
              </p>
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={logout}
              className="text-destructive focus:text-destructive cursor-pointer"
            >
              <LogOut className="mr-2 h-4 w-4" /> Sair do Sistema
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
