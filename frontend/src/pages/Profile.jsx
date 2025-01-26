import React, { useState, useEffect } from 'react';
import googleImage from '../images/google.svg';
import intraImage from '../images/intraImage.webp';
import axios from 'axios';
import Swal from 'sweetalert2';
import { useSidebarContext } from '../hooks/useSidebar';
import '../i18n';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';


export default function Profile() {
  const { t } = useTranslation();
  const [profileData, setProfileData] = useState({
    fullname: "",
    username: "",
    email: "",
    avatar: null,
    profile_image: null,
  });

  const { setActiveLink } = useSidebarContext()

  const fetchProfile = async () => {
    try {
      let token = localStorage.getItem('authtoken');
      if (!token) {
        toast.error("No authentication token found. Please try again.", {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: false,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "dark",
        })
        return;
      }
      
      const parsed = JSON.parse(token);
      const accessToken = parsed.access;

      const response = await axios.get('/api/usermanagement/api/edit-profile/', {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });
      setProfileData({
        fullname: response.data.fullname || "",
        username: response.data.username || "",
        email: response.data.email || "",
        avatar: response.data.avatar,
        profile_image: response.data.img,
      });
    } catch (error) {
      console.error('Failed to fetch profile', error);
      Swal.fire({
        icon: 'error',
        title: 'Failed to fetch profile. Please try again.',
        showConfirmButton: false,
        timer: 1500
      });
    }
  };

  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('img', file);

    try {
      let token = localStorage.getItem('authtoken');
      if (!token) {
        console.error('No authentication token found');
        return;
      }
      
      const parsed = JSON.parse(token);
      const accessToken = parsed.access;

      const response = await axios.put('/api/usermanagement/api/edit-profile/', formData, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      
      setProfileData(prev => ({
        ...prev,
        profile_image: response.data.img
      }));

      Swal.fire({
        icon: 'success',
        title: 'Profile image updated successfully!',
        showConfirmButton: false,
        timer: 1500
      });
    } catch (error) {
      console.error('Failed to upload profile image', error);
      Swal.fire({
        icon: 'error',
        title: 'Failed to upload profile image. Please try again.',
        showConfirmButton: false,
        timer: 1500
      });
    }
  };

  const handleAvatarUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('avatar', file);

    try {
      let token = localStorage.getItem('authtoken');
      if (!token) {
        console.error('No authentication token found');
        return;
      }
      
      const parsed = JSON.parse(token);
      const accessToken = parsed.access;

      const response = await axios.put('/api/usermanagement/api/edit-profile/', formData, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      
      setProfileData(prev => ({
        ...prev,
        avatar: response.data.avatar
      }));

      Swal.fire({
        icon: 'success',
        title: 'Profile image updated successfully!',
        showConfirmButton: false,
        timer: 1500
      });
    } catch (error) {
      toast.error(`Error checking friend status: ${error}`, {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: false,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "dark",
      })
    }
  };

  const handleImageDelete = async () => {
    try {
      let token = localStorage.getItem('authtoken');
      if (!token) {
        console.error('No authentication token found');
        return;
      }
      
      const parsed = JSON.parse(token);
      const accessToken = parsed.access;

      await axios.delete('/api/usermanagement/api/edit-profile/', {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });
      
      setProfileData(prev => ({
        ...prev,
        profile_image: null
      }));

      Swal.fire({
        icon: 'success',
        title: 'Profile image deleted successfully!',
        showConfirmButton: false,
        timer: 1500
      });
    } catch (error) {
      toast.error(`Failed to delete profile image. Please try again. ${error}`, {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: false,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "dark",
      })
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleSubmit = async () => {
    try {
      let token = localStorage.getItem('authtoken');
      if (!token) {
        console.error('No authentication token found');
        return;
      }
      
      const parsed = JSON.parse(token);
      const accessToken = parsed.access;

      const response = await axios.put('/api/usermanagement/api/edit-profile/', {
        fullname: profileData.fullname
      }, {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });
      toast.success("Profile updated successfully!", {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: false,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "dark",
      })
    } catch (error) {
      toast.error("Failed to update profile. Please try again.", {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: false,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "dark",
      })
    }
  };

  const getInitials = () => {
    const initials = profileData.fullname
      .split(' ')
      .map(name => name[0])
      .join('')
      .toUpperCase();
    return initials.slice(0, 2);
  };


  return (
    <div className="w-full max-w-6xl mx-auto p-8 space-y-8 shadow-2xl shadow-black rounded-xl border border-gray-800 backdrop-blur-sm">
      <h2 className="text-2xl font-inter text-white mb-6 zen-dots">{t('Account')}</h2>
      <div className="flex flex-col md:flex-row justify-between items-center gap-8">
        <div className="flex flex-col md:flex-row items-center gap-4">
          <div className="w-24 h-24 bg-blue-800 rounded-full border-2 border-white/40 flex items-center justify-center text-white text-2xl font-inter">
            {profileData.profile_image ? (
              <img 
                src={`/api/usermanagement/` + profileData.profile_image}
                alt="Profile" 
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              getInitials()
            )}
          </div>
          <div className="space-y-2 text-center md:text-left">
            <h3 className="font-inter text-white text-xl">{t('Profile Picture')}</h3>
            <p className="text-sm text-white/70">{t('PNG, JPEG under 15MB')}</p>
            <div className="flex flex-wrap justify-center md:justify-start gap-3">
              <label className="px-6 py-2 bg-white text-black rounded-md hover:bg-white/90 transition-colors cursor-pointer">
                <input 
                  type="file" 
                  className="hidden" 
                  accept="media/*" 
                  onChange={handleImageUpload}
                />
                {t('Upload an image')}
              </label>
              <button 
                onClick={handleImageDelete}
                className="px-6 py-2 bg-[#BD3944] text-white rounded-md hover:bg-red-600 transition-colors"
              >
                {t('Delete')}
              </button>
            </div>
          </div>
        </div>
        <div className="flex flex-col md:flex-row items-center gap-4">
          <img
            src={`/api/usermanagement/` + profileData.avatar || "https://github.com/shadcn.png"}
            alt="Profile Avatar"
            className="w-24 h-24 bg-blue-800 rounded-full border-2 border-white/90"
          />
          <div className="space-y-2 text-center md:text-left">
            <h3 className="font-inter text-white text-sm">{t('Profile Avatar')}</h3>
            <div className="flex flex-wrap justify-center md:justify-start gap-3">
              <label className="px-6 py-2 bg-white text-black rounded-md hover:bg-white/90 transition-colors cursor-pointer">
                <input 
                  type="file" 
                  className="hidden"
                  accept="media/*" 
                  onChange={handleAvatarUpload}
                />
                {t('Upload an avatar')}
              </label>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-6 pt-8 border-t border-white/80">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="md:col-span-2">
            <label className="block text-sm text-white/90 mb-2">{t('Full Name')}</label>
            <input
              type="text"
              placeholder={t('Enter Your Full Name')}
              value={profileData.fullname}
              onChange={(e) => setProfileData(prev => ({...prev, fullname: e.target.value}))}
              className="w-full px-4 py-2 bg-black/80 border border-white/10 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-white/5 transition-all mb-4"
            />
          </div>
          <div>
            <label className="block text-sm text-white/90 mb-2">{t('Username')}</label>
            <input
              type="text"
              value={profileData.username}
              readOnly
              className="w-full px-4 py-2 bg-black/80 border border-white/10 text-gray-500 rounded-lg cursor-not-allowed opacity-50"
            />
          </div>
          <div>
            <label className="block text-sm text-white/90 mb-2">{t('Email')}</label>
            <input
              type="email"
              value={profileData.email}
              readOnly
              className="w-full px-4 py-2 bg-black/80 border border-white/10 text-gray-500 rounded-lg cursor-not-allowed opacity-50"
            />
          </div>
        </div>


        <div className="flex flex-wrap justify-center gap-4 pt-8 border-t border-white/80">
          <button 
            onClick={handleSubmit}
            className="w-60 px-2 py-2 text-lg font-medium bg-white text-black rounded-lg hover:bg-white/80 transition-colors font-Inter"
          >
            {t('Submit')}
          </button>
        </div>
      </div>
    </div>
  );
}

