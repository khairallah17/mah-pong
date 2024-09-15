import { React, useContext, useState } from 'react'
// import { Link } from 'react-router-dom'
// import google_logo from '../images/google_logo.png'
// import intra_logo from '../images/42_Logo.png'
// import pong_rihgt from "../images/pong right.png"
import AuthContext from "../context_login_Register/AuthContext"

export const Login = () => {

  // const [email, setEmail] = useState("")
  // const [password, setPassword] = useState("")

  const {loginUsers} = useContext(AuthContext)

  const loginsubmit = (event) => {
    event.preventDefault();
    const email = event.target.email.value
    const password = event.target.password.value
    // console.log(email);
    // console.log(password);
    loginUsers(email, password)
  }

  return (
    <div className='login text-white'>
          <form onSubmit={loginsubmit}>
            <h1 className='font-bold rgb(255, 255, 255)'>LOGIN</h1>
            <input type="email" autoComplete='off'  name="email"   placeholder='EMAIL' required/>
            <input type="password" autoComplete='off' name='password'  placeholder='PASSWORD' required/>
            <div className='btn-login'>
                <button type="submit">SIGN IN</button>
            </div>
          </form>
    </div>
  )
}

export default Login
