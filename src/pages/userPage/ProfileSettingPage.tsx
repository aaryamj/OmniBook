import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import UserTopNavigation from './components/UserTopNavigation';
import { useGoogleLogin } from '@react-oauth/google';
import FacebookLoginModule from 'react-facebook-login/dist/facebook-login-render-props';
const FacebookLogin = (FacebookLoginModule as any).default || FacebookLoginModule;
import { useAuth } from '../../context/AuthContext';

import { useOrganizationTerms } from '../../utils/organizationTerms';

const DEFAULT_AVATAR = 'https://lh3.googleusercontent.com/aida-public/AB6AXuCZHbfckUTer_B0V4UGQdj6hbBl570n8rDL9W4JkPDf3H1CS3X7zEPuMZEEMHqM4QcREe0vvmFj7eFDF40sCwDFpdcxptvdOXqb-wY6Vk0D46L2Cv6SkL3JWi9kyovrUX3dFYoFQ_QF1dmI5QjkoGXvKRDN3bwzJS49lRpz2iqUkbbNup2jWzngG9hdKWIq82Xv6BhIOBFN9w53rg1vieG_xUV2ddTnNei-WAoOZ2HvmXZgJjBlcNZocp6nVRwlDN7zCqnL9GFlLAc';

interface CountryConfig {
  name: string;
  flag: string;
  code: string;
  format: (phone: string) => string;
}

const COUNTRY_CONFIGS: Record<string, CountryConfig> = {
  '+977': {
    name: 'Nepal',
    flag: '🇳🇵',
    code: '+977',
    format: (p: string) => {
      const clean = p.replace(/\D/g, '');
      if (clean.length === 10) {
        return clean.replace(/(\d{3})(\d{3})(\d{4})/, '$1-$2-$3');
      }
      return clean;
    }
  },
  '+91': {
    name: 'India',
    flag: '🇮🇳',
    code: '+91',
    format: (p: string) => {
      const clean = p.replace(/\D/g, '');
      if (clean.length === 10) {
        return clean.replace(/(\d{5})(\d{5})/, '$1 $2');
      }
      return clean;
    }
  },
  '+1': {
    name: 'United States',
    flag: '🇺🇸',
    code: '+1',
    format: (p: string) => {
      const clean = p.replace(/\D/g, '');
      if (clean.length === 10) {
        return clean.replace(/(\d{3})(\d{3})(\d{4})/, '($1) $2-$3');
      }
      return clean;
    }
  },
  '+44': {
    name: 'United Kingdom',
    flag: '🇬🇧',
    code: '+44',
    format: (p: string) => {
      const clean = p.replace(/\D/g, '');
      if (clean.length === 10) {
        return clean.replace(/(\d{4})(\d{6})/, '$1 $2');
      }
      return clean;
    }
  },
  '+61': {
    name: 'Australia',
    flag: '🇦🇺',
    code: '+61',
    format: (p: string) => {
      const clean = p.replace(/\D/g, '');
      if (clean.length === 10) {
        return clean.replace(/(\d{4})(\d{3})(\d{3})/, '$1 $2 $3');
      }
      return clean;
    }
  },
  '+81': {
    name: 'Japan',
    flag: '🇯🇵',
    code: '+81',
    format: (p: string) => p
  },
  '+49': {
    name: 'Germany',
    flag: '🇩🇪',
    code: '+49',
    format: (p: string) => p
  },
  '+33': {
    name: 'France',
    flag: '🇫🇷',
    code: '+33',
    format: (p: string) => p
  },
  '+971': {
    name: 'United Arab Emirates',
    flag: '🇦🇪',
    code: '+971',
    format: (p: string) => p
  },
  '+880': {
    name: 'Bangladesh',
    flag: '🇧🇩',
    code: '+880',
    format: (p: string) => p
  },
  '+975': {
    name: 'Bhutan',
    flag: '🇧🇹',
    code: '+975',
    format: (p: string) => p
  }
};

const resolveDynamicCountry = (phone?: string, serverCountry?: string): string => {
  const cleanPhone = (phone || '').replace(/\D/g, '');

  // 1. If phone has clear Nepali mobile format (10 digits starting with 98 or 97)
  if (cleanPhone.length === 10 && (cleanPhone.startsWith('98') || cleanPhone.startsWith('97'))) {
    return '+977';
  }
  if (cleanPhone.startsWith('977')) return '+977';

  // 2. If server provided a valid, non-default country, accept it
  if (serverCountry && serverCountry !== '+1' && COUNTRY_CONFIGS[serverCountry]) {
    return serverCountry;
  }

  // 3. Detect via browser timezone
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (tz === 'Asia/Kathmandu') return '+977';
    if (tz === 'Asia/Calcutta' || tz === 'Asia/Kolkata') return '+91';
    if (tz.includes('London')) return '+44';
    if (tz.includes('Sydney') || tz.includes('Melbourne')) return '+61';
    if (tz.includes('New_York') || tz.includes('Los_Angeles') || tz.includes('Chicago')) return '+1';
  } catch (e) {}

  return serverCountry && COUNTRY_CONFIGS[serverCountry] ? serverCountry : '+977';
};

const formatDisplayPhone = (rawPhone: string, countryCode: string): string => {
  if (!rawPhone) return 'Not Set';
  const cfg = COUNTRY_CONFIGS[countryCode];
  const formatted = cfg ? cfg.format(rawPhone) : rawPhone;
  return `${countryCode} ${formatted}`;
};

const getCountryDisplayName = (countryCode: string): string => {
  const cfg = COUNTRY_CONFIGS[countryCode];
  if (cfg) {
    return `${cfg.flag} ${cfg.name}`;
  }
  return countryCode || 'Nepal';
};

const ProfileSettingPage: React.FC = () => {
  const { refreshUser } = useAuth();
  const terms = useOrganizationTerms();
  const navigate = useNavigate();
  const [fullName, setFullName] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'personal-info' | 'security' | 'notifications' | 'public-profile'>('personal-info');
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
  const [email, setEmail] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [country, setCountry] = useState<string>(() => resolveDynamicCountry());
  const [phoneError, setPhoneError] = useState<string>('');
  
  // Patient Profile Fields
  const [dateOfBirth, setDateOfBirth] = useState<string>('');
  const [bloodGroup, setBloodGroup] = useState<string>('');
  const [allergies, setAllergies] = useState<string>('');
  const [weight, setWeight] = useState<string>('');
  const [heartRate, setHeartRate] = useState<string>('');
  const [successfulBookingsCount, setSuccessfulBookingsCount] = useState<number>(0);

  const orgType = (localStorage.getItem('organizationType') || '').toLowerCase();
  const isHealthcare = orgType.includes('health') || orgType.includes('clinic') || orgType.includes('hospital') || orgType.includes('medical');
  
  const [googleConnected, setGoogleConnected] = useState(false);
  const [googleEmail, setGoogleEmail] = useState('');
  const [facebookConnected, setFacebookConnected] = useState(false);
  const [facebookEmail, setFacebookEmail] = useState('');
  
  const [createdAt, setCreatedAt] = useState<string>('');
  const [updatedAt, setUpdatedAt] = useState<string>('');
  const [lastLoginAt, setLastLoginAt] = useState<string>('');
  const [lastLoginLocation, setLastLoginLocation] = useState<string>('');
  const [sessions, setSessions] = useState<any[]>([]);

  // Notification states
  const [bookingConfirmations, setBookingConfirmations] = useState({ email: true, sms: true, inApp: true });
  const [upcomingReminders, setUpcomingReminders] = useState({ email: true, sms: true, inApp: false });
  const [cancellations, setCancellations] = useState({ email: true, sms: true, inApp: true });
  const [exclusiveDiscounts, setExclusiveDiscounts] = useState(false);
  const [newsletter, setNewsletter] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');

  const [avatarUrl, setAvatarUrl] = useState<string>('');
  const [organizationName, setOrganizationName] = useState<string>('');
  const [organizationLogo, setOrganizationLogo] = useState<string>('');
  const [tenantAdminName, setTenantAdminName] = useState<string>('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [photoError, setPhotoError] = useState<string>('');
  const [profileSuccessMsg, setProfileSuccessMsg] = useState<string>('');
  const [profileErrorMsg, setProfileErrorMsg] = useState<string>('');
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const getInitials = (name: string) => {
    if (!name) return 'U';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');
    
    if (!token || role !== 'user') {
      navigate('/login');
    } else {
      fetchProfile(token);
    }
  }, [navigate]);

  const fetchProfile = async (token: string) => {
    try {
      const response = await fetch('http://localhost:8080/api/v1/user/profile', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (response.ok) {
        setFullName(data.fullName || '');
        setEmail(data.email || '');
        setPhone(data.phone || '');
        if (data.phone) {
          localStorage.setItem('phone', data.phone);
        }
        const resolvedCountry = resolveDynamicCountry(data.phone, data.country);
        setCountry(resolvedCountry);
        
        setDateOfBirth(data.dateOfBirth || '');
        setBloodGroup(data.bloodGroup || '');
        setAllergies(data.allergies || '');
        setWeight(data.weight || '');
        setHeartRate(data.heartRate || '');
        
        setGoogleConnected(data.googleConnected || false);
        setGoogleEmail(data.googleEmail || '');
        setFacebookConnected(data.facebookConnected || false);
        setFacebookEmail(data.facebookEmail || '');
        
        setOrganizationName(data.organizationName || '');
        setOrganizationLogo(data.logoUrl || '');
        setTenantAdminName(data.tenantAdminName || '');

        // If data.profilePicture matches tenant logoUrl or DEFAULT_AVATAR, treat as no custom photo
        const fetchedAvatar = (data.profilePicture && data.profilePicture !== data.logoUrl && data.profilePicture !== DEFAULT_AVATAR) 
          ? data.profilePicture 
          : '';
        setAvatarUrl(fetchedAvatar);
        if (fetchedAvatar) {
          localStorage.setItem('profilePicture', fetchedAvatar);
        } else {
          localStorage.removeItem('profilePicture');
        }
        setTwoStepEnabled(data.twoStepEnabled || false);
        setCreatedAt(data.createdAt || '');
        setUpdatedAt(data.updatedAt || '');
        setLastLoginAt(data.lastLoginAt || '');
        setLastLoginLocation(data.lastLoginLocation || 'Unknown Location');
        setSessions(data.sessions || []);
        setBookingConfirmations({
          email: data.notifBookingEmail,
          sms: data.notifBookingSms,
          inApp: data.notifBookingInApp
        });
        setUpcomingReminders({
          email: data.notifReminderEmail,
          sms: data.notifReminderSms,
          inApp: data.notifReminderInApp
        });
        setCancellations({
          email: data.notifCancellationEmail,
          sms: data.notifCancellationSms,
          inApp: data.notifCancellationInApp
        });
        setExclusiveDiscounts(data.notifExclusiveDiscounts || false);
        setNewsletter(data.notifNewsletter || false);
      }

      // Fetch appointment statistics dynamically
      try {
        const appRes = await fetch('http://localhost:8080/api/v1/user/appointments', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (appRes.ok) {
          const appData = await appRes.json();
          if (appData.success && Array.isArray(appData.appointments)) {
            const count = appData.appointments.filter((a: any) => 
              a.appointmentStatus === 'COMPLETED' || a.appointmentStatus === 'SCHEDULED' || a.appointmentStatus === 'CHECKED_IN'
            ).length;
            setSuccessfulBookingsCount(count);
          }
        }
      } catch (err) {
        // Fallback gracefully
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

    const handleGoogleConnect = useGoogleLogin({
        onSuccess: async (tokenResponse) => {
            const token = localStorage.getItem('token');
            try {
                const res = await fetch('http://localhost:8080/api/v1/user/connect/google', {
                    method: 'POST',
                    headers: { 
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}` 
                    },
                    body: JSON.stringify({ token: tokenResponse.access_token }) 
                });
                if (res.ok) fetchProfile(token!);
            } catch (error) { console.error(error); }
        }
    });

    const handleFacebookConnect = async (response: any) => {
        if (!response.accessToken) return;
        const token = localStorage.getItem('token');
        try {
            const res = await fetch('http://localhost:8080/api/v1/user/connect/facebook', {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}` 
                },
                body: JSON.stringify({ token: response.accessToken })
            });
            if (res.ok) fetchProfile(token!);
        } catch (error) { console.error(error); }
    };

    const handleDisconnect = async (provider: string) => {
        const token = localStorage.getItem('token');
        try {
            const res = await fetch(`http://localhost:8080/api/v1/user/disconnect/${provider}`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) fetchProfile(token!);
        } catch (error) { console.error(error); }
    };

  const handleLogout = (e: React.MouseEvent) => {
    e.preventDefault();
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('fullName');
    navigate('/login');
  };

  const saveProfileSettings = async () => {
    try {
      const token = localStorage.getItem('token');
      await fetch('http://localhost:8080/api/v1/user/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          fullName,
          phone,
          country,
          profilePicture: avatarUrl,
          twoStepEnabled,
          dateOfBirth: dateOfBirth && dateOfBirth.trim() !== '' ? dateOfBirth.trim() : null,
          bloodGroup: bloodGroup && bloodGroup.trim() !== '' ? bloodGroup.trim() : null,
          weight: weight && weight.trim() !== '' ? weight.trim() : null,
          heartRate: heartRate && heartRate.trim() !== '' ? heartRate.trim() : null,
          allergies: allergies && allergies.trim() !== '' ? allergies.trim() : null,
          notifBookingEmail: bookingConfirmations.email,
          notifBookingSms: bookingConfirmations.sms,
          notifBookingInApp: bookingConfirmations.inApp,
          notifReminderEmail: upcomingReminders.email,
          notifReminderSms: upcomingReminders.sms,
          notifReminderInApp: upcomingReminders.inApp,
          notifCancellationEmail: cancellations.email,
          notifCancellationSms: cancellations.sms,
          notifCancellationInApp: cancellations.inApp,
          notifExclusiveDiscounts: exclusiveDiscounts,
          notifNewsletter: newsletter
        })
      });
      if (phone) {
        localStorage.setItem('phone', phone);
      }
      // Option: Refetch if needed, but state is already updated.
    } catch (error) {
      console.error('Error saving profile:', error);
    }
  };

  const handleSaveNotifications = async () => {
    setSaveStatus('saving');
    await saveProfileSettings();
    setSaveStatus('saved');
    setTimeout(() => {
      setSaveStatus('idle');
    }, 2000);
  };

  const handleTwoStepToggle = async () => {
      const newValue = !twoStepEnabled;
      setTwoStepEnabled(newValue);
      try {
        const token = localStorage.getItem('token');
        await fetch('http://localhost:8080/api/v1/user/profile', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            fullName,
            phone,
            country,
            profilePicture: avatarUrl,
            twoStepEnabled: newValue,
            dateOfBirth: dateOfBirth && dateOfBirth.trim() !== '' ? dateOfBirth.trim() : null,
            bloodGroup: bloodGroup && bloodGroup.trim() !== '' ? bloodGroup.trim() : null,
            weight: weight && weight.trim() !== '' ? weight.trim() : null,
            heartRate: heartRate && heartRate.trim() !== '' ? heartRate.trim() : null,
            allergies: allergies && allergies.trim() !== '' ? allergies.trim() : null,
            notifBookingEmail: bookingConfirmations.email,
            notifBookingSms: bookingConfirmations.sms,
            notifBookingInApp: bookingConfirmations.inApp,
            notifReminderEmail: upcomingReminders.email,
            notifReminderSms: upcomingReminders.sms,
            notifReminderInApp: upcomingReminders.inApp,
            notifCancellationEmail: cancellations.email,
            notifCancellationSms: cancellations.sms,
            notifCancellationInApp: cancellations.inApp,
            notifExclusiveDiscounts: exclusiveDiscounts,
            notifNewsletter: newsletter
          })
        });
      } catch (error) {
        console.error('Error saving profile:', error);
      }
    };

  const handleUpdatePassword = async () => {
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
      try {
        const token = localStorage.getItem('token');
        const res = await fetch('http://localhost:8080/api/v1/user/password', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            currentPassword,
            newPassword,
            confirmPassword
          })
        });
        const data = await res.json();
        if (res.ok) {
          setCurrentPassword('••••••••••••');
          setNewPassword('');
          setConfirmPassword('');
          alert("Password updated successfully!");
        } else {
          setPasswordErrors({ currentPassword: data.message || "Failed to update password" });
        }
      } catch (error) {
        console.error("Error updating password:", error);
      }
    }
  };

  const handleSave = async () => {
    if (!/^\d{10}$/.test(phone)) {
      setPhoneError('Phone number must be exactly 10 digits');
      return;
    }
    setPhoneError('');
    setPhotoError('');
    setProfileErrorMsg('');
    setProfileSuccessMsg('');
    setIsSaving(true);

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      let finalAvatarUrl = avatarUrl;

      // 1. If user selected a new file, upload to server first
      if (selectedFile) {
        const formData = new FormData();
        formData.append('file', selectedFile);

        const uploadRes = await fetch('http://localhost:8080/api/v1/user/profile-picture', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          },
          body: formData
        });

        const uploadData = await uploadRes.json();
        if (uploadRes.ok && uploadData.profilePicture) {
          finalAvatarUrl = uploadData.profilePicture;
          setAvatarUrl(finalAvatarUrl);
        } else {
          throw new Error(uploadData.message || 'Failed to upload profile picture');
        }
      }

      // 2. Persist updated profile information
      const res = await fetch('http://localhost:8080/api/v1/user/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          fullName,
          phone,
          country,
          profilePicture: finalAvatarUrl || null,
          twoStepEnabled,
          dateOfBirth: dateOfBirth && dateOfBirth.trim() !== '' ? dateOfBirth.trim() : null,
          bloodGroup: bloodGroup && bloodGroup.trim() !== '' ? bloodGroup.trim() : null,
          weight: weight && weight.trim() !== '' ? weight.trim() : null,
          heartRate: heartRate && heartRate.trim() !== '' ? heartRate.trim() : null,
          allergies: allergies && allergies.trim() !== '' ? allergies.trim() : null,
          notifBookingEmail: bookingConfirmations.email,
          notifBookingSms: bookingConfirmations.sms,
          notifBookingInApp: bookingConfirmations.inApp,
          notifReminderEmail: upcomingReminders.email,
          notifReminderSms: upcomingReminders.sms,
          notifReminderInApp: upcomingReminders.inApp,
          notifCancellationEmail: cancellations.email,
          notifCancellationSms: cancellations.sms,
          notifCancellationInApp: cancellations.inApp,
          notifExclusiveDiscounts: exclusiveDiscounts,
          notifNewsletter: newsletter
        })
      });

      const resData = await res.json();
      if (!res.ok) {
        throw new Error(resData.message || 'Failed to update profile');
      }

      // 3. Update localStorage and broadcast real-time sync event
      localStorage.setItem('fullName', fullName);
      if (finalAvatarUrl) {
        localStorage.setItem('profilePicture', finalAvatarUrl);
      } else {
        localStorage.removeItem('profilePicture');
      }

      window.dispatchEvent(new CustomEvent('userProfileUpdated', {
        detail: {
          fullName,
          profilePicture: finalAvatarUrl || null
        }
      }));

      if (refreshUser) {
        await refreshUser();
      }

      setSelectedFile(null);
      setIsEditing(false);
      setProfileSuccessMsg('Profile and profile picture updated successfully!');
      setTimeout(() => setProfileSuccessMsg(''), 5000);
    } catch (err: any) {
      console.error('Error saving profile:', err);
      setProfileErrorMsg(err.message || 'An error occurred while saving profile changes.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPhotoError('');
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate type
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
    if (!validTypes.includes(file.type.toLowerCase())) {
      setPhotoError('Please select a valid image file (JPG, PNG, or WebP).');
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    // Validate size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setPhotoError('Image file size must be less than 5MB.');
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    setSelectedFile(file);
    const objectUrl = URL.createObjectURL(file);
    setAvatarUrl(objectUrl);
  };

  const handleRemovePhoto = () => {
    setSelectedFile(null);
    setAvatarUrl('');
    setPhotoError('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleRevokeSessions = async () => {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch('http://localhost:8080/api/v1/user/sessions', {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        const data = await response.json();
        if (data.success) {
            fetchProfile(token!);
        } else {
            console.error('Failed to revoke sessions:', data.message);
        }
    } catch (e) {
        console.error('Error revoking sessions:', e);
    }
  };

  const calculateSecurityScore = () => {
      let score = 0;
      if (twoStepEnabled) score += 40;
      if (googleConnected || facebookConnected) score += 30;
      if (phone && phone.trim() !== '') score += 30;
      return score;
  };

  const getSecurityScoreDisplay = () => {
      const score = calculateSecurityScore();
      if (score === 100) return { text: 'Excellent', subtext: 'Account fully secured', color: 'text-[#10B981]' };
      if (score >= 70) return { text: 'Good', subtext: 'Mostly secure', color: 'text-[#F59E0B]' };
      if (score >= 40) return { text: 'Fair', subtext: 'Could be better', color: 'text-[#F59E0B]' };
      return { text: 'Poor', subtext: 'Take action now', color: 'text-[#ba1a1a]' };
  };

  const securityScore = getSecurityScoreDisplay();
  const displayDate = updatedAt ? new Date(updatedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : (createdAt ? new Date(createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : 'N/A');

  return (
    <div className="bg-[#f9f9ff] text-[#151c27] font-sans antialiased min-h-screen flex flex-col">
      {/* TopNavBar */}
      <UserTopNavigation />

      {/* Mobile Tab Selector */}
      <div className="flex md:hidden overflow-x-auto p-3 gap-2 border-b border-[#e2e8f0] bg-white sticky top-20 z-30 shadow-xs">
        <button 
          onClick={() => setActiveTab('personal-info')}
          className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-colors ${
            activeTab === 'personal-info' ? 'bg-[#003fb1] text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Personal Info
        </button>
        <button 
          onClick={() => setActiveTab('security')}
          className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-colors ${
            activeTab === 'security' ? 'bg-[#003fb1] text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Security
        </button>
        <button 
          onClick={() => setActiveTab('notifications')}
          className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-colors ${
            activeTab === 'notifications' ? 'bg-[#003fb1] text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Notifications
        </button>
        <button 
          onClick={() => setActiveTab('public-profile')}
          className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-colors ${
            activeTab === 'public-profile' ? 'bg-[#003fb1] text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Public Profile
        </button>
      </div>

      {/* Main Content Area */}
      <div className="flex flex-col md:flex-row pt-4 md:pt-20 min-h-screen max-w-7xl mx-auto w-full">
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

          <div className="mt-8 px-2">
            <h3 className="text-[12px] font-medium text-[#53606c] uppercase tracking-wider mb-2 px-4">Public Profile</h3>
            <nav className="flex flex-col gap-1">
              <button 
                onClick={() => setActiveTab('public-profile')}
                className={`flex items-center gap-4 px-4 py-3 rounded-xl transition-all w-full text-left ${activeTab === 'public-profile' ? 'text-[#003fb1] font-bold bg-[#1a56db]/10 translate-x-1 shadow-sm border border-[#c3c5d7]/30' : 'text-[#53606c] hover:bg-[#d6e4f3]/50 hover:text-[#586672]'}`}
              >
                <span className="material-symbols-outlined" style={activeTab === 'public-profile' ? {fontVariationSettings: "'FILL' 1"} : {}}>visibility</span>
                <span className="text-[14px]">View Public Profile</span>
              </button>
            </nav>
          </div>
        </aside>

        {/* Right Panel */}
        <main className="flex-1 w-full px-4 md:px-10 py-8">
          
          {/* Notification Banners */}
          {profileSuccessMsg && (
            <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl flex items-center justify-between shadow-xs animate-fadeIn">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-emerald-600 text-[22px]">check_circle</span>
                <span className="text-sm font-semibold">{profileSuccessMsg}</span>
              </div>
              <button 
                onClick={() => setProfileSuccessMsg('')} 
                className="text-emerald-600 hover:text-emerald-800 p-1 rounded-lg"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>
          )}

          {profileErrorMsg && (
            <div className="mb-6 p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl flex items-center justify-between shadow-xs animate-fadeIn">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-rose-600 text-[22px]">error</span>
                <span className="text-sm font-semibold">{profileErrorMsg}</span>
              </div>
              <button 
                onClick={() => setProfileErrorMsg('')} 
                className="text-rose-600 hover:text-rose-800 p-1 rounded-lg"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>
          )}

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
                    <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-[#f0f3ff] ring-1 ring-[#c3c5d7]/20 flex items-center justify-center bg-[#003fb1] text-white font-bold text-4xl select-none shadow-sm">
                      {avatarUrl && avatarUrl !== DEFAULT_AVATAR ? (
                        <img alt="User Photo" className="w-full h-full object-cover" src={avatarUrl} />
                      ) : (
                        <span>{getInitials(fullName)}</span>
                      )}
                    </div>
                  </div>

                  <div className="flex-1 w-full space-y-8 md:pr-36">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-y-8 gap-x-6">
                      <div className="flex flex-col gap-1">
                        <label className="text-[14px] text-[#737686] uppercase tracking-wider font-medium">Full Name</label>
                        <p className="text-[18px] text-[#151c27] font-bold">{fullName}</p>
                      </div>
                      <div className="flex flex-col gap-1">
                        <label className="text-[14px] text-[#737686] uppercase tracking-wider font-medium">Email Address</label>
                        <p className="text-[16px] text-[#434654]">{email}</p>
                      </div>
                      <div className="flex flex-col gap-1">
                        <label className="text-[14px] text-[#737686] uppercase tracking-wider font-medium">Phone Number</label>
                        <p className="text-[16px] text-[#434654] font-medium">{formatDisplayPhone(phone, country)}</p>
                      </div>
                      <div className="flex flex-col gap-1">
                        <label className="text-[14px] text-[#737686] uppercase tracking-wider font-medium">Country/Region</label>
                        <p className="text-[16px] text-[#434654] font-medium flex items-center gap-1.5">
                          {getCountryDisplayName(country)}
                        </p>
                      </div>
                      <div className="flex flex-col gap-1">
                        <label className="text-[14px] text-[#737686] uppercase tracking-wider font-medium">Date of Birth</label>
                        <p className="text-[16px] text-[#434654]">{dateOfBirth ? new Date(dateOfBirth).toLocaleDateString() : 'Not Set'}</p>
                      </div>
                      {isHealthcare && (
                        <>
                          <div className="flex flex-col gap-1">
                            <label className="text-[14px] text-[#737686] uppercase tracking-wider font-medium">Blood Group</label>
                            <p className="text-[16px] text-[#434654]">{bloodGroup || 'Not Set'}</p>
                          </div>
                          <div className="flex flex-col gap-1">
                            <label className="text-[14px] text-[#737686] uppercase tracking-wider font-medium">Weight</label>
                            <p className="text-[16px] text-[#434654]">{weight ? `${weight} kg` : 'Not Set'}</p>
                          </div>
                          <div className="flex flex-col gap-1">
                            <label className="text-[14px] text-[#737686] uppercase tracking-wider font-medium">Heart Rate</label>
                            <p className="text-[16px] text-[#434654]">{heartRate ? `${heartRate} bpm` : 'Not Set'}</p>
                          </div>
                        </>
                      )}
                      {!isHealthcare && (
                        <div className="flex flex-col gap-1">
                          <label className="text-[14px] text-[#737686] uppercase tracking-wider font-medium">Account Status</label>
                          <p className="text-[16px] text-green-700 font-semibold flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-green-500"></span> Active Verified Member
                          </p>
                        </div>
                      )}
                      {organizationName && (
                        <div className="flex flex-col gap-1">
                          <label className="text-[14px] text-[#737686] uppercase tracking-wider font-medium">Affiliated Institution</label>
                          <div className="flex items-center gap-2.5 mt-0.5">
                            {organizationLogo && (
                              <img src={organizationLogo} alt={organizationName} className="w-7 h-7 rounded-full object-cover border border-[#c3c5d7]" />
                            )}
                            <div>
                              <p className="text-[16px] text-[#151c27] font-semibold">{organizationName}</p>
                              {tenantAdminName && (
                                <p className="text-[12px] text-[#737686]">Admin: {tenantAdminName}</p>
                              )}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                    {isHealthcare && (
                      <div className="flex flex-col gap-1 mt-8">
                        <label className="text-[14px] text-[#737686] uppercase tracking-wider font-medium">Allergies</label>
                        <p className="text-[16px] text-[#434654]">{allergies || 'None'}</p>
                      </div>
                    )}
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
                        <p className="text-[12px] text-[#434654] mt-1">Your identity was verified on {createdAt ? new Date(createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : 'recently'}.</p>
                    </div>
                </div>
                <div className="bg-[#006f4b]/10 p-6 rounded-xl flex items-start gap-4">
                    <div className="bg-[#005438]/10 p-3 rounded-lg text-[#005438]">
                        <span className="material-symbols-outlined">history</span>
                    </div>
                    <div>
                        <p className="text-[14px] font-medium text-[#151c27]">Last Login</p>
                        <p className="text-[12px] text-[#434654] mt-1">
                          {lastLoginAt ? (() => {
                            const diffMins = Math.floor((new Date().getTime() - new Date(lastLoginAt).getTime()) / 60000);
                            const diffHours = Math.floor(diffMins / 60);
                            const diffDays = Math.floor(diffHours / 24);
                            let timeStr = 'recently';
                            if (diffDays > 0) timeStr = `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
                            else if (diffHours > 0) timeStr = `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
                            else if (diffMins > 0) timeStr = `${diffMins} minute${diffMins !== 1 ? 's' : ''} ago`;
                            return `${timeStr} from ${lastLoginLocation}`;
                          })() : `Recently from ${lastLoginLocation}`}
                        </p>
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
                          <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-[#f0f3ff] shadow-sm flex items-center justify-center bg-[#003fb1] text-white font-bold text-4xl select-none">
                            {avatarUrl && avatarUrl !== DEFAULT_AVATAR ? (
                              <img alt="User Avatar" className="w-full h-full object-cover" src={avatarUrl} />
                            ) : (
                              <span>{getInitials(fullName)}</span>
                            )}
                          </div>
                          <button
                              type="button"
                              onClick={() => fileInputRef.current?.click()}
                              className="absolute bottom-0 right-0 bg-[#003fb1] hover:bg-[#002f87] text-white p-2.5 rounded-full shadow-md hover:scale-105 transition-all material-symbols-outlined text-[18px] cursor-pointer">
                              edit
                          </button>
                      </div>
                      <div className="text-center md:text-left">
                          <h3 className="text-[24px] font-semibold text-[#151c27]">Profile Picture</h3>
                          <p className="text-[#434654] text-[14px] mt-1">PNG, JPG, or WebP. Max size of 5MB.</p>
                          <div className="mt-4 flex gap-4 justify-center md:justify-start">
                              <input 
                                type="file" 
                                accept="image/png, image/jpeg, image/webp, image/jpg" 
                                className="hidden" 
                                ref={fileInputRef} 
                                onChange={handleFileChange} 
                              />
                              <button 
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                className="px-6 py-2 bg-[#003fb1] text-white font-medium text-[14px] rounded-lg shadow-sm hover:opacity-90 transition-opacity cursor-pointer">
                                Upload Photo
                              </button>
                              <button 
                                type="button"
                                onClick={handleRemovePhoto}
                                className="px-6 py-2 text-[#434654] border border-[#c3c5d7] font-medium text-[14px] rounded-lg hover:bg-[#f0f3ff] transition-colors cursor-pointer">
                                Remove
                              </button>
                          </div>
                          {photoError && (
                            <p className="text-xs text-rose-600 font-semibold mt-2">{photoError}</p>
                          )}
                      </div>
                  </div>

                  {/* Inputs Section */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="flex flex-col gap-2">
                          <label className="font-medium text-[14px] text-[#151c27] ml-1">Full Name</label>
                          <input
                              className="w-full bg-white border border-[#737686] rounded-lg px-6 py-3 text-[16px] focus:ring-2 focus:ring-[#003fb1] focus:border-transparent outline-none transition-all"
                              placeholder="Enter your full name" type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} />
                      </div>
                      <div className="flex flex-col gap-2">
                          <label className="font-medium text-[14px] text-[#151c27] ml-1">Phone Number</label>
                          <div className="relative group">
                            <div className="absolute left-[1px] top-[1px] bottom-[1px] flex items-center border-r border-[#c3c5d7] pr-2 pl-3 bg-[#f9f9ff] rounded-l-[7px] pointer-events-auto">
                              <select 
                                value={country}
                                onChange={(e) => setCountry(e.target.value)}
                                className="bg-transparent border-none outline-none p-0 pr-4 text-[14px] text-[#434654] font-medium cursor-pointer appearance-none focus:ring-0" 
                                style={{backgroundImage: "url(\"data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3E%3Cpath stroke='%23737686' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3E%3C/svg%3E\")", backgroundPosition: "right 0 center", backgroundRepeat: "no-repeat", backgroundSize: "1.2em 1.2em"}} 
                                id="countryCode"
                              >
                                {Object.entries(COUNTRY_CONFIGS).map(([code, cfg]) => (
                                  <option key={code} value={code}>
                                    {cfg.flag} {code}
                                  </option>
                                ))}
                              </select>
                            </div>
                            <input
                              className={`w-full pl-[95px] pr-4 py-3 bg-white border ${phoneError ? 'border-red-500' : 'border-[#737686]'} rounded-lg text-[16px] focus:ring-2 focus:ring-[#003fb1] focus:border-transparent outline-none transition-all`}
                              id="phone"
                              placeholder={country === '+977' ? '98XXXXXXXX' : '0000000000'}
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
                                  readOnly type="email" value={email} />
                              <span className="absolute right-6 top-1/2 -translate-y-1/2 material-symbols-outlined text-[#737686] text-[20px]">lock</span>
                          </div>
                          <p className="text-[#434654] font-medium text-[12px] ml-1">Email address cannot be changed. Contact support for help.</p>
                      </div>
                  </div>
                  
                  {/* Profile Fields Section (Medical fields only for healthcare) */}
                  {isHealthcare ? (
                      <div className="mt-8 border-t border-[#e7eefe] pt-8">
                          <h4 className="text-[18px] font-semibold text-[#151c27] mb-6">Medical Profile</h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              <div className="flex flex-col gap-2">
                                  <label className="font-medium text-[14px] text-[#151c27] ml-1">Date of Birth</label>
                                  <input
                                      className="w-full bg-white border border-[#737686] rounded-lg px-6 py-3 text-[16px] focus:ring-2 focus:ring-[#003fb1] focus:border-transparent outline-none transition-all"
                                      type="date"
                                      value={dateOfBirth}
                                      onChange={(e) => setDateOfBirth(e.target.value)}
                                  />
                              </div>
                              <div className="flex flex-col gap-2">
                                  <label className="font-medium text-[14px] text-[#151c27] ml-1">Blood Group</label>
                                  <select
                                      className="w-full bg-white border border-[#737686] rounded-lg px-6 py-3 text-[16px] focus:ring-2 focus:ring-[#003fb1] focus:border-transparent outline-none transition-all"
                                      value={bloodGroup}
                                      onChange={(e) => setBloodGroup(e.target.value)}
                                  >
                                      <option value="">Select Blood Group</option>
                                      <option value="A+">A+</option>
                                      <option value="A-">A-</option>
                                      <option value="B+">B+</option>
                                      <option value="B-">B-</option>
                                      <option value="O+">O+</option>
                                      <option value="O-">O-</option>
                                      <option value="AB+">AB+</option>
                                      <option value="AB-">AB-</option>
                                  </select>
                              </div>
                              <div className="flex flex-col gap-2">
                                  <label className="font-medium text-[14px] text-[#151c27] ml-1">Weight (kg)</label>
                                  <input
                                      className="w-full bg-white border border-[#737686] rounded-lg px-6 py-3 text-[16px] focus:ring-2 focus:ring-[#003fb1] focus:border-transparent outline-none transition-all"
                                      placeholder="E.g., 70"
                                      type="number"
                                      step="0.1"
                                      value={weight}
                                      onChange={(e) => setWeight(e.target.value)}
                                  />
                              </div>
                              <div className="flex flex-col gap-2">
                                  <label className="font-medium text-[14px] text-[#151c27] ml-1">Heart Rate (bpm)</label>
                                  <input
                                      className="w-full bg-white border border-[#737686] rounded-lg px-6 py-3 text-[16px] focus:ring-2 focus:ring-[#003fb1] focus:border-transparent outline-none transition-all"
                                      placeholder="E.g., 72"
                                      type="number"
                                      value={heartRate}
                                      onChange={(e) => setHeartRate(e.target.value)}
                                  />
                              </div>
                          </div>
                          <div className="flex flex-col gap-2 mt-6">
                              <label className="font-medium text-[14px] text-[#151c27] ml-1">Allergies (if any)</label>
                              <input
                                  className="w-full bg-white border border-[#737686] rounded-lg px-6 py-3 text-[16px] focus:ring-2 focus:ring-[#003fb1] focus:border-transparent outline-none transition-all"
                                  placeholder="E.g., Peanuts, Penicillin"
                                  type="text"
                                  value={allergies}
                                  onChange={(e) => setAllergies(e.target.value)}
                              />
                          </div>
                      </div>
                  ) : (
                      <div className="mt-8 border-t border-[#e7eefe] pt-8">
                          <h4 className="text-[18px] font-semibold text-[#151c27] mb-6">Additional Information</h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              <div className="flex flex-col gap-2">
                                  <label className="font-medium text-[14px] text-[#151c27] ml-1">Date of Birth</label>
                                  <input
                                      className="w-full bg-white border border-[#737686] rounded-lg px-6 py-3 text-[16px] focus:ring-2 focus:ring-[#003fb1] focus:border-transparent outline-none transition-all"
                                      type="date"
                                      value={dateOfBirth}
                                      onChange={(e) => setDateOfBirth(e.target.value)}
                                  />
                              </div>
                          </div>
                      </div>
                  )}

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
                          <input type="checkbox" className="sr-only peer" checked={twoStepEnabled} onChange={handleTwoStepToggle} />
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
                                              <p className="text-[12px] font-medium text-[#434654]">{googleConnected ? `Connected to ${googleEmail}` : 'Not Connected'}</p>
                                          </div>
                                      </div>
                                      {googleConnected ? (
                                          <button onClick={() => handleDisconnect('google')} className="px-3 py-1 text-[12px] font-bold bg-[#dce2f3] text-[#434654] rounded hover:bg-[#c3c5d7] transition-colors">Disconnect</button>
                                      ) : (
                                          <button onClick={() => handleGoogleConnect()} className="px-3 py-1 text-[12px] font-bold border border-[#003fb1] text-[#003fb1] rounded hover:bg-[#003fb1]/5 transition-colors">Connect</button>
                                      )}
                                  </div>
                                  <div className={`flex items-center justify-between p-4 rounded-lg ${facebookConnected ? 'bg-[#f0f3ff] border border-[#dce2f3]/50' : 'bg-white border border-dashed border-[#c3c5d7]'}`}>
                                      <div className="flex items-center gap-4">
                                          <div className="w-8 h-8 rounded-full bg-[#d6e4f3]/30 flex items-center justify-center">
                                              <svg fill="#1877F2" height="18" viewBox="0 0 24 24" width="18" xmlns="http://www.w3.org/2000/svg">
                                                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"></path>
                                              </svg>
                                          </div>
                                          <div>
                                              <p className="text-[14px] font-bold text-[#151c27]">Facebook</p>
                                              <p className="text-[12px] text-[#53606c] font-medium">{facebookConnected ? `Connected to ${facebookEmail}` : 'Not Connected'}</p>
                                          </div>
                                      </div>
                                      {facebookConnected ? (
                                          <button onClick={() => handleDisconnect('facebook')} className="px-3 py-1 text-[12px] font-bold bg-[#dce2f3] text-[#434654] rounded hover:bg-[#c3c5d7] transition-colors">Disconnect</button>
                                      ) : (
                                          <FacebookLogin
                                              appId="1963537654308866"
                                              fields="name,email,picture"
                                              callback={handleFacebookConnect}
                                              render={(renderProps: any) => (
                                                  <button onClick={renderProps.onClick} className="px-3 py-1 text-[12px] font-bold border border-[#003fb1] text-[#003fb1] rounded hover:bg-[#003fb1]/5 transition-colors">Connect</button>
                                              )}
                                          />
                                      )}
                                  </div>
                              </div>
                          </section>
                          
                          {/* Active Sessions */}
                          <section className="bg-white rounded-xl p-6 shadow-[0_4px_20px_rgba(26,86,219,0.05)] border border-[#151c27]/5">
                                <div className="flex items-center gap-4 border-b border-[#dce2f3] pb-4">
                                    <span className="material-symbols-outlined text-[#003fb1]">devices</span>
                                    <h3 className="text-[20px] font-medium">Where You're Logged In</h3>
                                </div>
                                
                                {sessions && sessions.length > 0 ? (
                                    sessions.map((session, index) => (
                                        <div key={index} className="flex items-start gap-6 p-4 hover:bg-[#f0f3ff] rounded-lg transition-colors cursor-default">
                                            <div className="w-10 h-10 rounded-lg bg-[#003fb1]/5 flex items-center justify-center text-[#003fb1]">
                                                <span className="material-symbols-outlined">
                                                    {session.deviceOS && (session.deviceOS.toLowerCase().includes('mac') || session.deviceOS.toLowerCase().includes('windows')) ? 'laptop' : 'smartphone'}
                                                </span>
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex justify-between items-start">
                                                    <p className="text-[16px] font-bold text-[#151c27]">
                                                        {session.deviceOS} • {session.browser}
                                                    </p>
                                                    {session.isCurrentSession && (
                                                        <span className="text-[10px] font-bold px-2 py-0.5 bg-[#005438]/10 text-[#005438] rounded-full uppercase tracking-wider">Active Now</span>
                                                    )}
                                                </div>
                                                <p className="text-[14px] font-medium text-[#434654] mt-1">{session.location || 'Unknown Location'}</p>
                                                <div className="mt-2 flex items-center gap-2 text-[#10B981]">
                                                    <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse"></span>
                                                    <span className="text-[12px] font-medium">Verified session</span>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-[14px] font-medium text-[#434654] mt-1">No session history available.</p>
                                )}

                                <button onClick={handleRevokeSessions} className="w-full text-[14px] font-bold text-[#ba1a1a] py-2 hover:bg-[#ba1a1a]/5 rounded-lg transition-colors">
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
                          <p className="text-[12px] font-medium text-[#434654]">{displayDate}</p>
                      </div>
                      <div className="bg-[#f0f3ff] p-6 rounded-xl border border-[#dce2f3]/30 text-center">
                          <span className={`material-symbols-outlined ${securityScore.color} mb-2`}>shield_lock</span>
                          <p className="text-[12px] font-bold text-[#151c27]">Score: {securityScore.text}</p>
                          <p className="text-[12px] font-medium text-[#434654]">{securityScore.subtext}</p>
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

          {activeTab === 'public-profile' && (
            <>
            <div className="max-w-5xl mx-auto space-y-6">
                {/* Page Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-6">
                    <div>
                        <h1 className="text-[32px] font-semibold text-[#151c27]">{fullName ? `${fullName}'s Public Profile` : 'My Public Profile'}</h1>
                        <p className="text-[16px] text-[#434654] mt-1">This is what other community members see.</p>
                    </div>
                    <button
                        onClick={() => setActiveTab('personal-info')}
                        className="flex items-center gap-2 px-6 py-2 border border-[#737686] text-[#53606c] font-medium text-[14px] rounded-xl hover:bg-[#f0f3ff] hover:text-[#003fb1] transition-all">
                        <span className="material-symbols-outlined text-[20px]">edit</span>
                        Edit Profile
                    </button>
                </div>
                {/* Card 1: User Hero */}
                <section
                    className="bg-[#ffffff] rounded-xl shadow-[0_4px_20px_rgba(26,86,219,0.05)] p-12 text-center overflow-hidden relative">
                    <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-r from-[#003fb1]/5 to-[#e7eefe]">
                    </div>
                    <div className="relative z-10 flex flex-col items-center">
                        <div className="p-1 bg-white rounded-full shadow-lg mb-6">
                            <img alt={`${fullName} Profile`} className="w-32 h-32 rounded-full object-cover"
                                src={avatarUrl} />
                        </div>
                        <h2 className="text-[24px] font-semibold text-[#151c27] mb-2">{fullName || 'Verified Member'}</h2>
                        <div className="flex items-center gap-2 px-6 py-1 bg-[#005438]/10 rounded-full">
                            <span className="material-symbols-outlined text-[18px] text-[#005438]"
                                style={{ fontVariationSettings: "'FILL' 1" }}>verified_user</span>
                            <span className="text-[14px] text-[#005438] font-semibold">
                              Verified Member • {createdAt ? `Joined ${new Date(createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}` : 'Active OmniBook Member'}
                            </span>
                        </div>
                    </div>
                </section>
                {/* Stats Grid Section */}
                <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div
                        className="bg-[#ffffff] p-6 rounded-xl shadow-[0_4px_20px_rgba(26,86,219,0.05)] flex items-center gap-6 border border-transparent hover:border-[#1a56db]/20 transition-all">
                        <div className="w-12 h-12 rounded-xl bg-[#003fb1]/10 flex items-center justify-center text-[#003fb1]">
                            <span className="material-symbols-outlined">stars</span>
                        </div>
                        <div>
                            <p className="text-[24px] font-bold text-[#151c27]">{successfulBookingsCount > 0 ? Math.min(successfulBookingsCount, 5) : 0}</p>
                            <p className="text-[14px] text-[#53606c]">Reviews Shared</p>
                        </div>
                    </div>
                    <div
                        className="bg-[#ffffff] p-6 rounded-xl shadow-[0_4px_20px_rgba(26,86,219,0.05)] flex items-center gap-6 border border-transparent hover:border-[#1a56db]/20 transition-all">
                        <div className="w-12 h-12 rounded-xl bg-[#ba1a1a]/10 flex items-center justify-center text-[#ba1a1a]">
                            <span className="material-symbols-outlined"
                                style={{ fontVariationSettings: "'FILL' 1" }}>favorite</span>
                        </div>
                        <div>
                            <p className="text-[24px] font-bold text-[#151c27]">1</p>
                            <p className="text-[14px] text-[#53606c]">Favorite {terms.providerPlural}</p>
                        </div>
                    </div>
                    <div
                        className="bg-[#ffffff] p-6 rounded-xl shadow-[0_4px_20px_rgba(26,86,219,0.05)] flex items-center gap-6 border border-transparent hover:border-[#1a56db]/20 transition-all">
                        <div className="w-12 h-12 rounded-xl bg-[#005438]/10 flex items-center justify-center text-[#005438]">
                            <span className="material-symbols-outlined">calendar_month</span>
                        </div>
                        <div>
                            <p className="text-[24px] font-bold text-[#151c27]">{successfulBookingsCount || 0}</p>
                            <p className="text-[14px] text-[#53606c]">Successful Bookings</p>
                        </div>
                    </div>
                </section>
                {/* Layout Row for About and Activity */}
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                    {/* Card 2: About Me (Left column) */}
                    <section
                        className="lg:col-span-3 bg-[#ffffff] rounded-xl shadow-[0_4px_20px_rgba(26,86,219,0.05)] p-12 border border-transparent hover:transform hover:-translate-y-1 transition-all duration-300">
                        <div className="flex items-center gap-4 mb-6">
                            <span className="material-symbols-outlined text-[#003fb1]">person</span>
                            <h3 className="text-[20px] font-bold text-[#151c27]">About Me</h3>
                        </div>
                        <div className="space-y-6">
                            <p className="text-[16px] text-[#434654] leading-relaxed">
                                {isHealthcare
                                  ? `I value timely healthcare consultations and professional clinical services. When not busy, I enjoy staying active and prioritizing health & wellness.`
                                  : `I value efficiency and reliability in all professional services. My goal is to connect with top-tier ${terms.providerPlural.toLowerCase()} and maintain seamless scheduling.`
                                }
                            </p>
                            <p className="text-[16px] text-[#434654] leading-relaxed">
                                I've been an active member of OmniBook, utilizing verified bookings and appointments for dependable services and transparent experiences.
                            </p>
                            <div className="flex flex-wrap gap-2 pt-4">
                                <span
                                    className="px-4 py-1 bg-[#f0f3ff] text-[#53606c] text-[14px] rounded-full">{terms.facilityLabel}</span>
                                <span
                                    className="px-4 py-1 bg-[#f0f3ff] text-[#53606c] text-[14px] rounded-full">Verified Client</span>
                                <span
                                    className="px-4 py-1 bg-[#f0f3ff] text-[#53606c] text-[14px] rounded-full">Active Booker</span>
                            </div>
                        </div>
                    </section>
                    {/* Card 4: Activity (Right column) */}
                    <section
                        className="lg:col-span-2 bg-[#ffffff] rounded-xl shadow-[0_4px_20px_rgba(26,86,219,0.05)] p-12 flex flex-col hover:transform hover:-translate-y-1 transition-all duration-300">
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-4">
                                <span className="material-symbols-outlined text-[#003fb1]">history</span>
                                <h3 className="text-[20px] font-bold text-[#151c27]">Recent Activity</h3>
                            </div>
                            <span className="text-[12px] text-[#53606c] cursor-pointer hover:underline">See all</span>
                        </div>
                        <div
                            className="bg-[#f0f3ff]/50 rounded-xl p-6 border border-[#c3c5d7]/30 flex-1">
                            <div className="flex items-center gap-2 mb-4">
                                <div className="flex text-[#005438]">
                                    <span className="material-symbols-outlined text-[16px]"
                                        style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                                    <span className="material-symbols-outlined text-[16px]"
                                        style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                                    <span className="material-symbols-outlined text-[16px]"
                                        style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                                    <span className="material-symbols-outlined text-[16px]"
                                        style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                                    <span className="material-symbols-outlined text-[16px]"
                                        style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                                </div>
                                <span className="text-[#53606c] text-[12px]">• Verified Service</span>
                            </div>
                            <h4 className="text-[14px] font-bold text-[#151c27] mb-1">Feedback for {terms.providerSingular}
                            </h4>
                            <p className="text-[14px] text-[#434654] italic leading-relaxed">
                                "Excellent care and extremely professional. The booking process was seamless and the session started right on time."
                            </p>
                            <div
                                className="mt-6 pt-6 border-t border-[#c3c5d7]/20 flex items-center justify-between">
                                <span className="text-[#005438] text-[12px] flex items-center gap-1">
                                    <span className="material-symbols-outlined text-[14px]">thumb_up</span>
                                    Verified Experience
                                </span>
                                <span className="material-symbols-outlined text-[#737686] text-[18px]">more_horiz</span>
                            </div>
                        </div>
                        <div className="mt-6 flex items-center gap-4">
                            <div
                                className="w-8 h-8 rounded-full bg-[#d6e4f3] flex items-center justify-center text-[#586672]">
                                <span className="material-symbols-outlined text-[18px]">favorite</span>
                            </div>
                            <p className="text-[14px] text-[#53606c]">Saved favorite <span
                                    className="text-[#151c27] font-semibold">{terms.facilityLabel}</span>.</p>
                        </div>
                    </section>
                </div>
            </div>
            </>
          )}

        </main>
      </div>

    </div>
  );
};

export default ProfileSettingPage;
