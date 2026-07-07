import { Outlet, Link, useLocation } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { LayoutDashboard, Map, MapPin, LogOut, Users, Calendar } from 'lucide-react'

export default function Layout() {
  const { user, signOut } = useAuth()
  const location = useLocation()

  const navItems = [
    { path: '/', label: 'Dashboard', icon: LayoutDashboard, roles: ['manager', 'sales'] },
    { path: '/nova-visita', label: 'Nova Visita', icon: MapPin, roles: ['sales', 'manager'] },
    { path: '/agenda', label: 'Agenda', icon: Calendar, roles: ['manager', 'sales'] },
    { path: '/equipe', label: 'Equipe', icon: Users, roles: ['manager'] },
  ]

  const allowedNav = navItems.filter((item) => item.roles.includes(user?.role || 'sales'))

  return (
    <div className="min-h-screen bg-muted/20 flex flex-col md:flex-row">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-card border-r border-border shadow-sm flex flex-col">
        <div className="p-6 border-b">
          <h2 className="text-2xl font-black text-primary flex items-center gap-2">
            <Map className="w-6 h-6" /> Carbosul
          </h2>
          <p className="text-xs text-muted-foreground mt-1">Gestão de Vendas Externas</p>
        </div>
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {allowedNav.map((item) => {
            const isActive = location.pathname === item.path
            return (
              <Link key={item.path} to={item.path}>
                <Button
                  variant={isActive ? 'default' : 'ghost'}
                  className={`w-full justify-start ${isActive ? 'shadow-md' : 'text-muted-foreground hover:text-foreground'}`}
                >
                  <item.icon className="w-5 h-5 mr-3" /> {item.label}
                </Button>
              </Link>
            )
          })}
        </nav>
        <div className="p-4 border-t border-border mt-auto">
          <div className="flex items-center justify-between mb-4 px-2">
            <div className="overflow-hidden">
              <p className="text-sm font-medium truncate">{user?.name}</p>
              <p className="text-xs text-muted-foreground capitalize truncate">{user?.role}</p>
            </div>
          </div>
          <Button
            variant="outline"
            className="w-full text-destructive hover:bg-destructive/10 hover:text-destructive border-destructive/20"
            onClick={signOut}
          >
            <LogOut className="w-4 h-4 mr-2" /> Sair
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-h-0 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  )
}
