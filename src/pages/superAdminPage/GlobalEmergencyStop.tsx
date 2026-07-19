import React, { useState, useEffect, useRef } from 'react';
import './superAdmin.css';
import Sidebar from './components/Sidebar';
import TopNavigation from './components/TopNavigation';

export default function GlobalEmergencyStop() {
    const [confirmInput, setConfirmInput] = useState('');
    const [suspendApis, setSuspendApis] = useState(true);
    const [forceReadOnly, setForceReadOnly] = useState(true);
    const [globalTokenEviction, setGlobalTokenEviction] = useState(false);
    
    const isAuthorized = confirmInput === 'FORCE-LOCKDOWN';
    const logAreaRef = useRef<HTMLDivElement>(null);

    // Auto-scroll log area
    useEffect(() => {
        const interval = setInterval(() => {
            if (logAreaRef.current) {
                logAreaRef.current.scrollTop = logAreaRef.current.scrollHeight;
            }
        }, 3000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="superadmin-theme">
            <div className="bg-background text-on-surface font-body-md overflow-x-hidden min-h-screen flex relative">
                <Sidebar />
                <TopNavigation />

                {/* Main Wrapper */}
                <div className="flex-1 flex flex-col ml-[280px] pt-16 min-h-screen relative overflow-hidden">
                    {/* Scrollable Content Canvas */}
                    <main className="flex-1 overflow-y-auto bg-background p-gutter">
                        <div className="max-w-[1440px] mx-auto space-y-6">
                            {/* Page Header & Action */}
                            <div className="flex flex-col md:flex-row justify-between md:items-end gap-6 pb-4">
                                <div>
                                    <h1 className="font-headline-lg text-headline-lg text-primary flex items-center gap-3">
                                        Global Emergency Stop & System Lockdown
                                    </h1>
                                    <p className="text-on-surface-variant font-body-md mt-1 max-w-2xl">
                                        Root-level override to isolate infrastructure, revoke session keys, and suspend database operations. 
                                        Unauthorized use is logged and will trigger an immediate security audit.
                                    </p>
                                </div>
                                <div className="flex flex-col items-end gap-3">
                                    <span className="bg-error/10 text-error px-2 py-0.5 rounded text-label-md font-bold border border-error/20 whitespace-nowrap">LOCKED ACCESS</span>
                                    <button className="bg-primary hover:bg-error px-8 py-4 text-white font-black rounded-lg transition-all duration-300 transform hover:-translate-y-1 flex items-center justify-center gap-3 group">
                                        <span className="material-symbols-outlined text-white group-hover:animate-spin">security</span>
                                        <span className="tracking-widest uppercase">INITIATE SYSTEM LOCKDOWN</span>
                                    </button>
                                </div>
                            </div>

                            {/* Metric Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                                {/* Status Card */}
                                <div className="bg-white p-5 border border-outline-variant rounded-xl flex items-center gap-4 group hover:border-secondary transition-all">
                                    <div className="w-12 h-12 bg-secondary/10 flex items-center justify-center rounded-lg text-secondary group-hover:scale-110 transition-transform">
                                        <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>verified_user</span>
                                    </div>
                                    <div>
                                        <p className="font-label-md text-[10px] text-on-surface-variant uppercase tracking-widest leading-none mb-1">Current Platform State</p>
                                        <h3 className="font-headline-md text-headline-md text-secondary font-black">ACTIVE</h3>
                                    </div>
                                </div>

                                {/* Sessions Card */}
                                <div className="bg-white p-5 border border-outline-variant rounded-xl flex items-center gap-4 group hover:border-primary transition-all">
                                    <div className="w-12 h-12 bg-primary/5 flex items-center justify-center rounded-lg text-primary-fixed-dim group-hover:scale-110 transition-transform">
                                        <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>groups</span>
                                    </div>
                                    <div>
                                        <p className="font-label-md text-[10px] text-on-surface-variant uppercase tracking-widest leading-none mb-1">Total Concurrent Sessions</p>
                                        <h3 className="font-headline-md text-headline-md text-primary font-black">1,420 Live</h3>
                                    </div>
                                </div>

                                {/* DB Card */}
                                <div className="bg-white p-5 border border-outline-variant rounded-xl flex items-center gap-4 group hover:border-amber-500 transition-all">
                                    <div className="w-12 h-12 bg-amber-50 flex items-center justify-center rounded-lg text-amber-600 group-hover:scale-110 transition-transform">
                                        <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>local_fire_department</span>
                                    </div>
                                    <div>
                                        <p className="font-label-md text-[10px] text-on-surface-variant uppercase tracking-widest leading-none mb-1">Live Database Writes</p>
                                        <h3 className="font-headline-md text-headline-md text-amber-700 font-black">140 / sec</h3>
                                    </div>
                                </div>

                                {/* Circuit Card */}
                                <div className="bg-tertiary-container p-5 border border-primary-container rounded-xl flex items-center gap-4 group">
                                    <div className="w-12 h-12 bg-on-primary-fixed-variant/20 flex items-center justify-center rounded-lg text-on-primary group-hover:text-amber-400 transition-colors">
                                        <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>bolt</span>
                                    </div>
                                    <div>
                                        <p className="font-label-md text-[10px] text-on-tertiary-container uppercase tracking-widest leading-none mb-1">Circuit Breaker Status</p>
                                        <h3 className="font-headline-md text-headline-md text-white font-black">ARMED</h3>
                                    </div>
                                </div>
                            </div>

                            {/* Incident Command Console */}
                            <div className="bg-white border border-outline-variant rounded-2xl overflow-hidden grid grid-cols-1 lg:grid-cols-2">
                                {/* Left: Levers */}
                                <div className="p-6 md:p-10 border-b lg:border-b-0 lg:border-r border-outline-variant bg-surface-bright/50">
                                    <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
                                        <h2 className="font-headline-md text-headline-md text-primary">Circuit Breaker Levers</h2>
                                        <span className="bg-primary text-white font-mono-data text-[10px] px-2 py-0.5 rounded">MOD: MANUAL_OVERRIDE</span>
                                    </div>
                                    
                                    <div className="space-y-8">
                                        {/* Toggle 1 */}
                                        <div className="flex items-start gap-4">
                                            <div 
                                                className={`relative inline-flex h-6 w-12 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 mt-1 ${suspendApis ? 'bg-emerald-500' : 'bg-outline-variant'}`}
                                                onClick={() => setSuspendApis(!suspendApis)}
                                            >
                                                <span className={`${suspendApis ? 'translate-x-6' : 'translate-x-0'} pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}></span>
                                            </div>
                                            <div>
                                                <p className={`font-bold leading-none mb-1 flex items-center gap-2 ${suspendApis ? 'text-primary' : 'text-on-surface-variant'}`}>
                                                    Suspend Public APIs
                                                    <span className={`w-2 h-2 rounded-full ${suspendApis ? 'bg-emerald-500' : 'bg-outline-variant'}`}></span>
                                                </p>
                                                <p className="text-on-surface-variant font-body-md leading-relaxed">Instantly rejects new booking and registration requests from patients.</p>
                                            </div>
                                        </div>

                                        {/* Toggle 2 */}
                                        <div className="flex items-start gap-4">
                                            <div 
                                                className={`relative inline-flex h-6 w-12 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 mt-1 ${forceReadOnly ? 'bg-emerald-500' : 'bg-outline-variant'}`}
                                                onClick={() => setForceReadOnly(!forceReadOnly)}
                                            >
                                                <span className={`${forceReadOnly ? 'translate-x-6' : 'translate-x-0'} pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}></span>
                                            </div>
                                            <div>
                                                <p className={`font-bold leading-none mb-1 flex items-center gap-2 ${forceReadOnly ? 'text-primary' : 'text-on-surface-variant'}`}>
                                                    Force Database Read-Only
                                                    <span className={`w-2 h-2 rounded-full ${forceReadOnly ? 'bg-emerald-500' : 'bg-outline-variant'}`}></span>
                                                </p>
                                                <p className="text-on-surface-variant font-body-md leading-relaxed">Blocks all write operations across all clinic tenants to prevent data corruption.</p>
                                            </div>
                                        </div>

                                        {/* Toggle 3 */}
                                        <div className="flex items-start gap-4">
                                            <div 
                                                className={`relative inline-flex h-6 w-12 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 mt-1 ${globalTokenEviction ? 'bg-emerald-500' : 'bg-outline-variant'}`}
                                                onClick={() => setGlobalTokenEviction(!globalTokenEviction)}
                                            >
                                                <span className={`${globalTokenEviction ? 'translate-x-6' : 'translate-x-0'} pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}></span>
                                            </div>
                                            <div>
                                                <p className={`font-bold leading-none mb-1 flex items-center gap-2 ${globalTokenEviction ? 'text-primary' : 'text-on-surface-variant'}`}>
                                                    Global Token Eviction
                                                    <span className={`w-2 h-2 rounded-full ${globalTokenEviction ? 'bg-emerald-500' : 'bg-outline-variant'}`}></span>
                                                </p>
                                                <p className="text-on-surface-variant font-body-md leading-relaxed opacity-60">Mass-expires all active authentication tokens, forcing an immediate log-out for all users.</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Right: Broadcast & Confirmation */}
                                <div className="p-6 md:p-10 flex flex-col justify-between space-y-8">
                                    <div>
                                        <div className="flex items-center justify-between mb-4">
                                            <label className="font-bold text-primary uppercase text-[10px] tracking-widest">Global Maintenance Message Broadcast</label>
                                            <span className="material-symbols-outlined text-primary text-sm">edit</span>
                                        </div>
                                        <textarea 
                                            className="w-full bg-surface-container border border-outline-variant/30 rounded-xl p-4 font-mono-data text-on-surface text-sm focus:ring-primary focus:border-primary transition-all" 
                                            rows={4}
                                            defaultValue="OmniBook is currently undergoing emergency database optimization. Systems will return online momentarily."
                                        />
                                        <p className="text-on-surface-variant text-[11px] mt-2 italic">This message will be displayed globally on all client portals and patient apps.</p>
                                    </div>

                                    {/* Confirmation Box */}
                                    <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 space-y-4">
                                        <div className="flex items-center gap-3 text-amber-800">
                                            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>warning</span>
                                            <p className="font-bold text-label-md uppercase tracking-wide">Authorization Required</p>
                                        </div>
                                        <p className="text-amber-900/70 font-body-md">Confirm total infrastructure isolation. This action is irreversible via UI and requires CLI recovery.</p>
                                        
                                        <div>
                                            <label className="block text-[10px] uppercase font-bold text-amber-800 mb-1">Type 'FORCE-LOCKDOWN' to confirm authorization</label>
                                            <input 
                                                className="w-full bg-white border border-amber-300 rounded-lg px-4 py-3 font-mono-data text-primary focus:ring-2 focus:ring-amber-500 outline-none placeholder:text-amber-200 uppercase tracking-widest" 
                                                placeholder="Type here..." 
                                                type="text"
                                                value={confirmInput}
                                                onChange={(e) => setConfirmInput(e.target.value)}
                                            />
                                        </div>
                                        <button 
                                            className={`w-full py-3 text-white font-bold rounded-lg transition-colors ${isAuthorized ? 'bg-amber-600 hover:bg-amber-700 cursor-pointer animate-pulse' : 'bg-amber-600 opacity-50 cursor-not-allowed'}`}
                                        >
                                            LOCKDOWN AUTHORIZED
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Live Monitoring Stream */}
                            <div className="bg-tertiary-container rounded-2xl overflow-hidden p-6 border border-primary-container">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                        <span className="w-3 h-3 rounded-full bg-amber-500 animate-ping"></span>
                                        <h3 className="text-white font-bold uppercase tracking-widest text-[10px]">Real-time Root Security Log</h3>
                                    </div>
                                    <button className="text-on-tertiary-container hover:text-white transition-colors flex">
                                        <span className="material-symbols-outlined">download</span>
                                    </button>
                                </div>
                                <div ref={logAreaRef} className="bg-black/30 rounded-xl p-4 font-mono-data text-[12px] space-y-2 h-40 overflow-y-auto">
                                    <p className="text-on-tertiary-container"><span className="text-emerald-500">[14:22:01]</span> System.Status.Check: All nodes healthy. Primary DC-01 active.</p>
                                    <p className="text-on-tertiary-container"><span className="text-emerald-500">[14:22:04]</span> Auth.Service: Issued 14 new session tokens (Regional EU-WEST).</p>
                                    <p className="text-amber-400 font-bold"><span className="text-amber-500">[14:22:08]</span> Security.Monitor: Manual Access to Root Control Panel by user 'sysadmin_01'.</p>
                                    <p className="text-on-tertiary-container"><span className="text-emerald-500">[14:22:15]</span> Database.IO: Write frequency stabilized at 140/sec.</p>
                                    <p className="text-on-tertiary-container"><span className="text-emerald-500">[14:22:19]</span> Network.Shield: DDoS protection active. No threats detected.</p>
                                    <p className="text-on-tertiary-container opacity-50 italic animate-pulse">Waiting for telemetry data...</p>
                                </div>
                            </div>
                        </div>
                    </main>
                </div>
            </div>
            
            {/* Custom Animations specific to this page (merged into global CSS but accessible locally if needed) */}
            <style dangerouslySetInnerHTML={{__html: `
                .emergency-amber-pulse {
                    animation: pulse-amber 1.5s infinite;
                }
                @keyframes pulse-amber {
                    0% { border-color: rgba(245, 158, 11, 0.4); box-shadow: 0 0 0 0 rgba(245, 158, 11, 0.4); }
                    70% { border-color: rgba(245, 158, 11, 0.8); box-shadow: 0 0 0 8px rgba(245, 158, 11, 0); }
                    100% { border-color: rgba(245, 158, 11, 0.4); box-shadow: 0 0 0 0 rgba(245, 158, 11, 0); }
                }
            `}} />
        </div>
    );
}
