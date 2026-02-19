import './Input.css'
import { type ChangeEvent, type KeyboardEvent, type FocusEvent } from 'react';

interface Inp {
  /**
   * A string for the label. No Input is no label
   */
  labelText?: string;
  /**
   * Placeholder Text Optional
   */
  placeholder?: string;
  /**
   * Input Type 'date'|'datetime-local'|'email'|'number'|'password'|'text' (default)|'time'
   */
  type?: 'date' | 'datetime-local' | 'email' | 'number' | 'password' | 'text' | 'time'
  /**
   * The initial value of the input
   */
  value?: any;
  /**
   * On Change event for value
   */
  change?: (e: ChangeEvent<HTMLInputElement>) => void;
  /**
   * Key Down Event
   */
  onKeyDown?: (e: KeyboardEvent<HTMLInputElement>) => void;
  /**
   * Blur Event (Losing Focus) 👈 Added this
   */
  onBlur?: (e: FocusEvent<HTMLInputElement>) => void;
}

/**
 * Standard Input
 * @param label
 */
function Input({ labelText, placeholder, type = 'text', value, change, onKeyDown, onBlur }: Inp) {

  return (
    <div className={`INPUT_DIV`}>
      {labelText && <label className='INPUT_LABEL'>{labelText}</label>}
      <input
        className='INPUT'
        placeholder={placeholder}
        type={type}
        value={value}
        onChange={change}
        onKeyDown={onKeyDown}
        onBlur={onBlur} 
      />
    </div>
  )
}

export default Input;