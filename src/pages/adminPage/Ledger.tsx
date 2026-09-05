import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import axios from 'axios';
import AdminSidebar from './components/AdminSidebar';
import TopNavigation from '../superAdminPage/components/TopNavigation';

export default function Ledger() {
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');
    const [showFilters, setShowFilters] = useState(false);

    // Settlement Flow States
    const [showSettlementModal, setShowSettlementModal] = useState(false);
    const [isSettling, setIsSettling] = useState(false);
    const [showToast, setShowToast] = useState(false);
    
    // Transaction Details State
    const [selectedTransaction, setSelectedTransaction] = useState<any | null>(null);

    const [transactions, setTransactions] = useState<any[]>([]);
    const [chartData, setChartData] = useState<any[]>([]);
    const [kpis, setKpis] = useState({
        grossVolumeUSD: 0,
        grossVolumeNPR: 0,
        stripeEscrow: 0,
        esewaSettled: 0,
        platformFeesUSD: 0,
        platformFeesNPR: 0
    });
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    const fetchLedgerData = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get('http://localhost:8080/api/v1/admin/ledger/reconciliation', {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = response.data;
            setTransactions(data.transactions || []);
            setChartData(data.chartData || []);
            setKpis({
                grossVolumeUSD: data.grossVolumeUSD || 0,
                grossVolumeNPR: data.grossVolumeNPR || 0,
                stripeEscrow: data.stripeEscrow || 0,
                esewaSettled: data.esewaSettled || 0,
                platformFeesUSD: data.platformFeesUSD || 0,
                platformFeesNPR: data.platformFeesNPR || 0
            });
            setIsLoading(false);
        } catch (err: any) {
            console.error('Error fetching ledger data:', err);
            setError('Failed to fetch ledger data');
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchLedgerData();
    }, []);

    const filteredTransactions = transactions.filter(txn => {
        const matchesSearch = txn.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                              txn.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                              txn.service.toLowerCase().includes(searchTerm.toLowerCase()) ||
                              txn.gateway.toLowerCase().includes(searchTerm.toLowerCase());
                              
        const matchesStatus = statusFilter === 'All' || txn.status === statusFilter;
        
        return matchesSearch && matchesStatus;
    });

    const handleExportCSV = () => {
        const headers = ['TXN ID', 'Date', 'Time', 'Patient', 'Service', 'Gateway', 'Amount', 'Account', 'Status'];
        const csvRows = [headers.join(',')];
        filteredTransactions.forEach(txn => {
            const row = [
                txn.id, 
                `"${txn.date}"`, 
                `"${txn.time}"`, 
                `"${txn.patientName}"`, 
                `"${txn.service}"`, 
                txn.gateway, 
                `"${txn.amount}"`, 
                txn.accountType, 
                txn.status
            ];
            csvRows.push(row.join(','));
        });
        const blob = new Blob([csvRows.join('\n')], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.setAttribute('href', url);
        a.setAttribute('download', 'ledger_transactions.csv');
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    };

    const handleConfirmSettlement = async () => {
        setShowSettlementModal(false);
        setIsSettling(true);
        
        try {
            const token = localStorage.getItem('token');
            await axios.post('http://localhost:8080/api/v1/admin/ledger/settle', {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            await fetchLedgerData(); // Refresh data after settlement
            setIsSettling(false);
            setShowToast(true);
            setTimeout(() => {
                setShowToast(false);
            }, 4000);
        } catch (err: any) {
            console.error('Error running settlement:', err);
            setIsSettling(false);
            alert('Failed to run daily settlement: ' + (err.response?.data?.message || err.message));
        }
    };

    return (
        <div className="superadmin-theme">
            <div className="bg-background text-on-surface font-sans min-h-screen relative">
                <AdminSidebar />
                <TopNavigation />

                <main className="ml-sidebar-width pt-24 pb-gutter px-gutter min-h-screen flex flex-col bg-[#F8FAFC]">
                    <div className="max-w-container-max mx-auto w-full flex-1 flex flex-col animate-fade-in space-y-8 pb-20">
                        {/* BREADCRUMB & HEADER */}
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-6 sm:mb-8 gap-4">
                            <div>
                                <nav className="flex items-center gap-2 text-on-surface-variant mb-2">
                                    <span className="font-label-md text-label-md uppercase tracking-widest cursor-pointer hover:text-primary transition-colors" onClick={() => navigate('/admin/dashboard')}>Workspace</span>
                                    <span className="material-symbols-outlined text-sm">chevron_right</span>
                                    <span className="font-label-md text-label-md uppercase tracking-widest cursor-pointer hover:text-primary transition-colors" onClick={() => navigate('/admin/ledger')}>Ledger</span>
                                    <span className="material-symbols-outlined text-sm">chevron_right</span>
                                    <span className="font-label-md text-label-md uppercase tracking-widest text-secondary font-bold">Reconciliation</span>
                                </nav>
                                <h2 className="text-2xl sm:text-headline-lg font-headline-lg text-primary">Financial Reconciliation</h2>
                            </div>
                            <div className="flex flex-wrap sm:flex-nowrap gap-3 w-full sm:w-auto">
                                <button 
                                    onClick={handleExportCSV}
                                    className="px-4 py-2 border border-outline-variant text-primary font-bold font-label-md text-label-md uppercase rounded hover:bg-surface-container-low transition-colors flex items-center gap-2"
                                >
                                    <span className="material-symbols-outlined text-lg">download</span>
                                    Export CSV/PDF
                                </button>
                                <button 
                                    onClick={() => setShowSettlementModal(true)}
                                    className="px-6 py-2 bg-secondary text-primary font-bold font-label-md text-label-md uppercase rounded hover:brightness-110 transition-all flex items-center gap-2 shadow-sm relative overflow-hidden"
                                >
                                    {isSettling ? (
                                        <span className="material-symbols-outlined text-lg animate-spin">progress_activity</span>
                                    ) : (
                                        <span className="material-symbols-outlined text-lg">sync</span>
                                    )}
                                    {isSettling ? 'Settling...' : 'Run Daily Settlement'}
                                </button>
                            </div>
                        </div>

                        {/* METRIC CARDS */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                            <div className="bg-white p-6 border border-outline-variant rounded shadow-sm hover:border-secondary transition-colors group">
                                <p className="font-label-md text-label-md text-on-surface-variant uppercase mb-2">Gross Volume</p>
                                <div className="flex items-baseline gap-2">
                                    <p className="font-headline-md text-headline-md text-primary">${kpis.grossVolumeUSD.toFixed(2)}</p>
                                    <p className="font-mono-data text-label-md text-on-surface-variant">Rs. {kpis.grossVolumeNPR.toFixed(2)}</p>
                                </div>
                                <div className="mt-4 flex items-center text-green-600 gap-1">
                                    <span className="material-symbols-outlined text-sm">trending_up</span>
                                    <span className="font-mono-data text-label-md">+12.4% vs last week</span>
                                </div>
                            </div>
                            <div className="bg-white p-6 border border-outline-variant rounded shadow-sm hover:border-secondary transition-colors group">
                                <p className="font-label-md text-label-md text-on-surface-variant uppercase mb-2">Stripe Connect Escrow</p>
                                <p className="font-headline-md text-headline-md text-primary">${kpis.stripeEscrow.toFixed(2)}</p>
                                <div className="mt-4 flex items-center text-on-surface-variant gap-2">
                                    <div className="w-full bg-surface-container-low h-1.5 rounded-full overflow-hidden">
                                        <div className="bg-secondary h-full" style={{ width: '65%' }}></div>
                                    </div>
                                    <span className="font-mono-data text-label-md">65%</span>
                                </div>
                            </div>
                            <div className="bg-white p-6 border border-outline-variant rounded shadow-sm hover:border-secondary transition-colors group">
                                <p className="font-label-md text-label-md text-on-surface-variant uppercase mb-2">eSewa Local Settled</p>
                                <p className="font-headline-md text-headline-md text-primary">Rs. {kpis.esewaSettled.toFixed(2)}</p>
                                <div className="mt-4 flex items-center text-on-surface-variant gap-1">
                                    <span className="material-symbols-outlined text-sm">schedule</span>
                                    <span className="font-mono-data text-label-md">Last update: Just now</span>
                                </div>
                            </div>
                            <div className="bg-white p-6 border border-outline-variant rounded shadow-sm hover:border-secondary transition-colors group">
                                <p className="font-label-md text-label-md text-on-surface-variant uppercase mb-2">Platform Fees (2%)</p>
                                <p className="font-headline-md text-headline-md text-error">-${kpis.platformFeesUSD.toFixed(2)} | Rs. {kpis.platformFeesNPR.toFixed(2)}</p>
                                <div className="mt-4 flex items-center text-on-surface-variant gap-1">
                                    <span className="material-symbols-outlined text-sm">info</span>
                                    <span className="font-mono-data text-label-md">Flat 2% rate applied</span>
                                </div>
                            </div>
                        </div>

                        {/* MAIN CHART CARD */}
                        <div className="bg-white border border-outline-variant rounded mb-8 overflow-hidden shadow-sm">
                            <div className="p-6 border-b border-outline-variant flex justify-between items-center bg-surface-container-lowest">
                                <div>
                                    <h3 className="font-headline-md text-headline-md text-primary">Revenue Distribution</h3>
                                    <p className="text-on-surface-variant text-body-md mt-1">Multi-Gateway comparison: Stripe USD vs eSewa NPR (Last 7 Days)</p>
                                </div>
                                <div className="flex gap-4">
                                    <div className="flex items-center gap-2">
                                        <span className="w-3 h-3 rounded-full bg-primary"></span>
                                        <span className="font-label-md text-label-md uppercase text-on-surface-variant">Stripe USD</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="w-3 h-3 rounded-full bg-secondary"></span>
                                        <span className="font-label-md text-label-md uppercase text-on-surface-variant">eSewa NPR</span>
                                    </div>
                                </div>
                            </div>
                            <div className="h-80 w-full p-6">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart
                                        data={chartData}
                                        margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                                        barGap={4}
                                    >
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                                        <XAxis 
                                            dataKey="date" 
                                            axisLine={false} 
                                            tickLine={false} 
                                            tick={{ fontSize: 11, fill: '#64748B', fontFamily: 'monospace' }}
                                            dy={10}
                                        />
                                        <YAxis 
                                            axisLine={false} 
                                            tickLine={false} 
                                            tick={{ fontSize: 10, fill: '#94A3B8', fontFamily: 'monospace' }}
                                            tickFormatter={(val) => val > 0 ? `$${val / 10}k` : '0'}
                                        />
                                        <Tooltip 
                                            cursor={{ fill: '#F8FAFC' }}
                                            contentStyle={{ borderRadius: '8px', border: '1px solid #E2E8F0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', fontWeight: 'bold' }}
                                            formatter={(value: any) => [`$${(Number(value) || 0) / 10}k`, '']}
                                        />
                                        <Bar dataKey="stripe" fill="#0F172A" radius={[4, 4, 0, 0]} barSize={28} name="Stripe USD" />
                                        <Bar dataKey="esewa" fill="#38BDF8" radius={[4, 4, 0, 0]} barSize={28} name="eSewa NPR" />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* DATA TABLE */}
                        <div className="bg-white border border-outline-variant rounded shadow-sm overflow-hidden">
                            <div className="p-4 sm:p-6 border-b border-outline-variant flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                                <h3 className="font-headline-md text-headline-md text-primary">Transaction History</h3>
                                <div className="flex gap-2 relative w-full sm:w-auto">
                                    <input 
                                        type="text"
                                        placeholder="Search transactions..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="pl-8 pr-4 py-1 text-sm border border-outline-variant rounded focus:outline-none focus:border-secondary transition-colors"
                                    />
                                    <span className="material-symbols-outlined text-[16px] absolute left-2 top-1/2 -translate-y-1/2 text-on-surface-variant">search</span>
                                    <button 
                                        onClick={() => setShowFilters(!showFilters)}
                                        className={`p-1.5 rounded transition-colors border flex items-center justify-center ${showFilters || statusFilter !== 'All' ? 'bg-primary text-white border-primary' : 'text-on-surface-variant hover:bg-surface-container border-outline-variant'}`}
                                    >
                                        <span className="material-symbols-outlined text-[18px]">filter_list</span>
                                    </button>

                                    {showFilters && (
                                        <div className="absolute right-0 top-full mt-2 w-48 bg-white border border-outline-variant rounded-lg shadow-xl z-50 p-3 flex flex-col gap-2">
                                            <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Filter by Status</label>
                                            <select 
                                                value={statusFilter}
                                                onChange={(e) => setStatusFilter(e.target.value)}
                                                className="w-full text-sm border border-outline-variant bg-surface-container-lowest rounded p-1.5 focus:outline-none focus:border-secondary cursor-pointer"
                                            >
                                                <option value="All">All Statuses</option>
                                                <option value="Settled">Settled</option>
                                                <option value="In Escrow">In Escrow</option>
                                                <option value="Refunded">Refunded</option>
                                            </select>
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full min-w-[700px] border-collapse">
                                    <thead>
                                        <tr className="bg-surface-container-low text-left">
                                            <th className="px-6 py-4 font-label-md text-label-md uppercase tracking-wider text-on-surface-variant">TXN ID</th>
                                            <th className="px-6 py-4 font-label-md text-label-md uppercase tracking-wider text-on-surface-variant">DATE</th>
                                            <th className="px-6 py-4 font-label-md text-label-md uppercase tracking-wider text-on-surface-variant">PATIENT & SERVICE</th>
                                            <th className="px-6 py-4 font-label-md text-label-md uppercase tracking-wider text-on-surface-variant text-center">GATEWAY</th>
                                            <th className="px-6 py-4 font-label-md text-label-md uppercase tracking-wider text-on-surface-variant text-right">GROSS AMOUNT</th>
                                            <th className="px-6 py-4 font-label-md text-label-md uppercase tracking-wider text-on-surface-variant">STATUS</th>
                                            <th className="px-6 py-4"></th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-outline-variant">
                                        {filteredTransactions.length === 0 ? (
                                            <tr>
                                                <td colSpan={7} className="px-6 py-12 text-center text-on-surface-variant">
                                                    No transactions found matching your search.
                                                </td>
                                            </tr>
                                        ) : (
                                            filteredTransactions.map((txn, index) => (
                                            <tr key={index} className="hover:bg-surface-container-lowest transition-colors">
                                                <td className="px-6 py-4 font-mono-data text-body-md text-primary font-bold">{txn.id}</td>
                                                <td className="px-6 py-4">
                                                    <p className="text-body-md text-primary">{txn.date}</p>
                                                    <p className="text-label-md text-on-surface-variant">{txn.time}</p>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className={`w-8 h-8 rounded flex items-center justify-center text-[10px] font-bold ${txn.patientColor}`}>
                                                            {txn.patientInitials}
                                                        </div>
                                                        <div>
                                                            <p className="text-body-md font-bold text-primary">{txn.patientName}</p>
                                                            <p className="text-label-md text-on-surface-variant">{txn.service}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    <span className={`px-3 py-1 text-[10px] font-bold rounded uppercase tracking-tighter ${txn.gatewayColor}`}>
                                                        {txn.gateway}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <p className="text-body-md font-bold text-primary">{txn.amount}</p>
                                                    <p className="text-[10px] text-on-surface-variant uppercase font-mono-data">{txn.accountType}</p>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className={`flex items-center gap-1.5 px-2 py-1 rounded w-fit border ${txn.statusColor}`}>
                                                        <span className={`w-1.5 h-1.5 rounded-full ${txn.statusDot}`}></span>
                                                        <span className="font-mono-data text-[11px] font-bold uppercase">{txn.status}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <button 
                                                        onClick={() => setSelectedTransaction(txn)}
                                                        className="text-on-surface-variant hover:text-primary transition-colors flex items-center justify-center p-1 rounded-full hover:bg-surface-container"
                                                    >
                                                        <span className="material-symbols-outlined">chevron_right</span>
                                                    </button>
                                                </td>
                                            </tr>
                                        )))}
                                    </tbody>
                                </table>
                            </div>
                            <div className="p-4 border-t border-outline-variant flex justify-between items-center bg-surface-container-lowest">
                                <p className="text-label-md text-on-surface-variant">Showing {filteredTransactions.length} of {transactions.length} transactions</p>
                                <div className="flex gap-2">
                                    <button className="px-3 py-1 border border-outline-variant rounded hover:bg-surface-container-low transition-colors disabled:opacity-50" disabled>Previous</button>
                                    <button className="px-3 py-1 border border-outline-variant rounded hover:bg-surface-container-low transition-colors">Next</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </main>

                {/* SETTLEMENT MODAL */}
                {showSettlementModal && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in" onClick={() => !isSettling && setShowSettlementModal(false)}>
                        <div className="bg-surface-container-lowest p-8 rounded-xl max-w-md w-full shadow-2xl space-y-6" onClick={e => e.stopPropagation()}>
                            <h3 className="font-headline-md text-headline-md text-primary">Confirm Daily Settlement</h3>
                            <p className="text-body-md text-on-surface-variant">
                                You are about to settle {transactions.filter(t => t.status === 'In Escrow' || t.status === 'Pending').length} transactions.
                            </p>
                            <div className="flex justify-end gap-3 pt-4 border-t border-outline-variant">
                                <button 
                                    onClick={() => setShowSettlementModal(false)}
                                    disabled={isSettling}
                                    className="px-5 py-2 rounded-lg font-bold text-on-surface-variant hover:bg-surface-container transition-colors disabled:opacity-50"
                                >
                                    Cancel
                                </button>
                                <button 
                                    onClick={handleConfirmSettlement}
                                    disabled={isSettling}
                                    className="px-5 py-2 rounded-lg font-bold bg-secondary text-primary shadow hover:brightness-110 transition-all disabled:opacity-50"
                                >
                                    Confirm Settlement
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* TRANSACTION DETAILS MODAL */}
                {selectedTransaction && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in" onClick={() => setSelectedTransaction(null)}>
                        <div className="bg-surface-container-lowest p-8 rounded-xl max-w-lg w-full shadow-2xl space-y-6" onClick={(e) => e.stopPropagation()}>
                            <div className="flex justify-between items-start border-b border-outline-variant pb-4">
                                <div>
                                    <h3 className="font-headline-md text-headline-md text-primary">Transaction Details</h3>
                                    <p className="font-mono-data text-body-md text-on-surface-variant mt-1">{selectedTransaction.id}</p>
                                </div>
                                <button onClick={() => setSelectedTransaction(null)} className="text-on-surface-variant hover:text-primary transition-colors">
                                    <span className="material-symbols-outlined">close</span>
                                </button>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-y-6 gap-x-8">
                                <div>
                                    <p className="text-label-md text-on-surface-variant uppercase mb-1">Date & Time</p>
                                    <p className="text-body-md text-primary font-bold">{selectedTransaction.date}</p>
                                    <p className="text-label-md text-on-surface-variant">{selectedTransaction.time}</p>
                                </div>
                                <div>
                                    <p className="text-label-md text-on-surface-variant uppercase mb-1">Status</p>
                                    <div className={`flex items-center gap-1.5 px-2 py-1 rounded w-fit border ${selectedTransaction.statusColor}`}>
                                        <span className={`w-1.5 h-1.5 rounded-full ${selectedTransaction.statusDot}`}></span>
                                        <span className="font-mono-data text-[11px] font-bold uppercase">{selectedTransaction.status}</span>
                                    </div>
                                </div>
                                <div>
                                    <p className="text-label-md text-on-surface-variant uppercase mb-1">Patient</p>
                                    <div className="flex items-center gap-2">
                                        <div className={`w-6 h-6 rounded flex items-center justify-center text-[10px] font-bold ${selectedTransaction.patientColor}`}>
                                            {selectedTransaction.patientInitials}
                                        </div>
                                        <p className="text-body-md font-bold text-primary">{selectedTransaction.patientName}</p>
                                    </div>
                                </div>
                                <div>
                                    <p className="text-label-md text-on-surface-variant uppercase mb-1">Service</p>
                                    <p className="text-body-md text-primary">{selectedTransaction.service}</p>
                                </div>
                                <div>
                                    <p className="text-label-md text-on-surface-variant uppercase mb-1">Payment Gateway</p>
                                    <span className={`px-2 py-0.5 text-[10px] font-bold rounded uppercase tracking-tighter ${selectedTransaction.gatewayColor}`}>
                                        {selectedTransaction.gateway}
                                    </span>
                                </div>
                                <div>
                                    <p className="text-label-md text-on-surface-variant uppercase mb-1">Account Type</p>
                                    <p className="font-mono-data text-body-md text-primary">{selectedTransaction.accountType}</p>
                                </div>
                            </div>

                            <div className="bg-surface-container-low p-4 rounded border border-outline-variant mt-6 space-y-2">
                                <div className="flex justify-between items-center text-body-md text-on-surface-variant">
                                    <span>Subtotal</span>
                                    <span className="font-mono-data">{selectedTransaction.amount}</span>
                                </div>
                                <div className="flex justify-between items-center text-body-md text-error">
                                    <span>Platform Fee (2%)</span>
                                    <span className="font-mono-data">-{selectedTransaction.amount.replace(/[^0-9.]/g, '') * 0.02 > 0 ? (selectedTransaction.amount.includes('$') ? '$' : 'Rs. ') + (parseFloat(selectedTransaction.amount.replace(/[^0-9.]/g, '')) * 0.02).toFixed(2) : '0.00'}</span>
                                </div>
                                <div className="border-t border-outline-variant pt-2 mt-2 flex justify-between items-center text-headline-sm text-primary font-bold">
                                    <span>Net Amount</span>
                                    <span className="font-mono-data">
                                        {selectedTransaction.amount.includes('$') ? '$' : 'Rs. '}{(parseFloat(selectedTransaction.amount.replace(/[^0-9.]/g, '')) * 0.98).toFixed(2)}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* LOADING OVERLAY */}
                {isSettling && (
                    <div className="fixed inset-0 z-[90] bg-black/20 backdrop-blur-[2px] cursor-not-allowed"></div>
                )}

                {/* SUCCESS TOAST */}
                {showToast && (
                    <div className="fixed top-8 left-1/2 -translate-x-1/2 z-[110] bg-green-50 border border-green-200 text-green-800 px-6 py-4 rounded-lg shadow-xl flex items-center gap-4 animate-fade-in-down">
                        <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                            <span className="material-symbols-outlined text-green-600">check_circle</span>
                        </div>
                        <div>
                            <p className="font-bold text-sm">Daily Settlement Complete</p>
                            <p className="text-xs opacity-90">Ledgers locked and provider balances updated.</p>
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
}
