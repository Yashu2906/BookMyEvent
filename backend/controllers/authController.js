const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db');
const emailService = require('../utils/emailService');
const { OAuth2Client } = require('google-auth-library');

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

exports.sendOTP = async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ message: 'Email is required' });

  try {
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Store in DB
    await db.query('DELETE FROM otps WHERE email = ?', [email]);
    await db.query('INSERT INTO otps (email, otp, expiry) VALUES (?, ?, ?)', [email, otp, expiry]);

    // Send email asynchronously and catch errors so it doesn't block
    emailService.sendOTPEmail(email, otp).catch(err => {
      console.error('SMTP Error (non-blocking):', err.message);
    });
    
    res.json({ message: 'OTP sent successfully', _dev_otp: otp });
  } catch (error) {
    console.error('Error in sendOTP:', error);
    res.status(500).json({ message: 'Failed to generate OTP' });
  }
};

exports.googleLogin = async (req, res) => {
  const { credential } = req.body;
  
  try {
    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    const { email, name, sub: googleId } = payload;

    // Check if user exists
    const [users] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
    let user;

    if (users.length === 0) {
      // Create new user (social login users don't have a password_hash initially or we can set a dummy)
      const [result] = await db.query(
        'INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)',
        [name, email, 'social_login_' + Date.now(), 'user']
      );
      user = { id: result.insertId, name, email, role: 'user' };
    } else {
      user = users[0];
    }

    const jwtPayload = { user: { id: user.id, role: user.role } };
    const token = jwt.sign(jwtPayload, process.env.JWT_SECRET || 'bookmyevent_secure_secret_protocol', { expiresIn: '1h' });

    res.json({ 
      token, 
      user: { id: user.id, name: user.name, email: user.email, role: user.role } 
    });
  } catch (error) {
    console.error('Google login error:', error);
    res.status(401).json({ message: 'Invalid Google Identity token' });
  }
};

exports.registerUser = async (req, res) => {
  const { name, email, password, phone, role, otp } = req.body;
  if (!name || !email || !password || !otp) {
    return res.status(400).json({ message: 'Please provide name, email, password, and OTP' });
  }

  try {
    // Verify OTP first
    const [otpRow] = await db.query('SELECT * FROM otps WHERE email = ? AND otp = ? AND expiry > NOW()', [email, otp]);
    if (otpRow.length === 0) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    const [existingUsers] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
    if (existingUsers.length > 0) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const userRole = role || 'user';
    const [result] = await db.query(
      'INSERT INTO users (name, email, password_hash, phone, role) VALUES (?, ?, ?, ?, ?)',
      [name, email, hashedPassword, phone || null, userRole]
    );

    // Delete used OTP
    await db.query('DELETE FROM otps WHERE email = ?', [email]);

    res.status(201).json({ message: 'User registered successfully', userId: result.insertId });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error during registration' });
  }
};

exports.loginUser = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: 'Please provide email and password' });
  }

  try {
    const [users] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
    if (users.length === 0) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const user = users[0];

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const payload = {
      user: {
        id: user.id,
        role: user.role
      }
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET || 'bookmyevent_secure_secret_protocol',
      { expiresIn: '1h' },
      (err, token) => {
        if (err) throw err;
        res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
      }
    );
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error during login' });
  }
};

exports.getUserProfile = async (req, res) => {
  const id = req.user.id; 

  try {
    const [users] = await db.query(`
      SELECT u.id, u.name, u.email, u.phone, u.role,
      (SELECT COUNT(*) FROM bookings WHERE user_id = u.id) as bookings_count,
      (SELECT COUNT(*) FROM wishlists WHERE user_id = u.id) as wishlist_count
      FROM users u WHERE u.id = ?`, 
      [id]
    );

    if (users.length === 0) return res.status(404).json({ message: 'User not found' });
    
    // Convert counts to numbers just in case
    const userData = {
      ...users[0],
      bookings_count: Number(users[0].bookings_count),
      wishlist_count: Number(users[0].wishlist_count)
    };
    
    res.json(userData);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.updateUserProfile = async (req, res) => {
  const id = req.user.id;
  const { name, email, phone } = req.body;

  try {
    // Check if email already taken by another user
    if (email) {
      const [existing] = await db.query('SELECT id FROM users WHERE email = ? AND id != ?', [email, id]);
      if (existing.length > 0) {
        return res.status(400).json({ message: 'Email already in use' });
      }
    }

    await db.query(
      'UPDATE users SET name = COALESCE(?, name), email = COALESCE(?, email), phone = COALESCE(?, phone) WHERE id = ?',
      [name, email, phone, id]
    );

    const [updated] = await db.query('SELECT id, name, email, phone, role FROM users WHERE id = ?', [id]);
    res.json({ message: 'Profile updated successfully', user: updated[0] });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error during profile update' });
  }
};

exports.forgotPassword = async (req, res) => {
  const { email } = req.body;
  try {
    const [users] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
    if (users.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Generate a simple numeric token for UX ease
    const token = Math.floor(100000 + Math.random() * 900000).toString();
    const expiry = new Date(Date.now() + 3600000); // 1 hour

    await db.query('UPDATE users SET reset_token = ?, reset_expiry = ? WHERE email = ?', [token, expiry, email]);

    await emailService.sendResetEmail(email, token);
    res.json({ message: 'Password reset code sent to your email.' });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ message: 'Something went wrong. Please try again later.' });
  }
};

exports.resetPassword = async (req, res) => {
  const { email, token, newPassword } = req.body;
  try {
    const [users] = await db.query('SELECT * FROM users WHERE email = ? AND reset_token = ? AND reset_expiry > NOW()', [email, token]);
    
    if (users.length === 0) {
      return res.status(400).json({ message: 'Invalid or expired token' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    await db.query('UPDATE users SET password_hash = ?, reset_token = NULL, reset_expiry = NULL WHERE email = ?', [hashedPassword, email]);

    res.json({ message: 'Password reset successful' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getAllUsers = async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Access denied' });
  }
  try {
    const [users] = await db.query('SELECT id, name, email, role FROM users');
    res.json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};
