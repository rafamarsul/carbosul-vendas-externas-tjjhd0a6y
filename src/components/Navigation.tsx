import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard,
  Users,
  MapPin,
  Map,
  LogOut,
  CheckSquare,
  History,
  Target,
  Shield,
  CalendarDays,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'

export function DesktopSidebar() {
  const { user, logout } = useAuth()

  const navItems =
    user?.role === 'manager'
      ? [
          { to: '/', label: 'Dashboard Global', icon: LayoutDashboard },
          { to: '/gerenciamento', label: 'Gerenciamento', icon: Users },
          { to: '/roteiros', label: 'Roteiros', icon: CalendarDays },
          { to: '/revisoes', label: 'Todas as Visitas', icon: CheckSquare },
          { to: '/mapa', label: 'Mapa', icon: Map },
          { to: '/admin/reports', label: 'Relatórios', icon: Target },
          { to: '/auditoria', label: 'Auditoria', icon: Shield },
        ]
      : [
          { to: '/', label: 'Meu Dashboard', icon: LayoutDashboard },
          { to: '/historico', label: 'Minhas Visitas', icon: History },
          { to: '/visitas', label: 'Registrar Visita', icon: MapPin },
          { to: '/mapa', label: 'Mapa / Zonas', icon: Map },
        ]

  return (
    <aside className="hidden md:flex flex-col w-64 border-r bg-card h-screen sticky top-0 z-20">
      <div className="p-6 flex items-center gap-3">
        <div className="w-8 h-8 rounded bg-primary flex items-center justify-center text-primary-foreground font-bold text-xl">
          C
        </div>
        <span className="font-bold text-lg text-primary tracking-tight">Carbosul CRM</span>
      </div>

      <nav className="flex-1 px-4 space-y-2 overflow-y-auto">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors',
                isActive
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground',
              )
            }
          >
            <item.icon className="w-5 h-5" />
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t space-y-4 bg-card">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-semibold uppercase">
            {user?.name.substring(0, 2)}
          </div>
          <div className="flex-1 overflow-hidden">
            <p className="text-sm font-semibold truncate">{user?.name}</p>
            <p className="text-xs text-muted-foreground capitalize">
              {user?.role === 'manager' ? 'Gerente' : 'Vendedor'}
            </p>
          </div>
        </div>
        <Button
          variant="ghost"
          className="w-full justify-start text-muted-foreground hover:text-destructive hover:bg-destructive/10"
          onClick={logout}
        >
          <LogOut className="mr-2 h-4 w-4" /> Sair
        </Button>
      </div>
    </aside>
  )
}

export function MobileBottomNav() {
  const { user } = useAuth()

  const navItems =
    user?.role === 'manager'
      ? [
          { to: '/', label: 'Dash', icon: LayoutDashboard },
          { to: '/admin/reports', label: 'Relatórios', icon: Target },
          { to: '/roteiros', label: 'Roteiros', icon: CalendarDays },
          { to: '/gerenciamento', label: 'Gestão', icon: Users },
        ]
      : [
          { to: '/', label: 'Dash', icon: LayoutDashboard },
          { to: '/historico', label: 'Minhas', icon: History },
          { to: '/visitas', label: 'Visitar', icon: MapPin },
          { to: '/mapa', label: 'Mapa', icon: Map },
        ]

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-card border-t border-border z-50 px-2 pb-safe shadow-[0_-4px_10px_rgba(0,0,0,0.05)]">
      <div className="flex items-center justify-around h-16">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              cn(
                'flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors active:scale-95',
                isActive ? 'text-primary' : 'text-muted-foreground hover:text-foreground',
              )
            }
          >
            <item.icon className="w-6 h-6" />
            <span className="text-[10px] font-medium">{item.label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
