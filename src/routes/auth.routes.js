const express = require('express');
const authService = require('../services/auth.service');

const router = express.Router();

router.post('/register', async (req, res) => {
  try {
    const { email, password, role } = req.body;
    if (!email || !password || !role) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    const user = await authService.register(email, password, role);
    res.status(201).json({ message: 'User registered successfully', user });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Missing email or password' });
    }

    const data = await authService.login(email, password);
    res.json(data);
  } catch (error) {
    res.status(401).json({ error: error.message });
  }
});

module.exports = router;
