import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNotes, Note, NotePayload } from '../hooks/useNotes';
import NoteCard from '../components/NoteCard';
import NoteForm from '../components/NoteForm';
import ConfirmModal from '../components/ConfirmModal';
import { getClubTheme } from '../utils/clubThemes';

export default function Dashboard() {
  const { user, logout } = useAuth();
  const { notes, loading, error, createNote, updateNote, deleteNote } = useNotes();
  const [showForm, setShowForm] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | undefined>(undefined);
  const [noteToDelete, setNoteToDelete] = useState<number | null>(null);

  // Apply team accent color as CSS variables only — no background tinting
  useEffect(() => {
    const theme = getClubTheme(user?.favoriteClub ?? '');
    document.documentElement.style.setProperty('--accent', theme.primary);
    document.documentElement.style.setProperty('--accent-dark', theme.secondary);
    return () => {
      document.documentElement.style.removeProperty('--accent');
      document.documentElement.style.removeProperty('--accent-dark');
    };
  }, [user?.favoriteClub]);

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
    setShowForm(false);
    setEditingNote(undefined);
  }

  async function handleDelete(id: number) {
    setNoteToDelete(id);
  }

  async function confirmDelete() {
    if (noteToDelete !== null) {
      await deleteNote(noteToDelete);
      setNoteToDelete(null);
    }
  }

  const theme = getClubTheme(user?.favoriteClub ?? '');

  return (
    <div className="dashboard">
      {/* Navbar */}
      <nav className="navbar">
        <div className="navbar-inner">
          <div className="navbar-brand">
            <span className="brand-icon">⚽</span>
            Club Match Companion
          </div>
          <div className="navbar-right">
            <span
              className="club-pill"
              style={{ color: theme.primary, borderColor: `${theme.primary}33` }}
            >
              {user?.favoriteClub}
            </span>
            <button className="btn btn-ghost btn-sm" onClick={logout}>
              Sign out
            </button>
          </div>
        </div>
      </nav>

      {/* Main content */}
      <main className="dashboard-main">
        <div className="page-header">
          <div className="page-header-row">
            <div>
              <h1>Welcome back, {user?.name} ⚽</h1>
              <p>Track your club matches and notes</p>
            </div>
            {!showForm && (
              <button
                className="btn btn-primary"
                style={{ width: 'auto', padding: '11px 28px' }}
                onClick={() => setShowForm(true)}
              >
                + Add Match Note
              </button>
            )}
          </div>
        </div>

        {/* Note form */}
        {showForm && (
          <NoteForm initial={editingNote} onSubmit={handleSubmit} onCancel={handleCancel} />
        )}

        {/* Notes list */}
        {loading && <div className="loading">Loading notes…</div>}
        {error && <div className="alert alert-error">{error}</div>}

        {!loading && !showForm && (
          <div className="notes-list">
            {notes.length === 0 ? (
              <div className="empty-state">
                <span className="empty-icon">📋</span>
                <p>No notes yet. Add your first match note above.</p>
              </div>
            ) : (
              notes.map(note => (
                <NoteCard key={note.id} note={note} onEdit={handleEdit} onDelete={handleDelete} />
              ))
            )}
          </div>
        )}
      </main>

      {noteToDelete !== null && (
        <ConfirmModal
          message="Delete this note?"
          onConfirm={confirmDelete}
          onCancel={() => setNoteToDelete(null)}
        />
      )}
    </div>
  );
}
