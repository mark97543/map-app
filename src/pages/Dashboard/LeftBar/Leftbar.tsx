import './Leftbar.css'
import LeftbarBottom from './LeftbarBottom/LeftbarBottom'
import LeftBarTop from './LeftBarTop/LeftBarTop'
import LeftBarMiddle from './LeftBarMiddle/LeftBarMiddle'


function Leftbar(){

  return(
    <div className='LEFTBAR_Wrapper'>
      
      <div className='LEFTBAR_TOP'>
        <LeftBarTop />
      </div>

      <div className='LEFTBAR_MIDDLE'>
        <LeftBarMiddle/>
      </div>

      <div className='LEFTBAR_BOTTOM'>
        <LeftbarBottom />
      </div>
    </div>
  )
}

export default Leftbar