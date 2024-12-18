// src/FriendCard.tsx
import React from 'react';


const FriendCard = ({ name, imageUrl }) => {
    return (
        <div className="relative flex flex-col items-center shadow-lg overflow-hidden rounded-bl-[30px]  w-full h-full"> {/* Card dimensions */}
            <img 
                src={imageUrl} 
                alt={name} 
                className="bg-[#94a3cd]  rounded-tr-[24px] object-cover  " // Image with rounded corners
            />
            <div 
                className="bg-[#3E5EB4] w-full h-[30px] rounded-bl-[30px] flex items-center justify-center opacity-100" // Name background
                style={{ position: 'absolute', bottom: 0 }} // Positioning the name container
            >
                <h3 className="text-white text-center">
                    {name}
                </h3>
            </div>
        </div>
    );
};

export default FriendCard;
