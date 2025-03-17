
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';

import Index from './pages/Index';
import Auth from './pages/Auth';
import GettingStarted from './pages/GettingStarted';
import Dashboard from './pages/Dashboard';
import Weight from './pages/Weight';
import Fasting from './pages/Fasting';
import Exercise from './pages/Exercise';
import Periods from './pages/Periods';
import Profile from './pages/Profile';
import NotFound from './pages/NotFound';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';
import Admin from './pages/Admin';
import { AuthProvider } from './lib/auth';

const queryClient = new QueryClient();

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/getting-started" element={<GettingStarted />} />
          
          {/* Protected routes for authenticated users */}
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/weight" element={<Weight />} />
            <Route path="/fasting" element={<Fasting />} />
            <Route path="/exercise" element={<Exercise />} />
            <Route path="/periods" element={<Periods />} />
            <Route path="/profile" element={<Profile />} />
          </Route>
          
          {/* Admin-only routes */}
          <Route element={<AdminRoute />}>
            <Route path="/admin" element={<Admin />} />
          </Route>
          
          <Route path="*" element={<NotFound />} />
        </Routes>
        <Toaster />
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;
