import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate, NavLink } from 'react-router-dom';
import ProviderTopNavigation from './components/ProviderTopNavigation';
import ProviderSidebar from './components/ProviderSidebar';
import { useOrganizationTerms } from '../../utils/organizationTerms';
import axios from 'axios';
import VideoConsultationModal from '../../components/VideoConsultationModal';

// --- HELPERS ---
const calculateTop = (timeStr: string) => {
  if (!timeStr) return 0;
  const [hours, minutes] = timeStr.split(':').map(Number);
  const hoursSince8 = (hours + minutes / 60) - 8;
  return Math.max(0, hoursSince8 * 100);
};

const getCurrentTimeTop = () => {
  const now = new Date();
  const hoursSince8 = (now.getHours() + now.getMinutes() / 60) - 8;
  return Math.max(0, hoursSince8 * 100);
};

const getAppointmentsForDate = (date: Date, appointments: any[]) => {
  return appointments.filter(app => {
    if (!app.appointmentDate) return false;
    const appDate = new Date(app.appointmentDate);
    return appDate.getFullYear() === date.getFullYear() &&
           appDate.getMonth() === date.getMonth() &&
           appDate.getDate() === date.getDate();
  });
};

const getStatusBg = (status: string) => {
  if (status === 'SCHEDULED') return 'bg-primary border-primary';
  if (status === 'CHECKED_IN') return 'bg-primary border-primary';
  if (status === 'COMPLETED') return 'bg-[#006f4b] border-[#005438]';
  return 'bg-[#737686] border-[#53606c]'; // Default fallback
};

// Layout algorithm for overlapping events
const layoutEvents = (dayApps: any[], services: any[]) => {
  // Create a map of serviceName -> duration
  const durationMap: Record<string, number> = {};
  services.forEach(s => {
    durationMap[s.serviceName] = s.durationMinutes || 60;
  });

  const events = dayApps.map(app => {
    const top = calculateTop(app.appointmentTime);
    const duration = durationMap[app.serviceName] || 60;
    const height = (duration / 60) * 100;
    return { ...app, top, height, bottom: top + height };
  });

  // Sort by top, then by height (longest first)
  events.sort((a, b) => a.top - b.top || b.height - a.height);

  const islands: any[][] = [];
  let currentIsland: any[] = [];
  let islandEnd = 0;

  // Group events into overlapping islands
  events.forEach(ev => {
    if (currentIsland.length === 0) {
      currentIsland.push(ev);
      islandEnd = ev.bottom;
    } else if (ev.top < islandEnd) {
      currentIsland.push(ev);
      islandEnd = Math.max(islandEnd, ev.bottom);
    } else {
      islands.push(currentIsland);
      currentIsland = [ev];
      islandEnd = ev.bottom;
    }
  });
  if (currentIsland.length > 0) islands.push(currentIsland);

  // Assign columns within each island
  islands.forEach(island => {
    let cols: any[][] = [];
    island.forEach(ev => {
      let placed = false;
      for (let i = 0; i < cols.length; i++) {
        let col = cols[i];
        if (col[col.length - 1].bottom <= ev.top) {
          col.push(ev);
          ev.col = i;
          placed = true;
          break;
        }
      }
      if (!placed) {
        cols.push([ev]);
        ev.col = cols.length - 1;
      }
    });

    // Calculate width and left based on number of columns in this island
    island.forEach(ev => {
      ev.width = 100 / cols.length;
      ev.left = ev.col * ev.width;
    });
  });

  return events;
};

// --- SUB-COMPONENTS FOR DIFFERENT CALENDAR VIEWS ---

const DayViewGrid: React.FC<{ currentDate: Date, appointments: any[], services: any[], openPanel: any }> = ({ currentDate, appointments, services, openPanel }) => {
  const dayApps = getAppointmentsForDate(currentDate, appointments);
  const layoutedEvents = useMemo(() => layoutEvents(dayApps, services), [dayApps, services]);
  const currentTimeTop = getCurrentTimeTop();
  
  const [currentTimeStr, setCurrentTimeStr] = useState(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTimeStr(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="flex-1 bg-white rounded-2xl border border-[#c3c5d7]/50 shadow-sm overflow-y-auto overflow-x-auto relative custom-scrollbar">
      {/* Day Header (Sticky) */}
      <div className="sticky top-0 bg-white z-20 border-b border-[#c3c5d7]/30 flex">
        <div className="w-20 shrink-0 bg-white border-r border-[#c3c5d7]/30"></div>
        <div className="flex-1 py-4 text-center flex flex-col items-center justify-center bg-primary/5 relative">
          <div className="absolute top-0 left-0 right-0 h-1 bg-primary"></div>
          <span className="text-[11px] font-bold text-primary uppercase tracking-widest mb-1">
            {currentDate.toLocaleDateString('en-US', { weekday: 'short' })}
          </span>
          <span className="text-2xl font-light text-primary">
            {currentDate.getDate().toString().padStart(2, '0')}
          </span>
        </div>
      </div>
      
      {/* Main Grid Body */}
      <div className="flex relative min-h-[1000px]">
        {/* Time Labels Y-Axis */}
        <div className="w-20 shrink-0 relative border-r border-[#c3c5d7]/30 bg-white z-0">
          {[8,9,10,11,12,1,2,3,4,5,6].map((hour, i) => (
            <div key={i} className="absolute w-full text-center text-xs font-semibold text-[#53606c]" style={{ top: `${i * 100}px`, transform: 'translateY(-50%)' }}>
              {hour}:00 {i < 4 ? 'AM' : 'PM'}
            </div>
          ))}
        </div>

        {/* Grid Area */}
        <div className="flex-1 relative bg-primary/5">
          {/* Horizontal Grid Lines */}
          {[...Array(11)].map((_, i) => (
            <div key={i} className="absolute inset-x-0 border-t border-[#c3c5d7]/30" style={{ top: `${i * 100}px` }}></div>
          ))}

          {/* LIVE TIMELINE */}
          {currentDate.toDateString() === new Date().toDateString() && currentTimeTop >= 0 && currentTimeTop <= 1100 && (
            <div className="absolute left-0 right-0 z-10 flex items-center pointer-events-none" style={{ top: `${currentTimeTop}px`, transform: 'translateY(-50%)' }}>
              <div className="absolute -left-[76px] bg-[#ba1a1a] text-white text-[10px] font-bold py-1 px-2 rounded">
                {currentTimeStr}
              </div>
              <div className="w-3 h-3 bg-[#ba1a1a] rounded-full -ml-1.5 shadow-[0_0_0_4px_rgba(186,26,26,0.2)]"></div>
              <div className="flex-1 border-t-2 border-[#ba1a1a]"></div>
            </div>
          )}

          {/* Events */}
          {layoutedEvents.map((app) => {
            return (
              <div 
                key={app.id}
                className={`absolute rounded-xl ${getStatusBg(app.appointmentStatus)} text-white shadow-md pointer-events-auto flex flex-col p-3 overflow-hidden border hover:scale-[1.02] hover:-translate-y-1 transition-all cursor-pointer z-30`}
                style={{ top: `${app.top}px`, height: `${app.height}px`, left: `${app.left + 0.5}%`, width: `${app.width - 1}%` }}
                onClick={() => openPanel(app)}
              >
                <div className="flex justify-between items-center mb-1 gap-1">
                  <span className="text-[11px] font-bold text-white/90">{app.appointmentTime?.substring(0,5)}</span>
                  <span className={`text-[9px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-0.5 shadow-xs ${
                    app.appointmentStatus === 'COMPLETED' 
                      ? 'bg-emerald-100 text-emerald-800' 
                      : 'bg-blue-100 text-blue-800'
                  }`}>
                    <span className="material-symbols-outlined text-[11px]">
                      {app.appointmentStatus === 'COMPLETED' ? 'task_alt' : 'event_available'}
                    </span>
                    {app.appointmentStatus === 'COMPLETED' ? 'Completed' : 'Booked'}
                  </span>
                </div>
                <div className="text-sm font-bold truncate">{app.patientName}</div>
                <div className="text-xs text-white/80 mt-0.5 truncate">{app.serviceName}</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

const WeekViewGrid: React.FC<{ currentDate: Date, appointments: any[], services: any[], openPanel: any }> = ({ currentDate, appointments, services, openPanel }) => {
  const startOfWeek = new Date(currentDate);
  const day = startOfWeek.getDay();
  startOfWeek.setDate(startOfWeek.getDate() - day);

  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(startOfWeek);
    d.setDate(startOfWeek.getDate() + i);
    return d;
  });

  const currentTimeTop = getCurrentTimeTop();

  return (
    <div className="flex-1 bg-white rounded-2xl border border-[#c3c5d7]/50 shadow-sm overflow-y-auto overflow-x-auto relative custom-scrollbar">
      <div className="min-w-[720px] lg:min-w-full">
        {/* Days Header (Sticky) */}
        <div className="sticky top-0 bg-white z-20 border-b border-[#c3c5d7]/30 flex">
          <div className="w-20 shrink-0 bg-white border-r border-[#c3c5d7]/30"></div>
          <div className="flex-1 grid grid-cols-7">
          {days.map((d, idx) => {
            const isToday = d.toDateString() === new Date().toDateString();
            return (
              <div key={idx} className={`py-4 text-center border-l border-[#c3c5d7]/30 flex flex-col items-center justify-center ${isToday ? 'bg-primary/5 relative' : (idx > 4 ? 'opacity-60' : '')}`}>
                {isToday && <div className="absolute top-0 left-0 right-0 h-1 bg-primary"></div>}
                <span className={`text-[11px] font-bold ${isToday ? 'text-primary' : 'text-[#53606c]'} uppercase tracking-widest mb-1`}>
                  {d.toLocaleDateString('en-US', { weekday: 'short' })}
                </span>
                <span className={`text-2xl font-light ${isToday ? 'text-primary' : 'text-[#151c27]'}`}>
                  {d.getDate().toString().padStart(2, '0')}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Grid Body */}
      <div className="flex relative min-h-[1000px]">
        {/* Time Labels Y-Axis */}
        <div className="w-20 shrink-0 relative border-r border-[#c3c5d7]/30 bg-white z-0">
          {[8,9,10,11,12,1,2,3,4,5,6].map((hour, i) => (
            <div key={i} className="absolute w-full text-center text-xs font-semibold text-[#53606c]" style={{ top: `${i * 100}px`, transform: 'translateY(-50%)' }}>
              {hour}:00 {i < 4 ? 'AM' : 'PM'}
            </div>
          ))}
        </div>

        {/* Grid Area */}
        <div className="flex-1 relative bg-white">
          {/* Horizontal Grid Lines */}
          {[...Array(11)].map((_, i) => (
            <div key={i} className="absolute inset-x-0 border-t border-[#c3c5d7]/30" style={{ top: `${i * 100}px` }}></div>
          ))}

          {/* Vertical Day Columns & Events */}
          <div className="absolute inset-0 grid grid-cols-7 pointer-events-none">
            {days.map((d, idx) => {
              const dayApps = getAppointmentsForDate(d, appointments);
              const layoutedEvents = layoutEvents(dayApps, services);
              const isToday = d.toDateString() === new Date().toDateString();
              
              return (
                <div key={idx} className={`border-l border-[#c3c5d7]/30 relative ${isToday ? 'bg-primary/5' : ''}`}>
                  {isToday && currentTimeTop >= 0 && currentTimeTop <= 1100 && (
                    <div className="absolute left-0 right-0 z-10 flex items-center pointer-events-none" style={{ top: `${currentTimeTop}px`, transform: 'translateY(-50%)' }}>
                      <div className="w-2 h-2 bg-[#ba1a1a] rounded-full -ml-1 shadow-[0_0_0_4px_rgba(186,26,26,0.2)]"></div>
                      <div className="flex-1 border-t-2 border-[#ba1a1a]"></div>
                    </div>
                  )}

                  {layoutedEvents.map((app) => {
                    return (
                      <div 
                        key={app.id}
                        className={`absolute rounded-xl ${getStatusBg(app.appointmentStatus)} text-white shadow-md pointer-events-auto flex flex-col p-2 overflow-hidden border hover:scale-[1.02] hover:-translate-y-1 transition-all cursor-pointer z-30`}
                        style={{ top: `${app.top}px`, height: `${app.height}px`, left: `${app.left + 1}%`, width: `${app.width - 2}%` }}
                        onClick={() => openPanel(app)}
                      >
                        <div className="flex justify-between items-center mb-1 gap-1">
                          <span className="text-[10px] font-bold text-white/90">{app.appointmentTime?.substring(0,5)}</span>
                          <span className={`text-[8px] font-extrabold px-1.5 py-0.2 rounded-full uppercase tracking-wider ${
                            app.appointmentStatus === 'COMPLETED' 
                              ? 'bg-emerald-100 text-emerald-800' 
                              : 'bg-blue-100 text-blue-800'
                          }`}>
                            {app.appointmentStatus === 'COMPLETED' ? 'Completed' : 'Booked'}
                          </span>
                        </div>
                        <div className="text-sm font-bold truncate">{app.patientName}</div>
                        <div className="text-[10px] text-white/80 mt-0.5 truncate">{app.serviceName}</div>
                      </div>
                    );
                  })}
                </div>
              );
            })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const MonthViewGrid: React.FC<{ currentDate: Date, appointments: any[], openPanel: any }> = ({ currentDate, appointments, openPanel }) => {
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();

  const gridDays = [];
  
  // Padding from previous month
  for (let i = firstDayOfMonth - 1; i >= 0; i--) {
    gridDays.push({ date: new Date(year, month - 1, daysInPrevMonth - i), isCurrentMonth: false });
  }
  // Days of current month
  for (let i = 1; i <= daysInMonth; i++) {
    gridDays.push({ date: new Date(year, month, i), isCurrentMonth: true });
  }
  // Padding for next month to complete the grid (usually 35 or 42 cells)
  const remainingCells = (gridDays.length > 35 ? 42 : 35) - gridDays.length;
  for (let i = 1; i <= remainingCells; i++) {
    gridDays.push({ date: new Date(year, month + 1, i), isCurrentMonth: false });
  }

  return (
    <div className="flex-1 bg-white rounded-2xl border border-[#c3c5d7]/50 shadow-sm flex flex-col overflow-y-auto overflow-x-auto custom-scrollbar">
      <div className="min-w-[650px] lg:min-w-full flex-1 flex flex-col">
        {/* Days Header */}
        <div className="grid grid-cols-7 border-b border-[#c3c5d7]/30 bg-[#f9f9ff] shrink-0">
          {['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'].map(day => (
            <div key={day} className="py-3 text-center border-l first:border-l-0 border-[#c3c5d7]/30 text-[11px] font-bold text-[#53606c] uppercase tracking-widest">
              {day}
            </div>
          ))}
        </div>
      
      {/* Grid */}
      <div className={`flex-1 grid grid-cols-7 bg-white ${gridDays.length > 35 ? 'grid-rows-6' : 'grid-rows-5'}`}>
        {gridDays.map((cell, i) => {
          const isToday = cell.date.toDateString() === new Date().toDateString();
          const dayApps = getAppointmentsForDate(cell.date, appointments);

          return (
            <div key={i} className={`border-b border-l border-[#c3c5d7]/30 p-1.5 sm:p-2 flex flex-col gap-1 transition-colors hover:bg-[#f9f9ff] cursor-pointer
              ${!cell.isCurrentMonth ? 'bg-[#F3F4F6]/40 opacity-60' : ''}
              ${isToday ? 'bg-primary/5' : ''}
              ${(i % 7 === 0) ? 'border-l-0' : ''}
              ${(i >= gridDays.length - 7) ? 'border-b-0' : ''}
            `}>
              <div className="flex justify-end mb-1">
                <span className={`text-[12px] font-bold w-6 h-6 flex items-center justify-center rounded-full
                  ${isToday ? 'bg-primary text-on-primary shadow-md' : 'text-[#53606c]'}
                `}>
                  {cell.date.getDate()}
                </span>
              </div>
              
              <div className="flex flex-col gap-1 overflow-hidden">
                {dayApps.slice(0, 3).map(app => (
                  <div key={app.id} 
                       className="bg-primary/10 text-primary rounded px-1.5 py-0.5 text-[10px] font-bold truncate flex items-center justify-between gap-1 hover:bg-primary/20"
                       onClick={(e) => { e.stopPropagation(); openPanel(app); }}>
                    <div className="flex items-center gap-1 truncate">
                      <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${app.appointmentStatus === 'COMPLETED' ? 'bg-[#006f4b]' : 'bg-primary'}`}></div>
                      <span className="truncate">{app.appointmentTime?.substring(0,5)} {app.patientName.split(' ')[0]}</span>
                    </div>
                    <span className={`text-[8px] px-1 rounded uppercase font-extrabold shrink-0 ${
                      app.appointmentStatus === 'COMPLETED' ? 'bg-emerald-200 text-emerald-900' : 'bg-blue-200 text-blue-900'
                    }`}>
                      {app.appointmentStatus === 'COMPLETED' ? 'Done' : 'Booked'}
                    </span>
                  </div>
                ))}
                {dayApps.length > 3 && (
                  <div className="text-[10px] font-bold text-primary hover:underline px-1 mt-0.5 cursor-pointer">
                    +{dayApps.length - 3} More
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
      </div>
    </div>
  );
};

// --- MAIN PAGE COMPONENT ---

const MasterCalendarPage: React.FC = () => {
  const terms = useOrganizationTerms();
  const navigate = useNavigate();
  const [selectedPanel, setSelectedPanel] = useState<any>(null); // For slide panel
  const [activeVideoAppt, setActiveVideoAppt] = useState<any | null>(null);

  const handleToggleVideo = async (appointmentId: number, currentEnabled: boolean) => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.put(
        `http://localhost:8080/api/v1/provider/appointments/${appointmentId}/toggle-video`,
        { enabled: !currentEnabled },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.data.success) {
        setAppointments(prev => prev.map(a => a.id === appointmentId ? {
          ...a,
          videoCallEnabled: res.data.videoCallEnabled,
          meetingLink: res.data.meetingLink,
          appointmentType: res.data.appointmentType,
        } : a));
        if (selectedPanel && selectedPanel.id === appointmentId) {
          setSelectedPanel((prev: any) => ({
            ...prev,
            videoCallEnabled: res.data.videoCallEnabled,
            meetingLink: res.data.meetingLink,
            appointmentType: res.data.appointmentType,
          }));
        }
      }
    } catch (err) {
      console.error("Failed to toggle video call", err);
    }
  };
  const [calendarView, setCalendarView] = useState<'Day' | 'Week' | 'Month'>('Week');
  const [currentDate, setCurrentDate] = useState<Date>(new Date()); 
  const [appointments, setAppointments] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentRoleName, setCurrentRoleName] = useState<string | null>(() => localStorage.getItem('tenantRoleName'));
  const [rawPermissions, setRawPermissions] = useState<string | null>(() => localStorage.getItem('permissionsJson'));

  const hasCalendarWrite = useMemo(() => {
    if (!currentRoleName) return true;
    if (!rawPermissions) return true;
    try {
      const parsed = JSON.parse(rawPermissions);
      return parsed.calendar?.write === true;
    } catch (e) {
      return false;
    }
  }, [currentRoleName, rawPermissions]);

  const checkServiceAllowsVideo = (appt: any) => {
    if (!appt) return false;
    if (appt.serviceAllowsVideo !== undefined && appt.serviceAllowsVideo !== null) {
      return Boolean(appt.serviceAllowsVideo);
    }
    const matched = services.find((s: any) => 
      (s.serviceName && s.serviceName.trim().toLowerCase() === (appt.serviceName || '').trim().toLowerCase()) ||
      (s.name && s.name.trim().toLowerCase() === (appt.serviceName || '').trim().toLowerCase())
    );
    if (matched) {
      return Boolean(matched.isTelemedicine);
    }
    return false;
  };

  // Mark Complete Modal State
  const [isCompleteModalOpen, setIsCompleteModalOpen] = useState(false);
  const [completingApptId, setCompletingApptId] = useState<number | null>(null);
  const [completeForm, setCompleteForm] = useState({
    treatmentSummary: '',
    internalNotes: '',
    followUpMonths: '0'
  });

  const completeConfig = useMemo(() => {
    const norm = (terms.facilityLabel || '').toLowerCase();
    if (norm.includes('college') || norm.includes('acad')) {
      return {
        title: `Complete ${terms.appointmentSingular}`,
        summaryLabel: 'Session / Class Summary',
        summaryPlaceholder: 'Summarize topics covered, student progress, or class notes...',
        internalPlaceholder: `Private notes for ${terms.providerSingular.toLowerCase()} eyes only...`,
        followUpLabel: `Follow-up / Next ${terms.appointmentSingular}`,
        noFollowUpText: 'No follow-up session needed'
      };
    } else if (norm.includes('salon') || norm.includes('saloon') || norm.includes('spa')) {
      return {
        title: `Complete ${terms.appointmentSingular}`,
        summaryLabel: 'Service & Styling Summary',
        summaryPlaceholder: 'Summarize styling performed, treatments applied, or products used...',
        internalPlaceholder: `Private notes for ${terms.providerSingular.toLowerCase()} eyes only...`,
        followUpLabel: 'Follow-up Recommendation',
        noFollowUpText: 'No follow-up needed'
      };
    } else if (norm.includes('clinic') || norm.includes('hosp')) {
      return {
        title: `Complete ${terms.appointmentSingular}`,
        summaryLabel: 'Treatment Summary',
        summaryPlaceholder: 'Summarize the procedure, diagnosis, or service provided...',
        internalPlaceholder: 'Private notes for provider eyes only...',
        followUpLabel: 'Follow-up Recommendation',
        noFollowUpText: 'No follow-up needed'
      };
    } else {
      return {
        title: `Complete ${terms.appointmentSingular}`,
        summaryLabel: 'Service Summary',
        summaryPlaceholder: 'Summarize the service delivered, consultation notes, or outcomes...',
        internalPlaceholder: `Private notes for ${terms.providerSingular.toLowerCase()} eyes only...`,
        followUpLabel: `Follow-up / Next ${terms.appointmentSingular}`,
        noFollowUpText: 'No follow-up needed'
      };
    }
  }, [terms.facilityLabel, terms.appointmentSingular, terms.providerSingular]);

  // Cancel Modal State
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [cancellingApptId, setCancellingApptId] = useState<number | null>(null);

  const fetchData = () => {
    const token = localStorage.getItem('token');
    
    Promise.all([
      fetch('http://localhost:8080/api/v1/provider/appointments', { headers: { 'Authorization': `Bearer ${token}` } }),
      fetch('http://localhost:8080/api/v1/provider/services', { headers: { 'Authorization': `Bearer ${token}` } })
    ])
    .then(async ([appRes, svcRes]) => {
      const appData = await appRes.json();
      const svcData = await svcRes.json();
      
      if (appData.success) {
        const role = (localStorage.getItem('role') || '').toLowerCase();
        const isAdmin = role === 'admin' || role === 'role_admin' || role === 'super_admin';
        const currentFullName = (localStorage.getItem('fullName') || '').trim().toLowerCase();

        let appts = appData.appointments || [];
        if (!isAdmin && currentFullName) {
          appts = appts.filter((a: any) => {
            if (!a.doctorName) return true;
            return a.doctorName.trim().toLowerCase() === currentFullName;
          });
        }

        const filtered = appts.filter((a: any) => 
          ['SCHEDULED', 'CHECKED_IN', 'COMPLETED'].includes(a.appointmentStatus)
        );
        setAppointments(filtered);
      }
      
      if (svcData.success) {
        setServices(svcData.services || []);
      }
    })
    .catch(err => console.error("Failed to fetch data:", err))
    .finally(() => setLoading(false));
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    const role = (localStorage.getItem('role') || '').toLowerCase();
    const isProvider = role === 'service_provider' || role === 'provider' || role === 'role_provider';
    
    if (!token || !isProvider) {
      navigate('/login');
      return;
    }

    fetch('http://localhost:8080/api/v1/tenant/me', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    .then(res => res.json())
    .then(tenant => {
      if (tenant?.tenantRoleName !== undefined) {
        setCurrentRoleName(tenant.tenantRoleName);
        if (tenant.tenantRoleName) localStorage.setItem('tenantRoleName', tenant.tenantRoleName);
        else localStorage.removeItem('tenantRoleName');
      }
      if (tenant?.permissionsJson !== undefined) {
        setRawPermissions(tenant.permissionsJson);
        if (tenant.permissionsJson) localStorage.setItem('permissionsJson', tenant.permissionsJson);
        else localStorage.removeItem('permissionsJson');
      }
    })
    .catch(err => console.debug("Calendar tenant role sync:", err));

    fetchData();
  }, [navigate]);

  const handleLogout = (e: React.MouseEvent) => {
    e.preventDefault();
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('fullName');
    navigate('/login');
  };

  const openPanel = (appointment: any) => {
    setSelectedPanel(appointment);
  };

  const closePanel = () => {
    setSelectedPanel(null);
  };

  const handlePrev = () => {
    const newDate = new Date(currentDate);
    if (calendarView === 'Day') newDate.setDate(newDate.getDate() - 1);
    else if (calendarView === 'Week') newDate.setDate(newDate.getDate() - 7);
    else if (calendarView === 'Month') newDate.setMonth(newDate.getMonth() - 1);
    setCurrentDate(newDate);
  };

  const handleNext = () => {
    const newDate = new Date(currentDate);
    if (calendarView === 'Day') newDate.setDate(newDate.getDate() + 1);
    else if (calendarView === 'Week') newDate.setDate(newDate.getDate() + 7);
    else if (calendarView === 'Month') newDate.setMonth(newDate.getMonth() + 1);
    setCurrentDate(newDate);
  };

  const getFormattedDateRange = () => {
    if (calendarView === 'Day') {
      return currentDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
    } else if (calendarView === 'Week') {
      const startOfWeek = new Date(currentDate);
      const day = startOfWeek.getDay();
      const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1); 
      startOfWeek.setDate(diff);
      
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6);
      
      if (startOfWeek.getMonth() === endOfWeek.getMonth()) {
        return `${startOfWeek.toLocaleDateString('en-US', { month: 'long' })} ${startOfWeek.getDate()} - ${endOfWeek.getDate()}, ${startOfWeek.getFullYear()}`;
      } else {
         return `${startOfWeek.toLocaleDateString('en-US', { month: 'short' })} ${startOfWeek.getDate()} - ${endOfWeek.toLocaleDateString('en-US', { month: 'short' })} ${endOfWeek.getDate()}, ${startOfWeek.getFullYear()}`;
      }
    } else {
      return currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    }
  };

  const openCompleteModal = (id: number) => {
    setCompletingApptId(id);
    setIsCompleteModalOpen(true);
    setCompleteForm({ treatmentSummary: '', internalNotes: '', followUpMonths: '0' });
    closePanel();
  };

  const submitMarkComplete = (e: React.FormEvent) => {
    e.preventDefault();
    if (!completingApptId) return;
    const token = localStorage.getItem('token');
    fetch(`http://localhost:8080/api/v1/provider/appointments/${completingApptId}/complete`, {
      method: 'PUT',
      headers: { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(completeForm)
    })
    .then(res => res.json())
    .then(data => {
      if (data.success) {
        setIsCompleteModalOpen(false);
        fetchData();
        closePanel();
      } else {
        alert(data.message || 'Failed to mark as complete');
      }
    });
  };

  const openCancelModal = (id: number) => {
    setCancellingApptId(id);
    setIsCancelModalOpen(true);
    closePanel();
  };

  const confirmCancelAppointment = () => {
    if (!cancellingApptId) return;
    const token = localStorage.getItem('token');
    fetch(`http://localhost:8080/api/v1/provider/appointments/${cancellingApptId}/decline`, {
      method: 'PUT',
      headers: { 'Authorization': `Bearer ${token}` }
    })
    .then(res => res.json())
    .then(data => {
      if (data.success) {
        fetchData();
        closePanel();
        setIsCancelModalOpen(false);
        setCancellingApptId(null);
      } else {
        alert(data.message || 'Failed to cancel');
      }
    });
  };

  return (
    <div className="tenant-theme bg-[#F3F4F6] text-[#151c27] font-sans h-screen flex flex-col overflow-hidden relative">
      <ProviderTopNavigation />

      {/* SideNavBar */}
      <ProviderSidebar />

      {/* Main Content Area */}
      <main className="pt-24 pb-20 md:ml-64 px-4 md:px-10 min-h-screen w-full md:w-[calc(100%-256px)] flex flex-col relative overflow-hidden">
        
        {/* Calendar Header & Controls */}
        <div className="flex flex-wrap xl:flex-nowrap items-center justify-between mb-8 shrink-0 gap-4">
          {/* Title and Date Navigation */}
          <div className="flex flex-wrap md:flex-nowrap items-center gap-4 md:gap-8">
            <h1 className="text-[32px] font-bold text-[#151c27] tracking-tight">Calendar</h1>
            
            <div className="flex items-center gap-6">
              <div className="flex items-center bg-white border border-[#c3c5d7] rounded-full px-5 py-2 shadow-sm whitespace-nowrap">
                <button onClick={handlePrev} className="text-[#53606c] hover:text-[#151c27] transition flex items-center justify-center cursor-pointer">
                  <span className="material-symbols-outlined text-[18px]">chevron_left</span>
                </button>
                <span className="mx-4 md:mx-6 font-bold text-[#151c27]">{getFormattedDateRange()}</span>
                <button onClick={handleNext} className="text-[#53606c] hover:text-[#151c27] transition flex items-center justify-center cursor-pointer">
                  <span className="material-symbols-outlined text-[18px]">chevron_right</span>
                </button>
              </div>
              <span className="text-xs font-bold text-[#53606c] uppercase tracking-[0.2em] hidden sm:block whitespace-nowrap">
                TODAY: {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </span>
            </div>
          </div>

          {/* Right Controls */}
          <div className="flex flex-wrap md:flex-nowrap items-center gap-5">
            {/* Segmented Toggle */}
            <div className="flex bg-[#dce2f3] p-1 rounded-xl shrink-0">
              <button 
                onClick={() => setCalendarView('Day')}
                className={`px-5 py-2 text-sm transition rounded-lg ${calendarView === 'Day' ? 'font-bold bg-white text-primary shadow' : 'font-semibold text-[#53606c] hover:text-[#151c27]'}`}
              >
                Day
              </button>
              <button 
                onClick={() => setCalendarView('Week')}
                className={`px-5 py-2 text-sm transition rounded-lg ${calendarView === 'Week' ? 'font-bold bg-white text-primary shadow' : 'font-semibold text-[#53606c] hover:text-[#151c27]'}`}
              >
                Week
              </button>
              <button 
                onClick={() => setCalendarView('Month')}
                className={`px-5 py-2 text-sm transition rounded-lg ${calendarView === 'Month' ? 'font-bold bg-white text-primary shadow' : 'font-semibold text-[#53606c] hover:text-[#151c27]'}`}
              >
                Month
              </button>
            </div>
          </div>
        </div>

        {/* Dynamic Calendar Views rendering block */}
        {loading ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <>
            {calendarView === 'Day' && <DayViewGrid currentDate={currentDate} appointments={appointments} services={services} openPanel={openPanel} />}
            {calendarView === 'Week' && <WeekViewGrid currentDate={currentDate} appointments={appointments} services={services} openPanel={openPanel} />}
            {calendarView === 'Month' && <MonthViewGrid currentDate={currentDate} appointments={appointments} openPanel={openPanel} />}
          </>
        )}
      </main>

      {/* Slide Panel Overlay & Details */}
      {selectedPanel && (
        <>
          <div 
            className="fixed inset-0 bg-[#151c27]/20 backdrop-blur-sm z-[60] transition-opacity"
            onClick={closePanel}
          ></div>
          
          <div className="fixed top-0 right-0 bottom-0 w-full sm:w-[420px] max-w-full bg-white shadow-2xl z-[70] flex flex-col overflow-hidden animate-[slideInRight_0.3s_ease-out]">
            {/* Header */}
            <div className="px-8 py-6 flex justify-between items-start bg-gradient-to-b from-[#f9f9ff] to-white">
              <div>
                <span className={`px-3 py-1.5 rounded-lg text-[11px] font-bold uppercase tracking-widest border flex items-center gap-1.5
                  ${selectedPanel.appointmentStatus === 'COMPLETED' ? 'bg-[#e6f4ea] text-[#137333] border-[#ceead6]' : 
                    selectedPanel.appointmentStatus === 'CHECKED_IN' ? 'bg-primary/10 text-primary border-primary/20' :
                    'bg-primary/10 text-primary border-primary/20'}`}>
                  <div className={`w-1.5 h-1.5 rounded-full ${selectedPanel.appointmentStatus === 'COMPLETED' ? 'bg-[#137333]' : 'bg-primary'}`}></div> 
                  {selectedPanel.appointmentStatus}
                </span>
              </div>
              <button 
                className="w-8 h-8 rounded-full bg-[#f0f3ff] hover:bg-[#dce2f3] text-[#53606c] flex items-center justify-center transition-colors"
                onClick={closePanel}
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>
            
            {/* Body */}
            <div className="flex-1 overflow-y-auto px-8 pb-8">
              <div className="flex flex-col items-center text-center mb-8">
                <div className="w-24 h-24 rounded-full border-4 border-white shadow-md mb-4 bg-primary/10 flex items-center justify-center text-primary text-3xl font-bold">
                  {selectedPanel.patientName.charAt(0)}
                </div>
                <h2 className="text-2xl font-bold text-[#151c27] tracking-tight mb-1">{selectedPanel.patientName}</h2>
                <div className="flex items-center gap-3 text-sm text-[#53606c]">
                  <span className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-[14px]">phone</span> {selectedPanel.patientPhone || 'N/A'}
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-[14px]">mail</span> {selectedPanel.patientEmail || 'N/A'}
                  </span>
                </div>
              </div>

              <div className="bg-[#f9f9ff] rounded-2xl p-6 border border-[#c3c5d7]/50 space-y-6">
                <div>
                  <p className="text-[11px] font-bold text-[#53606c] uppercase tracking-widest mb-1.5">Service Booked</p>
                  <p className="font-semibold text-[#151c27] text-lg">{selectedPanel.serviceName}</p>
                </div>
                
                <div className="h-px bg-[#c3c5d7]/50 w-full"></div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-[11px] font-bold text-[#53606c] uppercase tracking-widest mb-1.5">Date</p>
                    <p className="font-semibold text-[#151c27] flex items-center gap-2">
                      <span className="material-symbols-outlined text-[18px] text-primary">calendar_today</span>
                      {new Date(selectedPanel.appointmentDate).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                    </p>
                  </div>
                  <div>
                    <p className="text-[11px] font-bold text-[#53606c] uppercase tracking-widest mb-1.5">Time</p>
                    <p className="font-semibold text-[#151c27] flex items-center gap-2">
                      <span className="material-symbols-outlined text-[18px] text-primary">schedule</span>
                      {selectedPanel.appointmentTime?.substring(0,5)}
                    </p>
                  </div>
                </div>

                {/* Virtual Consultation Controls */}
                {checkServiceAllowsVideo(selectedPanel) ? (
                  <div className="bg-blue-50/70 rounded-xl p-4 border border-blue-200/80 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-[20px] text-blue-600">videocam</span>
                        <div>
                          <p className="text-xs font-bold text-slate-800">Virtual Consultation</p>
                          <p className="text-[11px] text-slate-600">
                            {selectedPanel.videoCallEnabled || selectedPanel.appointmentType === 'VIRTUAL' ? 'Video room is active' : 'Video call is turned off'}
                          </p>
                        </div>
                      </div>
                      {hasCalendarWrite && selectedPanel.appointmentStatus !== 'COMPLETED' && selectedPanel.appointmentStatus !== 'CANCELLED' && (
                        <button
                          onClick={() => handleToggleVideo(selectedPanel.id, !!(selectedPanel.videoCallEnabled || selectedPanel.appointmentType === 'VIRTUAL'))}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 border ${
                            selectedPanel.videoCallEnabled || selectedPanel.appointmentType === 'VIRTUAL'
                              ? 'bg-white text-red-600 border-red-200 hover:bg-red-50'
                              : 'bg-blue-600 text-white border-blue-600 hover:bg-blue-700 shadow-sm'
                          }`}
                        >
                          <span className="material-symbols-outlined text-[14px]">
                            {selectedPanel.videoCallEnabled || selectedPanel.appointmentType === 'VIRTUAL' ? 'videocam_off' : 'videocam'}
                          </span>
                          {selectedPanel.videoCallEnabled || selectedPanel.appointmentType === 'VIRTUAL' ? 'Turn Off' : 'Turn On'}
                        </button>
                      )}
                    </div>

                    {(selectedPanel.videoCallEnabled || selectedPanel.appointmentType === 'VIRTUAL') && selectedPanel.appointmentStatus !== 'CANCELLED' && (
                      <div className="pt-2 border-t border-blue-200/60 flex flex-col gap-2">
                        <button
                          onClick={() => {
                            setActiveVideoAppt(selectedPanel);
                          }}
                          className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm transition-all"
                        >
                          <span className="material-symbols-outlined text-[16px] animate-pulse">video_camera_front</span>
                          Launch Video Room
                        </button>
                        {selectedPanel.meetingLink && (
                          <div className="flex items-center justify-between text-[11px] bg-white p-2 rounded-lg border border-blue-100 text-blue-900">
                            <span className="truncate mr-1 font-mono">{selectedPanel.meetingLink}</span>
                            <button
                              onClick={() => {
                                navigator.clipboard.writeText(selectedPanel.meetingLink);
                                alert('Meeting link copied!');
                              }}
                              className="text-blue-600 font-bold hover:underline shrink-0"
                            >
                              Copy
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-200 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-[18px] text-slate-500">person</span>
                      <div>
                        <p className="text-xs font-bold text-slate-700">In-Person {terms.appointmentSingular}</p>
                        <p className="text-[11px] text-slate-500">Online video call is turned off for this {terms.serviceSingular.toLowerCase()}</p>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 bg-slate-200 text-slate-700 rounded-full">
                      In-Person
                    </span>
                  </div>
                )}

                <div>
                  <p className="text-[11px] font-bold text-[#53606c] uppercase tracking-widest mb-1.5">{terms.customerSingular} Notes / Reason</p>
                  <div className="bg-white p-4 rounded-xl border border-[#c3c5d7]/50 text-sm text-[#53606c] shadow-sm italic min-h-[60px]">
                    {selectedPanel.reasonForVisit ? `"${selectedPanel.reasonForVisit}"` : 'No notes provided.'}
                  </div>
                </div>

                {(selectedPanel.completedByName || selectedPanel.cancelledByName) && (
                  <div className="p-4 rounded-xl border bg-slate-50 border-slate-200">
                    <p className="text-[11px] font-bold text-[#53606c] uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-[16px] text-primary">badge</span> Staff Attribution &amp; Audit
                    </p>
                    {selectedPanel.completedByName && (
                      <p className="text-xs text-slate-700">
                        <span className="font-semibold text-emerald-700">Completed By:</span> {selectedPanel.completedByName} 
                        <span className="ml-1 text-[11px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold">
                          {selectedPanel.completedByRole || 'Staff'}
                        </span>
                      </p>
                    )}
                    {selectedPanel.cancelledByName && (
                      <p className="text-xs text-slate-700 mt-1">
                        <span className="font-semibold text-red-700">Cancelled By:</span> {selectedPanel.cancelledByName} 
                        <span className="ml-1 text-[11px] px-2 py-0.5 rounded-full bg-red-100 text-red-800 font-bold">
                          {selectedPanel.cancelledByRole || 'Staff'}
                        </span>
                      </p>
                    )}
                  </div>
                )}

                {selectedPanel.appointmentStatus === 'COMPLETED' && selectedPanel.patientRating && (
                  <div>
                    <p className="text-[11px] font-bold text-[#53606c] uppercase tracking-widest mb-1.5">{terms.customerSingular} Feedback</p>
                    <div className="bg-[#fffbeb] p-4 rounded-xl border border-[#fef3c7] shadow-sm">
                      <div className="flex items-center gap-1 mb-2 text-[#fbbf24]">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <span key={star} className="material-symbols-outlined" style={{ fontVariationSettings: star <= selectedPanel.patientRating ? "'FILL' 1" : "'FILL' 0" }}>
                            star
                          </span>
                        ))}
                      </div>
                      {selectedPanel.patientReview ? (
                        <p className="text-sm text-[#78350f] italic">"{selectedPanel.patientReview}"</p>
                      ) : (
                        <p className="text-sm text-[#78350f] italic opacity-70">No written review provided.</p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Footer Actions */}
            <div className="p-6 border-t border-[#e2e8f0] bg-[#f8fafc] flex flex-col gap-3 shrink-0 rounded-b-2xl">
              {hasCalendarWrite ? (
                <>
                  {selectedPanel.appointmentStatus === 'CHECKED_IN' && (
                    <button 
                      className="w-full bg-[#006f4b] hover:bg-[#005438] text-white py-3.5 rounded-xl font-bold transition shadow-sm flex items-center justify-center gap-2"
                      onClick={() => openCompleteModal(selectedPanel.id)}
                    >
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                      </svg>
                      Mark Complete
                    </button>
                  )}
                  {selectedPanel.appointmentStatus !== 'CANCELLED' && selectedPanel.appointmentStatus !== 'COMPLETED' && (
                    <button 
                      className="w-full py-3 rounded-xl text-sm font-bold text-[#ef4444] hover:bg-[#fee2e2] transition flex items-center justify-center gap-2" 
                      onClick={() => openCancelModal(selectedPanel.id)}
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      Cancel {terms.appointmentSingular}
                    </button>
                  )}
                </>
              ) : (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px]">lock</span>
                  <span>Read-only access: Modifications are restricted for your role.</span>
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {/* COMPLETE APPOINTMENT MODAL */}
      {isCompleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0f172a]/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col">
            <div className="px-6 py-4 bg-[#f8fafc] border-b border-[#e2e8f0] flex justify-between items-center">
              <h2 className="text-xl font-bold text-[#0f172a]">{completeConfig.title}</h2>
              <button onClick={() => setIsCompleteModalOpen(false)} className="text-[#64748b] hover:text-[#0f172a] transition p-1">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <form onSubmit={submitMarkComplete} className="p-6 flex flex-col gap-5 overflow-y-auto">
              <div>
                <label className="block text-sm font-semibold text-[#334155] mb-2">{completeConfig.summaryLabel} <span className="text-[#ef4444]">*</span></label>
                <textarea 
                  required
                  rows={3}
                  className="w-full px-4 py-2 bg-[#f8fafc] border border-[#cbd5e1] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3b82f6]/50 focus:border-[#3b82f6] text-[#0f172a]"
                  placeholder={completeConfig.summaryPlaceholder}
                  value={completeForm.treatmentSummary}
                  onChange={(e) => setCompleteForm({...completeForm, treatmentSummary: e.target.value})}
                ></textarea>
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-[#334155] mb-2">Internal Notes (Optional)</label>
                <textarea 
                  rows={2}
                  className="w-full px-4 py-2 bg-[#f8fafc] border border-[#cbd5e1] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3b82f6]/50 focus:border-[#3b82f6] text-[#0f172a]"
                  placeholder={completeConfig.internalPlaceholder}
                  value={completeForm.internalNotes}
                  onChange={(e) => setCompleteForm({...completeForm, internalNotes: e.target.value})}
                ></textarea>
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#334155] mb-2">{completeConfig.followUpLabel}</label>
                <select 
                  className="w-full px-4 py-3 bg-[#f8fafc] border border-[#cbd5e1] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3b82f6]/50 focus:border-[#3b82f6] text-[#0f172a]"
                  value={completeForm.followUpMonths}
                  onChange={(e) => setCompleteForm({...completeForm, followUpMonths: e.target.value})}
                >
                  <option value="0">{completeConfig.noFollowUpText}</option>
                  <option value="1">In 1 Month</option>
                  <option value="3">In 3 Months</option>
                  <option value="6">In 6 Months</option>
                </select>
                <p className="text-xs text-[#64748b] mt-2">
                  Selecting a follow-up will automatically schedule a CRM reminder to be sent to the {terms.customerSingular.toLowerCase()}.
                </p>
              </div>

              <div className="flex gap-3 pt-4 border-t border-[#e2e8f0]">
                <button 
                  type="button" 
                  onClick={() => setIsCompleteModalOpen(false)}
                  className="flex-1 py-3 bg-[#f1f5f9] text-[#475569] font-bold rounded-xl hover:bg-[#e2e8f0] transition"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="flex-1 py-3 bg-[#006f4b] text-white font-bold rounded-xl hover:bg-[#005438] shadow-sm transition"
                >
                  Confirm Completion
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CANCEL APPOINTMENT MODAL */}
      {isCancelModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0f172a]/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden flex flex-col p-6 items-center text-center">
            <div className="w-16 h-16 bg-[#fee2e2] rounded-full flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-[#ef4444]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-[#0f172a] mb-2">Cancel {terms.appointmentSingular}?</h2>
            <p className="text-sm text-[#64748b] mb-6">
              Are you sure you want to cancel this {terms.appointmentSingular.toLowerCase()}? This action cannot be undone and the {terms.customerSingular.toLowerCase()} will be notified.
            </p>
            <div className="flex gap-3 w-full">
              <button 
                type="button" 
                onClick={() => setIsCancelModalOpen(false)}
                className="flex-1 py-3 bg-[#f1f5f9] text-[#475569] font-bold rounded-xl hover:bg-[#e2e8f0] transition"
              >
                No, Keep it
              </button>
              <button 
                type="button" 
                onClick={confirmCancelAppointment}
                className="flex-1 py-3 bg-[#ef4444] text-white font-bold rounded-xl hover:bg-[#dc2626] shadow-sm transition"
              >
                Yes, Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* VIDEO CONSULTATION MODAL */}
      <VideoConsultationModal
        isOpen={!!activeVideoAppt}
        onClose={() => setActiveVideoAppt(null)}
        appointment={activeVideoAppt}
        isProvider={true}
        onAppointmentCompleted={(completedAppt) => {
          setAppointments(prev => prev.map(a => a.id === completedAppt.id ? {
            ...a,
            appointmentStatus: 'COMPLETED',
            status: 'COMPLETED',
            treatmentSummary: completedAppt.treatmentSummary
          } : a));
          fetchData();
        }}
      />

      <style>{`
        @keyframes slideInRight {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
      `}</style>
    </div>
  );
};

export default MasterCalendarPage;
