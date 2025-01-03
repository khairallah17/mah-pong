import React, { useEffect } from 'react'
import { useSidebarContext } from '../hooks/useSidebar'

const Chat = () => {

    const { setActiveLink } = useSidebarContext()

    useEffect(() => {
        setActiveLink("chat")
    }, [])

  return (
    <div>Chat</div>
  )
}

export default Chat