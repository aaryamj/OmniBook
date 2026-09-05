import React, { useEffect } from 'react';
import { useNavigate, NavLink } from 'react-router-dom';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import ProviderTopNavigation from './components/ProviderTopNavigation';
import QRScannerComponent from './components/QRScannerComponent';

const ProviderDashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const [showScanner, setShowScanner] = React.useState(false);
  const [notification, setNotification] = React.useState<{message: string, type: 'success' | 'error'} | null>(null);
  const [appointments, setAppointments] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [selectedDate, setSelectedDate] = React.useState<Date>(new Date());

  // View Details Modal State
  const [isDetailsModalOpen, setIsDetailsModalOpen] = React.useState(false);
  const [selectedAppointment, setSelectedAppointment] = React.useState<any | null>(null);

  // Mark Complete Modal State
  const [isCompleteModalOpen, setIsCompleteModalOpen] = React.useState(false);
  const [completingApptId, setCompletingApptId] = React.useState<number | null>(null);
  const [completeForm, setCompleteForm] = React.useState({
    treatmentSummary: '',
    internalNotes: '',
    followUpMonths: '0'
  });

  // Cancel Modal State
  const [isCancelModalOpen, setIsCancelModalOpen] = React.useState(false);
  const [cancellingApptId, setCancellingApptId] = React.useState<number | null>(null);

  const loadAppointments = async () => {
    const token = localStorage.getItem('token');
    try {
      const response = await fetch('http://localhost:8080/api/v1/provider/appointments', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setAppointments(data.appointments || []);
      }
    } catch (error) {
      console.error('Error fetching appointments', error);
    } finally {
      setLoading(false);
    }
  };

  const handleScanSuccess = async (decodedText: string) => {
    setShowScanner(false);
    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`http://localhost:8080/api/v1/provider/appointments/checkin/${decodedText}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        setNotification({ message: 'Check-in successful! Patient has been marked as arrived.', type: 'success' });
        setTimeout(() => setNotification(null), 5000);
        loadAppointments();
      } else {
        setNotification({ message: 'Failed to check-in. Invalid QR code or appointment not found.', type: 'error' });
        setTimeout(() => setNotification(null), 5000);
      }
    } catch (error) {
      console.error('Error during check-in', error);
      setNotification({ message: 'An error occurred during check-in.', type: 'error' });
      setTimeout(() => setNotification(null), 5000);
    }
  };
  useEffect(() => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');

    // Redirect if no token or role is not 'service_provider'
    if (!token || role !== 'service_provider') {
      navigate('/login');
      return;
    }

    loadAppointments();
  }, [navigate]);

  const openCompleteModal = (id: number) => {
    setCompletingApptId(id);
    setIsCompleteModalOpen(true);
    setCompleteForm({ treatmentSummary: '', internalNotes: '', followUpMonths: '0' });
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
        setNotification({ message: 'Appointment marked as completed.', type: 'success' });
        setTimeout(() => setNotification(null), 5000);
        loadAppointments();
      } else {
        alert(data.message || 'Failed to mark as complete');
      }
    });
  };

  const openCancelModal = (id: number) => {
    setCancellingApptId(id);
    setIsCancelModalOpen(true);
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
        setNotification({ message: 'Appointment cancelled successfully.', type: 'success' });
        setTimeout(() => setNotification(null), 5000);
        setIsCancelModalOpen(false);
        setCancellingApptId(null);
        loadAppointments();
      } else {
        alert(data.message || 'Failed to cancel');
      }
    });
  };

  const handleApprove = async (id: number) => {
    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`http://localhost:8080/api/v1/provider/appointments/${id}/approve`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        setNotification({ message: 'Appointment approved successfully!', type: 'success' });
        setAppointments(prev => prev.map(a => a.id === id ? { ...a, appointmentStatus: 'SCHEDULED' } : a));
        setTimeout(() => setNotification(null), 5000);
      } else {
        setNotification({ message: 'Failed to approve appointment.', type: 'error' });
        setTimeout(() => setNotification(null), 5000);
      }
    } catch (e) {
      setNotification({ message: 'An error occurred.', type: 'error' });
      setTimeout(() => setNotification(null), 5000);
    }
  };

  const handleDecline = async (id: number) => {
    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`http://localhost:8080/api/v1/provider/appointments/${id}/decline`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        setNotification({ message: 'Appointment declined.', type: 'success' });
        setAppointments(prev => prev.map(a => a.id === id ? { ...a, appointmentStatus: 'CANCELLED' } : a));
        setTimeout(() => setNotification(null), 5000);
      } else {
        setNotification({ message: 'Failed to decline appointment.', type: 'error' });
        setTimeout(() => setNotification(null), 5000);
      }
    } catch (e) {
      setNotification({ message: 'An error occurred.', type: 'error' });
      setTimeout(() => setNotification(null), 5000);
    }
  };

  // Compute metrics
  const year = selectedDate.getFullYear();
  const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
  const day = String(selectedDate.getDate()).padStart(2, '0');
  const dateString = `${year}-${month}-${day}`;
  const todayAppointments = appointments.filter(a => a.appointmentDate === dateString && a.appointmentStatus !== 'PENDING_APPROVAL');
  const todayRevenue = todayAppointments
    .filter(a => a.appointmentStatus !== 'CANCELLED')
    .reduce((sum, a) => sum + (a.price || 0), 0);
  
  const newRequestsCount = appointments.filter(
    a => a.appointmentStatus === 'PENDING_APPROVAL'
  ).length;

  const pendingAppointments = appointments.filter(a => a.appointmentStatus === 'PENDING_APPROVAL');

  const handleLogout = (e: React.MouseEvent) => {
    e.preventDefault();
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('fullName');
    navigate('/login');
  };

  const handlePrevDay = () => {
    const prevDate = new Date(selectedDate);
    prevDate.setDate(prevDate.getDate() - 1);
    setSelectedDate(prevDate);
  };

  const handleNextDay = () => {
    const nextDate = new Date(selectedDate);
    nextDate.setDate(nextDate.getDate() + 1);
    setSelectedDate(nextDate);
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.getDate() === today.getDate() && 
           date.getMonth() === today.getMonth() && 
           date.getFullYear() === today.getFullYear();
  };

  const openDetailsModal = (appointment: any) => {
    setSelectedAppointment(appointment);
    setIsDetailsModalOpen(true);
  };

  const closeDetailsModal = () => {
    setIsDetailsModalOpen(false);
    setSelectedAppointment(null);
  };

  const downloadPDF = () => {
    if (!selectedAppointment) return;
    
    const doc = new jsPDF();
    const appt = selectedAppointment;

    // Header
    doc.setFontSize(22);
    doc.setTextColor(26, 86, 219); // Primary Blue
    doc.text('Appointment Report', 14, 20);
    
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 28);
    
    doc.setDrawColor(200, 200, 200);
    doc.line(14, 32, 196, 32);

    // Patient Details
    doc.setFontSize(14);
    doc.setTextColor(0, 0, 0);
    doc.text('Patient Information', 14, 42);
    
    autoTable(doc, {
      startY: 46,
      theme: 'grid',
      headStyles: { fillColor: [240, 243, 255], textColor: [0, 63, 177] },
      body: [
        ['Name', appt.patientName],
        ['Phone', appt.patientPhone || 'N/A'],
        ['Email', appt.patientEmail || 'N/A'],
        ['Reason for Visit', appt.reasonForVisit || 'None provided']
      ],
      columnStyles: {
        0: { fontStyle: 'bold', cellWidth: 50 }
      }
    });

    // Appointment Details
    let finalY = (doc as any).lastAutoTable.finalY + 10;
    
    doc.setFontSize(14);
    doc.setTextColor(0, 0, 0);
    doc.text('Appointment Details', 14, finalY);

    autoTable(doc, {
      startY: finalY + 4,
      theme: 'grid',
      headStyles: { fillColor: [240, 243, 255], textColor: [0, 63, 177] },
      body: [
        ['Service Booked', appt.serviceName],
        ['Date', appt.appointmentDate],
        ['Time', appt.appointmentTime?.substring(0, 5)],
        ['Status', appt.appointmentStatus],
        ['Price', `$${appt.price?.toFixed(2) || '0.00'}`]
      ],
      columnStyles: {
        0: { fontStyle: 'bold', cellWidth: 50 }
      }
    });

    // Timeline
    finalY = (doc as any).lastAutoTable.finalY + 10;
    doc.setFontSize(14);
    doc.setTextColor(0, 0, 0);
    doc.text('Lifecycle Timeline', 14, finalY);

    const formatDate = (dateStr: string) => {
      if (!dateStr) return 'N/A';
      return new Date(dateStr).toLocaleString();
    };

    autoTable(doc, {
      startY: finalY + 4,
      theme: 'grid',
      headStyles: { fillColor: [240, 243, 255], textColor: [0, 63, 177] },
      body: [
        ['Booked At', formatDate(appt.bookedAt)],
        ['Approved At', formatDate(appt.approvedAt)],
        ['Checked In At', formatDate(appt.checkedInAt)],
        ['Completed At', formatDate(appt.completedAt)]
      ],
      columnStyles: {
        0: { fontStyle: 'bold', cellWidth: 50 }
      }
    });

    // Clinical Notes & Feedback
    finalY = (doc as any).lastAutoTable.finalY + 10;
    
    if (appt.appointmentStatus === 'COMPLETED') {
      doc.setFontSize(14);
      doc.setTextColor(0, 0, 0);
      doc.text('Clinical Notes & Feedback', 14, finalY);

      const notesBody = [
        ['Treatment Summary', appt.treatmentSummary || 'N/A'],
        ['Internal Notes', appt.internalNotes || 'N/A'],
        ['Follow Up Date', appt.followUpDate || 'N/A']
      ];

      if (appt.patientRating) {
        notesBody.push(['Patient Rating', `${appt.patientRating} / 5 Stars`]);
        notesBody.push(['Patient Review', appt.patientReview || 'N/A']);
      }

      autoTable(doc, {
        startY: finalY + 4,
        theme: 'grid',
        headStyles: { fillColor: [240, 243, 255], textColor: [0, 63, 177] },
        body: notesBody,
        columnStyles: {
          0: { fontStyle: 'bold', cellWidth: 50 }
        }
      });
    }

    doc.save(`Appointment_${appt.patientName.replace(/\s+/g, '_')}_${appt.appointmentDate}.pdf`);
  };

  return (
    <div className="bg-[#F3F4F6] text-[#151c27] font-sans min-h-screen flex">
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

      {/* Main Content */}
      <main className="pt-24 pb-20 md:ml-64 px-4 md:px-10 min-h-screen w-full relative">
        
        {/* Toast Notification */}
        {notification && (
          <div className={`fixed top-24 left-1/2 transform -translate-x-1/2 z-50 px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3 transition-all ${
            notification.type === 'success' ? 'bg-[#10B981] text-white border border-[#059669]' : 'bg-[#ba1a1a] text-white border border-[#93000a]'
          }`}>
            <span className="material-symbols-outlined text-[24px]">
              {notification.type === 'success' ? 'check_circle' : 'error'}
            </span>
            <span className="font-bold text-[15px]">{notification.message}</span>
            <button onClick={() => setNotification(null)} className="ml-4 opacity-70 hover:opacity-100 transition-opacity flex items-center">
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>
          </div>
        )}

        {/* Header Module */}
        <section className="flex flex-col md:flex-row md:items-center justify-between mb-12 gap-6">
          <div>
            <h1 className="text-[32px] text-[#151c27] font-bold tracking-tight">Operations Dashboard</h1>
            <p className="text-[16px] text-[#53606c] mt-1">Tuesday, June 9, 2026</p>
          </div>
          <div className="flex gap-4">
            <button 
              onClick={() => setShowScanner(true)}
              className="bg-white border-2 border-[#1a56db] text-[#1a56db] font-bold px-6 py-4 rounded-xl flex items-center gap-2 shadow-sm hover:bg-[#f0f3ff] active:scale-95 transition-all">
              <span className="material-symbols-outlined">qr_code_scanner</span>
              <span>Scan to Check-in</span>
            </button>
            <button className="bg-[#1a56db] text-white font-bold px-8 py-4 rounded-xl flex items-center gap-2 shadow-lg active:scale-95 transition-transform">
              <span className="material-symbols-outlined">add</span>
              <span>Create New Booking</span>
            </button>
          </div>
        </section>

        {showScanner && (
          <QRScannerComponent 
            onScanSuccess={handleScanSuccess}
            onClose={() => setShowScanner(false)}
          />
        )}

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-[#003fb1]">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-[12px] text-[#53606c] uppercase tracking-wider">Today's Schedule</p>
                <h2 className="text-[48px] font-bold text-[#003fb1] mt-1 leading-tight">{loading ? '...' : todayAppointments.length}</h2>
                <p className="text-[14px] text-[#434654] mt-1">Slots Booked</p>
              </div>
              <span className="material-symbols-outlined text-[#1a56db] bg-[#dbe1ff] p-4 rounded-lg">event_available</span>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-[#006f4b]">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-[12px] text-[#53606c] uppercase tracking-wider">Today's Est. Revenue</p>
                <h2 className="text-[48px] font-bold text-[#005438] mt-1 leading-tight">रू {loading ? '...' : todayRevenue.toLocaleString()}</h2>
                <p className="text-[14px] text-[#434654] mt-1">Projected Today</p>
              </div>
              <span className="material-symbols-outlined text-[#005438] bg-[#6ffbbe]/30 p-4 rounded-lg">payments</span>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-[#ba1a1a]">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-[12px] text-[#53606c] uppercase tracking-wider">New Requests</p>
                <h2 className="text-[48px] font-bold text-[#ba1a1a] mt-1 leading-tight">{loading ? '...' : newRequestsCount}</h2>
                <p className="text-[14px] text-[#434654] mt-1">Upcoming Bookings</p>
              </div>
              <span className="material-symbols-outlined text-[#93000a] bg-[#ffdad6] p-4 rounded-lg">notification_important</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Timeline View Card */}
          <div className="lg:col-span-8 bg-white rounded-xl shadow-sm p-6 flex flex-col h-full">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-[20px] font-bold text-[#151c27]">
                {isToday(selectedDate) ? "Today's Schedule" : selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
              </h3>
              <div className="flex gap-2">
                <button onClick={handlePrevDay} className="p-2 hover:bg-[#dce2f3] rounded-full material-symbols-outlined transition-colors">chevron_left</button>
                <button onClick={handleNextDay} className="p-2 hover:bg-[#dce2f3] rounded-full material-symbols-outlined transition-colors">chevron_right</button>
              </div>
            </div>

            <div className="flex-grow flex flex-col gap-4 overflow-y-auto max-h-[600px] pr-2">
              {todayAppointments.length === 0 ? (
                <div className="flex items-center justify-center h-full text-[#53606c] italic">
                  No appointments scheduled for {isToday(selectedDate) ? "today" : "this date"}.
                </div>
              ) : (
                todayAppointments.sort((a, b) => a.appointmentTime.localeCompare(b.appointmentTime)).map((appointment, index) => (
                  <div key={appointment.id || index} className="flex gap-6 group">
                    <div className="flex flex-col items-center">
                      <span className="text-[14px] text-[#53606c] font-bold w-16 text-right">{appointment.appointmentTime.substring(0, 5)}</span>
                      <div className="w-[2px] h-full bg-[#c3c5d7]/30 my-2"></div>
                    </div>
                    <div className={`flex-grow bg-white/90 backdrop-blur-md border border-[#c3c5d7]/30 shadow-[0_4px_20px_rgba(26,86,219,0.05)] rounded-xl p-6 mb-4 flex justify-between items-center transition-all group-hover:translate-x-1 ${
                      appointment.appointmentStatus === 'CHECKED_IN' ? 'border-l-4 border-l-[#006f4b]' : ''
                    }`}>
                      <div>
                        <h4 className="text-[20px] font-bold text-[#151c27]">{appointment.patientName}</h4>
                        <p className="text-[14px] text-[#53606c] flex items-center gap-2 mt-1">
                          <span className="material-symbols-outlined text-[18px]">medical_services</span> {appointment.serviceName}
                        </p>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className={`px-4 py-1.5 rounded-full text-[12px] font-bold flex items-center gap-2 ${
                          appointment.appointmentStatus === 'CHECKED_IN' ? 'bg-[#10B981]/10 text-[#10B981]' : 
                          appointment.appointmentStatus === 'COMPLETED' ? 'bg-[#003fb1]/10 text-[#003fb1]' : 
                          'bg-[#f0f3ff] text-[#3b4854]'
                        }`}>
                          {appointment.appointmentStatus === 'CHECKED_IN' && (
                            <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse"></span>
                          )}
                          {appointment.appointmentStatus}
                        </span>
                        <div className="flex gap-2">
                          {appointment.appointmentStatus === 'SCHEDULED' && appointment.appointmentType === 'VIRTUAL' && appointment.meetingLink && (
                            <a href={appointment.meetingLink} target="_blank" rel="noreferrer"
                              className="bg-[#1a56db] text-white px-4 py-2 rounded-lg font-bold text-xs hover:bg-[#123e9e] transition-all flex items-center gap-1"
                            >
                              <span className="material-symbols-outlined text-[16px]">video_camera_front</span>
                              Join Meeting
                            </a>
                          )}
                          {(appointment.appointmentStatus === 'CHECKED_IN' || (appointment.appointmentStatus === 'SCHEDULED' && appointment.appointmentType === 'VIRTUAL')) && (
                            <button 
                              className="bg-[#006f4b] text-white px-4 py-2 rounded-lg font-bold text-xs hover:bg-[#005438] transition-all"
                              onClick={() => openCompleteModal(appointment.id)}
                            >
                              Mark Complete
                            </button>
                          )}
                          {appointment.appointmentStatus === 'COMPLETED' && (
                              <button 
                                className="border border-[#003fb1] text-[#003fb1] px-4 py-2 rounded-lg font-bold text-xs hover:bg-[#e2e8f8] transition-all"
                                onClick={() => openDetailsModal(appointment)}
                              >
                                View Details
                              </button>
                            )}
                          {appointment.appointmentStatus !== 'CANCELLED' && appointment.appointmentStatus !== 'COMPLETED' && (
                            <button 
                              className="border border-[#ef4444] text-[#ef4444] px-4 py-2 rounded-lg font-bold text-xs hover:bg-[#fee2e2] transition-all"
                              onClick={() => openCancelModal(appointment.id)}
                            >
                              Cancel
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Urgent Actions Panel */}
          <div className="lg:col-span-4 flex flex-col gap-6">
            {/* Awaiting Approval */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#ba1a1a]">pending_actions</span>
                  <h3 className="text-[20px] font-bold text-[#151c27]">Awaiting Approval</h3>
                </div>
                <button className="text-[12px] font-bold text-[#003fb1] hover:underline">View All</button>
              </div>
              <div className="space-y-4">
                {pendingAppointments.length === 0 ? (
                  <p className="text-[14px] text-[#53606c] italic p-4 text-center">No pending approvals.</p>
                ) : (
                  pendingAppointments.map(app => (
                    <div key={app.id} className="p-4 bg-[#f0f3ff] rounded-lg border border-[#c3c5d7]/50">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h5 className="text-[14px] font-bold text-[#151c27]">{app.patientName}</h5>
                          <p className="text-[12px] text-[#53606c]">{app.serviceName}</p>
                          <p className="text-[12px] text-[#53606c] font-medium mt-1">{app.appointmentDate}</p>
                        </div>
                        <span className="text-[12px] font-bold text-[#003fb1]">{app.appointmentTime?.substring(0,5) || ''}</span>
                      </div>
                      <div className="flex gap-2 mt-4">
                        <button 
                          onClick={() => handleApprove(app.id)}
                          className="flex-1 bg-[#003fb1] text-white py-2 rounded-lg font-bold text-xs hover:bg-[#1a56db] transition-colors">Approve</button>
                        <button 
                          onClick={() => handleDecline(app.id)}
                          className="flex-1 border border-[#737686] text-[#53606c] py-2 rounded-lg font-bold text-xs hover:bg-[#dce2f3] transition-colors">Decline</button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Missed/No-Shows */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-[20px] font-bold text-[#151c27] mb-6">Yesterday's Missed</h3>
              <div className="p-4 bg-[#ffdad6]/30 border border-[#ba1a1a]/20 rounded-lg flex items-center justify-between">
                <div>
                  <h5 className="text-[14px] font-bold text-[#93000a]">Liam Thompson</h5>
                  <p className="text-[12px] text-[#53606c] mt-1">Missing since 08/06 4:00 PM</p>
                </div>
                <button className="bg-[#ba1a1a] text-white px-4 py-2 rounded-lg font-bold text-xs shadow-sm active:scale-95 transition-all">Mark as No-Show</button>
              </div>
            </div>

            {/* Mini Analytics Card */}
            <div className="bg-[#1a56db] rounded-xl shadow-lg p-6 text-white relative overflow-hidden">
              <div className="relative z-10">
                <p className="text-[12px] opacity-80 uppercase tracking-widest mb-1">Clinic Performance</p>
                <h4 className="text-[24px] font-bold mb-6">Peak Productivity</h4>
                <div className="flex items-end gap-2">
                  <div className="w-8 h-12 bg-white/20 rounded-t-sm"></div>
                  <div className="w-8 h-16 bg-white/40 rounded-t-sm"></div>
                  <div className="w-8 h-24 bg-white/60 rounded-t-sm"></div>
                  <div className="w-8 h-32 bg-white rounded-t-sm"></div>
                </div>
              </div>
              <span className="material-symbols-outlined absolute -right-4 -bottom-4 text-[120px] opacity-10 rotate-12">trending_up</span>
            </div>
          </div>
        </div>
      </main>

      {/* VIEW DETAILS MODAL */}
      {isDetailsModalOpen && selectedAppointment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0f172a]/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl w-full max-w-3xl shadow-2xl overflow-hidden flex flex-col animate-[fadeIn_0.3s_ease-out]">
            <div className="px-6 py-4 bg-gradient-to-r from-[#1a56db] to-[#003fb1] flex justify-between items-center text-white">
              <h2 className="text-xl font-bold">Appointment Details</h2>
              <div className="flex gap-4">
                <button 
                  onClick={downloadPDF} 
                  className="bg-white/20 hover:bg-white/30 px-3 py-1.5 rounded-lg flex items-center gap-2 transition text-sm font-bold shadow-sm"
                >
                  <span className="material-symbols-outlined text-[18px]">download</span>
                  Download PDF
                </button>
                <button onClick={closeDetailsModal} className="text-white/70 hover:text-white transition p-1">
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>
            </div>
            
            <div className="p-8 flex flex-col gap-8 overflow-y-auto max-h-[80vh]">
              {/* Patient Profile Section */}
              <div className="bg-[#f8fafc] rounded-xl p-6 border border-[#e2e8f0] shadow-sm">
                <h3 className="text-lg font-bold text-[#0f172a] mb-4 flex items-center gap-2 border-b border-[#cbd5e1] pb-2">
                  <span className="material-symbols-outlined text-[#1a56db]">person</span> Patient Profile
                </h3>
                <div className="flex items-start gap-6 mb-6">
                  <img 
                    src={`https://ui-avatars.com/api/?name=${encodeURIComponent(selectedAppointment.patientName)}&background=e2e8f8&color=1a56db&size=128&rounded=true&font-size=0.4`} 
                    alt="Patient Profile" 
                    className="w-20 h-20 rounded-full shadow-sm border-2 border-white"
                  />
                  <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <p className="text-[11px] font-bold text-[#64748b] uppercase tracking-widest mb-1">Name</p>
                      <p className="text-md font-semibold text-[#1e293b]">{selectedAppointment.patientName}</p>
                    </div>
                    <div>
                      <p className="text-[11px] font-bold text-[#64748b] uppercase tracking-widest mb-1">Contact</p>
                      <p className="text-md font-semibold text-[#1e293b] flex flex-col gap-1">
                        <span className="flex items-center gap-2"><span className="material-symbols-outlined text-[16px] text-[#64748b]">phone</span> {selectedAppointment.patientPhone || 'N/A'}</span>
                        <span className="flex items-center gap-2"><span className="material-symbols-outlined text-[16px] text-[#64748b]">mail</span> {selectedAppointment.patientEmail || 'N/A'}</span>
                      </p>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-1 gap-6">
                  <div>
                    <p className="text-[11px] font-bold text-[#64748b] uppercase tracking-widest mb-1">Reason for Visit</p>
                    <p className="text-md font-semibold text-[#1e293b] bg-white p-3 rounded-lg border border-[#e2e8f0]">
                      {selectedAppointment.reasonForVisit || 'None provided'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Timestamp Timeline Section */}
              <div>
                <h3 className="text-lg font-bold text-[#0f172a] mb-4 flex items-center gap-2 border-b border-[#cbd5e1] pb-2">
                  <span className="material-symbols-outlined text-[#1a56db]">timeline</span> Lifecycle Timestamps
                </h3>
                <div className="relative border-l-2 border-[#cbd5e1] ml-3 mt-4 space-y-6">
                  {[
                    { label: 'Booked', time: selectedAppointment.bookedAt, icon: 'edit_calendar', color: 'bg-blue-100 text-blue-600', dot: 'bg-blue-600' },
                    { label: 'Approved', time: selectedAppointment.approvedAt, icon: 'verified', color: 'bg-purple-100 text-purple-600', dot: 'bg-purple-600' },
                    { label: 'Checked In', time: selectedAppointment.checkedInAt, icon: 'how_to_reg', color: 'bg-emerald-100 text-emerald-600', dot: 'bg-emerald-600' },
                    { label: 'Completed', time: selectedAppointment.completedAt, icon: 'task_alt', color: 'bg-green-100 text-green-600', dot: 'bg-green-600' }
                  ].map((stage, i) => (
                    stage.time && (
                      <div key={i} className="relative pl-6">
                        <div className={`absolute w-3 h-3 ${stage.dot} rounded-full -left-[7px] top-1.5 shadow-sm border-2 border-white`}></div>
                        <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold ${stage.color} mb-1`}>
                          <span className="material-symbols-outlined text-[14px]">{stage.icon}</span> {stage.label}
                        </div>
                        <p className="text-sm font-semibold text-[#334155]">
                          {new Date(stage.time).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })} at {new Date(stage.time).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    )
                  ))}
                </div>
              </div>

              {/* Clinical Notes & Feedback */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-bold text-[#0f172a] mb-4 flex items-center gap-2 border-b border-[#cbd5e1] pb-2">
                    <span className="material-symbols-outlined text-[#1a56db]">prescriptions</span> Clinical Notes
                  </h3>
                  <div className="space-y-4 text-sm">
                    <div>
                      <p className="font-bold text-[#64748b]">Treatment Summary:</p>
                      <p className="text-[#1e293b]">{selectedAppointment.treatmentSummary || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="font-bold text-[#64748b]">Internal Notes:</p>
                      <p className="text-[#1e293b]">{selectedAppointment.internalNotes || 'N/A'}</p>
                    </div>
                  </div>
                </div>
                
                {selectedAppointment.appointmentStatus === 'COMPLETED' && (
                  <div>
                    <h3 className="text-lg font-bold text-[#0f172a] mb-4 flex items-center gap-2 border-b border-[#cbd5e1] pb-2">
                      <span className="material-symbols-outlined text-[#1a56db]">star_rate</span> Patient Feedback
                    </h3>
                    {selectedAppointment.patientRating ? (
                      <div className="bg-[#fffbeb] p-5 rounded-xl border border-[#fef3c7] shadow-sm">
                        <div className="flex items-center gap-1 mb-3 text-[#fbbf24]">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <span key={star} className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: star <= selectedAppointment.patientRating ? "'FILL' 1" : "'FILL' 0" }}>
                              star
                            </span>
                          ))}
                        </div>
                        <p className="text-sm text-[#78350f] italic">
                          {selectedAppointment.patientReview ? `"${selectedAppointment.patientReview}"` : 'No written review provided.'}
                        </p>
                      </div>
                    ) : (
                      <div className="bg-gray-50 p-5 rounded-xl border border-gray-200 shadow-sm flex flex-col items-center justify-center text-center">
                        <span className="material-symbols-outlined text-gray-400 text-3xl mb-2">pending</span>
                        <p className="text-sm text-gray-500 italic">No feedback submitted yet.</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* COMPLETE APPOINTMENT MODAL */}
      {isCompleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0f172a]/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col">
            <div className="px-6 py-4 bg-[#f8fafc] border-b border-[#e2e8f0] flex justify-between items-center">
              <h2 className="text-xl font-bold text-[#0f172a]">Complete Appointment</h2>
              <button onClick={() => setIsCompleteModalOpen(false)} className="text-[#64748b] hover:text-[#0f172a] transition p-1">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <form onSubmit={submitMarkComplete} className="p-6 flex flex-col gap-5 overflow-y-auto">
              <div>
                <label className="block text-sm font-semibold text-[#334155] mb-2">Treatment Summary <span className="text-[#ef4444]">*</span></label>
                <textarea 
                  required
                  rows={3}
                  className="w-full px-4 py-2 bg-[#f8fafc] border border-[#cbd5e1] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3b82f6]/50 focus:border-[#3b82f6] text-[#0f172a]"
                  placeholder="Summarize the procedure, diagnosis, or service provided..."
                  value={completeForm.treatmentSummary}
                  onChange={(e) => setCompleteForm({...completeForm, treatmentSummary: e.target.value})}
                ></textarea>
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-[#334155] mb-2">Internal Notes (Optional)</label>
                <textarea 
                  rows={2}
                  className="w-full px-4 py-2 bg-[#f8fafc] border border-[#cbd5e1] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3b82f6]/50 focus:border-[#3b82f6] text-[#0f172a]"
                  placeholder="Private notes for provider eyes only..."
                  value={completeForm.internalNotes}
                  onChange={(e) => setCompleteForm({...completeForm, internalNotes: e.target.value})}
                ></textarea>
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#334155] mb-2">Follow-up Recommendation</label>
                <select 
                  className="w-full px-4 py-3 bg-[#f8fafc] border border-[#cbd5e1] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3b82f6]/50 focus:border-[#3b82f6] text-[#0f172a]"
                  value={completeForm.followUpMonths}
                  onChange={(e) => setCompleteForm({...completeForm, followUpMonths: e.target.value})}
                >
                  <option value="0">No follow-up needed</option>
                  <option value="1">In 1 Month</option>
                  <option value="3">In 3 Months</option>
                  <option value="6">In 6 Months</option>
                </select>
                <p className="text-xs text-[#64748b] mt-2">
                  Selecting a follow-up will automatically schedule a CRM reminder to be sent to the patient.
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
            <h2 className="text-xl font-bold text-[#0f172a] mb-2">Cancel Appointment?</h2>
            <p className="text-sm text-[#64748b] mb-6">
              Are you sure you want to cancel this appointment? This action cannot be undone and the patient will be notified.
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

    </div>
  );
};

export default ProviderDashboardPage;
