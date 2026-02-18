import './Welcome.css'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

//Component Imports
import Button from '../../assets/componets/Button/Button'
import Input from '../../assets/componets/Input/Input'

function Welcome(){
    const [email, setEmail]=useState('')
    const [password, setPassword]=useState('')
    const [error, setError] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)
    const [registerform, setRegisterForm]=useState(true)
    const [userName, setUserName]=useState('')
    const [confirmPass, setConfirmPass]=useState('')
    
    const { user, login, register } = useAuth(); 
    const navigate = useNavigate()

    const handleLogin = async()=>{
        setLoading(true);
        setError(null);
        try{
            await login(email,password);
            navigate('/dashboard');
        }catch(err:any){
            if (err.message === "UNAUTHORIZED_OR_INACTIVE") {
                setError("Access Denied: Account is pending. Contact your system admin for more information. ");
            } else {
                setError("An unexpected system error occurred. Please try again.");
            }
        } finally {
            setLoading(false)
        }
    }

    const hadleRegister = async()=>{

        if (!password || password.trim() === ""){
            setError("A password is required")
            return
        }
        if (!email || email.trim() === ""){
            setError('A email is required')
            return
        }
        if (!userName || userName.trim() === ""){
            setError('A user name is required')
            return
        }
        if(password !== confirmPass){
            setError("Passwords Must Match")
            return
        }

        try{
            await register(email, password, userName)
        }catch(err:any){
            if (err.message === "EMAIL_TAKEN") {
                setError("This email is already registered. Please try logging in.");
                return
            } else if (err.message === "UNAUTHORIZED_OR_INACTIVE") {
                setError("Account created! Access denied until an admin verifies your status.");
            } else {
                setError("An unexpected error occurred during registration.");
                return
            }
        }

        setEmail("");
        setConfirmPass("");
        setPassword('');
        setUserName('')
        setRegisterForm(true)   
    }

    useEffect(()=>{
        if (!registerform) {
            if (password !== confirmPass) {
                setError("Passwords Must Match");
            } else {
                setError(null); 
            }
        } else {
            //setError(null);
        }
    },[password, confirmPass, registerform])
    
    return(
        <div className='WELCOME_WRAPPER'>
            <div className='gradient_left'>
                {/*This could be reserved for picture on later date */}
                <h1>Iter Viae</h1>
                <h2><i>Path of the road</i></h2>
            </div>
            <div className='gradient_right'>
                {registerform? 
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
                        <button className='register_button' onClick={()=>setRegisterForm(false)}>Need to Register Click Here</button>
                    </div>
                :
                    <div className='signin_box'>
                        {error && <p style={{ color: 'red', fontSize: 'var(--text-sm)' }}>{error}</p>}
                        <Input
                            labelText='Enter Email'
                            placeholder='Enter Email'
                            type='email'
                            value={email}
                            change={(e)=>setEmail(e.target.value)}
                        />
                        <Input
                            labelText='Enter Username'
                            placeholder='Username'
                            type='text'
                            value={userName}
                            change={(e)=>setUserName(e.target.value)}
                        />
                        <Input
                            labelText='Password'
                            type='password'
                            placeholder='Enter Password'
                            value={password}
                            change={(e)=>setPassword(e.target.value)}
                        />
                        <Input
                            labelText='Conffirm Password'
                            type='password'
                            placeholder='Enter Password'
                            value={confirmPass}
                            change={(e)=>setConfirmPass(e.target.value)}
                        />
                        <Button addClass='submit_button' onClick={()=>hadleRegister()}>{loading ? 'Verifying...' : 'Submit'}</Button> 
                        <button className='register_button' onClick={()=>setRegisterForm(true)}>Return to Login</button>
                    </div>
                }
            </div>
        </div>
    )
}

export default Welcome