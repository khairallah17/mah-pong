import React, { useState, useEffect } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import axios from 'axios';
import Swal from 'sweetalert2';
import { useSidebarContext } from '../hooks/useSidebar';
import '../i18n';
import { useTranslation } from 'react-i18next';
import { useAuthContext } from '../hooks/useAuthContext';

export default function Security() {
  const { t } = useTranslation();
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [mfaCode, setMfaCode] = useState("");
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [passErr, setPassErr] = useState("")
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [is2FAEnabled, setIs2FAEnabled] = useState(false);
  const [showQRCode, setShowQRCode] = useState(false);
  const [qrCodeData, setQrCodeData] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationError, setVerificationError] = useState("");

  const { setActiveLink } = useSidebarContext()

  const { authtoken } = useAuthContext()

  useEffect(() => {
    setActiveLink('security')
    fetchQRCode();
  }, []);

  useEffect(() => {
    let regularExpression = /^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{6,16}$/;
    if (newPassword != confirmPassword) {
      setPassErr("Passwords does not match")
    }
    else if (!newPassword.match(regularExpression)) {
      setPassErr("Password should at least has one charachtere, number and special character")
    } else if(newPassword == confirmPassword) {
      setPassErr(null)
    }
  },[newPassword, confirmPassword])

  const fetchQRCode = async () => {
    try {
      
      const response = await axios.get('/api/usermanagement/api/2fa/setup/', {
        headers: {
          'Authorization': `Bearer ${authtoken}`,
          'Content-Type': 'application/json'
        }
      });
      
      setQrCodeData(response.data.qr_code);
      setIs2FAEnabled(response.data.is_enabled);
      setShowQRCode(!response.data.is_enabled);
    } catch (error) {
      console.error('Failed to fetch QR code', error);
      Swal.fire({
        icon: 'error',
        title: t('Failed to fetch QR code'),
        text: t('Please try again later.'),
        showConfirmButton: true
      });
    }
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      Swal.fire({
        icon: 'error',
        title: t('Password Mismatch'),
        text: t('New password and confirm password do not match. Please try again.'),
        showConfirmButton: true
      });
      return;
    }
    // Add your password update logic here
    if (oldPassword === "" || newPassword === "" || confirmPassword === "") {
      Swal.fire({
        icon: 'error',
        title: t('Empty Fields'),
        text: t('Please fill all the fields and try again.'),
        showConfirmButton: true
      });
      return;
    }
    if (oldPassword === newPassword) {
      Swal.fire({
        icon: 'error',
        title: t('Same Password'),
        text: t('Old and new password cannot be the same. Please try again.'),
        showConfirmButton: true
      });
      return;
    }
    // Password update logic
    try {
    

      const response = await axios.post('/api/usermanagement/api/change-password/', 
        { old_password: oldPassword, new_password: newPassword, confirm_password: confirmPassword },
        {
          headers: {
            'Authorization': `Bearer ${authtoken}`,
            'Content-Type': 'application/json'
          }
        }
      );
      if (response.data.error) {
        Swal.fire({
          icon: 'error',
          title: t('Failed to Update Password'),
          text: t('An error occurred.'),
          showConfirmButton: true
        });
        return;
      }
      Swal.fire({
        icon: 'success',
        title: t('Password Updated'),
        showConfirmButton: false,
        timer: 3000
      });
    }
    catch (error) {
      // More detailed error handling
      let errorMessage = 'An error occurred while trying to update your password. Please try again.';
      
      if (error.response && error.response.data) {
        if (error.response.data.error) {
          // If the backend sends a specific error message
          errorMessage = error.response.data.error;
        } else if (Array.isArray(error.response.data.error)) {
          // If the backend sends an array of error messages (e.g., password validation errors)
          errorMessage = error.response.data.error.join(', ');
        }
      }
      
      Swal.fire({
        icon: 'error',
        title: t('Failed to Update Password'),
        text: errorMessage,
        showConfirmButton: true,
        timer: 3000
      });
    }
  };

  const togglePasswordVisibility = (field) => {
    switch (field) {
      case 'old':
        setShowOldPassword(!showOldPassword);
        break;
      case 'new':
        setShowNewPassword(!showNewPassword);
        break;
      case 'confirm':
        setShowConfirmPassword(!showConfirmPassword);
        break;
      default:
        break;
    }
  };

  const handleVerifyAndEnable = async () => {
    setIsVerifying(true);
    setVerificationError("");

    try {
      
      const response = await axios.post('/api/usermanagement/api/2fa/verify/', 
        { otp: mfaCode },
        {
          headers: {
            'Authorization': `Bearer ${authtoken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.status === 200) {
        setIs2FAEnabled(true);
        setShowQRCode(false);
        Swal.fire({
          icon: 'success',
          title: t('2FA Successfully Enabled'),
          showConfirmButton: false,
          timer: 1500
        });
      } else {
        throw new Error('Verification failed');
      }
    } catch (error) {
      console.error('2FA verification failed:', error);
      setVerificationError(t('Invalid 2FA code. Please try again.'));
      Swal.fire({
        icon: 'error',
        title: t('Verification Failed'),
        text: t('Please check your 2FA code and try again.'),
        showConfirmButton: true
      });
    } finally {
      setIsVerifying(false);
    }
  };

  const handleDisable2FA = async () => {
    try {
      
      const response = await axios.post('/api/usermanagement/api/2fa/disable/', 
        {},
        {
          headers: {
            'Authorization': `Bearer ${authtoken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.status === 200) {
        setIs2FAEnabled(false);
        setShowQRCode(true);
        Swal.fire({
          icon: 'success',
          title: t('2FA Successfully Disabled'),
          showConfirmButton: false,
          timer: 1500
        });
      } else {
        throw new Error('Failed to disable 2FA');
      }
    } catch (error) {
      console.error('Failed to disable 2FA:', error);
      Swal.fire({
        icon: 'error',
        title: t('Failed to Disable 2FA'),
        text: t('An error occurred while trying to disable 2FA. Please try again.'),
        showConfirmButton: true
      });
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-8 space-y-2 shadow-2xl shadow-black rounded-xl border border-gray-800 backdrop-blur-sm ">
      <h2 className="text-xl font-inter text-white">{t('Security')}</h2>
      <p className="text-xl font-normal text-gray-500">{t('Secure your account')}</p>
      <form onSubmit={handleUpdatePassword} className="space-y-6 pt-8 border-t border-white/80">
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-[200px]">
            <label htmlFor="old-password" className="block text-sm text-white/70 mb-2">{t('Old Password')}</label>
            <div className="relative">
              <input
                id="old-password"
                type={showOldPassword ? "text" : "password"}
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                className="w-full px-4 py-2 bg-black/80 border border-white/10 text-gray-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-white/5 transition-all"
                placeholder={t('Enter old password')}
              />
              <button
                type="button"
                onClick={() => togglePasswordVisibility('old')}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
              >
                {showOldPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
          </div>
          <div className="flex-1 min-w-[200px]">
            <label htmlFor="new-password" className="block text-sm text-white/70 mb-2">{t('New Password')}</label>
            <div className="relative">
              <input
                id="new-password"
                type={showNewPassword ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-4 py-2 bg-black/80 border border-white/10 text-gray-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-white/5 transition-all"
                placeholder={t('Enter new password')}
              />
              <button
                type="button"
                onClick={() => togglePasswordVisibility('new')}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
              >
                {showNewPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
          </div>
          <div className="flex-1 min-w-[200px]">
            <label htmlFor="confirm-password" className="block text-sm text-white/70 mb-2">{t('Confirm New Password')}</label>
            <div className="relative">
              <input
                id="confirm-password"
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-2 bg-black/80 border border-white/10 text-gray-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-white/5 transition-all"
                placeholder={t('Enter Confirm new password')}
              />
              <button
                type="button"
                onClick={() => togglePasswordVisibility('confirm')}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
              >
                {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
              {
                passErr && (
                  <p className='text-red-500'>{passErr}</p>
                )
              }
          </div>
        </div>
        <button type="submit" className="px-6 py-2 bg-white text-black rounded-lg hover:bg-white/90 transition-colors">
          {t('Update Password')}
        </button>
      </form>

      <div className="space-y-6">
        <h3 className="text-xl font-semibold text-white">{t('Two-Factor Authentication (2FA)')}</h3>
        <p className="text-gray-500">
          {t('Use an authenticator app and scan the QR code, or')}{" "}
          <button className="text-red-500 hover:underline">
            click here
          </button>{" "}
          {t('to copy the code and setup manually.')}
        </p>

        <div className="space-y-6 pt-8 border-t border-white/80">
          <p className="text-sm font-Inter text-gray-500">
            {t('Use a phone app like Password, Authy, LastPass Authenticator, or Microsoft Authenticator, etc. to get 2FA codes when prompted during sign-in.')}
          </p>
          <div className="flex items-center p-4 bg-yellow-500/20 border border-yellow-500/50 rounded-lg">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <p className="text-yellow-500">{t('Re-scan the QR code to update your 2FA settings')}</p>
          </div>
        </div>

        <div className="flex flex-col md:flex-row items-start gap-8">
          <div className="flex-1 w-full">
            <h4 className="text-lg mb-4 text-white">{t('Verify the code from the app')}</h4>
            <input
              type="text"
              value={mfaCode}
              onChange={(e) => setMfaCode(e.target.value)}
              className="w-full px-4 py-2 bg-black/80 border border-white/10 text-gray-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-white/5 transition-all mb-4"
              placeholder={t('Enter 2FA code')}
            />
            {verificationError && (
              <p className="text-red-500 mb-4">{verificationError}</p>
            )}
            <div className="flex flex-wrap gap-4">
              {!is2FAEnabled ? (
                <button 
                  onClick={handleVerifyAndEnable}
                  className={`px-6 py-2 bg-white text-black rounded-lg hover:bg-white/90 transition-colors ${isVerifying ? 'opacity-50 cursor-not-allowed' : ''}`}
                  disabled={isVerifying}
                >
                  {isVerifying ? t('Verifying...') : t('Verify & Enable')}
                </button>
              ) : (
                <button 
                  onClick={handleDisable2FA}
                  className="px-6 py-2 bg-[#BD3944] text-white rounded-lg hover:bg-red-600 transition-colors"
                >
                  {t('Disable 2FA')}
                </button>
              )}
            </div>
          </div>
          <div className={`w-full md:w-40 h-40 bg-white p-2 rounded-md relative ${!showQRCode ? 'overflow-hidden' : ''}`}>
            <div className={`w-full h-full bg-gray-200 rounded flex items-center justify-center text-gray-500 ${!showQRCode ? 'filter blur-sm' : ''}`}>
              {qrCodeData ? (
                <img 
                  className="w-full h-full object-scale-down" 
                  src={`data:image/png;base64,${qrCodeData}`}
                  alt="QR Code"
                />
              ) : (
                <p>{t('QR Code not available')}</p>
              )}
            </div>
            {!showQRCode && (
              <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 text-white">
                <p>{t('2FA Enabled')}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

