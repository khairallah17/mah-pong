<<<<<<< HEAD
import React, { useState, useEffect, useContext } from 'react';
import AuthContext from '../../context/AuthContext';
import Swal from 'sweetalert2';

const TwoFactorAuth = () => {
  const [qrCode, setQrCode] = useState('');
  const [secret, setSecret] = useState('');
  const [otp, setOtp] = useState('');
  const [isEnabled, setIsEnabled] = useState(false);
  const { authtoken } = useContext(AuthContext);

  useEffect(() => {
    fetchQRCode();
  }, []);

  const fetchQRCode = async () => {
    try {
      const token = JSON.parse(localStorage.getItem('authtoken')).access;
      const response = await fetch('http://localhost:8001/api/2fa/setup/', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Failed to fetch QR code');
      }

      const data = await response.json();
      setQrCode(data.qr_code);
      setSecret(data.secret_key);
      setIsEnabled(data.is_enabled);
    } catch (error) {
      Swal.fire({
        position: "top-end",
        title: error.message,
        icon: "error",
        showConfirmButton: true,
        timerProgressBar: true,
        timer: 3000
      });
    }
  };

  const verifyOTP = async (e) => {
    e.preventDefault();
    try {
      const token = JSON.parse(localStorage.getItem('authtoken')).access;
      const response = await fetch('http://localhost:8001/api/2fa/verify/', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({ otp })
      });

      if (!response.ok) {
        throw new Error('Invalid OTP code');
      }

      setIsEnabled(true);
      Swal.fire({
        position: "top-end",
        title: "2FA Successfully Enabled",
        icon: "success",
        showConfirmButton: true,
        timerProgressBar: true,
        timer: 3000
      });
    } catch (error) {
      Swal.fire({
        position: "top-end",
        title: error.message,
        icon: "error",
        showConfirmButton: true,
        timerProgressBar: true,
        timer: 3000
      });
    }
  };

  const disable2FA = async () => {
    try {
      const token = JSON.parse(localStorage.getItem('authtoken')).access;
      const response = await fetch('http://localhost:8001/api/2fa/disable/', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Failed to disable 2FA');
      }

      setIsEnabled(false);
      setQrCode('');
      setSecret('');
      
      Swal.fire({
        position: "top-end",
        title: "2FA Successfully Disabled",
        icon: "success",
        showConfirmButton: true,
        timerProgressBar: true,
        timer: 3000
      });
    } catch (error) {
      Swal.fire({
        position: "top-end",
        title: error.message,
        icon: "error",
        showConfirmButton: true,
        timerProgressBar: true,
        timer: 3000
      });
    }
  };

  return (
    <div className="max-w-md mx-auto mt-8 p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4">Two-Factor Authentication</h2>
      
      {!isEnabled ? (
        <div>
          {qrCode ? (
            <div>
              <p className="mb-4">Scan this QR code with Google Authenticator:</p>
              <img
                src={`data:image/png;base64,${qrCode}`}
                alt="QR Code"
                className="mb-4 mx-auto"
              />
              <p className="mb-4">
                Or manually enter this key: <code className="bg-gray-100 p-1">{secret}</code>
              </p>
              <form onSubmit={verifyOTP}>
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  placeholder="Enter OTP"
                  className="w-full p-2 border rounded mb-4"
                  maxLength={6}
                />
                <button
                  type="submit"
                  className="w-full bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600"
                >
                  Verify and Enable 2FA
                </button>
              </form>
            </div>
          ) : (
            <button
              onClick={fetchQRCode}
              className="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600"
            >
              Setup 2FA
            </button>
          )}
        </div>
      ) : (
        <div>
          <p className="mb-4">Two-factor authentication is enabled.</p>
          <button
            onClick={disable2FA}
            className="w-full bg-red-500 text-white py-2 px-4 rounded hover:bg-red-600"
          >
            Disable 2FA
          </button>
        </div>
      )}
    </div>
  );
};

export default TwoFactorAuth;
=======
import React, { useState, useEffect, useContext } from 'react';
import AuthContext from '../../context/AuthContext';
import Swal from 'sweetalert2';

const TwoFactorAuth = () => {
  const [qrCode, setQrCode] = useState('');
  const [secret, setSecret] = useState('');
  const [otp, setOtp] = useState('');
  const [isEnabled, setIsEnabled] = useState(false);
  const { authtoken } = useContext(AuthContext);

  useEffect(() => {
    fetchQRCode();
  }, []);

  const fetchQRCode = async () => {
    try {
      const token = JSON.parse(localStorage.getItem('authtoken')).access;
      const response = await fetch('/api/usermanagement/api/2fa/setup/', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Failed to fetch QR code');
      }

      const data = await response.json();
      setQrCode(data.qr_code);
      setSecret(data.secret_key);
      setIsEnabled(data.is_enabled);
    } catch (error) {
      Swal.fire({
        position: "top-end",
        title: error.message,
        icon: "error",
        showConfirmButton: true,
        timerProgressBar: true,
        timer: 3000
      });
    }
  };

  const verifyOTP = async (e) => {
    e.preventDefault();
    try {
      const token = JSON.parse(localStorage.getItem('authtoken')).access;
      const response = await fetch('/api/usermanagement/api/2fa/verify/', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({ otp })
      });

      if (!response.ok) {
        throw new Error('Invalid OTP code');
      }

      setIsEnabled(true);
      Swal.fire({
        position: "top-end",
        title: "2FA Successfully Enabled",
        icon: "success",
        showConfirmButton: true,
        timerProgressBar: true,
        timer: 3000
      });
    } catch (error) {
      Swal.fire({
        position: "top-end",
        title: error.message,
        icon: "error",
        showConfirmButton: true,
        timerProgressBar: true,
        timer: 3000
      });
    }
  };

  const disable2FA = async () => {
    try {
      const token = JSON.parse(localStorage.getItem('authtoken')).access;
      const response = await fetch('/api/usermanagement/api/2fa/disable/', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Failed to disable 2FA');
      }

      setIsEnabled(false);
      setQrCode('');
      setSecret('');
      
      Swal.fire({
        position: "top-end",
        title: "2FA Successfully Disabled",
        icon: "success",
        showConfirmButton: true,
        timerProgressBar: true,
        timer: 3000
      });
    } catch (error) {
      Swal.fire({
        position: "top-end",
        title: error.message,
        icon: "error",
        showConfirmButton: true,
        timerProgressBar: true,
        timer: 3000
      });
    }
  };

  return (
    <div className="max-w-md mx-auto mt-8 p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4">Two-Factor Authentication</h2>
      
      {!isEnabled ? (
        <div>
          {qrCode ? (
            <div>
              <p className="mb-4">Scan this QR code with Google Authenticator:</p>
              <img
                src={`data:image/png;base64,${qrCode}`}
                alt="QR Code"
                className="mb-4 mx-auto"
              />
              <p className="mb-4">
                Or manually enter this key: <code className="bg-gray-100 p-1">{secret}</code>
              </p>
              <form onSubmit={verifyOTP}>
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  placeholder="Enter OTP"
                  className="w-full p-2 border rounded mb-4"
                  maxLength={6}
                />
                <button
                  type="submit"
                  className="w-full bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600"
                >
                  Verify and Enable 2FA
                </button>
              </form>
            </div>
          ) : (
            <button
              onClick={fetchQRCode}
              className="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600"
            >
              Setup 2FA
            </button>
          )}
        </div>
      ) : (
        <div>
          <p className="mb-4">Two-factor authentication is enabled.</p>
          <button
            onClick={disable2FA}
            className="w-full bg-red-500 text-white py-2 px-4 rounded hover:bg-red-600"
          >
            Disable 2FA
          </button>
        </div>
      )}
    </div>
  );
};

export default TwoFactorAuth;
>>>>>>> master
