import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useOrganizationTerms } from '../../../utils/organizationTerms';

interface PolicyData {
    tenantId?: number;
    organizationName?: string;
    organizationType?: string;
    cancellationAllowed: boolean;
    cancellationDeadlineHours: number;
    fullRefundHours: number;
    partialRefundPercentage: number;
    lateRefundPercentage: number;
    reschedulingAllowed: boolean;
    maxReschedules: number;
    reschedulingDeadlineHours: number;
    autoProcessRefunds: boolean;
    noShowGracePeriodMinutes?: number;
    noShowRefundPercentage: number;
    autoClassifyNoShow: boolean;
}

interface Props {
    showToast: (message: string, type?: 'success' | 'error') => void;
}

export default function CancellationPolicyConfig({ showToast }: Props) {
    const terms = useOrganizationTerms();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [policy, setPolicy] = useState<PolicyData>({
        cancellationAllowed: true,
        cancellationDeadlineHours: 6,
        fullRefundHours: 24,
        partialRefundPercentage: 50.0,
        lateRefundPercentage: 0.0,
        reschedulingAllowed: true,
        maxReschedules: 2,
        reschedulingDeadlineHours: 6,
        autoProcessRefunds: true,
        noShowGracePeriodMinutes: 15,
        noShowRefundPercentage: 0.0,
        autoClassifyNoShow: true
    });

    useEffect(() => {
        fetchPolicy();
    }, []);

    const fetchPolicy = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get('http://localhost:8080/api/v1/admin/appointment-policy', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.data?.success && res.data.policy) {
                setPolicy(res.data.policy);
            }
        } catch (err: any) {
            console.error('Failed to load cancellation policy', err);
            showToast('Using default lifecycle rules (could not load remote policy)', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const token = localStorage.getItem('token');
            const res = await axios.put('http://localhost:8080/api/v1/admin/appointment-policy', policy, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.data?.success) {
                showToast('Cancellation & Refund policy updated successfully!', 'success');
                if (res.data.policy) {
                    setPolicy(res.data.policy);
                }
            } else {
                showToast(res.data?.message || 'Failed to update policy', 'error');
            }
        } catch (err: any) {
            console.error('Save policy error', err);
            showToast(err.response?.data?.message || 'Failed to save policy settings', 'error');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center p-16 space-y-4">
                <div className="w-10 h-10 border-4 border-[#003fb1] border-t-transparent rounded-full animate-spin"></div>
                <p className="text-sm font-semibold text-on-surface-variant">Loading lifecycle and refund configurations...</p>
            </div>
        );
    }

    return (
        <div className="p-8 space-y-8">
            {/* Header Banner */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-2xl bg-gradient-to-r from-blue-900 to-indigo-950 text-white shadow-lg relative overflow-hidden">
                <div className="relative z-10 space-y-1">
                    <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-amber-400">rule_settings</span>
                        <span className="text-xs font-bold uppercase tracking-widest text-blue-200">
                            Lifecycle Governance • {terms.orgType}
                        </span>
                    </div>
                    <h3 className="text-2xl font-bold tracking-tight">Cancellation, Rescheduling &amp; Refund Rules</h3>
                    <p className="text-sm text-blue-100/80 max-w-2xl">
                        Define automated cutoff windows, tiered refund percentages, and rescheduling allowances for your {terms.customerPlural.toLowerCase()}.
                        Cancellations automatically release slot capacity back to the booking pool in real time.
                    </p>
                </div>
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="relative z-10 px-6 py-3 bg-white text-[#003fb1] rounded-xl font-bold hover:bg-blue-50 transition-all flex items-center justify-center gap-2 shadow-md active:scale-95 disabled:opacity-50 whitespace-nowrap self-start md:self-auto cursor-pointer"
                >
                    <span className="material-symbols-outlined text-[20px]">{saving ? 'sync' : 'save'}</span>
                    {saving ? 'Saving...' : 'Save Policy'}
                </button>
            </div>

            {/* Policy Configuration Sections */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* 1. Cancellation & Refund Policy */}
                <div className="bg-white rounded-2xl border border-outline-variant p-6 shadow-sm space-y-6">
                    <div className="flex items-center justify-between pb-4 border-b border-outline-variant">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-red-50 text-red-600 flex items-center justify-center font-bold">
                                <span className="material-symbols-outlined">event_busy</span>
                            </div>
                            <div>
                                <h4 className="text-base font-bold text-on-surface">Cancellation Policy</h4>
                                <p className="text-xs text-on-surface-variant">Control user cancellation eligibility &amp; deadlines</p>
                            </div>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                checked={policy.cancellationAllowed}
                                onChange={(e) => setPolicy({ ...policy, cancellationAllowed: e.target.checked })}
                                className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                        </label>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-1.5">
                                Cancellation Cutoff Deadline (Hours Before {terms.appointmentSingular})
                            </label>
                            <div className="relative">
                                <input
                                    type="number"
                                    min="0"
                                    max="168"
                                    value={policy.cancellationDeadlineHours}
                                    onChange={(e) => setPolicy({ ...policy, cancellationDeadlineHours: Math.max(0, parseInt(e.target.value) || 0) })}
                                    className="w-full px-4 py-3 bg-surface-container-lowest border border-outline-variant rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-primary/20"
                                />
                                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-on-surface-variant">Hours</span>
                            </div>
                            <p className="text-[11px] text-on-surface-variant mt-1">
                                Cancellations within this window receive late cancellation tier (0% refund).
                            </p>
                        </div>

                        {/* Tiered Refund Table Preview in Editor */}
                        <div className="pt-2">
                            <label className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-2">
                                Tiered Refund Schedule
                            </label>
                            <div className="rounded-xl border border-outline-variant overflow-hidden">
                                <table className="w-full text-left text-xs">
                                    <thead className="bg-surface-container-low text-on-surface font-bold uppercase tracking-wider border-b border-outline-variant">
                                        <tr>
                                            <th className="py-2.5 px-4">Cancellation Time</th>
                                            <th className="py-2.5 px-4 text-right">Refund %</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-outline-variant">
                                        <tr className="bg-emerald-50/40">
                                            <td className="py-3 px-4 font-semibold text-emerald-900">
                                                <div className="flex items-center gap-2">
                                                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                                                    <span>{policy.fullRefundHours}+ hours before appointment</span>
                                                </div>
                                            </td>
                                            <td className="py-3 px-4 text-right font-black text-emerald-700">100% (Full)</td>
                                        </tr>
                                        <tr className="bg-blue-50/40">
                                            <td className="py-3 px-4 font-semibold text-blue-900">
                                                <div className="flex items-center gap-2">
                                                    <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                                                    <span>{policy.cancellationDeadlineHours}–{policy.fullRefundHours} hours before appointment</span>
                                                </div>
                                            </td>
                                            <td className="py-3 px-4 text-right font-black text-blue-700">
                                                <input
                                                    type="number"
                                                    min="0"
                                                    max="100"
                                                    value={policy.partialRefundPercentage}
                                                    onChange={(e) => setPolicy({ ...policy, partialRefundPercentage: parseFloat(e.target.value) || 0 })}
                                                    className="w-16 px-2 py-1 text-right font-bold bg-white border border-blue-300 rounded text-blue-800"
                                                />%
                                            </td>
                                        </tr>
                                        <tr className="bg-amber-50/40">
                                            <td className="py-3 px-4 font-semibold text-amber-900">
                                                <div className="flex items-center gap-2">
                                                    <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                                                    <span>Less than {policy.cancellationDeadlineHours} hours before</span>
                                                </div>
                                            </td>
                                            <td className="py-3 px-4 text-right font-black text-amber-700">
                                                {policy.lateRefundPercentage}%
                                            </td>
                                        </tr>
                                        <tr className="bg-slate-50">
                                            <td className="py-3 px-4 font-semibold text-slate-700">
                                                <div className="flex items-center gap-2">
                                                    <span className="w-2 h-2 rounded-full bg-slate-400"></span>
                                                    <div>
                                                        <span className="font-bold">No-Show / Unattended</span>
                                                        <p className="text-[10px] text-slate-500 font-normal">Grace window: {policy.noShowGracePeriodMinutes || 15}m (Configured in Operating Hours)</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="py-3 px-4 text-right font-black text-slate-700">
                                                <div className="flex items-center justify-end gap-1">
                                                    <input
                                                        type="number"
                                                        min="0"
                                                        max="100"
                                                        value={policy.noShowRefundPercentage ?? 0}
                                                        onChange={(e) => setPolicy({ ...policy, noShowRefundPercentage: parseFloat(e.target.value) || 0 })}
                                                        className="w-16 px-2 py-1 text-right font-bold bg-white border border-slate-300 rounded text-slate-800"
                                                    />%
                                                </div>
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Full Refund Hours Input */}
                        <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-1.5">
                                Full Refund Window Threshold
                            </label>
                            <div className="relative">
                                <input
                                    type="number"
                                    min="1"
                                    max="336"
                                    value={policy.fullRefundHours}
                                    onChange={(e) => setPolicy({ ...policy, fullRefundHours: Math.max(1, parseInt(e.target.value) || 24) })}
                                    className="w-full px-4 py-3 bg-surface-container-lowest border border-outline-variant rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-primary/20"
                                />
                                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-on-surface-variant">Hours (default 24)</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 2. Rescheduling Policy */}
                <div className="bg-white rounded-2xl border border-outline-variant p-6 shadow-sm space-y-6">
                    <div className="flex items-center justify-between pb-4 border-b border-outline-variant">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
                                <span className="material-symbols-outlined">edit_calendar</span>
                            </div>
                            <div>
                                <h4 className="text-base font-bold text-on-surface">Rescheduling Policy</h4>
                                <p className="text-xs text-on-surface-variant">Control reschedule limits and advance notice</p>
                            </div>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                checked={policy.reschedulingAllowed}
                                onChange={(e) => setPolicy({ ...policy, reschedulingAllowed: e.target.checked })}
                                className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                        </label>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-1.5">
                                Maximum Reschedules Per {terms.appointmentSingular}
                            </label>
                            <input
                                type="number"
                                min="0"
                                max="10"
                                value={policy.maxReschedules}
                                onChange={(e) => setPolicy({ ...policy, maxReschedules: Math.max(0, parseInt(e.target.value) || 0) })}
                                className="w-full px-4 py-3 bg-surface-container-lowest border border-outline-variant rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-primary/20"
                            />
                            <p className="text-[11px] text-on-surface-variant mt-1">
                                Default is 2. After this limit is reached, {terms.customerPlural.toLowerCase()} cannot reschedule again without admin intervention.
                            </p>
                        </div>

                        <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-1.5">
                                Rescheduling Advance Notice Required
                            </label>
                            <div className="relative">
                                <input
                                    type="number"
                                    min="0"
                                    max="168"
                                    value={policy.reschedulingDeadlineHours}
                                    onChange={(e) => setPolicy({ ...policy, reschedulingDeadlineHours: Math.max(0, parseInt(e.target.value) || 0) })}
                                    className="w-full px-4 py-3 bg-surface-container-lowest border border-outline-variant rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-primary/20"
                                />
                                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-on-surface-variant">Hours (default 6)</span>
                            </div>
                            <p className="text-[11px] text-on-surface-variant mt-1">
                                {terms.customerPlural} must reschedule at least this many hours before their existing slot.
                            </p>
                        </div>

                        {/* Automatic Refund Processing Toggle */}
                        <div className="p-4 rounded-xl bg-surface-container-low border border-outline-variant space-y-2 mt-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <span className="material-symbols-outlined text-primary text-[20px]">account_balance</span>
                                    <span className="text-sm font-bold text-on-surface">Auto-Process Gateway Refunds</span>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={policy.autoProcessRefunds}
                                        onChange={(e) => setPolicy({ ...policy, autoProcessRefunds: e.target.checked })}
                                        className="sr-only peer"
                                    />
                                    <div className="w-10 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary"></div>
                                </label>
                            </div>
                            <p className="text-xs text-on-surface-variant leading-relaxed">
                                When enabled, Stripe USD refunds and eSewa refund transactions are triggered immediately upon cancellation confirmation without manual admin review.
                            </p>
                        </div>
                        {/* Auto-Classify No-Show Toggle & Grace Notice */}
                        <div className="p-4 rounded-xl bg-amber-50/60 border border-amber-200/70 space-y-2.5 mt-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <span className="material-symbols-outlined text-amber-700 text-[20px]">person_cancel</span>
                                    <span className="text-sm font-bold text-amber-950">Auto-Classify Missed Sessions as No-Show</span>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={policy.autoClassifyNoShow}
                                        onChange={(e) => setPolicy({ ...policy, autoClassifyNoShow: e.target.checked })}
                                        className="sr-only peer"
                                    />
                                    <div className="w-10 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-amber-600"></div>
                                </label>
                            </div>
                            <p className="text-xs text-amber-900 leading-relaxed">
                                Unattended bookings are automatically classified as <strong>No-Show</strong> after the grace period 
                                configured in <strong>Operating Hours</strong> ({policy.noShowGracePeriodMinutes || 15} mins).
                                The system updates status, evaluates refund eligibility ({policy.noShowRefundPercentage || 0}%), and synchronizes settlement ledgers.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* 3. Live Customer Policy Preview Card */}
            <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-2xl p-6 shadow-md border border-slate-700">
                <div className="flex items-center gap-2 mb-3">
                    <span className="material-symbols-outlined text-teal-400">preview</span>
                    <h4 className="text-sm font-bold uppercase tracking-wider text-teal-300">
                        {terms.customerSingular} Transparency Preview
                    </h4>
                </div>
                <p className="text-xs text-slate-300 mb-4">
                    Here is how your cancellation, rescheduling, and No-Show policy will be communicated to {terms.customerPlural.toLowerCase()} during booking and in their appointment history:
                </p>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
                    <div className="bg-slate-800/80 p-4 rounded-xl border border-slate-700">
                        <div className="flex items-center gap-2 text-emerald-400 font-bold mb-1">
                            <span className="material-symbols-outlined text-[18px]">verified</span>
                            <span>Full Refund (100%)</span>
                        </div>
                        <p className="text-slate-300">
                            Available if cancelled at least <strong className="text-white">{policy.fullRefundHours} hours</strong> before the scheduled appointment.
                        </p>
                    </div>

                    <div className="bg-slate-800/80 p-4 rounded-xl border border-slate-700">
                        <div className="flex items-center gap-2 text-blue-400 font-bold mb-1">
                            <span className="material-symbols-outlined text-[18px]">percent</span>
                            <span>Partial Refund ({policy.partialRefundPercentage}%)</span>
                        </div>
                        <p className="text-slate-300">
                            Applied if cancelled between <strong className="text-white">{policy.cancellationDeadlineHours}h and {policy.fullRefundHours}h</strong> prior to arrival.
                        </p>
                    </div>

                    <div className="bg-slate-800/80 p-4 rounded-xl border border-slate-700">
                        <div className="flex items-center gap-2 text-amber-400 font-bold mb-1">
                            <span className="material-symbols-outlined text-[18px]">schedule</span>
                            <span>Reschedule Allowance</span>
                        </div>
                        <p className="text-slate-300">
                            Up to <strong className="text-white">{policy.maxReschedules} reschedules</strong> permitted at least <strong className="text-white">{policy.reschedulingDeadlineHours}h</strong> in advance.
                        </p>
                    </div>

                    <div className="bg-slate-800/80 p-4 rounded-xl border border-slate-700">
                        <div className="flex items-center gap-2 text-violet-400 font-bold mb-1">
                            <span className="material-symbols-outlined text-[18px]">person_off</span>
                            <span>No-Show Policy ({policy.noShowRefundPercentage || 0}%)</span>
                        </div>
                        <p className="text-slate-300">
                            Classified after <strong className="text-white">{policy.noShowGracePeriodMinutes || 15}m</strong> grace window. {policy.noShowRefundPercentage > 0 ? `${policy.noShowRefundPercentage}% partial refund returned to source.` : '0% refund (time & facility reserved).'}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
