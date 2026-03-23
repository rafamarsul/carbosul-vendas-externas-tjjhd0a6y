import { Outlet } from 'react-router-dom'
import { DesktopSidebar, MobileBottomNav } from './Navigation'
import { Header } from './Header'

export default function Layout() {
  return (
    <div className="flex min-h-screen w-full bg-background text-foreground">
      <DesktopSidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Header />
        <main className="flex-1 overflow-y-auto pb-16 md:pb-0 animate-fade-in relative">
          <Outlet />
        </main>
      </div>
      <MobileBottomNav />
    </div>
  )
}
