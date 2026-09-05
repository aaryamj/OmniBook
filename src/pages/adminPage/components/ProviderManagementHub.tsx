import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import ProviderScheduleModal from './ProviderScheduleModal';

interface Provider {
    id: number;
    name: string;
    email: string;
    role: string;
    primarySpecialty: string;
    tier: string;
    status: string;
    medicalLicense: string;
    profilePictureUrl: string;
    licenseImageUrl?: string;
    credentials?: string;
}

export default function ProviderManagementHub() {
    const [providers, setProviders] = useState<Provider[]>([]);
    const [filter, setFilter] = useState('All');
    const [openActionId, setOpenActionId] = useState<number | null>(null);
    const [selectedProvider, setSelectedProvider] = useState<Provider | null>(null);
    const [suspendProviderId, setSuspendProviderId] = useState<number | null>(null);
    const [suspendConfirmText, setSuspendConfirmText] = useState('');
    const [isSuspending, setIsSuspending] = useState(false);
    
    const [reactivateProviderId, setReactivateProviderId] = useState<number | null>(null);
    const [reactivateConfirmText, setReactivateConfirmText] = useState('');
    const [isReactivating, setIsReactivating] = useState(false);

    const [scheduleProviderId, setScheduleProviderId] = useState<number | null>(null);
    const [scheduleProviderName, setScheduleProviderName] = useState<string>('');
    
    const actionMenuRef = useRef<HTMLDivElement>(null);
    const navigate = useNavigate();

    const fetchProviders = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get('http://localhost:8080/api/v1/admin/providers', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            setProviders(res.data);
        } catch (error: any) {
            console.error("Failed to fetch providers", error);
            if (error.response?.status === 401 || error.response?.status === 403) {
                navigate('/login');
            }
        }
    };

    useEffect(() => {
        fetchProviders();
    }, []);

    const handleApprove = async (providerId: number) => {
        try {
            const token = localStorage.getItem('token');
            await axios.put(`http://localhost:8080/api/v1/admin/providers/${providerId}/approve`, {}, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            fetchProviders(); // refresh the list
            setOpenActionId(null);
        } catch (error: any) {
            console.error("Failed to approve provider", error);
            const errMsg = error.response?.data?.message || error.message;
            alert("Failed to approve provider: " + errMsg);
        }
    };

    const handleReject = async (providerId: number) => {
        try {
            const token = localStorage.getItem('token');
            await axios.put(`http://localhost:8080/api/v1/admin/providers/${providerId}/reject`, {}, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            fetchProviders(); // refresh the list
            setOpenActionId(null);
        } catch (error: any) {
            console.error("Failed to reject provider", error);
            const errMsg = error.response?.data?.message || error.message;
            alert("Failed to reject provider: " + errMsg);
        }
    };

    const handleSuspend = async () => {
        if (!suspendProviderId) return;
        setIsSuspending(true);

        try {
            const token = localStorage.getItem('token');
            await axios.put(`http://localhost:8080/api/v1/admin/providers/${suspendProviderId}/suspend`, {}, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            fetchProviders(); // refresh the list
            setSuspendProviderId(null);
            setSuspendConfirmText('');
            setOpenActionId(null);
        } catch (error: any) {
            console.error("Failed to suspend provider", error);
            const errMsg = error.response?.data?.message || error.message;
            alert("Failed to suspend provider: " + errMsg);
        } finally {
            setIsSuspending(false);
        }
    };

    const handleReactivate = async () => {
        if (!reactivateProviderId) return;
        setIsReactivating(true);

        try {
            const token = localStorage.getItem('token');
            await axios.put(`http://localhost:8080/api/v1/admin/providers/${reactivateProviderId}/reactivate`, {}, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            fetchProviders(); // refresh the list
            setReactivateProviderId(null);
            setReactivateConfirmText('');
            setOpenActionId(null);
        } catch (error: any) {
            console.error("Failed to reactivate provider", error);
            const errMsg = error.response?.data?.message || error.message;
            alert("Failed to reactivate provider: " + errMsg);
        } finally {
            setIsReactivating(false);
        }
    };

    // Filter Logic
    const filteredProviders = providers.filter(p => {
        if (filter === 'All') return true;
        if (filter === 'Active') return p.status === 'ACTIVE';
        if (filter === 'Pending Approval') return p.status === 'PENDING_APPROVAL';
        if (filter === 'Setup In Progress') return p.status === 'SETUP_IN_PROGRESS' || p.status === 'PENDING_INVITE';
        return true;
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

    const toggleActionMenu = (id: number, e: React.MouseEvent) => {
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
        <div className="bg-surface-container-low rounded-2xl border border-surface-container overflow-hidden mb-12 shadow-sm">
            {/* Header Section */}
            <div className="p-6 border-b border-surface-container bg-surface-container-lowest">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h2 className="text-xl font-bold text-primary flex items-center gap-2">
                            <span className="material-symbols-outlined text-secondary">manage_accounts</span>
                            Provider Management Hub
                        </h2>
                        <p className="text-sm text-on-surface-variant mt-1">Review, approve, and manage clinic providers.</p>
                    </div>
                    
                    {/* Filters */}
                    <div className="bg-surface-container p-1 rounded-md flex gap-1">
                        <button onClick={() => setFilter('All')} className={getFilterClass('All')}>All</button>
                        <button onClick={() => setFilter('Pending Approval')} className={getFilterClass('Pending Approval')}>
                            Pending <span className="ml-1 px-1.5 py-0.5 bg-yellow-200 text-yellow-800 rounded-full text-[10px]">{providers.filter(p => p.status === 'PENDING_APPROVAL').length}</span>
                        </button>
                        <button onClick={() => setFilter('Active')} className={getFilterClass('Active')}>Active</button>
                        <button onClick={() => setFilter('Setup In Progress')} className={getFilterClass('Setup In Progress')}>Setup In Progress</button>
                    </div>
                </div>
            </div>
            
            <div className="overflow-x-auto min-h-[300px]">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-surface-container-low font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">
                        <tr>
                            <th className="px-6 py-4 font-semibold">Provider Name</th>
                            <th className="px-6 py-4 font-semibold">Email</th>
                            <th className="px-6 py-4 font-semibold">Speciality & License</th>
                            <th className="px-6 py-4 font-semibold">Tier</th>
                            <th className="px-6 py-4 font-semibold">Status</th>
                            <th className="px-6 py-4 font-semibold text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-surface-container font-body-md text-body-md relative">
                        {filteredProviders.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="px-6 py-12 text-center text-on-surface-variant">
                                    No providers found matching "{filter}".
                                </td>
                            </tr>
                        ) : (
                            filteredProviders.map((provider) => {
                                const isPending = provider.status === 'PENDING_APPROVAL';
                                const isActive = provider.status === 'ACTIVE';
                                const isSetup = provider.status === 'SETUP_IN_PROGRESS' || provider.status === 'PENDING_INVITE';
                                const isRejected = provider.status === 'REJECTED';
                                const isSuspended = provider.status === 'SUSPENDED';
                                
                                let statusColor = 'bg-gray-100 text-gray-800';
                                let statusDot = 'bg-gray-500';
                                let displayStatus = 'Unknown';

                                if (isActive) {
                                    statusColor = 'bg-green-100 text-green-800';
                                    statusDot = 'bg-green-500';
                                    displayStatus = 'Active';
                                } else if (isPending) {
                                    statusColor = 'bg-yellow-100 text-yellow-800';
                                    statusDot = 'bg-yellow-500';
                                    displayStatus = 'Pending Approval';
                                } else if (isSetup) {
                                    statusColor = 'bg-blue-100 text-blue-800';
                                    statusDot = 'bg-blue-500';
                                    displayStatus = 'Setup In Progress';
                                } else if (isRejected) {
                                    statusColor = 'bg-red-100 text-red-800';
                                    statusDot = 'bg-red-500';
                                    displayStatus = 'Rejected';
                                } else if (isSuspended) {
                                    statusColor = 'bg-red-100 text-red-800';
                                    statusDot = 'bg-red-500';
                                    displayStatus = 'Suspended';
                                }

                                const initials = provider.name ? provider.name.substring(0, 2).toUpperCase() : 'PR';
                                
                                return (
                                <tr key={provider.id} className="hover:bg-surface-bright transition-all duration-200 group">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3 transform group-hover:translate-x-1 transition-transform">
                                            {provider.profilePictureUrl ? (
                                                <img src={provider.profilePictureUrl} alt={provider.name} className="w-8 h-8 rounded-full object-cover border border-surface-container bg-surface-container-lowest" />
                                            ) : (
                                                <div className="w-8 h-8 rounded-full flex items-center justify-center font-bold font-mono-data bg-secondary-fixed text-secondary">
                                                    {initials}
                                                </div>
                                            )}
                                            <div>
                                                <p className="font-bold text-primary">{provider.name}</p>
                                                <p className="text-[11px] font-mono-data text-on-surface-variant">ID: {provider.id}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-on-surface-variant">{provider.email}</td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col">
                                            <span className="font-semibold text-sm">{provider.primarySpecialty || 'N/A'}</span>
                                            <span className="text-[11px] text-on-surface-variant">Lic: {provider.medicalLicense || 'N/A'}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="px-2 py-1 bg-surface-container-highest text-on-surface text-[11px] font-bold uppercase rounded">
                                            {provider.tier || 'TIER 1'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium transition-colors ${statusColor}`}>
                                            <span className={`w-1.5 h-1.5 rounded-full ${statusDot}`}></span> {displayStatus}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right relative">
                                        <button 
                                            onClick={(e) => toggleActionMenu(provider.id, e)}
                                            className="p-2 hover:bg-surface-container rounded-full transition-colors text-on-surface-variant hover:text-primary"
                                        >
                                            <span className="material-symbols-outlined text-[20px]">more_vert</span>
                                        </button>

                                        {/* Action Dropdown Menu */}
                                        {openActionId === provider.id && (
                                            <div 
                                                ref={actionMenuRef}
                                                className="absolute right-14 top-4 w-48 bg-surface-container-lowest border border-outline-variant rounded-xl shadow-lg shadow-primary/5 z-50 overflow-hidden"
                                            >
                                                <div className="py-1">
                                                    {isPending && (
                                                        <>
                                                            <button 
                                                                onClick={() => handleApprove(provider.id)}
                                                                className="w-full text-left px-4 py-2 text-sm text-green-700 hover:bg-green-50 flex items-center gap-2"
                                                            >
                                                                <span className="material-symbols-outlined text-[18px]">check_circle</span>
                                                                Approve Provider
                                                            </button>
                                                            <button 
                                                                onClick={() => handleReject(provider.id)}
                                                                className="w-full text-left px-4 py-2 text-sm text-red-700 hover:bg-red-50 flex items-center gap-2"
                                                            >
                                                                <span className="material-symbols-outlined text-[18px]">cancel</span>
                                                                Reject Provider
                                                            </button>
                                                            <div className="h-px bg-outline-variant my-1"></div>
                                                        </>
                                                    )}
                                                    
                                                    <button 
                                                        onClick={() => {
                                                            setSelectedProvider(provider);
                                                            setOpenActionId(null);
                                                        }}
                                                        className="w-full text-left px-4 py-2 text-sm text-on-surface-variant hover:bg-surface-container flex items-center gap-2"
                                                    >
                                                        <span className="material-symbols-outlined text-[18px]">visibility</span>
                                                        View Details
                                                    </button>
                                                    <button 
                                                        className="w-full text-left px-4 py-2 text-sm text-on-surface hover:bg-surface-container-low transition-colors flex items-center gap-2"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setScheduleProviderId(provider.id);
                                                            setScheduleProviderName(provider.name);
                                                            setOpenActionId(null);
                                                        }}
                                                    >
                                                        <span className="material-symbols-outlined text-[18px]">calendar_clock</span>
                                                        Manage Schedule
                                                    </button>
                                                    <button 
                                                        onClick={() => window.location.href = `mailto:${provider.email}`}
                                                        className="w-full text-left px-4 py-2 text-sm text-on-surface-variant hover:bg-surface-container flex items-center gap-2"
                                                    >
                                                        <span className="material-symbols-outlined text-[18px]">mail</span>
                                                        Contact Provider
                                                    </button>
                                                    
                                                    {isActive && (
                                                        <>
                                                            <div className="h-px bg-outline-variant my-1"></div>
                                                            <button 
                                                                onClick={() => {
                                                                    setSuspendProviderId(provider.id);
                                                                    setOpenActionId(null);
                                                                }}
                                                                className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                                                            >
                                                                <span className="material-symbols-outlined text-[18px]">block</span>
                                                                Suspend Access
                                                            </button>
                                                        </>
                                                    )}
                                                    
                                                    {isSuspended && (
                                                        <>
                                                            <div className="h-px bg-outline-variant my-1"></div>
                                                            <button 
                                                                onClick={() => {
                                                                    setReactivateProviderId(provider.id);
                                                                    setOpenActionId(null);
                                                                }}
                                                                className="w-full text-left px-4 py-2 text-sm text-green-600 hover:bg-green-50 flex items-center gap-2"
                                                            >
                                                                <span className="material-symbols-outlined text-[18px]">lock_open</span>
                                                                Reactivate Access
                                                            </button>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    </td>
                                </tr>
                                )
                            })
                        )}
                    </tbody>
                </table>
            </div>

            {/* View Details Modal */}
            {selectedProvider && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-surface rounded-2xl shadow-xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200">
                        {/* Modal Header */}
                        <div className="p-6 border-b border-surface-container flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                {selectedProvider.profilePictureUrl ? (
                                    <img src={selectedProvider.profilePictureUrl} alt="Provider" className="w-16 h-16 rounded-full object-cover border border-surface-container bg-surface-container-lowest" />
                                ) : (
                                    <div className="w-16 h-16 rounded-full flex items-center justify-center font-bold text-2xl font-mono-data bg-secondary-fixed text-secondary">
                                        {selectedProvider.name ? selectedProvider.name.substring(0, 2).toUpperCase() : 'PR'}
                                    </div>
                                )}
                                <div>
                                    <h2 className="text-2xl font-bold text-on-surface">{selectedProvider.name}</h2>
                                    <p className="text-sm text-on-surface-variant font-mono">ID: {selectedProvider.id} | Specialization: {selectedProvider.primarySpecialty}</p>
                                </div>
                            </div>
                            <button onClick={() => setSelectedProvider(null)} className="p-2 hover:bg-surface-container rounded-full text-on-surface-variant transition-colors">
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>
                        
                        {/* Modal Body */}
                        <div className="p-6 overflow-y-auto flex-1 space-y-8 bg-surface-container-lowest">
                            {/* General Info */}
                            <div>
                                <h3 className="text-sm font-bold text-primary uppercase tracking-wider mb-4 flex items-center gap-2">
                                    <span className="material-symbols-outlined">person</span> General Information
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <p className="text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1">Email Address</p>
                                        <p className="text-sm text-on-surface">{selectedProvider.email}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1">Credentials</p>
                                        <p className="text-sm text-on-surface">{selectedProvider.credentials || <span className="italic opacity-50">Not provided</span>}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1">Tier</p>
                                        <p className="text-sm text-on-surface">{selectedProvider.tier}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1">Status</p>
                                        <p className="text-sm text-on-surface">{selectedProvider.status}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="h-px bg-surface-container w-full"></div>
                            
                            {/* Legal/License */}
                            <div>
                                <h3 className="text-sm font-bold text-primary uppercase tracking-wider mb-4 flex items-center gap-2">
                                    <span className="material-symbols-outlined">badge</span> Licensing & Credentials
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="md:col-span-2">
                                        <p className="text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1">Medical License Number</p>
                                        <p className="text-sm font-mono bg-surface-container-low p-2 rounded border border-outline-variant inline-block">{selectedProvider.medicalLicense || <span className="italic opacity-50 font-sans">Not provided</span>}</p>
                                    </div>
                                    <div className="md:col-span-2">
                                        <p className="text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2">Medical License Document</p>
                                        {selectedProvider.licenseImageUrl ? (
                                            <div className="border border-outline-variant rounded-xl overflow-hidden bg-surface-container-low p-2">
                                                <img src={selectedProvider.licenseImageUrl} alt="Medical License" className="max-w-full h-auto max-h-[400px] object-contain mx-auto rounded-lg shadow-sm" />
                                                <div className="mt-2 text-center">
                                                    <a href={selectedProvider.licenseImageUrl} target="_blank" rel="noreferrer" className="text-primary hover:underline text-sm font-bold flex items-center justify-center gap-1">
                                                        <span className="material-symbols-outlined text-[16px]">open_in_new</span> View Full Size
                                                    </a>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="bg-surface-container p-6 rounded-xl border border-dashed border-outline-variant text-center">
                                                <span className="material-symbols-outlined text-4xl text-on-surface-variant opacity-50 mb-2">description</span>
                                                <p className="text-sm text-on-surface-variant">No medical license uploaded.</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        {/* Modal Footer */}
                        <div className="p-4 border-t border-surface-container bg-surface flex justify-end gap-3">
                            {selectedProvider.status === 'PENDING_APPROVAL' && (
                                <button onClick={() => { handleApprove(selectedProvider.id); setSelectedProvider(null); }} className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg transition-colors flex items-center gap-2 shadow-sm">
                                    <span className="material-symbols-outlined text-[18px]">verified</span> Approve Provider
                                </button>
                            )}
                            <button onClick={() => setSelectedProvider(null)} className="px-4 py-2 bg-surface-container hover:bg-surface-container-high text-on-surface font-bold rounded-lg transition-colors">
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Suspend Access Danger Zone Modal */}
            {suspendProviderId && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-surface p-8 rounded-3xl shadow-2xl max-w-md w-full border-2 border-error text-center flex flex-col animate-in fade-in zoom-in-95 duration-200">
                        <div className="w-16 h-16 bg-error/10 text-error rounded-full flex items-center justify-center mx-auto mb-4 border border-error/20 shadow-[0_0_15px_rgba(220,38,38,0.3)]">
                            <span className="material-symbols-outlined text-[32px]">warning</span>
                        </div>
                        <h3 className="font-headline-md text-headline-md font-black text-error mb-2">Danger Zone: Suspend Access</h3>
                        <p className="text-on-surface-variant text-sm mb-6">
                            This will instantly suspend the provider's access. They will no longer be able to log into OmniBook.
                            <br/><br/>
                            To proceed, please type <strong className="text-on-surface select-none font-bold">{providers.find(p => p.id === suspendProviderId)?.name}</strong> below:
                        </p>
                        
                        <input 
                            type="text"
                            value={suspendConfirmText}
                            onChange={(e) => setSuspendConfirmText(e.target.value)}
                            placeholder="Type the doctor's name to confirm"
                            className="w-full bg-surface-container border border-error/30 p-3 rounded-xl focus:ring-2 focus:ring-error focus:border-error outline-none font-bold text-center mb-6 text-on-surface"
                        />
                        
                        <div className="flex justify-center gap-3">
                            <button 
                                onClick={() => {
                                    setSuspendProviderId(null);
                                    setSuspendConfirmText('');
                                }} 
                                className="px-6 py-2.5 rounded-full border border-outline font-label-md font-bold hover:bg-surface-variant flex-1 text-on-surface transition-colors"
                            >
                                Cancel
                            </button>
                            <button 
                                onClick={handleSuspend} 
                                disabled={suspendConfirmText !== providers.find(p => p.id === suspendProviderId)?.name || isSuspending}
                                className="px-6 py-2.5 rounded-full bg-error text-white font-label-md font-bold hover:bg-red-700 shadow-lg shadow-error/20 flex-1 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex justify-center items-center gap-2"
                            >
                                {isSuspending ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                        Suspending...
                                    </>
                                ) : (
                                    'Confirm Suspension'
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Reactivate Access Safe Zone Modal */}
            {reactivateProviderId && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-surface p-8 rounded-3xl shadow-2xl max-w-md w-full border-2 border-green-600 text-center flex flex-col animate-in fade-in zoom-in-95 duration-200">
                        <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4 border border-green-200 shadow-[0_0_15px_rgba(22,163,74,0.3)]">
                            <span className="material-symbols-outlined text-[32px]">lock_open</span>
                        </div>
                        <h3 className="font-headline-md text-headline-md font-black text-green-600 mb-2">Safe Zone: Reactivate Access</h3>
                        <p className="text-on-surface-variant text-sm mb-6">
                            This will instantly restore the provider's access, allowing them to log in and use OmniBook again.
                            <br/><br/>
                            To proceed, please type <strong className="text-on-surface select-none font-bold">{providers.find(p => p.id === reactivateProviderId)?.name}</strong> below:
                        </p>
                        
                        <input 
                            type="text"
                            value={reactivateConfirmText}
                            onChange={(e) => setReactivateConfirmText(e.target.value)}
                            placeholder="Type the doctor's name to confirm"
                            className="w-full bg-surface-container border border-green-600/30 p-3 rounded-xl focus:ring-2 focus:ring-green-600 focus:border-green-600 outline-none font-bold text-center mb-6 text-on-surface"
                        />
                        
                        <div className="flex justify-center gap-3">
                            <button 
                                onClick={() => {
                                    setReactivateProviderId(null);
                                    setReactivateConfirmText('');
                                }} 
                                className="px-6 py-2.5 rounded-full border border-outline font-label-md font-bold hover:bg-surface-variant flex-1 text-on-surface transition-colors"
                            >
                                Cancel
                            </button>
                            <button 
                                onClick={handleReactivate} 
                                disabled={reactivateConfirmText !== providers.find(p => p.id === reactivateProviderId)?.name || isReactivating}
                                className="px-6 py-2.5 rounded-full bg-green-600 text-white font-label-md font-bold hover:bg-green-700 shadow-lg shadow-green-600/20 flex-1 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex justify-center items-center gap-2"
                            >
                                {isReactivating ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                        Reactivating...
                                    </>
                                ) : (
                                    'Confirm Reactivation'
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Provider Schedule Modal */}
            {scheduleProviderId && (
                <ProviderScheduleModal 
                    providerId={scheduleProviderId} 
                    providerName={scheduleProviderName}
                    onClose={() => {
                        setScheduleProviderId(null);
                        setScheduleProviderName('');
                    }} 
                />
            )}
        </div>
    );
}
