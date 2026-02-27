
interface SlugTitleProps {
  titleEdit: boolean;
  tripDetails: {
    id: number;
    title: string;
    trip_id: string;
  };
  tempId: string;
  setTempId: (val: string) => void;
  tempTitle: string;
  setTempTitle: (val: string) => void;
  setTitleEdit: (val: boolean) => void;
  handleAutoSave: () => Promise<void>;
}

const SlugTitle: React.FC<SlugTitleProps> = ({
  titleEdit,
  tripDetails,
  setTempId,
  setTempTitle,
  tempId,
  tempTitle,
  handleAutoSave,
  setTitleEdit
}) => {

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