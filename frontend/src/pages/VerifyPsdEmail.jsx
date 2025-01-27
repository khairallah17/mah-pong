<<<<<<< HEAD
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Send } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';


export const VerifyPsdEmail = () => {

    const [email, setEmail] = useState("")
    const navigate = useNavigate();
    

    const handleSubmit = async (e) => {
        e.preventDefault();
    
        const requestOptions = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: email })
        };
    
        try {
            const response = await fetch('http://localhost:8001/api/password-reset/', requestOptions);
            const data = await response.json();
            
            if (response.ok) {
                navigate('/email-check');
                toast.success('Reset password email sent successfully!', {
                  position: "top-right",
                  autoClose: 5000,
                  hideProgressBar: false,
                  closeOnClick: true,
                  pauseOnHover: true,
                  draggable: true,
                  theme: "dark",
                });
            } else {
                throw new Error(data.error || 'Failed to reset password');
            }
        } catch (err) {
            console.error('Error:', err);
            toast.error('An unexpected error occurred', {
              position: "top-right",
              autoClose: 5000,
              hideProgressBar: false,
              closeOnClick: true,
              pauseOnHover: true,
              draggable: true,
              theme: "dark",
            });
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-navy-950 via-navy-900 to-navy-950 flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 2, y: 0 }}
            transition={{ duration: 0 }}
            className=" bg-[white] bg-navy-800/70 backdrop-blur-sm rounded-2xl shadow-2xl border border-white/10 w-full max-w-md p-8 space-y-6"
          >
            <div className="flex justify-center mb-6">
              <Lock className="w-16 h-16 text-indigo-400 animate-pulse" />
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="text-center space-y-4">
                <h1 className="text-3xl font-bold text-black">Reset Your Password</h1>
                <p className="text-black leading-relaxed">
                  Enter the email address linked to your account, 
                  and we'll send you a password reset link.
                </p>
              </div>
              
              <div className="space-y-4">
                <div className="relative">
                  <input
                    className="w-full bg-transparent border-b-2 border-black/50 focus:border-indigo-400 text-black placeholder:text-black/50 placeholder:font-medium py-3 focus:outline-none transition-colors duration-300 ease-in-out"
                    placeholder="Enter your email"
                    type="email"
                    name="email"
                    required
                    onChange={(e) => setEmail(e.target.value)}
                    value={email}
                  />
                </div>
                
                <button 
                  type="submit" 
                  className="w-full flex items-center justify-center gap-3 bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-lg ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                >
                  <Send className="w-5 h-5" />
                  Send Reset Link
                </button>
              </div>
            </form>
            
            <div className="text-center text-sm text-gray-500 mt-4">
              Remember your password? 
              <button 
                onClick={() => navigate('/login')} 
                className="text-indigo-400 ml-1 hover:underline"
              >
                Back to Login
              </button>
            </div>
          </motion.div>
        </div>
      )
}


export default VerifyPsdEmail
=======
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Send } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';


export const VerifyPsdEmail = () => {

    const [email, setEmail] = useState("")
    const navigate = useNavigate();
    

    const handleSubmit = async (e) => {
        e.preventDefault();
    
        const requestOptions = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: email })
        };
    
        try {
            const response = await fetch('/api/usermanagement/api/password-reset/', requestOptions);
            const data = await response.json();
            
            if (response.ok) {
                navigate('/email-check');
                toast.success('Reset password email sent successfully!', {
                  position: "top-right",
                  autoClose: 5000,
                  hideProgressBar: false,
                  closeOnClick: true,
                  pauseOnHover: true,
                  draggable: true,
                  theme: "dark",
                });
            } else {
                throw new Error(data.error || 'Failed to reset password');
            }
        } catch (err) {
            toast.error('An unexpected error occurred', {
              position: "top-right",
              autoClose: 5000,
              hideProgressBar: false,
              closeOnClick: true,
              pauseOnHover: true,
              draggable: true,
              theme: "dark",
            });
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-navy-950 via-navy-900 to-navy-950 flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 2, y: 0 }}
            transition={{ duration: 0 }}
            className=" bg-[white] bg-navy-800/70 backdrop-blur-sm rounded-2xl shadow-2xl border border-white/10 w-full max-w-md p-8 space-y-6"
          >
            <div className="flex justify-center mb-6">
              <Lock className="w-16 h-16 text-indigo-400 animate-pulse" />
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="text-center space-y-4">
                <h1 className="text-3xl font-bold text-black">Reset Your Password</h1>
                <p className="text-black leading-relaxed">
                  Enter the email address linked to your account, 
                  and we'll send you a password reset link.
                </p>
              </div>
              
              <div className="space-y-4">
                <div className="relative">
                  <input
                    className="w-full bg-transparent border-b-2 border-black/50 focus:border-indigo-400 text-black placeholder:text-black/50 placeholder:font-medium py-3 focus:outline-none transition-colors duration-300 ease-in-out"
                    placeholder="Enter your email"
                    type="email"
                    name="email"
                    required
                    onChange={(e) => setEmail(e.target.value)}
                    value={email}
                  />
                </div>
                
                <button 
                  type="submit" 
                  className="w-full flex items-center justify-center gap-3 bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-lg ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                >
                  <Send className="w-5 h-5" />
                  Send Reset Link
                </button>
              </div>
            </form>
            
            <div className="text-center text-sm text-gray-500 mt-4">
              Remember your password? 
              <button 
                onClick={() => navigate('/login')} 
                className="text-indigo-400 ml-1 hover:underline"
              >
                Back to Login
              </button>
            </div>
          </motion.div>
        </div>
      )
}


export default VerifyPsdEmail
>>>>>>> master
