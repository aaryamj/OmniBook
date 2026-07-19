import React, { useEffect, useState } from 'react';
import { useNavigate, NavLink } from 'react-router-dom';
import NotificationBell from '../userPage/NotificationBell';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar 
} from 'recharts';

interface Transaction {
  id: string;
  patient: string;
  service: string;
  amount: string;
  status: string;
  date: string;
}

const mockTransactions: Transaction[] = [
  { id: '#TXN-8902', patient: 'Bikash Adhikari', service: 'General Consultation', amount: '2,500', status: 'Confirmed', date: 'Oct 12, 2024' },
  { id: '#TXN-8899', patient: 'Sita Tamang', service: 'Dermatology Follow-up', amount: '4,000', status: 'Pending', date: 'Oct 12, 2024' },
  { id: '#TXN-8895', patient: 'Rajesh Hamal', service: 'Advanced Cardiology', amount: '12,500', status: 'Confirmed', date: 'Oct 11, 2024' },
];

const revenueData = [
  { name: 'Jan', mrr: 100000 },
  { name: 'Feb', mrr: 150000 },
  { name: 'Mar', mrr: 220000 },
  { name: 'Apr', mrr: 280000 },
  { name: 'May', mrr: 350000 },
  { name: 'Jun', mrr: 485000 },
];

const topServicesData = [
  { name: 'Consultation', volume: 450 },
  { name: 'ECG Screening', volume: 300 },
  { name: 'Dental', volume: 280 },
  { name: 'Blood Test', volume: 150 },
  { name: 'Dermatology', volume: 110 },
];

const RevenueAnalyticsPage: React.FC = () => {
  const navigate = useNavigate();
  const [fullName, setFullName] = useState<string>('Provider');
  const [dateFilter, setDateFilter] = useState('Last 30 Days');
  const [searchQuery, setSearchQuery] = useState('');
  
  const [showTrendMenu, setShowTrendMenu] = useState(false);
  const [trendChartType, setTrendChartType] = useState('area');
  
  const [showServiceMenu, setShowServiceMenu] = useState(false);
  const [serviceSortOrder, setServiceSortOrder] = useState('desc');

  const sortedServicesData = [...topServicesData].sort((a, b) => 
    serviceSortOrder === 'desc' ? b.volume - a.volume : a.volume - b.volume
  );

  const filteredTransactions = mockTransactions.filter(txn => 
    txn.patient.toLowerCase().includes(searchQuery.toLowerCase()) ||
    txn.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    txn.service.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getFilteredData = (filter: string) => {
    switch (filter) {
      case 'Today': return { rev: 'रू 14,500', appts: '12', showRate: '0.0%' };
      case 'Last 7 Days': return { rev: 'रू 98,000', appts: '254', showRate: '1.2%' };
      case 'Last 90 Days': return { rev: 'रू 12,45,000', appts: '3,842', showRate: '3.1%' };
      case 'Last 30 Days':
      default: return { rev: 'रू 4,20,000', appts: '1,204', showRate: '2.4%' };
    }
  };
  const currentStats = getFilteredData(dateFilter);

  const handleExport = () => {
    const headers = ['Transaction ID', 'Patient', 'Service', 'Amount', 'Status', 'Date'];
    const csvContent = [
      headers.join(','),
      ...mockTransactions.map(t => `${t.id},${t.patient},${t.service},"${t.amount}",${t.status},"${t.date}"`)
    ].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', `Revenue_Report_${dateFilter.replace(/ /g, '_')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');
    
    if (!token || role !== 'service_provider') {
      navigate('/login');
    } else {
      const storedName = localStorage.getItem('fullName');
      if (storedName) {
        setFullName(storedName);
      }
    }
  }, [navigate]);

  const handleLogout = (e: React.MouseEvent) => {
    e.preventDefault();
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('fullName');
    navigate('/login');
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
          <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>analytics</span>
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
      <main className="pt-24 pb-8 md:ml-64 px-4 md:px-10 flex-1 md:w-[calc(100%-256px)] overflow-y-auto">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-[32px] font-bold text-[#151c27] tracking-tight">Analytics Overview</h1>
            <p className="text-sm font-medium text-[#53606c] mt-1">Real-time revenue performance and booking trends.</p>
          </div>
          <div className="flex gap-3">
            <div className="relative">
              <select 
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="appearance-none bg-white text-[#003fb1] border border-[#c3c5d7] pl-10 pr-8 py-2 rounded-lg flex items-center gap-2 hover:bg-[#f9f9ff] transition-colors shadow-sm font-semibold text-sm outline-none focus:ring-2 focus:ring-[#1a56db]/20 focus:border-[#1a56db] cursor-pointer"
              >
                <option value="Today" className="text-[#151c27]">Today</option>
                <option value="Last 7 Days" className="text-[#151c27]">Last 7 Days</option>
                <option value="Last 30 Days" className="text-[#151c27]">Last 30 Days</option>
                <option value="Last 90 Days" className="text-[#151c27]">Last 90 Days</option>
              </select>
              <span className="material-symbols-outlined text-[18px] text-[#003fb1] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">calendar_today</span>
              <span className="material-symbols-outlined text-[18px] text-[#003fb1] absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none">arrow_drop_down</span>
            </div>
            <button onClick={handleExport} className="bg-[#1a56db] text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-[#123e9e] transition-colors shadow-sm font-semibold text-sm active:scale-95">
              <span className="material-symbols-outlined text-[18px]">download</span>
              Export Report
            </button>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Total Revenue */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#c3c5d7]/30 hover:-translate-y-1 hover:shadow-md transition-all">
            <div className="flex justify-between items-start mb-4">
              <div className="w-12 h-12 bg-[#e2e8f8] rounded-full flex items-center justify-center">
                <span className="material-symbols-outlined text-[#003fb1]" style={{ fontVariationSettings: "'FILL' 1" }}>payments</span>
              </div>
              <span className="text-[#005438] bg-[#6ffbbe]/30 px-2.5 py-1 rounded-full text-xs font-bold">+12.5%</span>
            </div>
            <p className="text-[#53606c] font-medium text-sm">Total Revenue</p>
            <h3 className="text-2xl font-bold text-[#151c27] mt-1">{currentStats.rev}</h3>
            <p className="text-xs text-[#737686] mt-2 italic">in {dateFilter}</p>
          </div>

          {/* Appointments */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#c3c5d7]/30 hover:-translate-y-1 hover:shadow-md transition-all">
            <div className="flex justify-between items-start mb-4">
              <div className="w-12 h-12 bg-[#e2e8f8] rounded-full flex items-center justify-center">
                <span className="material-symbols-outlined text-[#003fb1]" style={{ fontVariationSettings: "'FILL' 1" }}>event_available</span>
              </div>
              <span className="text-[#005438] bg-[#6ffbbe]/30 px-2.5 py-1 rounded-full text-xs font-bold">+8.2%</span>
            </div>
            <p className="text-[#53606c] font-medium text-sm">Appointments</p>
            <h3 className="text-2xl font-bold text-[#151c27] mt-1">{currentStats.appts}</h3>
            <p className="text-xs text-[#737686] mt-2 italic">in {dateFilter}</p>
          </div>

          {/* No-Show Rate */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#c3c5d7]/30 hover:-translate-y-1 hover:shadow-md transition-all">
            <div className="flex justify-between items-start mb-4">
              <div className="w-12 h-12 bg-[#ffdad6]/50 rounded-full flex items-center justify-center">
                <span className="material-symbols-outlined text-[#ba1a1a]" style={{ fontVariationSettings: "'FILL' 1" }}>event_busy</span>
              </div>
              <span className="text-[#005438] bg-[#6ffbbe]/30 px-2.5 py-1 rounded-full text-xs font-bold">-0.5% Improved</span>
            </div>
            <p className="text-[#53606c] font-medium text-sm">No-Show Rate</p>
            <h3 className="text-2xl font-bold text-[#151c27] mt-1">{currentStats.showRate}</h3>
            <p className="text-xs text-[#737686] mt-2 italic">in {dateFilter}</p>
          </div>
        </div>

        {/* Visualizations */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          
          {/* Appointment Trends Chart */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#c3c5d7]/30 flex flex-col">
            <div className="flex justify-between items-center mb-6">
              <h4 className="font-bold text-lg text-[#151c27]">Appointment Trends</h4>
              <div className="relative">
                <button 
                  onClick={() => setShowTrendMenu(!showTrendMenu)}
                  className="w-8 h-8 rounded-lg hover:bg-[#f0f3ff] flex items-center justify-center transition-colors"
                >
                  <span className="material-symbols-outlined text-[#53606c]">more_vert</span>
                </button>
                {showTrendMenu && (
                  <div className="absolute right-0 top-10 w-48 bg-white border border-[#c3c5d7] shadow-lg rounded-xl z-10 py-2">
                    <button onClick={() => { setTrendChartType('area'); setShowTrendMenu(false); }} className={`w-full text-left px-4 py-2 hover:bg-[#f0f3ff] text-sm font-medium ${trendChartType === 'area' ? 'text-[#003fb1]' : 'text-[#3b4854]'}`}>Area Chart</button>
                    <button onClick={() => { setTrendChartType('bar'); setShowTrendMenu(false); }} className={`w-full text-left px-4 py-2 hover:bg-[#f0f3ff] text-sm font-medium ${trendChartType === 'bar' ? 'text-[#003fb1]' : 'text-[#3b4854]'}`}>Bar Chart</button>
                  </div>
                )}
              </div>
            </div>
            <div className="flex-1 min-h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                {trendChartType === 'area' ? (
                  <AreaChart data={revenueData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorMrr" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#1a56db" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#1a56db" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f8" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#53606c', fontSize: 12}} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{fill: '#53606c', fontSize: 12}} tickFormatter={(value) => `${value / 1000}k`} />
                    <Tooltip 
                      contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                      formatter={(value: number) => [`रू ${value.toLocaleString()}`, 'Revenue']}
                    />
                    <Area type="monotone" dataKey="mrr" stroke="#1a56db" strokeWidth={3} fillOpacity={1} fill="url(#colorMrr)" />
                  </AreaChart>
                ) : (
                  <BarChart data={revenueData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f8" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#53606c', fontSize: 12}} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{fill: '#53606c', fontSize: 12}} tickFormatter={(value) => `${value / 1000}k`} />
                    <Tooltip 
                      contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                      cursor={{fill: '#f0f3ff'}}
                      formatter={(value: number) => [`रू ${value.toLocaleString()}`, 'Revenue']}
                    />
                    <Bar dataKey="mrr" fill="#1a56db" radius={[4, 4, 0, 0]} barSize={32} />
                  </BarChart>
                )}
              </ResponsiveContainer>
            </div>
          </div>

          {/* Top Services Chart */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#c3c5d7]/30 flex flex-col">
            <div className="flex justify-between items-center mb-6">
              <h4 className="font-bold text-lg text-[#151c27]">Top Services by Volume</h4>
              <div className="relative">
                <button 
                  onClick={() => setShowServiceMenu(!showServiceMenu)}
                  className="w-8 h-8 rounded-lg hover:bg-[#f0f3ff] flex items-center justify-center transition-colors"
                >
                  <span className="material-symbols-outlined text-[#53606c]">filter_list</span>
                </button>
                {showServiceMenu && (
                  <div className="absolute right-0 top-10 w-48 bg-white border border-[#c3c5d7] shadow-lg rounded-xl z-10 py-2">
                    <button onClick={() => { setServiceSortOrder('desc'); setShowServiceMenu(false); }} className={`w-full text-left px-4 py-2 hover:bg-[#f0f3ff] text-sm font-medium ${serviceSortOrder === 'desc' ? 'text-[#003fb1]' : 'text-[#3b4854]'}`}>Sort Highest Volume</button>
                    <button onClick={() => { setServiceSortOrder('asc'); setShowServiceMenu(false); }} className={`w-full text-left px-4 py-2 hover:bg-[#f0f3ff] text-sm font-medium ${serviceSortOrder === 'asc' ? 'text-[#003fb1]' : 'text-[#3b4854]'}`}>Sort Lowest Volume</button>
                  </div>
                )}
              </div>
            </div>
            <div className="flex-1 min-h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={sortedServicesData} layout="vertical" margin={{ top: 10, right: 30, left: 20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f8" />
                  <XAxis type="number" axisLine={false} tickLine={false} tick={{fill: '#53606c', fontSize: 12}} />
                  <YAxis type="category" dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#151c27', fontSize: 12, fontWeight: 500}} width={100} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    cursor={{fill: '#f0f3ff'}}
                  />
                  <Bar dataKey="volume" fill="#003fb1" radius={[0, 4, 4, 0]} barSize={24} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

        </div>

        {/* Detailed Table Section */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#c3c5d7]/30 mb-8">
          <div className="flex flex-col md:flex-row justify-between md:items-center mb-6 gap-4">
            <h4 className="font-bold text-lg text-[#151c27]">Recent Transaction Log</h4>
            <div className="relative max-w-xs w-full">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#53606c] text-[20px]">search</span>
              <input 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-[#c3c5d7] rounded-full text-sm focus:ring-2 focus:ring-[#1a56db]/20 focus:border-[#1a56db] outline-none transition-all" 
                placeholder="Search transactions..." 
                type="text"
              />
            </div>
          </div>
          
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#c3c5d7]/50">
                  <th className="pb-3 px-4 text-xs font-bold text-[#53606c] uppercase tracking-wider">Transaction ID</th>
                  <th className="pb-3 px-4 text-xs font-bold text-[#53606c] uppercase tracking-wider">Patient</th>
                  <th className="pb-3 px-4 text-xs font-bold text-[#53606c] uppercase tracking-wider">Service</th>
                  <th className="pb-3 px-4 text-xs font-bold text-[#53606c] uppercase tracking-wider">Amount</th>
                  <th className="pb-3 px-4 text-xs font-bold text-[#53606c] uppercase tracking-wider">Status</th>
                  <th className="pb-3 px-4 text-xs font-bold text-[#53606c] uppercase tracking-wider">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#c3c5d7]/20">
                {filteredTransactions.length > 0 ? (
                  filteredTransactions.map((txn, index) => (
                    <tr key={txn.id} className={index % 2 === 0 ? 'bg-[#f0f3ff]/30' : ''}>
                      <td className="py-4 px-4 font-mono text-sm text-[#3b4854]">{txn.id}</td>
                      <td className="py-4 px-4 font-bold text-[#151c27]">{txn.patient}</td>
                      <td className="py-4 px-4 text-sm text-[#53606c]">{txn.service}</td>
                      <td className="py-4 px-4 font-bold text-[#003fb1]">रू {txn.amount}</td>
                      <td className="py-4 px-4">
                        {txn.status === 'Confirmed' ? (
                          <span className="bg-[#6ffbbe]/30 text-[#005438] px-3 py-1 rounded-full text-xs font-bold">Confirmed</span>
                        ) : (
                          <span className="bg-[#dce2f3] text-[#3b4854] px-3 py-1 rounded-full text-xs font-bold">Pending</span>
                        )}
                      </td>
                      <td className="py-4 px-4 text-sm text-[#737686]">{txn.date}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-sm text-[#53606c]">
                      No transactions found matching "{searchQuery}"
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <div className="mt-6 flex justify-center">
            <button className="text-[#1a56db] font-bold text-sm hover:underline flex items-center gap-2">
              View Full History
              <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
            </button>
          </div>
        </div>

      </main>
    </div>
  );
};

export default RevenueAnalyticsPage;
