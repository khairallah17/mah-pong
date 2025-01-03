import React from 'react'
import { useSidebarContext } from '../hooks/useSidebar'

const Settings = () => {
    
    const { setActiveLink } = useSidebarContext()
    
    useSidebarContext(() => {
        setActiveLink("settings")
    }, [])

    return (
        <div>Settings</div>
    )
}

export default Settings