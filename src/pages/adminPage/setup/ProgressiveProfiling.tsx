import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const ProgressiveProfiling: React.FC = () => {
    const navigate = useNavigate();
    
    // State for Profiling Form
    const [logo, setLogo] = useState<File | null>(null);
    const [logoPreview, setLogoPreview] = useState<string | null>(null);
    const [primaryAccentColor, setPrimaryAccentColor] = useState('#0D9488');
    const [phoneContact, setPhoneContact] = useState('+977 ');
    const [timezone, setTimezone] = useState('Asia/Kathmandu');
    const [openingTime, setOpeningTime] = useState('09:00');
    const [closingTime, setClosingTime] = useState('17:00');
    const [slotDuration, setSlotDuration] = useState(20);
    
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState('');
    const [tier, setTier] = useState('Enterprise');
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        const fetchTenant = async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await axios.get('http://localhost:8080/api/v1/tenant/me', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (response.data) {
                    if (response.data.subscriptionTier) {
                        setTier(response.data.subscriptionTier);
                    }
                    if (response.data.phoneContact) {
                        setPhoneContact(response.data.phoneContact);
                    }
                }
            } catch (err) {
                console.error("Failed to fetch tenant", err);
            }
        };
        fetchTenant();
    }, []);

    // Color History (mocked)
    const [colorHistory, setColorHistory] = useState(['#0D9488', '#38BDF8', '#10B981', '#F43F5E']);

    const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                setError('Logo must be less than 5MB');
                return;
            }
            setLogo(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setLogoPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
            setError('');
        }
    };

    const handleSaveAndProceed = async () => {
        setIsSaving(true);
        setError('');
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                navigate('/login');
                return;
            }

            const formData = new FormData();
            if (logo) formData.append('logo', logo);
            formData.append('primaryAccentColor', primaryAccentColor);
            formData.append('phoneContact', phoneContact);
            formData.append('timezone', timezone);
            formData.append('openingTime', openingTime);
            formData.append('closingTime', closingTime);
            formData.append('slotDuration', slotDuration.toString());

            const response = await axios.put('http://localhost:8080/api/v1/tenant/profile', formData, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data'
                }
            });

            if (response.data.success) {
                // Navigate to Financial Setup (Step 3)
                navigate('/admin/setup/financials');
            }
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to save profiling data');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="bg-surface overflow-hidden min-h-screen font-sans">
            <main className="flex min-h-screen">
                {/* LEFT SIDE: WHITE CONTENT */}
                <div className="w-full lg:w-1/2 bg-surface-container-lowest flex flex-col p-12 overflow-y-auto border-r border-[#e0e3e5] relative">
                    
                    {/* Header Section */}
                    <div className="flex items-center space-x-4 mb-16">
                        <img 
                            alt="OmniBook Logo" 
                            className="h-8 w-auto object-contain" 
                            src="https://lh3.googleusercontent.com/aida-public/AB6AXuCP848Ao0ojfxhSN1LNdwd3KU_3YRNt-oogm_0NYHPpX9f3Kj6QdoWf2Y31mZLevEgGo4z74fgsa-J9Y7qB0Lyi_LAO4RppllH_zzT07iOT51SxNlubsUHixFCTTNXTsBL3ssxTtiBvZzVCDyAEjdskNornnV_GxVSN1r7LaWUi4SAat-rG1khKomVfEXqSz1gEVPKJO-AjUn0Pl5uKYEAec31kOmbNwwCFaTeWNMVn_ko5tqjHlPota70XrUZWip-RLtiq8JreqDg" 
                        />
                        <div className="h-6 w-px bg-outline-variant"></div>
                        <span className="font-sans text-sm font-semibold text-on-surface-variant tracking-widest uppercase">Workspace Setup</span>
                    </div>

                    <div className="max-w-md mx-auto w-full flex flex-col space-y-8 flex-grow">
                        {/* Contextual Greeting */}
                        <div className="bg-secondary-fixed/30 p-6 rounded-xl border border-secondary-fixed">
                            <h1 className="font-sans text-2xl font-bold tracking-tight text-on-secondary-fixed mb-1">Welcome to your Dedicated Tenant Environment</h1>
                            <p className="font-sans text-base text-on-secondary-fixed-variant">
                                Workspace: <span className="font-mono text-xs tracking-tight">Secure {tier} Instance</span><br/>
                                Provisioned for: <span className="font-bold">Clinic Activation</span>
                            </p>
                        </div>
                        
                        {/* Progress Tracker */}
                        <div className="flex items-center space-x-6 py-2 mb-10">
                            <div className="flex items-center space-x-2">
                                <div className="w-8 h-8 rounded-full bg-[#0F172A] flex items-center justify-center text-white font-bold text-xs">
                                    <span className="material-symbols-outlined text-[16px]">check</span>
                                </div>
                                <span className="font-sans text-sm font-semibold text-[#0F172A]">Account Security</span>
                            </div>
                            <div className="h-px w-8 bg-outline-variant"></div>
                            <div className="flex items-center space-x-2">
                                <div className="w-8 h-8 rounded-full bg-[#0F172A] flex items-center justify-center text-white font-bold text-xs">2</div>
                                <span className="font-sans text-sm font-semibold font-bold text-[#0F172A]">Progressive Profiling</span>
                            </div>
                            <div className="h-px w-8 bg-outline-variant"></div>
                            <div className="flex items-center space-x-2 opacity-50">
                                <div className="w-8 h-8 rounded-full bg-surface-container-highest flex items-center justify-center text-on-surface-variant font-bold text-xs">3</div>
                                <span className="font-sans text-sm font-semibold text-on-surface-variant">Financial Activation</span>
                            </div>
                        </div>

                        {error && (
                            <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-lg border border-red-200">
                                {error}
                            </div>
                        )}

                        <div className="space-y-10 pb-8">
                            {/* Section 1: Brand */}
                            <div className="space-y-6">
                                <div className="flex items-center gap-2">
                                    <span className="material-symbols-outlined text-[#00668a]">palette</span>
                                    <h2 className="text-[20px] font-semibold text-[#191c1e]">Institutional Brand</h2>
                                </div>
                                
                                <div className="grid grid-cols-1 gap-6">
                                    <input 
                                        type="file" 
                                        ref={fileInputRef}
                                        className="hidden" 
                                        accept="image/png, image/jpeg, image/svg+xml"
                                        onChange={handleLogoUpload}
                                    />
                                    <div 
                                        onClick={() => fileInputRef.current?.click()}
                                        className="group relative flex flex-col items-center justify-center border-2 border-dashed border-[#c6c6cd] rounded-xl p-8 transition-all cursor-pointer bg-[#f2f4f6]/30 overflow-hidden"
                                        style={{ borderColor: logoPreview ? primaryAccentColor : '#c6c6cd' }}
                                    >
                                        {logoPreview ? (
                                            <img src={logoPreview} alt="Logo Preview" className="h-16 object-contain z-10" />
                                        ) : (
                                            <>
                                                <span className="material-symbols-outlined text-[#45464d] text-[32px] mb-2 group-hover:scale-110 transition-transform">cloud_upload</span>
                                                <p className="text-[14px] font-medium">Upload Institutional Logo</p>
                                                <p className="text-[12px] text-[#45464d] mt-1 font-semibold">SVG, PNG up to 5MB</p>
                                            </>
                                        )}
                                    </div>
                                    
                                    <div className="space-y-3">
                                        <label className="text-[12px] font-semibold text-[#45464d] uppercase tracking-wider">Primary Accent Color</label>
                                        <div className="flex items-center gap-4">
                                            <div className="relative h-12 flex-grow flex items-center px-4 rounded-lg border border-[#c6c6cd] bg-white">
                                                <input 
                                                    type="color" 
                                                    value={primaryAccentColor}
                                                    onChange={(e) => setPrimaryAccentColor(e.target.value)}
                                                    className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
                                                />
                                                <div className="w-6 h-6 rounded mr-3 shadow-sm border border-black/10" style={{ backgroundColor: primaryAccentColor }}></div>
                                                <span className="text-[13px] font-medium uppercase">{primaryAccentColor}</span>
                                                <span className="absolute right-3 material-symbols-outlined text-[#76777d] text-[20px] pointer-events-none">colorize</span>
                                            </div>
                                            <div className="flex gap-2 p-1 border border-[#c6c6cd] rounded-lg bg-white">
                                                {colorHistory.map(color => (
                                                    <button 
                                                        key={color}
                                                        onClick={() => setPrimaryAccentColor(color)}
                                                        className="w-10 h-10 rounded-md border border-black/10 shadow-sm transition-transform hover:scale-110"
                                                        style={{ backgroundColor: color }}
                                                    />
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Section 2: Localization */}
                            <div className="space-y-6">
                                <div className="flex items-center gap-2">
                                    <span className="material-symbols-outlined text-[#00668a]">location_on</span>
                                    <h2 className="text-[20px] font-semibold text-[#191c1e]">Regional Settings</h2>
                                </div>
                                
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-[12px] font-semibold text-[#45464d] uppercase tracking-wider">Phone Contact</label>
                                        <div className="relative">
                                            <input 
                                                className="w-full h-12 px-4 rounded-lg border border-[#c6c6cd] outline-none text-[14px]"
                                                type="text" 
                                                value={phoneContact}
                                                onChange={(e) => setPhoneContact(e.target.value)}
                                                style={{ borderColor: '#c6c6cd' }}
                                            />
                                            <span className="absolute right-3 top-3 material-symbols-outlined text-[#76777d] text-[20px]">phone</span>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[12px] font-semibold text-[#45464d] uppercase tracking-wider">Timezone</label>
                                        <select 
                                            className="w-full h-12 px-4 rounded-lg border border-[#c6c6cd] text-[14px] outline-none appearance-none bg-white"
                                            value={timezone}
                                            onChange={(e) => setTimezone(e.target.value)}
                                        >
                                            <option value="Asia/Kathmandu">Asia/Kathmandu (NPT)</option>
                                            <option value="America/New_York">America/New_York (EST)</option>
                                            <option value="Europe/London">Europe/London (GMT)</option>
                                            <option value="Asia/Tokyo">Asia/Tokyo (JST)</option>
                                            <option value="UTC">UTC (Universal)</option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            {/* Section 3: Operations */}
                            <div className="space-y-6">
                                <div className="flex items-center gap-2">
                                    <span className="material-symbols-outlined text-[#00668a]">schedule</span>
                                    <h2 className="text-[20px] font-semibold text-[#191c1e]">Operational Hours</h2>
                                </div>
                                
                                <div className="space-y-4">
                                    <div className="flex items-center gap-4">
                                        <div className="flex-grow space-y-2">
                                            <label className="text-[12px] font-semibold text-[#45464d] uppercase tracking-wider">Opening Time</label>
                                            <input 
                                                className="w-full h-12 px-4 rounded-lg border border-[#c6c6cd] outline-none text-[13px] font-medium font-mono"
                                                type="time" 
                                                value={openingTime}
                                                onChange={(e) => setOpeningTime(e.target.value)}
                                            />
                                        </div>
                                        <div className="flex items-end pb-3 text-[#76777d]">
                                            <span className="material-symbols-outlined">trending_flat</span>
                                        </div>
                                        <div className="flex-grow space-y-2">
                                            <label className="text-[12px] font-semibold text-[#45464d] uppercase tracking-wider">Closing Time</label>
                                            <input 
                                                className="w-full h-12 px-4 rounded-lg border border-[#c6c6cd] outline-none text-[13px] font-medium font-mono"
                                                type="time" 
                                                value={closingTime}
                                                onChange={(e) => setClosingTime(e.target.value)}
                                            />
                                        </div>
                                    </div>
                                    
                                    <div className="space-y-2">
                                        <label className="text-[12px] font-semibold text-[#45464d] uppercase tracking-wider">Slot Duration (Minutes)</label>
                                        <select 
                                            className="w-full h-12 px-4 rounded-lg border border-[#c6c6cd] outline-none text-[14px] bg-white"
                                            value={slotDuration}
                                            onChange={(e) => setSlotDuration(parseInt(e.target.value))}
                                        >
                                            <option value={15}>15 Minutes</option>
                                            <option value={20}>20 Minutes</option>
                                            <option value={30}>30 Minutes</option>
                                            <option value={45}>45 Minutes</option>
                                            <option value={60}>1 Hour</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Footer */}
                    <footer className="mt-auto p-8 border-t border-[#e0e3e5] flex justify-end bg-white sticky bottom-0 z-20">
                        <button 
                            onClick={handleSaveAndProceed}
                            disabled={isSaving}
                            className="bg-[#0F172A] hover:bg-[#1E293B] disabled:opacity-70 text-white px-8 h-14 rounded-xl flex items-center gap-3 transition-all active:scale-[0.98] shadow-lg shadow-slate-200"
                        >
                            <span className="text-[12px] font-semibold uppercase tracking-wider">
                                {isSaving ? 'Saving Profiles...' : 'Save Profiles & Proceed to Financial Setup'}
                            </span>
                            {!isSaving && <span className="material-symbols-outlined text-[20px]">arrow_forward</span>}
                        </button>
                    </footer>
                </div>

                {/* Right Panel: Live Preview */}
                <div className="hidden lg:flex w-1/2 bg-[#f2f4f6] flex-col items-center justify-center relative overflow-hidden">
                    {/* Background Decorative Element */}
                    <div className="absolute inset-0 opacity-40 pointer-events-none">
                        <div className="absolute top-[-10%] right-[-10%] w-[600px] h-[600px] rounded-full blur-[120px]" style={{ backgroundColor: `${primaryAccentColor}20` }}></div>
                        <div className="absolute bottom-[-10%] left-[-10%] w-[400px] h-[400px] rounded-full blur-[100px]" style={{ backgroundColor: `${primaryAccentColor}30` }}></div>
                    </div>
                    
                    <div className="z-10 w-full max-w-xl px-8 flex flex-col items-center">
                        <div className="flex items-center gap-2 mb-8 bg-white/50 backdrop-blur px-4 py-2 rounded-full border border-white/80 shadow-sm">
                            <span className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: primaryAccentColor }}></span>
                            <span className="text-[12px] font-semibold text-[#45464d] uppercase tracking-widest">Live White-Label Preview</span>
                        </div>
                        
                        {/* Mockup Page Container */}
                        <div className="w-full aspect-[4/5] bg-white rounded-2xl shadow-[0_32px_64px_-12px_rgba(15,23,42,0.12)] border border-[#e0e3e5] overflow-hidden flex flex-col transform transition-transform hover:scale-[1.01] duration-500">
                            {/* Preview Nav */}
                            <div className="h-14 px-6 border-b border-[#e0e3e5] flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    {logoPreview ? (
                                        <img src={logoPreview} alt="Logo" className="h-8 w-auto object-contain" />
                                    ) : (
                                        <div className="w-8 h-8 rounded flex items-center justify-center" style={{ backgroundColor: primaryAccentColor }}>
                                            <span className="material-symbols-outlined text-white text-[16px]">local_hospital</span>
                                        </div>
                                    )}
                                    <span className="text-[14px] font-bold text-[#191c1e]">Institutional Portal</span>
                                </div>
                                <div className="flex gap-4">
                                    <div className="h-2 w-12 bg-[#eceef0] rounded"></div>
                                    <div className="h-2 w-12 bg-[#eceef0] rounded"></div>
                                </div>
                            </div>
                            
                            {/* Preview Content */}
                            <div className="p-8 flex-grow space-y-8 overflow-y-auto">
                                <div className="space-y-2">
                                    <div className="h-6 w-3/4 rounded-lg relative overflow-hidden" style={{ backgroundColor: `${primaryAccentColor}10` }}>
                                        <div className="absolute inset-0 w-1/3" style={{ backgroundColor: `${primaryAccentColor}20` }}></div>
                                    </div>
                                    <h3 className="text-[22px] font-bold text-[#191c1e]">Book an Appointment</h3>
                                    <p className="text-[14px] text-[#45464d]">Available slots for specialized diagnostic care.</p>
                                </div>
                                
                                {/* Calendar Mock */}
                                <div className="grid grid-cols-7 gap-2">
                                    <div className="aspect-square bg-[#f2f4f6] rounded border border-[#e0e3e5] flex items-center justify-center font-mono text-[11px] text-[#76777d]">12</div>
                                    <div className="aspect-square bg-[#f2f4f6] rounded border border-[#e0e3e5] flex items-center justify-center font-mono text-[11px] text-[#76777d]">13</div>
                                    <div className="aspect-square text-white rounded border flex items-center justify-center font-mono text-[11px] shadow-md shadow-black/10" style={{ backgroundColor: primaryAccentColor, borderColor: primaryAccentColor }}>14</div>
                                    <div className="aspect-square bg-[#f2f4f6] rounded border border-[#e0e3e5] flex items-center justify-center font-mono text-[11px] text-[#76777d]">15</div>
                                    <div className="aspect-square bg-[#f2f4f6] rounded border border-[#e0e3e5] flex items-center justify-center font-mono text-[11px] text-[#76777d]">16</div>
                                    <div className="aspect-square bg-[#f2f4f6] rounded border border-[#e0e3e5] flex items-center justify-center font-mono text-[11px] text-[#76777d]">17</div>
                                    <div className="aspect-square bg-[#f2f4f6] rounded border border-[#e0e3e5] flex items-center justify-center font-mono text-[11px] text-[#76777d]">18</div>
                                </div>
                                
                                {/* Time Slots Mock */}
                                <div className="space-y-3">
                                    <div className="flex justify-between items-center">
                                        <span className="text-[12px] font-semibold text-[#45464d] uppercase tracking-wider">Available Slots</span>
                                        <span className="text-[12px] font-semibold" style={{ color: primaryAccentColor }}>{slotDuration} Min Intervals</span>
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="h-12 rounded-lg border flex items-center justify-center font-mono text-[14px]" style={{ borderColor: primaryAccentColor, color: primaryAccentColor, backgroundColor: `${primaryAccentColor}05` }}>
                                            {openingTime} AM
                                        </div>
                                        <div className="h-12 rounded-lg border border-[#c6c6cd] flex items-center justify-center font-mono text-[14px] text-[#45464d]">
                                            --:-- AM
                                        </div>
                                        <div className="h-12 rounded-lg border border-[#c6c6cd] flex items-center justify-center font-mono text-[14px] text-[#45464d]">
                                            --:-- AM
                                        </div>
                                        <div className="h-12 rounded-lg border border-[#c6c6cd] flex items-center justify-center font-mono text-[14px] text-[#45464d]">
                                            --:-- AM
                                        </div>
                                    </div>
                                </div>
                                
                                {/* CTA Mock */}
                                <div className="pt-4">
                                    <div className="h-14 w-full rounded-xl flex items-center justify-center text-white text-[12px] font-semibold uppercase tracking-widest shadow-lg shadow-black/10" style={{ backgroundColor: primaryAccentColor }}>
                                        Confirm Booking
                                    </div>
                                </div>
                            </div>
                            
                            {/* Preview Footer */}
                            <div className="p-4 bg-[#f2f4f6] border-t border-[#e0e3e5] flex justify-center">
                                <div className="flex items-center gap-2 opacity-50">
                                    <span className="material-symbols-outlined text-[14px]">public</span>
                                    <span className="text-[10px] font-semibold uppercase tracking-tighter">Powered by OmniBook</span>
                                </div>
                            </div>
                        </div>
                        
                        {/* Annotation */}
                        <div className="mt-8 text-center space-y-2">
                            <p className="text-[14px] text-[#45464d]">Changes to your institutional profile are reflected <br/>instantly in your white-label patient portal.</p>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default ProgressiveProfiling;
