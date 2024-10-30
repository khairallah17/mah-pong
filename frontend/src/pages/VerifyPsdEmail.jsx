import {React, useState} from 'react'
// import Popup from 'reactjs-popup'
// import { Link } from 'react-router-dom'
// import axios from 'axios';


export const VerifyPsdEmail = () => {

    const [email, setEmail] = useState("")
    const [message, setMessage] = useState("")
    const [error, setError] = useState("")
    const [loading, setLoading] = useState(false)
    

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        console.log('Starting request...');
    
        const requestOptions = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: email })
        };
    
        try {
            const response = await fetch('http://localhost:8001/api/password-reset/', requestOptions);
            const data = await response.json();
            
            if (response.ok) {
                setMessage(data.message);
                setEmail("");
            } else {
                setError(data.error || 'Failed to send reset email');
            }
        } catch (error) {
            console.error('Error:', error);
            setError('Network error occurred');
        } finally {
            setLoading(false);
        }
    };
//   return (
//     <div className='email-pop' >
//         <Popup trigger={<Link>Forgot your password?</Link>} modal nested>
//                 {
//                     close => (
//                         <div className='popfp'>
//                             <div>
//                                 <button onClick=
//                                     {() => close()}>
//                                         close {/* icone Close matnsash tajoutiha */}
//                                 </button>
//                             </div>
//                             <div className='content'>
//                                 <h2>Reset Your Password</h2>
//                                 <span>Enter the Email Adresse linked to your 'Project Name' account and we'll send you an email.</span>
//                                 <form onSubmit={VerifyPsdEmail}>
//                                     <input type='email' onChange={(event)=>setEmail(event.target.value)} placeholder='Enter Your Valid Email Account'></input>
//                                     <div className='pop-button'>
//                                         <button type="submit" onClick={EmailVerfy}>Send Link</button>
//                                     </div>
//                                 </form>
//                             </div>
//                         </div>
//                     )
//                 }
//         </Popup>
//     </div>
//   )



    return(
        <div>
            <div>
                <image>LOGO</image>
            </div>
            <div>
                <form action="">
                    <input type='email' onChange={(e)=>setEmail(e.target.value)} placeholder='Enter Your Valid Email Account'></input>
                    <button type="submit" onClick={handleSubmit}>Send Link</button>
                </form>
            </div>
        </div>
    )
}


export default VerifyPsdEmail
