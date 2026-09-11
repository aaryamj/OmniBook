import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useOrganizationTerms } from '../../../utils/organizationTerms';

interface ProviderInfo {
    id: number;
    name: string;
    email: string;
    primarySpecialty?: string;
    medicalLicense?: string;
    profilePictureUrl?: string;
    commissionRate?: number | null;
    effectiveCommissionRate?: number | null;
}

interface SetProviderCommissionModalProps {
    provider: ProviderInfo;
    onClose: () => void;
    onSuccess: () => void;
}

export default function SetProviderCommissionModal({
    provider,
    onClose,
    onSuccess
}: SetProviderCommissionModalProps) {
    const terms = useOrganizationTerms();

    // Mode: 'ORG_DEFAULT' vs 'CUSTOM'
    const hasCustomInitial = provider.commissionRate !== null && provider.commissionRate !== undefined;
    const [mode, setMode] = useState<'ORG_DEFAULT' | 'CUSTOM'>(hasCustomInitial ? 'CUSTOM' : 'ORG_DEFAULT');
    const [customRate, setCustomRate] = useState<string>(
        hasCustomInitial ? String(provider.commissionRate) : '12.5'
    );
    const [orgDefaultRate, setOrgDefaultRate] = useState<number>(10.0);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    // Interactive Preview Simulator state
    const [simGross, setSimGross] = useState<number>(1000);
    const [simRefundPercent, setSimRefundPercent] = useState<number>(50);

    // Fetch tenant default policy for baseline rate
    useEffect(() => {
        const fetchTenantPolicy = async () => {
            try {
                const token = localStorage.getItem('token');
                const res = await axios.get('http://localhost:8080/api/v1/admin/appointment-policy', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                const policy = res.data?.policy || res.data;
                if (policy && policy.defaultCommissionRate != null) {
                    setOrgDefaultRate(policy.defaultCommissionRate);
                }
            } catch (err) {
                console.warn("Could not fetch tenant policy default commission, using 10.0%", err);
            }
        };
        fetchTenantPolicy();
    }, []);

    // Effective active rate selected in modal
    const activeRate = mode === 'ORG_DEFAULT' 
        ? orgDefaultRate 
        : Math.max(0, Math.min(100, parseFloat(customRate) || 0));

    // Live settlement calculations
    const simRefundAmount = Math.round((simGross * (simRefundPercent / 100)) * 100) / 100;
    const simNetRetained = Math.max(0, Math.round((simGross - simRefundAmount) * 100) / 100);
    const simPlatformRate = 10.0; // Platform baseline fee (10%)
    const simPlatformCommission = Math.round((simNetRetained * (simPlatformRate / 100)) * 100) / 100;
    const simGatewayFee = simNetRetained > 0 ? Math.round((simNetRetained * 0.02) * 100) / 100 : 0; // 2% eSewa preview
    const simRemainingOrg = Math.max(0, Math.round((simNetRetained - simPlatformCommission - simGatewayFee) * 100) / 100);
    const simProviderPayout = Math.round((simRemainingOrg * (activeRate / 100)) * 100) / 100;
    const simOrgAdminPayout = Math.max(0, Math.round((simRemainingOrg - simProviderPayout) * 100) / 100);

    const handleSave = async () => {
        setErrorMsg(null);
        setIsSubmitting(true);

        try {
            const token = localStorage.getItem('token');
            const payload = {
                commissionRate: mode === 'ORG_DEFAULT' ? null : (parseFloat(customRate) || 0)
            };

            await axios.put(
                `http://localhost:8080/api/v1/admin/providers/${provider.id}/commission`,
                payload,
                { headers: { 'Authorization': `Bearer ${token}` } }
            );

            onSuccess();
        } catch (err: any) {
            console.error("Failed to update commission rate", err);
            const msg = err.response?.data?.message || err.message || "Failed to update commission rate";
            setErrorMsg(msg);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
            <div 
                className="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="px-6 py-5 border-b border-outline-variant/20 flex items-center justify-between bg-gradient-to-r from-primary/5 via-primary/0 to-transparent">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-semibold">
                            <span className="material-symbols-outlined text-[22px]">percent</span>
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-on-surface">Configure {terms.providerSingular} Commission Share</h2>
                            <p className="text-xs text-on-surface-variant">
                                Set service revenue share for {terms.providerSingular} <span className="font-semibold text-primary">{provider.name}</span>
                            </p>
                        </div>
                    </div>
                    <button 
                        onClick={onClose}
                        className="p-1.5 rounded-lg hover:bg-surface-container text-on-surface-variant hover:text-on-surface transition-colors"
                    >
                        <span className="material-symbols-outlined text-[20px]">close</span>
                    </button>
                </div>

                {/* Body */}
                <div className="p-6 overflow-y-auto space-y-6">
                    {/* Error Banner */}
                    {errorMsg && (
                        <div className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 rounded-xl text-xs text-red-700 dark:text-red-300 flex items-center gap-2">
                            <span className="material-symbols-outlined text-[18px]">error</span>
                            <span>{errorMsg}</span>
                        </div>
                    )}

                    {/* Provider Info Strip */}
                    <div className="flex items-center gap-4 p-3.5 bg-surface-container-low rounded-xl border border-outline-variant/20">
                        {provider.profilePictureUrl ? (
                            <img 
                                src={provider.profilePictureUrl} 
                                alt={provider.name} 
                                className="w-12 h-12 rounded-full object-cover border border-primary/20"
                            />
                        ) : (
                            <div className="w-12 h-12 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center text-base">
                                {provider.name.charAt(0)}
                            </div>
                        )}
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                                <h4 className="text-sm font-semibold text-on-surface truncate">{provider.name}</h4>
                                <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                                    {terms.providerSingular}
                                </span>
                            </div>
                            <p className="text-xs text-on-surface-variant truncate">{provider.email}</p>
                            {provider.primarySpecialty && (
                                <p className="text-[11px] text-on-surface-variant/80 mt-0.5">
                                    Specialty: {provider.primarySpecialty}
                                </p>
                            )}
                        </div>
                        <div className="text-right">
                            <span className="text-[10px] text-on-surface-variant block uppercase font-medium">Current Share</span>
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${
                                hasCustomInitial 
                                    ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-300 dark:border-amber-800' 
                                    : 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-300 dark:border-blue-800'
                            }`}>
                                {hasCustomInitial ? `${provider.commissionRate}% Custom` : `${orgDefaultRate}% Org Default`}
                            </span>
                        </div>
                    </div>

                    {/* Rate Selection Mode */}
                    <div className="space-y-3">
                        <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">
                            Revenue Share Structure
                        </label>
                        <div className="grid grid-cols-2 gap-3">
                            {/* Option 1: Org Default */}
                            <button
                                type="button"
                                onClick={() => setMode('ORG_DEFAULT')}
                                className={`p-3.5 rounded-xl border text-left transition-all flex flex-col justify-between ${
                                    mode === 'ORG_DEFAULT'
                                        ? 'border-primary bg-primary/5 ring-2 ring-primary/20 shadow-sm'
                                        : 'border-outline-variant/30 bg-surface-container-low hover:bg-surface-container'
                                }`}
                            >
                                <div className="flex items-center justify-between w-full mb-1">
                                    <span className="text-xs font-semibold text-on-surface">Organization Default</span>
                                    <span className={`material-symbols-outlined text-[18px] ${mode === 'ORG_DEFAULT' ? 'text-primary' : 'text-outline-variant'}`}>
                                        {mode === 'ORG_DEFAULT' ? 'radio_button_checked' : 'radio_button_unchecked'}
                                    </span>
                                </div>
                                <div className="flex items-baseline gap-1 mt-1">
                                    <span className="text-xl font-bold text-primary">{orgDefaultRate}%</span>
                                    <span className="text-[11px] text-on-surface-variant">share</span>
                                </div>
                                <p className="text-[10px] text-on-surface-variant mt-1.5">
                                    Inherits standard {terms.organizationType} provider share rate.
                                </p>
                            </button>

                            {/* Option 2: Custom Rate */}
                            <button
                                type="button"
                                onClick={() => setMode('CUSTOM')}
                                className={`p-3.5 rounded-xl border text-left transition-all flex flex-col justify-between ${
                                    mode === 'CUSTOM'
                                        ? 'border-primary bg-primary/5 ring-2 ring-primary/20 shadow-sm'
                                        : 'border-outline-variant/30 bg-surface-container-low hover:bg-surface-container'
                                }`}
                            >
                                <div className="flex items-center justify-between w-full mb-1">
                                    <span className="text-xs font-semibold text-on-surface">Custom Rate</span>
                                    <span className={`material-symbols-outlined text-[18px] ${mode === 'CUSTOM' ? 'text-primary' : 'text-outline-variant'}`}>
                                        {mode === 'CUSTOM' ? 'radio_button_checked' : 'radio_button_unchecked'}
                                    </span>
                                </div>
                                <div className="flex items-baseline gap-1 mt-1">
                                    <span className="text-xl font-bold text-on-surface">
                                        {mode === 'CUSTOM' ? (parseFloat(customRate) || 0) : customRate}%
                                    </span>
                                    <span className="text-[11px] text-amber-600 font-medium">override</span>
                                </div>
                                <p className="text-[10px] text-on-surface-variant mt-1.5">
                                    Custom percentage paid to this {terms.providerSingular}.
                                </p>
                            </button>
                        </div>
                    </div>

                    {/* Custom Rate Input & Presets (Visible when CUSTOM) */}
                    {mode === 'CUSTOM' && (
                        <div className="space-y-3 p-4 bg-surface-container-low rounded-xl border border-primary/20 animate-fade-in">
                            <label className="text-xs font-semibold text-on-surface flex items-center justify-between">
                                <span>{terms.providerSingular} Share Percentage (%)</span>
                                <span className="text-[11px] text-on-surface-variant">Min: 0% — Max: 100%</span>
                            </label>
                            <div className="relative">
                                <input
                                    type="number"
                                    min="0"
                                    max="100"
                                    step="0.5"
                                    value={customRate}
                                    onChange={(e) => setCustomRate(e.target.value)}
                                    placeholder="Enter rate e.g. 10"
                                    className="w-full px-4 py-2.5 text-base font-bold bg-surface-container-lowest border border-outline-variant rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary pr-12 text-on-surface"
                                />
                                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-bold text-on-surface-variant">
                                    %
                                </span>
                            </div>

                            {/* Quick Presets */}
                            <div className="flex items-center gap-2 pt-1">
                                <span className="text-[11px] text-on-surface-variant font-medium">Presets:</span>
                                {[10, 20, 40, 50, 70, 80].map((preset) => (
                                    <button
                                        key={preset}
                                        type="button"
                                        onClick={() => setCustomRate(String(preset))}
                                        className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-colors ${
                                            parseFloat(customRate) === preset
                                                ? 'bg-primary text-white shadow-sm'
                                                : 'bg-surface-container hover:bg-surface-container-high text-on-surface'
                                        }`}
                                    >
                                        {preset}%
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Historical Preservation Notice with High Contrast */}
                    <div className="p-3.5 bg-blue-100/90 dark:bg-blue-950/70 border border-blue-400 dark:border-blue-700 rounded-xl flex items-start gap-3 shadow-xs">
                        <span className="material-symbols-outlined text-blue-700 dark:text-blue-300 text-[20px] mt-0.5 shrink-0">
                            info
                        </span>
                        <div className="text-xs text-blue-950 dark:text-blue-100 leading-relaxed">
                            <span className="font-bold">Future Transactions Only:</span> Updating this rate to <strong>{activeRate}%</strong> takes effect on all new transactions. Previously completed appointments, refunds, and settlements permanently preserve their historical commission stamps.
                        </div>
                    </div>

                    {/* Live Interactive Settlement Calculator Simulator */}
                    <div className="space-y-3 p-4 bg-surface-container-low rounded-xl border border-outline-variant/30">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <span className="material-symbols-outlined text-primary text-[18px]">calculate</span>
                                <h4 className="text-xs font-bold uppercase tracking-wider text-on-surface">
                                    Settlement Formula Simulator
                                </h4>
                            </div>
                            <span className="text-[11px] font-semibold text-primary px-2 py-0.5 rounded bg-primary/10">
                                {activeRate}% {terms.providerSingular} Share
                            </span>
                        </div>

                        {/* Simulator Controls */}
                        <div className="grid grid-cols-2 gap-3 pt-1">
                            <div>
                                <label className="text-[11px] text-on-surface-variant block mb-1">Gross Booking (NPR)</label>
                                <input
                                    type="number"
                                    min="100"
                                    step="100"
                                    value={simGross}
                                    onChange={(e) => setSimGross(Math.max(0, parseFloat(e.target.value) || 0))}
                                    className="w-full px-3 py-1.5 text-xs font-semibold bg-surface-container-lowest border border-outline-variant rounded-lg"
                                />
                            </div>
                            <div>
                                <label className="text-[11px] text-on-surface-variant block mb-1">Refund Scenario</label>
                                <div className="flex gap-1.5">
                                    {[
                                        { label: '0%', val: 0 },
                                        { label: '50%', val: 50 },
                                        { label: '100%', val: 100 }
                                    ].map(scenario => (
                                        <button
                                            key={scenario.val}
                                            type="button"
                                            onClick={() => setSimRefundPercent(scenario.val)}
                                            className={`flex-1 py-1.5 text-[11px] font-semibold rounded-lg transition-colors ${
                                                simRefundPercent === scenario.val
                                                    ? 'bg-primary text-white shadow-xs'
                                                    : 'bg-surface-container hover:bg-surface-container-high text-on-surface'
                                            }`}
                                        >
                                            {scenario.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Step-by-Step Formula Output */}
                        <div className="mt-3 p-3.5 bg-surface-container-lowest rounded-lg border border-outline-variant/20 space-y-2 font-mono text-xs">
                            <div className="flex justify-between text-on-surface-variant">
                                <span>Gross Booking Amount:</span>
                                <span className="font-semibold text-on-surface">NPR {simGross.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between text-red-600 dark:text-red-400">
                                <span>Refund Amount ({simRefundPercent}%):</span>
                                <span>- NPR {simRefundAmount.toLocaleString()}</span>
                            </div>
                            <div className="h-px bg-outline-variant/30 my-1"></div>
                            <div className="flex justify-between font-bold text-on-surface">
                                <span>Net Retained Amount:</span>
                                <span className="text-primary">NPR {simNetRetained.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between text-amber-700 dark:text-amber-400">
                                <span>Platform Commission (10%):</span>
                                <span>- NPR {simPlatformCommission.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between text-on-surface-variant">
                                <span>Applicable Gateway Fees (eSewa 2%):</span>
                                <span>- NPR {simGatewayFee.toLocaleString()}</span>
                            </div>
                            <div className="h-px bg-outline-variant/30 my-1"></div>
                            <div className="flex justify-between font-bold text-purple-700 dark:text-purple-300 py-0.5">
                                <span>Gross Remaining Organization Amount:</span>
                                <span>NPR {simRemainingOrg.toLocaleString()}</span>
                            </div>
                            <div className="h-px bg-outline-variant/30 my-1"></div>
                            <div className="flex justify-between font-bold text-sm text-green-700 dark:text-green-400 pt-0.5">
                                <span>Net {terms.providerSingular} ({activeRate}%):</span>
                                <span>NPR {simProviderPayout.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between font-bold text-sm text-blue-700 dark:text-blue-400">
                                <span>Net Organization Admin ({Math.max(0, Math.round((100 - activeRate) * 10) / 10)}%):</span>
                                <span>NPR {simOrgAdminPayout.toLocaleString()}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="px-6 py-4 border-t border-outline-variant/20 bg-surface-container-low flex items-center justify-end gap-3">
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={isSubmitting}
                        className="px-4 py-2 text-xs font-semibold text-on-surface hover:bg-surface-container rounded-xl transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        type="button"
                        onClick={handleSave}
                        disabled={isSubmitting}
                        className="px-5 py-2 text-xs font-semibold bg-primary hover:bg-primary/90 text-white rounded-xl transition-all shadow-md shadow-primary/20 flex items-center gap-2 disabled:opacity-50"
                    >
                        {isSubmitting ? (
                            <>
                                <span className="inline-block w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                                <span>Saving...</span>
                            </>
                        ) : (
                            <>
                                <span className="material-symbols-outlined text-[16px]">save</span>
                                <span>Save Commission Rate</span>
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
