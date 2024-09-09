import { React, useContext, useState } from 'react'
import { Link } from 'react-router-dom'
import google_logo from '../images/google_logo.png'
import intra_logo from '../images/42_Logo.png'
import pong_rihgt from "../images/pong right.png"
import AuthContext from "../context_login_Register/AuthContext"

export const Register = () => {
  const [fullname, setFullname] = useState("")
  const [username, setUsername] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmpassword, setConfirmpassword] = useState("")
  return (
    <div className='register'>
      <h1>Register</h1>
      <form className='form-container'>
        <input type="text" name="fullname" onChange={(e)=>setFullname(e.target.value)} required placeholder='FULLNAME'/>
        <input type="text" name="username" onChange={(e)=>setUsername(e.target.value)} required placeholder='USERNAME'/>
        <input type="email" name="email" onChange={(e)=>setEmail(e.target.value)} required placeholder='EMAIL'/>
        <input type="password" name="password" onChange={(e)=>setPassword(e.target.value)} required placeholder='PASSWORD'/>
        <input type="password" name="confirmpassword" onChange={(e)=>setConfirmpassword(e.target.value)} required placeholder='CONFIRM PASSWORD'/>
        <div className='btn-register'>
          <button type='button'>SIGN UP</button>
        </div>
        <div class="lines">
            <div class="line"></div>
            OR
            <div class="line"></div>
        </div>
        <div>
            <div class="social-row google-social">
                <a href="#" title="Use Google">
                    <img src={google_logo} alt="Google" />
                    Log in with Google
                </a>
            </div>
            <div class="social-row intra-social">
                <a href="#" title="Use 42">
                    <img src={intra_logo} alt="Intra" />
                    Log in with 42
                </a>
            </div>
        </div>
        <span>Don't have account?
          <Link to={'/login'}>
              SIGN IN
          </Link>
        </span>
      </form>
      <div className='pg-container'>
        <img src={pong_rihgt} alt="Pong" class="pong-row" />
      </div>
    </div>
  )
}

export default Register