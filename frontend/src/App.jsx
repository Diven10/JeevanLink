import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { useAuth } from './contexts/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import Navigation from './components/Navigation';

import Landing     from './pages/Landing';
import Login       from './pages/Login';
import Register    from './pages/Register';
import DonorDashboard      from './pages/DonorDashboard';
import DonorCertificates   from './pages/DonorCertificates';
import HospitalDashboard   from './pages/HospitalDashboard';
import BloodBankDashboard  from './pages/BloodBankDashboard';
import AdminDashboard      from './pages/AdminDashboard';
import {DonorProfile,DonorEligibility,DonorDonations,DonorAppointments,RecipientDashboard,RecipientRequest,NotificationsPage,OrganDonation,OrganRequests,BloodSearch,Awareness} from './pages/AdditionalPages';
import {AdminUsers,AdminVerification,AdminAudit,AdminReports} from './pages/AdminPanels';

// Redirect only from public auth pages when a session already exists.
function AutoRedirect({ children }) {
  const { user, loading } = useAuth();
  const rolePaths = {
    DONOR: '/donor/dashboard', HOSPITAL: '/hospital/dashboard',
    BLOOD_BANK: '/blood-bank/dashboard', ADMIN: '/admin/dashboard',
    RECIPIENT: '/recipient/dashboard',
  };
  if (loading) return null;
  if (user) return <Navigate to={rolePaths[user.role] || '/'} replace />;
  return children;
}

function RoleHomeRedirect() {
  const { user, loading } = useAuth();
  const rolePaths = {
    DONOR: '/donor/dashboard', HOSPITAL: '/hospital/dashboard',
    BLOOD_BANK: '/blood-bank/dashboard', ADMIN: '/admin/dashboard',
    RECIPIENT: '/recipient/dashboard',
  };
  if (loading) return null;
  return <Navigate to={user ? (rolePaths[user.role] || '/') : '/'} replace />;
}

// Show nav only on public pages
function PublicLayout({ children }) {
  return (
    <>
      <Navigation />
      {children}
    </>
  );
}

function App() {
  return (
    <Router>
      <Routes>
        {/* Public pages with landing nav */}
        <Route path="/" element={<PublicLayout><Landing /></PublicLayout>} />
        <Route path="/login" element={<AutoRedirect><PublicLayout><Login /></PublicLayout></AutoRedirect>} />
        <Route path="/register" element={<AutoRedirect><PublicLayout><Register /></PublicLayout></AutoRedirect>} />

        {/* Protected dashboards — no landing nav, use sidebar */}
        {/* Role Base Aliases */}
        <Route path="/donor" element={<Navigate to="/donor/dashboard" replace />} />
        <Route path="/hospital" element={<Navigate to="/hospital/dashboard" replace />} />
        <Route path="/blood-bank" element={<Navigate to="/blood-bank/dashboard" replace />} />
        <Route path="/recipient" element={<Navigate to="/recipient/dashboard" replace />} />
        <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />

        {/* Donor section */}
        <Route path="/donor/dashboard" element={<ProtectedRoute allowedRoles={['DONOR']}><DonorDashboard /></ProtectedRoute>} />
        <Route path="/donor/profile" element={<ProtectedRoute allowedRoles={['DONOR']}><DonorProfile /></ProtectedRoute>} />
        <Route path="/donor/eligibility" element={<ProtectedRoute allowedRoles={['DONOR']}><DonorEligibility /></ProtectedRoute>} />
        <Route path="/donor/donations" element={<ProtectedRoute allowedRoles={['DONOR']}><DonorDonations /></ProtectedRoute>} />
        <Route path="/donor/appointments" element={<ProtectedRoute allowedRoles={['DONOR']}><DonorAppointments /></ProtectedRoute>} />
        <Route path="/donor/organ-donation" element={<ProtectedRoute allowedRoles={['DONOR']}><OrganDonation /></ProtectedRoute>} />
        <Route path="/donor/certificates" element={<ProtectedRoute allowedRoles={['DONOR']}><DonorCertificates /></ProtectedRoute>} />
        <Route path="/donor/notifications" element={<ProtectedRoute allowedRoles={['DONOR']}><NotificationsPage /></ProtectedRoute>} />

        {/* Hospital section (Specific routes MUST precede wildcard /hospital/*) */}
        <Route path="/hospital/organ-requests" element={<ProtectedRoute allowedRoles={['HOSPITAL']}><OrganRequests /></ProtectedRoute>} />
        <Route path="/hospital/notifications" element={<ProtectedRoute allowedRoles={['HOSPITAL']}><NotificationsPage /></ProtectedRoute>} />
        <Route path="/hospital/*" element={<ProtectedRoute allowedRoles={['HOSPITAL']}><HospitalDashboard /></ProtectedRoute>} />

        {/* Blood Bank section (Specific routes MUST precede wildcard /blood-bank/*) */}
        <Route path="/blood-bank/notifications" element={<ProtectedRoute allowedRoles={['BLOOD_BANK']}><NotificationsPage /></ProtectedRoute>} />
        <Route path="/blood-bank/*" element={<ProtectedRoute allowedRoles={['BLOOD_BANK']}><BloodBankDashboard /></ProtectedRoute>} />

        {/* Admin section */}
        <Route path="/admin/dashboard" element={<ProtectedRoute allowedRoles={['ADMIN']}><AdminDashboard /></ProtectedRoute>} />
        <Route path="/admin/users" element={<ProtectedRoute allowedRoles={['ADMIN']}><AdminUsers /></ProtectedRoute>} />
        <Route path="/admin/verification" element={<ProtectedRoute allowedRoles={['ADMIN']}><AdminVerification /></ProtectedRoute>} />
        <Route path="/admin/reports" element={<ProtectedRoute allowedRoles={['ADMIN']}><AdminReports /></ProtectedRoute>} />
        <Route path="/admin/audit-logs" element={<ProtectedRoute allowedRoles={['ADMIN']}><AdminAudit /></ProtectedRoute>} />
        <Route path="/admin/notifications" element={<ProtectedRoute allowedRoles={['ADMIN']}><NotificationsPage /></ProtectedRoute>} />

        {/* Recipient section */}
        <Route path="/recipient/dashboard" element={<ProtectedRoute allowedRoles={['RECIPIENT']}><RecipientDashboard /></ProtectedRoute>} />
        <Route path="/recipient/requests/new" element={<ProtectedRoute allowedRoles={['RECIPIENT']}><RecipientRequest /></ProtectedRoute>} />
        <Route path="/recipient/requests" element={<ProtectedRoute allowedRoles={['RECIPIENT']}><RecipientDashboard /></ProtectedRoute>} />
        <Route path="/recipient/notifications" element={<ProtectedRoute allowedRoles={['RECIPIENT']}><NotificationsPage /></ProtectedRoute>} />

        {/* Shared and Public */}
        <Route path="/organ-donation" element={<ProtectedRoute allowedRoles={['DONOR','RECIPIENT']}><OrganDonation /></ProtectedRoute>} />
        <Route path="/organ-donation/register" element={<ProtectedRoute allowedRoles={['DONOR','RECIPIENT']}><OrganDonation /></ProtectedRoute>} />
        <Route path="/find-blood" element={<BloodSearch />} />
        <Route path="/awareness" element={<Awareness />} />

        {/* Catch-all: never throw an authenticated user back to the landing page. */}
        <Route path="*" element={<RoleHomeRedirect />} />
      </Routes>

      <ToastContainer
        position="top-right"
        autoClose={4000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        pauseOnFocusLoss
        draggable
        theme="light"
        style={{ fontSize: '0.875rem' }}
      />
    </Router>
  );
}

export default App;
