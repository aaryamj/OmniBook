import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { getOrganizationTerms } from '../utils/organizationTerms';

interface VideoConsultationModalProps {
  isOpen: boolean;
  onClose: () => void;
  appointment: any;
  isProvider?: boolean;
  onAppointmentCompleted?: (completedAppt?: any) => void;
}

export const VideoConsultationModal: React.FC<VideoConsultationModalProps> = ({
  isOpen,
  onClose,
  appointment,
  isProvider = false,
  onAppointmentCompleted,
}) => {
  const [treatmentNotes, setTreatmentNotes] = useState('');
  const [internalNotes, setInternalNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [showNotesPanel, setShowNotesPanel] = useState(true);

  const terms = useMemo(() => {
    return getOrganizationTerms(appointment?.organizationType || localStorage.getItem('organizationType'));
  }, [appointment]);

  const norm = (terms.facilityLabel || '').toLowerCase();
  let summaryPlaceholder = "Summarize the session delivered, key discussion points, or outcomes...";
  let internalPlaceholder = `Private notes for ${terms.providerSingular.toLowerCase()} eyes only...`;
  let sessionTypeLabel = `Virtual ${terms.appointmentSingular}`;

  if (norm.includes('college') || norm.includes('acad') || norm.includes('univ')) {
    summaryPlaceholder = "Summarize topics covered, student progress, assignment feedback, or class notes...";
    internalPlaceholder = "Private academic notes for instructor eyes only...";
    sessionTypeLabel = "Academic / Virtual Class";
  } else if (norm.includes('salon') || norm.includes('saloon') || norm.includes('spa')) {
    summaryPlaceholder = "Summarize styling performed, treatments applied, or products used...";
    internalPlaceholder = "Private notes for stylist eyes only...";
    sessionTypeLabel = "Styling & Beauty Consultation";
  } else if (norm.includes('clinic') || norm.includes('hosp') || norm.includes('medic')) {
    summaryPlaceholder = "Document diagnosis, symptoms, clinical observations, recommendations, or prescribed medication...";
    internalPlaceholder = "Confidential clinical notes for provider eyes only...";
    sessionTypeLabel = "Clinical Telehealth Session";
  }

  useEffect(() => {
    if (appointment?.treatmentSummary) {
      setTreatmentNotes(appointment.treatmentSummary);
    } else {
      setTreatmentNotes('');
    }
    if (appointment?.internalNotes) {
      setInternalNotes(appointment.internalNotes);
    } else {
      setInternalNotes('');
    }
    setIsCompleted(appointment?.status === 'COMPLETED' || appointment?.appointmentStatus === 'COMPLETED');
    setElapsedSeconds(0);
  }, [appointment]);

  // Session elapsed timer
  useEffect(() => {
    if (!isOpen) return;
    const timer = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [isOpen]);

  if (!isOpen || !appointment) return null;

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Ensure meeting link exists or fallback to room name
  const meetingUrl = appointment.meetingLink || 
    `https://meet.jit.si/OmniBook-Appt-${appointment.id || 'room'}`;

  const handleEndAndComplete = async () => {
    if (!isProvider) {
      onClose();
      return;
    }

    setIsSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(
        `http://localhost:8080/api/v1/provider/appointments/${appointment.id}/complete`,
        {
          treatmentSummary: treatmentNotes,
          internalNotes: internalNotes,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data.success) {
        setIsCompleted(true);
        if (onAppointmentCompleted) {
          onAppointmentCompleted({
            ...appointment,
            appointmentStatus: 'COMPLETED',
            status: 'COMPLETED',
            treatmentSummary: treatmentNotes,
          });
        }
        setTimeout(() => {
          onClose();
        }, 1200);
      }
    } catch (err) {
      console.error('Failed to complete consultation:', err);
      alert('Could not complete appointment. Please verify details and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-slate-900 text-white rounded-2xl border border-slate-700/60 shadow-2xl w-full h-[95vh] max-w-[1600px] flex flex-col overflow-hidden">
        
        {/* Top Consultation Header */}
        <header className="h-16 px-4 sm:px-6 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-600/20 text-blue-400 border border-blue-500/30 flex items-center justify-center">
              <span className="material-symbols-outlined text-[22px]">videocam</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm sm:text-base font-bold text-slate-100 truncate max-w-xs sm:max-w-md">
                  {isProvider 
                    ? `${terms.appointmentSingular} with ${appointment.patientName || terms.customerSingular}` 
                    : `${terms.appointmentSingular} with ${appointment.providerName || terms.providerSingular}`}
                </h2>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  LIVE
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                {appointment.serviceName || appointment.department || sessionTypeLabel} &bull; {appointment.date || appointment.appointmentDate}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            {/* Live timer */}
            <div className="flex items-center gap-1.5 px-3 py-1 bg-slate-800/80 rounded-lg border border-slate-700 text-xs font-mono text-slate-300">
              <span className="material-symbols-outlined text-[16px] text-slate-400">timer</span>
              <span>{formatTimer(elapsedSeconds)}</span>
            </div>

            {isProvider && (
              <button
                onClick={() => setShowNotesPanel(!showNotesPanel)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-1 border ${
                  showNotesPanel 
                    ? 'bg-blue-600/20 border-blue-500/40 text-blue-300' 
                    : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
                }`}
                title={`Toggle ${terms.customerSingular} Notes Panel`}
              >
                <span className="material-symbols-outlined text-[16px]">clinical_notes</span>
                <span className="hidden sm:inline">{showNotesPanel ? 'Hide Notes' : 'Show Notes'}</span>
              </button>
            )}

            <button
              onClick={onClose}
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              title="Minimize or Close Window"
            >
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>
          </div>
        </header>

        {/* Main Body */}
        <div className="flex-1 flex overflow-hidden">
          
          {/* Left / Center: Video Call IFrame */}
          <div className="flex-1 relative bg-slate-950 flex items-center justify-center overflow-hidden">
            <iframe
              src={meetingUrl}
              title={`Virtual ${terms.appointmentSingular} Room`}
              allow="camera; microphone; fullscreen; display-capture; autoplay"
              className="w-full h-full border-0"
            />
          </div>

          {/* Right Side: Provider Clinical Notes & Completion Panel */}
          {isProvider && showNotesPanel && (
            <aside className="w-80 sm:w-96 lg:w-[380px] bg-slate-900 border-l border-slate-800 flex flex-col shrink-0 overflow-y-auto">
              
              {/* Customer Snapshot */}
              <div className="p-4 border-b border-slate-800/80 bg-slate-950/40">
                <span className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">{terms.customerSingular} Information</span>
                <div className="mt-2 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-600/30 text-blue-300 flex items-center justify-center font-bold text-sm border border-blue-500/20">
                    {(appointment.patientName || terms.customerSingular).substring(0, 2).toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-bold text-slate-100 text-sm truncate">{appointment.patientName || `Guest ${terms.customerSingular}`}</p>
                    <p className="text-xs text-slate-400 truncate">{appointment.patientPhone || appointment.patientEmail || 'No contact specified'}</p>
                  </div>
                </div>

                {appointment.reasonForVisit && (
                  <div className="mt-3 p-2.5 bg-slate-800/60 rounded-lg border border-slate-700/60 text-xs text-slate-300">
                    <span className="text-slate-400 font-semibold block text-[11px] mb-0.5">{terms.reasonForVisitLabel}:</span>
                    <p className="leading-relaxed">{appointment.reasonForVisit}</p>
                  </div>
                )}
              </div>

              {/* Live Session / Consultation Notes */}
              <div className="p-4 flex-1 flex flex-col gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-200 flex items-center justify-between mb-1.5">
                    <span className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-[16px] text-blue-400">edit_note</span>
                      {terms.summaryLabel}
                    </span>
                    <span className="text-[10px] text-slate-400 font-normal">Saved with visit</span>
                  </label>
                  <textarea
                    rows={7}
                    value={treatmentNotes}
                    onChange={(e) => setTreatmentNotes(e.target.value)}
                    placeholder={summaryPlaceholder}
                    className="w-full p-3 text-xs bg-slate-950 border border-slate-700 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all resize-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-200 flex items-center gap-1 mb-1.5">
                    <span className="material-symbols-outlined text-[16px] text-amber-400">lock</span>
                    Internal Notes (Private)
                  </label>
                  <textarea
                    rows={3}
                    value={internalNotes}
                    onChange={(e) => setInternalNotes(e.target.value)}
                    placeholder={internalPlaceholder}
                    className="w-full p-2.5 text-xs bg-slate-950 border border-slate-700 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 transition-all resize-none"
                  />
                </div>
              </div>

              {/* Actions Footer */}
              <div className="p-4 border-t border-slate-800 bg-slate-950/60 flex flex-col gap-2">
                {isCompleted ? (
                  <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl flex items-center justify-center gap-2 text-emerald-400 text-xs font-bold">
                    <span className="material-symbols-outlined text-[18px]">check_circle</span>
                    {terms.appointmentSingular} Completed
                  </div>
                ) : (
                  <button
                    onClick={handleEndAndComplete}
                    disabled={isSubmitting}
                    className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-900/30 transition-all active:scale-[0.98]"
                  >
                    {isSubmitting ? (
                      <>
                        <span className="material-symbols-outlined text-[18px] animate-spin">sync</span>
                        Completing {terms.appointmentSingular}...
                      </>
                    ) : (
                      <>
                        <span className="material-symbols-outlined text-[18px]">task_alt</span>
                        End & Complete {terms.appointmentSingular}
                      </>
                    )}
                  </button>
                )}

                <button
                  onClick={onClose}
                  className="w-full py-2 text-xs font-semibold text-slate-400 hover:text-slate-200 transition-colors text-center"
                >
                  Leave Call Without Completing
                </button>
              </div>

            </aside>
          )}

          {/* User Mode Side Panel (Customer View) */}
          {!isProvider && (
            <aside className="hidden lg:flex w-72 bg-slate-900 border-l border-slate-800 flex-col p-5 shrink-0 justify-between">
              <div>
                <span className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">{terms.providerSingular} Details</span>
                <div className="mt-3 flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center font-bold text-base shadow-md">
                    {(appointment.providerName || terms.providerSingular).substring(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-sm">{appointment.providerName || terms.providerSingular}</h3>
                    <p className="text-xs text-blue-400">{appointment.doctorSpecialty || appointment.serviceName || sessionTypeLabel}</p>
                  </div>
                </div>

                <div className="mt-6 space-y-3">
                  <div className="p-3 bg-slate-800/60 rounded-xl border border-slate-700/50">
                    <span className="text-[11px] text-slate-400 font-medium">Session Status</span>
                    <p className="text-xs font-bold text-emerald-400 mt-0.5 flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                      Connected & Secure
                    </p>
                  </div>

                  <div className="p-3 bg-slate-800/60 rounded-xl border border-slate-700/50">
                    <span className="text-[11px] text-slate-400 font-medium">Privacy & Encryption</span>
                    <p className="text-[11px] text-slate-300 mt-0.5 leading-relaxed">
                      End-to-end encrypted WebRTC virtual {terms.appointmentSingular.toLowerCase()} session.
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-800">
                <button
                  onClick={onClose}
                  className="w-full py-2.5 px-4 bg-red-600/20 hover:bg-red-600/30 border border-red-500/30 text-red-300 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-colors"
                >
                  <span className="material-symbols-outlined text-[18px]">call_end</span>
                  Leave Call
                </button>
              </div>
            </aside>
          )}

        </div>
      </div>
    </div>
  );
};

export default VideoConsultationModal;
