import { useEffect, useState } from "react";
import axios from "axios";

axios.defaults.baseURL = import.meta.env.API_URL

const useAxios = (url) => {

    const [ data, setData ] = useState([])
    const [ isLoading, setIsLoading ] = useState(false)
    const [ isError, setIsError ] = useState(false)

    useEffect(() => {
        let isMounted = true
        const source = axios.CancelToken.source()

        const fetchData = async (endpoint) => {
            setIsLoading(true)

            try {

                const response = await axios.get(endpoint, {
                    cancelToken: source.token
                })

                if (isMounted) {
                    setData(response.data)
                    setIsError(false)
                }

            } catch (error) {
                if (isMounted) {
                    setIsError(true)
                }
            } finally {
                isMounted && setTimeout(() => {

                })
            }
        }

        fetchData(url)

        const cleanup = () => {
            console.log("CLEANUP FUNCTION")
            isMounted = false
            source.cancel()
        }

        return cleanup

    }, [url])

    return { data, isLoading, isError }

}

export default useAxios