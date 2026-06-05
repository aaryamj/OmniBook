import React, { useState, useRef, useEffect } from 'react';

const NotificationBell: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <div 
        className="relative cursor-pointer p-2 hover:bg-[#e7eefe] rounded-full transition-colors"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="material-symbols-outlined text-[#53606c]">notifications</span>
        <span className="absolute top-2 right-2 w-2 h-2 bg-[#ba1a1a] rounded-full border-2 border-[#f9f9ff]"></span>
      </div>

      {/* Dropdown Panel */}
      <div className={`absolute right-0 mt-2 w-80 sm:w-96 bg-[#FFFFFF] rounded-xl shadow-xl border border-[#F3F4F6] overflow-hidden z-[60] transition-all duration-200 origin-top-right ${isOpen ? 'opacity-100 scale-100 visible' : 'opacity-0 scale-95 invisible'}`}>
        
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-4 border-b border-[#F3F4F6]">
          <span className="font-bold text-[#151c27] text-base">Notifications</span>
          <button className="text-[#1A56DB] text-sm font-medium hover:underline transition-all">Mark all as read</button>
        </div>

        {/* Notification List */}
        <div className="flex flex-col max-h-[400px] overflow-y-auto">
          {/* Item 1 */}
          <div className="flex items-start gap-4 p-4 bg-[#E1EFFE] hover:bg-[#d6e8fc] transition-colors cursor-pointer relative group">
            <div className="absolute left-2 top-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-[#1A56DB] rounded-full"></div>
            <div className="text-[#1A56DB] flex-shrink-0 ml-2">
              <span className="material-symbols-outlined text-2xl" style={{ fontVariationSettings: "'FILL' 0" }}>calendar_today</span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <p className="text-[#151c27] font-semibold text-sm truncate">Upcoming Appointment</p>
                <span className="text-[#53606c] text-[11px] whitespace-nowrap">2m ago</span>
              </div>
              <p className="text-[#53606c] text-sm mt-0.5 truncate">Dr. Sarah Smith • Tomorrow at 10:30 AM</p>
            </div>
          </div>

          {/* Item 2 */}
          <div className="flex items-start gap-4 p-4 bg-[#FFFFFF] hover:bg-[#f9fafb] border-t border-[#F3F4F6] transition-colors cursor-pointer group">
            <div className="text-[#10B981] flex-shrink-0 ml-3.5">
              <span className="material-symbols-outlined text-2xl" style={{ fontVariationSettings: "'FILL' 0" }}>check_circle</span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <p className="text-[#151c27] font-semibold text-sm truncate">Booking Confirmed</p>
                <span className="text-[#53606c] text-[11px] whitespace-nowrap">2h ago</span>
              </div>
              <p className="text-[#53606c] text-sm mt-0.5 truncate">Hair Styling at Elite Salon</p>
            </div>
          </div>

          {/* Item 3 */}
          <div className="flex items-start gap-4 p-4 bg-[#FFFFFF] hover:bg-[#f9fafb] border-t border-[#F3F4F6] transition-colors cursor-pointer group">
            <div className="text-[#9ca3af] flex-shrink-0 ml-3.5">
              <span className="material-symbols-outlined text-2xl" style={{ fontVariationSettings: "'FILL' 0" }}>info</span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <p className="text-[#151c27] font-semibold text-sm truncate">Cancellation Policy Update</p>
                <span className="text-[#53606c] text-[11px] whitespace-nowrap">1d ago</span>
              </div>
              <p className="text-[#53606c] text-sm mt-0.5">Please review our new 4-hour cancellation rules.</p>
            </div>
          </div>

          {/* Item 4 */}
          <div className="flex items-start gap-4 p-4 bg-[#FFFFFF] hover:bg-[#f9fafb] border-t border-[#F3F4F6] transition-colors cursor-pointer group">
            <div className="text-[#1A56DB] flex-shrink-0 ml-3.5">
              <span className="material-symbols-outlined text-2xl" style={{ fontVariationSettings: "'FILL' 0" }}>payments</span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <p className="text-[#151c27] font-semibold text-sm truncate">Payment Processed</p>
                <span className="text-[#53606c] text-[11px] whitespace-nowrap">2d ago</span>
              </div>
              <p className="text-[#53606c] text-sm mt-0.5 truncate">Invoice #8842 for $120.00 was paid.</p>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="p-3 border-t border-[#F3F4F6] bg-[#FFFFFF] flex justify-center">
          <button className="flex items-center justify-center gap-1 text-[#1A56DB] font-bold text-sm hover:underline transition-all">
            View All Activity
            <span className="material-symbols-outlined text-lg">arrow_forward</span>
          </button>
        </div>

      </div>
    </div>
  );
};

export default NotificationBell;
