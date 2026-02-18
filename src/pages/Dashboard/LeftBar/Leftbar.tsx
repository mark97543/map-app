import './Leftbar.css'
import LeftbarBottom from './LeftbarBottom/LeftbarBottom'


function Leftbar(){

  return(
    <div className='LEFTBAR_Wrapper'>
      
      <div className='LEFTBAR_TOP'>
        <h1>Leftbar Top</h1>
      </div>

      <div className='LEFTBAR_BOTTOM'>
        <LeftbarBottom />
      </div>
    </div>
  )
}

export default Leftbar