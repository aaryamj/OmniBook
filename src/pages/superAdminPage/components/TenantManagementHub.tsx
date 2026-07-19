import React, { useState, useRef, useEffect } from 'react';

// Mock Data
const initialTenants = [
    {
        id: 'TN-40291',
        name: 'Lalitpur Wellness Center',
        initials: 'LW',
        email: 'admin@lalitpurwell.np',
        plan: 'Enterprise',
        status: 'Active',
        bgColor: 'bg-secondary-fixed text-secondary',
        statusColor: 'bg-green-100 text-green-800',
        statusDot: 'bg-green-500'
    },
    {
        id: 'TN-40292',
        name: 'Kantipath Clinic',
        initials: 'KC',
        email: 'ops@kantipath.org',
        plan: 'Pro',
        status: 'Pending',
        bgColor: 'bg-tertiary-fixed text-on-tertiary-fixed-variant',
        statusColor: 'bg-yellow-100 text-yellow-800',
        statusDot: 'bg-yellow-500'
    },
    {
        id: 'TN-40293',
        name: 'Himalayan Care',
        initials: 'HC',
        email: 'billing@himalayancare.np',
        plan: 'Basic',
        status: 'Suspended',
        bgColor: 'bg-error-container text-error',
        statusColor: 'bg-red-100 text-red-800',
        statusDot: 'bg-red-500'
    },
    {
        id: 'TN-40294',
        name: 'Kathmandu Central',
        initials: 'KCH',
        email: 'admin@kch.np',
        plan: 'Enterprise',
        status: 'Active',
        bgColor: 'bg-blue-100 text-blue-800',
        statusColor: 'bg-green-100 text-green-800',
        statusDot: 'bg-green-500'
    },
    {
        id: 'TN-40295',
        name: 'Pokhara Health',
        initials: 'PH',
        email: 'hello@pokharahealth.com',
        plan: 'Pro',
        status: 'Active',
        bgColor: 'bg-purple-100 text-purple-800',
        statusColor: 'bg-green-100 text-green-800',
        statusDot: 'bg-green-500'
    }
];

export default function TenantManagementHub() {
    const [tenants, setTenants] = useState(initialTenants);
    const [filter, setFilter] = useState('All');
    const [openActionId, setOpenActionId] = useState<string | null>(null);
    const actionMenuRef = useRef<HTMLDivElement>(null);

    // Simulate real-time updates (Pending -> Active)
    useEffect(() => {
        const interval = setInterval(() => {
            setTenants(prev => {
                const newTenants = [...prev];
                const pendingIdx = newTenants.findIndex(t => t.status === 'Pending');
                if (pendingIdx !== -1 && Math.random() > 0.5) { // 50% chance to activate a pending tenant
                    newTenants[pendingIdx] = {
                        ...newTenants[pendingIdx],
                        status: 'Active',
                        statusColor: 'bg-green-100 text-green-800',
                        statusDot: 'bg-green-500'
                    };
                }
                return newTenants;
            });
        }, 8000);
        return () => clearInterval(interval);
    }, []);

    // Filter Logic
    const filteredTenants = tenants.filter(t => {
        if (filter === 'All') return true;
        return t.status === filter;
    });

    // Close action menu on outside click
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (actionMenuRef.current && !actionMenuRef.current.contains(event.target as Node)) {
                setOpenActionId(null);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const toggleActionMenu = (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        setOpenActionId(openActionId === id ? null : id);
    };

    const getFilterClass = (btnFilter: string) => {
        if (filter === btnFilter) {
            return "px-3 py-1 bg-surface-container-lowest shadow-sm rounded text-label-md font-label-md transition-all";
        }
        return "px-3 py-1 text-on-surface-variant text-label-md font-label-md hover:bg-surface-container-lowest transition-all rounded";
    };

    return (
        <section className="bg-surface-container-lowest rounded-xl border border-surface-container shadow-sm overflow-hidden">
            <div className="p-6 border-b border-surface-container flex justify-between items-center bg-surface-bright">
                <h3 className="font-headline-md text-headline-md text-primary flex items-center gap-2">
                    Tenant Management Hub
                    <span className="flex h-2 w-2 relative">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                    </span>
                </h3>
                <div className="flex gap-2">
                    <div className="flex border border-outline-variant rounded p-1 bg-surface-container-low">
                        <button onClick={() => setFilter('All')} className={getFilterClass('All')}>All</button>
                        <button onClick={() => setFilter('Active')} className={getFilterClass('Active')}>Active</button>
                        <button onClick={() => setFilter('Pending')} className={getFilterClass('Pending')}>Pending</button>
                        <button onClick={() => setFilter('Suspended')} className={getFilterClass('Suspended')}>Suspended</button>
                    </div>
                </div>
            </div>
            
            <div className="overflow-x-auto min-h-[300px]">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-surface-container-low font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">
                        <tr>
                            <th className="px-6 py-4 font-semibold">Clinic Name & ID</th>
                            <th className="px-6 py-4 font-semibold">Admin Email</th>
                            <th className="px-6 py-4 font-semibold">Plan</th>
                            <th className="px-6 py-4 font-semibold">Status</th>
                            <th className="px-6 py-4 font-semibold text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-surface-container font-body-md text-body-md relative">
                        {filteredTenants.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="px-6 py-12 text-center text-on-surface-variant">
                                    No tenants found matching "{filter}".
                                </td>
                            </tr>
                        ) : (
                            filteredTenants.map((tenant) => (
                                <tr key={tenant.id} className="hover:bg-surface-bright transition-all duration-200 group">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3 transform group-hover:translate-x-1 transition-transform">
                                            <div className={`w-8 h-8 rounded flex items-center justify-center font-bold font-mono-data ${tenant.bgColor}`}>
                                                {tenant.initials}
                                            </div>
                                            <div>
                                                <p className="font-bold text-primary">{tenant.name}</p>
                                                <p className="text-[11px] font-mono-data text-on-surface-variant">ID: {tenant.id}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-on-surface-variant">{tenant.email}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded text-[11px] font-bold uppercase ${tenant.plan === 'Enterprise' ? 'bg-blue-100 text-blue-800' : tenant.plan === 'Pro' ? 'bg-purple-100 text-purple-800' : 'bg-surface-container text-on-surface'}`}>
                                            {tenant.plan}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium transition-colors ${tenant.statusColor}`}>
                                            <span className={`w-1.5 h-1.5 rounded-full ${tenant.statusDot}`}></span> {tenant.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right relative">
                                        <button 
                                            onClick={(e) => toggleActionMenu(tenant.id, e)}
                                            className="p-1.5 hover:bg-surface-container rounded-lg text-on-surface-variant transition-all active:scale-95"
                                        >
                                            <span className="material-symbols-outlined text-[18px]">more_vert</span>
                                        </button>
                                        
                                        {/* Action Dropdown Menu */}
                                        {openActionId === tenant.id && (
                                            <div 
                                                ref={actionMenuRef}
                                                className="absolute right-6 top-10 w-48 bg-surface-container-lowest border border-surface-container rounded-xl shadow-lg z-50 overflow-hidden text-left"
                                            >
                                                <ul className="py-1">
                                                    <li className="px-4 py-2 hover:bg-surface-container-low cursor-pointer flex items-center gap-2 text-on-surface text-sm transition-colors">
                                                        <span className="material-symbols-outlined text-[16px]">visibility</span> View Details
                                                    </li>
                                                    <li className="px-4 py-2 hover:bg-surface-container-low cursor-pointer flex items-center gap-2 text-on-surface text-sm transition-colors">
                                                        <span className="material-symbols-outlined text-[16px]">edit</span> Edit Plan
                                                    </li>
                                                    <div className="border-t border-surface-container my-1"></div>
                                                    <li className="px-4 py-2 hover:bg-error-container/20 hover:text-error cursor-pointer flex items-center gap-2 text-error text-sm transition-colors">
                                                        <span className="material-symbols-outlined text-[16px]">block</span> Suspend Account
                                                    </li>
                                                </ul>
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
            
            <div className="p-4 border-t border-surface-container bg-surface-container-low flex justify-between items-center">
                <p className="font-label-md text-label-md text-on-surface-variant">Showing {filteredTenants.length} of {tenants.length} Tenants</p>
                <div className="flex gap-2">
                    <button className="p-1 border border-outline-variant rounded hover:bg-surface-container-lowest transition-colors active:scale-95"><span className="material-symbols-outlined text-[18px]">chevron_left</span></button>
                    <button className="p-1 border border-outline-variant rounded hover:bg-surface-container-lowest transition-colors active:scale-95"><span className="material-symbols-outlined text-[18px]">chevron_right</span></button>
                </div>
            </div>
        </section>
    );
}
