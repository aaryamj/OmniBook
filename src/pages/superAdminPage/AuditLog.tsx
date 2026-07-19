import React, { useState, useEffect } from 'react';
import './superAdmin.css';
import Sidebar from './components/Sidebar';
import TopNavigation from './components/TopNavigation';

// Helper to generate a random IP
const getRandomIp = () => `${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`;

// Mock event types
const eventTypes = [
    { type: 'ADMIN_INVITATION_SENT', color: 'bg-blue-50 text-blue-700', category: 'Security' },
    { type: 'FAILED_LOGIN_ALERT', color: 'bg-error text-white animate-pulse', category: 'Auth Events' },
    { type: 'SYSTEM_BACKUP_COMPLETED', color: 'bg-green-50 text-green-700', category: 'Security' },
    { type: 'PROVIDER_ADDED', color: 'bg-purple-50 text-purple-700', category: 'Tenant Mutated' },
    { type: 'PERMISSION_CHANGED', color: 'bg-orange-50 text-orange-700', category: 'Security' },
    { type: 'TENANT_SUSPENDED', color: 'bg-red-100 text-red-800', category: 'Tenant Mutated' }
];

export default function AuditLog() {
    const [activeTab, setActiveTab] = useState('All Logs');
    const [currentPage, setCurrentPage] = useState(1);
    const [logs, setLogs] = useState<any[]>([]);
    const [timeFilter, setTimeFilter] = useState('Last 30 Days');
    const [exportStatus, setExportStatus] = useState<'idle' | 'exporting' | 'success'>('idle');
    const [showNodeDetails, setShowNodeDetails] = useState(false);
    
    // Total logged events metric
    const [totalEvents, setTotalEvents] = useState(142850);
    const [criticalAlerts, setCriticalAlerts] = useState(12);
    const [uptime, setUptime] = useState(99.9);
    
    // Log frequency chart state
    const [chartHeights, setChartHeights] = useState(
        [50, 33, 66, 75, 100, 80, 66, 50, 25, 20, 50, 75]
    );

    useEffect(() => {
        // Initial 20 logs
        const initial = Array.from({ length: 20 }, (_, i) => generateRandomLog(i));
        setLogs(initial);
        
        // Interval for new incoming logs
        const logTicker = setInterval(() => {
            const newLog = generateRandomLog(Math.random());
            setLogs(prev => [newLog, ...prev.slice(0, 49)]); // keep last 50
            setTotalEvents(prev => prev + 1);
            if (newLog.event.type === 'FAILED_LOGIN_ALERT' || newLog.event.type === 'TENANT_SUSPENDED') {
                setCriticalAlerts(prev => prev + 1);
            }
        }, 4000); // New log every 4 seconds
        
        const chartTicker = setInterval(() => {
            setChartHeights(prev => {
                const newHeights = [...prev];
                const last = newHeights.pop()!;
                newHeights.unshift(last); // shift them over
                return newHeights;
            });
            
            // Randomly fluctuate uptime between 99.8 and 100.0
            setUptime(99.8 + (Math.random() * 0.2));
        }, 2500);

        return () => {
            clearInterval(logTicker);
            clearInterval(chartTicker);
        };
    }, []);

    const generateRandomLog = (id: number | string) => {
        const event = eventTypes[Math.floor(Math.random() * eventTypes.length)];
        const isCritical = event.type === 'FAILED_LOGIN_ALERT' || event.type === 'TENANT_SUSPENDED';
        
        const pad = (n: number) => n.toString().padStart(2, '0');
        const now = new Date();
        const timestamp = `${now.getFullYear()}-${pad(now.getMonth()+1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
        
        return {
            id,
            timestamp,
            isCritical,
            actor: {
                initials: isCritical ? 'SYS' : 'JD',
                email: isCritical ? 'sys.daemon@auth.service' : 'j.doe@omnibook.io',
                bg: isCritical ? 'bg-error' : 'bg-primary-container',
                text: isCritical ? 'text-white' : 'text-white'
            },
            event,
            tenant: isCritical ? 'Global Platform' : 'Acme Corp',
            ip: isCritical ? '45.12.89.201' : getRandomIp(),
        };
    };

    const handleExport = () => {
        if (exportStatus !== 'idle') return;
        setExportStatus('exporting');
        
        // Simulate a 1.5 second generation delay
        setTimeout(() => {
            const csvContent = "Timestamp,Actor,Action Type,Target Tenant,IP Address\n" + 
                logs.map(log => `"${log.timestamp}","${log.actor.email}","${log.event.type}","${log.tenant}","${log.ip}"`).join("\n");
            
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.setAttribute("href", url);
            link.setAttribute("download", `Audit_Trail_${timeFilter.replace(/\s+/g, '_')}.csv`);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
            
            setExportStatus('success');
            setTimeout(() => setExportStatus('idle'), 3000);
        }, 1500);
    };

    // Filter logic based on tab
    const filteredLogs = logs.filter(log => {
        if (activeTab === 'All Logs') return true;
        return log.event.category === activeTab;
    });

    // Pagination logic
    const itemsPerPage = 5;
    const startIndex = (currentPage - 1) * itemsPerPage;
    const currentLogs = filteredLogs.slice(startIndex, startIndex + itemsPerPage);
    const totalPages = Math.ceil(filteredLogs.length / itemsPerPage);
    
    // When tab changes, reset to page 1
    useEffect(() => {
        setCurrentPage(1);
    }, [activeTab]);

    return (
        <div className="superadmin-theme">
            <div className="bg-background text-on-surface font-sans min-h-screen relative">
                <Sidebar />
                <TopNavigation />

                <main className="ml-sidebar-width pt-24 px-gutter pb-12 max-w-container-max mx-auto space-y-gutter">
                {/* Header & Top Actions */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                    <div>
                        <h2 className="font-headline-lg text-headline-lg text-primary flex items-center gap-2">
                            Security & System Audit Logs
                            <span className="bg-error/10 text-error text-[10px] font-bold px-2 py-0.5 rounded-full uppercase flex items-center gap-1 animate-pulse"><span className="w-1.5 h-1.5 bg-error rounded-full"></span> Live</span>
                        </h2>
                        <p className="font-body-md text-body-md text-on-surface-variant mt-1">Immutable cryptographic trail of all platform-wide administrative actions.</p>
                    </div>
                    <div className="flex gap-3">
                        <div className="relative">
                            <select 
                                value={timeFilter}
                                onChange={(e) => {
                                    setTimeFilter(e.target.value);
                                    // Optionally recalculate some random numbers
                                    setTotalEvents(Math.floor(Math.random() * 500000) + 10000);
                                    setCriticalAlerts(Math.floor(Math.random() * 50));
                                }}
                                className="appearance-none bg-white border border-outline-variant rounded-lg pl-4 pr-10 py-2 font-body-md text-primary focus:ring-2 focus:ring-primary-container cursor-pointer transition-colors hover:border-primary"
                            >
                                <option>Last 30 Days</option>
                                <option>Last 7 Days</option>
                                <option>Last 24 Hours</option>
                                <option>This Quarter</option>
                                <option>This Year</option>
                            </select>
                            <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-outline">keyboard_arrow_down</span>
                        </div>
                        <button 
                            onClick={handleExport}
                            className={`px-6 py-2 rounded-lg flex items-center gap-2 font-label-md transition-all shadow-sm active:scale-95 min-w-[190px] justify-center ${
                                exportStatus === 'idle' ? 'bg-primary-container text-white hover:bg-primary-fixed-dim' :
                                exportStatus === 'exporting' ? 'bg-surface-container text-on-surface-variant cursor-wait' :
                                'bg-green-600 text-white'
                            }`}
                        >
                            {exportStatus === 'idle' && (
                                <>
                                    <span className="material-symbols-outlined text-[18px]">download</span>
                                    Export Audit Trail
                                </>
                            )}
                            {exportStatus === 'exporting' && (
                                <>
                                    <span className="material-symbols-outlined text-[18px] animate-spin">refresh</span>
                                    Generating File...
                                </>
                            )}
                            {exportStatus === 'success' && (
                                <>
                                    <span className="material-symbols-outlined text-[18px]">check_circle</span>
                                    File Exported
                                </>
                            )}
                        </button>
                    </div>
                </div>

                {/* Metric Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <div className="bg-white p-6 rounded-xl border border-outline-variant shadow-sm flex items-start gap-4 hover:border-secondary transition-all group">
                        <div className="p-3 bg-blue-50 text-blue-600 rounded-lg group-hover:scale-110 transition-transform">
                            <span className="material-symbols-outlined" style={{fontVariationSettings: "'FILL' 1"}}>shield</span>
                        </div>
                        <div>
                            <p className="font-label-md text-label-md text-on-surface-variant uppercase tracking-tighter">Total Logged Events</p>
                            <h3 className="font-headline-lg text-headline-lg mt-1 tabular-nums">{totalEvents.toLocaleString()}</h3>
                        </div>
                    </div>
                    <div className="bg-white p-6 rounded-xl border border-outline-variant shadow-sm flex items-start gap-4 hover:border-error transition-all group">
                        <div className="p-3 bg-red-50 text-error rounded-lg group-hover:scale-110 transition-transform">
                            <span className="material-symbols-outlined" style={{fontVariationSettings: "'FILL' 1"}}>warning</span>
                        </div>
                        <div>
                            <p className="font-label-md text-label-md text-on-surface-variant uppercase tracking-tighter">Critical Alerts (Resolved)</p>
                            <h3 className="font-headline-lg text-headline-lg mt-1 text-error tabular-nums">{criticalAlerts.toLocaleString()}</h3>
                        </div>
                    </div>
                    <div className="bg-white p-6 rounded-xl border border-outline-variant shadow-sm flex items-start gap-4 hover:border-secondary-container transition-all group">
                        <div className="p-3 bg-orange-50 text-orange-600 rounded-lg group-hover:scale-110 transition-transform">
                            <span className="material-symbols-outlined" style={{fontVariationSettings: "'FILL' 1"}}>person_2</span>
                        </div>
                        <div>
                            <p className="font-label-md text-label-md text-on-surface-variant uppercase tracking-tighter">Superadmin Actions</p>
                            <h3 className="font-headline-lg text-headline-lg mt-1">342</h3>
                        </div>
                    </div>
                    <div className="bg-primary-container p-6 rounded-xl border border-primary-container shadow-sm flex items-start gap-4 text-white group">
                        <div className="p-3 bg-on-primary-fixed-variant text-secondary-container rounded-lg group-hover:scale-110 transition-transform">
                            <span className="material-symbols-outlined" style={{fontVariationSettings: "'FILL' 1"}}>verified_user</span>
                        </div>
                        <div>
                            <p className="font-label-md text-label-md text-on-primary-container uppercase tracking-tighter">Compliance Score (SOC2)</p>
                            <h3 className="font-headline-lg text-headline-lg mt-1 text-secondary-container">100%</h3>
                        </div>
                    </div>
                </div>

                {/* Data Table Card */}
                <div className="bg-white rounded-xl border border-outline-variant shadow-sm overflow-hidden mb-8">
                    <div className="px-6 pt-6 pb-2 border-b border-surface-container">
                        <div className="flex items-center justify-between mb-4">
                            <h4 className="font-headline-md text-headline-md text-primary">Global Audit Trail</h4>
                            <button className="text-secondary font-label-md flex items-center gap-1 hover:underline">
                                <span className="material-symbols-outlined text-[18px]">filter_list</span> Filter View
                            </button>
                        </div>
                        {/* Tabs */}
                        <div className="flex gap-8">
                            {['All Logs', 'Security', 'Tenant Mutated', 'Auth Events'].map(tab => (
                                <button 
                                    key={tab}
                                    onClick={() => setActiveTab(tab)}
                                    className={`pb-4 border-b-2 font-label-md transition-colors ${activeTab === tab ? 'border-secondary text-secondary' : 'border-transparent text-on-surface-variant hover:text-primary'}`}
                                >
                                    {tab}
                                </button>
                            ))}
                        </div>
                    </div>
                    
                    <div className="overflow-x-auto min-h-[400px]">
                        <table className="w-full text-left">
                            <thead className="bg-surface-container-low">
                                <tr>
                                    <th className="px-6 py-4 font-label-md text-label-md text-on-surface-variant uppercase">Timestamp</th>
                                    <th className="px-6 py-4 font-label-md text-label-md text-on-surface-variant uppercase">Actor / Email</th>
                                    <th className="px-6 py-4 font-label-md text-label-md text-on-surface-variant uppercase">Action Type</th>
                                    <th className="px-6 py-4 font-label-md text-label-md text-on-surface-variant uppercase">Target Tenant</th>
                                    <th className="px-6 py-4 font-label-md text-label-md text-on-surface-variant uppercase">IP Address</th>
                                    <th className="px-6 py-4 font-label-md text-label-md text-on-surface-variant uppercase text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-surface-container">
                                {currentLogs.map((log) => (
                                    <tr key={log.id} className={`${log.isCritical ? 'bg-red-50 hover:bg-red-100' : 'hover:bg-surface-container-low'} transition-colors group animate-in slide-in-from-top-2 duration-300`}>
                                        <td className={`px-6 py-4 font-mono-data text-mono-data ${log.isCritical ? 'text-error font-bold' : 'text-on-surface-variant'}`}>{log.timestamp}</td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold ${log.actor.bg} ${log.actor.text}`}>
                                                    {log.isCritical ? <span className="material-symbols-outlined text-[16px]">lock_reset</span> : log.actor.initials}
                                                </div>
                                                <span className={`font-body-md text-body-md ${log.isCritical ? 'text-error font-semibold' : ''}`}>{log.actor.email}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-3 py-1 rounded font-mono-data text-mono-data ${log.event.color}`}>{log.event.type}</span>
                                        </td>
                                        <td className="px-6 py-4 font-body-md text-body-md">{log.tenant}</td>
                                        <td className={`px-6 py-4 font-mono-data text-mono-data ${log.isCritical ? 'font-bold' : ''}`}>{log.ip}</td>
                                        <td className="px-6 py-4 text-right">
                                            {log.isCritical ? (
                                                <button className="bg-error text-white px-3 py-1 rounded text-[10px] uppercase font-bold hover:scale-105 transition-transform shadow-sm">Investigate</button>
                                            ) : (
                                                <button className="p-2 hover:bg-surface-container rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <span className="material-symbols-outlined">more_vert</span>
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                                {currentLogs.length === 0 && (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-12 text-center text-on-surface-variant">No logs found.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                    
                    {/* Pagination */}
                    <div className="px-6 py-4 bg-surface-container-low flex items-center justify-between border-t border-surface-container">
                        <span className="font-label-md text-label-md text-on-surface-variant">
                            Showing {Math.min(startIndex + 1, filteredLogs.length)} to {Math.min(startIndex + itemsPerPage, filteredLogs.length)} of {filteredLogs.length} entries (Total: {totalEvents.toLocaleString()})
                        </span>
                        <div className="flex gap-2">
                            <button 
                                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                disabled={currentPage === 1}
                                className="px-4 py-2 border border-outline-variant rounded-lg text-on-surface-variant font-label-md hover:bg-white disabled:opacity-50 transition-colors"
                            >
                                Previous
                            </button>
                            
                            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => i + 1).map(page => (
                                <button 
                                    key={page}
                                    onClick={() => setCurrentPage(page)}
                                    className={`px-4 py-2 border rounded-lg font-label-md transition-colors ${currentPage === page ? 'bg-primary-container text-white border-primary-container' : 'border-outline-variant text-on-surface-variant hover:bg-white'}`}
                                >
                                    {page}
                                </button>
                            ))}
                            
                            <button 
                                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                disabled={currentPage === totalPages || totalPages === 0}
                                className="px-4 py-2 border border-outline-variant rounded-lg text-on-surface-variant font-label-md hover:bg-white disabled:opacity-50 transition-colors"
                            >
                                Next
                            </button>
                        </div>
                    </div>
                </div>

                {/* Data Visualization */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-outline-variant shadow-sm h-80 flex flex-col hover:border-secondary transition-colors">
                        <div className="flex justify-between items-center mb-6">
                            <h5 className="font-headline-md text-headline-md">Log Frequency (24h)</h5>
                            <div className="flex gap-2 items-center">
                                <span className="w-3 h-3 bg-secondary rounded-full"></span>
                                <span className="font-label-md text-label-md text-on-surface-variant">System Events</span>
                            </div>
                        </div>
                        <div className="flex-1 flex items-end justify-between gap-2 px-2 overflow-hidden">
                            {chartHeights.map((h, i) => (
                                <div key={i} className={`w-full rounded-t-sm transition-all duration-1000 ease-in-out relative group ${h > 50 ? 'bg-secondary' : 'bg-surface-container'}`} style={{ height: `${h}%` }}>
                                    <div className="opacity-0 group-hover:opacity-100 absolute -top-8 left-1/2 -translate-x-1/2 bg-surface-container-highest text-on-surface text-[10px] font-bold px-2 py-1 rounded transition-opacity pointer-events-none">
                                        {Math.floor(h * 42)}
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="flex justify-between mt-4 font-mono-data text-label-md text-outline">
                            <span>00:00</span>
                            <span>06:00</span>
                            <span>12:00</span>
                            <span>18:00</span>
                            <span>23:59</span>
                        </div>
                    </div>
                    
                    <div className="bg-white p-6 rounded-xl border border-outline-variant shadow-sm flex flex-col items-center justify-center text-center hover:border-secondary transition-colors relative overflow-hidden">
                        {/* decorative background element */}
                        <div className="absolute -right-10 -top-10 w-32 h-32 bg-secondary/5 rounded-full blur-3xl"></div>
                        
                        <div className="w-32 h-32 rounded-full border-8 border-surface-container flex items-center justify-center relative group">
                            <div className="absolute inset-0 rounded-full border-8 border-secondary border-t-transparent -rotate-45 transition-transform duration-1000 group-hover:rotate-[315deg]"></div>
                            <div>
                                <p className="font-headline-lg text-headline-lg">{uptime.toFixed(1)}%</p>
                                <p className="font-label-md text-label-md text-outline">Uptime</p>
                            </div>
                        </div>
                        <h5 className="mt-6 font-headline-md text-headline-md">Infrastructure Health</h5>
                        <p className="font-body-md text-body-md text-on-surface-variant mt-2 px-4">All audit relay nodes are syncing in real-time with zero latency detected.</p>
                        <button 
                            onClick={() => setShowNodeDetails(true)}
                            className="mt-6 text-secondary font-label-md border border-secondary px-6 py-2 rounded-lg hover:bg-secondary hover:text-white transition-all"
                        >
                            Node Details
                        </button>
                    </div>
                </div>
            </main>
            
            {/* Node Details Modal */}
            {showNodeDetails && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-tertiary-container/40 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-surface-container-lowest rounded-xl shadow-2xl max-w-2xl w-full border border-surface-container overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="px-6 py-4 border-b border-surface-container flex justify-between items-center bg-surface">
                            <h3 className="font-headline-md text-headline-md flex items-center gap-2">
                                <span className="material-symbols-outlined text-secondary">hub</span>
                                Audit Relay Nodes
                            </h3>
                            <button 
                                onClick={() => setShowNodeDetails(false)}
                                className="text-on-surface-variant hover:text-error transition-colors p-1 rounded-full hover:bg-surface-container-lowest"
                            >
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>
                        <div className="p-6 bg-surface-container-lowest">
                            <div className="space-y-4">
                                {[
                                    { name: 'us-east-primary', status: 'Healthy', latency: '12ms', type: 'Primary' },
                                    { name: 'eu-west-replica', status: 'Healthy', latency: '45ms', type: 'Replica' },
                                    { name: 'ap-south-replica', status: 'Healthy', latency: '110ms', type: 'Replica' },
                                    { name: 'archive-cold-storage', status: 'Syncing', latency: '---', type: 'Backup' }
                                ].map(node => (
                                    <div key={node.name} className="flex items-center justify-between p-4 border border-outline-variant rounded-lg hover:border-secondary transition-colors group">
                                        <div className="flex items-center gap-4">
                                            <div className={`w-2 h-2 rounded-full ${node.status === 'Healthy' ? 'bg-green-500 animate-pulse' : 'bg-orange-500'}`}></div>
                                            <div>
                                                <p className="font-body-md font-bold text-on-surface">{node.name}</p>
                                                <p className="text-[12px] text-on-surface-variant font-mono-data">{node.type} Node</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className={`font-label-md text-label-md ${node.status === 'Healthy' ? 'text-green-700' : 'text-orange-700'}`}>{node.status}</p>
                                            <p className="text-[12px] text-on-surface-variant font-mono-data">Ping: {node.latency}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="px-6 py-4 border-t border-surface-container bg-surface-container-low flex justify-end">
                            <button 
                                onClick={() => setShowNodeDetails(false)}
                                className="bg-primary-container text-white px-6 py-2 rounded-lg font-label-md hover:bg-primary-fixed-dim transition-colors"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
            </div>
        </div>
    );
}
