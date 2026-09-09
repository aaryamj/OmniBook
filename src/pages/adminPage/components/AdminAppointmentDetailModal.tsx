import React, { useEffect, useState, useMemo } from 'react';
import axios from 'axios';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { useOrganizationTerms, getOrganizationTerms, formatRole } from '../../../utils/organizationTerms';

interface AdminAppointmentDetailModalProps {
    appointmentId?: number | string | null;
    appointmentData?: any | null;
    onClose: () => void;
}

export default function AdminAppointmentDetailModal({
    appointmentId,
    appointmentData,
    onClose
}: AdminAppointmentDetailModalProps) {
    const globalTerms = useOrganizationTerms();
    const [appointment, setAppointment] = useState<any | null>(appointmentData || null);
    const [loading, setLoading] = useState<boolean>(!appointmentData && !!appointmentId);

    useEffect(() => {
        if (appointmentData) {
            setAppointment(appointmentData);
        } else if (appointmentId) {
            const fetchDetail = async () => {
                try {
                    setLoading(true);
                    const token = localStorage.getItem('token');
                    const res = await axios.get(`http://localhost:8080/api/v1/admin/appointments/${appointmentId}`, {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                    if (res.data) {
                        setAppointment(res.data);
                    }
                } catch (err) {
                    console.error("Failed to fetch appointment details for admin modal:", err);
                } finally {
                    setLoading(false);
                }
            };
            fetchDetail();
        }
    }, [appointmentId, appointmentData]);

    const modalTerms = useMemo(() => {
        return getOrganizationTerms(appointment?.organizationType || globalTerms.orgType);
    }, [appointment, globalTerms]);

    const downloadPDF = (appt: any) => {
        if (!appt) return;
        const apptTerms = getOrganizationTerms(appt.organizationType || modalTerms.orgType);
        const doc = new jsPDF();

        // Brand Header
        doc.setFillColor(26, 86, 219); // #1a56db
        doc.rect(0, 0, 210, 30, 'F');
        doc.setFontSize(22);
        doc.setTextColor(255, 255, 255);
        doc.text(`${apptTerms.appointmentSingular} Summary`, 14, 20);

        doc.setFontSize(10);
        doc.text(`Ref ID: #${appt.id} | Generated: ${new Date().toLocaleDateString()}`, 14, 26);

        // Details
        doc.setFontSize(14);
        doc.setTextColor(0, 0, 0);
        doc.text(`${apptTerms.providerSingular} & ${apptTerms.customerSingular} Details`, 14, 40);

        const formatDate = (dateStr: string) => {
            if (!dateStr) return 'N/A';
            return new Date(dateStr).toLocaleString();
        };

        autoTable(doc, {
            startY: 44,
            theme: 'grid',
            headStyles: { fillColor: [240, 243, 255], textColor: [0, 63, 177] },
            body: [
                [apptTerms.customerSingular, appt.patientName || 'N/A'],
                [apptTerms.providerSingular, appt.providerName || appt.doctorName || 'N/A'],
                ['Department / Specialty', appt.doctorSpecialty || appt.department || 'General'],
                [apptTerms.serviceSingular, appt.service || appt.department || 'General Service'],
                ['Date & Time', `${appt.date || appt.appointmentDate} at ${appt.time || appt.appointmentTime || 'N/A'}`],
                ['Format', appt.appointmentType === 'VIRTUAL' ? 'Virtual (Online)' : apptTerms.inFacility],
                ['Status', appt.status || appt.appointmentStatus || 'SCHEDULED'],
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

        if (appt.treatmentSummary || appt.patientReview || appt.reasonForVisit) {
            finalY = (doc as any).lastAutoTable.finalY + 10;
            doc.setFontSize(14);
            doc.setTextColor(0, 0, 0);
            doc.text('Notes & Feedback', 14, finalY);

            const notesBody: any[] = [];
            if (appt.reasonForVisit) notesBody.push([apptTerms.reasonForVisitLabel, appt.reasonForVisit]);
            if (appt.treatmentSummary) notesBody.push([apptTerms.summaryLabel, appt.treatmentSummary]);
            if (appt.internalNotes) notesBody.push(['Internal Notes', appt.internalNotes]);
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

        doc.save(`${apptTerms.appointmentSingular}-${appt.id}-Details.pdf`);
    };

    const getStatusBadge = (status: string) => {
        const s = (status || '').toUpperCase();
        if (s === 'COMPLETED') {
            return <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-semibold border border-emerald-200">Completed</span>;
        } else if (s === 'CANCELLED') {
            return <span className="text-xs px-2.5 py-0.5 rounded-full bg-red-50 text-red-700 font-semibold border border-red-200">Cancelled</span>;
        } else if (s === 'CHECKED_IN' || s === 'IN_CONSULTATION') {
            return <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 font-semibold border border-amber-200">In Progress</span>;
        }
        return <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 font-semibold border border-blue-200">Upcoming</span>;
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0f172a]/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl w-full max-w-3xl shadow-2xl overflow-hidden flex flex-col animate-[fadeIn_0.3s_ease-out]">
                {/* Modal Header */}
                <div className="px-6 py-4 bg-gradient-to-r from-[#1a56db] to-[#003fb1] flex justify-between items-center text-white">
                    <div>
                        <h2 className="text-xl font-bold">{modalTerms.appointmentSingular} Details</h2>
                        <p className="text-xs text-white/80">Ref ID: #{appointment?.id || appointmentId || 'N/A'}</p>
                    </div>
                    <div className="flex gap-3 items-center">
                        {appointment && (
                            <button 
                                onClick={() => downloadPDF(appointment)} 
                                className="bg-white/20 hover:bg-white/30 px-3 py-1.5 rounded-lg flex items-center gap-2 transition text-sm font-bold shadow-sm"
                            >
                                <span className="material-symbols-outlined text-[18px]">download</span>
                                Download PDF
                            </button>
                        )}
                        <button 
                            onClick={onClose} 
                            className="text-white/70 hover:text-white transition p-1"
                        >
                            <span className="material-symbols-outlined">close</span>
                        </button>
                    </div>
                </div>

                {loading ? (
                    <div className="p-16 flex flex-col items-center justify-center gap-4">
                        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
                        <p className="text-sm font-semibold text-on-surface-variant">Loading {modalTerms.appointmentSingular.toLowerCase()} details...</p>
                    </div>
                ) : !appointment ? (
                    <div className="p-16 text-center text-on-surface-variant font-medium">
                        Failed to load appointment details.
                    </div>
                ) : (
                    <div className="p-8 flex flex-col gap-6 overflow-y-auto max-h-[80vh]">
                        {/* 2 Profile Cards: Customer / Student & Provider / Instructor */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Customer Profile Card */}
                            <div className="bg-[#f8fafc] border border-[#e2e8f0] p-4 rounded-xl flex items-center gap-4">
                                <img 
                                    src={appointment.patientProfilePicture || `https://ui-avatars.com/api/?name=${encodeURIComponent(appointment.patientName || 'Customer')}&background=e0e7ff&color=4338ca&size=128&rounded=true&font-size=0.4`} 
                                    alt={`${modalTerms.customerSingular} Profile`} 
                                    className="w-16 h-16 rounded-full shadow-sm border-2 border-white object-cover bg-slate-100 flex-shrink-0"
                                    onError={(e) => {
                                        (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(appointment.patientName || 'Customer')}&background=e0e7ff&color=4338ca&size=128&rounded=true&font-size=0.4`;
                                    }}
                                />
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-1.5 text-xs font-bold text-[#64748b] uppercase tracking-wider mb-1">
                                        <span className="material-symbols-outlined text-[16px] text-primary">{modalTerms.customersNavIcon}</span>
                                        {modalTerms.customerSingular} Profile
                                    </div>
                                    <p className="text-md font-bold text-[#1e293b] truncate">{appointment.patientName}</p>
                                    <p className="text-xs text-[#64748b] truncate">{appointment.patientEmail || appointment.email || 'No email provided'}</p>
                                    {appointment.patientPhone && (
                                        <p className="text-xs text-[#64748b] mt-0.5">{appointment.patientPhone}</p>
                                    )}
                                </div>
                            </div>

                            {/* Provider Profile Card */}
                            <div className="bg-[#f8fafc] border border-[#e2e8f0] p-4 rounded-xl flex items-center gap-4">
                                <img 
                                    src={appointment.doctorProfilePicture || `https://ui-avatars.com/api/?name=${encodeURIComponent(appointment.providerName || appointment.doctorName || 'Provider')}&background=e2e8f8&color=1a56db&size=128&rounded=true&font-size=0.4`} 
                                    alt={`${modalTerms.providerSingular} Profile`} 
                                    className="w-16 h-16 rounded-full shadow-sm border-2 border-white object-cover bg-slate-100 flex-shrink-0"
                                    onError={(e) => {
                                        (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(appointment.providerName || appointment.doctorName || 'Provider')}&background=e2e8f8&color=1a56db&size=128&rounded=true&font-size=0.4`;
                                    }}
                                />
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-1.5 text-xs font-bold text-[#64748b] uppercase tracking-wider mb-1">
                                        <span className="material-symbols-outlined text-[16px] text-primary">{modalTerms.providersNavIcon}</span>
                                        {modalTerms.providerSingular} Profile
                                    </div>
                                    <p className="text-md font-bold text-[#1e293b] truncate">{appointment.providerName || appointment.doctorName || 'Assigned Staff'}</p>
                                    <p className="text-xs text-[#64748b] truncate">{appointment.doctorSpecialty || appointment.department || modalTerms.facilityLabel}</p>
                                    <div className="mt-1 flex items-center gap-2">
                                        {getStatusBadge(appointment.status || appointment.appointmentStatus)}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Service, Date & Time, Format Details */}
                        <div className="bg-[#f8fafc] border border-[#e2e8f0] p-4 rounded-xl space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                                <div>
                                    <span className="text-xs text-gray-500 font-semibold block uppercase tracking-wide">{modalTerms.serviceSingular}</span>
                                    <span className="font-bold text-[#151c27] text-base">{appointment.service || appointment.department || appointment.serviceName || 'General Service'}</span>
                                </div>
                                <div>
                                    <span className="text-xs text-gray-500 font-semibold block uppercase tracking-wide">Date &amp; Time</span>
                                    <span className="font-bold text-[#151c27] text-base">
                                        {appointment.date || appointment.appointmentDate} at {appointment.time || appointment.appointmentTime || 'N/A'}
                                    </span>
                                </div>
                                <div>
                                    <span className="text-xs text-gray-500 font-semibold block uppercase tracking-wide">Session Format</span>
                                    <span className="inline-flex items-center px-2.5 py-0.5 mt-0.5 rounded-full text-xs font-bold bg-blue-50 text-[#003fb1] border border-blue-200">
                                        {appointment.appointmentType === 'VIRTUAL' ? 'Virtual (Online)' : modalTerms.inFacility}
                                    </span>
                                </div>
                            </div>

                            {appointment.reasonForVisit && (
                                <div className="pt-3 border-t border-slate-200">
                                    <span className="text-xs text-gray-500 font-semibold block mb-1">{modalTerms.reasonForVisitLabel}</span>
                                    <p className="text-xs text-slate-700 bg-white p-3 rounded-lg border border-slate-200">
                                        {appointment.reasonForVisit}
                                    </p>
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
                                        label: `Booked by ${appointment.patientName || appointment.bookedByName || 'User'} (${formatRole(
                                            appointment.bookedByRole && appointment.bookedByRole !== 'admin' && appointment.bookedByRole !== 'service_provider' && appointment.bookedByRole !== 'provider'
                                                ? appointment.bookedByRole 
                                                : modalTerms.customerSingular.toLowerCase(), 
                                            modalTerms
                                        )})`, 
                                        time: appointment.bookedAt, 
                                        icon: 'edit_calendar', 
                                        color: 'bg-blue-100 text-blue-600', 
                                        dot: 'bg-blue-600' 
                                    },
                                    { 
                                        label: appointment.approvedByName 
                                            ? `Approved by ${appointment.approvedByName} (${formatRole(appointment.approvedByRole, modalTerms)})` 
                                            : 'Approved', 
                                        time: appointment.approvedAt, 
                                        icon: 'verified', 
                                        color: 'bg-purple-100 text-purple-600', 
                                        dot: 'bg-purple-600' 
                                    },
                                    { 
                                        label: appointment.checkedInByName 
                                            ? `Checked In by ${appointment.checkedInByName} (${formatRole(appointment.checkedInByRole, modalTerms)})` 
                                            : 'Checked In', 
                                        time: appointment.checkedInAt, 
                                        icon: 'how_to_reg', 
                                        color: 'bg-emerald-100 text-emerald-600', 
                                        dot: 'bg-emerald-600' 
                                    },
                                    { 
                                        label: appointment.completedByName 
                                            ? `Completed by ${appointment.completedByName} (${formatRole(appointment.completedByRole, modalTerms)})` 
                                            : 'Completed', 
                                        time: appointment.completedAt, 
                                        icon: 'task_alt', 
                                        color: 'bg-green-100 text-green-600', 
                                        dot: 'bg-green-600' 
                                    },
                                    { 
                                        label: appointment.cancelledByName 
                                            ? `Cancelled by ${appointment.cancelledByName} (${formatRole(appointment.cancelledByRole, modalTerms)})` 
                                            : 'Cancelled', 
                                        time: appointment.cancelledAt, 
                                        icon: 'cancel', 
                                        color: 'bg-red-100 text-red-600', 
                                        dot: 'bg-red-600' 
                                    }
                                ].map((stage, i) => (
                                    stage.time ? (
                                        <div key={i} className="relative pl-6">
                                            <div className={`absolute w-3 h-3 ${stage.dot} rounded-full -left-[7px] top-1.5 shadow-sm border-2 border-white`}></div>
                                            <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold ${stage.color} mb-1`}>
                                                <span className="material-symbols-outlined text-[14px]">{stage.icon}</span> {stage.label}
                                            </div>
                                            <p className="text-sm font-semibold text-[#334155]">
                                                {new Date(stage.time).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })} at {new Date(stage.time).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                                            </p>
                                        </div>
                                    ) : null
                                ))}
                            </div>

                            {/* Staff Attribution & Audit */}
                            {(appointment.approvedByName || appointment.checkedInByName || appointment.completedByName || appointment.cancelledByName) && (
                                <div className="mt-6 p-4 rounded-xl border bg-slate-50 border-slate-200 space-y-2">
                                    <h4 className="text-xs font-bold text-[#64748b] uppercase tracking-wider mb-2 flex items-center gap-2">
                                        <span className="material-symbols-outlined text-[18px] text-primary">badge</span> Staff Attribution &amp; Audit
                                    </h4>
                                    {appointment.approvedByName && (
                                        <p className="text-sm text-slate-700">
                                            <span className="font-semibold text-purple-700">Approved By:</span> {appointment.approvedByName} 
                                            <span className="ml-2 text-xs px-2 py-0.5 rounded-full bg-purple-100 text-purple-800 font-bold">
                                                {formatRole(appointment.approvedByRole, modalTerms)}
                                            </span>
                                        </p>
                                    )}
                                    {appointment.checkedInByName && (
                                        <p className="text-sm text-slate-700">
                                            <span className="font-semibold text-emerald-700">Checked In By:</span> {appointment.checkedInByName} 
                                            <span className="ml-2 text-xs px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold">
                                                {formatRole(appointment.checkedInByRole, modalTerms)}
                                            </span>
                                        </p>
                                    )}
                                    {appointment.completedByName && (
                                        <p className="text-sm text-slate-700">
                                            <span className="font-semibold text-green-700">Completed By:</span> {appointment.completedByName} 
                                            <span className="ml-2 text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-800 font-bold">
                                                {formatRole(appointment.completedByRole, modalTerms)}
                                            </span>
                                        </p>
                                    )}
                                    {appointment.cancelledByName && (
                                        <p className="text-sm text-slate-700">
                                            <span className="font-semibold text-red-700">Cancelled By:</span> {appointment.cancelledByName} 
                                            <span className="ml-2 text-xs px-2 py-0.5 rounded-full bg-red-100 text-red-800 font-bold">
                                                {formatRole(appointment.cancelledByRole, modalTerms)}
                                            </span>
                                        </p>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Session / Class Summary & Notes & Feedback */}
                        {(appointment.treatmentSummary || appointment.internalNotes || appointment.patientRating || appointment.patientReview) && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <h4 className="text-sm font-bold text-[#151c27] mb-2 flex items-center gap-2">
                                        <span className="material-symbols-outlined text-[#1a56db]">notes</span> {modalTerms.summaryLabel}
                                    </h4>
                                    <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                                        <p className="text-xs font-semibold text-slate-500">{modalTerms.summaryLabel}:</p>
                                        <p className="text-sm text-slate-800">{appointment.treatmentSummary || 'None provided yet'}</p>
                                        {appointment.internalNotes && (
                                            <>
                                                <p className="text-xs font-semibold text-slate-500 pt-2 border-t border-slate-200">Internal Staff Notes:</p>
                                                <p className="text-sm text-slate-800">{appointment.internalNotes}</p>
                                            </>
                                        )}
                                    </div>
                                </div>

                                <div>
                                    <h4 className="text-sm font-bold text-[#151c27] mb-2 flex items-center gap-2">
                                        <span className="material-symbols-outlined text-[#f59e0b]">star</span> {modalTerms.feedbackTitle}
                                    </h4>
                                    <div className="p-3 bg-amber-50/50 border border-amber-200/60 rounded-xl space-y-2">
                                        {appointment.patientRating ? (
                                            <div>
                                                <div className="flex items-center gap-1 text-amber-500 mb-1">
                                                    {[1, 2, 3, 4, 5].map((s) => (
                                                        <span 
                                                            key={s} 
                                                            className="material-symbols-outlined text-[20px]"
                                                            style={{ fontVariationSettings: s <= appointment.patientRating ? "'FILL' 1" : "'FILL' 0" }}
                                                        >
                                                            star
                                                        </span>
                                                    ))}
                                                    <span className="text-xs font-bold text-amber-800 ml-2">({appointment.patientRating} / 5)</span>
                                                </div>
                                                <p className="text-xs text-slate-700 italic">"{appointment.patientReview || 'No written review'}"</p>
                                            </div>
                                        ) : (
                                            <div className="py-2 text-center text-xs text-slate-600">
                                                No feedback submitted yet.
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                <div className="px-6 py-4 border-t border-slate-100 flex justify-end gap-3 bg-slate-50">
                    {appointment && (
                        <button
                            onClick={() => downloadPDF(appointment)}
                            className="px-4 py-2 text-[#003fb1] hover:bg-[#003fb1]/10 rounded-xl text-sm font-semibold flex items-center gap-1.5 transition-colors"
                        >
                            <span className="material-symbols-outlined text-lg">download</span>
                            Download PDF
                        </button>
                    )}
                    <button
                        onClick={onClose}
                        className="px-6 py-2 bg-[#003fb1] text-white rounded-xl text-sm font-semibold hover:bg-[#002f87] transition-colors"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
}
