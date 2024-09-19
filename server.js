const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
require('dotenv').config();

// Import the auth routes
const authRoutes = require('./routes/authRoutes');
const eventRoutes = require('./routes/eventRoutes');
const fatiguePolicyRoutes = require('./routes/fatiguePolicyRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Use the auth routes
app.use('/api', authRoutes);
app.use('/api/', eventRoutes);
app.use('/api', fatiguePolicyRoutes);

// Test route
app.get('/', (req, res) => {
  res.send('API is running...');
});

app.get('/api/test', (req, res) => {
  res.send('Direct test route is working!');
});


app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
