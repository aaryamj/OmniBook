import React, { useEffect, useState } from 'react';
import { useNavigate, NavLink } from 'react-router-dom';
import NotificationBell from '../userPage/NotificationBell';

interface Service {
  id: string;
  name: string;
  category: string;
  duration: string;
  price: string;
  status: boolean;
}

const initialServices: Service[] = [
  { id: '1', name: 'General Consultation', category: 'Cardiology', duration: '30 mins', price: '1,500', status: true },
  { id: '2', name: 'ECG Screening', category: 'Cardiology', duration: '15 mins', price: '2,200', status: true }
];

const ServicesManagerPage: React.FC = () => {
  const navigate = useNavigate();
  const [fullName, setFullName] = useState<string>('Provider');
  
  const [services, setServices] = useState<Service[]>(initialServices);
  const [panelOpen, setPanelOpen] = useState(false);
  const [panelTitle, setPanelTitle] = useState('Add New Service');
  
  const [formData, setFormData] = useState({ name: '', category: '', price: '', duration: '30 mins' });

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

  const handleLogout = (e: React.MouseEvent) => {
    e.preventDefault();
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('fullName');
    navigate('/login');
  };

  const openPanel = (title: string) => {
    setPanelTitle(title);
    if (title === 'Add New Service') {
      setFormData({ name: '', category: '', price: '', duration: '30 mins' });
    }
    setPanelOpen(true);
  };

  const closePanel = () => {
    setPanelOpen(false);
  };

  const handleSave = () => {
    if (!formData.name.trim() || !formData.price.trim()) return;

    if (panelTitle === 'Add New Service') {
      const newService: Service = {
        id: Math.random().toString(36).substr(2, 9),
        name: formData.name,
        category: formData.category.trim() || 'General',
        duration: formData.duration,
        price: Number(formData.price).toLocaleString(), // formats like 1,500
        status: true
      };
      setServices([...services, newService]);
    } else {
      // Edit logic could go here
    }
    closePanel();
  };

  const toggleStatus = (id: string) => {
    setServices(services.map(s => s.id === id ? { ...s, status: !s.status } : s));
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
        
        {/* Header */}
        <div className="flex items-center justify-between mb-8 shrink-0">
          <div>
            <h1 className="text-[32px] font-bold text-[#151c27] tracking-tight">Services Manager</h1>
            <p className="text-sm font-medium text-[#53606c] mt-1">Configure your clinic's offerings and pricing.</p>
          </div>
          <button onClick={() => openPanel('Add New Service')} className="bg-[#1a56db] hover:bg-[#123e9e] text-white font-bold py-2.5 px-6 rounded-xl flex items-center gap-2 shadow-md transition-all active:scale-95">
            <span className="material-symbols-outlined text-[20px]">add</span> Add Service
          </button>
        </div>

        {/* Services Table */}
        <div className="flex-1 bg-white rounded-2xl border border-[#c3c5d7]/50 shadow-sm flex flex-col mb-4 overflow-hidden">
          <div className="w-full flex-1 overflow-y-auto overflow-x-hidden custom-scrollbar relative">
            <table className="w-full text-left border-collapse">
              <thead className="bg-[#f9f9ff]/80 sticky top-0 z-10 backdrop-blur-sm">
                <tr>
                  <th className="py-4 px-6 text-[11px] font-bold text-[#53606c] uppercase tracking-wider border-b border-[#c3c5d7]/30">Service Name</th>
                  <th className="py-4 px-6 text-[11px] font-bold text-[#53606c] uppercase tracking-wider border-b border-[#c3c5d7]/30">Category</th>
                  <th className="py-4 px-6 text-[11px] font-bold text-[#53606c] uppercase tracking-wider border-b border-[#c3c5d7]/30">Duration</th>
                  <th className="py-4 px-6 text-[11px] font-bold text-[#53606c] uppercase tracking-wider border-b border-[#c3c5d7]/30">Price</th>
                  <th className="py-4 px-6 text-[11px] font-bold text-[#53606c] uppercase tracking-wider border-b border-[#c3c5d7]/30">Status</th>
                  <th className="py-4 px-6 text-[11px] font-bold text-[#53606c] uppercase tracking-wider border-b border-[#c3c5d7]/30 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#c3c5d7]/20">
                {services.map(service => (
                  <tr key={service.id} className={`hover:bg-[#f9f9ff] transition-all duration-300 ${!service.status ? 'opacity-50 grayscale blur-[0.5px]' : ''}`}>
                    <td className="py-4 px-6 font-bold text-[#151c27]">{service.name}</td>
                    <td className="py-4 px-6 text-sm text-[#53606c]">{service.category}</td>
                    <td className="py-4 px-6 text-sm text-[#53606c]">{service.duration}</td>
                    <td className="py-4 px-6 font-bold text-[#151c27]">रू {service.price}</td>
                    <td className="py-4 px-6">
                      <button 
                        onClick={() => toggleStatus(service.id)} 
                        className={`w-10 h-5 rounded-full relative transition-colors duration-200 ${service.status ? 'bg-[#006f4b]' : 'bg-[#c3c5d7]'}`}
                      >
                        <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-all duration-200 ${service.status ? 'right-1' : 'left-1'}`}></span>
                      </button>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-3">
                        <button 
                          className="text-[#ba1a1a] hover:bg-[#ffdad6]/50 p-1.5 rounded-lg transition-colors flex items-center justify-center disabled:opacity-50 disabled:hover:bg-transparent"
                          onClick={() => alert('Delete clicked')}
                          disabled={!service.status}
                        >
                          <span className="material-symbols-outlined text-[20px]">delete</span>
                        </button>
                        <button 
                          onClick={() => openPanel('Edit Service')} 
                          className="text-[#1a56db] font-bold hover:underline disabled:no-underline disabled:opacity-50"
                          disabled={!service.status}
                        >
                          Edit
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        
        {/* Slide Panel Overlay & Details */}
        {panelOpen && (
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
                <h3 className="font-bold text-[#151c27] text-lg">{panelTitle}</h3>
                <button 
                  className="w-8 h-8 rounded-full bg-[#f0f3ff] hover:bg-[#dce2f3] text-[#53606c] flex items-center justify-center transition-colors"
                  onClick={closePanel}
                >
                  <span className="material-symbols-outlined text-[18px]">close</span>
                </button>
              </div>
              
              {/* Panel Body */}
              <div className="flex-1 overflow-y-auto p-8 space-y-5">
                <div>
                  <label className="block text-sm font-bold text-[#3b4854] mb-2">Service Name</label>
                  <input 
                    type="text" 
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full px-4 py-3 rounded-xl border border-[#c3c5d7] focus:ring-2 focus:ring-[#1a56db]/20 focus:border-[#1a56db] outline-none transition-all shadow-sm text-sm" 
                    placeholder="e.g. Dental Cleaning" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-[#3b4854] mb-2">Category</label>
                  <input 
                    type="text" 
                    value={formData.category}
                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                    className="w-full px-4 py-3 rounded-xl border border-[#c3c5d7] focus:ring-2 focus:ring-[#1a56db]/20 focus:border-[#1a56db] outline-none transition-all shadow-sm text-sm" 
                    placeholder="e.g. Cardiology, Dentistry, General" 
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-[#3b4854] mb-2">Price (रू)</label>
                    <input 
                      type="number" 
                      value={formData.price}
                      onChange={(e) => setFormData({...formData, price: e.target.value})}
                      className="w-full px-4 py-3 rounded-xl border border-[#c3c5d7] focus:ring-2 focus:ring-[#1a56db]/20 focus:border-[#1a56db] outline-none transition-all shadow-sm text-sm" 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-[#3b4854] mb-2">Duration</label>
                    <select 
                      value={formData.duration}
                      onChange={(e) => setFormData({...formData, duration: e.target.value})}
                      className="w-full px-4 py-3 rounded-xl border border-[#c3c5d7] focus:ring-2 focus:ring-[#1a56db]/20 focus:border-[#1a56db] outline-none transition-all shadow-sm text-sm bg-white"
                    >
                      <option value="15 mins">15 mins</option>
                      <option value="30 mins">30 mins</option>
                      <option value="60 mins">60 mins</option>
                    </select>
                  </div>
                </div>
                
                <div className="pt-4">
                  <button 
                    onClick={handleSave}
                    className="w-full bg-[#1a56db] hover:bg-[#123e9e] text-white font-bold py-3.5 rounded-xl transition-all shadow-md active:scale-95 disabled:opacity-50"
                    disabled={!formData.name.trim() || !formData.price.trim()}
                  >
                    Save Service
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

export default ServicesManagerPage;
