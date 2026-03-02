import { useTripEdit } from '../../../context/TripEditContext';


interface SlugTitleProps {

}


const TripSummary: React.FC<SlugTitleProps> = ({})=>{

  const {
    handleAutoSave,
    summaryEdit,
    setSummaryEdit,
    tempSummary, 
    setTempSummary
  } = useTripEdit();

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