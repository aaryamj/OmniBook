import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import axios from 'axios';

export default function AcceptInvite() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');

    const [formData, setFormData] = useState({
        email: '',
        fullName: '',
        phone: '',
        organizationName: '',
        password: '',
        confirmPassword: ''
    });

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const [errors, setErrors] = useState<Record<string, string>>({});
    const [serverError, setServerError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    
    // Isometric card rotation effect state
    const [cardTransform, setCardTransform] = useState('perspective(1000px) rotateX(10deg) rotateY(-15deg) rotateZ(5deg)');

    const [tier, setTier] = useState('Enterprise');

    useEffect(() => {
        const fetchInviteInfo = async () => {
            if (!token) return;
            try {
                const response = await axios.get(`http://localhost:8080/api/auth/invite?token=${token}`);
                if (response.data.success) {
                    setFormData(prev => ({ 
                        ...prev, 
                        email: response.data.message,
                        fullName: response.data.fullName || '',
                        phone: response.data.phone || '',
                        organizationName: response.data.organizationName || ''
                    }));
                    if (response.data.subscriptionTier) {
                        setTier(response.data.subscriptionTier);
                    }
                    if (response.data.specialization) {
                        localStorage.setItem('specialization', response.data.specialization);
                    }
                } else {
                    setServerError(response.data.message || 'Invalid invite link');
                }
            } catch (err) {
                setServerError('Could not load invite information.');
            }
        };
        fetchInviteInfo();
    }, [token]);

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            const xAxis = (window.innerWidth / 2 - e.pageX) / 100;
            const yAxis = (window.innerHeight / 2 - e.pageY) / 100;
            setCardTransform(`perspective(1000px) rotateX(${10 + yAxis}deg) rotateY(${-15 + xAxis}deg) rotateZ(5deg)`);
        };
        
        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, []);

    const validateForm = () => {
        const newErrors: Record<string, string> = {};
        if (!formData.email.trim()) newErrors.email = 'Email is required';
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = 'Valid email is required';
        if (!formData.organizationName.trim()) newErrors.organizationName = 'Clinic name is required';
        if (!formData.fullName.trim()) newErrors.fullName = 'Name is required';
        if (!/^\d{10}$/.test(formData.phone)) newErrors.phone = 'Phone number must be exactly 10 digits';
        if (!/^(?=.*\d)(?=.*[^a-zA-Z0-9])[A-Z].{5,}$/.test(formData.password)) {
            newErrors.password = 'Must be 6+ chars, start with a capital, and include a number and symbol';
        }
        if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Passwords do not match';
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setServerError('');
        setErrors({});

        if (!token) {
            setServerError('Invalid or missing invitation token.');
            return;
        }

        if (!validateForm()) return;

        setIsLoading(true);

        try {
            const response = await axios.post('http://localhost:8080/api/auth/accept-invite', {
                token: token,
                password: formData.password,
                fullName: formData.fullName,
                phone: formData.phone,
                organizationName: formData.organizationName,
                email: formData.email
            });

            if (response.data.success) {
                // Store token and role
                localStorage.setItem('token', response.data.token);
                const role = response.data.role || '';
                if (role) localStorage.setItem('role', role);
                if (response.data.fullName) localStorage.setItem('fullName', response.data.fullName);

                // Redirect based on role
                if (role.toLowerCase() === 'service_provider') {
                    navigate('/provider/setup/identity');
                } else {
                    // Admins are directed to step 2 of setup: Progressive Profiling
                    navigate('/admin/setup/profiling');
                }
            } else {
                setServerError(response.data.message || 'Activation failed.');
            }
        } catch (err: any) {
            if (err.response && err.response.data && err.response.data.message) {
                setServerError(err.response.data.message);
            } else {
                setServerError('An error occurred during activation.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="bg-surface overflow-hidden min-h-screen font-sans">
            <div className="flex flex-col lg:flex-row min-h-screen">
                {/* LEFT SIDE: WHITE CONTENT */}
                <div className="w-full lg:w-1/2 bg-surface-container-lowest flex flex-col p-6 sm:p-10 lg:p-12 overflow-y-auto">
                    {/* Header Section */}
                    <div className="flex items-center space-x-4 mb-8 sm:mb-12">
                        <img 
                            alt="OmniBook Logo" 
                            className="h-8 w-auto object-contain" 
                            src="https://lh3.googleusercontent.com/aida-public/AB6AXuCP848Ao0ojfxhSN1LNdwd3KU_3YRNt-oogm_0NYHPpX9f3Kj6QdoWf2Y31mZLevEgGo4z74fgsa-J9Y7qB0Lyi_LAO4RppllH_zzT07iOT51SxNlubsUHixFCTTNXTsBL3ssxTtiBvZzVCDyAEjdskNornnV_GxVSN1r7LaWUi4SAat-rG1khKomVfEXqSz1gEVPKJO-AjUn0Pl5uKYEAec31kOmbNwwCFaTeWNMVn_ko5tqjHlPota70XrUZWip-RLtiq8JreqDg" 
                        />
                        <div className="h-6 w-px bg-outline-variant"></div>
                        <span className="font-sans text-xs sm:text-sm font-semibold text-on-surface-variant tracking-widest uppercase">Workspace Setup</span>
                    </div>

                    <div className="max-w-md mx-auto w-full flex flex-col space-y-6 sm:space-y-8">
                        {/* Contextual Greeting */}
                        <div className="bg-secondary-fixed/30 p-5 sm:p-6 rounded-xl border border-secondary-fixed">
                            <h1 className="font-sans text-xl sm:text-2xl font-bold tracking-tight text-on-secondary-fixed mb-1">Welcome to your Dedicated Tenant Environment</h1>
                            <p className="font-sans text-sm sm:text-base text-on-secondary-fixed-variant">
                                Workspace: <span className="font-mono text-xs tracking-tight">Secure {tier} Instance</span><br/>
                                Provisioned for: <span className="font-bold">Clinic Activation</span>
                            </p>
                        </div>

                        {/* Progress Tracker */}
                        <div className="flex items-center gap-2 sm:gap-4 py-2 overflow-x-auto">
                            <div className="flex items-center space-x-2 shrink-0">
                                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#0F172A] flex items-center justify-center text-white font-bold text-xs">1</div>
                                <span className="font-sans text-xs sm:text-sm font-semibold font-bold text-[#0F172A]">Account Security</span>
                            </div>
                            <div className="h-px w-4 sm:w-8 bg-outline-variant shrink-0"></div>
                            <div className="flex items-center space-x-2 opacity-50 shrink-0">
                                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-surface-container-highest flex items-center justify-center text-on-surface-variant font-bold text-xs">2</div>
                                <span className="font-sans text-xs sm:text-sm font-semibold text-on-surface-variant">Progressive Profiling</span>
                            </div>
                            <div className="h-px w-4 sm:w-8 bg-outline-variant shrink-0"></div>
                            <div className="flex items-center space-x-2 opacity-50 shrink-0">
                                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-surface-container-highest flex items-center justify-center text-on-surface-variant font-bold text-xs">3</div>
                                <span className="font-sans text-xs sm:text-sm font-semibold text-on-surface-variant">Financial Activation</span>
                            </div>
                        </div>

                        {/* Error Message */}
                        {serverError && (
                            <div className="p-4 bg-error-container text-error rounded-lg border border-error/20 font-sans text-sm sm:text-base">
                                {serverError}
                            </div>
                        )}
                        <form className="space-y-5" onSubmit={handleSubmit}>
                            <div className="space-y-1.5">
                                <label className="block text-[14px] font-medium text-[#151c27]">Administrator Email</label>
                                <div className="relative group">
                                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[#737686] text-[20px] group-focus-within:text-[#1853d9] transition-colors">
                                        mail
                                    </span>
                                    <input 
                                        className="w-full pl-12 pr-4 py-3 bg-gray-100 border border-[#c3c5d7] rounded-xl text-[16px] text-gray-500 cursor-not-allowed outline-none"
                                        type="email" 
                                        value={formData.email || 'Loading...'}
                                        readOnly
                                    />
                                </div>
                                {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                            </div>

                            <div className="space-y-1.5">
                                <label className="block text-[14px] font-medium text-[#151c27]">Clinic / Hospital Name</label>
                                <div className="relative group">
                                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[#737686] text-[20px] group-focus-within:text-[#1853d9] transition-colors">
                                        local_hospital
                                    </span>
                                    <input 
                                        className={`w-full pl-12 pr-4 py-3 bg-white border ${errors.organizationName ? 'border-red-500' : 'border-[#c3c5d7]'} rounded-xl text-[16px] placeholder:text-[#737686]/50 hover:bg-[#f0f3ff] focus:bg-white focus:ring-2 focus:ring-[#b5c4ff] focus:border-[#1853d9] outline-none transition-all`}
                                        placeholder="e.g., Mediciti Core" 
                                        type="text" 
                                        value={formData.organizationName}
                                        onChange={(e) => setFormData({...formData, organizationName: e.target.value})}
                                        required
                                    />
                                </div>
                                {errors.organizationName && <p className="text-red-500 text-xs mt-1">{errors.organizationName}</p>}
                            </div>

                            <div className="space-y-1.5">
                                <label className="block text-[14px] font-medium text-[#151c27]">Administrator Full Name</label>
                                <div className="relative group">
                                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[#737686] text-[20px] group-focus-within:text-[#1853d9] transition-colors">
                                        person
                                    </span>
                                    <input 
                                        className={`w-full pl-12 pr-4 py-3 bg-white border ${errors.fullName ? 'border-red-500' : 'border-[#c3c5d7]'} rounded-xl text-[16px] placeholder:text-[#737686]/50 hover:bg-[#f0f3ff] focus:bg-white focus:ring-2 focus:ring-[#b5c4ff] focus:border-[#1853d9] outline-none transition-all`}
                                        placeholder="e.g., Dr. Jane Smith" 
                                        type="text" 
                                        value={formData.fullName}
                                        onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                                        required
                                    />
                                </div>
                                {errors.fullName && <p className="text-red-500 text-xs mt-1">{errors.fullName}</p>}
                            </div>
                            
                            <div className="space-y-1.5">
                                <label className="block text-[14px] font-medium text-[#151c27]">Administrator Phone</label>
                                <div className="relative group">
                                    <div className="absolute left-[1px] top-[1px] bottom-[1px] flex items-center border-r border-[#c3c5d7] pr-2 pl-3 bg-[#f9f9ff] rounded-l-[11px] pointer-events-auto">
                                        <select className="bg-transparent border-none outline-none p-0 pr-4 text-[14px] text-[#434654] font-medium cursor-pointer appearance-none focus:ring-0" style={{backgroundImage: "url(\"data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3E%3Cpath stroke='%23737686' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3E%3C/svg%3E\")", backgroundPosition: "right 0 center", backgroundRepeat: "no-repeat", backgroundSize: "1.2em 1.2em"}}>
                                            <option value="+1">🇺🇸 +1</option>
                                            <option value="+44">🇬🇧 +44</option>
                                            <option value="+91">🇮🇳 +91</option>
                                            <option value="+61">🇦🇺 +61</option>
                                            <option value="+977">🇳🇵 +977</option>
                                        </select>
                                    </div>
                                    <input 
                                        className={`w-full pl-[95px] pr-4 py-3 bg-white border ${errors.phone ? 'border-red-500' : 'border-[#c3c5d7]'} rounded-xl text-[16px] placeholder:text-[#737686]/50 hover:bg-[#f0f3ff] focus:bg-white focus:ring-2 focus:ring-[#b5c4ff] focus:border-[#1853d9] outline-none transition-all`}
                                        placeholder="0000000000" 
                                        type="tel" 
                                        maxLength={10}
                                        value={formData.phone}
                                        onChange={(e) => setFormData({...formData, phone: e.target.value.replace(/[^0-9]/g, '')})}
                                        required
                                    />
                                </div>
                                {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
                            </div>

                            <div className="space-y-1.5">
                                <label className="block text-[14px] font-medium text-[#151c27]">Create Master Password</label>
                                <div className="relative group">
                                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[#737686] text-[20px] group-focus-within:text-[#1853d9] transition-colors">
                                        lock
                                    </span>
                                    <input 
                                        className={`w-full pl-12 pr-12 py-3 bg-white border ${errors.password ? 'border-red-500' : 'border-[#c3c5d7]'} rounded-xl text-[16px] placeholder:text-[#737686]/50 hover:bg-[#f0f3ff] focus:bg-white focus:ring-2 focus:ring-[#b5c4ff] focus:border-[#1853d9] outline-none transition-all`}
                                        placeholder="••••••••••••" 
                                        type={showPassword ? 'text' : 'password'}
                                        value={formData.password}
                                        onChange={(e) => setFormData({...formData, password: e.target.value})}
                                        required
                                    />
                                    <button 
                                        type="button" 
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-[#737686] hover:text-[#1853d9] transition-colors"
                                    >
                                        <span className="material-symbols-outlined text-[20px]">
                                            {showPassword ? 'visibility_off' : 'visibility'}
                                        </span>
                                    </button>
                                </div>
                                {errors.password ? (
                                    <p className="text-red-500 text-xs mt-1">{errors.password}</p>
                                ) : (
                                    <p className="text-[#737686] text-xs mt-1">Must be 6+ chars, start with a capital, and include a number and symbol.</p>
                                )}
                            </div>
                            
                            <div className="space-y-1.5 pb-2">
                                <label className="block text-[14px] font-medium text-[#151c27]">Confirm Password</label>
                                <div className="relative group">
                                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[#737686] text-[20px] group-focus-within:text-[#1853d9] transition-colors">
                                        lock_reset
                                    </span>
                                    <input 
                                        className={`w-full pl-12 pr-12 py-3 bg-white border ${errors.confirmPassword ? 'border-red-500' : 'border-[#c3c5d7]'} rounded-xl text-[16px] placeholder:text-[#737686]/50 hover:bg-[#f0f3ff] focus:bg-white focus:ring-2 focus:ring-[#b5c4ff] focus:border-[#1853d9] outline-none transition-all`}
                                        placeholder="••••••••••••" 
                                        type={showConfirmPassword ? 'text' : 'password'}
                                        value={formData.confirmPassword}
                                        onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                                        required
                                    />
                                    <button 
                                        type="button" 
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-[#737686] hover:text-[#1853d9] transition-colors"
                                    >
                                        <span className="material-symbols-outlined text-[20px]">
                                            {showConfirmPassword ? 'visibility_off' : 'visibility'}
                                        </span>
                                    </button>
                                </div>
                                {errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>}
                            </div>
                            
                            {/* MFA Banner */}
                            <div className="flex items-start space-x-3 p-4 bg-error-container/10 border-l-4 border-error rounded-r-lg">
                                <span className="material-symbols-outlined text-error mt-0.5">security</span>
                                <div>
                                    <h4 className="font-sans text-sm font-semibold text-on-surface-variant font-bold uppercase">Strict Security Protocol</h4>
                                    <p className="font-sans text-base text-on-surface-variant leading-tight">Multi-Factor Authentication (MFA) is strictly enforced for this environment. You will be prompted to link your authenticator app in the next step.</p>
                                </div>
                            </div>
                            
                            <button 
                                type="submit"
                                disabled={isLoading}
                                className="w-full bg-[#0F172A] hover:bg-slate-800 text-white font-sans text-sm font-semibold py-4 rounded-lg flex items-center justify-center space-x-2 transition-transform active:scale-[0.98] mt-4 disabled:opacity-70"
                            >
                                {isLoading ? (
                                    <>
                                        <span className="material-symbols-outlined animate-spin">refresh</span>
                                        <span>Activating Workspace...</span>
                                    </>
                                ) : (
                                    <>
                                        <span>Establish Credentials & Continue</span>
                                        <span className="material-symbols-outlined">arrow_forward</span>
                                    </>
                                )}
                            </button>
                        </form>
                        
                        <div className="pt-4 text-center">
                            <p className="font-sans text-base text-on-surface-variant">Need assistance? <a className="text-secondary font-bold hover:underline" href="#">Contact System Operations</a></p>
                        </div>
                    </div>
                    
                    {/* Footer Small */}
                    <div className="mt-auto pt-12 text-center lg:text-left">
                        <p className="font-sans text-sm font-semibold text-outline-variant">© 2024 OmniBook Platform Infrastructure. HIPAA & GDPR Compliant.</p>
                    </div>
                </div>
                
                {/* RIGHT SIDE: ISOMETRIC PREVIEW */}
                <div className="hidden lg:flex w-1/2 bg-surface flex-col items-center justify-center relative p-16">
                    {/* Subtle background pattern */}
                    <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(#0F172A 1px, transparent 1px)', backgroundSize: '32px 32px' }}></div>
                    <div className="relative w-full max-w-2xl flex flex-col items-center">
                        {/* Floating Dashboard Preview */}
                        <div 
                            className="w-full aspect-video bg-white rounded-2xl border border-surface-variant p-6 flex flex-col space-y-6 overflow-hidden transition-all duration-300 ease-out"
                            style={{ 
                                transform: cardTransform, 
                                boxShadow: '-20px 40px 60px rgba(15, 23, 42, 0.15)' 
                            }}
                        >
                            {/* Fake Dashboard Header */}
                            <div className="flex items-center justify-between border-b border-surface-variant pb-4">
                                <div className="flex items-center space-x-3">
                                    <div className="w-10 h-10 rounded-full bg-surface-container-high"></div>
                                    <div className="space-y-1">
                                        <div className="w-24 h-2 bg-surface-container-highest rounded"></div>
                                        <div className="w-16 h-2 bg-surface-container-high rounded"></div>
                                    </div>
                                </div>
                                <div className="flex space-x-2">
                                    <div className="w-20 h-8 rounded-lg bg-secondary-fixed"></div>
                                    <div className="w-8 h-8 rounded-lg bg-surface-container-high"></div>
                                </div>
                            </div>
                            {/* Fake Grid */}
                            <div className="grid grid-cols-3 gap-4 h-full">
                                <div className="col-span-2 bg-surface-container-low rounded-xl p-4 flex flex-col space-y-4">
                                    <div className="w-full h-4 bg-surface-container-highest rounded"></div>
                                    <div className="flex flex-col space-y-2">
                                        <div className="w-full h-12 bg-white rounded-lg border border-surface-variant"></div>
                                        <div className="w-full h-12 bg-white rounded-lg border border-surface-variant"></div>
                                        <div className="w-full h-12 bg-white rounded-lg border border-surface-variant"></div>
                                    </div>
                                </div>
                                <div className="col-span-1 flex flex-col space-y-4">
                                    <div className="flex-1 bg-[#0F172A] rounded-xl p-4 flex flex-col justify-end">
                                        <div className="w-full h-2 bg-[#38BDF8]/30 rounded mb-2"></div>
                                        <div className="w-1/2 h-4 bg-white rounded"></div>
                                    </div>
                                    <div className="h-1/2 bg-surface-container-highest rounded-xl p-4">
                                        <div className="w-full h-full bg-white/50 rounded-lg"></div>
                                    </div>
                                </div>
                            </div>
                            {/* Decorative Overlay for 8K resolution feel */}
                            <div className="absolute top-0 right-0 p-4">
                                <div className="px-2 py-1 bg-[#38BDF8] text-[#0F172A] font-mono-data text-[10px] rounded font-bold">LIVE_REPLICATION_V2</div>
                            </div>
                        </div>
                        {/* Text Content Below Preview */}
                        <div className="mt-16 text-center space-y-4 z-10">
                            <h2 className="font-sans text-3xl font-bold tracking-tight text-on-surface">Your isolated B2B instance is ready to deploy.</h2>
                            <p className="font-sans text-lg text-on-surface-variant max-w-lg mx-auto">
                                We've prepared your private cluster with Mediciti's custom data architecture. Secure your keys to begin the final orchestration.
                            </p>
                            <div className="flex items-center justify-center space-x-4 pt-6">
                                <div className="flex -space-x-2">
                                    <div className="w-8 h-8 rounded-full border-2 border-white bg-slate-300"></div>
                                    <div className="w-8 h-8 rounded-full border-2 border-white bg-slate-400"></div>
                                    <div className="w-8 h-8 rounded-full border-2 border-white bg-slate-500"></div>
                                </div>
                                <span className="text-label-md font-sans text-sm font-medium text-on-surface-variant">12 Admins online across clusters</span>
                            </div>
                        </div>
                    </div>
                    {/* Absolute decorative elements */}
                    <div className="absolute bottom-12 right-12 flex flex-col items-end space-y-1">
                        <div className="text-[10px] font-mono-data text-outline-variant uppercase tracking-tighter">Latency: 24ms</div>
                        <div className="text-[10px] font-mono-data text-outline-variant uppercase tracking-tighter">Region: US-EAST-1</div>
                    </div>
                </div>
            </div>
        </div>
    );
}
