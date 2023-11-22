import { useEffect, useState, useMemo, useCallback } from "react"
import "./css/WatchList.css"
import AddDataModal from "./Popup";
import axios from "axios";

function WatchList(props) {

    const url = "http://localhost:5000"

    const [isModalOpen, setModalOpen] = useState(false);
    
    const openModal = () => {
        setModalOpen(true);
    };

    const closeModal = () => {
        setModalOpen(false);
    };

    const [watchData, setWatchData] = useState([{}])

    useEffect(() => {
        async function fetch(){
            await axios.get(`${url}/api/watchlist`,{
                headers: {
                    "Content-Type": "application/json",
                    "Access-Control-Allow-Origin": '*',
                }})
                .then(res =>
                    {
                        setWatchData(res.data.watchlist)
                    })
                    .catch((e) => {
                        console.log(e)
                    })
                }
        fetch()
    }, [])

    const handleSubmit = async (data) => {
        await axios.post(`${url}/api/watchlist`,{
                ticker: data,
                user_id: 1
            },{
                headers: {
                    "Content-Type": "application/json",
                    "Access-Control-Allow-Origin": "*"
                },withCredentials: false})
        .then((res) => 
        {
            console.log(res)
            setWatchData([...watchData, res.data.watchlist])
        
        })
        .catch((e) =>{
            console.log(e)
        })
    };


    return(
        <div className="WatchList-Table">
            <table>
                <thead>
                    <tr className="heading">
                        <th colSpan={5}><b>WatchList <a onClick={openModal} style={{textDecoration:"none", color:"white", cursor:'pointer'}}>+</a></b></th>
                    </tr>
                    <tr style={{fontSize:"large"}}>
                        <th>Ticker</th>
                        <th>Open</th>
                        <th>Close</th>
                        <th>High</th>
                        <th>Low</th>
                    </tr>
                </thead>
                <tbody>
                    {watchData.map((d, index) => {
                        for (const symbol in d) {
                            const i = d[symbol];
                            return (
                                <tr key = {index}>
                                    <td>{symbol}</td>
                                    <td>{i['1. open']}</td>
                                    <td>{i['4. close']}</td>
                                    <td>{i['2. high']}</td>
                                    <td>{i['3. low']}</td>
                                </tr>
                            )
                        }
                    }
                    )}
                </tbody>
            </table>
            <AddDataModal isOpen={isModalOpen} onClose={closeModal} onSubmit={handleSubmit} />
        </div>
    )
}

export default WatchList;