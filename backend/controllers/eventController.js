const db = require('../db');

exports.getAllEvents = async (req, res) => {
  const { userId } = req.query;
  try {
    let query = 'SELECT * FROM events WHERE status = "published" ORDER BY event_date ASC';
    let params = [];

    if (userId) {
      query = `
        SELECT e.*, IF(w.id IS NULL, FALSE, TRUE) as is_wishlisted 
        FROM events e 
        LEFT JOIN wishlists w ON e.id = w.event_id AND w.user_id = ? 
        WHERE e.status = "published" 
        ORDER BY e.event_date ASC`;
      params = [userId];
    }

    const [events] = await db.query(query, params);
    
    const mappedEvents = events.map(e => ({
      ...e,
      isWishlisted: !!e.is_wishlisted
    }));

    res.json(mappedEvents);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
};

exports.getEventById = async (req, res) => {
  const { userId } = req.query;
  try {
    let query = 'SELECT * FROM events WHERE id = ?';
    let params = [req.params.id];

    if (userId) {
      query = `
        SELECT e.*, IF(w.id IS NULL, FALSE, TRUE) as is_wishlisted 
        FROM events e 
        LEFT JOIN wishlists w ON e.id = w.event_id AND w.user_id = ? 
        WHERE e.id = ?`;
      params = [userId, req.params.id];
    }

    const [events] = await db.query(query, params);
    
    if (events.length === 0) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // Fetch seats for this event
    const [seats] = await db.query('SELECT * FROM event_seats WHERE event_id = ?', [req.params.id]);

    console.log(`Event ${req.params.id}: Found ${seats.length} seats`);

    const event = {
      ...events[0],
      isWishlisted: !!events[0].is_wishlisted,
      seats: seats.map(s => ({
        id: s.id,
        seatNumber: s.seat_number,
        seatClass: s.seat_class,
        priceMultiplier: s.price_multiplier,
        isBooked: !!s.is_booked
      }))
    };
    
    res.json(event);
  } catch (err) {
    console.error('GET_EVENT_ERROR:', err);
    res.status(500).json({ message: 'Server Error' });
  }
};

const generateSeats = (eventId, category, capacity) => {
  const seats = [];
  
  if (category === 'Music' || category === 'Festival') {
    // 20% VIP, 30% Gold, 50% GA
    const vipCount = Math.floor(capacity * 0.2);
    const goldCount = Math.floor(capacity * 0.3);
    const gaCount = capacity - vipCount - goldCount;

    for (let i = 0; i < vipCount; i++) seats.push([eventId, `VIP-${i + 1}`, 'VIP', 2.50]);
    for (let i = 0; i < goldCount; i++) seats.push([eventId, `GLD-${i + 1}`, 'Gold', 1.50]);
    for (let i = 0; i < gaCount; i++) seats.push([eventId, `GA-${i + 1}`, 'GA', 1.00]);

  } else if (category === 'Sports') {
    // 25% North, 25% South, 20% East, 20% West, 10% VIP
    const north = Math.floor(capacity * 0.25);
    const south = Math.floor(capacity * 0.25);
    const east = Math.floor(capacity * 0.20);
    const west = Math.floor(capacity * 0.20);
    const vip = capacity - north - south - east - west;

    for (let i = 0; i < north; i++) seats.push([eventId, `N-${i + 1}`, 'North Stand', 1.20]);
    for (let i = 0; i < south; i++) seats.push([eventId, `S-${i + 1}`, 'South Stand', 1.20]);
    for (let i = 0; i < east; i++) seats.push([eventId, `E-${i + 1}`, 'East Stand', 1.80]);
    for (let i = 0; i < west; i++) seats.push([eventId, `W-${i + 1}`, 'West Stand', 1.80]);
    for (let i = 0; i < vip; i++) seats.push([eventId, `VIP-${i + 1}`, 'VIP Box', 3.00]);

  } else if (category === 'Comedy') {
    const seatsPerTable = 4;
    for (let i = 0; i < capacity; i++) {
        const table = Math.floor(i / seatsPerTable) + 1;
        const seat = (i % seatsPerTable) + 1;
        seats.push([eventId, `T${table}-S${seat}`, 'Standard', 1.00]);
    }
  } else {
    // Technology, Classical, Theater, Other -> Grid layout
    const rows = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
    const seatsPerRow = 10;
    for (let i = 0; i < capacity; i++) {
      const rowIndex = Math.floor(i / seatsPerRow);
      let rowName = "";
      if (rowIndex < 26) {
          rowName = rows[rowIndex];
      } else {
          rowName = rows[Math.floor(rowIndex / 26) - 1] + rows[rowIndex % 26];
      }
      const num = (i % seatsPerRow) + 1;
      seats.push([eventId, `${rowName}${num}`, 'Standard', 1.00]);
    }
  } return seats;
};

exports.createEvent = async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Access denied: Admin only' });
  }
  const { title, description, category, venue_name, city, event_date, base_price, total_capacity, image_url, organizer_id } = req.body;
  
  try {
    const [result] = await db.query(
      `INSERT INTO events 
      (title, description, category, venue_name, city, event_date, base_price, total_capacity, available_seats, image_url, organizer_id) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [title, description, category, venue_name, city, event_date, base_price, total_capacity, total_capacity, image_url, organizer_id || 1] 
    );

    const eventId = result.insertId;

    // Generate and Insert Seats in Batches to avoid SQL limits
    const seatsData = generateSeats(eventId, category, total_capacity);
    if (seatsData.length > 0) {
        const BATCH_SIZE = 500;
        for (let i = 0; i < seatsData.length; i += BATCH_SIZE) {
            const batch = seatsData.slice(i, i + BATCH_SIZE);
            await db.query(
                'INSERT INTO event_seats (event_id, seat_number, seat_class, price_multiplier) VALUES ?',
                [batch]
            );
        }
    }

    console.log(`Created event ${eventId} with ${seatsData.length} seats`);
    res.status(201).json({ message: 'Event created successfully', eventId });
  } catch (err) {
    console.error('CREATE_EVENT_ERROR:', err);
    res.status(500).json({ message: 'Server Error during event creation' });
  }
};

exports.deleteEvent = async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Access denied: Admin only' });
  }
  const { id } = req.params;
  try {
    // Foreign keys might fail if there are bookings. Ideally we delete or cascade.
    // Deleting from related tables first.
    await db.query('DELETE FROM event_seats WHERE event_id = ?', [id]);
    await db.query('DELETE FROM wishlists WHERE event_id = ?', [id]);
    await db.query('DELETE FROM bookings WHERE event_id = ?', [id]);
    
    const [result] = await db.query('DELETE FROM events WHERE id = ?', [id]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Event not found' });
    }
    
    res.json({ message: 'Event deleted successfully' });
  } catch (err) {
    console.error('DELETE_EVENT_ERROR:', err);
    res.status(500).json({ message: 'Server Error during event deletion' });
  }
};
