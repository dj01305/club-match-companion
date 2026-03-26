const express = require('express');
const router = express.Router();
const authenticateToken = require('../middleware/auth.middleware');
const db = require('../db/db');

router.get('/', authenticateToken, (req, res) => {
  const user = db.get(
    'SELECT id, name, email, favoriteClub, createdAt FROM users WHERE id = ?',
    [req.user.id]
  );

  if (!user) {
    return res.status(404).json({ error: 'User not found.' });
  }

  return res.status(200).json({ user });
});

module.exports = router;
