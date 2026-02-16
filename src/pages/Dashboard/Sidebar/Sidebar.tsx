import './Sidebar.css'
import { useState, useEffect } from 'react'
import { SearchBox } from '@mapbox/search-js-react'
import mapboxgl from 'mapbox-gl'

interface SidebarProps {
  mapRef: React.MutableRefObject<mapboxgl.Map | null>;
}

function Sidebar({ mapRef }: SidebarProps) {
  const [isOpen, setIsOpen] = useState(true);
  const [searchVal, setSearchVal] = useState('');
  // State to force-update the coordinate display when the map moves
  const [currentCoords, setCurrentCoords] = useState({ lng: 0, lat: 0 });

  // Update the coordinate display at the bottom whenever the map moves
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const updateCoords = () => {
      const center = map.getCenter();
      setCurrentCoords({ lng: center.lng, lat: center.lat });
    };

    map.on('move', updateCoords);
    return () => { map.off('move', updateCoords); };
  }, [mapRef]);

  // Helper: Checks if text is "number, number"
  const isCoordString = (text: string) => {
    const coordRegex = /^[-+]?\d+(\.\d+)?,\s*[-+]?\d+(\.\d+)?$/;
    return coordRegex.test(text.trim());
  };

  // Helper: The actual Fly-To and Marker logic
  const teleportTo = (lng: number, lat: number) => {
    if (!mapRef.current) return;

    // Coordinate Switcher: If user did [Lat, Lng], flip to [Lng, Lat]
    let finalLng = lng;
    let finalLat = lat;
    if (Math.abs(lng) <= 90 && Math.abs(lat) > 90) {
      [finalLng, finalLat] = [lat, lng];
    }

    mapRef.current.flyTo({
      center: [finalLng, finalLat],
      zoom: 14,
      essential: true,
      duration: 2000
    });

    new mapboxgl.Marker({ color: '#F2613F' })
      .setLngLat([finalLng, finalLat])
      .addTo(mapRef.current);
  };

  const handleRetrieve = (res: any) => {
    if (!res.features || res.features.length === 0) return;
    const coords = res.features[0].geometry.coordinates;
    teleportTo(coords[0], coords[1]);
  };

  // If the user hits "Enter" on raw coordinates, we handle it manually
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && isCoordString(searchVal)) {
      const [n1, n2] = searchVal.split(',').map(n => parseFloat(n.trim()));
      teleportTo(n1, n2);
    }
  };

  return (
    <div className={`DASH_SIDE_wrapper ${isOpen ? 'open' : 'closed'}`}>
      <div className="DASH_SIDE_Row1">
        {isOpen && <h1>Iter Viae</h1>}
        <button onClick={() => setIsOpen(!isOpen)} className='DASH_SIDE_collapse'>
          <span className={`arrow-icon ${isOpen ? 'open' : 'closed'}`}>{'\u00AB'}</span>
        </button>
      </div>

      {isOpen && (
        <div className='DASH_SIDE_SearchArea' onKeyDown={handleKeyDown}>
          <SearchBox
            accessToken={import.meta.env.VITE_MAPBOX_ACCESS_TOKEN}
            placeholder='Search Road or Lng, Lat...'
            onRetrieve={handleRetrieve}
            value={searchVal}
            onChange={(val) => setSearchVal(val)}
            options={{ limit: 5 }}
          />
          <p className="coord-tip">Press Enter to teleport to coordinates</p>
        </div>
      )}

      {isOpen && (
        <div className="DASH_SIDE_Footer">
          <p>Map Center:</p>
          <code>{currentCoords.lat.toFixed(4)},{currentCoords.lng.toFixed(4)} </code>
        </div>
      )}
    </div>
  );
}

export default Sidebar;