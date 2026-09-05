import React from 'react';

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
                <span className="material-symbols-outlined text-primary">stethoscope</span>
                <h2 className="font-headline-md text-headline-md">Provider Matrix</h2>
            </div>
            <div className="space-y-4 h-[250px] overflow-y-auto pr-2 custom-scrollbar">
                {providers.length === 0 ? (
                    <p className="text-center text-on-surface-variant text-body-sm mt-10">No providers found.</p>
                ) : providers.map((provider, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 rounded-lg border border-surface-container-high bg-white/40">
                        <div className="flex items-center gap-3">
                            <div className="relative">
                                <div className="w-10 h-10 rounded-full bg-surface-container-highest overflow-hidden">
                                    {provider.profilePictureUrl ? (
                                        <img 
                                            className="w-full h-full object-cover" 
                                            alt={provider.name}
                                            src={provider.profilePictureUrl}
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center bg-primary text-on-primary font-bold">
                                            {provider.name.charAt(0)}
                                        </div>
                                    )}
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
