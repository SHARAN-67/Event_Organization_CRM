import { BrowserRouter, Routes, Route } from 'react-router-dom';
import DashboardLayout from './layouts/dashboard.jsx';

// Main Pages
import Home from './pages/Home.jsx';
import Reports from './pages/Reports.jsx';
import Analytics from './pages/Analytics.jsx';
import MyRequests from './pages/MyRequests.jsx';

// Sales Pages
import Leads from './pages/sales/Leads.jsx';
import Contacts from './pages/sales/Contacts.jsx';
import Documents from './pages/sales/Documents.jsx';
import Campaigns from './pages/sales/Campaigns.jsx';
import Pipeline from './pages/sales/Pipeline.jsx';

// Activities Pages
import Tasks from './pages/activities/Tasks.jsx';
import Meetings from './pages/activities/Meetings.jsx';

// Inventory Pages
import Products from './pages/inventory/Products.jsx';
import Orders from './pages/inventory/Orders.jsx';
import Invoices from './pages/inventory/Invoices.jsx';
import Vendors from './pages/inventory/Vendors.jsx';

// Auth Pages
import Login from './pages/auth/Login.jsx';
import ForceChangePassword from './pages/auth/ForceChangePassword.jsx';

// Public Pages
import PublicLeadForm from './pages/public/PublicLeadForm.jsx';

// Profile Pages
import AccountSettings from './pages/profile/AccountSettings.jsx';

import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import { AccessControlProvider } from './context/AccessControlContext';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import SecretManualEntry from './pages/admin/SecretManualEntry.jsx';
import { ThemeProvider } from './theme/ThemeContext';

const queryClient = new QueryClient();

function App() {
  return (
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <AccessControlProvider>
            <BrowserRouter>
              <Routes>
                {/* Auth Routes (External) */}
                <Route path="/auth/login" element={<Login />} />
                <Route path="/auth/change-password" element={<ForceChangePassword />} />

                {/* Public Lead Capture */}
                <Route path="/inquiry" element={<PublicLeadForm />} />

                {/* Secret Manual Entry Route (Unlinked) */}
                <Route path="/admin/secret-manual-entry" element={<SecretManualEntry />} />

                {/* All routes inside here will share the Sidebar and Header */}
                <Route path="/" element={<DashboardLayout />}>
                  <Route index element={
                    <ProtectedRoute feature="Dashboard">
                      <Home />
                    </ProtectedRoute>
                  } />

                  {/* Main Routes */}
                  <Route path="home" element={
                    <ProtectedRoute feature="Home">
                      <Home />
                    </ProtectedRoute>
                  } />
                  <Route path="reports" element={
                    <ProtectedRoute feature="Reports">
                      <Reports />
                    </ProtectedRoute>
                  } />
                  <Route path="analytics" element={
                    <ProtectedRoute feature="Analytics">
                      <Analytics />
                    </ProtectedRoute>
                  } />
                  <Route path="my-requests" element={
                    <ProtectedRoute feature="My Requests">
                      <MyRequests />
                    </ProtectedRoute>
                  } />

                  {/* Sales Routes */}
                  <Route path="sales/contacts" element={
                    <ProtectedRoute feature="Contacts">
                      <Contacts />
                    </ProtectedRoute>
                  } />
                  <Route path="sales/documents" element={
                    <ProtectedRoute feature="Documents">
                      <Documents />
                    </ProtectedRoute>
                  } />
                  <Route path="sales/campaigns" element={
                    <ProtectedRoute feature="Campaigns">
                      <Campaigns />
                    </ProtectedRoute>
                  } />
                  {/* Specialized Leads Page with Granular RBAC */}
                  <Route path="sales/leads" element={
                    <Leads />
                  } />
                  <Route path="sales/pipeline" element={
                    <ProtectedRoute feature="Pipeline">
                      <Pipeline />
                    </ProtectedRoute>
                  } />

                  {/* Activities Routes */}
                  <Route path="activities/tasks" element={
                    <ProtectedRoute feature="Tasks">
                      <Tasks />
                    </ProtectedRoute>
                  } />
                  <Route path="activities/meetings" element={
                    <ProtectedRoute feature="Meetings">
                      <Meetings />
                    </ProtectedRoute>
                  } />

                  {/* Inventory Routes */}
                  <Route path="inventory/products" element={
                    <ProtectedRoute feature="Products">
                      <Products />
                    </ProtectedRoute>
                  } />
                  <Route path="inventory/orders" element={
                    <ProtectedRoute feature="Orders">
                      <Orders />
                    </ProtectedRoute>
                  } />
                  <Route path="inventory/invoices" element={
                    <ProtectedRoute feature="Invoices">
                      <Invoices />
                    </ProtectedRoute>
                  } />
                  <Route path="inventory/vendors" element={
                    <ProtectedRoute feature="Vendors">
                      <Vendors />
                    </ProtectedRoute>
                  } />

                  {/* Account Settings (Centralized Hub) */}
                  <Route path="profile/settings" element={
                    <ProtectedRoute feature="Account Settings">
                      <AccountSettings />
                    </ProtectedRoute>
                  } />
                </Route>
              </Routes>
            </BrowserRouter>
          </AccessControlProvider>
        </AuthProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export default App;