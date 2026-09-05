import React from 'react';

export default function SystemMetricsCards({ data }: { data?: any }) {
    const cpu = data?.cpuUtilization ? data.cpuUtilization.toFixed(1) : 0;
    const jvm = data?.jvmHeap ? data.jvmHeap.toFixed(1) : 0;
    const storage = data?.dbStorageGB ? data.dbStorageGB.toFixed(2) : 0;
    const latency = data?.averageApiLatency ? data.averageApiLatency.toFixed(0) : 0;

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
            {/* CPU */}
            <div className="bg-surface-container-lowest p-6 rounded-xl flex flex-col justify-between border border-surface-container shadow-sm hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start">
                    <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center text-blue-600">
                        <span className="material-symbols-outlined text-2xl">memory</span>
                    </div>
                    <div className="flex items-center space-x-1 font-mono-data text-label-md text-green-600 font-bold">
                        <span className="material-symbols-outlined text-[14px]">trending_down</span>
                        <span>-2.4%</span>
                    </div>
                </div>
                <div className="mt-4">
                    <h3 className="text-headline-lg font-headline-lg text-primary transition-all duration-500">{cpu}%</h3>
                    <p className="text-label-md font-label-md text-on-surface-variant uppercase tracking-wider">CPU UTILIZATION</p>
                    <p className="text-[10px] text-on-surface-variant mt-1">(STABLE)</p>
                </div>
            </div>

            {/* JVM */}
            <div className="bg-surface-container-lowest p-6 rounded-xl flex flex-col justify-between border border-surface-container shadow-sm hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start">
                    <div className="w-12 h-12 bg-purple-50 rounded-lg flex items-center justify-center text-purple-600">
                        <span className="material-symbols-outlined text-2xl">route</span>
                    </div>
                    <div className="flex items-center space-x-1 font-mono-data text-label-md text-orange-500 font-bold">
                        <span className="material-symbols-outlined text-[14px]">trending_up</span>
                        <span>+0.5%</span>
                    </div>
                </div>
                <div className="mt-4">
                    <h3 className="text-headline-lg font-headline-lg text-primary transition-all duration-500">{jvm}%</h3>
                    <p className="text-label-md font-label-md text-on-surface-variant uppercase tracking-wider">JVM HEAP MEMORY</p>
                    <p className="text-[10px] text-on-surface-variant mt-1">(OPTIMIZED)</p>
                </div>
            </div>

            {/* PostgreSQL */}
            <div className="bg-surface-container-lowest p-6 rounded-xl flex flex-col justify-between border border-surface-container shadow-sm hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start">
                    <div className="w-12 h-12 bg-orange-50 rounded-lg flex items-center justify-center text-orange-600">
                        <span className="material-symbols-outlined text-2xl">database</span>
                    </div>
                    <span className="text-on-surface-variant font-mono-data text-label-md">Linear Growth</span>
                </div>
                <div className="mt-4">
                    <h3 className="text-headline-lg font-headline-lg text-primary transition-all duration-500">{storage} GB / 100 GB</h3>
                    <p className="text-label-md font-label-md text-on-surface-variant uppercase tracking-wider">POSTGRESQL STORAGE</p>
                </div>
            </div>

            {/* Network Latency */}
            <div className="bg-primary-container text-white p-6 rounded-xl flex flex-col justify-between shadow-xl shadow-primary/20 relative overflow-hidden group">
                <div className="absolute -right-4 -bottom-4 text-surface-container-lowest opacity-5 scale-150 rotate-12 group-hover:scale-110 transition-transform duration-700">
                    <span className="material-symbols-outlined text-[120px]">network_check</span>
                </div>
                <div className="flex justify-between items-start relative z-10">
                    <div className="w-12 h-12 bg-white/10 rounded-lg flex items-center justify-center text-secondary-container">
                        <span className="material-symbols-outlined text-2xl">network_check</span>
                    </div>
                    <div className="flex items-center space-x-1">
                        <span className="w-2 h-2 bg-green-400 rounded-full animate-ping absolute"></span>
                        <span className="w-2 h-2 bg-green-400 rounded-full relative"></span>
                        <span className="text-[10px] font-bold text-green-400 uppercase ml-1">HEALTHY</span>
                    </div>
                </div>
                <div className="mt-4 relative z-10">
                    <h3 className="text-headline-lg font-headline-lg text-white transition-all duration-500">{latency}ms</h3>
                    <p className="text-label-md font-label-md text-white/60 uppercase tracking-wider">AVERAGE API LATENCY</p>
                </div>
            </div>
        </div>
    );
}
