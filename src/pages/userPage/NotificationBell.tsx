import React, { useState, useRef, useEffect } from 'react';

const NotificationBell: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [notifications, setNotifications] = useState<any[]>([]);

  const fetchNotifications = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;
    try {
      const response = await fetch('http://localhost:8080/api/v1/notifications', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setNotifications(data.notifications || []);
      }
    } catch (e) {
      console.error('Error fetching notifications', e);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const intervalId = setInterval(fetchNotifications, 30000); // 30 seconds
    return () => clearInterval(intervalId);
  }, []);

  const markAllAsRead = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;
    try {
      const response = await fetch('http://localhost:8080/api/v1/notifications/read-all', {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
        fetchNotifications();
      }
    } catch (e) {
      console.error('Error marking notifications as read', e);
    }
  };

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

  const unreadCount = notifications.filter(n => !n.read).length;

  const getIcon = (type: string) => {
    if (type === 'BOOKING_REQUEST') return 'calendar_today';
    if (type === 'APPROVED') return 'check_circle';
    return 'notifications';
  };

  const getIconColor = (type: string) => {
    if (type === 'BOOKING_REQUEST') return 'text-[#1A56DB]';
    if (type === 'APPROVED') return 'text-[#10B981]';
    return 'text-[#9ca3af]';
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <div 
        className="relative cursor-pointer p-2 hover:bg-[#e7eefe] rounded-full transition-colors"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="material-symbols-outlined text-[#53606c]">notifications</span>
        {unreadCount > 0 && (
          <span className="absolute top-2 right-2 w-2 h-2 bg-[#ba1a1a] rounded-full border-2 border-[#f9f9ff]"></span>
        )}
      </div>

      {/* Dropdown Panel */}
      <div className={`absolute right-0 mt-2 w-80 sm:w-96 bg-[#FFFFFF] rounded-xl shadow-xl border border-[#F3F4F6] overflow-hidden z-[60] transition-all duration-200 origin-top-right ${isOpen ? 'opacity-100 scale-100 visible' : 'opacity-0 scale-95 invisible'}`}>
        
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-4 border-b border-[#F3F4F6]">
          <span className="font-bold text-[#151c27] text-base">Notifications</span>
          {unreadCount > 0 && (
            <button onClick={markAllAsRead} className="text-[#1A56DB] text-sm font-medium hover:underline transition-all">Mark all as read</button>
          )}
        </div>

        {/* Notification List */}
        <div className="flex flex-col max-h-[400px] overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="p-6 text-center text-[#53606c]">
              <p className="text-[14px]">You have no new notifications.</p>
            </div>
          ) : (
            notifications.map(notification => (
              <div key={notification.id} className={`flex items-start gap-4 p-4 ${notification.read ? 'bg-[#FFFFFF] hover:bg-[#f9fafb]' : 'bg-[#E1EFFE] hover:bg-[#d6e8fc]'} border-b border-[#F3F4F6] transition-colors cursor-pointer group relative`}>
                {!notification.read && <div className="absolute left-2 top-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-[#1A56DB] rounded-full"></div>}
                <div className={`${getIconColor(notification.type)} flex-shrink-0 ml-2`}>
                  <span className="material-symbols-outlined text-2xl" style={{ fontVariationSettings: "'FILL' 0" }}>{getIcon(notification.type)}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-[#151c27] font-semibold text-sm truncate">{notification.title}</p>
                    <span className="text-[#53606c] text-[11px] whitespace-nowrap">
                      {new Date(notification.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-[#53606c] text-sm mt-0.5">{notification.message}</p>
                </div>
              </div>
            ))
          )}
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
