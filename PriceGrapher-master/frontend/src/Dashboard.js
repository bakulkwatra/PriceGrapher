import Chart from "./Component/Chart";
import Pinup from "./Component/Pinup";
import TickerScroll from "./Component/TickerScroll";
import WatchList from "./Component/WatchList";
import Profile from "./Component/Profile";
import "./Dashboard.css"


function Dashbord() {
    return(
        <div style={{display:"flex", flexDirection:"column",padding:"30px"}}>
        <header style={{display:"flex",justifyContent:"space-between"}}>
            <TickerScroll />
            <Profile />
        </header>
        <span style={{display:'flex' ,flexDirection:'row', gap:'30px', marginRight:'20px', overflow:'auto'}}>
            <Pinup ticker='AAPL'/>
            <Pinup ticker='MSFT'/>
            <Pinup ticker='META'/>
            <Pinup ticker='ITC'/>
            <Pinup ticker='GOOGL'/>
            <Pinup ticker='LNT'/>
        </span>
                <Chart/>
                <WatchList id ={1} />
        </div>
    )
}

export default Dashbord;