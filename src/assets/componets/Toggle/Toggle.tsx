import React from 'react';
import './Toggle.css';

interface ToggleProps {
  label: string;
  checked: boolean;
  onChange: () => void;
}

const Toggle: React.FC<ToggleProps> = ({ label, checked, onChange }) => {
  return (
    <div className="Toggle_Wrapper">
      <span className="Toggle_Label">{label}</span>
      <label className="Toggle_Switch">
        <input type="checkbox" checked={checked} onChange={onChange} />
        <span className="Toggle_Slider"></span>
      </label>
    </div>
  );
};

export default Toggle;