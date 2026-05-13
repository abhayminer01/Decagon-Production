import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const router = express.Router();

router.post('/register', async (req, res) => {
  try {
    const { email, username, password } = req.body;
    
    const existingEmail = await User.findOne({ email });
    if (existingEmail) return res.status(400).json({ error: 'Email already exists' });

    const existingUsername = await User.findOne({ username });
    if (existingUsername) return res.status(400).json({ error: 'Username already exists' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ email, username, password: hashedPassword });
    await user.save();

    const token = jwt.sign({ id: user._id, email: user.email, username: user.username }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: { id: user._id, email: user.email, username: user.username, isAdmin: user.isAdmin } });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    // Check for hardcoded admin login
    if (email === 'admin' && password === 'admin123') {
      const token = jwt.sign({ id: 'admin', email: 'admin', username: 'admin', isAdmin: true }, process.env.JWT_SECRET, { expiresIn: '7d' });
      return res.json({ token, user: { id: 'admin', email: 'admin', username: 'admin', isAdmin: true } });
    }

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ error: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ error: 'Invalid credentials' });

    const token = jwt.sign({ id: user._id, email: user.email, username: user.username, isAdmin: user.isAdmin }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: { id: user._id, email: user.email, username: user.username, isAdmin: user.isAdmin } });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
