import React, { useState, useEffect } from 'react';

const initialLogs = [
    {
        id: 1,
        message: <>Superadmin invited <span className="font-bold">Lalitpur Wellness Center</span></>,
        time: 'Today • 14:23:01',
        dotColor: 'bg-secondary-container',
        ringColor: 'ring-secondary-container/30'
    },
    {
        id: 2,
        message: <>System backup completed successfully.</>,
        time: 'Today • 03:00:00',
        dotColor: 'bg-surface-container-highest',
        ringColor: ''
    },
    {
        id: 3,
        message: <>Failed login attempt from <span className="font-bold">IP 192.168.1.12</span></>,
        time: 'Yesterday • 22:15:45',
        dotColor: 'bg-error',
        ringColor: 'ring-error/30'
    },
    {
        id: 4,
        message: <>Kantipath Clinic plan upgraded to <span className="font-bold">Pro</span></>,
        time: 'Yesterday • 18:42:10',
        dotColor: 'bg-secondary-container',
        ringColor: ''
    },
    {
        id: 5,
        message: <>Data export initiated by <span className="font-bold">Admin (TN-40291)</span></>,
        time: 'Yesterday • 15:30:22',
        dotColor: 'bg-surface-container-highest',
        ringColor: ''
    },
    {
        id: 6,
        message: <>Multiple failed API requests from <span className="font-bold">Gateway Node B</span></>,
        time: '2 days ago • 11:20:05',
        dotColor: 'bg-error',
        ringColor: 'ring-error/30'
    },
    {
        id: 7,
        message: <>Payment gateway credentials rotated successfully.</>,
        time: '3 days ago • 04:00:00',
        dotColor: 'bg-green-500',
        ringColor: 'ring-green-500/30'
    }
];

export default function GlobalAuditLogs() {
    const [logs, setLogs] = useState(initialLogs);
    const [showAll, setShowAll] = useState(false);

    // Simulate real-time incoming logs
    useEffect(() => {
        const interval = setInterval(() => {
            // 20% chance to generate a new log every 4 seconds
            if (Math.random() > 0.8) {
                const newId = Date.now();
                const now = new Date();
                const timeString = `Today • ${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;
                
                const possibleLogs = [
                    { msg: <>Health check passed for <span className="font-bold">Worker Node 3</span></>, dot: 'bg-green-500', ring: '' },
                    { msg: <>New admin user provisioned via API.</>, dot: 'bg-secondary-container', ring: 'ring-secondary-container/30' },
                    { msg: <>Warning: Elevated latency on <span className="font-bold">Database Cluster A</span></>, dot: 'bg-yellow-500', ring: 'ring-yellow-500/30' }
                ];
                const randomLog = possibleLogs[Math.floor(Math.random() * possibleLogs.length)];
                
                const newLog = {
                    id: newId,
                    message: randomLog.msg,
                    time: timeString,
                    dotColor: randomLog.dot,
                    ringColor: randomLog.ring
                };
                
                setLogs(prev => [newLog, ...prev]);
            }
        }, 4000);
        return () => clearInterval(interval);
    }, []);

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
