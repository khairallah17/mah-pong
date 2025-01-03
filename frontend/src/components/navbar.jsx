import { useSidebarContext } from '../hooks/useSidebar'
import { Search, X, Menu } from 'lucide-react'
import NotificationDisplay from '../pages/NotificationDisplay'
import { jwtDecode } from 'jwt-decode';

const Navbar = () => {

    const accessToken = JSON.parse(localStorage.getItem('authtoken')).access;
    const username = jwtDecode(accessToken).username;
    const { toggleSidebar, open } = useSidebarContext()    

    console.log("OPEN ==> ", open)

    return (
        <div className='navbar-grid text-white flex items-center w-full px-6 bg-black bg-opacity-45'>
            <div className='w-[176px] md:min-w-[176px] flex items-center gap-2'>
                <button onClick={toggleSidebar}>
                    {
                        open ? <X size={24} /> : <Menu size={24} />
                    }
                </button>
                <p className="uppercase text-white font-bold">LOGO</p>
            </div>

            <div className='flex items-center justify-between w-full pl-10'>
                <div className='flex items-center gap-2'>
                    <Search className='text-gray-500' size={16}/>
                    <input type="search" name='search' className='outline-none bg-transparent text-gray-500 text-xs' placeholder='Search For a Player' />
                </div>
                <div className='items-center gap-3 md:flex hidden'>
                    <NotificationDisplay />
                    <div>
                        <p className=''>{username}</p>
                        <p className='text-gray-500 text-sm'>idk what to put here</p>
                    </div>
                    <div className='w-12 h-12 bg-white rounded-full'></div>
                </div>
            </div>

        </div>
    )
}

export default Navbar