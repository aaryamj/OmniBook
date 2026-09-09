import React, { useEffect, useState } from 'react';
import { useNavigate, NavLink } from 'react-router-dom';
import axios from 'axios';
import ProviderTopNavigation from './components/ProviderTopNavigation';
import ProviderSidebar from './components/ProviderSidebar';
import { useOrganizationTerms } from '../../utils/organizationTerms';

interface Service {
  id: string;
  name: string;
  category: string;
  duration: string;
  price: string;
  status: boolean;
  isTelemedicine: boolean;
  maxSeats: number;
}

const ServicesManagerPage: React.FC = () => {
  const terms = useOrganizationTerms();
  const navigate = useNavigate();
  
  const [services, setServices] = useState<Service[]>([]);
  const [panelOpen, setPanelOpen] = useState(false);
  const [panelTitle, setPanelTitle] = useState('Add New Service');
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({ name: '', category: '', price: '', duration: '30', isTelemedicine: false, maxSeats: '1' });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const tenantRoleName = localStorage.getItem('tenantRoleName');
  const permissionsJson = localStorage.getItem('permissionsJson');

  const { hasServicesRead, hasServicesWrite } = React.useMemo(() => {
    if (!permissionsJson) return { hasServicesRead: true, hasServicesWrite: true };
    try {
      const p = JSON.parse(permissionsJson);
      return {
        hasServicesRead: p.services?.read ?? true,
        hasServicesWrite: p.services?.write ?? true
      };
    } catch (e) {
      return { hasServicesRead: true, hasServicesWrite: true };
    }
  }, [permissionsJson]);

  const {
    virtualColumnHeader,
    serviceNameLabel,
    serviceNamePlaceholder,
    categoryLabel,
    categoryPlaceholder,
    virtualToggleLabel,
    virtualToggleDescription,
    durationOptions
  } = React.useMemo(() => {
    const norm = (terms.facilityLabel || '').toLowerCase();
    
    if (norm.includes('college') || norm.includes('acad') || norm.includes('univ')) {
      return {
        virtualColumnHeader: 'Virtual / Online',
        serviceNameLabel: `${terms.serviceSingular} Name`,
        serviceNamePlaceholder: 'e.g. Advanced Calculus, Intro to Python, Macroeconomics',
        categoryLabel: 'Department / Faculty / Subject',
        categoryPlaceholder: 'e.g. Computer Science, Mathematics, School of Business',
        virtualToggleLabel: 'Virtual / Online Class (Video Call)',
        virtualToggleDescription: 'Allow students to join this lecture or office hour remotely via video call.',
        durationOptions: [
          { value: '30', label: '30 mins' },
          { value: '45', label: '45 mins' },
          { value: '60', label: '60 mins' },
          { value: '90', label: '90 mins' },
          { value: '120', label: '120 mins' }
        ]
      };
    }
    
    if (norm.includes('salon') || norm.includes('saloon') || norm.includes('spa') || norm.includes('beauty')) {
      return {
        virtualColumnHeader: 'Virtual Consult',
        serviceNameLabel: `${terms.serviceSingular} Name`,
        serviceNamePlaceholder: 'e.g. Haircut & Styling, Deluxe Facial, Manicure',
        categoryLabel: 'Category / Treatment Area',
        categoryPlaceholder: 'e.g. Hair Care, Skin Care, Nails, Wellness',
        virtualToggleLabel: 'Virtual Consultation (Video Call)',
        virtualToggleDescription: 'Offer live styling or skin consultation remotely before the visit.',
        durationOptions: [
          { value: '15', label: '15 mins' },
          { value: '30', label: '30 mins' },
          { value: '45', label: '45 mins' },
          { value: '60', label: '60 mins' },
          { value: '90', label: '90 mins' }
        ]
      };
    }
    
    if (norm.includes('clinic') || norm.includes('hosp') || norm.includes('medic')) {
      return {
        virtualColumnHeader: 'Telemedicine',
        serviceNameLabel: `${terms.serviceSingular} Name`,
        serviceNamePlaceholder: 'e.g. Dental Cleaning, General Consultation, Cardiology Review',
        categoryLabel: 'Specialty / Category',
        categoryPlaceholder: 'e.g. Cardiology, Dentistry, General Practice, Pediatrics',
        virtualToggleLabel: 'Telemedicine (Video Call)',
        virtualToggleDescription: 'Conduct visit remotely with encrypted video and clinical notes.',
        durationOptions: [
          { value: '15', label: '15 mins' },
          { value: '30', label: '30 mins' },
          { value: '45', label: '45 mins' },
          { value: '60', label: '60 mins' }
        ]
      };
    }

    // Default / Corporate / General
    return {
      virtualColumnHeader: 'Virtual Session',
      serviceNameLabel: `${terms.serviceSingular} Name`,
      serviceNamePlaceholder: 'e.g. Strategy Consultation, 1-on-1 Coaching, Advisory Session',
      categoryLabel: 'Category / Discipline',
      categoryPlaceholder: 'e.g. Consulting, Strategy, Advisory, Operations',
      virtualToggleLabel: 'Virtual Session (Video Call)',
      virtualToggleDescription: 'Enable remote video meeting room for this professional offering.',
      durationOptions: [
        { value: '15', label: '15 mins' },
        { value: '30', label: '30 mins' },
        { value: '45', label: '45 mins' },
        { value: '60', label: '60 mins' },
        { value: '90', label: '90 mins' }
      ]
    };
  }, [terms.facilityLabel, terms.serviceSingular]);

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
          isTelemedicine: s.isTelemedicine,
          maxSeats: s.maxCapacity || 1
        }));
        setServices(fetchedServices);
      }
    } catch (err) {
      console.error('Failed to fetch services', err);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    const role = (localStorage.getItem('role') || '').toLowerCase();
    const isProvider = role === 'service_provider' || role === 'provider' || role === 'role_provider';
    
    // Redirect if no token or role is not provider
    if (!token || !isProvider) {
      navigate('/login');
      return;
    }

    if (!hasServicesRead) {
      navigate('/provider-dashboard');
      return;
    }

    fetchServices();
  }, [navigate, hasServicesRead]);

  const openPanel = (service?: Service) => {
    setError('');
    if (service) {
      setFormData({ 
        name: service.name, 
        category: service.category, 
        price: service.price.replace(/,/g, ''), 
        duration: service.duration.split(' ')[0],
        isTelemedicine: service.isTelemedicine,
        maxSeats: (service.maxSeats || 1).toString()
      });
      setEditingId(service.id);
    } else {
      setFormData({ name: '', category: '', price: '', duration: durationOptions[0]?.value || '30', isTelemedicine: false, maxSeats: '1' });
      setEditingId(null);
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
        maxCapacity: Math.max(1, parseInt(formData.maxSeats) || 1),
        isActive: true
      };

      if (!editingId) {
        await axios.post('http://localhost:8080/api/v1/provider/services/single', payload, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } else {
        await axios.put(`http://localhost:8080/api/v1/provider/services/${editingId}`, payload, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }
      await fetchServices();
      closePanel();
    } catch (err: any) {
      setError(err.response?.data?.message || `Failed to save ${terms.serviceSingular.toLowerCase()}`);
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
    if (!window.confirm(`Are you sure you want to delete this ${terms.serviceSingular.toLowerCase()}?`)) return;
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
    <div className="tenant-theme bg-[#F3F4F6] text-[#151c27] font-sans h-screen flex flex-col overflow-hidden relative">
      <ProviderTopNavigation />

      {/* SideNavBar */}
      <ProviderSidebar />

      {/* Main Content Area */}
      <main className="pt-24 pb-8 md:ml-64 px-4 md:px-10 h-screen flex-1 md:w-[calc(100%-256px)] flex flex-col relative overflow-hidden">
        
        {!hasServicesRead ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center max-w-lg mx-auto py-20">
            <div className="w-16 h-16 rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center mb-4 shadow-sm border border-amber-500/20">
              <span className="material-symbols-outlined text-3xl">lock</span>
            </div>
            <h2 className="text-2xl font-bold text-[#151c27] mb-2">Access Restricted</h2>
            <p className="text-sm text-[#53606c] mb-6 leading-relaxed">
              Your assigned role <span className="font-bold text-primary">"{tenantRoleName || 'Staff'}"</span> does not have read permissions for {terms.servicesNavLabel.toLowerCase()}. Please contact your organization administrator.
            </p>
            <button 
              onClick={() => navigate('/provider-dashboard')}
              className="px-6 py-2.5 rounded-xl bg-primary text-white font-bold text-sm hover:opacity-90 transition-all shadow-sm cursor-pointer flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-sm">arrow_back</span>
              Back to Dashboard
            </button>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 sm:mb-8 shrink-0 gap-4">
              <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-2xl sm:text-[32px] font-bold text-[#151c27] tracking-tight">{terms.servicesNavLabel}</h1>
                  {!hasServicesWrite && (
                    <span className="px-2.5 py-1 text-xs font-bold rounded-lg bg-amber-100 text-amber-800 border border-amber-200 flex items-center gap-1">
                      <span className="material-symbols-outlined text-xs">visibility</span> Read Only
                    </span>
                  )}
                </div>
                <p className="text-sm font-medium text-[#53606c] mt-1">Configure your {terms.facilityLabel.toLowerCase()}'s offerings and pricing.</p>
              </div>
              {hasServicesWrite && (
                <button 
                  onClick={() => openPanel()} 
                  className="bg-primary hover:brightness-110 text-on-primary font-bold py-2.5 px-6 rounded-xl flex items-center justify-center gap-2 shadow-md transition-all active:scale-95 cursor-pointer w-full sm:w-auto"
                >
                  <span className="material-symbols-outlined text-[20px]">add</span> Add {terms.serviceSingular}
                </button>
              )}
            </div>

            {/* Services Table */}
            <div className="flex-1 bg-white rounded-2xl border border-[#c3c5d7]/50 shadow-sm flex flex-col mb-4 overflow-hidden">
              <div className="w-full flex-1 overflow-y-auto overflow-x-auto custom-scrollbar relative">
                <table className="w-full min-w-[700px] text-left border-collapse">
                  <thead className="bg-[#f9f9ff]/80 sticky top-0 z-10 backdrop-blur-sm">
                    <tr>
                      <th className="py-4 px-6 text-[11px] font-bold text-[#53606c] uppercase tracking-wider border-b border-[#c3c5d7]/30">{terms.serviceSingular} Name</th>
                      <th className="py-4 px-6 text-[11px] font-bold text-[#53606c] uppercase tracking-wider border-b border-[#c3c5d7]/30">{categoryLabel}</th>
                      <th className="py-4 px-6 text-[11px] font-bold text-[#53606c] uppercase tracking-wider border-b border-[#c3c5d7]/30">Duration</th>
                      <th className="py-4 px-6 text-[11px] font-bold text-[#53606c] uppercase tracking-wider border-b border-[#c3c5d7]/30">Price</th>
                      <th className="py-4 px-6 text-[11px] font-bold text-[#53606c] uppercase tracking-wider border-b border-[#c3c5d7]/30">Max Seats</th>
                      <th className="py-4 px-6 text-[11px] font-bold text-[#53606c] uppercase tracking-wider border-b border-[#c3c5d7]/30">{virtualColumnHeader}</th>
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
                          <span className="inline-flex items-center gap-1.5 py-1 px-2.5 rounded-md bg-primary/10 text-primary text-[12px] font-bold border border-primary/20 shadow-2xs">
                            <span className="material-symbols-outlined text-[15px]">event_seat</span>
                            {service.maxSeats || 1} {service.maxSeats === 1 ? 'Seat' : 'Seats'}
                          </span>
                        </td>
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
                            onClick={() => hasServicesWrite && toggleStatus(service.id)} 
                            disabled={!hasServicesWrite}
                            className={`w-10 h-5 rounded-full relative transition-colors duration-200 ${service.status ? 'bg-[#006f4b]' : 'bg-[#c3c5d7]'} ${!hasServicesWrite ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}`}
                          >
                            <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-all duration-200 ${service.status ? 'right-1' : 'left-1'}`}></span>
                          </button>
                        </td>
                        <td className="py-4 px-6 text-right">
                          <div className="flex items-center justify-end gap-3">
                            {hasServicesWrite ? (
                              <>
                                <button 
                                  className="text-[#ba1a1a] hover:bg-[#ffdad6]/50 p-1.5 rounded-lg transition-colors flex items-center justify-center disabled:opacity-50 disabled:hover:bg-transparent"
                                  onClick={() => handleDelete(service.id)}
                                  disabled={!service.status}
                                  title={`Delete ${terms.serviceSingular}`}
                                >
                                  <span className="material-symbols-outlined text-[20px]">delete</span>
                                </button>
                                <button 
                                  onClick={() => openPanel(service)} 
                                  className="text-primary font-bold hover:underline disabled:no-underline disabled:opacity-50"
                                  disabled={!service.status}
                                >
                                  Edit
                                </button>
                              </>
                            ) : (
                              <span className="text-xs text-on-surface-variant italic">View Only</span>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                    {services.length === 0 && (
                      <tr>
                        <td colSpan={7} className="py-16 text-center text-[#53606c]">
                          <div className="flex flex-col items-center justify-center">
                            <div className="w-12 h-12 rounded-2xl bg-[#f0f3ff] text-primary flex items-center justify-center mb-3">
                              <span className="material-symbols-outlined text-2xl">{terms.servicesNavIcon || 'category'}</span>
                            </div>
                            <p className="font-bold text-[#151c27] text-sm">No {terms.servicesNavLabel.toLowerCase()} available</p>
                            <p className="text-xs text-[#53606c] mt-1">Click "Add {terms.serviceSingular}" to create your first offering.</p>
                          </div>
                        </td>
                      </tr>
                    )}
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
                <h3 className="font-bold text-[#151c27] text-lg">{editingId ? `Edit ${terms.serviceSingular}` : `Add New ${terms.serviceSingular}`}</h3>
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
                  <label className="block text-sm font-bold text-[#3b4854] mb-2">{serviceNameLabel}</label>
                  <input 
                    type="text" 
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full px-4 py-3 rounded-xl border border-[#c3c5d7] focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all shadow-sm text-sm" 
                    placeholder={serviceNamePlaceholder} 
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-[#3b4854] mb-2">{categoryLabel}</label>
                  <input 
                    type="text" 
                    value={formData.category}
                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                    className="w-full px-4 py-3 rounded-xl border border-[#c3c5d7] focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all shadow-sm text-sm" 
                    placeholder={categoryPlaceholder} 
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-[#3b4854] mb-2">Price (रू)</label>
                    <input 
                      type="number" 
                      value={formData.price}
                      onChange={(e) => setFormData({...formData, price: e.target.value})}
                      className="w-full px-4 py-3 rounded-xl border border-[#c3c5d7] focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all shadow-sm text-sm" 
                      placeholder="e.g. 500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-[#3b4854] mb-2">Duration</label>
                    <select 
                      value={formData.duration}
                      onChange={(e) => setFormData({...formData, duration: e.target.value})}
                      className="w-full px-4 py-3 rounded-xl border border-[#c3c5d7] focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all shadow-sm text-sm bg-white"
                    >
                      {durationOptions.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-bold text-[#3b4854]">Max Seats / Capacity per Slot</label>
                    <span className="text-[11px] font-semibold text-primary bg-primary/10 px-2.5 py-0.5 rounded-full border border-primary/20">
                      Capacity Control
                    </span>
                  </div>
                  <div className="relative">
                    <span className="material-symbols-outlined text-[18px] text-[#737686] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none">
                      event_seat
                    </span>
                    <input 
                      type="number" 
                      min="1"
                      max="500"
                      value={formData.maxSeats}
                      onChange={(e) => setFormData({...formData, maxSeats: e.target.value})}
                      className="w-full pl-11 pr-4 py-3 rounded-xl border border-[#c3c5d7] focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all shadow-sm text-sm" 
                      placeholder="e.g. 1 for 1-on-1, 30 for lecture/batch" 
                    />
                  </div>
                  <p className="text-[11px] text-[#53606c] mt-1.5 leading-normal">
                    Maximum number of simultaneous customer/student bookings allowed for each time slot.
                  </p>
                </div>

                <div className="p-4 bg-[#f2f4f6] border border-[#c3c5d7] rounded-xl mt-2 flex flex-col gap-1.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <span className="material-symbols-outlined text-[#00668a]">videocam</span>
                      <span className="text-[14px] font-medium text-[#151c27]">{virtualToggleLabel}</span>
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
                  <p className="text-[11px] text-[#53606c] pl-8 leading-normal">
                    {virtualToggleDescription}
                  </p>
                </div>
                
                {error && <div className="text-red-500 text-sm font-bold">{error}</div>}
                
                <div className="pt-4">
                  <button 
                    onClick={handleSave}
                    className="w-full bg-primary hover:brightness-110 text-on-primary font-bold py-3.5 rounded-xl transition-all shadow-md active:scale-95 disabled:opacity-50"
                    disabled={!formData.name.trim() || !formData.price.toString().trim() || isLoading}
                  >
                    {isLoading ? 'Saving...' : `Save ${terms.serviceSingular}`}
                  </button>
                </div>
              </div>
            </div>
          </>
        )}
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
