import React, { useState, useEffect } from 'react';
import axios from 'axios';

interface DailySchedule {
    id?: number;
    dayOfWeek: string;
    isActive: boolean;
    openingTime: string;
    closingTime: string;
    breakStartTime: string;
    breakEndTime: string;
    closedMessage?: string;
    isTenantActive?: boolean;
}

interface ScheduleSettings {
    timezone: string;
    slotDuration: number;
    schedules: DailySchedule[];
}

interface ProviderScheduleModalProps {
    providerId: number;
    providerName: string;
    onClose: () => void;
}

export default function ProviderScheduleModal({ providerId, providerName, onClose }: ProviderScheduleModalProps) {
    const [timezone, setTimezone] = useState("Asia/Kathmandu");
    const [schedules, setSchedules] = useState<DailySchedule[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');

    useEffect(() => {
        fetchScheduleSettings();
    }, [providerId]);

    const fetchScheduleSettings = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const response = await axios.get(`http://localhost:8080/api/v1/admin/providers/${providerId}/schedule`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data: ScheduleSettings = response.data;
            setTimezone(data.timezone);
            
            // Format time strings from HH:mm:ss to HH:mm
            const formattedSchedules = data.schedules.map(schedule => {
                const activeVal = (schedule as any).isActive !== undefined 
                    ? (schedule as any).isActive 
                    : (schedule as any).active;
                const tenantActiveVal = (schedule as any).isTenantActive !== undefined 
                    ? Boolean((schedule as any).isTenantActive) 
                    : true;
                return {
                    ...schedule,
                    isTenantActive: tenantActiveVal,
                    isActive: tenantActiveVal ? Boolean(activeVal) : false,
                    openingTime: schedule.openingTime ? schedule.openingTime.substring(0, 5) : "09:00",
                    closingTime: schedule.closingTime ? schedule.closingTime.substring(0, 5) : "17:00",
                    breakStartTime: schedule.breakStartTime ? schedule.breakStartTime.substring(0, 5) : "13:00",
                    breakEndTime: schedule.breakEndTime ? schedule.breakEndTime.substring(0, 5) : "14:00"
                };
            });
            
            // Sort schedules properly
            const daysOrder = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
            formattedSchedules.sort((a, b) => daysOrder.indexOf(a.dayOfWeek) - daysOrder.indexOf(b.dayOfWeek));
            
            setSchedules(formattedSchedules);
        } catch (error) {
            console.error("Failed to fetch provider schedule settings", error);
            setErrorMessage("Failed to load schedule settings.");
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        try {
            setSaving(true);
            setSuccessMessage('');
            setErrorMessage('');
            const token = localStorage.getItem('token');
            
            // Validate break times
            for (const s of schedules) {
                if (s.isActive) {
                    if (s.breakStartTime < s.openingTime || s.breakEndTime > s.closingTime) {
                        setErrorMessage(`Break time must be within operating hours on ${s.dayOfWeek}`);
                        setSaving(false);
                        return;
                    }
                    if (s.breakStartTime >= s.breakEndTime) {
                        setErrorMessage(`Break start time must be before break end time on ${s.dayOfWeek}`);
                        setSaving(false);
                        return;
                    }
                }
            }
            
            const payload: any = {
                timezone,
                slotDuration: 30,
                schedules: schedules.map(s => ({
                    ...s,
                    isActive: Boolean(s.isActive),
                    active: Boolean(s.isActive),
                    openingTime: s.openingTime.length === 5 ? `${s.openingTime}:00` : s.openingTime,
                    closingTime: s.closingTime.length === 5 ? `${s.closingTime}:00` : s.closingTime,
                    breakStartTime: s.breakStartTime.length === 5 ? `${s.breakStartTime}:00` : s.breakStartTime,
                    breakEndTime: s.breakEndTime.length === 5 ? `${s.breakEndTime}:00` : s.breakEndTime,
                }))
            };
            
            await axios.put(`http://localhost:8080/api/v1/admin/providers/${providerId}/schedule`, payload, {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            setSuccessMessage('Schedule saved successfully!');
            setTimeout(() => setSuccessMessage(''), 3000);
        } catch (error: any) {
            console.error("Failed to save provider schedule settings", error);
            const msg = error?.response?.data?.message || error?.response?.data?.error || error?.message || "Failed to save schedule settings.";
            setErrorMessage(msg);
        } finally {
            setSaving(false);
        }
    };

    const updateSchedule = (index: number, field: keyof DailySchedule, value: any) => {
        const updatedSchedules = [...schedules];
        updatedSchedules[index] = { ...updatedSchedules[index], [field]: value };
        setSchedules(updatedSchedules);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-surface-container-lowest w-full max-w-5xl rounded-2xl shadow-2xl flex flex-col max-h-[90vh]">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-outline-variant bg-surface-container-low rounded-t-2xl">
                    <div>
                        <h2 className="text-xl font-bold text-on-surface flex items-center gap-2">
                            <span className="material-symbols-outlined text-secondary">calendar_clock</span>
                            Manage Provider Schedule
                        </h2>
                        <p className="text-sm text-on-surface-variant mt-1">Configuring hours for <span className="font-semibold">{providerName}</span></p>
                    </div>
                    <div className="flex items-center gap-4">
                        {successMessage && <span className="text-green-600 text-sm font-medium">{successMessage}</span>}
                        {errorMessage && <span className="text-red-600 text-sm font-medium">{errorMessage}</span>}
                        
                        <button 
                            onClick={handleSave}
                            disabled={saving || loading}
                            className="px-5 py-2 bg-secondary text-white rounded-lg hover:bg-secondary/90 transition-colors font-medium flex items-center gap-2 disabled:opacity-50"
                        >
                            <span className="material-symbols-outlined text-[18px]">save</span>
                            {saving ? 'Saving...' : 'Save Changes'}
                        </button>
                        <button onClick={onClose} className="p-2 text-on-surface-variant hover:bg-surface-container rounded-full transition-colors">
                            <span className="material-symbols-outlined">close</span>
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto custom-scrollbar flex-1">
                    {loading ? (
                        <div className="flex justify-center items-center py-20">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-secondary"></div>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {schedules.map((schedule, index) => {
                                const isFacilityClosed = schedule.isTenantActive === false;

                                return (
                                    <div key={schedule.dayOfWeek} className={`flex flex-col lg:flex-row lg:items-center py-4 border-b border-surface-variant last:border-0 hover:bg-surface-container-low/30 px-2 rounded-lg transition-colors group ${!schedule.isActive || isFacilityClosed ? 'opacity-70 bg-surface-container-low/20' : ''}`}>
                                        <div className="w-28 flex-shrink-0 mb-4 lg:mb-0">
                                            <span className={`font-bold text-body-md ${schedule.isActive && !isFacilityClosed ? 'text-on-surface' : 'text-outline'}`}>{schedule.dayOfWeek}</span>
                                        </div>
                                        <div className="flex items-center gap-4 flex-1 flex-wrap">
                                            <label 
                                                className={`relative inline-flex items-center ${isFacilityClosed ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'}`}
                                                title={isFacilityClosed ? "This day is closed in Salon Operating Hours." : ""}
                                            >
                                                <input 
                                                    type="checkbox" 
                                                    className="sr-only peer" 
                                                    checked={isFacilityClosed ? false : schedule.isActive}
                                                    disabled={isFacilityClosed}
                                                    onChange={(e) => {
                                                        if (isFacilityClosed) return;
                                                        updateSchedule(index, 'isActive', e.target.checked);
                                                    }}
                                                />
                                                <div className="w-11 h-6 bg-outline-variant rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-secondary peer-disabled:opacity-40"></div>
                                                <span className={`ml-3 text-body-md font-medium ${schedule.isActive && !isFacilityClosed ? 'text-emerald-600' : 'text-outline'}`}>
                                                    {schedule.isActive && !isFacilityClosed ? 'Active' : 'Closed'}
                                                </span>
                                            </label>
                                            
                                            {schedule.isActive && !isFacilityClosed ? (
                                                <>
                                                    <div className="flex items-center gap-4 text-body-md">
                                                        <input 
                                                            type="time" 
                                                            className="bg-surface-container-low px-4 py-1.5 rounded-lg border border-outline-variant font-mono-data outline-none focus:border-secondary" 
                                                            value={schedule.openingTime} 
                                                            onChange={(e) => updateSchedule(index, 'openingTime', e.target.value)} 
                                                        />
                                                        <span className="text-outline">to</span>
                                                        <input 
                                                            type="time" 
                                                            className="bg-surface-container-low px-4 py-1.5 rounded-lg border border-outline-variant font-mono-data outline-none focus:border-secondary" 
                                                            value={schedule.closingTime} 
                                                            onChange={(e) => updateSchedule(index, 'closingTime', e.target.value)} 
                                                        />
                                                    </div>
                                                    <div className="flex items-center gap-2 text-on-surface-variant text-body-md bg-amber-50 px-3 py-1 rounded border border-amber-100">
                                                        <span className="material-symbols-outlined text-[18px]">coffee</span>
                                                        <span className="flex items-center gap-2">Break: 
                                                            <input 
                                                                type="time" 
                                                                className="bg-transparent border-b border-amber-200 focus:border-amber-500 outline-none w-32 font-mono-data" 
                                                                value={schedule.breakStartTime}
                                                                onChange={(e) => updateSchedule(index, 'breakStartTime', e.target.value)}
                                                            />
                                                            -
                                                            <input 
                                                                type="time" 
                                                                className="bg-transparent border-b border-amber-200 focus:border-amber-500 outline-none w-32 font-mono-data" 
                                                                value={schedule.breakEndTime}
                                                                onChange={(e) => updateSchedule(index, 'breakEndTime', e.target.value)}
                                                            />
                                                        </span>
                                                    </div>
                                                </>
                                            ) : (
                                                <div className="flex items-center gap-4 text-body-md w-full">
                                                    <div className="flex-1 bg-surface-container-low px-4 py-2 rounded-lg border border-outline-variant flex items-center gap-2">
                                                        <span className="material-symbols-outlined text-[18px] text-outline">info</span>
                                                        <input 
                                                            type="text" 
                                                            placeholder="Reason for closure (e.g. Weekend, Holiday)" 
                                                            className={`bg-transparent outline-none w-full text-on-surface-variant italic ${isFacilityClosed ? 'cursor-not-allowed opacity-75' : ''}`}
                                                            value={schedule.closedMessage || ''}
                                                            disabled={isFacilityClosed}
                                                            onChange={(e) => updateSchedule(index, 'closedMessage', e.target.value)}
                                                        />
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
