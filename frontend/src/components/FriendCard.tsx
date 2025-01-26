import React from 'react';

const FriendCard = ({ name, imageUrl, onClick }) => {
    // Construct the full image URL by prepending the backend URL
    const fullImageUrl = imageUrl?.startsWith('http') 
        ? imageUrl 
        : `/api/usermanagement${imageUrl}`;

    return (
        <div 
            className="relative flex flex-col items-center shadow-lg overflow-hidden rounded-bl-[30px] w-[150px] h-[200px] cursor-pointer" 
            onClick={onClick}
        > 
            <img 
                src={fullImageUrl}
                alt={name} 
                className="w-full h-[170px] rounded-tr-[24px] object-cover"
                onError={(e) => {
                    e.target.src = '/api/usermanagement/media/avatar/1.svg'; // Fallback avatar
                }}
            />
            <div 
                className="absolute bottom-0 bg-[#3E5EB4] w-full h-[30px] rounded-bl-[30px] flex items-center justify-center"
            >
                <h3 className="text-white text-center text-sm font-medium truncate px-2 w-full">
                    {name}
                </h3>
            </div>
        </div>
    );
};

export default FriendCard;
