import express from 'express';
import Project from '../models/Project.js';

const router = express.Router();

// Mock auth middleware - in reality this would verify JWT
const requireUser = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Unauthorized' });
  // decode token to get userId (mocked for now, assuming client sends userId)
  // We'll trust the client for this rapid migration, but it should be decoded from JWT.
  import('jsonwebtoken').then(jwt => {
    try {
      const decoded = jwt.default.verify(token, process.env.JWT_SECRET);
      req.userId = decoded.id;
      next();
    } catch (e) {
      res.status(401).json({ error: 'Invalid token' });
    }
  });
};

// Get all projects for current user
router.get('/', requireUser, async (req, res) => {
  try {
    const projects = await Project.find({ userId: req.userId });
    res.json(projects);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Get specific project
router.get('/:id', requireUser, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ error: 'Not found' });
    res.json(project);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Create new project
router.post('/', requireUser, async (req, res) => {
  try {
    const lastProject = await Project.findOne().sort({ createdAt: -1 });
    let nextNum = 1001;
    if (lastProject && lastProject.customId && lastProject.customId.startsWith('DCG-')) {
      const lastNum = parseInt(lastProject.customId.split('-')[1]);
      if (!isNaN(lastNum)) nextNum = lastNum + 1;
    }
    
    const customId = `DCG-${nextNum}`;
    const project = new Project({ userId: req.userId, ...req.body, customId });
    await project.save();
    res.json(project);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update project (used for updating rooms, items, status, title)
router.put('/:id', requireUser, async (req, res) => {
  try {
    const project = await Project.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(project);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete project
router.delete('/:id', requireUser, async (req, res) => {
  try {
    await Project.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
