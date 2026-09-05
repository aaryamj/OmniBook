import { useState, useEffect } from 'react';
import axios from 'axios';

interface Tenant {
    id: number;
    subscriptionTier: string;
}

export default function PlatformRevenueChart() {
    const [timeFilter, setTimeFilter] = useState<'1W' | '1M' | '1Y'>('1M');
    const [chartData, setChartData] = useState<{ [key: string]: number[] }>({
        '1W': [],
        '1M': [],
        '1Y': []
    });

    const [currentData, setCurrentData] = useState<number[]>([]);
    const [donutData, setDonutData] = useState({ total: 0, enterprise: 0, pro: 0, starter: 0 });

    // Fetch Real Tenant Data for Donut Chart
    useEffect(() => {
        const fetchTenants = async () => {
            try {
                const token = localStorage.getItem('token');
                const res = await axios.get('http://localhost:8080/api/v1/superadmin/tenants', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                
                const tenants: Tenant[] = res.data || [];
                const total = tenants.length;
                
                if (total === 0) {
                    setDonutData({ total: 0, enterprise: 0, pro: 0, starter: 0 });
                    return;
                }

                let entCount = 0;
                let proCount = 0;
                let starterCount = 0;

                tenants.forEach(t => {
                    const tier = t.subscriptionTier ? t.subscriptionTier.toLowerCase() : '';
                    if (tier.includes('enterprise')) entCount++;
                    else if (tier.includes('professional') || tier.includes('pro')) proCount++;
                    else starterCount++; // Default to starter for basic/starter/empty
                });

                setDonutData({
                    total,
                    enterprise: Math.round((entCount / total) * 100),
                    pro: Math.round((proCount / total) * 100),
                    starter: Math.round((starterCount / total) * 100)
                });
            } catch (error) {
                console.error("Failed to fetch tenants for plan distribution", error);
            }
        };

        const fetchChartData = async () => {
            try {
                const token = localStorage.getItem('token');
                const res = await axios.get('http://localhost:8080/api/v1/superadmin/dashboard', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (res.data && res.data.revenueChartData) {
                    setChartData(res.data.revenueChartData);
                    setCurrentData(res.data.revenueChartData[timeFilter] || []);
                }
            } catch (error) {
                console.error("Failed to fetch revenue chart data", error);
            }
        };

        fetchTenants();
        fetchChartData();
        const interval = setInterval(() => {
            fetchTenants();
            fetchChartData();
        }, 30000);
        return () => clearInterval(interval);
    }, []);

    // Update displayed chart when timeFilter changes
    useEffect(() => {
        setCurrentData(chartData[timeFilter] || []);
    }, [timeFilter, chartData]);

    const getFilterClass = (filter: string) => {
        return timeFilter === filter 
            ? "px-3 py-1 text-[11px] font-bold bg-primary text-white rounded transition-colors"
            : "px-3 py-1 text-[11px] font-bold bg-surface-container hover:bg-surface-container-high text-on-surface-variant rounded transition-colors";
    };

    const getXAxisLabels = () => {
        if (timeFilter === '1W') return ['D-6', 'D-5', 'D-4', 'D-3', 'D-2', 'YEST', 'TODAY'];
        if (timeFilter === '1M') return ['W1', 'W2', 'W3', 'W4'];
        
        const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
        const currentMonth = new Date().getMonth();
        const labels = [];
        for (let i = 11; i >= 0; i--) {
            labels.push(months[(currentMonth - i + 12) % 12]);
        }
        return labels;
    };

    // Calculate conic gradient for the donut chart based on live percentages
    const renderDonutGradient = () => {
        if (donutData.total === 0) {
            return `conic-gradient(#e2e8f0 0% 100%)`; // Grey out if no clinics
        }
        return `conic-gradient(
            #2563eb 0% ${donutData.enterprise}%, 
            #60a5fa ${donutData.enterprise}% ${donutData.enterprise + donutData.pro}%, 
            #bfdbfe ${donutData.enterprise + donutData.pro}% 100%
        )`;
    };

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
                    <div className="absolute inset-0 flex items-end justify-between px-2">
                        {currentData.map((val, index) => {
                            // Find max to calculate relative percentage height
                            const maxVal = Math.max(...currentData, 1000); // at least 1000 to prevent divide by zero
                            const heightPct = Math.max(5, (val / maxVal) * 100);
                            const label = getXAxisLabels()[index] || '';
                            
                            return (
                                <div 
                                    key={index} 
                                    className={`w-[7%] rounded-t-sm transition-all duration-1000 ease-out bg-blue-500 hover:bg-blue-400 group cursor-pointer relative flex justify-center`}
                                    style={{ height: `${heightPct}%`, opacity: 0.4 + (index * 0.05) }}
                                    title={`${label} Revenue: रू ${val.toLocaleString('en-IN')}`}
                                >
                                    <div className="opacity-0 group-hover:opacity-100 absolute -top-8 bg-surface-container-highest text-on-surface text-[10px] font-bold px-2 py-1 rounded whitespace-nowrap transition-opacity shadow-sm z-50 pointer-events-none">
                                        {label}: रू {val.toLocaleString('en-IN')}
                                    </div>
                                </div>
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
                        style={{ background: renderDonutGradient() }}
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
                            <span className="font-mono-data font-bold text-on-surface">{donutData.total > 0 ? donutData.enterprise : 0}%</span>
                        </div>
                        <div className="flex justify-between items-center text-body-md">
                            <div className="flex items-center">
                                <span className="w-3 h-3 bg-blue-400 rounded-full mr-3 shadow-sm"></span>
                                <span className="font-medium text-on-surface">Professional</span>
                            </div>
                            <span className="font-mono-data font-bold text-on-surface">{donutData.total > 0 ? donutData.pro : 0}%</span>
                        </div>
                        <div className="flex justify-between items-center text-body-md">
                            <div className="flex items-center">
                                <span className="w-3 h-3 bg-blue-200 rounded-full mr-3 shadow-sm"></span>
                                <span className="font-medium text-on-surface">Starter</span>
                            </div>
                            <span className="font-mono-data font-bold text-on-surface">{donutData.total > 0 ? donutData.starter : 0}%</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
