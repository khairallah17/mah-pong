import { useState } from 'react'

import pong_right from "../images/pong right.png"

import LoginForm from '../components/auth/login.jsx'
import SignupForm from '../components/auth/signup.jsx'

import { motion } from "framer-motion"

export const Authentication = () => {

  const [ swap, setSwap ] = useState(false)

  const swapIt = () => {
    setSwap(!swap)
  }

  return (

    <div className="bg-root-background h-screen w-screen bg-cover bg-center">
      <div className="container mx-auto grid lg:grid-cols-2 text-white h-full relative">
        <motion.div
        layout
        transition={{ duration: 0.5 }}
        className={` ${
            swap ? "order-2" : "order-1"
        }`}
        >

          {
            swap ? 
            <SignupForm setSwap={swapIt} /> :
            <LoginForm setSwap={swapIt} />
          }
        </motion.div>

        <motion.div
          layout
          transition={{ duration: 0.5 }}
          className={`h-full hidden lg:flex justify-center items-center ${
            swap ? "order-1" : "order-2"
          }`}
        >
          <motion.img transition={{ duration: 0.5 }} src={pong_right} alt="Pong" className={`w-3/4 duration-500 ${swap ? "" : "-scale-x-100"}`} />
        </motion.div>
      </div>
    </div>
  )
}

export default Authentication
