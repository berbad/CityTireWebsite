require('dotenv').config();
const serverless = require('serverless-http');
const express = require('express');
const cors = require('cors');
const { rateLimit } = require('express-rate-limit');
const bcrypt = require('bcryptjs');
const jwt = require('jwt-simple');
const mongoose = require('mongoose');
const User = require('./models/User');
const app = express();
const getSecret = require('./Secrets')

let isConnected = false;

const connectToMongoDB = async () => {
  if (isConnected) return;

  try {
    const MONGODB_URI = await getSecret('MONGODB_URI')
    await mongoose.connect(MONGODB_URI);
    isConnected = true;
  } catch (err) {
    console.error('MongoDB connection failed');
  }
};

connectToMongoDB();

// Middleware
app.use(express.json());
const allowedOrigins = (process.env.ALLOWED_ORIGINS || 'https://www.citytireshop.com')
  .split(',').map(origin => origin.trim()).filter(Boolean);
if (process.env.NODE_ENV === 'development') allowedOrigins.push('http://localhost:3000');
app.use(cors({ origin: allowedOrigins }));

// Per-instance limits reduce brute-force and password-hashing load. A shared
// edge/store limit is still needed to enforce a global limit across Lambdas.
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, limit: 20,
  standardHeaders: 'draft-8', legacyHeaders: false,
  message: { message: 'Too many login attempts. Please try again later.' }
});
const registrationLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, limit: 5,
  standardHeaders: 'draft-8', legacyHeaders: false,
  message: { message: 'Too many registration attempts. Please try again later.' }
});

// Routes
app.get('/api', (req, res) => {
  res.json({ message: 'Hello from the backend!' });
});

app.post('/register', registrationLimiter, async (req, res) => {
  const { username, password } = req.body || {};
  if (typeof username !== 'string' || !username.trim() ||
      typeof password !== 'string' || !password) {
    return res.status(400).json({ message: 'Username and password must be non-empty strings' });
  }

  try {
    const userExists = await User.findOne({ username: { $eq: username } });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const hashedPassword = bcrypt.hashSync(password, 10);
    const newUser = new User({ username, password: hashedPassword });
    await newUser.save();

    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Registration failed' });
  }
});

app.post('/login', loginLimiter, async (req, res) => {
  const { username, password } = req.body || {};
  if (typeof username !== 'string' || !username.trim() ||
      typeof password !== 'string' || !password) {
    return res.status(400).json({ message: 'Username and password must be non-empty strings' });
  }

  try {
    const user = await User.findOne({ username: { $eq: username } });

    if (!user) {
      return res.status(400).json({ message: 'User not found' });
    }

    const isValidPassword = bcrypt.compareSync(password, user.password);

    if (!isValidPassword) {
      return res.status(400).json({ message: 'Invalid password' });
    }

    const payload = { id: user._id, username: user.username };
    const SECRET_KEY = await getSecret('SECRET_KEY')
    const token = jwt.encode(payload, SECRET_KEY);

    res.json({ token });
  } catch (error) {
    console.error('Login failed');
    res.status(500).json({ message: 'Login failed' });
  }
});

app.get('/secretTest', async (req, res) => {
  await getSecret('bood')
  res.json({ message: 'Hello from the backend!' });
});

// Keep parser errors and unexpected failures from exposing request bodies or internals.
app.use((error, req, res, next) => {
  if (res.headersSent) return next(error);
  const status = error.status >= 400 && error.status < 500 ? error.status : 500;
  res.status(status).json({ message: status < 500 ? 'Invalid request' : 'Request failed' });
});

module.exports.handler = serverless(app);
