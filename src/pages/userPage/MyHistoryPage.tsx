import React, { useEffect, useState } from 'react';
import { useNavigate, NavLink } from 'react-router-dom';
import NotificationBell from './NotificationBell';

const MyHistoryPage: React.FC = () => {
  const navigate = useNavigate();
  const [fullName, setFullName] = useState<string>('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');
    
    // Redirect if no token or role is not 'user'
    if (!token || role !== 'user') {
      navigate('/login');
    } else {
      const storedName = localStorage.getItem('fullName');
      if (storedName) {
        setFullName(storedName);
      }
    }
  }, [navigate]);

  const handleLogout = (e: React.MouseEvent) => {
    e.preventDefault();
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('fullName');
    navigate('/login');
  };

  return (
    <div className="bg-[#f9f9ff] text-[#151c27] font-sans antialiased min-h-screen flex flex-col">
      {/* TopNavBar (Fixed) */}
      <header className="fixed top-0 w-full z-50 bg-[#f9f9ff]/80 backdrop-blur-md shadow-sm border-b border-[#c3c5d7]/30">
        <div className="flex justify-between items-center px-4 md:px-10 h-20 max-w-7xl mx-auto">
          <div className="flex items-center gap-2">
            <img
              alt="OmniBook Logo"
              className="object-contain h-[40px]"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuANVa2DIMhxwJVhPP1FnM5XPZK669t-OaZbij7sEQY2BcRjKXoLi4Xlx3422j-PoJTMmPiR5Xs2jHyWkiOQbHG2PC_dwX1bTvLCKfZJr4xERFe5jC_Eg1nCXbH4JYQNcg8LmT7jvnS2rIU1qOMeCUzpati4NDHk55Jw4yD9q-c3RF-j48vJ6qqLiyYcMo90ZH-HOFSGJv14g2VG5oLaR8SvPRMAYcJZQSHy3gVOym_POA_776_joTMmbnqxiUzecB0QZUzztl5CrHw"
            />
          </div>
          <nav className="hidden md:flex items-center gap-8">
            <NavLink
              to="/dashboard"
              className={({ isActive }) => 
                `text-[16px] font-semibold pb-1 ${isActive ? 'text-[#003fb1] border-b-2 border-[#003fb1]' : 'text-[#53606c] hover:text-[#003fb1] transition-colors duration-200'}`
              }
            >
              Dashboard
            </NavLink>
            <NavLink
              to="/book-appointment"
              className={({ isActive }) => 
                `text-[16px] font-semibold pb-1 ${isActive ? 'text-[#003fb1] border-b-2 border-[#003fb1]' : 'text-[#53606c] hover:text-[#003fb1] transition-colors duration-200'}`
              }
            >
              Book Appointment
            </NavLink>
            <NavLink
              to="/my-history"
              className={({ isActive }) => 
                `text-[16px] font-semibold pb-1 ${isActive ? 'text-[#003fb1] border-b-2 border-[#003fb1]' : 'text-[#53606c] hover:text-[#003fb1] transition-colors duration-200'}`
              }
            >
              My History
            </NavLink>
          </nav>
          <div className="flex items-center gap-4">
            <NotificationBell />
            <div className="relative group ml-2">
              <div className="h-10 w-10 rounded-full overflow-hidden border border-[#c3c5d7] hover:scale-105 transition-transform cursor-pointer shadow-sm">
                <img
                  alt="User Profile Avatar"
                  className="w-full h-full object-cover"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuALan3Fe5liRYVvqOzbYPXALuhl1M_JrzKY62jsudutF-Y4kRwnw4no-RMdfy3kIqv1Pwvt4YNwLk09F8-YiOqLdcmDLbD8z8PfxNXA5LulAwItUiFnPDiM2CIPYIlitAQwvN0vTuDjaDgHGdcvqmtnQVICN825lJ_J6Gay2MKwe9QZ5j0m2TW3QgH9DIcW4nkj_-PRO8Ny3cmQDxAWN3MCHm9Grv2-ok3arYQPU0wypdDtdLrnEcUA0n9wYoUk0Nv28IHRfPR7qzs"
                />
              </div>
              <div className="absolute right-0 mt-2 w-48 bg-white shadow-xl rounded-xl border border-[#dce2f3] opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 py-2 z-[60]">
                <NavLink
                  className="flex items-center gap-3 px-4 py-2 hover:bg-[#f0f3ff] text-[#151c27] text-[14px] font-medium transition-colors"
                  to="/profile-settings"
                >
                  <span className="material-symbols-outlined text-[20px]">settings</span>
                  Settings
                </NavLink>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-3 px-4 py-2 hover:bg-[#ffdad6]/20 text-[#ba1a1a] text-[14px] font-medium transition-colors w-full text-left"
                >
                  <span className="material-symbols-outlined text-[20px]">logout</span>
                  Log Out
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 md:px-10 py-8 pt-32">
        {/* Header & Filters Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
            <div>
                <h1 className="text-[32px] font-bold text-on-background mb-1">Appointment History</h1>
                <p className="text-[16px] text-on-surface-variant">Review and manage your past service records.</p>
            </div>
            <div className="flex gap-4">
                <div className="relative min-w-[160px]">
                    <select
                        className="w-full appearance-none bg-surface border border-outline-variant rounded-xl px-6 py-4 font-medium text-[14px] focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all cursor-pointer">
                        <option value="7-days">7 days</option>
                        <option value="1-month">1 month</option>
                        <option value="3-months">3 months</option>
                        <option value="6-months">6 months</option>
                        <option value="lifetime">lifetime</option>
                    </select>
                    <span
                        className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-on-surface-variant">expand_more</span>
                </div>
                <div className="relative min-w-[160px]">
                    <select
                        className="w-full appearance-none bg-surface border border-outline-variant rounded-xl px-6 py-4 font-medium text-[14px] focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all cursor-pointer">
                        <option value="all">All</option>
                        <option value="upcoming">Upcoming</option>
                        <option value="completed">Completed</option>
                        <option value="cancelled">Cancelled</option>
                    </select>
                    <span
                        className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-on-surface-variant">expand_more</span>
                </div>
            </div>
        </div>

        {/* Cards Container */}
        <div className="grid grid-cols-1 gap-6">
            {/* Card 1: Upcoming */}
            <div className="flex justify-center items-center gap-6 mt-12 mb-6">
                <div className="h-[1px] w-full bg-outline-variant"></div><span
                    className="text-[12px] font-medium uppercase tracking-wider text-on-surface-variant whitespace-nowrap text-center">November
                    2024</span>
                <div className="h-[1px] w-full bg-outline-variant"></div>
            </div>
            <div
                className="bg-surface rounded-xl p-6 card-elevation transition-all hover:-translate-y-1 hover:shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-6 border border-white/50">
                <div className="flex items-start gap-6">
                    <div
                        className="flex flex-col items-center justify-center bg-primary-container/10 text-primary rounded-xl p-4 min-w-[80px]">
                        <span className="text-[12px] font-medium uppercase tracking-wider">Nov</span>
                        <span className="text-[24px] font-bold">12</span>
                        <span className="text-[12px] font-medium mt-1 opacity-80">10:00 AM</span>
                    </div>
                    <div className="space-y-1">
                        <div
                            className="inline-flex items-center px-4 py-0.5 rounded-full bg-secondary-container text-primary text-[12px] font-medium">
                            Upcoming
                        </div>
                        <h3 className="text-[20px] font-medium text-on-surface">Dr. Smith</h3>
                        <p className="text-[16px] text-on-surface-variant flex items-center gap-2">
                            <span className="material-symbols-outlined text-[18px]">medical_services</span> General Checkup
                        </p>
                    </div>
                </div>
                <div className="flex flex-wrap md:flex-nowrap items-center gap-6">
                    <a className="text-primary text-[14px] font-medium hover:underline flex items-center gap-2"
                        href="#">
                        <span className="material-symbols-outlined text-[18px]">download</span> Download Receipt
                    </a>
                    <button
                        className="px-8 py-4 border border-outline text-primary rounded-xl text-[14px] font-medium hover:bg-surface-container transition-colors">
                        View Detail
                    </button>
                    <button
                        className="px-8 py-4 bg-primary-container text-white rounded-xl text-[14px] font-medium hover:opacity-90 shadow-md transition-all">
                        Reschedule
                    </button>
                </div>
            </div>
            <div
                className="bg-surface rounded-xl p-6 card-elevation transition-all hover:-translate-y-1 hover:shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-6 border border-white/50">
                <div className="flex items-start gap-6">
                    <div
                        className="flex flex-col items-center justify-center bg-primary-container/10 text-primary rounded-xl p-4 min-w-[80px]">
                        <span className="text-[12px] font-medium uppercase tracking-wider">Nov</span>
                        <span className="text-[24px] font-bold">05</span>
                        <span className="text-[12px] font-medium mt-1 opacity-80">2:30 PM</span>
                    </div>
                    <div className="space-y-1">
                        <div
                            className="inline-flex items-center px-4 py-0.5 rounded-full bg-secondary-container text-primary text-[12px] font-medium">
                            Upcoming
                        </div>
                        <h3 className="text-[20px] font-medium text-on-surface">City Dental</h3>
                        <p className="text-[16px] text-on-surface-variant flex items-center gap-2">
                            <span className="material-symbols-outlined text-[18px]">dentistry</span> Routine Cleaning
                        </p>
                    </div>
                </div>
                <div className="flex flex-wrap md:flex-nowrap items-center gap-6">
                    <a className="text-primary text-[14px] font-medium hover:underline flex items-center gap-2"
                        href="#">
                        <span className="material-symbols-outlined text-[18px]">download</span> Download Receipt
                    </a>
                    <button
                        className="px-8 py-4 border border-outline text-primary rounded-xl text-[14px] font-medium hover:bg-surface-container transition-colors">
                        View Detail
                    </button>
                    <button
                        className="px-8 py-4 bg-primary-container text-white rounded-xl text-[14px] font-medium hover:opacity-90 shadow-md transition-all">
                        Reschedule
                    </button>
                </div>
            </div>

            {/* Card 2: Completed */}
            <div className="flex justify-center items-center gap-6 mt-12 mb-6">
                <div className="h-[1px] w-full bg-outline-variant"></div><span
                    className="text-[12px] font-medium uppercase tracking-wider text-on-surface-variant whitespace-nowrap text-center">October
                    2024</span>
                <div className="h-[1px] w-full bg-outline-variant"></div>
            </div>
            <div
                className="bg-surface rounded-xl p-6 card-elevation transition-all hover:-translate-y-1 hover:shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-6 border border-white/50">
                <div className="flex items-start gap-6">
                    <div
                        className="flex flex-col items-center justify-center bg-secondary-container/30 text-secondary rounded-xl p-4 min-w-[80px]">
                        <span className="text-[12px] font-medium uppercase tracking-wider">Oct</span>
                        <span className="text-[24px] font-bold">20</span>
                        <span className="text-[12px] font-medium mt-1 opacity-80">11:15 AM</span>
                    </div>
                    <div className="space-y-1">
                        <div
                            className="inline-flex items-center px-4 py-0.5 rounded-full bg-tertiary-fixed text-on-tertiary-fixed-variant text-[12px] font-medium">
                            Completed
                        </div>
                        <h3 className="text-[20px] font-medium text-on-surface">Elite Salon</h3>
                        <p className="text-[16px] text-on-surface-variant flex items-center gap-2">
                            <span className="material-symbols-outlined text-[18px]">content_cut</span> Hair Styling
                        </p>
                    </div>
                </div>
                <div className="flex flex-wrap md:flex-nowrap items-center gap-6">
                    <a className="text-primary text-[14px] font-medium hover:underline flex items-center gap-2"
                        href="#">
                        <span className="material-symbols-outlined text-[18px]">download</span> Download Receipt
                    </a>
                    <button
                        className="px-8 py-4 border border-outline text-primary rounded-xl text-[14px] font-medium hover:bg-surface-container transition-colors">
                        View Detail
                    </button>
                    <button
                        className="px-8 py-4 bg-primary-container text-white rounded-xl text-[14px] font-medium hover:opacity-90 shadow-md transition-all">
                        Book Again
                    </button>
                </div>
            </div>
            <div
                className="bg-surface rounded-xl p-6 card-elevation transition-all hover:-translate-y-1 hover:shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-6 border border-white/50">
                <div className="flex items-start gap-6">
                    <div
                        className="flex flex-col items-center justify-center bg-secondary-container/30 text-secondary rounded-xl p-4 min-w-[80px]">
                        <span className="text-[12px] font-medium uppercase tracking-wider">Oct</span>
                        <span className="text-[24px] font-bold">12</span>
                        <span className="text-[12px] font-medium mt-1 opacity-80">4:00 PM</span>
                    </div>
                    <div className="space-y-1">
                        <div
                            className="inline-flex items-center px-4 py-0.5 rounded-full bg-tertiary-fixed text-on-tertiary-fixed-variant text-[12px] font-medium">
                            Completed
                        </div>
                        <h3 className="text-[20px] font-medium text-on-surface">Tech Support Hub</h3>
                        <p className="text-[16px] text-on-surface-variant flex items-center gap-2">
                            <span className="material-symbols-outlined text-[18px]">laptop_mac</span> Laptop Repair
                        </p>
                    </div>
                </div>
                <div className="flex flex-wrap md:flex-nowrap items-center gap-6">
                    <a className="text-primary text-[14px] font-medium hover:underline flex items-center gap-2"
                        href="#">
                        <span className="material-symbols-outlined text-[18px]">download</span> Download Receipt
                    </a>
                    <button
                        className="px-8 py-4 border border-outline text-primary rounded-xl text-[14px] font-medium hover:bg-surface-container transition-colors">
                        View Detail
                    </button>
                    <button
                        className="px-8 py-4 bg-primary-container text-white rounded-xl text-[14px] font-medium hover:opacity-90 shadow-md transition-all">
                        Book Again
                    </button>
                </div>
            </div>

            {/* Card 3: Cancelled */}
            <div className="flex justify-center items-center gap-6 mt-12 mb-6">
                <div className="h-[1px] w-full bg-outline-variant"></div><span
                    className="text-[12px] font-medium uppercase tracking-wider text-on-surface-variant whitespace-nowrap text-center">September
                    2024</span>
                <div className="h-[1px] w-full bg-outline-variant"></div>
            </div>
            <div
                className="bg-surface rounded-xl p-6 card-elevation transition-all hover:-translate-y-1 hover:shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-6 border border-white/50 opacity-80">
                <div className="flex items-start gap-6">
                    <div
                        className="flex flex-col items-center justify-center bg-surface-container-highest text-on-surface-variant rounded-xl p-4 min-w-[80px]">
                        <span className="text-[12px] font-medium uppercase tracking-wider">Sep</span>
                        <span className="text-[24px] font-bold">15</span>
                        <span className="text-[12px] font-medium mt-1 opacity-80">9:00 AM</span>
                    </div>
                    <div className="space-y-1">
                        <div
                            className="inline-flex items-center px-4 py-0.5 rounded-full bg-surface-variant text-on-surface-variant text-[12px] font-medium">
                            Cancelled
                        </div>
                        <h3 className="text-[20px] font-medium text-on-surface">Central Bureau</h3>
                        <p className="text-[16px] text-on-surface-variant flex items-center gap-2">
                            <span className="material-symbols-outlined text-[18px]">description</span> License Renewal
                        </p>
                    </div>
                </div>
                <div className="flex flex-wrap md:flex-nowrap items-center gap-6">
                    <button
                        className="px-8 py-4 border border-outline text-primary rounded-xl text-[14px] font-medium hover:bg-surface-container transition-colors">
                        View Detail
                    </button>
                    <button
                        className="px-8 py-4 bg-primary-container text-white rounded-xl text-[14px] font-medium hover:opacity-90 shadow-md transition-all">
                        Book Again
                    </button>
                </div>
            </div>
        </div>

        {/* Pagination Footer */}
        <div className="mt-12 flex items-center gap-6">
            <nav className="flex items-center gap-4 text-[14px] font-medium text-on-surface-variant">
                <button
                    className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-surface-container-high transition-colors">
                    <span className="material-symbols-outlined">chevron_left</span>
                </button>
                <span className="text-on-surface font-medium">Page 1 of 5</span>
                <button
                    className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-surface-container-high transition-colors">
                    <span className="material-symbols-outlined">chevron_right</span>
                </button>
            </nav>
        </div>
      </main>
    </div>
  );
};

export default MyHistoryPage;
