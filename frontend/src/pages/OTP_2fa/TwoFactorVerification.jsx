import React, { useState } from 'react';

const TwoFactorVerification = ({ onSuccess }) => {
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const verifyOTP = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await fetch('/api/verify-otp/', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ otp })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to verify OTP');
      }

      onSuccess();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-8 p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4">Verify Two-Factor Authentication</h2>
      
      <form onSubmit={verifyOTP}>
        <div className="mb-4">
          <label className="block text-gray-700 mb-2">
            Enter the code from Google Authenticator
          </label>
          <input
            type="text"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            placeholder="Enter 6-digit code"
            className="w-full p-2 border rounded"
            maxLength={6}
            required
          />
        </div>
        
        <button
          type="submit"
          className="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 disabled:bg-blue-300"
          disabled={loading}
        >
          {loading ? 'Verifying...' : 'Verify'}
        </button>
        
        {error && (
          <div className="mt-4 text-red-600">
            {error}
          </div>
        )}
      </form>
    </div>
  );
};

export default TwoFactorVerification;