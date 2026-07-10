
import React, { Suspense, lazy } from 'react';
import { Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';

import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';
import { AuthProvider } from './lib/auth';
import { ThemeProvider } from './lib/ThemeContext';

// Route-level code splitting: the public landing/auth pages no longer ship the
// full authenticated app (Recharts, Radix dialogs, etc.) on first paint, and the
// Recharts-heavy Admin analytics only loads when an admin opens it.
const Index = lazy(() => import('./pages/Index'));
const Auth = lazy(() => import('./pages/Auth'));
const GettingStarted = lazy(() => import('./pages/GettingStarted'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const TrackingToday = lazy(() => import('./pages/TrackingToday'));
const Weight = lazy(() => import('./pages/Weight'));
const Fasting = lazy(() => import('./pages/Fasting'));
const Exercise = lazy(() => import('./pages/Exercise'));
const Periods = lazy(() => import('./pages/Periods'));
const Profile = lazy(() => import('./pages/Profile'));
const NotFound = lazy(() => import('./pages/NotFound'));
const Admin = lazy(() => import('./pages/Admin'));
const Nutrition = lazy(() => import('./pages/Nutrition'));
const Journal = lazy(() => import('./pages/Journal'));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Health data changes rarely within a session; a 5-minute stale window
      // stops the refetch-on-mount / refetch-on-focus storms across page nav.
      staleTime: 5 * 60 * 1000,
      refetchOnWindowFocus: false,
    },
  },
});

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
      <AuthProvider>
        <Suspense fallback={null}>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/getting-started" element={<GettingStarted />} />
          
          {/* Protected routes for authenticated users */}
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/today" element={<TrackingToday />} />
            <Route path="/weight" element={<Weight />} />
            <Route path="/fasting" element={<Fasting />} />
            <Route path="/exercise" element={<Exercise />} />
            <Route path="/nutrition" element={<Nutrition />} />
            <Route path="/journal" element={<Journal />} />
            <Route path="/periods" element={<Periods />} />
            <Route path="/profile" element={<Profile />} />
          </Route>
          
          {/* Admin-only routes */}
          <Route element={<AdminRoute />}>
            <Route path="/admin" element={<Admin />} />
          </Route>
          
          <Route path="*" element={<NotFound />} />
        </Routes>
        </Suspense>
        <Toaster />
      </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;
