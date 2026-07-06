import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';
import theme from './theme';
import { useAppSelector } from './hooks/useAppDispatch';
import MainLayout from './components/layout/MainLayout';

// Lazy-loaded pages
const LoginPage         = lazy(() => import('./pages/auth/LoginPage'));
const DashboardPage     = lazy(() => import('./pages/dashboard/DashboardPage'));
const ExpensesPage      = lazy(() => import('./pages/expenses/ExpensesPage'));
const SalesPage         = lazy(() => import('./pages/sales/SalesPage'));
const FarmersPage       = lazy(() => import('./pages/farmers/FarmersPage'));
const ManufacturersPage = lazy(() => import('./pages/manufacturers/ManufacturersPage'));
const InventoryPage     = lazy(() => import('./pages/inventory/InventoryPage'));
const CustomersPage     = lazy(() => import('./pages/customers/CustomersPage'));
const MeetingsPage      = lazy(() => import('./pages/meetings/MeetingsPage'));
const TasksPage         = lazy(() => import('./pages/tasks/TasksPage'));
const ShipmentsPage     = lazy(() => import('./pages/shipments/ShipmentsPage'));
const DocumentsPage     = lazy(() => import('./pages/documents/DocumentsPage'));
const FinancePage       = lazy(() => import('./pages/finance/FinancePage'));
const AiAssistantPage   = lazy(() => import('./pages/ai/AiAssistantPage'));
const ProfilePage       = lazy(() => import('./pages/profile/ProfilePage'));

const LoadingFallback = () => (
  <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
    <CircularProgress color="primary" />
  </Box>
);

interface ProtectedRouteProps { children: React.ReactNode }
const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const isAuthenticated = useAppSelector(s => s.auth.isAuthenticated);
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
};

export default function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Suspense fallback={<LoadingFallback />}>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/" element={
            <ProtectedRoute><MainLayout /></ProtectedRoute>
          }>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard"     element={<DashboardPage />} />
            <Route path="expenses"      element={<ExpensesPage />} />
            <Route path="sales"         element={<SalesPage />} />
            <Route path="farmers"       element={<FarmersPage />} />
            <Route path="manufacturers" element={<ManufacturersPage />} />
            <Route path="inventory"     element={<InventoryPage />} />
            <Route path="customers"     element={<CustomersPage />} />
            <Route path="meetings"      element={<MeetingsPage />} />
            <Route path="tasks"         element={<TasksPage />} />
            <Route path="shipments"     element={<ShipmentsPage />} />
            <Route path="documents"     element={<DocumentsPage />} />
            <Route path="finance"       element={<FinancePage />} />
            <Route path="ai-assistant"  element={<AiAssistantPage />} />
            <Route path="profile"       element={<ProfilePage />} />
          </Route>
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Suspense>
    </ThemeProvider>
  );
}
