import { useState } from 'react';
import GlobalAuditLogs from './GlobalAuditLogs';

const mockActivities = [
    {
        id: 1,
        name: 'Kathmandu Central Hospital',
        status: 'Account Activated',
        location: 'Kathmandu, Nepal',
        time: '2h ago',
        icon: 'domain',
        bgClass: 'bg-blue-50 text-blue-600',
        textHover: 'group-hover:text-blue-700'
    },
    {
        id: 2,
        name: 'Dr. Sharma Clinics',
        status: 'Credentials Verified',
        location: 'Pokhara',
        time: '5h ago',
        icon: 'verified_user',
        bgClass: 'bg-green-50 text-green-600',
        textHover: 'group-hover:text-green-700'
    },
    {
        id: 3,
        name: 'Patan Polyclinic',
        status: 'Awaiting Documentation Review',
        location: 'Patan',
        time: '12h ago',
        icon: 'pending_actions',
        bgClass: 'bg-orange-50 text-orange-600',
        textHover: 'group-hover:text-orange-700'
    },
    {
        id: 4,
        name: 'Lalitpur Eye Center',
        status: 'Account Activated',
        location: 'Lalitpur',
        time: '1d ago',
        icon: 'domain',
        bgClass: 'bg-blue-50 text-blue-600',
        textHover: 'group-hover:text-blue-700'
    },
    {
        id: 5,
        name: 'Everest Medical',
        status: 'Payment Pending',
        location: 'Namche',
        time: '1d ago',
        icon: 'payments',
        bgClass: 'bg-orange-50 text-orange-600',
        textHover: 'group-hover:text-orange-700'
    },
    {
        id: 6,
        name: 'Biratnagar Health Post',
        status: 'Credentials Verified',
        location: 'Biratnagar',
        time: '2d ago',
        icon: 'verified_user',
        bgClass: 'bg-green-50 text-green-600',
        textHover: 'group-hover:text-green-700'
    },
    {
        id: 7,
        name: 'Dharan Dental Care',
        status: 'Account Activated',
        location: 'Dharan',
        time: '2d ago',
        icon: 'domain',
        bgClass: 'bg-blue-50 text-blue-600',
        textHover: 'group-hover:text-blue-700'
    },
    {
        id: 8,
        name: 'Bhairahawa Diagnostics',
        status: 'Application Received',
        location: 'Bhairahawa',
        time: '3d ago',
        icon: 'inbox',
        bgClass: 'bg-purple-50 text-purple-600',
        textHover: 'group-hover:text-purple-700'
    }
];

export default function RecentOnboardingActivity() {
    const [showAll, setShowAll] = useState(false);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [enforce2FA, setEnforce2FA] = useState(true);
    const [requireHIPAA, setRequireHIPAA] = useState(true);
    const [currentStep, setCurrentStep] = useState(1);
    const [isDispatching, setIsDispatching] = useState(false);
    
    // Financial Report State
    const [isReportModalOpen, setIsReportModalOpen] = useState(false);
    const [reportType, setReportType] = useState('comprehensive');
    const [reportFormat, setReportFormat] = useState('pdf');
    const [isGenerating, setIsGenerating] = useState(false);
    
    // Audit Drawer State
    const [isAuditDrawerOpen, setIsAuditDrawerOpen] = useState(false);
    
    // Determine which activities to show based on state
    const displayedActivities = showAll ? mockActivities : mockActivities.slice(0, 4);

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-gutter">
            {/* Recent Activity */}
            <div className="bg-surface-container-lowest rounded-xl border border-surface-container overflow-hidden flex flex-col">
                <div className="px-6 py-4 border-b border-surface-container flex justify-between items-center bg-surface-container-low/30">
                    <h3 className="font-headline-md text-headline-md text-on-surface">Recent Onboarding Activity</h3>
                    <button 
                        onClick={() => setShowAll(!showAll)}
                        className="text-[11px] font-bold text-blue-600 hover:text-blue-800 hover:underline transition-colors px-2 py-1 rounded hover:bg-blue-50"
                    >
                        {showAll ? 'View Less' : 'View All'}
                    </button>
                </div>
                <div className="flex-1 overflow-y-auto custom-scrollbar" style={{ maxHeight: showAll ? '400px' : 'auto' }}>
                    <ul className="divide-y divide-surface-container transition-all duration-300">
                        {displayedActivities.map((activity) => (
                            <li key={activity.id} className="px-6 py-4 flex items-center hover:bg-surface-container-low transition-colors group cursor-pointer">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center mr-4 shadow-sm ${activity.bgClass}`}>
                                    <span className="material-symbols-outlined text-sm">{activity.icon}</span>
                                </div>
                                <div className="flex-1">
                                    <p className={`font-body-md text-on-surface font-semibold transition-colors ${activity.textHover}`}>
                                        {activity.name}
                                    </p>
                                    <p className="text-[12px] text-on-surface-variant">
                                        {activity.status}{activity.location ? ` • ${activity.location}` : ''}
                                    </p>
                                </div>
                                <span className="text-[11px] font-mono-data text-on-surface-variant bg-surface-container-low px-2 py-1 rounded">
                                    {activity.time}
                                </span>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
            
            {/* Quick Actions */}
            <div className="bg-surface-container-lowest rounded-xl border border-surface-container p-6">
                <h3 className="font-headline-md text-headline-md text-on-surface mb-6">Quick Actions</h3>
                <div className="space-y-4">
                    <button 
                        onClick={() => setIsDrawerOpen(true)}
                        className="w-full group flex items-center justify-between p-4 bg-primary text-white rounded-lg hover:bg-on-primary-fixed-variant transition-all transform active:scale-95 duration-150 shadow-sm hover:shadow"
                    >
                        <div className="flex items-center">
                            <span className="material-symbols-outlined mr-3">add_business</span>
                            <span className="font-body-md font-semibold">Invite New Clinic</span>
                        </div>
                        <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">chevron_right</span>
                    </button>
                    <button 
                        onClick={() => setIsReportModalOpen(true)}
                        className="w-full group flex items-center justify-between p-4 bg-white border border-surface-container text-on-surface rounded-lg hover:bg-surface-container-low transition-all transform active:scale-95 duration-150"
                    >
                        <div className="flex items-center">
                            <span className="material-symbols-outlined mr-3 text-on-surface-variant">description</span>
                            <span className="font-body-md font-semibold">Generate Financial Report</span>
                        </div>
                        <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">chevron_right</span>
                    </button>
                    <button 
                        onClick={() => setIsAuditDrawerOpen(true)}
                        className="w-full group flex items-center justify-between p-4 bg-white border border-surface-container text-on-surface rounded-lg hover:bg-surface-container-low transition-all transform active:scale-95 duration-150"
                    >
                        <div className="flex items-center">
                            <span className="material-symbols-outlined mr-3 text-on-surface-variant">manage_search</span>
                            <span className="font-body-md font-semibold">View System Audit Logs</span>
                        </div>
                        <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">chevron_right</span>
                    </button>
                    
                    <div className="mt-8 p-4 rounded-lg bg-blue-50 border border-blue-100 flex items-start shadow-sm">
                        <span className="material-symbols-outlined text-blue-600 mr-3 animate-pulse">info</span>
                        <p className="text-[13px] text-blue-800 leading-relaxed">
                            The next scheduled system maintenance is set for <span className="font-bold border-b border-blue-300 border-dashed">Sunday at 02:00 AM UTC</span>. Ensure all cluster replicas are synced.
                        </p>
                    </div>
                </div>
            </div>

            {/* Sliding Drawer Overlay */}
            {isDrawerOpen && (
                <div className="fixed inset-0 z-[100] flex justify-end font-sans">
                    {/* Dark Background Overlay */}
                    <div 
                        className="absolute inset-0 bg-black/50 transition-opacity duration-300"
                        onClick={() => setIsDrawerOpen(false)}
                    ></div>
                    
                    {/* Right-Side Drawer Panel */}
                    <div className="relative w-full max-w-[35%] h-full bg-white shadow-[-10px_0_30px_rgba(0,0,0,0.1)] flex flex-col animate-in slide-in-from-right duration-300">
                        {/* Drawer Header */}
                        <div className="flex items-center justify-between px-6 py-5 border-b border-surface-container bg-surface-container-lowest">
                            <h2 className="font-headline-md text-headline-md text-primary font-bold">Provision New Tenant</h2>
                            <button 
                                onClick={() => {
                                    setIsDrawerOpen(false);
                                    setTimeout(() => { setCurrentStep(1); setIsDispatching(false); }, 300);
                                }}
                                className="text-on-surface-variant hover:text-error transition-colors p-1 rounded-full hover:bg-error-container"
                            >
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>
                        
                        {/* Progress Indicator */}
                        <div className="px-6 py-4 border-b border-surface-container bg-surface-container-low/30 flex gap-4">
                            <div 
                                className={`flex items-center gap-2 cursor-pointer transition-colors ${currentStep === 1 ? 'text-primary' : 'text-on-surface-variant hover:text-primary'}`}
                                onClick={() => currentStep === 2 && setCurrentStep(1)}
                            >
                                <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shadow-sm transition-colors ${currentStep === 1 ? 'bg-primary text-white' : 'bg-surface-container-high text-on-surface'}`}>1</div>
                                <span className={`text-xs ${currentStep === 1 ? 'font-bold' : 'font-medium'}`}>Step 1: Organization Details</span>
                            </div>
                            <div className="text-outline-variant">
                                <span className="material-symbols-outlined text-sm">chevron_right</span>
                            </div>
                            <div className={`flex items-center gap-2 transition-colors ${currentStep === 2 ? 'text-primary' : 'text-on-surface-variant'}`}>
                                <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shadow-sm transition-colors ${currentStep === 2 ? 'bg-primary text-white' : 'bg-surface-container-high text-on-surface'}`}>2</div>
                                <span className={`text-xs ${currentStep === 2 ? 'font-bold' : 'font-medium'}`}>Step 2: Dispatch Invite</span>
                            </div>
                        </div>
                        
                        {/* Drawer Body (Scrollable) */}
                        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar overflow-x-hidden">
                            <div className="relative w-full">
                                <div className={`transition-all duration-300 ${currentStep === 1 ? 'relative translate-x-0 opacity-100' : 'absolute top-0 left-0 -translate-x-full opacity-0 w-full'}`}>
                                    {/* Section 1: Organization & Access */}
                                    <section className="space-y-5 mb-8">
                                        <h3 className="text-sm font-bold text-primary border-b border-surface-container pb-2">Organization & Access</h3>
                                        
                                        <div>
                                            <label className="block text-sm font-bold text-on-surface mb-2">Clinic / Hospital Name</label>
                                            <input 
                                                type="text" 
                                                placeholder="e.g., Mediciti Core"
                                                className="w-full bg-surface border border-outline-variant px-4 py-2.5 rounded-lg text-body-md focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-shadow"
                                            />
                                        </div>
                                        
                                        <div>
                                            <label className="block text-sm font-bold text-on-surface mb-2">Primary Admin Email</label>
                                            <div className="relative">
                                                <span className="material-symbols-outlined absolute left-4 top-2.5 text-on-surface-variant text-[20px]">lock</span>
                                                <input 
                                                    type="email" 
                                                    placeholder="e.g., admin@mediciti.com"
                                                    className="w-full bg-surface border border-outline-variant pl-12 pr-4 py-2.5 rounded-lg text-body-md focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-shadow"
                                                />
                                            </div>
                                        </div>
                                    </section>
                                    
                                    {/* Section 2: Workspace Configuration */}
                                    <section className="space-y-5 mb-8">
                                        <h3 className="text-sm font-bold text-primary border-b border-surface-container pb-2">Workspace Configuration</h3>
                                        
                                        <div>
                                            <label className="block text-sm font-bold text-on-surface mb-2">Subdomain Binding</label>
                                            <div className="flex shadow-sm rounded-lg overflow-hidden border border-outline-variant focus-within:ring-2 focus-within:ring-blue-500 transition-shadow">
                                                <input 
                                                    type="text" 
                                                    defaultValue="mediciti"
                                                    className="flex-1 bg-surface px-4 py-2.5 text-body-md outline-none border-none"
                                                />
                                                <div className="bg-surface-container px-4 py-2.5 text-on-surface-variant text-body-md font-mono-data border-l border-outline-variant flex items-center">
                                                    .omnibook.app
                                                </div>
                                            </div>
                                        </div>
                                        
                                        <div>
                                            <label className="block text-sm font-bold text-on-surface mb-2">Select Subscription Tier</label>
                                            <div className="relative">
                                                <select className="w-full appearance-none bg-surface border border-outline-variant px-4 py-2.5 rounded-lg text-body-md focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-shadow cursor-pointer">
                                                    <option>Starter (Up to 5 Providers)</option>
                                                    <option>Professional (Up to 20 Providers)</option>
                                                    <option selected>Enterprise (Unlimited Providers)</option>
                                                </select>
                                                <span className="material-symbols-outlined absolute right-4 top-2.5 pointer-events-none text-on-surface-variant">expand_more</span>
                                            </div>
                                        </div>
                                    </section>
                                    
                                    {/* Section 3: Security Policies */}
                                    <section className="space-y-5">
                                        <h3 className="text-sm font-bold text-primary border-b border-surface-container pb-2">Security Policies</h3>
                                        
                                        <div className="space-y-4">
                                            <div 
                                                className="flex items-center justify-between p-4 border border-outline-variant rounded-lg bg-surface hover:bg-surface-variant/20 transition-colors cursor-pointer"
                                                onClick={() => setEnforce2FA(!enforce2FA)}
                                            >
                                                <span className="text-sm font-semibold text-primary">Enforce 2FA for Clinic Admin</span>
                                                <div className={`relative inline-flex h-6 w-11 shrink-0 rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 shadow-inner ${enforce2FA ? 'bg-emerald-500' : 'bg-outline-variant/30'}`}>
                                                    <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${enforce2FA ? 'translate-x-5' : 'translate-x-0'}`}></span>
                                                </div>
                                            </div>
                                            
                                            <div 
                                                className="flex items-center justify-between p-4 border border-outline-variant rounded-lg bg-surface hover:bg-surface-variant/20 transition-colors cursor-pointer"
                                                onClick={() => setRequireHIPAA(!requireHIPAA)}
                                            >
                                                <span className="text-sm font-semibold text-primary">Require HIPAA/Medical Data Compliance Mode</span>
                                                <div className={`relative inline-flex h-6 w-11 shrink-0 rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 shadow-inner ${requireHIPAA ? 'bg-emerald-500' : 'bg-outline-variant/30'}`}>
                                                    <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${requireHIPAA ? 'translate-x-5' : 'translate-x-0'}`}></span>
                                                </div>
                                            </div>
                                        </div>
                                    </section>
                                </div>

                                <div className={`transition-all duration-300 ${currentStep === 2 ? 'relative translate-x-0 opacity-100' : 'absolute top-0 left-0 translate-x-full opacity-0 w-full'}`}>
                                    <section className="space-y-6">
                                        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden shadow-sm">
                                            <div className="bg-surface-container px-5 py-4 border-b border-outline-variant flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <span className="material-symbols-outlined text-on-surface-variant">mark_email_read</span>
                                                    <div>
                                                        <h4 className="text-sm font-bold text-on-surface">Secure Magic Link Invitation</h4>
                                                        <p className="text-xs text-on-surface-variant">To: admin@mediciti.com</p>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="p-6 space-y-6">
                                                <div className="text-center space-y-3">
                                                    <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-2">
                                                        <span className="material-symbols-outlined text-primary text-3xl">key</span>
                                                    </div>
                                                    <h3 className="font-bold text-primary text-lg">Activate Your OmniBook Enterprise Workspace</h3>
                                                    <p className="text-sm text-on-surface-variant max-w-sm mx-auto">
                                                        Welcome to OmniBook. You have been invited to set up the root administrator account for <strong>Mediciti Core</strong>.
                                                    </p>
                                                    
                                                    <div className="inline-block mt-4 w-full max-w-[250px]">
                                                        <button className="w-full bg-primary text-white py-3 rounded-lg font-bold text-sm shadow-sm pointer-events-none">
                                                            Activate My Workspace
                                                        </button>
                                                        <p className="text-[10px] text-on-surface-variant mt-2 text-center">
                                                            This secure link expires in exactly 48 hours.
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-bold text-primary mb-2">Optional Custom Note</label>
                                            <textarea 
                                                placeholder="Add a personalized message for the clinic director..."
                                                className="w-full bg-surface border border-outline-variant px-4 py-3 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-shadow resize-none h-24"
                                            ></textarea>
                                        </div>
                                        
                                        <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 flex items-start gap-3">
                                            <span className="material-symbols-outlined text-blue-600">verified_user</span>
                                            <div>
                                                <h4 className="text-xs font-bold text-blue-900">Enterprise Tenant Provisioning</h4>
                                                <p className="text-[11px] text-blue-800 mt-1">
                                                    Clicking Dispatch will immediately generate a unique UUID for this tenant, spin up an isolated postgres schema, and email the 48-hour secure JWT token link.
                                                </p>
                                            </div>
                                        </div>
                                    </section>
                                </div>
                            </div>
                        </div>
                        
                        {/* Drawer Footer (Sticky) */}
                        <div className="px-6 py-5 border-t border-surface-container bg-surface-container-lowest flex justify-end gap-3">
                            {currentStep === 2 && (
                                <button 
                                    onClick={() => setCurrentStep(1)}
                                    className="px-6 py-3.5 rounded-lg font-bold text-sm flex items-center justify-center gap-2 hover:bg-surface-container-low transition-colors text-on-surface-variant border border-outline-variant"
                                    disabled={isDispatching}
                                >
                                    Back
                                </button>
                            )}
                            
                            {currentStep === 1 ? (
                                <button 
                                    onClick={() => setCurrentStep(2)}
                                    className="flex-1 bg-primary text-on-primary px-6 py-3.5 rounded-lg font-bold text-sm flex items-center justify-center gap-2 hover:bg-slate-800 hover:shadow-lg transition-all active:scale-[0.98]"
                                >
                                    Continue to Dispatch Invite
                                    <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                                </button>
                            ) : (
                                <button 
                                    onClick={() => {
                                        setIsDispatching(true);
                                        setTimeout(() => {
                                            alert('Secure Invite Dispatched to root admin! Tenant provisioned successfully.');
                                            setIsDispatching(false);
                                            setIsDrawerOpen(false);
                                            setCurrentStep(1);
                                        }, 1500);
                                    }}
                                    disabled={isDispatching}
                                    className="flex-1 bg-primary text-on-primary px-6 py-3.5 rounded-lg font-bold text-sm flex items-center justify-center gap-3 hover:bg-slate-800 hover:shadow-lg transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
                                >
                                    {isDispatching ? (
                                        <>
                                            <span className="material-symbols-outlined animate-spin text-[20px]">refresh</span>
                                            Provisioning...
                                        </>
                                    ) : (
                                        <>
                                            <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>send</span>
                                            Generate & Dispatch Secure Invite
                                        </>
                                    )}
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}
            {/* Financial Report Modal */}
            {isReportModalOpen && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center font-sans">
                    {/* Dark Overlay */}
                    <div 
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300"
                        onClick={() => setIsReportModalOpen(false)}
                    ></div>
                    
                    {/* Modal Content */}
                    <div className="relative w-full max-w-[500px] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
                        {/* Header */}
                        <div className="flex items-center justify-between px-6 py-4 border-b border-surface-container bg-surface-container-lowest">
                            <h2 className="font-headline-md text-headline-sm text-primary font-bold flex items-center gap-2">
                                <span className="material-symbols-outlined text-primary">request_quote</span>
                                Generate Financial Report
                            </h2>
                            <button 
                                onClick={() => setIsReportModalOpen(false)}
                                className="text-on-surface-variant hover:text-error transition-colors p-1 rounded-full hover:bg-error-container"
                            >
                                <span className="material-symbols-outlined text-xl">close</span>
                            </button>
                        </div>
                        
                        {/* Body */}
                        <div className="p-6 space-y-6 bg-surface">
                            {/* Time Period */}
                            <div>
                                <label className="block text-sm font-bold text-on-surface mb-2">Time Period</label>
                                <div className="relative">
                                    <select className="w-full appearance-none bg-surface border border-outline-variant px-4 py-3 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-shadow cursor-pointer font-medium">
                                        <option>Last 30 Days</option>
                                        <option>This Quarter (Q3 2026)</option>
                                        <option>Year to Date (YTD)</option>
                                        <option>Custom Range...</option>
                                    </select>
                                    <span className="material-symbols-outlined absolute right-4 top-3 pointer-events-none text-on-surface-variant">calendar_today</span>
                                </div>
                            </div>

                            {/* Report Type */}
                            <div>
                                <label className="block text-sm font-bold text-on-surface mb-3">Report Scope</label>
                                <div className="grid grid-cols-1 gap-3">
                                    <label className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-all ${reportType === 'comprehensive' ? 'border-primary bg-primary/5 shadow-sm' : 'border-outline-variant bg-surface hover:bg-surface-variant/20'}`} onClick={() => setReportType('comprehensive')}>
                                        <input type="radio" name="reportType" checked={reportType === 'comprehensive'} className="mt-1 text-primary focus:ring-primary cursor-pointer" onChange={() => {}} />
                                        <div>
                                            <div className="text-sm font-bold text-on-surface">Comprehensive Ledger</div>
                                            <div className="text-[11px] text-on-surface-variant mt-0.5">Includes platform revenue, all tenant subscription fees, and transaction aggregates.</div>
                                        </div>
                                    </label>
                                    <label className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-all ${reportType === 'payouts' ? 'border-primary bg-primary/5 shadow-sm' : 'border-outline-variant bg-surface hover:bg-surface-variant/20'}`} onClick={() => setReportType('payouts')}>
                                        <input type="radio" name="reportType" checked={reportType === 'payouts'} className="mt-1 text-primary focus:ring-primary cursor-pointer" onChange={() => {}} />
                                        <div>
                                            <div className="text-sm font-bold text-on-surface">Tenant Payouts Only</div>
                                            <div className="text-[11px] text-on-surface-variant mt-0.5">Detailed breakdown of clinic disbursements and pending settlements.</div>
                                        </div>
                                    </label>
                                </div>
                            </div>

                            {/* Export Format */}
                            <div>
                                <label className="block text-sm font-bold text-on-surface mb-3">Export Format</label>
                                <div className="flex gap-3">
                                    <button 
                                        onClick={() => setReportFormat('pdf')}
                                        className={`flex-1 py-2.5 rounded-lg border text-sm font-bold flex items-center justify-center gap-2 transition-all ${reportFormat === 'pdf' ? 'bg-primary border-primary text-white shadow-md' : 'bg-surface border-outline-variant text-on-surface-variant hover:bg-surface-variant/30'}`}
                                    >
                                        <span className="material-symbols-outlined text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>picture_as_pdf</span>
                                        PDF
                                    </button>
                                    <button 
                                        onClick={() => setReportFormat('csv')}
                                        className={`flex-1 py-2.5 rounded-lg border text-sm font-bold flex items-center justify-center gap-2 transition-all ${reportFormat === 'csv' ? 'bg-primary border-primary text-white shadow-md' : 'bg-surface border-outline-variant text-on-surface-variant hover:bg-surface-variant/30'}`}
                                    >
                                        <span className="material-symbols-outlined text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>table</span>
                                        CSV
                                    </button>
                                </div>
                            </div>
                        </div>
                        
                        {/* Footer */}
                        <div className="px-6 py-4 border-t border-surface-container bg-surface-container-lowest flex justify-end gap-3">
                            <button 
                                onClick={() => setIsReportModalOpen(false)}
                                className="px-5 py-2.5 rounded-lg font-bold text-sm text-on-surface-variant hover:bg-surface-container transition-colors"
                            >
                                Cancel
                            </button>
                            <button 
                                onClick={() => {
                                    setIsGenerating(true);
                                    setTimeout(() => {
                                        setIsGenerating(false);
                                        setIsReportModalOpen(false);
                                        alert(`Successfully generated ${reportType} report as ${reportFormat.toUpperCase()}! Initiating download...`);
                                    }, 2000);
                                }}
                                disabled={isGenerating}
                                className="bg-primary text-on-primary px-6 py-2.5 rounded-lg font-bold text-sm flex items-center gap-2 hover:bg-slate-800 hover:shadow-lg transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-wait"
                            >
                                {isGenerating ? (
                                    <>
                                        <span className="material-symbols-outlined animate-spin text-[18px]">progress_activity</span>
                                        Generating...
                                    </>
                                ) : (
                                    <>
                                        <span className="material-symbols-outlined text-[18px]">download</span>
                                        Generate & Download
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
            
            {/* Audit Logs Drawer */}
            {isAuditDrawerOpen && (
                <div className="fixed inset-0 z-[100] flex justify-end font-sans">
                    {/* Dark Background Overlay */}
                    <div 
                        className="absolute inset-0 bg-black/50 transition-opacity duration-300"
                        onClick={() => setIsAuditDrawerOpen(false)}
                    ></div>
                    
                    {/* Right-Side Drawer Panel */}
                    <div className="relative w-full max-w-[35%] h-full bg-surface shadow-[-10px_0_30px_rgba(0,0,0,0.1)] flex flex-col animate-in slide-in-from-right duration-300">
                        {/* Drawer Header */}
                        <div className="flex items-center justify-between px-6 py-5 border-b border-surface-container bg-surface-container-lowest">
                            <h2 className="font-headline-md text-headline-md text-primary font-bold flex items-center gap-2">
                                <span className="material-symbols-outlined text-primary">manage_search</span>
                                Audit Logs Viewer
                            </h2>
                            <button 
                                onClick={() => setIsAuditDrawerOpen(false)}
                                className="text-on-surface-variant hover:text-error transition-colors p-1 rounded-full hover:bg-error-container"
                            >
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>
                        
                        {/* Drawer Body */}
                        <div className="flex-1 overflow-y-auto p-6 bg-surface custom-scrollbar">
                            <GlobalAuditLogs />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
