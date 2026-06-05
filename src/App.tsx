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
import MyHistoryPage from './pages/userPage/MyHistoryPage';
import ProfileSettingPage from './pages/userPage/ProfileSettingPage';

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
      <Route path="/my-history" element={<MyHistoryPage />} />
      <Route path="/profile-settings" element={<ProfileSettingPage />} />
      <Route path="/industries/healthcare" element={<Healthcare />} />
      <Route path="/industries/beauty-wellness" element={<BeautyWellnessPage />} />
      <Route path="/industries/government" element={<GovernmentPage />} />
      <Route path="/industries/education" element={<EducationPage />} />
    </Routes>
  )
}

export default App