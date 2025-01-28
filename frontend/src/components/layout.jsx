import Sidebar from './sidebar'
import Navbar from './navbar'
import { Outlet } from 'react-router-dom'
import { useSidebarContext } from '../hooks/useSidebar'

const Layout = () => {

  const { open } = useSidebarContext()

  return (
      <div className={`root-grid bg-root-background bg-cover bg-no-repeat bg-center h-screen font-inter max-h-screen ${!open ? "grid-cols-[80px_1fr]" : "grid-cols-[200px_1fr]"}`}>
          <Navbar/>
          <Sidebar/>
          <main className="flex-1 relative items-center justify-center flex-col text-white content-grid max-h-screen w-full h-full">
            <Outlet/>
          </main>
      </div>
  )
}

export default Layout