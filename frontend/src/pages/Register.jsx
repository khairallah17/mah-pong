import { React, useContext, useState } from 'react'
import { Link } from 'react-router-dom'
import google_logo from '../images/google_logo.png'
import intra_logo from '../images/42_Logo.png'
import pong_rihgt from "../images/pong right.png"
import AuthContext from "../context/AuthContext"

export const Register = () => {
  const [fullname, setFullname] = useState("")
  const [username, setUsername] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmpassword, setConfirmpassword] = useState("")
  
  const {registerUsers} = useContext(AuthContext)
  const {GoogleLogin} = useContext(AuthContext)
  const {Intra42Login} = useContext(AuthContext)

  const registersubmit =  async (event) =>  {
    event.preventDefault();
    console.log(fullname);
    console.log(username);
    console.log(email);
    registerUsers(fullname, username, email, password, confirmpassword)
  }
  
  return (
    <div className='register'>
      <form className='form-container'>
      <h1>Register</h1>
        <input type="text" name="fullname" autoComplete='off' onChange={(event)=>setFullname(event.target.value)} required placeholder='FULLNAME'/>
        <input type="text" name="username" autoComplete='off' onChange={(event)=>setUsername(event.target.value)} required placeholder='USERNAME'/>
        <input type="email" name="email" autoComplete='off' onChange={(event)=>setEmail(event.target.value)} required placeholder='EMAIL'/>
        <input type="password" name="password" autoComplete='off' onChange={(event)=>setPassword(event.target.value)} required placeholder='PASSWORD'/>
        <input type="password" name="confirmpassword" autoComplete='off' onChange={(event)=>setConfirmpassword(event.target.value)} required placeholder='CONFIRM PASSWORD'/>
        <div className='btn-register'>
          <button  type='button' onClick={registersubmit}>SIGN UP</button>
        </div>
        <div className="lines">
            <div className="line"></div>
            OR
            <div className="line"></div>
        </div>
        <div>
            <div className="social-row google-social">
                <Link onClick={GoogleLogin}>
                    <img src={google_logo} alt="Google" />
                    Log in with Google
                  </Link>
            </div>
            <div className="social-row intra-social">
                <Link onClick={Intra42Login}>
                    <img src={intra_logo} alt="Intra" />
                    Log in with 42
                  </Link>
            </div>
        </div>
        <span>Don't have account?
          <Link to={'/login'}>
              SIGN IN
          </Link>
        </span>
      </form>
      <div className='pg-container'>
        <img src={pong_rihgt} alt="Pong" className="pong-right" />
      </div>
    </div>
  )
}
export default Register