const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bodyParser = require('body-parser');
const { resolve } = require('path');
const User = require('./schema');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(bodyParser.json());

app.use(express.static('static'));

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(function() {
  console.log('Connected to database');
})
.catch(function(err) {
  console.error('Error connecting to database:', err.message);
});

app.get('/', function(req, res) {
  res.sendFile(resolve(__dirname, 'pages/index.html'));
});

app.post('/api/users', async function(req, res) {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        message: 'Validation error: All fields (name, email, password) are required.',
      });
    }

    const newUser = new User({
      name,
      email,
      password,
    });

    await newUser.save();

    res.status(201).json({
      message: 'User created successfully',
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        message: `Validation error: ${error.message}`,
      });
    }

    if (error.code === 11000) {
      return res.status(400).json({
        message: 'Validation error: Email already exists.',
      });
    }

    console.error('Error saving user:', error.message);
    res.status(500).json({
      message: 'Internal server error',
    });
  }
});

app.listen(PORT, function() {
  console.log(`Server is running on http://localhost:${PORT}`);
});
