import React, { useEffect, useState, useMemo, useCallback } from 'react';
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
  
  // Modals
  const [detailModalApp, setDetailModalApp] = useState<any | null>(null);
  const [lifecycleEvents, setLifecycleEvents] = useState<any[]>([]);
  const [loadingEvents, setLoadingEvents] = useState<boolean>(false);
  const [activeVideoAppt, setActiveVideoAppt] = useState<any | null>(null);

  // Cancellation Modal State
  const [cancelModalApp, setCancelModalApp] = useState<any | null>(null);
  const [cancelPreview, setCancelPreview] = useState<any | null>(null);
  const [loadingPreview, setLoadingPreview] = useState<boolean>(false);
  const [cancelReason, setCancelReason] = useState<string>('Schedule Conflict');
  const [cancelCustomReason, setCancelCustomReason] = useState<string>('');
  const [isCancelling, setIsCancelling] = useState<boolean>(false);
  const [cancelFeedback, setCancelFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Reschedule Modal State
  const [rescheduleModalApp, setRescheduleModalApp] = useState<any | null>(null);
  const [rescheduleDate, setRescheduleDate] = useState<string>('');
  const [availableSlots, setAvailableSlots] = useState<any[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<any | null>(null);
  const [loadingSlots, setLoadingSlots] = useState<boolean>(false);
  const [rescheduleReason, setRescheduleReason] = useState<string>('');
  const [isRescheduling, setIsRescheduling] = useState<boolean>(false);
  const [rescheduleFeedback, setRescheduleFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const modalTerms = useMemo(() => getOrganizationTerms(detailModalApp?.organizationType || cancelModalApp?.organizationType || rescheduleModalApp?.organizationType || terms.orgType), [detailModalApp, cancelModalApp, rescheduleModalApp, terms]);

  // Guaranteed lifecycle events with client-side synthesis fallback for historical milestones
  const displayedEvents = useMemo(() => {
    if (lifecycleEvents && lifecycleEvents.length > 0) {
      return lifecycleEvents;
    }
    if (!detailModalApp) return [];
    const synthesized: any[] = [];
    if (detailModalApp.bookedAt || detailModalApp.createdAt) {
      synthesized.push({
        id: 'synth-booked',
        eventType: 'BOOKED',
        createdAt: detailModalApp.bookedAt || detailModalApp.createdAt,
        actorName: detailModalApp.bookedByName || detailModalApp.patientName,
        actorRole: detailModalApp.bookedByRole || 'PATIENT',
        reason: `Appointment booked and payment verified (${detailModalApp.paymentMethod || 'ONLINE'})`
      });
    }
    if (detailModalApp.approvedAt) {
      synthesized.push({
        id: 'synth-approved',
        eventType: 'CONFIRMED',
        createdAt: detailModalApp.approvedAt,
        actorName: detailModalApp.approvedByName || 'Service Provider',
        actorRole: detailModalApp.approvedByRole || 'PROVIDER',
        reason: 'Appointment approved and confirmed by service provider'
      });
    }
    if (detailModalApp.checkedInAt) {
      synthesized.push({
        id: 'synth-checkin',
        eventType: 'CHECKED_IN',
        createdAt: detailModalApp.checkedInAt,
        actorName: detailModalApp.checkedInByName || 'Staff',
        actorRole: detailModalApp.checkedInByRole || 'STAFF',
        reason: 'Client arrived and checked in'
      });
    }
    if (detailModalApp.completedAt) {
      synthesized.push({
        id: 'synth-completed',
        eventType: 'COMPLETED',
        createdAt: detailModalApp.completedAt,
        actorName: detailModalApp.completedByName || 'Staff',
        actorRole: detailModalApp.completedByRole || 'PROVIDER',
        reason: 'Appointment service completed successfully'
      });
    }
    if (detailModalApp.cancelledAt) {
      synthesized.push({
        id: 'synth-cancelled',
        eventType: 'CANCELLED',
        createdAt: detailModalApp.cancelledAt,
        actorName: detailModalApp.cancelledByName || 'Staff',
        actorRole: detailModalApp.cancelledByRole || 'STAFF',
        reason: detailModalApp.cancellationReason || 'Appointment cancelled'
      });
    }
    if (detailModalApp.noShowAt || detailModalApp.appointmentStatus === 'NO_SHOW') {
      synthesized.push({
        id: 'synth-noshow',
        eventType: 'NO_SHOW',
        createdAt: detailModalApp.noShowAt || detailModalApp.updatedAt || new Date().toISOString(),
        actorName: detailModalApp.noShowMarkedByName || 'System',
        actorRole: detailModalApp.noShowMarkedByRole || 'SYSTEM',
        reason: 'Appointment missed past grace period'
      });
    }
    return synthesized.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  }, [lifecycleEvents, detailModalApp]);

  const fetchAppointments = useCallback(() => {
    const token = localStorage.getItem('token');
    if (!token) return;
    setLoading(true);
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
        
        // Deep linked with ?view=ID
        const viewId = searchParams.get('view');
        if (viewId) {
          const matched = appts.find((a: any) => String(a.id) === String(viewId));
          if (matched) {
            handleViewDetail(matched);
          }
        }

        // Deep linked with ?joinVideo=ID
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
  }, [searchParams]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');
    
    if (!token || role !== 'user') {
      navigate('/login');
      return;
    } 

    const storedName = localStorage.getItem('name');
    if (storedName) {
      setFullName(storedName);
    }

    fetchAppointments();
  }, [navigate, fetchAppointments]);

  // Load Lifecycle Events when detail modal opens
  const handleViewDetail = (app: any) => {
    setDetailModalApp(app);
    setLoadingEvents(true);
    const token = localStorage.getItem('token');
    fetch(`http://localhost:8080/api/v1/user/appointments/${app.id}/lifecycle-events`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    .then(res => res.json())
    .then(data => {
      if (data.success) {
        setLifecycleEvents(data.events || []);
      }
      setLoadingEvents(false);
    })
    .catch(err => {
      console.error('Error fetching lifecycle events', err);
      setLoadingEvents(false);
    });
  };

  // Open Cancellation Modal & fetch live preview
  const handleOpenCancelModal = (app: any) => {
    setCancelModalApp(app);
    setCancelReason('Schedule Conflict');
    setCancelCustomReason('');
    setCancelFeedback(null);
    setLoadingPreview(true);
    const token = localStorage.getItem('token');

    fetch(`http://localhost:8080/api/v1/user/appointments/${app.id}/cancel-preview`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    .then(res => res.json())
    .then(data => {
      if (data.success) {
        setCancelPreview(data.preview);
      }
      setLoadingPreview(false);
    })
    .catch(err => {
      console.error('Error fetching cancel preview', err);
      setLoadingPreview(false);
    });
  };

  // Submit Cancellation
  const handleConfirmCancellation = () => {
    if (!cancelModalApp) return;
    const finalReason = cancelReason === 'Other' ? cancelCustomReason.trim() : cancelReason;
    if (!finalReason) {
      setCancelFeedback({ type: 'error', message: 'Please specify a reason for cancellation.' });
      return;
    }

    setIsCancelling(true);
    setCancelFeedback(null);
    const token = localStorage.getItem('token');

    fetch(`http://localhost:8080/api/v1/user/appointments/${cancelModalApp.id}/cancel`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ reason: finalReason })
    })
    .then(res => res.json())
    .then(data => {
      setIsCancelling(false);
      if (data.success) {
        setCancelFeedback({ 
          type: 'success', 
          message: data.message + (data.refundStatus && data.refundStatus !== 'NOT_ELIGIBLE' ? ` Refund Status: ${data.refundStatus} (${data.refundCurrency} ${data.refundAmount})` : '')
        });
        fetchAppointments();
        setTimeout(() => {
          setCancelModalApp(null);
        }, 1500);
      } else {
        setCancelFeedback({ type: 'error', message: data.message || 'Failed to cancel appointment.' });
      }
    })
    .catch(err => {
      setIsCancelling(false);
      setCancelFeedback({ type: 'error', message: err.message || 'Error occurred during cancellation.' });
    });
  };

  // Helper for local YYYY-MM-DD formatted date (timezone-safe)
  const getTodayDateString = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Open Reschedule Modal
  const handleOpenRescheduleModal = (app: any) => {
    setRescheduleModalApp(app);
    const todayStr = getTodayDateString();
    setRescheduleDate(todayStr);
    setSelectedSlot(null);
    setRescheduleReason('');
    setRescheduleFeedback(null);
    loadAvailableSlots(app, todayStr);
  };

  const loadAvailableSlots = (app: any, dateStr: string) => {
    if (!app || !dateStr) return;
    setLoadingSlots(true);
    const providerId = app.providerId || (app.doctor ? app.doctor.id : null) || app.provider?.id;
    if (!providerId) {
      console.warn('Cannot load slots: providerId missing on appointment', app);
      setLoadingSlots(false);
      setAvailableSlots([]);
      return;
    }

    const token = localStorage.getItem('token');
    fetch(`http://localhost:8080/api/v1/public/booking/providers/${providerId}/slots?date=${dateStr}&serviceName=${encodeURIComponent(app.serviceName || '')}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    .then(res => res.json())
    .then(data => {
      if (data.success) {
        setAvailableSlots(data.slots || []);
      } else {
        setAvailableSlots([]);
      }
      setLoadingSlots(false);
    })
    .catch(err => {
      console.error('Error fetching slots', err);
      setAvailableSlots([]);
      setLoadingSlots(false);
    });
  };

  // Submit Reschedule
  const handleConfirmReschedule = () => {
    if (!rescheduleModalApp || !selectedSlot || !rescheduleDate) {
      setRescheduleFeedback({ type: 'error', message: 'Please select a new date and open time slot.' });
      return;
    }

    setIsRescheduling(true);
    setRescheduleFeedback(null);
    const token = localStorage.getItem('token');

    fetch(`http://localhost:8080/api/v1/user/appointments/${rescheduleModalApp.id}/reschedule`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        newDate: rescheduleDate,
        newTime: selectedSlot.slotTime24,
        reason: rescheduleReason || 'User requested reschedule'
      })
    })
    .then(res => res.json())
    .then(data => {
      setIsRescheduling(false);
      if (data.success) {
        setRescheduleFeedback({ type: 'success', message: 'Appointment rescheduled successfully to ' + data.newDate + ' at ' + data.newTime + '.' });
        fetchAppointments();
        setTimeout(() => {
          setRescheduleModalApp(null);
        }, 1500);
      } else {
        setRescheduleFeedback({ type: 'error', message: data.message || 'Failed to reschedule appointment.' });
      }
    })
    .catch(err => {
      setIsRescheduling(false);
      setRescheduleFeedback({ type: 'error', message: err.message || 'Error occurred during reschedule.' });
    });
  };

  const handleBookAgain = () => {
    navigate('/book-appointment');
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
        ['Price', appt.price ? `रू ${Number(appt.price).toFixed(2)}` : 'N/A']
      ],
      columnStyles: {
        0: { fontStyle: 'bold', cellWidth: 60 }
      }
    });

    let finalY = (doc as any).lastAutoTable.finalY + 10;
    doc.setFontSize(14);
    doc.setTextColor(0, 0, 0);
    doc.text('Lifecycle Timestamps & Audits', 14, finalY);

    const formatDate = (dateStr: string) => {
      if (!dateStr) return 'N/A';
      return new Date(dateStr).toLocaleString();
    };

    const lifecycleBody = [
      ['Booked', `${formatDate(appt.bookedAt)} ${appt.patientName || appt.bookedByName ? `(${appt.patientName || appt.bookedByName})` : ''}`],
      ['Approved', `${formatDate(appt.approvedAt)} ${appt.approvedByName ? `(${appt.approvedByName})` : ''}`],
      ['Rescheduled', appt.rescheduledAt ? `${formatDate(appt.rescheduledAt)} (Count: ${appt.rescheduleCount})` : 'Never'],
      ['Checked In', `${formatDate(appt.checkedInAt)} ${appt.checkedInByName ? `(${appt.checkedInByName})` : ''}`],
      ['Completed', `${formatDate(appt.completedAt)} ${appt.completedByName ? `(${appt.completedByName})` : ''}`],
      ['Cancelled', appt.cancelledAt ? `${formatDate(appt.cancelledAt)} - Reason: ${appt.cancellationReason || 'User requested'}` : 'No']
    ];

    if (appt.refundStatus) {
      lifecycleBody.push(['Refund Status', `${appt.refundStatus} (${appt.refundCurrency || 'NPR'} ${appt.refundAmount || 0})`]);
    }

    autoTable(doc, {
      startY: finalY + 4,
      theme: 'grid',
      headStyles: { fillColor: [240, 243, 255], textColor: [0, 63, 177] },
      body: lifecycleBody,
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
      } else if (statusFilter === 'no_show') {
        if (app.appointmentStatus !== 'NO_SHOW') return false;
      }

      // Filter by Time
      if (timeFilter !== 'lifetime') {
        const appDate = new Date(app.appointmentDate);
        if (isNaN(appDate.getTime())) return true;
        const nowMs = new Date().getTime();
        const appMs = appDate.getTime();
        
        const pastDays = (nowMs - appMs) / (1000 * 3600 * 24);
        if (timeFilter === '7-days' && (pastDays > 7 || pastDays < 0)) return false;
        if (timeFilter === '1-month' && (pastDays > 30 || pastDays < 0)) return false;
        if (timeFilter === '3-months' && (pastDays > 90 || pastDays < 0)) return false;
        if (timeFilter === '6-months' && (pastDays > 180 || pastDays < 0)) return false;
      }

      return true;
    });
  }, [appointments, statusFilter, timeFilter]);

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
      case 'NO_SHOW':
        return 'bg-purple-50 border border-purple-100 text-purple-800';
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
      case 'NO_SHOW':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[12px] font-bold bg-purple-100 text-purple-800 border border-purple-200">
            <span className="w-1.5 h-1.5 rounded-full bg-purple-600"></span>
            No-Show
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
      <UserTopNavigation />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 md:px-10 py-6 sm:py-8 pt-24 sm:pt-28">
        {/* Header Title & Dropdown Filter */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
            <div>
                <h1 className="text-2xl sm:text-[32px] font-bold text-[#151c27] tracking-tight">Appointment History &amp; Lifecycle</h1>
                <p className="text-[#434654] text-sm sm:text-[16px] mt-1 opacity-70">
                  Manage your upcoming bookings, reschedule sessions, or cancel with transparent refund protection.
                </p>
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
                        <option value="no_show">No-Show</option>
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
          <div className="text-center py-20 bg-white rounded-2xl border border-[#e2e8f0] p-8 shadow-sm">
            <span className="material-symbols-outlined text-gray-400 text-5xl mb-3">calendar_month</span>
            <p className="text-[#53606c] text-[18px] font-semibold">No appointments found for the selected filters.</p>
            <p className="text-sm text-gray-400 mt-1">Book a new appointment to see your scheduled sessions here.</p>
            <button
              onClick={handleBookAgain}
              className="mt-4 px-6 py-2.5 bg-primary text-white rounded-xl font-bold shadow-md hover:brightness-105"
            >
              Book New Appointment
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {groupedAppointments.map((group) => (
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
                  const opacityClass = app.appointmentStatus === 'CANCELLED' ? 'opacity-85' : '';
                  const isUpcoming = ['SCHEDULED', 'PENDING_APPROVAL', 'CHECKED_IN'].includes(app.appointmentStatus);

                  return (
                    <div
                      key={app.id}
                      className={`bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-all flex flex-col md:flex-row md:items-center justify-between gap-6 border border-[#e2e8f0] ${opacityClass}`}
                    >
                      <div className="flex items-start gap-6">
                        {/* Date Cube */}
                        <div className={`flex flex-col items-center justify-center rounded-xl p-4 min-w-[85px] ${colorClasses}`}>
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
                            {app.rescheduleCount > 0 && (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
                                <span className="material-symbols-outlined text-[13px]">history</span>
                                Rescheduled {app.rescheduleCount}x
                              </span>
                            )}
                            {app.appointmentStatus === 'CANCELLED' && app.refundStatus && (
                              <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold border ${
                                app.refundStatus === 'REFUNDED' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                                app.refundStatus === 'PARTIALLY_REFUNDED' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                                app.refundStatus === 'PROCESSING' || app.refundStatus === 'REFUND_REQUESTED' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                                'bg-slate-50 text-slate-600 border-slate-200'
                              }`}>
                                <span className="material-symbols-outlined text-[13px]">payments</span>
                                {app.refundStatus === 'REFUNDED' ? `100% Refunded (${app.refundCurrency || 'NPR'} ${app.refundAmount})` :
                                 app.refundStatus === 'PARTIALLY_REFUNDED' ? `${app.refundEligibilityPercentage}% Refunded (${app.refundCurrency || 'NPR'} ${app.refundAmount})` :
                                 app.refundStatus === 'NOT_ELIGIBLE' ? 'Non-refundable (0%)' :
                                 app.refundStatus}
                              </span>
                            )}
                            {app.appointmentStatus === 'NO_SHOW' && (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-50 text-purple-700 border border-purple-200">
                                <span className="material-symbols-outlined text-[13px]">person_off</span>
                                {app.refundEligibilityPercentage && app.refundEligibilityPercentage > 0
                                  ? `No-Show (${app.refundEligibilityPercentage}% Refunded)`
                                  : 'No-Show • 0% Non-refundable'}
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
                      <div className="flex flex-wrap md:flex-nowrap items-center gap-3">
                        {(app.appointmentStatus === 'COMPLETED' || isUpcoming) && (
                          <a 
                            className="text-[#003fb1] text-[13px] font-semibold hover:underline flex items-center gap-1.5 cursor-pointer mr-1"
                            onClick={(e) => handleDownloadReceipt(e, app)}
                          >
                            <span className="material-symbols-outlined text-[17px]">download</span> Receipt
                          </a>
                        )}
                        {(app.videoCallEnabled || app.appointmentType === 'VIRTUAL') && app.appointmentStatus !== 'COMPLETED' && app.appointmentStatus !== 'CANCELLED' && app.appointmentStatus !== 'NO_SHOW' && (
                          <button
                            onClick={() => setActiveVideoAppt(app)}
                            className="px-4 py-2.5 bg-[#1a56db] text-white rounded-xl text-[13px] font-bold hover:bg-[#123e9e] flex items-center gap-1.5 shadow-sm transition-all active:scale-95 cursor-pointer"
                          >
                             <span className="material-symbols-outlined text-[17px] animate-pulse">video_camera_front</span> Join Call
                          </button>
                        )}
                        <button
                          onClick={() => handleViewDetail(app)}
                          className="px-4 py-2.5 bg-[#f0f3ff] text-[#003fb1] rounded-xl text-[13px] font-bold hover:bg-[#e0e8ff] transition-colors border border-[#d6e4f3] cursor-pointer">
                          View Detail
                        </button>
                        
                        {/* Dynamic Reschedule & Cancel Buttons */}
                        {isUpcoming && (
                          <>
                            <button
                              onClick={() => handleOpenRescheduleModal(app)}
                              className="px-4 py-2.5 bg-white border border-[#003fb1] text-[#003fb1] rounded-xl text-[13px] font-bold hover:bg-blue-50 transition-all active:scale-95 shadow-sm flex items-center gap-1 cursor-pointer">
                              <span className="material-symbols-outlined text-[17px]">event_repeat</span> Reschedule
                            </button>
                            <button
                              onClick={() => handleOpenCancelModal(app)}
                              className="px-4 py-2.5 bg-rose-50 text-rose-700 border border-rose-200 rounded-xl text-[13px] font-bold hover:bg-rose-100 transition-all active:scale-95 shadow-sm flex items-center gap-1 cursor-pointer">
                              <span className="material-symbols-outlined text-[17px]">cancel</span> Cancel
                            </button>
                          </>
                        )}

                        {!isUpcoming && (
                          <button
                            onClick={handleBookAgain}
                            className="px-5 py-2.5 bg-[#003fb1] text-white rounded-xl text-[13px] font-bold hover:bg-[#002f87] shadow-md transition-all active:scale-95 cursor-pointer">
                            Book Again
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </React.Fragment>
            ))}
          </div>
        )}

      </main>

      {/* CANCELLATION MODAL */}
      {cancelModalApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0f172a]/50 backdrop-blur-sm p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl w-full max-w-xl max-h-[90vh] sm:max-h-[88vh] shadow-2xl overflow-hidden flex flex-col my-auto border border-slate-200/60 animate-[fadeIn_0.25s_ease-out]">
            {/* Modal Header */}
            <div className="shrink-0 px-6 py-3.5 sm:py-4 bg-gradient-to-r from-rose-600 to-red-700 flex justify-between items-center text-white">
              <div className="flex items-center gap-2.5">
                <span className="material-symbols-outlined text-[24px]">event_busy</span>
                <div>
                  <h2 className="text-lg font-bold">Cancel {modalTerms.appointmentSingular}</h2>
                  <p className="text-xs text-rose-100">Ref ID: #{cancelModalApp.id}</p>
                </div>
              </div>
              <button 
                onClick={() => setCancelModalApp(null)} 
                className="text-white/80 hover:text-white transition p-1 cursor-pointer"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4 sm:space-y-5 custom-scrollbar">
              {loadingPreview ? (
                <div className="flex flex-col items-center justify-center py-10 space-y-2">
                  <div className="w-8 h-8 border-3 border-rose-600 border-t-transparent rounded-full animate-spin"></div>
                  <p className="text-xs text-slate-500 font-semibold">Calculating refund policy eligibility...</p>
                </div>
              ) : (
                <>
                  {cancelFeedback && (
                    <div className={`p-4 rounded-xl text-sm font-semibold flex items-center gap-2 ${
                      cancelFeedback.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-rose-50 text-rose-800 border border-rose-200'
                    }`}>
                      <span className="material-symbols-outlined text-[20px]">
                        {cancelFeedback.type === 'success' ? 'check_circle' : 'error'}
                      </span>
                      <span>{cancelFeedback.message}</span>
                    </div>
                  )}

                  {/* Policy Transparency Matrix */}
                  <div className="rounded-xl border border-slate-200 overflow-hidden text-xs">
                    <div className="bg-slate-100 px-4 py-2.5 font-bold uppercase tracking-wider text-slate-700 flex items-center justify-between border-b border-slate-200">
                      <span>Organization Cancellation &amp; Refund Policy</span>
                      <span className="text-[11px] font-normal text-slate-500">{cancelModalApp.organizationName}</span>
                    </div>
                    <table className="w-full text-left">
                      <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 font-semibold">
                        <tr>
                          <th className="py-2 px-4">Cancellation Timing</th>
                          <th className="py-2 px-4 text-right">Refund Eligibility</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        <tr className={cancelPreview?.tier === 'FULL_REFUND' ? 'bg-emerald-50 font-bold text-emerald-900' : ''}>
                          <td className="py-2.5 px-4">24+ hours before appointment</td>
                          <td className="py-2.5 px-4 text-right font-black text-emerald-600">100% (Full Refund)</td>
                        </tr>
                        <tr className={cancelPreview?.tier === 'PARTIAL_REFUND' ? 'bg-blue-50 font-bold text-blue-900' : ''}>
                          <td className="py-2.5 px-4">6–24 hours before appointment</td>
                          <td className="py-2.5 px-4 text-right font-black text-blue-600">50% (Partial Refund)</td>
                        </tr>
                        <tr className={cancelPreview?.tier === 'LATE_CANCELLATION' ? 'bg-amber-50 font-bold text-amber-900' : ''}>
                          <td className="py-2.5 px-4">Less than 6 hours before</td>
                          <td className="py-2.5 px-4 text-right font-black text-amber-600">0% (Late Window)</td>
                        </tr>
                        <tr className={cancelPreview?.tier === 'NO_SHOW_OR_PAST' ? 'bg-slate-100 font-bold text-slate-900' : ''}>
                          <td className="py-2.5 px-4">No-show / Past Appointment</td>
                          <td className="py-2.5 px-4 text-right font-black text-slate-500">0%</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  {/* Live Calculation Callout Card */}
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Live Refund Calculation</span>
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-black ${
                        cancelPreview?.refundEligibilityPercentage === 100 ? 'bg-emerald-100 text-emerald-800' :
                        cancelPreview?.refundEligibilityPercentage === 50 ? 'bg-blue-100 text-blue-800' :
                        'bg-amber-100 text-amber-800'
                      }`}>
                        {cancelPreview?.refundEligibilityPercentage}% Refund Eligible
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div className="bg-white p-3 rounded-lg border border-slate-200">
                        <span className="text-xs text-slate-500 block">Time to Appointment</span>
                        <span className="font-bold text-slate-800 text-base">{cancelPreview?.hoursUntilAppointment ?? 'N/A'} Hours</span>
                      </div>
                      <div className="bg-white p-3 rounded-lg border border-slate-200">
                        <span className="text-xs text-slate-500 block">Estimated Refund</span>
                        <span className="font-black text-slate-900 text-base">
                          {cancelPreview?.refundCurrency} {cancelPreview?.estimatedRefundAmount}
                        </span>
                      </div>
                    </div>

                    {cancelPreview?.paymentMethod === 'STRIPE' && (
                      <p className="text-[11px] text-slate-500 flex items-center gap-1.5 pt-1">
                        <span className="material-symbols-outlined text-[15px] text-indigo-600">credit_card</span>
                        Paid via Stripe USD. Refund will be credited in original USD payment currency without foreign exchange drift.
                      </p>
                    )}

                    <div className="p-3 bg-blue-50/70 border border-blue-100 rounded-lg text-xs text-blue-900 flex items-start gap-2">
                      <span className="material-symbols-outlined text-[16px] text-blue-600 mt-0.5 flex-shrink-0">info</span>
                      <span>
                        <strong>Capacity Notice:</strong> Confirming cancellation immediately releases your reserved slot back into the scheduling pool for other {terms.customerPlural.toLowerCase()} to book.
                      </span>
                    </div>
                  </div>

                  {/* Reason Selection */}
                  <div className="space-y-2">
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                      Reason for Cancellation <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={cancelReason}
                      onChange={(e) => setCancelReason(e.target.value)}
                      className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-rose-500/20"
                    >
                      <option value="Schedule Conflict">Schedule Conflict</option>
                      <option value="Personal Emergency">Personal Emergency</option>
                      <option value="Feeling Better / No Longer Needed">Feeling Better / No Longer Needed</option>
                      <option value="Booked by Mistake">Booked by Mistake</option>
                      <option value="Other">Other (Please specify)</option>
                    </select>

                    {cancelReason === 'Other' && (
                      <textarea
                        rows={3}
                        value={cancelCustomReason}
                        onChange={(e) => setCancelCustomReason(e.target.value)}
                        placeholder="Please describe why you are cancelling..."
                        className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20"
                      />
                    )}
                  </div>
                </>
              )}
            </div>

            <div className="shrink-0 px-6 py-3 sm:py-3.5 border-t border-slate-100 flex justify-end gap-3 bg-slate-50">
              <button
                onClick={() => setCancelModalApp(null)}
                disabled={isCancelling}
                className="px-5 py-2.5 text-slate-700 hover:bg-slate-200 rounded-xl text-sm font-semibold transition-colors cursor-pointer"
              >
                Keep {modalTerms.appointmentSingular}
              </button>
              <button
                onClick={handleConfirmCancellation}
                disabled={isCancelling || loadingPreview || cancelPreview?.canCancel === false}
                className="px-6 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-sm font-bold shadow-md transition-all active:scale-95 disabled:opacity-50 flex items-center gap-2 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">check</span>
                {isCancelling ? 'Cancelling...' : 'Confirm Cancellation'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* RESCHEDULE MODAL */}
      {rescheduleModalApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0f172a]/50 backdrop-blur-sm p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] sm:max-h-[88vh] shadow-2xl overflow-hidden flex flex-col my-auto border border-slate-200/60 animate-[fadeIn_0.25s_ease-out]">
            {/* Modal Header */}
            <div className="shrink-0 px-6 py-3.5 sm:py-4 bg-gradient-to-r from-blue-700 to-indigo-800 flex justify-between items-center text-white">
              <div className="flex items-center gap-2.5">
                <span className="material-symbols-outlined text-[24px]">event_repeat</span>
                <div>
                  <h2 className="text-lg font-bold">Reschedule {modalTerms.appointmentSingular}</h2>
                  <p className="text-xs text-blue-100">Ref ID: #{rescheduleModalApp.id}</p>
                </div>
              </div>
              <button 
                onClick={() => setRescheduleModalApp(null)} 
                className="text-white/80 hover:text-white transition p-1 cursor-pointer"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4 sm:space-y-5 custom-scrollbar">
              {rescheduleFeedback && (
                <div className={`p-4 rounded-xl text-sm font-semibold flex items-center gap-2 ${
                  rescheduleFeedback.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-rose-50 text-rose-800 border border-rose-200'
                }`}>
                  <span className="material-symbols-outlined text-[20px]">
                    {rescheduleFeedback.type === 'success' ? 'check_circle' : 'error'}
                  </span>
                  <span>{rescheduleFeedback.message}</span>
                </div>
              )}

              {/* Allowance Badge */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-blue-50 border border-blue-100 text-xs">
                <div className="flex items-center gap-2 text-blue-900">
                  <span className="material-symbols-outlined text-blue-600 text-[18px]">verified</span>
                  <span>Reschedule Allowance: <strong>{rescheduleModalApp.rescheduleCount || 0}</strong> of <strong>{rescheduleModalApp.tenantPolicy?.maxReschedules || 2}</strong> used</span>
                </div>
                <span className="text-[11px] font-semibold text-blue-700">Notice required: {rescheduleModalApp.tenantPolicy?.reschedulingDeadlineHours || 6}h in advance</span>
              </div>

              {/* Side-by-Side Current vs New Slot */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">Current Appointment</span>
                  <p className="text-sm font-bold text-slate-800">{rescheduleModalApp.appointmentDate} at {rescheduleModalApp.appointmentTime?.substring(0, 5)}</p>
                  <p className="text-xs text-slate-600 mt-1">{rescheduleModalApp.serviceName} • {rescheduleModalApp.doctorName}</p>
                </div>

                <div className="bg-blue-50/60 p-4 rounded-xl border border-blue-200">
                  <span className="text-xs font-bold text-blue-700 uppercase tracking-wider block mb-1">New Target Appointment</span>
                  <p className="text-sm font-black text-blue-900">
                    {rescheduleDate ? rescheduleDate : 'Select Date'} {selectedSlot ? `at ${selectedSlot.time}` : '(Pick open slot below)'}
                  </p>
                  <p className="text-xs text-blue-700 mt-1">{rescheduleModalApp.serviceName} • {rescheduleModalApp.doctorName}</p>
                </div>
              </div>

              {/* Date Picker */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                    Select New Date
                  </label>
                  <span className="text-[11px] text-slate-500 font-medium">Past dates disabled</span>
                </div>
                <input
                  type="date"
                  value={rescheduleDate}
                  min={getTodayDateString()}
                  onChange={(e) => {
                    const chosen = e.target.value;
                    const today = getTodayDateString();
                    if (chosen && chosen < today) {
                      setRescheduleDate(today);
                      setSelectedSlot(null);
                      loadAvailableSlots(rescheduleModalApp, today);
                      return;
                    }
                    setRescheduleDate(chosen);
                    setSelectedSlot(null);
                    if (chosen) {
                      loadAvailableSlots(rescheduleModalApp, chosen);
                    }
                  }}
                  className="w-full px-4 py-3 bg-white border border-slate-300 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              {/* Slots Grid */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                    Available Time Slots for {rescheduleDate}
                  </label>
                  {loadingSlots && <span className="text-xs text-blue-600 font-semibold animate-pulse">Fetching real-time slots...</span>}
                </div>

                {loadingSlots ? (
                  <div className="flex justify-center py-8">
                    <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                  </div>
                ) : availableSlots.length === 0 ? (
                  <div className="text-center py-6 bg-slate-50 border border-slate-200 rounded-xl">
                    <p className="text-xs text-slate-500 font-semibold">No available slots for this date. Please select another date.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 max-h-48 overflow-y-auto p-1">
                    {availableSlots.map((slot: any) => {
                      const isSelected = selectedSlot?.id === slot.id;
                      const isUnavailable = slot.isFull || slot.isPast || slot.isBreak;

                      return (
                        <button
                          key={slot.id}
                          type="button"
                          disabled={isUnavailable}
                          onClick={() => setSelectedSlot(slot)}
                          className={`p-3 rounded-xl text-xs font-bold transition-all text-center flex flex-col items-center justify-center border cursor-pointer ${
                            isUnavailable
                              ? 'bg-slate-100 text-slate-400 border-slate-200 opacity-60 cursor-not-allowed'
                              : isSelected
                              ? 'bg-[#003fb1] text-white border-[#003fb1] shadow-md scale-102 ring-2 ring-blue-300'
                              : 'bg-white hover:bg-blue-50 text-slate-800 border-slate-300'
                          }`}
                        >
                          <span className="text-sm">{slot.time}</span>
                          <span className="text-[10px] mt-0.5 opacity-80">
                            {isUnavailable ? (slot.isPast ? 'Past' : slot.isBreak ? 'Break' : 'Full') : `${slot.availableSeats ?? 1} left`}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Optional Reason */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                  Rescheduling Reason (Optional)
                </label>
                <input
                  type="text"
                  value={rescheduleReason}
                  onChange={(e) => setRescheduleReason(e.target.value)}
                  placeholder="e.g., Work meeting moved, prefer morning slot..."
                  className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
            </div>

            <div className="shrink-0 px-6 py-3 sm:py-3.5 border-t border-slate-100 flex justify-end gap-3 bg-slate-50">
              <button
                onClick={() => setRescheduleModalApp(null)}
                disabled={isRescheduling}
                className="px-5 py-2.5 text-slate-700 hover:bg-slate-200 rounded-xl text-sm font-semibold transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmReschedule}
                disabled={isRescheduling || !selectedSlot}
                className="px-6 py-2.5 bg-[#003fb1] hover:bg-[#002f87] text-white rounded-xl text-sm font-bold shadow-md transition-all active:scale-95 disabled:opacity-50 flex items-center gap-2 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">event_repeat</span>
                {isRescheduling ? 'Rescheduling...' : 'Confirm Reschedule'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* APPOINTMENT DETAIL & LIFECYCLE AUDIT MODAL */}
      {detailModalApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0f172a]/50 backdrop-blur-sm p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl w-full max-w-3xl max-h-[90vh] sm:max-h-[88vh] shadow-2xl overflow-hidden flex flex-col my-auto border border-slate-200/60 animate-[fadeIn_0.3s_ease-out]">
            {/* Modal Header */}
            <div className="shrink-0 px-6 py-3.5 sm:py-4 bg-gradient-to-r from-[#1a56db] to-[#003fb1] flex justify-between items-center text-white">
              <div>
                <h2 className="text-lg sm:text-xl font-bold">Appointment &amp; Lifecycle Details</h2>
                <p className="text-xs text-white/80">Ref ID: #{detailModalApp.id}</p>
              </div>
              <div className="flex gap-2.5 items-center">
                <button 
                  onClick={() => downloadPDF(detailModalApp)} 
                  className="bg-white/20 hover:bg-white/30 px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition text-xs sm:text-sm font-bold shadow-sm cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[17px]">download</span>
                  Download PDF
                </button>
                <button 
                  onClick={() => setDetailModalApp(null)} 
                  className="text-white/70 hover:text-white transition p-1 cursor-pointer"
                  aria-label="Close"
                >
                  <span className="material-symbols-outlined text-[20px]">close</span>
                </button>
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto p-5 sm:p-7 flex flex-col gap-5 custom-scrollbar">
              {/* Organization & Provider Profile Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Organization Profile Card */}
                <div className="bg-[#f8fafc] border border-[#e2e8f0] p-4 rounded-xl flex items-center gap-4">
                  <img 
                    src={detailModalApp.organizationLogo || `https://ui-avatars.com/api/?name=${encodeURIComponent(detailModalApp.organizationName || 'Organization')}&background=ede9fe&color=7c3aed&size=128&rounded=true&font-size=0.4`} 
                    alt={`${detailModalApp.organizationName || 'Organization'} Logo`} 
                    className="w-16 h-16 rounded-2xl shadow-sm border-2 border-white object-cover bg-white flex-shrink-0"
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
                  </div>
                </div>

                {/* Provider Profile Card */}
                <div className="bg-[#f8fafc] border border-[#e2e8f0] p-4 rounded-xl flex items-center gap-4">
                  <img 
                    src={detailModalApp.doctorProfilePicture || `https://ui-avatars.com/api/?name=${encodeURIComponent(detailModalApp.doctorName || 'Provider')}&background=e2e8f8&color=1a56db&size=128&rounded=true&font-size=0.4`} 
                    alt={`${modalTerms.providerSingular} Profile`} 
                    className="w-16 h-16 rounded-full shadow-sm border-2 border-white object-cover bg-slate-100 flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-[#64748b] uppercase tracking-wider mb-1">
                      <span className="material-symbols-outlined text-[16px] text-primary">{modalTerms.providersNavIcon}</span>
                      {modalTerms.providerSingular} Profile
                    </div>
                    <p className="text-md font-bold text-[#1e293b] truncate">{detailModalApp.doctorName || 'Assigned Staff'}</p>
                    <p className="text-xs text-[#64748b] truncate">{detailModalApp.doctorSpecialty || detailModalApp.serviceName}</p>
                    <div className="mt-1 flex items-center gap-2">
                      <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-50 text-[#003fb1] font-semibold border border-blue-200">
                        {detailModalApp.appointmentType === 'VIRTUAL' ? 'Virtual (Online)' : modalTerms.inFacility}
                      </span>
                      {getStatusBadge(detailModalApp.appointmentStatus)}
                    </div>
                  </div>
                </div>
              </div>

              {/* Financial & Refund Audit Breakdown */}
              <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white p-5 rounded-2xl shadow-sm border border-slate-700 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-700 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-emerald-400">receipt_long</span>
                    <span className="text-sm font-bold tracking-tight">Payment &amp; Refund Audit</span>
                  </div>
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                    detailModalApp.paymentStatus === 'SUCCESS' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                  }`}>
                    Payment: {detailModalApp.paymentStatus || 'PENDING'}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                  <div>
                    <span className="text-slate-400 block mb-0.5">Gateway Method</span>
                    <span className="font-bold text-white uppercase">{detailModalApp.paymentMethod || 'CASH / ONSITE'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block mb-0.5">Original Price</span>
                    <span className="font-bold text-white">रू {detailModalApp.originalNprAmount || detailModalApp.price || 0} NPR</span>
                  </div>
                  {detailModalApp.paymentMethod === 'STRIPE' ? (
                    <div>
                      <span className="text-slate-400 block mb-0.5">USD Converted</span>
                      <span className="font-bold text-emerald-400">${detailModalApp.chargedAmount || 0} USD</span>
                      <span className="text-[10px] text-slate-400 block mt-0.5">@ {detailModalApp.exchangeRate} NPR/$</span>
                    </div>
                  ) : (
                    <div>
                      <span className="text-slate-400 block mb-0.5">Amount Paid</span>
                      <span className="font-bold text-white">रू {detailModalApp.price || 0} NPR</span>
                    </div>
                  )}
                  <div>
                    <span className="text-slate-400 block mb-0.5">Transaction ID</span>
                    <span className="font-mono text-[11px] text-blue-300 truncate block">{detailModalApp.transactionId || 'N/A'}</span>
                  </div>
                </div>

                {/* No-Show / Settlement Banner */}
                {detailModalApp.appointmentStatus === 'NO_SHOW' && (
                  <div className="p-3.5 bg-purple-950/70 rounded-xl border border-purple-500/40 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-purple-400 text-[20px]">person_off</span>
                      <div>
                        <span className="font-bold text-purple-200 block">Classified as No-Show</span>
                        <span className="text-slate-300">
                          {detailModalApp.settlementStatus === 'ADJUSTED_REFUND' 
                            ? `Partially Refunded (${detailModalApp.refundEligibilityPercentage}% • ${detailModalApp.refundCurrency} ${detailModalApp.refundAmount})` 
                            : `0% Non-refundable (Capacity reserved by ${modalTerms.facilityLabel})`}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-[11px] text-purple-300 block">Provider Settlement</span>
                      <span className="font-bold text-white text-sm">
                        रू {detailModalApp.settlementAmount != null ? detailModalApp.settlementAmount : detailModalApp.price} NPR
                      </span>
                    </div>
                  </div>
                )}

                {/* Refund Status Row if Cancelled */}
                {detailModalApp.refundStatus && detailModalApp.appointmentStatus !== 'NO_SHOW' && (
                  <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-amber-400 text-[18px]">currency_exchange</span>
                      <span>
                        Refund Status: <strong className="text-amber-300">{detailModalApp.refundStatus}</strong> 
                        ({detailModalApp.refundEligibilityPercentage}% • {detailModalApp.refundCurrency} {detailModalApp.refundAmount})
                      </span>
                    </div>
                    {detailModalApp.refundTransactionId && (
                      <span className="font-mono text-[11px] text-slate-400">
                        Ref: {detailModalApp.refundTransactionId}
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Interactive Lifecycle Timeline */}
              <div>
                <h3 className="text-lg font-bold text-[#0f172a] mb-4 flex items-center gap-2 border-b border-[#cbd5e1] pb-2">
                  <span className="material-symbols-outlined text-[#1a56db]">timeline</span> Full Lifecycle Audit History
                </h3>

                {loadingEvents ? (
                  <div className="flex justify-center py-6">
                    <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                  </div>
                ) : (
                  <div className="relative border-l-2 border-[#cbd5e1] ml-3 mt-4 space-y-6">
                    {displayedEvents.length > 0 ? (
                      displayedEvents.map((ev, i) => {
                        let icon = 'flag';
                        let color = 'bg-blue-100 text-blue-700';
                        let dot = 'bg-blue-600';

                        if (ev.eventType === 'BOOKED') {
                          icon = 'edit_calendar';
                          color = 'bg-blue-100 text-blue-700';
                          dot = 'bg-blue-600';
                        } else if (ev.eventType === 'CONFIRMED' || ev.eventType === 'APPROVED') {
                          icon = 'verified';
                          color = 'bg-purple-100 text-purple-700';
                          dot = 'bg-purple-600';
                        } else if (ev.eventType === 'RESCHEDULED') {
                          icon = 'event_repeat';
                          color = 'bg-indigo-100 text-indigo-700';
                          dot = 'bg-indigo-600';
                        } else if (ev.eventType === 'CHECKED_IN') {
                          icon = 'how_to_reg';
                          color = 'bg-emerald-100 text-emerald-700';
                          dot = 'bg-emerald-600';
                        } else if (ev.eventType === 'COMPLETED') {
                          icon = 'task_alt';
                          color = 'bg-green-100 text-green-700';
                          dot = 'bg-green-600';
                        } else if (ev.eventType === 'CANCELLED') {
                          icon = 'cancel';
                          color = 'bg-red-100 text-red-700';
                          dot = 'bg-red-600';
                        } else if (ev.eventType === 'NO_SHOW') {
                          icon = 'person_off';
                          color = 'bg-purple-100 text-purple-800';
                          dot = 'bg-purple-600';
                        } else if (ev.eventType.startsWith('REFUND')) {
                          icon = 'payments';
                          color = 'bg-amber-100 text-amber-700';
                          dot = 'bg-amber-600';
                        }

                        let metadataObj: any = null;
                        if (ev.metadataJson) {
                          try {
                            metadataObj = JSON.parse(ev.metadataJson);
                          } catch (e) {}
                        }

                        return (
                          <div key={ev.id || i} className="relative pl-6">
                            <div className={`absolute w-3 h-3 ${dot} rounded-full -left-[7px] top-1.5 shadow-sm border-2 border-white`}></div>
                            <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold ${color} mb-1`}>
                              <span className="material-symbols-outlined text-[14px]">{icon}</span> {ev.eventType}
                            </div>
                            <p className="text-sm font-semibold text-[#334155]">
                              {new Date(ev.createdAt).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })}
                              {ev.actorName && <span className="text-xs text-slate-500 ml-2 font-normal">by {ev.actorName} ({formatRole(ev.actorRole, modalTerms)})</span>}
                            </p>
                            {ev.reason && (
                              <p className="text-xs text-slate-600 mt-1 italic">Reason: "{ev.reason}"</p>
                            )}
                            {metadataObj && metadataObj.settlementStatus != null && (
                              <div className="text-xs text-purple-800 mt-1 bg-purple-50 p-2 rounded-lg border border-purple-200">
                                <span>Settlement: <strong>{metadataObj.settlementStatus}</strong> • Facility Payout: <strong>{metadataObj.refundCurrency || 'NPR'} {metadataObj.settlementAmount != null ? metadataObj.settlementAmount : detailModalApp.price}</strong></span>
                              </div>
                            )}
                            {metadataObj && metadataObj.oldDate && (
                              <div className="text-xs text-slate-600 mt-1 bg-slate-50 p-2 rounded-lg border border-slate-200">
                                <span>Moved from <strong className="line-through text-slate-400">{metadataObj.oldDate} {metadataObj.oldTime}</strong> to <strong className="text-blue-700">{metadataObj.newDate} {metadataObj.newTime}</strong></span>
                              </div>
                            )}
                            {metadataObj && metadataObj.refundAmount != null && (
                              <div className="text-xs text-slate-600 mt-1 bg-amber-50/70 p-2 rounded-lg border border-amber-200">
                                <span>Refund: <strong>{metadataObj.refundCurrency} {metadataObj.refundAmount}</strong> ({metadataObj.refundEligibilityPercentage}%) • Status: {metadataObj.refundStatus}</span>
                              </div>
                            )}
                          </div>
                        );
                      })
                    ) : (
                      <p className="text-xs text-slate-500 pl-6">No historical lifecycle events recorded.</p>
                    )}
                  </div>
                )}
              </div>

              {/* Session Summary & Review Section */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-200">
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
                            className="px-4 py-1.5 bg-[#003fb1] hover:bg-[#002f87] text-white rounded-lg text-xs font-bold transition shadow-sm inline-flex items-center gap-1.5 cursor-pointer"
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

            <div className="shrink-0 px-6 py-3 sm:py-3.5 border-t border-slate-100 flex justify-end bg-slate-50">
              <button
                onClick={() => setDetailModalApp(null)}
                className="px-6 py-2 bg-[#003fb1] text-white rounded-xl text-sm font-semibold hover:bg-[#002f87] transition-colors cursor-pointer shadow-sm"
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
