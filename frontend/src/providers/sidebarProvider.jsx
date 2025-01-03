import SidebarContext from "../context/sidebarContext"
import { useState } from "react"
import { useNavigate } from "react-router-dom"

const SidebarContextProvider = ({children}) => {
    
    const navigation = useNavigate()

    if (!navigation)
        throw new Error("error initiaising navigation")

    const [open, setOpen] = useState(false)
    const [activeLink, setActiveLink] = useState("dashboard")
    const [activeSublink, setActiveSublink] = useState("overview")

    const toggleSidebar = () => setOpen(!open)
    const goToPage = (link, to) => {
        setActiveLink(link)
        navigation(`/${to}`)
        setActiveSublink("")
    }
    
    return (
        <SidebarContext.Provider value={{
            open,
            activeLink, setActiveLink,
            goToPage,
            toggleSidebar,
            activeSublink, setActiveSublink
        }}>
            {children}
        </SidebarContext.Provider>
    )
}

export default SidebarContextProvider

