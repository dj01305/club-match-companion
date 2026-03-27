import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';

export interface Note {
  id: number;
  club: string;
  opponent: string;
  matchDate: string;
  competition: string | null;
  noteTitle: string;
  noteBody: string | null;
  watched: number;
}

export type NotePayload = Omit<Note, 'id'>;

const API = `/api/notes`;

export function useNotes() {
  const { token } = useAuth();
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const headers = useCallback(() => ({
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  }), [token]);

  const fetchNotes = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(API, { headers: headers() });
      if (!res.ok) throw new Error('Failed to fetch notes');
      setNotes(await res.json());
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, [headers]);

  useEffect(() => { fetchNotes(); }, [fetchNotes]);

  async function createNote(payload: NotePayload) {
    const res = await fetch(API, { method: 'POST', headers: headers(), body: JSON.stringify(payload) });
    if (!res.ok) throw new Error('Failed to create note');
    const note: Note = await res.json();
    setNotes(prev => [note, ...prev]);
  }

  async function updateNote(id: number, payload: Partial<NotePayload>) {
    const res = await fetch(`${API}/${id}`, { method: 'PUT', headers: headers(), body: JSON.stringify(payload) });
    if (!res.ok) throw new Error('Failed to update note');
    const updated: Note = await res.json();
    setNotes(prev => prev.map(n => n.id === id ? updated : n));
  }

  async function deleteNote(id: number) {
    const res = await fetch(`${API}/${id}`, { method: 'DELETE', headers: headers() });
    if (!res.ok) throw new Error('Failed to delete note');
    setNotes(prev => prev.filter(n => n.id !== id));
  }

  return { notes, loading, error, createNote, updateNote, deleteNote };
}
