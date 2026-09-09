import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import AdminSidebar from './components/AdminSidebar';
import TopNavigation from '../superAdminPage/components/TopNavigation';
import { useOrganizationTerms } from '../../utils/organizationTerms';

export interface CRMAppointmentItem {
    id: number;
    serviceName: string;
    appointmentDate: string;
    appointmentTime: string;
    appointmentStatus: string;
    providerName: string;
    notes: string;
    price: number;
}

export interface PatientDocument {
    id: string;
    name: string;
    size: string;
    uploadDate: string;
    type: string;
}

export interface Patient {
    id: string;
    initials: string;
    bgColor: string;
    textColor: string;
    name: string;
    profilePicture?: string;
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
    timeline?: CRMAppointmentItem[];
}

export default function CRM() {
    const terms = useOrganizationTerms();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [patients, setPatients] = useState<Patient[]>([]);
    const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState(() => searchParams.get('search') || '');
    const [demoFilter, setDemoFilter] = useState('All Demographics');
    const [financialFilter, setFinancialFilter] = useState('Financial Status: All');

    useEffect(() => {
        const s = searchParams.get('search');
        if (s !== null) {
            setSearchTerm(s);
        }
    }, [searchParams]);

    // Document Management & Feedback
    const [patientDocs, setPatientDocs] = useState<{ [patientId: string]: PatientDocument[] }>(() => {
        try {
            const saved = localStorage.getItem('crm_patient_documents');
            return saved ? JSON.parse(saved) : {};
        } catch {
            return {};
        }
    });
    const [showToast, setShowToast] = useState(false);
    const [toastMsg, setToastMsg] = useState('');

    const orgType = (localStorage.getItem('organizationType') || '').toLowerCase();
    const isHealthcare = orgType.includes('health') || orgType.includes('clinic') || orgType.includes('hospital') || orgType.includes('medical');

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!selectedPatient || !e.target.files || e.target.files.length === 0) return;
        const file = e.target.files[0];
        const sizeFormatted = file.size > 1048576 
            ? `${(file.size / 1048576).toFixed(1)} MB` 
            : `${(file.size / 1024).toFixed(0)} KB`;
        const newDoc: PatientDocument = {
            id: 'doc-' + Date.now(),
            name: file.name,
            size: sizeFormatted,
            uploadDate: new Date().toISOString().split('T')[0],
            type: file.type.includes('image') ? 'image' : 'pdf'
        };
        const currentList = patientDocs[selectedPatient.id] || [];
        const updated = { ...patientDocs, [selectedPatient.id]: [newDoc, ...currentList] };
        setPatientDocs(updated);
        localStorage.setItem('crm_patient_documents', JSON.stringify(updated));
        setToastMsg(`Document "${file.name}" uploaded successfully!`);
        setShowToast(true);
        setTimeout(() => setShowToast(false), 3000);
        e.target.value = '';
    };

    const handleBookFollowUp = () => {
        if (!selectedPatient) return;
        navigate(`/admin/appointments?new=true&patientName=${encodeURIComponent(selectedPatient.name)}&patientEmail=${encodeURIComponent(selectedPatient.email)}`);
    };

    const handleGenerateInvoice = () => {
        if (!selectedPatient) return;
        const invoiceLink = `${window.location.origin}/admin/ledger?patient=${encodeURIComponent(selectedPatient.email)}&invoice=${selectedPatient.id}`;
        navigator.clipboard.writeText(invoiceLink);
        setToastMsg(`Invoice payment link copied for ${selectedPatient.name}!`);
        setShowToast(true);
        setTimeout(() => setShowToast(false), 3000);
    };

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
        const matchesSearch = !searchTerm || 
            p.name.toLowerCase().includes(searchLower) || 
            (p.phone && p.phone.toLowerCase().includes(searchLower)) || 
            (p.email && p.email.toLowerCase().includes(searchLower)) ||
            p.id.toLowerCase().includes(searchLower);
        
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
        a.setAttribute('download', `${terms.customerPlural.toLowerCase()}_directory.csv`);
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    };

    if (selectedPatient) {
        return (
            <div className="tenant-theme">
                <div className="bg-background text-on-surface font-sans min-h-screen relative">
                    <AdminSidebar />
                    <TopNavigation />
                    <main className="lg:ml-[280px] ml-0 ml-sidebar-width pt-24 pb-gutter px-gutter min-h-screen flex flex-col bg-[#F8FAFC]">
                        <div className="max-w-container-max mx-auto w-full flex-1 flex flex-col animate-fade-in space-y-8 pb-20">
                        {/* BREADCRUMB & HEADER */}
                        <section>
                            <nav className="flex items-center gap-2 text-on-surface-variant text-xs mb-2">
                                <span className="cursor-pointer hover:text-primary transition-colors" onClick={() => navigate('/admin/dashboard')}>Workspace</span>
                                <span className="material-symbols-outlined text-[14px]">chevron_right</span>
                                <span className="cursor-pointer hover:text-primary transition-colors" onClick={() => setSelectedPatientId(null)}>CRM</span>
                                <span className="material-symbols-outlined text-[14px]">chevron_right</span>
                                <span className="text-primary font-semibold">{terms.customerSingular} Directory</span>
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
                                        onChange={handleFileUpload}
                                    />
                                    <button onClick={() => fileInputRef.current?.click()} className="flex items-center gap-2 px-5 py-2.5 border border-outline rounded-lg font-body-md text-body-md hover:bg-surface-container-low transition-colors cursor-pointer">
                                        <span className="material-symbols-outlined text-[20px]">upload_file</span>
                                        Upload Document
                                    </button>
                                    <button onClick={handleBookFollowUp} className="flex items-center gap-2 px-5 py-2.5 bg-secondary-container text-on-secondary-fixed font-bold rounded-lg font-body-md text-body-md hover:brightness-110 transition-all shadow-sm cursor-pointer">
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
                                        <div className="w-32 h-32 rounded-full ring-4 ring-surface-container-low p-1 mb-4 overflow-hidden flex items-center justify-center bg-primary-container text-white text-3xl font-bold">
                                            {selectedPatient.profilePicture ? (
                                                <img 
                                                    src={selectedPatient.profilePicture} 
                                                    alt={selectedPatient.name} 
                                                    className="w-full h-full object-cover rounded-full"
                                                    onError={(e) => {
                                                        (e.target as HTMLElement).style.display = 'none';
                                                    }}
                                                />
                                            ) : (
                                                selectedPatient.initials
                                            )}
                                        </div>
                                        <h3 className="font-headline-md text-headline-md">{selectedPatient.name}</h3>
                                        <p className="text-on-surface-variant font-body-md">{terms.customerSingular} since {selectedPatient.patientSince}</p>
                                        
                                        <div className="mt-4 flex gap-2 flex-wrap justify-center">
                                            <span className="px-2.5 py-0.5 rounded-full bg-green-100 text-[11px] font-bold text-green-800 uppercase tracking-wider">
                                                {selectedPatient.status || 'Active'}
                                            </span>
                                            {isHealthcare && selectedPatient.age !== null && (
                                                <span className="px-2.5 py-0.5 rounded-full bg-surface-container-high text-[11px] font-bold text-on-surface-variant uppercase tracking-wider">{selectedPatient.age} y/o</span>
                                            )}
                                            {isHealthcare && selectedPatient.bloodGroup && selectedPatient.bloodGroup !== 'Unknown' && (
                                                <span className="px-2.5 py-0.5 rounded-full bg-surface-container-high text-[11px] font-bold text-on-surface-variant uppercase tracking-wider">Blood {selectedPatient.bloodGroup}</span>
                                            )}
                                        </div>
                                    </div>

                                    {isHealthcare && selectedPatient.allergies && selectedPatient.allergies !== 'None' && (
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
                                            <span className="font-body-md text-body-md truncate">{selectedPatient.email}</span>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <span className="material-symbols-outlined text-on-surface-variant">call</span>
                                            <span className="font-body-md text-body-md">{selectedPatient.phone}</span>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <span className="material-symbols-outlined text-on-surface-variant">calendar_month</span>
                                            <span className="font-body-md text-body-md text-on-surface-variant">Last: {selectedPatient.lastVisit || 'N/A'}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Metrics Card (Healthcare vitals or Academic/Customer Stats) */}
                                <div className="bg-surface-container-lowest border border-outline p-6 rounded-xl">
                                    <h4 className="font-label-md text-label-md uppercase tracking-widest text-on-surface-variant mb-6">
                                        {isHealthcare ? 'Recent Vitals' : `${terms.customerSingular} Activity`}
                                    </h4>
                                    {isHealthcare ? (
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="p-4 bg-surface-container-low rounded-lg">
                                                <p className="text-[10px] uppercase font-bold text-on-surface-variant mb-1">Heart Rate</p>
                                                <div className="flex items-baseline gap-1">
                                                    <span className="font-headline-md text-headline-md text-on-background">{selectedPatient.heartRate || '72'}</span>
                                                    <span className="text-[11px] text-on-surface-variant">BPM</span>
                                                </div>
                                            </div>
                                            <div className="p-4 bg-surface-container-low rounded-lg">
                                                <p className="text-[10px] uppercase font-bold text-on-surface-variant mb-1">Weight</p>
                                                <div className="flex items-baseline gap-1">
                                                    <span className="font-headline-md text-headline-md text-on-background">{selectedPatient.weight || '60'}</span>
                                                    <span className="text-[11px] text-on-surface-variant">KG</span>
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="p-4 bg-surface-container-low rounded-lg">
                                                <p className="text-[10px] uppercase font-bold text-on-surface-variant mb-1">Total {terms.servicePlural}</p>
                                                <div className="flex items-baseline gap-1">
                                                    <span className="font-headline-md text-headline-md text-primary">
                                                        {selectedPatient.timeline?.length || 1}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="p-4 bg-surface-container-low rounded-lg">
                                                <p className="text-[10px] uppercase font-bold text-on-surface-variant mb-1">Status</p>
                                                <div className="flex items-baseline gap-1">
                                                    <span className="text-sm font-bold text-green-700">Good Standing</span>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* COLUMN 2: ACTIVITY TIMELINE */}
                            <div className="col-span-12 lg:col-span-5 space-y-gutter">
                                <div className="bg-surface-container-lowest border border-outline rounded-xl overflow-hidden">
                                    <div className="px-6 py-4 border-b border-outline flex justify-between items-center">
                                        <h4 className="font-label-md text-label-md uppercase tracking-widest text-on-surface-variant">
                                            {terms.serviceSingular} Activity Timeline
                                        </h4>
                                        <span className="material-symbols-outlined text-on-surface-variant cursor-pointer hover:text-primary transition-colors">history</span>
                                    </div>
                                    <div className="p-6 space-y-8 relative">
                                        {/* Timeline Line */}
                                        <div className="absolute left-[39px] top-8 bottom-8 w-[1px] bg-outline-variant"></div>

                                        {/* Dynamic Timeline Entries */}
                                        {selectedPatient.timeline && selectedPatient.timeline.length > 0 ? (
                                            selectedPatient.timeline.map((app, idx) => (
                                                <div key={app.id || idx} className="relative pl-12">
                                                    <div className="absolute left-[-5px] top-1 w-6 h-6 rounded-full bg-secondary-container flex items-center justify-center ring-4 ring-white">
                                                        <span className="material-symbols-outlined text-[14px] text-on-secondary-fixed">
                                                            {isHealthcare ? 'stethoscope' : 'event_available'}
                                                        </span>
                                                    </div>
                                                    <div className="flex justify-between items-start mb-2">
                                                        <div>
                                                            <h5 className="font-headline-md text-[16px] leading-tight font-bold text-on-background">
                                                                {app.serviceName}
                                                            </h5>
                                                            <p className="text-on-surface-variant text-body-md mt-0.5">
                                                                {terms.providerSingular}: <span className="font-semibold text-on-background">{app.providerName || selectedPatient.provider}</span>
                                                            </p>
                                                        </div>
                                                        <div className="text-right">
                                                            <span className="font-mono-data text-[11px] text-on-surface-variant bg-surface-container-low px-2 py-1 rounded uppercase">
                                                                {app.appointmentDate}
                                                            </span>
                                                            {app.appointmentTime && (
                                                                <p className="text-[10px] text-on-surface-variant font-mono mt-1">{app.appointmentTime}</p>
                                                            )}
                                                        </div>
                                                    </div>

                                                    {/* Session Note */}
                                                    <div className="bg-surface-container-low rounded-lg p-3 border border-outline border-dashed text-xs text-on-surface-variant mt-2 leading-relaxed">
                                                        {app.notes ? app.notes : `Routine ${terms.serviceSingular.toLowerCase()} session recorded. Status: ${app.appointmentStatus}`}
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="relative pl-12 text-on-surface-variant text-sm py-4">
                                                No past {terms.servicePlural.toLowerCase()} recorded yet for this {terms.customerSingular.toLowerCase()}.
                                            </div>
                                        )}

                                        {/* Real Attached Documents */}
                                        <div className="pt-4 border-t border-outline">
                                            <p className="text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-3">
                                                Attached Documents ({patientDocs[selectedPatient.id]?.length || 0})
                                            </p>
                                            {patientDocs[selectedPatient.id] && patientDocs[selectedPatient.id].length > 0 ? (
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                    {patientDocs[selectedPatient.id].map(doc => (
                                                        <div key={doc.id} className="flex items-center gap-3 p-2.5 border border-outline rounded-lg bg-surface hover:border-primary transition-colors group">
                                                            <div className="w-9 h-9 rounded bg-primary/10 flex items-center justify-center text-primary shrink-0">
                                                                <span className="material-symbols-outlined text-[20px]">
                                                                    {doc.type === 'image' ? 'image' : 'description'}
                                                                </span>
                                                            </div>
                                                            <div className="overflow-hidden flex-1 min-w-0">
                                                                <p className="text-xs font-semibold truncate text-on-background">{doc.name}</p>
                                                                <p className="text-[10px] text-on-surface-variant">{doc.size} • {doc.uploadDate}</p>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <div 
                                                    onClick={() => fileInputRef.current?.click()}
                                                    className="p-4 border border-dashed border-outline rounded-lg bg-surface-container-low/50 text-center cursor-pointer hover:bg-surface-container-low transition-colors"
                                                >
                                                    <span className="material-symbols-outlined text-2xl text-on-surface-variant opacity-60 mb-1">upload_file</span>
                                                    <p className="text-xs text-on-surface-variant">No documents attached yet. Click to upload files.</p>
                                                </div>
                                            )}
                                        </div>

                                    </div>
                                </div>
                            </div>

                            {/* COLUMN 3: FINANCIAL LEDGER */}
                            <div className="col-span-12 lg:col-span-4 space-y-gutter">
                                <div className="bg-primary-container text-white rounded-xl p-6 shadow-xl relative overflow-hidden">
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-secondary-fixed opacity-10 blur-3xl -mr-16 -mt-16"></div>
                                    <h4 className="font-label-md text-label-md uppercase tracking-widest text-on-tertiary-container mb-6">{terms.customerSingular} Financials</h4>
                                    
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
                                                {selectedPatient.outstandingBalance !== '$0.00' && selectedPatient.outstandingBalance !== 'Rs. 0' ? (
                                                    <span className="bg-on-tertiary-fixed-variant text-secondary-fixed px-3 py-1 rounded text-[10px] font-bold uppercase tracking-widest">Pending</span>
                                                ) : (
                                                    <span className="bg-green-500/20 text-green-400 px-3 py-1 rounded text-[10px] font-bold uppercase tracking-widest">Cleared</span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className="mt-8 space-y-3">
                                        <button 
                                            onClick={handleGenerateInvoice}
                                            className="w-full py-3 bg-secondary-fixed text-primary-container font-bold rounded-lg hover:brightness-110 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md"
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
                                    <button 
                                        onClick={() => navigate('/admin/ledger')} 
                                        className="w-full py-3 text-center text-label-md text-on-surface-variant bg-surface-container-low hover:text-primary transition-colors border-t border-outline cursor-pointer"
                                    >
                                        View Full Ledger Details
                                    </button>
                                </div>
                            </div>
                        </div>
                        </div>
                    </main>

                    {/* Toast Notification */}
                    {showToast && (
                        <div className="fixed bottom-6 right-6 bg-primary text-on-primary px-6 py-4 rounded-xl shadow-lg flex items-center gap-3 animate-fade-in z-50">
                            <span className="material-symbols-outlined text-[20px]">check_circle</span>
                            <span className="font-semibold text-sm">{toastMsg}</span>
                        </div>
                    )}
                </div>
            </div>
        );
    }

    return (
        <div className="tenant-theme">
            <div className="bg-background text-on-surface font-sans min-h-screen relative">
                <AdminSidebar />
                <TopNavigation />

                <main className="lg:ml-[280px] ml-0 ml-sidebar-width pt-24 pb-gutter px-gutter min-h-screen flex flex-col bg-[#F8FAFC]">
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
                            <h2 className="text-2xl sm:text-headline-lg font-headline-lg font-bold text-primary tracking-tight">{terms.crmTitle}</h2>
                        </div>
                        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
                            <button onClick={handleExportCSV} className="flex-1 sm:flex-initial justify-center px-4 py-2 border border-outline-variant rounded bg-white text-on-surface font-semibold text-sm hover:bg-surface-container-low transition-all flex items-center gap-2 cursor-pointer">
                                <span className="material-symbols-outlined text-sm">download</span>
                                Export CSV
                            </button>
                            <button className="flex-1 sm:flex-initial justify-center px-4 py-2 bg-primary text-on-primary rounded font-semibold text-sm hover:brightness-110 active:scale-95 transition-all shadow-md shadow-primary/20 flex items-center gap-2 cursor-pointer">
                                <span className="material-symbols-outlined text-sm">add</span>
                                Add New {terms.customerSingular}
                            </button>
                        </div>
                    </div>

                    {/* Master Filter Engine */}
                    <div className="bg-white border border-outline-variant p-2 flex flex-col lg:flex-row gap-2 rounded shadow-sm">
                        <div className="relative flex-1">
                            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-lg">search</span>
                            <input 
                                type="text" 
                                placeholder={`Search by ${terms.customerSingular} Name, Phone, or ID...`} 
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
                                    <th className="px-6 py-4 font-label-md text-label-md uppercase text-on-surface-variant tracking-wider">{terms.customerSingular} Details</th>
                                    <th className="px-6 py-4 font-label-md text-label-md uppercase text-on-surface-variant tracking-wider">Contact Info</th>
                                    <th className="px-6 py-4 font-label-md text-label-md uppercase text-on-surface-variant tracking-wider">Last Visit & {terms.providerSingular}</th>
                                    <th className="px-6 py-4 font-label-md text-label-md uppercase text-on-surface-variant tracking-wider text-right">Outstanding Balance</th>
                                    <th className="px-6 py-4 font-label-md text-label-md uppercase text-on-surface-variant tracking-wider">Status</th>
                                    <th className="px-6 py-4 font-label-md text-label-md uppercase text-on-surface-variant tracking-wider text-center">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-surface-container-low">
                                {filteredPatients.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-12 text-center text-on-surface-variant">
                                            No {terms.customerPlural.toLowerCase()} found matching the current filters.
                                        </td>
                                    </tr>
                                ) : (
                                    filteredPatients.map((patient) => (
                                        <tr key={patient.id} className="hover:bg-surface-bright transition-colors group">
                                            <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                 {patient.profilePicture ? (
                                                     <img 
                                                         src={patient.profilePicture} 
                                                         alt={patient.name} 
                                                         className="w-9 h-9 rounded-full object-cover border border-outline-variant flex-shrink-0"
                                                         onError={(e) => {
                                                             (e.target as HTMLElement).style.display = 'none';
                                                         }}
                                                     />
                                                 ) : (
                                                     <div className={`w-9 h-9 rounded ${patient.bgColor} flex items-center justify-center ${patient.textColor} font-bold text-xs flex-shrink-0`}>
                                                         {patient.initials}
                                                     </div>
                                                 )}
                                                <div>
                                                    <p className="font-bold text-primary">{patient.name}</p>
                                                    {isHealthcare ? (
                                                        <p className="text-on-surface text-[14px] font-medium">
                                                            {patient.age !== null ? `${patient.age} yrs` : 'N/A'} • Blood {patient.bloodGroup}
                                                        </p>
                                                    ) : (
                                                        <p className="text-on-surface-variant text-[13px] font-mono">
                                                            ID: {patient.id}
                                                        </p>
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
