import React from 'react'
import {PictureUser, MatchHistory} from './UserProfil/Components/'

export const Profil = () => {
  return (
    <div className='flex'>
      <div className=''>
        <PictureUser />
      </div>
      {/* <div className=''>
        <MatchHistory />
      </div> */}
    </div>
  )
}

export default Profil;