import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import './DropDown.css'; 

/**
 * DropdownItem Interface
 * @id - Unique identifier for React mapping
 * @label - The text displayed to the user
 * @link - (Optional) The URL for navigation
 * @action - (Optional) A function to execute (e.g., change map style)
 */
interface DropdownItem {
  id: string | number;
  label: string;
  link?: string;    // Optional: for navigation
  action?: () => void; // Optional: for map style changes
}

interface DropdownProps {
  title: string;
  items: DropdownItem[];
}

function Dropdown({ title, items = [] }: DropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const toggleDropdown = () => setIsOpen(!isOpen);

  // Close when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  const handleItemClick = (item: DropdownItem) => {
    if (item.action) item.action(); // Run map change logic
    setIsOpen(false);               // Close menu
  };

  return (
    <div className="dropdown-container" ref={dropdownRef}>
      <button 
        type="button" 
        className={`dropdown-toggle ${isOpen ? 'open' : ''}`}
        onClick={toggleDropdown}
      >
        {title}
        <span className="arrow">{isOpen ? '▲' : '▼'}</span>
      </button>

      {isOpen && (
        <div className="dropdown-menu">
          {items.map((item) => (
            item.link ? (
              <Link 
                key={item.id} 
                to={item.link} 
                className="dropdown-item" 
                onClick={() => setIsOpen(false)}
              >
                {item.label}
              </Link>
            ) : (
              <button 
                key={item.id} 
                type="button"
                className="dropdown-item-btn" 
                onClick={() => handleItemClick(item)}
              >
                {item.label}
              </button>
            )
          ))}
        </div>
      )}
    </div>
  );
}

export default Dropdown;

/* --------------------------------------------------------------------------
HOW TO USE THIS DROPDOWN
--------------------------------------------------------------------------

1. FOR NAVIGATION (Links):
   Use this if you want the dropdown to act like a menu for different pages.
   
   const navItems = [
     { id: 1, label: 'Profile', link: '/profile' },
     { id: 2, label: 'Settings', link: '/settings' }
   ];
   
   <Dropdown title="Account" items={navItems} />


2. FOR MAP ACTIONS (Style Switcher):
   Use this to trigger functions (like Mapbox .setStyle) without changing pages.
   
   const { map } = useDashboard(); // Grab your map from context

   const mapStyles = [
     { 
       id: 'dark', 
       label: 'Tactical Dark', 
       action: () => map?.setStyle('mapbox://styles/mapbox/dark-v11') 
     },
     { 
       id: 'sat', 
       label: 'Satellite imagery', 
       action: () => map?.setStyle('mapbox://styles/mapbox/satellite-streets-v12') 
     }
   ];

   <Dropdown title="Map Layers" items={mapStyles} />


3. MIXED USAGE:
   You can technically mix links and actions in the same menu if needed.
--------------------------------------------------------------------------
*/