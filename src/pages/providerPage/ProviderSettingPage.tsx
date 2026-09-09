import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import ProviderTopNavigation from './components/ProviderTopNavigation';
import ProviderSidebar from './components/ProviderSidebar';
import ClinicScheduleMatrix from '../adminPage/components/ClinicScheduleMatrix';
import { useOrganizationTerms } from '../../utils/organizationTerms';
import { applyTheme } from '../../utils/themeUtils';

export default function ProviderSettingPage() {
    const terms = useOrganizationTerms();
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
        setTimeout(() => setToastMessage(null), 3500);
    };

    // Profile States
    const [fullName, setFullName] = useState('');
    const [phone, setPhone] = useState('');
    const [specialization, setSpecialization] = useState('');
    const [licenseNumber, setLicenseNumber] = useState('');
    const [isScheduleDelegated, setIsScheduleDelegated] = useState(true);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    // Security / Password States
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

    // Theme & branding sync
    useEffect(() => {
        const cachedColor = localStorage.getItem('primaryAccentColor');
        if (cachedColor) {
            applyTheme(cachedColor);
        }
    }, []);

    useEffect(() => {
        const token = localStorage.getItem('token');
        const role = (localStorage.getItem('role') || '').toLowerCase();
        const isProvider = role === 'service_provider' || role === 'provider' || role === 'role_provider';
        if (!token || !isProvider) {
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
            if (response.data?.isScheduleDelegated !== undefined && response.data?.isScheduleDelegated !== null) {
                setIsScheduleDelegated(response.data.isScheduleDelegated);
            }
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

    const handleUpdateProfile = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
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

            const res = await axios.put('http://localhost:8080/api/v1/provider/settings/profile', payload, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (fullName) {
                localStorage.setItem('fullName', fullName);
            }

            if (selectedFile) {
                const formData = new FormData();
                formData.append('file', selectedFile);
                const picRes = await axios.post('http://localhost:8080/api/v1/provider/settings/profile/picture', formData, {
                    headers: { 
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'multipart/form-data'
                    }
                });
                if (picRes.data?.profilePictureUrl) {
                    setPreviewUrl(picRes.data.profilePictureUrl);
                }
            } else if (res.data?.profilePictureUrl) {
                setPreviewUrl(res.data.profilePictureUrl);
            }
            
            // Broadcast event so top navigation immediately updates
            window.dispatchEvent(new Event('userProfileUpdated'));
            showToast("Profile updated successfully!", "success");
        } catch (error: any) {
            showToast(error.response?.data?.message || "Failed to update profile", "error");
        } finally {
            setIsSaving(false);
        }
    };

    const handleToggleDelegation = async (delegated: boolean) => {
        setIsScheduleDelegated(delegated);
        try {
            const token = localStorage.getItem('token');
            await axios.put('http://localhost:8080/api/v1/provider/settings/profile', {
                isScheduleDelegated: delegated
            }, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            await axios.put('http://localhost:8080/api/v1/provider/schedule/me', {
                isScheduleDelegated: delegated
            }, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            showToast(`Schedule delegation ${delegated ? 'enabled' : 'disabled'} successfully!`, "success");
        } catch (error: any) {
            showToast("Failed to update delegation setting", "error");
            setIsScheduleDelegated(!delegated);
        }
    };

    const handleUpdatePassword = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        if (!currentPassword) {
            showToast("Please enter your current password", "error");
            return;
        }
        if (!newPassword) {
            showToast("Please enter a new password", "error");
            return;
        }
        if (newPassword.length < 6) {
            showToast("New password must be at least 6 characters long", "error");
            return;
        }
        if (newPassword !== confirmPassword) {
            showToast("New password and confirmation do not match", "error");
            return;
        }

        setIsUpdatingPassword(true);
        try {
            const token = localStorage.getItem('token');
            const response = await axios.put('http://localhost:8080/api/v1/user/password', {
                currentPassword,
                newPassword,
                confirmPassword
            }, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.data?.success) {
                showToast("Password updated successfully!", "success");
                setCurrentPassword('');
                setNewPassword('');
                setConfirmPassword('');
            } else {
                showToast(response.data?.message || "Failed to update password", "error");
            }
        } catch (error: any) {
            showToast(error.response?.data?.message || "Failed to update password", "error");
        } finally {
            setIsUpdatingPassword(false);
        }
    };

    return (
        <div className="tenant-theme">
            {toastMessage && (
                <div className={`fixed top-24 right-8 z-50 px-6 py-3 rounded-lg shadow-lg font-medium text-white transition-all transform animate-bounce ${toastType === 'success' ? 'bg-green-600' : 'bg-red-600'}`}>
                    <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined">{toastType === 'success' ? 'check_circle' : 'error'}</span>
                        {toastMessage}
                    </div>
                </div>
            )}
            <div className="bg-background font-body-md text-on-surface antialiased min-h-screen relative">
                
                {/* Sidebar */}
                <ProviderSidebar />

                <ProviderTopNavigation />
                
                <main className="ml-64 pt-24 flex flex-col h-screen overflow-hidden">
                    {/* Page Header & Actions */}
                    <section className="px-8 pb-4 flex justify-between items-end bg-background">
                        <div>
                            <div className="flex items-center gap-2 text-on-surface-variant mb-2">
                                <span className="font-label-md text-label-md uppercase tracking-widest cursor-pointer hover:text-primary transition-colors" onClick={() => navigate('/provider-dashboard')}>Settings</span>
                                <span className="material-symbols-outlined text-sm">chevron_right</span>
                                <span className="font-label-md text-label-md uppercase tracking-widest text-primary font-bold">
                                    {activeTab === 'profile' ? 'Profile Settings' : activeTab === 'schedule' ? 'My Schedule' : 'Security'}
                                </span>
                            </div>
                            <h2 className="font-headline-lg text-headline-lg text-primary tracking-tight">
                                {activeTab === 'profile' ? 'Profile & Contact Info' : activeTab === 'schedule' ? 'Schedule Matrix & Delegation' : 'Security Settings'}
                            </h2>
                            <p className="text-on-surface-variant mt-1">
                                {activeTab === 'profile' 
                                    ? 'Manage your professional details, credentials, and contact information.' 
                                    : activeTab === 'schedule'
                                    ? 'Configure your weekly availability, break times, and schedule delegation.'
                                    : 'Manage your password and security credentials.'
                                }
                            </p>
                        </div>
                        {activeTab !== 'schedule' && (
                            <button 
                                onClick={(e) => {
                                    if (activeTab === 'profile') handleUpdateProfile(e);
                                    else if (activeTab === 'security') handleUpdatePassword(e);
                                }}
                                disabled={isSaving || isUpdatingPassword}
                                className="bg-primary hover:brightness-110 text-on-primary px-6 py-2.5 rounded-xl font-label-md text-label-md flex items-center gap-2 shadow-sm transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
                            >
                                <span className="material-symbols-outlined text-[18px]">save</span>
                                {isSaving || isUpdatingPassword ? 'Saving...' : (activeTab === 'security' ? 'Update Password' : 'Save Settings')}
                            </button>
                        )}
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
                                        className={`flex items-center justify-between px-5 py-4 transition-colors font-body-md text-body-md cursor-pointer ${activeTab === 'profile' ? 'bg-primary/10 border-r-4 border-primary text-primary font-bold' : 'hover:bg-surface-container-low text-on-surface-variant'}`}
                                    >
                                        <span className="flex items-center gap-3">
                                            <span className="material-symbols-outlined" style={{fontVariationSettings: activeTab === 'profile' ? "'FILL' 1" : ""}}>domain</span>
                                            General Profile
                                        </span>
                                    </button>
                                    <button 
                                        onClick={() => setActiveTab('schedule')}
                                        className={`flex items-center justify-between px-5 py-4 transition-colors font-body-md text-body-md cursor-pointer ${activeTab === 'schedule' ? 'bg-primary/10 border-r-4 border-primary text-primary font-bold' : 'hover:bg-surface-container-low text-on-surface-variant'}`}
                                    >
                                        <span className="flex items-center gap-3">
                                            <span className="material-symbols-outlined" style={{fontVariationSettings: activeTab === 'schedule' ? "'FILL' 1" : ""}}>schedule</span>
                                            Schedule & Delegation
                                        </span>
                                    </button>
                                    <button 
                                        onClick={() => setActiveTab('security')}
                                        className={`flex items-center justify-between px-5 py-4 transition-colors font-body-md text-body-md cursor-pointer ${activeTab === 'security' ? 'bg-primary/10 border-r-4 border-primary text-primary font-bold' : 'hover:bg-surface-container-low text-on-surface-variant'}`}
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
                                                        <label className="absolute bottom-0 right-0 w-8 h-8 bg-primary text-on-primary rounded-full flex items-center justify-center cursor-pointer shadow-md hover:bg-primary/90 transition-colors" title="Change Headshot">
                                                            <span className="material-symbols-outlined text-[16px]">edit</span>
                                                            <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
                                                        </label>
                                                    </div>
                                                    <div>
                                                        <h4 className="font-label-lg text-on-surface">Profile Picture</h4>
                                                        <p className="text-sm text-on-surface-variant mt-1">Upload a professional headshot.</p>
                                                        <p className="text-xs text-on-surface-variant/70 mt-1">Recommended size: 400x400px (JPG, PNG, WebP)</p>
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
                                                            <label className="block text-sm font-medium text-on-surface-variant mb-2">{terms.specialtyLabel}</label>
                                                            <input 
                                                                type="text" 
                                                                value={specialization}
                                                                onChange={(e) => setSpecialization(e.target.value)}
                                                                placeholder="e.g. Primary Field of Expertise"
                                                                className="w-full bg-surface-variant border border-outline-variant rounded-xl px-4 py-3 text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                                                            />
                                                        </div>
                                                        <div>
                                                            <label className="block text-sm font-medium text-on-surface-variant mb-2">{terms.licenseLabel} Number</label>
                                                            <input 
                                                                type="text" 
                                                                value={licenseNumber}
                                                                onChange={(e) => setLicenseNumber(e.target.value)}
                                                                placeholder={`e.g. ${terms.orgType.toUpperCase()}-123456`}
                                                                className="w-full bg-surface-variant border border-outline-variant rounded-xl px-4 py-3 text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                                                            />
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="pt-2">
                                                    <button 
                                                        type="submit"
                                                        disabled={isSaving}
                                                        className="bg-primary hover:brightness-110 text-on-primary px-8 py-3 rounded-xl font-label-md text-label-md flex items-center gap-2 shadow-sm transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
                                                    >
                                                        <span className="material-symbols-outlined text-[18px]">save</span>
                                                        {isSaving ? 'Saving Changes...' : 'Save Profile Changes'}
                                                    </button>
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
                                                    Allow Administrators to manage and override your schedule matrix. If disabled, only you can update your working hours, and administrators will be locked out of modifying your schedule.
                                                </p>
                                            </div>
                                            <div className="flex items-center">
                                                <label className="relative inline-flex items-center cursor-pointer">
                                                    <input 
                                                        type="checkbox" 
                                                        className="sr-only peer"
                                                        checked={isScheduleDelegated}
                                                        onChange={(e) => handleToggleDelegation(e.target.checked)}
                                                    />
                                                    <div className="w-14 h-7 bg-outline-variant peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-primary"></div>
                                                </label>
                                            </div>
                                        </div>
                                        
                                        <div className="flex justify-between items-center mb-6">
                                            <div>
                                                <h3 className="font-title-lg text-primary">Your Weekly Matrix</h3>
                                                <p className="text-xs text-[#53606c] mt-0.5">Customize your active working days, operating hours, and break periods.</p>
                                            </div>
                                            <div className="text-sm text-on-surface-variant flex items-center gap-2">
                                                <span className="material-symbols-outlined text-[18px]">info</span>
                                                Times are shown in 24-hour format
                                            </div>
                                        </div>
                                        
                                        <ClinicScheduleMatrix 
                                            isProvider={true}
                                            scheduleData={scheduleData}
                                            isScheduleDelegated={isScheduleDelegated}
                                            onSave={fetchScheduleData}
                                        />
                                    </div>
                                )}
                                
                                {/* Security Settings Tab */}
                                {activeTab === 'security' && (
                                    <div className="p-8">
                                        <h3 className="font-title-lg text-primary mb-2">Change Password</h3>
                                        <p className="text-sm text-on-surface-variant mb-6">
                                            Ensure your account is using a long, random password to stay secure.
                                        </p>

                                        <form onSubmit={handleUpdatePassword} className="space-y-6 max-w-xl">
                                            <div>
                                                <label className="block text-sm font-medium text-on-surface-variant mb-2">Current Password</label>
                                                <div className="relative">
                                                    <input 
                                                        type={showCurrentPassword ? "text" : "password"} 
                                                        value={currentPassword}
                                                        onChange={(e) => setCurrentPassword(e.target.value)}
                                                        placeholder="Enter your current password"
                                                        required
                                                        className="w-full bg-surface-variant border border-outline-variant rounded-xl pl-4 pr-11 py-3 text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                                                    />
                                                    <button 
                                                        type="button"
                                                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-primary cursor-pointer"
                                                    >
                                                        <span className="material-symbols-outlined text-[20px]">
                                                            {showCurrentPassword ? 'visibility_off' : 'visibility'}
                                                        </span>
                                                    </button>
                                                </div>
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-on-surface-variant mb-2">New Password</label>
                                                <div className="relative">
                                                    <input 
                                                        type={showNewPassword ? "text" : "password"} 
                                                        value={newPassword}
                                                        onChange={(e) => setNewPassword(e.target.value)}
                                                        placeholder="Enter new password (min. 6 characters)"
                                                        required
                                                        className="w-full bg-surface-variant border border-outline-variant rounded-xl pl-4 pr-11 py-3 text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                                                    />
                                                    <button 
                                                        type="button"
                                                        onClick={() => setShowNewPassword(!showNewPassword)}
                                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-primary cursor-pointer"
                                                    >
                                                        <span className="material-symbols-outlined text-[20px]">
                                                            {showNewPassword ? 'visibility_off' : 'visibility'}
                                                        </span>
                                                    </button>
                                                </div>
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-on-surface-variant mb-2">Confirm New Password</label>
                                                <div className="relative">
                                                    <input 
                                                        type={showConfirmPassword ? "text" : "password"} 
                                                        value={confirmPassword}
                                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                                        placeholder="Confirm your new password"
                                                        required
                                                        className="w-full bg-surface-variant border border-outline-variant rounded-xl pl-4 pr-11 py-3 text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                                                    />
                                                    <button 
                                                        type="button"
                                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-primary cursor-pointer"
                                                    >
                                                        <span className="material-symbols-outlined text-[20px]">
                                                            {showConfirmPassword ? 'visibility_off' : 'visibility'}
                                                        </span>
                                                    </button>
                                                </div>
                                            </div>

                                            <div className="pt-2">
                                                <button 
                                                    type="submit" 
                                                    disabled={isUpdatingPassword}
                                                    className="bg-primary hover:brightness-110 text-on-primary px-8 py-3 rounded-xl font-label-lg tracking-wide shadow-sm transition-all active:scale-95 disabled:opacity-50 cursor-pointer flex items-center gap-2"
                                                >
                                                    <span className="material-symbols-outlined text-[18px]">lock_reset</span>
                                                    {isUpdatingPassword ? 'Updating Password...' : 'Update Password'}
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
