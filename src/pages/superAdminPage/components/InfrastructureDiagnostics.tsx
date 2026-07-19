import React, { useState, useEffect } from 'react';

export default function InfrastructureDiagnostics() {
    const [activeTab, setActiveTab] = useState('All Logs');
    
    // Left Chart State: Latency vs Throughput (7 data points)
    // values between 20 and 80
    const [trendData, setTrendData] = useState(
        Array.from({ length: 7 }, () => ({
            latency: Math.floor(Math.random() * 40) + 20,
            throughput: Math.floor(Math.random() * 50) + 30
        }))
    );
    
    // Right Chart State: PostgreSQL Active Connections (14 data points)
    const [pgData, setPgData] = useState(
        Array.from({ length: 14 }, () => Math.floor(Math.random() * 20) + 35)
    );
    
    const [uptimeStr, setUptimeStr] = useState("14d 06h 22m");

    useEffect(() => {
        const interval = setInterval(() => {
            // Update left chart
            setTrendData(prev => {
                const newData = [...prev.slice(1)];
                newData.push({
                    latency: Math.floor(Math.random() * 40) + 20,
                    throughput: Math.floor(Math.random() * 50) + 30
                });
                return newData;
            });
            
            // Update right chart
            setPgData(prev => {
                const newData = [...prev.slice(1)];
                newData.push(Math.floor(Math.random() * 20) + 35);
                return newData;
            });
            
        }, 3000);

        return () => clearInterval(interval);
    }, []);

    // Update uptime minute ticker
    useEffect(() => {
        const ticker = setInterval(() => {
            setUptimeStr(prev => {
                const parts = prev.match(/(\d+)d (\d+)h (\d+)m/);
                if (parts) {
                    let [_, d, h, m] = parts;
                    let numM = parseInt(m) + 1;
                    let numH = parseInt(h);
                    let numD = parseInt(d);
                    if (numM >= 60) {
                        numM = 0;
                        numH++;
                    }
                    if (numH >= 24) {
                        numH = 0;
                        numD++;
                    }
                    return `${numD}d ${numH.toString().padStart(2, '0')}h ${numM.toString().padStart(2, '0')}m`;
                }
                return prev;
            });
        }, 60000); // 1 minute
        return () => clearInterval(ticker);
    }, []);

    // Helper for smooth curve
    const generateSmoothPath = (pts: number[], width: number, height: number, invert = true) => {
        if (pts.length === 0) return "";
        const stepX = width / (pts.length - 1);
        const points = pts.map((val, i) => ({ 
            x: i * stepX, 
            y: invert ? height - (val / 100 * height) : (val / 100 * height)
        }));
        
        let path = `M ${points[0].x},${points[0].y}`;
        for (let i = 0; i < points.length - 1; i++) {
            const p1 = points[i];
            const p2 = points[i + 1];
            const ctrlX = (p1.x + p2.x) / 2;
            path += ` C ${ctrlX},${p1.y} ${ctrlX},${p2.y} ${p2.x},${p2.y}`;
        }
        return path;
    };

    const tabs = ['All Logs', 'Database', 'API Gateway', 'Third-Party'];

    const getChartConfig = (tab: string) => {
        switch (tab) {
            case 'Database':
                return {
                    leftTitle: 'Query Latency vs. IOPS Trends',
                    leftPrimaryLabel: 'IOPS',
                    leftSecondaryLabel: 'LATENCY',
                    leftPrimaryColor: '#ab47bc', // purple
                    leftSecondaryColor: '#ef5350', // red
                    rightTitle: 'Buffer Cache Hit Ratio',
                    rightPrimaryColor: '#ab47bc',
                    rightSuffix: '%'
                };
            case 'API Gateway':
                return {
                    leftTitle: 'Request Rate vs. Error Spikes',
                    leftPrimaryLabel: 'REQUESTS',
                    leftSecondaryLabel: 'ERRORS',
                    leftPrimaryColor: '#26a69a', // teal
                    leftSecondaryColor: '#ef5350', // red
                    rightTitle: 'Gateway Active TCP Connections',
                    rightPrimaryColor: '#26a69a',
                    rightSuffix: ''
                };
            case 'Third-Party':
                return {
                    leftTitle: 'Webhook Delivery vs. Timeouts',
                    leftPrimaryLabel: 'DELIVERIES',
                    leftSecondaryLabel: 'TIMEOUTS',
                    leftPrimaryColor: '#5c6bc0', // indigo
                    leftSecondaryColor: '#ffca28', // amber
                    rightTitle: 'External API Quota Utilization',
                    rightPrimaryColor: '#5c6bc0',
                    rightSuffix: '%'
                };
            case 'All Logs':
            default:
                return {
                    leftTitle: 'API Latency vs. Throughput Trends',
                    leftPrimaryLabel: 'THROUGHPUT',
                    leftSecondaryLabel: 'LATENCY',
                    leftPrimaryColor: '#40c2fd', // blue
                    leftSecondaryColor: '#fb8c00', // orange
                    rightTitle: 'PostgreSQL Active Connections',
                    rightPrimaryColor: '#4338ca', // dark indigo
                    rightSuffix: ''
                };
        }
    };

    const config = getChartConfig(activeTab);

    return (
        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden shadow-sm">
            {/* Tabs Header */}
            <div className="px-8 pt-6 border-b border-surface-container-highest">
                <h2 className="text-headline-md font-headline-md text-primary mb-4">Infrastructure Diagnostics & Gateway Status</h2>
                <div className="flex space-x-8">
                    {tabs.map(tab => (
                        <button 
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`pb-4 border-b-2 font-medium text-body-md transition-colors ${
                                activeTab === tab 
                                    ? 'border-secondary text-primary font-bold' 
                                    : 'border-transparent text-on-surface-variant hover:text-primary'
                            }`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>
            </div>

            {/* Content Area: Graphs */}
            <div className="p-8 grid grid-cols-1 lg:grid-cols-2 gap-12 animate-in fade-in duration-500" key={activeTab}>
                {/* Left Chart */}
                <div className="flex flex-col">
                    <div className="flex justify-between items-center mb-6">
                        <h4 className="text-label-md font-bold text-on-surface uppercase tracking-widest">{config.leftTitle}</h4>
                        <div className="flex items-center space-x-4">
                            <div className="flex items-center"><span className="w-3 h-3 rounded-full mr-2 transition-colors duration-500" style={{backgroundColor: config.leftPrimaryColor}}></span><span className="text-[10px] font-mono-data text-on-surface-variant">{config.leftPrimaryLabel}</span></div>
                            <div className="flex items-center"><span className="w-3 h-3 rounded-full mr-2 transition-colors duration-500" style={{backgroundColor: config.leftSecondaryColor}}></span><span className="text-[10px] font-mono-data text-on-surface-variant">{config.leftSecondaryLabel}</span></div>
                        </div>
                    </div>
                    
                    <div className="relative border-b border-l border-surface-container-highest pt-4 pl-4 h-[200px]">
                        {/* Bars */}
                        <div className="absolute inset-0 flex items-end justify-between space-x-2 pl-4 pb-[1px]">
                            {trendData.map((data, i) => (
                                <div key={i} className="flex-1 rounded-t-sm relative transition-all duration-700 ease-in-out opacity-40" style={{ height: `${data.throughput}%`, backgroundColor: config.leftPrimaryColor }}>
                                </div>
                            ))}
                        </div>
                        {/* SVG Line Overlay */}
                        <div className="absolute inset-0 pl-4 w-full h-full pointer-events-none pb-[1px]">
                            <svg className="w-full h-full overflow-visible transition-all duration-700 ease-out" preserveAspectRatio="none" viewBox="0 0 100 100">
                                <path 
                                    d={generateSmoothPath(trendData.map(d => d.latency), 100, 100)} 
                                    fill="none" 
                                    stroke={config.leftSecondaryColor}
                                    strokeLinecap="round" 
                                    strokeWidth="2.5"
                                    className="transition-all duration-700 ease-out drop-shadow-md"
                                ></path>
                                {trendData.map((d, i) => (
                                    <circle 
                                        key={i}
                                        cx={(i * (100 / (trendData.length - 1)))}
                                        cy={100 - d.latency}
                                        r="2"
                                        fill={config.leftSecondaryColor}
                                        className="transition-all duration-700 ease-out shadow-lg"
                                    />
                                ))}
                            </svg>
                        </div>
                    </div>
                </div>

                {/* Right Chart */}
                <div className="flex flex-col">
                    <div className="flex justify-between items-center mb-6">
                        <h4 className="text-label-md font-bold text-on-surface uppercase tracking-widest">{config.rightTitle}</h4>
                        <div className="flex items-center bg-blue-50 text-blue-700 px-3 py-1 rounded border border-blue-100 transition-all duration-300">
                            <span className="font-mono-data">Current: {pgData[pgData.length - 1]}{config.rightSuffix}</span>
                        </div>
                    </div>
                    
                    <div className="relative border-b border-l border-surface-container-highest pt-4 pl-4 h-[200px] overflow-hidden">
                         <svg className="w-full h-full absolute bottom-0 overflow-visible transition-all duration-700 ease-out" preserveAspectRatio="none" viewBox="0 0 100 100">
                            <defs>
                                <linearGradient id="rightGradient" x1="0" x2="0" y1="0" y2="1">
                                    <stop offset="0%" stopColor={config.rightPrimaryColor} stopOpacity="0.6"></stop>
                                    <stop offset="100%" stopColor={config.rightPrimaryColor} stopOpacity="0.1"></stop>
                                </linearGradient>
                            </defs>
                            <path 
                                d={`${generateSmoothPath(pgData, 100, 100)} L 100,100 L 0,100 Z`} 
                                fill="url(#rightGradient)" 
                                className="transition-all duration-700 ease-out"
                            ></path>
                            <path 
                                d={generateSmoothPath(pgData, 100, 100)} 
                                fill="none" 
                                stroke={config.rightPrimaryColor}
                                strokeLinecap="round" 
                                strokeWidth="2.5"
                                className="transition-all duration-700 ease-out"
                            ></path>
                        </svg>
                    </div>
                </div>
            </div>

            {/* Footer Stats */}
            <div className="bg-surface-container-low px-8 py-4 flex flex-col md:flex-row md:items-center justify-between border-t border-surface-container-highest gap-4">
                <div className="flex items-center space-x-8">
                    <div>
                        <span className="text-[10px] text-on-surface-variant uppercase font-bold tracking-widest">Master Node</span>
                        <p className="font-mono-data text-label-md text-primary">node-01.us-east.aws</p>
                    </div>
                    <div>
                        <span className="text-[10px] text-on-surface-variant uppercase font-bold tracking-widest">Uptime</span>
                        <p className="font-mono-data text-label-md text-primary">{uptimeStr}</p>
                    </div>
                </div>
                <div className="flex items-center text-green-600 font-bold text-label-md">
                    <span className="material-symbols-outlined mr-2">verified_user</span>
                    SECURE ENCLAVE ACTIVE
                </div>
            </div>
        </div>
    );
}
