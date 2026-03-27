import { Note } from '../hooks/useNotes';

interface Props {
  note: Note;
  onEdit: (note: Note) => void;
  onDelete: (id: number) => void;
}

export default function NoteCard({ note, onEdit, onDelete }: Props) {
  return (
    <div style={{ border: '1px solid #ccc', borderRadius: 8, padding: 16, marginBottom: 12 }}>
      <h3>{note.noteTitle}</h3>
      <p><strong>Match:</strong> {note.club} vs {note.opponent}</p>
      <p><strong>Date:</strong> {note.matchDate}</p>
      {note.competition && <p><strong>Competition:</strong> {note.competition}</p>}
      {note.noteBody && <p>{note.noteBody}</p>}
      <p><strong>Watched:</strong> {note.watched ? 'Yes' : 'No'}</p>
      <button onClick={() => onEdit(note)}>Edit</button>
      <button onClick={() => onDelete(note.id)} style={{ marginLeft: 8 }}>Delete</button>
    </div>
  );
}
