import React, { useState, useEffect } from 'react';

// Empty initial array
const initialLogs: any[] = [];

import axios from 'axios';

export default function GlobalAuditLogs({ timeFilter }: { timeFilter?: string }) {
    const [logs, setLogs] = useState<any[]>(initialLogs);
    const [showAll, setShowAll] = useState(false);

    useEffect(() => {
        const fetchLogs = async () => {
            try {
                const token = localStorage.getItem('token');
                const url = timeFilter
                    ? `http://localhost:8080/api/v1/superadmin/audit-logs?timeFilter=${encodeURIComponent(timeFilter)}`
                    : 'http://localhost:8080/api/v1/superadmin/audit-logs';
                const res = await axios.get(url, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                
                const formattedLogs = res.data.map((log: any) => {
                    const date = new Date(log.timestamp);
                    const isToday = date.toDateString() === new Date().toDateString();
                    const timeString = `${isToday ? 'Today' : date.toLocaleDateString()} • ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
                    
                    let dotColor = 'bg-surface-container-highest';
                    let ringColor = '';
                    
                    const action = log.eventAction.toUpperCase();
                    if (action.includes('ERROR') || action.includes('FAILED') || action.includes('SUSPEND')) {
                        dotColor = 'bg-error';
                        ringColor = 'ring-error/30';
                    } else if (action.includes('SUCCESS') || action.includes('APPROVE') || action.includes('REACTIVATE')) {
                        dotColor = 'bg-green-500';
                        ringColor = 'ring-green-500/30';
                    } else if (action.includes('REGISTER') || action.includes('INVITE')) {
                        dotColor = 'bg-secondary-container';
                        ringColor = 'ring-secondary-container/30';
                    }

                    let messageText = log.eventAction;
                    if (log.user) {
                        messageText = `${log.user.email} (${log.user.role}): ${log.eventAction}`;
                    }

                    return {
                        id: log.id,
                        message: <>{messageText} <span className="font-bold text-[10px] text-on-surface-variant ml-1">IP: {log.sourceIp}</span></>,
                        time: timeString,
                        dotColor,
                        ringColor
                    };
                });
                
                setLogs(formattedLogs);
            } catch (error) {
                console.error("Failed to fetch global audit logs", error);
            }
        };

        fetchLogs();
        const interval = setInterval(fetchLogs, 15000); // refresh every 15 sec
        return () => clearInterval(interval);
    }, [timeFilter]);

    const displayedLogs = showAll ? logs : logs.slice(0, 4);

    return (
        <div className="lg:col-span-3 bg-surface-container-lowest rounded-xl border border-surface-container shadow-sm p-6 flex flex-col transition-all duration-500 relative">
            <div className="flex justify-between items-center mb-6 relative z-10">
                <h3 className="font-headline-md text-headline-md text-primary flex items-center gap-2">
                    Global Audit Logs
                    <span className="flex h-2 w-2 relative">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                    </span>
                </h3>
                <button 
                    onClick={() => setShowAll(!showAll)}
                    className="text-secondary font-label-md text-label-md hover:underline hover:text-primary transition-colors px-2 py-1 rounded hover:bg-surface-container-low whitespace-nowrap"
                >
                    {showAll ? 'View Less' : 'View All'}
                </button>
            </div>
            
            <div 
                className={`flex-1 space-y-4 overflow-y-auto custom-scrollbar transition-all duration-500 ${showAll ? 'max-h-[400px] pr-2' : 'max-h-auto'}`}
            >
                {displayedLogs.map((log, index) => (
                    <div 
                        key={log.id} 
                        className={`flex gap-4 items-start ${index !== displayedLogs.length - 1 ? 'pb-4 border-b border-surface-container' : ''} animate-in fade-in slide-in-from-top-2 duration-500`}
                    >
                        <div className={`mt-1.5 w-2.5 h-2.5 rounded-full ${log.dotColor} ${log.ringColor ? `ring-4 ${log.ringColor}` : ''} shrink-0`}></div>
                        <div>
                            <p className="font-body-md text-body-md text-primary leading-snug">
                                {log.message}
                            </p>
                            <p className="text-[11px] text-on-surface-variant mt-1.5 font-mono-data bg-surface-container-low inline-block px-2 py-0.5 rounded">
                                {log.time}
                            </p>
                        </div>
                    </div>
                ))}
            </div>
            
            {/* Optional bottom fade when not viewing all to hint there's more */}
            {!showAll && logs.length > 4 && (
                <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-surface-container-lowest to-transparent pointer-events-none rounded-b-xl"></div>
            )}
        </div>
    );
}
