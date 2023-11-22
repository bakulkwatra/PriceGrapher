import "./css/Chart.css"
import {useEffect, useMemo, useState} from"react"
import data from "./query.json"
import CandlestickChart from "./Candle"
import axios from 'axios'
import formatStockData from "./FormatStockData"
import Line from './Line'


function Chart() {
    const url = "http://localhost:5000"

    const [startDate, setStartDate] = useState("")
    const [endDate, setEndDate] = useState("")
    const [ticker, setTicker] = useState("")
    const [graph, setGraph] = useState('Candle-Stick')
    const [stockData, setStockData] = useState(data['Time Series (Daily)'])

    useEffect(() => {
        async function fetch() {
            await axios.get(`${url}/api/settings`,
            {
                headers: {
                    "Content-Type": "application/json",
                    "Access-Control-Allow-Origin": "*"
                },
                withCredentials: false})
                .then((data) => {
                    setStartDate(data.data['setting']['start_date'])
                    setEndDate(data.data['setting']['end_date'])
                    setTicker(data.data['setting']['ticker'])
                })
                .catch((err) => console.log(err))
            }
            fetch()
    },[])

    const handleSubmit = async (e) => {
        e.preventDefault();
        await axios.put(`${url}/api/settings/1`, {
                start_date: startDate,
                end_date: endDate,
                ticker: ticker
            },{
                headers: {
                    "Content-Type": "application/json",
                    "Access-Control-Allow-Origin": "*"
                },
                withCredentials: false}
        ).then((res) => console.log(res))
        .catch((err) => console.log(err))



        await axios.post(`${url}/api/customTable`, {
                start_date: startDate,
                end_date: endDate,
                ticker: ticker
            },{
                headers: {
                    "Content-Type": "application/json",
                    "Access-Control-Allow-Origin": "*"
                },
                withCredentials: false}).then((res) => console.log(res))
        .catch((err) => console.log(err))

        await axios.post(`${url}/api/stocksDaily`, {
            symbol:ticker,
        },{
            headers: {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*"
            },
            withCredentials: false}).then((res) => setStockData(res.data))
            .catch((err) => console.log(err))
    }

    const handleImport = async (e) => {
        e.preventDefault();
        await axios.get(`${url}/api/settings/1`, {
            headers: {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*"
            },    
        withCredentials: false})
        .then((data) => {
            console.log(data)
            setStartDate(data.data['setting']['start_date'])
            setEndDate(data.data['setting']['end_date'])
            setTicker(data.data['setting']['ticker'])
        })
        .catch((err) => console.log(err.message))
    }

    const handleChanges = (e) => {
        e.preventDefault();

            // axios.post(`${url}/api/selected`, {
            //     start_date: startDate,
            //     end_date: endDate,
            //     symbol: ticker
            // }, {
            //     headers: {
            //         "Content-Type": "application/json",
            //         "Access-Control-Allow-Origin": "*"
            //     }})
            //     .then((data) => {
            //         setStockData(data.data)
            //     })
            //     .catch((e) => {
            //         console.log(e)
            //     });

                
                const filteredData = {}
                for (const date in stockData) {
                    if(date >= startDate && date <= endDate) {
                        filteredData[date] = stockData[date];
                    }
                }
                setStockData(filteredData)
    }

    const chartData = useMemo(() => formatStockData(stockData), [stockData])
    console.log("chartData", chartData)


/////////////////////////////////////////////////////////////////////////////////////
    return(
        <div className="chart-section">
            <div className="main-chart">
                {graph === 'Line' ? <Line newData={chartData} /> : <CandlestickChart newData={chartData} />}
            </div>
            <div className="chart-control">
                <form>
                    <div className="date-section">
                        <label>
                            From 
                            <input
                                type="date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                pattern="\d{4}-\d{2}-\d{2}"
                                max={endDate}
                            />
                        </label>
                        <label>
                            To
                            <input
                                type="date"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                pattern="\d{4}-\d{2}-\d{2}"
                                min={startDate}
                            />
                        </label>
                    </div>
                    <div className="ticker">
                        <label>
                            Ticker
                            <input
                                type="text"
                                value={ticker}
                                onChange={(e) => setTicker(e.target.value)}
                            />
                        </label>
                    </div>
                    <div className="Graph-type" onChange={(e) => setGraph(e.target.value)}>
                        <label>
                            Graph type
                            <div className="radio">
                                <input type="radio" value="Candle-Stick" checked = {graph === 'Candle-Stick'} name='candle' readOnly/> Candle Stick
                                <input type="radio" value="Line" checked = {graph === 'Line'} name='line' readOnly/> Line
                            </div>
                        </label>
                    </div>
                    <label>
                        Apply
                        <button onClick={handleChanges}>Apply</button>
                    </label>
                    <label>
                        Reset
                        <button onClick={handleImport}>Reset</button>
                    </label>
                    <label>
                        Save Data
                        <button onClick={handleSubmit}>Save</button>
                    </label>
                </form>
            </div>
        </div>
    )
}

export default Chart;