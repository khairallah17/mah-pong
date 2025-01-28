import { createContext, useEffect, useState, useTransition } from "react"
import { useAuthContext } from "../hooks/useAuthContext";
import useWebsocketContext from "../hooks/useWebsocketContext";
import { useNavigate } from "react-router-dom"
import { toast } from 'react-toastify';
import { Gamepad2, Trophy, Activity, BarChart2, XCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';

const ProfileContext = createContext({})

export const ProfilContextProvider = ({ children }) => {

    const { t } = useTranslation()

    const [activeTab, setActiveTab] = useState('stats');
    const [totalGames, setTotalGames] = useState(0);
    const [winRate, setWinRate] = useState(0);
    const [loading, setLoading] = useState(true)
    const [userData, setUserData] = useState(null)

    const [stats, setStats] = useState([
        { label: 'Total Games', value: '...', icon: <Gamepad2 size={20} />, color: 'from-blue-500 to-purple-500' },
        { label: 'Win Rate', value: '...', icon: <Trophy size={20} />, color: 'from-green-500 to-emerald-500' },
        { label: 'ELO Rating', value: '...', icon: <Activity size={20} />, color: 'from-yellow-500 to-orange-500' },
        { label: 'Wins', value: '...', icon: <BarChart2 size={20} />, color: 'from-pink-500 to-rose-500' },
        { label: 'Losses', value: '...', icon: <XCircle size={20} />, color: 'from-red-500 to-red-600' }
    ]);
    const [weeklyPerformance, setWeeklyPerformance] = useState([0, 0, 0, 0, 0, 0, 0]);

    const [currentFriend , setCurrentFriend] = useState(null)

    const navigate = useNavigate();
    const [profil, setProfil] = useState(null);
    const [playerStats, setPlayerStats] = useState([]);
    const [requests, setRequests] = useState([]);
    const [error, setError] = useState(null);
    const [pendingRequest, setPendingRequest] = useState(null);
    const [friendStatus, setFriendStatus] = useState('none');
    const [users, setUsers] = useState(true);
    const { wsManager } = useWebsocketContext();

    const { authtoken } = useAuthContext()
    const { user } = useAuthContext()
    const currentUser = user.username

    const { username } = useParams()
    

    useEffect(() => {
        setCurrentFriend(username)
    }, [username])

    const fetchProfil = async () => {
        try {
            const response = await fetch(`/api/usermanagement/api/user-profile/${username}/`);
            if (!response.ok) {
                throw new Error('Profile not found');
            }
            const data = await response.json();
            setProfil(data);
            await checkFriendStatus();
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false)
        }
    };
    
    const fetchStats = async () => {
        try {
            setLoading(true)
            if (!username) {
                setCurrentFriend(user.username)
            }

            const response = await fetch(`/api/game/api/player-stats/${username}/`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authtoken}`
            }
            });

            const data = await response.json();
            setUserData(data)

            const totalGames = data?.wins + data?.losses;
            const winRate = totalGames > 0 ? Math.round((data.wins / totalGames) * 100) : 0;
            const eloRating = data.elo ?? 0;
            const dataWins = data.wins ?? 0;
            const dataLosses = data.losses ?? 0;
    
            
            setStats([
                {
                    label: t('Total Games'),
                    value: `${totalGames || "0"}`,
                    icon: <Gamepad2 size={20} />,
                    color: 'from-blue-500 to-purple-500'
                },
                {
                    label: t('Win Rate'),
                    value: `${winRate}%`,
                    icon: <Trophy size={20} />,
                    color: 'from-green-500 to-emerald-500'
                },
                {
                    label: t('ELO Rating'),
                    value: eloRating.toString(),
                    icon: <Activity size={20} />,
                    color: 'from-yellow-500 to-orange-500'
                },
                {
                    label: t('Wins'),
                    value: dataWins.toString(),
                    icon: <BarChart2 size={20} />,
                    color: 'from-pink-500 to-rose-500'
                },
                {
                    label: t('Losses'),
                    value: dataLosses.toString(),
                    icon: <XCircle size={20} />,
                    color: 'from-red-500 to-red-600'
                }
            ]);
            
            const todayPerformance = winRate;
            const weeklyStats = [0, 0, 0, 0, 0, 0, todayPerformance];
            setWeeklyPerformance(weeklyStats);

            setTotalGames(totalGames);
            setWinRate(winRate);

        } catch (error) {
            console.error('Error fetching stats:', error);
        } finally {
            setLoading(false)
        }
    };

    const handleGameInvite = async () => {
        try {
            const code = Math.random().toString(36).substring(2, 15);
            
            navigate(`/dashboard/game/pvp2d?invite=${code}`, {
                replace: true
            });
            wsManager.sendMessage(`${user.username} has invited you to a game!`, [currentFriend], `/dashboard/game/pvp2d?invite=${code}`);
        } catch (error) {
            console.error('Error generating invite:', error);
        }
    };
    
    const checkFriendStatus = async () => {

        try {
            // Check friend requests
            const response = await fetch(`/api/usermanagement/api/friend-requests/`, {
                headers: {
                    'Authorization': `Bearer ${authtoken}`
                }
            });
            
            if (!response.ok) {
                throw new Error('Failed to fetch friend requests');
            }

            const requests = await response.json();
            setRequests(requests);
            // Check for any pending or accepted requests between the users
            const existingRequest = requests.find(request => 
                (request.sender_username === currentUser && request.receiver_username === username) ||
                (request.sender_username === username && request.receiver_username === currentUser)
            );

            console.log(existingRequest)

            if (existingRequest) {
                setPendingRequest(existingRequest);
                if (existingRequest.status === 'pending') {
                    setFriendStatus('pending');
                    return;
                } else if (existingRequest.status === 'accepted') {
                    setFriendStatus('friends');
                    return;
                }
                // setFriendStatus()
            }
    
            // If no request exists, check friends list
            const friendsResponse = await fetch(`/api/usermanagement/api/friends/`, {
                headers: {
                    'Authorization': `Bearer ${authtoken}`
                }
            });
    
            if (!friendsResponse.ok) {
                throw new Error('Failed to fetch friends list');
            }
    
            const friendsData = await friendsResponse.json();
            const isFriend = friendsData.friends?.some(friend => friend.username === username);
    
            setFriendStatus(isFriend ? 'friends' : 'none');
        } catch (err) {
            console.error(err)
            toast.warn(`Error checking friend status: ${err}`, {
                position: "top-right",
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: false,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: "dark",
            })
            setFriendStatus('none');
        }
    };

    const handleFriendRequest = async () => {
        try {
            const response = await fetch('/api/usermanagement/api/friend-requests/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authtoken}`
            },
            body: JSON.stringify({ receiver: currentFriend })
            });

            if (!response.ok) {
            const data = await response.json();
            throw new Error(data.detail || 'Failed to send friend request');
            }

            const newRequest = await response.json();
            setPendingRequest(newRequest);
            setFriendStatus('pending');
            wsManager?.sendMessage(`${currentUser} sent you a friend request`, [currentFriend], `/dashboard/profil/${currentUser}`);
        } catch (err) {
            toast.warn(`Error: ${err}`, {
            position: "top-right",
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: false,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
            theme: "dark",
            })
            setError(err.message);
        }
    };
    
    const handleAcceptRequest = async () => {
    try {
        // First get the pending request ID
        const response = await fetch(`/api/usermanagement/api/friend-requests/`, {
        headers: {
            'Authorization': `Bearer ${authtoken}`
        }
        });
        const requests = await response.json();
        
        const pendingRequest = requests.find(request => 
        request.sender_username === currentFriend && 
        request.receiver_username === currentUser &&
        request.status === 'pending'
        );

        if (!pendingRequest) {
        throw new Error('Friend request not found');
        }

        // Accept the request
        const acceptResponse = await fetch(`/api/usermanagement/api/friend-requests/${pendingRequest.id}/accept/`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${authtoken}`
        }
        });

        if (!acceptResponse.ok) {
        throw new Error('Failed to accept friend request');
        }

        setFriendStatus('friends');
        wsManager?.sendMessage(`${currentUser} accepted your friend request`, [currentFriend], `/dashboard/profil/${currentUser}`);
    } catch (err) {
        toast.warn(`Error accepting friend request: ${err}`, {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: false,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "dark",
        })
        setError(err.message);
    }
    };

    const handleRejectRequest = async () => {
    try {
        const response = await fetch(`/api/usermanagement/api/friend-requests/`, {
        headers: {
            'Authorization': `Bearer ${authtoken}`
        }
        });
        const requests = await response.json();
        
        const pendingRequest = requests.find(request => 
        request.sender_username === currentFriend && 
        request.receiver_username === currentUser &&
        request.status === 'pending'
        );

        if (!pendingRequest) {
        throw new Error('Friend request not found');
        }

        const rejectResponse = await fetch(`/api/usermanagement/api/friend-requests/${pendingRequest.id}/reject/`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${authtoken}`
        }
        });

        if (!rejectResponse.ok) {
        throw new Error('Failed to reject friend request');
        }

        setFriendStatus('none');
        wsManager.sendMessage(`${currentUser} Rejected your friend request`, [currentFriend], `/dashboard/profil/${currentUser}`);
    } catch (err) {
        toast.warn(`Error rejecting friend request: ${err}`, {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: false,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "dark",
        })
        setError(err.message);
    }
    };

    const handleCancelRequest = async () => {
    try {
        const response = await fetch(`/api/usermanagement/api/friend-requests/`, {
        headers: {
            'Authorization': `Bearer ${authtoken}`
        }
        });
        const requests = await response.json();
        
        const pendingRequest = requests.find(request => 
        request.sender_username === currentUser && 
        request.receiver_username === currentFriend &&
        request.status === 'pending'
        );

        if (!pendingRequest) {
        throw new Error('Friend request not found');
        }

        const cancelResponse = await fetch(`/api/usermanagement/api/friend-requests/${pendingRequest.id}/cancel/`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${authtoken}`
        }
        });

        if (!cancelResponse.ok) {
        throw new Error('Failed to cancel friend request');
        }

        setFriendStatus('none');
    } catch (err) {
        toast.warn(`Error canceling friend request: ${err}`, {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: false,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "dark",
        })
        setError(err.message);
    }
    };

    const handleRemoveFriend = async () => {
    try {
        const response = await fetch('/api/usermanagement/api/friends/remove/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authtoken}`
        },
        body: JSON.stringify({ username })
        });

        if (!response.ok && response.status != 404) {
        throw new Error('Failed to remove friend');
        }

        setFriendStatus('none');
    } catch (err) {
        toast.warn(`Error removing friend: ${err}`, {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: false,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "dark",
        })
        setError(err.message);
    }
    };


    const values = {
        activeTab, setActiveTab,
        totalGames, setTotalGames,
        winRate, setWinRate,
        loading, setLoading,
        fetchStats,
        fetchProfil,
        handleGameInvite,
        handleFriendRequest,
        handleAcceptRequest,
        handleRejectRequest,
        handleCancelRequest,
        handleRemoveFriend,
        profil, setProfil,
        playerStats, setPlayerStats,
        requests, setRequests,
        error, setError,
        pendingRequest, setPendingRequest,
        friendStatus, setFriendStatus,
        users, setUsers,
        currentFriend , setCurrentFriend,
        stats, setStats,
        weeklyPerformance, setWeeklyPerformance
    }

    return (
        <ProfileContext.Provider value={values}>
            {children}
        </ProfileContext.Provider>
    )

}

export default ProfileContext