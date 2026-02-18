import './Header.css'
import Button from '../Button/Button'
import React from 'react'
import { useAuth } from '../../../context/AuthContext'
import { useNavigate } from 'react-router-dom'

function Header() {
  const {user, logout, loading, setUser}=useAuth()
  const navigate = useNavigate();

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



  if (!user) {
    return <div className="HEADER_WRAPPER">Not Logged In</div>;
  }

  if (loading) {
    return (
      <div className='HEADER_WRAPPER'>
        <div className='HEADER_LOGO'><h1>Iter Via</h1></div>
        <div className='HEADER_USER'><h4>Loading Profile...</h4></div>
      </div>
    );
  }

  return (
    <div className='HEADER_WRAPPER'>
      <div className='HEADER_LOGO'>
        <h1>Iter Via</h1>
      </div>

      <div className='HEADER_LINKS'>

      </div>

      <div className='HEADER_USER'>
        <Button addClass='HEADER_Logout' onClick={()=>LogoutUser()}>Logout</Button>
      </div>
    </div>
  )
}

export default Header