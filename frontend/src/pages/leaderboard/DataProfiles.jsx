import React from 'react'
import DbTest from './DbTest'

export const DataProfiles = () => {

    // func to sort by score Decroissant
    const SortingScore = DbTest.sort((a, b) => b.score - a.score);


  return (
    <div>{ItemProfil(SortingScore)}</div>
  )
}

function ItemProfil(data){
    return (
        <>
            {
                data.map((value, index) => (
                <div>
                    <div>
                        <p>#{index + 1}</p>
                        <img style={{with:200, height:200}} src={value.img} alt="" />
                        <p>{value.name}</p>
                        <p>{value.nmbmatch}</p>
                        <p>{value.win}</p>
                        <p>{value.lose}</p>
                        <p>{value.score}</p>
                    </div>
                </div>
                )
                )
            }
        </>

    )
}

export default DataProfiles