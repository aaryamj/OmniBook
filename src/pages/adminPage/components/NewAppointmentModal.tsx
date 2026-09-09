import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useOrganizationTerms, normalizeOrgType } from '../../../utils/organizationTerms';

interface NewAppointmentModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    initialProviderId?: number | string;
    preselectedProviderName?: string;
}

interface ProviderOption {
    id: number;
    name: string;
    email?: string;
    specialty?: string;
    status?: string;
}

interface ServiceOption {
    id: number;
    serviceName: string;
    durationMinutes?: number;
    fee?: number;
    category?: string;
}

interface SlotOption {
    id: string;
    time: string;
    slotTime24?: string;
    isBooked?: boolean;
    isPast?: boolean;
    isBreak?: boolean;
    price?: string;
}

export default function NewAppointmentModal({ 
    isOpen, 
    onClose, 
    onSuccess,
    initialProviderId,
    preselectedProviderName 
}: NewAppointmentModalProps) {
    const terms = useOrganizationTerms();
    const orgKey = normalizeOrgType(terms.orgType);

    // Dynamic defaults per organization type
    const getOrgDefaults = () => {
        if (orgKey === 'College') {
            return {
                defaultDepartment: 'Academic Lecture & Consultation',
                deptPlaceholder: 'e.g. Computer Science / Lecture Hall B',
                purposePlaceholder: 'e.g. Physical class attendance / In-person admission inquiry',
                serviceTypeLabel: 'Course / Class Subject',
            };
        } else if (orgKey === 'Saloon') {
            return {
                defaultDepartment: 'Styling & Treatment',
                deptPlaceholder: 'e.g. Hair Styling & Treatment',
                purposePlaceholder: 'e.g. Physical walk-in haircut & styling session',
                serviceTypeLabel: 'Service / Treatment',
            };
        } else {
            return {
                defaultDepartment: 'General Consultation',
                deptPlaceholder: 'e.g. General Medicine / Cardiology',
                purposePlaceholder: 'e.g. In-person health checkup & evaluation',
                serviceTypeLabel: 'Department / Specialty',
            };
        }
    };

    const orgDefaults = getOrgDefaults();

    // 1. Customer & Visit Details (Section 1)
    const [patientName, setPatientName] = useState('');
    const [patientEmail, setPatientEmail] = useState('');
    const [patientPhone, setPatientPhone] = useState('');
    const [reasonForVisit, setReasonForVisit] = useState('');
    const [appointmentStatus, setAppointmentStatus] = useState('CHECKED_IN');

    // 2. Provider & Service Selection (Section 2)
    const [providers, setProviders] = useState<ProviderOption[]>([]);
    const [selectedProviderId, setSelectedProviderId] = useState<string>('');
    const [selectedProviderName, setSelectedProviderName] = useState<string>('');
    const [services, setServices] = useState<ServiceOption[]>([]);
    const [selectedService, setSelectedService] = useState<string>('');
    const [isLoadingProviders, setIsLoadingProviders] = useState(false);
    const [isLoadingServices, setIsLoadingServices] = useState(false);

    // 3. Date & Real-Time Time Slots (Section 3)
    const [date, setDate] = useState('');
    const [todayStr, setTodayStr] = useState('');
    const [slots, setSlots] = useState<SlotOption[]>([]);
    const [isLoadingSlots, setIsLoadingSlots] = useState(false);
    const [isClosed, setIsClosed] = useState(false);
    const [closedMessage, setClosedMessage] = useState('');
    const [selectedTime24, setSelectedTime24] = useState<string>('');
    const [selectedTimeDisplay, setSelectedTimeDisplay] = useState<string>('');

    // 4. Billing & Notes (Section 4)
    const [price, setPrice] = useState<number | string>(0);
    const [paymentMethod, setPaymentMethod] = useState('CASH');
    const [paymentStatus, setPaymentStatus] = useState('PAID');
    const [internalNotes, setInternalNotes] = useState('');

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    // Initialize modal state on open
    useEffect(() => {
        if (isOpen) {
            const now = new Date();
            const yyyy = now.getFullYear();
            const mm = String(now.getMonth() + 1).padStart(2, '0');
            const dd = String(now.getDate()).padStart(2, '0');
            const formattedToday = `${yyyy}-${mm}-${dd}`;
            setTodayStr(formattedToday);
            setDate(formattedToday);

            setErrorMessage(null);
            setSelectedTime24('');
            setSelectedTimeDisplay('');
            fetchProviders();
        }
    }, [isOpen]);

    // Fetch providers roster
    const fetchProviders = async () => {
        setIsLoadingProviders(true);
        try {
            const token = localStorage.getItem('token');
            if (!token) return;
            const res = await axios.get('http://localhost:8080/api/v1/admin/providers', {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (res.data && Array.isArray(res.data) && res.data.length > 0) {
                const mapped: ProviderOption[] = res.data.map((p: any) => ({
                    id: p.id,
                    name: p.name || p.fullName,
                    email: p.email,
                    specialty: p.primarySpecialty || p.specialty || '',
                    status: p.status
                }));
                setProviders(mapped);

                let targetProv = mapped[0];
                if (initialProviderId) {
                    const match = mapped.find(p => String(p.id) === String(initialProviderId));
                    if (match) targetProv = match;
                } else if (preselectedProviderName) {
                    const match = mapped.find(p => p.name.toLowerCase().includes(preselectedProviderName.toLowerCase()));
                    if (match) targetProv = match;
                }
                setSelectedProviderId(String(targetProv.id));
                setSelectedProviderName(targetProv.name);
                fetchServicesForProvider(targetProv.id);
            } else if (initialProviderId || preselectedProviderName) {
                const fallbackProv: ProviderOption = {
                    id: Number(initialProviderId) || 1,
                    name: preselectedProviderName || localStorage.getItem('fullName') || 'Provider',
                    specialty: ''
                };
                setProviders([fallbackProv]);
                setSelectedProviderId(String(fallbackProv.id));
                setSelectedProviderName(fallbackProv.name);
                fetchServicesForProvider(fallbackProv.id);
            }
        } catch (err) {
            console.error('Failed to load providers for walk-in modal', err);
            if (initialProviderId || preselectedProviderName) {
                const fallbackProv: ProviderOption = {
                    id: Number(initialProviderId) || 1,
                    name: preselectedProviderName || localStorage.getItem('fullName') || 'Provider',
                    specialty: ''
                };
                setProviders([fallbackProv]);
                setSelectedProviderId(String(fallbackProv.id));
                setSelectedProviderName(fallbackProv.name);
                fetchServicesForProvider(fallbackProv.id);
            }
        } finally {
            setIsLoadingProviders(false);
        }
    };

    // Fetch services for a selected provider
    const fetchServicesForProvider = async (providerId: number | string) => {
        if (!providerId) return;
        setIsLoadingServices(true);
        try {
            const res = await axios.get(`http://localhost:8080/api/v1/public/booking/providers/${providerId}/services`);
            if (res.data && res.data.success && Array.isArray(res.data.services) && res.data.services.length > 0) {
                const servs: ServiceOption[] = res.data.services;
                setServices(servs);
                const firstServ = servs[0];
                setSelectedService(firstServ.serviceName);
                if (firstServ.fee !== undefined && firstServ.fee !== null) {
                    setPrice(firstServ.fee);
                }
            } else {
                // Fallback default service
                const fallback: ServiceOption = {
                    id: 0,
                    serviceName: orgDefaults.defaultDepartment,
                    durationMinutes: 30,
                    fee: 0,
                    category: 'General'
                };
                setServices([fallback]);
                setSelectedService(fallback.serviceName);
                setPrice(0);
            }
        } catch (err) {
            console.error('Failed to load services for provider', err);
            const fallback: ServiceOption = {
                id: 0,
                serviceName: orgDefaults.defaultDepartment,
                durationMinutes: 30,
                fee: 0,
                category: 'General'
            };
            setServices([fallback]);
            setSelectedService(fallback.serviceName);
        } finally {
            setIsLoadingServices(false);
        }
    };

    // Fetch slots when Provider, Service, or Date changes
    useEffect(() => {
        if (isOpen && selectedProviderId && date) {
            fetchSlots(selectedProviderId, date, selectedService);
        }
    }, [isOpen, selectedProviderId, date, selectedService]);

    const fetchSlots = async (providerId: string, targetDate: string, serviceName: string) => {
        setIsLoadingSlots(true);
        setSelectedTime24('');
        setSelectedTimeDisplay('');
        try {
            const res = await axios.get(`http://localhost:8080/api/v1/public/booking/providers/${providerId}/slots`, {
                params: {
                    date: targetDate,
                    serviceName: serviceName || undefined
                }
            });

            if (res.data && res.data.success) {
                setSlots(res.data.slots || []);
                setIsClosed(Boolean(res.data.isClosed));
                setClosedMessage(res.data.closedMessage || '');
            } else {
                setSlots([]);
                setIsClosed(false);
                setClosedMessage('');
            }
        } catch (err) {
            console.error('Failed to fetch real-time provider slots', err);
            setSlots([]);
            setIsClosed(false);
            setClosedMessage('');
        } finally {
            setIsLoadingSlots(false);
        }
    };

    const handleProviderChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const provId = e.target.value;
        setSelectedProviderId(provId);
        const match = providers.find(p => String(p.id) === provId);
        if (match) {
            setSelectedProviderName(match.name);
        }
        fetchServicesForProvider(provId);
    };

    const handleServiceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const sName = e.target.value;
        setSelectedService(sName);
        const match = services.find(s => s.serviceName === sName);
        if (match && match.fee !== undefined && match.fee !== null) {
            setPrice(match.fee);
        }
    };

    const handleSelectSlot = (slot: SlotOption) => {
        if (slot.isBooked || slot.isPast || slot.isBreak) return;
        const time24 = slot.slotTime24 || convertDisplayTimeTo24(slot.time);
        setSelectedTime24(time24);
        setSelectedTimeDisplay(slot.time);
    };

    const convertDisplayTimeTo24 = (displayTime: string): string => {
        if (!displayTime) return '10:00';
        const m = displayTime.trim().match(/^(\d{1,2}):(\d{2})\s*(AM|PM)?$/i);
        if (!m) return displayTime;
        let hours = parseInt(m[1], 10);
        const minutes = m[2];
        const meridian = m[3]?.toUpperCase();
        if (meridian === 'PM' && hours < 12) hours += 12;
        if (meridian === 'AM' && hours === 12) hours = 0;
        return `${String(hours).padStart(2, '0')}:${minutes}`;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrorMessage(null);

        if (!patientName.trim()) {
            setErrorMessage(`Please enter the ${terms.customerSingular.toLowerCase()}'s name.`);
            return;
        }

        if (!selectedTime24) {
            setErrorMessage('Please select an available real-time time slot from the schedule.');
            return;
        }

        setIsSubmitting(true);
        try {
            const token = localStorage.getItem('token');
            const resolvedProviderName = selectedProviderName || (providers[0]?.name) || 'Staff Provider';
            const finalDepartment = selectedService || orgDefaults.defaultDepartment;

            const payload = {
                patientName: patientName.trim(),
                patientEmail: patientEmail.trim() || undefined,
                patientPhone: patientPhone.trim() || undefined,
                providerId: selectedProviderId ? Number(selectedProviderId) : (providers[0]?.id || null),
                providerName: resolvedProviderName,
                department: finalDepartment,
                serviceName: finalDepartment,
                date: date,
                time: selectedTime24,
                appointmentStatus: appointmentStatus,
                price: Number(price) || 0.0,
                paymentStatus: paymentStatus,
                paymentMethod: paymentMethod,
                reasonForVisit: reasonForVisit.trim() || `Physical Walk-in Visit (${terms.inFacility})`,
                internalNotes: internalNotes.trim() || undefined
            };

            const role = (localStorage.getItem('role') || '').toLowerCase();
            const isProviderRole = role.includes('provider');
            const targetUrl = isProviderRole 
                ? 'http://localhost:8080/api/v1/provider/appointments' 
                : 'http://localhost:8080/api/v1/admin/appointments';

            await axios.post(targetUrl, payload, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            // Reset state
            setPatientName('');
            setPatientEmail('');
            setPatientPhone('');
            setReasonForVisit('');
            setInternalNotes('');
            setPrice(0);
            setSelectedTime24('');
            setSelectedTimeDisplay('');

            onSuccess();
            onClose();
        } catch (err: any) {
            console.error('Failed to register walk-in session', err);
            const msg = err.response?.data?.message || err.message || `Failed to create ${terms.appointmentSingular.toLowerCase()}.`;
            setErrorMessage(msg);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
            <div className="bg-white dark:bg-surface rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden border border-slate-200 dark:border-outline-variant my-8 flex flex-col">
                {/* Header */}
                <div className="px-6 py-4 border-b border-slate-100 dark:border-outline-variant/30 flex items-center justify-between bg-gradient-to-r from-slate-50 to-indigo-50/30 dark:from-surface dark:to-surface">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold">
                            <span className="material-symbols-outlined text-[24px]">calendar_add_on</span>
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-slate-900 dark:text-on-surface flex items-center gap-2">
                                Register Walk-in {terms.appointmentSingular}
                                <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-semibold uppercase tracking-wider">
                                    {terms.inFacility}
                                </span>
                            </h2>
                            <p className="text-xs text-slate-500 dark:text-on-surface-variant mt-0.5">
                                Select {terms.providerSingular.toLowerCase()} & service &rarr; pick real-time available time &rarr; save {terms.customerSingular.toLowerCase()} physical visit.
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        type="button"
                        className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                        disabled={isSubmitting}
                    >
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>

                {/* Form Body */}
                <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[82vh] overflow-y-auto">
                    {errorMessage && (
                        <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm flex items-start gap-2.5">
                            <span className="material-symbols-outlined text-rose-500 text-[20px] shrink-0 mt-0.5">error</span>
                            <div>
                                <span className="font-semibold">Error:</span> {errorMessage}
                            </div>
                        </div>
                    )}

                    {/* SECTION 1: Customer & Visit Details (FIRST) */}
                    <div>
                        <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2">
                                <span className="w-6 h-6 rounded-full bg-primary text-white text-xs flex items-center justify-center font-bold">1</span>
                                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-on-surface">
                                    {terms.customerSingular} & Visit Details
                                </h3>
                            </div>
                            <span className="text-[11px] text-slate-500">Student information & operational status</span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="sm:col-span-2">
                                <label className="block text-xs font-semibold text-slate-700 dark:text-on-surface-variant mb-1">
                                    {terms.customerSingular} Full Name <span className="text-rose-500">*</span>
                                </label>
                                <input
                                    required
                                    type="text"
                                    className="w-full border border-slate-300 dark:border-outline-variant rounded-lg px-3.5 py-2 text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 bg-white dark:bg-surface text-slate-800 dark:text-on-surface placeholder:text-slate-400"
                                    placeholder={`e.g. Full name of the visiting ${terms.customerSingular.toLowerCase()}`}
                                    value={patientName}
                                    onChange={(e) => setPatientName(e.target.value)}
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-slate-700 dark:text-on-surface-variant mb-1">
                                    Email Address (Optional)
                                </label>
                                <input
                                    type="email"
                                    className="w-full border border-slate-300 dark:border-outline-variant rounded-lg px-3.5 py-2 text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 bg-white dark:bg-surface text-slate-800 dark:text-on-surface placeholder:text-slate-400"
                                    placeholder="student@example.com"
                                    value={patientEmail}
                                    onChange={(e) => setPatientEmail(e.target.value)}
                                />
                                <span className="text-[11px] text-slate-500 mt-1 block">
                                    Auto-creates account with default password <strong className="text-primary font-mono font-semibold">Welcome@123</strong> (or sign in via Google).
                                </span>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-slate-700 dark:text-on-surface-variant mb-1">
                                    Phone Number (Optional)
                                </label>
                                <input
                                    type="tel"
                                    className="w-full border border-slate-300 dark:border-outline-variant rounded-lg px-3.5 py-2 text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 bg-white dark:bg-surface text-slate-800 dark:text-on-surface placeholder:text-slate-400"
                                    placeholder="98XXXXXXXX"
                                    value={patientPhone}
                                    onChange={(e) => setPatientPhone(e.target.value)}
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-slate-700 dark:text-on-surface-variant mb-1">
                                    {terms.reasonForVisitLabel}
                                </label>
                                <input
                                    type="text"
                                    className="w-full border border-slate-300 dark:border-outline-variant rounded-lg px-3.5 py-2 text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 bg-white dark:bg-surface text-slate-800 dark:text-on-surface placeholder:text-slate-400"
                                    placeholder={orgDefaults.purposePlaceholder}
                                    value={reasonForVisit}
                                    onChange={(e) => setReasonForVisit(e.target.value)}
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-slate-700 dark:text-on-surface-variant mb-1">
                                    Initial Status
                                </label>
                                <select
                                    className="w-full border border-slate-300 dark:border-outline-variant rounded-lg px-3.5 py-2 text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 bg-white dark:bg-surface text-slate-800 dark:text-on-surface font-medium"
                                    value={appointmentStatus}
                                    onChange={(e) => setAppointmentStatus(e.target.value)}
                                >
                                    <option value="CHECKED_IN">Checked In ({terms.inFacility}) - Live in Tracker</option>
                                    <option value="SCHEDULED">Scheduled / Booked</option>
                                    <option value="IN_CONSULTATION">In Progress ({terms.inConsult})</option>
                                    <option value="COMPLETED">Completed</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <hr className="border-slate-100 dark:border-outline-variant/30" />

                    {/* SECTION 2: Provider & Service Selection (SECOND) */}
                    <div>
                        <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2">
                                <span className="w-6 h-6 rounded-full bg-primary text-white text-xs flex items-center justify-center font-bold">2</span>
                                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-on-surface">
                                    Select {terms.providerSingular} & {terms.serviceSingular}
                                </h3>
                            </div>
                            <span className="text-[11px] text-slate-500">Service auto-loads for chosen faculty</span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-semibold text-slate-700 dark:text-on-surface-variant mb-1">
                                    Assigned {terms.providerSingular} <span className="text-rose-500">*</span>
                                </label>
                                <select
                                    required
                                    className="w-full border border-slate-300 dark:border-outline-variant rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 bg-white dark:bg-surface text-slate-800 dark:text-on-surface font-medium"
                                    value={selectedProviderId}
                                    onChange={handleProviderChange}
                                    disabled={isLoadingProviders}
                                >
                                    {isLoadingProviders && <option value="">Loading faculty roster...</option>}
                                    {!isLoadingProviders && providers.length === 0 && (
                                        <option value="">No {terms.providerPlural.toLowerCase()} found</option>
                                    )}
                                    {providers.map((p) => (
                                        <option key={p.id} value={p.id}>
                                            {p.name} {p.specialty ? `(${p.specialty})` : ''}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-slate-700 dark:text-on-surface-variant mb-1">
                                    {orgDefaults.serviceTypeLabel} <span className="text-rose-500">*</span>
                                </label>
                                <select
                                    required
                                    className="w-full border border-slate-300 dark:border-outline-variant rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 bg-white dark:bg-surface text-slate-800 dark:text-on-surface font-medium"
                                    value={selectedService}
                                    onChange={handleServiceChange}
                                    disabled={isLoadingServices}
                                >
                                    {isLoadingServices && <option value="">Fetching provider services...</option>}
                                    {!isLoadingServices && services.length === 0 && (
                                        <option value="">No services configured</option>
                                    )}
                                    {services.map((s) => (
                                        <option key={s.id || s.serviceName} value={s.serviceName}>
                                            {s.serviceName} {s.durationMinutes ? `(${s.durationMinutes}m)` : ''} {s.fee !== undefined ? `- NPR ${s.fee}` : ''}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>

                    <hr className="border-slate-100 dark:border-outline-variant/30" />

                    {/* SECTION 3: Date & Real-Time Time Slots (THIRD) */}
                    <div>
                        <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2">
                                <span className="w-6 h-6 rounded-full bg-primary text-white text-xs flex items-center justify-center font-bold">3</span>
                                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-on-surface">
                                    Date & Real-Time Time Slots
                                </h3>
                            </div>
                            {selectedTimeDisplay ? (
                                <span className="text-xs px-2.5 py-0.5 rounded-full bg-primary/10 text-primary font-bold flex items-center gap-1">
                                    <span className="material-symbols-outlined text-[16px]">check_circle</span>
                                    Selected: {selectedTimeDisplay}
                                </span>
                            ) : (
                                <span className="text-[11px] text-amber-600 font-medium">Please select an available time</span>
                            )}
                        </div>

                        {/* Date Picker */}
                        <div className="mb-4">
                            <label className="block text-xs font-semibold text-slate-700 dark:text-on-surface-variant mb-1">
                                Visit Date <span className="text-rose-500">*</span>
                            </label>
                            <input
                                required
                                type="date"
                                min={todayStr}
                                className="w-full sm:w-64 border border-slate-300 dark:border-outline-variant rounded-lg px-3.5 py-2 text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 bg-white dark:bg-surface text-slate-800 dark:text-on-surface font-medium"
                                value={date}
                                onChange={(e) => setDate(e.target.value)}
                            />
                        </div>

                        {/* Real-Time Slots Grid */}
                        <div className="space-y-2">
                            <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                                <span>Available Schedule Slots ({slots.length} total)</span>
                                <div className="flex items-center gap-3 text-[11px]">
                                    <span className="flex items-center gap-1">
                                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block"></span> Available
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <span className="w-2.5 h-2.5 rounded-full bg-rose-400 inline-block"></span> Sold Out
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <span className="w-2.5 h-2.5 rounded-full bg-slate-300 inline-block"></span> Passed
                                    </span>
                                </div>
                            </div>

                            {isLoadingSlots && (
                                <div className="p-8 rounded-xl border border-dashed border-slate-200 dark:border-outline-variant flex items-center justify-center gap-3 text-sm text-slate-500">
                                    <span className="material-symbols-outlined animate-spin text-primary">progress_activity</span>
                                    Checking real-time schedule & bookings...
                                </div>
                            )}

                            {!isLoadingSlots && isClosed && (
                                <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-sm flex items-start gap-2.5">
                                    <span className="material-symbols-outlined text-amber-600 text-[20px] shrink-0 mt-0.5">event_busy</span>
                                    <div>
                                        <span className="font-semibold">{selectedProviderName} is not scheduled for this day.</span>
                                        <p className="text-xs text-amber-700 mt-0.5">{closedMessage || 'No open hours on this date. Please pick another date.'}</p>
                                    </div>
                                </div>
                            )}

                            {!isLoadingSlots && !isClosed && slots.length === 0 && (
                                <div className="p-6 rounded-xl border border-dashed border-slate-200 dark:border-outline-variant text-center text-sm text-slate-500">
                                    No time slots found for this date.
                                </div>
                            )}

                            {!isLoadingSlots && !isClosed && slots.length > 0 && (
                                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
                                    {slots.map((s) => {
                                        const isSoldOut = Boolean(s.isBooked);
                                        const isPassed = Boolean(s.isPast);
                                        const isBreakTime = Boolean(s.isBreak);
                                        const isDisabled = isSoldOut || isPassed || isBreakTime;
                                        const slot24 = s.slotTime24 || convertDisplayTimeTo24(s.time);
                                        const isSelected = selectedTime24 === slot24;

                                        let btnClass = 'relative flex flex-col items-center justify-center p-2 rounded-xl text-xs font-semibold transition-all border ';

                                        if (isSoldOut) {
                                            btnClass += 'bg-rose-50/70 dark:bg-rose-950/20 border-rose-200 text-rose-400 cursor-not-allowed line-through opacity-70';
                                        } else if (isPassed) {
                                            btnClass += 'bg-slate-100 dark:bg-surface-container border-slate-200 text-slate-400 cursor-not-allowed opacity-50';
                                        } else if (isBreakTime) {
                                            btnClass += 'bg-amber-50 border-amber-200 text-amber-500 cursor-not-allowed opacity-60';
                                        } else if (isSelected) {
                                            btnClass += 'bg-primary text-white border-primary shadow-md shadow-primary/25 scale-[1.03] ring-2 ring-primary/30';
                                        } else {
                                            btnClass += 'bg-white dark:bg-surface border-slate-200 dark:border-outline-variant text-slate-700 dark:text-on-surface hover:border-primary hover:text-primary hover:bg-primary/5 cursor-pointer';
                                        }

                                        return (
                                            <button
                                                key={s.id}
                                                type="button"
                                                onClick={() => handleSelectSlot(s)}
                                                disabled={isDisabled}
                                                className={btnClass}
                                                title={isSoldOut ? 'Already booked (Sold Out)' : isPassed ? 'Time has passed' : isBreakTime ? 'Break time' : 'Click to select'}
                                            >
                                                <span>{s.time}</span>
                                                {isSoldOut && (
                                                    <span className="text-[9px] uppercase font-bold tracking-tight text-rose-600 no-underline block mt-0.5">
                                                        Sold Out
                                                    </span>
                                                )}
                                                {isPassed && !isSoldOut && (
                                                    <span className="text-[9px] uppercase font-bold tracking-tight text-slate-400 block mt-0.5">
                                                        Passed
                                                    </span>
                                                )}
                                                {isBreakTime && (
                                                    <span className="text-[9px] uppercase font-bold tracking-tight text-amber-600 block mt-0.5">
                                                        Break
                                                    </span>
                                                )}
                                                {isSelected && (
                                                    <span className="text-[9px] uppercase font-bold tracking-tight text-white block mt-0.5 flex items-center gap-0.5">
                                                        <span className="material-symbols-outlined text-[10px]">check</span> Chosen
                                                    </span>
                                                )}
                                            </button>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </div>

                    <hr className="border-slate-100 dark:border-outline-variant/30" />

                    {/* SECTION 4: Fee & Billing & Notes */}
                    <div>
                        <div className="flex items-center gap-2 mb-3">
                            <span className="w-6 h-6 rounded-full bg-slate-200 dark:bg-surface-container text-slate-700 dark:text-on-surface text-xs flex items-center justify-center font-bold">4</span>
                            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-on-surface">
                                Fee & Payment (Optional)
                            </h3>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-xs font-semibold text-slate-700 dark:text-on-surface-variant mb-1">
                                    Fee (NPR / Rs.)
                                </label>
                                <input
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    className="w-full border border-slate-300 dark:border-outline-variant rounded-lg px-3.5 py-2 text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 bg-white dark:bg-surface text-slate-800 dark:text-on-surface"
                                    value={price}
                                    onChange={(e) => setPrice(e.target.value)}
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-slate-700 dark:text-on-surface-variant mb-1">
                                    Payment Method
                                </label>
                                <select
                                    className="w-full border border-slate-300 dark:border-outline-variant rounded-lg px-3.5 py-2 text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 bg-white dark:bg-surface text-slate-800 dark:text-on-surface"
                                    value={paymentMethod}
                                    onChange={(e) => setPaymentMethod(e.target.value)}
                                >
                                    <option value="CASH">Cash</option>
                                    <option value="CARD">Card / POS</option>
                                    <option value="ESEWA">eSewa</option>
                                    <option value="COMPLIMENTARY">Complimentary / Free</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-slate-700 dark:text-on-surface-variant mb-1">
                                    Payment Status
                                </label>
                                <select
                                    className="w-full border border-slate-300 dark:border-outline-variant rounded-lg px-3.5 py-2 text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 bg-white dark:bg-surface text-slate-800 dark:text-on-surface font-semibold"
                                    value={paymentStatus}
                                    onChange={(e) => setPaymentStatus(e.target.value)}
                                >
                                    <option value="PAID">Paid / Received</option>
                                    <option value="PENDING">Pending</option>
                                    <option value="COMPLIMENTARY">Waived / Free</option>
                                </select>
                            </div>
                        </div>

                        <div className="mt-4">
                            <label className="block text-xs font-semibold text-slate-700 dark:text-on-surface-variant mb-1">
                                Internal Remarks / Administrative Notes
                            </label>
                            <textarea
                                rows={2}
                                className="w-full border border-slate-300 dark:border-outline-variant rounded-lg px-3.5 py-2 text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 bg-white dark:bg-surface text-slate-800 dark:text-on-surface placeholder:text-slate-400 resize-none"
                                placeholder="Add any special remarks regarding this physical visit..."
                                value={internalNotes}
                                onChange={(e) => setInternalNotes(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="pt-4 border-t border-slate-100 dark:border-outline-variant/30 flex items-center justify-end gap-3">
                        <button
                            type="button"
                            className="px-5 py-2.5 rounded-xl text-sm font-semibold text-slate-600 dark:text-on-surface-variant hover:bg-slate-100 dark:hover:bg-surface-container transition-colors cursor-pointer"
                            onClick={onClose}
                            disabled={isSubmitting}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting || !selectedTime24}
                            className="px-6 py-2.5 rounded-xl bg-primary text-white text-sm font-bold shadow-md shadow-primary/25 hover:brightness-110 active:scale-95 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isSubmitting ? (
                                <>
                                    <span className="material-symbols-outlined animate-spin text-[18px]">progress_activity</span>
                                    <span>Saving to Database...</span>
                                </>
                            ) : !selectedTime24 ? (
                                <>
                                    <span className="material-symbols-outlined text-[18px]">schedule</span>
                                    <span>Select an Available Time Slot</span>
                                </>
                            ) : (
                                <>
                                    <span className="material-symbols-outlined text-[18px]">save</span>
                                    <span>Save & Register {terms.appointmentSingular} ({selectedTimeDisplay})</span>
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
