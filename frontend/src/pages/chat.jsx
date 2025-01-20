import React, { useEffect } from 'react'
import { useSidebarContext } from '../hooks/useSidebar'
import ChatComponent from '../components/ChatComponent'

const Chat = () => {

    const { setActiveLink } = useSidebarContext()

    useEffect(() => {
        setActiveLink("chat")
    }, [])

  return (
    <ChatComponent />
  )
}

export default Chat