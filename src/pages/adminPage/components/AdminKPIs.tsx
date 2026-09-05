import React from 'react';

interface AdminKPIsProps {
    todayVolume: number;
    totalCapacity: number;
    activeInClinic: number;
    waitingPatients: number;
    inConsultPatients: number;
    esewaSettled: number;
    stripeConnect: number;
}

export default function AdminKPIs({
    todayVolume,
    totalCapacity,
    activeInClinic,
    waitingPatients,
    inConsultPatients,
    esewaSettled,
    stripeConnect
}: AdminKPIsProps) {
    const capacityPercent = totalCapacity > 0 ? Math.round((todayVolume / totalCapacity) * 100) : 0;
    const dashoffset = 175.9 - (175.9 * capacityPercent) / 100;

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-gutter">
            {/* KPI 1 */}
            <div className="glass-card p-5 rounded-xl flex items-center justify-between">
                <div>
                    <p className="text-label-md text-on-surface-variant uppercase tracking-wider">Today's Volume</p>
                    <h3 className="text-headline-lg font-extrabold mt-1">{todayVolume}<span className="text-on-surface-variant text-body-lg font-normal">/{totalCapacity}</span></h3>
                    <p className="text-[11px] text-on-surface-variant mt-1">{capacityPercent}% Daily Capacity</p>
                </div>
                <div className="relative w-16 h-16">
                    <svg className="w-full h-full transform -rotate-90">
                        <circle className="text-surface-container-high" cx="32" cy="32" fill="transparent" r="28" stroke="currentColor" strokeWidth="6"></circle>
                        <circle className="text-[#38BDF8]" cx="32" cy="32" fill="transparent" r="28" stroke="currentColor" strokeDasharray="175.9" strokeDashoffset={dashoffset} strokeWidth="6"></circle>
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-label-md font-bold">{capacityPercent}%</span>
                    </div>
                </div>
            </div>

            {/* KPI 2 */}
            <div className="glass-card p-5 rounded-xl">
                <p className="text-label-md text-on-surface-variant uppercase tracking-wider">Active In-Clinic</p>
                <h3 className="text-headline-lg font-extrabold mt-1">{activeInClinic} <span className="text-body-lg font-normal">Patients</span></h3>
                <div className="flex gap-4 mt-2">
                    <div className="flex flex-col">
                        <span className="text-on-surface-variant text-[11px]">Waiting</span>
                        <span className="text-headline-md font-bold text-error">{waitingPatients}</span>
                    </div>
                    <div className="flex flex-col">
                        <span className="text-on-surface-variant text-[11px]">In-Consult</span>
                        <span className="text-headline-md font-bold text-secondary">{inConsultPatients}</span>
                    </div>
                </div>
            </div>

            {/* KPI 3 */}
            <div className="glass-card p-5 rounded-xl border-l-4 border-[#10b981]">
                <div className="flex justify-between items-start">
                    <div>
                        <p className="text-label-md text-on-surface-variant uppercase tracking-wider">eSewa Settled (Live)</p>
                        <h3 className="text-headline-lg font-extrabold mt-1 text-primary">Rs. {esewaSettled.toLocaleString()}</h3>
                    </div>
                    <div className="w-8 h-8 rounded bg-[#10b981]/10 flex items-center justify-center text-[#10b981]">
                        <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>bolt</span>
                    </div>
                </div>
                <div className="flex items-center gap-2 mt-4">
                    <span className="flex h-2 w-2 rounded-full bg-[#10b981] animate-pulse"></span>
                    <p className="text-[11px] font-mono-data text-[#10b981]">Direct to Bank</p>
                </div>
            </div>

            {/* KPI 4 */}
            <div className="glass-card p-5 rounded-xl border-l-4 border-[#6366f1]">
                <div className="flex justify-between items-start">
                    <div>
                        <p className="text-label-md text-on-surface-variant uppercase tracking-wider">Stripe Connect (Escrow)</p>
                        <h3 className="text-headline-lg font-extrabold mt-1 text-primary">Rs. {stripeConnect.toLocaleString()}</h3>
                    </div>
                    <div className="w-8 h-8 rounded bg-[#6366f1]/10 flex items-center justify-center text-[#6366f1]">
                        <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>shield_lock</span>
                    </div>
                </div>
                <p className="text-[11px] text-on-surface-variant mt-4 font-mono-data">Next Payout: Tomorrow</p>
            </div>
        </div>
    );
}
