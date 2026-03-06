import { useMyState } from "../../../../context/StatesContext";
import { useTripEdit } from "../../../../context/TripEditContext";

interface SlugTitleProps {

}

const SlugTitle: React.FC<SlugTitleProps> = ({}) => {
  const {
    handleAutoSave
  } =useTripEdit();
  const {   
    tripDetails,
    titleEdit,
    setTitleEdit,
    setTempId,
    tempId,
    setTempTitle,
    tempTitle,} = useMyState();

  if (!tripDetails) return <div className="loading-placeholder">Loading Title...</div>;

  return(
    <div className='EDIT_Details'>
      {!titleEdit ? (
        <h1 className='Slug_Title_Block' onDoubleClick={()=>setTitleEdit(!titleEdit)}>{tripDetails.trip_id} : {tripDetails.title}</h1>
        ) :(
          <div className='Title_inputs'>
            <input 
              placeholder={tripDetails.trip_id}
              value={tempId}
              onChange={(e) => setTempId(e.target.value)}
              onBlur={handleAutoSave}
            />
            <h1>:</h1>
            <input
              placeholder={tripDetails.title}
              onChange={(e) => setTempTitle(e.target.value)}
              value={tempTitle}
              onBlur={handleAutoSave}
            />
            
          </div>
      )}
    </div>
  )
}

export default SlugTitle