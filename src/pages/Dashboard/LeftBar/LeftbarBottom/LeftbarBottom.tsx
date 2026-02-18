import './LeftbarBottom.css'
import { useEffect, useState } from 'react'
import { useDashboard } from '../../../../context/DashboardContext'

function LeftbarBottom(){
  const {mapCoords } = useDashboard();
  const [copied, setCopied] = useState(false);

  const handleCopy = () =>{
    const coordString = `${mapCoords.lat.toFixed(8)}, ${mapCoords.lng.toFixed(8)}`

    //copy to clipboard
    navigator.clipboard.writeText(coordString).then(()=>{
      setCopied(true);
      //Reset the copied message after 2 seconds
      setTimeout(()=>setCopied(false), 2000)
    })
  }


  return(
    <div className='LEFTBARBOTTOM_WRAPPER'>
      <div className={`COPY_TAG ${copied ? 'VISIBLE' : ''}`}>
        COPIED TO CLIPBOARD
      </div>

      <p className='LEFTBARBOTTOM_LNGLAT_Title'>Location (lat,lng) </p>
      <a className='LEFTBARBOTTOM_LNGLAT' onClick={handleCopy}>{mapCoords.lat.toFixed(8)}, {mapCoords.lng.toFixed(8)}</a>
    </div>
  )
}
export default LeftbarBottom