
import './Button.css'
import { type ReactNode, type ButtonHTMLAttributes } from 'react'

interface But {
    children:ReactNode;
    /** * Determines the color and feel of the button.
     * Options: 'basic', 'caution', 'danger'
     * @default 'basic'
     */
    type?:'basic'|'caution'|'danger';
    /** * Function called when the button is clicked.
     */
    onClick?: ()=> void;
    /**
     * A string to add class that allows you to add css to the button
     */
    addClass?:string
}

/**
 * Standard Button
 * @param type Determines the color and feel of the button (3 Options).
 * @param onClick Function called when the button is clicked.
 * @param addClass A string to add class that allows you to add css to the button
 */

function Button({children, type='basic',onClick, addClass}:But){
    return(
        <button 
            className={`btn-${type} btn-std ${addClass}`}
            onClick={onClick}>
                {children}
        </button>
    )
}


export default Button