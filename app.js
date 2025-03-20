const express = require('express');
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Validate API key on startup
if (!process.env.GOOGLE_MAPS_API_KEY) {
  console.error('ERROR: Google Maps API key is not set in .env file');
  process.exit(1);
}

// Initialize Express
const app = express();
const PORT = process.env.PORT || 3000;

// Add CORS headers
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Add API key validation middleware
app.use('/api', (req, res, next) => {
  if (!process.env.GOOGLE_MAPS_API_KEY) {
    return res.status(500).json({
      success: false,
      message: 'Server configuration error: Google Maps API key not found'
    });
  }
  next();
});

// Set view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Routes
const indexRoutes = require('./routes/index');
const apiRoutes = require('./routes/api');

app.use('/', indexRoutes);
app.use('/api', apiRoutes);
app.get('/check-maps-key', (req, res) => {
  res.json({
    apiKey: process.env.GOOGLE_MAPS_API_KEY ? 'Key is set' : 'No key found',
    keyLength: process.env.GOOGLE_MAPS_API_KEY ? process.env.GOOGLE_MAPS_API_KEY.length : 0
  });
});
// Add this to your main server file
app.use((req, res, next) => {
  if (!process.env.GOOGLE_MAPS_API_KEY) {
    console.error('GOOGLE_MAPS_API_KEY is not set');
  }
  next();
});
// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;
