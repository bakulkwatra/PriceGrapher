import { useState, useEffect } from "react";
import axios from "axios";

function Pinup(props) {

    const url = "http://localhost:5000"

    const [data, setData] = useState({})

    useEffect(() => {
        async function fetch(){
            await axios.post(`${url}/api/pinUp`,{
                symbol: props.ticker
            },{
                headers: {
                    "Content-Type": "application/json",
                    "Access-Control-Allow-Origin": "*"
                },
                withCredentials: false}
        ).then((data) => {
            setData(data.data)
        }).catch((e) => {
            console.log(e)
        })
        }
        fetch()
    }, [])

    return (
        <div style={{backgroundColor:"#1A1624", color:"white", borderRadius:"20px", width:"fit-content", display:"grid", gridTemplate:"1fr 1fr 1fr",paddingLeft:"20px", paddingRight:"20px",marginTop:"40px"}}>
                <h3 style={{marginBottom:"0", display:"flex", justifyContent:"space-between"}}>{props.ticker}</h3>
            <span style={{width:"fit-content", display:"flex", gap:"20px"}}>
                <h5>open <p>{data['1. open']}</p></h5>
                <h5>high <p>{data['2. high']}</p></h5>
                <h5>low <p>{data['3. low']}</p></h5>
                <h5>close <p>{data['4. close']}</p></h5>
            </span>
        </div>
    )
}

export default Pinup;