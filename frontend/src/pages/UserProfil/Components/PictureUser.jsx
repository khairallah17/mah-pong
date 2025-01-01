import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { jwtDecode } from "jwt-decode"


const PictureUser = () => {
  const [profil, setProfil] = useState(null);
  const [error, setError] = useState(null);
  const { username } = useParams();
  const token = JSON.parse(localStorage.getItem('authtoken')).access;


  useEffect(() => {
    const fetchProfil = async () => {
      try {
        const response = await fetch(`http://localhost:8001/api/user-profile/${username}/`);
        if (!response.ok) {
          throw new Error('Profil not found');
        }
        const data = await response.json();
        setProfil(data);
      } catch (err) {
        setError(err.message);
      }
    };

    fetchProfil();
    console.log(jwtDecode(token).username)
  }, [username]);

  if (error) return (
    <div className="flex items-center justify-center h-screen text-red-500">
      Error: {error}
    </div>
  );
  
  if (!profil) return (
    <div className="flex items-center justify-center h-screen text-white">
      Loading...
    </div>
  );

  return (
    <div className="min-h-screen bg-navy-900 flex flex-col items-right pt-12">
      {/* Profil Card */}
      <div className="max-w-md bg-navy-800 rounded-3xl p-16 space-y-6 ">
        {/* Avatar Section */}
        <div className="flex flex-col w-[317px] rounded-lg bg-gradient-to-t items-center space-y-4">
          <div className="">
            <div className="w-[260px] h-[260px] rounded-full bg-purple-500 overflow-hidden  border-2 border-white">
              <img 
                src={`http://localhost:8001/${profil.img}`}
                alt="Profil"
                className="w-full h-full object-cover"
              />
            </div>
            {profil.profil?.is_verified && (
              <div className="absolute bottom-0 right-0 bg-white-500 p-1 rounded-full">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-6 text-black" fill="#3B82F6" viewBox="0 0 24 24">
                  <path d="M12 2C6.47715 2 2 6.47715 2 12C2 12.7284 2.08161 13.4374 2.23594 14.1154C2.46719 15.1468 2.87657 16.1103 3.43198 16.9679C4.93013 19.3065 7.29939 20.9334 10.0639 21.6434C10.6902 21.8113 11.3378 21.9133 12 21.9133C12.6622 21.9133 13.3098 21.8113 13.9361 21.6434C16.7006 20.9334 19.0699 19.3065 20.568 16.9679C21.1234 16.1103 21.5328 15.1468 21.7641 14.1154C21.9184 13.4374 22 12.7284 22 12C22 6.47715 17.5228 2 12 2ZM16.7071 10.7071L11.7071 15.7071C11.3166 16.0976 10.6834 16.0976 10.2929 15.7071L7.29289 12.7071C6.90237 12.3166 6.90237 11.6834 7.29289 11.2929C7.68342 10.9024 8.31658 10.9024 8.70711 11.2929L11 13.5858L15.2929 9.29289C15.6834 8.90237 16.3166 8.90237 16.7071 9.29289C17.0976 9.68342 17.0976 10.3166 16.7071 10.7071Z" />
                </svg>
              </div>
            )}
          </div>
          {/* Name and Status */}
          <div className="text-center space-y-1">
            <h2 className="text-white text-xl font-semibold">{profil.fullname}</h2>
            <p className="text-gray-400 text-sm">{profil.username}</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          {jwtDecode(token).username === profil.username ?(
            <>
                <button className="w-[317px] h-[60px] bg-gray-800 text-white py-3 rounded-xl hover:bg-gray-700 transition-colors">
                  Edit Profil
                </button>
                <button className="w-[317px] h-[60px] bg-gray-800 text-white py-3 rounded-xl hover:bg-gray-700 transition-colors">
                  Invite game
                </button>
              </>
            ) : (
              <>
                <button className="w-[317px] h-[60px] bg-gray-800 text-white py-3 rounded-xl hover:bg-gray-700 transition-colors">
                  Add frined
                </button>
                <button className="w-[317px] h-[60px] bg-gray-800 text-white py-3 rounded-xl hover:bg-gray-700 transition-colors">
                  Invite game
                </button>
              </>
            )}
        </div>
      </div>
    </div>
  );
};

export default PictureUser;
