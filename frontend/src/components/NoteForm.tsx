import { useState, useEffect } from 'react';
import { Note, NotePayload } from '../hooks/useNotes';

interface Props {
  initial?: Note;
  onSubmit: (payload: NotePayload) => Promise<void>;
  onCancel: () => void;
}

const empty: NotePayload = {
  club: '', opponent: '', matchDate: '', competition: '',
  noteTitle: '', noteBody: '', watched: 1,
};

export default function NoteForm({ initial, onSubmit, onCancel }: Props) {
  const [form, setForm] = useState<NotePayload>(
    initial ? { ...initial } : empty
  );
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setForm(initial ? { ...initial } : empty);
  }, [initial]);

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    const { name, value, type } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked ? 1 : 0 : value,
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      await onSubmit(form);
      onCancel();
    } catch (e) {
      console.error('NoteForm submit error:', e);
      setError('Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} style={{ marginBottom: 24 }}>
      <h3>{initial ? 'Edit Note' : 'New Note'}</h3>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <div>
        <input name="noteTitle" placeholder="Note title *" value={form.noteTitle} onChange={handleChange} required />
      </div>
      <div>
        <input name="club" placeholder="Your club *" value={form.club} onChange={handleChange} required />
      </div>
      <div>
        <input name="opponent" placeholder="Opponent *" value={form.opponent} onChange={handleChange} required />
      </div>
      <div>
        <input name="matchDate" type="date" value={form.matchDate} onChange={handleChange} required />
      </div>
      <div>
        <input name="competition" placeholder="Competition (optional)" value={form.competition ?? ''} onChange={handleChange} />
      </div>
      <div>
        <textarea name="noteBody" placeholder="Your notes (optional)" value={form.noteBody ?? ''} onChange={handleChange} />
      </div>
      <div>
        <label>
          <input name="watched" type="checkbox" checked={!!form.watched} onChange={handleChange} />
          {' '}Watched
        </label>
      </div>
      <button type="submit" disabled={submitting}>{submitting ? 'Saving...' : 'Save'}</button>
      <button type="button" onClick={onCancel} style={{ marginLeft: 8 }}>Cancel</button>
    </form>
  );
}
