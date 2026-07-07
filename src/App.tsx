import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Toaster } from '@/components/ui/toaster'
import { Toaster as Sonner } from '@/components/ui/sonner'
import { TooltipProvider } from '@/components/ui/tooltip'
import { AuthProvider } from './contexts/AuthContext'
import { DataProvider } from './contexts/DataContext'
import ProtectedRoute from './components/ProtectedRoute'
import Login from './pages/Login'
import Index from './pages/Index'
import Visits from './pages/Visits'
import TeamManagement from './pages/TeamManagement'
import Agenda from './pages/Agenda'
import CoverageAreas from './pages/CoverageAreas'
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
                <Route path="/nova-visita" element={<Visits />} />
                <Route element={<ProtectedRoute allowedRoles={['manager']} />}>
                  <Route path="/equipe" element={<TeamManagement />} />
                  <Route path="/agenda" element={<Agenda />} />
                  <Route path="/cobertura" element={<CoverageAreas />} />
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
