import React, { useEffect, useState } from 'react';
import { useNavigate, NavLink } from 'react-router-dom';
import NotificationBell from '../userPage/NotificationBell';

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

const mockPatients: Patient[] = [
  { id: '#PT-8472', name: 'Alexander Mitchell', email: 'alex@example.com', phone: '+977 9801234567', lastVisitDate: 'Jul 8, 2026', lastVisitReason: 'General Checkup', bookings: '14', status: 'Active', noshows: '0', avatarUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuALan3Fe5liRYVvqOzbYPXALuhl1M_JrzKY62jsudutF-Y4kRwnw4no-RMdfy3kIqv1Pwvt4YNwLk09F8-YiOqLdcmDLbD8z8PfxNXA5LulAwItUiFnPDiM2CIPYIlitAQwvN0vTuDjaDgHGdcvqmtnQVICN825lJ_J6Gay2MKwe9QZ5j0m2TW3QgH9DIcW4nkj_-PRO8Ny3cmQDxAWN3MCHm9Grv2-ok3arYQPU0wypdDtdLrnEcUA0n9wYoUk0Nv28IHRfPR7qzs' },
  { id: '#PT-2931', name: 'Sarah Jenkins', email: 'sarah.j@example.com', phone: '+977 9811223344', lastVisitDate: 'May 22, 2026', lastVisitReason: 'Follow-up Consult', bookings: '3', status: 'Active', noshows: '1', avatarUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuALan3Fe5liRYVvqOzbYPXALuhl1M_JrzKY62jsudutF-Y4kRwnw4no-RMdfy3kIqv1Pwvt4YNwLk09F8-YiOqLdcmDLbD8z8PfxNXA5LulAwItUiFnPDiM2CIPYIlitAQwvN0vTuDjaDgHGdcvqmtnQVICN825lJ_J6Gay2MKwe9QZ5j0m2TW3QgH9DIcW4nkj_-PRO8Ny3cmQDxAWN3MCHm9Grv2-ok3arYQPU0wypdDtdLrnEcUA0n9wYoUk0Nv28IHRfPR7qzs' },
  { id: '#PT-1004', name: 'Marcus Chen', email: 'marcus.chen@email.com', phone: '+977 9845566778', lastVisitDate: 'Jan 10, 2026', lastVisitReason: 'Initial Screening', bookings: '1', status: 'Inactive', noshows: '0', avatarUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuALan3Fe5liRYVvqOzbYPXALuhl1M_JrzKY62jsudutF-Y4kRwnw4no-RMdfy3kIqv1Pwvt4YNwLk09F8-YiOqLdcmDLbD8z8PfxNXA5LulAwItUiFnPDiM2CIPYIlitAQwvN0vTuDjaDgHGdcvqmtnQVICN825lJ_J6Gay2MKwe9QZ5j0m2TW3QgH9DIcW4nkj_-PRO8Ny3cmQDxAWN3MCHm9Grv2-ok3arYQPU0wypdDtdLrnEcUA0n9wYoUk0Nv28IHRfPR7qzs' },
  { id: '#PT-6632', name: 'Priya Patel', email: 'priya.p@example.com', phone: '+977 9822334455', lastVisitDate: 'Jun 1, 2026', lastVisitReason: 'Vaccination', bookings: '5', status: 'Missed', noshows: '3', avatarUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuALan3Fe5liRYVvqOzbYPXALuhl1M_JrzKY62jsudutF-Y4kRwnw4no-RMdfy3kIqv1Pwvt4YNwLk09F8-YiOqLdcmDLbD8z8PfxNXA5LulAwItUiFnPDiM2CIPYIlitAQwvN0vTuDjaDgHGdcvqmtnQVICN825lJ_J6Gay2MKwe9QZ5j0m2TW3QgH9DIcW4nkj_-PRO8Ny3cmQDxAWN3MCHm9Grv2-ok3arYQPU0wypdDtdLrnEcUA0n9wYoUk0Nv28IHRfPR7qzs' },
  { id: '#PT-3412', name: 'Liam Johnson', email: 'liam.j@example.com', phone: '+977 9866554433', lastVisitDate: 'Apr 12, 2026', lastVisitReason: 'Blood Test', bookings: '2', status: 'Active', noshows: '0', avatarUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuALan3Fe5liRYVvqOzbYPXALuhl1M_JrzKY62jsudutF-Y4kRwnw4no-RMdfy3kIqv1Pwvt4YNwLk09F8-YiOqLdcmDLbD8z8PfxNXA5LulAwItUiFnPDiM2CIPYIlitAQwvN0vTuDjaDgHGdcvqmtnQVICN825lJ_J6Gay2MKwe9QZ5j0m2TW3QgH9DIcW4nkj_-PRO8Ny3cmQDxAWN3MCHm9Grv2-ok3arYQPU0wypdDtdLrnEcUA0n9wYoUk0Nv28IHRfPR7qzs' },
  { id: '#PT-9021', name: 'Emma Davis', email: 'emma.davis@email.com', phone: '+977 9812345678', lastVisitDate: 'Aug 5, 2025', lastVisitReason: 'Annual Physical', bookings: '1', status: 'Inactive', noshows: '0', avatarUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuALan3Fe5liRYVvqOzbYPXALuhl1M_JrzKY62jsudutF-Y4kRwnw4no-RMdfy3kIqv1Pwvt4YNwLk09F8-YiOqLdcmDLbD8z8PfxNXA5LulAwItUiFnPDiM2CIPYIlitAQwvN0vTuDjaDgHGdcvqmtnQVICN825lJ_J6Gay2MKwe9QZ5j0m2TW3QgH9DIcW4nkj_-PRO8Ny3cmQDxAWN3MCHm9Grv2-ok3arYQPU0wypdDtdLrnEcUA0n9wYoUk0Nv28IHRfPR7qzs' },
  { id: '#PT-5544', name: 'Noah Wilson', email: 'n.wilson@example.com', phone: '+977 9841122334', lastVisitDate: 'Jul 2, 2026', lastVisitReason: 'Therapy Session', bookings: '8', status: 'Active', noshows: '2', avatarUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuALan3Fe5liRYVvqOzbYPXALuhl1M_JrzKY62jsudutF-Y4kRwnw4no-RMdfy3kIqv1Pwvt4YNwLk09F8-YiOqLdcmDLbD8z8PfxNXA5LulAwItUiFnPDiM2CIPYIlitAQwvN0vTuDjaDgHGdcvqmtnQVICN825lJ_J6Gay2MKwe9QZ5j0m2TW3QgH9DIcW4nkj_-PRO8Ny3cmQDxAWN3MCHm9Grv2-ok3arYQPU0wypdDtdLrnEcUA0n9wYoUk0Nv28IHRfPR7qzs' },
  { id: '#PT-1123', name: 'Sophia Taylor', email: 'staylor99@email.com', phone: '+977 9822114455', lastVisitDate: 'May 10, 2026', lastVisitReason: 'Dental Cleaning', bookings: '4', status: 'Missed', noshows: '1', avatarUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuALan3Fe5liRYVvqOzbYPXALuhl1M_JrzKY62jsudutF-Y4kRwnw4no-RMdfy3kIqv1Pwvt4YNwLk09F8-YiOqLdcmDLbD8z8PfxNXA5LulAwItUiFnPDiM2CIPYIlitAQwvN0vTuDjaDgHGdcvqmtnQVICN825lJ_J6Gay2MKwe9QZ5j0m2TW3QgH9DIcW4nkj_-PRO8Ny3cmQDxAWN3MCHm9Grv2-ok3arYQPU0wypdDtdLrnEcUA0n9wYoUk0Nv28IHRfPR7qzs' },
  { id: '#PT-7890', name: 'James Brown', email: 'jamesb@example.com', phone: '+977 9800998877', lastVisitDate: 'Jun 28, 2026', lastVisitReason: 'Eye Exam', bookings: '6', status: 'Active', noshows: '0', avatarUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuALan3Fe5liRYVvqOzbYPXALuhl1M_JrzKY62jsudutF-Y4kRwnw4no-RMdfy3kIqv1Pwvt4YNwLk09F8-YiOqLdcmDLbD8z8PfxNXA5LulAwItUiFnPDiM2CIPYIlitAQwvN0vTuDjaDgHGdcvqmtnQVICN825lJ_J6Gay2MKwe9QZ5j0m2TW3QgH9DIcW4nkj_-PRO8Ny3cmQDxAWN3MCHm9Grv2-ok3arYQPU0wypdDtdLrnEcUA0n9wYoUk0Nv28IHRfPR7qzs' }
];

const PatientsPage: React.FC = () => {
  const navigate = useNavigate();
  const [fullName, setFullName] = useState<string>('Provider');
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Active' | 'Inactive' | 'Missed'>('All');
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);

  const [openActionMenuId, setOpenActionMenuId] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');
    
    // Redirect if no token or role is not 'service_provider'
    if (!token || role !== 'service_provider') {
      navigate('/login');
    } else {
      const storedName = localStorage.getItem('fullName');
      if (storedName) {
        setFullName(storedName);
      }
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
  };

  const closePanel = () => {
    setSelectedPatient(null);
  };

  const filteredPatients = mockPatients.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          p.email.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          p.phone.includes(searchQuery);
    const matchesFilter = statusFilter === 'All' || p.status === statusFilter;
    return matchesSearch && matchesFilter;
  });

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
    link.setAttribute('download', 'patients_directory.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="bg-[#F3F4F6] text-[#151c27] font-sans min-h-screen flex overflow-x-hidden">
      {/* TopNavBar */}
      <header className="fixed top-0 w-full z-50 bg-[#f9f9ff]/80 backdrop-blur-md shadow-sm border-b border-[#c3c5d7]/30">
        <div className="flex justify-between items-center px-4 md:px-10 h-20 w-full">
          <div className="flex items-center gap-4">
            <img
              alt="OmniBook Logo"
              className="object-contain h-[40px]"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuANVa2DIMhxwJVhPP1FnM5XPZK669t-OaZbij7sEQY2BcRjKXoLi4Xlx3422j-PoJTMmPiR5Xs2jHyWkiOQbHG2PC_dwX1bTvLCKfZJr4xERFe5jC_Eg1nCXbH4JYQNcg8LmT7jvnS2rIU1qOMeCUzpati4NDHk55Jw4yD9q-c3RF-j48vJ6qqLiyYcMo90ZH-HOFSGJv14g2VG5oLaR8SvPRMAYcJZQSHy3gVOym_POA_776_joTMmbnqxiUzecB0QZUzztl5CrHw"
            />
            <div className="h-6 w-[1px] bg-[#c3c5d7]/30 mx-2 hidden md:block"></div>
            <span className="text-[#53606c] font-medium hidden md:block">Operations Center</span>
          </div>
          <div className="flex items-center gap-4">
            <NotificationBell />
            
            <div className="hidden lg:flex flex-col items-end mr-2">
              <span className="text-[14px] font-bold text-[#003fb1]">{fullName}</span>
              <span className="text-[12px] text-[#53606c]">Service Provider</span>
            </div>
            
            <div className="ml-2">
              <div className="h-10 w-10 rounded-full overflow-hidden border border-[#c3c5d7] shadow-sm">
                <img
                  alt="User Profile Avatar"
                  className="w-full h-full object-cover"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuALan3Fe5liRYVvqOzbYPXALuhl1M_JrzKY62jsudutF-Y4kRwnw4no-RMdfy3kIqv1Pwvt4YNwLk09F8-YiOqLdcmDLbD8z8PfxNXA5LulAwItUiFnPDiM2CIPYIlitAQwvN0vTuDjaDgHGdcvqmtnQVICN825lJ_J6Gay2MKwe9QZ5j0m2TW3QgH9DIcW4nkj_-PRO8Ny3cmQDxAWN3MCHm9Grv2-ok3arYQPU0wypdDtdLrnEcUA0n9wYoUk0Nv28IHRfPR7qzs"
                />
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* SideNavBar */}
      <nav className="fixed left-0 top-20 h-[calc(100vh-80px)] w-64 bg-[#f0f3ff] border-r border-[#c3c5d7]/30 py-6 px-4 flex flex-col gap-2 z-40 hidden md:flex">
        <div className="mb-4 px-4">
          <div className="flex items-center gap-4">
            <span className="material-symbols-outlined text-[#003fb1]" style={{ fontVariationSettings: "'FILL' 1" }}>
              dashboard
            </span>
            <span className="text-[24px] text-[#003fb1] font-bold">Portal</span>
          </div>
        </div>
        
        <NavLink to="/provider-dashboard" className={({ isActive }) => `flex items-center gap-2 px-3 py-2.5 text-[13px] font-medium rounded-lg transition-all ${isActive ? 'text-[#003fb1] bg-[#1a56db]/10' : 'text-[#3b4854] hover:bg-[#d6e4f3]'}`}>
          <span className="material-symbols-outlined text-[18px]">dashboard</span>
          Dashboard
        </NavLink>
        
        <NavLink to="/master-calendar" className={({ isActive }) => `flex items-center gap-2 px-3 py-2.5 text-[13px] font-medium rounded-lg transition-all ${isActive ? 'text-[#003fb1] bg-[#1a56db]/10' : 'text-[#3b4854] hover:bg-[#d6e4f3]'}`}>
          <span className="material-symbols-outlined text-[18px]">calendar_month</span>
          Master Calendar
        </NavLink>
        
        <NavLink to="/patients" className={({ isActive }) => `flex items-center gap-2 px-3 py-2.5 text-[13px] font-medium rounded-lg transition-all ${isActive ? 'text-[#003fb1] bg-[#1a56db]/10' : 'text-[#3b4854] hover:bg-[#d6e4f3]'}`}>
          <span className="material-symbols-outlined text-[18px]">group</span>
          Patients/Clients
        </NavLink>
        
        <NavLink to="/services" className={({ isActive }) => `flex items-center gap-2 px-3 py-2.5 text-[13px] font-medium rounded-lg transition-all ${isActive ? 'text-[#003fb1] bg-[#1a56db]/10' : 'text-[#3b4854] hover:bg-[#d6e4f3]'}`}>
          <span className="material-symbols-outlined text-[18px]">medical_services</span>
          Services Manager
        </NavLink>
        
        <NavLink to="/analytics" className={({ isActive }) => `flex items-center gap-2 px-3 py-2.5 text-[13px] font-medium rounded-lg transition-all ${isActive ? 'text-[#003fb1] bg-[#1a56db]/10' : 'text-[#3b4854] hover:bg-[#d6e4f3]'}`}>
          <span className="material-symbols-outlined text-[18px]">bar_chart</span>
          Revenue & Analytics
        </NavLink>

        <div className="mt-auto flex flex-col gap-1">
          <NavLink to="/profile-settings" className={({ isActive }) => `flex items-center gap-2 px-3 py-2.5 text-[13px] font-medium rounded-lg transition-all ${isActive ? 'text-[#003fb1] bg-[#1a56db]/10' : 'text-[#3b4854] hover:bg-[#d6e4f3]'}`}>
            <span className="material-symbols-outlined text-[18px]">settings</span>
            Settings
          </NavLink>
          <button onClick={handleLogout} className="flex items-center gap-2 px-3 py-2.5 text-[13px] font-medium rounded-lg transition-all text-[#ba1a1a] hover:bg-[#ffdad6]/20 text-left">
            <span className="material-symbols-outlined text-[18px]">logout</span>
            Log Out
          </button>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="pt-24 pb-8 md:ml-64 px-4 md:px-10 h-screen flex-1 md:w-[calc(100%-256px)] flex flex-col relative overflow-hidden">
        
        {/* Page Header & Controls */}
        <div className="flex flex-wrap items-center justify-between mb-8 shrink-0 gap-4">
          <div>
            <h1 className="text-[32px] font-bold text-[#151c27] tracking-tight">Patient Directory</h1>
            <p className="text-sm font-medium text-[#53606c] mt-1">Manage your {filteredPatients.length} registered patients and viewing history.</p>
          </div>

          <div className="flex items-center gap-4">
            <button onClick={exportCSV} className="px-4 py-2.5 text-sm font-bold text-[#3b4854] bg-white border border-[#c3c5d7] rounded-xl hover:bg-[#f9f9ff] transition flex items-center gap-2 shadow-sm">
              <span className="material-symbols-outlined text-[18px]">download</span> Export CSV
            </button>
            <button className="bg-[#1a56db] hover:bg-[#123e9e] text-white font-bold py-2.5 px-6 rounded-xl flex items-center gap-2 shadow-md transition-all active:scale-95">
              <span className="material-symbols-outlined text-[20px]">add</span> Add Patient
            </button>
          </div>
        </div>

        {/* Search and Filter Bar */}
        <div className="flex flex-wrap sm:flex-nowrap items-center gap-4 mb-6 shrink-0">
          <div className="relative flex-1 w-full max-w-md">
            <span className="material-symbols-outlined absolute left-4 top-1/2 transform -translate-y-1/2 text-[#53606c]">search</span>
            <input 
              type="text" 
              placeholder="Search by name, phone, or email..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-white border border-[#c3c5d7] rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#1a56db]/20 focus:border-[#1a56db] transition-all shadow-sm"
            />
          </div>
          <div className="relative">
            <button 
              onClick={() => setShowFilterDropdown(!showFilterDropdown)} 
              className="px-4 py-3 bg-white border border-[#c3c5d7] rounded-xl text-[#53606c] hover:bg-[#f9f9ff] transition shadow-sm flex items-center gap-2 text-sm font-bold"
            >
              <span className="material-symbols-outlined text-[18px]">filter_alt</span> 
              Filters {statusFilter !== 'All' && <span className="w-2 h-2 rounded-full bg-[#1a56db] ml-1"></span>}
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
                    className={`w-full text-left px-4 py-2 text-sm transition-colors ${statusFilter === status ? 'bg-[#1a56db]/10 text-[#003fb1] font-bold' : 'text-[#3b4854] hover:bg-[#f0f3ff]'}`}
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
          <div className="w-full flex-1 overflow-y-auto overflow-x-hidden custom-scrollbar relative">
            <table className="w-full text-left border-collapse">
              <thead className="bg-[#f9f9ff]/80 sticky top-0 z-10 backdrop-blur-sm">
                <tr>
                  <th className="py-4 px-6 text-[11px] font-bold text-[#53606c] uppercase tracking-wider border-b border-[#c3c5d7]/30">Patient Info</th>
                  <th className="py-4 px-6 text-[11px] font-bold text-[#53606c] uppercase tracking-wider border-b border-[#c3c5d7]/30">Contact</th>
                  <th className="py-4 px-6 text-[11px] font-bold text-[#53606c] uppercase tracking-wider border-b border-[#c3c5d7]/30">Last Visit</th>
                  <th className="py-4 px-6 text-[11px] font-bold text-[#53606c] uppercase tracking-wider border-b border-[#c3c5d7]/30">Total Bookings</th>
                  <th className="py-4 px-6 text-[11px] font-bold text-[#53606c] uppercase tracking-wider border-b border-[#c3c5d7]/30">Status</th>
                  <th className="py-4 px-6 text-[11px] font-bold text-[#53606c] uppercase tracking-wider border-b border-[#c3c5d7]/30 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#c3c5d7]/20">
                
                {filteredPatients.map((patient) => (
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
                          <button 
                            className="w-full text-left px-4 py-2.5 text-sm font-medium text-[#151c27] hover:bg-[#f0f3ff] transition-colors flex items-center gap-2" 
                            onClick={(e) => { e.stopPropagation(); alert('Edit function coming soon'); setOpenActionMenuId(null); }}
                          >
                            <span className="material-symbols-outlined text-[16px]">edit</span> Edit Patient
                          </button>
                          <div className="h-[1px] w-full bg-[#c3c5d7]/30 my-1"></div>
                          <button 
                            className="w-full text-left px-4 py-2.5 text-sm font-medium text-[#ba1a1a] hover:bg-[#ffdad6]/30 transition-colors flex items-center gap-2" 
                            onClick={(e) => { e.stopPropagation(); alert('Delete function coming soon'); setOpenActionMenuId(null); }}
                          >
                            <span className="material-symbols-outlined text-[16px]">delete</span> Delete
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
                {filteredPatients.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-[#53606c] font-medium">
                      No patients found matching your search criteria.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          
          {/* Table Footer / Pagination */}
          <div className="border-t border-[#c3c5d7]/50 bg-[#f9f9ff] p-4 flex flex-wrap items-center justify-between shrink-0 gap-4">
            <span className="text-sm text-[#53606c] font-medium">Showing {filteredPatients.length > 0 ? 1 : 0} to {filteredPatients.length} of {filteredPatients.length} entries</span>
            <div className="flex items-center gap-2">
              <button className="px-3 py-1.5 border border-[#c3c5d7] rounded-lg text-[#53606c] bg-white hover:bg-[#f9f9ff] disabled:opacity-50 text-sm font-semibold shadow-sm transition" disabled>Previous</button>
              <button className="w-8 h-8 flex items-center justify-center rounded-lg bg-[#1a56db] text-white font-bold text-sm shadow-sm transition">1</button>
              <button className="px-3 py-1.5 border border-[#c3c5d7] rounded-lg text-[#53606c] bg-white hover:bg-[#f9f9ff] disabled:opacity-50 text-sm font-semibold shadow-sm transition" disabled>Next</button>
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
            <div className="absolute top-20 right-0 bottom-0 w-[420px] max-w-full bg-white shadow-2xl z-[40] flex flex-col overflow-hidden animate-[slideInRight_0.3s_ease-out]">
              
              {/* Panel Header */}
              <div className="px-8 py-6 flex justify-between items-start border-b border-[#c3c5d7]/30 bg-[#f9f9ff]">
                <h3 className="font-bold text-[#151c27] text-lg">Patient Overview</h3>
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
                    <h4 className="font-bold text-[#151c27]">Internal Provider Notes</h4>
                    <button className="text-xs font-bold text-[#1a56db] hover:underline">Edit Notes</button>
                  </div>
                  <div className="bg-[#fff8e6] p-4 rounded-xl border border-[#ffeaad] text-sm text-[#b38600] shadow-sm leading-relaxed">
                    Allergic to Penicillin. Prefers morning appointments. Requires wheelchair accessibility upon arrival.
                  </div>
                </div>
                
                {/* Quick Actions List */}
                <h4 className="font-bold text-[#151c27] mb-3">Quick Actions</h4>
                <div className="space-y-2">
                  <button className="w-full text-left px-4 py-3 rounded-xl border border-[#c3c5d7]/50 hover:border-[#1a56db] hover:bg-[#1a56db]/5 font-semibold text-[#3b4854] hover:text-[#003fb1] transition flex items-center justify-between group">
                    <span className="flex items-center gap-3"><span className="material-symbols-outlined text-[#53606c] group-hover:text-[#1a56db] transition">edit_calendar</span> Book New Appointment</span>
                    <span className="material-symbols-outlined text-[18px] text-[#c3c5d7]">chevron_right</span>
                  </button>
                  <button className="w-full text-left px-4 py-3 rounded-xl border border-[#c3c5d7]/50 hover:border-[#1a56db] hover:bg-[#1a56db]/5 font-semibold text-[#3b4854] hover:text-[#003fb1] transition flex items-center justify-between group">
                    <span className="flex items-center gap-3"><span className="material-symbols-outlined text-[#53606c] group-hover:text-[#1a56db] transition">history</span> View Medical/Booking History</span>
                    <span className="material-symbols-outlined text-[18px] text-[#c3c5d7]">chevron_right</span>
                  </button>
                </div>
              </div>
            </div>
          </>
        )}
      </main>

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
