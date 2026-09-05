import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import UserTopNavigation from './components/UserTopNavigation';

interface Clinic {
  id: number;
  organizationName: string;
  address: string;
}

interface Provider {
  id: number;
  fullName: string;
  primarySpecialty: string;
}

const BookAppointmentPage: React.FC = () => {
  const navigate = useNavigate();
  const [fullName, setFullName] = useState<string>('');
  
  // Cart state (shows in sticky footer)
  const [selectedSlots, setSelectedSlots] = useState<string[]>([]);
  // Staging state (highlighted in Classic Calendar before adding to cart)
  const [stagingSlots, setStagingSlots] = useState<string[]>([]);
  // Inventory tracking for slots
  const [inventory, setInventory] = useState<Record<string, number>>({});
  
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [activeTab, setActiveTab] = useState<'classic' | 'smart_ai'>('classic');
  const [selectedLocation, setSelectedLocation] = useState<string>('');
  const [selectedClinic, setSelectedClinic] = useState<string>('');
  const [selectedService, setSelectedService] = useState<string>('');
  const [selectedProvider, setSelectedProvider] = useState<string>('');
  
  const [locations, setLocations] = useState<string[]>([]);
  const [clinics, setClinics] = useState<Clinic[]>([]);
  const [dbServices, setDbServices] = useState<string[]>([]);
  const [dbProviders, setDbProviders] = useState<Provider[]>([]);

  // Dynamic slots state
  const [dynamicSlots, setDynamicSlots] = useState<any[]>([]);
  const [isClosed, setIsClosed] = useState<boolean>(false);
  const [closedMessage, setClosedMessage] = useState<string>('');

  const [showPatientModal, setShowPatientModal] = useState(false);
  const [patientDetails, setPatientDetails] = useState(() => {
    const name = localStorage.getItem('fullName') || '';
    let email = '';
    const token = localStorage.getItem('token');
    if (token) {
        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            email = payload.sub || '';
        } catch (e) {}
    }
    return { name, phone: '', email, reason: '' };
  });
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<'ESEWA' | 'STRIPE' | 'KHALTI'>('STRIPE');

  // AI Chat State
  const [smartAiSlots, setSmartAiSlots] = useState<any[]>([]);
  const [conversationId, setConversationId] = useState<string>(() => {
    return localStorage.getItem('omni_ai_conversation_id') || '';
  });
  const [chatMessages, setChatMessages] = useState<{sender: 'user' | 'ai', text: string, slotId?: string}[]>([
      { sender: 'ai', text: "Hello! I'm your AI Booking Assistant powered by Gemini 3.5 Flash-Lite. How can I help you schedule an appointment today?" }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [isChatLoading, setIsChatLoading] = useState(false);

  // Fetch Personalized AI Recommendations & Restore Chat History on Mount
  useEffect(() => {
      const email = patientDetails.email || '';
      axios.get('http://localhost:8080/api/v1/public/ai/recommend', {
          params: { userEmail: email }
      })
          .then(res => {
              if (Array.isArray(res.data) && res.data.length > 0) {
                  setSmartAiSlots(res.data);
              }
          })
          .catch(err => console.error("Failed to fetch AI recommendations", err));

      // Restore previous messages if a conversation session exists
      const savedConvId = localStorage.getItem('omni_ai_conversation_id');
      if (savedConvId) {
          axios.get(`http://localhost:8080/api/v1/public/ai/conversations/${savedConvId}/messages`)
              .then(res => {
                  if (Array.isArray(res.data) && res.data.length > 0) {
                      const restored = res.data.map((m: any) => ({
                          sender: (m.role === 'user' ? 'user' : 'ai') as 'user' | 'ai',
                          text: m.content,
                          slotId: m.actionSlotId || undefined
                      }));
                      setChatMessages(restored);
                  }
              })
              .catch(err => console.warn("No previous conversation found or failed to load", err));
      }
  }, [patientDetails.email]);

  const handleSendChatMessage = async () => {
      if (!chatInput.trim()) return;
      
      const newMessages = [...chatMessages, { sender: 'user' as const, text: chatInput }];
      setChatMessages(newMessages);
      const messageText = chatInput;
      setChatInput('');
      setIsChatLoading(true);

      try {
          const res = await axios.post('http://localhost:8080/api/v1/public/ai/chat', {
              conversationId: conversationId || undefined,
              message: messageText,
              userEmail: patientDetails.email || undefined,
              selectedClinic: selectedClinic,
              selectedService: selectedService,
              selectedProvider: selectedProvider
          });
          
          if (res.data.conversationId) {
              setConversationId(res.data.conversationId);
              localStorage.setItem('omni_ai_conversation_id', res.data.conversationId);
          }

          if (res.data.recommendedSlots && res.data.recommendedSlots.length > 0) {
              setSmartAiSlots(res.data.recommendedSlots);
          }

          setChatMessages([...newMessages, { 
              sender: 'ai', 
              text: res.data.responseText, 
              slotId: res.data.actionSlotId 
          }]);
      } catch (err) {
          setChatMessages([...newMessages, { sender: 'ai', text: "Sorry, I'm having trouble connecting to my servers right now." }]);
      } finally {
          setIsChatLoading(false);
      }
  };


  const handlePaymentInitiate = async () => {
    if (!patientDetails.name || !patientDetails.phone) {
      alert("Please fill in your Name and Phone number");
      return;
    }

    const slotsArray = activeTab === 'classic' ? dynamicSlots : [
      { id: '1', price: 'रू 1,500' }, { id: '2', price: 'रू 1,500' }, { id: '3', price: 'रू 1,500' }, { id: '4', price: 'रू 1,500' }, { id: '5', price: 'रू 1,500' }
    ];

    const total = selectedSlots.reduce((sum, id) => {
      const slot = slotsArray.find(s => s.id === id);
      if (slot) {
        const priceNum = parseInt(slot.price.replace(/[^\d]/g, ''), 10);
        return sum + priceNum;
      }
      return sum;
    }, 0);
    
    try {
      const translatedSlots = selectedSlots.map(id => {
        if (!id.includes('-')) {
            const aiSlot = smartAiSlots.find(s => s.id === id);
            if (aiSlot) {
                try {
                    const dateObj = new Date(aiSlot.date);
                    const year = dateObj.getFullYear();
                    const month = (dateObj.getMonth() + 1).toString().padStart(2, '0');
                    const day = dateObj.getDate().toString().padStart(2, '0');
                    
                    const isPM = aiSlot.time.includes('PM');
                    const timeParts = aiSlot.time.split(' ')[0].split(':');
                    let hours = parseInt(timeParts[0]);
                    if (isPM && hours !== 12) hours += 12;
                    if (!isPM && hours === 12) hours = 0;
                    const timeStr = `${hours.toString().padStart(2, '0')}:${timeParts[1]}`;
                    
                    return `${selectedProvider || '68'}-${year}-${month}-${day}-${timeStr}`;
                } catch(e) {
                    console.error("Failed to parse AI slot date/time", e);
                }
            }
        }
        return id;
      });

      const res = await axios.post('http://localhost:8080/api/v1/public/booking/initiate', {
        tenantId: selectedClinic || '9', // Fallback to 9 if empty
        providerId: selectedProvider || '68',
        patientName: patientDetails.name,
        patientPhone: patientDetails.phone,
        patientEmail: patientDetails.email,
        reasonForVisit: patientDetails.reason,
        serviceName: selectedService || 'Consultation',
        appointmentType: (selectedService || '').toLowerCase().includes('telemedicine') || (selectedService || '').toLowerCase().includes('virtual') || (selectedService || '').toLowerCase().includes('video') ? 'VIRTUAL' : 'IN_PERSON',
        selectedSlots: translatedSlots,
        totalAmount: total,
        paymentMethod: selectedPaymentMethod
      });
      
      if (res.data.success) {
        const { gatewayUrl, formData } = res.data;
        
        if (formData) {
          // eSewa or similar form-based redirect
          const form = document.createElement('form');
          form.method = 'POST';
          form.action = gatewayUrl;
          
          for (const key in formData) {
            const hiddenField = document.createElement('input');
            hiddenField.type = 'hidden';
            hiddenField.name = key;
            hiddenField.value = formData[key];
            form.appendChild(hiddenField);
          }
          
          document.body.appendChild(form);
          form.submit();
        } else if (gatewayUrl) {
          // Stripe or direct URL redirect
          window.location.href = gatewayUrl;
        }
      }
    } catch (error) {
      console.error("Payment initiation failed", error);
      alert("Failed to initiate payment. Ensure the backend is running and reachable.");
    }
  };

  useEffect(() => {
    if (selectedProvider && selectedDate && selectedService) {
      const year = selectedDate.getFullYear();
      const month = (selectedDate.getMonth() + 1).toString().padStart(2, '0');
      const day = selectedDate.getDate().toString().padStart(2, '0');
      const dateStr = `${year}-${month}-${day}`;
      axios.get(`http://localhost:8080/api/v1/public/booking/providers/${selectedProvider}/slots`, {
        params: {
          date: dateStr,
          serviceName: selectedService
        }
      }).then(res => {
        if (res.data.success) {
          setDynamicSlots(res.data.slots);
          setIsClosed(res.data.isClosed || false);
          setClosedMessage(res.data.closedMessage || '');
          // Initialize inventory for new slots
          const newInv: Record<string, number> = {};
          res.data.slots.forEach((s: any) => {
            if (!s.isBreak) newInv[s.id] = 1; // Assuming 1 available slot per time
          });
          setInventory(newInv);
        }
      }).catch(err => {
        console.error("Failed to fetch dynamic slots", err);
        setDynamicSlots([]);
        setIsClosed(false);
        setClosedMessage('');
      });
    } else {
      setDynamicSlots([]);
      setIsClosed(false);
      setClosedMessage('');
    }
  }, [selectedProvider, selectedDate, selectedService]);

  // Prevent orphaned slots when context changes
  useEffect(() => {
    setSelectedSlots([]);
    setStagingSlots([]);
  }, [selectedClinic, selectedService, selectedProvider, selectedDate]);

  const slots = [...smartAiSlots, ...dynamicSlots];
  
  const displayedClassicSlots = (selectedService && selectedProvider)
    ? dynamicSlots 
    : [];

  console.log("RENDER -> dynamicSlots:", dynamicSlots, "selectedService:", selectedService, "selectedProvider:", selectedProvider, "displayed:", displayedClassicSlots);

  // Smart AI adds directly to cart
  const toggleSlot = (id: string | number) => {
    const stringId = id.toString();
    const targetSlot = slots.find(s => s.id === id || s.id === stringId);
    if (!targetSlot) return;

    setSelectedSlots(prev => {
      if (prev.includes(stringId)) {
        setInventory(inv => {
          if (inv[stringId] !== undefined) return { ...inv, [stringId]: inv[stringId] + 1 };
          return inv;
        });
        return prev.filter(slotId => slotId !== stringId);
      } else {
        if (prev.length >= 3) {
          alert('You can select a maximum of 3 appointments at a time.');
          return prev;
        }

        // Check for time collision
        const hasTimeCollision = prev.some(existingId => {
          const existingSlot = slots.find(s => s.id === existingId || s.id.toString() === existingId);
          return existingSlot && existingSlot.date === targetSlot.date && existingSlot.time === targetSlot.time;
        });
        if (hasTimeCollision) {
          alert('You already have an appointment at that time.');
          return prev;
        }

        if (inventory[stringId] !== undefined && inventory[stringId] <= 0) {
          alert('This slot is fully booked.');
          return prev;
        }
        setInventory(inv => {
          if (inv[stringId] !== undefined) return { ...inv, [stringId]: inv[stringId] - 1 };
          return inv;
        });
        return [...prev, stringId];
      }
    });
  };

  // Classic Calendar adds to staging first
  const toggleStagingSlot = (id: string | number) => {
    const stringId = id.toString();
    const targetSlot = slots.find(s => s.id === id || s.id === stringId);
    if (!targetSlot) return;

    setStagingSlots(prev => {
      if (prev.includes(stringId)) {
        return prev.filter(slotId => slotId !== stringId);
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
        return [...prev, stringId];
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
    axios.get('http://localhost:8080/api/v1/public/booking/locations')
      .then(res => {
        if (res.data.success) {
          setLocations(res.data.locations);
        }
      })
      .catch(console.error);
  }, []);

  useEffect(() => {
    const url = selectedLocation 
      ? `http://localhost:8080/api/v1/public/booking/clinics?location=${encodeURIComponent(selectedLocation)}`
      : `http://localhost:8080/api/v1/public/booking/clinics`;
      
    axios.get(url)
      .then(res => {
        if (res.data.success) {
          setClinics(res.data.clinics);
          if (!res.data.clinics.find((c: any) => c.id.toString() === selectedClinic)) {
            setSelectedClinic('');
          }
        }
      })
      .catch(console.error);
  }, [selectedLocation]);

  useEffect(() => {
    if (!selectedClinic) {
      setDbServices([]);
      setSelectedService('');
      return;
    }
    axios.get(`http://localhost:8080/api/v1/public/booking/clinics/${selectedClinic}/services`)
      .then(res => {
        if (res.data.success) {
          setDbServices(res.data.services);
        }
      })
      .catch(console.error);
  }, [selectedClinic]);

  useEffect(() => {
    if (!selectedClinic) {
      setDbProviders([]);
      setSelectedProvider('');
      return;
    }
    const url = selectedService
      ? `http://localhost:8080/api/v1/public/booking/clinics/${selectedClinic}/providers?serviceName=${encodeURIComponent(selectedService)}`
      : `http://localhost:8080/api/v1/public/booking/clinics/${selectedClinic}/providers`;
      
    axios.get(url)
      .then(res => {
        if (res.data.success) {
          setDbProviders(res.data.providers);
        }
      })
      .catch(console.error);
  }, [selectedClinic, selectedService]);

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

  return (
    <div className="bg-[#f9f9ff] text-[#151c27] font-sans antialiased min-h-screen flex flex-col">
      {/* TopNavBar */}
      <UserTopNavigation />

      <main className="mt-20 flex-1">
        {/* Location Context */}
        <header className="pt-6 sm:pt-8 bg-white pb-6 sm:pb-8 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-10">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl sm:text-[32px] font-bold text-[#151c27] leading-tight">Book Your Slot</h1>
                <p className="text-sm sm:text-[16px] text-[#53606c] mt-1">Select a branch and find your preferred time.</p>
              </div>
              <div className="flex gap-3 sm:gap-4 flex-wrap w-full md:w-auto">
                <div className="relative w-full sm:w-auto sm:min-w-[240px] flex-1">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-[#737686]">location_on</span>
                  <select 
                    value={selectedLocation}
                    onChange={(e) => setSelectedLocation(e.target.value)}
                    className="w-full pl-10 pr-8 py-3 bg-[#f9f9ff] border border-[#c3c5d7] rounded-xl focus:ring-2 focus:ring-[#003fb1] focus:border-transparent appearance-none font-medium text-xs sm:text-[14px] cursor-pointer"
                  >
                    <option value="">All Locations</option>
                    {locations.map((loc, i) => (
                      <option key={i} value={loc}>{loc}</option>
                    ))}
                  </select>
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-[#737686] pointer-events-none">expand_more</span>
                </div>
                
                <div className="relative w-full sm:w-auto sm:min-w-[240px] flex-1">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-[#737686]">local_hospital</span>
                  <select 
                    value={selectedClinic}
                    onChange={(e) => {
                      setSelectedClinic(e.target.value);
                      setSelectedService('');
                      setSelectedProvider('');
                    }}
                    className="w-full pl-10 pr-8 py-3 bg-[#f9f9ff] border border-[#c3c5d7] rounded-xl focus:ring-2 focus:ring-[#003fb1] focus:border-transparent appearance-none font-medium text-xs sm:text-[14px] cursor-pointer"
                  >
                    <option value="">Select Clinic/Organization</option>
                    {clinics.map(clinic => (
                      <option key={clinic.id} value={clinic.id.toString()}>{clinic.organizationName}</option>
                    ))}
                  </select>
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-[#737686] pointer-events-none">expand_more</span>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Hybrid Toggle */}
        <section className="py-6 sm:py-10 flex justify-center px-4">
          <div className="inline-flex p-1 bg-[#e2e8f8] rounded-full shadow-inner max-w-full overflow-x-auto">
            <button 
              onClick={() => setActiveTab('smart_ai')}
              className={`flex items-center gap-1.5 sm:gap-2 px-4 sm:px-8 py-2 sm:py-2.5 rounded-full text-xs sm:text-[14px] transition-all duration-200 cursor-pointer ${
                activeTab === 'smart_ai' ? 'bg-[#1a56db] text-white font-bold shadow-sm' : 'text-[#53606c] hover:text-[#003fb1] font-medium'
              }`}
            >
              <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>bolt</span>
              Smart AI Booking
            </button>
            <button 
              onClick={() => setActiveTab('classic')}
              className={`flex items-center gap-1.5 sm:gap-2 px-4 sm:px-8 py-2 sm:py-2.5 rounded-full text-xs sm:text-[14px] transition-all duration-200 cursor-pointer ${
                activeTab === 'classic' ? 'bg-[#1a56db] text-white font-bold shadow-sm' : 'text-[#53606c] hover:text-[#003fb1] font-medium'
              }`}
            >
              <span className="material-symbols-outlined text-[18px]">calendar_today</span>
              Classic Calendar
            </button>
          </div>
        </section>

        {/* Main Arena */}
        {activeTab === 'smart_ai' ? (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-10 grid grid-cols-1 lg:grid-cols-10 gap-8 lg:gap-12 pb-12">
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
                  {slot.matchReason && (
                    <div className="mb-2 mr-20 px-2.5 py-1 rounded-md bg-[#e2e8f8] border border-[#1a56db]/20 flex items-center gap-1.5 text-[#003fb1] text-[11px] font-semibold">
                      <span className="material-symbols-outlined text-[14px]">auto_awesome</span>
                      <span>{slot.matchReason}</span>
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
              {chatMessages.map((msg, index) => (
                <div key={index} className={`flex gap-3 ${msg.sender === 'user' ? 'flex-row-reverse' : ''}`}>
                  <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-white ${msg.sender === 'user' ? 'bg-[#d6e4f3]' : 'bg-[#1a56db]'}`}>
                    {msg.sender === 'user' ? (
                        <img alt="User" className="rounded-full" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBCJAtaa3APCnGE15ECMND9A6T9Pfct8FiskQihTKzYfC28WhDCbSt7OKUQhXkpoyUg9eZlFyJdyuWGEGxFxfTyJGAjgg4v0Te4YcFQ6FZOOc_Iut-RolH9y1FqAQyUfR15YJg4YGVGqs1C0j-PMJQ6gLnDOBgEsiIaFPSc8oetKVV5CLexaC7xH1JaTsVmr4XVifTGPALlVf0oxKSea5867L-kfW-bKe6utGTzSN7iXENnVTLXjuyBjeqS8EgaG4Ako0S8zbHeXdo" />
                    ) : (
                        <span className="material-symbols-outlined text-[16px]">smart_toy</span>
                    )}
                  </div>
                  <div className={`p-4 rounded-2xl max-w-[80%] shadow-sm ${msg.sender === 'user' ? 'bg-[#e2e8f8] rounded-tr-none' : 'bg-[#003fb1] text-white rounded-tl-none shadow-lg'}`}>
                    <p className="text-[15px] leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                    {msg.slotId && (
                      <div className="mt-3 pt-2 border-t border-white/20 flex items-center justify-between">
                        <button 
                          onClick={(e) => { e.preventDefault(); toggleSlot(msg.slotId!); }}
                          className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm active:scale-95 ${
                            selectedSlots.includes(msg.slotId)
                              ? 'bg-[#10b981] text-white'
                              : 'bg-white text-[#003fb1] hover:bg-[#6ffbbe] hover:text-[#002113]'
                          }`}
                        >
                          <span className="material-symbols-outlined text-[14px]">
                            {selectedSlots.includes(msg.slotId) ? 'check_circle' : 'calendar_add_on'}
                          </span>
                          {selectedSlots.includes(msg.slotId) ? 'Selected in Booking' : 'Select & Book Slot'}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {isChatLoading && (
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#1a56db] flex items-center justify-center text-[#d4dcff] flex-shrink-0">
                    <span className="material-symbols-outlined text-[16px]">smart_toy</span>
                  </div>
                  <div className="bg-[#003fb1] text-white p-4 rounded-2xl rounded-tl-none max-w-[80%] shadow-lg">
                    <span className="animate-pulse">Typing...</span>
                  </div>
                </div>
              )}
            </div>
            
            {/* Chat Input */}
            <div className="p-6 border-t border-[#c3c5d7]/30 bg-[#f9f9ff]">
              <div className="flex items-center gap-2 bg-white rounded-xl border border-[#c3c5d7] p-2 shadow-inner focus-within:ring-2 focus-within:ring-[#1a56db]/20 transition-all">
                <input 
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendChatMessage()}
                  className="flex-1 border-none outline-none focus:ring-0 bg-transparent text-[16px] py-2 px-2" 
                  placeholder="Type your message here..." 
                  type="text" 
                  disabled={isChatLoading}
                />
                <button 
                  onClick={handleSendChatMessage}
                  disabled={isChatLoading || !chatInput.trim()}
                  className="bg-[#1a56db] text-white px-4 py-2 rounded-lg font-bold hover:bg-[#123e9e] transition-all active:scale-95 flex items-center gap-2 disabled:opacity-50"
                >
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
                    {dbServices.map((s, idx) => (
                      <option key={idx} value={s}>{s}</option>
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
                    disabled={dbProviders.length === 0}
                    className="w-full h-14 pl-12 pr-10 bg-white border border-[#c3c5d7] rounded-xl appearance-none focus:ring-2 focus:ring-[#003fb1] focus:border-transparent outline-none text-[16px] cursor-pointer disabled:opacity-50 disabled:bg-[#f9f9ff]"
                  >
                    <option value="">Choose a Professional</option>
                    {dbProviders.map(p => (
                      <option key={p.id} value={p.id.toString()}>{p.fullName}</option>
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
                    Booking with: <span className="text-[#003fb1] font-bold">{dbProviders.find(p => p.id.toString() === selectedProvider)?.fullName}</span>
                  </h2>
                )}
                <div className="flex items-center justify-between mb-8">
                  <h3 className="text-[20px] font-bold text-[#151c27]">
                    {selectedDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
                  </h3>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => setSelectedDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth() - 1, 1))}
                      className="p-2 hover:bg-[#e7eefe] rounded-full transition-colors active:scale-95"
                    >
                      <span className="material-symbols-outlined text-[#53606c]">chevron_left</span>
                    </button>
                    <button 
                      onClick={() => setSelectedDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 1))}
                      className="p-2 hover:bg-[#e7eefe] rounded-full transition-colors active:scale-95"
                    >
                      <span className="material-symbols-outlined text-[#53606c]">chevron_right</span>
                    </button>
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
                  
                  {(() => {
                    const year = selectedDate.getFullYear();
                    const month = selectedDate.getMonth();
                    const firstDay = new Date(year, month, 1).getDay();
                    const daysInMonth = new Date(year, month + 1, 0).getDate();
                    
                    const days = [];
                    for (let i = 0; i < firstDay; i++) {
                      days.push(<div key={`empty-${i}`} className="py-2 text-[14px] text-[#c3c5d7] font-medium"></div>);
                    }
                    for (let i = 1; i <= daysInMonth; i++) {
                      const isSelected = selectedDate.getDate() === i;
                      days.push(
                        <div 
                          key={`day-${i}`} 
                          onClick={() => setSelectedDate(new Date(year, month, i))}
                          className="py-2 relative group cursor-pointer transition-all"
                        >
                          {isSelected && <div className="absolute inset-0 bg-[#1a56db] rounded-xl shadow-md scale-95 z-0"></div>}
                          <span className={`relative z-10 text-[14px] ${isSelected ? 'text-white font-bold' : 'font-medium text-[#151c27]'}`}>{i}</span>
                          {!isSelected && <div className="absolute inset-0 bg-[#f0f3ff] opacity-0 group-hover:opacity-100 rounded-xl transition-opacity"></div>}
                        </div>
                      );
                    }
                    return days;
                  })()}
                </div>
              </div>

              {/* Right Column: Slots */}
              <div className="lg:col-span-7 bg-white rounded-2xl p-6 md:p-8 shadow-[0_4px_20px_rgba(26,86,219,0.05)]">
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                  <h3 className="text-[20px] font-bold text-[#151c27]">Available Slots for <span className="text-[#003fb1]">{selectedDate.toLocaleString('default', { month: 'short' })} {selectedDate.getDate()}, {selectedDate.getFullYear()}</span></h3>
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
                ) : isClosed ? (
                  <div className="flex flex-col items-center justify-center py-16 text-center bg-[#fff8f6] rounded-xl border border-[#ffe0d3] shadow-sm">
                    <div className="w-16 h-16 bg-[#ffe0d3] rounded-full flex items-center justify-center mb-4 text-[#d94a1d]">
                      <span className="material-symbols-outlined text-[32px]">event_busy</span>
                    </div>
                    <h4 className="text-[20px] font-bold text-[#151c27] mb-2">Not Available on this Date</h4>
                    <p className="text-[15px] text-[#53606c] max-w-md mb-6 leading-relaxed">
                      {closedMessage ? closedMessage : "The provider is not available for appointments on this day. Please select another date."}
                    </p>
                    <div className="flex items-center gap-2 text-[#d94a1d] font-medium text-[14px] bg-[#fff0ea] px-4 py-2 rounded-lg">
                      <span className="material-symbols-outlined text-[18px]">info</span>
                      Try checking the next available date
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col gap-4">
                    <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4">
                      {displayedClassicSlots.map((slot, index) => {
                    const isBreak = slot.isBreak;
                    const isSoldOut = !isBreak && (inventory[slot.id] !== undefined && inventory[slot.id] <= 0); 
                    const isStaged = stagingSlots.includes(slot.id);
                    const isInCart = selectedSlots.includes(slot.id);
                    
                    if (isBreak) {
                      return (
                        <div key={`break-${slot.id}`} className="relative p-4 bg-[#f0f3ff] border border-[#c3c5d7]/30 rounded-xl flex flex-col items-center justify-center gap-1 opacity-70 cursor-not-allowed">
                          <span className="text-[14px] text-[#53606c] font-medium line-through">{slot.time}</span>
                          <span className="text-[10px] font-bold text-[#003fb1] uppercase tracking-wider flex items-center gap-1">
                            <span className="material-symbols-outlined text-[12px]">local_cafe</span>Break
                          </span>
                        </div>
                      );
                    }

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
                  
                  // Find the image for this provider from the selected slots
                  const slotWithImage = slots.find(s => selectedSlots.includes(s.id) && s.providerImageUrl);
                  const imageUrl = slotWithImage?.providerImageUrl || "https://plus.unsplash.com/premium_photo-1661764878654-3d0fc2eefcca?q=80&w=200&auto=format&fit=crop";

                  return (
                    <>
                      <img 
                        src={imageUrl} 
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
                        {uniqueProviders.map((providerString, index) => {
                          const slotWithImage = slots.find(s => s.provider === providerString && s.providerImageUrl);
                          const imageUrl = slotWithImage?.providerImageUrl || [
                            "https://plus.unsplash.com/premium_photo-1661764878654-3d0fc2eefcca?q=80&w=200&auto=format&fit=crop",
                            "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?q=80&w=200&auto=format&fit=crop",
                            "https://lh3.googleusercontent.com/aida-public/AB6AXuALan3Fe5liRYVvqOzbYPXALuhl1M_JrzKY62jsudutF-Y4kRwnw4no-RMdfy3kIqv1Pwvt4YNwLk09F8-YiOqLdcmDLbD8z8PfxNXA5LulAwItUiFnPDiM2CIPYIlitAQwvN0vTuDjaDgHGdcvqmtnQVICN825lJ_J6Gay2MKwe9QZ5j0m2TW3QgH9DIcW4nkj_-PRO8Ny3cmQDxAWN3MCHm9Grv2-ok3arYQPU0wypdDtdLrnEcUA0n9wYoUk0Nv28IHRfPR7qzs"
                          ][index % 3];
                          
                          return (
                            <img key={index} alt={`Doctor ${index + 1}`} className="inline-block h-12 w-12 rounded-full object-cover ring-2 ring-white" src={imageUrl} />
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
              onClick={() => setShowPatientModal(true)}
              disabled={selectedSlots.length === 0}
              className={`w-full md:w-auto px-8 py-3 rounded-xl font-bold text-[16px] transition-all flex items-center justify-center gap-2 ${
                selectedSlots.length === 0 
                  ? 'bg-[#c3c5d7] text-white cursor-not-allowed shadow-none' 
                  : 'bg-[#005438] text-white shadow-[0_8px_30px_rgba(16,185,129,0.3)] hover:scale-[1.02] active:scale-95'
              }`}
            >
              <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>payments</span>
              Confirm Appointment
            </button>
          </div>
        </div>
      </footer>

      {/* Patient Details Modal */}
      {showPatientModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl animate-fade-in-up">
            <div className="px-8 py-6 border-b border-[#c3c5d7]/30 flex justify-between items-center bg-gray-50/50">
              <h2 className="text-2xl font-bold text-[#151c27]">Patient Details</h2>
              <button 
                onClick={() => setShowPatientModal(false)}
                className="p-2 hover:bg-[#f0f3ff] rounded-full transition-colors text-[#53606c]"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            
            <div className="p-8 space-y-5">
              <div>
                <label className="block text-sm font-semibold text-[#151c27] mb-2">Full Name *</label>
                <input 
                  type="text" 
                  value={patientDetails.name}
                  onChange={(e) => setPatientDetails({...patientDetails, name: e.target.value})}
                  className="w-full px-5 py-3 rounded-xl border border-[#c3c5d7] focus:ring-2 focus:ring-[#005438] focus:border-transparent outline-none transition-all"
                  placeholder="E.g., Ram Bahadur"
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-semibold text-[#151c27] mb-2">Phone Number *</label>
                  <input 
                    type="tel" 
                    value={patientDetails.phone}
                    onChange={(e) => setPatientDetails({...patientDetails, phone: e.target.value})}
                    className="w-full px-5 py-3 rounded-xl border border-[#c3c5d7] focus:ring-2 focus:ring-[#005438] focus:border-transparent outline-none transition-all"
                    placeholder="98XXXXXXXX"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-[#151c27] mb-2">Email Address</label>
                  <input 
                    type="email" 
                    value={patientDetails.email}
                    onChange={(e) => setPatientDetails({...patientDetails, email: e.target.value})}
                    className="w-full px-5 py-3 rounded-xl border border-[#c3c5d7] focus:ring-2 focus:ring-[#005438] focus:border-transparent outline-none transition-all"
                    placeholder="Optional"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-[#151c27] mb-2">Reason for Visit</label>
                <textarea 
                  value={patientDetails.reason}
                  onChange={(e) => setPatientDetails({...patientDetails, reason: e.target.value})}
                  className="w-full px-5 py-3 rounded-xl border border-[#c3c5d7] focus:ring-2 focus:ring-[#005438] focus:border-transparent outline-none transition-all resize-none"
                  rows={3}
                  placeholder="Briefly describe your symptoms or reason for visit..."
                ></textarea>
              </div>

              {/* Payment Method Selection */}
              <div>
                <label className="block text-sm font-semibold text-[#151c27] mb-3">Select Payment Method</label>
                <div className="grid grid-cols-2 gap-4">
                  {/* Stripe Card */}
                  <div 
                    onClick={() => setSelectedPaymentMethod('STRIPE')}
                    className={`cursor-pointer rounded-xl border-2 p-4 flex flex-col items-center justify-center gap-2 transition-all ${
                      selectedPaymentMethod === 'STRIPE' 
                        ? 'border-[#635BFF] bg-[#635BFF]/5 shadow-[0_4px_12px_rgba(99,91,255,0.2)]' 
                        : 'border-[#c3c5d7] hover:border-[#635BFF]/50 bg-white'
                    }`}
                  >
                    <div className="h-8 flex items-center justify-center">
                      <span className="text-[#635BFF] font-black text-xl tracking-tight">stripe</span>
                    </div>
                    <span className={`text-sm font-semibold ${selectedPaymentMethod === 'STRIPE' ? 'text-[#635BFF]' : 'text-[#53606c]'}`}>
                      Credit/Debit Card
                    </span>
                  </div>

                  {/* eSewa Card */}
                  <div 
                    onClick={() => setSelectedPaymentMethod('ESEWA')}
                    className={`cursor-pointer rounded-xl border-2 p-4 flex flex-col items-center justify-center gap-2 transition-all ${
                      selectedPaymentMethod === 'ESEWA' 
                        ? 'border-[#61b846] bg-[#61b846]/5 shadow-[0_4px_12px_rgba(97,184,70,0.2)]' 
                        : 'border-[#c3c5d7] hover:border-[#61b846]/50 bg-white'
                    }`}
                  >
                    <div className="h-8 flex items-center justify-center">
                      <span className="text-[#61b846] font-black text-xl italic">eSewa</span>
                    </div>
                    <span className={`text-sm font-semibold ${selectedPaymentMethod === 'ESEWA' ? 'text-[#61b846]' : 'text-[#53606c]'}`}>
                      Digital Wallet
                    </span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="px-8 py-5 border-t border-[#c3c5d7]/30 bg-gray-50/50 flex justify-end gap-4">
              <button 
                onClick={() => setShowPatientModal(false)}
                className="px-6 py-2.5 rounded-xl font-semibold text-[#53606c] hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handlePaymentInitiate}
                className="px-8 py-2.5 bg-[#005438] text-white rounded-xl font-bold hover:scale-[1.02] active:scale-95 transition-all flex items-center gap-2 shadow-[0_4px_14px_rgba(0,84,56,0.3)]"
              >
                <span className="material-symbols-outlined text-[18px]">lock</span>
                Proceed to Payment
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookAppointmentPage;
