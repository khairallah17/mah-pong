import { useState } from 'react'
import { ChevronDown } from 'lucide-react';
import { useSidebarContext } from '../hooks/useSidebar';
import { NavLink } from 'react-router-dom';

const SidebarList = ({item, list, icon, link}) => {

    const [dropdownList, setDropdownList] = useState(false)

    const dropMenu = () => setDropdownList(!dropdownList)

    const {
        activeLink,
        goToPage,
        open,
        activeSublink
    } = useSidebarContext()

    return (
        <li>
            <div className='flex items-center gap-2 '>
                <button onClick={() => goToPage(item, link)} className={`flex items-center gap-2 hover:text-white duration-200 ${item?.toLowerCase() == activeLink?.toLowerCase() ? "text-white" : "text-gray-500"}`}>
                    {icon}
                    <p className={`${open ? "flex" : "hidden"}`}>{item}</p>
                </button>
                <button className={`${!open ? "hidden" : "flex"}`} onClick={dropMenu}>
                    {
                        list.length ? (
                            <ChevronDown className={`${dropdownList && "rotate-180"} duration-200 ${item?.toLowerCase() == activeLink?.toLowerCase() ? "text-white" : "text-gray-500"}`}/>
                        ) : (
                            <></>
                        )
                    }
                </button>
            </div>
            <ul className={`${dropdownList ? "h-fit mt-2" : "h-0 m-0"} ml-8 overflow-hidden  duration-200 space-y-1 text-gray-500`}>
                {
                    open && list.map((i, index) => (
                        <li key={index} className='hover:text-white duration-200'>
                            <NavLink className={`${activeSublink?.toLocaleLowerCase() == i?.toLocaleLowerCase() && "text-white"}`} to={`/dashboard/${i}`}>
                                {i}
                            </NavLink>
                        </li>
                    ))
                }
            </ul>
        </li>
    )
}

export default SidebarList