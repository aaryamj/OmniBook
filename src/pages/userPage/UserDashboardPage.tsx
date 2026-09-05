import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import UserTopNavigation from './components/UserTopNavigation';
import { QRCodeSVG } from 'qrcode.react';

const UserDashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const [fullName, setFullName] = useState<string>('');
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');
    
    // Redirect if no token or role is not 'user'
    if (!token || role !== 'user') {
      navigate('/login');
      return;
    } 
    
    const storedName = localStorage.getItem('fullName');
    if (storedName) {
      setFullName(storedName);
    }

    fetchAppointments(token);
  }, [navigate]);

  const fetchAppointments = async (token: string) => {
    try {
      setLoading(true);
      const res = await fetch('http://localhost:8080/api/v1/user/appointments', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        setAppointments(data.appointments || []);
      }
    } catch (e) {
      console.error("Failed to load appointments", e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#f9f9ff] text-[#151c27] font-sans antialiased min-h-screen flex flex-col">
      {/* TopNavBar */}
      <UserTopNavigation />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 md:px-10 py-6 sm:py-8 pt-24 sm:pt-28">
        {/* Welcome Header */}
        <header className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 sm:mb-12 gap-4">
          <div>
            <h1 className="text-2xl sm:text-[32px] font-bold text-[#151c27] tracking-tight">
              Welcome to OmniBook, {fullName ? fullName : 'User'}!
            </h1>
            <p className="text-[#434654] text-sm sm:text-[16px] mt-1 opacity-70">
              Manage your time and services effortlessly from one place.
            </p>
          </div>
          <button 
            onClick={() => navigate('/book-appointment')}
            className="w-full sm:w-auto flex items-center justify-center gap-2 bg-[#10B981] hover:bg-[#059669] text-white px-6 sm:px-8 py-3 rounded-xl font-bold transition-all shadow-md active:scale-95 cursor-pointer text-sm sm:text-base"
          >
            <span
              className="material-symbols-outlined text-[20px]"
              style={{ fontVariationSettings: "'wght' 600" }}
            >
              add
            </span>
            Book New Appointment
          </button>
        </header>

        {/* Main Content (Upcoming Appointments) */}
        <section className="mb-12">
          {loading ? (
            <div className="flex justify-center py-20">
              <div className="w-10 h-10 border-4 border-[#003fb1] border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : appointments.filter(a => ['SCHEDULED', 'CHECKED_IN', 'PENDING_APPROVAL'].includes(a.appointmentStatus)).length === 0 ? (
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
              <button 
                onClick={() => navigate('/book-appointment')}
                className="bg-[#1a56db] text-white px-8 py-4 rounded-xl font-bold flex items-center gap-4 hover:brightness-110 transition-all shadow-lg shadow-[#1a56db]/20 group active:scale-95">
                Find a Service & Book Now
                <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">
                  arrow_forward
                </span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {appointments.filter(a => ['SCHEDULED', 'CHECKED_IN', 'PENDING_APPROVAL'].includes(a.appointmentStatus)).map((appointment) => (
                <div key={appointment.id} className="bg-white rounded-3xl p-6 shadow-[0_8px_30px_rgba(0,0,0,0.04)] border border-[#e2e8f0] flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-xl font-bold text-[#151c27] mb-1">{appointment.serviceName}</h3>
                        <div className="flex items-center gap-3 mt-3">
                          <div className="w-10 h-10 rounded-full overflow-hidden border border-[#e2e8f0] bg-gray-100 flex-shrink-0 flex items-center justify-center">
                            {appointment.doctorProfilePicture ? (
                              <img src={appointment.doctorProfilePicture} alt="Doctor" className="w-full h-full object-cover" />
                            ) : (
                              <span className="material-symbols-outlined text-gray-400">person</span>
                            )}
                          </div>
                          <div>
                            <p className="text-[#151c27] font-semibold text-sm">{appointment.doctorName || 'Unknown Doctor'}</p>
                            <p className="text-[#53606c] text-xs">{appointment.doctorSpecialty || 'Specialist'}</p>
                          </div>
                        </div>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                        appointment.appointmentStatus === 'CHECKED_IN' ? 'bg-green-100 text-green-700' :
                        appointment.appointmentStatus === 'COMPLETED' ? 'bg-blue-100 text-blue-700' :
                        appointment.appointmentStatus === 'CANCELLED' ? 'bg-red-100 text-red-700' :
                        appointment.appointmentStatus === 'PENDING_APPROVAL' ? 'bg-blue-100 text-blue-700' :
                        'bg-orange-100 text-orange-700'
                      }`}>
                        {appointment.appointmentStatus === 'PENDING_APPROVAL' ? 'Awaiting Approval' : appointment.appointmentStatus}
                      </span>
                    </div>
                    <div className="mb-6 bg-[#f8f9fc] rounded-2xl p-4 border border-[#e2e8f0]">
                      <div className="flex items-center gap-2 mb-3 text-[#434654] text-sm">
                         <span className="material-symbols-outlined text-[18px] text-[#003fb1]">calendar_month</span>
                         <span className="font-medium">
                           {new Date(appointment.appointmentDate).toLocaleDateString('en-US', { weekday: 'long' })},{' '}
                           {new Date(appointment.appointmentDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                         </span>
                      </div>
                      <div className="flex items-center gap-2 mb-3 text-[#434654] text-sm">
                         <span className="material-symbols-outlined text-[18px] text-[#003fb1]">schedule</span>
                         <span className="font-medium">{appointment.appointmentTime.substring(0,5)}</span>
                      </div>
                      <div className="flex items-center gap-2 text-[#434654] text-sm">
                         <span className="material-symbols-outlined text-[18px] text-[#003fb1]">payments</span>
                         <span className="font-medium">NRs. {appointment.price}</span>
                      </div>
                    </div>
                  </div>
                  
                  {appointment.appointmentStatus === 'SCHEDULED' && appointment.appointmentType === 'VIRTUAL' && appointment.meetingLink && (
                    <div className="mt-4 pt-4 border-t border-[#e2e8f0] flex flex-col items-center">
                      <a href={appointment.meetingLink} target="_blank" rel="noreferrer" className="w-full flex items-center justify-center gap-2 bg-[#1a56db] text-white px-4 py-3 rounded-xl font-bold hover:bg-[#123e9e] transition-colors shadow-md">
                        <span className="material-symbols-outlined">video_camera_front</span>
                        Join Virtual Meeting
                      </a>
                    </div>
                  )}
                  {appointment.appointmentStatus === 'SCHEDULED' && appointment.appointmentType !== 'VIRTUAL' && (
                    <div className="mt-4 pt-4 border-t border-[#e2e8f0] flex flex-col items-center">
                      <p className="text-xs font-semibold text-[#53606c] mb-3 text-center uppercase tracking-wider">Scan to Check-in</p>
                      <div className="bg-white p-2 rounded-xl shadow-sm border border-[#e2e8f0]">
                        <QRCodeSVG value={appointment.transactionId || "unknown"} size={120} fgColor="#151c27" />
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Recent Appointments */}
        <section className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-[20px] font-medium text-[#151c27]">Recent Appointments</h3>
            <a className="text-[#003fb1] text-[14px] font-medium hover:underline" href="/my-history">
              View all history
            </a>
          </div>
          
          {loading ? (
             <div className="flex justify-center py-10">
               <div className="w-8 h-8 border-4 border-[#003fb1] border-t-transparent rounded-full animate-spin"></div>
             </div>
          ) : appointments.filter(a => ['COMPLETED', 'CANCELLED'].includes(a.appointmentStatus)).length === 0 ? (
            <div className="w-full p-12 rounded-2xl border-2 border-dashed border-[#c3c5d7] bg-white/50 flex items-center justify-center transition-colors hover:bg-white/80 cursor-default">
              <div className="flex items-center gap-6 text-[#434654] opacity-60">
                <span className="material-symbols-outlined text-[32px]">history_edu</span>
                <p className="text-[16px] italic">
                  Your past visits, statuses, and downloadable receipts will appear here.
                </p>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {appointments.filter(a => ['COMPLETED', 'CANCELLED'].includes(a.appointmentStatus)).slice(0, 3).map((appointment) => (
                <div key={appointment.id} className="bg-white rounded-2xl p-5 shadow-[0_4px_14px_rgba(0,0,0,0.03)] border border-[#e2e8f0] flex flex-col md:flex-row md:items-center justify-between gap-6 hover:shadow-[0_8px_30px_rgba(0,0,0,0.06)] transition-shadow">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full overflow-hidden border border-[#e2e8f0] bg-gray-100 flex-shrink-0 flex items-center justify-center">
                      {appointment.doctorProfilePicture ? (
                        <img src={appointment.doctorProfilePicture} alt="Doctor" className="w-full h-full object-cover" />
                      ) : (
                        <span className="material-symbols-outlined text-gray-400">person</span>
                      )}
                    </div>
                    <div>
                      <h4 className="text-[16px] font-bold text-[#151c27]">{appointment.serviceName}</h4>
                      <p className="text-[14px] text-[#53606c]">Dr. {appointment.doctorName || 'Unknown'} • {appointment.doctorSpecialty || 'Specialist'}</p>
                      <div className="flex items-center gap-3 mt-1 text-[12px] text-[#8c9bab] font-medium">
                         <span>{new Date(appointment.appointmentDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                         <span className="w-1 h-1 rounded-full bg-[#c3c5d7]"></span>
                         <span>{appointment.appointmentTime.substring(0,5)}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between md:justify-end gap-6 md:w-auto w-full border-t md:border-t-0 border-[#e2e8f0] pt-4 md:pt-0">
                    <div className="flex flex-col md:items-end">
                      <span className={`px-3 py-1 rounded-full text-[10px] uppercase tracking-wider font-bold mb-1 w-max ${
                        appointment.appointmentStatus === 'COMPLETED' ? 'bg-blue-100 text-blue-700' : 'bg-red-100 text-red-700'
                      }`}>
                        {appointment.appointmentStatus}
                      </span>
                      <span className="text-[14px] font-semibold text-[#151c27]">NRs. {appointment.price}</span>
                    </div>
                    
                    <div className="flex gap-2">
                      <button className="p-2 border border-[#c3c5d7] text-[#53606c] hover:bg-[#f0f3ff] hover:text-[#003fb1] hover:border-[#003fb1] rounded-lg transition-colors flex items-center justify-center" title="View Receipt">
                        <span className="material-symbols-outlined text-[18px]">receipt_long</span>
                      </button>
                      <button 
                        onClick={() => navigate('/book-appointment')}
                        className="px-4 py-2 bg-[#f0f3ff] text-[#003fb1] hover:bg-[#003fb1] hover:text-white font-bold text-xs rounded-lg transition-colors flex items-center gap-2">
                        <span>Book Again</span>
                        <span className="material-symbols-outlined text-[16px]">refresh</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
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
