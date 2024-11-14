import React from 'react'

export const ResetPassword = () => {

    const GettingNewPassword = (event) => {
        event.preventDefault();
        const NewPwd = "";
        const confirmpwd = "";
        if (NewPwd == confirmpwd)
            HandleResetePassword(NewPwd);
        else
            //Display Notification that the password are not correct
            HandleNotification();
    }


  return (
    <div>
      <form onSubmit={"#"}>
          <input type="passwrord" placeholder='New Password'/>
          <input type="passwrord" placeholder='Confirm Password'/>
          <button>Submit</button>
      </form>
    </div>
  )
}

export default ResetPassword