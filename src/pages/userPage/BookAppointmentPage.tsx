import React, { useEffect, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import NotificationBell from './NotificationBell';

const BookAppointmentPage: React.FC = () => {
  const navigate = useNavigate();
  const [fullName, setFullName] = useState<string>('');
  
  // Cart state (shows in sticky footer)
  const [selectedSlots, setSelectedSlots] = useState<number[]>([]);
  // Staging state (highlighted in Classic Calendar before adding to cart)
  const [stagingSlots, setStagingSlots] = useState<number[]>([]);
  // Inventory tracking for slots
  const [inventory, setInventory] = useState<Record<number, number>>({ 0: 2, 1000: 2 });
  
  const [selectedDate, setSelectedDate] = useState<number>(8);
  const [activeTab, setActiveTab] = useState<'classic' | 'smart_ai'>('classic');
  const [selectedService, setSelectedService] = useState<string>('');
  const [selectedProvider, setSelectedProvider] = useState<string>('');

  const services = [
    { id: 'general', name: 'General Checkup' },
    { id: 'dental', name: 'Dental Cleaning' },
    { id: 'vision', name: 'Vision Test' }
  ];

  const providers = [
    { id: 'dr_smith', name: 'Dr. Sarah Smith', serviceId: 'general' },
    { id: 'dr_patel', name: 'Dr. Amit Patel', serviceId: 'general' },
    { id: 'dr_lee', name: 'Dr. John Lee', serviceId: 'dental' },
    { id: 'dr_garcia', name: 'Dr. Maria Garcia', serviceId: 'vision' }
  ];

  const filteredProviders = providers.filter(p => !selectedService || p.serviceId === selectedService);

  const smartAiSlots = [
    {
      id: 0,
      title: 'Recommended Appointment',
      date: 'Mon, Oct 26',
      time: '10:00 AM',
      price: 'रू 1,500',
      provider: 'Dr. Sarah Smith - General Checkup',
      topMatch: true
    },
    {
      id: 1,
      title: 'Recommended Appointment',
      date: 'Fri, Oct 23',
      time: '2:30 PM',
      price: 'रू 1,500',
      provider: 'Dr. John Lee - Dental Cleaning',
      topMatch: false
    },
    {
      id: 2,
      title: 'Recommended Appointment',
      date: 'Wed, Oct 28',
      time: '6:30 PM',
      price: 'रू 1,700',
      provider: 'Dr. Maria Garcia - Vision Test',
      topMatch: false
    }
  ];

  const classicSlots = providers.flatMap((prov, pIndex) => {
    const serviceName = services.find(s => s.id === prov.serviceId)?.name || 'Service';
    return Array.from({length: 6}).map((_, i) => ({
      id: 1000 + pIndex * 10 + i,
      title: 'Appointment',
      date: `Nov ${selectedDate}, 2024`,
      time: `${12 + Math.floor(i/2)}:${i%2===0?'00':'30'} PM`,
      price: 'रू 1,500',
      provider: `${prov.name} - ${serviceName}`,
      topMatch: i === 0,
      providerId: prov.id
    }));
  });

  const slots = [...smartAiSlots, ...classicSlots];
  
  const displayedClassicSlots = (selectedService && selectedProvider)
    ? classicSlots.filter(s => s.providerId === selectedProvider)
    : [];

  // Smart AI adds directly to cart
  const toggleSlot = (id: number) => {
    const targetSlot = slots.find(s => s.id === id);
    if (!targetSlot) return;

    setSelectedSlots(prev => {
      if (prev.includes(id)) {
        setInventory(inv => {
          if (inv[id] !== undefined) return { ...inv, [id]: inv[id] + 1 };
          return inv;
        });
        return prev.filter(slotId => slotId !== id);
      } else {
        if (prev.length >= 3) {
          alert('You can select a maximum of 3 appointments at a time.');
          return prev;
        }

        // Check for time collision
        const hasTimeCollision = prev.some(existingId => {
          const existingSlot = slots.find(s => s.id === existingId);
          return existingSlot && existingSlot.date === targetSlot.date && existingSlot.time === targetSlot.time;
        });
        if (hasTimeCollision) {
          alert('You already have an appointment at that time.');
          return prev;
        }

        if (inventory[id] !== undefined && inventory[id] <= 0) {
          alert('This slot is fully booked.');
          return prev;
        }
        setInventory(inv => {
          if (inv[id] !== undefined) return { ...inv, [id]: inv[id] - 1 };
          return inv;
        });
        return [...prev, id];
      }
    });
  };

  // Classic Calendar adds to staging first
  const toggleStagingSlot = (id: number) => {
    const targetSlot = slots.find(s => s.id === id);
    if (!targetSlot) return;

    setStagingSlots(prev => {
      if (prev.includes(id)) {
        return prev.filter(slotId => slotId !== id);
      } else {
        if (selectedSlots.length + prev.length >= 3) {
          alert('You can select a maximum of 3 appointments at a time.');
          return prev;
        }

        // Check for time collision
        const hasTimeCollision = [...selectedSlots, ...prev].some(existingId => {
          const existingSlot = slots.find(s => s.id === existingId);
          return existingSlot && existingSlot.date === targetSlot.date && existingSlot.time === targetSlot.time;
        });
        if (hasTimeCollision) {
          alert('You already have an appointment at that time.');
          return prev;
        }

        if (inventory[id] !== undefined && inventory[id] <= 0) {
          alert('This slot is fully booked.');
          return prev;
        }
        return [...prev, id];
      }
    });
  };

  const commitStagingToCart = () => {
    if (stagingSlots.length === 0) return;
    setInventory(inv => {
      const next = { ...inv };
      stagingSlots.forEach(id => {
        if (next[id] !== undefined && next[id] > 0) {
          next[id] -= 1;
        }
      });
      return next;
    });
    setSelectedSlots(prev => [...prev, ...stagingSlots]);
    setStagingSlots([]);
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');
    
    // Redirect if no token or role is not 'user'
    if (!token || role !== 'user') {
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
    <div className="bg-[#f9f9ff] text-[#151c27] font-sans antialiased min-h-screen flex flex-col pb-32">
      {/* TopNavBar (Fixed) */}
      <header className="fixed top-0 w-full z-50 bg-[#f9f9ff]/80 backdrop-blur-md shadow-sm border-b border-[#c3c5d7]/30">
        <div className="flex justify-between items-center px-4 md:px-10 h-20 max-w-7xl mx-auto">
          <div className="flex items-center gap-2">
            <img
              alt="OmniBook Logo"
              className="object-contain h-[40px]"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuANVa2DIMhxwJVhPP1FnM5XPZK669t-OaZbij7sEQY2BcRjKXoLi4Xlx3422j-PoJTMmPiR5Xs2jHyWkiOQbHG2PC_dwX1bTvLCKfZJr4xERFe5jC_Eg1nCXbH4JYQNcg8LmT7jvnS2rIU1qOMeCUzpati4NDHk55Jw4yD9q-c3RF-j48vJ6qqLiyYcMo90ZH-HOFSGJv14g2VG5oLaR8SvPRMAYcJZQSHy3gVOym_POA_776_joTMmbnqxiUzecB0QZUzztl5CrHw"
            />
          </div>
          <nav className="hidden md:flex items-center gap-8">
            <NavLink
              to="/dashboard"
              className={({ isActive }) => 
                `text-[16px] font-semibold pb-1 ${isActive ? 'text-[#003fb1] border-b-2 border-[#003fb1]' : 'text-[#53606c] hover:text-[#003fb1] transition-colors duration-200'}`
              }
            >
              Dashboard
            </NavLink>
            <NavLink
              to="/book-appointment"
              className={({ isActive }) => 
                `text-[16px] font-semibold pb-1 ${isActive ? 'text-[#003fb1] border-b-2 border-[#003fb1]' : 'text-[#53606c] hover:text-[#003fb1] transition-colors duration-200'}`
              }
            >
              Book Appointment
            </NavLink>
            <NavLink
              to="/my-history"
              className={({ isActive }) => 
                `text-[16px] font-semibold pb-1 ${isActive ? 'text-[#003fb1] border-b-2 border-[#003fb1]' : 'text-[#53606c] hover:text-[#003fb1] transition-colors duration-200'}`
              }
            >
              My History
            </NavLink>
          </nav>
          <div className="flex items-center gap-4">
            <NotificationBell />
            <div className="relative group ml-2">
              <div className="h-10 w-10 rounded-full overflow-hidden border border-[#c3c5d7] hover:scale-105 transition-transform cursor-pointer shadow-sm">
                <img
                  alt="User Profile Avatar"
                  className="w-full h-full object-cover"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuALan3Fe5liRYVvqOzbYPXALuhl1M_JrzKY62jsudutF-Y4kRwnw4no-RMdfy3kIqv1Pwvt4YNwLk09F8-YiOqLdcmDLbD8z8PfxNXA5LulAwItUiFnPDiM2CIPYIlitAQwvN0vTuDjaDgHGdcvqmtnQVICN825lJ_J6Gay2MKwe9QZ5j0m2TW3QgH9DIcW4nkj_-PRO8Ny3cmQDxAWN3MCHm9Grv2-ok3arYQPU0wypdDtdLrnEcUA0n9wYoUk0Nv28IHRfPR7qzs"
                />
              </div>
              <div className="absolute right-0 mt-2 w-48 bg-white shadow-xl rounded-xl border border-[#dce2f3] opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 py-2 z-[60]">
                <NavLink
                  className="flex items-center gap-3 px-4 py-2 hover:bg-[#f0f3ff] text-[#151c27] text-[14px] font-medium transition-colors"
                  to="/profile-settings"
                >
                  <span className="material-symbols-outlined text-[20px]">settings</span>
                  Settings
                </NavLink>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-3 px-4 py-2 hover:bg-[#ffdad6]/20 text-[#ba1a1a] text-[14px] font-medium transition-colors w-full text-left"
                >
                  <span className="material-symbols-outlined text-[20px]">logout</span>
                  Log Out
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="mt-20 flex-1">
        {/* Location Context */}
        <header className="pt-8 bg-white pb-8 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 md:px-10">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h1 className="text-[32px] font-bold text-[#151c27] leading-tight">Book Your Slot</h1>
                <p className="text-[16px] text-[#53606c] mt-1">Select a branch and find your preferred time.</p>
              </div>
              <div className="relative min-w-[280px]">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-[#737686]">location_on</span>
                <select className="w-full pl-10 pr-4 py-3 bg-[#f9f9ff] border border-[#c3c5d7] rounded-xl focus:ring-2 focus:ring-[#003fb1] focus:border-transparent appearance-none font-medium text-[14px] cursor-pointer">
                  <option>Kathmandu Main Branch</option>
                  <option>Lalitpur Service Center</option>
                  <option>Pokhara Regional Office</option>
                </select>
                <span className="absolute right-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-[#737686] pointer-events-none">expand_more</span>
              </div>
            </div>
          </div>
        </header>

        {/* Hybrid Toggle */}
        <section className="py-10 flex justify-center">
          <div className="inline-flex p-1 bg-[#e2e8f8] rounded-full shadow-inner">
            <button 
              onClick={() => setActiveTab('smart_ai')}
              className={`flex items-center gap-2 px-8 py-2.5 rounded-full text-[14px] transition-all duration-200 ${
                activeTab === 'smart_ai' ? 'bg-[#1a56db] text-white font-bold shadow-sm' : 'text-[#53606c] hover:text-[#003fb1] font-medium'
              }`}
            >
              <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>bolt</span>
              Smart AI Booking
            </button>
            <button 
              onClick={() => setActiveTab('classic')}
              className={`flex items-center gap-2 px-8 py-2.5 rounded-full text-[14px] transition-all duration-200 ${
                activeTab === 'classic' ? 'bg-[#1a56db] text-white font-bold shadow-sm' : 'text-[#53606c] hover:text-[#003fb1] font-medium'
              }`}
            >
              <span className="material-symbols-outlined">calendar_today</span>
              Classic Calendar
            </button>
          </div>
        </section>

        {/* Main Arena */}
        {activeTab === 'smart_ai' ? (
        <div className="max-w-7xl mx-auto px-4 md:px-10 grid grid-cols-1 lg:grid-cols-10 gap-12 pb-12">
          {/* Left: Recommended Time Slots (60%) */}
          <div className="lg:col-span-6 space-y-6">
            <div className="flex justify-between items-end mb-4">
              <h2 className="text-[24px] font-bold text-[#151c27]">Recommended Time Slots</h2>
              <span className="text-[#1a56db] text-[14px] font-medium cursor-pointer hover:underline">View More</span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {slots.slice(0, 3).map((slot) => (
                <div 
                  key={slot.id}
                  className={`rounded-xl p-6 transition-all ${
                    selectedSlots.includes(slot.id)
                      ? 'bg-white border-2 border-[#10B981] shadow-[0_0_20px_rgba(16,185,129,0.3)] scale-[1.02]' 
                      : 'bg-[#f0f3ff] border border-[#c3c5d7] hover:shadow-xl hover:bg-white group'
                  } relative`}
                >
                  {slot.topMatch && (
                    <div className="absolute top-4 right-4 bg-[#6ffbbe] text-[#002113] px-2 py-1 rounded-md flex items-center gap-1">
                      <span className="material-symbols-outlined text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                      <span className="text-[12px] font-medium">Top Match</span>
                    </div>
                  )}
                  <h3 className={`text-[20px] font-semibold mb-4 pr-12 ${selectedSlots.includes(slot.id) ? 'text-[#151c27]' : 'text-[#53606c] group-hover:text-[#151c27] transition-colors'}`}>
                    {slot.title}
                  </h3>
                  
                  <div className="flex flex-col gap-3 py-4 border-y border-[#c3c5d7]/30 mb-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className={`material-symbols-outlined ${selectedSlots.includes(slot.id) ? 'text-[#1a56db]' : 'text-[#53606c]'}`}>calendar_month</span>
                        <span className={`text-[16px] ${selectedSlots.includes(slot.id) ? 'font-semibold' : ''}`}>{slot.date}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`material-symbols-outlined ${selectedSlots.includes(slot.id) ? 'text-[#1a56db]' : 'text-[#53606c]'}`}>schedule</span>
                        <span className={`text-[16px] ${selectedSlots.includes(slot.id) ? 'font-semibold' : ''}`}>{slot.time}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`material-symbols-outlined ${selectedSlots.includes(slot.id) ? 'text-[#1a56db]' : 'text-[#53606c]'}`}>payments</span>
                      <span className={`text-[16px] ${selectedSlots.includes(slot.id) ? 'font-semibold' : ''}`}>{slot.price}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 mb-6">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${selectedSlots.includes(slot.id) ? 'bg-[#005438]/10 text-[#005438]' : 'bg-[#d6e4f3] text-[#53606c]'}`}>
                      <span className="material-symbols-outlined">medical_services</span>
                    </div>
                    <div>
                      <p className="text-[#53606c] text-[12px] font-medium">Provider:</p>
                      <p className="text-[16px] font-medium">{slot.provider}</p>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    {selectedSlots.includes(slot.id) && (
                      <button 
                        onClick={(e) => { e.stopPropagation(); toggleSlot(slot.id); }}
                        className="px-4 py-3 rounded-xl font-bold transition-all active:scale-95 bg-[#ffdad6] text-[#ba1a1a] hover:bg-[#ba1a1a] hover:text-white"
                      >
                        Cancel
                      </button>
                    )}
                    <button 
                      onClick={(e) => { e.stopPropagation(); if (!selectedSlots.includes(slot.id)) toggleSlot(slot.id); }}
                      className={`flex-1 py-3 rounded-xl font-bold transition-all active:scale-95 ${
                        selectedSlots.includes(slot.id) 
                          ? 'bg-[#005438] text-white shadow-md' 
                          : 'bg-[#dbe1ff] text-[#1a56db] hover:bg-[#1a56db] hover:text-white'
                      }`}
                    >
                      {selectedSlots.includes(slot.id) ? 'Added to Booking' : 'Select Slot'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Integrated AI Assistant (40%) */}
          <div className="lg:col-span-4 flex flex-col h-[600px] bg-white rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.08)] border border-[#c3c5d7]/20 overflow-hidden">
            {/* AI Header */}
            <div className="p-6 bg-[#1a56db] text-[#d4dcff] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-[#1a56db] shadow-sm">
                  <span className="material-symbols-outlined">smart_toy</span>
                </div>
                <div>
                  <p className="font-bold text-[20px] text-white">AI Booking Assistant</p>
                  <p className="text-[12px] text-[#d4dcff]/70">Online & ready to help</p>
                </div>
              </div>
              <button className="text-[#d4dcff] hover:rotate-90 transition-transform">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            
            {/* Chat Messages */}
            <div className="flex-1 p-6 space-y-6 overflow-y-auto bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] bg-fixed">
              {/* User Message */}
              <div className="flex flex-row-reverse gap-3">
                <div className="w-8 h-8 rounded-full bg-[#d6e4f3] flex-shrink-0">
                  <img alt="User" className="rounded-full" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBCJAtaa3APCnGE15ECMND9A6T9Pfct8FiskQihTKzYfC28WhDCbSt7OKUQhXkpoyUg9eZlFyJdyuWGEGxFxfTyJGAjgg4v0Te4YcFQ6FZOOc_Iut-RolH9y1FqAQyUfR15YJg4YGVGqs1C0j-PMJQ6gLnDOBgEsiIaFPSc8oetKVV5CLexaC7xH1JaTsVmr4XVifTGPALlVf0oxKSea5867L-kfW-bKe6utGTzSN7iXENnVTLXjuyBjeqS8EgaG4Ako0S8zbHeXdo" />
                </div>
                <div className="bg-[#e2e8f8] p-4 rounded-2xl rounded-tr-none max-w-[80%] shadow-sm">
                  <p className="text-[16px]">Can you book a health checkup for next Monday morning?</p>
                </div>
              </div>
              
              {/* AI Message */}
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-[#1a56db] flex items-center justify-center text-[#d4dcff] flex-shrink-0">
                  <span className="material-symbols-outlined text-[16px]">smart_toy</span>
                </div>
                <div className="bg-[#003fb1] text-white p-4 rounded-2xl rounded-tl-none max-w-[80%] shadow-lg">
                  <p className="text-[16px] mb-2">I've found a perfect slot for you! How about 10:00 AM with Dr. Smith at the Main Branch?</p>
                  <a className="font-bold underline decoration-[#6ffbbe] underline-offset-4 hover:text-[#6ffbbe] transition-colors" href="#">Book Now.</a>
                </div>
              </div>
            </div>
            
            {/* Chat Input */}
            <div className="p-6 border-t border-[#c3c5d7]/30 bg-[#f9f9ff]">
              <div className="flex items-center gap-2 bg-white rounded-xl border border-[#c3c5d7] p-2 shadow-inner focus-within:ring-2 focus-within:ring-[#1a56db]/20 transition-all">
                <input className="flex-1 border-none outline-none focus:ring-0 bg-transparent text-[16px] py-2 px-2" placeholder="Type your message here..." type="text" />
                <button className="bg-[#1a56db] text-white px-4 py-2 rounded-lg font-bold hover:bg-[#123e9e] transition-all active:scale-95 flex items-center gap-2">
                  <span>Send</span>
                  <span className="material-symbols-outlined text-[18px]">send</span>
                </button>
              </div>
            </div>
          </div>
        </div>
        ) : (
          <div className="max-w-7xl mx-auto px-4 md:px-10 pb-12">
            {/* Service & Provider Selection */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              <div className="flex flex-col gap-2">
                <label className="text-[14px] font-bold text-[#151c27]">Select Service</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-[#737686]">medical_services</span>
                  <select 
                    value={selectedService}
                    onChange={(e) => {
                      setSelectedService(e.target.value);
                      setSelectedProvider('');
                    }}
                    className="w-full h-14 pl-12 pr-10 bg-white border border-[#c3c5d7] rounded-xl appearance-none focus:ring-2 focus:ring-[#003fb1] focus:border-transparent outline-none text-[16px] cursor-pointer"
                  >
                    <option value="">What do you need?</option>
                    {services.map(s => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-[#737686] pointer-events-none">expand_more</span>
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-[14px] font-bold text-[#151c27]">Select Provider (Optional)</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-[#737686]">person</span>
                  <select 
                    value={selectedProvider}
                    onChange={(e) => setSelectedProvider(e.target.value)}
                    disabled={filteredProviders.length === 0}
                    className="w-full h-14 pl-12 pr-10 bg-white border border-[#c3c5d7] rounded-xl appearance-none focus:ring-2 focus:ring-[#003fb1] focus:border-transparent outline-none text-[16px] cursor-pointer disabled:opacity-50 disabled:bg-[#f9f9ff]"
                  >
                    <option value="">Choose a Professional</option>
                    {filteredProviders.map(p => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-[#737686] pointer-events-none">expand_more</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* Left Column: Calendar */}
              <div className="lg:col-span-5 bg-white rounded-2xl p-6 md:p-8 shadow-[0_4px_20px_rgba(26,86,219,0.05)]">
                {selectedProvider && (
                  <h2 className="text-[20px] font-medium text-[#151c27] mb-6">
                    Booking with: <span className="text-[#003fb1] font-bold">{providers.find(p => p.id === selectedProvider)?.name}</span>
                  </h2>
                )}
                <div className="flex items-center justify-between mb-8">
                  <h3 className="text-[20px] font-bold text-[#151c27]">November 2024</h3>
                  <div className="flex gap-2">
                    <button className="p-2 hover:bg-[#e7eefe] rounded-full transition-colors active:scale-95"><span className="material-symbols-outlined text-[#53606c]">chevron_left</span></button>
                    <button className="p-2 hover:bg-[#e7eefe] rounded-full transition-colors active:scale-95"><span className="material-symbols-outlined text-[#53606c]">chevron_right</span></button>
                  </div>
                </div>
                <div className="grid grid-cols-7 gap-y-4 text-center">
                  <div className="text-[14px] font-medium text-[#737686] pb-2">Su</div>
                  <div className="text-[14px] font-medium text-[#737686] pb-2">Mo</div>
                  <div className="text-[14px] font-medium text-[#737686] pb-2">Tu</div>
                  <div className="text-[14px] font-medium text-[#737686] pb-2">We</div>
                  <div className="text-[14px] font-medium text-[#737686] pb-2">Th</div>
                  <div className="text-[14px] font-medium text-[#737686] pb-2">Fr</div>
                  <div className="text-[14px] font-medium text-[#737686] pb-2">Sa</div>
                  
                  {Array.from({length: 5}).map((_, i) => (
                    <div key={`empty-${i}`} className="py-2 text-[14px] text-[#c3c5d7] font-medium">{27 + i}</div>
                  ))}
                  {Array.from({length: 30}).map((_, i) => {
                    const date = i + 1;
                    const isSelected = selectedDate === date;
                    return (
                      <div 
                        key={`day-${date}`} 
                        onClick={() => setSelectedDate(date)}
                        className="py-2 relative group cursor-pointer transition-all"
                      >
                        {isSelected && <div className="absolute inset-0 bg-[#1a56db] rounded-xl shadow-md scale-95 z-0"></div>}
                        <span className={`relative z-10 text-[14px] ${isSelected ? 'text-white font-bold' : 'font-medium'}`}>{date}</span>
                        {!isSelected && <div className="absolute inset-0 bg-[#f0f3ff] opacity-0 group-hover:opacity-100 rounded-xl transition-opacity"></div>}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Right Column: Slots */}
              <div className="lg:col-span-7 bg-white rounded-2xl p-6 md:p-8 shadow-[0_4px_20px_rgba(26,86,219,0.05)]">
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                  <h3 className="text-[20px] font-bold text-[#151c27]">Available Slots for <span className="text-[#003fb1]">Nov {selectedDate}, 2024</span></h3>
                  <div className="flex items-center gap-2 text-[#53606c] text-[12px] font-medium bg-[#f0f3ff] px-3 py-1.5 rounded-full">
                    <span className="material-symbols-outlined text-[16px]">schedule</span>
                    All times in GMT+5:45
                  </div>
                </div>
                
                {!selectedService || !selectedProvider ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center border-2 border-dashed border-[#c3c5d7] rounded-xl bg-[#f9f9ff]">
                    <span className="material-symbols-outlined text-[48px] text-[#c3c5d7] mb-4">search</span>
                    <h4 className="text-[18px] font-bold text-[#151c27] mb-2">Almost there!</h4>
                    <p className="text-[14px] text-[#53606c] max-w-sm">Please select a service and a provider from the menus above to see available time slots.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4">
                    {displayedClassicSlots.map((slot, index) => {
                    // It is sold out if it's our mock sold out index (2) OR if its inventory is strictly 0.
                    const isSoldOut = index === 2 || (inventory[slot.id] !== undefined && inventory[slot.id] <= 0); 
                    const isStaged = stagingSlots.includes(slot.id);
                    const isInCart = selectedSlots.includes(slot.id);
                    
                    if (isSoldOut) {
                      return (
                        <div key={`soldout-${slot.id}`} className="relative p-4 bg-[#f9f9ff] border border-transparent rounded-xl flex flex-col items-center justify-center gap-1 opacity-60 cursor-not-allowed">
                          <span className="text-[14px] text-[#53606c] line-through font-medium">{slot.time}</span>
                          <span className="text-[10px] font-bold text-[#53606c] uppercase tracking-wider">Sold Out</span>
                        </div>
                      );
                    }
                    
                    return (
                      <div 
                        key={`classic-${slot.id}`} 
                        onClick={() => isInCart ? null : toggleStagingSlot(slot.id)}
                        className={`relative p-4 rounded-xl transition-all flex flex-col items-center justify-center gap-1 ${
                          isInCart 
                            ? 'bg-[#005438]/10 border-2 border-[#005438] shadow-sm transform scale-105 z-10 cursor-not-allowed'
                            : isStaged
                              ? 'bg-[#e7eefe] border-2 border-[#1a56db] shadow-sm transform scale-105 z-10 cursor-pointer active:scale-95'
                              : 'bg-white border border-[#c3c5d7]/50 hover:border-[#1a56db]/50 hover:bg-[#f9f9ff] cursor-pointer active:scale-95'
                        }`}
                      >
                        {slot.topMatch && inventory[slot.id] !== undefined && inventory[slot.id] > 0 && (
                          <div className="absolute -top-2.5 -right-2.5 bg-[#ffdad6] text-[#ba1a1a] text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm z-10 border border-white">
                            🔥 {inventory[slot.id]} Left
                          </div>
                        )}
                        <span className={`text-[14px] font-medium ${isStaged ? 'text-[#1a56db] font-bold' : isInCart ? 'text-[#005438] font-bold' : 'text-[#151c27]'}`}>{slot.time}</span>
                        <span className={`text-[12px] ${isStaged ? 'text-[#1a56db]/80' : isInCart ? 'text-[#005438]/80' : 'text-[#53606c]'}`}>{isInCart ? 'In Booking' : slot.price}</span>
                      </div>
                    );
                  })}
                  </div>
                )}

                <div className="mt-8 flex justify-end gap-4 border-t border-[#c3c5d7]/30 pt-6">
                  {(selectedSlots.length > 0 || stagingSlots.length > 0) && (
                    <button 
                      onClick={() => {
                        setInventory(inv => {
                          const next = { ...inv };
                          selectedSlots.forEach(id => {
                            if (next[id] !== undefined) next[id] += 1;
                          });
                          return next;
                        });
                        setSelectedSlots([]);
                        setStagingSlots([]);
                      }}
                      className="px-6 py-3 rounded-xl font-bold transition-all active:scale-95 bg-[#ffdad6] text-[#ba1a1a] hover:bg-[#ba1a1a] hover:text-white"
                    >
                      Cancel Selection
                    </button>
                  )}
                  <button 
                    disabled={stagingSlots.length === 0}
                    onClick={commitStagingToCart}
                    className={`px-8 py-3 rounded-xl font-bold text-[16px] transition-all flex items-center justify-center gap-2 ${
                      stagingSlots.length === 0 
                        ? 'bg-[#c3c5d7] text-white cursor-not-allowed shadow-none' 
                        : 'bg-[#1a56db] text-white shadow-[0_8px_30px_rgba(26,86,219,0.3)] hover:scale-[1.02] active:scale-95'
                    }`}
                  >
                    Select Slot{stagingSlots.length > 1 ? 's' : ''} {stagingSlots.length > 0 && `(${stagingSlots.length})`}
                  </button>
                </div>

                <div className="mt-8 p-5 bg-[#f0f3ff] rounded-xl border border-dashed border-[#c3c5d7]">
                  <div className="flex items-start gap-4">
                    <div className="bg-[#dbe1ff] p-2 rounded-lg text-[#1a56db]">
                      <span className="material-symbols-outlined">info</span>
                    </div>
                    <div>
                      <h4 className="text-[14px] font-bold text-[#151c27]">Booking Policy</h4>
                      <p className="text-[13px] text-[#53606c] mt-1 leading-relaxed">Free cancellation up to 4 hours before. Appointments starting after 4:00 PM are subject to evening rates.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Sticky Footer */}
      <footer className="fixed bottom-0 w-full z-40 bg-white border-t border-[#c3c5d7]/20 shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
        <div className="max-w-7xl mx-auto px-4 md:px-10 py-4 flex flex-col md:flex-row justify-between items-center gap-4">
          {/* Left Side: Doctor Info & Time */}
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-4">
              {(() => {
                const uniqueProviders = Array.from(new Set(selectedSlots.map(id => slots.find(s => s.id === id)?.provider).filter(Boolean)));
                if (uniqueProviders.length === 0) {
                  return (
                    <>
                      <div className="w-12 h-12 rounded-full bg-[#f0f3ff] flex items-center justify-center border border-[#c3c5d7]/50">
                        <span className="material-symbols-outlined text-[#53606c]">person</span>
                      </div>
                      <div className="flex flex-col">
                        <p className="text-[16px] font-bold text-[#151c27]">No selection</p>
                        <p className="text-[13px] text-[#53606c]">-</p>
                      </div>
                    </>
                  );
                } else if (uniqueProviders.length === 1) {
                  const providerString = uniqueProviders[0];
                  const pName = providerString?.split(' - ')[0];
                  const pService = providerString?.split(' - ')[1];
                  return (
                    <>
                      <img 
                        src="https://plus.unsplash.com/premium_photo-1661764878654-3d0fc2eefcca?q=80&w=200&auto=format&fit=crop" 
                        alt="Doctor" 
                        className="w-12 h-12 rounded-full object-cover border border-[#c3c5d7]/50"
                      />
                      <div className="flex flex-col">
                        <p className="text-[16px] font-bold text-[#151c27]">{pName}</p>
                        <p className="text-[13px] text-[#53606c]">{pService}</p>
                      </div>
                    </>
                  );
                } else {
                  return (
                    <>
                      <div className="flex -space-x-4">
                        {uniqueProviders.map((_, index) => {
                          const avatars = [
                            "https://plus.unsplash.com/premium_photo-1661764878654-3d0fc2eefcca?q=80&w=200&auto=format&fit=crop",
                            "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?q=80&w=200&auto=format&fit=crop",
                            "https://lh3.googleusercontent.com/aida-public/AB6AXuALan3Fe5liRYVvqOzbYPXALuhl1M_JrzKY62jsudutF-Y4kRwnw4no-RMdfy3kIqv1Pwvt4YNwLk09F8-YiOqLdcmDLbD8z8PfxNXA5LulAwItUiFnPDiM2CIPYIlitAQwvN0vTuDjaDgHGdcvqmtnQVICN825lJ_J6Gay2MKwe9QZ5j0m2TW3QgH9DIcW4nkj_-PRO8Ny3cmQDxAWN3MCHm9Grv2-ok3arYQPU0wypdDtdLrnEcUA0n9wYoUk0Nv28IHRfPR7qzs"
                          ];
                          return (
                            <img key={index} alt={`Doctor ${index + 1}`} className="inline-block h-12 w-12 rounded-full object-cover ring-2 ring-white" src={avatars[index % avatars.length]} />
                          );
                        })}
                      </div>
                      <div className="flex flex-col">
                        <p className="text-[16px] font-bold text-[#151c27]">
                          {uniqueProviders[0]?.split(' - ')[0]} and {uniqueProviders.length - 1} other{uniqueProviders.length > 2 ? 's' : ''}
                        </p>
                        <p className="text-[13px] text-[#53606c]">Multiple Services</p>
                      </div>
                    </>
                  );
                }
              })()}
            </div>
            <div className="flex flex-col">
              <p className="text-[12px] font-medium text-[#8c9bab] uppercase tracking-wider mb-0.5">Appointment Time</p>
              <p className="text-[16px] font-bold text-[#151c27]">
                {selectedSlots.length === 0 
                  ? "Select a slot" 
                  : selectedSlots.length === 1 
                    ? `${slots.find(s => s.id === selectedSlots[0])?.date} • ${slots.find(s => s.id === selectedSlots[0])?.time}` 
                    : "Multiple Appointments"
                }
              </p>
            </div>
          </div>

          {/* Right Side: Price & Button */}
          <div className="flex items-center gap-6 w-full md:w-auto mt-4 md:mt-0">
            <div className="flex flex-col items-end">
              <p className="text-[12px] font-medium text-[#8c9bab] uppercase tracking-wider mb-0.5">Total Amount</p>
              <p className="text-[20px] font-bold text-[#151c27] leading-none">
                {(() => {
                  const total = selectedSlots.reduce((sum, id) => {
                    const slot = slots.find(s => s.id === id);
                    if (slot) {
                      const priceNum = parseInt(slot.price.replace(/[^\d]/g, ''), 10);
                      return sum + priceNum;
                    }
                    return sum;
                  }, 0);
                  return total > 0 ? `रू ${total.toLocaleString()}.00` : "रू 0.00";
                })()}
              </p>
            </div>
            <button 
              disabled={selectedSlots.length === 0}
              className={`w-full md:w-auto px-8 py-3 rounded-xl font-bold text-[16px] transition-all flex items-center justify-center gap-2 ${
                selectedSlots.length === 0 
                  ? 'bg-[#c3c5d7] text-white cursor-not-allowed shadow-none' 
                  : 'bg-[#005438] text-white shadow-[0_8px_30px_rgba(16,185,129,0.3)] hover:scale-[1.02] active:scale-95'
              }`}
            >
              <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>payments</span>
              Confirm & Pay via eSewa / Khalti
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default BookAppointmentPage;
