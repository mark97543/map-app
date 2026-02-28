import {type Trip} from '../ItinEdit'

interface SlugTitleProps {
  tripDetails: Trip;
  summaryEdit:boolean;
  setSummaryEdit:(val: boolean) => void;
  handleAutoSave: () => Promise<void>;
  tempSummary:string;
  setTempSummary:(val: string) => void;
}


const TripSummary: React.FC<SlugTitleProps> = ({tripDetails,summaryEdit,setSummaryEdit, handleAutoSave, tempSummary, setTempSummary})=>{


  return(
    <div className="TRIPSUMMARY_wrapper">
      <h2>Trip Summary</h2>
      {!summaryEdit ? (
        <p className='TRIPSUMMARY_p' onDoubleClick={()=>setSummaryEdit(!summaryEdit)}>{tempSummary}</p>
      ):(
        <textarea
          autoFocus
          className='TRIPSUMMARY_input'
          rows={4}
          value={tempSummary}
          onBlur={handleAutoSave}
          onChange={(e)=>setTempSummary(e.target.value)}
        />
      )}
    </div>
  )
}

export default TripSummary