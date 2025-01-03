import React, { useContext, useRef } from 'react'

import AuthContext from '../../context/AuthContext';

import { FcGoogle } from "react-icons/fc";
import { Si42 } from "react-icons/si";
import { MdOutlineArrowOutward } from "react-icons/md";
import { CiWarning } from "react-icons/ci";

import { useForm } from "react-hook-form"

const SignupForm = ({setSwap}) => {

    const { registerUsers } = useContext(AuthContext)

    const {
        register,
        handleSubmit,
        watch,
        formState: { errors }
    } = useForm()

    const password = useRef({})
    password.current = watch("password")

    const onSubmit = async (data) => {
        try {

            const res = await registerUsers(
                data.fullname,
                data.username,
                data.email,
                data.password,
                data.confPassword
            )

        } catch (error) {
            console.log("signup error ==> ", error.message)
        }
    }

    return (
        <div className='h-full flex flex-col justify-center items-center gap-8 '>
            <h3 className="zen-dots text-5xl w-3/4 self-center">
                Register
            </h3>
            <form className="flex flex-col gap-10 w-3/4 self-center" onSubmit={handleSubmit(onSubmit)}>

                <div className="w-full flex gap-4">
                    <div className='w-full'>
                        <input
                            className="w-full bg-transparent border-b-2 border-white placeholder:text-white placeholder:text-opacity-50 placeholder:font-semibold py-2 focus:outline-none"
                            placeholder="FULLNAME"
                            type="text"
                            name="fullname"
                            {
                            ...register("fullname",{required: "You must specify a fullname"})
                            }
                        />
                        {
                            errors.fullname?.type &&
                            <span className="text-red-500 flex items-center gap-1 mt-1">
                                <CiWarning/>
                                {errors.fullname?.message}
                            </span>
                        }
                    </div>
                    <div className='w-full'>
                        <input
                            className="w-full bg-transparent border-b-2 border-white placeholder:text-white placeholder:text-opacity-50 placeholder:font-semibold py-2 focus:outline-none"
                            placeholder="USERNAME"
                            type="text"
                            name="username"
                            {
                            ...register("username",{required: "You must specify a username"})
                            }
                        />
                        {
                            errors.username?.type &&
                            <span className="text-red-500 flex items-center gap-1 mt-1">
                                <CiWarning/>
                                {errors.username?.message}
                            </span>
                        }
                    </div>
                </div>

                <div className="w-full">
                    <input
                        className="w-full bg-transparent border-b-2 border-white placeholder:text-white placeholder:text-opacity-50 placeholder:font-semibold py-2 focus:outline-none"
                        placeholder="EMAIL"
                        type="email"
                        name="email"
                        {...register(
                        "email",
                        {
                            required: "You must specify an email",
                        })}
                    />
                    {
                        errors.email?.type &&
                        <span className="text-red-500 flex items-center gap-1 mt-1">
                            <CiWarning/>
                            {errors.email?.message}
                        </span>
                    }
                </div>

                <div className="w-full">
                    <input
                        className="w-full bg-transparent border-b-2 border-white placeholder:text-white placeholder:text-opacity-50 placeholder:font-semibold py-2 focus:outline-none"
                        placeholder="PASSWORD"
                        type="password"
                        name="password"
                        {...register(
                        "password",
                        {
                            required: "You must specify a password",
                            minLength: {
                            value: 8,
                            message: "Password must have at least 8 characters"
                            }
                        })}
                    />
                    {
                        errors.password?.type &&
                        <span className="text-red-500 flex items-center gap-1 mt-1">
                            <CiWarning/>
                            {errors.password?.message}
                        </span>
                    }
                </div>

                <div className="w-full">
                    <input
                        className="w-full bg-transparent border-b-2 border-white placeholder:text-white placeholder:text-opacity-50 placeholder:font-semibold py-2 focus:outline-none"
                        placeholder="CONFIRM PASSWORD"
                        type="password"
                        name="confPassword"
                        {...register(
                        "confPassword",
                        {
                            validate: value => value === password.current || "Passwords does not match"
                        })}
                    />
                    {
                        errors.confPassword?.type &&
                        <span className="text-red-500 flex items-center gap-1 mt-1">
                            <CiWarning/>
                            {errors.confPassword?.message}
                        </span>
                    }
                </div>

                <button type="submit" className="bg-black w-1/4 self-center rounded-lg py-2 font-bold text-2xl hover:bg-white hover:text-black">
                SIGN UP
                </button>
            </form>

            <div className="flex items-center gap-8 w-3/4 self-center">

            <div className="h-1 w-full bg-white text-opacity-50"></div>
            <p>OR</p>
            <div className="h-1 w-full bg-white bg-opacity-50"></div>

            </div>

            <div className="space-y-4 w-3/4 self-center">
                <button className="bg-white w-full flex items-center justify-center gap-4 rounded-lg py-2">
                    <FcGoogle size={24}/>
                    <p className="text-slate-600 font-semibold text-lg">Continue with google</p>
                </button>
                <button className="bg-black w-full flex items-center justify-center gap-4 rounded-lg py-2">
                    <Si42 size={24} color="white" />
                    <p className="text-white font-semibold text-lg">Continue with google</p>
                </button>
                <div className="w-full flex items-center justify-between">
                    <p className="uppercase">already have an account?</p>
                    <button onClick={setSwap} className="flex items-center gap-1 hover:underline">
                        <p className="uppercase text-cyan-400">sign in</p>
                        <MdOutlineArrowOutward color='white' className='-rotate-90' />
                    </button>
                </div>
            </div>
            </div>
    )
}

export default SignupForm