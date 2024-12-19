import React, { useState, useRef, useEffect } from 'react';
import FriendCard from './FriendCard';
import leftArrowImg from '../images/left.png'; // Make sure the path is correct
import rightArrowImg from '../images/right.png'; // Make sure the path is correct
import searchicon from '../images/searchIcon.png'; // Make sure the path is correct
import '../styles/SearchPage.css';

const friendsData = [
    { name: 'Alice', imageUrl: '/public/player1.png' },
    { name: 'Bob', imageUrl: '/public/player2.png' },
    { name: 'Charlie', imageUrl: '/public/player3.png' },
    { name: 'Diana', imageUrl: '/public/player4.png' },
    { name: 'Emma', imageUrl: '/public/player5.png' },
    { name: 'Frank', imageUrl: '/public/player6.png' },
    { name: 'Alice', imageUrl: '/public/player1.png' },
    { name: 'Bob', imageUrl: '/public/player2.png' },
    { name: 'Charlie', imageUrl: '/public/player3.png' },
    { name: 'Diana', imageUrl: '/public/player4.png' },
    { name: 'Emma', imageUrl: '/public/player5.png' },
    { name: 'Frank', imageUrl: '/public/player6.png' },
    { name: 'Alice', imageUrl: '/public/player1.png' },
    { name: 'Bob', imageUrl: '/public/player2.png' },
    { name: 'Charlie', imageUrl: '/public/player3.png' },
    { name: 'Diana', imageUrl: '/public/player4.png' },
    { name: 'Emma', imageUrl: '/public/player5.png' },
    { name: 'Frank', imageUrl: '/public/player6.png' },
    { name: 'Alice', imageUrl: '/public/player1.png' },
    { name: 'Bob', imageUrl: '/public/player2.png' },
    { name: 'Charlie', imageUrl: '/public/player3.png' },
    { name: 'Diana', imageUrl: '/public/player4.png' },
    { name: 'Emma', imageUrl: '/public/player5.png' },
    { name: 'Frank', imageUrl: '/public/player6.png' },
    // ... Add more friends as needed
];

const FriendFinder = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [isFocused, setIsFocused] = useState(false);
    const cardContainerRef = useRef<HTMLDivElement | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const friendsPerPage = 6; // Default friends per page (for laptop view)

    // Handle responsive friends per page based on screen size
    const [friendsToShow, setFriendsToShow] = useState(friendsPerPage);

    useEffect(() => {
        const updateFriendsToShow = () => {
            const screenWidth = window.innerWidth;
            if (screenWidth < 640) {
                setFriendsToShow(2); // Mobile: show 2 cards
            } else if (screenWidth < 1024) {
                setFriendsToShow(4); // Tablet: show 4 cards
            } else {
                setFriendsToShow(friendsPerPage); // Laptop/desktop: show 6 cards
            }
        };

        updateFriendsToShow();
        window.addEventListener('resize', updateFriendsToShow);

        return () => window.removeEventListener('resize', updateFriendsToShow);
    }, []);

    const totalPages = Math.ceil(friendsData.length / friendsToShow);

    // Handle search change and reset to first page
    const handleSearchChange = (event) => {
        setSearchTerm(event.target.value);
        setCurrentPage(1); // Reset to first page when search term changes
    };

    const filteredFriends = friendsData.filter(friend =>
        friend.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const startIndex = (currentPage - 1) * friendsToShow;
    const endIndex = startIndex + friendsToShow;
    const currentFriends = filteredFriends.slice(startIndex, endIndex);

    const goToNextPage = () => {
        setCurrentPage((prev) => Math.min(prev + 1, totalPages));
    };

    const goToPreviousPage = () => {
        setCurrentPage((prev) => Math.max(prev - 1, 1));
    };

    return (
        <div className="w-screen max-h-screen bg-background-imag bg-cover overflow-x-hidden bg-center">
            <header className="bg-opacity-70 p-4 md:p-10">
                <div className="container mx-auto flex justify-center items-center">
                    <div className="flex items-center relative">
                        <img
                            src={searchicon}
                            alt="Search"
                            className="w-[25px] h-[25px] opacity-78 mr-5 transition-all duration-300"
                        />
                        <label className="font-Inter text-white opacity-78  mr-5 transition-opacity duration-300">
                            {filteredFriends.length} results matched
                        </label>

                        <div
                            style={{ background: 'linear-gradient(90deg, #2730AE 0%, #0A0935 100%)' }}
                            className="flex items-center rounded-[15px] overflow-hidden w-full md:w-[468px] h-[41px] ml-2 transition-all duration-300"
                        >
                            <input
                                type="text"
                                placeholder="Search"
                                value={searchTerm}
                                onChange={handleSearchChange}
                                onFocus={() => setIsFocused(true)}
                                onBlur={() => setIsFocused(false)}
                                className="bg-transparent text-white placeholder-opacity-50 rounded-[15px] px-4 py-2 w-full h-full focus:outline-none focus:ring-0"
                            />
                        </div>
                    </div>
                </div>
            </header>

            <div className="flex flex-col items-center  bg-transparent px-4 mt-6">
                <div className="mb-4 ">
                    <h2 className="font-Rajdhani text-3xl md:text-[40px] font-[500] leading-[36px] text-white mb-6">
                        FRIENDS
                    </h2>
                </div>

                <div className="flex items-center justify-center mb-4 w-full">
                    <button onClick={goToPreviousPage} className="p-2" disabled={currentPage === 1}>
                        <img 
                            src={leftArrowImg} 
                            alt="Scroll Left" 
                            className={`cursor-pointer ${currentPage === 1 ? 'opacity-50' : 'opacity-100'}`} 
                            style={{ width: '30px', height: '30px' }}
                        />
                    </button>

                    <div ref={cardContainerRef} className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 p-2">
                        {currentFriends.map((friend, index) => (
                            <FriendCard key={index} name={friend.name} imageUrl={friend.imageUrl} />
                        ))}
                    </div>

                    <button onClick={goToNextPage} className="p-2" disabled={currentPage === totalPages}>
                        <img 
                            src={rightArrowImg} 
                            alt="Scroll Right" 
                            className={`cursor-pointer ${currentPage === totalPages ? 'opacity-50' : 'opacity-100'}`} 
                            style={{ width: '30px', height: '30px' }}
                        />
                    </button>
                </div>

                <div className="mt-10">
                    <h2 className="font-Rajdhani text-center text-3xl md:text-[40px] font-[500] leading-[36px]  text-white mb-6">
                        OTHERS
                    </h2>
                    <div className="custom-scrollbar mb-4 w-full overflow-y-auto">
                        <div className={`${friendsData.length > 6 ? 'grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6' : 'grid grid-cols-2 md:grid-cols-4 lg:flex'} gap-4 max-h-[88vh]`}>
                            {friendsData.map((friend, index) => (
                                <FriendCard key={index} name={friend.name} imageUrl={friend.imageUrl} />
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FriendFinder;
