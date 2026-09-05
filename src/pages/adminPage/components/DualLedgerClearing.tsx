import React from 'react';

interface DualLedgerClearingProps {
    esewaWeeklyVolume: number;
    stripeWeeklyVolume: number;
}

export default function DualLedgerClearing({ esewaWeeklyVolume = 0, stripeWeeklyVolume = 0 }: DualLedgerClearingProps) {
    const totalGoal = 100000; // Rs. 100k target for progress bar scaling logic (arbitrary example)
    const esewaPercent = Math.min(Math.round((esewaWeeklyVolume / totalGoal) * 100), 100);
    const stripePercent = Math.min(Math.round(((stripeWeeklyVolume * 133) / totalGoal) * 100), 100); // 133 exchange rate roughly

    return (
        <div className="glass-card rounded-xl p-6 overflow-hidden relative">
            <div className="flex items-center justify-between mb-4">
                <h2 className="font-headline-md text-headline-md">Dual Ledger Clearing</h2>
                <button className="material-symbols-outlined text-[20px] text-on-surface-variant">sync</button>
            </div>
            <div className="space-y-6">
                <div className="space-y-2">
                    <div className="flex justify-between text-label-md">
                        <span className="text-[#10b981] font-bold">eSewa Volume</span>
                        <span className="font-mono-data">Rs. {esewaWeeklyVolume.toLocaleString()} / Week</span>
                    </div>
                    <div className="w-full h-4 bg-surface-container-highest rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-[#10b981] to-[#34d399] cinematic-glow" style={{ width: `${Math.max(esewaPercent, 5)}%` }}></div>
                    </div>
                </div>
                <div className="space-y-2">
                    <div className="flex justify-between text-label-md">
                        <span className="text-[#6366f1] font-bold">Stripe Connect</span>
                        <span className="font-mono-data">Rs. {stripeWeeklyVolume.toLocaleString()} / Week</span>
                    </div>
                    <div className="w-full h-4 bg-surface-container-highest rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-[#6366f1] to-[#818cf8] cinematic-glow" style={{ width: `${Math.max(stripePercent, 5)}%` }}></div>
                    </div>
                </div>
            </div>
            <div className="mt-8 relative z-10">
                <button className="w-full py-3 bg-primary text-on-primary rounded font-bold hover:bg-[#1E293B] transition-all flex items-center justify-center gap-2">
                    <span className="material-symbols-outlined text-[18px]">account_balance</span>
                    Reconcile Ledgers
                </button>
            </div>
            {/* Ethereal Cinematic Effect */}
            <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-secondary-container opacity-5 blur-[80px] pointer-events-none"></div>
        </div>
    );
}
