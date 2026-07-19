import React, { useEffect, useState } from 'react';
import { useNavigate, NavLink } from 'react-router-dom';
import NotificationBell from '../userPage/NotificationBell';

// --- SUB-COMPONENTS FOR DIFFERENT CALENDAR VIEWS ---

const DayViewGrid: React.FC<{ openPanel: any }> = ({ openPanel }) => {
  return (
    <div className="flex-1 bg-white rounded-2xl border border-[#c3c5d7]/50 shadow-sm overflow-y-auto overflow-x-auto relative custom-scrollbar">
      {/* Day Header (Sticky) */}
      <div className="sticky top-0 bg-white z-20 border-b border-[#c3c5d7]/30 flex">
        <div className="w-20 shrink-0 bg-white border-r border-[#c3c5d7]/30"></div>
        <div className="flex-1 py-4 text-center flex flex-col items-center justify-center bg-[#1a56db]/5 relative">
          <div className="absolute top-0 left-0 right-0 h-1 bg-[#1a56db]"></div>
          <span className="text-[11px] font-bold text-[#1a56db] uppercase tracking-widest mb-1">TUE</span>
          <span className="text-2xl font-light text-[#1a56db]">09</span>
        </div>
      </div>
      
      {/* Main Grid Body */}
      <div className="flex relative min-h-[1000px]">
        {/* Time Labels Y-Axis */}
        <div className="w-20 shrink-0 relative border-r border-[#c3c5d7]/30 bg-white z-0">
          {[8,9,10,11,12,1,2,3,4,5].map((hour, i) => (
            <div key={i} className="absolute w-full text-center text-xs font-semibold text-[#53606c]" style={{ top: `${i * 100}px`, transform: 'translateY(-50%)' }}>
              {hour}:00 {i < 4 ? 'AM' : 'PM'}
            </div>
          ))}
        </div>

        {/* Grid Area */}
        <div className="flex-1 relative bg-[#1a56db]/5">
          {/* Horizontal Grid Lines */}
          {[...Array(10)].map((_, i) => (
            <div key={i} className="absolute inset-x-0 border-t border-[#c3c5d7]/30" style={{ top: `${i * 100}px` }}></div>
          ))}

          {/* LIVE RED TIMELINE */}
          <div className="absolute left-0 right-0 z-10 flex items-center pointer-events-none" style={{ top: '170px', transform: 'translateY(-50%)' }}>
            <div className="absolute -left-[76px] bg-[#ba1a1a] text-white text-[10px] font-bold py-1 px-2 rounded">
              9:42 AM
            </div>
            <div className="w-3 h-3 bg-[#ba1a1a] rounded-full -ml-1.5 shadow-[0_0_0_4px_rgba(186,26,26,0.2)]"></div>
            <div className="flex-1 border-t-2 border-[#ba1a1a]"></div>
          </div>

          {/* OVERLAPPING EVENTS AT 10:00 AM (Side-by-side) */}
          <div 
            className="absolute rounded-xl bg-[#1a56db] text-white shadow-md pointer-events-auto flex flex-col p-3 overflow-hidden border border-[#003fb1] hover:scale-[1.02] hover:-translate-y-1 transition-all cursor-pointer z-30" 
            style={{ top: '200px', height: '96px', left: '1%', right: '50.5%' }}
            onClick={() => openPanel('Alexander Mitchell', 'General Checkup', '10:00 AM - 11:00 AM', 'Confirmed', 'https://lh3.googleusercontent.com/aida-public/AB6AXuALan3Fe5liRYVvqOzbYPXALuhl1M_JrzKY62jsudutF-Y4kRwnw4no-RMdfy3kIqv1Pwvt4YNwLk09F8-YiOqLdcmDLbD8z8PfxNXA5LulAwItUiFnPDiM2CIPYIlitAQwvN0vTuDjaDgHGdcvqmtnQVICN825lJ_J6Gay2MKwe9QZ5j0m2TW3QgH9DIcW4nkj_-PRO8Ny3cmQDxAWN3MCHm9Grv2-ok3arYQPU0wypdDtdLrnEcUA0n9wYoUk0Nv28IHRfPR7qzs')}
          >
             <div className="flex justify-between items-start mb-1">
                <span className="text-[10px] font-bold text-white/80">10:00 AM - 11:00 AM</span>
                <div className="w-4 h-4 bg-white rounded-full flex items-center justify-center">
                  <span className="material-symbols-outlined text-[#1a56db] text-[10px] font-bold">check</span>
                </div>
              </div>
              <div className="text-sm font-bold truncate">Alexander Mitchell</div>
              <div className="text-xs text-white/80 mt-0.5 truncate">Dr. Sharma</div>
          </div>

          <div 
            className="absolute rounded-xl bg-[#006f4b] text-white shadow-md pointer-events-auto flex flex-col p-3 overflow-hidden border border-[#005438] hover:scale-[1.02] hover:-translate-y-1 transition-all cursor-pointer z-30" 
            style={{ top: '200px', height: '96px', left: '50.5%', right: '1%' }}
            onClick={() => openPanel('David Park', 'Consultation', '10:00 AM - 11:00 AM', 'Confirmed', 'https://lh3.googleusercontent.com/aida-public/AB6AXuALan3Fe5liRYVvqOzbYPXALuhl1M_JrzKY62jsudutF-Y4kRwnw4no-RMdfy3kIqv1Pwvt4YNwLk09F8-YiOqLdcmDLbD8z8PfxNXA5LulAwItUiFnPDiM2CIPYIlitAQwvN0vTuDjaDgHGdcvqmtnQVICN825lJ_J6Gay2MKwe9QZ5j0m2TW3QgH9DIcW4nkj_-PRO8Ny3cmQDxAWN3MCHm9Grv2-ok3arYQPU0wypdDtdLrnEcUA0n9wYoUk0Nv28IHRfPR7qzs')}
          >
             <div className="flex justify-between items-start mb-1">
                <span className="text-[10px] font-bold text-white/80">10:00 AM - 11:00 AM</span>
                <div className="w-4 h-4 bg-white rounded-full flex items-center justify-center">
                  <span className="material-symbols-outlined text-[#006f4b] text-[10px] font-bold">check</span>
                </div>
              </div>
              <div className="text-sm font-bold truncate">David Park</div>
              <div className="text-xs text-white/80 mt-0.5 truncate">Dr. Lee</div>
          </div>

          {/* EVENT: 12:00 PM to 1:00 PM (LUNCH) */}
          <div 
            className="absolute left-0 right-0 bg-[#f9f9ff] border-y border-[#c3c5d7]/30 flex items-center justify-center pointer-events-auto" 
            style={{ top: '400px', height: '100px', zIndex: 5 }}
          >
            <span className="text-xs font-bold text-[#53606c] tracking-widest flex items-center gap-2">
              <span className="material-symbols-outlined text-[16px]">restaurant</span>
              LUNCH BREAK (12:00 PM - 1:00 PM)
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

const WeekViewGrid: React.FC<{ openPanel: any }> = ({ openPanel }) => {
  return (
    <div className="flex-1 bg-white rounded-2xl border border-[#c3c5d7]/50 shadow-sm overflow-y-auto overflow-x-auto relative custom-scrollbar min-w-[300px]">
      {/* Days Header (Sticky) */}
      <div className="sticky top-0 bg-white z-20 border-b border-[#c3c5d7]/30 flex">
        <div className="w-20 shrink-0 bg-white border-r border-[#c3c5d7]/30"></div>
        <div className="flex-1 grid grid-cols-7">
          <div className="py-4 text-center border-l border-[#c3c5d7]/30 flex flex-col items-center justify-center">
            <span className="text-[11px] font-bold text-[#53606c] uppercase tracking-widest mb-1">MON</span>
            <span className="text-2xl font-light text-[#151c27]">08</span>
          </div>
          <div className="py-4 text-center border-l border-[#c3c5d7]/30 flex flex-col items-center justify-center bg-[#1a56db]/5 relative">
            <div className="absolute top-0 left-0 right-0 h-1 bg-[#1a56db]"></div>
            <span className="text-[11px] font-bold text-[#1a56db] uppercase tracking-widest mb-1">TUE</span>
            <span className="text-2xl font-light text-[#1a56db]">09</span>
          </div>
          <div className="py-4 text-center border-l border-[#c3c5d7]/30 flex flex-col items-center justify-center">
            <span className="text-[11px] font-bold text-[#53606c] uppercase tracking-widest mb-1">WED</span>
            <span className="text-2xl font-light text-[#151c27]">10</span>
          </div>
          <div className="py-4 text-center border-l border-[#c3c5d7]/30 flex flex-col items-center justify-center">
            <span className="text-[11px] font-bold text-[#53606c] uppercase tracking-widest mb-1">THU</span>
            <span className="text-2xl font-light text-[#151c27]">11</span>
          </div>
          <div className="py-4 text-center border-l border-[#c3c5d7]/30 flex flex-col items-center justify-center">
            <span className="text-[11px] font-bold text-[#53606c] uppercase tracking-widest mb-1">FRI</span>
            <span className="text-2xl font-light text-[#151c27]">12</span>
          </div>
          <div className="py-4 text-center border-l border-[#c3c5d7]/30 flex flex-col items-center justify-center opacity-60">
            <span className="text-[11px] font-bold text-[#53606c] uppercase tracking-widest mb-1">SAT</span>
            <span className="text-2xl font-light text-[#151c27]">13</span>
          </div>
          <div className="py-4 text-center border-l border-[#c3c5d7]/30 flex flex-col items-center justify-center opacity-60">
            <span className="text-[11px] font-bold text-[#53606c] uppercase tracking-widest mb-1">SUN</span>
            <span className="text-2xl font-light text-[#151c27]">14</span>
          </div>
        </div>
      </div>

      {/* Main Grid Body */}
      <div className="flex relative min-h-[1000px]">
        {/* Time Labels Y-Axis */}
        <div className="w-20 shrink-0 relative border-r border-[#c3c5d7]/30 bg-white z-0">
          {[8,9,10,11,12,1,2,3,4,5].map((hour, i) => (
            <div key={i} className="absolute w-full text-center text-xs font-semibold text-[#53606c]" style={{ top: `${i * 100}px`, transform: 'translateY(-50%)' }}>
              {hour}:00 {i < 4 ? 'AM' : 'PM'}
            </div>
          ))}
        </div>

        {/* Grid Area */}
        <div className="flex-1 relative bg-white">
          {/* Horizontal Grid Lines */}
          {[...Array(10)].map((_, i) => (
            <div key={i} className="absolute inset-x-0 border-t border-[#c3c5d7]/30" style={{ top: `${i * 100}px` }}></div>
          ))}

          {/* LIVE RED TIMELINE */}
          <div className="absolute left-0 right-0 z-10 flex items-center pointer-events-none" style={{ top: '170px', transform: 'translateY(-50%)' }}>
            <div className="absolute -left-[76px] bg-[#ba1a1a] text-white text-[10px] font-bold py-1 px-2 rounded">
              9:42 AM
            </div>
            <div className="w-3 h-3 bg-[#ba1a1a] rounded-full -ml-1.5 shadow-[0_0_0_4px_rgba(186,26,26,0.2)]"></div>
            <div className="flex-1 border-t-2 border-[#ba1a1a]"></div>
          </div>

          {/* Vertical Day Columns & Events */}
          <div className="absolute inset-0 grid grid-cols-7 pointer-events-none">
            <div className="border-l border-[#c3c5d7]/30"></div>
            
            {/* TUESDAY COLUMN */}
            <div className="border-l border-[#c3c5d7]/30 bg-[#1a56db]/5 relative">
              {/* EVENT: 10:00 AM to 11:00 AM */}
              <div 
                className="absolute left-2 right-2 rounded-xl bg-[#1a56db] text-white shadow-md pointer-events-auto flex flex-col p-3 overflow-hidden border border-[#003fb1] hover:scale-[1.02] hover:-translate-y-1 transition-all cursor-pointer z-30" 
                style={{ top: '200px', height: '96px' }}
                onClick={() => openPanel('Alexander Mitchell', 'General Checkup', '10:00 AM - 11:00 AM', 'Confirmed', 'https://lh3.googleusercontent.com/aida-public/AB6AXuALan3Fe5liRYVvqOzbYPXALuhl1M_JrzKY62jsudutF-Y4kRwnw4no-RMdfy3kIqv1Pwvt4YNwLk09F8-YiOqLdcmDLbD8z8PfxNXA5LulAwItUiFnPDiM2CIPYIlitAQwvN0vTuDjaDgHGdcvqmtnQVICN825lJ_J6Gay2MKwe9QZ5j0m2TW3QgH9DIcW4nkj_-PRO8Ny3cmQDxAWN3MCHm9Grv2-ok3arYQPU0wypdDtdLrnEcUA0n9wYoUk0Nv28IHRfPR7qzs')}
              >
                <div className="flex justify-between items-start mb-1">
                  <span className="text-[10px] font-bold text-white/80">10:00 AM - 11:00 AM</span>
                  <div className="w-4 h-4 bg-white rounded-full flex items-center justify-center">
                    <span className="material-symbols-outlined text-[#1a56db] text-[10px] font-bold">check</span>
                  </div>
                </div>
                <div className="text-sm font-bold truncate">Alexander Mitchell</div>
                <div className="text-xs text-white/80 mt-0.5 truncate">General Checkup</div>
              </div>

              {/* EVENT: 1:00 PM to 2:00 PM */}
              <div 
                className="absolute left-2 right-2 rounded-xl bg-white border-2 border-dashed border-[#1a56db]/50 pointer-events-auto flex flex-col p-3 overflow-hidden hover:scale-[1.02] hover:-translate-y-1 transition-all cursor-pointer z-30" 
                style={{ top: '500px', height: '96px' }}
                onClick={() => openPanel('Sarah Jenkins', 'Follow-up Consultation', '1:00 PM - 2:00 PM', 'Pending', 'https://lh3.googleusercontent.com/aida-public/AB6AXuALan3Fe5liRYVvqOzbYPXALuhl1M_JrzKY62jsudutF-Y4kRwnw4no-RMdfy3kIqv1Pwvt4YNwLk09F8-YiOqLdcmDLbD8z8PfxNXA5LulAwItUiFnPDiM2CIPYIlitAQwvN0vTuDjaDgHGdcvqmtnQVICN825lJ_J6Gay2MKwe9QZ5j0m2TW3QgH9DIcW4nkj_-PRO8Ny3cmQDxAWN3MCHm9Grv2-ok3arYQPU0wypdDtdLrnEcUA0n9wYoUk0Nv28IHRfPR7qzs')}
              >
                <div className="flex justify-between items-start mb-1">
                  <span className="text-[10px] font-bold text-[#1a56db]">1:00 PM - 2:00 PM</span>
                  <span className="bg-[#fff8e6] text-[#b38600] border border-[#ffeaad] text-[9px] font-bold px-1.5 py-0.5 rounded uppercase">Pending</span>
                </div>
                <div className="text-sm font-bold text-[#151c27] truncate">Sarah Jenkins</div>
                <div className="text-xs text-[#53606c] mt-0.5 truncate">Follow-up Consult</div>
              </div>
            </div>
            
            {/* WEDNESDAY COLUMN */}
            <div className="border-l border-[#c3c5d7]/30 relative">
              {/* EVENT: 12:00 PM to 1:00 PM (LUNCH) */}
              <div 
                className="absolute -left-px -right-px bg-[#f9f9ff] border-y border-[#c3c5d7]/30 flex items-center justify-center pointer-events-auto" 
                style={{ top: '400px', height: '100px', zIndex: 5 }}
              >
                <span className="text-xs font-bold text-[#53606c] tracking-widest flex items-center gap-2">
                  <span className="material-symbols-outlined text-[16px]">restaurant</span>
                  LUNCH BREAK (12:00 PM - 1:00 PM)
                </span>
              </div>
            </div>
            
            <div className="border-l border-[#c3c5d7]/30"></div>
            <div className="border-l border-[#c3c5d7]/30"></div>
            <div className="border-l border-[#c3c5d7]/30"></div>
            <div className="border-l border-[#c3c5d7]/30"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

const MonthViewGrid: React.FC<{ openPanel: any }> = ({ openPanel }) => {
  return (
    <div className="flex-1 bg-white rounded-2xl border border-[#c3c5d7]/50 shadow-sm flex flex-col overflow-y-auto overflow-x-auto custom-scrollbar">
      {/* Days Header */}
      <div className="grid grid-cols-7 border-b border-[#c3c5d7]/30 bg-[#f9f9ff] shrink-0 min-w-[500px]">
        {['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'].map(day => (
          <div key={day} className="py-3 text-center border-l first:border-l-0 border-[#c3c5d7]/30 text-[11px] font-bold text-[#53606c] uppercase tracking-widest">
            {day}
          </div>
        ))}
      </div>
      
      {/* 5 Weeks Grid */}
      <div className="flex-1 grid grid-cols-7 grid-rows-5 bg-white">
        {[...Array(35)].map((_, i) => {
          const date = (i - 2 + 1); // Mocking June 2026 starting on Monday (i=0 is May 31)
          const isCurrentMonth = date > 0 && date <= 30;
          const displayDate = isCurrentMonth ? date : (date <= 0 ? 31 + date : date - 30);
          const isToday = date === 9; // Mock today is Tue Jun 9.
          
          return (
            <div key={i} className={`border-b border-l border-[#c3c5d7]/30 p-1.5 sm:p-2 flex flex-col gap-1 transition-colors hover:bg-[#f9f9ff] cursor-pointer
              ${!isCurrentMonth ? 'bg-[#F3F4F6]/40 opacity-60' : ''}
              ${isToday ? 'bg-[#1a56db]/5' : ''}
              ${(i % 7 === 0) ? 'border-l-0' : ''}
              ${(i >= 28) ? 'border-b-0' : ''}
            `}>
              {/* Date Number */}
              <div className="flex justify-end mb-1">
                <span className={`text-[12px] font-bold w-6 h-6 flex items-center justify-center rounded-full
                  ${isToday ? 'bg-[#1a56db] text-white shadow-md' : 'text-[#53606c]'}
                `}>
                  {displayDate}
                </span>
              </div>
              
              {/* Mock Events */}
              {date === 9 && (
                <div className="flex flex-col gap-1 overflow-hidden">
                  <div className="bg-[#e2e8f8] text-[#003fb1] rounded px-1.5 py-0.5 text-[10px] font-bold truncate flex items-center gap-1.5"
                       onClick={(e) => { e.stopPropagation(); openPanel('Alexander Mitchell', 'General Checkup', '10:00 AM - 11:00 AM', 'Confirmed', 'https://lh3.googleusercontent.com/aida-public/AB6AXuALan3Fe5liRYVvqOzbYPXALuhl1M_JrzKY62jsudutF-Y4kRwnw4no-RMdfy3kIqv1Pwvt4YNwLk09F8-YiOqLdcmDLbD8z8PfxNXA5LulAwItUiFnPDiM2CIPYIlitAQwvN0vTuDjaDgHGdcvqmtnQVICN825lJ_J6Gay2MKwe9QZ5j0m2TW3QgH9DIcW4nkj_-PRO8Ny3cmQDxAWN3MCHm9Grv2-ok3arYQPU0wypdDtdLrnEcUA0n9wYoUk0Nv28IHRfPR7qzs'); }}>
                    <div className="w-1.5 h-1.5 rounded-full bg-[#003fb1] shrink-0"></div>
                    <span className="truncate">10:00a Alexander</span>
                  </div>
                  <div className="bg-[#e2e8f8] text-[#003fb1] rounded px-1.5 py-0.5 text-[10px] font-bold truncate flex items-center gap-1.5"
                       onClick={(e) => { e.stopPropagation(); openPanel('Sarah Jenkins', 'Consultation', '1:00 PM - 2:00 PM', 'Pending', 'https://lh3.googleusercontent.com/aida-public/AB6AXuALan3Fe5liRYVvqOzbYPXALuhl1M_JrzKY62jsudutF-Y4kRwnw4no-RMdfy3kIqv1Pwvt4YNwLk09F8-YiOqLdcmDLbD8z8PfxNXA5LulAwItUiFnPDiM2CIPYIlitAQwvN0vTuDjaDgHGdcvqmtnQVICN825lJ_J6Gay2MKwe9QZ5j0m2TW3QgH9DIcW4nkj_-PRO8Ny3cmQDxAWN3MCHm9Grv2-ok3arYQPU0wypdDtdLrnEcUA0n9wYoUk0Nv28IHRfPR7qzs'); }}>
                    <div className="w-1.5 h-1.5 rounded-full bg-[#003fb1] shrink-0"></div>
                    <span className="truncate">1:00p Sarah</span>
                  </div>
                </div>
              )}
              
              {/* Overflow Scenario */}
              {date === 15 && (
                <div className="flex flex-col gap-1 overflow-hidden">
                  <div className="bg-[#e2e8f8] text-[#003fb1] rounded px-1.5 py-0.5 text-[10px] font-bold truncate flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#003fb1] shrink-0"></div>
                    <span className="truncate">9:00a Mark</span>
                  </div>
                  <div className="bg-[#e2e8f8] text-[#003fb1] rounded px-1.5 py-0.5 text-[10px] font-bold truncate flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#003fb1] shrink-0"></div>
                    <span className="truncate">9:30a Jessica</span>
                  </div>
                  <div className="bg-[#e2e8f8] text-[#003fb1] rounded px-1.5 py-0.5 text-[10px] font-bold truncate flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#003fb1] shrink-0"></div>
                    <span className="truncate">10:15a Tom</span>
                  </div>
                  <div className="text-[10px] font-bold text-[#1a56db] hover:underline px-1 mt-0.5 cursor-pointer">
                    +17 More
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

// --- MAIN PAGE COMPONENT ---

const MasterCalendarPage: React.FC = () => {
  const navigate = useNavigate();
  const [fullName, setFullName] = useState<string>('Provider');
  const [selectedPanel, setSelectedPanel] = useState<any>(null); // For slide panel
  const [calendarView, setCalendarView] = useState<'Day' | 'Week' | 'Month'>('Week');
  const [currentDate, setCurrentDate] = useState<Date>(new Date(2026, 5, 9)); // Mock today as June 9, 2026

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

  const openPanel = (name: string, service: string, time: string, status: string, avatarUrl: string) => {
    setSelectedPanel({ name, service, time, status, avatarUrl });
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
      const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1); // Adjust for Monday start
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

  return (
    <div className="bg-[#F3F4F6] text-[#151c27] font-sans min-h-screen flex">
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
              <span className="text-xs font-bold text-[#53606c] uppercase tracking-[0.2em] hidden sm:block whitespace-nowrap">TODAY: JUNE 9</span>
            </div>
          </div>

          {/* Right Controls */}
          <div className="flex flex-wrap md:flex-nowrap items-center gap-5">
            {/* Segmented Toggle */}
            <div className="flex bg-[#dce2f3] p-1 rounded-xl shrink-0">
              <button 
                onClick={() => setCalendarView('Day')}
                className={`px-5 py-2 text-sm transition rounded-lg ${calendarView === 'Day' ? 'font-bold bg-white text-[#1a56db] shadow' : 'font-semibold text-[#53606c] hover:text-[#151c27]'}`}
              >
                Day
              </button>
              <button 
                onClick={() => setCalendarView('Week')}
                className={`px-5 py-2 text-sm transition rounded-lg ${calendarView === 'Week' ? 'font-bold bg-white text-[#1a56db] shadow' : 'font-semibold text-[#53606c] hover:text-[#151c27]'}`}
              >
                Week
              </button>
              <button 
                onClick={() => setCalendarView('Month')}
                className={`px-5 py-2 text-sm transition rounded-lg ${calendarView === 'Month' ? 'font-bold bg-white text-[#1a56db] shadow' : 'font-semibold text-[#53606c] hover:text-[#151c27]'}`}
              >
                Month
              </button>
            </div>
            {/* Primary Action Button */}
            <button className="bg-[#1a56db] hover:bg-[#123e9e] text-white font-bold py-2.5 px-6 rounded-xl flex items-center gap-2 shadow-md transition-all active:scale-95 whitespace-nowrap shrink-0">
              <span className="material-symbols-outlined text-[20px]">add</span>
              New Booking
            </button>
          </div>
        </div>

        {/* Dynamic Calendar Views rendering block */}
        {calendarView === 'Day' && <DayViewGrid openPanel={openPanel} />}
        {calendarView === 'Week' && <WeekViewGrid openPanel={openPanel} />}
        {calendarView === 'Month' && <MonthViewGrid openPanel={openPanel} />}
        
      </main>

      {/* Slide Panel Overlay & Details */}
      {selectedPanel && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-[#151c27]/20 backdrop-blur-sm z-[60] transition-opacity"
            onClick={closePanel}
          ></div>
          
          {/* Slide-Out Panel */}
          <div className="fixed top-0 right-0 bottom-0 w-[420px] bg-white shadow-2xl z-[70] flex flex-col overflow-hidden animate-[slideInRight_0.3s_ease-out]">
            {/* Header */}
            <div className="px-8 py-6 flex justify-between items-start bg-gradient-to-b from-[#f9f9ff] to-white">
              <div>
                {selectedPanel.status === 'Confirmed' ? (
                  <span className="px-3 py-1.5 rounded-lg text-[11px] font-bold uppercase tracking-widest bg-[#e2e8f8] text-[#003fb1] border border-[#d4dcff] flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#003fb1]"></div> Confirmed
                  </span>
                ) : (
                  <span className="px-3 py-1.5 rounded-lg text-[11px] font-bold uppercase tracking-widest bg-[#fff8e6] text-[#b38600] border border-[#ffeaad] flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#b38600]"></div> Awaiting Approval
                  </span>
                )}
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
                <img src={selectedPanel.avatarUrl} alt="Patient" className="w-24 h-24 rounded-full border-4 border-white shadow-md mb-4 bg-[#f0f3ff] object-cover" />
                <h2 className="text-2xl font-bold text-[#151c27] tracking-tight mb-1">{selectedPanel.name}</h2>
                <div className="flex items-center gap-3 text-sm text-[#53606c]">
                  <span className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-[14px]">phone</span> +1 (555) 012-3456
                  </span>
                  <span>•</span>
                  <span className="text-[#1a56db] font-medium hover:underline cursor-pointer">View Full History</span>
                </div>
              </div>

              <div className="bg-[#f9f9ff] rounded-2xl p-6 border border-[#c3c5d7]/50 space-y-6">
                <div>
                  <p className="text-[11px] font-bold text-[#53606c] uppercase tracking-widest mb-1.5">Service Booked</p>
                  <p className="font-semibold text-[#151c27] text-lg">{selectedPanel.service}</p>
                </div>
                
                <div className="h-px bg-[#c3c5d7]/50 w-full"></div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-[11px] font-bold text-[#53606c] uppercase tracking-widest mb-1.5">Date</p>
                    <p className="font-semibold text-[#151c27] flex items-center gap-2">
                      <span className="material-symbols-outlined text-[18px] text-[#1a56db]">calendar_today</span>
                      Tue, Jun 9
                    </p>
                  </div>
                  <div>
                    <p className="text-[11px] font-bold text-[#53606c] uppercase tracking-widest mb-1.5">Time</p>
                    <p className="font-semibold text-[#151c27] flex items-center gap-2">
                      <span className="material-symbols-outlined text-[18px] text-[#1a56db]">schedule</span>
                      {selectedPanel.time}
                    </p>
                  </div>
                </div>

                <div>
                  <p className="text-[11px] font-bold text-[#53606c] uppercase tracking-widest mb-1.5">Patient Notes</p>
                  <div className="bg-white p-4 rounded-xl border border-[#c3c5d7]/50 text-sm text-[#53606c] shadow-sm italic">
                    "Experiencing mild headaches in the morning. Need a general review of current medications."
                  </div>
                </div>
              </div>
            </div>

            {/* Footer Actions */}
            <div className="p-6 border-t border-[#c3c5d7]/30 bg-white grid grid-cols-2 gap-4 shrink-0">
              <button className="py-3 px-4 border border-[#c3c5d7] rounded-xl text-[#151c27] font-bold hover:bg-[#f9f9ff] transition shadow-sm" onClick={closePanel}>
                Reschedule
              </button>
              <button className="py-3 px-4 bg-[#1a56db] rounded-xl text-white font-bold hover:bg-[#123e9e] transition shadow-sm" onClick={closePanel}>
                Mark Complete
              </button>
              <button className="col-span-2 py-2 mt-2 text-sm font-bold text-[#ba1a1a] hover:text-[#93000a] transition flex items-center justify-center gap-2" onClick={closePanel}>
                Cancel Appointment
              </button>
            </div>
          </div>
        </>
      )}

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

export default MasterCalendarPage;
