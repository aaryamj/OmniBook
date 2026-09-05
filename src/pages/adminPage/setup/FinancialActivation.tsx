import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const FinancialActivation: React.FC = () => {
    const navigate = useNavigate();
    
    // Form State
    const [legalBusinessName, setLegalBusinessName] = useState('');
    const [businessEntityType, setBusinessEntityType] = useState('Private Company');
    const [ibanAccountNumber, setIbanAccountNumber] = useState('');
    const [medicalLicenseFile, setMedicalLicenseFile] = useState<File | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [error, setError] = useState('');
    const [tier, setTier] = useState('Enterprise');
    
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
                    if (response.data.organizationName) {
                        setLegalBusinessName(response.data.organizationName);
                    }
                }
            } catch (err) {
                console.error("Failed to fetch tenant", err);
            }
        };
        fetchTenant();
    }, []);
    
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            setMedicalLicenseFile(e.target.files[0]);
        }
    };

    const handleRemoveFile = () => {
        setMedicalLicenseFile(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsSubmitting(true);

        const token = localStorage.getItem('token');
        if (!token) {
            setError('Authentication token missing. Please log in again.');
            setIsSubmitting(false);
            return;
        }

        try {
            const formData = new FormData();
            formData.append('legalBusinessName', legalBusinessName);
            formData.append('businessEntityType', businessEntityType);
            formData.append('ibanAccountNumber', ibanAccountNumber);
            if (medicalLicenseFile) {
                formData.append('medicalLicense', medicalLicenseFile);
            }

            await axios.put('http://localhost:8080/api/v1/tenant/financials', formData, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data'
                }
            });

            // On success, show success message and clear token
            localStorage.removeItem('token');
            setIsSubmitted(true);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to submit financial details');
        } finally {
            setIsSubmitting(false);
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
                                <div className="w-8 h-8 rounded-full bg-[#0F172A] flex items-center justify-center text-white font-bold text-xs">
                                    <span className="material-symbols-outlined text-[16px]">check</span>
                                </div>
                                <span className="font-sans text-sm font-semibold text-[#0F172A]">Progressive Profiling</span>
                            </div>
                            <div className="h-px w-8 bg-outline-variant"></div>
                            <div className="flex items-center space-x-2">
                                <div className="w-8 h-8 rounded-full bg-[#0F172A] flex items-center justify-center text-white font-bold text-xs">3</div>
                                <span className="font-sans text-sm font-semibold font-bold text-[#0F172A]">Financial Activation</span>
                            </div>
                        </div>

                        {isSubmitted ? (
                            <div className="flex flex-col items-center justify-center h-full space-y-6 text-center py-12 flex-grow">
                                <div className="w-24 h-24 bg-green-50 rounded-full flex items-center justify-center mb-4 border-[4px] border-green-100 shadow-sm">
                                    <span className="material-symbols-outlined text-green-500 text-5xl">task_alt</span>
                                </div>
                                <h2 className="font-headline-lg text-3xl font-bold text-primary">Application Submitted!</h2>
                                <p className="font-body-lg text-on-surface-variant max-w-sm">
                                    Your workspace application and KYC details are currently under review by our administration team. 
                                </p>
                                <div className="bg-surface-container-low p-6 rounded-xl border border-outline-variant/30 mt-6 max-w-sm w-full shadow-sm">
                                    <h3 className="font-bold text-on-surface mb-4 text-left flex items-center gap-2">
                                        <span className="material-symbols-outlined text-secondary text-[20px]">info</span>
                                        What happens next?
                                    </h3>
                                    <ul className="text-sm text-on-surface-variant text-left space-y-4">
                                        <li className="flex items-start gap-3">
                                            <span className="material-symbols-outlined text-secondary text-[20px] mt-0.5">admin_panel_settings</span>
                                            <span>Our team will securely verify your medical license and financial information.</span>
                                        </li>
                                        <li className="flex items-start gap-3">
                                            <span className="material-symbols-outlined text-secondary text-[20px] mt-0.5">mark_email_read</span>
                                            <span>You will receive an activation email as soon as your workspace is approved.</span>
                                        </li>
                                    </ul>
                                </div>
                                <button 
                                    onClick={() => navigate('/login')}
                                    className="w-full max-w-sm bg-white border-2 border-outline-variant hover:border-[#0F172A] hover:text-[#0F172A] text-on-surface-variant font-semibold py-3 rounded-xl transition-all active:scale-[0.98] mt-8"
                                >
                                    Return to Login Page
                                </button>
                            </div>
                        ) : (
                            <>
                                {error && (
                                    <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-lg border border-red-200">
                                        {error}
                                    </div>
                                )}

                                <div className="mb-4">
                                    <h2 className="font-headline-lg text-3xl font-bold mb-2">Activate Payouts</h2>
                                    <p className="font-body-md text-on-surface-variant">Complete your KYC verification to start receiving secure multi-party payments directly into your account.</p>
                                </div>

                                {/* Secured by Stripe Banner */}
                                <div className="flex items-center space-x-3 p-3 bg-surface-container-low rounded-lg mb-8 border border-outline-variant/30">
                                    <span className="material-symbols-outlined text-secondary" style={{ fontVariationSettings: "'FILL' 1" }}>verified_user</span>
                                    <span className="font-label-md text-sm text-on-surface-variant">Verified and Secured by <strong className="text-secondary">Stripe</strong></span>
                                </div>

                                {/* Form */}
                                <form className="space-y-6" onSubmit={handleSubmit}>
                                    <div className="space-y-1.5">
                                        <label className="font-label-md text-xs font-semibold uppercase tracking-wider text-outline">Legal business name</label>
                                        <input 
                                            className="w-full bg-white border border-outline-variant text-on-surface font-body-md py-3 px-4 rounded-lg focus:ring-2 focus:ring-secondary focus:border-secondary transition-all outline-none" 
                                            type="text" 
                                            placeholder="e.g., Mediciti Core Healthcare Pvt. Ltd."
                                            value={legalBusinessName}
                                            onChange={(e) => setLegalBusinessName(e.target.value)}
                                            required
                                        />
                                    </div>
                                    
                                    <div className="space-y-1.5">
                                        <label className="font-label-md text-xs font-semibold uppercase tracking-wider text-outline">Business Entity Type</label>
                                        <select 
                                            className="w-full bg-white border border-outline-variant text-on-surface font-body-md py-3 px-4 rounded-lg focus:ring-2 focus:ring-secondary focus:border-secondary transition-all outline-none"
                                            value={businessEntityType}
                                            onChange={(e) => setBusinessEntityType(e.target.value)}
                                        >
                                            <option value="Private Company">Private Company</option>
                                            <option value="Sole Proprietorship">Sole Proprietorship</option>
                                            <option value="Partnership">Partnership</option>
                                            <option value="Public Corporation">Public Corporation</option>
                                            <option value="Non-Profit">Non-Profit</option>
                                        </select>
                                    </div>
                                    
                                    <div className="space-y-1.5">
                                        <label className="font-label-md text-xs font-semibold uppercase tracking-wider text-outline">IBAN / Account Number</label>
                                        <div className="relative">
                                            <input 
                                                className="w-full bg-white border border-outline-variant text-on-surface font-mono py-3 px-4 rounded-lg focus:ring-2 focus:ring-secondary focus:border-secondary outline-none" 
                                                type="text" 
                                                placeholder="Enter account number"
                                                value={ibanAccountNumber}
                                                onChange={(e) => setIbanAccountNumber(e.target.value)}
                                                required
                                            />
                                            <span className="absolute right-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-outline">lock</span>
                                        </div>
                                    </div>
                                    
                                    <div className="space-y-1.5">
                                        <label className="font-label-md text-xs font-semibold uppercase tracking-wider text-outline">Medical License</label>
                                        <input 
                                            type="file" 
                                            ref={fileInputRef}
                                            className="hidden" 
                                            accept=".pdf,image/*"
                                            onChange={handleFileSelect}
                                        />
                                        
                                        {!medicalLicenseFile ? (
                                            <div 
                                                onClick={() => fileInputRef.current?.click()}
                                                className="flex items-center justify-center p-6 border-2 border-dashed border-outline-variant rounded-lg bg-surface-container-lowest hover:bg-surface-container-low cursor-pointer transition-colors"
                                            >
                                                <div className="text-center">
                                                    <span className="material-symbols-outlined text-outline mb-2 text-3xl">upload_file</span>
                                                    <p className="text-sm font-medium text-on-surface">Click to upload medical license</p>
                                                    <p className="text-xs text-outline mt-1">PDF, JPG, PNG up to 10MB</p>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="flex items-center justify-between p-4 border border-outline-variant rounded-lg bg-surface-container-lowest">
                                                <div className="flex items-center space-x-3">
                                                    <span className="material-symbols-outlined text-red-500">description</span>
                                                    <span className="font-body-md text-sm font-medium text-on-surface truncate max-w-[200px]">
                                                        {medicalLicenseFile.name}
                                                    </span>
                                                </div>
                                                <button type="button" onClick={handleRemoveFile} className="text-outline hover:text-red-500 transition-colors">
                                                    <span className="material-symbols-outlined">close</span>
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                    
                                    <button 
                                        disabled={isSubmitting}
                                        className="w-full bg-[#0F172A] hover:bg-[#1E293B] disabled:opacity-70 text-white font-semibold py-4 rounded-xl shadow-lg hover:shadow-xl transition-all active:scale-[0.98] mt-8 flex justify-center items-center gap-2" 
                                        type="submit"
                                    >
                                        {isSubmitting ? (
                                            'Verifying Details...'
                                        ) : (
                                            <>
                                                Submit for Verification & Launch Workspace
                                                <span className="material-symbols-outlined">rocket_launch</span>
                                            </>
                                        )}
                                    </button>
                                </form>
                                
                                <div className="mt-8 text-center pb-8">
                                    <p className="font-label-md text-xs text-outline">
                                        By submitting, you agree to the <a className="underline hover:text-primary transition-colors cursor-pointer">Financial Terms of Service</a>.
                                    </p>
                                </div>
                            </>
                        )}
                    </div>
                </div>

                {/* RIGHT SIDE: VISUAL PREVIEW */}
                <div className="hidden lg:flex w-1/2 bg-[#F8FAFC] flex-col items-center justify-center relative overflow-hidden">
                    {/* Background Decoration */}
                    <div className="absolute inset-0 opacity-40">
                        <div className="absolute top-[-10%] right-[-10%] w-96 h-96 bg-secondary-fixed rounded-full blur-[120px]"></div>
                        <div className="absolute bottom-[-10%] left-[-10%] w-96 h-96 bg-primary-fixed rounded-full blur-[120px]"></div>
                    </div>
                    
                    <div className="relative z-10 w-[480px]">
                        {/* Floating Dashboard Card */}
                        <div className="bg-white rounded-2xl shadow-2xl border border-surface-variant p-8 transform transition-transform hover:-translate-y-2 duration-500">
                            <div className="flex items-center justify-between mb-8">
                                <div>
                                    <p className="font-label-md text-xs font-semibold text-outline mb-1 uppercase tracking-widest">Financial Ledger</p>
                                    <h3 className="font-headline-md text-xl font-bold text-primary-container">OmniBook Analytics</h3>
                                </div>
                                <div className="w-10 h-10 rounded-full bg-secondary-fixed flex items-center justify-center">
                                    <span className="material-symbols-outlined text-secondary" style={{ fontVariationSettings: "'FILL' 1" }}>account_balance_wallet</span>
                                </div>
                            </div>
                            
                            {/* Revenue Chart Placeholder */}
                            <div className="mb-8">
                                <div className="flex items-end justify-between space-x-2 h-32 mb-4">
                                    <div className="w-full bg-surface-container rounded-t-sm h-[30%]"></div>
                                    <div className="w-full bg-surface-container rounded-t-sm h-[45%]"></div>
                                    <div className="w-full bg-surface-container rounded-t-sm h-[35%]"></div>
                                    <div className="w-full bg-surface-container rounded-t-sm h-[60%]"></div>
                                    <div className="w-full bg-surface-container rounded-t-sm h-[55%]"></div>
                                    <div className="w-full bg-secondary-container rounded-t-sm h-[85%]"></div>
                                    <div className="w-full bg-secondary rounded-t-sm h-[100%]"></div>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="font-headline-md text-2xl font-bold text-emerald-600">+$24,850.00</span>
                                    <span className="font-label-md text-xs font-bold bg-emerald-50 text-emerald-700 px-2 py-1 rounded">▲ 12.4%</span>
                                </div>
                            </div>
                            
                            {/* Notification Toast inside Preview */}
                            <div className="space-y-4">
                                <div className="flex items-start space-x-4 p-4 rounded-xl bg-surface-bright border border-surface-variant">
                                    <span className="material-symbols-outlined text-secondary mt-1">schedule_send</span>
                                    <div>
                                        <p className="font-body-md text-sm text-on-surface font-semibold">$1,250.00 in transit</p>
                                        <p className="font-label-md text-xs text-outline">Destination: Mediciti Bank (••4421)</p>
                                    </div>
                                </div>
                                <div className="flex items-center justify-center py-2">
                                    <div className="flex space-x-1">
                                        <div className="w-1.5 h-1.5 rounded-full bg-outline-variant"></div>
                                        <div className="w-1.5 h-1.5 rounded-full bg-outline-variant"></div>
                                        <div className="w-1.5 h-1.5 rounded-full bg-outline-variant"></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        {/* Descriptive Text */}
                        <div className="mt-12 text-center">
                            <p className="font-body-lg text-on-surface-variant max-w-sm mx-auto leading-relaxed">
                                Automated multi-party routing, <br/><span className="text-primary font-bold">powered by Stripe Connect.</span>
                            </p>
                        </div>
                    </div>
                    
                    {/* Abstract Grid Overlay */}
                    <div className="absolute inset-0 pointer-events-none opacity-20" style={{ backgroundImage: "radial-gradient(#cbd5e1 1.5px, transparent 1.5px)", backgroundSize: "24px 24px" }}></div>
                </div>
            </main>
        </div>
    );
};

export default FinancialActivation;
