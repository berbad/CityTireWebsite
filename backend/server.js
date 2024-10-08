require('dotenv').config();
const serverless = require('serverless-http');
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jwt-simple');
const mongoose = require('mongoose');
const User = require('./models/User');
const app = express();
const getSecret = require('./Secrets')

console.log("Starting server...");

let isConnected = false;


const connectToMongoDB = async () => {
  if (isConnected) return;

  try {
    const MONGODB_URI = await getSecret('MONGODB_URI')
    console.log("Connecting to MongoDB with URI:", MONGODB_URI);
    await mongoose.connect(MONGODB_URI);
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

  console.log("Login attempt with username:", username);

  try {
    console.log('Attempting to find user in MongoDB...');
    const user = await User.findOne({ username });
    console.log('User found:', user);

    if (!user) {
      console.log("User not found");
      return res.status(400).json({ message: 'User not found' });
    }

    const isValidPassword = bcrypt.compareSync(password, user.password);
    console.log('Password valid:', isValidPassword);

    if (!isValidPassword) {
      console.log("Invalid password");
      return res.status(400).json({ message: 'Invalid password' });
    }

    const payload = { id: user._id, username: user.username };
    const SECRET_KEY = await getSecret('SECRET_KEY')
    const token = jwt.encode(payload, SECRET_KEY);

    console.log('JWT Token generated:', token);

    res.json({ token });
  } catch (error) {
    console.error('Login error:', error); 
    res.status(500).json({ message: 'Login failed', error });
  }
});

app.get('/secretTest', async (req, res) => {
  await getSecret('bood')
  res.json({ message: 'Hello from the backend!' });
});

module.exports.handler = serverless(app);
