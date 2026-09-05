import React, { useEffect, useState } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import NotificationBell from '../../userPage/NotificationBell';

const ProviderTopNavigation: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [fullName, setFullName] = useState<string>('Provider');
    const [profilePictureUrl, setProfilePictureUrl] = useState<string | null>(null);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);

    useEffect(() => {
        setIsMobileMenuOpen(false);
    }, [location.pathname]);

    useEffect(() => {
        const token = localStorage.getItem('token');
        const role = localStorage.getItem('role');

        if (token && role === 'service_provider') {
            const fetchProfile = async () => {
                try {
                    const res = await axios.get('http://localhost:8080/api/v1/provider/settings/profile', {
                        headers: { 'Authorization': `Bearer ${token}` }
                    });
                    if (res.data.fullName) {
                        setFullName(res.data.fullName);
                        localStorage.setItem('fullName', res.data.fullName);
                    }
                    if (res.data.profilePictureUrl) {
                        setProfilePictureUrl(res.data.profilePictureUrl);
                    }
                } catch (e) {
                    console.error("Failed to fetch profile in navbar:", e);
                    const storedName = localStorage.getItem('fullName');
                    if (storedName) setFullName(storedName);
                }
            };
            fetchProfile();
        }
    }, []);

    const handleLogout = () => {
        localStorage.clear();
        navigate('/login');
    };

    return (
        <>
            <header className="fixed top-0 w-full z-50 bg-[#f9f9ff]/90 backdrop-blur-md shadow-sm border-b border-[#c3c5d7]/30">
                <div className="flex justify-between items-center px-4 md:px-10 h-20 w-full">
                    <div className="flex items-center gap-3 sm:gap-4">
                        {/* Mobile Menu Hamburger Button */}
                        <button
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            className="md:hidden p-2 -ml-1 rounded-lg text-[#53606c] hover:text-[#003fb1] hover:bg-[#f0f3ff] transition-colors flex items-center justify-center cursor-pointer"
                            aria-label="Toggle Navigation Menu"
                        >
                            <span className="material-symbols-outlined text-[24px]">
                                {isMobileMenuOpen ? 'close' : 'menu'}
                            </span>
                        </button>

                        <NavLink to="/provider-dashboard" className="flex items-center">
                            <img
                                alt="OmniBook Logo"
                                className="object-contain h-[36px] sm:h-[40px]"
                                src="https://lh3.googleusercontent.com/aida-public/AB6AXuANVa2DIMhxwJVhPP1FnM5XPZK669t-OaZbij7sEQY2BcRjKXoLi4Xlx3422j-PoJTMmPiR5Xs2jHyWkiOQbHG2PC_dwX1bTvLCKfZJr4xERFe5jC_Eg1nCXbH4JYQNcg8LmT7jvnS2rIU1qOMeCUzpati4NDHk55Jw4yD9q-c3RF-j48vJ6qqLiyYcMo90ZH-HOFSGJv14g2VG5oLaR8SvPRMAYcJZQSHy3gVOym_POA_776_joTMmbnqxiUzecB0QZUzztl5CrHw"
                            />
                        </NavLink>
                        <div className="h-6 w-[1px] bg-[#c3c5d7]/30 mx-2 hidden md:block"></div>
                        <span className="text-[#53606c] font-medium hidden md:block">Operations Center</span>
                    </div>
                    
                    <div className="flex items-center gap-3 sm:gap-4">
                        <NotificationBell />

                        <div className="hidden lg:flex flex-col items-end mr-2">
                            <span className="text-[14px] font-bold text-[#003fb1]">{fullName}</span>
                            <span className="text-[12px] text-[#53606c]">Service Provider</span>
                        </div>

                        <div className="ml-1 sm:ml-2">
                            <div className="h-9 w-9 sm:h-10 sm:w-10 rounded-full overflow-hidden border border-[#c3c5d7] shadow-sm">
                                <img
                                    alt="User Profile Avatar"
                                    className="w-full h-full object-cover"
                                    src={profilePictureUrl || "https://lh3.googleusercontent.com/aida-public/AB6AXuALan3Fe5liRYVvqOzbYPXALuhl1M_JrzKY62jsudutF-Y4kRwnw4no-RMdfy3kIqv1Pwvt4YNwLk09F8-YiOqLdcmDLbD8z8PfxNXA5LulAwItUiFnPDiM2CIPYIlitAQwvN0vTuDjaDgHGdcvqmtnQVICN825lJ_J6Gay2MKwe9QZ5j0m2TW3QgH9DIcW4nkj_-PRO8Ny3cmQDxAWN3MCHm9Grv2-ok3arYQPU0wypdDtdLrnEcUA0n9wYoUk0Nv28IHRfPR7qzs"}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Mobile Drawer Menu */}
                {isMobileMenuOpen && (
                    <div className="md:hidden border-t border-[#dce2f3] bg-white/98 shadow-2xl animate-in slide-in-from-top duration-200">
                        <nav className="flex flex-col p-4 space-y-1">
                            <NavLink 
                                to="/provider-dashboard" 
                                className={({ isActive }) => `flex items-center gap-3 px-4 py-3 text-[14px] font-semibold rounded-xl transition-all ${isActive ? 'text-[#003fb1] bg-[#1a56db]/10' : 'text-[#3b4854] hover:bg-gray-100'}`}
                            >
                                <span className="material-symbols-outlined text-[20px]">dashboard</span>
                                Dashboard
                            </NavLink>
                            <NavLink 
                                to="/master-calendar" 
                                className={({ isActive }) => `flex items-center gap-3 px-4 py-3 text-[14px] font-semibold rounded-xl transition-all ${isActive ? 'text-[#003fb1] bg-[#1a56db]/10' : 'text-[#3b4854] hover:bg-gray-100'}`}
                            >
                                <span className="material-symbols-outlined text-[20px]">calendar_month</span>
                                Master Calendar
                            </NavLink>
                            <NavLink 
                                to="/patients" 
                                className={({ isActive }) => `flex items-center gap-3 px-4 py-3 text-[14px] font-semibold rounded-xl transition-all ${isActive ? 'text-[#003fb1] bg-[#1a56db]/10' : 'text-[#3b4854] hover:bg-gray-100'}`}
                            >
                                <span className="material-symbols-outlined text-[20px]">group</span>
                                Patients / Clients
                            </NavLink>
                            <NavLink 
                                to="/services" 
                                className={({ isActive }) => `flex items-center gap-3 px-4 py-3 text-[14px] font-semibold rounded-xl transition-all ${isActive ? 'text-[#003fb1] bg-[#1a56db]/10' : 'text-[#3b4854] hover:bg-gray-100'}`}
                            >
                                <span className="material-symbols-outlined text-[20px]">medical_services</span>
                                Services Manager
                            </NavLink>
                            <NavLink 
                                to="/analytics" 
                                className={({ isActive }) => `flex items-center gap-3 px-4 py-3 text-[14px] font-semibold rounded-xl transition-all ${isActive ? 'text-[#003fb1] bg-[#1a56db]/10' : 'text-[#3b4854] hover:bg-gray-100'}`}
                            >
                                <span className="material-symbols-outlined text-[20px]">bar_chart</span>
                                Revenue & Analytics
                            </NavLink>
                            
                            <div className="h-px bg-[#e2e8f0] my-2"></div>
                            
                            <NavLink 
                                to="/provider/settings" 
                                className={({ isActive }) => `flex items-center gap-3 px-4 py-3 text-[14px] font-semibold rounded-xl transition-all ${isActive ? 'text-[#003fb1] bg-[#1a56db]/10' : 'text-[#3b4854] hover:bg-gray-100'}`}
                            >
                                <span className="material-symbols-outlined text-[20px]">settings</span>
                                Settings
                            </NavLink>
                            <button 
                                onClick={handleLogout} 
                                className="flex items-center gap-3 px-4 py-3 text-[14px] font-semibold rounded-xl text-[#ba1a1a] hover:bg-red-50 text-left w-full cursor-pointer"
                            >
                                <span className="material-symbols-outlined text-[20px]">logout</span>
                                Sign Out
                            </button>
                        </nav>
                    </div>
                )}
            </header>
        </>
    );
};

export default ProviderTopNavigation;
