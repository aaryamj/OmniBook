import React from 'react';

interface WeeklyAppointmentsProps {
    data: number[];
}

export default function WeeklyAppointments({ data = [0, 0, 0, 0, 0, 0, 0] }: WeeklyAppointmentsProps) {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const maxVal = Math.max(...data, 10); // Minimum scale of 10 to avoid dividing by 0 or very small bars

    return (
        <div className="bg-surface p-6 rounded-xl card-shadow border border-surface-container-high h-[400px] flex flex-col w-full glass-card">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h3 className="font-headline-md text-headline-md text-on-surface">Weekly Appointments</h3>
                    <p className="text-body-sm text-on-surface-variant">Number of bookings across the current week</p>
                </div>
                <div className="flex gap-2">
                    <button
                        className="px-4 py-2 rounded-lg border border-outline-variant text-label-md font-label-md hover:bg-surface-container-low transition-colors">
                        Export Report
                    </button>
                    <button
                        className="px-4 py-2 rounded-lg bg-primary text-on-primary text-label-md font-label-md hover:opacity-90 transition-opacity">
                        This Week
                    </button>
                </div>
            </div>
            {/* Mock Bar Chart using CSS Flex */}
            <div className="flex-1 flex items-end justify-between gap-4 px-4 pb-8">
                {data.map((val, idx) => {
                    const heightPercent = Math.round((val / maxVal) * 100);
                    // Determine color intensity based on relative height
                    let bgClass = "bg-primary-container/20";
                    if (heightPercent > 80) bgClass = "bg-primary";
                    else if (heightPercent > 60) bgClass = "bg-primary-container/70";
                    else if (heightPercent > 40) bgClass = "bg-primary-container/40";
                    else if (heightPercent > 20) bgClass = "bg-primary-container/30";

                    return (
                        <div key={idx} className="flex flex-col items-center gap-3 flex-1 h-full justify-end group">
                            <span className="text-xs font-bold text-on-surface opacity-0 group-hover:opacity-100 transition-opacity">{val}</span>
                            <div className={`w-full ${bgClass} rounded-t-lg transition-all duration-500`}
                                style={{ height: `${Math.max(heightPercent, 5)}%` }}></div>
                            <span className="text-label-sm font-label-sm text-on-surface-variant">{days[idx]}</span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
