import React from 'react'
import { NavLink } from 'react-router-dom'
import { Mail, ArrowLeft, Edit2 } from 'lucide-react'
import { motion } from 'framer-motion'

const ResetEmailSend = () => {
  return (
    <div className=" min-h-screen bg-gradient-to-br from-navy-950 via-navy-900 to-navy-950 flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 2, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white bg-navy-800/70 backdrop-blur-sm rounded-2xl shadow-2xl border border-white/10 w-full max-w-md p-8 space-y-6"
      >
        <div className="flex justify-center mb-6">
          <Mail className="w-16 h-16 text-indigo-600 animate-pulse" />
        </div>
        
        <div className="text-center space-y-4">
          <h1 className="text-3xl font-bold text-white">Check Your Inbox</h1>
          <p className="text-black font-medium leading-relaxed ">
            We've sent you an email with instructions to reset your password. 
            Please check your inbox (and spam folder) to proceed.
          </p>
        </div>
        
        <div className="space-y-4">
          <NavLink 
            to="/login" 
            className="w-full flex items-center justify-center gap-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-lg transition-all duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Login
          </NavLink>
          
          <NavLink 
            to="/verify-email" 
            className="w-full flex items-center justify-center gap-3 bg-navy-700 hover:bg-navy-600 text-black font-semibold py-3 rounded-lg transition-all duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-white/20"
          >
            <Edit2 className="w-5 h-5" />
            Edit Email
          </NavLink>
        </div>
      </motion.div>
    </div>
  )
}

export default ResetEmailSend