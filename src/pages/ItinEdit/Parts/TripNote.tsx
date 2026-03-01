import type React from "react";
import ReactQuill from 'react-quill-new';
import { useRef, useEffect } from 'react';
import 'react-quill-new/dist/quill.snow.css'; // Ensure styles are imported

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

  useEffect(() => {
    if (noteEdit && quillRef.current) {
      const timer = setTimeout(() => {
        quillRef.current?.focus();
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [noteEdit]);

  const handleBlur = () => {
    // Small delay to check if focus moved to the toolbar
    setTimeout(() => {
      const isToolbar = document.activeElement?.closest('.ql-toolbar');
      if (!isToolbar) {
        setNoteEdit(false);
        handleAutoSave();
      }
    }, 150);
  };

  return (
    <div className="EDITNOTES_wrapper">
      <h2>Trip Notes</h2>
      
      {!noteEdit ? (
        <div 
          className="trip-notes-view-container" 
          onDoubleClick={() => setNoteEdit(true)}
        >
          {tempNote && tempNote !== "<p><br></p>" && tempNote !== "<p></p>" ? (
            <div
              className="trip-notes-display"
              dangerouslySetInnerHTML={{ __html: tempNote }}
            />
          ) : (
            <div className="ITIN_EDIT_note_placeholder">
              <p><i>No notes yet. Double-click here to add some!</i></p>
            </div>
          )}
        </div>
      ) : (
        <div className="quill-editor-container">
          <ReactQuill
            ref={quillRef}
            theme="snow"
            value={tempNote}
            onChange={setTempNote}
            onBlur={handleBlur}
            placeholder="Add Some Trip Notes..."
          />
        </div>
      )}
    </div>
  );
};

export default TripNote;