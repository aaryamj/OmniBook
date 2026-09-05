import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './superAdmin.css';
import Sidebar from './components/Sidebar';
import TopNavigation from './components/TopNavigation';

export default function AuditLog() {
    const [activeTab, setActiveTab] = useState('All Logs');
    const [currentPage, setCurrentPage] = useState(1);
    const [logs, setLogs] = useState<any[]>([]);
    const [timeFilter, setTimeFilter] = useState('Last 30 Days');
    const [exportStatus, setExportStatus] = useState<'idle' | 'exporting' | 'success'>('idle');
    const [showNodeDetails, setShowNodeDetails] = useState(false);
    
    // Total logged events metric
    const [totalEvents, setTotalEvents] = useState(0);
    const [criticalAlerts, setCriticalAlerts] = useState(0);
    const [superadminActions, setSuperadminActions] = useState(0);
    const [complianceScore, setComplianceScore] = useState(100);
    const [uptime, setUptime] = useState(99.9);
    
    // Log frequency chart state
    const [chartHeights, setChartHeights] = useState<number[]>(Array(12).fill(0));

    // UI States for functionality
    const [showFilterView, setShowFilterView] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedLog, setSelectedLog] = useState<any | null>(null);
    const [nodePings, setNodePings] = useState([12, 45, 110]);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await axios.get('http://localhost:8080/api/v1/superadmin/audit-dashboard', {
                    headers: { 'Authorization': `Bearer ${token}` },
                    params: { timeFilter }
                });
                
                const data = response.data;
                setTotalEvents(data.totalEvents || 0);
                setCriticalAlerts(data.criticalAlerts || 0);
                setSuperadminActions(data.superadminActions || 0);
                setComplianceScore(data.complianceScore || 100);
                setUptime(data.uptime || 99.9);
                setLogs(data.logs || []);
                
                if (data.logFrequency && data.logFrequency.length > 0) {
                    // Convert frequency counts to percentages for the chart
                    const maxFreq = Math.max(...data.logFrequency, 1);
                    const heights = data.logFrequency.map((f: number) => (f / maxFreq) * 100);
                    // Take last 12 hours for the UI or adapt it
                    setChartHeights(heights.slice(-12));
                }
            } catch (err) {
                console.error("Failed to fetch audit dashboard data", err);
            }
        };

        fetchDashboardData();
        const interval = setInterval(fetchDashboardData, 5000);
        
        // Simulate real-time pings for node details
        const pingInterval = setInterval(() => {
            setNodePings([
                Math.floor(Math.random() * 10) + 10,  // 10-20ms
                Math.floor(Math.random() * 20) + 35,  // 35-55ms
                Math.floor(Math.random() * 30) + 95,  // 95-125ms
            ]);
        }, 2000);

        return () => {
            clearInterval(interval);
            clearInterval(pingInterval);
        };
    }, [timeFilter]);

    const handleExport = () => {
        if (exportStatus !== 'idle') return;
        setExportStatus('exporting');
        
        setTimeout(() => {
            const csvContent = "Timestamp,Actor,Action Type,Target Tenant,IP Address\n" + 
                logs.map(log => `"${log.timestamp}","${log.actorEmail}","${log.eventType}","${log.tenantName}","${log.ipAddress}"`).join("\n");
            
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

    // Filter logic based on tab and search
    const filteredLogs = logs.filter(log => {
        let tabMatch = true;
        if (activeTab !== 'All Logs') {
            tabMatch = log.eventCategory === activeTab;
        }
        
        let searchMatch = true;
        if (searchQuery.trim() !== '') {
            const q = searchQuery.toLowerCase();
            searchMatch = 
                (log.actorEmail && log.actorEmail.toLowerCase().includes(q)) ||
                (log.eventType && log.eventType.toLowerCase().includes(q)) ||
                (log.ipAddress && log.ipAddress.toLowerCase().includes(q));
        }

        return tabMatch && searchMatch;
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
                    <div className="flex flex-wrap sm:flex-nowrap gap-3 w-full sm:w-auto">
                        <div className="relative flex-1 sm:flex-initial">
                            <select 
                                value={timeFilter}
                                onChange={(e) => {
                                    setTimeFilter(e.target.value);
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
                            <h3 className="font-headline-lg text-headline-lg mt-1">{superadminActions.toLocaleString()}</h3>
                        </div>
                    </div>
                    <div className="bg-primary-container p-6 rounded-xl border border-primary-container shadow-sm flex items-start gap-4 text-white group">
                        <div className="p-3 bg-on-primary-fixed-variant text-secondary-container rounded-lg group-hover:scale-110 transition-transform">
                            <span className="material-symbols-outlined" style={{fontVariationSettings: "'FILL' 1"}}>verified_user</span>
                        </div>
                        <div>
                            <p className="font-label-md text-label-md text-on-primary-container uppercase tracking-tighter">Compliance Score (SOC2)</p>
                            <h3 className="font-headline-lg text-headline-lg mt-1 text-secondary-container">{complianceScore}%</h3>
                        </div>
                    </div>
                </div>

                {/* Data Table Card */}
                <div className="bg-white rounded-xl border border-outline-variant shadow-sm overflow-hidden mb-8">
                    <div className="px-6 pt-6 pb-2 border-b border-surface-container">
                        <div className="flex items-center justify-between mb-4">
                            <h4 className="font-headline-md text-headline-md text-primary">Global Audit Trail</h4>
                            <button 
                                onClick={() => setShowFilterView(!showFilterView)}
                                className={`font-label-md flex items-center gap-1 hover:underline transition-colors ${showFilterView ? 'text-primary' : 'text-secondary'}`}>
                                <span className="material-symbols-outlined text-[18px]">filter_list</span> 
                                {showFilterView ? 'Hide Filters' : 'Filter View'}
                            </button>
                        </div>
                        {/* Tabs */}
                        <div className="flex gap-4 sm:gap-8 overflow-x-auto no-scrollbar">
                            {['All Logs', 'Security', 'Tenant Mutated', 'Auth Events'].map(tab => (
                                <button 
                                    key={tab}
                                    onClick={() => {
                                        setActiveTab(tab);
                                        setCurrentPage(1);
                                    }}
                                    className={`pb-4 border-b-2 font-label-md transition-colors ${activeTab === tab ? 'border-secondary text-secondary' : 'border-transparent text-on-surface-variant hover:text-primary'}`}
                                >
                                    {tab}
                                </button>
                            ))}
                        </div>
                        
                        {/* Filter Bar */}
                        {showFilterView && (
                            <div className="py-4 border-t border-surface-container flex gap-4 animate-in slide-in-from-top-2 duration-200">
                                <div className="flex-1 relative">
                                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[18px]">search</span>
                                    <input 
                                        type="text" 
                                        placeholder="Search by Actor Email, IP Address, or Event Type..."
                                        value={searchQuery}
                                        onChange={(e) => {
                                            setSearchQuery(e.target.value);
                                            setCurrentPage(1);
                                        }}
                                        className="w-full bg-surface-container-low border border-outline-variant rounded-lg pl-10 pr-4 py-2 font-body-md text-on-surface focus:outline-none focus:border-secondary transition-colors"
                                    />
                                </div>
                                <button 
                                    onClick={() => {
                                        setSearchQuery('');
                                    }}
                                    className="px-4 py-2 bg-surface-container border border-outline-variant rounded-lg text-on-surface font-label-md hover:bg-surface-container-high transition-colors"
                                >
                                    Clear
                                </button>
                            </div>
                        )}
                    </div>
                    
                    <div className="overflow-x-auto min-h-[400px]">
                        <table className="w-full min-w-[800px] text-left">
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
                                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold ${log.actorBg} ${log.actorText}`}>
                                                    {log.isCritical ? <span className="material-symbols-outlined text-[16px]">lock_reset</span> : log.actorInitials}
                                                </div>
                                                <span className={`font-body-md text-body-md ${log.isCritical ? 'text-error font-semibold' : ''}`}>{log.actorEmail}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-3 py-1 rounded font-mono-data text-mono-data ${log.eventColor}`}>{log.eventType}</span>
                                        </td>
                                        <td className="px-6 py-4 font-body-md text-body-md">{log.tenantName}</td>
                                        <td className={`px-6 py-4 font-mono-data text-mono-data ${log.isCritical ? 'font-bold' : ''}`}>{log.ipAddress}</td>
                                        <td className="px-6 py-4 text-right">
                                            {log.isCritical ? (
                                                <button onClick={() => setSelectedLog(log)} className="bg-error text-white px-3 py-1 rounded text-[10px] uppercase font-bold hover:scale-105 transition-transform shadow-sm">Investigate</button>
                                            ) : (
                                                <button onClick={() => setSelectedLog(log)} className="p-2 hover:bg-surface-container rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
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
                                    { name: 'us-east-primary', status: 'Healthy', latency: `${nodePings[0]}ms`, type: 'Primary' },
                                    { name: 'eu-west-replica', status: 'Healthy', latency: `${nodePings[1]}ms`, type: 'Replica' },
                                    { name: 'ap-south-replica', status: 'Healthy', latency: `${nodePings[2]}ms`, type: 'Replica' },
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

            {/* Action / Log Details Modal */}
            {selectedLog && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-tertiary-container/40 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-surface-container-lowest rounded-xl shadow-2xl max-w-2xl w-full border border-surface-container overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="px-6 py-4 border-b border-surface-container flex justify-between items-center bg-surface">
                            <h3 className="font-headline-md text-headline-md flex items-center gap-2">
                                <span className={`material-symbols-outlined ${selectedLog.isCritical ? 'text-error' : 'text-primary'}`}>
                                    {selectedLog.isCritical ? 'warning' : 'receipt_long'}
                                </span>
                                Audit Log Details
                            </h3>
                            <button 
                                onClick={() => setSelectedLog(null)}
                                className="text-on-surface-variant hover:text-error transition-colors p-1 rounded-full hover:bg-surface-container-lowest"
                            >
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>
                        <div className="p-6 bg-surface-container-lowest">
                            <div className="space-y-6">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-label-sm text-on-surface-variant uppercase tracking-wide">Event ID</p>
                                        <p className="font-mono-data mt-1">{selectedLog.id}</p>
                                    </div>
                                    <div>
                                        <p className="text-label-sm text-on-surface-variant uppercase tracking-wide">Timestamp</p>
                                        <p className="font-mono-data mt-1">{selectedLog.timestamp}</p>
                                    </div>
                                    <div>
                                        <p className="text-label-sm text-on-surface-variant uppercase tracking-wide">Action Type</p>
                                        <p className="font-mono-data mt-1">{selectedLog.eventType}</p>
                                    </div>
                                    <div>
                                        <p className="text-label-sm text-on-surface-variant uppercase tracking-wide">Category</p>
                                        <p className="font-mono-data mt-1">{selectedLog.eventCategory}</p>
                                    </div>
                                    <div>
                                        <p className="text-label-sm text-on-surface-variant uppercase tracking-wide">Actor Email</p>
                                        <p className="font-mono-data mt-1">{selectedLog.actorEmail}</p>
                                    </div>
                                    <div>
                                        <p className="text-label-sm text-on-surface-variant uppercase tracking-wide">IP Address</p>
                                        <p className="font-mono-data mt-1">{selectedLog.ipAddress}</p>
                                    </div>
                                </div>
                                <div className="p-4 bg-surface-container rounded-lg">
                                    <p className="text-label-sm text-on-surface-variant uppercase tracking-wide mb-2">Raw JSON payload</p>
                                    <pre className="text-[12px] font-mono-data text-on-surface overflow-x-auto">
                                        {JSON.stringify(selectedLog, null, 2)}
                                    </pre>
                                </div>
                            </div>
                        </div>
                        <div className="px-6 py-4 border-t border-surface-container bg-surface-container-low flex justify-between">
                            {selectedLog.isCritical ? (
                                <button className="bg-error text-white px-6 py-2 rounded-lg font-label-md hover:bg-red-700 transition-colors">
                                    Block IP Address
                                </button>
                            ) : <div></div>}
                            <button 
                                onClick={() => setSelectedLog(null)}
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
