import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export interface NotificationItem {
  id: number;
  title: string;
  message: string;
  type: string;
  isRead?: boolean;
  read?: boolean;
  createdAt: string;
  link?: string;
  targetRole?: string;
}

const NotificationBell: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showAllModal, setShowAllModal] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [modalSearch, setModalSearch] = useState('');
  const navigate = useNavigate();

  const isItemRead = (n: NotificationItem) => {
    return n.isRead ?? n.read ?? false;
  };

  const fetchNotifications = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;
    try {
      const response = await fetch('http://localhost:8080/api/v1/notifications', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        const list: NotificationItem[] = Array.isArray(data) ? data : (data.notifications || []);
        setNotifications(list);
      }
    } catch (e) {
      console.error('Error fetching notifications', e);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const intervalId = setInterval(fetchNotifications, 15000); // 15 seconds
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
        setNotifications(prev => prev.map(n => ({ ...n, isRead: true, read: true })));
      }
    } catch (e) {
      console.error('Error marking notifications as read', e);
    }
  };

  const handleNotificationClick = async (n: NotificationItem) => {
    const token = localStorage.getItem('token');
    if (token && !isItemRead(n)) {
      try {
        await fetch(`http://localhost:8080/api/v1/notifications/${n.id}/read`, {
          method: 'PUT',
          headers: { 'Authorization': `Bearer ${token}` }
        });
        setNotifications(prev => prev.map(item => item.id === n.id ? { ...item, isRead: true, read: true } : item));
      } catch (err) {
        console.error('Failed to mark notification read', err);
      }
    }
    setIsOpen(false);
    setShowAllModal(false);
    if (n.link) {
      navigate(n.link);
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

  const unreadCount = notifications.filter(n => !isItemRead(n)).length;

  const getIcon = (type: string) => {
    switch (type) {
      case 'BOOKING_CONFIRMED':
      case 'NEW_APPOINTMENT':
      case 'BOOKING_REQUEST':
        return 'event_available';
      case 'APPROVED':
        return 'check_circle';
      case 'CHECKED_IN':
        return 'how_to_reg';
      case 'COMPLETED':
        return 'task_alt';
      case 'CANCELLED':
        return 'event_busy';
      case 'RESCHEDULED':
        return 'edit_calendar';
      case 'AUTH_LOGIN':
        return 'vpn_key';
      default:
        return 'notifications';
    }
  };

  const getIconColor = (type: string) => {
    switch (type) {
      case 'BOOKING_CONFIRMED':
      case 'NEW_APPOINTMENT':
      case 'BOOKING_REQUEST':
        return 'text-[#1A56DB] bg-blue-50';
      case 'APPROVED':
        return 'text-[#10B981] bg-emerald-50';
      case 'CHECKED_IN':
        return 'text-[#7C3AED] bg-purple-50';
      case 'COMPLETED':
        return 'text-[#0D9488] bg-teal-50';
      case 'CANCELLED':
        return 'text-[#EF4444] bg-red-50';
      case 'RESCHEDULED':
        return 'text-[#F59E0B] bg-amber-50';
      default:
        return 'text-[#6B7280] bg-gray-50';
    }
  };

  const timeAgo = (dateString: string) => {
    if (!dateString) return 'Just now';
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    if (diffInSeconds < 60) return 'Just now';
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d ago`;
  };

  const filteredModalNotifications = notifications.filter(n => {
    if (!modalSearch.trim()) return true;
    const q = modalSearch.toLowerCase();
    return (
      (n.title && n.title.toLowerCase().includes(q)) ||
      (n.message && n.message.toLowerCase().includes(q)) ||
      (n.type && n.type.toLowerCase().includes(q))
    );
  });

  return (
    <>
      <div className="relative" ref={dropdownRef}>
        <button 
          className="relative cursor-pointer p-2 hover:bg-[#e7eefe] rounded-full transition-colors focus:outline-none flex items-center justify-center"
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Notifications"
        >
          <span className="material-symbols-outlined text-[#53606c]">notifications</span>
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 bg-[#ba1a1a] text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white shadow-sm">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>

        {/* Dropdown Panel */}
        <div className={`absolute right-0 mt-2 w-80 sm:w-96 bg-[#FFFFFF] rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-[60] transition-all duration-200 origin-top-right ${isOpen ? 'opacity-100 scale-100 visible' : 'opacity-0 scale-95 invisible'}`}>
          
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3.5 border-b border-gray-100 bg-gray-50/50">
            <div className="flex items-center gap-2">
              <span className="font-bold text-[#151c27] text-base">Notifications</span>
              {unreadCount > 0 && (
                <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-semibold rounded-full">
                  {unreadCount} new
                </span>
              )}
            </div>
            {unreadCount > 0 && (
              <button 
                onClick={markAllAsRead} 
                className="text-[#1A56DB] text-xs font-semibold hover:underline transition-all"
              >
                Mark all read
              </button>
            )}
          </div>

          {/* Notification List */}
          <div className="flex flex-col max-h-[380px] overflow-y-auto divide-y divide-gray-50">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <span className="material-symbols-outlined text-3xl mb-2 text-gray-300">notifications_off</span>
                <p className="text-sm font-medium">You have no notifications yet.</p>
              </div>
            ) : (
              notifications.slice(0, 8).map(notification => {
                const read = isItemRead(notification);
                return (
                  <div 
                    key={notification.id} 
                    onClick={() => handleNotificationClick(notification)}
                    className={`flex items-start gap-3 p-3.5 ${read ? 'bg-[#FFFFFF] hover:bg-gray-50' : 'bg-[#E1EFFE]/40 hover:bg-[#E1EFFE]/70'} transition-colors cursor-pointer group relative`}
                  >
                    {!read && (
                      <span className="absolute left-1.5 top-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-[#1A56DB] rounded-full"></span>
                    )}
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ml-1 ${getIconColor(notification.type)}`}>
                      <span className="material-symbols-outlined text-[20px]">{getIcon(notification.type)}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1 mb-0.5">
                        <p className={`text-sm truncate ${read ? 'text-[#151c27] font-medium' : 'text-[#151c27] font-bold'}`}>
                          {notification.title}
                        </p>
                        <span className="text-gray-400 text-[11px] whitespace-nowrap">
                          {timeAgo(notification.createdAt)}
                        </span>
                      </div>
                      <p className="text-gray-600 text-xs leading-relaxed line-clamp-2">
                        {notification.message}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer */}
          <div className="p-3 border-t border-gray-100 bg-gray-50/50 flex justify-center">
            <button 
              onClick={() => {
                setIsOpen(false);
                setShowAllModal(true);
              }}
              className="flex items-center justify-center gap-1.5 text-[#1A56DB] font-semibold text-xs hover:underline transition-all"
            >
              View All Notifications
              <span className="material-symbols-outlined text-sm">arrow_forward</span>
            </button>
          </div>

        </div>
      </div>

      {/* Full All Notifications Modal */}
      {showAllModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full border border-gray-200 flex flex-col max-h-[85vh] overflow-hidden">
            
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/80">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center">
                  <span className="material-symbols-outlined text-xl">notifications</span>
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-base">All Notifications</h3>
                  <p className="text-xs text-gray-500">Your personalized activity updates and status logs</p>
                </div>
              </div>
              <button 
                onClick={() => setShowAllModal(false)}
                className="p-1 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-200 transition-colors"
              >
                <span className="material-symbols-outlined text-xl">close</span>
              </button>
            </div>

            {/* Filter / Search Bar */}
            <div className="px-6 py-3 border-b border-gray-100 bg-white">
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-[18px]">search</span>
                <input 
                  type="text"
                  placeholder="Filter notifications by keyword..."
                  value={modalSearch}
                  onChange={(e) => setModalSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-1.5 text-xs bg-gray-50 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>
            </div>

            {/* Modal List */}
            <div className="p-0 overflow-y-auto divide-y divide-gray-100 flex-1 bg-white">
              {filteredModalNotifications.length === 0 ? (
                <div className="p-12 text-center text-gray-400">
                  <span className="material-symbols-outlined text-4xl mb-2 opacity-40">notifications_off</span>
                  <p className="text-sm">No notifications found.</p>
                </div>
              ) : (
                filteredModalNotifications.map(notification => {
                  const read = isItemRead(notification);
                  return (
                    <div 
                      key={notification.id}
                      onClick={() => handleNotificationClick(notification)}
                      className={`p-4 flex items-start gap-3.5 hover:bg-gray-50 cursor-pointer transition-colors ${read ? '' : 'bg-blue-50/25'}`}
                    >
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${getIconColor(notification.type)}`}>
                        <span className="material-symbols-outlined text-xl">{getIcon(notification.type)}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <h4 className={`text-sm ${read ? 'text-gray-900 font-semibold' : 'text-blue-900 font-bold'}`}>
                            {notification.title}
                          </h4>
                          <span className="text-[11px] text-gray-400 whitespace-nowrap">
                            {timeAgo(notification.createdAt)}
                          </span>
                        </div>
                        <p className="text-xs text-gray-600 leading-relaxed mb-1.5">
                          {notification.message}
                        </p>
                        {notification.link && (
                          <span className="inline-flex items-center gap-1 text-[11px] text-blue-600 font-medium hover:underline">
                            View details
                            <span className="material-symbols-outlined text-[12px]">arrow_outward</span>
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-3 border-t border-gray-100 bg-gray-50/80 flex justify-between items-center">
              <button 
                onClick={markAllAsRead}
                className="text-xs font-semibold text-blue-600 hover:underline"
              >
                Mark all as read
              </button>
              <button 
                onClick={() => setShowAllModal(false)}
                className="px-4 py-1.5 bg-gray-900 text-white rounded-lg text-xs font-semibold hover:bg-gray-800 transition-colors"
              >
                Close
              </button>
            </div>

          </div>
        </div>
      )}
    </>
  );
};

export default NotificationBell;
