import './App.css';
import { Route, Routes} from 'react-router-dom';
import Dashboard from './Dashboard';
import Login from './Login';

function App() {

  const token = localStorage.getItem('accessToken');
 
  if(!token) {

    return (
      <Login />
    )
  } else {

    return (
      <div className="App">
          <Routes>
            <Route path='/dashboard' element={<Dashboard />} />
            <Route path='/' element={<Login />} />
          </Routes>
      </div>
    )
  }
}

export default App;
