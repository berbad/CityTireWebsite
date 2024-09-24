require('dotenv').config();

const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jwt-simple');
const app = express();
const mongoose = require('mongoose');
const User = require('./models/User');  


mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('MongoDB connection error:', err));

app.use(express.json());
app.use(cors());

const SECRET_KEY = process.env.SECRET_KEY;

app.get('/api', (req, res) => {
    res.json({ message: "Hello from the backend!" });
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
        if (!user) {
            return res.status(400).json({ message: 'User not found' });
        }
        const isValidPassword = bcrypt.compareSync(password, user.password);
        if (!isValidPassword) {
            return res.status(400).json({ message: 'Invalid password' });
        }

        const payload = { id: user._id, username: user.username };
        const token = jwt.encode(payload, SECRET_KEY);

        res.json({ token });
    } catch (error) {
        res.status(500).json({ message: 'Login failed', error });
    }
});

const PORT = process.env.PORT || 5000; // Updated port to 5000
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
