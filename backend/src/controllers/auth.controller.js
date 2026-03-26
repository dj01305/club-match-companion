const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../db/db');

const SALT_ROUNDS = 10;

async function register(req, res) {
  const { name, email, password, favoriteClub } = req.body;

  if (!name || !email || !password || !favoriteClub) {
    return res.status(400).json({ error: 'All fields are required.' });
  }

  const existing = db.get('SELECT id FROM users WHERE email = ?', [email]);
  if (existing) {
    return res.status(409).json({ error: 'Email already registered.' });
  }

  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

  const result = db.run(
    'INSERT INTO users (name, email, passwordHash, favoriteClub) VALUES (?, ?, ?, ?)',
    [name, email, passwordHash, favoriteClub]
  );

  return res.status(201).json({
    message: 'Registration successful.',
    userId: result.lastInsertRowid
  });
}

async function login(req, res) {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }

  const user = db.get('SELECT * FROM users WHERE email = ?', [email]);

  // Always run bcrypt.compare even if user not found — prevents timing attacks
  const passwordMatch = user
    ? await bcrypt.compare(password, user.passwordHash)
    : false;

  if (!user || !passwordMatch) {
    return res.status(401).json({ error: 'Invalid email or password.' });
  }

  const token = jwt.sign(
    { id: user.id, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );

  return res.status(200).json({
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      favoriteClub: user.favoriteClub
    }
  });
}

module.exports = { register, login };
