import React, { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import axios from 'axios';

export interface ClinicScheduleMatrixHandle {
    save: () => Promise<boolean>;
}

interface DailySchedule {
    id?: number;
    dayOfWeek: string;
    isActive: boolean;
    isTenantActive?: boolean;
    isClosedByAdmin?: boolean;
    openingTime: string;
    closingTime: string;
    breakStartTime: string;
    breakEndTime: string;
    closedMessage?: string;
}

interface ScheduleSettings {
    timezone: string;
    slotDuration: number;
    noShowGracePeriodMinutes?: number;
    schedules: DailySchedule[];
}

export interface ClinicScheduleMatrixProps {
    scheduleData?: any;
    onSave?: (schedules: any[]) => Promise<void>;
    isProvider?: boolean;
    isScheduleDelegated?: boolean;
}

const ClinicScheduleMatrix = forwardRef<ClinicScheduleMatrixHandle, ClinicScheduleMatrixProps>((props, ref) => {
    const isProvider = props?.isProvider ?? false;
    const [timezone, setTimezone] = useState("Asia/Kathmandu");
    const [noShowGracePeriodMinutes, setNoShowGracePeriodMinutes] = useState<number>(15);
    const [schedules, setSchedules] = useState<DailySchedule[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');

    useImperativeHandle(ref, () => ({
        save: handleSave
    }));

    useEffect(() => {
        fetchScheduleSettings();
    }, [isProvider]);

    const fetchScheduleSettings = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const endpoint = isProvider 
                ? 'http://localhost:8080/api/v1/provider/schedule/me'
                : 'http://localhost:8080/api/v1/admin/schedule';
            const response = await axios.get(endpoint, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data: ScheduleSettings = response.data;
            setTimezone(data.timezone || "Asia/Kathmandu");
            if (data.noShowGracePeriodMinutes !== undefined) {
                setNoShowGracePeriodMinutes(data.noShowGracePeriodMinutes);
            }
            
            const parseTime = (val: any, fallback: string) => {
                if (!val) return fallback;
                if (typeof val === 'string') return val.length >= 5 ? val.substring(0, 5) : val;
                if (Array.isArray(val) && val.length >= 2) {
                    return `${String(val[0]).padStart(2, '0')}:${String(val[1]).padStart(2, '0')}`;
                }
                return fallback;
            };

            const formattedSchedules = (data.schedules || []).map(schedule => {
                const activeVal = (schedule as any).isActive !== undefined 
                    ? (schedule as any).isActive 
                    : (schedule as any).active;
                const tenantActiveVal = (schedule as any).isTenantActive !== undefined 
                    ? Boolean((schedule as any).isTenantActive) 
                    : true;
                const closedByAdminVal = Boolean((schedule as any).isClosedByAdmin);
                const canBeActive = tenantActiveVal && (!isProvider || !closedByAdminVal);
                return {
                    ...schedule,
                    isActive: canBeActive ? Boolean(activeVal) : false,
                    isTenantActive: tenantActiveVal,
                    isClosedByAdmin: closedByAdminVal,
                    openingTime: parseTime(schedule.openingTime, "09:00"),
                    closingTime: parseTime(schedule.closingTime, "17:00"),
                    breakStartTime: parseTime(schedule.breakStartTime, "13:00"),
                    breakEndTime: parseTime(schedule.breakEndTime, "14:00")
                };
            });
            
            // Sort schedules properly
            const daysOrder = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
            formattedSchedules.sort((a, b) => daysOrder.indexOf(a.dayOfWeek) - daysOrder.indexOf(b.dayOfWeek));
            
            setSchedules(formattedSchedules);
        } catch (error) {
            console.error("Failed to fetch schedule settings", error);
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
            
            // Validate break times only for active days
            for (const s of schedules) {
                if (isProvider && s.isTenantActive === false && s.isActive) {
                    setErrorMessage(`Cannot enable working hours on ${s.dayOfWeek}: The salon/facility is closed on this day by the Administrator.`);
                    setSaving(false);
                    return false;
                }
                if (isProvider && s.isClosedByAdmin && s.isActive) {
                    setErrorMessage(`Cannot enable working hours on ${s.dayOfWeek}: You have been scheduled off on this day by the Administrator.`);
                    setSaving(false);
                    return false;
                }
                if (s.isActive) {
                    if (s.breakStartTime < s.openingTime || s.breakEndTime > s.closingTime) {
                        setErrorMessage(`Break time must be within operating hours on ${s.dayOfWeek}`);
                        setSaving(false);
                        return false;
                    }
                    if (s.breakStartTime >= s.breakEndTime) {
                        setErrorMessage(`Break start time must be before break end time on ${s.dayOfWeek}`);
                        setSaving(false);
                        return false;
                    }
                }
            }
            
            // Format to standard HH:mm:ss for backend LocalTime parsing
            const formatForBackend = (val: string, fallback: string) => {
                if (!val) return fallback;
                if (val.length === 5) return `${val}:00`;
                return val;
            };

            const payload: any = {
                timezone,
                slotDuration: 30,
                ...((!isProvider) ? { noShowGracePeriodMinutes } : {}),
                schedules: schedules.map(s => {
                    const isClosedByTenant = isProvider && s.isTenantActive === false;
                    return {
                        id: s.id,
                        dayOfWeek: s.dayOfWeek,
                        isActive: isClosedByTenant ? false : Boolean(s.isActive),
                        active: isClosedByTenant ? false : Boolean(s.isActive),
                        openingTime: formatForBackend(s.openingTime, "09:00:00"),
                        closingTime: formatForBackend(s.closingTime, "17:00:00"),
                        breakStartTime: formatForBackend(s.breakStartTime, "13:00:00"),
                        breakEndTime: formatForBackend(s.breakEndTime, "14:00:00"),
                        closedMessage: isClosedByTenant ? "Facility closed by Administrator" : s.closedMessage
                    };
                })
            };

            if (props?.isScheduleDelegated !== undefined) {
                payload.isScheduleDelegated = props.isScheduleDelegated;
            }
            
            const endpoint = isProvider 
                ? 'http://localhost:8080/api/v1/provider/schedule/me'
                : 'http://localhost:8080/api/v1/admin/schedule';

            await axios.put(endpoint, payload, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (props?.onSave) {
                await props.onSave(payload.schedules);
            }
            
            setSuccessMessage('Operating hours and provider schedules synchronized successfully!');
            setTimeout(() => setSuccessMessage(''), 5000);
            await fetchScheduleSettings();
            return true;
        } catch (error: any) {
            console.error("Failed to save schedule settings", error);
            const msg = error.response?.data?.message || "Failed to save schedule settings.";
            setErrorMessage(msg);
            setTimeout(() => setErrorMessage(''), 5000);
            return false;
        } finally {
            setSaving(false);
        }
    };

    const updateSchedule = (index: number, field: keyof DailySchedule, value: any) => {
        const updatedSchedules = [...schedules];
        updatedSchedules[index] = { ...updatedSchedules[index], [field]: value };
        setSchedules(updatedSchedules);
    };

    if (loading) {
        return <div className="p-8 text-center text-on-surface-variant">Loading schedule settings...</div>;
    }

    return (
        <div className="flex-1 bg-white border border-outline-variant rounded-xl shadow-sm overflow-hidden">
            {/* WORKSPACE TOP CONTROLS */}
            <div className="p-6 border-b border-outline-variant flex items-center justify-between bg-surface-container-lowest">
                <div className="flex flex-wrap items-center gap-6">
                    <div className="flex flex-col gap-1.5">
                        <label className="text-label-md text-on-surface-variant uppercase tracking-wider font-semibold">System Timezone</label>
                        <div className="relative">
                            <select className="appearance-none bg-surface-container-low border border-outline-variant rounded-lg pl-3 pr-10 py-2 text-body-md focus:ring-2 focus:ring-secondary w-56 font-medium text-on-surface" value={timezone} onChange={(e) => setTimezone(e.target.value)}>
                                <option value="Asia/Kathmandu">Asia/Kathmandu (GMT+5:45)</option>
                                <option value="America/New_York">America/New_York (GMT-5:00)</option>
                                <option value="Europe/London">Europe/London (GMT+0:00)</option>
                                <option value="Asia/Dubai">Asia/Dubai (GMT+4:00)</option>
                                <option value="Asia/Singapore">Asia/Singapore (GMT+8:00)</option>
                                <option value="Australia/Sydney">Australia/Sydney (GMT+10:00)</option>
                            </select>
                            <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-outline">expand_more</span>
                        </div>
                    </div>

                    {!isProvider && (
                        <div className="flex flex-col gap-1.5">
                            <div className="flex items-center gap-1.5">
                                <label className="text-label-md text-on-surface-variant uppercase tracking-wider font-semibold">
                                    No-Show Grace Period
                                </label>
                                <span className="material-symbols-outlined text-[16px] text-on-surface-variant/60 cursor-help" title="Unattended appointments exceeding this grace period past their start time are automatically classified as No-Show.">
                                    schedule
                                </span>
                            </div>
                            <div className="relative">
                                <select 
                                    className="appearance-none bg-surface-container-low border border-outline-variant rounded-lg pl-3 pr-10 py-2 text-body-md focus:ring-2 focus:ring-secondary w-56 font-medium text-on-surface"
                                    value={noShowGracePeriodMinutes}
                                    onChange={(e) => setNoShowGracePeriodMinutes(Number(e.target.value))}
                                >
                                    <option value={5}>5 Minutes</option>
                                    <option value={10}>10 Minutes</option>
                                    <option value={15}>15 Minutes (Default)</option>
                                    <option value={20}>20 Minutes</option>
                                    <option value={30}>30 Minutes</option>
                                    <option value={45}>45 Minutes</option>
                                    <option value={60}>60 Minutes (1 Hour)</option>
                                </select>
                                <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-outline">expand_more</span>
                            </div>
                        </div>
                    )}
                </div>
                
                <div className="flex items-center gap-3">
                    <button 
                        onClick={handleSave}
                        disabled={saving}
                        className="px-6 py-2.5 bg-secondary text-white rounded-lg hover:bg-secondary/90 transition-colors font-medium flex items-center gap-2"
                    >
                        <span className="material-symbols-outlined text-[20px]">save</span>
                        {saving ? 'Saving...' : 'Save Settings'}
                    </button>
                </div>
            </div>

            {/* Attractive Horizontal Message Banner */}
            {successMessage && (
                <div className="mx-6 mt-6 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center justify-between shadow-sm animate-in fade-in slide-in-from-top-2 duration-300">
                    <div className="flex items-center gap-3">
                        <span className="material-symbols-outlined text-emerald-600 text-2xl">check_circle</span>
                        <div>
                            <p className="font-bold text-sm text-emerald-900">Operating Schedule Synchronized</p>
                            <p className="text-xs text-emerald-700">{successMessage}</p>
                        </div>
                    </div>
                    <button onClick={() => setSuccessMessage('')} className="p-1 hover:bg-emerald-100 rounded text-emerald-600 transition-colors">
                        <span className="material-symbols-outlined text-[18px]">close</span>
                    </button>
                </div>
            )}

            {errorMessage && (
                <div className="mx-6 mt-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 flex items-center justify-between shadow-sm animate-in fade-in slide-in-from-top-2 duration-300">
                    <div className="flex items-center gap-3">
                        <span className="material-symbols-outlined text-rose-600 text-2xl">error</span>
                        <div>
                            <p className="font-bold text-sm text-rose-900">Schedule Update Failed</p>
                            <p className="text-xs text-rose-700">{errorMessage}</p>
                        </div>
                    </div>
                    <button onClick={() => setErrorMessage('')} className="p-1 hover:bg-rose-100 rounded text-rose-600 transition-colors">
                        <span className="material-symbols-outlined text-[18px]">close</span>
                    </button>
                </div>
            )}

            {/* WEEKLY MATRIX */}
            <div className="p-6">
                <h3 className="text-body-lg font-bold mb-6 flex items-center gap-2">
                    <span className="material-symbols-outlined text-secondary">date_range</span>
                    Standard Weekly Availability
                </h3>
                <div className="space-y-4">
                    {schedules.map((schedule, index) => {
                        const isLocked = isProvider && (schedule.isTenantActive === false || schedule.isClosedByAdmin === true);

                        return (
                            <div key={schedule.dayOfWeek} className={`flex flex-col lg:flex-row lg:items-center py-4 border-b border-surface-variant last:border-0 hover:bg-surface-container-low/30 px-2 rounded-lg transition-colors group ${!schedule.isActive || isLocked ? 'opacity-70 bg-surface-container-low/20' : ''}`}>
                                <div className="w-28 flex-shrink-0 mb-4 lg:mb-0">
                                    <span className={`font-bold text-body-md ${schedule.isActive && !isLocked ? 'text-on-surface' : 'text-outline'}`}>{schedule.dayOfWeek}</span>
                                </div>
                                <div className="flex items-center gap-4 flex-1 flex-wrap">
                                    <label 
                                        className={`relative inline-flex items-center ${isLocked ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'}`}
                                        title={isLocked ? (schedule.isClosedByAdmin ? "You have been scheduled off on this day by the Administrator." : "This day is closed in Salon Operating Hours.") : ""}
                                    >
                                        <input 
                                            type="checkbox" 
                                            className="sr-only peer" 
                                            checked={isLocked ? false : schedule.isActive}
                                            disabled={isLocked}
                                            onChange={(e) => {
                                                if (isLocked) return;
                                                updateSchedule(index, 'isActive', e.target.checked);
                                            }}
                                        />
                                        <div className="w-11 h-6 bg-outline-variant rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-secondary peer-disabled:opacity-40"></div>
                                        <span className={`ml-3 text-body-md font-medium ${schedule.isActive && !isLocked ? 'text-emerald-600' : 'text-outline'}`}>
                                            {schedule.isActive && !isLocked ? 'Active' : 'Closed'}
                                        </span>
                                    </label>
                                    
                                    {schedule.isActive && !isLocked ? (
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
                                                    className={`bg-transparent outline-none w-full text-on-surface-variant italic ${isLocked ? 'cursor-not-allowed opacity-75' : ''}`}
                                                    value={schedule.closedMessage || ''}
                                                    disabled={isLocked}
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
            </div>
        </div>
    );
});

export default ClinicScheduleMatrix;
