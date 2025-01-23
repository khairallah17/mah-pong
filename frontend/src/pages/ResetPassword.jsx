import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Eye, EyeOff, KeyRound } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';

export const ResetPassword = () => {

  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState({
    new: false,
    confirm: false
  });
  const [new_password, setNew_password] = useState('');
  const [confirm_password, setConfirm_password] = useState('');

  // Extracting parameters from URL
  const params = new URLSearchParams(window.location.search);
  const token = params.get('token');
  const uidb64 = params.get('uidb64');

  const handleSubmit = async (event) => {
    event.preventDefault();
    console.log('Starting password reset...');
    console.log('uidb64:', uidb64);
    console.log('token:', token);
  
    if (new_password !== confirm_password) {
      toast.error('Passwords do not match', {
        position: "top-right",
        autoClose: 5000,
        theme: "dark",
      });
      return;
    }

    if (new_password.length < 8) {
      toast.error('Password must be at least 8 characters long', {
        position: "top-right",
        autoClose: 5000,
        theme: "dark",
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
      toast.success('Password reset successfully', {
        position: "top-right",
        autoClose: 5000,
        theme: "dark",
      });
      
      setTimeout(() => {
        navigate('/login');
      }, 2000);
      
    } catch (err) {
      console.error('Reset password error:', err);
      toast.error(errorData.message || 'Failed to reset password', {
        position: "top-right",
        autoClose: 5000,
        theme: "dark",
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
    <div className="min-h-screen bg-gradient-to-br from-navy-950 via-navy-900 to-navy-950 flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white bg-navy-800/70 backdrop-blur-sm rounded-2xl shadow-2xl border border-white/10 w-full max-w-md p-8 space-y-6"
      >
        <div className="flex justify-center mb-6">
          <KeyRound className="w-16 h-16 text-indigo-400 animate-pulse" />
        </div>
        
        <div className="text-center space-y-4">
          <h1 className="text-3xl font-bold text-black">Reset Password</h1>
          <p className="text-black leading-relaxed">
            Create a strong, unique password to secure your account
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div>
              <div className="relative">
                <input
                  type={showPassword.new ? 'text' : 'password'}
                  id="new_password"
                  name="new_password"
                  required
                  value={new_password}
                  onChange={(e) => setNew_password(e.target.value)}
                  className="w-full bg-navy-700/50 text-black border-b-2 border-black/50 focus:border-indigo-600 py-3 pr-10 focus:outline-none transition-colors duration-300"
                  placeholder="Enter new password"
                />
                <button
                  type="button"
                  onClick={() => togglePasswordVisibility('new')}
                  className="absolute inset-y-0 right-0 flex items-center pr-3"
                >
                  {showPassword.new ? (
                    <Eye className="w-5 h-5 text-gray-600" />
                  ) : (
                    <EyeOff className="w-5 h-5 text-gray-600" />
                  )}
                </button>
              </div>
            </div>

            <div>
              <div className="relative">
                <input
                  type={showPassword.confirm ? 'text' : 'password'}
                  id="confirm_password"
                  name="confirm_password"
                  required
                  value={confirm_password}
                  onChange={(e) => setConfirm_password(e.target.value)}
                  className="w-full bg-navy-700/50 text-black border-b-2 border-black/50 focus:border-indigo-600 py-3 pr-10 focus:outline-none transition-colors duration-300"
                  placeholder="Confirm new password"
                />
                <button
                  type="button"
                  onClick={() => togglePasswordVisibility('confirm')}
                  className="absolute inset-y-0 right-0 flex items-center pr-3"
                >
                  {showPassword.confirm ? (
                    <Eye className="w-5 h-5 text-gray-600" />
                  ) : (
                    <EyeOff className="w-5 h-5 text-gray-600" />
                  )}
                </button>
              </div>
            </div>
          </div>

          <div className="mt-6">
            <button
              type="submit"
              className="w-full flex items-center justify-center gap-3 bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-lg transition-all duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            >
              <Lock className="w-5 h-5" />
              Reset Password
            </button>
          </div>
        </form>

        <div className="text-center text-sm text-gray-500 mt-4">
          Remembered your password? 
          <button 
            onClick={() => navigate('/login')} 
            className="text-indigo-400 ml-1 hover:underline"
          >
            Back to Login
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default ResetPassword;