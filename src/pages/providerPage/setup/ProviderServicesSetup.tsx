import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

interface ProviderService {
    serviceName: string;
    durationMinutes: number;
    fee: number;
    isTelemedicine: boolean;
}

export default function ProviderServicesSetup() {
    const navigate = useNavigate();

    const [services, setServices] = useState<ProviderService[]>([
        { serviceName: 'Initial Consultation', durationMinutes: 30, fee: 1000, isTelemedicine: true }
    ]);
    const [activeServiceIndex, setActiveServiceIndex] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [isSubmitted, setIsSubmitted] = useState(false);

    const handleServiceChange = (index: number, field: keyof ProviderService, value: any) => {
        const updatedServices = [...services];
        updatedServices[index] = { ...updatedServices[index], [field]: value };
        setServices(updatedServices);
    };

    const handleAddService = () => {
        setServices([
            ...services,
            { serviceName: 'Standard Follow-up', durationMinutes: 15, fee: 500, isTelemedicine: false }
        ]);
        setActiveServiceIndex(services.length);
    };

    const handleLaunchWorkspace = async () => {
        setIsLoading(true);
        setError('');
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                navigate('/login');
                return;
            }

            const response = await axios.post(
                'http://localhost:8080/api/v1/provider/services',
                { services },
                {
                    headers: { 'Authorization': `Bearer ${token}` }
                }
            );

            if (response.data.success) {
                setIsSubmitted(true);
            }
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to save services');
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
                                    <div className="w-8 h-8 rounded-full bg-[#0F172A] flex items-center justify-center text-white font-bold text-xs">
                                        <span className="material-symbols-outlined text-[16px]">check</span>
                                    </div>
                                    <span className="font-sans text-sm font-semibold font-bold text-[#0F172A]">Provider Profiling</span>
                                </div>
                                <div className="h-px w-8 bg-outline-variant"></div>
                                <div className="flex items-center space-x-2">
                                    <div className="w-8 h-8 rounded-full bg-[#0F172A] flex items-center justify-center text-white font-bold text-xs">3</div>
                                    <span className="font-sans text-sm font-semibold font-bold text-[#0F172A]">Services Setup</span>
                                </div>
                            </div>
                        <main className="flex-1 w-full mx-auto scroll-smooth">
                        {isSubmitted ? (
                            <div className="flex flex-col items-center justify-center h-full space-y-6 text-center py-12">
                                <div className="w-24 h-24 bg-green-50 rounded-full flex items-center justify-center mb-4 border-[4px] border-green-100 shadow-sm">
                                    <span className="material-symbols-outlined text-green-500 text-5xl">task_alt</span>
                                </div>
                                <h2 className="text-3xl font-bold text-[#191c1e]">Application Submitted!</h2>
                                <p className="text-[#45464d] max-w-sm text-[16px]">
                                    Your provider application and service details are currently under review by the clinic administration team. 
                                </p>
                                <div className="bg-[#f2f4f6] p-6 rounded-xl border border-[#c6c6cd]/30 mt-6 max-w-sm w-full shadow-sm text-left">
                                    <h3 className="font-bold text-[#191c1e] mb-4 flex items-center gap-2">
                                        <span className="material-symbols-outlined text-[#00668a] text-[20px]">info</span>
                                        What happens next?
                                    </h3>
                                    <ul className="space-y-4">
                                        <li className="flex items-start gap-3">
                                            <div className="w-6 h-6 rounded-full bg-[#e6e8ea] flex items-center justify-center text-[#45464d] font-bold text-xs shrink-0 mt-0.5">1</div>
                                            <p className="font-sans text-sm text-[#45464d]">The clinic admin verifies your credentials and services.</p>
                                        </li>
                                        <li className="flex items-start gap-3">
                                            <div className="w-6 h-6 rounded-full bg-[#e6e8ea] flex items-center justify-center text-[#45464d] font-bold text-xs shrink-0 mt-0.5">2</div>
                                            <p className="font-sans text-sm text-[#45464d]">Your workspace account is approved and activated.</p>
                                        </li>
                                        <li className="flex items-start gap-3">
                                            <div className="w-6 h-6 rounded-full bg-[#e6e8ea] flex items-center justify-center text-[#45464d] font-bold text-xs shrink-0 mt-0.5">3</div>
                                            <p className="font-sans text-sm text-[#45464d]">You will receive an email to access your Live Provider Dashboard.</p>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        ) : (
                            <>
                                {/* Titles */}
                                <div className="mb-10">
                                    <h1 className="text-[30px] leading-[38px] tracking-[-0.02em] font-bold text-black mb-2">Define Your Services</h1>
                                    <p className="text-[14px] text-[#45464d]">Create the bookable appointment types patients will see on your public profile.</p>
                                </div>
                                
                                {error && (
                                    <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-lg border border-red-200 text-sm">
                                        {error}
                                    </div>
                                )}

                                {/* Service Form List */}
                                <form className="space-y-6">
                                    {services.map((service, index) => (
                                        <div 
                                            key={index} 
                                            className={`space-y-6 p-6 border rounded-xl transition-all duration-300 ${activeServiceIndex === index ? 'shadow-[0_0_0_4px_rgba(64,194,253,0.1)] border-[#40c2fd] bg-[#f2f4f6]' : 'border-[#e0e3e5] bg-white'}`}
                                            onClick={() => setActiveServiceIndex(index)}
                                        >
                                            <div className="space-y-1.5">
                                                <label className="text-[12px] font-semibold tracking-[0.05em] text-[#45464d] uppercase">Service Name</label>
                                                <input 
                                                    className="w-full px-4 py-3 border border-[#c6c6cd] rounded-lg focus:ring-2 focus:ring-[#40c2fd] focus:border-[#40c2fd] transition-all bg-[#f2f4f6] text-[14px]" 
                                                    type="text" 
                                                    value={service.serviceName}
                                                    onChange={(e) => handleServiceChange(index, 'serviceName', e.target.value)}
                                                />
                                            </div>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="space-y-1.5">
                                                    <label className="text-[12px] font-semibold tracking-[0.05em] text-[#45464d] uppercase">Duration</label>
                                                    <select 
                                                        className="w-full px-4 py-3 border border-[#c6c6cd] rounded-lg focus:ring-2 focus:ring-[#40c2fd] focus:border-[#40c2fd] transition-all bg-[#f2f4f6] text-[14px] appearance-none"
                                                        value={service.durationMinutes}
                                                        onChange={(e) => handleServiceChange(index, 'durationMinutes', parseInt(e.target.value))}
                                                    >
                                                        <option value={15}>15 Minutes</option>
                                                        <option value={30}>30 Minutes</option>
                                                        <option value={45}>45 Minutes</option>
                                                        <option value={60}>60 Minutes</option>
                                                    </select>
                                                </div>
                                                <div className="space-y-1.5">
                                                    <label className="text-[12px] font-semibold tracking-[0.05em] text-[#45464d] uppercase">Consultation Fee (Rs.)</label>
                                                    <div className="relative">
                                                        <input 
                                                            className="w-full px-4 py-3 border border-[#c6c6cd] rounded-lg focus:ring-2 focus:ring-[#40c2fd] focus:border-[#40c2fd] transition-all bg-[#f2f4f6] text-[14px]" 
                                                            type="number" 
                                                            value={service.fee}
                                                            onChange={(e) => handleServiceChange(index, 'fee', parseFloat(e.target.value))}
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-center justify-between p-4 bg-[#f2f4f6] border border-[#c6c6cd] rounded-lg">
                                                <div className="flex items-center gap-3">
                                                    <span className="material-symbols-outlined text-[#00668a]">videocam</span>
                                                    <span className="text-[14px] font-medium text-black">Offer via Telemedicine (Video Call)</span>
                                                </div>
                                                <label className="relative inline-flex items-center cursor-pointer">
                                                    <input 
                                                        type="checkbox" 
                                                        className="sr-only peer" 
                                                        checked={service.isTelemedicine}
                                                        onChange={(e) => handleServiceChange(index, 'isTelemedicine', e.target.checked)}
                                                    />
                                                    <div className="w-11 h-6 bg-[#c6c6cd] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                                                </label>
                                            </div>
                                        </div>
                                    ))}

                                    <button 
                                        type="button" 
                                        onClick={handleAddService}
                                        className="flex items-center gap-2 text-[12px] font-bold text-[#40c2fd] hover:text-[#00668a] transition-all py-2"
                                    >
                                        <span className="material-symbols-outlined text-[18px]">add_circle</span>
                                        + Add Another Service
                                    </button>
                                    
                                    <div className="pt-8 pb-4">
                                        <button 
                                            type="button" 
                                            onClick={handleLaunchWorkspace}
                                            disabled={isLoading}
                                            className="w-full bg-[#131b2e] text-white py-4 rounded-xl text-[20px] font-bold hover:bg-slate-800 transition-all shadow-lg shadow-[#131b2e]/20 disabled:opacity-70 active:scale-[0.98]"
                                        >
                                            {isLoading ? 'LAUNCHING...' : 'Launch Provider Workspace'}
                                        </button>
                                        <p className="mt-4 text-center text-[10px] font-semibold text-[#79849a] uppercase tracking-widest">
                                            By launching, you agree to the Clinic's Revenue Sharing terms.
                                        </p>
                                    </div>
                                </form>
                            </>
                        )}
                        </main>
                    </div>
                </div>
                
                {/* RIGHT PANEL (Preview) */}
                <div className="hidden lg:flex w-1/2 bg-surface flex-col items-center justify-center relative p-16">
                    {/* Subtle background pattern */}
                    <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(#0F172A 1px, transparent 1px)', backgroundSize: '32px 32px' }}></div>
                    {/* Decorative Light Gradient */}
                    <div className="absolute -top-40 -right-40 w-96 h-96 bg-[#40c2fd]/10 blur-[100px] rounded-full"></div>
                    <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-[#131b2e]/5 blur-[100px] rounded-full"></div>
                    
                    {/* Preview Container */}
                    <div className="w-full max-w-sm flex flex-col items-center z-10">
                        <div className="flex items-center gap-2 mb-8 animate-pulse">
                            <span className="w-2 h-2 rounded-full bg-[#40c2fd]"></span>
                            <span className="text-[12px] font-black text-[#40c2fd] tracking-[0.2em] uppercase">Patient Booking Preview</span>
                        </div>
                        {/* Floating Service Card */}
                        <div className="bg-white rounded-3xl p-8 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] w-full border border-[#c6c6cd]/30 hover:-translate-y-1 transition-transform duration-300">
                            <div className="flex flex-col items-center mb-8">
                                <div className="w-20 h-20 rounded-full border-4 border-white shadow-xl overflow-hidden mb-4 bg-[#eceef0] flex items-center justify-center">
                                    <span className="material-symbols-outlined text-4xl text-[#76777d]">person</span>
                                </div>
                                <h3 className="text-[20px] font-semibold text-black">Select an Appointment Type</h3>
                                <p className="text-[12px] font-semibold text-[#45464d] mt-1">Available for new patients</p>
                            </div>
                            <div className="space-y-4">
                                {services.map((service, index) => {
                                    const isActive = index === activeServiceIndex;
                                    return isActive ? (
                                        // Active Item
                                        <div key={index} className="relative group cursor-pointer">
                                            <div className="absolute -inset-0.5 bg-[#40c2fd]/20 rounded-2xl blur opacity-30"></div>
                                            <div className="relative flex items-center justify-between p-4 bg-white border-2 border-[#40c2fd] rounded-2xl shadow-sm">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-10 h-10 rounded-xl bg-[#40c2fd]/10 flex items-center justify-center text-[#00668a]">
                                                        <span className="material-symbols-outlined" style={{fontVariationSettings: "'FILL' 1"}}>
                                                            {service.isTelemedicine ? 'videocam' : 'person'}
                                                        </span>
                                                    </div>
                                                    <div>
                                                        <h4 className="text-[16px] font-bold text-black">{service.serviceName || 'Untitled Service'}</h4>
                                                        <p className="text-[12px] font-semibold text-[#45464d]">{service.durationMinutes} Min session</p>
                                                    </div>
                                                </div>
                                                <div className="bg-[#131b2e] text-white px-3 py-1 rounded-full text-[13px] font-medium font-mono">
                                                    Rs. {service.fee}
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        // Inactive Item
                                        <div key={index} onClick={() => setActiveServiceIndex(index)} className="flex items-center justify-between p-4 bg-[#f2f4f6] border border-[#c6c6cd] rounded-2xl opacity-60 hover:opacity-100 transition-all cursor-pointer">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-xl bg-[#e6e8ea] flex items-center justify-center text-[#45464d]">
                                                    <span className="material-symbols-outlined">
                                                        {service.isTelemedicine ? 'videocam' : 'person'}
                                                    </span>
                                                </div>
                                                <div>
                                                    <h4 className="text-[16px] font-bold text-[#45464d]">{service.serviceName || 'Untitled Service'}</h4>
                                                    <p className="text-[12px] font-semibold text-[#45464d]/70">{service.durationMinutes} Min session</p>
                                                </div>
                                            </div>
                                            <div className="text-[13px] font-medium font-mono text-[#45464d]">
                                                Rs. {service.fee}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                            <div className="mt-8 flex justify-center">
                                <button type="button" className="w-full bg-[#00668a] text-white py-3 rounded-xl text-[14px] font-bold shadow-md shadow-[#00668a]/10 hover:brightness-110 transition-all active:scale-[0.98]">
                                    Continue to Schedule
                                </button>
                            </div>
                        </div>
                        {/* Preview Footer */}
                        <p className="mt-8 text-[14px] text-[#45464d] text-center max-w-xs leading-relaxed">
                            Payments will be routed automatically to the clinic's <span className="font-bold text-black underline decoration-[#40c2fd]/40 underline-offset-4">master ledger</span>.
                        </p>
                    </div>
            </div>
        </div>
    </div>
    );
}
