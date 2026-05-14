const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const router = express.Router();

router.post('/login', async (req, res) => {
  const { password } = req.body;
  if (!password) return res.status(400).json({ error: 'Şifre gerekli' });

  const match = await bcrypt.compare(password, process.env.PASSWORD_HASH);
  if (!match) return res.status(401).json({ error: 'Hatalı şifre' });

  const token = jwt.sign({ auth: true }, process.env.JWT_SECRET, { expiresIn: '7d' });
  res.json({ token });
});

module.exports = router;
