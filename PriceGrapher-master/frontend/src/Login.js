import axios from "axios";
import "./Login.css";
import {useState} from "react"


function Login() {
    const url = "http://127.0.0.1:5000"

    const [userName, setUserName] = useState("")
    const [password, setPassword] = useState("")

    const loginUser = async (e) => {
        e.preventDefault()
        await axios.post(`${url}/api/login`, {
            user_name: userName,
            password: password
        },{
            headers:{
                'Access-Control-Allow-Origin':'*',
                'Content-Type': 'application/json'
            }})
            .then((res) => {
                console.log(res)
                if(res.data.user.message === "success") {
                    localStorage.setItem('accessToken', res.data.user.accessToken)
                    localStorage.setItem('user', res.data.user)
                    window.location.href='/dashboard';
                }
                else {
                    console.log(res)
                    console.log('Failed')
                }
            })
    }


    return(
            <div className="login-box">
                <h2>LOGIN</h2>
                <form>
                    <div className='user-box user'>
                        <input
                            type="email"
                            htmlFor="email"
                            value = {userName}
                            onChange={(e) => setUserName(e.target.value)}
                            />
                        <label>Username</label>
                    </div>

                    <div className="user-box pass">
                        <input 
                            type="password"
                            htmlFor="password"
                            value = {password}
                            onChange={(e) => setPassword(e.target.value)}
                            />
                        <label>Password</label>
                    </div>
                    <button type="submit" onClick={loginUser}>Login</button>
                </form>
            </div>
    )
}

export default Login;