import { Routes, Route } from 'react-router';
import LandingPage from './pages/LandingPage';
import Platform from './pages/Platform';
import Healthcare from './pages/Healthcare';
import BeautyWellnessPage from './pages/BeautyWellnessPage';
import GovernmentPage from './pages/GovernmentPage';
import EducationPage from './pages/EducationPage';
import FeaturesPage from './pages/FeaturesPage';
import PricingPage from './pages/PricingPage';


function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/platform" element={<Platform />} />
      <Route path="/features" element={<FeaturesPage />} />
      <Route path="/pricing" element={<PricingPage />} />
      <Route path="/industries/healthcare" element={<Healthcare />} />
      <Route path="/industries/beauty-wellness" element={<BeautyWellnessPage />} />
      <Route path="/industries/government" element={<GovernmentPage />} />
      <Route path="/industries/education" element={<EducationPage />} />
    </Routes>
  )
}

export default App