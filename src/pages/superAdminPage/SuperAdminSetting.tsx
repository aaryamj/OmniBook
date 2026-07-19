import React, { useState } from 'react';
import './superAdmin.css';
import Sidebar from './components/Sidebar';
import TopNavigation from './components/TopNavigation';

type SettingTabName = 'General Preferences' | 'Gateway Integrations' | 'Security Policies' | 'Billing & Subscriptions';

export default function SuperAdminSetting() {
    const [isWhiteGloveEnabled, setIsWhiteGloveEnabled] = useState(true);
    const [activeTab, setActiveTab] = useState<SettingTabName>('General Preferences');

    const renderTabContent = () => {
        switch (activeTab) {
            case 'General Preferences':
                return (
                    <div className="max-w-3xl space-y-12 animate-in fade-in slide-in-from-top-2 duration-300">
                        {/* Localization Section */}
                        <section>
                            <h2 className="font-headline-md text-headline-md text-primary border-b border-surface-container pb-4 mb-6">Localization Settings</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                                <div className="col-span-1 md:col-span-2">
                                    <label className="block font-label-md text-label-md text-outline uppercase mb-2">Platform Name</label>
                                    <input 
                                        className="w-full border-outline-variant rounded-lg px-4 py-3 text-body-md focus:ring-primary focus:border-primary bg-surface-container-lowest" 
                                        type="text" 
                                        defaultValue="OmniBook Enterprise"
                                    />
                                </div>
                                <div>
                                    <label className="block font-label-md text-label-md text-outline uppercase mb-2">Base Timezone</label>
                                    <select className="w-full border-outline-variant rounded-lg px-4 py-3 text-body-md focus:ring-primary focus:border-primary bg-surface-container-lowest">
                                        <option>Asia/Kathmandu</option>
                                        <option>UTC+00:00</option>
                                        <option>America/New_York</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block font-label-md text-label-md text-outline uppercase mb-2">System Currency</label>
                                    <select className="w-full border-outline-variant rounded-lg px-4 py-3 text-body-md focus:ring-primary focus:border-primary bg-surface-container-lowest">
                                        <option>NPR</option>
                                        <option>USD</option>
                                        <option>EUR</option>
                                    </select>
                                </div>
                            </div>
                        </section>

                        {/* Onboarding Section */}
                        <section>
                            <h2 className="font-headline-md text-headline-md text-primary border-b border-surface-container pb-4 mb-6">Onboarding Lifecycle</h2>
                            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                                <div className="max-w-lg">
                                    <h4 className="font-bold text-primary">Enforce White-Glove Onboarding</h4>
                                    <p className="text-body-md text-on-surface-variant mt-1">When enabled, new clinics cannot self-register and must be manually vetted by a system auditor through the invitation protocol.</p>
                                </div>
                                <button 
                                    onClick={() => setIsWhiteGloveEnabled(!isWhiteGloveEnabled)}
                                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${isWhiteGloveEnabled ? 'bg-green-500' : 'bg-surface-container-highest'}`}
                                >
                                    <span className={`${isWhiteGloveEnabled ? 'translate-x-5' : 'translate-x-0'} pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}></span>
                                </button>
                            </div>
                        </section>

                        {/* Data Retention */}
                        <section>
                            <h2 className="font-headline-md text-headline-md text-primary border-b border-surface-container pb-4 mb-6">Compliance & Retention</h2>
                            <div className="max-w-sm">
                                <label className="block font-label-md text-label-md text-outline uppercase mb-2">Medical Audit Log Retention</label>
                                <select className="w-full border-outline-variant rounded-lg px-4 py-3 text-body-md focus:ring-primary focus:border-primary bg-surface-container-lowest" defaultValue="7 Years">
                                    <option>1 Year</option>
                                    <option>3 Years</option>
                                    <option value="7 Years">7 Years</option>
                                    <option>Indefinite</option>
                                </select>
                                <p className="mt-2 text-[11px] text-on-surface-variant italic">Retention policy affects storage billing overhead and legal compliance standing.</p>
                            </div>
                        </section>
                    </div>
                );
            case 'Gateway Integrations':
                return (
                    <div className="max-w-3xl space-y-12 animate-in fade-in slide-in-from-top-2 duration-300">
                        <section>
                            <h2 className="font-headline-md text-headline-md text-primary border-b border-surface-container pb-4 mb-6">Payment Gateways</h2>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between p-4 border border-outline-variant rounded-xl bg-surface-container-lowest">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 bg-green-100 text-green-700 rounded-lg flex items-center justify-center font-bold">ST</div>
                                        <div>
                                            <h4 className="font-bold text-primary">Stripe Connect</h4>
                                            <p className="text-body-sm text-on-surface-variant">Active • v2.1.0 • Webhook responding</p>
                                        </div>
                                    </div>
                                    <button className="text-secondary font-label-md hover:underline">Configure</button>
                                </div>
                                <div className="flex items-center justify-between p-4 border border-outline-variant rounded-xl bg-surface-container-lowest">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 bg-green-100 text-green-700 rounded-lg flex items-center justify-center font-bold">eS</div>
                                        <div>
                                            <h4 className="font-bold text-primary">eSewa Integration</h4>
                                            <p className="text-body-sm text-on-surface-variant">Active • v2.0.1 • Regional Default</p>
                                        </div>
                                    </div>
                                    <button className="text-secondary font-label-md hover:underline">Configure</button>
                                </div>
                            </div>
                        </section>
                        <section>
                            <h2 className="font-headline-md text-headline-md text-primary border-b border-surface-container pb-4 mb-6">Messaging Providers</h2>
                            <div className="flex items-center justify-between p-4 border border-outline-variant rounded-xl bg-surface-container-lowest">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 bg-blue-100 text-blue-700 rounded-lg flex items-center justify-center font-bold">Tw</div>
                                    <div>
                                        <h4 className="font-bold text-primary">Twilio SMS</h4>
                                        <p className="text-body-sm text-on-surface-variant">Active • 98.4% Delivery Rate</p>
                                    </div>
                                </div>
                                <button className="text-secondary font-label-md hover:underline">Configure</button>
                            </div>
                        </section>
                    </div>
                );
            case 'Security Policies':
                return (
                    <div className="max-w-3xl space-y-12 animate-in fade-in slide-in-from-top-2 duration-300">
                        <section>
                            <h2 className="font-headline-md text-headline-md text-primary border-b border-surface-container pb-4 mb-6">Authentication</h2>
                            <div className="grid grid-cols-1 gap-6">
                                <div>
                                    <label className="block font-label-md text-label-md text-outline uppercase mb-2">Session Timeout (Idle)</label>
                                    <select className="w-full max-w-sm border-outline-variant rounded-lg px-4 py-3 text-body-md focus:ring-primary focus:border-primary bg-surface-container-lowest" defaultValue="15 Minutes">
                                        <option>5 Minutes</option>
                                        <option value="15 Minutes">15 Minutes (HIPAA Default)</option>
                                        <option>30 Minutes</option>
                                        <option>1 Hour</option>
                                    </select>
                                </div>
                                <div className="flex items-center justify-between max-w-sm p-4 bg-surface-container-lowest border border-outline-variant rounded-xl">
                                    <div>
                                        <h4 className="font-bold text-primary">Enforce Global MFA</h4>
                                        <p className="text-body-sm text-on-surface-variant">Require for all tenants</p>
                                    </div>
                                    <div className="relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 bg-green-500">
                                        <span className="translate-x-5 pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out"></span>
                                    </div>
                                </div>
                            </div>
                        </section>
                        <section>
                            <h2 className="font-headline-md text-headline-md text-primary border-b border-surface-container pb-4 mb-6">API Access Rules</h2>
                            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-xl text-yellow-800">
                                <h4 className="font-bold flex items-center gap-2"><span className="material-symbols-outlined">warning</span> Rate Limiting Enabled</h4>
                                <p className="text-body-sm mt-1">Global API rate limiting is currently active at 1000 requests / min / IP.</p>
                            </div>
                        </section>
                    </div>
                );
            case 'Billing & Subscriptions':
                return (
                    <div className="max-w-3xl space-y-12 animate-in fade-in slide-in-from-top-2 duration-300">
                        <section>
                            <h2 className="font-headline-md text-headline-md text-primary border-b border-surface-container pb-4 mb-6">Platform Subscription</h2>
                            <div className="p-6 bg-surface-container-lowest border border-outline-variant rounded-xl flex items-center justify-between">
                                <div>
                                    <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-bold rounded mb-2 inline-block">ACTIVE</span>
                                    <h3 className="font-headline-sm text-headline-sm text-primary">Enterprise License</h3>
                                    <p className="text-body-md text-on-surface-variant">Billed annually • Next invoice: Oct 1, 2024</p>
                                </div>
                                <div className="text-right">
                                    <h3 className="font-headline-md text-headline-md text-primary">$4,999/yr</h3>
                                    <button className="mt-2 text-secondary font-label-md hover:underline">Manage Billing</button>
                                </div>
                            </div>
                        </section>
                        <section>
                            <h2 className="font-headline-md text-headline-md text-primary border-b border-surface-container pb-4 mb-6">Recent Invoices</h2>
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-surface-container">
                                        <th className="py-3 text-label-md font-label-md text-outline uppercase">Date</th>
                                        <th className="py-3 text-label-md font-label-md text-outline uppercase">Amount</th>
                                        <th className="py-3 text-label-md font-label-md text-outline uppercase">Status</th>
                                        <th className="py-3 text-label-md font-label-md text-outline uppercase text-right">Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr className="border-b border-surface-container-low hover:bg-surface-container-lowest">
                                        <td className="py-4 text-body-md text-primary">Oct 1, 2023</td>
                                        <td className="py-4 text-body-md text-on-surface-variant">$4,999.00</td>
                                        <td className="py-4"><span className="px-2 py-1 bg-green-50 text-green-700 text-xs rounded-full">Paid</span></td>
                                        <td className="py-4 text-right"><button className="text-secondary font-label-md hover:underline">Download PDF</button></td>
                                    </tr>
                                    <tr className="border-b border-surface-container-low hover:bg-surface-container-lowest">
                                        <td className="py-4 text-body-md text-primary">Oct 1, 2022</td>
                                        <td className="py-4 text-body-md text-on-surface-variant">$4,999.00</td>
                                        <td className="py-4"><span className="px-2 py-1 bg-green-50 text-green-700 text-xs rounded-full">Paid</span></td>
                                        <td className="py-4 text-right"><button className="text-secondary font-label-md hover:underline">Download PDF</button></td>
                                    </tr>
                                </tbody>
                            </table>
                        </section>
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <div className="superadmin-theme">
            <div className="bg-background text-on-surface font-sans min-h-screen relative overflow-x-hidden">
                <Sidebar />
                <TopNavigation />

                <main className="ml-[280px] pt-20 px-8 pb-12">
                    <div className="max-w-7xl mx-auto">
                        {/* Page Header */}
                        <div className="flex items-end justify-between mb-8 mt-4">
                            <div>
                                <h1 className="font-headline-lg text-headline-lg text-primary">Platform Configurations</h1>
                                <p className="text-body-lg text-on-surface-variant mt-1">Manage global environment variables, external integrations, and onboarding policies.</p>
                            </div>
                            <button className="bg-primary text-white px-8 py-3 rounded-lg font-bold hover:bg-zinc-800 transition-all shadow-sm">
                                Save Changes
                            </button>
                        </div>

                        {/* Metric Bento Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                            <div className="bg-white border border-outline-variant p-6 rounded-xl flex flex-col justify-between">
                                <div className="flex justify-between items-start">
                                    <div className="p-2 bg-blue-50 rounded-lg">
                                        <span className="material-symbols-outlined text-blue-600">power</span>
                                    </div>
                                    <span className="text-blue-600 font-mono-data text-[11px] bg-blue-50 px-2 py-0.5 rounded">CONNECTED</span>
                                </div>
                                <div className="mt-4">
                                    <h3 className="text-3xl font-black text-primary">4 Active</h3>
                                    <p className="text-[10px] font-bold text-outline uppercase tracking-widest mt-1">External Integrations</p>
                                </div>
                            </div>
                            
                            <div className="bg-white border border-outline-variant p-6 rounded-xl flex flex-col justify-between">
                                <div className="flex justify-between items-start">
                                    <div className="p-2 bg-purple-50 rounded-lg">
                                        <span className="material-symbols-outlined text-purple-600">public</span>
                                    </div>
                                </div>
                                <div className="mt-4">
                                    <h3 className="text-3xl font-black text-primary">NPR / NPT</h3>
                                    <p className="text-[10px] font-bold text-outline uppercase tracking-widest mt-1">Base Currency & Timezone</p>
                                </div>
                            </div>
                            
                            <div className="bg-white border border-outline-variant p-6 rounded-xl flex flex-col justify-between">
                                <div className="flex justify-between items-start">
                                    <div className="p-2 bg-orange-50 rounded-lg">
                                        <span className="material-symbols-outlined text-orange-600">admin_panel_settings</span>
                                    </div>
                                </div>
                                <div className="mt-4">
                                    <h3 className="text-3xl font-black text-primary">Strict</h3>
                                    <p className="text-[10px] font-bold text-outline uppercase tracking-widest mt-1">B2B Onboarding Mode</p>
                                </div>
                            </div>
                            
                            <div className="bg-primary p-6 rounded-xl flex flex-col justify-between text-white">
                                <div className="flex justify-between items-start">
                                    <div className="p-2 bg-zinc-800 rounded-lg">
                                        <span className="material-symbols-outlined text-secondary-container">terminal</span>
                                    </div>
                                    <span className="text-secondary-container font-mono-data text-[11px]">LATEST</span>
                                </div>
                                <div className="mt-4">
                                    <h3 className="text-3xl font-black">v2.4.0</h3>
                                    <p className="text-[10px] font-bold text-outline-variant uppercase tracking-widest mt-1">Production Release</p>
                                </div>
                            </div>
                        </div>

                        {/* Settings Console */}
                        <div className="bg-white border border-outline-variant rounded-xl flex min-h-[600px] overflow-hidden flex-col md:flex-row shadow-sm">
                            {/* Inner Sidebar */}
                            <div className="w-full md:w-72 border-b md:border-b-0 md:border-r border-surface-container bg-surface-container-lowest p-4">
                                <nav className="space-y-1">
                                    {(['General Preferences', 'Gateway Integrations', 'Security Policies', 'Billing & Subscriptions'] as SettingTabName[]).map((tabName) => (
                                        <button 
                                            key={tabName}
                                            onClick={() => setActiveTab(tabName)}
                                            className={`w-full text-left px-4 py-3 rounded-lg font-medium flex items-center transition-colors ${activeTab === tabName ? 'bg-surface-container text-primary font-bold shadow-sm' : 'text-on-surface-variant hover:bg-surface-container-low'}`}
                                        >
                                            <span className={`material-symbols-outlined mr-3 text-lg ${activeTab === tabName ? 'text-primary' : 'text-outline'}`}>
                                                {tabName === 'General Preferences' ? 'tune' : tabName === 'Gateway Integrations' ? 'api' : tabName === 'Security Policies' ? 'policy' : 'payments'}
                                            </span>
                                            {tabName}
                                        </button>
                                    ))}
                                </nav>
                            </div>

                            {/* Inner Content */}
                            <div className="flex-1 p-6 md:p-10 bg-white">
                                {renderTabContent()}
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}
