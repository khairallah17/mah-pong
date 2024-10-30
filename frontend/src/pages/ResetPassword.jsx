import React from 'react'

export const ResetPassword = () => {

    const GettingNewPassword = (event) => {
        event.preventDefault();
        const Currentpwd = "";
        const NewPwd = "";
        const confirmpwd = "";
        HandleResetePassword(NewPwd);
    }


  return (
    <div>
      <form action="">
          <input type="passwrord" placeholder='New Password'/>
          <input type="passwrord" placeholder='Confirm Password'/>
      </form>
    </div>
  )
}
