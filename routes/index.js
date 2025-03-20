const express = require('express');
const router = express.Router();

// Home page
router.get('/', (req, res) => {
  res.render('index', { 
    title: 'Oil Tanker Safety Routing',
    page: 'home'
  });
});

// Dashboard
router.get('/dashboard', (req, res) => {
  res.render('dashboard', { 
    title: 'Dashboard - Oil Tanker Safety Routing',
    page: 'dashboard'
  });
});

// Route planning and comparison
router.get('/routes', (req, res) => {
  res.render('routes', { 
    title: 'Route Planning - Oil Tanker Safety Routing',
    page: 'routes'
  });
});

module.exports = router;
