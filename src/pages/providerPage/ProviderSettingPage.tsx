import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import axios from 'axios';
import ProviderTopNavigation from './components/ProviderTopNavigation';
import ClinicScheduleMatrix from '../adminPage/components/ClinicScheduleMatrix';

export default function ProviderSettingPage() {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState<'profile' | 'schedule' | 'security'>('profile');
    const [profileData, setProfileData] = useState<any>(null);
    const [scheduleData, setScheduleData] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    // Toast state
    const [toastMessage, setToastMessage] = useState<string | null>(null);
    const [toastType, setToastType] = useState<'success' | 'error'>('success');

    const showToast = (message: string, type: 'success' | 'error' = 'success') => {
        setToastMessage(message);
        setToastType(type);
        setTimeout(() => setToastMessage(null), 3000);
    };

    // Profile States
    const [fullName, setFullName] = useState('');
    const [phone, setPhone] = useState('');
    const [specialization, setSpecialization] = useState('');
    const [licenseNumber, setLicenseNumber] = useState('');
    const [isScheduleDelegated, setIsScheduleDelegated] = useState(true);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    const handleLogout = (e: React.MouseEvent) => {
        e.preventDefault();
        localStorage.removeItem('token');
        localStorage.removeItem('role');
        navigate('/login');
    };

    useEffect(() => {
        const role = localStorage.getItem('role');
        if (role !== 'service_provider') {
            navigate('/login');
        } else {
            fetchProfileData();
            fetchScheduleData();
        }
    }, [navigate]);

    const fetchProfileData = async () => {
        setIsLoading(true);
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get('http://localhost:8080/api/v1/provider/settings/profile', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            setProfileData(response.data);
            setFullName(response.data.fullName || '');
            setPhone(response.data.phone || '');
            setSpecialization(response.data.specialization || '');
            setLicenseNumber(response.data.licenseNumber || '');
            setIsScheduleDelegated(response.data.isScheduleDelegated !== false);
            if (response.data.profilePictureUrl) {
                setPreviewUrl(response.data.profilePictureUrl);
            }
        } catch (error) {
            console.error("Failed to fetch profile data", error);
        } finally {
            setIsLoading(false);
        }
    };

    const fetchScheduleData = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get('http://localhost:8080/api/v1/provider/schedule/me', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            setScheduleData(response.data);
        } catch (error) {
            console.error("Failed to fetch schedule data", error);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setSelectedFile(file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const handleUpdateProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            const token = localStorage.getItem('token');
            const payload = {
                fullName,
                phone,
                specialization,
                licenseNumber,
                isScheduleDelegated
            };

            await axios.put('http://localhost:8080/api/v1/provider/settings/profile', payload, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (selectedFile) {
                const formData = new FormData();
                formData.append('file', selectedFile);
                await axios.post('http://localhost:8080/api/v1/provider/settings/profile/picture', formData, {
                    headers: { 
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'multipart/form-data'
                    }
                });
            }
            
            showToast("Profile updated successfully!", "success");
        } catch (error: any) {
            showToast(error.response?.data?.message || "Failed to update profile", "error");
        } finally {
            setIsSaving(false);
        }
    };

    const handleUpdateSchedule = async (schedules: any[]) => {
        setIsSaving(true);
        try {
            const token = localStorage.getItem('token');
            const payload = { schedules };

            const response = await axios.put('http://localhost:8080/api/v1/provider/schedule/me', payload, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            
            setScheduleData(response.data);
            showToast("Schedule updated successfully!", "success");
        } catch (error: any) {
            showToast(error.response?.data?.message || "Failed to update schedule", "error");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="superadmin-theme">
            {toastMessage && (
                <div className={`fixed top-24 right-8 z-50 px-6 py-3 rounded-lg shadow-lg font-medium text-white transition-all transform ${toastType === 'success' ? 'bg-green-600' : 'bg-red-600'}`}>
                    <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined">{toastType === 'success' ? 'check_circle' : 'error'}</span>
                        {toastMessage}
                    </div>
                </div>
            )}
            <div className="bg-background font-body-md text-on-surface antialiased min-h-screen relative">
                
                {/* Sidebar */}
                <nav className="fixed left-0 top-20 h-[calc(100vh-80px)] w-64 bg-[#f0f3ff] border-r border-[#c3c5d7]/30 py-6 px-4 flex flex-col gap-2 z-40 hidden md:flex">
                    <div className="mb-4 px-4">
                    <div className="flex items-center gap-4">
                        <span className="material-symbols-outlined text-[#003fb1]" style={{ fontVariationSettings: "'FILL' 1" }}>
                        dashboard
                        </span>
                        <span className="text-[24px] text-[#003fb1] font-bold">Portal</span>
                    </div>
                    </div>
                    <NavLink to="/provider-dashboard" className={({ isActive }) => `flex items-center gap-2 px-3 py-2.5 text-[13px] font-medium rounded-lg transition-all ${isActive ? 'text-[#003fb1] bg-[#1a56db]/10' : 'text-[#3b4854] hover:bg-[#d6e4f3]'}`}>
                    <span className="material-symbols-outlined text-[18px]">dashboard</span>
                    Dashboard
                    </NavLink>
                    <NavLink to="/master-calendar" className={({ isActive }) => `flex items-center gap-2 px-3 py-2.5 text-[13px] font-medium rounded-lg transition-all ${isActive ? 'text-[#003fb1] bg-[#1a56db]/10' : 'text-[#3b4854] hover:bg-[#d6e4f3]'}`}>
                    <span className="material-symbols-outlined text-[18px]">calendar_month</span>
                    Master Calendar
                    </NavLink>
                    <NavLink to="/patients" className={({ isActive }) => `flex items-center gap-2 px-3 py-2.5 text-[13px] font-medium rounded-lg transition-all ${isActive ? 'text-[#003fb1] bg-[#1a56db]/10' : 'text-[#3b4854] hover:bg-[#d6e4f3]'}`}>
                    <span className="material-symbols-outlined text-[18px]">group</span>
                    Patients/Clients
                    </NavLink>
                    <NavLink to="/services" className={({ isActive }) => `flex items-center gap-2 px-3 py-2.5 text-[13px] font-medium rounded-lg transition-all ${isActive ? 'text-[#003fb1] bg-[#1a56db]/10' : 'text-[#3b4854] hover:bg-[#d6e4f3]'}`}>
                    <span className="material-symbols-outlined text-[18px]">medical_services</span>
                    Services Manager
                    </NavLink>
                    <NavLink to="/analytics" className={({ isActive }) => `flex items-center gap-2 px-3 py-2.5 text-[13px] font-medium rounded-lg transition-all ${isActive ? 'text-[#003fb1] bg-[#1a56db]/10' : 'text-[#3b4854] hover:bg-[#d6e4f3]'}`}>
                    <span className="material-symbols-outlined text-[18px]">bar_chart</span>
                    Revenue & Analytics
                    </NavLink>
            
                    <div className="mt-auto flex flex-col gap-1">
                    <NavLink to="/provider/settings" className={({ isActive }) => `flex items-center gap-2 px-3 py-2.5 text-[13px] font-medium rounded-lg transition-all ${isActive ? 'text-[#003fb1] bg-[#1a56db]/10' : 'text-[#3b4854] hover:bg-[#d6e4f3]'}`}>
                        <span className="material-symbols-outlined text-[18px]">settings</span>
                        Settings
                    </NavLink>
                    <button onClick={handleLogout} className="flex items-center gap-2 px-3 py-2.5 text-[13px] font-medium rounded-lg transition-all text-[#ba1a1a] hover:bg-[#ffdad6]/20 text-left">
                        <span className="material-symbols-outlined text-[18px]">logout</span>
                        Log Out
                    </button>
                    </div>
                </nav>

                <ProviderTopNavigation />
                
                <main className="ml-64 pt-24 flex flex-col h-screen overflow-hidden">
                    {/* Page Header & Actions */}
                    <section className="px-8 pb-4 flex justify-between items-end bg-background">
                        <div>
                            <div className="flex items-center gap-2 text-on-surface-variant mb-2">
                                <span className="font-label-md text-label-md uppercase tracking-widest cursor-pointer hover:text-primary transition-colors" onClick={() => navigate('/provider-dashboard')}>Settings</span>
                                <span className="material-symbols-outlined text-sm">chevron_right</span>
                                <span className="font-label-md text-label-md uppercase tracking-widest text-secondary font-bold">
                                    {activeTab === 'profile' ? 'Profile Settings' : activeTab === 'schedule' ? 'My Schedule' : 'Security'}
                                </span>
                            </div>
                            <h2 className="font-headline-lg text-headline-lg text-primary tracking-tight">
                                {activeTab === 'profile' ? 'Profile & Contact Info' : activeTab === 'schedule' ? 'Schedule Matrix & Delegation' : 'Security Settings'}
                            </h2>
                            <p className="text-on-surface-variant mt-1">
                                {activeTab === 'profile' 
                                    ? 'Manage your professional details and contact information.' 
                                    : activeTab === 'schedule'
                                    ? 'Configure your working hours and delegate schedule management.'
                                    : 'Manage your password and security settings.'
                                }
                            </p>
                        </div>
                        <button 
                            onClick={(e) => {
                                if (activeTab === 'profile') handleUpdateProfile(e);
                                else if (activeTab === 'schedule') handleUpdateSchedule(scheduleData?.schedules || []);
                            }}
                            disabled={isSaving}
                            className="bg-primary hover:bg-primary/90 text-on-primary px-6 py-2.5 rounded font-label-md text-label-md flex items-center gap-2 shadow-sm transition-all active:scale-95 disabled:opacity-50"
                        >
                            <span className="material-symbols-outlined text-[18px]">save</span>
                            {isSaving ? 'Saving...' : 'Save Settings'}
                        </button>
                    </section>

                    {/* Dual Column Workspace */}
                    <div className="flex-1 px-8 pb-8 flex gap-8 overflow-hidden">
                        {/* Left Inner Menu (25%) */}
                        <aside className="w-72 flex-shrink-0">
                            <div className="bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden shadow-sm">
                                <div className="p-4 border-b border-outline-variant bg-surface-container-low">
                                    <h3 className="font-label-md text-label-md font-black uppercase text-on-surface-variant">Configuration Layers</h3>
                                </div>
                                <nav className="flex flex-col">
                                    <button 
                                        onClick={() => setActiveTab('profile')}
                                        className={`flex items-center justify-between px-5 py-4 transition-colors font-body-md text-body-md ${activeTab === 'profile' ? 'bg-secondary-container/10 border-r-4 border-secondary text-secondary font-bold' : 'hover:bg-surface-container-low text-on-surface-variant'}`}
                                    >
                                        <span className="flex items-center gap-3">
                                            <span className="material-symbols-outlined" style={{fontVariationSettings: activeTab === 'profile' ? "'FILL' 1" : ""}}>domain</span>
                                            General Profile
                                        </span>
                                    </button>
                                    <button 
                                        onClick={() => setActiveTab('schedule')}
                                        className={`flex items-center justify-between px-5 py-4 transition-colors font-body-md text-body-md ${activeTab === 'schedule' ? 'bg-secondary-container/10 border-r-4 border-secondary text-secondary font-bold' : 'hover:bg-surface-container-low text-on-surface-variant'}`}
                                    >
                                        <span className="flex items-center gap-3">
                                            <span className="material-symbols-outlined" style={{fontVariationSettings: activeTab === 'schedule' ? "'FILL' 1" : ""}}>schedule</span>
                                            Schedule & Delegation
                                        </span>
                                    </button>
                                    <button 
                                        onClick={() => setActiveTab('security')}
                                        className={`flex items-center justify-between px-5 py-4 transition-colors font-body-md text-body-md ${activeTab === 'security' ? 'bg-secondary-container/10 border-r-4 border-secondary text-secondary font-bold' : 'hover:bg-surface-container-low text-on-surface-variant'}`}
                                    >
                                        <span className="flex items-center gap-3">
                                            <span className="material-symbols-outlined" style={{fontVariationSettings: activeTab === 'security' ? "'FILL' 1" : ""}}>security</span>
                                            Security
                                        </span>
                                    </button>
                                </nav>
                            </div>
                        </aside>

                        {/* Right Inner Form (75%) */}
                        <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                            <div className="bg-surface-container-lowest border border-outline-variant rounded-xl shadow-sm overflow-hidden">
                                
                                {/* Profile Settings Tab */}
                                {activeTab === 'profile' && (
                                    <div className="p-8">
                                        <h3 className="font-title-lg text-primary mb-6">Personal Details</h3>
                                        {isLoading ? (
                                            <div className="animate-pulse space-y-4">
                                                <div className="h-12 bg-outline-variant/30 rounded-xl w-full"></div>
                                                <div className="h-12 bg-outline-variant/30 rounded-xl w-full"></div>
                                            </div>
                                        ) : (
                                            <form onSubmit={handleUpdateProfile} className="space-y-6 max-w-2xl">
                                                
                                                <div className="flex items-center gap-6 mb-8">
                                                    <div className="relative">
                                                        <div className="w-24 h-24 rounded-full border-4 border-surface-variant overflow-hidden bg-surface-container-low flex items-center justify-center shadow-sm">
                                                            {previewUrl ? (
                                                                <img src={previewUrl} alt="Profile" className="w-full h-full object-cover" />
                                                            ) : (
                                                                <span className="material-symbols-outlined text-4xl text-on-surface-variant/50">person</span>
                                                            )}
                                                        </div>
                                                        <label className="absolute bottom-0 right-0 w-8 h-8 bg-primary text-on-primary rounded-full flex items-center justify-center cursor-pointer shadow-md hover:bg-primary/90 transition-colors">
                                                            <span className="material-symbols-outlined text-[16px]">edit</span>
                                                            <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
                                                        </label>
                                                    </div>
                                                    <div>
                                                        <h4 className="font-label-lg text-on-surface">Profile Picture</h4>
                                                        <p className="text-sm text-on-surface-variant mt-1">Upload a professional headshot.</p>
                                                        <p className="text-xs text-on-surface-variant/70 mt-1">Recommended size: 400x400px</p>
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-2 gap-6">
                                                    <div>
                                                        <label className="block text-sm font-medium text-on-surface-variant mb-2">Full Name</label>
                                                        <input 
                                                            type="text" 
                                                            value={fullName}
                                                            onChange={(e) => setFullName(e.target.value)}
                                                            className="w-full bg-surface-variant border border-outline-variant rounded-xl px-4 py-3 text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-sm font-medium text-on-surface-variant mb-2">Email Address</label>
                                                        <input 
                                                            type="email" 
                                                            value={profileData?.email || ''}
                                                            disabled
                                                            className="w-full bg-surface-variant/50 border border-outline-variant rounded-xl px-4 py-3 text-on-surface-variant opacity-70 cursor-not-allowed"
                                                        />
                                                    </div>
                                                </div>
                                                
                                                <div className="grid grid-cols-2 gap-6">
                                                    <div>
                                                        <label className="block text-sm font-medium text-on-surface-variant mb-2">Phone Number</label>
                                                        <input 
                                                            type="tel" 
                                                            value={phone}
                                                            onChange={(e) => setPhone(e.target.value)}
                                                            className="w-full bg-surface-variant border border-outline-variant rounded-xl px-4 py-3 text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                                                        />
                                                    </div>
                                                </div>
                                                
                                                <div className="border-t border-outline-variant my-8 pt-8">
                                                    <h3 className="font-title-lg text-primary mb-6">Professional Credentials</h3>
                                                    <div className="grid grid-cols-2 gap-6">
                                                        <div>
                                                            <label className="block text-sm font-medium text-on-surface-variant mb-2">Specialization</label>
                                                            <input 
                                                                type="text" 
                                                                value={specialization}
                                                                onChange={(e) => setSpecialization(e.target.value)}
                                                                placeholder="e.g. General Practice, Dentistry"
                                                                className="w-full bg-surface-variant border border-outline-variant rounded-xl px-4 py-3 text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                                                            />
                                                        </div>
                                                        <div>
                                                            <label className="block text-sm font-medium text-on-surface-variant mb-2">License Number</label>
                                                            <input 
                                                                type="text" 
                                                                value={licenseNumber}
                                                                disabled
                                                                placeholder="e.g. MED-123456"
                                                                className="w-full bg-surface-variant/50 border border-outline-variant rounded-xl px-4 py-3 text-on-surface-variant opacity-70 cursor-not-allowed"
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                                
                                                
                                            </form>
                                        )}
                                    </div>
                                )}

                                {/* Schedule Settings Tab */}
                                {activeTab === 'schedule' && (
                                    <div className="p-8">
                                        <div className="flex items-start gap-4 p-4 bg-primary-container/30 rounded-2xl border border-primary/20 mb-8">
                                            <span className="material-symbols-outlined text-primary mt-1">shield_person</span>
                                            <div className="flex-1">
                                                <h4 className="font-title-md text-on-surface mb-1">Delegate Schedule Management</h4>
                                                <p className="text-on-surface-variant text-sm leading-relaxed">
                                                    Allow Clinic Administrators to manage and override your schedule matrix. If disabled, only you can update your working hours, and administrators will be locked out of modifying your schedule.
                                                </p>
                                            </div>
                                            <div className="flex items-center">
                                                <label className="relative inline-flex items-center cursor-pointer">
                                                    <input 
                                                        type="checkbox" 
                                                        className="sr-only peer"
                                                        checked={isScheduleDelegated}
                                                        onChange={(e) => {
                                                            setIsScheduleDelegated(e.target.checked);
                                                            handleUpdateProfile({ preventDefault: () => {} } as any);
                                                        }}
                                                    />
                                                    <div className="w-14 h-7 bg-outline-variant peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-primary"></div>
                                                </label>
                                            </div>
                                        </div>
                                        
                                        <div className="flex justify-between items-center mb-6">
                                            <h3 className="font-title-lg text-primary">Your Weekly Matrix</h3>
                                            <div className="text-sm text-on-surface-variant flex items-center gap-2">
                                                <span className="material-symbols-outlined text-[18px]">info</span>
                                                Times are shown in 24-hour format
                                            </div>
                                        </div>
                                        
                                        {scheduleData ? (
                                            <ClinicScheduleMatrix 
                                                scheduleData={scheduleData} 
                                                onSave={handleUpdateSchedule} 
                                            />
                                        ) : (
                                            <div className="flex justify-center p-12">
                                                <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
                                            </div>
                                        )}
                                    </div>
                                )}
                                
                                {/* Security Settings Tab */}
                                {activeTab === 'security' && (
                                    <div className="p-8">
                                        <h3 className="font-title-lg text-primary mb-6">Change Password</h3>
                                        <form className="space-y-6 max-w-xl">
                                            <div>
                                                <label className="block text-sm font-medium text-on-surface-variant mb-2">Current Password</label>
                                                <input 
                                                    type="password" 
                                                    className="w-full bg-surface-variant border border-outline-variant rounded-xl px-4 py-3 text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-on-surface-variant mb-2">New Password</label>
                                                <input 
                                                    type="password" 
                                                    className="w-full bg-surface-variant border border-outline-variant rounded-xl px-4 py-3 text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-on-surface-variant mb-2">Confirm New Password</label>
                                                <input 
                                                    type="password" 
                                                    className="w-full bg-surface-variant border border-outline-variant rounded-xl px-4 py-3 text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                                                />
                                            </div>
                                            <div className="flex justify-end pt-2">
                                                <button 
                                                    type="button" 
                                                    className="bg-primary text-on-primary px-6 py-3 rounded-xl font-label-lg tracking-wide hover:bg-primary/90 transition-colors shadow-sm"
                                                    onClick={() => showToast("Password reset functionality to be implemented by AuthService", "error")}
                                                >
                                                    Update Password
                                                </button>
                                            </div>
                                        </form>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}
