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
            const formattedSchedules = data.schedules.map(schedule => ({
                ...schedule,
                openingTime: schedule.openingTime ? schedule.openingTime.substring(0, 5) : "09:00",
                closingTime: schedule.closingTime ? schedule.closingTime.substring(0, 5) : "17:00",
                breakStartTime: schedule.breakStartTime ? schedule.breakStartTime.substring(0, 5) : "13:00",
                breakEndTime: schedule.breakEndTime ? schedule.breakEndTime.substring(0, 5) : "14:00"
            }));
            
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
            
            const payload: ScheduleSettings = {
                timezone,
                slotDuration: 30,
                schedules: schedules.map(s => ({
                    ...s,
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
        } catch (error) {
            console.error("Failed to save provider schedule settings", error);
            setErrorMessage("Failed to save schedule settings.");
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
                            {schedules.map((schedule, index) => (
                                <div key={schedule.dayOfWeek} className={`flex flex-col lg:flex-row lg:items-center py-4 border-b border-surface-variant last:border-0 hover:bg-surface-container-low/50 px-4 rounded-lg transition-colors group ${!schedule.isActive ? 'opacity-60 bg-surface-container-lowest' : 'bg-white'}`}>
                                    <div className="w-32 flex-shrink-0 mb-4 lg:mb-0">
                                        <span className={`font-bold text-body-lg ${schedule.isActive ? 'text-on-surface' : 'text-outline'}`}>{schedule.dayOfWeek}</span>
                                    </div>
                                    <div className="flex items-center gap-4 flex-1 flex-wrap">
                                        <label className={`relative inline-flex items-center ${schedule.isTenantActive !== false ? 'cursor-pointer' : 'cursor-not-allowed'}`}>
                                            <input 
                                                type="checkbox" 
                                                className="sr-only peer" 
                                                checked={schedule.isActive}
                                                disabled={schedule.isTenantActive === false}
                                                onChange={(e) => updateSchedule(index, 'isActive', e.target.checked)}
                                            />
                                            <div className={`w-11 h-6 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all ${schedule.isTenantActive === false ? 'bg-outline-variant/50' : 'bg-outline-variant peer-checked:bg-secondary'}`}></div>
                                            <span className={`ml-3 text-body-md font-medium w-16 ${schedule.isActive ? 'text-emerald-600' : 'text-outline'} ${schedule.isTenantActive === false ? 'opacity-50' : ''}`}>
                                                {schedule.isActive ? 'Active' : 'Closed'}
                                            </span>
                                        </label>
                                        
                                        {schedule.isTenantActive === false && !schedule.isActive && (
                                            <div className="flex items-center gap-2 text-red-600 text-xs font-medium ml-2 bg-red-50 px-2 py-1 rounded">
                                                <span className="material-symbols-outlined text-[16px]">domain_disabled</span>
                                                Clinic is closed
                                            </div>
                                        )}
                                        
                                        {schedule.isActive ? (
                                            <>
                                                <div className="flex items-center gap-4 text-body-md ml-4">
                                                    <input 
                                                        type="time" 
                                                        className="bg-surface-container-lowest px-4 py-2 rounded-lg border border-outline-variant font-mono-data outline-none focus:border-secondary shadow-sm" 
                                                        value={schedule.openingTime} 
                                                        onChange={(e) => updateSchedule(index, 'openingTime', e.target.value)} 
                                                    />
                                                    <span className="text-outline font-medium">to</span>
                                                    <input 
                                                        type="time" 
                                                        className="bg-surface-container-lowest px-4 py-2 rounded-lg border border-outline-variant font-mono-data outline-none focus:border-secondary shadow-sm" 
                                                        value={schedule.closingTime} 
                                                        onChange={(e) => updateSchedule(index, 'closingTime', e.target.value)} 
                                                    />
                                                </div>
                                                <div className="flex items-center gap-2 text-on-surface-variant text-body-md bg-amber-50 px-4 py-2 rounded-lg border border-amber-100 ml-auto">
                                                    <span className="material-symbols-outlined text-[18px] text-amber-600">coffee</span>
                                                    <span className="flex items-center gap-2 text-amber-900 font-medium">Break: 
                                                        <input 
                                                            type="time" 
                                                            className="bg-white px-2 py-1 rounded border border-amber-200 focus:border-amber-500 outline-none w-[120px] font-mono-data" 
                                                            value={schedule.breakStartTime}
                                                            onChange={(e) => updateSchedule(index, 'breakStartTime', e.target.value)}
                                                        />
                                                        -
                                                        <input 
                                                            type="time" 
                                                            className="bg-white px-2 py-1 rounded border border-amber-200 focus:border-amber-500 outline-none w-[120px] font-mono-data" 
                                                            value={schedule.breakEndTime}
                                                            onChange={(e) => updateSchedule(index, 'breakEndTime', e.target.value)}
                                                        />
                                                    </span>
                                                </div>
                                            </>
                                        ) : (
                                            <div className="flex items-center gap-4 text-body-md w-full ml-4">
                                                <div className="flex-1 bg-surface-container-low px-4 py-2.5 rounded-lg border border-outline-variant flex items-center gap-3">
                                                    <span className="material-symbols-outlined text-[20px] text-outline">info</span>
                                                    <input 
                                                        type="text" 
                                                        placeholder="Reason for closure (e.g. Vacation, Holiday)" 
                                                        className={`bg-transparent outline-none w-full text-on-surface-variant italic ${schedule.isTenantActive === false ? 'opacity-50 cursor-not-allowed' : ''}`}
                                                        value={schedule.closedMessage || ''}
                                                        disabled={schedule.isTenantActive === false}
                                                        onChange={(e) => updateSchedule(index, 'closedMessage', e.target.value)}
                                                    />
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
