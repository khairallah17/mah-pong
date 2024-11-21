import React, { useState } from 'react';
import Swal from 'sweetalert2';

export const ResetPassword = () => {
  const [showPassword, setShowPassword] = useState({
    new: false,
    confirm: false
  });
  const [new_password, setNew_password] = useState('');
  const [confirm_password, setConfirm_password] = useState('');

  // Extract parameters from URL
  const params = new URLSearchParams(window.location.search);
  const token = params.get('token');
  const uidb64 = params.get('uidb64');

  const handleSubmit = async (event) => {
    event.preventDefault();
    console.log('Starting password reset...');
    console.log('uidb64:', uidb64);
    console.log('token:', token);
  
    if (new_password !== confirm_password) {
      Swal.fire({
        icon: 'error',
        title: 'Passwords do not match',
      });
      return;
    }
  
    try {
      const response = await fetch(`http://localhost:8001/api/password-reset/${uidb64}/${token}/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          new_password: new_password,
          confirm_password: confirm_password
        })
      });
  
      // Log the response for debugging
      console.log('Response status:', response.status);
      
      // Try to parse response as JSON
      let data;
      try {
        const textResponse = await response.text();
        console.log('Raw response:', textResponse);
        data = JSON.parse(textResponse);
      } catch (error) {
        console.error('Error parsing response:', error);
        throw new Error('Invalid server response');
      }
  
      if (!response.ok) {
        throw new Error(data.error || 'Failed to reset password');
      }
  
      // Success
      Swal.fire({
        icon: 'success',
        title: 'Success!',
        text: 'Your password has been reset successfully.',
      });
      
      setTimeout(() => {
        window.location.href = '/login';
      }, 2000);
      
    } catch (err) {
      console.error('Reset password error:', err);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: err.message || 'Failed to reset password',
      });
    }
  };

  const togglePasswordVisibility = (field) => {
    setShowPassword(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-bold tracking-tight text-gray-900">
            Reset Your Password
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Please enter your new password below
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}> 
          <div className="space-y-4">
            <div>
              <label htmlFor="new_password" className="block text-sm font-medium text-gray-700">
                New Password
              </label>
              <div className="relative mt-1">
                <input
                  type={showPassword.new ? 'text' : 'password'}
                  id="new_password"
                  name="new_password"
                  required
                  value={new_password}
                  onChange={(e) => setNew_password(e.target.value)}
                  className="block w-full rounded-md border border-gray-300 px-3 py-2 pr-10 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  placeholder="Enter your new password"
                />
                <button
                  type="button"
                  onClick={() => togglePasswordVisibility('new')}
                  className="absolute inset-y-0 right-0 flex items-center pr-3"
                >
                  <span className="text-gray-500">
                    {showPassword.new ? '🔓' : '🔒'}
                  </span>
                </button>
              </div>
            </div>

            <div>
              <label htmlFor="confirm_password" className="block text-sm font-medium text-gray-700">
                Confirm New Password
              </label>
              <div className="relative mt-1">
                <input
                  id="confirm_password"
                  name="confirm_password"
                  type={showPassword.confirm ? 'text' : 'password'}
                  required
                  value={confirm_password}
                  onChange={(e) => setConfirm_password(e.target.value)}
                  className="block w-full rounded-md border border-gray-300 px-3 py-2 pr-10 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  placeholder="Confirm your new password"
                />
                <button
                  type="button"
                  onClick={() => togglePasswordVisibility('confirm')}
                  className="absolute inset-y-0 right-0 flex items-center pr-3"
                >
                  <span className="text-gray-500">
                    {showPassword.confirm ? '🔓' : '🔒'}
                  </span>
                </button>
              </div>
            </div>
          </div>

          <div>
            <button
              type="submit"
              className="group relative flex w-full justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            >
              Reset Password
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;