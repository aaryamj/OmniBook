import React, { useEffect, useState, useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import UserTopNavigation from './components/UserTopNavigation';
import UserFooter from './components/UserFooter';
import { useOrganizationTerms, getOrganizationTerms, formatRole } from '../../utils/organizationTerms';
import VideoConsultationModal from '../../components/VideoConsultationModal';

const MyHistoryPage: React.FC = () => {
  const terms = useOrganizationTerms();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [fullName, setFullName] = useState<string>('');
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [timeFilter, setTimeFilter] = useState<string>('lifetime');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [detailModalApp, setDetailModalApp] = useState<any | null>(null);
  const [activeVideoAppt, setActiveVideoAppt] = useState<any | null>(null);
  const modalTerms = useMemo(() => getOrganizationTerms(detailModalApp?.organizationType || terms.orgType), [detailModalApp, terms]);

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
        const appts = data.appointments || [];
        setAppointments(appts);
        
        // If deep linked with ?view=ID
        const viewId = searchParams.get('view');
        if (viewId) {
          const matched = appts.find((a: any) => String(a.id) === String(viewId));
          if (matched) {
            setDetailModalApp(matched);
          }
        }

        // If deep linked with ?joinVideo=ID
        const joinVideoId = searchParams.get('joinVideo');
        if (joinVideoId) {
          const matched = appts.find((a: any) => String(a.id) === String(joinVideoId));
          if (matched) {
            setActiveVideoAppt(matched);
          }
        }
      }
      setLoading(false);
    })
    .catch(err => {
      console.error('Error fetching appointments', err);
      setLoading(false);
    });
  }, [navigate, searchParams]);

  const handleBookAgain = () => {
    navigate('/book-appointment');
  };

  const handleViewDetail = (app: any) => {
    setDetailModalApp(app);
  };

  const downloadPDF = (appt: any) => {
    if (!appt) return;
    const apptTerms = getOrganizationTerms(appt.organizationType || terms.orgType);
    const doc = new jsPDF();

    // Brand Header
    doc.setFillColor(26, 86, 219); // #1a56db
    doc.rect(0, 0, 210, 30, 'F');
    doc.setFontSize(22);
    doc.setTextColor(255, 255, 255);
    doc.text('Appointment Summary', 14, 20);

    doc.setFontSize(10);
    doc.text(`Ref ID: #${appt.id} | Generated: ${new Date().toLocaleDateString()}`, 14, 26);

    let startY = 40;

    // Organization Details
    if (appt.organizationName) {
      doc.setFontSize(13);
      doc.setTextColor(0, 0, 0);
      doc.text(`${apptTerms.facilityLabel || 'Organization'} Details`, 14, startY);

      autoTable(doc, {
        startY: startY + 4,
        theme: 'grid',
        headStyles: { fillColor: [240, 243, 255], textColor: [0, 63, 177] },
        body: [
          [apptTerms.facilityLabel || 'Organization', appt.organizationName || 'Main Facility'],
          ['Type', appt.organizationType || 'Organization'],
          ['Location / Address', appt.organizationAddress || 'Main Campus'],
          ['Phone Contact', appt.organizationPhone || 'N/A']
        ],
        columnStyles: {
          0: { fontStyle: 'bold', cellWidth: 60 }
        }
      });
      startY = (doc as any).lastAutoTable.finalY + 10;
    }

    // Provider Details
    doc.setFontSize(13);
    doc.setTextColor(0, 0, 0);
    doc.text(`${apptTerms.providerSingular} Details`, 14, startY);

    autoTable(doc, {
      startY: startY + 4,
      theme: 'grid',
      headStyles: { fillColor: [240, 243, 255], textColor: [0, 63, 177] },
      body: [
        [apptTerms.providerSingular, appt.doctorName || 'N/A'],
        ['Specialty / Department', appt.doctorSpecialty || appt.serviceName || 'General'],
        ['Service Booked', appt.serviceName || 'General Service'],
        ['Date & Time', `${appt.appointmentDate} at ${appt.appointmentTime?.substring(0, 5) || 'N/A'}`],
        ['Format', appt.appointmentType === 'VIRTUAL' ? 'Virtual (Online)' : apptTerms.inFacility],
        ['Status', appt.appointmentStatus],
        ['Price', appt.price ? `$${Number(appt.price).toFixed(2)}` : 'N/A']
      ],
      columnStyles: {
        0: { fontStyle: 'bold', cellWidth: 60 }
      }
    });

    let finalY = (doc as any).lastAutoTable.finalY + 10;
    doc.setFontSize(14);
    doc.setTextColor(0, 0, 0);
    doc.text('Lifecycle Timestamps', 14, finalY);

    const formatDate = (dateStr: string) => {
      if (!dateStr) return 'N/A';
      return new Date(dateStr).toLocaleString();
    };

    autoTable(doc, {
      startY: finalY + 4,
      theme: 'grid',
      headStyles: { fillColor: [240, 243, 255], textColor: [0, 63, 177] },
      body: [
        ['Booked', `${formatDate(appt.bookedAt)} ${appt.patientName || appt.bookedByName ? `(${appt.patientName || appt.bookedByName} - ${formatRole(appt.bookedByRole && appt.bookedByRole !== 'admin' && appt.bookedByRole !== 'service_provider' && appt.bookedByRole !== 'provider' ? appt.bookedByRole : apptTerms.customerSingular.toLowerCase(), apptTerms)})` : ''}`],
        ['Approved', `${formatDate(appt.approvedAt)} ${appt.approvedByName ? `(${appt.approvedByName} - ${formatRole(appt.approvedByRole, apptTerms)})` : ''}`],
        ['Checked In', `${formatDate(appt.checkedInAt)} ${appt.checkedInByName ? `(${appt.checkedInByName} - ${formatRole(appt.checkedInByRole, apptTerms)})` : ''}`],
        ['Completed', `${formatDate(appt.completedAt)} ${appt.completedByName ? `(${appt.completedByName} - ${formatRole(appt.completedByRole, apptTerms)})` : ''}`]
      ],
      columnStyles: {
        0: { fontStyle: 'bold', cellWidth: 60 }
      }
    });

    if (appt.treatmentSummary || appt.patientReview) {
      finalY = (doc as any).lastAutoTable.finalY + 10;
      doc.setFontSize(14);
      doc.setTextColor(0, 0, 0);
      doc.text('Notes & Feedback', 14, finalY);

      const notesBody: any[] = [];
      if (appt.treatmentSummary) notesBody.push([apptTerms.summaryLabel, appt.treatmentSummary]);
      if (appt.internalNotes) notesBody.push(['Notes', appt.internalNotes]);
      if (appt.patientRating) notesBody.push(['Rating', `${appt.patientRating} / 5 Stars`]);
      if (appt.patientReview) notesBody.push([apptTerms.feedbackTitle, appt.patientReview]);

      if (notesBody.length > 0) {
        autoTable(doc, {
          startY: finalY + 4,
          theme: 'grid',
          headStyles: { fillColor: [240, 243, 255], textColor: [0, 63, 177] },
          body: notesBody,
          columnStyles: {
            0: { fontStyle: 'bold', cellWidth: 60 }
          }
        });
      }
    }

    doc.save(`Appointment-${appt.id}-Details.pdf`);
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
        const appDate = new Date(app.appointmentDate);
        if (isNaN(appDate.getTime())) return true;
        const nowMs = new Date().getTime();
        const appMs = appDate.getTime();
        
        // Days difference: positive if in the past, negative if in future
        const pastDays = (nowMs - appMs) / (1000 * 3600 * 24);
        const futureDays = (appMs - nowMs) / (1000 * 3600 * 24);

        if (statusFilter === 'upcoming') {
          if (timeFilter === '7-days' && (futureDays > 7 || futureDays < -1)) return false;
          if (timeFilter === '1-month' && (futureDays > 30 || futureDays < -1)) return false;
          if (timeFilter === '3-months' && (futureDays > 90 || futureDays < -1)) return false;
          if (timeFilter === '6-months' && (futureDays > 180 || futureDays < -1)) return false;
        } else if (statusFilter === 'completed' || statusFilter === 'cancelled') {
          if (timeFilter === '7-days' && (pastDays > 7 || pastDays < -1)) return false;
          if (timeFilter === '1-month' && (pastDays > 30 || pastDays < -1)) return false;
          if (timeFilter === '3-months' && (pastDays > 90 || pastDays < -1)) return false;
          if (timeFilter === '6-months' && (pastDays > 180 || pastDays < -1)) return false;
        } else {
          const absDiff = Math.abs(pastDays);
          if (timeFilter === '7-days' && absDiff > 7) return false;
          if (timeFilter === '1-month' && absDiff > 30) return false;
          if (timeFilter === '3-months' && absDiff > 90) return false;
          if (timeFilter === '6-months' && absDiff > 180) return false;
        }
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
                        <option value="lifetime">All Time</option>
                        <option value="7-days">Past 7 Days</option>
                        <option value="1-month">Past 30 Days (1 Month)</option>
                        <option value="3-months">Past 3 Months</option>
                        <option value="6-months">Past 6 Months</option>
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
                          <div className="flex flex-wrap items-center gap-2">
                            {getStatusBadge(app.appointmentStatus)}
                            {app.organizationName && (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-50 text-purple-700 border border-purple-200">
                                {app.organizationLogo ? (
                                  <img src={app.organizationLogo} alt="" className="w-3.5 h-3.5 rounded-full object-cover" />
                                ) : (
                                  <span className="material-symbols-outlined text-[13px]">apartment</span>
                                )}
                                {app.organizationName}
                              </span>
                            )}
                          </div>
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
                        {(app.videoCallEnabled || app.appointmentType === 'VIRTUAL') && app.appointmentStatus !== 'COMPLETED' && app.appointmentStatus !== 'CANCELLED' && (
                          <button
                            onClick={() => setActiveVideoAppt(app)}
                            className="px-6 py-3 bg-[#1a56db] text-white rounded-xl text-[14px] font-bold hover:bg-[#123e9e] flex items-center gap-2 shadow-sm transition-all active:scale-95"
                          >
                             <span className="material-symbols-outlined text-[18px] animate-pulse">video_camera_front</span> Join Video Call
                          </button>
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

      {/* Appointment Detail Modal */}
      {detailModalApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0f172a]/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl w-full max-w-3xl shadow-2xl overflow-hidden flex flex-col animate-[fadeIn_0.3s_ease-out]">
            {/* Modal Header */}
            <div className="px-6 py-4 bg-gradient-to-r from-[#1a56db] to-[#003fb1] flex justify-between items-center text-white">
              <div>
                <h2 className="text-xl font-bold">Appointment Details</h2>
                <p className="text-xs text-white/80">Ref ID: #{detailModalApp.id}</p>
              </div>
              <div className="flex gap-3 items-center">
                <button 
                  onClick={() => downloadPDF(detailModalApp)} 
                  className="bg-white/20 hover:bg-white/30 px-3 py-1.5 rounded-lg flex items-center gap-2 transition text-sm font-bold shadow-sm"
                >
                  <span className="material-symbols-outlined text-[18px]">download</span>
                  Download PDF
                </button>
                <button 
                  onClick={() => setDetailModalApp(null)} 
                  className="text-white/70 hover:text-white transition p-1"
                >
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>
            </div>
            
            <div className="p-8 flex flex-col gap-6 overflow-y-auto max-h-[80vh]">
              {/* Organization & Provider Profile Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Organization Profile Card */}
                <div className="bg-[#f8fafc] border border-[#e2e8f0] p-4 rounded-xl flex items-center gap-4">
                  <img 
                    src={detailModalApp.organizationLogo || `https://ui-avatars.com/api/?name=${encodeURIComponent(detailModalApp.organizationName || 'Organization')}&background=ede9fe&color=7c3aed&size=128&rounded=true&font-size=0.4`} 
                    alt={`${detailModalApp.organizationName || 'Organization'} Logo`} 
                    className="w-16 h-16 rounded-2xl shadow-sm border-2 border-white object-cover bg-white flex-shrink-0"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(detailModalApp.organizationName || 'Organization')}&background=ede9fe&color=7c3aed&size=128&rounded=true&font-size=0.4`;
                    }}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-[#64748b] uppercase tracking-wider mb-1">
                      <span className="material-symbols-outlined text-[16px] text-primary">apartment</span>
                      {modalTerms.facilityLabel} Profile
                    </div>
                    <p className="text-md font-bold text-[#1e293b] truncate">{detailModalApp.organizationName || 'Main Facility'}</p>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200">
                        {detailModalApp.organizationType || 'Organization'}
                      </span>
                    </div>
                    {detailModalApp.organizationAddress && (
                      <p className="text-xs text-[#64748b] flex items-center gap-1 mt-1 truncate">
                        <span className="material-symbols-outlined text-[14px] text-gray-400">location_on</span>
                        {detailModalApp.organizationAddress}
                      </p>
                    )}
                    {detailModalApp.organizationPhone && (
                      <p className="text-xs text-[#64748b] flex items-center gap-1 mt-0.5">
                        <span className="material-symbols-outlined text-[14px] text-gray-400">call</span>
                        {detailModalApp.organizationPhone}
                      </p>
                    )}
                  </div>
                </div>

                {/* Provider Profile Card */}
                <div className="bg-[#f8fafc] border border-[#e2e8f0] p-4 rounded-xl flex items-center gap-4">
                  <img 
                    src={detailModalApp.doctorProfilePicture || `https://ui-avatars.com/api/?name=${encodeURIComponent(detailModalApp.doctorName || 'Provider')}&background=e2e8f8&color=1a56db&size=128&rounded=true&font-size=0.4`} 
                    alt={`${modalTerms.providerSingular} Profile`} 
                    className="w-16 h-16 rounded-full shadow-sm border-2 border-white object-cover bg-slate-100 flex-shrink-0"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(detailModalApp.doctorName || 'Provider')}&background=e2e8f8&color=1a56db&size=128&rounded=true&font-size=0.4`;
                    }}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-[#64748b] uppercase tracking-wider mb-1">
                      <span className="material-symbols-outlined text-[16px] text-primary">{modalTerms.providersNavIcon}</span>
                      {modalTerms.providerSingular} Profile
                    </div>
                    <p className="text-md font-bold text-[#1e293b] truncate">{detailModalApp.doctorName || 'Assigned Staff'}</p>
                    <p className="text-xs text-[#64748b] truncate">{detailModalApp.doctorSpecialty || detailModalApp.serviceName || modalTerms.facilityLabel}</p>
                    <div className="mt-1 flex items-center gap-2">
                      <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-50 text-[#003fb1] font-semibold border border-blue-200">
                        {detailModalApp.appointmentType === 'VIRTUAL' ? 'Virtual (Online)' : modalTerms.inFacility}
                      </span>
                      {getStatusBadge(detailModalApp.appointmentStatus)}
                    </div>
                  </div>
                </div>
              </div>

              {/* Service, Date & Time, Format Details */}
              <div className="bg-[#f8fafc] border border-[#e2e8f0] p-4 rounded-xl space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="text-xs text-gray-500 font-semibold block uppercase tracking-wide">{modalTerms.serviceSingular}</span>
                    <span className="font-bold text-[#151c27] text-base">{detailModalApp.serviceName || 'General Service'}</span>
                  </div>
                  <div>
                    <span className="text-xs text-gray-500 font-semibold block uppercase tracking-wide">Date &amp; Time</span>
                    <span className="font-bold text-[#151c27] text-base">
                      {new Date(detailModalApp.appointmentDate).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })} at {detailModalApp.appointmentTime ? detailModalApp.appointmentTime.substring(0, 5) : 'N/A'}
                    </span>
                  </div>
                  <div>
                    <span className="text-xs text-gray-500 font-semibold block uppercase tracking-wide">Fee / Price</span>
                    <span className="font-bold text-[#151c27] text-base">
                      {detailModalApp.price != null ? `NRs. ${Number(detailModalApp.price).toFixed(2)}` : 'N/A'}
                    </span>
                  </div>
                </div>

                {detailModalApp.reasonForVisit && (
                  <div className="pt-3 border-t border-slate-200">
                    <span className="text-xs text-gray-500 font-semibold block uppercase tracking-wide mb-1">{modalTerms.reasonForVisitLabel}</span>
                    <p className="text-xs text-slate-700 bg-white p-3 rounded-lg border border-slate-200">
                      {detailModalApp.reasonForVisit}
                    </p>
                  </div>
                )}

                {(detailModalApp.videoCallEnabled || detailModalApp.appointmentType === 'VIRTUAL') && detailModalApp.appointmentStatus !== 'COMPLETED' && detailModalApp.appointmentStatus !== 'CANCELLED' && (
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <span className="material-symbols-outlined text-blue-600 text-[24px]">videocam</span>
                      <div>
                        <span className="text-xs font-bold text-blue-950 block">Virtual {modalTerms.appointmentSingular} Ready</span>
                        <span className="text-[11px] text-blue-700">{modalTerms.providerSingular} has enabled live video room for this {modalTerms.appointmentSingular.toLowerCase()}</span>
                      </div>
                    </div>
                    <button 
                      onClick={() => {
                        setDetailModalApp(null);
                        setActiveVideoAppt(detailModalApp);
                      }}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition flex items-center gap-1.5 shadow-sm"
                    >
                      <span className="material-symbols-outlined text-[16px] animate-pulse">video_camera_front</span>
                      Join Virtual {modalTerms.appointmentSingular}
                    </button>
                  </div>
                )}
              </div>

              {/* Timestamp Timeline Section */}
              <div>
                <h3 className="text-lg font-bold text-[#0f172a] mb-4 flex items-center gap-2 border-b border-[#cbd5e1] pb-2">
                  <span className="material-symbols-outlined text-[#1a56db]">timeline</span> Lifecycle Timestamps
                </h3>
                <div className="relative border-l-2 border-[#cbd5e1] ml-3 mt-4 space-y-6">
                  {[
                    { 
                      label: `Booked by ${detailModalApp.patientName || detailModalApp.bookedByName || 'User'} (${formatRole(
                        detailModalApp.bookedByRole && detailModalApp.bookedByRole !== 'admin' && detailModalApp.bookedByRole !== 'service_provider' && detailModalApp.bookedByRole !== 'provider'
                          ? detailModalApp.bookedByRole 
                          : modalTerms.customerSingular.toLowerCase(), 
                        modalTerms
                      )})`, 
                      time: detailModalApp.bookedAt, 
                      icon: 'edit_calendar', 
                      color: 'bg-blue-100 text-blue-600', 
                      dot: 'bg-blue-600' 
                    },
                    { 
                      label: detailModalApp.approvedByName 
                        ? `Approved by ${detailModalApp.approvedByName} (${formatRole(detailModalApp.approvedByRole, modalTerms)})` 
                        : 'Approved', 
                      time: detailModalApp.approvedAt, 
                      icon: 'verified', 
                      color: 'bg-purple-100 text-purple-600', 
                      dot: 'bg-purple-600' 
                    },
                    { 
                      label: detailModalApp.checkedInByName 
                        ? `Checked In by ${detailModalApp.checkedInByName} (${formatRole(detailModalApp.checkedInByRole, modalTerms)})` 
                        : 'Checked In', 
                      time: detailModalApp.checkedInAt, 
                      icon: 'how_to_reg', 
                      color: 'bg-emerald-100 text-emerald-600', 
                      dot: 'bg-emerald-600' 
                    },
                    { 
                      label: detailModalApp.completedByName 
                        ? `Completed by ${detailModalApp.completedByName} (${formatRole(detailModalApp.completedByRole, modalTerms)})` 
                        : 'Completed', 
                      time: detailModalApp.completedAt, 
                      icon: 'task_alt', 
                      color: 'bg-green-100 text-green-600', 
                      dot: 'bg-green-600' 
                    },
                    { 
                      label: detailModalApp.cancelledByName 
                        ? `Cancelled by ${detailModalApp.cancelledByName} (${formatRole(detailModalApp.cancelledByRole, modalTerms)})` 
                        : 'Cancelled', 
                      time: detailModalApp.cancelledAt, 
                      icon: 'cancel', 
                      color: 'bg-red-100 text-red-600', 
                      dot: 'bg-red-600' 
                    }
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

                {(detailModalApp.approvedByName || detailModalApp.checkedInByName || detailModalApp.completedByName || detailModalApp.cancelledByName) && (
                  <div className="mt-6 p-4 rounded-xl border bg-slate-50 border-slate-200 space-y-2">
                    <h4 className="text-xs font-bold text-[#64748b] uppercase tracking-wider mb-2 flex items-center gap-2">
                      <span className="material-symbols-outlined text-[18px] text-primary">badge</span> Staff Attribution &amp; Audit
                    </h4>
                    {detailModalApp.approvedByName && (
                      <p className="text-sm text-slate-700">
                        <span className="font-semibold text-purple-700">Approved By:</span> {detailModalApp.approvedByName} 
                        <span className="ml-2 text-xs px-2 py-0.5 rounded-full bg-purple-100 text-purple-800 font-bold">
                          {formatRole(detailModalApp.approvedByRole, modalTerms)}
                        </span>
                      </p>
                    )}
                    {detailModalApp.checkedInByName && (
                      <p className="text-sm text-slate-700">
                        <span className="font-semibold text-emerald-700">Checked In By:</span> {detailModalApp.checkedInByName} 
                        <span className="ml-2 text-xs px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold">
                          {formatRole(detailModalApp.checkedInByRole, modalTerms)}
                        </span>
                      </p>
                    )}
                    {detailModalApp.completedByName && (
                      <p className="text-sm text-slate-700">
                        <span className="font-semibold text-green-700">Completed By:</span> {detailModalApp.completedByName} 
                        <span className="ml-2 text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-800 font-bold">
                          {formatRole(detailModalApp.completedByRole, modalTerms)}
                        </span>
                      </p>
                    )}
                    {detailModalApp.cancelledByName && (
                      <p className="text-sm text-slate-700">
                        <span className="font-semibold text-red-700">Cancelled By:</span> {detailModalApp.cancelledByName} 
                        <span className="ml-2 text-xs px-2 py-0.5 rounded-full bg-red-100 text-red-800 font-bold">
                          {formatRole(detailModalApp.cancelledByRole, modalTerms)}
                        </span>
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* Session / Class Summary & Notes & Feedback */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-sm font-bold text-[#151c27] mb-2 flex items-center gap-2">
                    <span className="material-symbols-outlined text-[#1a56db]">notes</span> {modalTerms.summaryLabel}
                  </h4>
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                    <p className="text-xs font-semibold text-slate-500">{modalTerms.summaryLabel}:</p>
                    <p className="text-sm text-slate-800">{detailModalApp.treatmentSummary || 'None provided yet'}</p>
                    {detailModalApp.internalNotes && (
                      <>
                        <p className="text-xs font-semibold text-slate-500 pt-2 border-t border-slate-200">Notes / Instructions:</p>
                        <p className="text-sm text-slate-800">{detailModalApp.internalNotes}</p>
                      </>
                    )}
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-bold text-[#151c27] mb-2 flex items-center gap-2">
                    <span className="material-symbols-outlined text-[#f59e0b]">star</span> {modalTerms.feedbackTitle}
                  </h4>
                  <div className="p-3 bg-amber-50/50 border border-amber-200/60 rounded-xl space-y-2">
                    {detailModalApp.patientRating ? (
                      <div>
                        <div className="flex items-center gap-1 text-amber-500 mb-1">
                          {[1, 2, 3, 4, 5].map((s) => (
                            <span 
                              key={s} 
                              className="material-symbols-outlined text-[20px]"
                              style={{ fontVariationSettings: s <= detailModalApp.patientRating ? "'FILL' 1" : "'FILL' 0" }}
                            >
                              star
                            </span>
                          ))}
                          <span className="text-xs font-bold text-amber-800 ml-2">({detailModalApp.patientRating} / 5)</span>
                        </div>
                        <p className="text-xs text-slate-700 italic">"{detailModalApp.patientReview || 'No written review'}"</p>
                      </div>
                    ) : (
                      <div className="py-2 text-center space-y-2">
                        <p className="text-xs text-slate-600">No feedback submitted yet.</p>
                        {detailModalApp.appointmentStatus === 'COMPLETED' && (
                          <button
                            onClick={() => {
                              navigate(`/patient/feedback?appt_id=${detailModalApp.id}&token=${detailModalApp.feedbackToken || ''}`);
                            }}
                            className="px-4 py-1.5 bg-[#003fb1] hover:bg-[#002f87] text-white rounded-lg text-xs font-bold transition shadow-sm inline-flex items-center gap-1.5"
                          >
                            <span className="material-symbols-outlined text-[16px]">rate_review</span> Give Feedback
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-slate-100 flex justify-end gap-3 bg-slate-50">
              <button
                onClick={() => downloadPDF(detailModalApp)}
                className="px-4 py-2 text-[#003fb1] hover:bg-[#003fb1]/10 rounded-xl text-sm font-semibold flex items-center gap-1.5 transition-colors"
              >
                <span className="material-symbols-outlined text-lg">download</span>
                Download PDF
              </button>
              <button
                onClick={() => setDetailModalApp(null)}
                className="px-6 py-2 bg-[#003fb1] text-white rounded-xl text-sm font-semibold hover:bg-[#002f87] transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Video Consultation Modal */}
      <VideoConsultationModal
        isOpen={!!activeVideoAppt}
        onClose={() => setActiveVideoAppt(null)}
        appointment={activeVideoAppt}
        isProvider={false}
      />

      {/* Dynamic & Functional User Footer */}
      <UserFooter />
    </div>
  );
};

export default MyHistoryPage;
