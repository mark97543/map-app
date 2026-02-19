import './Leftbar.css'
import LeftbarBottom from './LeftbarBottom/LeftbarBottom'
import LeftBarTop from './LeftBarTop/LeftBarTop'


function Leftbar(){

  return(
    <div className='LEFTBAR_Wrapper'>
      
      <div className='LEFTBAR_TOP'>
        <LeftBarTop />
      </div>

      <div className='LEFTBAR_MIDDLE'>
        <h1>Middle Bar</h1>
      </div>

      <div className='LEFTBAR_BOTTOM'>
        <LeftbarBottom />
      </div>
    </div>
  )
}

export default Leftbar