import { useState, useEffect } from 'react';

export default function TenantGrowthChart() {
    const [view, setView] = useState('Yearly');
    
    // Data values 0-100 representing percentage of max height
    const initialToday = [12, 10, 15, 18, 22, 20];
    const initialThisWeek = [15, 18, 16, 22, 25, 20, 28];
    const initialThisMonth = [20, 35, 30, 45, 50];
    const initialQuarterly = [20, 45, 55, 85];
    const initialYearly = [10, 15, 12, 25, 30, 28, 45, 55, 60, 50, 75, 85];
    
    const [data, setData] = useState(initialYearly);

    // Simulate real-time data jitter for the most recent time period
    useEffect(() => {
        let baseData = initialYearly;
        if (view === 'Today') baseData = initialToday;
        if (view === 'This Week') baseData = initialThisWeek;
        if (view === 'This Month') baseData = initialThisMonth;
        if (view === 'Quarterly') baseData = initialQuarterly;
        if (view === 'Yearly') baseData = initialYearly;
        
        setData([...baseData]);
        
        const interval = setInterval(() => {
            setData(prev => {
                const newData = [...prev];
                const lastIdx = newData.length - 1;
                // Random fluctuation between -3 and +3
                const jitter = Math.floor(Math.random() * 7) - 3;
                let newVal = newData[lastIdx] + jitter;
                if (newVal > 95) newVal = 95; // keep it within bounds
                if (newVal < 10) newVal = 10;
                newData[lastIdx] = newVal;
                return newData;
            });
        }, 1500); // Fast interval for a lively feel

        return () => clearInterval(interval);
    }, [view]);

    // Helper to generate a smooth bezier curve path for SVG
    const generateSmoothPath = (pts: number[]) => {
        if (pts.length === 0) return "";
        const step = 100 / (pts.length - 1);
        const points = pts.map((val, i) => ({ x: i * step, y: 100 - val }));
        
        let path = `M ${points[0].x},${points[0].y}`;
        for (let i = 0; i < points.length - 1; i++) {
            const p1 = points[i];
            const p2 = points[i + 1];
            // Control points for a smooth horizontal curve
            const ctrlX = (p1.x + p2.x) / 2;
            path += ` C ${ctrlX},${p1.y} ${ctrlX},${p2.y} ${p2.x},${p2.y}`;
        }
        return path;
    };

    const strokePath = generateSmoothPath(data);
    const fillPath = strokePath ? `${strokePath} L 100,100 L 0,100 Z` : '';

    const labels = view === 'Today' ? ['12AM', '4AM', '8AM', '12PM', '4PM', '8PM']
                 : view === 'This Week' ? ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN']
                 : view === 'This Month' ? ['WK 1', 'WK 2', 'WK 3', 'WK 4', 'WK 5']
                 : view === 'Quarterly' ? ['Q1', 'Q2', 'Q3', 'Q4']
                 : ['JAN', 'MAR', 'MAY', 'JUL', 'SEP', 'NOV'];

    return (
        <div className="lg:col-span-7 bg-surface-container-lowest rounded-xl border border-surface-container shadow-sm p-6 flex flex-col">
            <div className="flex justify-between items-center mb-6 relative z-20">
                <div>
                    <h3 className="font-headline-md text-headline-md text-primary flex items-center gap-2">
                        Tenant Growth
                        <span className="flex h-2 w-2 relative">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                        </span>
                    </h3>
                    <p className="font-body-md text-body-md text-on-surface-variant">Live tracking of new clinic registrations.</p>
                </div>
                <div className="relative">
                    <select 
                        value={view}
                        onChange={(e) => setView(e.target.value)}
                        className="bg-surface-container-low border border-outline-variant hover:bg-surface-container-high cursor-pointer transition-colors rounded-lg text-label-md font-label-md pl-4 pr-10 py-2 focus:ring-2 focus:ring-primary outline-none appearance-none shadow-sm"
                    >
                        <option value="Today">Today</option>
                        <option value="This Week">This Week</option>
                        <option value="This Month">This Month</option>
                        <option value="Quarterly">Quarterly</option>
                        <option value="Yearly">Yearly View</option>
                    </select>
                    {/* Custom Arrow for select */}
                    <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-on-surface-variant text-[18px]">
                        expand_more
                    </span>
                </div>
            </div>
            
            <div className="flex-1 relative min-h-[240px] flex items-end justify-between px-2">
                {/* Simulated Chart Visualization */}
                <div className="absolute inset-0 pointer-events-none rounded-b-xl z-10 transition-all duration-500">
                    <svg className="w-full h-[90%] mt-auto absolute bottom-0 overflow-visible transition-all duration-700 ease-out" preserveAspectRatio="none" viewBox="0 0 100 100">
                        <defs>
                            <linearGradient id="oceanBlueGradient" x1="0" x2="0" y1="0" y2="1">
                                <stop offset="0%" stopColor="#40c2fd" stopOpacity="0.4"></stop>
                                <stop offset="100%" stopColor="#ffffff" stopOpacity="0"></stop>
                            </linearGradient>
                        </defs>
                        {/* Area Fill */}
                        <path 
                            d={fillPath} 
                            fill="url(#oceanBlueGradient)" 
                            className="transition-all duration-700 ease-out"
                        ></path>
                        {/* Stroke Line */}
                        <path 
                            d={strokePath} 
                            fill="none" 
                            stroke="#40c2fd" 
                            strokeLinecap="round" 
                            strokeWidth="2.5"
                            className="transition-all duration-700 ease-out"
                        ></path>
                        
                        {/* Animated pulsing dot on the last data point */}
                        {data.length > 0 && (
                            <circle 
                                cx="100" 
                                cy={100 - data[data.length - 1]} 
                                r="2" 
                                fill="#0077ff"
                                className="transition-all duration-700 ease-out shadow-lg"
                            >
                                <animate attributeName="r" values="1.5;3;1.5" dur="1.5s" repeatCount="indefinite" />
                            </circle>
                        )}
                    </svg>
                </div>
                
                {/* Horizontal Grid lines */}
                <div className="absolute inset-0 flex flex-col justify-between pointer-events-none border-b border-surface-container z-0">
                    <div className="w-full border-t border-dashed border-surface-container"></div>
                    <div className="w-full border-t border-dashed border-surface-container"></div>
                    <div className="w-full border-t border-dashed border-surface-container"></div>
                    <div className="w-full border-t border-dashed border-surface-container"></div>
                </div>

                {/* Chart Axes Labels */}
                <div className="flex w-full justify-between mt-auto pt-4 border-t border-surface-container-high relative z-20">
                    {labels.map(label => (
                        <span key={label} className="text-[10px] text-on-surface-variant font-mono-data">{label}</span>
                    ))}
                </div>
            </div>
        </div>
    );
}
