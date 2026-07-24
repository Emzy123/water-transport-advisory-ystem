import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuthLogoutRedirect } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import ErrorBoundary from './components/ErrorBoundary';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import AlertBanner from './components/AlertBanner';
import Footer from './components/layout/Footer';
import LoadingState from './components/ui/States';

const Home = lazy(() => import('./pages/Home'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const VesselTracking = lazy(() => import('./pages/VesselTracking'));
const WeatherAdvisory = lazy(() => import('./pages/WeatherAdvisory'));
const NavWarnings = lazy(() => import('./pages/NavWarnings'));
const PortDirectory = lazy(() => import('./pages/PortDirectory'));
const FerrySchedules = lazy(() => import('./pages/FerrySchedules'));
const RouteAdvisory = lazy(() => import('./pages/RouteAdvisory'));
const EmergencyAlert = lazy(() => import('./pages/EmergencyAlert'));
const IncidentReport = lazy(() => import('./pages/IncidentReport'));
const IncidentManagement = lazy(() => import('./pages/IncidentManagement'));
const WarningManagement = lazy(() => import('./pages/WarningManagement'));
const BerthManagement = lazy(() => import('./pages/BerthManagement'));
const ScheduleManagement = lazy(() => import('./pages/ScheduleManagement'));
const AuditLog = lazy(() => import('./pages/AuditLog'));
const Forbidden = lazy(() => import('./pages/Forbidden'));
const NotFound = lazy(() => import('./pages/NotFound'));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60_000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

import OfflineBanner from './components/ui/OfflineBanner';

function PageLoader() {
  return <LoadingState message="Loading module…" />;
}

function Layout({ children }) {
  useAuthLogoutRedirect();
  return (
    <div className="flex min-h-screen flex-col">
      <OfflineBanner />
      <AlertBanner />
      <Navbar />
      <main className="flex-1">
        <ErrorBoundary>{children}</ErrorBoundary>
      </main>
      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <BrowserRouter>
            <Layout>
              <Suspense fallback={<PageLoader />}>
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  <Route path="/forbidden" element={<Forbidden />} />

                  <Route
                    path="/dashboard"
                    element={
                      <ProtectedRoute>
                        <Dashboard />
                      </ProtectedRoute>
                    }
                  />

                  <Route path="/vessels" element={<VesselTracking />} />
                  <Route path="/weather" element={<WeatherAdvisory />} />
                  <Route path="/warnings" element={<NavWarnings />} />
                  <Route path="/ports" element={<PortDirectory />} />
                  <Route path="/schedules" element={<FerrySchedules />} />

                  <Route
                    path="/route-advisory"
                    element={
                      <ProtectedRoute
                        roles={['VESSEL_OPERATOR', 'REGULATORY_OFFICIAL', 'PORT_MANAGER']}
                      >
                        <RouteAdvisory />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/incidents"
                    element={
                      <ProtectedRoute
                        roles={['VESSEL_OPERATOR', 'REGULATORY_OFFICIAL', 'PORT_MANAGER']}
                      >
                        <IncidentReport />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/incidents/manage"
                    element={
                      <ProtectedRoute roles={['REGULATORY_OFFICIAL']}>
                        <IncidentManagement />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/warnings/manage"
                    element={
                      <ProtectedRoute roles={['REGULATORY_OFFICIAL']}>
                        <WarningManagement />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/emergency"
                    element={
                      <ProtectedRoute roles={['REGULATORY_OFFICIAL']}>
                        <EmergencyAlert />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/berths"
                    element={
                      <ProtectedRoute roles={['PORT_MANAGER', 'REGULATORY_OFFICIAL']}>
                        <BerthManagement />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/schedules/manage"
                    element={
                      <ProtectedRoute roles={['PORT_MANAGER', 'REGULATORY_OFFICIAL']}>
                        <ScheduleManagement />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/audit"
                    element={
                      <ProtectedRoute roles={['REGULATORY_OFFICIAL']}>
                        <AuditLog />
                      </ProtectedRoute>
                    }
                  />

                  <Route path="*" element={<NotFound />} />
                </Routes>
              </Suspense>
            </Layout>
            <Toaster
              position="top-right"
              toastOptions={{
                className: 'text-sm',
                duration: 4000,
              }}
            />
          </BrowserRouter>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
