
import { Link } from 'react-router-dom';
import { MapPinOff } from 'lucide-react'; // A perfect travel-themed error icon!
import './NotFound.css';

export const NotFound = () => {
  return (
    <div className="NotFound_Container">
      <div className="NotFound_IconWrapper">
        <MapPinOff size={80} />
      </div>
      
      <h1 className="NotFound_Title">404 - Off the Map!</h1>
      <p className="NotFound_Text">
        Looks like you took a wrong turn. This stop isn't on the itinerary.
      </p>
      
      <Link to="/" className="NotFound_Button">
        Reroute to Dashboard
      </Link>
    </div>
  );
};

export default NotFound;