import React, { useContext } from 'react'

import { NavLink } from 'react-router-dom'

import AuthContext from '../../context/AuthContext';

import { FcGoogle } from "react-icons/fc";
import { Si42 } from "react-icons/si";
import { MdOutlineArrowOutward } from "react-icons/md";
import { CiWarning } from "react-icons/ci";

import { useForm } from "react-hook-form"

import { motion } from "framer-motion"
import { toast } from 'react-toastify';
import '../../i18n';
import { useTranslation } from 'react-i18next';
import ButtonLng from "../../components/ButtonLng";

const LoginForm = ({setSwap}) => {

    const { loginUsers, GoogleLogin, Intra42Login } = useContext(AuthContext)
    
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm()

    const onSubmit = async (data) => {
        try {

            const res = await loginUsers(data.email, data.password)
            
        } catch (error) {
            toast.error("incorrect username or password", {
                position: "top-right",
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: false,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: "dark",
                transition: Bounce,
            })
        }
        
    }
    const { t } = useTranslation();
    
    return (
        <div className='h-full flex flex-col justify-center items-center gap-8 '>
            <h3 className="zen-dots text-5xl w-3/4 self-center">{t('Login')}</h3>
            <form className="flex flex-col gap-10 w-3/4 self-center" onSubmit={handleSubmit(onSubmit)}>

                <div className="w-full">
                    <input
                        className="w-full bg-transparent border-b-2 border-white/50 focus:border-white duration-200 placeholder:text-white placeholder:text-opacity-50 placeholder:font-semibold py-2 focus:outline-none"
                        placeholder={t('EMAIL')}
                        type="email"
                        name="email"
                        {
                        ...register("email",{required: t('You must specify an email')})
                        }
                    />
                {errors.email?.type &&
                    <div className="text-red-500 flex items-center gap-1 mt-2">
                        <CiWarning />
                        {errors.email?.message}
                    </div>
                }
                </div>

                <div className="w-full space-y-2">
                    <input
                        className="w-full bg-transparent border-b-2 border-white/50 focus:border-white duration-200 placeholder:text-white placeholder:text-opacity-50 placeholder:font-semibold py-2 focus:outline-none"
                        placeholder={t('PASSWORD')}
                        type="password"
                        name="password"
                        {...register(
                        "password",
                        {
                            required: t('You must specify a password'),
                            minLength: {
                            value: 8,
                            message: t('Password must have at least 8 character')
                            }
                        })}
                    />
                    {
                        errors.password?.type == "required" &&
                        <span className="text-red-500 flex items-center gap-1 mt-1">
                            <CiWarning />
                            {errors.password?.message}
                        </span>
                    }
                    <NavLink to="/reset-password" className='text-red-500 uppercase hover:underline'>{t('forget password?')}</NavLink>
                </div>

                <button type="submit" className="bg-black w-1/4 self-center rounded-lg py-2 font-bold text-2xl hover:bg-white hover:text-black">{t('SIGN IN')}</button>
            </form>

            <div className="flex items-center gap-8 w-3/4 self-center">

                <div className="h-1 w-full bg-white text-opacity-50"></div>
                <p>{t('OR')}</p>
                <div className="h-1 w-full bg-white bg-opacity-50"></div>

            </div>

            <div className="space-y-4 w-3/4 self-center">
                <button onClick={GoogleLogin} className="bg-white w-full flex items-center justify-center gap-4 rounded-lg py-2">
                    <FcGoogle size={24}/>
                    <p className="text-slate-600 font-semibold text-lg">{t('Continue with google')}</p>
                </button>
                <button  onClick={Intra42Login} className="bg-black w-full flex items-center justify-center gap-4 rounded-lg py-2">
                    <Si42 size={24} color="white" />
                    <p className="text-white font-semibold text-lg">{t('Continue with 42')}</p>
                </button>
                <div className="w-full flex items-center justify-between">
                    <p className="uppercase">{t('don\'t have an account?')}</p>
                        <button onClick={setSwap} className="flex items-center gap-1 hover:underline">
                            <p className="uppercase text-cyan-400">{t('sign up')}</p>
                            <MdOutlineArrowOutward color='white' />
                        </button>
                </div>
                <div className='w-full flex items-center justify-center'>
                    <ButtonLng />
                </div>
            </div>
        </div>
    )
}

export default LoginForm