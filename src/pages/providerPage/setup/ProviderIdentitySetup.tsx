import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function ProviderIdentitySetup() {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        credentials: '',
        medicalLicense: '',
        primarySpecialty: 'Cardiology'
    });
    
    const [headshot, setHeadshot] = useState<File | null>(null);
    const [headshotPreview, setHeadshotPreview] = useState<string | null>(null);
    const [licenseImage, setLicenseImage] = useState<File | null>(null);
    const [licensePreview, setLicensePreview] = useState<string | null>(null);
    
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);
    const licenseInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        // Pre-fill from local storage if they entered it during AcceptInvite
        const savedFullName = localStorage.getItem('fullName');
        const savedSpecialization = localStorage.getItem('specialization');
        
        if (savedFullName) {
            const parts = savedFullName.split(' ');
            setFormData(prev => ({
                ...prev,
                firstName: parts[0] || '',
                lastName: parts.slice(1).join(' ') || ''
            }));
        }
        
        if (savedSpecialization) {
            setFormData(prev => ({ ...prev, primarySpecialty: savedSpecialization }));
        }
    }, []);

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                setError('Image must be less than 5MB');
                return;
            }
            setHeadshot(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setHeadshotPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
            setError('');
        }
    };

    const handleLicenseUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                setError('License image must be less than 5MB');
                return;
            }
            setLicenseImage(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setLicensePreview(reader.result as string);
            };
            reader.readAsDataURL(file);
            setError('');
        }
    };

    const handleSaveAndProceed = async () => {
        setIsLoading(true);
        setError('');
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                navigate('/login');
                return;
            }

            const payload = new FormData();
            if (headshot) payload.append('headshot', headshot);
            if (licenseImage) payload.append('licenseImage', licenseImage);
            payload.append('firstName', formData.firstName);
            payload.append('lastName', formData.lastName);
            payload.append('credentials', formData.credentials);
            payload.append('medicalLicense', formData.medicalLicense);
            payload.append('primarySpecialty', formData.primarySpecialty);

            const response = await axios.put('http://localhost:8080/api/v1/provider/profile', payload, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data'
                }
            });

            if (response.data.success) {
                // Navigate to Services step
                navigate('/provider/setup/services');
            }
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to save profile');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="bg-surface overflow-hidden min-h-screen font-sans">
            <div className="flex min-h-screen">
                {/* LEFT PANEL: Data Entry Workspace */}
                <div className="w-full lg:w-1/2 bg-surface-container-lowest flex flex-col p-12 overflow-y-auto z-10">
                    
                    {/* Header Section from Step 1 */}
                    <div className="flex items-center space-x-4 mb-16">
                        <img 
                            alt="OmniBook Logo" 
                            className="h-8 w-auto object-contain" 
                            src="https://lh3.googleusercontent.com/aida-public/AB6AXuCP848Ao0ojfxhSN1LNdwd3KU_3YRNt-oogm_0NYHPpX9f3Kj6QdoWf2Y31mZLevEgGo4z74fgsa-J9Y7qB0Lyi_LAO4RppllH_zzT07iOT51SxNlubsUHixFCTTNXTsBL3ssxTtiBvZzVCDyAEjdskNornnV_GxVSN1r7LaWUi4SAat-rG1khKomVfEXqSz1gEVPKJO-AjUn0Pl5uKYEAec31kOmbNwwCFaTeWNMVn_ko5tqjHlPota70XrUZWip-RLtiq8JreqDg" 
                        />
                        <div className="h-6 w-px bg-outline-variant"></div>
                        <span className="font-sans text-sm font-semibold text-on-surface-variant tracking-widest uppercase">Workspace Setup</span>
                    </div>
                    
                    <div className="max-w-md mx-auto w-full flex flex-col space-y-8">
                            {/* Contextual Greeting from Step 1 */}
                            <div className="bg-secondary-fixed/30 p-6 rounded-xl border border-secondary-fixed">
                                <h1 className="font-sans text-2xl font-bold tracking-tight text-on-secondary-fixed mb-1">Welcome to your Dedicated Tenant Environment</h1>
                                <p className="font-sans text-base text-on-secondary-fixed-variant">
                                    Workspace: <span className="font-mono text-xs tracking-tight">Secure Provider Instance</span><br/>
                                    Provisioned for: <span className="font-bold">Clinic Activation</span>
                                </p>
                            </div>
                            
                            {/* Progress Tracker from Step 1 */}
                            <div className="flex items-center space-x-6 py-2">
                                <div className="flex items-center space-x-2">
                                    <div className="w-8 h-8 rounded-full bg-[#0F172A] flex items-center justify-center text-white font-bold text-xs">
                                        <span className="material-symbols-outlined text-[16px]">check</span>
                                    </div>
                                    <span className="font-sans text-sm font-semibold font-bold text-[#0F172A]">Account Security</span>
                                </div>
                                <div className="h-px w-8 bg-outline-variant"></div>
                                <div className="flex items-center space-x-2">
                                    <div className="w-8 h-8 rounded-full bg-[#0F172A] flex items-center justify-center text-white font-bold text-xs">2</div>
                                    <span className="font-sans text-sm font-semibold font-bold text-[#0F172A]">Provider Profiling</span>
                                </div>
                                <div className="h-px w-8 bg-outline-variant"></div>
                                <div className="flex items-center space-x-2 opacity-50">
                                    <div className="w-8 h-8 rounded-full bg-surface-container-highest flex items-center justify-center text-on-surface-variant font-bold text-xs">3</div>
                                    <span className="font-sans text-sm font-semibold text-on-surface-variant">Services Setup</span>
                                </div>
                            </div>
                        {error && (
                            <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-lg border border-red-200 text-sm">
                                {error}
                            </div>
                        )}
                        {/* Clinical Profile Section */}
                        <div className="space-y-10">
                            <div>
                                <h2 className="font-sans font-bold text-[#0F172A] mb-1 text-[24px]">Clinical Profile</h2>
                                <p className="text-[#45464d] font-sans text-[14px]">Verify your medical credentials and professional presence.</p>
                            </div>
                            
                            {/* Upload Zone */}
                            <div className="flex items-start gap-8">
                                <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                                    <div className="w-32 h-32 rounded-xl overflow-hidden bg-[#eceef0] border-2 border-dashed border-[#c6c6cd] flex items-center justify-center transition-all group-hover:border-[#0D9488]">
                                        {headshotPreview ? (
                                            <img alt="Provider Headshot" className="w-full h-full object-cover" src={headshotPreview} />
                                        ) : (
                                            <span className="material-symbols-outlined text-[#76777d] text-4xl">person</span>
                                        )}
                                        <div className="absolute inset-0 bg-[#0F172A]/40 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center text-white transition-opacity">
                                            <span className="material-symbols-outlined mb-1">cloud_upload</span>
                                            <span className="text-[10px] font-bold uppercase tracking-widest">Update</span>
                                        </div>
                                    </div>
                                    <input 
                                        type="file" 
                                        ref={fileInputRef}
                                        onChange={handleImageUpload}
                                        accept="image/*"
                                        className="hidden"
                                    />
                                </div>
                                <div className="flex-1 py-2">
                                    <h3 className="font-sans text-[16px] mb-2 font-bold text-[#0F172A]">Professional Headshot</h3>
                                    <p className="text-[#45464d] text-[13px] leading-relaxed mb-4">
                                        Use a high-resolution, professional portrait. This image will be the primary visual for patients booking appointments.
                                    </p>
                                    <button type="button" onClick={() => fileInputRef.current?.click()} className="flex items-center gap-2 text-[#0D9488] font-sans border border-[#0D9488]/20 px-4 py-2 rounded-lg hover:bg-[#0D9488]/5 transition-colors text-[12px] font-semibold">
                                        <span className="material-symbols-outlined text-[18px]">add_photo_alternate</span>
                                        CHANGE IMAGE
                                    </button>
                                </div>
                            </div>
                            
                            {/* Input Grid */}
                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="font-sans text-[12px] font-semibold tracking-wider text-[#45464d] uppercase">First Name</label>
                                    <input 
                                        className="w-full bg-[#f7f9fb] border border-[#e0e3e5] rounded-lg p-3 text-[#191c1e] focus:ring-[#0D9488] focus:border-[#0D9488] text-[14px]" 
                                        type="text" 
                                        value={formData.firstName}
                                        onChange={e => setFormData({...formData, firstName: e.target.value})}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="font-sans text-[12px] font-semibold tracking-wider text-[#45464d] uppercase">Last Name</label>
                                    <input 
                                        className="w-full bg-[#f7f9fb] border border-[#e0e3e5] rounded-lg p-3 text-[#191c1e] focus:ring-[#0D9488] focus:border-[#0D9488] text-[14px]" 
                                        type="text" 
                                        value={formData.lastName}
                                        onChange={e => setFormData({...formData, lastName: e.target.value})}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="font-sans text-[12px] font-semibold tracking-wider text-[#45464d] uppercase">Credentials</label>
                                    <input 
                                        className="w-full bg-[#f7f9fb] border border-[#e0e3e5] rounded-lg p-3 text-[#191c1e] focus:ring-[#0D9488] focus:border-[#0D9488] text-[14px]" 
                                        type="text" 
                                        placeholder="e.g. MD, FACC"
                                        value={formData.credentials}
                                        onChange={e => setFormData({...formData, credentials: e.target.value})}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="font-sans text-[12px] font-semibold tracking-wider text-[#45464d] uppercase">Medical License</label>
                                    <input 
                                        className="w-full bg-[#f7f9fb] border border-[#e0e3e5] rounded-lg p-3 font-mono text-[#191c1e] focus:ring-[#0D9488] focus:border-[#0D9488] text-[14px]" 
                                        type="text" 
                                        value={formData.medicalLicense}
                                        onChange={e => setFormData({...formData, medicalLicense: e.target.value})}
                                    />
                                </div>
                            </div>
                            
                            {/* Clinical Assignment Section */}
                            <div className="p-6 bg-[#f2f4f6] rounded-xl border border-[#e0e3e5] space-y-4">
                                <div className="flex items-center gap-2 text-[#0F172A]">
                                    <span className="material-symbols-outlined" style={{fontVariationSettings: "'FILL' 1"}}>stethoscope</span>
                                    <h3 className="font-sans font-bold text-[18px]">Clinical Assignment</h3>
                                </div>
                                <div className="space-y-2">
                                    <label className="font-sans text-[12px] font-semibold tracking-wider text-[#45464d] uppercase flex items-center justify-between">
                                        <span>Specialization & Department</span>
                                        <span className="text-[10px] text-[#0D9488] font-bold bg-[#0D9488]/10 px-2 py-0.5 rounded flex items-center gap-1">
                                            <span className="material-symbols-outlined text-[12px]">lock</span>
                                            LOCKED BY ADMIN
                                        </span>
                                    </label>
                                    <input 
                                        type="text"
                                        readOnly
                                        className="w-full bg-[#f2f4f6] border border-[#e0e3e5] rounded-lg p-3 text-[#76777d] text-[14px] cursor-not-allowed"
                                        value={formData.primarySpecialty}
                                    />
                                </div>
                            </div>

                            {/* Medical License Verification Upload */}
                            <div className="p-6 bg-[#f2f4f6] rounded-xl border border-[#e0e3e5] space-y-4 mt-6">
                                <div className="flex items-center gap-2 text-[#0F172A]">
                                    <span className="material-symbols-outlined" style={{fontVariationSettings: "'FILL' 1"}}>verified</span>
                                    <h3 className="font-sans font-bold text-[18px]">License Verification</h3>
                                </div>
                                <p className="text-[#45464d] text-[13px] leading-relaxed">
                                    Please upload a scanned copy or clear photo of your official medical license. This is required for our internal verification process and will not be displayed publicly.
                                </p>
                                <div className="flex items-center gap-6">
                                    <div 
                                        className="relative w-32 h-24 rounded-lg bg-[#eceef0] border-2 border-dashed border-[#c6c6cd] flex-shrink-0 flex items-center justify-center overflow-hidden group cursor-pointer"
                                        onClick={() => licenseInputRef.current?.click()}
                                    >
                                        {licensePreview ? (
                                            <img alt="License Document" className="w-full h-full object-cover" src={licensePreview} />
                                        ) : (
                                            <span className="material-symbols-outlined text-[#76777d] text-3xl">badge</span>
                                        )}
                                        <div className="absolute inset-0 bg-[#0F172A]/40 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center text-white transition-opacity">
                                            <span className="material-symbols-outlined mb-1">cloud_upload</span>
                                            <span className="text-[10px] font-bold uppercase tracking-widest">Upload</span>
                                        </div>
                                    </div>
                                    <input 
                                        type="file" 
                                        ref={licenseInputRef}
                                        onChange={handleLicenseUpload}
                                        accept="image/*,.pdf"
                                        className="hidden"
                                    />
                                    <div className="flex-1">
                                        <button type="button" onClick={() => licenseInputRef.current?.click()} className="flex items-center gap-2 text-[#0F172A] font-sans border border-[#0F172A]/20 px-4 py-2 rounded-lg hover:bg-[#0F172A]/5 transition-colors text-[12px] font-semibold">
                                            <span className="material-symbols-outlined text-[18px]">upload_file</span>
                                            {licenseImage ? 'CHANGE DOCUMENT' : 'UPLOAD LICENSE'}
                                        </button>
                                        {licenseImage && <p className="text-[#0D9488] text-[11px] font-bold mt-2 flex items-center gap-1"><span className="material-symbols-outlined text-[14px]">check_circle</span> Document attached</p>}
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        {/* Action Bar */}
                        <div className="mt-12">
                            <button 
                                onClick={handleSaveAndProceed}
                                disabled={isLoading}
                                className="w-full bg-[#0F172A] text-white px-8 py-4 rounded-xl font-sans text-[14px] font-semibold hover:bg-[#1E293B] transition-all flex items-center justify-center gap-3 active:scale-[0.98] disabled:opacity-70 shadow-lg shadow-[#0F172A]/20"
                            >
                                {isLoading ? 'SAVING...' : 'SAVE PROFILE & PROCEED TO SCHEDULE'}
                                {!isLoading && <span className="material-symbols-outlined">arrow_forward</span>}
                            </button>
                        </div>
                    </div>
                </div>
                
                {/* RIGHT PANEL: Live Preview */}
                <div className="hidden lg:flex w-1/2 bg-surface flex-col items-center justify-center relative p-16">
                    {/* Subtle background pattern */}
                    <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(#0F172A 1px, transparent 1px)', backgroundSize: '32px 32px' }}></div>
                    {/* Live Indicator Badge */}
                    <div className="absolute top-10 flex items-center gap-3 px-5 py-2 bg-white/80 backdrop-blur-md rounded-full border border-white/50 shadow-sm">
                        <span className="w-2 h-2 bg-[#0D9488] rounded-full animate-pulse"></span>
                        <span className="font-sans text-[#0D9488] tracking-[0.2em] text-[10px] font-black uppercase">LIVE PATIENT-FACING PREVIEW</span>
                    </div>
                    
                    {/* Preview Canvas */}
                    <div className="w-full max-w-[400px] transition-transform hover:-translate-y-1 duration-300">
                        {/* Floating Doctor Card */}
                        <div className="bg-white rounded-[2rem] p-8 shadow-2xl shadow-[#0F172A]/10 flex flex-col items-center text-center border border-[#c6c6cd]/10">
                            <div className="w-32 h-32 rounded-full border-4 border-white shadow-xl overflow-hidden mb-6 bg-[#eceef0]">
                                {headshotPreview ? (
                                    <img alt="Live Preview Headshot" className="w-full h-full object-cover" src={headshotPreview} />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-[#76777d]">
                                        <span className="material-symbols-outlined text-4xl">person</span>
                                    </div>
                                )}
                            </div>
                            <div className="flex items-center gap-2 mb-1 flex-wrap justify-center">
                                <h2 className="font-sans text-[24px] font-bold text-[#0F172A]">
                                    Dr. {formData.firstName || 'Sarah'} {formData.lastName || 'Jenkins'}{formData.credentials ? `, ${formData.credentials}` : ''}
                                </h2>
                                <span className="material-symbols-outlined text-[#0D9488]" style={{fontVariationSettings: "'FILL' 1"}}>verified</span>
                            </div>
                            <div className="inline-flex items-center bg-[#f2f4f6] px-4 py-1.5 rounded-full mb-6 mt-1">
                                <span className="text-[#45464d] font-sans text-[12px] font-semibold tracking-wide uppercase">{formData.primarySpecialty}</span>
                            </div>
                            <div className="flex items-center gap-4 mb-8">
                                <div className="flex items-center gap-1">
                                    <span className="material-symbols-outlined text-amber-400" style={{fontVariationSettings: "'FILL' 1"}}>star</span>
                                    <span className="font-bold text-[#0F172A]">4.9</span>
                                    <span className="text-[#45464d] text-[14px]">(120 Reviews)</span>
                                </div>
                            </div>
                            
                            {/* CTA */}
                            <button type="button" className="w-full bg-[#0D9488] text-white py-4 rounded-2xl font-bold text-[16px] hover:brightness-110 transition-all shadow-lg shadow-[#0D9488]/20 active:scale-[0.98]">
                                BOOK APPOINTMENT
                            </button>
                            
                            <div className="mt-6 flex gap-4 w-full border-t border-[#eceef0] pt-6">
                                <div className="flex-1">
                                    <p className="text-[10px] font-sans text-[#45464d] font-semibold uppercase mb-1">Next Available</p>
                                    <p className="font-bold text-[#0F172A] text-[14px]">Tomorrow, 9:00 AM</p>
                                </div>
                                <div className="w-[1px] bg-[#eceef0]"></div>
                                <div className="flex-1">
                                    <p className="text-[10px] font-sans text-[#45464d] font-semibold uppercase mb-1">Clinic</p>
                                    <p className="font-bold text-[#0F172A] text-[14px]">North Heart Center</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    {/* Preview Footer */}
                    <footer className="absolute bottom-10 px-6 text-center">
                        <p className="text-[#45464d]/80 font-sans max-w-[320px] text-[13px]">
                            Changes to your professional profile are reflected instantly in the <span className="font-bold text-[#0F172A]">OmniBook</span> patient portal.
                        </p>
                    </footer>
                </div>
            </div>
        </div>
    );
}
