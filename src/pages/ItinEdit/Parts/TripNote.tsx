import type React from "react";
import ReactQuill from 'react-quill-new';
import { useRef, useEffect } from 'react';

interface Note {
  noteEdit: boolean;
  setNoteEdit: (val: boolean) => void;
  tempNote: string;
  setTempNote: (val: string) => void;
  handleAutoSave: () => Promise<void>;
}

const TripNote: React.FC<Note> = ({
  noteEdit,
  setNoteEdit,
  tempNote,
  setTempNote,
  handleAutoSave
}) => {
  const quillRef = useRef<ReactQuill>(null);
  
  const isActuallyEmpty = !tempNote || tempNote === '<p><br></p>' || tempNote.trim() === '';

  useEffect(() => {
    if (noteEdit && quillRef.current) {
      // Use a tiny timeout to ensure the editor is fully in the DOM 
      // before trying to grab the selection range.
      const timer = setTimeout(() => {
        quillRef.current?.focus();
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [noteEdit]);

  const handleBlur = (range: any, source: any, editor: any) => {
    // Quill's onBlur provides the 'range'. If range is null, it means 
    // focus has truly left the editor area.
    setTimeout(() => {
      // We check document.activeElement to see if we clicked the toolbar.
      // If the new focus is NOT a quill toolbar button, we save.
      const isToolbar = document.activeElement?.closest('.ql-toolbar');
      if (!isToolbar) {
        setNoteEdit(false);
        handleAutoSave();
      }
    }, 100);
  };

  return (
    <div className="EDITNOTES_wrapper">
      <h2>Trip Notes</h2>
      {!noteEdit ? (
        <div onDoubleClick={() => setNoteEdit(true)} style={{ cursor: 'pointer' }}>
          {tempNote && tempNote !== "<p></p>" ? (
            <div
              className="trip-notes-display"
              dangerouslySetInnerHTML={{ __html: tempNote }}
            />
          ) : (
            <div className="ITIN_EDIT_note">
              <p><i>No notes yet. Double-click here to add some!</i></p>
            </div>
          )}
        </div>
      ) : (
        <div className="trip-notes-display">
          <ReactQuill
            ref={quillRef}
            theme="snow"
            value={tempNote}
            onChange={setTempNote}
            onBlur={handleBlur} // Use the specialized Quill blur handler
            placeholder="Add Some Trip Notes!"
          />
        </div>
      )}
    </div>
  );
};

export default TripNote;