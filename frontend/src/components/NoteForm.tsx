import { useState, useEffect } from 'react';
import { Note, NotePayload } from '../hooks/useNotes';
import ClubAutocomplete from './ClubAutocomplete';

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
  const [form, setForm] = useState<NotePayload>(initial ? { ...initial } : empty);
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
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="note-form-card">
      <h3>{initial ? '✏️ Edit Note' : '📝 New Match Note'}</h3>

      {error && <div className="alert alert-error">{error}</div>}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="noteTitle">Note title *</label>
          <input
            id="noteTitle"
            name="noteTitle"
            placeholder="e.g. Derby day thriller"
            value={form.noteTitle}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="club">Your club *</label>
            <ClubAutocomplete
              id="club"
              name="club"
              value={form.club}
              placeholder="e.g. Arsenal"
              required
              onChange={val => setForm(prev => ({ ...prev, club: val }))}
            />
          </div>
          <div className="form-group">
            <label htmlFor="opponent">Opponent *</label>
            <ClubAutocomplete
              id="opponent"
              name="opponent"
              value={form.opponent}
              placeholder="e.g. Chelsea"
              required
              onChange={val => setForm(prev => ({ ...prev, opponent: val }))}
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="matchDate">Match date *</label>
            <input
              id="matchDate"
              name="matchDate"
              type="date"
              value={form.matchDate}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="competition">Competition</label>
            <input
              id="competition"
              name="competition"
              placeholder="e.g. Premier League"
              value={form.competition ?? ''}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="noteBody">Your notes</label>
          <textarea
            id="noteBody"
            name="noteBody"
            placeholder="What happened? Key moments, goals, thoughts…"
            value={form.noteBody ?? ''}
            onChange={handleChange}
          />
        </div>

        <div className="watched-field">
          <span className="watched-label">Watched:</span>
          <button
            type="button"
            className={`watched-box${form.watched ? ' checked' : ''}`}
            onClick={() => setForm(prev => ({ ...prev, watched: 1 }))}
          >
            {form.watched ? '✓' : ''}
          </button>
          <span className="watched-box-label">Yes</span>
          <button
            type="button"
            className={`watched-box${!form.watched ? ' checked' : ''}`}
            onClick={() => setForm(prev => ({ ...prev, watched: 0 }))}
          >
            {!form.watched ? '✓' : ''}
          </button>
          <span className="watched-box-label">No</span>
        </div>

        <div className="form-actions">
          <button type="submit" className="btn btn-primary" disabled={submitting}>
            {submitting ? 'Saving…' : 'Save note'}
          </button>
          <button type="button" className="btn btn-secondary" onClick={onCancel}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
