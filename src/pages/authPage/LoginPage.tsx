import React, { useEffect, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import axios from 'axios';

const LoginPage: React.FC = () => {
  const navigate = useNavigate();

  // Form states
  const [identity, setIdentity] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(false);

  // UI states
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Lightweight entrance animation
    const formContainer = document.getElementById('login-form-container');
    if (formContainer) {
      formContainer.style.opacity = '0';
      formContainer.style.transform = 'translateY(20px)';

      setTimeout(() => {
        formContainer.style.transition = 'all 0.8s cubic-bezier(0.16, 1, 0.3, 1)';
        formContainer.style.opacity = '1';
        formContainer.style.transform = 'translateY(0)';
      }, 100);
    }
  }, []);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!identity.trim()) newErrors.identity = 'Email or phone number is required';
    if (!password) newErrors.password = 'Password is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError('');
    
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      const response = await axios.post('http://localhost:8080/api/auth/login', {
        identity,
        password
      });

      if (response.data.success && response.data.token) {
        // Persist token in local storage
        localStorage.setItem('token', response.data.token);
        if (response.data.role) {
          localStorage.setItem('role', response.data.role);
        }
        if (response.data.fullName) {
          localStorage.setItem('fullName', response.data.fullName);
        }
        
        // Optionally save identity if remember me is checked
        if (remember) {
            localStorage.setItem('rememberedIdentity', identity);
        } else {
            localStorage.removeItem('rememberedIdentity');
        }

        // Redirect to dashboard or home page
        navigate('/dashboard'); // adjust as needed
      } else {
        setServerError(response.data.message || 'Login failed');
      }
    } catch (err: any) {
      if (err.response?.data && typeof err.response.data === 'object') {
        const errorData = err.response.data;
        setServerError(errorData.message || 'Invalid credentials. Please try again.');
      } else {
        setServerError('An error occurred during login. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-[#F3F4F6] text-[#151c27] min-h-screen flex flex-col items-center justify-center font-sans overflow-x-hidden p-4 selection:bg-[#1a56db]/20 selection:text-[#1a56db]">
      {/* Split Screen Container */}
      <main className="w-full max-w-5xl bg-white rounded-[16px] shadow-2xl overflow-hidden flex flex-col md:flex-row min-h-[600px] z-10">

        {/* Left Panel: Branding */}
        <section className="hidden md:flex md:w-5/12 bg-[#1A56DB] p-10 flex-col justify-between relative overflow-hidden">
          <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-[#1a56db] opacity-20 blur-3xl"></div>
          <div className="absolute -bottom-24 -right-24 w-80 h-80 rounded-full bg-[#003fb1] opacity-30 blur-3xl"></div>

          <div className="relative z-10">
            <div className="mb-8 bg-white/10 p-2 rounded-lg inline-block">
              <img
                alt="OmniBook Logo"
                className="h-8 w-auto object-contain"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuCP848Ao0ojfxhSN1LNdwd3KU_3YRNt-oogm_0NYHPpX9f3Kj6QdoWf2Y31mZLevEgGo4z74fgsa-J9Y7qB0Lyi_LAO4RppllH_zzT07iOT51SxNlubsUHixFCTTNXTsBL3ssxTtiBvZzVCDyAEjdskNornnV_GxVSN1r7LaWUi4SAat-rG1khKomVfEXqSz1gEVPKJO-AjUn0Pl5uKYEAec31kOmbNwwCFaTeWNMVn_ko5tqjHlPota70XrUZWip-RLtiq8JreqDg"
              />
            </div>
            <h1 className="text-[32px] font-bold text-white max-w-xs leading-tight tracking-tight">
              Secure & Seamless Appointments
            </h1>
            <p className="text-white/80 text-[16px] mt-4">
              Manage your professional schedule with enterprise-grade security.
            </p>
          </div>

          <div className="relative z-10 flex justify-center py-8">
            <img
              alt="Secure Management"
              className="w-full max-w-[280px] h-auto drop-shadow-xl"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuBk-n2PNnfuNbEt9teB4O-PujNhHcqWGpUDzzjuGcSiM0sHpVDYaWtd66lbrILbS5eHOTeE6tY6JIaGBnxBXDDZiSZPQ3s89SleNgZcJ3S4oBOkOYO7JaQvkLCBTDxC_oHmcBeGay88D1BMgJPAdFYSVYwydoAykW8VH--w1COL6cnuFSSTMxW2pqjM0Hmgjl32Kys7-xSPEiHcdewROBmb1pCavjiMjBwXDeZ9fTBO36xrnbti0D6J47hdl21cGg32bYYPtM7Kigw"
            />
          </div>

          <div className="relative z-10 flex gap-3">
            <div className="bg-white/10 backdrop-blur-md rounded-lg p-3 flex-1 border border-white/10">
              <span className="material-symbols-outlined text-white text-[14px] mb-1">verified_user</span>
              <span className="text-white text-[10px] uppercase tracking-wider font-semibold block">Encrypted</span>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-lg p-3 flex-1 border border-white/10">
              <span className="material-symbols-outlined text-white text-[14px] mb-1">schedule</span>
              <span className="text-white text-[10px] uppercase tracking-wider font-semibold block">24/7 Access</span>
            </div>
          </div>
        </section>

        {/* Right Panel: Login Form */}
        <section className="flex-1 bg-white p-8 md:p-12 flex flex-col justify-center">
          <div id="login-form-container" className="w-full max-w-sm mx-auto">

            <div className="mb-8">
              <div className="flex items-center gap-3 mb-2">
                <img
                  alt="OmniBook Logo"
                  className="h-7 w-auto object-contain"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuCP848Ao0ojfxhSN1LNdwd3KU_3YRNt-oogm_0NYHPpX9f3Kj6QdoWf2Y31mZLevEgGo4z74fgsa-J9Y7qB0Lyi_LAO4RppllH_zzT07iOT51SxNlubsUHixFCTTNXTsBL3ssxTtiBvZzVCDyAEjdskNornnV_GxVSN1r7LaWUi4SAat-rG1khKomVfEXqSz1gEVPKJO-AjUn0Pl5uKYEAec31kOmbNwwCFaTeWNMVn_ko5tqjHlPota70XrUZWip-RLtiq8JreqDg"
                />
                <span className="text-[24px] font-bold text-[#151c27]">Welcome Back</span>
              </div>
              <p className="text-[#434654] text-[16px]">Enter your credentials to access your dashboard.</p>
            </div>

            {serverError && (
              <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg text-sm">
                {serverError}
              </div>
            )}

            <form className="space-y-5" onSubmit={handleLogin}>
              <div className="space-y-1.5">
                <label className="block text-[14px] font-medium text-[#151c27]" htmlFor="identity">Email Address or Phone Number</label>
                <div className="relative group">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[#737686] text-[20px] group-focus-within:text-[#1853d9] transition-colors">
                    mail
                  </span>
                  <input
                    className={`w-full pl-12 pr-4 py-3 bg-[#f0f3ff] border ${errors.identity ? 'border-red-500' : 'border-[#c3c5d7]'} rounded-xl text-[16px] focus:bg-white focus:ring-2 focus:ring-[#b5c4ff] focus:border-[#1853d9] outline-none transition-all`}
                    id="identity"
                    placeholder="name@example.com or phone"
                    type="text"
                    value={identity}
                    onChange={(e) => setIdentity(e.target.value)}
                  />
                </div>
                {errors.identity && <p className="text-red-500 text-xs">{errors.identity}</p>}
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <label className="block text-[14px] font-medium text-[#151c27]" htmlFor="password">Password</label>
                  <a className="text-[#1853d9] text-[12px] font-medium hover:underline" href="#">Forgot password?</a>
                </div>
                <div className="relative group">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[#737686] text-[20px] group-focus-within:text-[#1853d9] transition-colors">
                    lock
                  </span>
                  <input
                    className={`w-full pl-12 pr-12 py-3 bg-[#f0f3ff] border ${errors.password ? 'border-red-500' : 'border-[#c3c5d7]'} rounded-xl text-[16px] focus:bg-white focus:ring-2 focus:ring-[#b5c4ff] focus:border-[#1853d9] outline-none transition-all`}
                    id="password"
                    placeholder="••••••••"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <button className="absolute right-4 top-1/2 -translate-y-1/2 text-[#737686] hover:text-[#151c27]" type="button">
                    <span className="material-symbols-outlined">visibility</span>
                  </button>
                </div>
                {errors.password && <p className="text-red-500 text-xs">{errors.password}</p>}
              </div>

              <div className="flex items-center">
                <input
                  className="w-4 h-4 text-[#1853d9] border-[#c3c5d7] rounded focus:ring-[#b5c4ff]"
                  id="remember"
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                />
                <label className="ml-2 text-[14px] text-[#434654]" htmlFor="remember">Keep me signed in</label>
              </div>

              <button
                disabled={isLoading}
                className="w-full py-3.5 bg-[#10B981] hover:bg-[#0EA271] disabled:bg-gray-400 text-white font-semibold rounded-xl shadow-md transition-all flex justify-center items-center gap-2"
                type="submit"
              >
                <span>{isLoading ? 'Processing...' : 'Login'}</span>
                {!isLoading && <span className="material-symbols-outlined text-[20px]">arrow_forward</span>}
              </button>
            </form>

            <div className="mt-8">
              <div className="relative flex items-center justify-center mb-6">
                <div className="absolute inset-0 flex items-center" aria-hidden="true">
                  <div className="w-full border-t border-[#c3c5d7]"></div>
                </div>
                <span className="bg-white px-4 text-[#737686] text-[12px] uppercase tracking-widest relative z-10">
                  Or continue with
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button className="flex items-center justify-center gap-2 py-2.5 border border-[#c3c5d7] rounded-xl text-[14px] font-medium hover:bg-[#f9f9ff] transition-all">
                  <img
                    alt="Google"
                    className="w-4 h-4"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuC3Yxhx3MnTNdLHXPXhTIeiBE51W7IONdm9F2SxvW2wRI88ouT1e0uGu_7EbvjxoHl9IzjE5XN8HFsNjiEqfEsQtVc5BUZJrRAD9xEWv5AQf9mPp_Oph0bxWfucQ1p6IiQKOodDP61Mp-ZI4v-e6PUS4HlySzTStmDHmvswJAwvHK2vvbWNInLmzOsH0L6_YbRFlYxBPHUJ58rzFhqtIxMQ71vmBc4YUFEAVU_uTQn20Wh4MZkHlrVFc-ds1oSRMs0JYAM-KXI3v4M"
                  />
                  Google
                </button>
                <button className="flex items-center justify-center gap-2 py-2.5 border border-[#c3c5d7] rounded-xl text-[14px] font-medium hover:bg-[#f9f9ff] transition-all">
                  <svg className="w-4 h-4 fill-[#1877F2]" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"></path>
                  </svg>
                  Facebook
                </button>
              </div>
            </div>

            <p className="mt-8 text-center text-[14px] text-[#434654]">
              Don't have an account?{' '}
              <NavLink to="/register" className="text-[#1853d9] font-bold hover:underline">
                Sign up
              </NavLink>
            </p>
          </div>
        </section>
      </main>

      <footer className="mt-8 flex gap-6 text-[#737686] text-[12px] font-medium">
        <a className="hover:text-[#1853d9] transition-colors" href="#">Privacy Policy</a>
        <a className="hover:text-[#1853d9] transition-colors" href="#">Terms of Service</a>
        <a className="hover:text-[#1853d9] transition-colors" href="#">Help Center</a>
      </footer>
    </div>
  );
};

export default LoginPage;
