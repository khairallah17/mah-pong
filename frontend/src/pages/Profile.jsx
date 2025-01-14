import React, { useState, useEffect } from 'react';
import googleImage from '../images/google.svg';
import intraImage from '../images/intraImage.webp';
import axios from 'axios';
import Swal from 'sweetalert2';
import { useSidebarContext } from '../hooks/useSidebar';

export default function Profile() {
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
        console.error('No authentication token found');
        Swal.fire({
          icon: 'error',
          title: 'No authentication token found. Please try again.',
          showConfirmButton: false,
          timer: 1500
        });
        return;
      }
      
      const parsed = JSON.parse(token);
      const accessToken = parsed.access;

      const response = await axios.get('http://localhost:8001/api/edit-profile/', {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });
      console.log(response.data);
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

      const response = await axios.put('http://localhost:8001/api/edit-profile/', formData, {
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

      const response = await axios.put('http://localhost:8001/api/edit-profile/', formData, {
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
      console.error('Failed to upload profile image', error);
      Swal.fire({
        icon: 'error',
        title: 'Failed to upload profile image. Please try again.',
        showConfirmButton: false,
        timer: 1500
      });
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

      await axios.delete('http://localhost:8001/api/edit-profile/', {
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
      console.error('Failed to delete profile image', error);
      Swal.fire({
        icon: 'error',
        title: 'Failed to delete profile image. Please try again.',
        showConfirmButton: false,
        timer: 1500
      });
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

      const response = await axios.put('http://localhost:8001/api/edit-profile/', {
        fullname: profileData.fullname
      }, {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });
      
      Swal.fire({
        icon: 'success',
        title: 'Profile updated successfully!',
        showConfirmButton: false,
        timer: 1500
      });
    } catch (error) {
      console.error('Failed to update profile', error);
      Swal.fire({
        icon: 'error',
        title: 'Failed to update profile. Please try again.',
        showConfirmButton: false,
        timer: 1500 
      });
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

  // useEffect(() => {
  //   console.log(profileData.profile_image);
  // }, [profileData])

  return (
    <div className="w-full max-w-6xl mx-auto p-8 space-y-8 shadow-2xl shadow-black rounded-xl border border-gray-800 backdrop-blur-sm">
      <h2 className="text-2xl font-inter text-white mb-6 zen-dots">Account</h2>
      <div className="flex flex-col md:flex-row justify-between items-center gap-8">
        <div className="flex flex-col md:flex-row items-center gap-4">
          <div className="w-24 h-24 bg-blue-800 rounded-full border-2 border-white/40 flex items-center justify-center text-white text-2xl font-inter">
            {profileData.profile_image ? (
              <img 
                src={`http://localhost:8001/` + profileData.profile_image}
                alt="Profile" 
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              getInitials()
            )}
          </div>
          <div className="space-y-2 text-center md:text-left">
            <h3 className="font-inter text-white text-xl">Profile Picture</h3>
            <p className="text-sm text-white/70">PNG, JPEG under 15MB</p>
            <div className="flex flex-wrap justify-center md:justify-start gap-3">
              <label className="px-6 py-2 bg-white text-black rounded-md hover:bg-white/90 transition-colors cursor-pointer">
                <input 
                  type="file" 
                  className="hidden" 
                  accept="media/*" 
                  onChange={handleImageUpload}
                />
                Upload an image
              </label>
              <button 
                onClick={handleImageDelete}
                className="px-6 py-2 bg-[#BD3944] text-white rounded-md hover:bg-red-600 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
        <div className="flex flex-col md:flex-row items-center gap-4">
          <img
            src={`http://localhost:8001/` + profileData.avatar || "https://github.com/shadcn.png"}
            alt="Profile Avatar"
            className="w-24 h-24 bg-blue-800 rounded-full border-2 border-white/90"
          />
          <div className="space-y-2 text-center md:text-left">
            <h3 className="font-inter text-white text-sm">Profile Avatar</h3>
            <div className="flex flex-wrap justify-center md:justify-start gap-3">
              <label className="px-6 py-2 bg-white text-black rounded-md hover:bg-white/90 transition-colors cursor-pointer">
                <input 
                  type="file" 
                  className="hidden"
                  accept="media/*" 
                  onChange={handleAvatarUpload}
                />
                Upload an avatar
              </label>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-6 pt-8 border-t border-white/80">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="md:col-span-2">
            <label className="block text-sm text-white/90 mb-2">Full Name</label>
            <input
              type="text"
              value={profileData.fullname}
              onChange={(e) => setProfileData(prev => ({...prev, fullname: e.target.value}))}
              className="w-full px-4 py-2 bg-black/80 border border-white/10 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-white/5 transition-all mb-4"
            />
          </div>
          <div>
            <label className="block text-sm text-white/90 mb-2">Username</label>
            <input
              type="text"
              value={profileData.username}
              readOnly
              className="w-full px-4 py-2 bg-black/80 border border-white/10 text-gray-500 rounded-lg cursor-not-allowed opacity-50"
            />
          </div>
          <div>
            <label className="block text-sm text-white/90 mb-2">Email</label>
            <input
              type="email"
              value={profileData.email}
              readOnly
              className="w-full px-4 py-2 bg-black/80 border border-white/10 text-gray-500 rounded-lg cursor-not-allowed opacity-50"
            />
          </div>
        </div>

        <button 
          onClick={handleSubmit}
          className="w-40 px-2 py-2 bg-white text-black rounded-lg hover:bg-white/80 transition-colors text-sm font-Inter"
        >
          Submit
        </button>

        <div className="flex flex-wrap justify-center gap-4 pt-8 border-t border-white/80">
          <button className="px-6 py-2 bg-white text-black rounded-lg hover:bg-white/90 transition-colors flex items-center gap-4">
            <img
              src={googleImage}
              alt="Google"
              className="w-6 h-6"
            />
            Link with Google
          </button>
          <button className="px-12 py-2 bg-[#1a1a1a] text-white rounded-lg hover:bg-[#1a1a1a]/90 transition-colors flex items-center gap-4">
            <img
              src={intraImage}
              alt="42"
              className="w-6 h-6"
            />
            Link with 42
          </button>
        </div>
      </div>
    </div>
  );
}

