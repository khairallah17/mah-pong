import jeff from "../assets/jeff.png"

const Loading = ({ test }) => {
    return (
        
        <div className=''>
            <img src={jeff} className={`animate-spin h-auto ${!test && "w-8"}`} alt="" />
        </div>
    )
}

export default Loading