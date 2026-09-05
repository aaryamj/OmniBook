import { Routes, Route } from 'react-router';
import LandingPage from './pages/LandingPage';
import Platform from './pages/Platform';
import Healthcare from './pages/Healthcare';
import BeautyWellnessPage from './pages/BeautyWellnessPage';
import GovernmentPage from './pages/GovernmentPage';
import EducationPage from './pages/EducationPage';
import FeaturesPage from './pages/FeaturesPage';
import PricingPage from './pages/PricingPage';
import LoginPage from './pages/authPage/LoginPage';
import RegisterPage from './pages/authPage/RegisterPage';
import UserDashboardPage from './pages/userPage/UserDashboardPage';
import BookAppointmentPage from './pages/userPage/BookAppointmentPage';
import PaymentSuccessPage from './pages/userPage/PaymentSuccessPage';
import PaymentFailedPage from './pages/userPage/PaymentFailedPage';
import MyHistoryPage from './pages/userPage/MyHistoryPage';
import ProfileSettingPage from './pages/userPage/ProfileSettingPage';
import PatientFeedbackPage from './pages/userPage/PatientFeedbackPage';
import ProviderDashboardPage from './pages/providerPage/ProviderDashboardPage';
import MasterCalendarPage from './pages/providerPage/MasterCalendarPage';
import PatientsPage from './pages/providerPage/PatientsPage';
import ServicesManagerPage from './pages/providerPage/ServicesManagerPage';
import RevenueAnalyticsPage from './pages/providerPage/RevenueAnalyticsPage';
import ProviderSettingPage from './pages/providerPage/ProviderSettingPage';
import SuperAdminDashboard from './pages/superAdminPage/SuperAdminDashboard';
import TenantManagement from './pages/superAdminPage/TenantManagement';
import SystemKPI from './pages/superAdminPage/SystemKPI';
import AuditLog from './pages/superAdminPage/AuditLog';
import Permissions from './pages/superAdminPage/Permissions';
import SuperAdminSetting from './pages/superAdminPage/SuperAdminSetting';
import GlobalEmergencyStop from './pages/superAdminPage/GlobalEmergencyStop';
import SuperAdminSupport from './pages/superAdminPage/SuperAdminSupport';
import AdminDashboard from './pages/adminPage/AdminDashboard';
import AllAppointments from './pages/adminPage/AllAppointments';
import ManageProviders from './pages/adminPage/ManageProviders';
import CRM from './pages/adminPage/CRM';
import Ledger from './pages/adminPage/Ledger';
import AdminSetting from './pages/adminPage/AdminSetting';
import AcceptInvite from './pages/acceptInvite/AcceptInvite';
import ProgressiveProfiling from './pages/adminPage/setup/ProgressiveProfiling';
import FinancialActivation from './pages/adminPage/setup/FinancialActivation';
import ProviderIdentitySetup from './pages/providerPage/setup/ProviderIdentitySetup';
import ProviderServicesSetup from './pages/providerPage/setup/ProviderServicesSetup';

function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/platform" element={<Platform />} />
      <Route path="/features" element={<FeaturesPage />} />
      <Route path="/pricing" element={<PricingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/dashboard" element={<UserDashboardPage />} />
      <Route path="/book-appointment" element={<BookAppointmentPage />} />
      <Route path="/payment-success" element={<PaymentSuccessPage />} />
      <Route path="/payment-failed" element={<PaymentFailedPage />} />
      <Route path="/my-history" element={<MyHistoryPage />} />
      <Route path="/profile-settings" element={<ProfileSettingPage />} />
      <Route path="/patient/feedback" element={<PatientFeedbackPage />} />
      <Route path="/provider-dashboard" element={<ProviderDashboardPage />} />
      <Route path="/master-calendar" element={<MasterCalendarPage />} />
      <Route path="/provider/settings" element={<ProviderSettingPage />} />
      <Route path="/patients" element={<PatientsPage />} />
      <Route path="/services" element={<ServicesManagerPage />} />
      <Route path="/analytics" element={<RevenueAnalyticsPage />} />
      <Route path="/industries/healthcare" element={<Healthcare />} />
      <Route path="/industries/beauty-wellness" element={<BeautyWellnessPage />} />
      <Route path="/industries/government" element={<GovernmentPage />} />
      <Route path="/industries/education" element={<EducationPage />} />
      <Route path="/superadmin/dashboard" element={<SuperAdminDashboard />} />
      <Route path="/superadmin/tenants" element={<TenantManagement />} />
      <Route path="/superadmin/system-kpi" element={<SystemKPI />} />
      <Route path="/superadmin/audit-logs" element={<AuditLog />} />
      <Route path="/superadmin/permissions" element={<Permissions />} />
      <Route path="/superadmin/settings" element={<SuperAdminSetting />} />
      <Route path="/superadmin/emergency-stop" element={<GlobalEmergencyStop />} />
      <Route path="/superadmin/support" element={<SuperAdminSupport />} />
      <Route path="/admin/dashboard" element={<AdminDashboard />} />
      <Route path="/admin/appointments" element={<AllAppointments />} />
      <Route path="/admin/providers" element={<ManageProviders />} />
      <Route path="/admin/crm" element={<CRM />} />
      <Route path="/admin/ledger" element={<Ledger />} />
      <Route path="/admin/settings" element={<AdminSetting />} />
      <Route path="/admin/setup/profiling" element={<ProgressiveProfiling />} />
      <Route path="/admin/setup/financials" element={<FinancialActivation />} />
      <Route path="/provider/setup/identity" element={<ProviderIdentitySetup />} />
      <Route path="/provider/setup/services" element={<ProviderServicesSetup />} />
      <Route path="/accept-invite" element={<AcceptInvite />} />
    </Routes>
  )
}

export default App
