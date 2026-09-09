import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { QRCodeSVG } from 'qrcode.react';
import { getOrganizationTerms, normalizeOrgType } from '../../utils/organizationTerms';

interface BookingConfirmation {
  transactionId: string;
  organizationName: string;
  organizationType: string;
  address?: string;
  logoUrl?: string;
  serviceName?: string;
  providerName?: string;
  patientName?: string;
  appointmentDate?: string;
  appointmentTime?: string;
  appointmentType?: string;
  price?: number;
  totalAmount?: number;
  paymentStatus?: string;
  paymentMethod?: string;
  meetingLink?: string;
  slots?: Array<{ id: number; date: string; time: string; serviceName: string; price: number }>;
}

const PaymentSuccessPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const oid = searchParams.get('oid'); // Transaction reference / UUID

  const [booking, setBooking] = useState<BookingConfirmation | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    // 1. Initial immediate fallback from localStorage if user just completed payment
    const localSaved = localStorage.getItem('last_booked_org');
    let fallbackOrg: any = null;
    if (localSaved) {
      try {
        fallbackOrg = JSON.parse(localSaved);
      } catch (e) {
        console.warn("Failed to parse last_booked_org", e);
      }
    }

    if (oid) {
      axios.get(`http://localhost:8080/api/v1/public/booking/confirmation/${oid}`)
        .then(res => {
          if (res.data && res.data.success) {
            setBooking(res.data);
          } else if (fallbackOrg) {
            setBooking({
              transactionId: oid,
              organizationName: fallbackOrg.name || 'Organization',
              organizationType: fallbackOrg.type || 'Clinic',
              address: fallbackOrg.address,
              serviceName: fallbackOrg.serviceName
            });
          }
        })
        .catch(err => {
          console.warn("Could not fetch remote confirmation, using local fallback", err);
          if (fallbackOrg) {
            setBooking({
              transactionId: oid,
              organizationName: fallbackOrg.name || 'Organization',
              organizationType: fallbackOrg.type || 'Clinic',
              address: fallbackOrg.address,
              serviceName: fallbackOrg.serviceName
            });
          } else {
            setBooking({
              transactionId: oid,
              organizationName: 'Your Organization',
              organizationType: 'Organization'
            });
          }
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      if (fallbackOrg) {
        setBooking({
          transactionId: 'N/A',
          organizationName: fallbackOrg.name || 'Organization',
          organizationType: fallbackOrg.type || 'Clinic',
          address: fallbackOrg.address
        });
      }
      setLoading(false);
    }
  }, [oid]);

  const rawOrgType = booking?.organizationType || 'Clinic';
  const orgTypeNorm = normalizeOrgType(rawOrgType);
  const orgTerms = getOrganizationTerms(rawOrgType);
  const orgName = booking?.organizationName || 'Organization';

  // Dynamic theme colors and icons based on organization type
  const getOrgTheme = () => {
    switch (orgTypeNorm) {
      case 'College':
        return {
          icon: 'school',
          bgLight: 'bg-blue-50',
          textDark: 'text-blue-900',
          badgeBg: 'bg-blue-100 text-blue-800 border-blue-200',
          primaryBtn: 'bg-blue-700 hover:bg-blue-800',
          checkinFacility: 'on campus or at the academic department',
          appointmentLabel: 'Academic Session / Class',
          heroTitle: 'Session & Enrollment Confirmed!',
          heroSub: 'Your payment was successful and your academic session has been scheduled.'
        };
      case 'Saloon':
        return {
          icon: 'spa',
          bgLight: 'bg-rose-50',
          textDark: 'text-rose-950',
          badgeBg: 'bg-rose-100 text-rose-800 border-rose-200',
          primaryBtn: 'bg-[#9f1239] hover:bg-[#881337]',
          checkinFacility: 'at the salon reception or styling desk',
          appointmentLabel: 'Styling Appointment',
          heroTitle: 'Appointment Confirmed!',
          heroSub: 'Your payment was successful and your styling session has been scheduled.'
        };
      case 'Other':
        return {
          icon: 'domain',
          bgLight: 'bg-slate-50',
          textDark: 'text-slate-900',
          badgeBg: 'bg-slate-100 text-slate-800 border-slate-200',
          primaryBtn: 'bg-slate-800 hover:bg-slate-900',
          checkinFacility: 'at the organization front desk',
          appointmentLabel: 'Booking / Meeting',
          heroTitle: 'Booking Confirmed!',
          heroSub: 'Your payment was successful and your booking has been scheduled.'
        };
      case 'Clinic':
      default:
        return {
          icon: 'local_hospital',
          bgLight: 'bg-emerald-50',
          textDark: 'text-emerald-950',
          badgeBg: 'bg-emerald-100 text-emerald-800 border-emerald-200',
          primaryBtn: 'bg-[#005438] hover:bg-[#00422b]',
          checkinFacility: 'at the clinic reception',
          appointmentLabel: 'Medical Consultation',
          heroTitle: 'Booking Confirmed!',
          heroSub: 'Your payment was successful and your appointment has been scheduled.'
        };
    }
  };

  const theme = getOrgTheme();

  const handleCopyTransaction = () => {
    if (oid) {
      navigator.clipboard.writeText(oid);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-[#f4f6fb] flex items-center justify-center p-4 sm:p-6 py-10 font-sans">
      <div className="bg-white rounded-3xl w-full max-w-xl p-6 sm:p-8 shadow-[0_12px_40px_rgba(15,23,42,0.08)] border border-[#e2e8f0] animate-fade-in-up">
        
        {/* Success Icon */}
        <div className="w-16 h-16 bg-[#005438]/10 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-[#005438]/20 shadow-inner">
          <span className="material-symbols-outlined text-[36px] text-[#005438]" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
        </div>
        
        {/* Header Title & Subtitle */}
        <div className="text-center mb-6">
          <h1 className="text-2xl sm:text-[28px] font-bold text-[#151c27] tracking-tight mb-2">
            {theme.heroTitle}
          </h1>
          <p className="text-[#53606c] text-sm leading-relaxed max-w-md mx-auto">
            {theme.heroSub}
          </p>
        </div>

        {/* Dynamic Organization Banner Card */}
        <div className="bg-gradient-to-r from-slate-50 to-slate-100/80 rounded-2xl p-4 sm:p-5 mb-6 border border-slate-200/80 flex items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-white border border-slate-200 shadow-sm flex items-center justify-center shrink-0 text-slate-700 overflow-hidden">
              {booking?.logoUrl ? (
                <img src={booking.logoUrl} alt={orgName} className="w-full h-full object-cover" />
              ) : (
                <span className="material-symbols-outlined text-2xl text-slate-600">{theme.icon}</span>
              )}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-bold text-base sm:text-lg text-[#151c27] leading-tight">
                  {orgName}
                </h3>
                <span className={`px-2 py-0.5 text-[10px] font-extrabold uppercase rounded-full border ${theme.badgeBg}`}>
                  {rawOrgType}
                </span>
              </div>
              {booking?.address && (
                <p className="text-xs text-[#53606c] flex items-center gap-1 mt-1">
                  <span className="material-symbols-outlined text-[15px] text-slate-400">location_on</span>
                  {booking.address}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Booking Details Summary */}
        <div className="bg-[#f8f9fc] rounded-2xl p-4 sm:p-5 mb-6 border border-[#e2e8f0]/80 space-y-3">
          <div className="flex justify-between items-center pb-2 border-b border-slate-200/60 text-xs">
            <span className="font-semibold text-[#8c9bab] uppercase tracking-wider">Transaction ID</span>
            <div className="flex items-center gap-1.5 font-mono font-bold text-slate-800 text-xs">
              <span className="truncate max-w-[180px] sm:max-w-[240px]">{oid || 'N/A'}</span>
              {oid && (
                <button 
                  onClick={handleCopyTransaction} 
                  className="p-1 hover:bg-slate-200 rounded transition-colors text-slate-500 hover:text-slate-800"
                  title="Copy Transaction ID"
                >
                  <span className="material-symbols-outlined text-[14px]">
                    {copied ? 'check' : 'content_copy'}
                  </span>
                </button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 text-left">
            {booking?.serviceName && (
              <div className="bg-white p-2.5 rounded-xl border border-slate-200/60">
                <span className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">
                  {orgTerms.serviceSingular}
                </span>
                <span className="font-bold text-xs sm:text-sm text-slate-800 flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[16px] text-slate-500">bookmark</span>
                  {booking.serviceName}
                </span>
              </div>
            )}

            {booking?.providerName && (
              <div className="bg-white p-2.5 rounded-xl border border-slate-200/60">
                <span className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">
                  {orgTerms.providerSingular}
                </span>
                <span className="font-bold text-xs sm:text-sm text-slate-800 flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[16px] text-slate-500">person</span>
                  {booking.providerName}
                </span>
              </div>
            )}

            {(booking?.appointmentDate || booking?.appointmentTime) && (
              <div className="bg-white p-2.5 rounded-xl border border-slate-200/60">
                <span className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">
                  Date & Time
                </span>
                <span className="font-bold text-xs sm:text-sm text-slate-800 flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[16px] text-slate-500">schedule</span>
                  {booking.appointmentDate} {booking.appointmentTime && `at ${booking.appointmentTime}`}
                </span>
              </div>
            )}

            {(booking?.totalAmount !== undefined && booking.totalAmount > 0) && (
              <div className="bg-white p-2.5 rounded-xl border border-slate-200/60">
                <span className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">
                  Total Paid
                </span>
                <span className="font-bold text-xs sm:text-sm text-emerald-700 flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[16px]">payments</span>
                  Rs. {booking.totalAmount.toLocaleString()}
                  {booking.paymentMethod && (
                    <span className="text-[10px] px-1.5 py-0.2 bg-emerald-50 border border-emerald-200 rounded font-semibold text-emerald-800 uppercase">
                      {booking.paymentMethod}
                    </span>
                  )}
                </span>
              </div>
            )}
          </div>

          {/* Virtual Appointment Link if available */}
          {booking?.meetingLink && (
            <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-3 flex items-center justify-between text-xs text-indigo-900 mt-2">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-indigo-600">videocam</span>
                <span>Virtual Session Link:</span>
              </div>
              <a 
                href={booking.meetingLink} 
                target="_blank" 
                rel="noreferrer" 
                className="font-bold text-indigo-700 hover:underline flex items-center gap-1"
              >
                Join Meeting <span className="material-symbols-outlined text-[13px]">open_in_new</span>
              </a>
            </div>
          )}
        </div>

        {/* Dynamic QR Code Section */}
        <div className="flex flex-col items-center justify-center mb-6 pt-4 border-t border-slate-200/70 text-center">
          <p className="text-[#151c27] text-sm font-bold mb-1">
            Scan this QR Code at <span className="text-primary font-extrabold">{orgName}</span>
          </p>
          <p className="text-[#64748b] text-xs font-medium mb-4">
            Present this code {theme.checkinFacility} for instant digital check-in
          </p>
          
          <div className="bg-white p-3.5 rounded-2xl shadow-[0_6px_20px_rgba(0,0,0,0.06)] border border-[#e2e8f0] relative group">
            <QRCodeSVG value={oid || "omnibook-booking"} size={160} fgColor="#0f172a" />
          </div>
          <span className="text-[11px] text-slate-400 mt-2 font-mono">
            Fast Check-in Pass
          </span>
        </div>
        
        {/* Buttons */}
        <div className="space-y-2.5">
          <button 
            onClick={() => navigate('/')}
            className={`w-full py-3.5 ${theme.primaryBtn} text-white rounded-xl font-bold hover:scale-[1.01] active:scale-98 transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer`}
          >
            <span className="material-symbols-outlined text-sm">home</span>
            Return Home
          </button>

          <button 
            onClick={handlePrint}
            className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px]">print</span>
            Print / Save Receipt
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccessPage;
