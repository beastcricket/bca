const express = require('express');
const router = express.Router();
const Player = require('../models/Player');
const Auction = require('../models/Auction');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const { verifyToken } = require('../middleware/auth');

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Configure Multer for Cloudinary
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'bca-players',
    resource_type: 'auto',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
  },
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});

// Register player via shareable link (PUBLIC - no auth needed)
router.post('/:auctionId/register', upload.single('photo'), async (req, res) => {
  try {
    const { auctionId } = req.params;
    const { name, role, category, nationality, age, basePrice, matches, runs, wickets, average, strikeRate } = req.body;

    // Validate auction exists
    const auction = await Auction.findById(auctionId);
    if (!auction) {
      return res.status(404).json({ error: 'Auction not found' });
    }

    // Validate required fields
    if (!name || !role || !category || !basePrice) {
      return res.status(400).json({ error: 'Missing required fields: name, role, category, basePrice' });
    }

    if (basePrice <= 0) {
      return res.status(400).json({ error: 'Base price must be greater than 0' });
    }

    // Create player
    const playerData = {
      auctionId,
      name: name.trim(),
      role,
      category,
      nationality: nationality || 'Indian',
      age: age ? parseInt(age) : 0,
      basePrice: parseInt(basePrice),
      imageUrl: req.file ? req.file.secure_url : null,
      status: 'pending',
      stats: {
        matches: parseInt(matches) || 0,
        runs: parseInt(runs) || 0,
        wickets: parseInt(wickets) || 0,
        average: parseFloat(average) || 0,
        strikeRate: parseFloat(strikeRate) || 0,
      },
    };

    const player = new Player(playerData);
    await player.save();

    // Emit real-time update via Socket.io
    const io = require('../socket/io').getIO();
    if (io) {
      io.emit('playerRegistered', {
        auctionId,
        player: player.toObject(),
      });
    }

    console.log('✅ Player registered via link:', player.name);
    res.status(201).json({
      success: true,
      message: 'Player registered successfully',
      player,
    });
  } catch (error) {
    console.error('❌ Player registration error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Add player manually (PROTECTED - organizer only)
router.post('/:auctionId/add', verifyToken, upload.single('photo'), async (req, res) => {
  try {
    const { auctionId } = req.params;
    const { name, role, category, nationality, age, basePrice, matches, runs, wickets, average, strikeRate } = req.body;

    // Verify organizer owns auction
    const auction = await Auction.findById(auctionId);
    if (!auction) {
      return res.status(404).json({ error: 'Auction not found' });
    }

    if (auction.organizerId.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    // Validate required fields
    if (!name || !role || !category || !basePrice) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Create player
    const playerData = {
      auctionId,
      name: name.trim(),
      role,
      category,
      nationality: nationality || 'Indian',
      age: age ? parseInt(age) : 0,
      basePrice: parseInt(basePrice),
      imageUrl: req.file ? req.file.secure_url : null,
      status: 'pending',
      stats: {
        matches: parseInt(matches) || 0,
        runs: parseInt(runs) || 0,
        wickets: parseInt(wickets) || 0,
        average: parseFloat(average) || 0,
        strikeRate: parseFloat(strikeRate) || 0,
      },
    };

    const player = new Player(playerData);
    await player.save();

    // Emit real-time update
    const io = require('../socket/io').getIO();
    if (io) {
      io.emit('playerAdded', {
        auctionId,
        player: player.toObject(),
      });
    }

    console.log('✅ Player added manually:', player.name);
    res.status(201).json({
      success: true,
      message: 'Player added successfully',
      player,
    });
  } catch (error) {
    console.error('❌ Add player error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get all players for auction
router.get('/:auctionId', async (req, res) => {
  try {
    const { auctionId } = req.params;

    const players = await Player.find({ auctionId }).sort({ createdAt: -1 });

    res.json({
      success: true,
      count: players.length,
      players,
    });
  } catch (error) {
    console.error('❌ Get players error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Update player
router.put('/:playerId', verifyToken, upload.single('photo'), async (req, res) => {
  try {
    const { playerId } = req.params;
    const { name, role, category, nationality, age, basePrice, matches, runs, wickets, average, strikeRate } = req.body;

    const player = await Player.findById(playerId);
    if (!player) {
      return res.status(404).json({ error: 'Player not found' });
    }

    // Verify ownership
    const auction = await Auction.findById(player.auctionId);
    if (auction.organizerId.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    // Update fields
    if (name) player.name = name.trim();
    if (role) player.role = role;
    if (category) player.category = category;
    if (nationality) player.nationality = nationality;
    if (age !== undefined) player.age = parseInt(age);
    if (basePrice) player.basePrice = parseInt(basePrice);

    // Update stats
    if (matches !== undefined) player.stats.matches = parseInt(matches);
    if (runs !== undefined) player.stats.runs = parseInt(runs);
    if (wickets !== undefined) player.stats.wickets = parseInt(wickets);
    if (average !== undefined) player.stats.average = parseFloat(average);
    if (strikeRate !== undefined) player.stats.strikeRate = parseFloat(strikeRate);

    // Update photo if provided
    if (req.file) {
      player.imageUrl = req.file.secure_url;
    }

    await player.save();

    // Emit update
    const io = require('../socket/io').getIO();
    if (io) {
      io.emit('playerUpdated', {
        auctionId: player.auctionId,
        player: player.toObject(),
      });
    }

    res.json({
      success: true,
      message: 'Player updated successfully',
      player,
    });
  } catch (error) {
    console.error('❌ Update player error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Delete player
router.delete('/:playerId', verifyToken, async (req, res) => {
  try {
    const { playerId } = req.params;

    const player = await Player.findById(playerId);
    if (!player) {
      return res.status(404).json({ error: 'Player not found' });
    }

    // Verify ownership
    const auction = await Auction.findById(player.auctionId);
    if (auction.organizerId.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const auctionId = player.auctionId;

    await Player.deleteOne({ _id: playerId });

    // Emit update
    const io = require('../socket/io').getIO();
    if (io) {
      io.emit('playerDeleted', {
        auctionId,
        playerId,
      });
    }

    res.json({
      success: true,
      message: 'Player deleted successfully',
    });
  } catch (error) {
    console.error('❌ Delete player error:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
