import React from "react"
import "./App.css"

import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'
import ProtectRouter from "./protection_axios/ProtectRouter"
import { AuthLogic } from "./context_login_Register/Auth_context"
// import { Profile, Register, Login } from "./pages"
import Profile from './pages/Profile'
import Register from './pages/Register'
import Login from './pages/Login'

const App = () => {
  return (
    <div className="App">
      <Router>
        <AuthLogic>
          <Routes>
            <Route path='/Profile' element={
              <ProtectRouter> 
                {/* athenticate first before going to Profile page ...ect */}
                <Profile />
              </ProtectRouter>
            }/>
          </Routes>
            <Route path='/login' element={
              <Login />
            }/>
            <Route path='/register' element={
              <Register />
            }/>
        </AuthLogic>
      </Router>
      {/* <h1 className="login" >Login</h1> */}
    </div>
  )
}

export default App
