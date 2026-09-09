import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import axios from 'axios';
import { applyTheme } from '../../utils/themeUtils';
import { setAndBroadcastOrgType } from '../../utils/organizationTerms';

export const ResetPasswordPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();

  // Token verification states
  const [isValidating, setIsValidating] = useState(true);
  const [tokenValid, setTokenValid] = useState(false);
  const [tokenError, setTokenError] = useState('');
  
  // Organization / User context
  const [userEmail, setUserEmail] = useState('');
  const [userName, setUserName] = useState('');
  const [orgName, setOrgName] = useState('OmniBook');
  const [orgType, setOrgType] = useState('');
  const [accentColor, setAccentColor] = useState('#1853d9');

  // Form states
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);

  // Validate reset token on load
  useEffect(() => {
    const validateToken = async () => {
      if (!token) {
        setIsValidating(false);
        setTokenValid(false);
        setTokenError('No reset token provided. Please request a new password reset link.');
        return;
      }

      try {
        const response = await axios.get(`http://localhost:8080/api/auth/validate-reset-token?token=${token}`);
        if (response.data.valid) {
          setTokenValid(true);
          setUserEmail(response.data.email || '');
          setUserName(response.data.fullName || '');
          if (response.data.organizationName) {
            setOrgName(response.data.organizationName);
          }
          if (response.data.organizationType) {
            setOrgType(response.data.organizationType);
            setAndBroadcastOrgType(response.data.organizationType);
          }
          if (response.data.primaryAccentColor) {
            setAccentColor(response.data.primaryAccentColor);
            applyTheme(response.data.primaryAccentColor);
          }
        } else {
          setTokenValid(false);
          setTokenError(response.data.message || 'This password reset link is invalid or has expired.');
        }
      } catch (err: any) {
        setTokenValid(false);
        setTokenError(err.response?.data?.message || 'This password reset link has expired or is invalid.');
      } finally {
        setIsValidating(false);
      }
    };

    validateToken();
  }, [token]);

  // Calculate password strength
  const getPasswordStrength = (pass: string) => {
    let score = 0;
    if (!pass) return { score: 0, label: 'None', color: 'bg-slate-200' };
    if (pass.length >= 6) score += 1;
    if (pass.length >= 10) score += 1;
    if (/[A-Z]/.test(pass)) score += 1;
    if (/[0-9]/.test(pass)) score += 1;
    if (/[^A-Za-z0-9]/.test(pass)) score += 1;

    if (score <= 2) return { score: 1, label: 'Weak', color: 'bg-rose-500' };
    if (score <= 4) return { score: 2, label: 'Medium', color: 'bg-amber-500' };
    return { score: 3, label: 'Strong', color: 'bg-emerald-500' };
  };

  const strength = getPasswordStrength(newPassword);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!newPassword) {
      setFormError('Please enter a new password.');
      return;
    }

    if (newPassword.length < 6) {
      setFormError('Password must be at least 6 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setFormError('Passwords do not match. Please verify.');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await axios.post('http://localhost:8080/api/auth/reset-password', {
        token,
        newPassword
      });

      if (response.data.success) {
        setResetSuccess(true);
      } else {
        setFormError(response.data.message || 'Failed to reset password.');
      }
    } catch (err: any) {
      setFormError(err.response?.data?.message || 'Error occurred while resetting password.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col justify-center items-center p-4 sm:p-6 font-sans">
      <div className="w-full max-w-md">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2.5 mb-2 group">
            <img
              alt="OmniBook Logo"
              className="h-8 w-auto object-contain"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuCP848Ao0ojfxhSN1LNdwd3KU_3YRNt-oogm_0NYHPpX9f3Kj6QdoWf2Y31mZLevEgGo4z74fgsa-J9Y7qB0Lyi_LAO4RppllH_zzT07iOT51SxNlubsUHixFCTTNXTsBL3ssxTtiBvZzVCDyAEjdskNornnV_GxVSN1r7LaWUi4SAat-rG1khKomVfEXqSz1gEVPKJO-AjUn0Pl5uKYEAec31kOmbNwwCFaTeWNMVn_ko5tqjHlPota70XrUZWip-RLtiq8JreqDg"
            />
            <span className="text-2xl font-bold text-slate-900 tracking-tight">OmniBook</span>
          </Link>
          {orgName && orgName !== 'OmniBook' && (
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white border border-slate-200 rounded-full shadow-sm text-xs font-semibold text-slate-700 mt-1">
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: accentColor }}></span>
              <span>{orgName}</span>
              {orgType && <span className="text-slate-400 font-normal">({orgType})</span>}
            </div>
          )}
        </div>

        {/* Card Content */}
        <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/60 border border-slate-100 overflow-hidden p-6 sm:p-8">
          {isValidating ? (
            /* Loading State */
            <div className="py-12 text-center flex flex-col items-center">
              <div className="w-10 h-10 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mb-4" />
              <p className="text-sm font-medium text-slate-600">Verifying secure reset token...</p>
            </div>
          ) : !tokenValid ? (
            /* Token Invalid / Expired State */
            <div className="text-center py-4">
              <div className="w-14 h-14 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-rose-100">
                <span className="material-symbols-outlined text-[32px]">link_off</span>
              </div>
              <h2 className="text-xl font-bold text-slate-900 mb-2">Link Expired or Invalid</h2>
              <p className="text-sm text-slate-500 mb-6 leading-relaxed">
                {tokenError || 'This password reset link is invalid or has already been used. Please request a new one.'}
              </p>
              <Link
                to="/login"
                className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-sm font-semibold transition-all shadow-md"
              >
                <span className="material-symbols-outlined text-[18px]">arrow_back</span>
                <span>Back to Login</span>
              </Link>
            </div>
          ) : resetSuccess ? (
            /* Reset Success State */
            <div className="text-center py-4">
              <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4 border border-emerald-100 shadow-sm">
                <span className="material-symbols-outlined text-[36px]">check_circle</span>
              </div>
              <h2 className="text-2xl font-bold text-slate-900 mb-2">Password Updated!</h2>
              <p className="text-sm text-slate-600 mb-6 leading-relaxed">
                Your password has been successfully reset. You can now log into your account with your new password.
              </p>
              <button
                type="button"
                onClick={() => navigate('/login')}
                className="w-full py-3 px-4 rounded-xl text-white text-sm font-semibold shadow-md transition-all flex items-center justify-center gap-2"
                style={{ backgroundColor: accentColor }}
              >
                <span>Proceed to Login</span>
                <span className="material-symbols-outlined text-[18px]">login</span>
              </button>
            </div>
          ) : (
            /* Reset Form State */
            <div>
              <div className="mb-6">
                <h2 className="text-xl font-bold text-slate-900 mb-1">Set New Password</h2>
                <p className="text-xs text-slate-500">
                  {userName ? `Hi ${userName}, choose` : 'Choose'} a strong new password for{' '}
                  <span className="font-semibold text-slate-700">{userEmail}</span>.
                </p>
              </div>

              {formError && (
                <div className="mb-5 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px] shrink-0">error</span>
                  <span>{formError}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* New Password */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5" htmlFor="new-password">
                    New Password
                  </label>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-[18px]">
                      lock
                    </span>
                    <input
                      id="new-password"
                      type={showNewPassword ? 'text' : 'password'}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Minimum 6 characters"
                      className="w-full pl-10 pr-11 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-blue-100 focus:border-blue-600 outline-none transition-all text-slate-900"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none"
                    >
                      <span className="material-symbols-outlined text-[18px]">
                        {showNewPassword ? 'visibility_off' : 'visibility'}
                      </span>
                    </button>
                  </div>

                  {/* Password Strength Indicator */}
                  {newPassword && (
                    <div className="mt-2 space-y-1">
                      <div className="flex justify-between items-center text-[11px]">
                        <span className="text-slate-500">Strength:</span>
                        <span className={`font-semibold ${strength.score === 1 ? 'text-rose-600' : strength.score === 2 ? 'text-amber-600' : 'text-emerald-600'}`}>
                          {strength.label}
                        </span>
                      </div>
                      <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden flex gap-1">
                        <div className={`h-full flex-1 rounded-full transition-all duration-300 ${strength.score >= 1 ? strength.color : 'bg-slate-200'}`} />
                        <div className={`h-full flex-1 rounded-full transition-all duration-300 ${strength.score >= 2 ? strength.color : 'bg-slate-200'}`} />
                        <div className={`h-full flex-1 rounded-full transition-all duration-300 ${strength.score >= 3 ? strength.color : 'bg-slate-200'}`} />
                      </div>
                    </div>
                  )}
                </div>

                {/* Confirm Password */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5" htmlFor="confirm-password">
                    Confirm New Password
                  </label>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-[18px]">
                      lock_reset
                    </span>
                    <input
                      id="confirm-password"
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Re-enter your new password"
                      className="w-full pl-10 pr-11 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-blue-100 focus:border-blue-600 outline-none transition-all text-slate-900"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none"
                    >
                      <span className="material-symbols-outlined text-[18px]">
                        {showConfirmPassword ? 'visibility_off' : 'visibility'}
                      </span>
                    </button>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3 px-4 rounded-xl text-white text-sm font-semibold shadow-md transition-all flex items-center justify-center gap-2 hover:opacity-95 disabled:opacity-50"
                    style={{ backgroundColor: accentColor }}
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Updating Password...</span>
                      </>
                    ) : (
                      <span>Save New Password</span>
                    )}
                  </button>
                </div>
              </form>

              <div className="mt-5 text-center">
                <Link to="/login" className="text-xs text-slate-500 hover:text-slate-800 transition-colors">
                  Remember your password? <span className="font-semibold text-blue-600">Log In</span>
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="text-center mt-6 text-xs text-slate-400">
          Secure End-to-End Encrypted Session &bull; OmniBook System
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
