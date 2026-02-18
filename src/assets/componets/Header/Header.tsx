import './Header.css'
import Button from '../Button/Button'
import { useAuth } from '../../../context/AuthContext'
import MapSelector from './MapSelector/MapSelector'

function Header() {
  const {logout, setUser}=useAuth()

  const LogoutUser=async ()=>{
    try{
      
      await logout();
      
    }catch(err:any){
      console.error("Could not Log User out, ", err)
    }finally{
      //navigate('/');
      setUser(null);
    }
  }

  return (
    <div className='HEADER_WRAPPER'>
      <div className='HEADER_LOGO'>
        <h1>Iter Viae</h1>
      </div>

      <div className='HEADER_LINKS'>
        <MapSelector/>
      </div>

      <div className='HEADER_USER'>
        <Button addClass='HEADER_Logout' onClick={()=>LogoutUser()}>Logout</Button>
      </div>
    </div>
  )
}

export default Header