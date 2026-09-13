import React from 'react';

interface SuperadminClient {
    id: number;
    fullName: string;
    email: string;
    phone: string;
    role: string;
    enabled: boolean;
    status: string;
    profilePicture?: string;
    dateOfBirth?: string;
    age?: number;
    bloodGroup?: string;
    allergies?: string;
    weight?: string;
    heartRate?: string;
    authProvider?: string;
    googleConnected?: boolean;
    facebookConnected?: boolean;
    createdAt?: string;
    lastLoginAt?: string;
    lastLoginLocation?: string;
    totalAppointments?: number;
    totalSpend?: number;
}

interface ClientDetailModalProps {
    client: SuperadminClient | null;
    onClose: () => void;
    onToggleStatus?: (client: SuperadminClient) => void;
}

export default function ClientDetailModal({ client, onClose, onToggleStatus }: ClientDetailModalProps) {
    if (!client) return null;

    const formatDate = (dateStr?: string) => {
        if (!dateStr) return 'N/A';
        try {
            return new Date(dateStr).toLocaleString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch {
            return dateStr;
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-surface-container-lowest text-on-surface border border-surface-container w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                
                {/* Header Banner */}
                <div className="bg-gradient-to-r from-primary to-on-primary-fixed-variant p-6 text-white relative">
                    <button 
                        onClick={onClose}
                        className="absolute right-4 top-4 text-white/80 hover:text-white p-1 rounded-full hover:bg-white/10 transition-colors"
                        aria-label="Close"
                    >
                        <span className="material-symbols-outlined text-2xl">close</span>
                    </button>
                    
                    <div className="flex items-center gap-4">
                        {client.profilePicture ? (
                            <img 
                                src={client.profilePicture} 
                                alt={client.fullName}
                                className="w-16 h-16 rounded-2xl object-cover border-2 border-white/30 shadow-md bg-white/10"
                            />
                        ) : (
                            <div className="w-16 h-16 rounded-2xl bg-white/20 text-white font-bold text-2xl flex items-center justify-center shadow-md border-2 border-white/30">
                                {client.fullName ? client.fullName.charAt(0).toUpperCase() : 'C'}
                            </div>
                        )}
                        <div>
                            <div className="flex items-center gap-2 flex-wrap">
                                <h2 className="text-xl font-headline-sm font-bold">{client.fullName || 'Unnamed Client'}</h2>
                                <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                                    client.enabled 
                                        ? 'bg-emerald-500/20 text-emerald-200 border border-emerald-400/40' 
                                        : 'bg-rose-500/20 text-rose-200 border border-rose-400/40'
                                }`}>
                                    {client.enabled ? 'Active Account' : 'Suspended'}
                                </span>
                            </div>
                            <p className="text-xs text-white/80 mt-1 flex items-center gap-2">
                                <span className="font-mono">Client ID: #{client.id}</span>
                                <span>•</span>
                                <span>Role: {client.role || 'user'}</span>
                            </p>
                        </div>
                    </div>
                </div>

                {/* Body Content */}
                <div className="p-6 overflow-y-auto space-y-6 text-xs">
                    
                    {/* Key Metrics Quick Ribbon */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        <div className="p-3 bg-surface-container-low rounded-xl border border-outline-variant/50">
                            <span className="text-on-surface-variant font-medium block text-[11px]">Total Bookings</span>
                            <span className="text-lg font-bold text-primary font-mono-data">
                                {client.totalAppointments ?? 0}
                            </span>
                        </div>
                        <div className="p-3 bg-surface-container-low rounded-xl border border-outline-variant/50">
                            <span className="text-on-surface-variant font-medium block text-[11px]">Total Platform Spend</span>
                            <span className="text-lg font-bold text-emerald-600 font-mono-data">
                                Rs. {(client.totalSpend ?? 0).toLocaleString()}
                            </span>
                        </div>
                        <div className="p-3 bg-surface-container-low rounded-xl border border-outline-variant/50 col-span-2 sm:col-span-1">
                            <span className="text-on-surface-variant font-medium block text-[11px]">Auth Provider</span>
                            <span className="text-sm font-bold text-on-surface uppercase tracking-wide">
                                {client.authProvider || 'LOCAL'}
                            </span>
                        </div>
                    </div>

                    {/* Contact & Identity Section */}
                    <div>
                        <h4 className="text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-3 flex items-center gap-1.5 border-b border-surface-container pb-1.5">
                            <span className="material-symbols-outlined text-base text-primary">contact_page</span>
                            Contact &amp; Identity
                        </h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <span className="text-on-surface-variant block mb-0.5">Email Address</span>
                                <span className="font-semibold text-on-surface select-all">{client.email || 'N/A'}</span>
                            </div>
                            <div>
                                <span className="text-on-surface-variant block mb-0.5">Phone Number</span>
                                <span className="font-semibold text-on-surface select-all">{client.phone || 'N/A'}</span>
                            </div>
                        </div>
                    </div>

                    {/* Health & Demographics Profile */}
                    <div>
                        <h4 className="text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-3 flex items-center gap-1.5 border-b border-surface-container pb-1.5">
                            <span className="material-symbols-outlined text-base text-rose-500">health_and_safety</span>
                            Demographics &amp; Health Profile
                        </h4>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                            <div>
                                <span className="text-on-surface-variant block mb-0.5">Date of Birth</span>
                                <span className="font-semibold text-on-surface">{client.dateOfBirth || 'Not provided'}</span>
                            </div>
                            <div>
                                <span className="text-on-surface-variant block mb-0.5">Age</span>
                                <span className="font-semibold text-on-surface">{client.age !== null && client.age !== undefined ? `${client.age} years` : 'N/A'}</span>
                            </div>
                            <div>
                                <span className="text-on-surface-variant block mb-0.5">Blood Group</span>
                                <span className="font-semibold text-on-surface inline-block px-2 py-0.5 rounded bg-rose-50 dark:bg-rose-950/40 text-rose-600 font-mono">
                                    {client.bloodGroup || 'Unknown'}
                                </span>
                            </div>
                            <div>
                                <span className="text-on-surface-variant block mb-0.5">Weight</span>
                                <span className="font-semibold text-on-surface">{client.weight ? `${client.weight} kg` : 'N/A'}</span>
                            </div>
                            <div>
                                <span className="text-on-surface-variant block mb-0.5">Heart Rate</span>
                                <span className="font-semibold text-on-surface">{client.heartRate ? `${client.heartRate} bpm` : 'N/A'}</span>
                            </div>
                            <div>
                                <span className="text-on-surface-variant block mb-0.5">Known Allergies</span>
                                <span className="font-semibold text-on-surface">{client.allergies || 'None recorded'}</span>
                            </div>
                        </div>
                    </div>

                    {/* Security & Access Audit */}
                    <div>
                        <h4 className="text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-3 flex items-center gap-1.5 border-b border-surface-container pb-1.5">
                            <span className="material-symbols-outlined text-base text-amber-500">shield</span>
                            Security &amp; Account Audit
                        </h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <span className="text-on-surface-variant block mb-0.5">Registered On</span>
                                <span className="font-semibold text-on-surface">{formatDate(client.createdAt)}</span>
                            </div>
                            <div>
                                <span className="text-on-surface-variant block mb-0.5">Last Login Time</span>
                                <span className="font-semibold text-on-surface">{formatDate(client.lastLoginAt)}</span>
                            </div>
                            <div>
                                <span className="text-on-surface-variant block mb-0.5">Last Login Location / IP</span>
                                <span className="font-semibold text-on-surface font-mono">{client.lastLoginLocation || 'Nepal (Standard IP)'}</span>
                            </div>
                            <div>
                                <span className="text-on-surface-variant block mb-0.5">Social Authentication</span>
                                <div className="flex items-center gap-2 mt-1">
                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${client.googleConnected ? 'bg-blue-50 text-blue-700' : 'bg-surface-container text-on-surface-variant'}`}>
                                        Google: {client.googleConnected ? 'Linked' : 'No'}
                                    </span>
                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${client.facebookConnected ? 'bg-indigo-50 text-indigo-700' : 'bg-surface-container text-on-surface-variant'}`}>
                                        Facebook: {client.facebookConnected ? 'Linked' : 'No'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>

                {/* Footer Actions */}
                <div className="p-4 bg-surface-container-low border-t border-surface-container flex items-center justify-between gap-3">
                    {onToggleStatus && (
                        <button
                            type="button"
                            onClick={() => {
                                onToggleStatus(client);
                                onClose();
                            }}
                            className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 ${
                                client.enabled 
                                    ? 'bg-red-500/10 text-red-600 hover:bg-red-500/20' 
                                    : 'bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20'
                            }`}
                        >
                            <span className="material-symbols-outlined text-sm">
                                {client.enabled ? 'block' : 'check_circle'}
                            </span>
                            {client.enabled ? 'Suspend Account' : 'Reactivate Account'}
                        </button>
                    )}
                    <button
                        type="button"
                        onClick={onClose}
                        className="ml-auto px-5 py-2 bg-primary text-on-primary rounded-xl text-xs font-bold hover:bg-on-primary-fixed-variant transition-colors"
                    >
                        Close
                    </button>
                </div>

            </div>
        </div>
    );
}
