import { useSidebarContext } from '../hooks/useSidebar'
import { Search, X, Menu } from 'lucide-react'

const Navbar = () => {

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
                    <input type="search" name='search' className='outline-none bg-transparent text-gray-500 text-xs' placeholder='Search For a Friend' />
                </div>
                <div className='items-center gap-3 md:flex hidden'>
                    <div>
                        <p className=''>Mohammed khairallah</p>
                        <p className='text-gray-500 text-sm'>mkhairal</p>
                    </div>
                    <div className='w-12 h-12 bg-white rounded-full'></div>
                </div>
            </div>

        </div>
    )
}

export default Navbar