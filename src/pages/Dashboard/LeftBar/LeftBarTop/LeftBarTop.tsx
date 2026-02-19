import './LeftBarTop.css'
import Input from '../../../../assets/componets/Input/Input'
import { useDashboard } from '../../../../context/DashboardContext'
import React, { useEffect, useState } from 'react';

interface Suggestion{
  formatted:string;
  lon:number;
  lat:number;
  place_id:string;
}

function LeftBarTop(){
  const {search, setSearch, map} =useDashboard();
  const [suggestions, setSuggestions]=useState<Suggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  //Key for GEOAPIFY
  const GEOAPIFY_KEY = import.meta.env.VITE_GEOAPIFY_ACCESS_TOKEN;

  //Function to fly to map quardinates
  const flyToLocation = (lon:number, lat:number, label:string)=>{
    setSearch(label);
    setSuggestions([]);
    setShowSuggestions(false);
    map?.flyTo({
      center:[lon, lat],
      zoom:12,
      essential:true
    })
    setSearch('')
  }

  //Handle Enter Key Behavior
  const handleKeyDown = (e:React.KeyboardEvent)=>{
    if (e.key === 'Enter' && suggestions.length > 0) {
      // Pick the first result in the list automatically
      const topResult = suggestions[0];
      flyToLocation(topResult.lon, topResult.lat, topResult.formatted);
    }
  }

  //Handle loseing focus (Blur)
  const handleBlur = () => {
    // Timeout allows the 'onClick' of the list item to fire before the list is deleted
    //setTimeout(() => setSuggestions([]), 200);
    setTimeout(() => setShowSuggestions(false), 200);
  };

  useEffect(()=>{
    //Dont call the api for empty or short strings
    if(search.length <4){
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    //Debounce wait 400ms after last keystroke
    const timer = setTimeout(async()=>{
      try{
        const response = await fetch(
          `https://api.geoapify.com/v1/geocode/autocomplete?text=${encodeURIComponent(search)}&apiKey=${GEOAPIFY_KEY}&limit=5`
        );
        const data = await response.json();

        const results = data.features?.map((f:any)=>({
          formatted: f.properties.formatted,
          lon: f.properties.lon,
          lat: f.properties.lat,
          place_id: f.properties.place_id
        })) ||[];

        setSuggestions(results);
      }catch(err){
        console.error("Geoapify error:", err);
      }
    }, 400)

    return ()=>clearTimeout(timer);
  }, [search, GEOAPIFY_KEY])
  
  const handleSelect = (s:Suggestion)=>{
    setSearch(s.formatted);
    setSuggestions([])//Close Dropdown

    map?.flyTo({
      center:[s.lon, s.lat],
      zoom:16,
      essential:true
    })
    setSearch('')
  }

  return(
    <div className='LEFTBARTOP_WRAPPER'>
      <Input 
        value={search} 
        change={(e)=>setSearch(e.target.value)} 
        placeholder='Enter Location'
        onKeyDown={handleKeyDown}
        onBlur={handleBlur}
      />

      {/* dropdown list */}
      {suggestions.length > 0 && (
        <ul className='SEARCH_DROPDOWN'>
          {suggestions.map((s)=>(
            <li key={s.place_id} onClick={() => handleSelect(s)}>
              <span className="ICON">📍</span>
              <span className="TEXT">{s.formatted}</span>
            </li>
          ))}
        </ul>
      )}

    </div>
  )
}

export default LeftBarTop