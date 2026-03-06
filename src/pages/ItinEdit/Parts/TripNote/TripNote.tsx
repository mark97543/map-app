/* ==========================================================================
   COMPONENT: TripNote
   DESCRIPTION: Rich text editor (Quill) for high-level trip documentation.
                Supports double-click to edit and auto-save on blur.
   ========================================================================== */

import type React from "react";
import ReactQuill from 'react-quill-new';
import { useRef, useEffect } from 'react';
import 'react-quill-new/dist/quill.snow.css'; 
import { useTripEdit } from "../../../../context/TripEditContext";
import './TripNote.css'
import { useDashboard } from "../../../../context/DashboardContext";
import { useMyState } from "../../../../context/StatesContext";

interface NoteProps {

}

const TripNote: React.FC<NoteProps> = ({}) => {
  const {handleAutoSave} = useTripEdit();
  const {} =useDashboard();
  const {noteEdit, setNoteEdit, tempNote, setTempNote} = useMyState();

  const quillRef = useRef<ReactQuill>(null);


  useEffect(() => {
    if (noteEdit && quillRef.current) {
      // Small timeout ensures the DOM has rendered the editor before focusing
      const timer = setTimeout(() => {
        quillRef.current?.focus();
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [noteEdit]);

  const handleBlur = () => {
    /**
     * Quill logic: We wait 150ms to see if the user clicked the toolbar.
     * If they did, we don't want to close the editor yet.
     */
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
        /* --- VIEW MODE --- */
        <div 
          className="trip-notes-view-container" 
          onDoubleClick={() => setNoteEdit(true)}
          title="Double-click to edit"
        >
          {/* Check for empty Quill strings like <p><br></p> */}
          {tempNote && tempNote.replace(/<(.|\n)*?>/g, '').trim().length > 0 ? (
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
        /* --- EDIT MODE --- */
        <div className="quill-editor-container">
          <ReactQuill
            ref={quillRef}
            theme="snow"
            value={tempNote}
            onChange={setTempNote}
            onBlur={handleBlur}
            placeholder="Add Some Trip Notes..."
          />
          <p className="quill-hint">Click outside the editor to auto-save</p>
        </div>
      )}
    </div>
  );
};

export default TripNote;

