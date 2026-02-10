import './Welcome.css'
import { useState } from 'react'

//Component Imports
import Button from '../../assets/componets/Button/Button'
import Input from '../../assets/componets/Input/Input'

function Welcome(){
    const [test, setTest]=useState('fff')
    return(
        <div className='WELCOME_WRAPPER'>
            <div className='gradient_left'>
                {/*This could be reserved for picture on later date */}
            </div>
            <div className='gradient_right'>

                <Input
                    labelText='Hello World'
                    placeholder='Testing PLace Holder'
                    value={test}
                    change={(e)=>setTest(e.target.value)}
                />
                
                <Button> Basic</Button>
            </div>
        </div>
    )
}

export default Welcome