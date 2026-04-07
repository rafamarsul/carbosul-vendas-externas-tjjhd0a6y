import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Toaster } from '@/components/ui/toaster'
import { Toaster as Sonner } from '@/components/ui/sonner'
import { TooltipProvider } from '@/components/ui/tooltip'
import { AuthProvider } from './contexts/AuthContext'
import { DataProvider } from './contexts/DataContext'
import ProtectedRoute from './components/ProtectedRoute'
import Login from './pages/Login'
import Index from './pages/Index'
import Team from './pages/Team'
import Visits from './pages/Visits'
import History from './pages/History'
import Reviews from './pages/Reviews'
import Reports from './pages/Reports'
import Zones from './pages/Zones'
import Management from './pages/Management'
import MapPage from './pages/MapPage'
import AuditLogs from './pages/AuditLogs'
import NotFound from './pages/NotFound'
import Layout from './components/Layout'

const App = () => (
  <AuthProvider>
    <DataProvider>
      <BrowserRouter future={{ v7_startTransition: false, v7_relativeSplatPath: false }}>
        <TooltipProvider>
          <Toaster />
          <Sonner position="top-center" />
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route element={<ProtectedRoute />}>
              <Route element={<Layout />}>
                <Route path="/" element={<Index />} />
                <Route path="/historico" element={<History />} />
                <Route path="/mapa" element={<MapPage />} />

                <Route element={<ProtectedRoute allowedRoles={['manager']} />}>
                  <Route path="/gerenciamento" element={<Management />} />
                  <Route path="/relatorios" element={<Reports />} />
                  <Route path="/revisoes" element={<Reviews />} />
                  <Route path="/auditoria" element={<AuditLogs />} />
                </Route>

                <Route element={<ProtectedRoute allowedRoles={['sales']} />}>
                  <Route path="/visitas" element={<Visits />} />
                </Route>
              </Route>
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </TooltipProvider>
      </BrowserRouter>
    </DataProvider>
  </AuthProvider>
)

export default App
