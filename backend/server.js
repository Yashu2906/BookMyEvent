const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { createServer } = require('http');
const { Server } = require('socket.io');
require('dns').setDefaultResultOrder('ipv4first');

// Load environment variables
dotenv.config();

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: (origin, callback) => {
      callback(null, true); // Allow all for socket.io for now to avoid issues, or use same logic
    },
    methods: ["GET", "POST", "PUT", "DELETE"]
  }
});

// Middleware
const allowedOrigins = [
  'http://localhost:5173',
  'https://69f08ed2846e113e941c5be0--book-myevent.netlify.app',
  'https://book-myevent.netlify.app'
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.indexOf(origin) !== -1 || origin.includes('netlify.app')) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"]
}));
app.use(express.json());

const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

// Multer Storage Configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.post('/api/upload', upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded' });
  }
  const baseUrl = process.env.BASE_URL || `http://localhost:${PORT}`;
  const imageUrl = `${baseUrl}/uploads/${req.file.filename}`;
  res.json({ imageUrl });
});

// Socket.io Connection
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);
  
  socket.on('joinEvent', (eventId) => {
    socket.join(`event_${eventId}`);
    console.log(`Socket ${socket.id} joined event_${eventId}`);
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});

// Make io accessible in routes/controllers
app.set('io', io);

// Import Routes
const authRoutes = require('./routes/auth');
const eventRoutes = require('./routes/events');
const bookingRoutes = require('./routes/bookings');
const paymentRoutes = require('./routes/payments');
const wishlistRoutes = require('./routes/wishlist');

// API Health Check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'BookMyEvent API is running' });
});

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/wishlist', wishlistRoutes);

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('SERVER ERROR:', err.stack);
  res.status(err.status || 500).json({ 
    message: err.message || 'Internal Server Error',
    error: process.env.NODE_ENV === 'development' ? err.stack : undefined 
  });
});

const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
