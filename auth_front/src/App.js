import React from "react"
import "./App.css"

import { BrowserRouter as Router, Route, Routes } from "react-router-dom"
import ProtectRouter from "./protection_axios/ProtectRouter"
import { AuthProvider } from "./context_login_Register/AuthContext"
import { Profile, Register, Login } from "./pages"

const App = () => {
  return (
    <div className="App">
      <div className="container">
          <Router>
            <AuthProvider>
                <Routes>
                    <Route path='/Profile' element={
                      <ProtectRouter> 
                        <Profile />
                      </ProtectRouter>
                    }/>
                    <Route path='/login' element={
                      <Login />
                    }/>
                    <Route path='/register' element={
                      <Register />
                    }/>
                </Routes>
            </AuthProvider>
          </Router>
      </div>
    </div>
  )
}

export default App
