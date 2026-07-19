import { NavLink, useLocation, useNavigate } from 'react-router-dom';

export default function Sidebar() {
    const location = useLocation();
    const navigate = useNavigate();

    // Helper function to determine if a path is active
    const isActive = (path: string) => location.pathname === path;

    return (
        <aside className="flex flex-col h-screen w-sidebar-width fixed left-0 top-0 bg-primary-container z-50">
            {/* Brand Section */}
            <div className="p-gutter flex items-center gap-3">
                <div className="flex items-center justify-center">
                    <img 
                        alt="OmniBook Logo" 
                        className="object-contain h-[40px]"
                        src="https://lh3.googleusercontent.com/aida-public/AB6AXuANVa2DIMhxwJVhPP1FnM5XPZK669t-OaZbij7sEQY2BcRjKXoLi4Xlx3422j-PoJTMmPiR5Xs2jHyWkiOQbHG2PC_dwX1bTvLCKfZJr4xERFe5jC_Eg1nCXbH4JYQNcg8LmT7jvnS2rIU1qOMeCUzpati4NDHk55Jw4yD9q-c3RF-j48vJ6qqLiyYcMo90ZH-HOFSGJv14g2VG5oLaR8SvPRMAYcJZQSHy3gVOym_POA_776_joTMmbnqxiUzecB0QZUzztl5CrHw" 
                    />
                </div>
                <div>
                    <p className="font-label-md text-label-md text-on-primary-container opacity-70">Superadmin Console</p>
                </div>
            </div>
            
            {/* Navigation Tabs */}
            <nav className="flex-1 px-3 mt-4 space-y-1 overflow-y-auto custom-scrollbar">
                <NavLink 
                    to="/superadmin/dashboard" 
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg font-label-md text-label-md transition-colors duration-200 ${isActive('/superadmin/dashboard') ? 'text-surface-container-lowest bg-on-primary-fixed-variant border-l-4 border-secondary-container shadow-sm sidebar-active' : 'text-on-tertiary-container hover:text-surface-container-lowest hover:bg-on-primary-fixed-variant'}`}
                >
                    <span className="material-symbols-outlined" style={isActive('/superadmin/dashboard') ? { fontVariationSettings: "'FILL' 1" } : {}}>dashboard</span>
                    Dashboard
                </NavLink>
                
                {/* Active State for Tenant Management */}
                <NavLink 
                    to="/superadmin/tenants" 
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg font-label-md text-label-md transition-colors duration-200 ${isActive('/superadmin/tenants') ? 'text-surface-container-lowest bg-on-primary-fixed-variant border-l-4 border-secondary-container shadow-sm sidebar-active' : 'text-on-tertiary-container hover:text-surface-container-lowest hover:bg-on-primary-fixed-variant'}`}
                >
                    <span className="material-symbols-outlined" style={isActive('/superadmin/tenants') ? { fontVariationSettings: "'FILL' 1" } : {}}>hub</span>
                    Tenant Management
                </NavLink>
                
                <NavLink 
                    to="/superadmin/system-kpi" 
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg font-label-md text-label-md transition-colors duration-200 ${isActive('/superadmin/system-kpi') ? 'text-surface-container-lowest bg-on-primary-fixed-variant border-l-4 border-secondary-container shadow-sm sidebar-active' : 'text-on-tertiary-container hover:text-surface-container-lowest hover:bg-on-primary-fixed-variant'}`}
                >
                    <span className="material-symbols-outlined" style={isActive('/superadmin/system-kpi') ? { fontVariationSettings: "'FILL' 1" } : {}}>analytics</span>
                    System KPI
                </NavLink>
                
                <NavLink 
                    to="/superadmin/audit-logs" 
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg font-label-md text-label-md transition-colors duration-200 ${isActive('/superadmin/audit-logs') ? 'text-surface-container-lowest bg-on-primary-fixed-variant border-l-4 border-secondary-container shadow-sm sidebar-active' : 'text-on-tertiary-container hover:text-surface-container-lowest hover:bg-on-primary-fixed-variant'}`}
                >
                    <span className="material-symbols-outlined" style={isActive('/superadmin/audit-logs') ? { fontVariationSettings: "'FILL' 1" } : {}}>history</span>
                    Audit Logs
                </NavLink>
                
                <NavLink 
                    to="/superadmin/permissions" 
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg font-label-md text-label-md transition-colors duration-200 ${isActive('/superadmin/permissions') ? 'text-surface-container-lowest bg-on-primary-fixed-variant border-l-4 border-secondary-container shadow-sm sidebar-active' : 'text-on-tertiary-container hover:text-surface-container-lowest hover:bg-on-primary-fixed-variant'}`}
                >
                    <span className="material-symbols-outlined" style={isActive('/superadmin/permissions') ? { fontVariationSettings: "'FILL' 1" } : {}}>security</span>
                    Permissions
                </NavLink>
                
                <NavLink 
                    to="/superadmin/settings" 
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg font-label-md text-label-md transition-colors duration-200 ${isActive('/superadmin/settings') ? 'text-surface-container-lowest bg-on-primary-fixed-variant border-l-4 border-secondary-container shadow-sm sidebar-active' : 'text-on-tertiary-container hover:text-surface-container-lowest hover:bg-on-primary-fixed-variant'}`}
                >
                    <span className="material-symbols-outlined" style={isActive('/superadmin/settings') ? { fontVariationSettings: "'FILL' 1" } : {}}>settings</span>
                    Settings
                </NavLink>
            </nav>
            
            {/* Sidebar Footer Actions */}
            <div className="p-4 border-t border-on-primary-fixed-variant space-y-2">
                <button 
                    onClick={() => navigate('/superadmin/emergency-stop')}
                    className="w-full py-2.5 px-4 bg-error text-on-error font-label-md text-label-md rounded flex items-center justify-center gap-2 hover:brightness-110 active:scale-95 transition-all"
                >
                    <span className="material-symbols-outlined text-[18px]">emergency_home</span>
                    Global Emergency Stop
                </button>
            </div>
              {/* Bottom Navigation */}
            <nav className="px-3 py-4 mt-auto space-y-1">
                <NavLink 
                    to="/superadmin/support" 
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg font-label-md text-label-md transition-colors duration-200 ${isActive('/superadmin/support') ? 'text-surface-container-lowest bg-on-primary-fixed-variant border-l-4 border-secondary-container shadow-sm sidebar-active' : 'text-on-tertiary-container hover:text-surface-container-lowest hover:bg-on-primary-fixed-variant'}`}
                >
                    <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 0" }}>help_outline</span>
                    Support
                </NavLink>
                <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg font-label-md text-label-md text-on-tertiary-container hover:text-surface-container-lowest hover:bg-on-primary-fixed-variant transition-colors duration-200">
                    <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 0" }}>logout</span>
                    Sign Out
                </button>
            </nav>
        </aside>
    );
}
