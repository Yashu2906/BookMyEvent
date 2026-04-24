const db = require('../db');

// Add event to wishlist
exports.addToWishlist = async (req, res) => {
  const userId = req.user.id;
  const { eventId } = req.body;
  
  if (!eventId) {
    return res.status(400).json({ message: 'Event ID is required' });
  }

  try {
    // Check if already in wishlist
    const [existing] = await db.execute(
      'SELECT id FROM wishlists WHERE user_id = ? AND event_id = ?',
      [userId, eventId]
    );

    if (existing.length > 0) {
      return res.status(400).json({ message: 'Event already in wishlist' });
    }

    await db.execute(
      'INSERT INTO wishlists (user_id, event_id) VALUES (?, ?)',
      [userId, eventId]
    );

    res.status(201).json({ success: true, message: 'Event added to wishlist' });
  } catch (error) {
    console.error('Error adding to wishlist:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Remove event from wishlist
exports.removeFromWishlist = async (req, res) => {
  const userId = req.user.id;
  const { eventId } = req.params;

  try {
    await db.execute(
      'DELETE FROM wishlists WHERE user_id = ? AND event_id = ?',
      [userId, eventId]
    );

    res.json({ success: true, message: 'Event removed from wishlist' });
  } catch (error) {
    console.error('Error removing from wishlist:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Get user's wishlist
exports.getWishlist = async (req, res) => {
  const userId = req.user.id;

  try {
    const [rows] = await db.execute(
      `SELECT e.* FROM events e 
       JOIN wishlists w ON e.id = w.event_id 
       WHERE w.user_id = ?`,
      [userId]
    );

    res.json(rows);
  } catch (error) {
    console.error('Error fetching wishlist:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Check if event is in user's wishlist
exports.checkWishlist = async (req, res) => {
    const userId = req.user.id;
    const { eventId } = req.params;
  
    try {
      const [rows] = await db.execute(
        'SELECT id FROM wishlists WHERE user_id = ? AND event_id = ?',
        [userId, eventId]
      );
  
      res.json({ isInWishlist: rows.length > 0 });
    } catch (error) {
      console.error('Error checking wishlist:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  };
