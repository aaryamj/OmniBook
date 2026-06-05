import React, { useEffect, useState } from 'react';
import { useNavigate, NavLink } from 'react-router-dom';
import NotificationBell from './NotificationBell';

const ProfileSettingPage: React.FC = () => {
  const navigate = useNavigate();
  const [fullName, setFullName] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'personal-info' | 'security' | 'notifications'>('personal-info');
  const [twoStepEnabled, setTwoStepEnabled] = useState(true);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('••••••••••••');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordErrors, setPasswordErrors] = useState<Record<string, string>>({});
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [phone, setPhone] = useState<string>('5550123456');
  const [phoneError, setPhoneError] = useState<string>('');
  
  // Notification states
  const [bookingConfirmations, setBookingConfirmations] = useState({ email: true, sms: true, inApp: true });
  const [upcomingReminders, setUpcomingReminders] = useState({ email: true, sms: true, inApp: false });
  const [cancellations, setCancellations] = useState({ email: true, sms: true, inApp: true });
  const [exclusiveDiscounts, setExclusiveDiscounts] = useState(false);
  const [newsletter, setNewsletter] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');

  const [avatarUrl, setAvatarUrl] = useState<string>('https://lh3.googleusercontent.com/aida-public/AB6AXuCZHbfckUTer_B0V4UGQdj6hbBl570n8rDL9W4JkPDf3H1CS3X7zEPuMZEEMHqM4QcREe0vvmFj7eFDF40sCwDFpdcxptvdOXqb-wY6Vk0D46L2Cv6SkL3JWi9kyovrUX3dFYoFQ_QF1dmI5QjkoGXvKRDN3bwzJS49lRpz2iqUkbbNup2jWzngG9hdKWIq82Xv6BhIOBFN9w53rg1vieG_xUV2ddTnNei-WAoOZ2HvmXZgJjBlcNZocp6nVRwlDN7zCqnL9GFlLAc');
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');
    
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

  const handleSaveNotifications = () => {
    setSaveStatus('saving');
    setTimeout(() => {
      setSaveStatus('saved');
      setTimeout(() => {
        setSaveStatus('idle');
      }, 2000);
    }, 1000);
  };

  const handleUpdatePassword = () => {
    const newErrors: Record<string, string> = {};
    if (!currentPassword || currentPassword === '••••••••••••') {
      newErrors.currentPassword = 'Current password is required';
    }
    if (!/^(?=.*\d)(?=.*[^a-zA-Z0-9])[A-Z].{5,}$/.test(newPassword)) {
      newErrors.newPassword = 'Must be 6+ chars, start with a capital, and include a number and symbol';
    } else if (currentPassword === newPassword) {
      newErrors.newPassword = 'New password must be different from current password';
    }
    if (newPassword !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    setPasswordErrors(newErrors);
    
    if (Object.keys(newErrors).length === 0) {
      setCurrentPassword('••••••••••••');
      setNewPassword('');
      setConfirmPassword('');
      alert("Password updated successfully!");
    }
  };

  const handleSave = () => {
    if (!/^\d{10}$/.test(phone)) {
      setPhoneError('Phone number must be exactly 10 digits');
      return;
    }
    setPhoneError('');
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      setIsEditing(false);
    }, 1500);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setAvatarUrl(url);
    }
  };

  const handleRemovePhoto = () => {
    setAvatarUrl('https://lh3.googleusercontent.com/aida-public/AB6AXuCZHbfckUTer_B0V4UGQdj6hbBl570n8rDL9W4JkPDf3H1CS3X7zEPuMZEEMHqM4QcREe0vvmFj7eFDF40sCwDFpdcxptvdOXqb-wY6Vk0D46L2Cv6SkL3JWi9kyovrUX3dFYoFQ_QF1dmI5QjkoGXvKRDN3bwzJS49lRpz2iqUkbbNup2jWzngG9hdKWIq82Xv6BhIOBFN9w53rg1vieG_xUV2ddTnNei-WAoOZ2HvmXZgJjBlcNZocp6nVRwlDN7zCqnL9GFlLAc');
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
                  src={avatarUrl}
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

      {/* Main Content Area */}
      <div className="flex pt-20 min-h-screen max-w-7xl mx-auto w-full">
        {/* SideNavBar */}
        <aside className="hidden md:flex flex-col gap-2 p-6 w-64 shrink-0 sticky top-20 h-[calc(100vh-80px)] overflow-y-auto">
          <div className="mb-6 px-2">
            <h2 className="text-[24px] font-semibold text-[#003fb1]">Settings</h2>
            <p className="text-[14px] text-[#53606c]">Manage your account</p>
          </div>
          <nav className="flex flex-col gap-1">
            <button 
              onClick={() => setActiveTab('personal-info')}
              className={`flex items-center gap-4 px-4 py-3 rounded-xl transition-all w-full text-left ${activeTab === 'personal-info' ? 'text-[#003fb1] font-bold bg-[#1a56db]/10 translate-x-1' : 'text-[#53606c] hover:bg-[#d6e4f3]/50 hover:text-[#586672]'}`}
            >
              <span className="material-symbols-outlined">person</span>
              <span className="text-[14px]">Personal Info</span>
            </button>
            <button 
              onClick={() => setActiveTab('security')}
              className={`flex items-center gap-4 px-4 py-3 rounded-xl transition-all w-full text-left ${activeTab === 'security' ? 'text-[#003fb1] font-bold bg-[#1a56db]/10 translate-x-1' : 'text-[#53606c] hover:bg-[#d6e4f3]/50 hover:text-[#586672]'}`}
            >
              <span className="material-symbols-outlined" style={activeTab === 'security' ? {fontVariationSettings: "'FILL' 1"} : {}}>security</span>
              <span className="text-[14px]">Security</span>
            </button>
            <button 
              onClick={() => setActiveTab('notifications')}
              className={`flex items-center gap-4 px-4 py-3 rounded-xl transition-all w-full text-left ${activeTab === 'notifications' ? 'text-[#003fb1] font-bold bg-[#1a56db]/10 translate-x-1' : 'text-[#53606c] hover:bg-[#d6e4f3]/50 hover:text-[#586672]'}`}
            >
              <span className="material-symbols-outlined">notifications</span>
              <span className="text-[14px]">Notifications</span>
            </button>
          </nav>

          <div className="mt-8 p-4 bg-[#f0f3ff] rounded-xl border border-[#c3c5d7]/30">
            <p className="text-[#434654] text-[12px] font-medium mb-2 uppercase tracking-wider">Public Profile</p>
            <button className="text-[#003fb1] font-bold text-[14px] hover:underline flex items-center gap-2">
              View Public Profile <span className="material-symbols-outlined text-[18px]">open_in_new</span>
            </button>
          </div>
        </aside>

        {/* Right Panel */}
        <main className="flex-1 w-full px-4 md:px-10 py-8">
          
          {activeTab === 'personal-info' && (
            <>
              {/* Page Header */}
              <div className="mb-8 border-b border-[#c3c5d7]/30 pb-4">
                <h1 className="text-[32px] font-semibold text-[#151c27]">Account Settings</h1>
                <p className="text-[#434654] text-[16px] mt-1">Manage your profile information, security, and notification preferences.</p>
              </div>

              {!isEditing ? (
            /* Summary Component (Read View) */
            <div className="max-w-4xl">
              <div className="bg-white rounded-[16px] shadow-sm p-6 relative border border-[#c3c5d7]/20">
                {/* Edit Button */}
                <div className="absolute top-6 right-6">
                  <button 
                    onClick={() => setIsEditing(true)}
                    className="flex items-center gap-2 px-4 py-2 border border-[#003fb1] text-[#003fb1] rounded-xl font-medium hover:bg-[#003fb1]/5 transition-all active:scale-95"
                  >
                    <span className="material-symbols-outlined text-[20px]">edit</span>
                    <span className="text-[14px] font-medium">Edit Profile</span>
                  </button>
                </div>

                <div className="flex flex-col md:flex-row gap-8 items-start">
                  <div className="flex-shrink-0">
                    <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-[#f0f3ff] ring-1 ring-[#c3c5d7]/20">
                      <img alt="User Photo" className="w-full h-full object-cover" src={avatarUrl} />
                    </div>
                  </div>

                  <div className="flex-1 w-full space-y-8 md:pr-36">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-y-8 gap-x-6">
                      <div className="flex flex-col gap-1">
                        <label className="text-[14px] text-[#737686] uppercase tracking-wider font-medium">Full Name</label>
                        <p className="text-[18px] text-[#151c27] font-bold">Alexander Mitchell</p>
                      </div>
                      <div className="flex flex-col gap-1">
                        <label className="text-[14px] text-[#737686] uppercase tracking-wider font-medium">Email Address</label>
                        <p className="text-[16px] text-[#434654]">alex.mitchell@omnibook.com</p>
                      </div>
                      <div className="flex flex-col gap-1">
                        <label className="text-[14px] text-[#737686] uppercase tracking-wider font-medium">Phone Number</label>
                        <p className="text-[16px] text-[#434654]">+1 {phone.length === 10 ? phone.replace(/(\d{3})(\d{3})(\d{4})/, '($1) $2-$3') : phone}</p>
                      </div>
                      <div className="flex flex-col gap-1">
                        <label className="text-[14px] text-[#737686] uppercase tracking-wider font-medium">Country/Region</label>
                        <p className="text-[16px] text-[#434654]">United States</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Secondary Info Section */}
              <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-[#e7eefe] p-6 rounded-xl flex items-start gap-4">
                    <div className="bg-[#1a56db]/10 p-3 rounded-lg text-[#003fb1]">
                        <span className="material-symbols-outlined">verified_user</span>
                    </div>
                    <div>
                        <p className="text-[14px] font-medium text-[#151c27]">Verified Member</p>
                        <p className="text-[12px] text-[#434654] mt-1">Your identity was verified on Jan 2024.</p>
                    </div>
                </div>
                <div className="bg-[#006f4b]/10 p-6 rounded-xl flex items-start gap-4">
                    <div className="bg-[#005438]/10 p-3 rounded-lg text-[#005438]">
                        <span className="material-symbols-outlined">history</span>
                    </div>
                    <div>
                        <p className="text-[14px] font-medium text-[#151c27]">Last Login</p>
                        <p className="text-[12px] text-[#434654] mt-1">2 hours ago from San Francisco, CA.</p>
                    </div>
                </div>
              </div>

              <div className="mt-8 px-6 py-4 bg-[#d6e4f3]/20 rounded-xl border border-[#d6e4f3]/30 flex items-start gap-4">
                <span className="material-symbols-outlined text-[#003fb1]">info</span>
                <p className="text-[14px] text-[#53606c] leading-relaxed">
                    Your personal information is private and will only be shared with authorized appointment providers. To update your profile, click the "Edit Profile" button above.
                </p>
              </div>
            </div>
          ) : (
            /* Form Component (Write View) */
            <div className="max-w-4xl">
              <div className="bg-white rounded-xl shadow-sm border border-[#c3c5d7]/30 p-6 lg:p-8">
                <div className="space-y-8">
                  
                  {/* Avatar Section */}
                  <div className="flex flex-col md:flex-row items-center gap-6 pb-8 border-b border-[#e7eefe]">
                      <div className="relative">
                          <img alt="User Avatar"
                              className="w-32 h-32 rounded-full object-cover border-4 border-[#f0f3ff] shadow-sm"
                              src={avatarUrl} />
                          <button
                              className="absolute bottom-0 right-0 bg-[#003fb1] text-white p-2 rounded-full shadow-md hover:scale-105 transition-transform material-symbols-outlined text-[18px]">
                              edit
                          </button>
                      </div>
                      <div className="text-center md:text-left">
                          <h3 className="text-[24px] font-semibold text-[#151c27]">Profile Picture</h3>
                          <p className="text-[#434654] text-[16px] mt-1">PNG or JPG. Max size of 800K.</p>
                          <div className="mt-4 flex gap-4 justify-center md:justify-start">
                              <input 
                                type="file" 
                                accept="image/png, image/jpeg" 
                                className="hidden" 
                                ref={fileInputRef} 
                                onChange={handleFileChange} 
                              />
                              <button 
                                onClick={() => fileInputRef.current?.click()}
                                className="px-6 py-2 bg-[#003fb1] text-white font-medium text-[14px] rounded-lg shadow-sm hover:opacity-90 transition-opacity">
                                Upload Photo
                              </button>
                              <button 
                                onClick={handleRemovePhoto}
                                className="px-6 py-2 text-[#434654] border border-[#c3c5d7] font-medium text-[14px] rounded-lg hover:bg-[#f0f3ff] transition-colors">
                                Remove
                              </button>
                          </div>
                      </div>
                  </div>

                  {/* Inputs Section */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="flex flex-col gap-2">
                          <label className="font-medium text-[14px] text-[#151c27] ml-1">Full Name</label>
                          <input
                              className="w-full bg-white border border-[#737686] rounded-lg px-6 py-3 text-[16px] focus:ring-2 focus:ring-[#003fb1] focus:border-transparent outline-none transition-all"
                              placeholder="Enter your full name" type="text" defaultValue="Alexander Mitchell" />
                      </div>
                      <div className="flex flex-col gap-2">
                          <label className="font-medium text-[14px] text-[#151c27] ml-1">Phone Number</label>
                          <div className="relative group">
                            <div className="absolute left-[1px] top-[1px] bottom-[1px] flex items-center border-r border-[#c3c5d7] pr-2 pl-3 bg-[#f9f9ff] rounded-l-[7px] pointer-events-auto">
                              <select className="bg-transparent border-none outline-none p-0 pr-4 text-[14px] text-[#434654] font-medium cursor-pointer appearance-none focus:ring-0" style={{backgroundImage: "url(\"data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3E%3Cpath stroke='%23737686' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3E%3C/svg%3E\")", backgroundPosition: "right 0 center", backgroundRepeat: "no-repeat", backgroundSize: "1.2em 1.2em"}} id="countryCode">
                                <option value="+1">🇺🇸 +1</option>
                                <option value="+44">🇬🇧 +44</option>
                                <option value="+91">🇮🇳 +91</option>
                                <option value="+61">🇦🇺 +61</option>
                                <option value="+977">🇳🇵 +977</option>
                              </select>
                            </div>
                            <input
                              className={`w-full pl-[95px] pr-4 py-3 bg-white border ${phoneError ? 'border-red-500' : 'border-[#737686]'} rounded-lg text-[16px] focus:ring-2 focus:ring-[#003fb1] focus:border-transparent outline-none transition-all`}
                              id="phone"
                              placeholder="0000000000"
                              type="tel"
                              maxLength={10}
                              value={phone}
                              onChange={(e) => setPhone(e.target.value.replace(/[^0-9]/g, ''))}
                            />
                          </div>
                          {phoneError && <p className="text-red-500 text-xs ml-1">{phoneError}</p>}
                      </div>
                      <div className="flex flex-col gap-2 md:col-span-2">
                          <label className="font-medium text-[14px] text-[#151c27] ml-1">Email Address</label>
                          <div className="relative">
                              <input
                                  className="w-full bg-[#f0f3ff] border border-[#c3c5d7] text-[#434654] cursor-not-allowed rounded-lg px-6 py-3 text-[16px] outline-none"
                                  readOnly type="email" defaultValue="alex.mitchell@omnibook.com" />
                              <span className="absolute right-6 top-1/2 -translate-y-1/2 material-symbols-outlined text-[#737686] text-[20px]">lock</span>
                          </div>
                          <p className="text-[#434654] font-medium text-[12px] ml-1">Email address cannot be changed. Contact support for help.</p>
                      </div>
                  </div>

                  {/* Biography */}
                  <div className="p-6 bg-[#f0f3ff]/30 rounded-xl space-y-6">
                      <h4 className="text-[20px] font-medium text-[#151c27]">Biography</h4>
                      <textarea
                          className="w-full bg-white border border-[#737686] rounded-lg px-6 py-6 text-[16px] focus:ring-2 focus:ring-[#003fb1] focus:border-transparent outline-none transition-all"
                          placeholder="Tell us a bit about yourself..." rows={4}></textarea>
                  </div>

                  {/* Action Bar */}
                  <div className="flex justify-end pt-8 border-t border-[#e7eefe]">
                      <button
                          onClick={handleSave}
                          disabled={isSaving}
                          className={`bg-[#10B981] text-white px-8 py-4 rounded-xl font-semibold text-[18px] shadow-lg transition-all flex items-center gap-2 ${isSaving ? 'opacity-80' : 'hover:shadow-xl hover:opacity-95 active:scale-95'}`}>
                          <span className={`material-symbols-outlined ${isSaving ? 'animate-spin' : ''}`}>
                            {isSaving ? 'progress_activity' : 'check_circle'}
                          </span>
                          {isSaving ? 'Saving...' : 'Save Changes'}
                      </button>
                  </div>

                </div>
              </div>

            </div>
          )}
          </>)}

          {activeTab === 'security' && (
            <>
              {/* Page Header */}
              <div className="mb-8 border-b border-[#c3c5d7]/30 pb-4">
                  <h1 className="text-[32px] font-semibold text-[#151c27]">Security Settings</h1>
                  <p className="text-[#434654] text-[16px] mt-1">Secure your account with advanced authentication methods and session management.</p>
              </div>
              <div className="max-w-4xl mx-auto space-y-8">
                  {/* Two-Step Verification */}
                  <section className="bg-white rounded-xl p-6 shadow-[0_4px_20px_rgba(26,86,219,0.05)] flex items-center justify-between border border-[#151c27]/5">
                      <div className="flex gap-6 items-center">
                          <div className="w-12 h-12 rounded-full bg-[#006f4b]/10 flex items-center justify-center text-[#005438]">
                              <span className="material-symbols-outlined text-[28px]">verified_user</span>
                          </div>
                          <div>
                              <h3 className="text-[20px] font-medium text-[#151c27]">Two-Step Verification</h3>
                              <p className="text-[14px] text-[#434654] font-medium">Add an extra layer of security to your account</p>
                          </div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" className="sr-only peer" checked={twoStepEnabled} onChange={() => setTwoStepEnabled(!twoStepEnabled)} />
                          <div className={`w-12 h-6 rounded-full peer transition-all ${twoStepEnabled ? 'bg-[#10B981]' : 'bg-[#c3c5d7]'} relative after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all ${twoStepEnabled ? 'after:translate-x-full after:border-white' : ''}`}></div>
                          <span className={`ms-3 text-[14px] font-bold ${twoStepEnabled ? 'text-[#10B981]' : 'text-[#434654]'}`}>{twoStepEnabled ? 'On' : 'Off'}</span>
                      </label>
                  </section>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      {/* Password Management */}
                      <section className="bg-white rounded-xl p-6 shadow-[0_4px_20px_rgba(26,86,219,0.05)] border border-[#151c27]/5 space-y-6">
                          <div className="flex items-center gap-4 border-b border-[#dce2f3] pb-4">
                              <span className="material-symbols-outlined text-[#003fb1]">lock</span>
                              <h3 className="text-[20px] font-medium">Password Management</h3>
                          </div>
                          <div className="space-y-4">
                              <div className="space-y-2">
                                  <label className="text-[14px] font-semibold text-[#434654]">Current Password</label>
                                  <div className="relative group">
                                      <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[#737686] text-[20px] group-focus-within:text-[#1853d9] transition-colors">
                                          lock
                                      </span>
                                      <input 
                                          className={`w-full pl-12 pr-12 py-3 bg-[#ffffff] border ${passwordErrors.currentPassword ? 'border-red-500' : 'border-[#c3c5d7]'} rounded-xl text-[16px] placeholder:text-[#737686]/50 hover:bg-[#f0f3ff] focus:bg-white focus:ring-2 focus:ring-[#b5c4ff] focus:border-[#1853d9] outline-none transition-all`} 
                                          type={showCurrentPassword ? "text" : "password"} 
                                          value={currentPassword}
                                          onChange={(e) => setCurrentPassword(e.target.value)}
                                      />
                                      <button 
                                          className="absolute right-4 top-1/2 -translate-y-1/2 text-[#737686] hover:text-[#151c27] z-10" 
                                          type="button"
                                          onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                      >
                                          <span className="material-symbols-outlined">
                                              {showCurrentPassword ? "visibility_off" : "visibility"}
                                          </span>
                                      </button>
                                  </div>
                                  {passwordErrors.currentPassword && <p className="text-red-500 text-xs mt-1">{passwordErrors.currentPassword}</p>}
                              </div>
                              <div className="space-y-2">
                                  <label className="text-[14px] font-semibold text-[#434654]">New Password</label>
                                  <div className="relative group">
                                      <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[#737686] text-[20px] group-focus-within:text-[#1853d9] transition-colors">
                                          lock
                                      </span>
                                      <input 
                                          className={`w-full pl-12 pr-12 py-3 bg-[#ffffff] border ${passwordErrors.newPassword ? 'border-red-500' : 'border-[#c3c5d7]'} rounded-xl text-[16px] placeholder:text-[#737686]/50 hover:bg-[#f0f3ff] focus:bg-white focus:ring-2 focus:ring-[#b5c4ff] focus:border-[#1853d9] outline-none transition-all`} 
                                          placeholder="••••••••" 
                                          type={showNewPassword ? "text" : "password"} 
                                          value={newPassword}
                                          onChange={(e) => setNewPassword(e.target.value)}
                                      />
                                      <button 
                                          className="absolute right-4 top-1/2 -translate-y-1/2 text-[#737686] hover:text-[#151c27] z-10" 
                                          type="button"
                                          onClick={() => setShowNewPassword(!showNewPassword)}
                                      >
                                          <span className="material-symbols-outlined">
                                              {showNewPassword ? "visibility_off" : "visibility"}
                                          </span>
                                      </button>
                                  </div>
                                  {passwordErrors.newPassword && <p className="text-red-500 text-xs mt-1">{passwordErrors.newPassword}</p>}
                              </div>
                              <div className="space-y-2">
                                  <label className="text-[14px] font-semibold text-[#434654]">Confirm New Password</label>
                                  <div className="relative group">
                                      <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[#737686] text-[20px] group-focus-within:text-[#1853d9] transition-colors">
                                          lock_reset
                                      </span>
                                      <input 
                                          className={`w-full pl-12 pr-12 py-3 bg-[#ffffff] border ${passwordErrors.confirmPassword ? 'border-red-500' : 'border-[#c3c5d7]'} rounded-xl text-[16px] placeholder:text-[#737686]/50 hover:bg-[#f0f3ff] focus:bg-white focus:ring-2 focus:ring-[#b5c4ff] focus:border-[#1853d9] outline-none transition-all`} 
                                          placeholder="••••••••" 
                                          type={showConfirmPassword ? "text" : "password"} 
                                          value={confirmPassword}
                                          onChange={(e) => setConfirmPassword(e.target.value)}
                                      />
                                      <button 
                                          className="absolute right-4 top-1/2 -translate-y-1/2 text-[#737686] hover:text-[#151c27] z-10" 
                                          type="button"
                                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                      >
                                          <span className="material-symbols-outlined">
                                              {showConfirmPassword ? "visibility_off" : "visibility"}
                                          </span>
                                      </button>
                                  </div>
                                  {passwordErrors.confirmPassword && <p className="text-red-500 text-xs mt-1">{passwordErrors.confirmPassword}</p>}
                              </div>
                          </div>
                          <button 
                              onClick={handleUpdatePassword}
                              className="w-full bg-[#1A56DB] text-white py-3 rounded-lg text-[20px] font-medium hover:bg-[#003fb1] active:scale-95 transition-all shadow-lg shadow-blue-500/20"
                          >
                              Update Password
                          </button>
                      </section>
                      
                      <div className="space-y-8">
                          {/* Social Logins */}
                          <section className="bg-white rounded-xl p-6 shadow-[0_4px_20px_rgba(26,86,219,0.05)] border border-[#151c27]/5 space-y-6">
                              <div className="flex items-center gap-4 border-b border-[#dce2f3] pb-4">
                                  <span className="material-symbols-outlined text-[#003fb1]">link</span>
                                  <h3 className="text-[20px] font-medium">Social Logins</h3>
                              </div>
                              <div className="space-y-6">
                                  <div className="flex items-center justify-between p-4 rounded-lg bg-[#f0f3ff] border border-[#dce2f3]/50">
                                      <div className="flex items-center gap-4">
                                          <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm">
                                              <svg height="18" viewBox="0 0 24 24" width="18" xmlns="http://www.w3.org/2000/svg">
                                                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"></path>
                                                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"></path>
                                                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"></path>
                                                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"></path>
                                              </svg>
                                          </div>
                                          <div>
                                              <p className="text-[14px] font-bold text-[#151c27]">Google</p>
                                              <p className="text-[12px] font-medium text-[#434654]">Connected to alex@gmail.com</p>
                                          </div>
                                      </div>
                                      <button className="px-3 py-1 text-[12px] font-bold bg-[#dce2f3] text-[#434654] rounded hover:bg-[#c3c5d7] transition-colors">Disconnect</button>
                                  </div>
                                  <div className="flex items-center justify-between p-4 rounded-lg bg-white border border-dashed border-[#c3c5d7]">
                                      <div className="flex items-center gap-4">
                                          <div className="w-8 h-8 rounded-full bg-[#d6e4f3]/30 flex items-center justify-center">
                                              <svg fill="#1877F2" height="18" viewBox="0 0 24 24" width="18" xmlns="http://www.w3.org/2000/svg">
                                                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"></path>
                                              </svg>
                                          </div>
                                          <div>
                                              <p className="text-[14px] font-bold text-[#151c27]">Facebook</p>
                                              <p className="text-[12px] text-[#53606c] font-medium">Not Connected</p>
                                          </div>
                                      </div>
                                      <button className="px-3 py-1 text-[12px] font-bold border border-[#003fb1] text-[#003fb1] rounded hover:bg-[#003fb1]/5 transition-colors">Connect</button>
                                  </div>
                              </div>
                          </section>
                          
                          {/* Active Sessions */}
                          <section className="bg-white rounded-xl p-6 shadow-[0_4px_20px_rgba(26,86,219,0.05)] border border-[#151c27]/5 space-y-6">
                              <div className="flex items-center gap-4 border-b border-[#dce2f3] pb-4">
                                  <span className="material-symbols-outlined text-[#003fb1]">devices</span>
                                  <h3 className="text-[20px] font-medium">Where You're Logged In</h3>
                              </div>
                              <div className="flex items-start gap-6 p-4 hover:bg-[#f0f3ff] rounded-lg transition-colors cursor-default">
                                  <div className="w-10 h-10 rounded-lg bg-[#003fb1]/5 flex items-center justify-center text-[#003fb1]">
                                      <span className="material-symbols-outlined">laptop</span>
                                  </div>
                                  <div className="flex-1">
                                      <div className="flex justify-between items-start">
                                          <p className="text-[16px] font-bold text-[#151c27]">Mac OS • Chrome</p>
                                          <span className="text-[10px] font-bold px-2 py-0.5 bg-[#005438]/10 text-[#005438] rounded-full uppercase tracking-wider">Active Now</span>
                                      </div>
                                      <p className="text-[14px] font-medium text-[#434654] mt-1">Kathmandu, Nepal</p>
                                      <div className="mt-2 flex items-center gap-2 text-[#10B981]">
                                          <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse"></span>
                                          <span className="text-[12px] font-medium">Verified session</span>
                                      </div>
                                  </div>
                              </div>
                              <button className="w-full text-[14px] font-bold text-[#ba1a1a] py-2 hover:bg-[#ba1a1a]/5 rounded-lg transition-colors">
                                  Log out from all other sessions
                              </button>
                          </section>
                      </div>
                  </div>
                  
                  {/* Footer Info */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="bg-[#f0f3ff] p-6 rounded-xl border border-[#dce2f3]/30 text-center">
                          <span className="material-symbols-outlined text-[#003fb1] mb-2">history</span>
                          <p className="text-[12px] font-bold text-[#151c27]">Last Changed</p>
                          <p className="text-[12px] font-medium text-[#434654]">March 12, 2024</p>
                      </div>
                      <div className="bg-[#f0f3ff] p-6 rounded-xl border border-[#dce2f3]/30 text-center">
                          <span className="material-symbols-outlined text-[#10B981] mb-2">shield_lock</span>
                          <p className="text-[12px] font-bold text-[#151c27]">Score: Excellent</p>
                          <p className="text-[12px] font-medium text-[#434654]">Account fully secured</p>
                      </div>
                      <div className="bg-[#f0f3ff] p-6 rounded-xl border border-[#dce2f3]/30 text-center">
                          <span className="material-symbols-outlined text-[#53606c] mb-2">help</span>
                          <p className="text-[12px] font-bold text-[#151c27]">Need Help?</p>
                          <a className="text-[12px] font-medium text-[#003fb1] hover:underline" href="#">Security Center</a>
                      </div>
                  </div>
              </div>
            </>
          )}

          {activeTab === 'notifications' && (
            <>
              {/* Page Header */}
              <div className="mb-8 border-b border-[#c3c5d7]/30 pb-4">
                  <h1 className="text-[32px] font-semibold text-[#151c27]">Notification Preferences</h1>
                  <p className="text-[#434654] text-[16px] mt-1">Choose how you want to receive updates and alerts.</p>
              </div>
              <div className="max-w-4xl mx-auto space-y-8">
                  {/* Card 1: Bookings & Reminders */}
                  <section className="bg-[#ffffff] rounded-xl shadow-[0_4px_20px_rgba(26,86,219,0.05)] overflow-hidden border border-black/5">
                      <div className="p-6 border-b border-[#c3c5d7]/30 flex items-center gap-4">
                          <span className="material-symbols-outlined text-[#003fb1]">calendar_today</span>
                          <h3 className="font-['Inter'] text-[20px] leading-[28px] font-medium text-[#151c27]">Bookings & Reminders</h3>
                      </div>
                      <div className="[&>div:nth-child(even)]:bg-[#e1effe]/30">
                          {/* Header Row */}
                          <div className="grid grid-cols-12 gap-6 px-6 py-2 bg-[#f0f3ff]/50">
                              <div className="col-span-6 font-['Geist'] text-[12px] leading-[16px] tracking-[0.02em] font-medium text-[#737686] uppercase">Event Type</div>
                              <div className="col-span-2 text-center font-['Geist'] text-[12px] leading-[16px] tracking-[0.02em] font-medium text-[#737686] uppercase">Email</div>
                              <div className="col-span-2 text-center font-['Geist'] text-[12px] leading-[16px] tracking-[0.02em] font-medium text-[#737686] uppercase">SMS</div>
                              <div className="col-span-2 text-center font-['Geist'] text-[12px] leading-[16px] tracking-[0.02em] font-medium text-[#737686] uppercase">In-App</div>
                          </div>
                          {/* Rows */}
                          <div className="grid grid-cols-12 gap-6 px-6 py-6 items-center">
                              <div className="col-span-6">
                                  <p className="font-['Geist'] text-[14px] leading-[20px] tracking-[0.01em] font-medium text-[#151c27]">Booking Confirmations</p>
                                  <p className="text-xs text-[#434654]">Sent when a new appointment is scheduled.</p>
                              </div>
                              <div className="col-span-2 flex justify-center"><input checked={bookingConfirmations.email} onChange={(e) => setBookingConfirmations({...bookingConfirmations, email: e.target.checked})} className="w-5 h-5 rounded border-[#737686] text-[#003fb1] focus:ring-[#003fb1]/20" type="checkbox" /></div>
                              <div className="col-span-2 flex justify-center"><input checked={bookingConfirmations.sms} onChange={(e) => setBookingConfirmations({...bookingConfirmations, sms: e.target.checked})} className="w-5 h-5 rounded border-[#737686] text-[#003fb1] focus:ring-[#003fb1]/20" type="checkbox" /></div>
                              <div className="col-span-2 flex justify-center"><input checked={bookingConfirmations.inApp} onChange={(e) => setBookingConfirmations({...bookingConfirmations, inApp: e.target.checked})} className="w-5 h-5 rounded border-[#737686] text-[#003fb1] focus:ring-[#003fb1]/20" type="checkbox" /></div>
                          </div>
                          <div className="grid grid-cols-12 gap-6 px-6 py-6 items-center">
                              <div className="col-span-6">
                                  <p className="font-['Geist'] text-[14px] leading-[20px] tracking-[0.01em] font-medium text-[#151c27]">Upcoming Reminders</p>
                                  <p className="text-xs text-[#434654]">Alerts sent 24 hours before the event starts.</p>
                              </div>
                              <div className="col-span-2 flex justify-center"><input checked={upcomingReminders.email} onChange={(e) => setUpcomingReminders({...upcomingReminders, email: e.target.checked})} className="w-5 h-5 rounded border-[#737686] text-[#003fb1] focus:ring-[#003fb1]/20" type="checkbox" /></div>
                              <div className="col-span-2 flex justify-center"><input checked={upcomingReminders.sms} onChange={(e) => setUpcomingReminders({...upcomingReminders, sms: e.target.checked})} className="w-5 h-5 rounded border-[#737686] text-[#003fb1] focus:ring-[#003fb1]/20" type="checkbox" /></div>
                              <div className="col-span-2 flex justify-center"><input checked={upcomingReminders.inApp} onChange={(e) => setUpcomingReminders({...upcomingReminders, inApp: e.target.checked})} className="w-5 h-5 rounded border-[#737686] text-[#003fb1] focus:ring-[#003fb1]/20" type="checkbox" /></div>
                          </div>
                          <div className="grid grid-cols-12 gap-6 px-6 py-6 items-center">
                              <div className="col-span-6">
                                  <p className="font-['Geist'] text-[14px] leading-[20px] tracking-[0.01em] font-medium text-[#151c27]">Cancellations & Rescheduling</p>
                                  <p className="text-xs text-[#434654]">Immediate updates when timings change.</p>
                              </div>
                              <div className="col-span-2 flex justify-center"><input checked={cancellations.email} onChange={(e) => setCancellations({...cancellations, email: e.target.checked})} className="w-5 h-5 rounded border-[#737686] text-[#003fb1] focus:ring-[#003fb1]/20" type="checkbox" /></div>
                              <div className="col-span-2 flex justify-center"><input checked={cancellations.sms} onChange={(e) => setCancellations({...cancellations, sms: e.target.checked})} className="w-5 h-5 rounded border-[#737686] text-[#003fb1] focus:ring-[#003fb1]/20" type="checkbox" /></div>
                              <div className="col-span-2 flex justify-center"><input checked={cancellations.inApp} onChange={(e) => setCancellations({...cancellations, inApp: e.target.checked})} className="w-5 h-5 rounded border-[#737686] text-[#003fb1] focus:ring-[#003fb1]/20" type="checkbox" /></div>
                          </div>
                      </div>
                  </section>
                  {/* Card 2: Offers & News */}
                  <section className="bg-[#ffffff] rounded-xl shadow-[0_4px_20px_rgba(26,86,219,0.05)] overflow-hidden border border-black/5">
                      <div className="p-6 border-b border-[#c3c5d7]/30 flex items-center gap-4">
                          <span className="material-symbols-outlined text-[#003fb1]">sell</span>
                          <h3 className="font-['Inter'] text-[20px] leading-[28px] font-medium text-[#151c27]">Offers & News</h3>
                      </div>
                      <div className="divide-y divide-[#c3c5d7]/20">
                          <div className="p-6 flex justify-between items-center">
                              <div>
                                  <p className="font-['Geist'] text-[14px] leading-[20px] tracking-[0.01em] font-medium text-[#151c27]">Exclusive Discounts</p>
                                  <p className="text-xs text-[#434654]">Marketing offers from our certified partners.</p>
                              </div>
                              <label className="relative inline-flex items-center cursor-pointer">
                                  <input type="checkbox" className="sr-only peer" checked={exclusiveDiscounts} onChange={(e) => setExclusiveDiscounts(e.target.checked)} />
                                  <div className="w-11 h-6 bg-[#c3c5d7]/50 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#003fb1]"></div>
                              </label>
                          </div>
                          <div className="p-6 flex justify-between items-center">
                              <div>
                                  <p className="font-['Geist'] text-[14px] leading-[20px] tracking-[0.01em] font-medium text-[#151c27]">OmniBook Newsletter</p>
                                  <p className="text-xs text-[#434654]">Monthly insights and feature updates.</p>
                              </div>
                              <label className="relative inline-flex items-center cursor-pointer">
                                  <input type="checkbox" className="sr-only peer" checked={newsletter} onChange={(e) => setNewsletter(e.target.checked)} />
                                  <div className="w-11 h-6 bg-[#c3c5d7]/50 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#003fb1]"></div>
                              </label>
                          </div>
                      </div>
                  </section>
                  {/* Card 3: System & Security */}
                  <section className="bg-[#ffffff] rounded-xl shadow-[0_4px_20px_rgba(26,86,219,0.05)] overflow-hidden border border-black/5">
                      <div className="p-6 border-b border-[#c3c5d7]/30 flex items-center gap-4">
                          <span className="material-symbols-outlined text-[#003fb1]">security</span>
                          <h3 className="font-['Inter'] text-[20px] leading-[28px] font-medium text-[#151c27]">System & Security</h3>
                      </div>
                      <div className="p-6 flex justify-between items-center bg-[#f0f3ff]/30">
                          <div>
                              <p className="font-['Geist'] text-[14px] leading-[20px] tracking-[0.01em] font-medium text-[#151c27]">New sign-ins and password changes.</p>
                              <p className="text-xs text-[#434654]">Critical alerts regarding your account integrity.</p>
                          </div>
                          <span className="font-['Geist'] text-[12px] leading-[16px] tracking-[0.02em] font-medium text-[#737686] bg-[#dce2f3]/50 px-3 py-1 rounded-full">Always On (Required for security)</span>
                      </div>
                  </section>
              </div>
              {/* Action Button */}
              <div className="mt-12 flex justify-end">
                  <button 
                      onClick={handleSaveNotifications}
                      disabled={saveStatus !== 'idle'}
                      className={`flex items-center justify-center gap-2 px-12 py-3 rounded-xl font-['Inter'] text-[20px] leading-[28px] font-medium transition-all duration-200 shadow-lg shadow-[#003fb1]/20 hover:shadow-xl hover:shadow-[#003fb1]/30 active:scale-95 ${
                        saveStatus === 'idle' ? 'bg-[#003fb1] text-white hover:opacity-90' :
                        saveStatus === 'saving' ? 'bg-[#003fb1] text-white opacity-80 cursor-not-allowed' :
                        'bg-[#006f4b] text-[#68f5b8]'
                      }`}
                  >
                      {saveStatus === 'idle' && (
                        <>
                          <span>Save Preferences</span>
                          <span className="material-symbols-outlined">check_circle</span>
                        </>
                      )}
                      {saveStatus === 'saving' && (
                        <>
                          <span className="material-symbols-outlined animate-spin">sync</span>
                          <span>Saving...</span>
                        </>
                      )}
                      {saveStatus === 'saved' && (
                        <>
                          <span className="material-symbols-outlined">done_all</span>
                          <span>Saved!</span>
                        </>
                      )}
                  </button>
              </div>
            </>
          )}

        </main>
      </div>

    </div>
  );
};

export default ProfileSettingPage;
