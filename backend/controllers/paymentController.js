const Razorpay = require('razorpay');
const crypto = require('crypto');
const db = require('../db');
const emailService = require('../utils/emailService');

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// Create a Razorpay Order
exports.createOrder = async (req, res) => {
  const { booking_id } = req.body;
  
  try {
    const [bookings] = await db.query('SELECT total_amount FROM bookings WHERE id = ? AND user_id = ?', [booking_id, req.user.id]);
    
    if (bookings.length === 0) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    const amount = Math.round(parseFloat(bookings[0].total_amount) * 100); // Razorpay expects paise (INR)

    const options = {
      amount: amount,
      currency: "INR",
      receipt: `receipt_${booking_id}`,
    };

    const order = await razorpay.orders.create(options);
    res.json(order);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Razorpay Order Creation Failed' });
  }
};

// Verify Payment Signature
exports.verifyPayment = async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature, booking_id } = req.body;

  const sign = razorpay_order_id + "|" + razorpay_payment_id;
  const expectedSign = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
    .update(sign.toString())
    .digest("hex");

  if (razorpay_signature === expectedSign) {
    try {
      // Check ownership
      const [bookings] = await db.query('SELECT total_amount FROM bookings WHERE id = ? AND user_id = ?', [booking_id, req.user.id]);
      if (bookings.length === 0) {
        return res.status(403).json({ message: "Unauthorized booking confirmation" });
      }

      // Update Payment and Booking status
      await db.query(
        'INSERT INTO payments (booking_id, transaction_id, payment_method, amount, status) VALUES (?, ?, ?, ?, ?)',
        [booking_id, razorpay_payment_id, 'razorpay', 0, 'success'] // Amount already paid
      );
      await db.query('UPDATE bookings SET status = "confirmed" WHERE id = ?', [booking_id]);
      
      // Fetch full booking and event details for the ticket email
      const [details] = await db.query(`
        SELECT b.id as booking_id, b.total_amount, b.number_of_tickets, 
               e.title as event_title, e.event_date, e.venue_name, e.city,
               u.email as user_email
        FROM bookings b
        JOIN events e ON b.event_id = e.id
        JOIN users u ON b.user_id = u.id
        WHERE b.id = ?
      `, [booking_id]);

      if (details.length > 0) {
        const detail = details[0];
        
        // Fetch seats for this booking
        const [seats] = await db.query('SELECT seat_number FROM event_seats WHERE booking_id = ?', [booking_id]);
        const seatNumbers = seats.map(s => s.seat_number);

        await emailService.sendTicketEmail(detail.user_email, {
          bookingId: detail.booking_id,
          eventTitle: detail.event_title,
          eventDate: detail.event_date,
          venue: detail.venue_name,
          city: detail.city,
          tickets: detail.number_of_tickets,
          totalAmount: detail.total_amount,
          seats: seatNumbers
        });
      }
      
      return res.json({ message: "Payment verified successfully and ticket sent!" });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: "Failed to update record" });
    }
  } else {
    return res.status(400).json({ message: "Invalid signature sent!" });
  }
};

// Legacy manual process (if needed)
exports.processPayment = async (req, res) => {
    // Keep this for simple mock payments if Razorpay is not configured
    const { booking_id, amount, payment_method, transaction_id } = req.body;
    const user_id = req.user.id;

    try {
        const [bookings] = await db.query('SELECT * FROM bookings WHERE id = ? AND user_id = ?', [booking_id, user_id]);
        if (bookings.length === 0) return res.status(404).json({ message: 'Booking not found' });
        
        const booking = bookings[0];
        if (parseFloat(booking.total_amount) !== parseFloat(amount)) {
            return res.status(400).json({ message: `Amount mismatch. Expected ${booking.total_amount}, got ${amount}` });
        }

        await db.query(
            'INSERT INTO payments (booking_id, transaction_id, payment_method, amount, status) VALUES (?, ?, ?, ?, ?)',
            [booking_id, transaction_id || `txn_${Date.now()}`, payment_method, amount, 'success']
        );
        await db.query('UPDATE bookings SET status = "confirmed" WHERE id = ?', [booking_id]);

        // Send ticket email
        const [details] = await db.query(`
            SELECT b.id as booking_id, b.total_amount, b.number_of_tickets, 
                   e.title as event_title, e.event_date, e.venue_name, e.city,
                   u.email as user_email
            FROM bookings b
            JOIN events e ON b.event_id = e.id
            JOIN users u ON b.user_id = u.id
            WHERE b.id = ?
        `, [booking_id]);

        if (details.length > 0) {
            const detail = details[0];
            const [seats] = await db.query('SELECT seat_number FROM event_seats WHERE booking_id = ?', [booking_id]);
            const seatNumbers = seats.map(s => s.seat_number);

            await emailService.sendTicketEmail(detail.user_email, {
                bookingId: detail.booking_id,
                eventTitle: detail.event_title,
                eventDate: detail.event_date,
                venue: detail.venue_name,
                city: detail.city,
                tickets: detail.number_of_tickets,
                totalAmount: detail.total_amount,
                seats: seatNumbers
            });
        }

        res.json({ message: 'Payment successful, booking confirmed and ticket sent!' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server Error' });
    }
};
