import React, { useEffect, useState } from 'react';
import { useNavigate, NavLink } from 'react-router-dom';
import NotificationBell from '../userPage/NotificationBell';

const ProviderDashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const [fullName, setFullName] = useState<string>('Provider');

  useEffect(() => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');

    // Redirect if no token or role is not 'service_provider'
    if (!token || role !== 'service_provider') {
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
    <div className="bg-[#F3F4F6] text-[#151c27] font-sans min-h-screen flex">
      {/* TopNavBar */}
      <header className="fixed top-0 w-full z-50 bg-[#f9f9ff]/80 backdrop-blur-md shadow-sm border-b border-[#c3c5d7]/30">
        <div className="flex justify-between items-center px-4 md:px-10 h-20 w-full">
          <div className="flex items-center gap-4">
            <img
              alt="OmniBook Logo"
              className="object-contain h-[40px]"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuANVa2DIMhxwJVhPP1FnM5XPZK669t-OaZbij7sEQY2BcRjKXoLi4Xlx3422j-PoJTMmPiR5Xs2jHyWkiOQbHG2PC_dwX1bTvLCKfZJr4xERFe5jC_Eg1nCXbH4JYQNcg8LmT7jvnS2rIU1qOMeCUzpati4NDHk55Jw4yD9q-c3RF-j48vJ6qqLiyYcMo90ZH-HOFSGJv14g2VG5oLaR8SvPRMAYcJZQSHy3gVOym_POA_776_joTMmbnqxiUzecB0QZUzztl5CrHw"
            />
            <div className="h-6 w-[1px] bg-[#c3c5d7]/30 mx-2 hidden md:block"></div>
            <span className="text-[#53606c] font-medium hidden md:block">Operations Center</span>
          </div>
          <div className="flex items-center gap-4">
            <NotificationBell />

            <div className="hidden lg:flex flex-col items-end mr-2">
              <span className="text-[14px] font-bold text-[#003fb1]">{fullName}</span>
              <span className="text-[12px] text-[#53606c]">Service Provider</span>
            </div>

            <div className="ml-2">
              <div className="h-10 w-10 rounded-full overflow-hidden border border-[#c3c5d7] shadow-sm">
                <img
                  alt="User Profile Avatar"
                  className="w-full h-full object-cover"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuALan3Fe5liRYVvqOzbYPXALuhl1M_JrzKY62jsudutF-Y4kRwnw4no-RMdfy3kIqv1Pwvt4YNwLk09F8-YiOqLdcmDLbD8z8PfxNXA5LulAwItUiFnPDiM2CIPYIlitAQwvN0vTuDjaDgHGdcvqmtnQVICN825lJ_J6Gay2MKwe9QZ5j0m2TW3QgH9DIcW4nkj_-PRO8Ny3cmQDxAWN3MCHm9Grv2-ok3arYQPU0wypdDtdLrnEcUA0n9wYoUk0Nv28IHRfPR7qzs"
                />
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* SideNavBar */}
      <nav className="fixed left-0 top-20 h-[calc(100vh-80px)] w-64 bg-[#f0f3ff] border-r border-[#c3c5d7]/30 py-6 px-4 flex flex-col gap-2 z-40 hidden md:flex">
        <div className="mb-4 px-4">
          <div className="flex items-center gap-4">
            <span className="material-symbols-outlined text-[#003fb1]" style={{ fontVariationSettings: "'FILL' 1" }}>
              dashboard
            </span>
            <span className="text-[24px] text-[#003fb1] font-bold">Portal</span>
          </div>
        </div>
        <NavLink to="/provider-dashboard" className={({ isActive }) => `flex items-center gap-2 px-3 py-2.5 text-[13px] font-medium rounded-lg transition-all ${isActive ? 'text-[#003fb1] bg-[#1a56db]/10' : 'text-[#3b4854] hover:bg-[#d6e4f3]'}`}>
          <span className="material-symbols-outlined text-[18px]">dashboard</span>
          Dashboard
        </NavLink>
        <NavLink to="/master-calendar" className={({ isActive }) => `flex items-center gap-2 px-3 py-2.5 text-[13px] font-medium rounded-lg transition-all ${isActive ? 'text-[#003fb1] bg-[#1a56db]/10' : 'text-[#3b4854] hover:bg-[#d6e4f3]'}`}>
          <span className="material-symbols-outlined text-[18px]">calendar_month</span>
          Master Calendar
        </NavLink>
        <NavLink to="/patients" className={({ isActive }) => `flex items-center gap-2 px-3 py-2.5 text-[13px] font-medium rounded-lg transition-all ${isActive ? 'text-[#003fb1] bg-[#1a56db]/10' : 'text-[#3b4854] hover:bg-[#d6e4f3]'}`}>
          <span className="material-symbols-outlined text-[18px]">group</span>
          Patients/Clients
        </NavLink>
        <NavLink to="/services" className={({ isActive }) => `flex items-center gap-2 px-3 py-2.5 text-[13px] font-medium rounded-lg transition-all ${isActive ? 'text-[#003fb1] bg-[#1a56db]/10' : 'text-[#3b4854] hover:bg-[#d6e4f3]'}`}>
          <span className="material-symbols-outlined text-[18px]">medical_services</span>
          Services Manager
        </NavLink>
        <NavLink to="/analytics" className={({ isActive }) => `flex items-center gap-2 px-3 py-2.5 text-[13px] font-medium rounded-lg transition-all ${isActive ? 'text-[#003fb1] bg-[#1a56db]/10' : 'text-[#3b4854] hover:bg-[#d6e4f3]'}`}>
          <span className="material-symbols-outlined text-[18px]">bar_chart</span>
          Revenue & Analytics
        </NavLink>

        <div className="mt-auto flex flex-col gap-1">
          <NavLink to="/profile-settings" className={({ isActive }) => `flex items-center gap-2 px-3 py-2.5 text-[13px] font-medium rounded-lg transition-all ${isActive ? 'text-[#003fb1] bg-[#1a56db]/10' : 'text-[#3b4854] hover:bg-[#d6e4f3]'}`}>
            <span className="material-symbols-outlined text-[18px]">settings</span>
            Settings
          </NavLink>
          <button onClick={handleLogout} className="flex items-center gap-2 px-3 py-2.5 text-[13px] font-medium rounded-lg transition-all text-[#ba1a1a] hover:bg-[#ffdad6]/20 text-left">
            <span className="material-symbols-outlined text-[18px]">logout</span>
            Log Out
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <main className="pt-24 pb-20 md:ml-64 px-4 md:px-10 min-h-screen w-full">
        {/* Header Module */}
        <section className="flex flex-col md:flex-row md:items-center justify-between mb-12 gap-6">
          <div>
            <h1 className="text-[32px] text-[#151c27] font-bold tracking-tight">Operations Dashboard</h1>
            <p className="text-[16px] text-[#53606c] mt-1">Tuesday, June 9, 2026</p>
          </div>
          <button className="bg-[#1a56db] text-white font-bold px-8 py-4 rounded-xl flex items-center gap-2 shadow-lg active:scale-95 transition-transform">
            <span className="material-symbols-outlined">add</span>
            <span>Create New Booking</span>
          </button>
        </section>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-[#003fb1]">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-[12px] text-[#53606c] uppercase tracking-wider">Today's Schedule</p>
                <h2 className="text-[48px] font-bold text-[#003fb1] mt-1 leading-tight">12/15</h2>
                <p className="text-[14px] text-[#434654] mt-1">Slots Booked</p>
              </div>
              <span className="material-symbols-outlined text-[#1a56db] bg-[#dbe1ff] p-4 rounded-lg">event_available</span>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-[#006f4b]">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-[12px] text-[#53606c] uppercase tracking-wider">Today's Est. Revenue</p>
                <h2 className="text-[48px] font-bold text-[#005438] mt-1 leading-tight">रू 18,500</h2>
                <p className="text-[14px] text-[#434654] mt-1">85% of Daily Target</p>
              </div>
              <span className="material-symbols-outlined text-[#68f5b8] bg-[#6ffbbe] p-4 rounded-lg">payments</span>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-[#ba1a1a]">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-[12px] text-[#53606c] uppercase tracking-wider">New Requests</p>
                <h2 className="text-[48px] font-bold text-[#ba1a1a] mt-1 leading-tight">4</h2>
                <p className="text-[14px] text-[#434654] mt-1">Awaiting Approval</p>
              </div>
              <span className="material-symbols-outlined text-[#93000a] bg-[#ffdad6] p-4 rounded-lg">notification_important</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Timeline View Card */}
          <div className="lg:col-span-8 bg-white rounded-xl shadow-sm p-6 flex flex-col h-full">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-[20px] font-bold text-[#151c27]">Today's Schedule</h3>
              <div className="flex gap-2">
                <button className="p-2 hover:bg-[#dce2f3] rounded-full material-symbols-outlined transition-colors">chevron_left</button>
                <button className="p-2 hover:bg-[#dce2f3] rounded-full material-symbols-outlined transition-colors">chevron_right</button>
              </div>
            </div>

            <div className="flex-grow flex flex-col gap-4 overflow-y-auto max-h-[600px] pr-2">
              {/* Timeline Item 1 */}
              <div className="flex gap-6 group">
                <div className="flex flex-col items-center">
                  <span className="text-[14px] text-[#53606c] font-bold w-16 text-right">9:00 AM</span>
                  <div className="w-[2px] h-full bg-[#c3c5d7]/30 my-2"></div>
                </div>
                <div className="flex-grow bg-white/90 backdrop-blur-md border border-[#c3c5d7]/30 shadow-[0_4px_20px_rgba(26,86,219,0.05)] rounded-xl p-6 mb-4 flex justify-between items-center transition-all group-hover:translate-x-1">
                  <div>
                    <h4 className="text-[20px] font-bold text-[#151c27]">Alexander Mitchell</h4>
                    <p className="text-[14px] text-[#53606c] flex items-center gap-2 mt-1">
                      <span className="material-symbols-outlined text-[18px]">medical_services</span> General Consultation
                    </p>
                  </div>
                  <div className="flex items-center gap-6">
                    <span className="bg-[#1a56db]/10 text-[#003fb1] px-4 py-1.5 rounded-full text-[12px] font-bold flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-[#003fb1]"></span> Confirmed
                    </span>
                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="px-3 py-1.5 hover:bg-[#1a56db] hover:text-white rounded-lg transition-colors border border-[#003fb1] text-[#003fb1] font-bold text-xs">Reschedule</button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Timeline Item 2 */}
              <div className="flex gap-6 group">
                <div className="flex flex-col items-center">
                  <span className="text-[14px] text-[#53606c] font-bold w-16 text-right">10:00 AM</span>
                  <div className="w-[2px] h-full bg-[#c3c5d7]/30 my-2"></div>
                </div>
                <div className="flex-grow bg-white/90 backdrop-blur-md border border-[#c3c5d7]/30 shadow-[0_4px_20px_rgba(26,86,219,0.05)] rounded-xl p-6 mb-4 flex justify-between items-center transition-all group-hover:translate-x-1 border-l-4 border-l-[#006f4b]">
                  <div>
                    <h4 className="text-[20px] font-bold text-[#151c27]">Sarah Jenkins</h4>
                    <p className="text-[14px] text-[#53606c] flex items-center gap-2 mt-1">
                      <span className="material-symbols-outlined text-[18px]">dentistry</span> Dental Cleaning
                    </p>
                  </div>
                  <div className="flex items-center gap-6">
                    <span className="bg-[#10B981]/10 text-[#10B981] px-4 py-1.5 rounded-full text-[12px] font-bold flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse"></span> In-Progress
                    </span>
                    <button className="bg-[#006f4b] text-white px-4 py-2 rounded-lg font-bold text-xs hover:shadow-md transition-all">Mark Complete</button>
                  </div>
                </div>
              </div>

              {/* Timeline Item 3 */}
              <div className="flex gap-6 group">
                <div className="flex flex-col items-center">
                  <span className="text-[14px] text-[#53606c] font-bold w-16 text-right">11:30 AM</span>
                  <div className="w-[2px] h-full bg-[#c3c5d7]/30 my-2"></div>
                </div>
                <div className="flex-grow bg-white/90 backdrop-blur-md border border-[#c3c5d7]/30 shadow-[0_4px_20px_rgba(26,86,219,0.05)] rounded-xl p-6 mb-4 flex justify-between items-center transition-all group-hover:translate-x-1">
                  <div>
                    <h4 className="text-[20px] font-bold text-[#151c27]">Michael Chen</h4>
                    <p className="text-[14px] text-[#53606c] flex items-center gap-2 mt-1">
                      <span className="material-symbols-outlined text-[18px]">history</span> Follow-up
                    </p>
                  </div>
                  <div className="flex items-center gap-6">
                    <span className="bg-[#dce2f3] text-[#434654] px-4 py-1.5 rounded-full text-[12px] font-bold">Scheduled</span>
                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="p-2 hover:bg-[#ba1a1a]/10 text-[#ba1a1a] rounded-lg transition-colors material-symbols-outlined" title="Cancel Appointment">close</button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Timeline Item Empty Slot */}
              <div className="flex gap-6 group">
                <div className="flex flex-col items-center">
                  <span className="text-[14px] text-[#53606c] font-bold w-16 text-right">12:30 PM</span>
                  <div className="w-[2px] h-full bg-[#c3c5d7]/30 my-2"></div>
                </div>
                <div className="flex-grow border-2 border-dashed border-[#c3c5d7] rounded-xl p-6 mb-4 flex justify-center items-center hover:bg-[#f9f9ff] transition-colors cursor-pointer">
                  <span className="text-[14px] text-[#53606c] group-hover:text-[#003fb1] transition-colors flex items-center gap-2 font-medium">
                    <span className="material-symbols-outlined">add_circle</span> Available Slot
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Urgent Actions Panel */}
          <div className="lg:col-span-4 flex flex-col gap-6">
            {/* Awaiting Approval */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#ba1a1a]">pending_actions</span>
                  <h3 className="text-[20px] font-bold text-[#151c27]">Awaiting Approval</h3>
                </div>
                <button className="text-[12px] font-bold text-[#003fb1] hover:underline">View All</button>
              </div>
              <div className="space-y-4">
                {/* Request 1 */}
                <div className="p-4 bg-[#f0f3ff] rounded-lg border border-[#c3c5d7]/50">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h5 className="text-[14px] font-bold text-[#151c27]">Elena Rodriguez</h5>
                      <p className="text-[12px] text-[#53606c]">Cardiology Exam</p>
                    </div>
                    <span className="text-[12px] font-bold text-[#003fb1]">2:00 PM</span>
                  </div>
                  <div className="flex gap-2 mt-4">
                    <button className="flex-1 bg-[#003fb1] text-white py-2 rounded-lg font-bold text-xs hover:bg-[#1a56db] transition-colors">Approve</button>
                    <button className="flex-1 border border-[#737686] text-[#53606c] py-2 rounded-lg font-bold text-xs hover:bg-[#dce2f3] transition-colors">Decline</button>
                  </div>
                </div>

                {/* Request 2 */}
                <div className="p-4 bg-[#f0f3ff] rounded-lg border border-[#c3c5d7]/50">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h5 className="text-[14px] font-bold text-[#151c27]">David Park</h5>
                      <p className="text-[12px] text-[#53606c]">Consultation</p>
                    </div>
                    <span className="text-[12px] font-bold text-[#003fb1]">4:30 PM</span>
                  </div>
                  <div className="flex gap-2 mt-4">
                    <button className="flex-1 bg-[#003fb1] text-white py-2 rounded-lg font-bold text-xs hover:bg-[#1a56db] transition-colors">Approve</button>
                    <button className="flex-1 border border-[#737686] text-[#53606c] py-2 rounded-lg font-bold text-xs hover:bg-[#dce2f3] transition-colors">Decline</button>
                  </div>
                </div>
              </div>
            </div>

            {/* Missed/No-Shows */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-[20px] font-bold text-[#151c27] mb-6">Yesterday's Missed</h3>
              <div className="p-4 bg-[#ffdad6]/30 border border-[#ba1a1a]/20 rounded-lg flex items-center justify-between">
                <div>
                  <h5 className="text-[14px] font-bold text-[#93000a]">Liam Thompson</h5>
                  <p className="text-[12px] text-[#53606c] mt-1">Missing since 08/06 4:00 PM</p>
                </div>
                <button className="bg-[#ba1a1a] text-white px-4 py-2 rounded-lg font-bold text-xs shadow-sm active:scale-95 transition-all">Mark as No-Show</button>
              </div>
            </div>

            {/* Mini Analytics Card */}
            <div className="bg-[#1a56db] rounded-xl shadow-lg p-6 text-white relative overflow-hidden">
              <div className="relative z-10">
                <p className="text-[12px] opacity-80 uppercase tracking-widest mb-1">Clinic Performance</p>
                <h4 className="text-[24px] font-bold mb-6">Peak Productivity</h4>
                <div className="flex items-end gap-2">
                  <div className="w-8 h-12 bg-white/20 rounded-t-sm"></div>
                  <div className="w-8 h-16 bg-white/40 rounded-t-sm"></div>
                  <div className="w-8 h-24 bg-white/60 rounded-t-sm"></div>
                  <div className="w-8 h-32 bg-white rounded-t-sm"></div>
                </div>
              </div>
              <span className="material-symbols-outlined absolute -right-4 -bottom-4 text-[120px] opacity-10 rotate-12">trending_up</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ProviderDashboardPage;
