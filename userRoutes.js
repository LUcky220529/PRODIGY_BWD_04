const express = require('express');
const router = express.Router();
const User = require('../models/User');
const redisClient = require('../cache/redisClient');

// Get all users with Redis cache
router.get('/', async (req, res) => {
  try {
    const cacheData = await redisClient.get('users');
    if (cacheData) {
      return res.json(JSON.parse(cacheData));
    }
    const users = await User.findAll();
    await redisClient.set('users', JSON.stringify(users), { EX: 10 });
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create user and clear cache
router.post('/', async (req, res) => {
  try {
    const user = await User.create(req.body);
    await redisClient.del('users');
    res.status(201).json(user);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Update user and clear cache
router.put('/:id', async (req, res) => {
  const user = await User.findByPk(req.params.id);
  if (!user) return res.status(404).json({ error: 'User not found' });

  try {
    await user.update(req.body);
    await redisClient.del('users');
    res.json(user);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Delete user and clear cache
router.delete('/:id', async (req, res) => {
  const user = await User.findByPk(req.params.id);
  if (!user) return res.status(404).json({ error: 'User not found' });

  await user.destroy();
  await redisClient.del('users');
  res.json({ message: 'User deleted' });
});

module.exports = router;
