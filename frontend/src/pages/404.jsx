import React from 'react'
import { NavLink } from 'react-router-dom'

const NotFound = () => {
    return (
        <div className="h-screen w-full flex-col flex gap-4 items-center justify-center bg-root-background bg-cover bg-center bg-no-repeat text-white">
            NotFound
            <NavLink to="/dashboard" className="bg-black font-bold text-3xl p-4 px-8 rounded-lg">
                Fall Back To Safe Zone
            </NavLink>
        </div>
    )
}

export default NotFound