const db = require('../db');

exports.createBooking = async (req, res) => {
  const { event_id, number_of_tickets, seat_ids } = req.body;
  const user_id = req.user.id;
  const io = req.app.get('io');

  try {
    const [events] = await db.query('SELECT base_price, available_seats, title FROM events WHERE id = ?', [event_id]);
    
    if (events.length === 0) {
      return res.status(404).json({ message: 'Event not found' });
    }

    const event = events[0];

    // Validate seat IDs if provided
    if (seat_ids && seat_ids.length > 0) {
        if (seat_ids.length !== parseInt(number_of_tickets)) {
            return res.status(400).json({ message: 'Number of selected seats must match ticket count' });
        }

        const [availableSeats] = await db.query(
            'SELECT id FROM event_seats WHERE id IN (?) AND event_id = ? AND is_booked = FALSE',
            [seat_ids, event_id]
        );

        if (availableSeats.length !== seat_ids.length) {
            return res.status(400).json({ message: 'One or more selected seats are no longer available' });
        }
    }

    if (event.available_seats < number_of_tickets) {
      return res.status(400).json({ message: 'Not enough seats available' });
    }

    const total_amount = (parseFloat(event.base_price) * number_of_tickets) + 50.00;

    const [bookingResult] = await db.query(
      'INSERT INTO bookings (user_id, event_id, total_amount, number_of_tickets, status) VALUES (?, ?, ?, ?, ?)',
      [user_id, event_id, total_amount, number_of_tickets, 'pending']
    );

    const booking_id = bookingResult.insertId;

    // Mark seats as booked (temporarily pending payment, but blocked for others)
    if (seat_ids && seat_ids.length > 0) {
        await db.query(
            'UPDATE event_seats SET is_booked = TRUE, booking_id = ? WHERE id IN (?)',
            [booking_id, seat_ids]
        );
    }

    await db.query(
      'UPDATE events SET available_seats = available_seats - ? WHERE id = ?',
      [number_of_tickets, event_id]
    );

    // Emit real-time update
    if (io) {
        io.to(`event_${event_id}`).emit('seatsUpdated', { eventId: event_id });
    }

    res.status(201).json({ 
      message: 'Booking initiated. Awaiting payment.',
      booking_id,
      total_amount 
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error during booking' });
  }
};

exports.getMyBookings = async (req, res) => {
  try {
    const [bookings] = await db.query(`
      SELECT b.*, e.title as event_title, e.event_date as event_date, e.venue_name, e.city, e.image_url 
      FROM bookings b 
      JOIN events e ON b.event_id = e.id 
      WHERE b.user_id = ? 
      ORDER BY b.booking_date DESC
    `, [req.user.id]);

    // Fetch seats for each booking
    const bookingsWithSeats = await Promise.all(bookings.map(async (b) => {
        const [seats] = await db.query('SELECT seat_number FROM event_seats WHERE booking_id = ?', [b.id]);
        return { ...b, seats: seats.map(s => s.seat_number) };
    }));

    res.json(bookingsWithSeats);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
};

exports.getAllBookings = async (req, res) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Access denied' });
    }
    try {
        const [bookings] = await db.query(`
            SELECT b.*, e.title as event_title, u.name as user_name, u.email as user_email
            FROM bookings b
            JOIN events e ON b.event_id = e.id
            JOIN users u ON b.user_id = u.id
            ORDER BY b.booking_date DESC
        `);

        // Fetch seats for each booking
        const bookingsWithSeats = await Promise.all(bookings.map(async (b) => {
            const [seats] = await db.query('SELECT seat_number FROM event_seats WHERE booking_id = ?', [b.id]);
            return { ...b, seats: seats.map(s => s.seat_number) };
        }));

        res.json(bookingsWithSeats);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server Error' });
    }
};

exports.getBookingsByEvent = async (req, res) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Access denied' });
    }
    const eventId = req.params.eventId;
    try {
        const [eventData] = await db.query('SELECT title FROM events WHERE id = ?', [eventId]);
        if (eventData.length === 0) {
            return res.status(404).json({ message: 'Event not found' });
        }

        const [bookings] = await db.query(`
            SELECT b.*, u.name as user_name, u.email as user_email
            FROM bookings b
            JOIN users u ON b.user_id = u.id
            WHERE b.event_id = ?
            ORDER BY b.booking_date DESC
        `, [eventId]);

        // Calculate revenue (only for confirmed bookings)
        const revenue = bookings
            .filter(b => b.status === 'confirmed')
            .reduce((sum, b) => sum + parseFloat(b.total_amount), 0);
            
        // Fetch seats for each booking
        const bookingsWithSeats = await Promise.all(bookings.map(async (b) => {
            const [seats] = await db.query('SELECT seat_number FROM event_seats WHERE booking_id = ?', [b.id]);
            return { ...b, seats: seats.map(s => s.seat_number) };
        }));

        res.json({
            event_title: eventData[0].title,
            revenue: revenue,
            bookings: bookingsWithSeats
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server Error' });
    }
};
