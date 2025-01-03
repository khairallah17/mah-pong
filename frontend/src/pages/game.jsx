import React, { useEffect } from 'react'
import { useSidebarContext } from '../hooks/useSidebar'

const Games = () => {

    const { setActiveLink } = useSidebarContext()

    useEffect(() => {
        setActiveLink("game")
    }, [])

  return (
    <div>Games</div>
  )
}

export default Games