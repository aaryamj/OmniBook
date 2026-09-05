import React, { useEffect, useState } from 'react';
import { useNavigate, NavLink } from 'react-router-dom';
import axios from 'axios';
import ProviderTopNavigation from './components/ProviderTopNavigation';

interface Service {
  id: string;
  name: string;
  category: string;
  duration: string;
  price: string;
  status: boolean;
  isTelemedicine: boolean;
}

const ServicesManagerPage: React.FC = () => {
  const navigate = useNavigate();
  
  const [services, setServices] = useState<Service[]>([]);
  const [panelOpen, setPanelOpen] = useState(false);
  const [panelTitle, setPanelTitle] = useState('Add New Service');
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({ name: '', category: '', price: '', duration: '30', isTelemedicine: false });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchServices = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:8080/api/v1/provider/services', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data.success) {
        const fetchedServices = response.data.services.map((s: any) => ({
          id: s.id.toString(),
          name: s.serviceName,
          category: s.category || 'General',
          duration: `${s.durationMinutes} mins`,
          price: s.fee.toString(),
          status: s.isActive,
          isTelemedicine: s.isTelemedicine
        }));
        setServices(fetchedServices);
      }
    } catch (err) {
      console.error('Failed to fetch services', err);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');
    
    // Redirect if no token or role is not 'service_provider'
    if (!token || role !== 'service_provider') {
      navigate('/login');
    } else {
      fetchServices();
    }
  }, [navigate]);

  const handleLogout = (e: React.MouseEvent) => {
    e.preventDefault();
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('fullName');
    navigate('/login');
  };

  const openPanel = (title: string, service?: Service) => {
    setPanelTitle(title);
    setError('');
    if (title === 'Add New Service') {
      setFormData({ name: '', category: '', price: '', duration: '30', isTelemedicine: false });
      setEditingId(null);
    } else if (service) {
      setFormData({ 
        name: service.name, 
        category: service.category, 
        price: service.price.replace(/,/g, ''), 
        duration: service.duration.split(' ')[0],
        isTelemedicine: service.isTelemedicine
      });
      setEditingId(service.id);
    }
    setPanelOpen(true);
  };

  const closePanel = () => {
    setPanelOpen(false);
  };

  const handleSave = async () => {
    if (!formData.name.trim() || !formData.price.toString().trim()) return;
    setIsLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      const payload = {
        serviceName: formData.name,
        category: formData.category.trim() || 'General',
        durationMinutes: parseInt(formData.duration),
        fee: parseFloat(formData.price),
        isTelemedicine: formData.isTelemedicine,
        isActive: true
      };

      if (panelTitle === 'Add New Service') {
        await axios.post('http://localhost:8080/api/v1/provider/services/single', payload, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } else if (editingId) {
        await axios.put(`http://localhost:8080/api/v1/provider/services/${editingId}`, payload, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }
      await fetchServices();
      closePanel();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save service');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleStatus = async (id: string) => {
    try {
      const service = services.find(s => s.id === id);
      if (!service) return;
      const token = localStorage.getItem('token');
      await axios.put(`http://localhost:8080/api/v1/provider/services/${id}`, { isActive: !service.status }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      await fetchServices();
    } catch (err) {
      console.error('Failed to toggle status', err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this service?')) return;
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:8080/api/v1/provider/services/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      await fetchServices();
    } catch (err) {
      console.error('Failed to delete service', err);
    }
  };

  return (
    <div className="bg-[#F3F4F6] text-[#151c27] font-sans h-screen flex flex-col overflow-hidden relative">
      <ProviderTopNavigation />

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
          <NavLink to="/provider/settings" className={({ isActive }) => `flex items-center gap-2 px-3 py-2.5 text-[13px] font-medium rounded-lg transition-all ${isActive ? 'text-[#003fb1] bg-[#1a56db]/10' : 'text-[#3b4854] hover:bg-[#d6e4f3]'}`}>
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
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 sm:mb-8 shrink-0 gap-4">
          <div>
            <h1 className="text-2xl sm:text-[32px] font-bold text-[#151c27] tracking-tight">Services Manager</h1>
            <p className="text-sm font-medium text-[#53606c] mt-1">Configure your clinic's offerings and pricing.</p>
          </div>
          <button onClick={() => openPanel('Add New Service')} className="bg-[#1a56db] hover:bg-[#123e9e] text-white font-bold py-2.5 px-6 rounded-xl flex items-center justify-center gap-2 shadow-md transition-all active:scale-95 cursor-pointer w-full sm:w-auto">
            <span className="material-symbols-outlined text-[20px]">add</span> Add Service
          </button>
        </div>

        {/* Services Table */}
        <div className="flex-1 bg-white rounded-2xl border border-[#c3c5d7]/50 shadow-sm flex flex-col mb-4 overflow-hidden">
          <div className="w-full flex-1 overflow-y-auto overflow-x-auto custom-scrollbar relative">
            <table className="w-full min-w-[700px] text-left border-collapse">
              <thead className="bg-[#f9f9ff]/80 sticky top-0 z-10 backdrop-blur-sm">
                <tr>
                  <th className="py-4 px-6 text-[11px] font-bold text-[#53606c] uppercase tracking-wider border-b border-[#c3c5d7]/30">Service Name</th>
                  <th className="py-4 px-6 text-[11px] font-bold text-[#53606c] uppercase tracking-wider border-b border-[#c3c5d7]/30">Category</th>
                  <th className="py-4 px-6 text-[11px] font-bold text-[#53606c] uppercase tracking-wider border-b border-[#c3c5d7]/30">Duration</th>
                  <th className="py-4 px-6 text-[11px] font-bold text-[#53606c] uppercase tracking-wider border-b border-[#c3c5d7]/30">Price</th>
                  <th className="py-4 px-6 text-[11px] font-bold text-[#53606c] uppercase tracking-wider border-b border-[#c3c5d7]/30">Telemedicine</th>
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
                      {service.isTelemedicine ? (
                        <span className="inline-flex items-center gap-1.5 py-1 px-2.5 rounded-md bg-[#e6f3ff] text-[#00668a] text-[12px] font-bold">
                          <span className="material-symbols-outlined text-[16px]">videocam</span> Yes
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 py-1 px-2.5 rounded-md bg-[#f2f4f6] text-[#53606c] text-[12px] font-bold">
                          <span className="material-symbols-outlined text-[16px]">person</span> No
                        </span>
                      )}
                    </td>
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
                          onClick={() => handleDelete(service.id)}
                          disabled={!service.status}
                        >
                          <span className="material-symbols-outlined text-[20px]">delete</span>
                        </button>
                        <button 
                          onClick={() => openPanel('Edit Service', service)} 
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
            <div className="absolute top-20 right-0 bottom-0 w-full sm:w-[420px] max-w-full bg-white shadow-2xl z-[40] flex flex-col overflow-hidden animate-[slideInRight_0.3s_ease-out]">
              
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
                      <option value="15">15 mins</option>
                      <option value="30">30 mins</option>
                      <option value="45">45 mins</option>
                      <option value="60">60 mins</option>
                    </select>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 bg-[#f2f4f6] border border-[#c3c5d7] rounded-xl mt-2">
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-[#00668a]">videocam</span>
                    <span className="text-[14px] font-medium text-[#151c27]">Telemedicine (Video Call)</span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      className="sr-only peer" 
                      checked={formData.isTelemedicine}
                      onChange={(e) => setFormData({...formData, isTelemedicine: e.target.checked})}
                    />
                    <div className="w-11 h-6 bg-[#c3c5d7] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#006f4b]"></div>
                  </label>
                </div>
                
                {error && <div className="text-red-500 text-sm font-bold">{error}</div>}
                
                <div className="pt-4">
                  <button 
                    onClick={handleSave}
                    className="w-full bg-[#1a56db] hover:bg-[#123e9e] text-white font-bold py-3.5 rounded-xl transition-all shadow-md active:scale-95 disabled:opacity-50"
                    disabled={!formData.name.trim() || !formData.price.toString().trim() || isLoading}
                  >
                    {isLoading ? 'Saving...' : 'Save Service'}
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
