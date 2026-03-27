import { Note } from '../hooks/useNotes';

interface Props {
  note: Note;
  onEdit: (note: Note) => void;
  onDelete: (id: number) => void;
}

export default function NoteCard({ note, onEdit, onDelete }: Props) {
  return (
    <div className="note-card">
      <div className="note-card-header">
        <span className="note-card-title">{note.noteTitle}</span>
        <div className="note-card-actions">
          <button className="btn btn-icon" onClick={() => onEdit(note)} title="Edit">✏️</button>
          <button className="btn btn-icon" onClick={() => onDelete(note.id)} title="Delete">🗑️</button>
        </div>
      </div>

      <div className="note-card-subtitle">
        <span>{note.club} vs {note.opponent}</span>
        {note.competition && <><span className="dot">·</span><span>{note.competition}</span></>}
        <span className="dot">·</span>
        <span>{note.matchDate}</span>
      </div>

      <div className="watched-row">
        <span className="watched-label">Watched:</span>
        <span className={`watched-box${note.watched ? ' checked' : ''}`}>
          {note.watched ? '✓' : ''}
        </span>
        <span className="watched-box-label">Yes</span>
        <span className={`watched-box${!note.watched ? ' checked' : ''}`}>
          {!note.watched ? '✓' : ''}
        </span>
        <span className="watched-box-label">No</span>
      </div>

      {note.noteBody && (
        <div className="note-card-body">{note.noteBody}</div>
      )}
    </div>
  );
}
