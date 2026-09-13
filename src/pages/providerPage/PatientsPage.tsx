import React, { useEffect, useState } from 'react';
import { useNavigate, NavLink } from 'react-router-dom';
import ProviderTopNavigation from './components/ProviderTopNavigation';
import ProviderSidebar from './components/ProviderSidebar';
import NewAppointmentModal from '../adminPage/components/NewAppointmentModal';
import { useOrganizationTerms } from '../../utils/organizationTerms';

interface Patient {
  id: string;
  name: string;
  email: string;
  phone: string;
  lastVisitDate: string;
  lastVisitReason: string;
  bookings: string;
  status: 'Active' | 'Inactive' | 'Missed';
  noshows: string;
  avatarUrl: string;
}



const PatientsPage: React.FC = () => {
  const terms = useOrganizationTerms();
  const navigate = useNavigate();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Active' | 'Inactive' | 'Missed'>('All');
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('Booking link copied to clipboard!');
  const [isAddCustomerModalOpen, setIsAddCustomerModalOpen] = useState(false);
  
  // Dynamic Note States scoped by provider ID
  const currentProviderId = localStorage.getItem('userId') || 'default';
  const notesStorageKey = `provider_patient_notes_${currentProviderId}`;

  const [patientNotes, setPatientNotes] = useState<{ [id: string]: string }>(() => {
    try {
      const saved = localStorage.getItem(notesStorageKey);
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });
  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const [currentNoteText, setCurrentNoteText] = useState('');

  const copyBookingLink = () => {
    const providerId = localStorage.getItem('userId') || '';
    const link = providerId 
      ? `${window.location.origin}/book-appointment?provider=${providerId}`
      : `${window.location.origin}/book-appointment`;
    navigator.clipboard.writeText(link);
    setToastMessage(`Public booking link copied to clipboard!`);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const handleSaveNotes = () => {
    if (!selectedPatient) return;
    const updated = { ...patientNotes, [selectedPatient.id]: currentNoteText };
    setPatientNotes(updated);
    localStorage.setItem(notesStorageKey, JSON.stringify(updated));
    setIsEditingNotes(false);
    setToastMessage(`Notes saved successfully!`);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const [openActionMenuId, setOpenActionMenuId] = useState<string | null>(null);

  const fetchPatients = React.useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:8080/api/v1/provider/patients', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setPatients(data);
      }
    } catch (error) {
      console.error('Error fetching patients:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPatients();
  }, [fetchPatients]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const role = (localStorage.getItem('role') || '').toLowerCase();
    const isProvider = role === 'service_provider' || role === 'provider' || role === 'role_provider';
    
    // Redirect if no token or role is not provider
    if (!token || !isProvider) {
      navigate('/login');
      return;
    }

    const permissionsJson = localStorage.getItem('permissionsJson');
    const tenantRoleName = localStorage.getItem('tenantRoleName');
    if (tenantRoleName && permissionsJson) {
      try {
        const p = JSON.parse(permissionsJson);
        if (p.patients && p.patients.read === false) {
          navigate('/provider-dashboard');
        }
      } catch (e) {}
    }
  }, [navigate]);

  useEffect(() => {
    const handleClickOutside = () => setOpenActionMenuId(null);
    window.addEventListener('click', handleClickOutside);
    return () => window.removeEventListener('click', handleClickOutside);
  }, []);

  const handleLogout = (e: React.MouseEvent) => {
    e.preventDefault();
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('fullName');
    navigate('/login');
  };

  const openPatientPanel = (patient: Patient) => {
    setSelectedPatient(patient);
    setIsEditingNotes(false);
    setCurrentNoteText(patientNotes[patient.id] || '');
  };

  const closePanel = () => {
    setSelectedPatient(null);
    setIsEditingNotes(false);
  };

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // Reset to page 1 on search or filter change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter]);

  const filteredPatients = patients.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          p.email.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          p.phone.includes(searchQuery);
    const matchesFilter = statusFilter === 'All' || p.status === statusFilter;
    return matchesSearch && matchesFilter;
  });

  const totalEntries = filteredPatients.length;
  const totalPages = Math.max(1, Math.ceil(totalEntries / pageSize));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const startIndex = totalEntries === 0 ? 0 : (safeCurrentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalEntries);
  const paginatedPatients = filteredPatients.slice(startIndex, endIndex);

  const getPageNumbers = () => {
    if (totalPages <= 5) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    let start = Math.max(1, safeCurrentPage - 2);
    let end = Math.min(totalPages, start + 4);
    if (end - start < 4) {
      start = Math.max(1, end - 4);
    }
    const pages: number[] = [];
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  };

  const exportCSV = () => {
    const headers = ['Patient ID', 'Name', 'Email', 'Phone', 'Last Visit', 'Last Visit Reason', 'Total Bookings', 'Status', 'Missed Appointments'];
    const csvData = filteredPatients.map(p => [
      p.id, p.name, p.email, p.phone, p.lastVisitDate, p.lastVisitReason, p.bookings, p.status, p.noshows
    ]);
    
    const csvContent = [
      headers.join(','),
      ...csvData.map(row => row.map(item => `"${item}"`).join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `${terms.customerPlural.toLowerCase()}_directory.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="tenant-theme bg-[#F3F4F6] text-[#151c27] font-sans min-h-screen flex overflow-x-hidden">
      <ProviderTopNavigation />

      {/* SideNavBar */}
      <ProviderSidebar />

      {/* Main Content Area */}
      <main className="pt-24 pb-8 md:ml-64 px-4 md:px-10 h-screen flex-1 md:w-[calc(100%-256px)] flex flex-col relative overflow-hidden">
        
        {/* Page Header & Controls */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 sm:mb-8 shrink-0 gap-4">
          <div>
            <h1 className="text-2xl sm:text-[32px] font-bold text-primary tracking-tight">{terms.customerSingular} Directory</h1>
            <p className="text-sm font-medium text-[#53606c] mt-1">Manage your {filteredPatients.length} registered {terms.customerPlural.toLowerCase()} and viewing history.</p>
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
            <button onClick={exportCSV} className="flex-1 sm:flex-initial px-4 py-2.5 text-sm font-bold text-[#3b4854] bg-white border border-[#c3c5d7] rounded-xl hover:bg-[#f9f9ff] transition flex items-center justify-center gap-2 shadow-sm cursor-pointer">
              <span className="material-symbols-outlined text-[18px]">download</span> Export CSV
            </button>
            <button 
              onClick={() => setIsAddCustomerModalOpen(true)}
              className="flex-1 sm:flex-initial bg-primary hover:brightness-110 text-on-primary font-bold py-2.5 px-6 rounded-xl flex items-center justify-center gap-2 shadow-md transition-all active:scale-95 cursor-pointer">
              <span className="material-symbols-outlined text-[20px]">add</span> Add {terms.customerSingular}
            </button>
          </div>
        </div>

        {/* Search and Filter Bar */}
        <div className="flex flex-wrap sm:flex-nowrap items-center gap-4 mb-6 shrink-0">
          <div className="relative flex-1 w-full max-w-md">
            <span className="material-symbols-outlined absolute left-4 top-1/2 transform -translate-y-1/2 text-[#53606c]">search</span>
            <input 
              type="text" 
              placeholder={`Search by ${terms.customerSingular.toLowerCase()} name, phone, or email...`} 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-white border border-[#c3c5d7] rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm"
            />
          </div>
          <div className="relative">
            <button 
              onClick={() => setShowFilterDropdown(!showFilterDropdown)} 
              className="px-4 py-3 bg-white border border-[#c3c5d7] rounded-xl text-[#53606c] hover:bg-[#f9f9ff] transition shadow-sm flex items-center gap-2 text-sm font-bold"
            >
              <span className="material-symbols-outlined text-[18px]">filter_alt</span> 
              Filters {statusFilter !== 'All' && <span className="w-2 h-2 rounded-full bg-primary ml-1"></span>}
            </button>
            {showFilterDropdown && (
              <div className="absolute right-0 mt-2 w-48 bg-white border border-[#c3c5d7] rounded-xl shadow-lg z-50 overflow-hidden py-1">
                {['All', 'Active', 'Inactive', 'Missed'].map((status) => (
                  <button
                    key={status}
                    onClick={() => {
                      setStatusFilter(status as any);
                      setShowFilterDropdown(false);
                    }}
                    className={`w-full text-left px-4 py-2 text-sm transition-colors ${statusFilter === status ? 'bg-primary/10 text-primary font-bold' : 'text-[#3b4854] hover:bg-surface-container-high'}`}
                  >
                    {status}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Patients Table */}
        <div className="flex-1 bg-white rounded-2xl border border-[#c3c5d7]/50 shadow-sm flex flex-col mb-4 overflow-hidden">
          <div className="w-full flex-1 overflow-y-auto overflow-x-auto custom-scrollbar relative">
            <table className="w-full min-w-[720px] text-left border-collapse">
              <thead className="bg-[#f9f9ff]/80 sticky top-0 z-10 backdrop-blur-sm">
                <tr>
                  <th className="py-4 px-6 text-[11px] font-bold text-[#53606c] uppercase tracking-wider border-b border-[#c3c5d7]/30">{terms.customerSingular} Info</th>
                  <th className="py-4 px-6 text-[11px] font-bold text-[#53606c] uppercase tracking-wider border-b border-[#c3c5d7]/30">Contact</th>
                  <th className="py-4 px-6 text-[11px] font-bold text-[#53606c] uppercase tracking-wider border-b border-[#c3c5d7]/30">Last Visit</th>
                  <th className="py-4 px-6 text-[11px] font-bold text-[#53606c] uppercase tracking-wider border-b border-[#c3c5d7]/30">Total Bookings</th>
                  <th className="py-4 px-6 text-[11px] font-bold text-[#53606c] uppercase tracking-wider border-b border-[#c3c5d7]/30">Status</th>
                  <th className="py-4 px-6 text-[11px] font-bold text-[#53606c] uppercase tracking-wider border-b border-[#c3c5d7]/30 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#c3c5d7]/20">
                
                {paginatedPatients.map((patient) => (
                  <tr 
                    key={patient.id}
                    className="hover:bg-[#f9f9ff] hover:scale-[1.002] transition-all cursor-pointer relative z-0 hover:z-10 hover:shadow-sm bg-white"
                    onClick={() => openPatientPanel(patient)}
                  >
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-4">
                        <img src={patient.avatarUrl} className="w-10 h-10 rounded-full bg-[#f0f3ff] border border-[#c3c5d7]/50 object-cover" alt="Patient" />
                        <div>
                          <div className="font-bold text-[#151c27]">{patient.name}</div>
                          <div className="text-xs text-[#53606c]">ID: {patient.id}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="text-sm font-medium text-[#151c27]">{patient.phone}</div>
                      <div className="text-xs text-[#53606c]">{patient.email}</div>
                    </td>
                    <td className="py-4 px-6">
                      <div className={`text-sm font-semibold ${patient.status === 'Missed' ? 'text-[#ba1a1a]' : 'text-[#151c27]'}`}>{patient.status === 'Missed' ? `Missed (${patient.lastVisitDate})` : patient.lastVisitDate}</div>
                      <div className="text-xs text-[#53606c]">{patient.lastVisitReason}</div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="text-sm font-bold text-[#151c27]">{patient.bookings}</div>
                    </td>
                    <td className="py-4 px-6">
                      {patient.status === 'Active' && (
                        <span className="px-3 py-1 bg-[#d6ffe5] text-[#006f4b] text-[10px] font-bold uppercase tracking-wider rounded-lg border border-[#68f5b8]">Active</span>
                      )}
                      {patient.status === 'Inactive' && (
                        <span className="px-3 py-1 bg-[#f9f9ff] text-[#53606c] text-[10px] font-bold uppercase tracking-wider rounded-lg border border-[#c3c5d7]/50">Inactive</span>
                      )}
                      {patient.status === 'Missed' && (
                        <span className="px-3 py-1 bg-[#ffdad6] text-[#93000a] text-[10px] font-bold uppercase tracking-wider rounded-lg border border-[#ffb4ab] flex items-center gap-1.5 w-max">
                          <span className="material-symbols-outlined text-[14px]">warning</span> High No-Show
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-6 text-right relative">
                      <button 
                        className="w-8 h-8 rounded-lg hover:bg-[#dce2f3] text-[#53606c] transition flex items-center justify-center ml-auto" 
                        onClick={(e) => { e.stopPropagation(); setOpenActionMenuId(openActionMenuId === patient.id ? null : patient.id); }}
                      >
                        <span className="material-symbols-outlined text-[20px]">more_vert</span>
                      </button>
                      
                      {/* Action Dropdown Menu */}
                      {openActionMenuId === patient.id && (
                        <div className="absolute right-6 top-10 w-44 bg-white border border-[#c3c5d7]/50 rounded-xl shadow-lg z-50 overflow-hidden py-1" onClick={(e) => e.stopPropagation()}>
                          <button 
                            className="w-full text-left px-4 py-2.5 text-sm font-medium text-[#151c27] hover:bg-[#f0f3ff] transition-colors flex items-center gap-2" 
                            onClick={(e) => { e.stopPropagation(); openPatientPanel(patient); setOpenActionMenuId(null); }}
                          >
                            <span className="material-symbols-outlined text-[16px]">visibility</span> View Details
                          </button>
                          <a 
                            href={`mailto:${patient.email}`}
                            className="w-full text-left px-4 py-2.5 text-sm font-medium text-[#151c27] hover:bg-[#f0f3ff] transition-colors flex items-center gap-2" 
                            onClick={(e) => { e.stopPropagation(); setOpenActionMenuId(null); }}
                          >
                            <span className="material-symbols-outlined text-[16px]">mail</span> Contact {terms.customerSingular}
                          </a>
                          <div className="h-[1px] w-full bg-[#c3c5d7]/30 my-1"></div>
                          <button 
                            className="w-full text-left px-4 py-2.5 text-sm font-medium text-[#151c27] hover:bg-[#f0f3ff] transition-colors flex items-center gap-2" 
                            onClick={(e) => { e.stopPropagation(); navigate(`/master-calendar?patient=${encodeURIComponent(patient.email)}`); setOpenActionMenuId(null); }}
                          >
                            <span className="material-symbols-outlined text-[16px]">history</span> View History
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
                {filteredPatients.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-16 text-center text-[#53606c]">
                      <div className="flex flex-col items-center justify-center max-w-sm mx-auto">
                        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                          <span className="material-symbols-outlined text-primary text-[32px]">{terms.customersNavIcon}</span>
                        </div>
                        <h3 className="font-bold text-[#151c27] text-lg mb-1">
                          {searchQuery || statusFilter !== 'All' ? `No ${terms.customerPlural.toLowerCase()} match your filters` : `No ${terms.customerPlural.toLowerCase()} yet`}
                        </h3>
                        <p className="text-xs text-[#53606c] mb-5 leading-relaxed">
                          {searchQuery || statusFilter !== 'All'
                            ? `Try clearing your search query or changing filters to see your ${terms.customerPlural.toLowerCase()}.`
                            : `Clients who book appointments with you will automatically appear here in your directory.`}
                        </p>
                        <button
                          onClick={copyBookingLink}
                          className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-on-primary text-xs font-bold rounded-xl hover:brightness-110 shadow-sm transition active:scale-95 cursor-pointer"
                        >
                          <span className="material-symbols-outlined text-[16px]">content_copy</span>
                          Copy My Public Booking Link
                        </button>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          
          {/* Table Footer / Pagination */}
          <div className="border-t border-[#c3c5d7]/50 bg-[#f9f9ff] p-4 flex flex-wrap items-center justify-between shrink-0 gap-4">
            <span className="text-sm text-[#53606c] font-medium">
              Showing {totalEntries > 0 ? startIndex + 1 : 0} to {endIndex} of {totalEntries} entries
            </span>
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={safeCurrentPage <= 1}
                className="px-3 py-1.5 border border-[#c3c5d7] rounded-lg text-[#53606c] bg-white hover:bg-[#f0f3ff] disabled:opacity-40 disabled:cursor-not-allowed text-sm font-semibold shadow-sm transition cursor-pointer"
              >
                Previous
              </button>
              
              {getPageNumbers().map(page => (
                <button 
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`w-8 h-8 flex items-center justify-center rounded-lg text-sm font-bold shadow-sm transition cursor-pointer ${
                    safeCurrentPage === page 
                      ? 'bg-primary text-on-primary shadow-sm' 
                      : 'bg-white hover:bg-[#f0f3ff] text-[#53606c] border border-[#c3c5d7]'
                  }`}
                >
                  {page}
                </button>
              ))}

              <button 
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={safeCurrentPage >= totalPages || totalEntries === 0}
                className="px-3 py-1.5 border border-[#c3c5d7] rounded-lg text-[#53606c] bg-white hover:bg-[#f0f3ff] disabled:opacity-40 disabled:cursor-not-allowed text-sm font-semibold shadow-sm transition cursor-pointer"
              >
                Next
              </button>
            </div>
          </div>
        </div>
        
        {/* Slide Panel Overlay & Details */}
        {selectedPatient && (
          <>
            {/* Backdrop */}
            <div 
              className="absolute top-20 left-0 right-0 bottom-0 bg-[#151c27]/20 backdrop-blur-sm z-[30] transition-opacity"
              onClick={closePanel}
            ></div>
            
            {/* Slide-Out Panel */}
            <div className="absolute top-20 right-0 bottom-0 w-full sm:w-[420px] max-w-full bg-white shadow-2xl z-[40] flex flex-col overflow-hidden animate-[slideInRight_0.3s_ease-out]">
              
              {/* Panel Header */}
              <div className="px-8 py-6 flex justify-between items-start border-b border-[#c3c5d7]/30 bg-[#f9f9ff]">
                <h3 className="font-bold text-[#151c27] text-lg">{terms.customerSingular} Overview</h3>
                <button 
                  className="w-8 h-8 rounded-full bg-[#f0f3ff] hover:bg-[#dce2f3] text-[#53606c] flex items-center justify-center transition-colors"
                  onClick={closePanel}
                >
                  <span className="material-symbols-outlined text-[18px]">close</span>
                </button>
              </div>
              
              {/* Panel Body */}
              <div className="flex-1 overflow-y-auto p-8">
                {/* Profile Header */}
                <div className="flex items-center gap-5 mb-8">
                  <img src={selectedPatient.avatarUrl} alt="Patient" className="w-20 h-20 rounded-full border-4 border-white shadow-sm bg-[#f0f3ff] object-cover shrink-0" />
                  <div>
                    <h2 className="text-2xl font-bold text-[#151c27] tracking-tight">{selectedPatient.name}</h2>
                    <div className="text-sm font-medium text-[#53606c] mt-1 flex items-center gap-2">
                      <span className="material-symbols-outlined text-[14px]">mail</span> {selectedPatient.email}
                    </div>
                    <div className="text-sm font-medium text-[#53606c] mt-1 flex items-center gap-2">
                      <span className="material-symbols-outlined text-[14px]">phone</span> {selectedPatient.phone}
                    </div>
                  </div>
                </div>

                {/* Key Metrics Grid */}
                <div className="grid grid-cols-2 gap-4 mb-8">
                  <div className="bg-[#f9f9ff] rounded-xl p-4 border border-[#c3c5d7]/30">
                    <p className="text-[11px] font-bold text-[#53606c] uppercase tracking-widest mb-1">Total Bookings</p>
                    <p className="font-bold text-[#151c27] text-2xl">{selectedPatient.bookings}</p>
                  </div>
                  <div className="bg-[#f9f9ff] rounded-xl p-4 border border-[#c3c5d7]/30">
                    <p className="text-[11px] font-bold text-[#53606c] uppercase tracking-widest mb-1">No-Show Rate</p>
                    {parseInt(selectedPatient.noshows) > 0 ? (
                      <p className="font-bold text-[#ba1a1a] text-xl flex items-center gap-1.5"><span className="material-symbols-outlined text-[18px]">warning</span> {selectedPatient.noshows} Missed</p>
                    ) : (
                      <p className="font-bold text-[#006f4b] text-xl flex items-center gap-1.5"><span className="material-symbols-outlined text-[18px]">check_circle</span> Perfect (0)</p>
                    )}
                  </div>
                </div>

                {/* Internal Notes */}
                <div className="mb-8">
                  <div className="flex justify-between items-center mb-3">
                    <h4 className="font-bold text-[#151c27]">Internal {terms.providerSingular} Notes</h4>
                    {!isEditingNotes ? (
                      <button 
                        onClick={() => {
                          setCurrentNoteText(patientNotes[selectedPatient.id] || '');
                          setIsEditingNotes(true);
                        }}
                        className="text-xs font-bold text-primary hover:underline cursor-pointer flex items-center gap-1"
                      >
                        <span className="material-symbols-outlined text-[14px]">edit</span>
                        Edit Notes
                      </button>
                    ) : (
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => setIsEditingNotes(false)}
                          className="text-xs font-medium text-[#53606c] hover:underline cursor-pointer"
                        >
                          Cancel
                        </button>
                        <button 
                          onClick={handleSaveNotes}
                          className="text-xs font-bold text-primary bg-primary/10 hover:bg-primary/20 px-2.5 py-1 rounded-md transition-colors cursor-pointer"
                        >
                          Save
                        </button>
                      </div>
                    )}
                  </div>
                  
                  {isEditingNotes ? (
                    <div className="space-y-2">
                      <textarea
                        value={currentNoteText}
                        onChange={(e) => setCurrentNoteText(e.target.value)}
                        placeholder={`Add internal remarks for this ${terms.customerSingular.toLowerCase()}...`}
                        rows={3}
                        className="w-full p-3 rounded-xl border border-primary/40 focus:ring-2 focus:ring-primary/20 focus:outline-none text-sm text-[#151c27] bg-[#f9f9ff]"
                      />
                    </div>
                  ) : (
                    <div className="bg-[#fff8e6] p-4 rounded-xl border border-[#ffeaad] text-sm text-[#b38600] shadow-sm leading-relaxed">
                      {patientNotes[selectedPatient.id] ? (
                        patientNotes[selectedPatient.id]
                      ) : (
                        <span className="italic opacity-80">
                          No internal notes recorded yet for this {terms.customerSingular.toLowerCase()}. Click "Edit Notes" to add confidential remarks.
                        </span>
                      )}
                    </div>
                  )}
                </div>
                
                {/* Quick Actions List */}
                <h4 className="font-bold text-[#151c27] mb-3">Quick Actions</h4>
                <div className="space-y-2">
                  <button onClick={copyBookingLink} className="w-full text-left px-4 py-3 rounded-xl border border-[#c3c5d7]/50 hover:border-primary hover:bg-primary/5 font-semibold text-[#3b4854] hover:text-primary transition flex items-center justify-between group cursor-pointer">
                    <span className="flex items-center gap-3"><span className="material-symbols-outlined text-[#53606c] group-hover:text-primary transition">content_copy</span> Copy Public Booking Link</span>
                    <span className="material-symbols-outlined text-[18px] text-[#c3c5d7]">chevron_right</span>
                  </button>
                  <button 
                    onClick={() => {
                      navigate(`/master-calendar?patient=${encodeURIComponent(selectedPatient.email)}`);
                    }}
                    className="w-full text-left px-4 py-3 rounded-xl border border-[#c3c5d7]/50 hover:border-primary hover:bg-primary/5 font-semibold text-[#3b4854] hover:text-primary transition flex items-center justify-between group cursor-pointer"
                  >
                    <span className="flex items-center gap-3">
                      <span className="material-symbols-outlined text-[#53606c] group-hover:text-primary transition">history</span> 
                      View {terms.serviceSingular} History
                    </span>
                    <span className="material-symbols-outlined text-[18px] text-[#c3c5d7]">chevron_right</span>
                  </button>
                </div>
              </div>
            </div>
          </>
        )}
        {showToast && (
          <div className="fixed bottom-6 right-6 bg-primary text-on-primary px-6 py-4 rounded-xl shadow-lg flex items-center gap-3 animate-[slideInRight_0.3s_ease-out] z-50">
            <span className="material-symbols-outlined text-[20px]">check_circle</span>
            <span className="font-semibold text-sm">{toastMessage}</span>
          </div>
        )}
      </main>

      {/* NEW CUSTOMER / APPOINTMENT MODAL */}
      <NewAppointmentModal
        isOpen={isAddCustomerModalOpen}
        onClose={() => setIsAddCustomerModalOpen(false)}
        onSuccess={() => {
          setIsAddCustomerModalOpen(false);
          fetchPatients();
          setToastMessage(`${terms.customerSingular} added successfully!`);
          setShowToast(true);
          setTimeout(() => setShowToast(false), 4000);
        }}
        preselectedProviderName={localStorage.getItem('fullName') || undefined}
      />

      {/* Basic Keyframes for slide in */}
      <style>{`
        @keyframes slideInRight {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
      `}</style>
    </div>
  );
};

export default PatientsPage;

