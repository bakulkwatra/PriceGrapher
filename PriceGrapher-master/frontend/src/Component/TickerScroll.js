import { useEffect, useState } from 'react';
import './css/TickerScroll.css'
import axios from 'axios';

function TickerScroll(){
    const url = "http://localhost:5000"
    const [gain, setGain] = useState([{}]);

    useEffect(() => {
        async function fetch() {
            await axios.get(`${url}/api/gain`, {
                headers: {
                    "Content-Type": "application/json",
                    "Access-Control-Allow-Origin": "*"
                },    
                withCredentials: false})
                .then((res) => {
                    setGain(res.data)
                }).catch((e) => {
                    console.log(e)
                    })
                }
            fetch()
    }, [])

    return(
        <div style={{width:"100%", color:"white", display:'flex', gap:'20px', overflow:'hidden'}}>
        <div id="scroll-text" style={{display:'flex'}} >
            {gain.map((d) => 
                <span key={d['ticker']} style={{marginLeft:'20px', display:'flex', gap:"5px", placeItems:'center'}}>{d['ticker']} <span style={{color:"#0AD833", margin:'10px'}}>{d['per']}</span></span>
            )}
            </div>
        </div>
    )
}

export default TickerScroll;