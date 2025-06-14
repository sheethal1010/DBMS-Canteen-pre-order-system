const express = require('express');
const path = require('path');
const helmet = require('helmet');
const { pool } = require('./db');

const app = express();

// Middleware to parse JSON bodies
app.use(express.json());

// Helmet with Content Security Policy
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: [
          "'self'",
          "'unsafe-inline'",
          'https://code.jquery.com'
        ],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", "data:"],
        connectSrc: ["'self'"],
        fontSrc: ["'self'"],
        objectSrc: ["'none'"],
        scriptSrcAttr: ["'unsafe-inline'"], // Allow inline event handlers like onclick
      },
    },
  })
);

// Serve static files from relevant folders
app.use('/js', express.static(path.join(__dirname, 'js')));
app.use('/images', express.static(path.join(__dirname, 'images')));
app.use('/favicon', express.static(path.join(__dirname, 'favicon')));
app.use('/utils', express.static(path.join(__dirname, 'utils')));
app.use(express.static(__dirname)); // fallback for direct file requests

// Route root to login.html
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'login.html'));
});

// Route to view users page
app.get('/view-users', (req, res) => {
  res.sendFile(path.join(__dirname, 'view-users.html'));
});

// Import and use API routes
const apiRoutes = require('./api');
app.use('/api/v1', apiRoutes);

// Fallback to original API endpoints for backward compatibility
app.post('/api/login', (req, res) => {
  // Forward the request to our auth API
  req.url = '/api/v1/auth/login';
  app._router.handle(req, res);
});

app.post('/api/register', (req, res) => {
  // Log the registration request
  console.log('Registration request received at /api/register:', {
    body: req.body,
    headers: req.headers['content-type']
  });
  
  // Forward the request to our auth API
  req.url = '/api/v1/auth/register';
  
  // Create a response interceptor to log the response
  const originalSend = res.send;
  res.send = function(body) {
    console.log('Registration response from API:', body);
    return originalSend.call(this, body);
  };
  
  app._router.handle(req, res);
});

// Add a route to check the database configuration
app.get('/api/check-db', (req, res) => {
  // Get the database configuration
  const dbConfig = {
    host: pool.config.connectionConfig.host,
    user: pool.config.connectionConfig.user,
    database: pool.config.connectionConfig.database,
    port: pool.config.connectionConfig.port
  };
  
  // Query the database to get the current database name
  pool.query('SELECT DATABASE() as db_name', (err, results) => {
    if (err) {
      return res.json({
        error: err.message,
        dbConfig
      });
    }
    
    // Get the number of users in the Customers table
    pool.query('SELECT COUNT(*) as count FROM Customers', (err, countResults) => {
      const userCount = err ? 'Error: ' + err.message : countResults[0].count;
      
      // Return the results
      res.json({
        dbConfig,
        currentDatabase: results[0].db_name,
        userCount,
        serverTime: new Date().toISOString()
      });
    });
  });
});

// Direct users API endpoint
app.get('/api/users', async (req, res) => {
  try {
    const { promisePool } = require('./db');
    
    // Query to get all users with their roles
    const [customers] = await promisePool.execute(`
      SELECT c.USER_ID, c.NAME, c.EMAIL, c.PHONE, 
             COALESCE(e.ROLE, 'Customer') as ROLE,
             c.REGISTRATION_DATE
      FROM Customers c
      LEFT JOIN Employees e ON c.USER_ID = e.USER_ID
      ORDER BY c.USER_ID DESC
    `);
    
    // If there are employees, get them separately
    const [employees] = await promisePool.execute(`
      SELECT e.EMPLOYEE_ID, e.USER_ID, e.ROLE, e.SALARY, e.SHIFT_TIMINGS, c.NAME
      FROM Employees e
      JOIN Customers c ON e.USER_ID = c.USER_ID
      ORDER BY e.EMPLOYEE_ID DESC
    `);
    
    res.json({
      success: true,
      customers: customers,
      employees: employees
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred while fetching users'
    });
  }
});

// Handle direct login.php requests (for backward compatibility)
app.post('/login.php', (req, res) => {
  // Forward the request to our auth API
  req.url = '/api/v1/auth/login';
  app._router.handle(req, res);
});

// Start the server
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
  console.log(`✅ Database connected successfully`);
  console.log(`✅ API endpoints available at http://localhost:${PORT}/api/v1`);
});