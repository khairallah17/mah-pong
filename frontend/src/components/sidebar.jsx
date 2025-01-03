
import SidebarList from "./sidebarList"
import { LayoutGrid, MessageCircleMore, Wallet } from "lucide-react"
import { useSidebarContext } from "../hooks/useSidebar"
import { LogOut } from "lucide-react"
import { NavLink } from "react-router-dom"

const navigation = [
    {icon: <LayoutGrid size={24} />,root: "dashboard", link:"dashboard", list: ["overview","game", "leaderboard"]},
    {icon: <MessageCircleMore size={24} />,root: "chat", link:"dashboard/chat", list: []},
    {icon: <Wallet size={24} />,root: "shop", link:"dashboard/shop", list: []}
]

const Sidebar = () => {

    const { open } = useSidebarContext()

    return (
        <aside className={`sidebar-grid pt-2 pb-10 bg-black bg-opacity-45 text-white flex flex-col ${!open ? "w-20" : ""} transition-all px-6 ransition-all duration-300 overflow-hidden shadow-md z-40 items-start justify-between`}>
            <ul className="space-y-6">
                {
                    navigation.map((item, index) => (
                        <SidebarList key={index} link={item.link} icon={item.icon} item={item.root} list={item.list} />
                    ))
                }
            </ul>
            <div className="space-y-4">
                <NavLink to="/dashboard/profile" className='items-center gap-3 md:hidden flex'>
                    <div className='w-6 h-6 bg-white rounded-full'></div>
                    <p className={`text-gray-500 text-sm hover:text-white duration-200 ${open ? "inline" : "hidden"}`}>mkhairal</p>
                </NavLink>
                <button className="text-gray-500 flex items-center gap-2 hover:text-white duration-200">
                    <LogOut className="text-gray-500"/>
                    <p className={`${open ? "flex" : "hidden"}`}>Logout</p>
                </button>
            </div>
        </aside>
    )
}

export default Sidebar