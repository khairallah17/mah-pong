import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { useSidebarContext } from '../hooks/useSidebar'
import { NavLink } from 'react-router-dom'

const SidebarList = ({ item, list, icon, link }) => {
  const [dropdownList, setDropdownList] = useState(false)
  const { activeLink, goToPage, open, activeSublink } = useSidebarContext()

  const isActive = item?.toLowerCase() === activeLink?.toLowerCase()

  return (
    <li className="relative">
      <div className="flex items-center gap-2">
        {/* Main Navigation Item */}
        <NavLink
          to={`/${link}`}
          onClick={() => goToPage(item, link)}
          className={({ isActive }) => `
            flex items-center gap-3 w-full p-2 rounded-lg
            transition-colors duration-200
            ${isActive 
              ? 'bg-white/10 text-white' 
              : 'text-white/60 hover:text-white hover:bg-white/5'
            }
          `}
        >
          <span className="flex-shrink-0">{icon}</span>
          {open && <span className="text-sm">{item}</span>}
        </NavLink>

        {/* Dropdown Toggle Button */}
        {list.length > 0 && open && (
          <button
            onClick={() => setDropdownList(!dropdownList)}
            className={`
              absolute right-2 p-1 rounded-md
              hover:bg-white/10 transition-transform duration-200
              ${dropdownList ? 'rotate-180' : 'rotate-0'}
              ${isActive ? 'text-white' : 'text-white/60'}
            `}
          >
            <ChevronDown size={16} />
          </button>
        )}
      </div>

      {/* Dropdown List */}
      {list.length > 0 && (
        <ul
          className={`
            overflow-hidden transition-all duration-200 space-y-1
            ${dropdownList ? 'max-h-48 mt-1' : 'max-h-0'}
            ${open ? 'opacity-100' : 'opacity-0'}
          `}
        >
          {open && list.map((subItem, index) => (
            <li key={index}>
              <NavLink
                to={`/dashboard/${item.toLowerCase()}/${subItem}`}
                className={({ isActive }) => `
                  block pl-11 pr-3 py-2 rounded-lg text-sm
                  transition-colors duration-200
                  ${isActive 
                    ? 'bg-white/10 text-white' 
                    : 'text-white/60 hover:text-white hover:bg-white/5'
                  }
                `}
              >
                {subItem}
              </NavLink>
            </li>
          ))}
        </ul>
      )}
    </li>
  )
}

export default SidebarList

