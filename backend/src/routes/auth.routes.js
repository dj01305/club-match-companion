const express = require('express');
const router = express.Router();
const { register, login, deleteUser } = require('../controllers/auth.controller');
const authenticateToken = require('../middleware/auth.middleware');

router.post('/register', register);
router.post('/login', login);
router.delete('/user', authenticateToken, deleteUser);

module.exports = router;
