import './Welcome.css'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import client from '../../lib/directus'

import { useAuth } from '../../context/AuthContext'

//Component Imports
import Button from '../../assets/componets/Button/Button'
import Input from '../../assets/componets/Input/Input'

function Welcome(){
    const [email, setEmail]=useState('')
    const [password, setPassword]=useState('')
    const [error, setError] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)
    
    const navigate = useNavigate()

    const handleLogin = async()=>{
        setLoading(true);
        setError(null);

        try{
            await client.login(email,password);
            navigate('/dashboard');
        }catch(err:any){
            console.error("Login failed:", err)
            setError("Invalid email or password.")
        } finally {
            setLoading(false)
        }
    }

    const { user, login } = useAuth(); ///Debugging

    return(
        <div className='WELCOME_WRAPPER'>
            <div className='gradient_left'>
                {/*This could be reserved for picture on later date */}
                <h1>{user? user.email: 'Guest'}</h1>
            </div>
            <div className='gradient_right'>
                <div className='signin_box'>
                    {error && <p style={{ color: 'red', fontSize: 'var(--text-sm)' }}>{error}</p>}
                    <Input
                        labelText='Email'
                        placeholder='Enter Email'
                        type='email'
                        value={email}
                        change={(e)=>setEmail(e.target.value)}
                    />
                    <Input
                        labelText='Password'
                        type='password'
                        placeholder='Enter Password'
                        value={password}
                        change={(e)=>setPassword(e.target.value)}
                    />
                    <Button addClass='submit_button' onClick={handleLogin}>{loading ? 'Verifying...' : 'Submit'}</Button>
                </div>
            </div>
        </div>
    )
}

export default Welcome