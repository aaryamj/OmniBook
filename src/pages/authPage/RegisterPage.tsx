import React, { useEffect, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { SocialLogin } from '../../components/SocialLogin';

const RegisterPage: React.FC = () => {
  const [role, setRole] = useState<'user' | 'provider' | 'admin'>('user');
  const navigate = useNavigate();

  // Form states
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // UI states
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Verification states
  const [isVerificationSent, setIsVerificationSent] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');

  useEffect(() => {
    // Lightweight entrance animation
    const formContainer = document.getElementById('register-form-container');
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
    if (!fullName.trim()) newErrors.fullName = 'Name is required';
    if (!email.trim() || !/^\S+@\S+\.\S+$/.test(email)) newErrors.email = 'Valid email is required';
    if (!/^\d{10}$/.test(phone)) newErrors.phone = 'Phone number must be exactly 10 digits';
    if (!/^(?=.*\d)(?=.*[^a-zA-Z0-9])[A-Z].{5,}$/.test(password)) {
      newErrors.password = 'Must be 6+ chars, start with a capital, and include a number and symbol';
    }
    if (password !== confirmPassword) newErrors.confirmPassword = 'Passwords do not match';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError('');
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      const response = await axios.post('http://localhost:8080/api/auth/register', {
        fullName,
        email,
        phone,
        password,
        role
      });

      if (response.data.success) {
        setIsVerificationSent(true);
      } else {
        setServerError(response.data.message || 'Registration failed');
      }
    } catch (err: any) {
      if (err.response?.data && typeof err.response.data === 'object') {
        const errorData = err.response.data;
        if (errorData.message) {
            setServerError(errorData.message);
        } else {
            setErrors(errorData); // validation errors from backend
        }
      } else {
        setServerError('An error occurred during registration. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError('');
    
    if (!verificationCode.trim()) {
      setErrors({ verificationCode: 'Verification code is required' });
      return;
    }

    setIsLoading(true);
    try {
      const response = await axios.post('http://localhost:8080/api/auth/verify', {
        email,
        code: verificationCode
      });

      if (response.data.success) {
        // Redirect to login after successful verification
        navigate('/login');
      } else {
        setServerError(response.data.message || 'Verification failed');
      }
    } catch (err: any) {
      setServerError(err.response?.data?.message || 'Invalid verification code');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOAuthSuccess = (data: any) => {
    if (data.success && data.token) {
      localStorage.setItem('token', data.token);
      if (data.role) localStorage.setItem('role', data.role);
      if (data.fullName) localStorage.setItem('fullName', data.fullName);
      navigate('/dashboard');
    } else {
      setServerError(data.message || 'OAuth registration failed');
    }
  };

  return (
    <div className="bg-[#F3F4F6] text-[#151c27] min-h-screen flex flex-col items-center justify-center font-sans overflow-x-hidden p-4 selection:bg-[#1a56db]/20 selection:text-[#1a56db]">
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
              Unlock seamless scheduling
            </h1>
            <p className="text-white/80 text-[16px] mt-4">
              Join thousands simplifying their appointments with OmniBook's professional platform.
            </p>
          </div>
          
          <div className="relative z-10 flex justify-center py-8">
            <img 
              alt="Secure Management" 
              className="w-full max-w-[280px] h-auto drop-shadow-xl" 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuBdTRnWxU9y1IEngLWh63hvtmuizvB-e6F8djuWyOeZPO2t0uoI6nbkXvfJBavXiF-aZaBvHUely3GY5wrGUwDAkBt92FiLy7t04h7Xo1t0d4V8kWF9X7ewrXSYiJWiycIglf-CAGEz7P9WmQqB-XxP1MBwboUSUIW_yIKtUryPM3iaAsXAyIUx1MhxApwBQN8lCRkC27xhF12KFHbt2j-7xz9MKQ7R4IHd3CCrIoX_mevdSA3prRo3ndfdJvnA31bW2Gva2TCZZCA" 
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
        
        {/* Right Panel: Registration Form */}
        <section className="flex-1 bg-white p-8 md:p-12 flex flex-col justify-center">
          <div id="register-form-container" className="w-full max-w-sm mx-auto">
            
            {serverError && (
              <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg text-sm">
                {serverError}
              </div>
            )}

            {!isVerificationSent ? (
              <>
                {/* Role Selector */}
                <div className="mb-12">
                  <div className="flex p-1 bg-[#f0f3ff] rounded-xl gap-1">
                    <button
                      type="button"
                      className={`flex-1 py-2 px-1 rounded-lg text-[14px] font-medium transition-all ${role === 'user' ? 'bg-white shadow-sm text-[#1853d9]' : 'text-[#737686] hover:text-[#151c27]'}`}
                      onClick={() => setRole('user')}
                    >
                      User/Patient
                    </button>
                    <button
                      type="button"
                      className={`flex-1 py-2 px-1 rounded-lg text-[14px] font-medium transition-all ${role === 'provider' ? 'bg-white shadow-sm text-[#1853d9]' : 'text-[#737686] hover:text-[#151c27]'}`}
                      onClick={() => setRole('provider')}
                    >
                      Service Provider
                    </button>
                    <button
                      type="button"
                      className={`flex-1 py-2 px-1 rounded-lg text-[14px] font-medium transition-all ${role === 'admin' ? 'bg-white shadow-sm text-[#1853d9]' : 'text-[#737686] hover:text-[#151c27]'}`}
                      onClick={() => setRole('admin')}
                    >
                      Admin
                    </button>
                  </div>
                </div>

                <div className="mb-8">
                  <div className="flex items-center gap-3 mb-2">
                    <img 
                      alt="OmniBook Logo" 
                      className="h-6 w-auto object-contain" 
                      src="https://lh3.googleusercontent.com/aida-public/AB6AXuCP848Ao0ojfxhSN1LNdwd3KU_3YRNt-oogm_0NYHPpX9f3Kj6QdoWf2Y31mZLevEgGo4z74fgsa-J9Y7qB0Lyi_LAO4RppllH_zzT07iOT51SxNlubsUHixFCTTNXTsBL3ssxTtiBvZzVCDyAEjdskNornnV_GxVSN1r7LaWUi4SAat-rG1khKomVfEXqSz1gEVPKJO-AjUn0Pl5uKYEAec31kOmbNwwCFaTeWNMVn_ko5tqjHlPota70XrUZWip-RLtiq8JreqDg" 
                    />
                    <span className="text-[24px] font-bold text-[#151c27]">Create your account</span>
                  </div>
                  <p className="text-[#434654] text-[16px]">Sign up to manage your enterprise calendar</p>
                </div>
                
                {/* Registration Form */}
                <form className="space-y-4" onSubmit={handleRegister}>
                  <div className="space-y-2">
                    <label className="block text-[14px] font-medium text-[#151c27]" htmlFor="fullname">
                      {role === 'user' ? 'Full Name' : role === 'provider' ? 'Service Provider Name' : 'Administrator Name'}
                    </label>
                    <div className="relative group">
                      <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[#737686] text-[20px] group-focus-within:text-[#1853d9] transition-colors">
                        person
                      </span>
                      <input
                        className={`w-full pl-12 pr-4 py-3 bg-white border ${errors.fullName ? 'border-red-500' : 'border-[#c3c5d7]'} rounded-xl text-[16px] placeholder:text-[#737686]/50 hover:bg-[#f0f3ff] focus:bg-white focus:ring-2 focus:ring-[#b5c4ff] focus:border-[#1853d9] outline-none transition-all`}
                        id="fullname"
                        placeholder={role === 'user' ? 'John Doe' : role === 'provider' ? 'Clinic or Professional Name' : 'Your Department or Admin ID'}
                        type="text"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                      />
                    </div>
                    {errors.fullName && <p className="text-red-500 text-xs">{errors.fullName}</p>}
                  </div>
                  
                  <div className="space-y-2">
                    <label className="block text-[14px] font-medium text-[#151c27]" htmlFor="email">Email Address</label>
                    <div className="relative group">
                      <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[#737686] text-[20px] group-focus-within:text-[#1853d9] transition-colors">
                        mail
                      </span>
                      <input
                        className={`w-full pl-12 pr-4 py-3 bg-white border ${errors.email ? 'border-red-500' : 'border-[#c3c5d7]'} rounded-xl text-[16px] placeholder:text-[#737686]/50 hover:bg-[#f0f3ff] focus:bg-white focus:ring-2 focus:ring-[#b5c4ff] focus:border-[#1853d9] outline-none transition-all`}
                        id="email"
                        placeholder="name@example.com"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                      />
                    </div>
                    {errors.email && <p className="text-red-500 text-xs">{errors.email}</p>}
                  </div>
                  
                  <div className="space-y-2">
                    <label className="block text-[14px] font-medium text-[#151c27]" htmlFor="phone">Phone Number</label>
                    <div className="relative group">
                      <div className="absolute left-[1px] top-[1px] bottom-[1px] flex items-center border-r border-[#c3c5d7] pr-2 pl-3 bg-[#f9f9ff] rounded-l-[11px] pointer-events-auto">
                        <select className="bg-transparent border-none outline-none p-0 pr-4 text-[14px] text-[#434654] font-medium cursor-pointer appearance-none focus:ring-0" style={{backgroundImage: "url(\"data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3E%3Cpath stroke='%23737686' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3E%3C/svg%3E\")", backgroundPosition: "right 0 center", backgroundRepeat: "no-repeat", backgroundSize: "1.2em 1.2em"}} id="countryCode">
                          <option value="+1">🇺🇸 +1</option>
                          <option value="+44">🇬🇧 +44</option>
                          <option value="+91">🇮🇳 +91</option>
                          <option value="+61">🇦🇺 +61</option>
                          <option value="+977">🇳🇵 +977</option>
                        </select>
                      </div>
                      <input
                        className={`w-full pl-[95px] pr-4 py-3 bg-white border ${errors.phone ? 'border-red-500' : 'border-[#c3c5d7]'} rounded-xl text-[16px] placeholder:text-[#737686]/50 hover:bg-[#f0f3ff] focus:bg-white focus:ring-2 focus:ring-[#b5c4ff] focus:border-[#1853d9] outline-none transition-all`}
                        id="phone"
                        placeholder="0000000000"
                        type="tel"
                        maxLength={10}
                        value={phone}
                        onChange={(e) => setPhone(e.target.value.replace(/[^0-9]/g, ''))}
                      />
                    </div>
                    {errors.phone && <p className="text-red-500 text-xs">{errors.phone}</p>}
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="block text-[14px] font-medium text-[#151c27]" htmlFor="password">Create Password</label>
                      <div className="relative group">
                        <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[#737686] text-[20px] group-focus-within:text-[#1853d9] transition-colors">
                          lock
                        </span>
                        <input
                          className={`w-full pl-12 pr-12 py-3 bg-white border ${errors.password ? 'border-red-500' : 'border-[#c3c5d7]'} rounded-xl text-[16px] placeholder:text-[#737686]/50 hover:bg-[#f0f3ff] focus:bg-white focus:ring-2 focus:ring-[#b5c4ff] focus:border-[#1853d9] outline-none transition-all`}
                          id="password"
                          placeholder="••••••••"
                          type={showPassword ? "text" : "password"}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                        />
                        <button 
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-[#737686] hover:text-[#151c27]" 
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          <span className="material-symbols-outlined">
                            {showPassword ? "visibility_off" : "visibility"}
                          </span>
                        </button>
                      </div>
                      {errors.password && <p className="text-red-500 text-xs">{errors.password}</p>}
                    </div>
                    <div className="space-y-2">
                      <label className="block text-[14px] font-medium text-[#151c27]" htmlFor="confirm_password">Confirm Password</label>
                      <div className="relative group">
                        <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[#737686] text-[20px] group-focus-within:text-[#1853d9] transition-colors">
                          lock_reset
                        </span>
                        <input
                          className={`w-full pl-12 pr-12 py-3 bg-white border ${errors.confirmPassword ? 'border-red-500' : 'border-[#c3c5d7]'} rounded-xl text-[16px] placeholder:text-[#737686]/50 hover:bg-[#f0f3ff] focus:bg-white focus:ring-2 focus:ring-[#b5c4ff] focus:border-[#1853d9] outline-none transition-all`}
                          id="confirm_password"
                          placeholder="••••••••"
                          type={showConfirmPassword ? "text" : "password"}
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                        />
                        <button 
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-[#737686] hover:text-[#151c27]" 
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        >
                          <span className="material-symbols-outlined">
                            {showConfirmPassword ? "visibility_off" : "visibility"}
                          </span>
                        </button>
                      </div>
                      {errors.confirmPassword && <p className="text-red-500 text-xs">{errors.confirmPassword}</p>}
                    </div>
                  </div>
                  
                  <button
                    disabled={isLoading}
                    className="w-full mt-4 py-3.5 bg-[#10B981] hover:bg-[#0EA271] disabled:bg-gray-400 text-white font-semibold rounded-xl shadow-md transition-all flex justify-center items-center gap-2 active:scale-[0.98]"
                    type="submit"
                  >
                    <span>{isLoading ? 'Processing...' : 'Get Started'}</span>
                    {!isLoading && <span className="material-symbols-outlined text-[20px]">arrow_forward</span>}
                  </button>
                </form>
                
                <SocialLogin 
                  role={role} 
                  onSuccess={handleOAuthSuccess} 
                  onError={() => setServerError('OAuth registration failed')} 
                />
                
                <div className="mt-12 text-center">
                  <p className="text-[16px] text-[#434654]">
                    Already have an account?{' '}
                    <NavLink to="/login" className="text-[#1853d9] font-bold hover:underline decoration-2 underline-offset-4">
                      Log in here.
                    </NavLink>
                  </p>
                </div>
              </>
            ) : (
              // Verification Code Step
              <div className="flex flex-col items-center">
                <div className="mb-8 text-center">
                  <span className="material-symbols-outlined text-[48px] text-[#10B981] mb-4 block">mark_email_read</span>
                  <h2 className="text-[24px] font-bold text-[#151c27]">Verify Your Email</h2>
                  <p className="text-[#434654] text-[16px] mt-2">
                    We've sent a verification code to <strong>{email}</strong>.
                  </p>
                </div>

                <form className="w-full space-y-4" onSubmit={handleVerify}>
                  <div className="space-y-2">
                    <label className="block text-[14px] font-medium text-[#151c27]" htmlFor="verificationCode">Enter Code</label>
                    <input
                      className={`w-full px-4 py-3 bg-white border ${errors.verificationCode ? 'border-red-500' : 'border-[#c3c5d7]'} rounded-xl text-[16px] text-center tracking-[0.5em] font-mono hover:bg-[#f0f3ff] focus:bg-white focus:ring-2 focus:ring-[#b5c4ff] focus:border-[#1853d9] outline-none transition-all`}
                      id="verificationCode"
                      placeholder="XXXXXX"
                      type="text"
                      maxLength={6}
                      value={verificationCode}
                      onChange={(e) => setVerificationCode(e.target.value.replace(/[^0-9]/g, ''))}
                    />
                    {errors.verificationCode && <p className="text-red-500 text-xs text-center">{errors.verificationCode}</p>}
                  </div>

                  <button
                    disabled={isLoading || verificationCode.length !== 6}
                    className="w-full mt-4 py-3.5 bg-[#1853d9] hover:bg-[#123e9e] disabled:bg-gray-400 text-white font-semibold rounded-xl shadow-md transition-all flex justify-center items-center gap-2 active:scale-[0.98]"
                    type="submit"
                  >
                    <span>{isLoading ? 'Verifying...' : 'Verify & Continue'}</span>
                  </button>
                </form>

                <p className="mt-8 text-center text-[14px] text-[#434654]">
                  Didn't receive the code?{' '}
                  <button className="text-[#1853d9] font-bold hover:underline decoration-2 underline-offset-4">
                    Resend Code
                  </button>
                </p>
              </div>
            )}
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

export default RegisterPage;
