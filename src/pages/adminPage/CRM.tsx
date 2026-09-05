import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminSidebar from './components/AdminSidebar';
import TopNavigation from '../superAdminPage/components/TopNavigation';

export interface Patient {
    id: string;
    initials: string;
    bgColor: string;
    textColor: string;
    name: string;
    phone: string;
    phoneType: string;
    lastVisit: string;
    provider: string;
    balance: string;
    balanceStatus: string;
    status: string;
    email: string;
    age: number | null;
    bloodGroup: string;
    allergies: string;
    patientSince: string;
    weight: string;
    heartRate: string;
    transactions: any[];
    lifetimeBilledUSD: string;
    lifetimeBilledNPR: string;
    outstandingBalance: string;
}

export default function CRM() {
    const navigate = useNavigate();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [patients, setPatients] = useState<Patient[]>([]);
    const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [demoFilter, setDemoFilter] = useState('All Demographics');
    const [financialFilter, setFinancialFilter] = useState('Financial Status: All');

    React.useEffect(() => {
        const fetchPatients = async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await fetch('http://localhost:8080/api/v1/admin/patients', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                const data = await response.json();
                if (response.ok) {
                    setPatients(data);
                }
            } catch (error) {
                console.error("Error fetching patients:", error);
            }
        };
        fetchPatients();
    }, []);

    const selectedPatient = selectedPatientId ? patients.find(p => p.id === selectedPatientId) : null;

    const filteredPatients = patients.filter(p => {
        const searchLower = searchTerm.toLowerCase();
        const matchesSearch = p.name.toLowerCase().includes(searchLower) || p.phone.toLowerCase().includes(searchLower) || p.id.toLowerCase().includes(searchLower);
        
        let matchesDemo = true;
        if (demoFilter === 'Pediatric') matchesDemo = p.age !== null && p.age < 18;
        else if (demoFilter === 'Adult') matchesDemo = p.age !== null && p.age >= 18 && p.age < 65;
        else if (demoFilter === 'Geriatric') matchesDemo = p.age !== null && p.age >= 65;
        
        let matchesFin = true;
        const balValue = parseFloat(p.balance.replace(/[^0-9.]/g, ''));
        const hasBalance = balValue > 0;
        if (financialFilter === 'Payment Pending' || financialFilter === 'Overdue') matchesFin = hasBalance;
        else if (financialFilter === 'Cleared') matchesFin = !hasBalance;
        
        return matchesSearch && matchesDemo && matchesFin;
    });

    const handleExportCSV = () => {
        const headers = ['ID', 'Name', 'Phone', 'Email', 'Age', 'Blood Group', 'Last Visit', 'Provider', 'Balance', 'Status'];
        const csvRows = [headers.join(',')];
        filteredPatients.forEach(p => {
            const row = [p.id, `"${p.name}"`, `"${p.phone}"`, `"${p.email}"`, p.age, p.bloodGroup, `"${p.lastVisit}"`, `"${p.provider}"`, `"${p.balance}"`, p.status];
            csvRows.push(row.join(','));
        });
        const blob = new Blob([csvRows.join('\n')], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.setAttribute('href', url);
        a.setAttribute('download', 'patient_directory.csv');
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    };

    if (selectedPatient) {
        return (
            <div className="superadmin-theme">
                <div className="bg-background text-on-surface font-sans min-h-screen relative">
                    <AdminSidebar />
                    <TopNavigation />
                    <main className="ml-sidebar-width pt-24 pb-gutter px-gutter min-h-screen flex flex-col bg-[#F8FAFC]">
                        <div className="max-w-container-max mx-auto w-full flex-1 flex flex-col animate-fade-in space-y-8 pb-20">
                        {/* BREADCRUMB & HEADER */}
                        <section>
                            <nav className="flex items-center gap-2 text-on-surface-variant text-xs mb-2">
                                <span className="cursor-pointer hover:text-primary transition-colors" onClick={() => navigate('/admin/dashboard')}>Workspace</span>
                                <span className="material-symbols-outlined text-[14px]">chevron_right</span>
                                <span className="cursor-pointer hover:text-primary transition-colors" onClick={() => setSelectedPatientId(null)}>CRM</span>
                                <span className="material-symbols-outlined text-[14px]">chevron_right</span>
                                <span className="text-primary font-semibold">Patient Directory</span>
                            </nav>
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
                                <div className="flex items-baseline gap-4">
                                    <h2 className="text-2xl sm:text-headline-lg font-headline-lg text-on-background">{selectedPatient.name}</h2>
                                    <span className="font-mono-data text-mono-data text-on-surface-variant">#{selectedPatient.id}</span>
                                </div>
                                <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
                                    <button onClick={() => setSelectedPatientId(null)} className="flex items-center gap-2 px-5 py-2.5 border border-outline rounded-lg font-body-md text-body-md hover:bg-surface-container-low transition-colors cursor-pointer">
                                        <span className="material-symbols-outlined text-[20px]">arrow_back</span>
                                        Back to Directory
                                    </button>
                                    <input 
                                        type="file" 
                                        ref={fileInputRef} 
                                        className="hidden" 
                                        onChange={(e) => {
                                            if (e.target.files && e.target.files.length > 0) {
                                                alert(`Document "${e.target.files[0].name}" uploaded successfully!`);
                                            }
                                        }}
                                    />
                                    <button onClick={() => fileInputRef.current?.click()} className="flex items-center gap-2 px-5 py-2.5 border border-outline rounded-lg font-body-md text-body-md hover:bg-surface-container-low transition-colors">
                                        <span className="material-symbols-outlined text-[20px]">upload_file</span>
                                        Upload Document
                                    </button>
                                    <button className="flex items-center gap-2 px-5 py-2.5 bg-secondary-container text-on-secondary-fixed font-bold rounded-lg font-body-md text-body-md hover:brightness-110 transition-all shadow-sm">
                                        <span className="material-symbols-outlined text-[20px]">add_circle</span>
                                        Book Follow-Up
                                    </button>
                                </div>
                            </div>
                        </section>

                        {/* 3-COLUMN DATA GRID */}
                        <div className="grid grid-cols-12 gap-gutter items-start">
                            {/* COLUMN 1: PROFILE & METRICS */}
                            <div className="col-span-12 lg:col-span-3 space-y-gutter">
                                {/* Profile Card */}
                                <div className="bg-surface-container-lowest border border-outline p-6 rounded-xl space-y-6">
                                    <div className="flex flex-col items-center text-center">
                                        <div className="w-32 h-32 rounded-full ring-4 ring-surface-container-low p-1 mb-4 flex items-center justify-center bg-primary-container text-white text-3xl font-bold">
                                            {selectedPatient.initials}
                                        </div>
                                        <h3 className="font-headline-md text-headline-md">{selectedPatient.name}</h3>
                                        <p className="text-on-surface-variant font-body-md">Patient since {selectedPatient.patientSince}</p>
                                        <div className="mt-4 flex gap-2 flex-wrap justify-center">
                                            <div className="flex gap-2">
                                                {selectedPatient.age !== null ? (
                                                    <span className="px-2 py-0.5 rounded-full bg-surface-container-high text-[11px] font-bold text-on-surface-variant uppercase tracking-wider">{selectedPatient.age} y/o</span>
                                                ) : (
                                                    <span className="px-2 py-0.5 rounded-full bg-surface-container-high text-[11px] font-bold text-on-surface-variant uppercase tracking-wider">N/A</span>
                                                )}
                                                <span className="px-2 py-0.5 rounded-full bg-surface-container-high text-[11px] font-bold text-on-surface-variant uppercase tracking-wider">Blood {selectedPatient.bloodGroup}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {selectedPatient.allergies !== 'None' && (
                                        <div className="p-4 bg-error-container rounded-lg border border-error/20">
                                            <div className="flex items-center gap-2 text-error mb-1">
                                                <span className="material-symbols-outlined text-[18px]">warning</span>
                                                <span className="font-label-md text-label-md uppercase tracking-widest">Allergies Warning</span>
                                            </div>
                                            <p className="font-mono-data text-mono-data text-on-error-container">{selectedPatient.allergies}</p>
                                        </div>
                                    )}

                                    <div className="space-y-4 pt-4 border-t border-outline">
                                        <div className="flex items-center gap-3">
                                            <span className="material-symbols-outlined text-on-surface-variant">mail</span>
                                            <span className="font-body-md text-body-md">{selectedPatient.email}</span>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <span className="material-symbols-outlined text-on-surface-variant">call</span>
                                            <span className="font-body-md text-body-md">{selectedPatient.phone}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Metrics Card */}
                                <div className="bg-surface-container-lowest border border-outline p-6 rounded-xl">
                                    <h4 className="font-label-md text-label-md uppercase tracking-widest text-on-surface-variant mb-6">Recent Metrics</h4>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="p-4 bg-surface-container-low rounded-lg">
                                            <p className="text-[10px] uppercase font-bold text-on-surface-variant mb-1">Heart Rate</p>
                                            <div className="flex items-baseline gap-1">
                                                <span className="font-headline-md text-headline-md text-on-background">{selectedPatient.heartRate}</span>
                                                <span className="text-[11px] text-on-surface-variant">BPM</span>
                                            </div>
                                        </div>
                                        <div className="p-4 bg-surface-container-low rounded-lg">
                                            <p className="text-[10px] uppercase font-bold text-on-surface-variant mb-1">Weight</p>
                                            <div className="flex items-baseline gap-1">
                                                <span className="font-headline-md text-headline-md text-on-background">{selectedPatient.weight}</span>
                                                <span className="text-[11px] text-on-surface-variant">LBS</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* COLUMN 2: CLINICAL TIMELINE */}
                            <div className="col-span-12 lg:col-span-5 space-y-gutter">
                                <div className="bg-surface-container-lowest border border-outline rounded-xl overflow-hidden">
                                    <div className="px-6 py-4 border-b border-outline flex justify-between items-center">
                                        <h4 className="font-label-md text-label-md uppercase tracking-widest text-on-surface-variant">Clinical Timeline</h4>
                                        <span className="material-symbols-outlined text-on-surface-variant cursor-pointer hover:text-primary transition-colors">history</span>
                                    </div>
                                    <div className="p-6 space-y-8 relative">
                                        {/* Timeline Line */}
                                        <div className="absolute left-[39px] top-8 bottom-8 w-[1px] bg-outline-variant"></div>

                                        {/* Entry 1 */}
                                        <div className="relative pl-12">
                                            <div className="absolute left-[-5px] top-1 w-6 h-6 rounded-full bg-secondary-container flex items-center justify-center ring-4 ring-white">
                                                <span className="material-symbols-outlined text-[14px] text-on-secondary-fixed">stethoscope</span>
                                            </div>
                                            <div className="flex justify-between items-start mb-2">
                                                <div>
                                                    <h5 className="font-headline-md text-[16px] leading-tight">Routine Checkup & Consultation</h5>
                                                    <p className="text-on-surface-variant text-body-md">Primary Physician: <span className="font-semibold text-on-background">{selectedPatient.provider}</span></p>
                                                </div>
                                                <span className="font-mono-data text-[11px] text-on-surface-variant bg-surface-container-low px-2 py-1 rounded uppercase">{selectedPatient.lastVisit}</span>
                                            </div>

                                            {/* Locked Note */}
                                            <div className="relative bg-surface-container-low rounded-lg p-6 border border-outline border-dashed group overflow-hidden mt-4">
                                                <div className="filter blur-[4px] opacity-40 font-body-md leading-relaxed select-none">
                                                    The patient presents with mild hypertension and reports intermittent headaches... further testing required for cardiovascular baseline. Prescription issued for...
                                                </div>
                                                <div className="absolute inset-0 flex flex-col items-center justify-center bg-surface-container-low/60 backdrop-blur-[2px] transition-all group-hover:backdrop-blur-none">
                                                    <span className="material-symbols-outlined text-on-surface-variant mb-2">lock</span>
                                                    <p className="text-on-surface-variant font-label-md uppercase tracking-wider text-[11px]">Unlock Clinical Notes</p>
                                                    <p className="text-[10px] text-on-surface-variant/70 mt-1">Doctor Access Required</p>
                                                </div>
                                            </div>

                                            {/* Attachments */}
                                            <div className="flex gap-3 mt-4">
                                                <div className="flex items-center gap-3 p-2 border border-outline rounded-lg bg-surface hover:border-secondary-fixed cursor-pointer transition-colors group w-1/2">
                                                    <div className="w-10 h-10 rounded bg-red-50 flex items-center justify-center text-red-600">
                                                        <span className="material-symbols-outlined">picture_as_pdf</span>
                                                    </div>
                                                    <div className="overflow-hidden">
                                                        <p className="text-body-md font-semibold truncate">Lab_Results.pdf</p>
                                                        <p className="text-[10px] text-on-surface-variant">2.4 MB • Complete</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-3 p-2 border border-outline rounded-lg bg-surface hover:border-secondary-fixed cursor-pointer transition-colors group w-1/2">
                                                    <div className="w-10 h-10 rounded bg-blue-50 flex items-center justify-center text-blue-600">
                                                        <span className="material-symbols-outlined">image</span>
                                                    </div>
                                                    <div className="overflow-hidden">
                                                        <p className="text-body-md font-semibold truncate">Dental_XRay.jpg</p>
                                                        <p className="text-[10px] text-on-surface-variant">4.1 MB • Raw</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Entry 2 (Small) */}
                                        <div className="relative pl-12 opacity-60">
                                            <div className="absolute left-[-5px] top-1 w-6 h-6 rounded-full bg-surface-container-high flex items-center justify-center ring-4 ring-white">
                                                <span className="material-symbols-outlined text-[14px] text-on-surface-variant">vaccines</span>
                                            </div>
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <h5 className="font-headline-md text-[16px] leading-tight">Annual Flu Vaccination</h5>
                                                    <p className="text-on-surface-variant text-body-md">Nurse: <span className="font-semibold">Sarah Jenkins</span></p>
                                                </div>
                                                <span className="font-mono-data text-[11px] text-on-surface-variant">SEP 12, 2025</span>
                                            </div>
                                        </div>

                                    </div>
                                </div>
                            </div>

                            {/* COLUMN 3: FINANCIAL LEDGER */}
                            <div className="col-span-12 lg:col-span-4 space-y-gutter">
                                <div className="bg-primary-container text-white rounded-xl p-6 shadow-xl relative overflow-hidden">
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-secondary-fixed opacity-10 blur-3xl -mr-16 -mt-16"></div>
                                    <h4 className="font-label-md text-label-md uppercase tracking-widest text-on-tertiary-container mb-6">Patient Financials</h4>
                                    
                                    <div className="space-y-6">
                                        <div>
                                            <p className="text-[11px] font-bold text-on-tertiary-container uppercase tracking-tighter mb-1">Lifetime Billed</p>
                                            <div className="flex items-baseline gap-4">
                                                <span className="font-headline-lg text-headline-lg">{selectedPatient.lifetimeBilledUSD}</span>
                                                <span className="text-on-tertiary-container text-sm">/</span>
                                                <span className="text-on-tertiary-container font-mono-data">{selectedPatient.lifetimeBilledNPR}</span>
                                            </div>
                                        </div>

                                        <div className="p-4 bg-white/5 rounded-lg border border-white/10">
                                            <p className="text-[11px] font-bold text-secondary-fixed uppercase tracking-tighter mb-1">Outstanding Balance</p>
                                            <div className="flex items-center justify-between">
                                                <span className="font-headline-md text-headline-md text-white">{selectedPatient.outstandingBalance}</span>
                                                {selectedPatient.outstandingBalance !== '$0.00' && selectedPatient.outstandingBalance !== 'Rs. 0' && (
                                                    <span className="bg-on-tertiary-fixed-variant text-secondary-fixed px-3 py-1 rounded text-[10px] font-bold uppercase tracking-widest">Pending</span>
                                                )}
                                                {(selectedPatient.outstandingBalance === '$0.00' || selectedPatient.outstandingBalance === 'Rs. 0') && (
                                                    <span className="bg-green-500/20 text-green-400 px-3 py-1 rounded text-[10px] font-bold uppercase tracking-widest">Cleared</span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className="mt-8 space-y-3">
                                        <button 
                                            onClick={() => alert(`Invoice link generated for ${selectedPatient.name}`)}
                                            className="w-full py-3 bg-secondary-fixed text-primary-container font-bold rounded-lg hover:brightness-110 transition-all flex items-center justify-center gap-2"
                                        >
                                            <span className="material-symbols-outlined">payments</span>
                                            Generate Invoice Link
                                        </button>
                                    </div>
                                </div>

                                <div className="bg-surface-container-lowest border border-outline rounded-xl overflow-hidden">
                                    <div className="px-6 py-4 border-b border-outline">
                                        <h4 className="font-label-md text-label-md uppercase tracking-widest text-on-surface-variant">Transaction History</h4>
                                    </div>
                                    <div className="p-6 space-y-4">
                                        {selectedPatient.transactions.length === 0 ? (
                                            <p className="text-sm text-on-surface-variant text-center py-4">No recent transactions</p>
                                        ) : (
                                            selectedPatient.transactions.map((tx, i) => (
                                                <div key={i} className="flex items-center justify-between group">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-10 h-10 rounded-lg bg-surface-container-low flex items-center justify-center">
                                                            <span className="material-symbols-outlined text-on-surface-variant">{tx.icon}</span>
                                                        </div>
                                                        <div>
                                                            <p className="font-body-md font-bold">{tx.method}</p>
                                                            <p className="text-[11px] text-on-surface-variant">Ref: {tx.id}</p>
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="font-mono-data text-on-background">{tx.amount}</p>
                                                        <span className="text-[9px] font-bold text-green-600 uppercase tracking-widest">{tx.status}</span>
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                    <a href="#" className="block w-full py-3 text-center text-label-md text-on-surface-variant bg-surface-container-low hover:text-primary transition-colors border-t border-outline">
                                        View Full Ledger Details
                                    </a>
                                </div>
                            </div>
                        </div>
                        </div>
                    </main>
                </div>
            </div>
        );
    }

    return (
        <div className="superadmin-theme">
            <div className="bg-background text-on-surface font-sans min-h-screen relative">
                <AdminSidebar />
                <TopNavigation />

                <main className="ml-sidebar-width pt-24 pb-gutter px-gutter min-h-screen flex flex-col bg-[#F8FAFC]">
                    {/* Inner Area Canvas */}
                    <div className="flex flex-col gap-6 max-w-container-max mx-auto w-full animate-fade-in">
                    {/* Workspace Header */}
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
                        <div>
                            <nav className="flex items-center gap-2 text-on-surface-variant text-xs mb-1">
                                <span className="cursor-pointer hover:text-primary transition-colors" onClick={() => navigate('/admin/dashboard')}>Workspace</span>
                                <span className="material-symbols-outlined text-[14px]">chevron_right</span>
                                <span className="text-primary font-semibold">CRM</span>
                            </nav>
                            <h2 className="text-2xl sm:text-headline-lg font-headline-lg text-primary tracking-tight">Patient Directory</h2>
                        </div>
                        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
                            <button onClick={handleExportCSV} className="flex-1 sm:flex-initial justify-center px-4 py-2 border border-outline-variant rounded bg-white text-on-surface font-semibold text-sm hover:bg-surface-container-low transition-all flex items-center gap-2 cursor-pointer">
                                <span className="material-symbols-outlined text-sm">download</span>
                                Export CSV
                            </button>
                            <button className="flex-1 sm:flex-initial justify-center px-4 py-2 bg-[#0F172A] text-white rounded font-semibold text-sm hover:bg-[#1E293B] transition-all flex items-center gap-2 cursor-pointer">
                                <span className="material-symbols-outlined text-sm">add</span>
                                Add New Patient
                            </button>
                        </div>
                    </div>

                    {/* Master Filter Engine */}
                    <div className="bg-white border border-outline-variant p-2 flex flex-col lg:flex-row gap-2 rounded shadow-sm">
                        <div className="relative flex-1">
                            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-lg">search</span>
                            <input 
                                type="text" 
                                placeholder="Search by Patient Name, Phone, or ID..." 
                                className="w-full border-none bg-surface-container-lowest pl-10 pr-4 py-2 focus:ring-0 text-body-md text-on-surface outline-none" 
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <div className="flex gap-2">
                            <select 
                                className="border-none bg-surface-container-low rounded px-4 py-2 text-sm font-semibold focus:ring-0 cursor-pointer min-w-[180px] outline-none"
                                value={demoFilter}
                                onChange={(e) => setDemoFilter(e.target.value)}
                            >
                                <option>All Demographics</option>
                                <option>Pediatric</option>
                                <option>Adult</option>
                                <option>Geriatric</option>
                            </select>
                            <select 
                                className="border-none bg-surface-container-low rounded px-4 py-2 text-sm font-semibold focus:ring-0 cursor-pointer min-w-[200px] outline-none"
                                value={financialFilter}
                                onChange={(e) => setFinancialFilter(e.target.value)}
                            >
                                <option>Financial Status: All</option>
                                <option>Payment Pending</option>
                                <option>Overdue</option>
                                <option>Cleared</option>
                            </select>
                            <button className="p-2 bg-surface-container-high rounded hover:bg-surface-container-highest transition-colors">
                                <span className="material-symbols-outlined">tune</span>
                            </button>
                        </div>
                    </div>

                    {/* Master Data Table */}
                    <div className="bg-white border border-outline-variant overflow-x-auto custom-scrollbar">
                        <table className="w-full min-w-[800px] text-left border-collapse">
                            <thead>
                                <tr className="bg-surface-container-low border-b border-outline-variant">
                                    <th className="px-6 py-4 font-label-md text-label-md uppercase text-on-surface-variant tracking-wider">Patient Details</th>
                                    <th className="px-6 py-4 font-label-md text-label-md uppercase text-on-surface-variant tracking-wider">Contact Info</th>
                                    <th className="px-6 py-4 font-label-md text-label-md uppercase text-on-surface-variant tracking-wider">Last Visit & Provider</th>
                                    <th className="px-6 py-4 font-label-md text-label-md uppercase text-on-surface-variant tracking-wider text-right">Outstanding Balance</th>
                                    <th className="px-6 py-4 font-label-md text-label-md uppercase text-on-surface-variant tracking-wider">Status</th>
                                    <th className="px-6 py-4 font-label-md text-label-md uppercase text-on-surface-variant tracking-wider text-center">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-surface-container-low">
                                {filteredPatients.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-12 text-center text-on-surface-variant">
                                            No patients found matching the current filters.
                                        </td>
                                    </tr>
                                ) : (
                                    filteredPatients.map((patient) => (
                                        <tr key={patient.id} className="hover:bg-surface-bright transition-colors group">
                                            <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className={`w-9 h-9 rounded ${patient.bgColor} flex items-center justify-center ${patient.textColor} font-bold text-xs`}>
                                                    {patient.initials}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-primary">{patient.name}</p>
                                                    {patient.age !== null ? (
                                                        <p className="text-on-surface text-[15px] font-medium">{patient.age} yrs • {patient.bloodGroup}</p>
                                                    ) : (
                                                        <p className="text-on-surface text-[15px] font-medium">N/A • {patient.bloodGroup}</p>
                                                    )}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="text-body-md">{patient.phone}</p>
                                            <p className="text-xs text-on-surface-variant">{patient.phoneType}</p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="text-body-md font-medium">{patient.lastVisit}</p>
                                            <p className="text-xs text-secondary font-semibold">{patient.provider}</p>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <p className={`text-body-md ${patient.balance !== '$0.00' && patient.balance !== 'Rs. 0' ? 'text-error font-bold text-[15px] drop-shadow-[0_0_8px_rgba(186,26,26,0.4)]' : 'text-on-surface-variant'}`}>{patient.balance}</p>
                                            <p className={`text-[10px] font-bold uppercase ${patient.balance !== '$0.00' && patient.balance !== 'Rs. 0' ? 'text-error' : 'text-on-tertiary-container'}`}>{patient.balanceStatus}</p>
                                        </td>
                                        <td className="px-6 py-4">
                                            {patient.status === 'Active' ? (
                                                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-green-50 text-green-700 border border-green-100 text-[11px] font-bold uppercase tracking-wide">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                                                    Active
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-surface-container-high text-on-surface-variant border border-outline-variant text-[11px] font-bold uppercase tracking-wide">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-outline"></span>
                                                    Inactive
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <button 
                                                onClick={() => setSelectedPatientId(patient.id)}
                                                className="px-3 py-1.5 text-xs font-bold border border-outline-variant rounded hover:bg-primary hover:text-white transition-all"
                                            >
                                                View Details
                                            </button>
                                        </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    <div className="flex justify-between items-center mt-2 mb-4">
                        <p className="text-xs text-on-surface-variant font-mono-data">Showing <span className="font-bold text-primary">{filteredPatients.length}</span> of <span className="font-bold text-primary">{patients.length}</span> active medical records</p>
                        <div className="flex items-center gap-1">
                            <button className="p-2 border border-outline-variant bg-white rounded text-on-surface-variant hover:bg-surface-container-low disabled:opacity-30" disabled>
                                <span className="material-symbols-outlined text-sm">chevron_left</span>
                            </button>
                            <div className="flex items-center gap-1 px-2">
                                <button className="w-8 h-8 flex items-center justify-center rounded bg-primary text-white text-xs font-bold">1</button>
                                <button className="w-8 h-8 flex items-center justify-center rounded hover:bg-surface-container-low text-xs font-bold text-on-surface">2</button>
                                <button className="w-8 h-8 flex items-center justify-center rounded hover:bg-surface-container-low text-xs font-bold text-on-surface">3</button>
                                <span className="px-1 text-on-surface-variant">...</span>
                                <button className="w-8 h-8 flex items-center justify-center rounded hover:bg-surface-container-low text-xs font-bold text-on-surface">12</button>
                            </div>
                            <button className="p-2 border border-outline-variant bg-white rounded text-on-surface-variant hover:bg-surface-container-low">
                                <span className="material-symbols-outlined text-sm">chevron_right</span>
                            </button>
                        </div>
                    </div>
                    </div>
                </main>
            </div>
        </div>
    );
}
