import { useState, useRef, useEffect } from 'react';

export default function TopNavigation() {
    const [isFocused, setIsFocused] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [showNotifications, setShowNotifications] = useState(false);
    const [showServerStatus, setShowServerStatus] = useState(false);

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

    return (
        <header className="flex justify-between items-center h-16 ml-sidebar-width px-gutter w-[calc(100%-280px)] fixed top-0 bg-surface-container-lowest z-40 border-b border-surface-container">
            <div className="flex items-center gap-6">
                <div className="flex items-center gap-2 bg-green-50 text-green-700 px-3 py-1 rounded-full border border-green-200 animate-pulse cursor-pointer hover:bg-green-100 transition-colors">
                    <span className="w-2 h-2 rounded-full bg-green-500"></span>
                    <span className="font-label-md text-label-md font-bold">All Systems Operational</span>
                </div>
                
                {/* Search Bar with Dropdown */}
                <div className="relative group" ref={searchRef}>
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[20px]">search</span>
                    <input 
                        className={`bg-surface-container-low border-none rounded-full pl-10 pr-4 py-2 text-body-md font-body-md transition-all outline-none focus:ring-2 focus:ring-secondary-container ${isFocused || searchQuery ? 'w-80' : 'w-64'}`}
                        placeholder="Global system search..." 
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onFocus={() => setIsFocused(true)}
                    />
                    
                    {/* Search Results Dropdown */}
                    {(isFocused || searchQuery) && (
                        <div className="absolute top-full left-0 mt-2 w-full bg-surface-container-lowest border border-surface-container rounded-xl shadow-xl overflow-hidden z-50">
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
            
            <div className="flex items-center gap-4">
                {/* Notifications Dropdown */}
                <div className="relative" ref={notifRef}>
                    <button 
                        onClick={() => setShowNotifications(!showNotifications)}
                        className={`p-2 rounded-full transition-colors relative ${showNotifications ? 'bg-secondary-container/20 text-secondary' : 'text-on-surface-variant hover:bg-surface-container-low'}`}
                    >
                        <span className="material-symbols-outlined">notifications</span>
                        <span className="absolute top-2 right-2 w-2 h-2 bg-error rounded-full ring-2 ring-surface-container-lowest"></span>
                    </button>
                    
                    {showNotifications && (
                        <div className="absolute top-full right-0 mt-2 w-80 bg-surface-container-lowest border border-surface-container rounded-xl shadow-xl overflow-hidden z-50">
                            <div className="flex justify-between items-center p-4 border-b border-surface-container">
                                <h3 className="font-headline-md text-headline-md text-on-surface">Notifications</h3>
                                <span className="text-[11px] font-bold text-secondary cursor-pointer hover:underline">Mark all read</span>
                            </div>
                            <div className="max-h-96 overflow-y-auto custom-scrollbar divide-y divide-surface-container">
                                <div className="p-4 hover:bg-surface-container-low cursor-pointer transition-colors bg-blue-50/30">
                                    <p className="font-body-md font-semibold text-on-surface mb-1">New Clinic Registered</p>
                                    <p className="text-[12px] text-on-surface-variant leading-relaxed">Kathmandu Central Hospital has just completed onboarding.</p>
                                    <p className="text-[10px] text-on-surface-variant mt-2 font-mono-data">Just now</p>
                                </div>
                                <div className="p-4 hover:bg-surface-container-low cursor-pointer transition-colors">
                                    <p className="font-body-md font-semibold text-on-surface mb-1">System Backup Complete</p>
                                    <p className="text-[12px] text-on-surface-variant leading-relaxed">Automated database snapshot created successfully across 3 regions.</p>
                                    <p className="text-[10px] text-on-surface-variant mt-2 font-mono-data">2 hours ago</p>
                                </div>
                            </div>
                            <div className="p-3 border-t border-surface-container text-center bg-surface-container-low/30 hover:bg-surface-container-low cursor-pointer transition-colors">
                                <span className="text-[12px] font-bold text-on-surface-variant">View all notifications</span>
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
                        <div className="absolute top-full right-0 mt-2 w-72 bg-surface-container-lowest border border-surface-container rounded-xl shadow-xl overflow-hidden z-50 p-5">
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
                
                <div className="h-8 w-px bg-surface-container mx-2"></div>
                
                <div className="flex items-center gap-3">
                    <div className="text-right">
                        <p className="font-label-md text-label-md font-bold text-primary">System Admin</p>
                        <p className="text-[10px] text-on-surface-variant uppercase tracking-tighter">Root Authority</p>
                    </div>
                    <img 
                        className="w-10 h-10 rounded-full border-2 border-secondary-container object-cover" 
                        alt="A professional close-up headshot of a system administrator" 
                        src="https://lh3.googleusercontent.com/aida-public/AB6AXuCR4NuQrP0OVv9E3TBWowU5DxCY4R2lKuXIhFR-5v5Yi6NW-7ZnVCm28eJO1p40UJ6rlCO2TCFdKRiEsCQqawH1owtj2QDR_Q3LdP61QHuPHwIwunqA_g3-J8ezolvnS0JfeOShazN5GMhrqtX8ZGfZEjshnsYCaBvDm7PfTuXfJqLmdbA5tEbx0Htji-63a-KiBaP8hB0OFiuJ4xka9SG5gyAVi0mRdV2NyIIL7gCXr99R9R6E08Xe"
                    />
                </div>
            </div>
        </header>
    );
}
