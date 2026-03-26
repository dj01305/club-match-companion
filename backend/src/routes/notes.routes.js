const express = require('express');
const router = express.Router();
const authenticateToken = require('../middleware/auth.middleware');
const { getNotes, createNote, updateNote, deleteNote } = require('../controllers/notes.controller');

// All notes routes require a valid JWT
// authenticateToken runs first on every route in this file
router.use(authenticateToken);

router.get('/', getNotes);
router.post('/', createNote);
router.put('/:id', updateNote);
router.delete('/:id', deleteNote);

module.exports = router;
