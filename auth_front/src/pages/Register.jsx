import React from 'react'
// import { Link } from 'react-router-dom'
// import AuthContext from "../context_login_Register/AuthContext"

export const Register = () => {
  return (
    <div className='register'>
      <h1>Register</h1>
      <form>
        <label>Full Name:  </label>
        <input type="text" name="Full_Name"  id="" required/>
      </form>
    </div>
  )
}

export default Register