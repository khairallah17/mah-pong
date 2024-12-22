import React, { useState, useRef, useEffect } from "react";
import { UserSearchService } from "../services/userSearchService";
import FriendCard from "./FriendCard";
import leftArrowImg from "../images/left.png";
import rightArrowImg from "../images/right.png";
import searchicon from "../images/searchIcon.png";
import "../styles/SearchPage.css";

const FriendFinder = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const cardContainerRef = useRef(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [users, setUsers] = useState([]);
  const [totalPages, setTotalPages] = useState(0);
  const [totalResults, setTotalResults] = useState(0);
  const [friendsToShow, setFriendsToShow] = useState(6);
  const [isLoading, setIsLoading] = useState(false);

  // Debounce search to reduce unnecessary API calls
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (searchTerm) {
        handleSearch();
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm]);

  // Responsive layout adjustment
  useEffect(() => {
    const updateFriendsToShow = () => {
      const screenWidth = window.innerWidth;
      if (screenWidth < 640) {
        setFriendsToShow(2); // Mobile: show 2 cards
      } else if (screenWidth < 1024) {
        setFriendsToShow(4); // Tablet: show 4 cards
      } else {
        setFriendsToShow(6); // Laptop/desktop: show 6 cards
      }
    };

    updateFriendsToShow();
    window.addEventListener("resize", updateFriendsToShow);

    return () => window.removeEventListener("resize", updateFriendsToShow);
  }, []);

  const handleSearch = async () => {
    setIsLoading(true);
    try {
        const result = await UserSearchService.searchUsers(
            searchTerm, 
            currentPage, 
            friendsToShow
        );

        setUsers(result.users || []); // Fallback to an empty array if users are undefined
        setTotalPages(result.totalPages);
        setTotalResults(result.total);
    } catch (error) {
        console.error('Search failed:', error);
        setUsers([]); // Ensure users is set to an empty array on error
        setTotalPages(0);
        setTotalResults(0);
    } finally {
        setIsLoading(false);
    }
};


  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
    setCurrentPage(1);
  };

  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage((prev) => prev + 1);
      handleSearch();
    }
  };

  const goToPreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage((prev) => prev - 1);
      handleSearch();
    }
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
            <label className="font-Inter text-white opacity-78 mr-5 transition-opacity duration-300">
              {totalResults} results matched
            </label>

            <div
              style={{
                background: "linear-gradient(90deg, #2730AE 0%, #0A0935 100%)",
              }}
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

      <div className="flex flex-col items-center bg-transparent px-4 mt-6">
        <div className="mb-4 ">
          <h2 className="font-Rajdhani text-3xl md:text-[40px] font-[500] leading-[36px] text-white mb-6">
            FRIENDS
          </h2>
        </div>

        {isLoading ? (
          <div className="text-white">Loading...</div>
        ) : (
          <div className="flex items-center justify-center mb-4 w-full">
            <button
              onClick={goToPreviousPage}
              className="p-2"
              disabled={currentPage === 1}
            >
              <img
                src={leftArrowImg}
                alt="Scroll Left"
                className={`cursor-pointer ${
                  currentPage === 1 ? "opacity-50" : "opacity-100"
                }`}
                style={{ width: "30px", height: "30px" }}
              />
            </button>

            <div
              ref={cardContainerRef}
              className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 p-2"
            >
              {Array.isArray(users) &&
                users.map((friend, index) => (
                  <FriendCard
                    key={friend.id || index}
                    name={friend.username}
                    imageUrl={friend.avatar}
                  />
                ))}
            </div>

            <button
              onClick={goToNextPage}
              className="p-2"
              disabled={currentPage === totalPages}
            >
              <img
                src={rightArrowImg}
                alt="Scroll Right"
                className={`cursor-pointer ${
                  currentPage === totalPages ? "opacity-50" : "opacity-100"
                }`}
                style={{ width: "30px", height: "30px" }}
              />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default FriendFinder;
