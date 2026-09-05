import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import UserTopNavigation from './components/UserTopNavigation';

const MyHistoryPage: React.FC = () => {
  const navigate = useNavigate();
  const [fullName, setFullName] = useState<string>('');
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [timeFilter, setTimeFilter] = useState<string>('1-month');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');
    
    // Redirect if no token or role is not 'user'
    if (!token || role !== 'user') {
      navigate('/login');
      return;
    } 

    const storedName = localStorage.getItem('name');
    if (storedName) {
      setFullName(storedName);
    }

    // Fetch user appointments
    fetch('http://localhost:8080/api/v1/user/appointments', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    .then(res => res.json())
    .then(data => {
      if (data.success) {
        setAppointments(data.appointments || []);
      }
      setLoading(false);
    })
    .catch(err => {
      console.error('Error fetching appointments', err);
      setLoading(false);
    });
  }, [navigate]);

  const handleBookAgain = () => {
    navigate('/book-appointment');
  };

  const handleViewDetail = (app: any) => {
    console.log("View Detail for:", app);
  };

  const handleDownloadReceipt = (e: React.MouseEvent, app: any) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    if (!token) return;

    fetch(`http://localhost:8080/api/v1/user/appointments/${app.id}/receipt`, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    })
    .then(res => {
        if (!res.ok) throw new Error("Could not download receipt");
        return res.blob();
    })
    .then(blob => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Receipt-APPT-${app.id}.pdf`;
        document.body.appendChild(a);
        a.click();
        a.remove();
    })
    .catch(err => {
        console.error("Receipt download failed", err);
        alert("Failed to download receipt. Please try again later.");
    });
  };

  const filteredAppointments = useMemo(() => {
    return appointments.filter(app => {
      // Filter by Status
      if (statusFilter === 'upcoming') {
        if (!['SCHEDULED', 'CHECKED_IN', 'PENDING_APPROVAL'].includes(app.appointmentStatus)) return false;
      } else if (statusFilter === 'completed') {
        if (app.appointmentStatus !== 'COMPLETED') return false;
      } else if (statusFilter === 'cancelled') {
        if (app.appointmentStatus !== 'CANCELLED') return false;
      }

      // Filter by Time
      if (timeFilter !== 'lifetime') {
        const appDate = new Date(app.appointmentDate).getTime();
        const now = new Date().getTime();
        const diffDays = (now - appDate) / (1000 * 3600 * 24);

        if (timeFilter === '7-days' && diffDays > 7) return false;
        if (timeFilter === '1-month' && diffDays > 30) return false;
        if (timeFilter === '3-months' && diffDays > 90) return false;
        if (timeFilter === '6-months' && diffDays > 180) return false;
      }

      return true;
    });
  }, [appointments, statusFilter, timeFilter]);

  // Group filtered appointments by Month Year
  const groupedAppointments = useMemo(() => {
    const groups: { [key: string]: any[] } = {};
    filteredAppointments.forEach(app => {
      const date = new Date(app.appointmentDate);
      const key = date.toLocaleString('en-US', { month: 'long', year: 'numeric' });
      if (!groups[key]) {
        groups[key] = [];
      }
      groups[key].push(app);
    });

    return Object.keys(groups).map(key => ({
      monthYear: key,
      items: groups[key]
    }));
  }, [filteredAppointments]);

  const getStatusColors = (status: string) => {
    switch (status) {
      case 'CHECKED_IN':
        return 'bg-emerald-50 border border-emerald-100 text-emerald-800';
      case 'COMPLETED':
        return 'bg-blue-50 border border-blue-100 text-blue-800';
      case 'CANCELLED':
        return 'bg-rose-50 border border-rose-100 text-rose-800';
      case 'PENDING_APPROVAL':
        return 'bg-blue-50 border border-blue-100 text-blue-800';
      case 'SCHEDULED':
      default:
        return 'bg-amber-50 border border-amber-100 text-amber-800';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'CHECKED_IN':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[12px] font-bold bg-emerald-100 text-emerald-700">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
            Checked-in
          </span>
        );
      case 'COMPLETED':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[12px] font-bold bg-blue-100 text-blue-700">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-600"></span>
            Completed
          </span>
        );
      case 'CANCELLED':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[12px] font-bold bg-rose-100 text-rose-700">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-600"></span>
            Cancelled
          </span>
        );
      case 'PENDING_APPROVAL':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[12px] font-bold bg-blue-100 text-blue-700">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-600"></span>
            Awaiting Approval
          </span>
        );
      case 'SCHEDULED':
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[12px] font-bold bg-amber-100 text-amber-700">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-600"></span>
            Upcoming
          </span>
        );
    }
  };

  return (
    <div className="bg-[#f9f9ff] text-[#151c27] font-sans antialiased min-h-screen flex flex-col">
      {/* TopNavBar */}
      <UserTopNavigation />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 md:px-10 py-6 sm:py-8 pt-24 sm:pt-28">
        {/* Header Title & Dropdown Filter */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
            <div>
                <h1 className="text-2xl sm:text-[32px] font-bold text-[#151c27] tracking-tight">Appointment History</h1>
                <p className="text-[#434654] text-sm sm:text-[16px] mt-1 opacity-70">Review and manage your past and upcoming visits.</p>
            </div>
            <div className="flex flex-wrap sm:flex-nowrap gap-3 w-full sm:w-auto">
                <div className="relative flex-1 sm:min-w-[150px]">
                    <select
                        value={timeFilter}
                        onChange={(e) => setTimeFilter(e.target.value)}
                        className="w-full appearance-none bg-white border border-[#c3c5d7] rounded-xl px-4 sm:px-6 py-3 sm:py-3.5 font-medium text-xs sm:text-[14px] text-[#151c27] focus:outline-none focus:ring-2 focus:ring-[#003fb1]/20 transition-all cursor-pointer shadow-sm">
                        <option value="7-days">7 days</option>
                        <option value="1-month">1 month</option>
                        <option value="3-months">3 months</option>
                        <option value="6-months">6 months</option>
                        <option value="lifetime">Lifetime</option>
                    </select>
                    <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-[#53606c]">expand_more</span>
                </div>
                <div className="relative flex-1 sm:min-w-[150px]">
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="w-full appearance-none bg-white border border-[#c3c5d7] rounded-xl px-4 sm:px-6 py-3 sm:py-3.5 font-medium text-xs sm:text-[14px] text-[#151c27] focus:outline-none focus:ring-2 focus:ring-[#003fb1]/20 transition-all cursor-pointer shadow-sm">
                        <option value="all">All</option>
                        <option value="upcoming">Upcoming</option>
                        <option value="completed">Completed</option>
                        <option value="cancelled">Cancelled</option>
                    </select>
                    <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-[#53606c]">expand_more</span>
                </div>
            </div>
        </div>

        {/* Cards Container */}
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-10 h-10 border-4 border-[#003fb1] border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : filteredAppointments.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-[#53606c] text-[18px]">No appointments found for the selected filters.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {groupedAppointments.map((group, groupIndex) => (
              <React.Fragment key={group.monthYear}>
                {/* Timeline Divider */}
                <div className="flex justify-center items-center gap-6 mt-8 mb-4">
                  <div className="h-[1px] w-full bg-[#c3c5d7]"></div>
                  <span className="text-[12px] font-bold uppercase tracking-widest text-[#53606c] whitespace-nowrap text-center">
                    {group.monthYear}
                  </span>
                  <div className="h-[1px] w-full bg-[#c3c5d7]"></div>
                </div>

                {/* Appointment Cards */}
                {group.items.map((app) => {
                  const dateObj = new Date(app.appointmentDate);
                  const shortMonth = dateObj.toLocaleString('en-US', { month: 'short' });
                  const day = dateObj.getDate().toString().padStart(2, '0');
                  const time = app.appointmentTime ? app.appointmentTime.substring(0, 5) : '';

                  const colorClasses = getStatusColors(app.appointmentStatus);
                  const opacityClass = app.appointmentStatus === 'CANCELLED' ? 'opacity-80' : '';

                  return (
                    <div
                      key={app.id}
                      className={`bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-all hover:-translate-y-1 flex flex-col md:flex-row md:items-center justify-between gap-6 border border-[#e2e8f0] ${opacityClass}`}
                    >
                      <div className="flex items-start gap-6">
                        {/* Date Cube */}
                        <div className={`flex flex-col items-center justify-center rounded-xl p-4 min-w-[80px] ${colorClasses}`}>
                          <span className="text-[12px] font-bold uppercase tracking-wider">{shortMonth}</span>
                          <span className="text-[26px] font-black leading-none my-1">{day}</span>
                          <span className="text-[12px] font-semibold mt-1 opacity-90">{time}</span>
                        </div>
                        
                        {/* Details */}
                        <div className="space-y-2 mt-1">
                          {getStatusBadge(app.appointmentStatus)}
                          <h3 className="text-[20px] font-bold text-[#151c27] leading-tight">
                            {app.doctorName || 'Provider'}
                          </h3>
                          <p className="text-[15px] font-medium text-[#53606c] flex items-center gap-2">
                            <span className="material-symbols-outlined text-[18px]">medical_services</span> 
                            {app.serviceName}
                          </p>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex flex-wrap md:flex-nowrap items-center gap-4">
                        {(app.appointmentStatus === 'COMPLETED' || app.appointmentStatus === 'SCHEDULED' || app.appointmentStatus === 'CHECKED_IN' || app.appointmentStatus === 'PENDING_APPROVAL') && (
                          <a 
                            className="text-[#003fb1] text-[14px] font-semibold hover:underline flex items-center gap-2 mr-2 cursor-pointer"
                            onClick={(e) => handleDownloadReceipt(e, app)}
                          >
                            <span className="material-symbols-outlined text-[18px]">download</span> Download Receipt
                          </a>
                        )}
                        {app.appointmentType === 'VIRTUAL' && app.meetingLink && app.appointmentStatus === 'SCHEDULED' && (
                          <a href={app.meetingLink} target="_blank" rel="noreferrer" className="px-6 py-3 bg-[#1a56db] text-white rounded-xl text-[14px] font-bold hover:bg-[#123e9e] flex items-center gap-2">
                             <span className="material-symbols-outlined text-[18px]">video_camera_front</span> Join Meeting
                          </a>
                        )}
                        <button
                          onClick={() => handleViewDetail(app)}
                          className="px-6 py-3 bg-[#f0f3ff] text-[#003fb1] rounded-xl text-[14px] font-bold hover:bg-[#e0e8ff] transition-colors border border-[#d6e4f3]">
                          View Detail
                        </button>
                        <button
                          onClick={handleBookAgain}
                          className="px-6 py-3 bg-[#003fb1] text-white rounded-xl text-[14px] font-bold hover:bg-[#002f87] shadow-md transition-all active:scale-95">
                          {app.appointmentStatus === 'SCHEDULED' ? 'Reschedule' : 'Book Again'}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </React.Fragment>
            ))}
          </div>
        )}

      </main>
    </div>
  );
};

export default MyHistoryPage;
