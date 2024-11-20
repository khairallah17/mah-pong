import React, { useState } from 'react';
import Swal from 'sweetalert2';

export const ResetPassword = () => {
  const [showPassword, setShowPassword] = useState({
    new: false,
    confirm: false
  });
  const [new_password, setNew_password] = useState('');
  const [confirm_password, setComfirm_password] = useState('');
  // const [isLoading, setIsLoading] = useState(false);

  // akanextracti mn Link hnaya token dyal luser li ba ibdel password o lunique id dyalo li ja mn database
  const params = new URLSearchParams(window.location.search);
  console.log("Parameter URL found are: ", params);
  const token = params.get('token');
  const uidb64 = params.get('uidb64');
  console.log("Token Found are", token)
  console.log("which user have that ID are ", uidb64)
  console.log("new Pass ==> ", new_password);

  const handleSubmit = async (event) => {
    event.preventDefault();

    // kantsheki hna ila kano les password li dekhlo identique
    if (new_password !== confirm_password) {
      Swal.fire({
        position: "middle",
        icon: "error",
        title: "Passwords do not match",
        showConfirmButton: true,
        timerProgressBar: true,
        timer: 6000
      })
      return ;
    }
    
    try {
      const response = await fetch(`http://localhost:8001/api/password-reset/${uidb64}/${token}/`, {
        credentials: 'include',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({new_password, confirm_password})
      });
      
      
      const data = await response.json();

      console.log("data re ====> ", data);
      if (!response.ok) {
        throw new Error(data.error || 'Failed to reset password');
      }
      console.log(response.status);
      Swal.fire({
        position: "middle",
        icon: "success",
        title: "Password reset successful! You can now login with your new password.",
        showConfirmButton: true,
        timerProgressBar: true,
        timer: 6000
      })
    } catch (err) {
      Swal.fire({
        position: "middle",
        icon: "error",
        // title: `${err.message}`,
        title: "ohooooooo jaosdjaosdjaosdjasd asdansdkasd",
        showConfirmButton: true,
        timerProgressBar: true,
        timer: 6000
      })
    }
  };

  // const togglePasswordVisibility = (field) => {
  //   setShowPassword(prev => ({
  //     ...prev,
  //     [field]: !prev[field]
  //   }));
  // };

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

        <form className="mt-8 space-y-6" > 
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
                  onChange={(event)=>setNew_password(event.target.value)}
                  className="block w-full rounded-md border border-gray-300 px-3 py-2 pr-10 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  placeholder="Enter your new password"
                  />
                <button
                  type="button"
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
                  onChange={(event)=>setComfirm_password(event.target.value)}
                  className="block w-full rounded-md border border-gray-300 px-3 py-2 pr-10 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  placeholder="Confirm your new password"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 flex items-center pr-3"
                  onClick={handleSubmit}
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
              className="group relative flex w-full justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50"
            >
              <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                Confirm Reset Password
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ResetPassword;