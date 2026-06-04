import React, { useEffect, useState } from 'react';
import { useNavigate, NavLink } from 'react-router-dom';

const UserDashboardPage: React.FC = () => {
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
            <div className="relative cursor-pointer p-2 hover:bg-[#e7eefe] rounded-full transition-colors">
              <span className="material-symbols-outlined text-[#53606c]">notifications</span>
              <span className="absolute top-2 right-2 w-2 h-2 bg-[#ba1a1a] rounded-full border-2 border-[#f9f9ff]"></span>
            </div>
            <div className="relative group ml-2">
              <div className="h-10 w-10 rounded-full overflow-hidden border border-[#c3c5d7] hover:scale-105 transition-transform cursor-pointer shadow-sm">
                <img
                  alt="User Profile Avatar"
                  className="w-full h-full object-cover"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuALan3Fe5liRYVvqOzbYPXALuhl1M_JrzKY62jsudutF-Y4kRwnw4no-RMdfy3kIqv1Pwvt4YNwLk09F8-YiOqLdcmDLbD8z8PfxNXA5LulAwItUiFnPDiM2CIPYIlitAQwvN0vTuDjaDgHGdcvqmtnQVICN825lJ_J6Gay2MKwe9QZ5j0m2TW3QgH9DIcW4nkj_-PRO8Ny3cmQDxAWN3MCHm9Grv2-ok3arYQPU0wypdDtdLrnEcUA0n9wYoUk0Nv28IHRfPR7qzs"
                />
              </div>
              <div className="absolute right-0 mt-2 w-48 bg-white shadow-xl rounded-xl border border-[#dce2f3] opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 py-2 z-[60]">
                <a
                  className="flex items-center gap-3 px-4 py-2 hover:bg-[#f0f3ff] text-[#151c27] text-[14px] font-medium transition-colors"
                  href="#"
                >
                  <span className="material-symbols-outlined text-[20px]">settings</span>
                  Settings
                </a>
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

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 md:px-10 py-8 pt-32">
        {/* Welcome Header */}
        <header className="flex flex-col md:flex-row md:items-center justify-between mb-12">
          <div>
            <h1 className="text-[32px] font-bold text-[#151c27] tracking-tight">
              Welcome to OmniBook, {fullName ? fullName : 'User'}!
            </h1>
            <p className="text-[#434654] text-[16px] mt-1 opacity-70">
              Manage your time and services effortlessly from one place.
            </p>
          </div>
          <button className="mt-6 md:mt-0 flex items-center gap-2 bg-[#10B981] hover:bg-[#059669] text-white px-8 py-3 rounded-xl font-bold transition-all shadow-md active:scale-95">
            <span
              className="material-symbols-outlined text-[20px]"
              style={{ fontVariationSettings: "'wght' 600" }}
            >
              add
            </span>
            Book New Appointment
          </button>
        </header>

        {/* Main Content (Empty State) */}
        <section className="mb-12">
          <div className="bg-[#d6e4f3]/30 border border-[#d6e4f3]/50 rounded-3xl p-8 md:p-32 flex flex-col items-center text-center shadow-[0_4px_20px_rgba(26,86,219,0.05)]">
            <div className="w-full max-w-[320px] mb-8 animate-pulse">
              <img
                alt="No events scheduled illustration"
                className="w-full h-auto"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuCxSpv5m26kB4mfkhV0RP0j4qvJnnrHGAoTiCif4ps2lq-qwEKNihpWoT0S_WGtRJDeupLj6Ya-bhIJCZNV10_4TVx6F--Ek_F_ZphFaUpeop3H3KtboQuxoUcXqzCTb5NLCJlBtvEFae91IJEwX_fmsexEcilNw2Mg7NofV7sBlWYuhTuT3QoJ5hRCxBmttSfzbyL9IQzGJ5ftn9Xx0tGk1yH3i4xTCzT0wcAsjxQoNEqY709G0uhnw-PZBdkTpivDscW1kxj78I8"
              />
            </div>
            <h2 className="text-[24px] font-semibold text-[#151c27] mb-4">
              You don't have any upcoming appointments yet.
            </h2>
            <p className="text-[#434654] max-w-lg mb-12 text-[18px]">
              Whether you need a checkup or a haircut, book your first slot in seconds. Explore professional services in your area.
            </p>
            <button className="bg-[#1a56db] text-white px-8 py-4 rounded-xl font-bold flex items-center gap-4 hover:brightness-110 transition-all shadow-lg shadow-[#1a56db]/20 group active:scale-95">
              Find a Service & Book Now
              <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">
                arrow_forward
              </span>
            </button>
          </div>
        </section>

        {/* Recent Appointments (Empty State) */}
        <section className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-[20px] font-medium text-[#151c27]">Recent Appointments</h3>
            <a className="text-[#003fb1] text-[14px] font-medium hover:underline" href="#">
              View all history
            </a>
          </div>
          <div className="w-full p-12 rounded-2xl border-2 border-dashed border-[#c3c5d7] bg-white/50 flex items-center justify-center transition-colors hover:bg-white/80 cursor-default">
            <div className="flex items-center gap-6 text-[#434654] opacity-60">
              <span className="material-symbols-outlined text-[32px]">history_edu</span>
              <p className="text-[16px] italic">
                Your past visits, statuses, and downloadable receipts will appear here.
              </p>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-[#e7eefe] w-full border-t border-[#c3c5d7]/10 mt-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 px-4 md:px-10 py-12 max-w-7xl mx-auto">
          <div className="flex flex-col gap-4">
            <span className="text-[20px] font-bold text-[#003fb1]">OmniBook</span>
            <p className="text-[#434654] text-[14px] font-medium max-w-xs opacity-70">
              Enterprise-grade scheduling simplified for your personal and professional needs.
            </p>
            <p className="text-[14px] font-medium text-[#434654] mt-6">
              © 2024 OmniBook Enterprise. All rights reserved.
            </p>
          </div>
          <div className="flex flex-col gap-4">
            <span className="text-[14px] font-bold text-[#151c27]">Quick Links</span>
            <div className="grid grid-cols-2 gap-2">
              <a className="text-[#434654] text-[14px] font-medium hover:underline hover:text-[#003fb1] transition-all" href="#">
                Resources
              </a>
              <a className="text-[#434654] text-[14px] font-medium hover:underline hover:text-[#003fb1] transition-all" href="#">
                Support
              </a>
              <a className="text-[#434654] text-[14px] font-medium hover:underline hover:text-[#003fb1] transition-all" href="#">
                Newsletter
              </a>
              <a className="text-[#434654] text-[14px] font-medium hover:underline hover:text-[#003fb1] transition-all" href="#">
                Privacy Policy
              </a>
            </div>
          </div>
          <div className="flex flex-col gap-4">
            <span className="text-[14px] font-bold text-[#151c27]">Stay Updated</span>
            <div className="flex gap-2">
              <input
                className="bg-white border border-[#c3c5d7] rounded-lg px-6 py-2 w-full text-[14px] font-medium focus:ring-2 focus:ring-[#1a56db]/20 focus:outline-none"
                placeholder="Enter email"
                type="email"
              />
              <button className="bg-[#1a56db] text-white px-6 py-2 rounded-lg text-[14px] font-medium active:scale-95 transition-transform">
                Join
              </button>
            </div>
            <div className="flex gap-6 mt-4">
              <span className="material-symbols-outlined text-[#3b4854] cursor-pointer hover:text-[#003fb1] transition-colors">
                public
              </span>
              <span className="material-symbols-outlined text-[#3b4854] cursor-pointer hover:text-[#003fb1] transition-colors">
                mail
              </span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default UserDashboardPage;
