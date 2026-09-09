import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { setAndBroadcastOrgType } from '../../../utils/organizationTerms';

interface Notification {
    id: number;
    title: string;
    message: string;
    type: string;
    isRead?: boolean;
    read?: boolean;
    createdAt: string;
    link?: string;
    targetRole?: string;
}

interface SearchResultItem {
    id: string;
    category: string;
    title: string;
    subtitle: string;
    status: string;
    link: string;
    icon: string;
}

export default function TopNavigation() {
    const [isFocused, setIsFocused] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [showNotifications, setShowNotifications] = useState(false);
    const [showServerStatus, setShowServerStatus] = useState(false);
    const [showAllModal, setShowAllModal] = useState(false);
    
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [hasUnread, setHasUnread] = useState(false);
    const [unreadCount, setUnreadCount] = useState<number>(0);

    const isSuperAdminContext = () => {
        if (typeof window !== 'undefined' && window.location.pathname.startsWith('/superadmin')) {
            return true;
        }
        const storedRole = (localStorage.getItem('role') || '').toLowerCase();
        return storedRole === 'superadmin' || storedRole === 'super_admin';
    };

    // Dynamic User Profile States
    const [fullName, setFullName] = useState<string>(() => {
        if (isSuperAdminContext()) {
            const stored = localStorage.getItem('superAdminFullName') || localStorage.getItem('fullName');
            if (stored && !stored.toLowerCase().includes('tagalak') && !stored.toLowerCase().includes('admin')) {
                return stored;
            }
            return 'System Admin';
        }
        return localStorage.getItem('adminFullName') || localStorage.getItem('fullName') || 'Admin';
    });

    const [roleTitle, setRoleTitle] = useState<string>(() => {
        if (isSuperAdminContext()) {
            return 'Root Authority';
        }
        const orgName = localStorage.getItem('organizationName');
        const orgType = localStorage.getItem('organizationType');
        if (orgName) return `${orgName} Admin`;
        if (orgType) return `${orgType} Admin`;
        return 'Admin';
    });

    const [profilePictureUrl, setProfilePictureUrl] = useState<string | null>(() => {
        if (isSuperAdminContext()) {
            return localStorage.getItem('superAdminProfilePicture') || null;
        }
        return localStorage.getItem('profilePicture') || localStorage.getItem('logoUrl') || null;
    });

    const [imageError, setImageError] = useState(false);

    const getFormattedImageUrl = (url: string | null) => {
        if (!url) return null;
        if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:')) {
            return url;
        }
        if (url.startsWith('/uploads/')) {
            return `http://localhost:8080${url}`;
        }
        return `http://localhost:8080/uploads/${url}`;
    };

    const getInitials = (name: string) => {
        if (!name || !name.trim()) return 'SA';
        const parts = name.trim().split(/\s+/);
        if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
        return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    };

    const searchRef = useRef<HTMLDivElement>(null);
    const notifRef = useRef<HTMLDivElement>(null);
    const serverRef = useRef<HTMLDivElement>(null);

    const navigate = useNavigate();
    const isSuperAdmin = isSuperAdminContext();
    const [searchResults, setSearchResults] = useState<SearchResultItem[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    
    const recentStorageKey = isSuperAdmin ? 'omnibook_superadmin_recent_searches' : 'omnibook_admin_recent_searches';
    const [recentSearches, setRecentSearches] = useState<string[]>(() => {
        try {
            const saved = localStorage.getItem(isSuperAdmin ? 'omnibook_superadmin_recent_searches' : 'omnibook_admin_recent_searches');
            if (saved) return JSON.parse(saved);
        } catch (e) {}
        return isSuperAdmin 
            ? ['Tenants', 'Invoices', 'Support Tickets', 'Audit Logs'] 
            : ['Appointments', 'Patients', 'Providers', 'Departments'];
    });

    useEffect(() => {
        if (!searchQuery.trim()) {
            setSearchResults([]);
            setIsSearching(false);
            return;
        }

        const timer = setTimeout(async () => {
            setIsSearching(true);
            try {
                const token = localStorage.getItem('token');
                const endpoint = isSuperAdmin
                    ? `http://localhost:8080/api/v1/superadmin/search?q=${encodeURIComponent(searchQuery.trim())}`
                    : `http://localhost:8080/api/v1/admin/search?q=${encodeURIComponent(searchQuery.trim())}`;
                
                const res = await axios.get(endpoint, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                setSearchResults(Array.isArray(res.data) ? res.data : []);
            } catch (err) {
                console.error("Global search failed", err);
                setSearchResults([]);
            } finally {
                setIsSearching(false);
            }
        }, 220);

        return () => clearTimeout(timer);
    }, [searchQuery, isSuperAdmin]);

    const saveToRecent = (term: string) => {
        if (!term || !term.trim()) return;
        const clean = term.trim();
        const updated = [clean, ...recentSearches.filter(s => s.toLowerCase() !== clean.toLowerCase())].slice(0, 5);
        setRecentSearches(updated);
        try {
            localStorage.setItem(recentStorageKey, JSON.stringify(updated));
        } catch (e) {}
    };

    const handleSelectResult = (item: SearchResultItem) => {
        saveToRecent(item.title);
        setIsFocused(false);
        setSearchQuery('');
        if (item.link) {
            navigate(item.link);
        }
    };

    const handleClearRecent = (e: React.MouseEvent) => {
        e.stopPropagation();
        setRecentSearches([]);
        try {
            localStorage.removeItem(recentStorageKey);
        } catch (e) {}
    };

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
                setIsFocused(false);
            }
            if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
                setShowNotifications(false);
            }
            if (serverRef.current && !serverRef.current.contains(event.target as Node)) {
                setShowServerStatus(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Fetch Notifications from the API
    const fetchNotifications = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) return;
            const res = await axios.get('http://localhost:8080/api/v1/notifications', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            
            const raw = res.data;
            const fetched: Notification[] = Array.isArray(raw) ? raw : (raw?.notifications || []);
            setNotifications(fetched);
            
            const isUnread = (n: Notification) => !(n.isRead ?? n.read ?? false);
            const count = typeof raw?.unreadCount === 'number' ? raw.unreadCount : fetched.filter(isUnread).length;
            setUnreadCount(count);
            setHasUnread(count > 0);
        } catch (error) {
            console.error("Failed to fetch notifications", error);
        }
    };

    // Fetch User Profile Dynamically
    const fetchUserProfile = async () => {
        const isSuper = isSuperAdminContext();

        if (isSuper) {
            setRoleTitle('Root Authority');
            // Clean up any stale tenant or Tagalak keys that might pollute super admin
            const currentFull = localStorage.getItem('fullName');
            if (currentFull && currentFull.toLowerCase().includes('tagalak')) {
                localStorage.removeItem('fullName');
            }
            localStorage.removeItem('organizationName');
            localStorage.removeItem('adminFullName');

            const token = localStorage.getItem('token');
            if (token) {
                try {
                    const userRes = await axios.get('http://localhost:8080/api/v1/user/profile', {
                        headers: { 'Authorization': `Bearer ${token}` }
                    });
                    if (userRes.data) {
                        const userRole = (userRes.data.role || '').toLowerCase();
                        if (userRole === 'superadmin' || userRole === 'super_admin') {
                            const name = userRes.data.fullName || 'System Admin';
                            setFullName(name);
                            localStorage.setItem('superAdminFullName', name);
                            localStorage.setItem('fullName', name);
                            const pic = userRes.data.profilePicture || null;
                            setProfilePictureUrl(pic);
                            if (pic) {
                                localStorage.setItem('superAdminProfilePicture', pic);
                                setImageError(false);
                            } else {
                                localStorage.removeItem('superAdminProfilePicture');
                            }
                            return;
                        }
                    }
                } catch (err) {
                    console.error("Failed to fetch superadmin profile", err);
                }
            }
            setFullName('System Admin');
            setProfilePictureUrl(null);
            return;
        }

        const token = localStorage.getItem('token');
        if (!token) return;

        try {
            const userRes = await axios.get('http://localhost:8080/api/v1/user/profile', {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (userRes.data) {
                const isAdmin = (userRes.data.role || '').toLowerCase().includes('admin');
                if (isAdmin) {
                    setFullName(userRes.data.fullName);
                    localStorage.setItem('fullName', userRes.data.fullName);
                    localStorage.setItem('adminFullName', userRes.data.fullName);
                    const orgName = userRes.data.organizationName || localStorage.getItem('organizationName');
                    if (orgName) setRoleTitle(`${orgName} Admin`);

                    const pic = userRes.data.profilePicture || userRes.data.logoUrl;
                    setProfilePictureUrl(pic || null);
                    if (pic) {
                        localStorage.setItem('profilePicture', pic);
                        setImageError(false);
                    }
                }
                if (userRes.data.organizationName) {
                    localStorage.setItem('organizationName', userRes.data.organizationName);
                }
            }
        } catch (err) {
            console.error("Failed to fetch user profile in navbar:", err);
        }

        try {
            const tenantRes = await axios.get('http://localhost:8080/api/v1/tenant/me', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (tenantRes.data) {
                if (tenantRes.data.organizationName) {
                    localStorage.setItem('organizationName', tenantRes.data.organizationName);
                    setRoleTitle(`${tenantRes.data.organizationName} Admin`);
                }
                if (tenantRes.data.organizationType) {
                    localStorage.setItem('organizationType', tenantRes.data.organizationType);
                    setAndBroadcastOrgType(tenantRes.data.organizationType);
                }
                if (tenantRes.data.adminName) {
                    setFullName(tenantRes.data.adminName);
                    localStorage.setItem('adminFullName', tenantRes.data.adminName);
                    localStorage.setItem('fullName', tenantRes.data.adminName);
                }
                if (tenantRes.data.logoUrl) {
                    localStorage.setItem('logoUrl', tenantRes.data.logoUrl);
                    setProfilePictureUrl(tenantRes.data.logoUrl);
                    setImageError(false);
                }
            }
        } catch (err) {
            // Normal fallback for non-tenant users
        }
    };

    useEffect(() => {
        fetchNotifications();
        fetchUserProfile();
        const interval = setInterval(fetchNotifications, 15000); // Check every 15s

        const handleProfileUpdate = (e: any) => {
            const isSuper = isSuperAdminContext();
            if (isSuper) {
                setRoleTitle('Root Authority');
                const saPic = e.detail?.profilePicture || localStorage.getItem('superAdminProfilePicture') || null;
                setProfilePictureUrl(saPic);
                if (e.detail?.fullName) setFullName(e.detail.fullName);
                return;
            }

            const newPic = e.detail?.profilePicture || localStorage.getItem('profilePicture') || localStorage.getItem('logoUrl');
            const newName = localStorage.getItem('adminFullName') || e.detail?.fullName || localStorage.getItem('fullName');
            const newOrg = localStorage.getItem('organizationName');

            if (newPic) {
                setProfilePictureUrl(newPic);
                setImageError(false);
            }
            if (newName) setFullName(newName);
            if (newOrg) setRoleTitle(`${newOrg} Admin`);
        };

        window.addEventListener('userProfileUpdated', handleProfileUpdate);
        window.addEventListener('storage', handleProfileUpdate);

        return () => {
            clearInterval(interval);
            window.removeEventListener('userProfileUpdated', handleProfileUpdate);
            window.removeEventListener('storage', handleProfileUpdate);
        };
    }, []);

    const handleMarkAllRead = async () => {
        try {
            const token = localStorage.getItem('token');
            await axios.put('http://localhost:8080/api/v1/notifications/read-all', {}, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            setHasUnread(false);
            setUnreadCount(0);
            setNotifications(prev => prev.map(n => ({ ...n, isRead: true, read: true })));
        } catch (error) {
            console.error("Failed to mark notifications as read", error);
        }
    };

    const handleNotificationClick = async (n: Notification) => {
        const isUnread = !(n.isRead ?? n.read ?? false);
        if (isUnread) {
            try {
                const token = localStorage.getItem('token');
                await axios.put(`http://localhost:8080/api/v1/notifications/${n.id}/read`, {}, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                setNotifications(prev => prev.map(item => item.id === n.id ? { ...item, isRead: true, read: true } : item));
                setUnreadCount(prev => Math.max(0, prev - 1));
                setHasUnread(notifications.some(item => item.id !== n.id && !(item.isRead ?? item.read ?? false)));
            } catch (e) {
                console.error("Failed to mark notification as read", e);
            }
        }
        setShowNotifications(false);
        setShowAllModal(false);
        if (n.link) {
            navigate(n.link);
        } else if (n.type === 'SUBSCRIPTION_PAID' || n.type === 'SUBSCRIPTION_ORDER') {
            navigate('/superadmin/settings?tab=Billing+%26+Subscriptions');
        }
    };

    const getNotificationIcon = (type: string) => {
        switch (type) {
            case 'SUBSCRIPTION_PAID':
                return 'payments';
            case 'SUBSCRIPTION_ORDER':
                return 'receipt_long';
            case 'BOOKING_CONFIRMED':
            case 'NEW_APPOINTMENT':
            case 'BOOKING_REQUEST':
                return 'event_available';
            case 'APPROVED':
                return 'check_circle';
            case 'CHECKED_IN':
                return 'how_to_reg';
            case 'COMPLETED':
                return 'task_alt';
            case 'CANCELLED':
                return 'event_busy';
            case 'RESCHEDULED':
                return 'edit_calendar';
            case 'AUTH_LOGIN':
                return 'login';
            case 'TENANT_REGISTER':
            case 'TENANT_APPROVE':
                return 'domain_add';
            default:
                return 'notifications';
        }
    };

    const getNotificationColor = (type: string) => {
        switch (type) {
            case 'SUBSCRIPTION_PAID':
                return 'bg-emerald-100 text-emerald-700';
            case 'SUBSCRIPTION_ORDER':
                return 'bg-blue-100 text-blue-700';
            case 'BOOKING_CONFIRMED':
            case 'NEW_APPOINTMENT':
            case 'BOOKING_REQUEST':
                return 'bg-blue-100 text-blue-700';
            case 'APPROVED':
                return 'bg-emerald-100 text-emerald-700';
            case 'CHECKED_IN':
                return 'bg-purple-100 text-purple-700';
            case 'COMPLETED':
                return 'bg-teal-100 text-teal-700';
            case 'CANCELLED':
                return 'bg-red-100 text-red-700';
            case 'RESCHEDULED':
                return 'bg-amber-100 text-amber-700';
            case 'AUTH_LOGIN':
                return 'bg-indigo-100 text-indigo-700';
            case 'TENANT_REGISTER':
            case 'TENANT_APPROVE':
                return 'bg-green-100 text-green-700';
            default:
                return 'bg-surface-container text-on-surface-variant';
        }
    };

    const timeAgo = (dateString: string) => {
        if (!dateString) return "Just now";
        const date = new Date(dateString);
        const now = new Date();
        const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
        
        if (diffInSeconds < 60) return `Just now`;
        
        const diffInMinutes = Math.floor(diffInSeconds / 60);
        if (diffInMinutes < 60) return `${diffInMinutes} mins ago`;
        
        const diffInHours = Math.floor(diffInMinutes / 60);
        if (diffInHours < 24) return `${diffInHours} hours ago`;
        
        const diffInDays = Math.floor(diffInHours / 24);
        return `${diffInDays} days ago`;
    };

    return (
        <>
        <header className="flex justify-between items-center h-16 fixed top-0 left-0 lg:left-[280px] right-0 bg-surface-container-lowest z-40 border-b border-surface-container px-4 sm:px-6 lg:px-8 transition-all">
            <div className="flex items-center gap-2 sm:gap-4">
                {/* Mobile Menu Hamburger Button */}
                <button 
                    onClick={() => window.dispatchEvent(new CustomEvent('omni-toggle-sidebar'))}
                    className="lg:hidden p-2 -ml-1 rounded-lg text-on-surface-variant hover:bg-surface-container-low transition-colors flex items-center justify-center shrink-0"
                    aria-label="Toggle navigation menu"
                >
                    <span className="material-symbols-outlined text-[24px]">menu</span>
                </button>

                <div className="flex items-center gap-2 bg-green-50 text-green-700 px-2.5 sm:px-3 py-1 rounded-full border border-green-200 animate-pulse cursor-pointer hover:bg-green-100 transition-colors shrink-0">
                    <span className="w-2 h-2 rounded-full bg-green-500"></span>
                    <span className="font-label-md text-label-md font-bold hidden sm:inline">All Systems Operational</span>
                    <span className="font-label-md text-label-md font-bold sm:hidden text-[11px]">Online</span>
                </div>
                
                {/* Search Bar with Dynamic Dropdown */}
                <div className="relative group" ref={searchRef}>
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[18px] sm:text-[20px] pointer-events-none">search</span>
                    <input 
                        className={`bg-surface-container-low border-none rounded-full pl-9 sm:pl-10 pr-8 py-1.5 sm:py-2 text-body-md font-body-md transition-all outline-none focus:ring-2 focus:ring-secondary-container ${isFocused || searchQuery ? 'w-56 sm:w-96 shadow-md' : 'w-32 sm:w-64'}`}
                        placeholder={isSuperAdmin ? "Search tenants, invoices, tickets..." : "Search appointments, patients, staff..."} 
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onFocus={() => setIsFocused(true)}
                    />
                    {searchQuery && (
                        <button 
                            onClick={() => setSearchQuery('')}
                            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface p-0.5 rounded-full hover:bg-surface-container transition-colors"
                        >
                            <span className="material-symbols-outlined text-[16px]">close</span>
                        </button>
                    )}
                    
                    {/* Search Results Dropdown */}
                    {(isFocused || searchQuery) && (
                        <div className="absolute top-full left-0 mt-2 w-80 sm:w-[420px] bg-surface-container-lowest border border-surface-container rounded-2xl shadow-2xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                            {searchQuery.trim() ? (
                                <div className="max-h-96 overflow-y-auto custom-scrollbar">
                                    <div className="p-3 border-b border-surface-container bg-surface-container-low/60 flex items-center justify-between">
                                        <p className="font-label-md text-label-md text-on-surface-variant flex items-center gap-1.5">
                                            <span>Results for</span>
                                            <span className="font-bold text-on-surface">"{searchQuery}"</span>
                                        </p>
                                        {isSearching && (
                                            <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                                        )}
                                    </div>

                                    {searchResults.length > 0 ? (
                                        <div className="p-2 space-y-3">
                                            {Object.entries(
                                                searchResults.reduce((acc, item) => {
                                                    const cat = item.category || 'General';
                                                    if (!acc[cat]) acc[cat] = [];
                                                    acc[cat].push(item);
                                                    return acc;
                                                }, {} as Record<string, SearchResultItem[]>)
                                            ).map(([category, items]) => (
                                                <div key={category} className="space-y-1">
                                                    <div className="px-2 py-1 flex items-center justify-between">
                                                        <span className="text-[11px] font-bold uppercase tracking-wider text-primary">{category}</span>
                                                        <span className="text-[10px] text-on-surface-variant bg-surface-container px-1.5 py-0.5 rounded-full">{items.length}</span>
                                                    </div>
                                                    <ul className="divide-y divide-surface-container/50">
                                                        {items.map(result => (
                                                            <li 
                                                                key={result.id} 
                                                                onClick={() => handleSelectResult(result)}
                                                                className="p-2.5 rounded-xl hover:bg-surface-container-low cursor-pointer transition-colors flex items-center justify-between gap-3 group/item"
                                                            >
                                                                <div className="flex items-center gap-2.5 min-w-0">
                                                                    <div className="w-8 h-8 rounded-lg bg-surface-container flex items-center justify-center text-on-surface-variant group-hover/item:bg-primary group-hover/item:text-on-primary transition-colors shrink-0">
                                                                        <span className="material-symbols-outlined text-[18px]">{result.icon || 'search'}</span>
                                                                    </div>
                                                                    <div className="min-w-0">
                                                                        <p className="font-body-md font-semibold text-on-surface text-[13px] truncate">{result.title}</p>
                                                                        <p className="text-[11px] text-on-surface-variant truncate">{result.subtitle}</p>
                                                                    </div>
                                                                </div>
                                                                {result.status && (
                                                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
                                                                        ['ACTIVE', 'PAID', 'CHECKED_IN', 'RESOLVED', 'CLOSED', 'Active'].includes(result.status)
                                                                            ? 'bg-green-100 text-green-700 border border-green-200'
                                                                            : ['SCHEDULED', 'PAGE', 'MODULE', 'RBAC', 'Page', 'Module'].includes(result.status)
                                                                            ? 'bg-blue-100 text-blue-700 border border-blue-200'
                                                                            : ['PENDING', 'OPEN', 'IN PROGRESS', 'URGENT', 'Config'].includes(result.status)
                                                                            ? 'bg-amber-100 text-amber-700 border border-amber-200'
                                                                            : 'bg-surface-container text-on-surface-variant'
                                                                    }`}>
                                                                        {result.status}
                                                                    </span>
                                                                )}
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            ))}
                                        </div>
                                    ) : !isSearching ? (
                                        <div className="p-8 text-center text-on-surface-variant">
                                            <span className="material-symbols-outlined text-[36px] mb-2 opacity-40">search_off</span>
                                            <p className="font-body-md text-sm font-semibold">No results found</p>
                                            <p className="text-xs text-on-surface-variant mt-0.5">Try searching with a different term in this console.</p>
                                        </div>
                                    ) : null}
                                </div>
                            ) : (
                                <div className="p-4">
                                    <div className="flex items-center justify-between mb-2.5">
                                        <p className="font-label-md text-label-md text-on-surface-variant font-bold text-xs uppercase tracking-wider">Recent Searches</p>
                                        {recentSearches.length > 0 && (
                                            <button 
                                                onClick={handleClearRecent}
                                                className="text-[11px] text-primary hover:underline"
                                            >
                                                Clear
                                            </button>
                                        )}
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {recentSearches.map((term, i) => (
                                            <span 
                                                key={i} 
                                                onClick={() => setSearchQuery(term)}
                                                className="px-3 py-1 bg-surface-container-low hover:bg-surface-container text-[12px] rounded-full text-on-surface-variant cursor-pointer transition-colors flex items-center gap-1 font-medium"
                                            >
                                                <span className="material-symbols-outlined text-[13px] opacity-60">history</span>
                                                {term}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
            
            <div className="flex items-center gap-2 sm:gap-4 shrink-0">
                {/* Notifications Dropdown */}
                <div className="relative" ref={notifRef}>
                    <button 
                        onClick={() => {
                            setShowNotifications(!showNotifications);
                        }}
                        className={`p-2 rounded-full transition-colors relative ${showNotifications ? 'bg-secondary-container/20 text-secondary' : 'text-on-surface-variant hover:bg-surface-container-low'}`}
                        aria-label="Notifications"
                    >
                        <span className="material-symbols-outlined">notifications</span>
                        {hasUnread && (
                            <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 bg-error text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-surface-container-lowest shadow-sm">
                                {unreadCount > 9 ? '9+' : unreadCount}
                            </span>
                        )}
                    </button>
                    
                    {showNotifications && (
                        <div className="absolute top-full right-0 mt-2 w-[calc(100vw-24px)] sm:w-96 max-w-md bg-surface-container-lowest border border-surface-container rounded-2xl shadow-2xl overflow-hidden z-50">
                            <div className="flex justify-between items-center px-4 py-3.5 border-b border-surface-container bg-surface-container-low/40">
                                <div className="flex items-center gap-2">
                                    <h3 className="font-headline-md text-headline-md text-on-surface text-sm font-bold">Notifications</h3>
                                    {unreadCount > 0 && (
                                        <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-[11px] font-semibold rounded-full">
                                            {unreadCount} new
                                        </span>
                                    )}
                                </div>
                                {unreadCount > 0 && (
                                    <button onClick={handleMarkAllRead} className="text-[11px] font-bold text-secondary cursor-pointer hover:underline">
                                        Mark all read
                                    </button>
                                )}
                            </div>
                            <div className="max-h-96 overflow-y-auto custom-scrollbar divide-y divide-surface-container">
                                {notifications.length > 0 ? notifications.slice(0, 6).map(n => {
                                    const isRead = n.isRead ?? n.read ?? false;
                                    return (
                                        <div 
                                            key={n.id} 
                                            onClick={() => handleNotificationClick(n)}
                                            className={`p-3.5 flex items-start gap-3 hover:bg-surface-container-low cursor-pointer transition-colors ${!isRead ? 'bg-blue-50/40' : ''}`}
                                        >
                                            <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${getNotificationColor(n.type)}`}>
                                                <span className="material-symbols-outlined text-[18px]">
                                                    {getNotificationIcon(n.type)}
                                                </span>
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex justify-between items-start mb-0.5">
                                                    <p className={`text-xs truncate ${!isRead ? 'font-bold text-on-surface' : 'font-semibold text-on-surface'}`}>
                                                        {n.title}
                                                    </p>
                                                    <span className="text-[10px] text-on-surface-variant font-mono-data ml-2 shrink-0">
                                                        {timeAgo(n.createdAt)}
                                                    </span>
                                                </div>
                                                <p className="text-[11px] text-on-surface-variant leading-relaxed line-clamp-2">
                                                    {n.message}
                                                </p>
                                                {n.link && (
                                                    <span className="inline-flex items-center gap-0.5 text-[10px] text-secondary font-medium mt-1 hover:underline">
                                                        View details
                                                        <span className="material-symbols-outlined text-[12px]">arrow_outward</span>
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    );
                                }) : (
                                    <div className="p-8 text-center">
                                        <span className="material-symbols-outlined text-3xl mb-2 text-on-surface-variant/40">notifications_off</span>
                                        <p className="text-[12px] text-on-surface-variant">No notifications yet</p>
                                    </div>
                                )}
                            </div>
                            <div className="p-3 bg-surface-container-low/50 text-center border-t border-surface-container">
                                <button 
                                    onClick={() => {
                                        setShowNotifications(false);
                                        setShowAllModal(true);
                                    }}
                                    className="text-[12px] font-bold text-secondary hover:underline flex items-center justify-center gap-1 mx-auto"
                                >
                                    View All Notifications
                                    <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Server Status Dropdown */}
                <div className="relative" ref={serverRef}>
                    <button 
                        onClick={() => setShowServerStatus(!showServerStatus)}
                        className={`p-2 rounded-full transition-colors ${showServerStatus ? 'bg-secondary-container/20 text-secondary' : 'text-on-surface-variant hover:bg-surface-container-low'}`}
                    >
                        <span className="material-symbols-outlined">dns</span>
                    </button>
                    
                    {showServerStatus && (
                        <div className="absolute top-full right-0 mt-2 w-[calc(100vw-24px)] sm:w-72 max-w-sm bg-surface-container-lowest border border-surface-container rounded-xl shadow-xl overflow-hidden z-50 p-5">
                            <h3 className="font-headline-md text-headline-md text-on-surface mb-4">Infrastructure Status</h3>
                            <div className="space-y-4">
                                <div>
                                    <div className="flex justify-between text-[12px] mb-1">
                                        <span className="font-semibold text-on-surface">Database Load</span>
                                        <span className="font-mono-data text-on-surface-variant">24%</span>
                                    </div>
                                    <div className="w-full bg-surface-container rounded-full h-1.5">
                                        <div className="bg-green-500 h-1.5 rounded-full" style={{ width: '24%' }}></div>
                                    </div>
                                </div>
                                <div>
                                    <div className="flex justify-between text-[12px] mb-1">
                                        <span className="font-semibold text-on-surface">Memory Usage</span>
                                        <span className="font-mono-data text-on-surface-variant">68%</span>
                                    </div>
                                    <div className="w-full bg-surface-container rounded-full h-1.5">
                                        <div className="bg-orange-400 h-1.5 rounded-full" style={{ width: '68%' }}></div>
                                    </div>
                                </div>
                                <div>
                                    <div className="flex justify-between text-[12px] mb-1">
                                        <span className="font-semibold text-on-surface">Replica Sync Status</span>
                                        <span className="text-green-600 font-bold">Healthy</span>
                                    </div>
                                </div>
                            </div>
                            <div className="mt-5 pt-4 border-t border-surface-container text-right">
                                <button className="text-[12px] font-bold text-secondary hover:underline">Access Terminal</button>
                            </div>
                        </div>
                    )}
                </div>
                
                <div className="h-6 sm:h-8 w-px bg-surface-container mx-1 sm:mx-2"></div>
                
                <div className="flex items-center gap-2 sm:gap-3">
                    <div className="text-right hidden sm:block">
                        <p className="font-label-md text-label-md font-bold text-primary leading-tight">{fullName}</p>
                        <p className="text-[10px] text-on-surface-variant uppercase tracking-tighter">{roleTitle}</p>
                    </div>
                    {profilePictureUrl && !imageError ? (
                        <img 
                            className="w-8 h-8 sm:w-10 sm:h-10 rounded-full border-2 border-secondary-container object-cover shrink-0 shadow-sm transition-transform hover:scale-105" 
                            alt={fullName} 
                            src={getFormattedImageUrl(profilePictureUrl) || ''}
                            onError={() => setImageError(true)}
                        />
                    ) : (
                        <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full border-2 border-secondary-container bg-primary text-on-primary flex items-center justify-center font-bold text-xs sm:text-sm shrink-0 shadow-sm uppercase tracking-wider">
                            {getInitials(fullName)}
                        </div>
                    )}
                </div>
            </div>
        </header>

        {/* View All Notifications Modal */}
        {showAllModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-tertiary-container/40 backdrop-blur-sm animate-in fade-in duration-200">
                <div className="bg-surface-container-lowest rounded-xl shadow-2xl max-w-3xl w-full border border-surface-container flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-200">
                    <div className="px-6 py-5 border-b border-surface-container flex justify-between items-center bg-surface shrink-0">
                        <div>
                            <h3 className="font-headline-md text-headline-md flex items-center gap-2">
                                <span className="material-symbols-outlined text-secondary">notifications</span>
                                All Notifications
                            </h3>
                            <p className="text-body-sm text-on-surface-variant mt-1">Global history of platform events.</p>
                        </div>
                        <button 
                            onClick={() => setShowAllModal(false)}
                            className="text-on-surface-variant hover:text-error transition-colors p-1 rounded-full hover:bg-surface-container-lowest"
                        >
                            <span className="material-symbols-outlined">close</span>
                        </button>
                    </div>
                    
                    <div className="p-0 overflow-y-auto custom-scrollbar flex-1 bg-surface-container-lowest">
                        {notifications.length > 0 ? (
                            <div className="divide-y divide-surface-container">
                                {notifications.map(n => {
                                    const isRead = n.isRead ?? n.read ?? false;
                                    return (
                                        <div 
                                            key={n.id} 
                                            onClick={() => handleNotificationClick(n)}
                                            className={`p-5 flex items-start gap-4 transition-colors hover:bg-surface-container-low cursor-pointer ${!isRead ? 'bg-blue-50/20' : ''}`}
                                        >
                                            <div className={`p-2.5 rounded-xl shrink-0 ${getNotificationColor(n.type)}`}>
                                                <span className="material-symbols-outlined text-[20px]">
                                                    {getNotificationIcon(n.type)}
                                                </span>
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex justify-between items-start mb-1">
                                                    <h4 className={`text-sm ${!isRead ? 'font-bold text-on-surface' : 'font-semibold text-on-surface'}`}>
                                                        {n.title}
                                                    </h4>
                                                    <span className="text-[11px] text-on-surface-variant font-mono-data ml-2 shrink-0">
                                                        {timeAgo(n.createdAt)}
                                                    </span>
                                                </div>
                                                <p className="font-body-md text-body-md text-on-surface-variant mb-1">
                                                    {n.message}
                                                </p>
                                                {n.link && (
                                                    <span className="inline-flex items-center gap-1 text-xs text-secondary font-medium hover:underline">
                                                        View details
                                                        <span className="material-symbols-outlined text-[12px]">arrow_outward</span>
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="p-12 flex flex-col items-center justify-center text-on-surface-variant h-full">
                                <span className="material-symbols-outlined text-5xl mb-4 opacity-30">notifications_off</span>
                                <p className="font-body-lg text-body-lg">No notifications found.</p>
                            </div>
                        )}
                    </div>
                    
                    <div className="px-6 py-4 border-t border-surface-container bg-surface-container-low flex justify-between shrink-0">
                        <button 
                            onClick={handleMarkAllRead}
                            className="text-secondary font-label-md hover:underline"
                        >
                            Mark all as read
                        </button>
                        <button 
                            onClick={() => setShowAllModal(false)}
                            className="bg-primary-container text-white px-6 py-2 rounded-lg font-label-md hover:bg-primary-fixed-dim transition-colors"
                        >
                            Close
                        </button>
                    </div>
                </div>
            </div>
        )}
        </>
    );
}
