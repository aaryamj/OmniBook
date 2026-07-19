import { useState, useEffect } from 'react';

export default function PlatformRevenueChart() {
    const [timeFilter, setTimeFilter] = useState<'1W' | '1M' | '1Y'>('1M');
    
    // Mock Data for the bars (percentage heights)
    const mockData = {
        '1W': [40, 35, 55, 45, 65, 75, 85, 80, 60, 50, 70, 90], // 12 bars 
        '1M': [30, 35, 45, 50, 55, 65, 70, 75, 80, 85, 92, 100],
        '1Y': [15, 20, 25, 30, 40, 50, 60, 75, 85, 90, 95, 100]
    };

    const [currentData, setCurrentData] = useState(mockData['1M']);
    const [donutData, setDonutData] = useState({ total: 42, enterprise: 20, pro: 50, basic: 30 });

    // Simulate "Real Time" updating
    useEffect(() => {
        const baseData = mockData[timeFilter];
        setCurrentData([...baseData]);
        
        const chartInterval = setInterval(() => {
            setCurrentData(prev => {
                const newData = [...prev];
                const lastIdx = newData.length - 1;
                // Random fluctuation between -5 and +5
                const fluctuation = Math.floor(Math.random() * 11) - 5;
                let newHeight = baseData[lastIdx] + fluctuation;
                if (newHeight > 100) newHeight = 100;
                if (newHeight < 10) newHeight = 10;
                newData[lastIdx] = newHeight;
                return newData;
            });
        }, 2000); // update every 2 seconds for a responsive feel

        const donutInterval = setInterval(() => {
            setDonutData(prev => {
                // Randomly shift 1-2 percent between plans
                const shift = Math.floor(Math.random() * 3) - 1; // -1, 0, or 1
                let newEnt = prev.enterprise + shift;
                let newPro = prev.pro - shift;
                
                // Add a new clinic occasionally
                const newTotal = prev.total + (Math.random() > 0.8 ? 1 : 0);

                if (newEnt < 15) newEnt = 15;
                if (newPro < 30) newPro = 30;
                
                return {
                    total: newTotal,
                    enterprise: newEnt,
                    pro: newPro,
                    basic: 100 - newEnt - newPro
                };
            });
        }, 3500); // update donut slightly slower

        return () => {
            clearInterval(chartInterval);
            clearInterval(donutInterval);
        };
    }, [timeFilter]);

    const getFilterClass = (filter: string) => {
        return timeFilter === filter 
            ? "px-3 py-1 text-[11px] font-bold bg-primary text-white rounded transition-colors"
            : "px-3 py-1 text-[11px] font-bold bg-surface-container hover:bg-surface-container-high text-on-surface-variant rounded transition-colors";
    };

    const getXAxisLabels = () => {
        if (timeFilter === '1W') return ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];
        if (timeFilter === '1M') return ['W1', 'W2', 'W3', 'W4'];
        return ['JAN', 'MAR', 'MAY', 'JUL', 'SEP', 'NOV'];
    };

    // Calculate conic gradient for the donut chart based on live percentages
    const donutGradient = `conic-gradient(
        #2563eb 0% ${donutData.enterprise}%, 
        #60a5fa ${donutData.enterprise}% ${donutData.enterprise + donutData.pro}%, 
        #bfdbfe ${donutData.enterprise + donutData.pro}% 100%
    )`;

    return (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Revenue Trajectory Area Chart */}
            <div className="lg:col-span-8 bg-surface-container-lowest p-6 rounded-xl border border-surface-container min-h-[400px] flex flex-col">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h3 className="font-headline-md text-headline-md text-on-surface flex items-center gap-2">
                            Platform Revenue Trajectory
                            <span className="flex h-2 w-2 relative">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                            </span>
                        </h3>
                        <p className="font-body-md text-body-md text-on-surface-variant">Live MRR growth and historical trends</p>
                    </div>
                    <div className="flex space-x-2">
                        <button onClick={() => setTimeFilter('1W')} className={getFilterClass('1W')}>1W</button>
                        <button onClick={() => setTimeFilter('1M')} className={getFilterClass('1M')}>1M</button>
                        <button onClick={() => setTimeFilter('1Y')} className={getFilterClass('1Y')}>1Y</button>
                    </div>
                </div>
                <div className="flex-1 relative">
                    {/* Placeholder for Chart */}
                    <div className="absolute inset-0 flex items-end justify-between px-2">
                        {currentData.map((height, index) => {
                            // Calculate a gradient class based on index so the right side is darker blue
                            const colorClass = `bg-blue-${Math.min(900, 50 + (index * 100))}`;
                            return (
                                <div 
                                    key={index} 
                                    className={`w-[7%] rounded-t-sm transition-all duration-1000 ease-out bg-blue-500`}
                                    style={{ height: `${height}%`, opacity: 0.4 + (index * 0.05) }}
                                ></div>
                            );
                        })}
                    </div>
                    {/* Overlaying Gridlines */}
                    <div className="absolute inset-0 flex flex-col justify-between pointer-events-none border-b border-surface-container">
                        <div className="w-full border-t border-dashed border-surface-container-highest"></div>
                        <div className="w-full border-t border-dashed border-surface-container-highest"></div>
                        <div className="w-full border-t border-dashed border-surface-container-highest"></div>
                        <div className="w-full border-t border-dashed border-surface-container-highest"></div>
                    </div>
                </div>
                <div className="flex justify-between mt-4 px-2">
                    {getXAxisLabels().map((label, idx) => (
                        <span key={idx} className="text-[10px] font-mono-data text-on-surface-variant">{label}</span>
                    ))}
                </div>
            </div>
            
            {/* Donut Chart */}
            <div className="lg:col-span-4 bg-surface-container-lowest p-6 rounded-xl border border-surface-container flex flex-col">
                <div className="flex justify-between items-start mb-8">
                    <div>
                        <h3 className="font-headline-md text-headline-md text-on-surface mb-1 flex items-center gap-2">
                            Clinics by Plan
                            <span className="flex h-2 w-2 relative">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                            </span>
                        </h3>
                        <p className="font-body-md text-body-md text-on-surface-variant">Live subscription distribution</p>
                    </div>
                </div>
                
                <div className="flex-1 flex flex-col items-center justify-center">
                    {/* Real Dynamic Donut */}
                    <div 
                        className="relative w-48 h-48 rounded-full flex items-center justify-center transition-all duration-1000"
                        style={{ background: donutGradient }}
                    >
                        {/* Inner hollow circle */}
                        <div className="absolute inset-4 bg-surface-container-lowest rounded-full flex flex-col items-center justify-center z-10 shadow-inner">
                            <p className="text-[32px] font-bold text-on-surface tracking-tighter leading-none">{donutData.total}</p>
                            <p className="text-[10px] font-label-md text-on-surface-variant uppercase mt-1">Total Clinics</p>
                        </div>
                    </div>
                    
                    {/* Dynamic Legend */}
                    <div className="w-full mt-10 space-y-4">
                        <div className="flex justify-between items-center text-body-md">
                            <div className="flex items-center">
                                <span className="w-3 h-3 bg-blue-600 rounded-full mr-3 shadow-sm"></span>
                                <span className="font-medium text-on-surface">Enterprise</span>
                            </div>
                            <span className="font-mono-data font-bold text-on-surface">{donutData.enterprise}%</span>
                        </div>
                        <div className="flex justify-between items-center text-body-md">
                            <div className="flex items-center">
                                <span className="w-3 h-3 bg-blue-400 rounded-full mr-3 shadow-sm"></span>
                                <span className="font-medium text-on-surface">Pro</span>
                            </div>
                            <span className="font-mono-data font-bold text-on-surface">{donutData.pro}%</span>
                        </div>
                        <div className="flex justify-between items-center text-body-md">
                            <div className="flex items-center">
                                <span className="w-3 h-3 bg-blue-200 rounded-full mr-3 shadow-sm"></span>
                                <span className="font-medium text-on-surface">Basic</span>
                            </div>
                            <span className="font-mono-data font-bold text-on-surface">{donutData.basic}%</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
