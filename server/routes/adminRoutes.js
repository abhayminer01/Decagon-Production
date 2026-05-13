import express from 'express';
import AdminData from '../models/AdminData.js';

const router = express.Router();

// Simple admin auth middleware
const adminAuth = (req, res, next) => {
  const adminPassword = req.headers['x-admin-password'];
  if (adminPassword === 'admin123') {
    next();
  } else {
    res.status(401).json({ error: 'Unauthorized: Admin access required' });
  }
};

// Middleware to ensure AdminData document exists
const ensureAdminData = async () => {
  let data = await AdminData.findOne({ singletonId: 'admin_data' });
  if (!data) {
    data = new AdminData({ singletonId: 'admin_data' });
    await data.save();
  }
  return data;
};

// Get all admin data (Publicly accessible for configurator)
router.get('/', async (req, res) => {
  try {
    const data = await ensureAdminData();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Update specific type (services, finishings, etc)
router.put('/:type', adminAuth, async (req, res) => {
  try {
    const { type } = req.params;
    const { data } = req.body;

    const validTypes = ['services', 'finishings', 'coreMaterials', 'accessories', 'rooms'];
    if (!validTypes.includes(type)) return res.status(400).json({ error: 'Invalid type' });

    await AdminData.findOneAndUpdate(
      { singletonId: 'admin_data' },
      { [type]: data },
      { upsert: true, new: true }
    );
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Bootstrap data
router.post('/bootstrap', adminAuth, async (req, res) => {
  try {
    const { data } = req.body;
    await AdminData.findOneAndUpdate(
      { singletonId: 'admin_data' },
      { ...data, bootstrapData: true },
      { upsert: true }
    );
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
