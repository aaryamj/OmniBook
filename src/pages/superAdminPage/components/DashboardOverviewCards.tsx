export default function DashboardOverviewCards() {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* KPI 1 */}
            <div className="bg-surface-container-lowest p-6 rounded-xl border border-surface-container transition-transform hover:scale-[1.02] duration-200">
                <div className="flex justify-between items-start mb-4">
                    <span className="material-symbols-outlined p-2 bg-blue-50 text-blue-600 rounded-lg">payments</span>
                    <span className="text-[11px] font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded">+12% this month</span>
                </div>
                <h3 className="font-label-md text-label-md text-on-surface-variant mb-1 uppercase tracking-wider">Monthly Recurring Revenue (MRR)</h3>
                <p className="font-headline-lg text-headline-lg text-on-surface tracking-tighter">रू 2,45,000</p>
            </div>
            
            {/* KPI 2 */}
            <div className="bg-surface-container-lowest p-6 rounded-xl border border-surface-container transition-transform hover:scale-[1.02] duration-200">
                <div className="flex justify-between items-start mb-4">
                    <span className="material-symbols-outlined p-2 bg-purple-50 text-purple-600 rounded-lg">local_hospital</span>
                    <span className="text-[11px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">+3 new this week</span>
                </div>
                <h3 className="font-label-md text-label-md text-on-surface-variant mb-1 uppercase tracking-wider">Active Clinic Subscriptions</h3>
                <p className="font-headline-lg text-headline-lg text-on-surface tracking-tighter">42</p>
            </div>
            
            {/* KPI 3 */}
            <div className="bg-surface-container-lowest p-6 rounded-xl border border-surface-container transition-transform hover:scale-[1.02] duration-200">
                <div className="flex justify-between items-start mb-4">
                    <span className="material-symbols-outlined p-2 bg-orange-50 text-orange-600 rounded-lg">groups</span>
                </div>
                <h3 className="font-label-md text-label-md text-on-surface-variant mb-1 uppercase tracking-wider">Total Patient Footfall</h3>
                <p className="font-headline-lg text-headline-lg text-on-surface tracking-tighter">18,450</p>
            </div>
            
            {/* KPI 4 */}
            <div className="bg-primary-container p-6 rounded-xl border border-on-primary-fixed-variant shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
                <div className="absolute -right-4 -bottom-4 text-surface-container-lowest opacity-5 scale-150 rotate-12 group-hover:scale-110 transition-transform duration-700">
                    <span className="material-symbols-outlined text-[120px]">monitor_heart</span>
                </div>
                <div className="flex justify-between items-start mb-4 relative z-10">
                    <div className="p-2 bg-secondary-container rounded-lg">
                        <span className="material-symbols-outlined text-primary-container" style={{ fontVariationSettings: "'FILL' 1" }}>monitor_heart</span>
                    </div>
                    <span className="flex h-2 w-2 rounded-full bg-secondary-container animate-ping"></span>
                </div>
                <p className="font-label-md text-label-md text-on-primary-container uppercase tracking-widest mb-1 relative z-10">System Uptime</p>
                <h3 className="font-headline-lg text-headline-lg text-surface-container-lowest font-mono-data relative z-10">99.99%</h3>
            </div>
        </div>
    );
}
