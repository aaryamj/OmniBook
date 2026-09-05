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
}

interface ScheduleSettings {
    timezone: string;
    slotDuration: number;
    schedules: DailySchedule[];
}

interface ClinicScheduleMatrixProps {
    scheduleData?: any;
    onSave?: (schedules: any[]) => Promise<void>;
}

export default function ClinicScheduleMatrix(_props?: ClinicScheduleMatrixProps) {
    const [timezone, setTimezone] = useState("Asia/Kathmandu");
    const [schedules, setSchedules] = useState<DailySchedule[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');

    useEffect(() => {
        fetchScheduleSettings();
    }, []);

    const fetchScheduleSettings = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const response = await axios.get('http://localhost:8080/api/v1/admin/schedule', {
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
            
            // Convert times back to HH:mm:ss if needed (Spring accepts HH:mm or HH:mm:ss)
            const payload: ScheduleSettings = {
                timezone,
                slotDuration: 30, // Default value since we removed it from UI
                schedules: schedules.map(s => ({
                    ...s,
                    openingTime: s.openingTime.length === 5 ? `${s.openingTime}:00` : s.openingTime,
                    closingTime: s.closingTime.length === 5 ? `${s.closingTime}:00` : s.closingTime,
                    breakStartTime: s.breakStartTime.length === 5 ? `${s.breakStartTime}:00` : s.breakStartTime,
                    breakEndTime: s.breakEndTime.length === 5 ? `${s.breakEndTime}:00` : s.breakEndTime,
                }))
            };
            
            await axios.put('http://localhost:8080/api/v1/admin/schedule', payload, {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            setSuccessMessage('Schedule settings saved successfully!');
            setTimeout(() => setSuccessMessage(''), 3000);
        } catch (error) {
            console.error("Failed to save schedule settings", error);
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

    if (loading) {
        return <div className="p-8 text-center text-on-surface-variant">Loading schedule settings...</div>;
    }

    return (
        <div className="flex-1 bg-white border border-outline-variant rounded-xl shadow-sm overflow-hidden">
            {/* WORKSPACE TOP CONTROLS */}
            <div className="p-6 border-b border-outline-variant flex items-center justify-between bg-surface-container-lowest">
                <div className="flex gap-6">
                    <div className="flex flex-col gap-1.5">
                        <label className="text-label-md text-on-surface-variant uppercase tracking-wider">System Timezone</label>
                        <div className="relative">
                            <select className="appearance-none bg-surface-container-low border border-outline-variant rounded-lg pl-3 pr-10 py-2 text-body-md focus:ring-2 focus:ring-secondary w-56" value={timezone} onChange={(e) => setTimezone(e.target.value)}>
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
                </div>
                
                <div className="flex items-center gap-3">
                    {successMessage && <span className="text-green-600 text-sm font-medium">{successMessage}</span>}
                    {errorMessage && <span className="text-red-600 text-sm font-medium">{errorMessage}</span>}
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

            {/* WEEKLY MATRIX */}
            <div className="p-6">
                <h3 className="text-body-lg font-bold mb-6 flex items-center gap-2">
                    <span className="material-symbols-outlined text-secondary">date_range</span>
                    Standard Weekly Availability
                </h3>
                <div className="space-y-4">
                    {schedules.map((schedule, index) => (
                        <div key={schedule.dayOfWeek} className={`flex flex-col lg:flex-row lg:items-center py-4 border-b border-surface-variant last:border-0 hover:bg-surface-container-low/30 px-2 rounded-lg transition-colors group ${!schedule.isActive ? 'opacity-60' : ''}`}>
                            <div className="w-28 flex-shrink-0 mb-4 lg:mb-0">
                                <span className={`font-bold text-body-md ${schedule.isActive ? 'text-on-surface' : 'text-outline'}`}>{schedule.dayOfWeek}</span>
                            </div>
                            <div className="flex items-center gap-4 flex-1 flex-wrap">
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input 
                                        type="checkbox" 
                                        className="sr-only peer" 
                                        checked={schedule.isActive}
                                        onChange={(e) => updateSchedule(index, 'isActive', e.target.checked)}
                                    />
                                    <div className="w-11 h-6 bg-outline-variant rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-secondary"></div>
                                    <span className={`ml-3 text-body-md font-medium ${schedule.isActive ? 'text-emerald-600' : 'text-outline'}`}>
                                        {schedule.isActive ? 'Active' : 'Closed'}
                                    </span>
                                </label>
                                
                                {schedule.isActive ? (
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
                                                className="bg-transparent outline-none w-full text-on-surface-variant italic"
                                                value={schedule.closedMessage || ''}
                                                onChange={(e) => updateSchedule(index, 'closedMessage', e.target.value)}
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
