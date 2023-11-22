import {useState} from 'react'
import {useNavigate} from 'react-router-dom'


function Profile() {

    const navigate = useNavigate();
    
    const [isDropdownVisible, setDropdownVisible] = useState(false);
    
    const Logout = () => {
        localStorage.removeItem('accessToken');
        navigate('/')
    };
    
    const DropdownMenu = () => {
        return (
                <ul className="dropdown-menu">
                    <li style={{color:'white', zIndex:2}}><a onClick={Logout}>LOG OUT</a></li>
                </ul>
        )
    }

    const handleMouseEnter = () => {
        setDropdownVisible(true);
    }
    const handleMouseLeave = () => {
        setDropdownVisible(false);
    }

    return(
        <div style={{display:"flex",gap:"15px", width:'fit-content', height:'fit-content', zIndex: 1, backgroundColor:"black", alignItems:"center", marginRight:"30px"}} onMouseEnter={handleMouseEnter}
                    onMouseLeave={handleMouseLeave}>
                <div style={{backgroundColor:"white", width:"50px", height:"50px", borderRadius:"50%"}}></div>
                <div style={{display:'flex', flexDirection:'column'}}>
                    <h2 style={{color:"white", margin:"0"}}>Suryank</h2>
                    {isDropdownVisible && <DropdownMenu />}
                </div>
            </div>
    )
}

export default Profile;