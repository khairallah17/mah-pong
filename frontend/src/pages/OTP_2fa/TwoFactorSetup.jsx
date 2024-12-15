import React, { useState } from 'react';

const TwoFactorSetup = () => {
  const [qrCode, setQrCode] = useState('');
  const [secret, setSecret] = useState('');
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const generateQRCode = async () => {
    try {
        const storedToken = localStorage.getItem("authtoken");
        if (!storedToken) {
            throw new Error('No authentication token found');
        }

        const token = JSON.parse(storedToken).access;
        console.log('Token being sent:', token.access);
        const response = await fetch('http://localhost:8001/api/2fa/enable/', {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            },
            credentials: 'include'
        });
        
        if (response.status === 401) {
            throw new Error('Authentication failed');
        }
        
        if (!response.ok) {
            throw new Error('Failed to generate QR code');
        }
        
        const data = await response.json();
        setQrCode(data.qr_code);
        setSecret(data.secret);
        setError('');
    } catch (err) {
        setError(err.message);
        if (err.message === 'Authentication failed') {
            // Handle authentication error
            Swal.fire({
                position: "top-end",
                title: "Authentication failed. Please login again.",
                icon: "error",
                showConfirmButton: true,
                timerProgressBar: true,
                timer: 3000
            });
        }
    }
};

const verifyOTP = async (e) => {
    e.preventDefault();
    try {
        const storedToken = localStorage.getItem("authtoken");
        if (!storedToken) {
            throw new Error('No authentication token found');
        }

        const token = JSON.parse(storedToken).access;

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
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to verify OTP');
        }

        setSuccess(true);
        setError('');
        
        Swal.fire({
            position: "top-end",
            title: "2FA Setup Successful!",
            icon: "success",
            showConfirmButton: true,
            timerProgressBar: true,
            timer: 3000
        });
    } catch (err) {
        setError(err.message);
        Swal.fire({
            position: "top-end",
            title: err.message,
            icon: "error",
            showConfirmButton: true,
            timerProgressBar: true,
            timer: 3000
        });
    }
  };

  return (
    <div className="max-w-md mx-auto mt-8 p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4">Set up Two-Factor Authentication</h2>
      
      {!qrCode ? (
        <button
          onClick={generateQRCode}
          className="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600"
        >
          Generate QR Code
        </button>
      ) : (
        <div>
          <p className="mb-4">
            1. Scan this QR code with Google Authenticator:
          </p>
          <img
            src={`data:image/png;base64,${qrCode}`}
            alt="QR Code"
            className="mb-4 mx-auto"
          />
          <p className="mb-4">
            2. Or manually enter this key: <code className="bg-gray-100 p-1">{secret}</code>
          </p>
          <form onSubmit={verifyOTP}>
            <input
              type="text"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              placeholder="Enter OTP"
              className="w-full p-2 border rounded mb-4"
            />
            <button
              type="submit"
              className="w-full bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600"
            >
              Verify OTP
            </button>
          </form>
        </div>
      )}
      
      {error && (
        <div className="mt-4 text-red-600">
          {error}
        </div>
      )}
    </div>
  );
};

export default TwoFactorSetup;