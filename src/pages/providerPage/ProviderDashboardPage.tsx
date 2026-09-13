import React, { useEffect } from 'react';
import { useNavigate, NavLink } from 'react-router-dom';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import ProviderTopNavigation from './components/ProviderTopNavigation';
import ProviderSidebar from './components/ProviderSidebar';
import QRScannerComponent from './components/QRScannerComponent';
import NewAppointmentModal from '../adminPage/components/NewAppointmentModal';
import { applyTheme } from '../../utils/themeUtils';
import { useOrganizationTerms, setAndBroadcastOrgType, getOrganizationTerms, formatRole } from '../../utils/organizationTerms';
import axios from 'axios';
import VideoConsultationModal from '../../components/VideoConsultationModal';

class ScannerErrorBoundary extends React.Component<
  { onClose: () => void; children: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: { onClose: () => void; children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  componentDidCatch(error: any) {
    console.error('Scanner error boundary caught:', error);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full text-center shadow-2xl">
            <span className="material-symbols-outlined text-[40px] text-rose-500 mb-2">error</span>
            <h3 className="font-bold text-slate-800 text-lg mb-1">Scanner Error</h3>
            <p className="text-slate-500 text-sm mb-4">An error occurred while loading the scanner. Please try again.</p>
            <button
              onClick={this.props.onClose}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-sm cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

const ProviderDashboardPage: React.FC = () => {
  const terms = useOrganizationTerms();
  const navigate = useNavigate();
  const [showScanner, setShowScanner] = React.useState(false);
  const [notification, setNotification] = React.useState<{message: string, type: 'success' | 'error'} | null>(null);
  const [appointments, setAppointments] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [selectedDate, setSelectedDate] = React.useState<Date>(new Date());
  const [orgName, setOrgName] = React.useState<string>(() => localStorage.getItem('organizationName') || '');
  const [currentRoleName, setCurrentRoleName] = React.useState<string | null>(() => localStorage.getItem('tenantRoleName'));
  const [rawPermissions, setRawPermissions] = React.useState<string | null>(() => localStorage.getItem('permissionsJson'));
  const [isNewBookingModalOpen, setIsNewBookingModalOpen] = React.useState(false);

  const permissions = React.useMemo(() => {
    const isCustomRole = !!currentRoleName;
    const defaults = {
      calendar: { read: true, write: true },
      patients: { read: !isCustomRole, write: !isCustomRole },
      services: { read: !isCustomRole, write: !isCustomRole },
      analytics: { read: !isCustomRole, write: !isCustomRole }
    };
    if (!rawPermissions) return defaults;
    try {
      const parsed = JSON.parse(rawPermissions);
      return {
        calendar: { read: parsed.calendar?.read === true, write: parsed.calendar?.write === true },
        patients: { read: parsed.patients?.read === true, write: parsed.patients?.write === true },
        services: { read: parsed.services?.read === true, write: parsed.services?.write === true },
        analytics: { read: parsed.analytics?.read === true, write: parsed.analytics?.write === true }
      };
    } catch (e) {
      return defaults;
    }
  }, [rawPermissions, currentRoleName]);

  // Theme, branding & role permissions sync on mount
  useEffect(() => {
    const cachedColor = localStorage.getItem('primaryAccentColor');
    if (cachedColor) {
      applyTheme(cachedColor);
    }

    const token = localStorage.getItem('token');
    if (token) {
      fetch('http://localhost:8080/api/v1/tenant/me', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      .then(res => res.json())
      .then(tenant => {
        if (tenant?.primaryAccentColor) {
          applyTheme(tenant.primaryAccentColor);
          localStorage.setItem('primaryAccentColor', tenant.primaryAccentColor);
        }
        if (tenant?.organizationName) {
          setOrgName(tenant.organizationName);
          localStorage.setItem('organizationName', tenant.organizationName);
        }
        if (tenant?.organizationType) {
          setAndBroadcastOrgType(tenant.organizationType);
        }
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
      .catch(err => console.debug("Provider tenant branding sync:", err));
    }
  }, []);

  // View Details Modal State
  const [isDetailsModalOpen, setIsDetailsModalOpen] = React.useState(false);
  const [selectedAppointment, setSelectedAppointment] = React.useState<any | null>(null);
  const modalTerms = React.useMemo(() => getOrganizationTerms(selectedAppointment?.organizationType || terms.orgType), [selectedAppointment, terms]);
  
  // Video Consultation State
  const [activeVideoAppt, setActiveVideoAppt] = React.useState<any | null>(null);

  const handleToggleVideo = async (appointmentId: number, currentEnabled: boolean) => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.put(
        `http://localhost:8080/api/v1/provider/appointments/${appointmentId}/toggle-video`,
        { enabled: !currentEnabled },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.data.success) {
        setAppointments((prev: any[]) => prev.map(a => a.id === appointmentId ? {
          ...a,
          videoCallEnabled: res.data.videoCallEnabled,
          meetingLink: res.data.meetingLink,
          appointmentType: res.data.appointmentType,
        } : a));
        if (selectedAppointment && selectedAppointment.id === appointmentId) {
          setSelectedAppointment((prev: any) => ({
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

  // Mark Complete Modal State
  const [isCompleteModalOpen, setIsCompleteModalOpen] = React.useState(false);
  const [completingApptId, setCompletingApptId] = React.useState<number | null>(null);
  const [completeForm, setCompleteForm] = React.useState({
    treatmentSummary: '',
    internalNotes: '',
    followUpMonths: '0'
  });

  const completeConfig = React.useMemo(() => {
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
  const [isCancelModalOpen, setIsCancelModalOpen] = React.useState(false);
  const [cancellingApptId, setCancellingApptId] = React.useState<number | null>(null);

  // Decline / Rejection Modal State
  const [isDeclineModalOpen, setIsDeclineModalOpen] = React.useState(false);
  const [decliningAppt, setDecliningAppt] = React.useState<any | null>(null);
  const [declineReason, setDeclineReason] = React.useState('Schedule conflict / Unavailable');
  const [customDeclineNote, setCustomDeclineNote] = React.useState('');
  const [declineSubmitting, setDeclineSubmitting] = React.useState(false);
  const [services, setServices] = React.useState<any[]>([]);

  // Reschedule Modal State
  const [isRescheduleModalOpen, setIsRescheduleModalOpen] = React.useState(false);
  const [reschedulingAppt, setReschedulingAppt] = React.useState<any | null>(null);
  const [rescheduleForm, setRescheduleForm] = React.useState({ date: '', time: '' });
  const [rescheduleSubmitting, setRescheduleSubmitting] = React.useState(false);

  // Quick Contact State
  const [contactAppt, setContactAppt] = React.useState<any | null>(null);
  const [copiedField, setCopiedField] = React.useState<string | null>(null);

  // Missed Appointments Filter Tab ('yesterday' | 'all')
  const [missedTab, setMissedTab] = React.useState<'yesterday' | 'all'>('yesterday');

  const loadServices = async () => {
    const token = localStorage.getItem('token');
    try {
      const response = await fetch('http://localhost:8080/api/v1/provider/services', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setServices(data.services || []);
      }
    } catch (error) {
      console.debug('Error fetching provider services in dashboard', error);
    }
  };

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

  const loadAppointments = async () => {
    const token = localStorage.getItem('token');
    try {
      const response = await fetch('http://localhost:8080/api/v1/provider/appointments', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        const role = (localStorage.getItem('role') || '').toLowerCase();
        const isAdmin = role === 'admin' || role === 'role_admin' || role === 'super_admin';
        const currentFullName = (localStorage.getItem('fullName') || '').trim().toLowerCase();

        let appts = data.appointments || [];
        if (!isAdmin && currentFullName) {
          appts = appts.filter((a: any) => {
            if (!a.doctorName) return true;
            return a.doctorName.trim().toLowerCase() === currentFullName;
          });
        }
        setAppointments(appts);
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
    const cleanToken = encodeURIComponent(decodedText.trim());
    try {
      const response = await fetch(`http://localhost:8080/api/v1/provider/appointments/checkin/${cleanToken}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        setNotification({ message: `Check-in successful! ${terms.customerSingular} has been marked as arrived.`, type: 'success' });
        setTimeout(() => setNotification(null), 5000);
        loadAppointments();
      } else {
        const errorData = await response.json().catch(() => null);
        setNotification({ 
          message: errorData?.message || 'Failed to check-in. Invalid QR code or appointment not found.', 
          type: 'error' 
        });
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
    const role = (localStorage.getItem('role') || '').toLowerCase();

    // Redirect if no token or role is not a provider
    const isProvider = role === 'service_provider' || role === 'provider' || role === 'role_provider';
    if (!token || !isProvider) {
      navigate('/login');
      return;
    }

    loadAppointments();
    loadServices();
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
        setNotification({ message: `${terms.appointmentSingular} marked as completed.`, type: 'success' });
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

  const openDeclineModal = (appt: any) => {
    setDecliningAppt(appt);
    setDeclineReason('Schedule conflict / Unavailable');
    setCustomDeclineNote('');
    setIsDeclineModalOpen(true);
  };

  const confirmDeclineAppointment = async () => {
    if (!decliningAppt) return;
    setDeclineSubmitting(true);
    const token = localStorage.getItem('token');
    const finalReason = declineReason === 'Other (Custom note)' 
      ? (customDeclineNote.trim() || 'Declined by service provider') 
      : (customDeclineNote.trim() ? `${declineReason} - ${customDeclineNote.trim()}` : declineReason);

    try {
      const response = await fetch(`http://localhost:8080/api/v1/provider/appointments/${decliningAppt.id}/decline`, {
        method: 'PUT',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ reason: finalReason })
      });
      const data = await response.json();
      if (response.ok && data.success !== false) {
        setNotification({ 
          message: `${terms.appointmentSingular} request declined. 100% refund initiated to ${terms.customerSingular.toLowerCase()}.`, 
          type: 'success' 
        });
        setAppointments(prev => prev.map(a => a.id === decliningAppt.id ? { 
          ...a, 
          appointmentStatus: 'REJECTED',
          refundStatus: 'REFUNDED',
          refundEligibilityPercentage: 100,
          rejectionReason: finalReason
        } : a));
        setIsDeclineModalOpen(false);
        setDecliningAppt(null);
        setTimeout(() => setNotification(null), 6000);
      } else {
        alert(data.message || 'Failed to decline appointment');
      }
    } catch (e: any) {
      alert('Error declining appointment: ' + (e.message || 'Unknown error'));
    } finally {
      setDeclineSubmitting(false);
    }
  };

  // Compute metrics
  const year = selectedDate.getFullYear();
  const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
  const day = String(selectedDate.getDate()).padStart(2, '0');
  const dateString = `${year}-${month}-${day}`;
  const todayAppointments = appointments.filter(a => a.appointmentDate === dateString && a.appointmentStatus !== 'PENDING_APPROVAL');
  const todayRevenue = todayAppointments.reduce((sum, a) => {
    if (a.appointmentStatus === 'REJECTED') {
      return sum; // Zero revenue / payout for rejected bookings
    }
    if (a.appointmentStatus === 'CANCELLED' || a.appointmentStatus === 'NO_SHOW') {
      return sum + (a.settlementAmount || 0);
    }
    return sum + (a.settlementAmount !== undefined && a.settlementAmount !== null ? a.settlementAmount : (a.price || 0));
  }, 0);
  
  const newRequestsCount = appointments.filter(
    a => a.appointmentStatus === 'PENDING_APPROVAL'
  ).length;

  const pendingAppointments = appointments.filter(a => a.appointmentStatus === 'PENDING_APPROVAL');

  // Dynamic Missed Appointments Detection & Metrics
  const padZero = (n: number) => String(n).padStart(2, '0');
  const now = new Date();
  const todayYMD = `${now.getFullYear()}-${padZero(now.getMonth() + 1)}-${padZero(now.getDate())}`;
  const yesterdayDateObj = new Date(now);
  yesterdayDateObj.setDate(yesterdayDateObj.getDate() - 1);
  const yesterdayYMD = `${yesterdayDateObj.getFullYear()}-${padZero(yesterdayDateObj.getMonth() + 1)}-${padZero(yesterdayDateObj.getDate())}`;
  const currentTimeHHMM = `${padZero(now.getHours())}:${padZero(now.getMinutes())}`;

  // Dynamically identify missed appointments:
  // An appointment is missed if its scheduled date/time has passed without being completed or cancelled/no-show
  const isAppointmentMissed = React.useCallback((a: any) => {
    if (!a.appointmentDate) return false;
    const status = (a.appointmentStatus || '').toUpperCase();
    if (status === 'COMPLETED' || status === 'CANCELLED' || status === 'NO_SHOW') {
      return false;
    }
    if (a.appointmentDate < todayYMD) {
      return true;
    }
    if (a.appointmentDate === todayYMD) {
      const apptTime = (a.appointmentTime || '').substring(0, 5);
      if (apptTime && apptTime < currentTimeHHMM) {
        return true;
      }
    }
    return false;
  }, [todayYMD, currentTimeHHMM]);

  // Yesterday's missed appointments specifically
  const yesterdayMissedList = React.useMemo(() => {
    return appointments.filter(a => {
      if (!a.appointmentDate) return false;
      const status = (a.appointmentStatus || '').toUpperCase();
      if (status === 'COMPLETED' || status === 'CANCELLED' || status === 'NO_SHOW') {
        return false;
      }
      return a.appointmentDate === yesterdayYMD;
    });
  }, [appointments, yesterdayYMD]);

  // All past unhandled missed appointments (including older dates)
  const allPastMissedList = React.useMemo(() => {
    return appointments.filter(isAppointmentMissed);
  }, [appointments, isAppointmentMissed]);

  const activeMissedAppointments = missedTab === 'yesterday' ? yesterdayMissedList : allPastMissedList;

  // Handlers for Missed Appointments Actions
  const openRescheduleModal = (appt: any) => {
    setReschedulingAppt(appt);
    const defaultDate = appt.appointmentDate && appt.appointmentDate >= todayYMD ? appt.appointmentDate : todayYMD;
    const defaultTime = appt.appointmentTime ? appt.appointmentTime.substring(0, 5) : '10:00';
    setRescheduleForm({ date: defaultDate, time: defaultTime });
    setIsRescheduleModalOpen(true);
  };

  const handleRescheduleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reschedulingAppt || !rescheduleForm.date || !rescheduleForm.time) return;

    setRescheduleSubmitting(true);
    const token = localStorage.getItem('token');
    try {
      const response = await fetch(
        `http://localhost:8080/api/v1/provider/appointments/${reschedulingAppt.id}/reschedule?newDate=${rescheduleForm.date}&newTime=${rescheduleForm.time}`,
        {
          method: 'PUT',
          headers: { 'Authorization': `Bearer ${token}` }
        }
      );
      if (response.ok) {
        setNotification({
          message: `${terms.appointmentSingular} rescheduled to ${rescheduleForm.date} at ${rescheduleForm.time}.`,
          type: 'success'
        });
        setTimeout(() => setNotification(null), 5000);
        setIsRescheduleModalOpen(false);
        setReschedulingAppt(null);
        loadAppointments();
      } else {
        const err = await response.json().catch(() => null);
        setNotification({ message: err?.message || 'Failed to reschedule appointment.', type: 'error' });
        setTimeout(() => setNotification(null), 5000);
      }
    } catch (err) {
      setNotification({ message: 'Error communicating with server.', type: 'error' });
      setTimeout(() => setNotification(null), 5000);
    } finally {
      setRescheduleSubmitting(false);
    }
  };

  const handleMarkNoShow = async (apptId: number) => {
    const token = localStorage.getItem('token');
    try {
      const response = await fetch(
        `http://localhost:8080/api/v1/provider/appointments/${apptId}/no-show`,
        {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ internalNotes: 'Marked as No-Show from missed appointments queue' })
        }
      );
      if (response.ok) {
        setNotification({ message: `${terms.appointmentSingular} marked as No-Show.`, type: 'success' });
        setTimeout(() => setNotification(null), 5000);
        loadAppointments();
      } else {
        const err = await response.json().catch(() => null);
        setNotification({ message: err?.message || 'Failed to mark as no-show.', type: 'error' });
        setTimeout(() => setNotification(null), 5000);
      }
    } catch (err) {
      setNotification({ message: 'Error marking appointment as no-show.', type: 'error' });
      setTimeout(() => setNotification(null), 5000);
    }
  };

  const copyToClipboard = (text: string, field: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2500);
  };

  // Dynamic Multi-Tenant Peak Productivity Metric Engine
  const peakProductivity = React.useMemo(() => {
    const timeSlots = [
      { id: 'morning', label: 'Morning', timeDisplay: '08:00 – 11:00 AM', shortCode: '8-11', startHour: 8, endHour: 11 },
      { id: 'midday', label: 'Midday', timeDisplay: '11:00 AM – 02:00 PM', shortCode: '11-2', startHour: 11, endHour: 14 },
      { id: 'afternoon', label: 'Afternoon', timeDisplay: '02:00 – 05:00 PM', shortCode: '2-5', startHour: 14, endHour: 17 },
      { id: 'evening', label: 'Evening', timeDisplay: '05:00 – 08:00 PM', shortCode: '5-8', startHour: 17, endHour: 20 },
    ];

    const slotMetrics = timeSlots.map(slot => {
      const slotAppts = appointments.filter(a => {
        if (!a.appointmentTime) return false;
        const h = parseInt(a.appointmentTime.substring(0, 2), 10);
        return h >= slot.startHour && h < slot.endHour;
      });

      const completed = slotAppts.filter(a => (a.appointmentStatus || '').toUpperCase() === 'COMPLETED').length;
      const active = slotAppts.filter(a => {
        const s = (a.appointmentStatus || '').toUpperCase();
        return s === 'SCHEDULED' || s === 'CHECKED_IN';
      }).length;
      const cancelled = slotAppts.filter(a => {
        const s = (a.appointmentStatus || '').toUpperCase();
        return s === 'CANCELLED' || s === 'NO_SHOW';
      }).length;
      const total = slotAppts.length;

      // Weighted score: completed appointments are the primary indicator of fulfilled productivity
      const score = (completed * 3) + (active * 1.5) + (total * 0.5);

      return {
        ...slot,
        total,
        completed,
        active,
        cancelled,
        score,
        efficiencyRate: total > 0 ? Math.round((completed / Math.max(1, total - cancelled)) * 100) : 0
      };
    });

    const maxScore = Math.max(...slotMetrics.map(s => s.score), 1);
    const maxCompleted = Math.max(...slotMetrics.map(s => s.completed), 0);

    let peakSlot = slotMetrics[0];
    for (const s of slotMetrics) {
      if (s.score > peakSlot.score || (s.score === peakSlot.score && s.completed > peakSlot.completed)) {
        peakSlot = s;
      }
    }

    const totalCompletedAll = appointments.filter(a => (a.appointmentStatus || '').toUpperCase() === 'COMPLETED').length;
    const totalBookedAll = appointments.filter(a => {
      const s = (a.appointmentStatus || '').toUpperCase();
      return s !== 'CANCELLED' && s !== 'NO_SHOW' && s !== 'PENDING_APPROVAL';
    }).length;
    const overallCompletionRate = totalBookedAll > 0 ? Math.round((totalCompletedAll / totalBookedAll) * 100) : (totalCompletedAll > 0 ? 100 : 0);

    return {
      peakSlot,
      slotMetrics,
      maxScore,
      maxCompleted,
      totalCompletedAll,
      overallCompletionRate,
      hasAppointments: appointments.length > 0
    };
  }, [appointments]);

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
    doc.text(`${terms.customerSingular} Information`, 14, 42);
    
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
        notesBody.push([`${terms.customerSingular} Rating`, `${appt.patientRating} / 5 Stars`]);
        notesBody.push([`${terms.customerSingular} Review`, appt.patientReview || 'N/A']);
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
    <div className="tenant-theme bg-[#F3F4F6] text-[#151c27] font-sans min-h-screen flex">
      <ProviderTopNavigation />

      {/* SideNavBar */}
      <ProviderSidebar />

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
            <h1 className="text-[32px] text-primary font-bold tracking-tight">Operations Dashboard</h1>
            <p className="text-[16px] text-on-surface-variant mt-1">{orgName ? `${orgName} Operations Command` : 'Provider Operational Command'}</p>
          </div>
          <div className="flex gap-4">
            {permissions.calendar.write && (
              <button 
                onClick={() => setShowScanner(true)}
                className="bg-white border-2 border-primary text-primary font-bold px-6 py-4 rounded-xl flex items-center gap-2 shadow-sm hover:bg-primary/5 active:scale-95 transition-all">
                <span className="material-symbols-outlined">qr_code_scanner</span>
                <span>Scan to Check-in</span>
              </button>
            )}
            {permissions.calendar.write && (
              <button 
                onClick={() => setIsNewBookingModalOpen(true)}
                className="bg-primary text-on-primary font-bold px-8 py-4 rounded-xl flex items-center gap-2 shadow-lg shadow-primary/20 hover:brightness-110 active:scale-95 transition-all cursor-pointer">
                <span className="material-symbols-outlined">add</span>
                <span>Create New {terms.appointmentSingular}</span>
              </button>
            )}
          </div>
        </section>

        {showScanner && (
          <ScannerErrorBoundary onClose={() => setShowScanner(false)}>
            <QRScannerComponent 
              onScanSuccess={handleScanSuccess}
              onClose={() => setShowScanner(false)}
            />
          </ScannerErrorBoundary>
        )}

        {/* Metrics Grid */}
        <div className={`grid grid-cols-1 ${permissions.analytics.read ? 'md:grid-cols-3' : 'md:grid-cols-2'} gap-6 mb-12`}>
          <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-primary">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-[12px] text-[#53606c] uppercase tracking-wider">Today's Schedule</p>
                <h2 className="text-[48px] font-bold text-primary mt-1 leading-tight">{loading ? '...' : todayAppointments.length}</h2>
                <p className="text-[14px] text-[#434654] mt-1">Slots Booked</p>
              </div>
              <span className="material-symbols-outlined text-primary bg-primary/10 p-4 rounded-xl">event_available</span>
            </div>
          </div>

          {permissions.analytics.read && (
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
          )}

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
                          <span className="material-symbols-outlined text-[18px]">{terms.servicesNavIcon}</span> {appointment.serviceName}
                        </p>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className={`px-4 py-1.5 rounded-full text-[12px] font-bold flex items-center gap-2 ${
                          appointment.appointmentStatus === 'CHECKED_IN' ? 'bg-[#10B981]/10 text-[#10B981]' : 
                          appointment.appointmentStatus === 'COMPLETED' ? 'bg-primary/10 text-primary' : 
                          appointment.appointmentStatus === 'CANCELLED' ? 'bg-[#fee2e2] text-[#ba1a1a]' :
                          (appointment.appointmentStatus === 'REJECTED' || appointment.appointmentStatus === 'DECLINED') ? 'bg-[#fee2e2] text-[#ba1a1a] border border-[#fecaca]' :
                          'bg-[#f0f3ff] text-[#3b4854]'
                        }`}>
                          {appointment.appointmentStatus === 'CHECKED_IN' && (
                            <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse"></span>
                          )}
                          {(appointment.appointmentStatus === 'REJECTED' || appointment.appointmentStatus === 'DECLINED') && (
                            <span className="w-1.5 h-1.5 rounded-full bg-[#ba1a1a]"></span>
                          )}
                          {appointment.appointmentStatus}
                          {appointment.appointmentStatus === 'CANCELLED' && appointment.settlementAmount !== undefined && appointment.settlementAmount !== null && appointment.settlementAmount > 0 && (
                            <span className="text-[10px] font-semibold text-emerald-800 bg-emerald-100 border border-emerald-200 px-1.5 py-0.5 rounded ml-1">
                              Retained: रू {appointment.settlementAmount.toLocaleString()}
                            </span>
                          )}
                        </span>
                        <div className="flex flex-wrap items-center gap-2">
                          {/* Video Consultation Toggle & Launch - only visible if the service has virtual/video enabled */}
                          {permissions.calendar.write && checkServiceAllowsVideo(appointment) && appointment.appointmentStatus !== 'COMPLETED' && appointment.appointmentStatus !== 'CANCELLED' && appointment.appointmentStatus !== 'REJECTED' && appointment.appointmentStatus !== 'DECLINED' && (
                            <button
                              onClick={() => handleToggleVideo(appointment.id, !!(appointment.videoCallEnabled || appointment.appointmentType === 'VIRTUAL'))}
                              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 border ${
                                appointment.videoCallEnabled || appointment.appointmentType === 'VIRTUAL'
                                  ? 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100'
                                  : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'
                              }`}
                              title={appointment.videoCallEnabled || appointment.appointmentType === 'VIRTUAL' ? 'Turn off video call' : 'Turn on video call for this session'}
                            >
                              <span className="material-symbols-outlined text-[16px]">
                                {appointment.videoCallEnabled || appointment.appointmentType === 'VIRTUAL' ? 'videocam' : 'videocam_off'}
                              </span>
                              {appointment.videoCallEnabled || appointment.appointmentType === 'VIRTUAL' ? 'Video ON' : 'Enable Video'}
                            </button>
                          )}

                          {checkServiceAllowsVideo(appointment) && (appointment.videoCallEnabled || appointment.appointmentType === 'VIRTUAL') && appointment.appointmentStatus !== 'COMPLETED' && appointment.appointmentStatus !== 'CANCELLED' && appointment.appointmentStatus !== 'REJECTED' && appointment.appointmentStatus !== 'DECLINED' && (
                            <button
                              onClick={() => setActiveVideoAppt(appointment)}
                              className="bg-blue-600 hover:bg-blue-700 text-white px-3.5 py-1.5 rounded-lg font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all animate-in fade-in"
                            >
                              <span className="material-symbols-outlined text-[16px] animate-pulse">video_camera_front</span>
                              Launch Video Room
                            </button>
                          )}

                          {permissions.calendar.write && (appointment.appointmentStatus === 'CHECKED_IN' || (appointment.appointmentStatus === 'SCHEDULED' && checkServiceAllowsVideo(appointment) && (appointment.appointmentType === 'VIRTUAL' || appointment.videoCallEnabled))) && appointment.appointmentStatus !== 'REJECTED' && appointment.appointmentStatus !== 'DECLINED' && (
                            <button 
                              className="bg-[#006f4b] text-white px-4 py-2 rounded-lg font-bold text-xs hover:bg-[#005438] transition-all"
                              onClick={() => openCompleteModal(appointment.id)}
                            >
                              Mark Complete
                            </button>
                          )}
                          <button 
                            className="border border-primary text-primary px-4 py-2 rounded-lg font-bold text-xs hover:bg-primary/10 transition-all"
                            onClick={() => openDetailsModal(appointment)}
                          >
                            View Details
                          </button>
                          {permissions.calendar.write && appointment.appointmentStatus !== 'CANCELLED' && appointment.appointmentStatus !== 'COMPLETED' && appointment.appointmentStatus !== 'REJECTED' && appointment.appointmentStatus !== 'DECLINED' && (
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
                <button className="text-[12px] font-bold text-primary hover:underline">View All</button>
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
                        <span className="text-[12px] font-bold text-primary">{app.appointmentTime?.substring(0,5) || ''}</span>
                      </div>
                      {permissions.calendar.write ? (
                        <div className="flex gap-2 mt-4">
                          <button 
                            onClick={() => handleApprove(app.id)}
                            className="flex-1 bg-primary text-on-primary py-2 rounded-lg font-bold text-xs hover:brightness-110 active:scale-95 transition-all">Approve</button>
                          <button 
                            onClick={() => openDeclineModal(app)}
                            className="flex-1 border border-rose-300 text-rose-700 py-2 rounded-lg font-bold text-xs hover:bg-rose-50 transition-colors">Decline</button>
                        </div>
                      ) : (
                        <div className="mt-3 text-xs text-amber-700 bg-amber-50 px-3 py-1.5 rounded-lg border border-amber-200 flex items-center gap-1.5">
                          <span className="material-symbols-outlined text-[15px]">lock</span>
                          <span>Read-only: Approval requires write access</span>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Missed/No-Shows Section */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#ba1a1a]">event_busy</span>
                  <h3 className="text-[18px] font-bold text-[#151c27]">Yesterday's Missed</h3>
                </div>
                {allPastMissedList.length > yesterdayMissedList.length && (
                  <div className="flex bg-[#f1f5f9] p-0.5 rounded-lg text-[11px] font-semibold">
                    <button
                      onClick={() => setMissedTab('yesterday')}
                      className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${missedTab === 'yesterday' ? 'bg-white text-[#ba1a1a] shadow-sm font-bold' : 'text-[#64748b] hover:text-[#0f172a]'}`}
                    >
                      Yesterday ({yesterdayMissedList.length})
                    </button>
                    <button
                      onClick={() => setMissedTab('all')}
                      className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${missedTab === 'all' ? 'bg-white text-[#ba1a1a] shadow-sm font-bold' : 'text-[#64748b] hover:text-[#0f172a]'}`}
                    >
                      All Past ({allPastMissedList.length})
                    </button>
                  </div>
                )}
              </div>

              {activeMissedAppointments.length === 0 ? (
                <div className="p-5 bg-emerald-50/70 border border-emerald-200/80 rounded-xl text-center flex flex-col items-center gap-2">
                  <div className="w-9 h-9 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
                    <span className="material-symbols-outlined text-[20px]">check_circle</span>
                  </div>
                  <div>
                    <h5 className="text-[13px] font-bold text-emerald-900">
                      {missedTab === 'yesterday' ? `No Missed ${terms.appointmentPlural} from Yesterday` : `No Missed ${terms.appointmentPlural}`}
                    </h5>
                    <p className="text-[11px] text-emerald-700/80 mt-0.5">
                      All scheduled {terms.appointmentPlural.toLowerCase()} were completed or handled properly.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
                  {activeMissedAppointments.map((app) => {
                    const timeStr = app.appointmentTime ? app.appointmentTime.substring(0, 5) : '';
                    const dateFormatted = app.appointmentDate === yesterdayYMD ? 'Yesterday' : app.appointmentDate;
                    return (
                      <div key={app.id} className="p-3.5 bg-[#ffdad6]/25 border border-[#ba1a1a]/20 rounded-xl flex flex-col gap-2.5 transition-all hover:bg-[#ffdad6]/35">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <h5 className="text-[14px] font-bold text-[#93000a] truncate">{app.patientName || terms.customerSingular}</h5>
                            <p className="text-[12px] text-[#53606c] truncate font-medium">{app.serviceName || terms.serviceSingular}</p>
                            <p className="text-[11px] text-[#ba1a1a] mt-0.5 flex items-center gap-1 font-semibold">
                              <span className="material-symbols-outlined text-[14px]">schedule</span>
                              Missed on {dateFormatted} at {timeStr}
                            </p>
                          </div>
                          {app.price !== undefined && (
                            <span className="text-[12px] font-bold text-[#53606c] shrink-0">
                              रू {Math.round(app.price)}
                            </span>
                          )}
                        </div>

                        {/* Action buttons */}
                        <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-[#ba1a1a]/15">
                          <button
                            onClick={() => openDetailsModal(app)}
                            title="View full details"
                            className="px-2.5 py-1.5 rounded-lg text-[11px] font-bold border border-primary/30 text-primary hover:bg-primary/10 transition-colors flex items-center gap-1 cursor-pointer"
                          >
                            <span className="material-symbols-outlined text-[13px]">visibility</span>
                            Details
                          </button>
                          <button
                            onClick={() => setContactAppt(app)}
                            title={`Contact ${terms.customerSingular}`}
                            className="px-2.5 py-1.5 rounded-lg text-[11px] font-bold border border-[#53606c]/30 text-[#334155] hover:bg-slate-100 transition-colors flex items-center gap-1 cursor-pointer"
                          >
                            <span className="material-symbols-outlined text-[13px]">call</span>
                            Contact
                          </button>
                          {permissions.calendar.write && (
                            <>
                              <button
                                onClick={() => openRescheduleModal(app)}
                                title={`Reschedule ${terms.appointmentSingular}`}
                                className="px-2.5 py-1.5 rounded-lg text-[11px] font-bold bg-primary text-on-primary hover:brightness-110 active:scale-95 transition-colors flex items-center gap-1 cursor-pointer"
                              >
                                <span className="material-symbols-outlined text-[13px]">calendar_add_on</span>
                                Reschedule
                              </button>
                              <button
                                onClick={() => handleMarkNoShow(app.id)}
                                title="Mark appointment as No-Show"
                                className="px-2.5 py-1.5 rounded-lg text-[11px] font-bold bg-[#ba1a1a] text-white hover:bg-[#93000a] transition-colors flex items-center gap-1 ml-auto cursor-pointer shadow-xs active:scale-95"
                              >
                                <span className="material-symbols-outlined text-[13px]">person_off</span>
                                Mark No-Show
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Dynamic Organization Performance & Peak Productivity Card */}
            <div className="bg-gradient-to-br from-primary to-primary-container rounded-xl shadow-lg p-6 text-white relative overflow-hidden">
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-[11px] font-bold opacity-80 uppercase tracking-widest">
                    {(terms.facilityLabel || 'Organization').toUpperCase()} PERFORMANCE
                  </p>
                  <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider backdrop-blur-sm">
                    Dynamic Metric
                  </span>
                </div>
                <h4 className="text-[22px] font-black tracking-tight mb-3">Peak Productivity</h4>

                {/* Peak Window Highlight */}
                <div className="bg-white/15 backdrop-blur-md rounded-xl p-3.5 border border-white/20 mb-4 shadow-sm">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs text-white/90 font-medium flex items-center gap-1">
                      <span className="material-symbols-outlined text-[16px] text-amber-300">bolt</span>
                      Peak Window ({peakProductivity.peakSlot.label}):
                    </span>
                    <span className="text-xs font-black bg-amber-300 text-slate-950 px-2.5 py-0.5 rounded-md shadow-xs">
                      {peakProductivity.peakSlot.timeDisplay}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-white/90 pt-1.5 border-t border-white/10">
                    <span>
                      <strong>{peakProductivity.peakSlot.completed}</strong> completed ({peakProductivity.peakSlot.total} total)
                    </span>
                    <span className="text-white/80 font-semibold">
                      {peakProductivity.overallCompletionRate}% Overall Fulfillment
                    </span>
                  </div>
                </div>

                {/* Dynamic Histogram Bars */}
                <div className="flex items-end justify-between gap-3 pt-2">
                  {peakProductivity.slotMetrics.map(slot => {
                    const isPeak = slot.id === peakProductivity.peakSlot.id;
                    const heightPx = Math.max(20, Math.round((slot.score / peakProductivity.maxScore) * 80));
                    return (
                      <div key={slot.id} className="flex-1 flex flex-col items-center gap-1.5 group relative">
                        {/* Tooltip on hover */}
                        <div className="absolute -top-8 bg-slate-900/95 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20">
                          {slot.label}: {slot.completed} completed / {slot.total} total
                        </div>

                        {/* Peak Tag */}
                        {isPeak && (
                          <span className="text-[9px] font-black tracking-widest text-amber-300 uppercase animate-pulse">
                            PEAK
                          </span>
                        )}

                        {/* Bar */}
                        <div
                          style={{ height: `${heightPx}px` }}
                          className={`w-full rounded-t-md transition-all duration-300 cursor-pointer ${
                            isPeak
                              ? 'bg-white shadow-lg shadow-white/30 ring-2 ring-white/50'
                              : 'bg-white/40 hover:bg-white/60'
                          }`}
                        />

                        {/* Label */}
                        <div className="text-center">
                          <span className={`text-[11px] font-bold block ${isPeak ? 'text-white' : 'text-white/70'}`}>
                            {slot.shortCode}
                          </span>
                          <span className="text-[9px] text-white/60 block -mt-0.5">
                            {slot.completed} done
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
              <span className="material-symbols-outlined absolute -right-4 -bottom-4 text-[120px] opacity-10 rotate-12 select-none pointer-events-none">
                trending_up
              </span>
            </div>
          </div>
        </div>
      </main>

      {/* VIEW DETAILS MODAL */}
      {isDetailsModalOpen && selectedAppointment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0f172a]/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl w-full max-w-3xl shadow-2xl overflow-hidden flex flex-col animate-[fadeIn_0.3s_ease-out]">
            <div className="px-6 py-4 bg-gradient-to-r from-primary to-primary-container flex justify-between items-center text-white">
              <div className="flex items-center gap-3">
                <h2 className="text-xl font-bold">Appointment Details</h2>
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                  selectedAppointment.appointmentStatus === 'CHECKED_IN' ? 'bg-emerald-500 text-white' :
                  selectedAppointment.appointmentStatus === 'COMPLETED' ? 'bg-blue-200 text-blue-900' :
                  selectedAppointment.appointmentStatus === 'CANCELLED' ? 'bg-red-500 text-white' :
                  (selectedAppointment.appointmentStatus === 'REJECTED' || selectedAppointment.appointmentStatus === 'DECLINED') ? 'bg-red-600 text-white shadow-sm' :
                  'bg-white/20 text-white'
                }`}>
                  {selectedAppointment.appointmentStatus}
                </span>
              </div>
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
              {/* Customer Profile Section */}
              <div className="bg-[#f8fafc] border border-[#e2e8f0] p-4 rounded-xl">
                <h4 className="text-xs font-bold text-[#64748b] uppercase tracking-wider mb-3 flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary">{modalTerms.customersNavIcon}</span> {modalTerms.customerSingular} Profile
                </h4>
                <div className="flex items-center gap-4">
                  <img 
                    src={selectedAppointment.patientProfilePicture || `https://ui-avatars.com/api/?name=${encodeURIComponent(selectedAppointment.patientName || 'User')}&background=e2e8f8&color=1a56db&size=128&rounded=true&font-size=0.4`} 
                    alt={`${modalTerms.customerSingular} Profile`} 
                    className="w-20 h-20 rounded-full shadow-sm border-2 border-white object-cover bg-slate-100"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(selectedAppointment.patientName || 'User')}&background=e2e8f8&color=1a56db&size=128&rounded=true&font-size=0.4`;
                    }}
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
                    <p className="text-[11px] font-bold text-[#64748b] uppercase tracking-widest mb-1">{modalTerms.reasonForVisitLabel}</p>
                    <p className="text-md font-semibold text-[#1e293b] bg-white p-3 rounded-lg border border-[#e2e8f0]">
                      {selectedAppointment.reasonForVisit || 'None provided'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Rejected Status Notification */}
              {(selectedAppointment.appointmentStatus === 'REJECTED' || selectedAppointment.appointmentStatus === 'DECLINED') ? (
                <div className="bg-rose-50 border border-rose-200 p-5 rounded-2xl flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-rose-600 text-white flex items-center justify-center shadow-md">
                      <span className="material-symbols-outlined text-[22px]">block</span>
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-rose-900">Appointment Rejected</h4>
                      <p className="text-xs text-rose-700">
                        {selectedAppointment.rejectionReason 
                          ? `Reason: ${selectedAppointment.rejectionReason}` 
                          : 'This appointment was rejected and will not take place.'}
                      </p>
                    </div>
                  </div>
                  <span className="text-xs font-bold px-3 py-1 bg-rose-200 text-rose-800 rounded-full shrink-0">
                    Rejected
                  </span>
                </div>
              ) : checkServiceAllowsVideo(selectedAppointment) ? (
                <div className="bg-blue-50/60 border border-blue-200/80 p-5 rounded-2xl">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-md">
                        <span className="material-symbols-outlined text-[22px]">videocam</span>
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-slate-900">Virtual {modalTerms.appointmentSingular}</h4>
                        <p className="text-xs text-slate-600">
                          {selectedAppointment.videoCallEnabled || selectedAppointment.appointmentType === 'VIRTUAL'
                            ? `Video room is active. ${modalTerms.customerSingular} can join remotely.`
                            : `Turn on video call to conduct and complete this ${modalTerms.appointmentSingular.toLowerCase()} remotely.`}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {permissions.calendar.write && selectedAppointment.appointmentStatus !== 'COMPLETED' && selectedAppointment.appointmentStatus !== 'CANCELLED' && selectedAppointment.appointmentStatus !== 'REJECTED' && selectedAppointment.appointmentStatus !== 'DECLINED' && (
                        <button
                          onClick={() => handleToggleVideo(selectedAppointment.id, !!(selectedAppointment.videoCallEnabled || selectedAppointment.appointmentType === 'VIRTUAL'))}
                          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 border ${
                            selectedAppointment.videoCallEnabled || selectedAppointment.appointmentType === 'VIRTUAL'
                              ? 'bg-white text-red-600 border-red-200 hover:bg-red-50'
                              : 'bg-blue-600 text-white border-blue-600 hover:bg-blue-700 shadow-sm'
                          }`}
                        >
                          <span className="material-symbols-outlined text-[16px]">
                            {selectedAppointment.videoCallEnabled || selectedAppointment.appointmentType === 'VIRTUAL' ? 'videocam_off' : 'videocam'}
                          </span>
                          {selectedAppointment.videoCallEnabled || selectedAppointment.appointmentType === 'VIRTUAL' ? 'Turn Off Video' : 'Turn On Video Call'}
                        </button>
                      )}

                      {(selectedAppointment.videoCallEnabled || selectedAppointment.appointmentType === 'VIRTUAL') && selectedAppointment.appointmentStatus !== 'CANCELLED' && selectedAppointment.appointmentStatus !== 'REJECTED' && selectedAppointment.appointmentStatus !== 'DECLINED' && (
                        <button
                          onClick={() => {
                            setIsDetailsModalOpen(false);
                            setActiveVideoAppt(selectedAppointment);
                          }}
                          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md transition-all"
                        >
                          <span className="material-symbols-outlined text-[16px] animate-pulse">video_camera_front</span>
                          Launch Video Room
                        </button>
                      )}
                    </div>
                  </div>

                  {(selectedAppointment.videoCallEnabled || selectedAppointment.appointmentType === 'VIRTUAL') && selectedAppointment.meetingLink && (
                    <div className="mt-3 pt-3 border-t border-blue-200/60 flex items-center justify-between text-xs text-blue-900 bg-white/70 p-2.5 rounded-lg">
                      <span className="truncate mr-2 font-mono text-[11px] text-blue-800">{selectedAppointment.meetingLink}</span>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(selectedAppointment.meetingLink);
                          alert('Meeting link copied to clipboard!');
                        }}
                        className="text-blue-700 font-bold hover:underline shrink-0 flex items-center gap-1"
                      >
                        <span className="material-symbols-outlined text-[14px]">content_copy</span> Copy Link
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="bg-slate-50 border border-slate-200/80 p-4 rounded-2xl flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-slate-200 text-slate-600 flex items-center justify-center">
                      <span className="material-symbols-outlined text-[22px]">person</span>
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-800">In-Person {modalTerms.appointmentSingular}</h4>
                      <p className="text-xs text-slate-500">
                        Online video consultation is turned off for this {modalTerms.serviceSingular.toLowerCase()} in {terms.servicesNavLabel}.
                      </p>
                    </div>
                  </div>
                  <span className="text-xs font-bold px-3 py-1 bg-slate-200 text-slate-700 rounded-full shrink-0">
                    In-Person Only
                  </span>
                </div>
              )}

              {/* Timestamp Timeline Section */}
              <div>
                <h3 className="text-lg font-bold text-[#0f172a] mb-4 flex items-center gap-2 border-b border-[#cbd5e1] pb-2">
                  <span className="material-symbols-outlined text-primary">timeline</span> Lifecycle Timestamps
                </h3>
                <div className="relative border-l-2 border-[#cbd5e1] ml-3 mt-4 space-y-6">
                  {[
                    { 
                      label: `Booked by ${selectedAppointment.patientName || selectedAppointment.bookedByName || 'User'} (${formatRole(
                        selectedAppointment.bookedByRole && selectedAppointment.bookedByRole !== 'admin' && selectedAppointment.bookedByRole !== 'service_provider' && selectedAppointment.bookedByRole !== 'provider'
                          ? selectedAppointment.bookedByRole 
                          : modalTerms.customerSingular.toLowerCase(), 
                        modalTerms
                      )})`, 
                      time: selectedAppointment.bookedAt, 
                      icon: 'edit_calendar', 
                      color: 'bg-blue-100 text-blue-600', 
                      dot: 'bg-blue-600' 
                    },
                    { 
                      label: selectedAppointment.approvedByName 
                        ? `Approved by ${selectedAppointment.approvedByName} (${formatRole(selectedAppointment.approvedByRole, modalTerms)})` 
                        : 'Approved', 
                      time: selectedAppointment.approvedAt, 
                      icon: 'verified', 
                      color: 'bg-purple-100 text-purple-600', 
                      dot: 'bg-purple-600' 
                    },
                    { 
                      label: selectedAppointment.checkedInByName 
                        ? `Checked In by ${selectedAppointment.checkedInByName} (${formatRole(selectedAppointment.checkedInByRole, modalTerms)})` 
                        : 'Checked In', 
                      time: selectedAppointment.checkedInAt, 
                      icon: 'how_to_reg', 
                      color: 'bg-emerald-100 text-emerald-600', 
                      dot: 'bg-emerald-600' 
                    },
                    { 
                      label: selectedAppointment.completedByName 
                        ? `Completed by ${selectedAppointment.completedByName} (${formatRole(selectedAppointment.completedByRole, modalTerms)})` 
                        : 'Completed', 
                      time: selectedAppointment.completedAt, 
                      icon: 'task_alt', 
                      color: 'bg-green-100 text-green-600', 
                      dot: 'bg-green-600' 
                    },
                    { 
                      label: selectedAppointment.cancelledByName 
                        ? `Cancelled by ${selectedAppointment.cancelledByName} (${formatRole(selectedAppointment.cancelledByRole, modalTerms)})` 
                        : 'Cancelled', 
                      time: selectedAppointment.cancelledAt, 
                      icon: 'cancel', 
                      color: 'bg-red-100 text-red-600', 
                      dot: 'bg-red-600' 
                    },
                    { 
                      label: selectedAppointment.rejectedByName 
                        ? `Rejected by ${selectedAppointment.rejectedByName} (${formatRole(selectedAppointment.rejectedByRole, modalTerms)})` 
                        : 'Rejected', 
                      time: selectedAppointment.rejectedAt, 
                      icon: 'block', 
                      color: 'bg-rose-100 text-rose-700', 
                      dot: 'bg-rose-600' 
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

                {(selectedAppointment.approvedByName || selectedAppointment.checkedInByName || selectedAppointment.completedByName || selectedAppointment.cancelledByName || selectedAppointment.rejectedByName) && (
                  <div className="mt-6 p-4 rounded-xl border bg-slate-50 border-slate-200 space-y-2">
                    <h4 className="text-xs font-bold text-[#64748b] uppercase tracking-wider mb-2 flex items-center gap-2">
                      <span className="material-symbols-outlined text-[18px] text-primary">badge</span> Staff Attribution &amp; Audit
                    </h4>
                    {selectedAppointment.approvedByName && (
                      <p className="text-sm text-slate-700">
                        <span className="font-semibold text-purple-700">Approved By:</span> {selectedAppointment.approvedByName} 
                        <span className="ml-2 text-xs px-2 py-0.5 rounded-full bg-purple-100 text-purple-800 font-bold">
                          {formatRole(selectedAppointment.approvedByRole, modalTerms)}
                        </span>
                      </p>
                    )}
                    {selectedAppointment.checkedInByName && (
                      <p className="text-sm text-slate-700">
                        <span className="font-semibold text-emerald-700">Checked In By:</span> {selectedAppointment.checkedInByName} 
                        <span className="ml-2 text-xs px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold">
                          {formatRole(selectedAppointment.checkedInByRole, modalTerms)}
                        </span>
                      </p>
                    )}
                    {selectedAppointment.completedByName && (
                      <p className="text-sm text-slate-700">
                        <span className="font-semibold text-green-700">Completed By:</span> {selectedAppointment.completedByName} 
                        <span className="ml-2 text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-800 font-bold">
                          {formatRole(selectedAppointment.completedByRole, modalTerms)}
                        </span>
                      </p>
                    )}
                    {selectedAppointment.cancelledByName && (
                      <p className="text-sm text-slate-700">
                        <span className="font-semibold text-red-700">Cancelled By:</span> {selectedAppointment.cancelledByName} 
                        <span className="ml-2 text-xs px-2 py-0.5 rounded-full bg-red-100 text-red-800 font-bold">
                          {formatRole(selectedAppointment.cancelledByRole, modalTerms)}
                        </span>
                      </p>
                    )}
                    {selectedAppointment.rejectedByName && (
                      <p className="text-sm text-slate-700">
                        <span className="font-semibold text-rose-700">Rejected By:</span> {selectedAppointment.rejectedByName} 
                        <span className="ml-2 text-xs px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 font-bold">
                          {formatRole(selectedAppointment.rejectedByRole, modalTerms)}
                        </span>
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* Clinical / Service Notes & Feedback */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-bold text-[#0f172a] mb-4 flex items-center gap-2 border-b border-[#cbd5e1] pb-2">
                    <span className="material-symbols-outlined text-primary">notes</span> {completeConfig.summaryLabel} &amp; Notes
                  </h3>
                  <div className="space-y-4 text-sm">
                    <div>
                      <p className="font-bold text-[#64748b]">{completeConfig.summaryLabel}:</p>
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
                      <span className="material-symbols-outlined text-primary">star_rate</span> {terms.customerSingular} Feedback
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
                        {selectedAppointment.patientReview ? (
                          <p className="text-sm text-[#78350f] italic">"{selectedAppointment.patientReview}"</p>
                        ) : (
                          <p className="text-sm text-[#78350f] italic opacity-70">No written feedback provided.</p>
                        )}
                      </div>
                    ) : (
                      <p className="text-sm text-[#64748b] italic">No feedback submitted yet.</p>
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
            <h2 className="text-xl font-bold text-[#0f172a] mb-2">Cancel Appointment?</h2>
            <p className="text-sm text-[#64748b] mb-6">
              Are you sure you want to cancel this appointment? This action cannot be undone and the {terms.customerSingular.toLowerCase()} will be notified.
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

      {/* DECLINE / REJECT APPOINTMENT MODAL (100% REFUND POLICY) */}
      {isDeclineModalOpen && decliningAppt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0f172a]/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col animate-[fadeIn_0.25s_ease-out]">
            <div className="px-6 py-4 bg-gradient-to-r from-rose-700 to-rose-900 text-white flex justify-between items-center">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[20px]">block</span>
                <h3 className="text-base font-bold">Decline {terms.appointmentSingular} Request</h3>
              </div>
              <button 
                onClick={() => { setIsDeclineModalOpen(false); setDecliningAppt(null); }}
                className="text-white/70 hover:text-white transition p-1 cursor-pointer"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="p-6 flex flex-col gap-4">
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      {terms.customerSingular}
                    </span>
                    <span className="text-sm font-bold text-slate-900">{decliningAppt.patientName}</span>
                    <span className="text-xs text-slate-600 block mt-0.5">{decliningAppt.serviceName || terms.serviceSingular}</span>
                  </div>
                  <span className="text-xs font-semibold text-primary px-2 py-0.5 bg-primary/10 rounded-full">
                    {decliningAppt.appointmentDate} • {decliningAppt.appointmentTime?.substring(0, 5)}
                  </span>
                </div>
              </div>

              {/* 100% Refund Policy Banner */}
              <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl flex items-start gap-2.5">
                <span className="material-symbols-outlined text-emerald-600 text-[20px] shrink-0 mt-0.5">verified_user</span>
                <div className="text-xs text-emerald-900">
                  <span className="font-bold block mb-0.5">OmniBook 100% Refund Policy</span>
                  Declining will reject this request, release your calendar slot, and immediately process a <strong>100% full refund</strong> to the {terms.customerSingular.toLowerCase()}. No provider earnings, platform fees, or daily settlement transactions will be generated.
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Reason for Declining <span className="text-rose-500">*</span>
                </label>
                <select
                  value={declineReason}
                  onChange={(e) => setDeclineReason(e.target.value)}
                  className="w-full px-3 py-2.5 bg-[#f8fafc] border border-[#cbd5e1] rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-400 text-xs text-[#0f172a] font-medium"
                >
                  <option value="Schedule conflict / Unavailable">Schedule conflict / Unavailable</option>
                  <option value="Service temporarily unavailable">Service temporarily unavailable</option>
                  <option value="Capacity limit reached">Capacity limit reached</option>
                  <option value="Personal emergency">Personal emergency</option>
                  <option value="Specialty or scope mismatch">Specialty or scope mismatch</option>
                  <option value="Other (Custom note)">Other (Custom note)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Optional Feedback Note to {terms.customerSingular}
                </label>
                <textarea
                  rows={2}
                  placeholder={`Explain briefly to the ${terms.customerSingular.toLowerCase()} why you cannot accommodate this request...`}
                  value={customDeclineNote}
                  onChange={(e) => setCustomDeclineNote(e.target.value)}
                  className="w-full px-3 py-2 bg-[#f8fafc] border border-[#cbd5e1] rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-400 text-xs text-[#0f172a]"
                />
              </div>

              <div className="flex gap-3 pt-3 border-t border-slate-200 mt-1">
                <button
                  type="button"
                  onClick={() => { setIsDeclineModalOpen(false); setDecliningAppt(null); }}
                  className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition cursor-pointer"
                >
                  Keep Request
                </button>
                <button
                  type="button"
                  onClick={confirmDeclineAppointment}
                  disabled={declineSubmitting}
                  className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 active:scale-95 text-white font-bold rounded-xl text-xs transition shadow-sm flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <span className="material-symbols-outlined text-[16px]">cancel</span>
                  {declineSubmitting ? 'Processing 100% Refund...' : 'Decline & 100% Refund'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* NEW APPOINTMENT / WALK-IN MODAL */}
      <NewAppointmentModal
        isOpen={isNewBookingModalOpen}
        onClose={() => setIsNewBookingModalOpen(false)}
        onSuccess={() => {
          setIsNewBookingModalOpen(false);
          loadAppointments();
          setNotification({ message: `${terms.appointmentSingular} booked successfully!`, type: 'success' });
          setTimeout(() => setNotification(null), 4000);
        }}
        preselectedProviderName={localStorage.getItem('fullName') || undefined}
      />

      {/* VIDEO CONSULTATION MODAL */}
      <VideoConsultationModal
        isOpen={!!activeVideoAppt}
        onClose={() => setActiveVideoAppt(null)}
        appointment={activeVideoAppt}
        isProvider={true}
        onAppointmentCompleted={(completedAppt) => {
          setAppointments((prev: any[]) => prev.map(a => a.id === completedAppt.id ? {
            ...a,
            appointmentStatus: 'COMPLETED',
            status: 'COMPLETED',
            treatmentSummary: completedAppt.treatmentSummary
          } : a));
          setNotification({ message: 'Consultation completed successfully!', type: 'success' });
          setTimeout(() => setNotification(null), 4000);
        }}
      />

      {/* RESCHEDULE APPOINTMENT MODAL */}
      {isRescheduleModalOpen && reschedulingAppt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0f172a]/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col animate-[fadeIn_0.25s_ease-out]">
            <div className="px-6 py-4 bg-gradient-to-r from-primary to-primary-container flex justify-between items-center text-white">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[20px]">calendar_clock</span>
                <h3 className="text-lg font-bold">Reschedule {terms.appointmentSingular}</h3>
              </div>
              <button 
                onClick={() => { setIsRescheduleModalOpen(false); setReschedulingAppt(null); }}
                className="text-white/70 hover:text-white transition p-1 cursor-pointer"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form onSubmit={handleRescheduleSubmit} className="p-6 flex flex-col gap-4">
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                  {terms.customerSingular}
                </div>
                <div className="text-sm font-bold text-slate-900">{reschedulingAppt.patientName}</div>
                <div className="text-xs text-slate-600 mt-0.5">{reschedulingAppt.serviceName || terms.serviceSingular}</div>
                <div className="text-xs text-rose-600 font-semibold mt-1 flex items-center gap-1">
                  <span className="material-symbols-outlined text-[13px]">history</span>
                  Previous: {reschedulingAppt.appointmentDate} at {reschedulingAppt.appointmentTime?.substring(0, 5)}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  New Date <span className="text-rose-500">*</span>
                </label>
                <input
                  type="date"
                  required
                  min={todayYMD}
                  value={rescheduleForm.date}
                  onChange={(e) => setRescheduleForm({ ...rescheduleForm, date: e.target.value })}
                  className="w-full px-4 py-2.5 bg-[#f8fafc] border border-[#cbd5e1] rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary text-sm text-[#0f172a]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  New Time <span className="text-rose-500">*</span>
                </label>
                <input
                  type="time"
                  required
                  value={rescheduleForm.time}
                  onChange={(e) => setRescheduleForm({ ...rescheduleForm, time: e.target.value })}
                  className="w-full px-4 py-2.5 bg-[#f8fafc] border border-[#cbd5e1] rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary text-sm text-[#0f172a]"
                />
              </div>

              <div className="flex gap-3 pt-3 border-t border-slate-200 mt-2">
                <button
                  type="button"
                  onClick={() => { setIsRescheduleModalOpen(false); setReschedulingAppt(null); }}
                  className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-sm transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={rescheduleSubmitting}
                  className="flex-1 py-2.5 bg-primary hover:brightness-110 active:scale-95 text-on-primary font-bold rounded-xl text-sm transition shadow-sm flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {rescheduleSubmitting ? 'Rescheduling...' : 'Confirm Reschedule'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* QUICK CONTACT MODAL */}
      {contactAppt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0f172a]/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden flex flex-col animate-[fadeIn_0.25s_ease-out]">
            <div className="px-6 py-4 bg-slate-900 text-white flex justify-between items-center">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[20px] text-blue-400">perm_phone_msg</span>
                <h3 className="text-base font-bold">Contact {terms.customerSingular}</h3>
              </div>
              <button onClick={() => setContactAppt(null)} className="text-white/70 hover:text-white transition p-1 cursor-pointer">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="p-6 flex flex-col gap-4">
              <div className="text-center pb-2 border-b border-slate-100">
                <h4 className="text-base font-bold text-slate-900">{contactAppt.patientName}</h4>
                <p className="text-xs text-slate-500 mt-0.5">{contactAppt.serviceName || terms.serviceSingular}</p>
              </div>

              {/* Phone */}
              <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className="material-symbols-outlined text-slate-500 text-[20px]">call</span>
                  <div className="min-w-0">
                    <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">Phone</span>
                    <span className="text-xs font-bold text-slate-800 truncate block">
                      {contactAppt.patientPhone || 'Not provided'}
                    </span>
                  </div>
                </div>
                {contactAppt.patientPhone && (
                  <div className="flex items-center gap-1">
                    <a
                      href={`tel:${contactAppt.patientPhone}`}
                      className="p-1.5 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition"
                      title="Call Phone"
                    >
                      <span className="material-symbols-outlined text-[16px]">call</span>
                    </a>
                    <button
                      onClick={() => copyToClipboard(contactAppt.patientPhone, 'phone')}
                      className="p-1.5 bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200 transition cursor-pointer"
                      title="Copy Phone"
                    >
                      <span className="material-symbols-outlined text-[16px]">
                        {copiedField === 'phone' ? 'check' : 'content_copy'}
                      </span>
                    </button>
                  </div>
                )}
              </div>

              {/* Email */}
              <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className="material-symbols-outlined text-slate-500 text-[20px]">mail</span>
                  <div className="min-w-0">
                    <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">Email</span>
                    <span className="text-xs font-bold text-slate-800 truncate block">
                      {contactAppt.patientEmail || 'Not provided'}
                    </span>
                  </div>
                </div>
                {contactAppt.patientEmail && (
                  <div className="flex items-center gap-1">
                    <a
                      href={`mailto:${contactAppt.patientEmail}`}
                      className="p-1.5 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 transition"
                      title="Send Email"
                    >
                      <span className="material-symbols-outlined text-[16px]">send</span>
                    </a>
                    <button
                      onClick={() => copyToClipboard(contactAppt.patientEmail, 'email')}
                      className="p-1.5 bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200 transition cursor-pointer"
                      title="Copy Email"
                    >
                      <span className="material-symbols-outlined text-[16px]">
                        {copiedField === 'email' ? 'check' : 'content_copy'}
                      </span>
                    </button>
                  </div>
                )}
              </div>

              <button
                onClick={() => setContactAppt(null)}
                className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition mt-1 cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default ProviderDashboardPage;
