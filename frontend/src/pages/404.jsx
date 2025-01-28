import React from 'react'
import { NavLink } from 'react-router-dom'
import Jeff from "../assets/jeff.png"
import { useTranslation } from "react-i18next"

const NotFound = () => {

    const { t } = useTranslation()

    return (
        <div className="h-screen w-full flex-col flex gap-4 items-center justify-center bg-root-background bg-cover bg-center bg-no-repeat text-white space-y-4">
            {/* <img src={NotfoundImg} alt="" className='w-full h-full object-contain absolute top-0 left-0' /> */}
            <div className='flex flex-col items-center justify-center'>
                <h3 className='text-7xl border-b-2 pb-4 uppercase'>{t("we can't find this page")}</h3>
                <p className='uppercase text-[30rem] leading-[1] font-bold'>404</p>
                <h3 className='text-7xl border-t-2 pt-4 uppercase'>{t("page lost")}</h3>
            </div>
            {/* <div className=' animate-spin'>
                <img src={Jeff} alt="" />
            </div> */}
            <NavLink to="/dashboard" className="bg-black font-bold text-3xl p-4 px-8 rounded-lg relative z-[999]">
                {t("Fall Back To Safe Zone")}
            </NavLink>
        </div>
    )
}

export default NotFound