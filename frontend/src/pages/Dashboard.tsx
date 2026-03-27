import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNotes, Note, NotePayload } from '../hooks/useNotes';
import NoteCard from '../components/NoteCard';
import NoteForm from '../components/NoteForm';

export default function Dashboard() {
  const { user, logout } = useAuth();
  const { notes, loading, error, createNote, updateNote, deleteNote } = useNotes();
  const [showForm, setShowForm] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | undefined>(undefined);

  function handleEdit(note: Note) {
    setEditingNote(note);
    setShowForm(true);
  }

  function handleCancel() {
    setEditingNote(undefined);
    setShowForm(false);
  }

  async function handleSubmit(payload: NotePayload): Promise<void> {
    if (editingNote) {
      await updateNote(editingNote.id, payload);
    } else {
      await createNote(payload);
    }
  }

  async function handleDelete(id: number) {
    if (confirm('Delete this note?')) {
      await deleteNote(id);
    }
  }

  return (
    <div style={{ maxWidth: 720, margin: '0 auto', padding: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1>Welcome, {user?.name}</h1>
          <p>Favorite club: <strong>{user?.favoriteClub}</strong></p>
        </div>
        <button onClick={logout}>Logout</button>
      </div>

      <hr />

      {showForm ? (
        <NoteForm initial={editingNote} onSubmit={handleSubmit} onCancel={handleCancel} />
      ) : (
        <button onClick={() => setShowForm(true)}>+ Add Note</button>
      )}

      <h2>Match Notes</h2>

      {loading && <p>Loading notes...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {!loading && notes.length === 0 && <p>No notes yet. Add your first one above.</p>}
      {notes.map(note => (
        <NoteCard key={note.id} note={note} onEdit={handleEdit} onDelete={handleDelete} />
      ))}
    </div>
  );
}
