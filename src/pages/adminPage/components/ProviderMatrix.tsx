import React from 'react';
import { useOrganizationTerms } from '../../../utils/organizationTerms';

interface ProviderStatusDTO {
    name: string;
    role: string;
    status: string;
    profilePictureUrl: string;
}

interface ProviderMatrixProps {
    providers: ProviderStatusDTO[];
}

export default function ProviderMatrix({ providers = [] }: ProviderMatrixProps) {
    const terms = useOrganizationTerms();

    const getStatusStyle = (status: string) => {
        if (status === 'ACTIVE') return "bg-green-500 border-2 border-white rounded-full cinematic-glow";
        if (status === 'ON_BREAK') return "bg-orange-500 border-2 border-white rounded-full";
        return "bg-surface-variant border-2 border-white rounded-full";
    };

    const getStatusTextColor = (status: string) => {
        if (status === 'ACTIVE') return "text-green-600";
        if (status === 'ON_BREAK') return "text-orange-600";
        return "text-on-surface-variant";
    };

    return (
        <div className="glass-card rounded-xl p-6">
            <div className="flex items-center gap-3 mb-6">
                <span className="material-symbols-outlined text-primary">{terms.providersNavIcon}</span>
                <h2 className="font-headline-md text-headline-md">{terms.providerSingular} Matrix</h2>
            </div>
            <div className="space-y-4 h-[250px] overflow-y-auto pr-2 custom-scrollbar">
                {providers.length === 0 ? (
                    <p className="text-center text-on-surface-variant text-body-sm mt-10">No {terms.providerPlural.toLowerCase()} found.</p>
                ) : providers.map((provider, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 rounded-lg border border-surface-container-high bg-white/40">
                        <div className="flex items-center gap-3">
                            <div className="relative">
                                <div className="w-10 h-10 rounded-full bg-surface-container-highest overflow-hidden">
                                    <img 
                                        className="w-full h-full object-cover" 
                                        alt={provider.name}
                                        src={provider.profilePictureUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(provider.name)}&background=e2e8f8&color=1a56db&size=128&rounded=true`}
                                        onError={(e) => {
                                            (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(provider.name)}&background=e2e8f8&color=1a56db&size=128&rounded=true`;
                                        }}
                                    />
                                </div>
                                <span className={`absolute bottom-0 right-0 w-3 h-3 ${getStatusStyle(provider.status)}`}></span>
                            </div>
                            <div>
                                <p className="font-bold text-on-surface leading-none">{provider.name}</p>
                                <p className="text-[11px] text-on-surface-variant">{provider.role}</p>
                            </div>
                        </div>
                        <span className={`text-label-md font-mono-data font-bold ${getStatusTextColor(provider.status)}`}>
                            {provider.status.replace('_', ' ')}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
}
