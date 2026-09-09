import { useState, useEffect } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import NotificationBell from '../NotificationBell';
import { useAuth } from '../../../context/AuthContext';

export default function UserTopNavigation() {
    const navigate = useNavigate();
    const location = useLocation();
    const { user, logout, refreshUser } = useAuth();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);

    const [liveProfilePic, setLiveProfilePic] = useState<string | null | undefined>(user?.profilePicture);
    const [liveDisplayName, setLiveDisplayName] = useState<string>(user?.fullName || 'OmniBook User');

    useEffect(() => {
        setLiveProfilePic(user?.profilePicture);
        setLiveDisplayName(user?.fullName || 'OmniBook User');
    }, [user?.profilePicture, user?.fullName]);

    useEffect(() => {
        const handleProfileUpdate = (e: any) => {
            if (e?.detail) {
                if (e.detail.profilePicture !== undefined) {
                    setLiveProfilePic(e.detail.profilePicture);
                }
                if (e.detail.fullName) {
                    setLiveDisplayName(e.detail.fullName);
                }
            }
            if (refreshUser) {
                refreshUser();
            }
        };

        window.addEventListener('userProfileUpdated', handleProfileUpdate);
        return () => window.removeEventListener('userProfileUpdated', handleProfileUpdate);
    }, [refreshUser]);

    const displayName = liveDisplayName;
    const profilePic = liveProfilePic;

    const getInitials = (name?: string) => {
        if (!name) return 'U';
        const parts = name.trim().split(/\s+/);
        if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
        return parts[0].slice(0, 2).toUpperCase();
    };

    useEffect(() => {
        setIsMobileMenuOpen(false);
        setIsProfileDropdownOpen(false);
    }, [location.pathname]);

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    return (
        <header className="fixed top-0 w-full z-50 bg-white/90 backdrop-blur-md border-b border-[#dce2f3]">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-10 h-20 flex items-center justify-between">
                {/* Logo & Mobile Hamburger */}
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        className="md:hidden p-2 -ml-2 rounded-lg text-[#53606c] hover:text-[#003fb1] hover:bg-[#f0f3ff] transition-colors"
                        aria-label="Toggle Navigation Menu"
                    >
                        <span className="material-symbols-outlined text-[24px]">
                            {isMobileMenuOpen ? 'close' : 'menu'}
                        </span>
                    </button>
                    <NavLink to="/dashboard" className="flex items-center">
                        <img
                            alt="OmniBook Logo"
                            className="object-contain h-[36px] sm:h-[40px]"
                            src="https://lh3.googleusercontent.com/aida-public/AB6AXuANVa2DIMhxwJVhPP1FnM5XPZK669t-OaZbij7sEQY2BcRjKXoLi4Xlx3422j-PoJTMmPiR5Xs2jHyWkiOQbHG2PC_dwX1bTvLCKfZJr4xERFe5jC_Eg1nCXbH4JYQNcg8LmT7jvnS2rIU1qOMeCUzpati4NDHk55Jw4yD9q-c3RF-j48vJ6qqLiyYcMo90ZH-HOFSGJv14g2VG5oLaR8SvPRMAYcJZQSHy3gVOym_POA_776_joTMmbnqxiUzecB0QZUzztl5CrHw"
                        />
                    </NavLink>
                </div>

                {/* Desktop Navigation */}
                <nav className="hidden md:flex items-center gap-6 lg:gap-8">
                    <NavLink
                        to="/dashboard"
                        className={({ isActive }) => 
                            `text-[15px] lg:text-[16px] font-semibold pb-1 transition-colors duration-200 ${isActive ? 'text-[#003fb1] border-b-2 border-[#003fb1]' : 'text-[#53606c] hover:text-[#003fb1]'}`
                        }
                    >
                        Dashboard
                    </NavLink>
                    <NavLink
                        to="/book-appointment"
                        className={({ isActive }) => 
                            `text-[15px] lg:text-[16px] font-semibold pb-1 transition-colors duration-200 ${isActive ? 'text-[#003fb1] border-b-2 border-[#003fb1]' : 'text-[#53606c] hover:text-[#003fb1]'}`
                        }
                    >
                        Book Appointment
                    </NavLink>
                    <NavLink
                        to="/my-history"
                        className={({ isActive }) => 
                            `text-[15px] lg:text-[16px] font-semibold pb-1 transition-colors duration-200 ${isActive ? 'text-[#003fb1] border-b-2 border-[#003fb1]' : 'text-[#53606c] hover:text-[#003fb1]'}`
                        }
                    >
                        My History
                    </NavLink>
                </nav>

                {/* Action Items */}
                <div className="flex items-center gap-2 sm:gap-4">
                    <NotificationBell />
                    
                    {/* User Avatar & Dropdown */}
                    <div className="relative group ml-1 sm:ml-2">
                        <div 
                            onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                            className="h-9 w-9 sm:h-10 sm:w-10 rounded-full overflow-hidden border border-[#c3c5d7] hover:scale-105 transition-transform cursor-pointer shadow-sm ring-2 ring-transparent hover:ring-[#003fb1]/30 flex items-center justify-center bg-primary text-on-primary font-bold text-sm select-none"
                        >
                            {profilePic ? (
                                <img
                                    alt="User Profile Avatar"
                                    className="w-full h-full object-cover"
                                    src={profilePic}
                                />
                            ) : (
                                <span>{getInitials(displayName)}</span>
                            )}
                        </div>
                        
                        {/* Profile Dropdown */}
                        <div className={`absolute right-0 mt-2 w-56 bg-white shadow-xl rounded-xl border border-[#dce2f3] py-2 z-[60] transition-all duration-200 ${
                            isProfileDropdownOpen ? 'opacity-100 visible' : 'opacity-0 invisible md:group-hover:opacity-100 md:group-hover:visible'
                        }`}>
                            {/* User Header */}
                            <div className="px-4 py-2.5 border-b border-[#dce2f3]/60 flex items-center gap-3">
                                {profilePic ? (
                                    <img
                                        alt="User Avatar"
                                        className="w-9 h-9 rounded-full object-cover border border-[#c3c5d7]"
                                        src={profilePic}
                                    />
                                ) : (
                                    <div className="w-9 h-9 rounded-full bg-primary text-on-primary font-bold text-xs flex items-center justify-center border border-[#c3c5d7] shrink-0 select-none">
                                        {getInitials(displayName)}
                                    </div>
                                )}
                                <div className="truncate">
                                    <p className="text-xs font-bold text-[#151c27] truncate">{displayName}</p>
                                    <p className="text-[11px] text-[#53606c] truncate">{user?.organizationName ? user.organizationName : 'Client / User'}</p>
                                </div>
                            </div>

                            <NavLink
                                className="flex items-center gap-3 px-4 py-2.5 hover:bg-[#f0f3ff] text-[#151c27] text-[14px] font-medium transition-colors"
                                to="/profile-settings"
                                onClick={() => setIsProfileDropdownOpen(false)}
                            >
                                <span className="material-symbols-outlined text-[20px]">settings</span>
                                Settings
                            </NavLink>
                            <button
                                onClick={handleLogout}
                                className="flex items-center gap-3 px-4 py-2.5 hover:bg-[#ffdad6]/20 text-[#ba1a1a] text-[14px] font-medium transition-colors w-full text-left cursor-pointer"
                            >
                                <span className="material-symbols-outlined text-[20px]">logout</span>
                                Log Out
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Mobile Drawer Menu */}
            {isMobileMenuOpen && (
                <div className="md:hidden border-t border-[#dce2f3] bg-white/98 shadow-xl animate-in slide-in-from-top duration-200">
                    <nav className="flex flex-col p-4 space-y-1">
                        <NavLink
                            to="/dashboard"
                            className={({ isActive }) => 
                                `flex items-center gap-3 px-4 py-3 rounded-xl font-semibold text-[15px] transition-colors ${
                                    isActive ? 'bg-[#003fb1]/10 text-[#003fb1]' : 'text-[#53606c] hover:bg-gray-50'
                                }`
                            }
                        >
                            <span className="material-symbols-outlined text-[20px]">dashboard</span>
                            Dashboard
                        </NavLink>
                        <NavLink
                            to="/book-appointment"
                            className={({ isActive }) => 
                                `flex items-center gap-3 px-4 py-3 rounded-xl font-semibold text-[15px] transition-colors ${
                                    isActive ? 'bg-[#003fb1]/10 text-[#003fb1]' : 'text-[#53606c] hover:bg-gray-50'
                                }`
                            }
                        >
                            <span className="material-symbols-outlined text-[20px]">calendar_add_on</span>
                            Book Appointment
                        </NavLink>
                        <NavLink
                            to="/my-history"
                            className={({ isActive }) => 
                                `flex items-center gap-3 px-4 py-3 rounded-xl font-semibold text-[15px] transition-colors ${
                                    isActive ? 'bg-[#003fb1]/10 text-[#003fb1]' : 'text-[#53606c] hover:bg-gray-50'
                                }`
                            }
                        >
                            <span className="material-symbols-outlined text-[20px]">history</span>
                            My History
                        </NavLink>
                        <NavLink
                            to="/profile-settings"
                            className={({ isActive }) => 
                                `flex items-center gap-3 px-4 py-3 rounded-xl font-semibold text-[15px] transition-colors ${
                                    isActive ? 'bg-[#003fb1]/10 text-[#003fb1]' : 'text-[#53606c] hover:bg-gray-50'
                                }`
                            }
                        >
                            <span className="material-symbols-outlined text-[20px]">settings</span>
                            Profile Settings
                        </NavLink>
                        <div className="h-px bg-[#e2e8f0] my-2"></div>
                        <button
                            onClick={handleLogout}
                            className="flex items-center gap-3 px-4 py-3 rounded-xl font-semibold text-[15px] text-[#ba1a1a] hover:bg-red-50 transition-colors w-full text-left cursor-pointer"
                        >
                            <span className="material-symbols-outlined text-[20px]">logout</span>
                            Sign Out
                        </button>
                    </nav>
                </div>
            )}
        </header>
    );
}
