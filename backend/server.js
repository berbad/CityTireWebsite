require('dotenv').config();
const serverless = require('serverless-http');
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jwt-simple');
const mongoose = require('mongoose');
const User = require('./models/User');
const app = express();

const SECRET_KEY = process.env.SECRET_KEY;
if (!SECRET_KEY) {
  console.error('FATAL ERROR: SECRET_KEY is not defined.');
  process.exit(1);
}
if (!process.env.MONGODB_URI) {
  console.error('FATAL ERROR: MONGODB_URI is not defined.');
  process.exit(1);
}

let isConnected = false;

const connectToMongoDB = async () => {
  if (isConnected) return;

  try {
    await mongoose.connect(process.env.MONGODB_URI);
    isConnected = true;
    console.log('Connected to MongoDB');
  } catch (err) {
    console.error('MongoDB connection error:', err);
  }
};

connectToMongoDB();

// Middleware
app.use(express.json());
app.use(cors({ origin: '*' }));
app.options('*', cors());

// Routes
app.get('/api', (req, res) => {
  res.json({ message: 'Hello from the backend!' });
});

app.post('/register', async (req, res) => {
  const { username, password } = req.body;

  try {
    const userExists = await User.findOne({ username });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const hashedPassword = bcrypt.hashSync(password, 10);
    const newUser = new User({ username, password: hashedPassword });
    await newUser.save();

    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Registration failed', error });
  }
});

app.post('/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await User.findOne({ username });

    console.log('User found:', user);

    if (!user) {
      return res.status(400).json({ message: 'User not found' });
    }

    const isValidPassword = bcrypt.compareSync(password, user.password);

    console.log('Password valid:', isValidPassword);

    if (!isValidPassword) {
      return res.status(400).json({ message: 'Invalid password' });
    }

    const payload = { id: user._id, username: user.username };
    const token = jwt.encode(payload, SECRET_KEY);

    console.log('JWT Token generated:', token);

    res.json({ token });
  } catch (error) {
    console.error('Login error:', error); // Log the error if any
    res.status(500).json({ message: 'Login failed', error });
  }
});

module.exports.handler = serverless(app);
