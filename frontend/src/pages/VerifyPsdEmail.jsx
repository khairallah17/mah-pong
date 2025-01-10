import {React, useState} from 'react'
// import Popup from 'reactjs-popup'
// import { Link } from 'react-router-dom'
// import axios from 'axios';
import { toast } from 'react-toastify'


export const VerifyPsdEmail = () => {

    const [email, setEmail] = useState("")
    // const [message, setMessage] = useState("")
    // const [error, setError] = useState("")
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
                console.log(data)
                console.log("OK.OK.OK.OK.OK");
            } else {
                console.log("KO.KO.KO.KO.KO");
                // setError(data.error || 'Failed to send reset email');
            }
        } catch (error) {
            console.error('Error:');
            // setError('Network error occurred');
        } finally {
            setLoading(false);
        }
    };

    return(
        <div className="bg-root-background h-screen w-screen text-white">
            <div className="flex flex-col gap-4 items-center justify-center h-full w-full">
                <img/>
                <div>
                    <form onSubmit={handleSubmit} className="flex gap-4 flex-col w-full">
                        <input
                            className="w-full bg-transparent border-b-2 border-white/50 focus:border-white placeholder:text-white placeholder:text-opacity-50 placeholder:font-semibold py-2 focus:outline-none"
                            placeholder="EMAIL"
                            type="email"
                            name="email"
                            onChange={(e) => setEmail(e.target.value)}
                            value={email}
                        />
                        <button type="submit" className="bg-black w-full self-center rounded-lg py-2 font-bold text-2xl hover:bg-white hover:text-black">
                            VERIFY
                        </button>
                    </form>
                </div>
            </div>
        </div>
    )
}


export default VerifyPsdEmail
