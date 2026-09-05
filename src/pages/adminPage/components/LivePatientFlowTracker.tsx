import React, { useState } from 'react';
import axios from 'axios';

interface LivePatientFlowDTO {
    id: number;
    time: string;
    patientName: string;
    patientId: string;
    service: string;
    providerName: string;
    status: string;
    billingStatus: string;
}

interface LivePatientFlowTrackerProps {
    flows: LivePatientFlowDTO[];
    onRefresh?: () => void;
}

export default function LivePatientFlowTracker({ flows = [], onRefresh }: LivePatientFlowTrackerProps) {
    const [openDropdown, setOpenDropdown] = useState<number | null>(null);
    const [detailsModal, setDetailsModal] = useState<LivePatientFlowDTO | null>(null);
    const [statusModal, setStatusModal] = useState<LivePatientFlowDTO | null>(null);
    const [newStatus, setNewStatus] = useState('');

    const toggleDropdown = (idx: number) => {
        if (openDropdown === idx) {
            setOpenDropdown(null);
        } else {
            setOpenDropdown(idx);
        }
    };

    const handleUpdateStatus = async () => {
        if (!statusModal || !newStatus) return;
        try {
            const token = localStorage.getItem('token');
            await axios.put(`http://localhost:8080/api/v1/admin/appointments/${statusModal.id}/status?status=${newStatus}`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setStatusModal(null);
            setNewStatus('');
            if (onRefresh) onRefresh();
        } catch (error) {
            console.error("Failed to update status", error);
            alert("Failed to update status. Please try again.");
        }
    };

    const handleCancelAppointment = async (id: number) => {
        if (!window.confirm("Are you sure you want to cancel this appointment?")) return;
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`http://localhost:8080/api/v1/admin/appointments/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (onRefresh) onRefresh();
        } catch (error) {
            console.error("Failed to cancel appointment", error);
            alert("Failed to cancel appointment.");
        }
    };

    const getStatusStyle = (status: string) => {
        if (status === 'IN_CONSULTATION') {
            return "bg-secondary/10 text-secondary border border-secondary/20";
        } else if (status === 'WAITING' || status === 'CHECKED_IN') {
            return "bg-error/10 text-error border border-error/20";
        } else if (status === 'COMPLETED') {
            return "bg-[#10b981]/10 text-[#10b981] border border-[#10b981]/20";
        }
        return "bg-surface-variant text-on-surface-variant border border-outline-variant";
    };

    const getBillingStyle = (billing: string) => {
        if (billing.includes("Stripe")) {
            return "text-[#6366f1]";
        } else if (billing.includes("eSewa")) {
            return "text-[#10b981]";
        } else if (billing.includes("Verified")) {
            return "text-primary";
        }
        return "text-on-surface-variant opacity-60";
    };

    const getBillingIcon = (billing: string) => {
        if (billing.includes("Stripe") || billing.includes("Verified")) {
            return "verified";
        } else if (billing.includes("eSewa")) {
            return "check_circle";
        }
        return "pending";
    };

    return (
        <div className="glass-card rounded-xl flex flex-col w-full h-full relative">
            <div className="p-6 border-b border-surface-container-high flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-primary">dynamic_feed</span>
                    <h2 className="font-headline-md text-headline-md">Live Patient Flow Tracker</h2>
                </div>
                <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-green-500"></span>
                    <span className="text-label-md font-mono-data">System Live</span>
                </div>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full min-w-[720px] text-left">
                    <thead className="bg-surface-container-low text-label-md text-on-surface-variant uppercase tracking-widest">
                        <tr>
                            <th className="px-6 py-4 font-semibold">Time</th>
                            <th className="px-6 py-4 font-semibold">Patient Name</th>
                            <th className="px-6 py-4 font-semibold">Service</th>
                            <th className="px-6 py-4 font-semibold">Assigned Provider</th>
                            <th className="px-6 py-4 font-semibold">Status</th>
                            <th className="px-6 py-4 font-semibold">Billing/Verification</th>
                            <th className="px-6 py-4 font-semibold">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-surface-container-high">
                        {flows.length === 0 ? (
                            <tr>
                                <td colSpan={7} className="px-6 py-8 text-center text-on-surface-variant">
                                    No patients for today.
                                </td>
                            </tr>
                        ) : flows.map((flow, idx) => (
                            <tr key={idx} className="hover:bg-surface-container-low transition-colors">
                                <td className="px-6 py-4 font-mono-data text-[13px] text-on-surface-variant">{flow.time}</td>
                                <td className="px-6 py-4">
                                    <p className="font-bold text-on-surface">{flow.patientName}</p>
                                    <p className="text-[11px] text-on-surface-variant">{flow.patientId}</p>
                                </td>
                                <td className="px-6 py-4 text-on-surface">{flow.service}</td>
                                <td className="px-6 py-4 text-on-surface">{flow.providerName}</td>
                                <td className="px-6 py-4">
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold ${getStatusStyle(flow.status)}`}>
                                        {flow.status.replace('_', ' ')}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`inline-flex items-center gap-1.5 font-mono-data text-[11px] ${getBillingStyle(flow.billingStatus)}`}>
                                        <span className="material-symbols-outlined text-[14px]">{getBillingIcon(flow.billingStatus)}</span>
                                        {flow.billingStatus}
                                    </span>
                                </td>
                                <td className="px-6 py-4 relative">
                                    <button 
                                        onClick={() => toggleDropdown(idx)}
                                        className="material-symbols-outlined text-on-surface-variant hover:text-primary p-2 rounded-full hover:bg-surface-container-high transition-colors">
                                        more_vert
                                    </button>
                                    
                                    {/* Dropdown Menu */}
                                    {openDropdown === idx && (
                                        <>
                                            <div 
                                                className="fixed inset-0 z-10" 
                                                onClick={() => setOpenDropdown(null)}
                                            ></div>
                                            <div className="absolute right-8 top-10 mt-2 w-48 bg-surface border border-outline-variant rounded-xl shadow-lg z-20 overflow-hidden py-1">
                                                <button 
                                                    className="w-full text-left px-4 py-2 text-sm text-on-surface hover:bg-surface-container-high flex items-center gap-2"
                                                    onClick={() => {
                                                        setDetailsModal(flow);
                                                        setOpenDropdown(null);
                                                    }}
                                                >
                                                    <span className="material-symbols-outlined text-[18px]">visibility</span>
                                                    View Details
                                                </button>
                                                <button 
                                                    className="w-full text-left px-4 py-2 text-sm text-on-surface hover:bg-surface-container-high flex items-center gap-2"
                                                    onClick={() => {
                                                        setStatusModal(flow);
                                                        setNewStatus(flow.status);
                                                        setOpenDropdown(null);
                                                    }}
                                                >
                                                    <span className="material-symbols-outlined text-[18px]">edit_calendar</span>
                                                    Update Status
                                                </button>
                                                <div className="border-t border-outline-variant my-1"></div>
                                                <button 
                                                    className="w-full text-left px-4 py-2 text-sm text-error hover:bg-error/10 flex items-center gap-2"
                                                    onClick={() => {
                                                        handleCancelAppointment(flow.id);
                                                        setOpenDropdown(null);
                                                    }}
                                                >
                                                    <span className="material-symbols-outlined text-[18px]">cancel</span>
                                                    Cancel Appointment
                                                </button>
                                            </div>
                                        </>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Details Modal */}
            {detailsModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                    <div className="bg-surface p-6 rounded-xl w-96 shadow-lg border border-surface-container-high">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-headline-sm text-on-surface">Appointment Details</h3>
                            <button onClick={() => setDetailsModal(null)} className="material-symbols-outlined text-on-surface-variant hover:text-error transition-colors">close</button>
                        </div>
                        <div className="space-y-3 text-sm text-on-surface">
                            <p><span className="font-bold text-on-surface-variant">Patient Name:</span> {detailsModal.patientName}</p>
                            <p><span className="font-bold text-on-surface-variant">Patient ID:</span> {detailsModal.patientId}</p>
                            <p><span className="font-bold text-on-surface-variant">Time:</span> {detailsModal.time}</p>
                            <p><span className="font-bold text-on-surface-variant">Service:</span> {detailsModal.service}</p>
                            <p><span className="font-bold text-on-surface-variant">Provider:</span> {detailsModal.providerName}</p>
                            <p><span className="font-bold text-on-surface-variant">Status:</span> {detailsModal.status}</p>
                            <p><span className="font-bold text-on-surface-variant">Billing:</span> {detailsModal.billingStatus}</p>
                        </div>
                        <button onClick={() => setDetailsModal(null)} className="mt-6 w-full py-2 bg-primary text-on-primary rounded font-bold hover:bg-primary/90 transition-colors">Close</button>
                    </div>
                </div>
            )}

            {/* Status Update Modal */}
            {statusModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                    <div className="bg-surface p-6 rounded-xl w-96 shadow-lg border border-surface-container-high">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-headline-sm text-on-surface">Update Status</h3>
                            <button onClick={() => setStatusModal(null)} className="material-symbols-outlined text-on-surface-variant hover:text-error transition-colors">close</button>
                        </div>
                        <p className="text-sm text-on-surface-variant mb-4">Select new status for <span className="font-bold text-on-surface">{statusModal.patientName}</span>'s appointment.</p>
                        <select 
                            value={newStatus}
                            onChange={(e) => setNewStatus(e.target.value)}
                            className="w-full bg-surface-container p-3 rounded border border-outline-variant text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all mb-6"
                        >
                            <option value="SCHEDULED">Scheduled</option>
                            <option value="CHECKED_IN">Checked In</option>
                            <option value="IN_CONSULTATION">In Consultation</option>
                            <option value="COMPLETED">Completed</option>
                        </select>
                        <div className="flex gap-2 justify-end">
                            <button onClick={() => setStatusModal(null)} className="px-4 py-2 border border-outline-variant text-on-surface rounded font-bold hover:bg-surface-container-low transition-colors">Cancel</button>
                            <button onClick={handleUpdateStatus} className="px-4 py-2 bg-primary text-on-primary rounded font-bold hover:bg-primary/90 transition-colors">Update</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
