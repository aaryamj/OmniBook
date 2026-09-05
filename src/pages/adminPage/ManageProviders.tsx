import axios from 'axios';
import React, { useState, useEffect } from 'react';
import AdminSidebar from './components/AdminSidebar';
import TopNavigation from '../superAdminPage/components/TopNavigation';
import ProviderManagementHub from './components/ProviderManagementHub';

const initialProviders = [
    {
        id: 'p1',
        name: 'Dr. Sarah Adler',
        role: 'Head of Cardiology',
        tier: 'TIER 1',
        utilization: 82,
        utilLabel: 'Optimal',
        utilColor: 'text-green-600',
        stripe: '$1,200.00',
        esewa: 'Rs. 40,000',
        imageBg: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBHWD8ig2IGSdb6vtpEDeTbSywEiTLDgYBY5-TbH9iuaj5mzONXqPHSxqPDyQkvFDFSlgeeMx654HB0xHxXaJWOHoFoqqlt-hzLzfCBDPkZOrtTGL0eJVoBfwobcgK_6GSbJS3OTYtDpV4lteR1GTJy4YL4KFP_FA5Rw5rI-O-kk6XHZIoCs0dEUEeRTc3nBcNMTgLsmfcV01H62CrZBChe4Cbpg-0OaJPX6UoBxmEiKpnGSI6amPjY0SbjYY1ULB_lT38EMnpmf2o',
        imageAvatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCWQO702KACk-4Gumfv1cnVWlZdMnsaxkOUb0zoPW8hm09X95pQJ6AYd4L-u927R3uv6ywADoq3_PS6SG9k4M20z-h_BQzLqF6mQ3KuUSyxORl5sUFLivXM0COXaF2phsqOhBFfVeXQs6x9nxHPPF-FvWtso7qHQCiSB1C58VqlRT2IizE__s5OpW6EMOu8ojlqZwbfC-smmd2OMlL-XiJwtHmDilurjOzquqYsd3o4sSS2zf9iRuoeoiX8Gn0Xm3UR-eZdnJIoB8U',
        isLive: true,
        hasHeatmap: true
    },
    {
        id: 'p2',
        name: 'Dr. Elias Thorne',
        role: 'General Medicine',
        tier: 'TIER 2',
        utilization: 80,
        utilLabel: 'Stable',
        utilColor: 'text-on-surface',
        stripe: '$900.00',
        esewa: 'Rs. 25,000',
        imageBg: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDpoR1sz2z7Q1zg_iKjkzYfdsquaQrZmdTb97jaP_bVMs9sjTRdIEO_oXDcdWa0JYrmKBDLi1T8flYy0zc4Ck9td-lYTG_X3GAgZ3xmB7Dzh3k_HMgKMWVqDBe0CSGDMlV4g71UEOw_U7bmBLwBmfqGEbold6o01VBsfNymzr8ZjKs15F-NPmCWd8KqfYeE5v6NILeVgckg7Wbei66kGSEblG1irPqdyevV_gQsmn-mSiij_bPQtYc0JEdUEAhmkS1FL-PGSBHqKl8',
        imageAvatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCmHOJD8-mTNCccCQIcRuy0ildrRdOXdNqQ1ZuGZFVa3ro4yTMTNoWdRNrVGJFY0_kwAdPjoTzNVYGcqrGaIdZ0KaDTCyDB5kXH6S7gZT3m4mGZh0oBovX_y4W3P3BXShaisk1KPSB5waCki0Ii_g8Nd5npTuvVfKR4MxR9TDAI9R2_esAGTHVG2MuCvI07E2ol5vs198pf032s_JivuOothsJRM5t7Hm7nO3kSSY4G8K0wlkOm__aoAJZ61pwMjJeglxZdW8kI2DY',
        isLive: false,
        hasHeatmap: false
    },
    {
        id: 'p3',
        name: 'Dr. Ananya Gupta',
        role: 'Pediatrics',
        tier: 'TIER 2',
        utilization: 65,
        utilLabel: 'Available',
        utilColor: 'text-on-surface',
        stripe: '$750.00',
        esewa: 'Rs. 15,000',
        imageBg: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAERTJL1DO3LZLXoqBLV7SR3JigMJG50XPXhb84htb0JeBgNgQ5oujaslrIK1PVu3JbeJb8fvxm5v2qgOIOhaysh7ycgqVuiLRT3lzIx_jqnsv6XkcaYhc6GGpxxXQP8NaRwZAGMTbn5upaQmPeEy-mdkgEIK5MDGAfjwAPduzBi46gea5A0F-i-3f5weNt4fMVasdh6x50Nz6rsmjhvYJK3sJeoSMPpBQulrfIaOHGyaVEFO5dBNIwNyvSswdpI9qbqVpe7gBckUg',
        imageAvatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBTfSxiDLvoFbfOwYhL1CDxZhcQVDI9cgAlGuCnrCeGqP4nQ4KUGEg1Vit3uVmAw3AqBz1t1KOXU6YCsKyzD80DGWibT81GncN7m5TCkaME6-SuZ_JXvAIUEacRdF8O4ksL8LpKJQHPDBGABY4kLJHZtVD9z-ZHuIv51aYBLW7yC6ulzQ57OT05FarzkX-wKOvN5VU4zGJT74sDDGxnZV5_9QcPEAXLmqAtPGvyFlx-UxZ4zpchps3W8eJZsGXkxn1jRSCxERR73RE',
        isLive: false,
        hasHeatmap: false
    }
];

export default function ManageProviders() {
    const [providers, setProviders] = useState<any[]>([]);
    
    // Modal & Drawer states
    const [isManageShiftsOpen, setIsManageShiftsOpen] = useState(false);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [drawerStep, setDrawerStep] = useState(1);
    const [isProvisioning, setIsProvisioning] = useState(false);
    const [toastMsg, setToastMsg] = useState('');
    const [departments, setDepartments] = useState<any[]>([]);
    
    // Macro Calendar States
    const [shifts, setShifts] = useState<Record<string, any>>({});
    const [isSavingSchedule, setIsSavingSchedule] = useState(false);
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
    const shiftTemplates = [
        { id: 'morning', name: 'Morning (08:00 - 14:00)', color: 'bg-blue-100 text-blue-800 border-blue-200' },
        { id: 'evening', name: 'Evening (14:00 - 20:00)', color: 'bg-purple-100 text-purple-800 border-purple-200' },
        { id: 'night', name: 'Night (20:00 - 08:00)', color: 'bg-indigo-100 text-indigo-800 border-indigo-200' },
        { id: 'leave', name: 'On Leave', color: 'bg-red-100 text-red-800 border-red-200' }
    ];
    
    const [editScheduleProviderId, setEditScheduleProviderId] = useState<string | null>(null);
    const [editScheduleTab, setEditScheduleTab] = useState<'standard' | 'overrides'>('standard');
    const [isSavingEdit, setIsSavingEdit] = useState(false);
    const [overrideDateInput, setOverrideDateInput] = useState('');
    const [revokeProviderId, setRevokeProviderId] = useState<string | null>(null);
    const [revokeConfirmName, setRevokeConfirmName] = useState('');
    const [isRevoking, setIsRevoking] = useState(false);

    // Form states
    const [drawerForm, setDrawerForm] = useState({ name: '', email: '', specialization: '', tier: '', address: '' });
    
    // Fetch Clinic Address
    useEffect(() => {
        const fetchTenantAddress = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) return;
                const response = await axios.get('http://localhost:8080/api/v1/tenant/me', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                if (response.data && response.data.address) {
                    setDrawerForm(prev => ({ ...prev, address: response.data.address }));
                }
            } catch (error) {
                console.error("Failed to fetch clinic address:", error);
            }
        };
        fetchTenantAddress();

        const fetchDepartments = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) return;
                const response = await axios.get('http://localhost:8080/api/v1/admin/departments', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setDepartments(response.data.filter((d: any) => d.active));
            } catch (error) {
                console.error("Failed to fetch departments:", error);
            }
        };
        fetchDepartments();
        
        const fetchAllProviders = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) return;
                const response = await axios.get('http://localhost:8080/api/v1/admin/providers', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                
                const activeProviders = response.data.filter((p: any) => p.status === 'ACTIVE');
                
                // Map DB providers to the format needed for the Shifts UI and KPI
                const mappedProviders = activeProviders.map((p: any) => ({
                    id: p.id.toString(),
                    name: p.name || p.email,
                    role: p.primarySpecialty || p.role || 'Provider',
                    tier: p.tier || 'TIER 1',
                    utilization: 80, // Simulated metric
                    utilLabel: 'Stable',
                    utilColor: 'text-on-surface',
                    stripe: '$0.00',
                    esewa: 'Rs. 0',
                    imageBg: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDpoR1sz2z7Q1zg_iKjkzYfdsquaQrZmdTb97jaP_bVMs9sjTRdIEO_oXDcdWa0JYrmKBDLi1T8flYy0zc4Ck9td-lYTG_X3GAgZ3xmB7Dzh3k_HMgKMWVqDBe0CSGDMlV4g71UEOw_U7bmBLwBmfqGEbold6o01VBsfNymzr8ZjKs15F-NPmCWd8KqfYeE5v6NILeVgckg7Wbei66kGSEblG1irPqdyevV_gQsmn-mSiij_bPQtYc0JEdUEAhmkS1FL-PGSBHqKl8',
                    imageAvatar: p.profilePictureUrl || 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRzI9P7k4Z-Q3fW-iO404l-tC6M5D1E1z4E9Q&s',
                    isLive: false,
                    hasHeatmap: false
                }));
                
                setProviders(mappedProviders);
            } catch (error) {
                console.error("Failed to fetch all providers:", error);
            }
        };
        fetchAllProviders();
    }, []);
    const initialScheduleForm = {
        intervalMinutes: 20,
        standardWeek: {
            'Monday': { isActive: true, start: '09:00', end: '17:00' },
            'Tuesday': { isActive: true, start: '09:00', end: '17:00' },
            'Wednesday': { isActive: true, start: '09:00', end: '17:00' },
            'Thursday': { isActive: true, start: '09:00', end: '17:00' },
            'Friday': { isActive: true, start: '09:00', end: '17:00' },
            'Saturday': { isActive: false, start: '10:00', end: '14:00' },
            'Sunday': { isActive: false, start: '10:00', end: '14:00' }
        } as Record<string, { isActive: boolean, start: string, end: string }>,
        overrides: [] as string[]
    };
    const [editScheduleForm, setEditScheduleForm] = useState(initialScheduleForm);

    // Handlers
    
    // Drag and Drop Handlers
    const handleDragStart = (e: React.DragEvent, shiftTemplate: any) => {
        e.dataTransfer.setData('shiftTemplate', JSON.stringify(shiftTemplate));
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
    };

    const handleDrop = (e: React.DragEvent, providerId: string, day: string, providerName: string) => {
        e.preventDefault();
        const shiftData = e.dataTransfer.getData('shiftTemplate');
        if (!shiftData) return;
        const shift = JSON.parse(shiftData);
        const key = `${providerId}-${day}`;
        
        // Conflict Detection
        if (shifts[key]) {
            setToastMsg(`Conflict: ${providerName} is already scheduled during this block.`);
            setTimeout(() => setToastMsg(''), 4000);
            // Flash a red error visually if we wanted, toast is good.
            return;
        }
        
        setShifts(prev => ({ ...prev, [key]: shift }));
    };

    const handleSaveSchedule = () => {
        setIsSavingSchedule(true);
        setTimeout(() => {
            setIsSavingSchedule(false);
            setIsManageShiftsOpen(false);
            setToastMsg('Bulk schedule successfully updated.');
            setTimeout(() => setToastMsg(''), 4000);
        }, 1500);
    };

    const handleNextStep = () => {
        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!drawerForm.name || !drawerForm.email || !drawerForm.specialization || !drawerForm.address) {
            alert('Please fill in all required identity fields.');
            return;
        }
        if (!emailRegex.test(drawerForm.email)) {
            alert('Please enter a valid email address.');
            return;
        }
        setDrawerStep(2);
    };

    const handleDrawerSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!drawerForm.tier) {
            alert('Please select an access tier.');
            return;
        }
        setIsProvisioning(true);
        
        try {
            const token = localStorage.getItem('token');
            if (!token || token === 'null' || token === 'undefined') {
                alert('Authentication error: You are not logged in or your session has expired. Please log in again.');
                setIsProvisioning(false);
                return;
            }
            
            const response = await axios.post(
                'http://localhost:8080/api/v1/admin/providers/invite',
                {
                    email: drawerForm.email,
                    name: drawerForm.name,
                    specialization: drawerForm.specialization,
                    tier: drawerForm.tier
                },
                {
                    headers: { Authorization: `Bearer ${token}` }
                }
            );

            if (response.status === 200) {
                // Keep the simulation for the UI update so it immediately shows up in the matrix
                const newId = 'p' + (providers.length + 1) + Math.floor(Math.random() * 1000);
                const newProvider: any = {
                    id: newId,
                    name: drawerForm.name,
                    role: drawerForm.specialization,
                    tier: drawerForm.tier,
                    utilization: 0,
                    utilLabel: 'Onboarding',
                    utilColor: 'text-on-surface-variant',
                    stripe: '$0.00',
                    esewa: 'Rs. 0',
                    imageBg: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDpoR1sz2z7Q1zg_iKjkzYfdsquaQrZmdTb97jaP_bVMs9sjTRdIEO_oXDcdWa0JYrmKBDLi1T8flYy0zc4Ck9td-lYTG_X3GAgZ3xmB7Dzh3k_HMgKMWVqDBe0CSGDMlV4g71UEOw_U7bmBLwBmfqGEbold6o01VBsfNymzr8ZjKs15F-NPmCWd8KqfYeE5v6NILeVgckg7Wbei66kGSEblG1irPqdyevV_gQsmn-mSiij_bPQtYc0JEdUEAhmkS1FL-PGSBHqKl8',
                    imageAvatar: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRzI9P7k4Z-Q3fW-iO404l-tC6M5D1E1z4E9Q&s', // generic placeholder
                    isLive: false,
                    hasHeatmap: false,
                    status: 'Pending Activation'
                };
                setProviders([newProvider, ...providers]);
                setIsProvisioning(false);
                setIsDrawerOpen(false);
                
                // Show toast
                setToastMsg(`Invitation successfully dispatched to ${drawerForm.email}`);
                setTimeout(() => setToastMsg(''), 4000);
                
                // Reset form (keeping address)
                setDrawerForm(prev => ({ ...prev, name: '', email: '', specialization: '', licenseNumber: '', tier: '' }));
                setDrawerStep(1);
            }
        } catch (error: any) {
            setIsProvisioning(false);
            console.error('Failed to invite provider', error);
            alert('Failed to send invitation: ' + (error.response?.data?.message || error.message));
        }
    };

    const handleEditSchedule = (e: React.FormEvent) => {
        e.preventDefault();
        setIsSavingEdit(true);
        setTimeout(() => {
            setIsSavingEdit(false);
            setEditScheduleProviderId(null);
            setToastMsg('Provider schedule successfully updated.');
            setTimeout(() => setToastMsg(''), 4000);
        }, 1000);
    };

    const handleRevokeAccess = () => {
        setIsRevoking(true);
        setTimeout(() => {
            setProviders(providers.filter(p => p.id !== revokeProviderId));
            setRevokeProviderId(null);
            setRevokeConfirmName('');
            setIsRevoking(false);
            setToastMsg('Access Revoked. Active sessions terminated.');
            setTimeout(() => setToastMsg(''), 4000);
        }, 1000);
    };

    const calculateTotalSlots = () => {
        let totalMinutes = 0;
        Object.values(editScheduleForm.standardWeek).forEach(day => {
            if (day.isActive) {
                const [startH, startM] = day.start.split(':').map(Number);
                const [endH, endM] = day.end.split(':').map(Number);
                const startTotal = startH * 60 + startM;
                const endTotal = endH * 60 + endM;
                if (endTotal > startTotal) {
                    totalMinutes += (endTotal - startTotal);
                }
            }
        });
        const activeDays = Object.values(editScheduleForm.standardWeek).filter(d => d.isActive).length;
        if (activeDays === 0) return 0;
        
        const avgMinutesPerDay = totalMinutes / activeDays;
        return Math.floor(avgMinutesPerDay / editScheduleForm.intervalMinutes);
    };

    return (
        <div className="superadmin-theme">
            <div className="bg-background text-on-surface font-sans min-h-screen relative">
                <AdminSidebar />
                <TopNavigation />

                <main className="ml-sidebar-width pt-24 pb-gutter px-gutter min-h-screen flex flex-col bg-[#F8FAFC]">
                    {/* View Content */}
                    {/* View Content */}
                    {!isManageShiftsOpen ? (
                        <div className="max-w-container-max mx-auto w-full flex-1 flex flex-col animate-fade-in">
                            {/* Page Title & Actions */}
                            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                                <div>
                                    <h2 className="text-2xl sm:text-headline-lg font-headline-lg font-black text-primary tracking-tight">Provider & Access Management</h2>
                                    <p className="text-on-surface-variant mt-1 text-sm sm:text-base">High-authority control over clinic staffing and medical permissions.</p>
                                </div>
                                <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
                                    <button 
                                        className="flex-1 sm:flex-initial justify-center flex items-center gap-2 border border-outline px-4 sm:px-6 py-2.5 rounded-full font-label-md text-label-md hover:bg-surface-variant transition-all cursor-pointer"
                                        onClick={() => setIsManageShiftsOpen(true)}
                                    >
                                        <span className="material-symbols-outlined">calendar_today</span>
                                        Manage Shifts
                                    </button>
                                    <button 
                                        className="flex-1 sm:flex-initial justify-center flex items-center gap-2 bg-[#0F172A] text-white px-4 sm:px-6 py-2.5 rounded-full font-label-md text-label-md hover:bg-[#1E293B] transition-all shadow-xl shadow-primary/10 cursor-pointer"
                                        onClick={() => { setIsDrawerOpen(true); setDrawerStep(1); }}
                                    >
                                        <span className="material-symbols-outlined">person_add</span>
                                        Provision New Provider
                                    </button>
                                </div>
                            </div>

                            {/* KPI Row */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                                {/* KPI 1 */}
                                <div className="glass-card p-6 rounded-2xl flex items-center justify-between transition-colors">
                                    <div>
                                        <p className="text-on-surface-variant text-xs font-bold uppercase tracking-widest mb-1">Active Medical Staff</p>
                                        <h3 className="text-4xl font-black text-primary">{providers.length} <span className="text-lg font-medium text-on-surface-variant">Providers</span></h3>
                                    </div>
                                    <div className="w-14 h-14 rounded-2xl bg-secondary-fixed flex items-center justify-center">
                                        <span className="material-symbols-outlined text-secondary text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>groups</span>
                                    </div>
                                </div>

                                {/* KPI 2 */}
                                <div className="glass-card p-6 rounded-2xl transition-colors">
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <p className="text-on-surface-variant text-xs font-bold uppercase tracking-widest mb-1">Clinic Utilization</p>
                                            <h3 className="text-4xl font-black text-primary">84% <span className="text-lg font-medium text-on-surface-variant">Capacity</span></h3>
                                        </div>
                                        <div className="px-2 py-1 bg-green-100 text-green-700 text-[10px] font-black rounded-md flex items-center gap-1">
                                            <span className="material-symbols-outlined text-[12px]">trending_up</span> +5.2%
                                        </div>
                                    </div>
                                    {/* Mini Chart Visualization */}
                                    <div className="h-10 w-full flex items-end gap-1 overflow-hidden">
                                        <div className="flex-1 bg-secondary-container rounded-t-sm h-[40%]"></div>
                                        <div className="flex-1 bg-secondary-container rounded-t-sm h-[60%]"></div>
                                        <div className="flex-1 bg-secondary-container rounded-t-sm h-[45%]"></div>
                                        <div className="flex-1 bg-secondary-container rounded-t-sm h-[80%]"></div>
                                        <div className="flex-1 bg-secondary-container rounded-t-sm h-[70%]"></div>
                                        <div className="flex-1 bg-secondary-container rounded-t-sm h-[95%] shadow-[0_0_15px_rgba(64,194,253,0.5)]"></div>
                                        <div className="flex-1 bg-secondary-container rounded-t-sm h-[84%]"></div>
                                    </div>
                                </div>

                                {/* KPI 3 */}
                                <div className="glass-card p-6 rounded-2xl relative overflow-hidden transition-colors">
                                    {/* Thin blue design on the left, curved and fading out */}
                                    <div className="absolute left-0 top-0 bottom-0 w-[4px] bg-gradient-to-b from-[#0EA5E9] via-[#0EA5E9]/80 to-transparent rounded-l-2xl shadow-[-2px_0_12px_rgba(14,165,233,0.8)]"></div>
                                    
                                    <p className="text-on-surface-variant text-xs font-bold uppercase tracking-widest mb-2">Top Earner (This Week)</p>
                                    <div className="flex items-center gap-3 mb-3">
                                        <img className="w-10 h-10 rounded-full object-cover" alt="Dr. Sarah Adler" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBZZJSv49efLX5fD2Hu8f35aMHPVZq5N7H9rS4tx3RCKiOKH20Xvlq1pSEzYlmFPETv5o-deCMVigpd6tcDLi_bLmKUkNfivq3a-OteUznt_HSbouQxhqRYSkyjtd23G1gFATmGMHsezkDv_irvs4TTIdJS9NOmj4xKI1jjeCjEeHBAU90PNVDZlEBZ6I1k-Gy9twMo8F23ao_s4Kp1il4NNj_u37I1rKzNoIA6rjgJ576-fZ7TIYtr2FgOYIGGj_2SJIi6k9rsJxI" />
                                        <div>
                                            <h4 className="font-bold text-primary">Dr. Sarah Adler</h4>
                                            <p className="text-[10px] text-on-surface-variant font-mono uppercase">Lead Cardiologist</p>
                                        </div>
                                    </div>
                                    <div className="flex justify-between items-center bg-slate-50 p-2 rounded-lg border border-outline-variant/30">
                                        <div className="text-center flex-1 border-r border-outline-variant/20">
                                            <p className="text-[10px] text-on-surface-variant uppercase font-bold">Stripe</p>
                                            <p className="font-mono-data text-secondary font-bold">$1.2k</p>
                                        </div>
                                        <div className="text-center flex-1">
                                            <p className="text-[10px] text-on-surface-variant uppercase font-bold">eSewa</p>
                                            <p className="font-mono-data text-secondary font-bold">Rs. 40k</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            {/* Provider Management Hub */}
                            <ProviderManagementHub />

                            {/* Identity Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                {providers.map(provider => (
                                    <div key={provider.id} className="glass-card rounded-3xl overflow-hidden group hover:shadow-2xl transition-all duration-500 hover:-translate-y-1 flex flex-col">
                                        <div className="h-40 relative">
                                            <img className={`w-full h-full object-cover ${provider.isLive ? '' : 'opacity-60'}`} alt="Clinic Background" src={provider.imageBg} />
                                            <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent"></div>
                                            <div className="absolute bottom-0 left-6 flex items-end gap-4 translate-y-6">
                                                <div className="relative">
                                                    <img className="w-24 h-24 rounded-2xl object-cover border-4 border-white shadow-xl" alt={`${provider.name} Portrait`} src={provider.imageAvatar} />
                                                    <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-2 border-white flex items-center justify-center">
                                                        <span className="material-symbols-outlined text-[14px] text-white">check</span>
                                                    </div>
                                                </div>
                                            </div>
                                            {provider.isLive && (
                                                <div className="absolute top-4 right-4 bg-white/80 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/50 flex items-center gap-2">
                                                    <div className="w-2 h-2 rounded-full bg-secondary-container animate-pulse"></div>
                                                    <span className="font-mono-data text-[10px] font-bold text-primary">LIVE NOW</span>
                                                </div>
                                            )}
                                        </div>
                                        <div className="pt-10 px-6 pb-6 flex-1 flex flex-col">
                                            <div className="flex justify-between items-start mb-4">
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <h4 className="text-xl font-black text-primary">{provider.name}</h4>
                                                        {(provider as any).status === 'Pending Activation' && (
                                                            <span className="bg-yellow-100 text-yellow-800 text-[10px] font-bold px-2 py-0.5 rounded-full border border-yellow-200">Pending Activation</span>
                                                        )}
                                                    </div>
                                                    <p className="text-on-surface-variant font-medium">{provider.role}</p>
                                                </div>
                                                <div className={`${provider.tier === 'TIER 1' ? 'bg-primary-container text-white' : 'bg-outline-variant text-on-surface'} px-3 py-1 rounded-md flex flex-col items-center`}>
                                                    <span className="text-[9px] uppercase font-bold tracking-tighter opacity-70">Access</span>
                                                    <span className="text-[10px] font-black">{provider.tier}</span>
                                                </div>
                                            </div>
                                            {/* Utilization */}
                                            <div className="mb-6 flex-1">
                                                {provider.hasHeatmap ? (
                                                    <>
                                                        <div className="flex justify-between items-center mb-2">
                                                            <span className="text-[11px] font-bold text-on-surface-variant uppercase tracking-widest">Utilization Heatmap</span>
                                                            <span className={`text-[10px] font-mono-data ${provider.utilColor}`}>{provider.utilLabel} ({provider.utilization}%)</span>
                                                        </div>
                                                        <div className="flex gap-2">
                                                            <div className="flex-1 flex flex-col items-center gap-1">
                                                                <div className="w-full h-1.5 rounded-full bg-slate-200"></div>
                                                                <span className="text-[8px] font-bold text-on-surface-variant">MON</span>
                                                            </div>
                                                            <div className="flex-1 flex flex-col items-center gap-1">
                                                                <div className="w-full h-1.5 rounded-full bg-error heatmap-glow-red"></div>
                                                                <span className="text-[8px] font-bold text-on-surface-variant">TUE</span>
                                                            </div>
                                                            <div className="flex-1 flex flex-col items-center gap-1">
                                                                <div className="w-full h-1.5 rounded-full bg-slate-200"></div>
                                                                <span className="text-[8px] font-bold text-on-surface-variant">WED</span>
                                                            </div>
                                                            <div className="flex-1 flex flex-col items-center gap-1">
                                                                <div className="w-full h-1.5 rounded-full bg-error heatmap-glow-red"></div>
                                                                <span className="text-[8px] font-bold text-on-surface-variant">THU</span>
                                                            </div>
                                                            <div className="flex-1 flex flex-col items-center gap-1">
                                                                <div className="w-full h-1.5 rounded-full bg-green-500 heatmap-glow-green"></div>
                                                                <span className="text-[8px] font-bold text-on-surface-variant">FRI</span>
                                                            </div>
                                                        </div>
                                                    </>
                                                ) : (
                                                    <>
                                                        <div className="flex justify-between items-center mb-2">
                                                            <span className="text-[11px] font-bold text-on-surface-variant uppercase tracking-widest">Utilization</span>
                                                            <span className={`text-[10px] font-mono-data ${provider.utilColor}`}>{provider.utilLabel} ({provider.utilization}%)</span>
                                                        </div>
                                                        <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                                                            <div className="h-full bg-secondary-container rounded-full shadow-[0_0_8px_rgba(64,194,253,0.4)]" style={{ width: `${provider.utilization}%` }}></div>
                                                        </div>
                                                    </>
                                                )}
                                            </div>
                                            {/* Financial Summary */}
                                            <div className="bg-slate-50/50 border border-outline-variant p-4 rounded-2xl mb-6">
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div>
                                                        <p className="text-[10px] text-on-surface-variant font-bold uppercase mb-1">Stripe Revenue</p>
                                                        <p className="font-mono-data text-lg font-black text-primary">{provider.stripe}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-[10px] text-on-surface-variant font-bold uppercase mb-1">eSewa Wallet</p>
                                                        <p className="font-mono-data text-lg font-black text-primary">{provider.esewa}</p>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex gap-2 mt-auto">
                                                <button 
                                                    className={`flex-1 py-3 font-bold rounded-xl text-xs transition-colors border ${provider.hasHeatmap ? 'bg-secondary-container/10 hover:bg-secondary-container/20 text-secondary-container border-secondary-container/20' : 'border-outline-variant hover:bg-slate-100'}`}
                                                    onClick={() => {
                                                        setEditScheduleProviderId(provider.id);
                                                        setEditScheduleForm(initialScheduleForm);
                                                        setEditScheduleTab('standard');
                                                    }}
                                                >
                                                    Edit Schedule
                                                </button>
                                                <button 
                                                    className={`flex-1 py-3 font-bold rounded-xl text-xs transition-colors border ${provider.hasHeatmap ? 'bg-error/5 hover:bg-error/10 text-error border-error/10' : 'border-error/20 text-error hover:bg-error/5'}`}
                                                    onClick={() => setRevokeProviderId(provider.id)}
                                                >
                                                    Revoke Access
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Footer Meta */}
                            <div className="mt-12 mb-8 border-t border-outline-variant pt-8 flex justify-between items-center">
                                <div className="flex items-center gap-6">
                                    <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]"></div>
                                        <span className="text-xs text-on-surface-variant font-mono">SYSTEM GATEWAY: ONLINE</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="material-symbols-outlined text-sm text-on-surface-variant">lock</span>
                                        <span className="text-xs text-on-surface-variant font-mono">ENCRYPTION: AES-256</span>
                                    </div>
                                </div>
                                <p className="text-[10px] text-on-surface-variant uppercase font-bold tracking-widest">OmniBook Protocol v4.2.1-Standard</p>
                            </div>
                        </div>
                    ) : (
                        <div className="max-w-[1600px] mx-auto w-full flex-1 flex flex-col animate-fade-in">
                            {/* Macro Calendar Header */}
                            <div className="flex flex-col md:flex-row justify-between items-end md:items-center gap-4 mb-6">
                                <div>
                                    <div className="flex items-center gap-3">
                                        <button 
                                            onClick={() => setIsManageShiftsOpen(false)}
                                            className="w-10 h-10 rounded-full hover:bg-surface-variant flex items-center justify-center transition-colors"
                                        >
                                            <span className="material-symbols-outlined">arrow_back</span>
                                        </button>
                                        <h2 className="font-headline-lg text-headline-lg font-black text-primary tracking-tight">Macro Schedule Editor</h2>
                                    </div>
                                    <p className="text-on-surface-variant mt-1 ml-13">Drag and drop shifts from the templates to assign schedules globally.</p>
                                </div>
                                <div className="flex gap-3">
                                    <button 
                                        className="px-6 py-2.5 rounded-full border border-outline font-label-md font-bold hover:bg-surface-variant transition-all"
                                        onClick={() => setIsManageShiftsOpen(false)}
                                    >
                                        Cancel
                                    </button>
                                    <button 
                                        className="flex items-center gap-2 bg-[#0F172A] text-white px-8 py-2.5 rounded-full font-label-md font-bold hover:bg-[#1E293B] transition-all shadow-xl shadow-primary/10 disabled:opacity-70"
                                        onClick={handleSaveSchedule}
                                        disabled={isSavingSchedule}
                                    >
                                        {isSavingSchedule ? (
                                            <>
                                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                                Saving...
                                            </>
                                        ) : (
                                            <>
                                                <span className="material-symbols-outlined text-sm">save</span>
                                                Save Schedule
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>

                            <div className="flex gap-6 flex-1 h-[70vh]">
                                {/* Sidebar Templates */}
                                <div className="w-72 bg-surface border border-outline-variant rounded-3xl p-6 shadow-sm overflow-y-auto">
                                    <h3 className="text-sm font-bold text-on-surface uppercase tracking-wider mb-6 border-l-4 border-secondary pl-3">Shift Templates</h3>
                                    <div className="space-y-4">
                                        {shiftTemplates.map(template => (
                                            <div 
                                                key={template.id}
                                                draggable
                                                onDragStart={(e) => handleDragStart(e, template)}
                                                className={`p-4 rounded-xl border-2 border-dashed cursor-grab active:cursor-grabbing hover:shadow-md transition-shadow flex items-center gap-3 ${template.color}`}
                                            >
                                                <span className="material-symbols-outlined opacity-50">drag_indicator</span>
                                                <span className="font-bold text-sm">{template.name}</span>
                                            </div>
                                        ))}
                                    </div>
                                    
                                    <div className="mt-8 p-4 bg-yellow-50 text-yellow-800 rounded-xl border border-yellow-200">
                                        <div className="flex gap-2 items-start">
                                            <span className="material-symbols-outlined text-sm mt-0.5">info</span>
                                            <p className="text-xs font-medium">To assign a shift, drag a template and drop it onto an empty cell in the grid.</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Matrix Grid */}
                                <div className="flex-1 bg-surface border border-outline-variant rounded-3xl shadow-sm overflow-hidden flex flex-col">
                                    <div className="grid grid-cols-6 border-b border-outline-variant bg-surface-container-lowest">
                                        <div className="p-4 border-r border-outline-variant font-bold text-on-surface-variant text-sm flex items-center justify-center bg-surface-container-lowest">
                                            Providers
                                        </div>
                                        {days.map(day => (
                                            <div key={day} className="p-4 border-r border-outline-variant last:border-r-0 font-bold text-primary text-center">
                                                {day}
                                            </div>
                                        ))}
                                    </div>
                                    <div className="flex-1 overflow-y-auto">
                                        {providers.map(provider => (
                                            <div key={provider.id} className="grid grid-cols-6 border-b border-outline-variant last:border-b-0 hover:bg-slate-50/50 transition-colors">
                                                <div className="p-4 border-r border-outline-variant flex items-center gap-3 bg-surface-container-lowest">
                                                    <img src={provider.imageAvatar} alt={provider.name} className="w-8 h-8 rounded-full object-cover" />
                                                    <div>
                                                        <p className="font-bold text-sm text-primary leading-tight">{provider.name}</p>
                                                        <p className="text-[10px] text-on-surface-variant">{provider.role}</p>
                                                    </div>
                                                </div>
                                                {days.map(day => {
                                                    const key = `${provider.id}-${day}`;
                                                    const assignedShift = shifts[key];
                                                    
                                                    return (
                                                        <div 
                                                            key={day}
                                                            onDragOver={handleDragOver}
                                                            onDrop={(e) => handleDrop(e, provider.id, day, provider.name)}
                                                            className="p-2 border-r border-outline-variant last:border-r-0 min-h-[80px] transition-colors hover:bg-secondary-container/5 relative group"
                                                        >
                                                            {assignedShift ? (
                                                                <div className={`p-2 rounded-lg border text-xs font-bold w-full h-full flex flex-col justify-center text-center ${assignedShift.color} shadow-sm relative`}>
                                                                    {assignedShift.name}
                                                                    <button 
                                                                        onClick={() => {
                                                                            const newShifts = {...shifts};
                                                                            delete newShifts[key];
                                                                            setShifts(newShifts);
                                                                        }}
                                                                        className="absolute -top-2 -right-2 w-5 h-5 bg-white border border-outline-variant rounded-full text-error flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-error hover:text-white"
                                                                    >
                                                                        <span className="material-symbols-outlined text-[12px]">close</span>
                                                                    </button>
                                                                </div>
                                                            ) : (
                                                                <div className="w-full h-full border-2 border-transparent border-dashed rounded-lg group-hover:border-outline-variant flex items-center justify-center text-outline-variant">
                                                                    <span className="material-symbols-outlined opacity-0 group-hover:opacity-50">add</span>
                                                                </div>
                                                            )}
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </main>

                {/* MODALS & DRAWERS */}

                {/* 2. Provision New Provider Drawer */}
                {isDrawerOpen && (
                    <div className="fixed inset-0 z-50 flex justify-end">
                        <div 
                            className="absolute inset-0 bg-black/40 backdrop-blur-[2px] transition-opacity"
                            onClick={() => !isProvisioning && setIsDrawerOpen(false)}
                        ></div>
                        <div className="relative w-full max-w-md bg-surface h-full shadow-2xl flex flex-col animate-slide-in-right">
                            {/* Drawer Header */}
                            <div className="p-6 border-b border-outline-variant flex justify-between items-center bg-surface-container-lowest">
                                <div>
                                    <h3 className="font-headline-md text-headline-md font-bold text-primary">Provision New Provider</h3>
                                    <p className="text-sm text-on-surface-variant mt-1">Step {drawerStep} of 2</p>
                                </div>
                                <button 
                                    onClick={() => !isProvisioning && setIsDrawerOpen(false)} 
                                    className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-surface-variant text-on-surface-variant transition-colors disabled:opacity-50"
                                    disabled={isProvisioning}
                                >
                                    <span className="material-symbols-outlined">close</span>
                                </button>
                            </div>

                            {/* Drawer Content */}
                            <div className="flex-1 overflow-y-auto p-6">
                                {drawerStep === 1 && (
                                    <div className="space-y-6 animate-fade-in">
                                        <div>
                                            <h4 className="text-sm font-bold text-on-surface uppercase tracking-wider mb-4 border-l-4 border-primary pl-3">Identity Details</h4>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2">Full Name</label>
                                            <input required type="text" value={drawerForm.name} onChange={e => setDrawerForm({...drawerForm, name: e.target.value})} className="w-full bg-surface-container border border-outline-variant p-3 rounded-xl focus:ring-2 focus:ring-secondary-container outline-none transition-shadow" placeholder="e.g. Dr. John Doe" />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2">Email Address</label>
                                            <input required type="email" value={drawerForm.email} onChange={e => setDrawerForm({...drawerForm, email: e.target.value})} className="w-full bg-surface-container border border-outline-variant p-3 rounded-xl focus:ring-2 focus:ring-secondary-container outline-none transition-shadow" placeholder="dr.doe@clinic.com" />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2">Specialization & Department</label>
                                            <select 
                                                required 
                                                value={drawerForm.specialization} 
                                                onChange={e => setDrawerForm({...drawerForm, specialization: e.target.value})} 
                                                className="w-full bg-surface-container border border-outline-variant p-3 rounded-xl focus:ring-2 focus:ring-secondary-container outline-none transition-shadow appearance-none cursor-pointer"
                                            >
                                                <option value="" disabled>Select a Department</option>
                                                {departments.map(dept => (
                                                    <option key={dept.id} value={dept.name}>{dept.name}</option>
                                                ))}
                                            </select>
                                        </div>

                                        <div>
                                            <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2">Clinic Address / Location <span className="text-error">*</span></label>
                                            <input type="text" value={drawerForm.address} readOnly className="w-full bg-surface-container-low border border-outline-variant p-3 rounded-xl cursor-not-allowed focus:outline-none text-on-surface-variant" placeholder="Fetched automatically from your clinic profile..." />
                                        </div>
                                    </div>
                                )}
                                
                                {drawerStep === 2 && (
                                    <div className="space-y-6 animate-fade-in">
                                        <div>
                                            <h4 className="text-sm font-bold text-on-surface uppercase tracking-wider mb-4 border-l-4 border-secondary pl-3">RBAC Selection</h4>
                                            <p className="text-sm text-on-surface-variant mb-6">Select the appropriate Role-Based Access Control tier for this provider. This determines their permissions across OmniBook.</p>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2">Access Tier</label>
                                            <div className="space-y-3">
                                                <label className={`block border ${drawerForm.tier === 'TIER 1' ? 'border-primary bg-primary/5' : 'border-outline-variant hover:bg-surface-variant'} rounded-xl p-4 cursor-pointer transition-colors`}>
                                                    <div className="flex items-center gap-3">
                                                        <input type="radio" name="tier" value="TIER 1" checked={drawerForm.tier === 'TIER 1'} onChange={e => setDrawerForm({...drawerForm, tier: e.target.value})} className="w-4 h-4 text-primary" />
                                                        <div>
                                                            <div className="font-bold text-primary">TIER 1 (Full Clinical)</div>
                                                            <div className="text-xs text-on-surface-variant mt-1">Full access to patient records, billing, and scheduling.</div>
                                                        </div>
                                                    </div>
                                                </label>
                                                <label className={`block border ${drawerForm.tier === 'TIER 2' ? 'border-primary bg-primary/5' : 'border-outline-variant hover:bg-surface-variant'} rounded-xl p-4 cursor-pointer transition-colors`}>
                                                    <div className="flex items-center gap-3">
                                                        <input type="radio" name="tier" value="TIER 2" checked={drawerForm.tier === 'TIER 2'} onChange={e => setDrawerForm({...drawerForm, tier: e.target.value})} className="w-4 h-4 text-primary" />
                                                        <div>
                                                            <div className="font-bold text-primary">TIER 2 (Consultant)</div>
                                                            <div className="text-xs text-on-surface-variant mt-1">Read access to records, edit access to assigned appointments.</div>
                                                        </div>
                                                    </div>
                                                </label>
                                                <label className={`block border ${drawerForm.tier === 'TIER 3' ? 'border-primary bg-primary/5' : 'border-outline-variant hover:bg-surface-variant'} rounded-xl p-4 cursor-pointer transition-colors`}>
                                                    <div className="flex items-center gap-3">
                                                        <input type="radio" name="tier" value="TIER 3" checked={drawerForm.tier === 'TIER 3'} onChange={e => setDrawerForm({...drawerForm, tier: e.target.value})} className="w-4 h-4 text-primary" />
                                                        <div>
                                                            <div className="font-bold text-primary">TIER 3 (Read-Only)</div>
                                                            <div className="text-xs text-on-surface-variant mt-1">Can only view schedules and basic patient demographics.</div>
                                                        </div>
                                                    </div>
                                                </label>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Drawer Footer */}
                            <div className="p-6 border-t border-outline-variant bg-surface-container-lowest">
                                <div className="flex justify-between items-center">
                                    {drawerStep === 2 ? (
                                        <button 
                                            type="button" 
                                            onClick={() => setDrawerStep(1)} 
                                            className="px-6 py-2.5 rounded-full border border-outline font-label-md font-bold hover:bg-surface-variant text-on-surface"
                                            disabled={isProvisioning}
                                        >
                                            Back
                                        </button>
                                    ) : (
                                        <button 
                                            type="button" 
                                            onClick={() => setIsDrawerOpen(false)} 
                                            className="px-6 py-2.5 rounded-full border border-outline font-label-md font-bold hover:bg-surface-variant text-on-surface"
                                        >
                                            Cancel
                                        </button>
                                    )}
                                    
                                    {drawerStep === 1 ? (
                                        <button 
                                            type="button" 
                                            onClick={handleNextStep} 
                                            className="px-6 py-2.5 rounded-full bg-primary text-white font-label-md font-bold shadow-lg shadow-primary/20 hover:bg-[#1E293B]"
                                        >
                                            Next Step
                                        </button>
                                    ) : (
                                        <button 
                                            type="button" 
                                            onClick={handleDrawerSubmit} 
                                            disabled={isProvisioning || !drawerForm.tier}
                                            className="px-8 py-2.5 rounded-full bg-secondary-container text-white font-label-md font-bold shadow-lg shadow-secondary-container/30 hover:bg-secondary flex items-center gap-2 disabled:opacity-70"
                                        >
                                            {isProvisioning ? (
                                                <>
                                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                                    Sending...
                                                </>
                                            ) : (
                                                <>
                                                    Send Invite
                                                    <span className="material-symbols-outlined text-sm">send</span>
                                                </>
                                            )}
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* 3. Edit Schedule Modal */}
                {editScheduleProviderId && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                        <div className="bg-surface p-8 rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col">
                            <div className="flex justify-between items-center mb-6 shrink-0">
                                <div>
                                    <h3 className="font-headline-md text-headline-md font-bold text-primary">Edit Schedule</h3>
                                    <p className="text-on-surface-variant text-sm mt-1">Configure micro-level availability & overrides.</p>
                                </div>
                                <button onClick={() => setEditScheduleProviderId(null)} className="text-on-surface-variant hover:text-error transition-colors w-10 h-10 flex items-center justify-center rounded-full hover:bg-error/10">
                                    <span className="material-symbols-outlined">close</span>
                                </button>
                            </div>
                            
                            {/* Tabs */}
                            <div className="flex border-b border-outline-variant mb-6 shrink-0">
                                <button 
                                    className={`px-6 py-3 font-bold text-sm border-b-2 transition-colors ${editScheduleTab === 'standard' ? 'border-primary text-primary' : 'border-transparent text-on-surface-variant hover:bg-surface-variant/50'}`}
                                    onClick={() => setEditScheduleTab('standard')}
                                >
                                    Standard Week
                                </button>
                                <button 
                                    className={`px-6 py-3 font-bold text-sm border-b-2 transition-colors ${editScheduleTab === 'overrides' ? 'border-primary text-primary' : 'border-transparent text-on-surface-variant hover:bg-surface-variant/50'}`}
                                    onClick={() => setEditScheduleTab('overrides')}
                                >
                                    Date Overrides
                                </button>
                            </div>

                            <form onSubmit={handleEditSchedule} className="flex-1 flex flex-col min-h-0 overflow-hidden">
                                <div className="flex-1 overflow-y-auto pr-2 mb-6 space-y-6">
                                    {editScheduleTab === 'standard' ? (
                                        <>
                                            {/* Interval */}
                                            <div className="bg-slate-50 p-4 rounded-xl border border-outline-variant flex justify-between items-center">
                                                <div>
                                                    <h4 className="font-bold text-sm text-primary">Appointment Interval</h4>
                                                    <p className="text-xs text-on-surface-variant">Duration of a single patient slot.</p>
                                                </div>
                                                <div className="flex items-center gap-4">
                                                    <div className="flex items-center bg-white border border-outline-variant rounded-lg px-3 py-1">
                                                        <input 
                                                            type="number" 
                                                            value={editScheduleForm.intervalMinutes} 
                                                            onChange={e => setEditScheduleForm({...editScheduleForm, intervalMinutes: Number(e.target.value)})}
                                                            className="w-16 text-center font-bold text-primary outline-none"
                                                            min="5" max="120"
                                                        />
                                                        <span className="text-xs font-bold text-on-surface-variant ml-1">MINS</span>
                                                    </div>
                                                    <div className="bg-green-100 text-green-800 px-3 py-1.5 rounded-lg text-xs font-bold border border-green-200">
                                                        Generates ~{calculateTotalSlots()} slots/day
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Week List */}
                                            <div className="space-y-3">
                                                {Object.entries(editScheduleForm.standardWeek).map(([day, config]) => (
                                                    <div key={day} className={`flex items-center gap-4 p-3 rounded-xl border transition-colors ${config.isActive ? 'border-primary/30 bg-primary/5' : 'border-outline-variant bg-surface-container-lowest'}`}>
                                                        <label className="flex items-center gap-3 w-32 cursor-pointer">
                                                            <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${config.isActive ? 'bg-primary border-primary' : 'border-outline-variant'}`}>
                                                                {config.isActive && <span className="material-symbols-outlined text-[14px] text-white">check</span>}
                                                            </div>
                                                            <input 
                                                                type="checkbox" 
                                                                className="hidden" 
                                                                checked={config.isActive} 
                                                                onChange={(e) => {
                                                                    const newForm = {...editScheduleForm};
                                                                    newForm.standardWeek[day].isActive = e.target.checked;
                                                                    setEditScheduleForm(newForm);
                                                                }}
                                                            />
                                                            <span className={`font-bold text-sm ${config.isActive ? 'text-primary' : 'text-on-surface-variant'}`}>{day}</span>
                                                        </label>
                                                        
                                                        <div className="flex items-center gap-2 flex-1">
                                                            <input 
                                                                type="time" 
                                                                value={config.start} 
                                                                disabled={!config.isActive}
                                                                onChange={(e) => {
                                                                    const newForm = {...editScheduleForm};
                                                                    newForm.standardWeek[day].start = e.target.value;
                                                                    setEditScheduleForm(newForm);
                                                                }}
                                                                className={`px-3 py-1.5 rounded-lg border text-sm font-bold ${config.isActive ? 'border-outline text-primary bg-white focus:ring-2 focus:ring-secondary-container outline-none' : 'border-outline-variant text-on-surface-variant opacity-50 bg-surface-container-lowest'}`}
                                                            />
                                                            <span className="text-on-surface-variant font-bold text-xs">TO</span>
                                                            <input 
                                                                type="time" 
                                                                value={config.end} 
                                                                disabled={!config.isActive}
                                                                onChange={(e) => {
                                                                    const newForm = {...editScheduleForm};
                                                                    newForm.standardWeek[day].end = e.target.value;
                                                                    setEditScheduleForm(newForm);
                                                                }}
                                                                className={`px-3 py-1.5 rounded-lg border text-sm font-bold ${config.isActive ? 'border-outline text-primary bg-white focus:ring-2 focus:ring-secondary-container outline-none' : 'border-outline-variant text-on-surface-variant opacity-50 bg-surface-container-lowest'}`}
                                                            />
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </>
                                    ) : (
                                        <div className="space-y-6">
                                            {/* Overrides */}
                                            <div className="bg-orange-50 text-orange-800 p-4 rounded-xl border border-orange-200 flex items-start gap-3">
                                                <span className="material-symbols-outlined text-orange-500">info</span>
                                                <p className="text-sm font-medium">Use overrides to block out specific dates (e.g., vacations, sick leave, conferences). These dates will be completely unavailable for bookings.</p>
                                            </div>

                                            <div>
                                                <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2">Add Blocked Date</label>
                                                <div className="flex gap-3">
                                                    <input 
                                                        type="date" 
                                                        value={overrideDateInput}
                                                        onChange={e => setOverrideDateInput(e.target.value)}
                                                        className="flex-1 bg-surface-container border border-outline-variant p-3 rounded-xl focus:ring-2 focus:ring-secondary-container outline-none font-bold text-primary"
                                                    />
                                                    <button 
                                                        type="button"
                                                        onClick={() => {
                                                            if (overrideDateInput && !editScheduleForm.overrides.includes(overrideDateInput)) {
                                                                setEditScheduleForm({...editScheduleForm, overrides: [...editScheduleForm.overrides, overrideDateInput].sort()});
                                                                setOverrideDateInput('');
                                                            }
                                                        }}
                                                        className="px-6 py-3 bg-secondary-container text-white font-bold rounded-xl hover:bg-secondary transition-colors"
                                                    >
                                                        Block Date
                                                    </button>
                                                </div>
                                            </div>

                                            <div>
                                                <h4 className="text-sm font-bold text-on-surface uppercase tracking-wider mb-4 border-l-4 border-error pl-3">Active Overrides</h4>
                                                {editScheduleForm.overrides.length === 0 ? (
                                                    <div className="p-8 border-2 border-dashed border-outline-variant rounded-2xl flex flex-col items-center justify-center text-center">
                                                        <span className="material-symbols-outlined text-4xl text-outline mb-2">event_available</span>
                                                        <p className="font-bold text-on-surface-variant">No date overrides configured.</p>
                                                    </div>
                                                ) : (
                                                    <div className="grid grid-cols-2 gap-3">
                                                        {editScheduleForm.overrides.map(date => (
                                                            <div key={date} className="flex justify-between items-center p-3 border border-outline-variant rounded-xl bg-surface-container-lowest">
                                                                <div className="flex items-center gap-2">
                                                                    <span className="material-symbols-outlined text-error text-[18px]">event_busy</span>
                                                                    <span className="font-bold text-sm text-primary">{new Date(date).toLocaleDateString(undefined, { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}</span>
                                                                </div>
                                                                <button 
                                                                    type="button"
                                                                    onClick={() => {
                                                                        setEditScheduleForm({...editScheduleForm, overrides: editScheduleForm.overrides.filter(d => d !== date)});
                                                                    }}
                                                                    className="w-7 h-7 rounded-full bg-error/10 text-error flex items-center justify-center hover:bg-error hover:text-white transition-colors"
                                                                >
                                                                    <span className="material-symbols-outlined text-[14px]">close</span>
                                                                </button>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div className="flex justify-end gap-3 pt-4 border-t border-outline-variant shrink-0 mt-auto">
                                    <button type="button" onClick={() => setEditScheduleProviderId(null)} className="px-6 py-2 rounded-full border border-outline font-label-md font-bold hover:bg-surface-variant text-on-surface">Cancel</button>
                                    <button type="submit" disabled={isSavingEdit} className="px-6 py-2 flex items-center gap-2 rounded-full bg-secondary-container text-white font-label-md font-bold hover:bg-secondary shadow-lg shadow-secondary-container/30 disabled:opacity-70">
                                        {isSavingEdit ? (
                                            <>
                                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                                Saving...
                                            </>
                                        ) : (
                                            <>Save Configuration</>
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* 4. Revoke Access Modal */}
                {revokeProviderId && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                        <div className="bg-surface p-8 rounded-3xl shadow-2xl max-w-md w-full border-2 border-error text-center flex flex-col">
                            <div className="w-16 h-16 bg-error/10 text-error rounded-full flex items-center justify-center mx-auto mb-4 border border-error/20 shadow-[0_0_15px_rgba(220,38,38,0.3)]">
                                <span className="material-symbols-outlined text-[32px]">warning</span>
                            </div>
                            <h3 className="font-headline-md text-headline-md font-black text-error mb-2">Danger Zone: Revoke Access</h3>
                            <p className="text-on-surface-variant text-sm mb-6">
                                This will instantly terminate all active sessions, invalidate their JWT, and remove them from the active schedule. 
                                <br/><br/>
                                To proceed, please type <strong className="text-on-surface select-none">{providers.find(p => p.id === revokeProviderId)?.name}</strong> below:
                            </p>
                            
                            <input 
                                type="text"
                                value={revokeConfirmName}
                                onChange={(e) => setRevokeConfirmName(e.target.value)}
                                placeholder="Type the doctor's name to confirm"
                                className="w-full bg-surface-container border border-error/30 p-3 rounded-xl focus:ring-2 focus:ring-error focus:border-error outline-none font-bold text-center mb-6 text-on-surface"
                            />
                            
                            <div className="flex justify-center gap-3">
                                <button 
                                    onClick={() => {
                                        setRevokeProviderId(null);
                                        setRevokeConfirmName('');
                                    }} 
                                    className="px-6 py-2.5 rounded-full border border-outline font-label-md font-bold hover:bg-surface-variant flex-1 text-on-surface"
                                >
                                    Cancel
                                </button>
                                <button 
                                    onClick={handleRevokeAccess} 
                                    disabled={revokeConfirmName !== providers.find(p => p.id === revokeProviderId)?.name || isRevoking}
                                    className="px-6 py-2.5 rounded-full bg-error text-white font-label-md font-bold hover:bg-red-700 shadow-lg shadow-error/20 flex-1 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex justify-center items-center gap-2"
                                >
                                    {isRevoking ? (
                                        <>
                                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                            Revoking...
                                        </>
                                    ) : (
                                        'Confirm Revocation'
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Toast Notification */}
                {toastMsg && (
                    <div className="fixed bottom-6 right-6 z-50 bg-green-500 text-white px-6 py-3 rounded-2xl shadow-lg shadow-green-500/30 flex items-center gap-3 animate-slide-in-right">
                        <span className="material-symbols-outlined">check_circle</span>
                        <span className="font-bold">{toastMsg}</span>
                    </div>
                )}
            </div>
        </div>
    );
}
