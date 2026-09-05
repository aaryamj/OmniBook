import { useState, useRef, useEffect } from 'react';
import axios from 'axios';

interface Notification {
    id: number;
    title: string;
    message: string;
    type: string;
    isRead: boolean;
    createdAt: string;
}

export default function TopNavigation() {
    const [isFocused, setIsFocused] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [showNotifications, setShowNotifications] = useState(false);
    const [showServerStatus, setShowServerStatus] = useState(false);
    const [showAllModal, setShowAllModal] = useState(false);
    
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [hasUnread, setHasUnread] = useState(false);

    const searchRef = useRef<HTMLDivElement>(null);
    const notifRef = useRef<HTMLDivElement>(null);
    const serverRef = useRef<HTMLDivElement>(null);

    // Mock Search Data
    const mockSearchResults = [
        { id: 1, type: 'Tenant', name: 'Kathmandu Central Hospital', status: 'Active' },
        { id: 2, type: 'Tenant', name: 'Pokhara Eye Clinic', status: 'Pending' },
        { id: 3, type: 'Setting', name: 'Global Payment Gateway', status: 'Config' },
        { id: 4, type: 'User', name: 'Dr. Sharma (System Admin)', status: 'Active' },
    ].filter(item => item.name.toLowerCase().includes(searchQuery.toLowerCase()) || item.type.toLowerCase().includes(searchQuery.toLowerCase()));

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

    // Fetch Notifications from the new API
    const fetchNotifications = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get('http://localhost:8080/api/v1/notifications', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            
            const fetched: Notification[] = Array.isArray(res.data) ? res.data : [];
            setNotifications(fetched);
            
            // Check if there are any unread notifications
            const unread = fetched.some(n => !n.isRead);
            setHasUnread(unread);
        } catch (error) {
            console.error("Failed to fetch notifications", error);
        }
    };

    useEffect(() => {
        fetchNotifications();
        const interval = setInterval(fetchNotifications, 15000); // Check every 15s
        return () => clearInterval(interval);
    }, []);

    const handleMarkAllRead = async () => {
        try {
            const token = localStorage.getItem('token');
            await axios.post('http://localhost:8080/api/v1/notifications/mark-read', {}, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            setHasUnread(false);
            // Optmistic update
            setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
        } catch (error) {
            console.error("Failed to mark notifications as read", error);
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
                
                {/* Search Bar with Dropdown */}
                <div className="relative group" ref={searchRef}>
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[18px] sm:text-[20px]">search</span>
                    <input 
                        className={`bg-surface-container-low border-none rounded-full pl-9 sm:pl-10 pr-3 py-1.5 sm:py-2 text-body-md font-body-md transition-all outline-none focus:ring-2 focus:ring-secondary-container ${isFocused || searchQuery ? 'w-44 sm:w-80' : 'w-28 sm:w-64'}`}
                        placeholder="Search..." 
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onFocus={() => setIsFocused(true)}
                    />
                    
                    {/* Search Results Dropdown */}
                    {(isFocused || searchQuery) && (
                        <div className="absolute top-full left-0 mt-2 w-72 sm:w-full bg-surface-container-lowest border border-surface-container rounded-xl shadow-xl overflow-hidden z-50">
                            {searchQuery ? (
                                <div className="max-h-80 overflow-y-auto custom-scrollbar">
                                    <div className="p-3 border-b border-surface-container bg-surface-container-low/50">
                                        <p className="font-label-md text-label-md text-on-surface-variant">Results for "{searchQuery}"</p>
                                    </div>
                                    {mockSearchResults.length > 0 ? (
                                        <ul className="divide-y divide-surface-container">
                                            {mockSearchResults.map(result => (
                                                <li key={result.id} className="p-3 hover:bg-surface-container-low cursor-pointer transition-colors flex justify-between items-center">
                                                    <div>
                                                        <p className="font-body-md font-semibold text-on-surface">{result.name}</p>
                                                        <p className="text-[12px] text-on-surface-variant">{result.type}</p>
                                                    </div>
                                                    <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${result.status === 'Active' ? 'bg-green-100 text-green-700' : result.status === 'Pending' ? 'bg-orange-100 text-orange-700' : 'bg-surface-container text-on-surface-variant'}`}>{result.status}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    ) : (
                                        <div className="p-6 text-center text-on-surface-variant">
                                            <span className="material-symbols-outlined text-[32px] mb-2 opacity-50">search_off</span>
                                            <p className="font-body-md">No results found.</p>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="p-4">
                                    <p className="font-label-md text-label-md text-on-surface-variant mb-2">Recent Searches</p>
                                    <div className="flex flex-wrap gap-2">
                                        <span className="px-3 py-1 bg-surface-container-low text-[12px] rounded-full text-on-surface-variant cursor-pointer hover:bg-surface-container transition-colors">Kathmandu Central</span>
                                        <span className="px-3 py-1 bg-surface-container-low text-[12px] rounded-full text-on-surface-variant cursor-pointer hover:bg-surface-container transition-colors">Billing Config</span>
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
                            // Do not auto mark-read here; let them click the button or we can do it automatically
                            if (!showNotifications && hasUnread) {
                                handleMarkAllRead();
                            }
                        }}
                        className={`p-2 rounded-full transition-colors relative ${showNotifications ? 'bg-secondary-container/20 text-secondary' : 'text-on-surface-variant hover:bg-surface-container-low'}`}
                    >
                        <span className="material-symbols-outlined">notifications</span>
                        {hasUnread && (
                            <span className="absolute top-2 right-2 w-2 h-2 bg-error rounded-full ring-2 ring-surface-container-lowest animate-pulse"></span>
                        )}
                    </button>
                    
                    {showNotifications && (
                        <div className="absolute top-full right-0 mt-2 w-[calc(100vw-24px)] sm:w-80 max-w-sm bg-surface-container-lowest border border-surface-container rounded-xl shadow-xl overflow-hidden z-50">
                            <div className="flex justify-between items-center p-4 border-b border-surface-container">
                                <h3 className="font-headline-md text-headline-md text-on-surface">Notifications</h3>
                                <span onClick={handleMarkAllRead} className="text-[11px] font-bold text-secondary cursor-pointer hover:underline">Mark all read</span>
                            </div>
                            <div className="max-h-96 overflow-y-auto custom-scrollbar divide-y divide-surface-container">
                                {notifications.length > 0 ? notifications.slice(0, 5).map(n => (
                                    <div key={n.id} className={`p-4 hover:bg-surface-container-low cursor-pointer transition-colors ${!n.isRead ? 'bg-blue-50/30' : ''}`}>
                                        <p className="font-body-md font-semibold text-on-surface mb-1">
                                            {n.title}
                                        </p>
                                        <p className="text-[12px] text-on-surface-variant leading-relaxed">
                                            {n.message}
                                        </p>
                                        <p className="text-[10px] text-on-surface-variant mt-2 font-mono-data">{timeAgo(n.createdAt)}</p>
                                    </div>
                                )) : (
                                    <div className="p-6 text-center">
                                        <p className="text-[12px] text-on-surface-variant">No recent notifications</p>
                                    </div>
                                )}
                            </div>
                            <div className="p-3 bg-surface-container-low/50 text-center border-t border-surface-container">
                                <button 
                                    onClick={() => {
                                        setShowNotifications(false);
                                        setShowAllModal(true);
                                    }}
                                    className="text-[12px] font-bold text-secondary hover:underline"
                                >
                                    View All Notifications
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
                        <p className="font-label-md text-label-md font-bold text-primary leading-tight">System Admin</p>
                        <p className="text-[10px] text-on-surface-variant uppercase tracking-tighter">Root Authority</p>
                    </div>
                    <img 
                        className="w-8 h-8 sm:w-10 sm:h-10 rounded-full border-2 border-secondary-container object-cover shrink-0" 
                        alt="A professional close-up headshot of a system administrator" 
                        src="https://lh3.googleusercontent.com/aida-public/AB6AXuCR4NuQrP0OVv9E3TBWowU5DxCY4R2lKuXIhFR-5v5Yi6NW-7ZnVCm28eJO1p40UJ6rlCO2TCFdKRiEsCQqawH1owtj2QDR_Q3LdP61QHuPHwIwunqA_g3-J8ezolvnS0JfeOShazN5GMhrqtX8ZGfZEjshnsYCaBvDm7PfTuXfJqLmdbA5tEbx0Htji-63a-KiBaP8hB0OFiuJ4xka9SG5gyAVi0mRdV2NyIIL7gCXr99R9R6E08Xe"
                    />
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
                                {notifications.map(n => (
                                    <div key={n.id} className={`p-5 flex items-start gap-4 transition-colors hover:bg-surface-container-low/50 ${!n.isRead ? 'bg-blue-50/20' : ''}`}>
                                        <div className={`p-2 rounded-full shrink-0 ${!n.isRead ? 'bg-secondary-container text-secondary' : 'bg-surface-container text-on-surface-variant'}`}>
                                            <span className="material-symbols-outlined text-[20px]">
                                                {n.type === 'AUTH_LOGIN' ? 'login' : n.type === 'TENANT_REGISTER' ? 'domain_add' : n.type === 'TENANT_APPROVE' ? 'verified' : 'info'}
                                            </span>
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex justify-between items-start mb-1">
                                                <h4 className="font-label-lg text-label-lg text-on-surface">{n.title}</h4>
                                                <span className="text-[11px] text-on-surface-variant font-mono-data">{timeAgo(n.createdAt)}</span>
                                            </div>
                                            <p className="font-body-md text-body-md text-on-surface-variant">{n.message}</p>
                                        </div>
                                    </div>
                                ))}
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
