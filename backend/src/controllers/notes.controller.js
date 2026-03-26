const db = require('../db/db');

function getNotes(req, res) {
  const notes = db.all(
    'SELECT * FROM match_notes WHERE userId = ? ORDER BY matchDate DESC',
    [req.user.id]
  );
  return res.status(200).json(notes);
}

function createNote(req, res) {
  const { club, opponent, matchDate, competition, noteTitle, noteBody, watched } = req.body;

  if (!club || !opponent || !matchDate || !noteTitle) {
    return res.status(400).json({ error: 'club, opponent, matchDate, and noteTitle are required.' });
  }

  const result = db.run(
    `INSERT INTO match_notes (userId, club, opponent, matchDate, competition, noteTitle, noteBody, watched)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      req.user.id,
      club,
      opponent,
      matchDate,
      competition || null,
      noteTitle,
      noteBody || null,
      watched !== undefined ? (watched ? 1 : 0) : 1
    ]
  );

  const note = db.get('SELECT * FROM match_notes WHERE id = ?', [result.lastInsertRowid]);
  return res.status(201).json(note);
}

function updateNote(req, res) {
  const { id } = req.params;

  const note = db.get('SELECT * FROM match_notes WHERE id = ? AND userId = ?', [id, req.user.id]);
  if (!note) {
    return res.status(404).json({ error: 'Note not found.' });
  }

  const { club, opponent, matchDate, competition, noteTitle, noteBody, watched } = req.body;

  db.run(
    `UPDATE match_notes
     SET club = ?, opponent = ?, matchDate = ?, competition = ?, noteTitle = ?, noteBody = ?, watched = ?
     WHERE id = ? AND userId = ?`,
    [
      club ?? note.club,
      opponent ?? note.opponent,
      matchDate ?? note.matchDate,
      competition ?? note.competition,
      noteTitle ?? note.noteTitle,
      noteBody ?? note.noteBody,
      watched !== undefined ? (watched ? 1 : 0) : note.watched,
      id,
      req.user.id
    ]
  );

  const updated = db.get('SELECT * FROM match_notes WHERE id = ?', [id]);
  return res.status(200).json(updated);
}

function deleteNote(req, res) {
  const { id } = req.params;

  const note = db.get('SELECT * FROM match_notes WHERE id = ? AND userId = ?', [id, req.user.id]);
  if (!note) {
    return res.status(404).json({ error: 'Note not found.' });
  }

  db.run('DELETE FROM match_notes WHERE id = ? AND userId = ?', [id, req.user.id]);
  return res.status(200).json({ message: 'Note deleted.' });
}

module.exports = { getNotes, createNote, updateNote, deleteNote };
