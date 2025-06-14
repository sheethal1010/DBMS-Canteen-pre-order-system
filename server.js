const express = require('express');
const path = require('path');
const helmet = require('helmet');
const bcrypt = require('bcrypt');
const fileUpload = require('express-fileupload');
const fs = require('fs');
const { promisePool } = require('./db');

const app = express();

// CORS middleware
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  next();
});

// Middleware to parse JSON bodies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// File upload middleware
app.use(fileUpload({
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max file size
  createParentPath: true // Create upload directory if it doesn't exist
}));

// Helmet with Content Security Policy
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'", "https://cdnjs.cloudflare.com", "https://cdn.jsdelivr.net", "https://www.youtube.com"],
        scriptSrc: [
          "'self'",
          "'unsafe-inline'",
          "'unsafe-eval'",
          'https://code.jquery.com',
          'https://cdnjs.cloudflare.com',
          'https://cdn.jsdelivr.net',
          'https://www.youtube.com'
        ],
        scriptSrcElem: [
          "'self'",
          "'unsafe-inline'",
          'https://code.jquery.com',
          'https://cdnjs.cloudflare.com',
          'https://cdn.jsdelivr.net',
          'https://www.youtube.com'
        ],
        styleSrc: [
          "'self'", 
          "'unsafe-inline'",
          'https://cdnjs.cloudflare.com',
          'https://cdn.jsdelivr.net'
        ],
        imgSrc: ["'self'", "data:", "http://localhost:3000", "https://localhost:3000", "https://*.ytimg.com", "https://*.iskcondesiretree.com", "https://*.immediate.co.uk", "https://*.cookwithnabeela.com", "https://*.feelgoodfoodie.net", "https://*.indianhealthyrecipes.com", "https://*.omnivorescookbook.com", "https://*", "http://*"],
        connectSrc: ["'self'", "http://localhost:3000", "https://localhost:3000"],
        fontSrc: ["*", "data:"],
        objectSrc: ["'none'"],
        baseUri: ["'self'"],
        formAction: ["'self'"],
        frameAncestors: ["'self'"],
        scriptSrcAttr: ["'unsafe-inline'"], // Allow inline event handlers like onclick
        manifestSrc: ["'self'"], // Allow manifest files
      },
    },
    // Disable X-Frame-Options for now to avoid conflicts with CSP frame-ancestors
    frameguard: false
  })
);

// Serve static files from relevant folders
app.use('/js', express.static(path.join(__dirname, 'js')));
app.use('/images', express.static(path.join(__dirname, 'images')));
app.use('/favicon', express.static(path.join(__dirname, 'favicon')));
app.use('/utils', express.static(path.join(__dirname, 'utils')));
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads'))); // For uploaded files
app.use(express.static(__dirname)); // fallback for direct file requests

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'public/uploads/menu');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// API Routes
const menuRoutes = require('./api/menu');
const imageRoutes = require('./api/images');
const ordersRoutes = require('./api/orders');
const canteensRoutes = require('./api/canteens');
app.use('/api/menu', menuRoutes);
app.use('/api/images', imageRoutes);
app.use('/api/orders', ordersRoutes);
app.use('/api/canteens', canteensRoutes);

// Serve favicon.ico explicitly with proper headers
app.get('/favicon.ico', (req, res) => {
  res.set({
    'Content-Security-Policy': "default-src 'self'; img-src 'self' data: http://localhost:3000 https://* http://*;"
  });
  res.sendFile(path.join(__dirname, 'favicon', 'favicon.ico'));
});

// Route root to login.html
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'login.html'));
});

// Route for admin.html with proper CSP headers
app.get('/admin.html', (req, res) => {
  // Set appropriate CSP headers for admin page
  res.set({
    'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://code.jquery.com https://cdnjs.cloudflare.com https://cdn.jsdelivr.net; style-src 'self' 'unsafe-inline' https://cdnjs.cloudflare.com https://cdn.jsdelivr.net; img-src 'self' data: http://localhost:3000 https://* http://*; font-src 'self' https://cdnjs.cloudflare.com https://cdn.jsdelivr.net data:; connect-src 'self';"
  });
  
  // Send the admin.html file
  res.sendFile(path.join(__dirname, 'admin.html'));
});

// Route for staffs.html with proper CSP headers
app.get('/staffs.html', (req, res) => {
  // Set appropriate CSP headers for staff page
  res.set({
    'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://code.jquery.com https://cdnjs.cloudflare.com https://cdn.jsdelivr.net; style-src 'self' 'unsafe-inline' https://cdnjs.cloudflare.com https://cdn.jsdelivr.net; img-src 'self' data: http://localhost:3000 https://* http://*; font-src 'self' https://cdnjs.cloudflare.com https://cdn.jsdelivr.net data:; connect-src 'self';"
  });
  
  // Send the staffs.html file
  res.sendFile(path.join(__dirname, 'staffs.html'));
});

// API endpoint for logout
app.get('/api/logout', (req, res) => {
  // Set appropriate CSP headers for the redirect
  res.set({
    'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://code.jquery.com https://cdnjs.cloudflare.com https://cdn.jsdelivr.net; style-src 'self' 'unsafe-inline' https://cdnjs.cloudflare.com https://cdn.jsdelivr.net; img-src 'self' data: http://localhost:3000 https://* http://*; font-src 'self' https://cdnjs.cloudflare.com https://cdn.jsdelivr.net data:; connect-src 'self';"
  });
  
  // Redirect to login page
  res.redirect('/login.html');
});

// API endpoint for login
app.post('/api/login', async (req, res) => {
  const { identifier, password } = req.body;
  
  console.log('Login attempt with identifier:', identifier);
  
  try {
    // Check if the identifier is an email or phone number
    let query = `
      SELECT c.USER_ID, c.NAME, c.EMAIL, c.PHONE, c.PASSWORD_HASH, c.ROLE,
             e.ROLE as EMPLOYEE_ROLE
      FROM Customers c
      LEFT JOIN Employees e ON c.USER_ID = e.USER_ID
      WHERE c.EMAIL = ? OR c.PHONE = ?
    `;
    
    console.log('Executing query with params:', [identifier, identifier]);
    const [rows] = await promisePool.query(query, [identifier, identifier]);
    console.log('Query returned', rows.length, 'rows');
    
    if (rows.length === 0) {
      console.log('No user found with identifier:', identifier);
      return res.json({
        success: false,
        message: 'Invalid email/phone or password'
      });
    }
    
    // If multiple users found with the same phone number, prioritize exact email match
    let user = rows[0];
    if (rows.length > 1) {
      console.log(`Multiple users found for identifier: ${identifier}`);
      
      // Try to find an exact email match first
      const exactEmailMatch = rows.find(row => row.EMAIL === identifier);
      if (exactEmailMatch) {
        user = exactEmailMatch;
        console.log(`Using exact email match: ${user.EMAIL}`);
      } else {
        // Try to find an exact phone match
        const exactPhoneMatch = rows.find(row => row.PHONE === identifier);
        if (exactPhoneMatch) {
          user = exactPhoneMatch;
          console.log(`Using exact phone match: ${user.PHONE}`);
        }
      }
    }
    
    // Verify password
    let passwordMatch = false;
    
    console.log(`Attempting login for user: ${user.NAME} (${user.EMAIL || user.PHONE})`);
    console.log(`User ID: ${user.USER_ID}, Role: ${user.ROLE}, Employee Role: ${user.EMPLOYEE_ROLE || 'None'}`);
    
    // Check if password hash exists
    if (!user.PASSWORD_HASH) {
      console.error('User has no password hash stored!');
      return res.json({
        success: false,
        message: 'Account error: No password set. Please contact support.'
      });
    }
    
    console.log(`Password hash type: ${user.PASSWORD_HASH.startsWith('$2') ? 'bcrypt' : 'plain text'}`);
    console.log(`Password hash length: ${user.PASSWORD_HASH.length}`);
    
    try {
      // Check if the password is a bcrypt hash (starts with $2b$ or $2a$)
      if (user.PASSWORD_HASH.startsWith('$2')) {
        // Use bcrypt to compare
        console.log('Using bcrypt comparison');
        passwordMatch = await bcrypt.compare(password, user.PASSWORD_HASH);
        console.log(`bcrypt comparison result: ${passwordMatch}`);
      } else {
        // For legacy passwords (plain text)
        console.log('Using plain text comparison');
        passwordMatch = (password === user.PASSWORD_HASH);
        console.log(`Plain text comparison result: ${passwordMatch}`);
        console.log(`Input password length: ${password.length}, Stored password length: ${user.PASSWORD_HASH.length}`);
        
        // Optionally upgrade the password to bcrypt hash
        if (passwordMatch) {
          try {
            console.log('Upgrading plain text password to bcrypt hash');
            const saltRounds = 10;
            const passwordHash = await bcrypt.hash(password, saltRounds);
            await promisePool.query(
              'UPDATE Customers SET PASSWORD_HASH = ? WHERE USER_ID = ?',
              [passwordHash, user.USER_ID]
            );
            console.log(`Upgraded password hash for user ${user.USER_ID}`);
          } catch (error) {
            console.error('Error upgrading password:', error);
          }
        }
      }
    } catch (error) {
      console.error('Error verifying password:', error);
      console.error('Error details:', error.message);
      console.error('Error stack:', error.stack);
      // If there's an error in password verification, default to not matching
      passwordMatch = false;
    }
    
    if (!passwordMatch) {
      return res.json({
        success: false,
        message: 'Invalid email/phone or password'
      });
    }
    
    // Determine account type
    let accountType = 'customer';
    if (user.EMPLOYEE_ROLE === 'Admin') {
      accountType = 'admin';
    } else if (user.EMPLOYEE_ROLE === 'KitchenStaff') {
      accountType = 'staff';
    }
    
    // Successful login
    console.log(`Login successful for ${user.NAME}, account type: ${accountType}`);
    
    res.json({
      success: true,
      message: 'Login successful',
      user: {
        id: user.USER_ID,
        name: user.NAME,
        email: user.EMAIL,
        phone: user.PHONE,
        accountType: accountType,
        role: user.ROLE
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred during login'
    });
  }
});

// API endpoint for registration
app.post('/api/register', async (req, res) => {
  const { fullName, email, phone, password, accountType, staffCode, adminCode } = req.body;
  
  try {
    // Define the transaction function that will be executed in a controlled manner
    const executeTransaction = async () => {
      // Set transaction isolation level to SERIALIZABLE to prevent race conditions
      await promisePool.query('SET TRANSACTION ISOLATION LEVEL SERIALIZABLE');
      
      // Begin transaction
      await promisePool.query('START TRANSACTION');
      
      try {
        // Perform a final check for duplicates inside the transaction to prevent race conditions
        let finalCheckQuery;
        let finalCheckParams = [];
        
        if (email && phone) {
          finalCheckQuery = `SELECT USER_ID FROM Customers WHERE (EMAIL = ? AND EMAIL IS NOT NULL) OR (PHONE = ? AND PHONE IS NOT NULL) FOR UPDATE`;
          finalCheckParams.push(email, phone);
        } else if (email) {
          finalCheckQuery = `SELECT USER_ID FROM Customers WHERE EMAIL = ? AND EMAIL IS NOT NULL FOR UPDATE`;
          finalCheckParams.push(email);
        } else if (phone) {
          finalCheckQuery = `SELECT USER_ID FROM Customers WHERE PHONE = ? AND PHONE IS NOT NULL FOR UPDATE`;
          finalCheckParams.push(phone);
        }
        
        const [finalCheck] = await promisePool.query(finalCheckQuery, finalCheckParams);
        
        if (finalCheck.length > 0) {
          // Found duplicate inside transaction, roll back and return error
          await promisePool.query('ROLLBACK');
          throw new Error('Duplicate user found during transaction');
        }
        
        // The Customers table ROLE field only accepts 'Customer' value based on the schema
        const customerRole = 'Customer'; // This is the only valid value for the ROLE field
        
        // Insert into Customers table
        const insertCustomerQuery = `
          INSERT INTO Customers (NAME, EMAIL, PHONE, ROLE, PASSWORD_HASH)
          VALUES (?, ?, ?, ?, ?)
        `;
        
        const [customerResult] = await promisePool.query(
          insertCustomerQuery,
          [fullName, email || null, phone || null, customerRole, passwordHash]
        );
        
        const userId = customerResult.insertId;
        
        // Log successful customer insertion
        console.log(`Successfully inserted customer with ID ${userId}`);
        
        // If staff or admin, insert into Employees table
        if (accountType === 'staff' || accountType === 'admin') {
          const role = accountType === 'admin' ? 'Admin' : 'KitchenStaff';
          const salary = accountType === 'admin' ? 50000.00 : 30000.00;
          const shiftTimings = '9:00 AM - 5:00 PM';
          
          const insertEmployeeQuery = `
            INSERT INTO Employees (USER_ID, NAME, ROLE, SALARY, SHIFT_TIMINGS)
            VALUES (?, ?, ?, ?, ?)
          `;
          
          console.log('Inserting employee record:', {
            userId,
            name: fullName,
            role,
            salary,
            shiftTimings
          });
          
          // Insert employee record within the same transaction
          const [employeeResult] = await promisePool.query(
            insertEmployeeQuery,
            [userId, fullName, role, salary, shiftTimings]
          );
          
          console.log('Employee record inserted successfully:', employeeResult);
        }
        
        // Commit transaction
        await promisePool.query('COMMIT');
        
        // Return the user ID for use outside the transaction
        return userId;
        
      } catch (innerError) {
        // If any error occurs during the transaction, roll back and re-throw
        console.error('Error during transaction:', innerError);
        await promisePool.query('ROLLBACK');
        throw innerError;
      }
    };
  
    // Validate required fields
    if (!fullName || !password || (!email && !phone)) {
      return res.json({
        success: false,
        message: 'Please provide name, password, and either email or phone'
      });
    }
    
    // Validate staff code if account type is staff
    if (accountType === 'staff' && staffCode !== '1234') {
      return res.json({
        success: false,
        message: 'Invalid staff verification code'
      });
    }
    
    // Validate admin code if account type is admin
    if (accountType === 'admin' && adminCode !== '6789') {
      return res.json({
        success: false,
        message: 'Invalid admin verification code'
      });
    }
    
    // Check if email or phone already exists (with more robust checking)
    let checkQuery;
    let checkParams = [];
    
    // Prepare base query to check for duplicates
    if (email && phone) {
      // If both email and phone are provided, check for either match
      checkQuery = `
        SELECT USER_ID, EMAIL, PHONE FROM Customers 
        WHERE (EMAIL = ? AND EMAIL IS NOT NULL) 
        OR (PHONE = ? AND PHONE IS NOT NULL)
      `;
      checkParams.push(email, phone);
    } else if (email) {
      // If only email is provided
      checkQuery = `
        SELECT USER_ID, EMAIL, PHONE FROM Customers 
        WHERE EMAIL = ? AND EMAIL IS NOT NULL
      `;
      checkParams.push(email);
    } else if (phone) {
      // If only phone is provided
      checkQuery = `
        SELECT USER_ID, EMAIL, PHONE FROM Customers 
        WHERE PHONE = ? AND PHONE IS NOT NULL
      `;
      checkParams.push(phone);
    }
    
    console.log('Checking for existing user with query:', checkQuery);
    console.log('Parameters:', checkParams);
    
    // Execute duplicate check query with explicit locking to prevent race conditions
    const [existingUsers] = await promisePool.query(checkQuery, checkParams);
    
    // Log the results for debugging
    console.log(`Found ${existingUsers.length} potential duplicate users:`, existingUsers);
    
    // Check for duplicates and provide specific error messages
    if (existingUsers.length > 0) {
      let duplicateMsg = 'A user with this ';
      let duplicateField = '';
      
      // Check for specific duplicate (email or phone)
      const emailDuplicate = existingUsers.some(user => user.EMAIL === email);
      const phoneDuplicate = existingUsers.some(user => user.PHONE === phone);
      
      if (emailDuplicate && phoneDuplicate) {
        duplicateField = 'email address and phone number';
      } else if (emailDuplicate) {
        duplicateField = 'email address';
      } else if (phoneDuplicate) {
        duplicateField = 'phone number';
      } else {
        duplicateField = 'information';
      }
      
      duplicateMsg += duplicateField + ' already exists';
      console.log('Duplicate detected:', duplicateMsg);
      
      return res.json({
        success: false,
        message: duplicateMsg
      });
    }
    
    // If we get here, neither email nor phone exists in the database
    
    // Hash the password
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);
    
    // Execute the transaction and get the user ID
    const userId = await executeTransaction();
    
    // Verify the user and employee records were created after the transaction
    console.log('Verifying user and employee records...');
    
    // Check customer record
    const [customerRecord] = await promisePool.query(
      'SELECT * FROM Customers WHERE USER_ID = ?',
      [userId]
    );
    
    if (!customerRecord || customerRecord.length === 0) {
      console.error('Customer record not found after successful transaction');
      return res.status(500).json({
        success: false,
        message: 'Registration failed: Unable to verify user record'
      });
    }
    
    console.log('Customer record:', customerRecord[0]);
    
    // Check employee record if applicable
    let employeeRecord = null;
    if (accountType === 'staff' || accountType === 'admin') {
      const [records] = await promisePool.query(
        `SELECT e.*, c.NAME 
         FROM Employees e
         JOIN Customers c ON e.USER_ID = c.USER_ID
         WHERE e.USER_ID = ?`,
        [userId]
      );
      
      if (records && records.length > 0) {
        employeeRecord = records[0];
        console.log('Employee record with name:', employeeRecord);
      } else {
        console.warn('Employee record not found after successful transaction');
      }
    }
    
    // Return success with verified information
    res.json({
      success: true,
      message: 'Registration successful!',
      user: {
        id: userId,
        name: fullName,
        email: email || null,
        phone: phone || null,
        accountType: accountType
      }
    });
  } catch (error) {
    // Rollback transaction in case of error
    try {
      await promisePool.query('ROLLBACK');
      console.log('Transaction rolled back due to error');
    } catch (rollbackError) {
      console.error('Error during rollback:', rollbackError);
    }
    
    console.error('Registration error:', error);
    
    // Provide more specific error messages based on the error type
    if (error.code === 'ER_DUP_ENTRY') {
      // Extract the duplicate field from the error message
      const errorMsg = error.message;
      let fieldName = 'value';
      
      if (errorMsg.includes('unique_email')) {
        fieldName = 'email address';
      } else if (errorMsg.includes('unique_phone')) {
        fieldName = 'phone number';
      }
      
      res.status(400).json({
        success: false,
        message: `Registration failed: This ${fieldName} is already in use. Please try a different one.`
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'An error occurred during registration. Please try again later.',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
});

// API endpoint for getting hero images
app.get('/api/images/hero', async (req, res) => {
  try {
    const [rows] = await promisePool.query(
      'SELECT id, image_path as path, alt_text as alt FROM images WHERE category = "hero"'
    );
    
    // If no images found in database, use static images
    if (rows.length === 0) {
      const staticImages = [
        {
          id: 1,
          path: 'images/hero/hero_slide1.jpg',
          alt: 'Delicious Food',
          title: 'Welcome to Campus Canteen',
          description: 'Pre-order your favorite meals and skip the queue!'
        },
        {
          id: 2,
          path: 'images/hero/hero_slide2.png',
          alt: 'Campus Food',
          title: 'Fresh & Tasty Food',
          description: 'Enjoy a variety of delicious meals prepared daily'
        },
        {
          id: 3,
          path: 'images/hero/hero_slide3.jpg',
          alt: 'Fresh Food',
          title: 'Quick & Easy Ordering',
          description: 'Order ahead and pick up when ready'
        }
      ];
      
      return res.json({
        success: true,
        images: staticImages
      });
    }
    
    const images = rows.map(row => ({
      id: row.id,
      path: row.path,
      alt: row.alt,
      title: 'Welcome to College Canteen',
      description: 'Order delicious food from our canteen'
    }));
    
    res.json({
      success: true,
      images: images
    });
  } catch (error) {
    console.error('Error fetching hero images:', error);
    
    // Return static images on error
    const staticImages = [
      {
        id: 1,
        path: 'images/hero/hero_slide1.jpg',
        alt: 'Delicious Food',
        title: 'Welcome to Campus Canteen',
        description: 'Pre-order your favorite meals and skip the queue!'
      },
      {
        id: 2,
        path: 'images/hero/hero_slide2.png',
        alt: 'Campus Food',
        title: 'Fresh & Tasty Food',
        description: 'Enjoy a variety of delicious meals prepared daily'
      },
      {
        id: 3,
        path: 'images/hero/hero_slide3.jpg',
        alt: 'Fresh Food',
        title: 'Quick & Easy Ordering',
        description: 'Order ahead and pick up when ready'
      }
    ];
    
    res.json({
      success: true,
      images: staticImages
    });
  }
});

// API endpoint for getting about carousel images
app.get('/api/images/carousel', async (req, res) => {
  try {
    const [rows] = await promisePool.query(
      'SELECT id, image_path as src, alt_text as alt, item_id FROM images WHERE category = "carousel"'
    );
    
    // If no images found in database, use static images
    if (rows.length === 0) {
      const staticImages = [
        {
          id: 1,
          src: "images/carousel/abt_1.jpg",
          alt: "food1",
          item_id: "slide1"
        },
        {
          id: 2,
          src: "images/carousel/abt_2.jpg",
          alt: "food2",
          item_id: "slide2"
        },
        {
          id: 3,
          src: "images/carousel/abt_3.jpg",
          alt: "food3",
          item_id: "slide3"
        }
      ];
      
      return res.json({
        success: true,
        images: staticImages
      });
    }
    
    res.json({
      success: true,
      images: rows
    });
  } catch (error) {
    console.error('Error fetching carousel images:', error);
    
    // Return static images on error
    const staticImages = [
      {
        id: 1,
        src: "images/carousel/abt_1.jpg",
        alt: "food1",
        item_id: "slide1"
      },
      {
        id: 2,
        src: "images/carousel/abt_2.jpg",
        alt: "food2",
        item_id: "slide2"
      },
      {
        id: 3,
        src: "images/carousel/abt_3.jpg",
        alt: "food3",
        item_id: "slide3"
      }
    ];
    
    res.json({
      success: true,
      images: staticImages
    });
  }
});

// API endpoint for saving carousel images
app.post('/api/images/carousel', async (req, res) => {
  try {
    // Get the images from the request body
    const { images } = req.body;
    
    if (!images || !Array.isArray(images)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid request format. Expected an array of images.'
      });
    }
    
    // Begin a transaction
    const connection = await promisePool.getConnection();
    await connection.beginTransaction();
    
    try {
      // Delete all existing carousel images
      await connection.query('DELETE FROM images WHERE category = "carousel"');
      
      // Insert the new images
      for (const image of images) {
        const itemId = image.item_id || `slide${Math.floor(Math.random() * 10000)}`;
        await connection.query(
          'INSERT INTO images (category, item_id, image_path, alt_text) VALUES (?, ?, ?, ?)',
          ['carousel', itemId, image.src, image.alt]
        );
      }
      
      // Commit the transaction
      await connection.commit();
      connection.release();
      
      res.json({
        success: true,
        message: 'Carousel images updated successfully'
      });
    } catch (error) {
      // Rollback the transaction on error
      await connection.rollback();
      connection.release();
      throw error;
    }
  } catch (error) {
    console.error('Error saving carousel images:', error);
    res.status(500).json({
      success: false,
      message: 'Error saving carousel images'
    });
  }
});

// API endpoint for getting menu items
app.get('/api/menu', async (req, res) => {
  try {
    const [rows] = await promisePool.query(`
      SELECT m.ITEM_ID as id, m.ITEM_NAME as name, m.PRICE as price, 
             m.DESCRIPTION as description, m.CATEGORY as category,
             m.IMAGE_URL as image, m.AVAILABLE as available,
             c.NAME as canteen_name, c.Canteen_ID as canteen_id
      FROM Menu m
      JOIN Canteens c ON m.Canteen_ID = c.Canteen_ID
      WHERE m.AVAILABLE = TRUE
    `);
    
    res.json({
      success: true,
      items: rows
    });
  } catch (error) {
    console.error('Error fetching menu items:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred while fetching menu items'
    });
  }
});

// API endpoint for getting canteens
app.get('/api/canteens', async (req, res) => {
  try {
    const [rows] = await promisePool.query(`
      SELECT c.Canteen_ID as id, c.NAME as name, c.LOCATION as location,
             c.OPENING_HOURS as hours, i.image_path as image
      FROM Canteens c
      LEFT JOIN images i ON i.category = 'canteen' AND i.item_id = LOWER(REPLACE(c.NAME, ' ', '_'))
    `);
    
    res.json({
      success: true,
      canteens: rows
    });
  } catch (error) {
    console.error('Error fetching canteens:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred while fetching canteens'
    });
  }
});

// API endpoint for adding items to cart
app.post('/api/cart/add', async (req, res) => {
  const { itemId, userId, quantity } = req.body;
  
  try {
    // Get item details
    const [itemRows] = await promisePool.query(
      'SELECT ITEM_ID, ITEM_NAME, DESCRIPTION, PRICE FROM Menu WHERE ITEM_ID = ?',
      [itemId]
    );
    
    if (itemRows.length === 0) {
      return res.json({
        success: false,
        message: 'Item not found'
      });
    }
    
    const item = itemRows[0];
    const total = item.PRICE * quantity;
    
    // Check if item already exists in cart
    const [cartRows] = await promisePool.query(
      'SELECT * FROM Cart WHERE USER_ID = ? AND ITEM_ID = ?',
      [userId, itemId]
    );
    
    if (cartRows.length > 0) {
      // Update quantity
      await promisePool.query(
        'UPDATE Cart SET QUANTITY = QUANTITY + ?, TOTAL = PRICE * (QUANTITY + ?) WHERE USER_ID = ? AND ITEM_ID = ?',
        [quantity, quantity, userId, itemId]
      );
    } else {
      // Insert new item
      await promisePool.query(
        'INSERT INTO Cart (USER_ID, ITEM_ID, ITEM_NAME, DESCRIPTION, PRICE, QUANTITY, TOTAL) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [userId, itemId, item.ITEM_NAME, item.DESCRIPTION, item.PRICE, quantity, total]
      );
    }
    
    res.json({
      success: true,
      message: 'Item added to cart'
    });
  } catch (error) {
    console.error('Error adding item to cart:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred while adding item to cart'
    });
  }
});

// API endpoint for getting cart count
app.get('/api/cart/count', async (req, res) => {
  const { userId } = req.query;
  
  try {
    const [rows] = await promisePool.query(
      'SELECT SUM(QUANTITY) as count FROM Cart WHERE USER_ID = ?',
      [userId]
    );
    
    const count = rows[0].count || 0;
    
    res.json({
      success: true,
      count: count
    });
  } catch (error) {
    console.error('Error getting cart count:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred while getting cart count'
    });
  }
});

// Debug endpoint to check users (remove in production)
app.get('/api/debug/users', async (req, res) => {
  try {
    const [rows] = await promisePool.query(`
      SELECT USER_ID, NAME, EMAIL, PHONE, ROLE, 
             SUBSTRING(PASSWORD_HASH, 1, 10) as PASSWORD_PREVIEW,
             LENGTH(PASSWORD_HASH) as PASSWORD_LENGTH,
             REGISTRATION_DATE
      FROM Customers
      LIMIT 10
    `);
    
    res.json({
      success: true,
      users: rows
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred while fetching users'
    });
  }
});

// API endpoint for processing orders
app.post('/api/orders/create', async (req, res) => {
  console.log('Received order request:', req.body);
  const { cartItems, totalAmount, paymentMethod, pickupTime } = req.body;
  
  try {
    // Parse cart items if it's a string
    let parsedCartItems;
    try {
      parsedCartItems = typeof cartItems === 'string' ? JSON.parse(cartItems) : cartItems;
      console.log('Parsed cart items:', parsedCartItems);
    } catch (error) {
      console.error('Error parsing cart items:', error);
      return res.status(400).json({
        success: false,
        message: 'Invalid cart items format'
      });
    }
    
    if (!Array.isArray(parsedCartItems) || parsedCartItems.length === 0) {
      console.error('Cart is empty or invalid:', parsedCartItems);
      return res.status(400).json({
        success: false,
        message: 'Cart is empty or invalid'
      });
    }
    
    console.log('First cart item:', parsedCartItems[0]);
    
    // Get user ID from the first cart item
    const userId = parsedCartItems[0].userId;
    
    if (!userId) {
      console.error('User ID is missing in cart items');
      return res.status(400).json({
        success: false,
        message: 'User ID is missing'
      });
    }
    
    console.log('Processing order for user ID:', userId);
    
    // Start transaction
    console.log('Starting transaction');
    await promisePool.query('START TRANSACTION');
    
    // Create order in Orders table
    const orderDate = new Date().toISOString().slice(0, 19).replace('T', ' ');
    console.log('Order date:', orderDate);
    
    // Get the canteen ID from the first item
    console.log('Getting canteen ID for item:', parsedCartItems[0].itemId);
    let canteenResult;
    
    // Check if itemId is a string (like 'butter_naan') or a number
    if (isNaN(parseInt(parsedCartItems[0].itemId))) {
      // It's a string ID, try to find by name first
      [canteenResult] = await promisePool.query(
        'SELECT Canteen_ID FROM Menu WHERE ITEM_NAME = ?',
        [parsedCartItems[0].itemId]
      );
      
      // If not found by name, try to find by image item_id
      if (canteenResult.length === 0) {
        [canteenResult] = await promisePool.query(
          `SELECT m.Canteen_ID 
           FROM Menu m 
           JOIN images i ON i.item_id = ? 
           WHERE i.category = 'food' 
           LIMIT 1`,
          [parsedCartItems[0].itemId]
        );
      }
    } else {
      // It's a numeric ID
      [canteenResult] = await promisePool.query(
        'SELECT Canteen_ID FROM Menu WHERE ITEM_ID = ?',
        [parseInt(parsedCartItems[0].itemId)]
      );
    }
    
    console.log('Canteen query result:', canteenResult);
    
    let canteenId;
    if (canteenResult && canteenResult.length > 0) {
      canteenId = canteenResult[0].Canteen_ID;
    } else {
      // Try to get any valid canteen
      const [anyCanteen] = await promisePool.query('SELECT Canteen_ID FROM Canteens LIMIT 1');
      if (anyCanteen.length > 0) {
        canteenId = anyCanteen[0].Canteen_ID;
        console.log(`No canteen found for item, using available canteen ${canteenId}`);
      } else {
        // If no canteens exist, use 1 as a last resort
        console.log('No canteens found in database, using default canteen ID 1');
        canteenId = 1;
      }
    }
    console.log('Using canteen ID:', canteenId);
    
    // Generate a random pickup counter
    const pickupCounter = `Counter ${Math.floor(Math.random() * 5) + 1}`;
    console.log('Pickup counter:', pickupCounter);
    
    // Format pickup time if needed
    let formattedPickupTime;
    if (pickupTime) {
      // Convert time like "02:12 pm" to a proper MySQL datetime
      try {
        const today = new Date();
        const [time, period] = pickupTime.split(' ');
        let [hours, minutes] = time.split(':');
        
        // Convert to 24-hour format if PM
        if (period && period.toLowerCase() === 'pm' && hours !== '12') {
          hours = parseInt(hours) + 12;
        }
        // Handle 12 AM case
        if (period && period.toLowerCase() === 'am' && hours === '12') {
          hours = '00';
        }
        
        // Ensure hours and minutes are two digits
        hours = hours.padStart(2, '0');
        minutes = minutes.padStart(2, '0');
        
        // Format as YYYY-MM-DD HH:MM:SS
        formattedPickupTime = `${today.getFullYear()}-${(today.getMonth() + 1).toString().padStart(2, '0')}-${today.getDate().toString().padStart(2, '0')} ${hours}:${minutes}:00`;
      } catch (error) {
        console.error('Error formatting pickup time:', error);
        // Fallback to current time + 30 minutes
        const thirtyMinutesLater = new Date(Date.now() + 30 * 60000);
        formattedPickupTime = thirtyMinutesLater.toISOString().slice(0, 19).replace('T', ' ');
      }
    } else {
      // Default to current time + 30 minutes
      const thirtyMinutesLater = new Date(Date.now() + 30 * 60000);
      formattedPickupTime = thirtyMinutesLater.toISOString().slice(0, 19).replace('T', ' ');
    }
    console.log('Formatted pickup time:', formattedPickupTime);
    
    console.log('Inserting order with params:', [userId, canteenId, orderDate, formattedPickupTime, pickupCounter, totalAmount]);
    const [orderResult] = await promisePool.query(
      `INSERT INTO Orders (USER_ID, Canteen_ID, ORDER_DATE, SCHEDULED_TIME, PICKUP_COUNTER, STATUS, TOTAL_AMOUNT) 
       VALUES (?, ?, ?, ?, ?, 'Pending', ?)`,
      [userId, canteenId, orderDate, formattedPickupTime, pickupCounter, totalAmount]
    );
    
    const orderId = orderResult.insertId;
    
    // Insert order items
    for (const item of parsedCartItems) {
      const subtotal = item.price * item.quantity;
      
      // Check if itemId is a string (like 'butter_naan') or a number
      let menuItemId;
      if (isNaN(parseInt(item.itemId))) {
        // It's a string ID, need to look up the numeric ID from the Menu table
        console.log('Looking up numeric ID for item:', item.itemId);
        
        // First try to find by exact match on ITEM_NAME
        const [menuItems] = await promisePool.query(
          'SELECT ITEM_ID FROM Menu WHERE ITEM_NAME = ?',
          [item.itemId]
        );
        
        if (menuItems.length > 0) {
          menuItemId = menuItems[0].ITEM_ID;
          console.log(`Found menu item ID ${menuItemId} for ${item.itemId}`);
        } else {
          // Try to find by matching the item name in the images table
          const [imageItems] = await promisePool.query(
            'SELECT m.ITEM_ID FROM Menu m JOIN images i ON i.item_id = ? WHERE i.category = "food"',
            [item.itemId]
          );
          
          if (imageItems.length > 0) {
            menuItemId = imageItems[0].ITEM_ID;
            console.log(`Found menu item ID ${menuItemId} for image ${item.itemId}`);
          } else {
            // If still not found, try to get any valid menu item
            const [anyMenuItem] = await promisePool.query('SELECT ITEM_ID FROM Menu LIMIT 1');
            if (anyMenuItem.length > 0) {
              menuItemId = anyMenuItem[0].ITEM_ID;
              console.log(`Could not find menu item ID for ${item.itemId}, using available item ${menuItemId}`);
            } else {
              // If no menu items exist at all, use 1 as a last resort
              console.log(`No menu items found in database, using default item ID 1`);
              menuItemId = 1;
            }
          }
        }
      } else {
        // It's already a numeric ID
        menuItemId = parseInt(item.itemId);
        console.log('Using numeric item ID:', menuItemId);
      }
      
      await promisePool.query(
        `INSERT INTO OrderItems (ORDER_ID, ITEM_ID, QUANTITY, SUBTOTAL) 
         VALUES (?, ?, ?, ?)`,
        [orderId, menuItemId, item.quantity, subtotal]
      );
    }
    
    // Clear user's cart
    await promisePool.query('DELETE FROM Cart WHERE USER_ID = ?', [userId]);
    
    // Map the payment method to match the ENUM values in the database
    let dbPaymentMethod;
    if (paymentMethod.toLowerCase() === 'upi') {
      dbPaymentMethod = 'UPI';
    } else if (paymentMethod.toLowerCase() === 'card') {
      dbPaymentMethod = 'Credit Card/Debit Card';
    } else {
      dbPaymentMethod = 'Cash';
    }
    
    console.log('Creating payment record with method:', dbPaymentMethod);
    
    // Create payment record
    await promisePool.query(
      `INSERT INTO Payments (ORDER_ID, USER_ID, PAYMENT_METHOD, PAYMENT_STATUS, AMOUNT) 
       VALUES (?, ?, ?, 'Completed', ?)`,
      [orderId, userId, dbPaymentMethod, totalAmount]
    );
    
    // Commit transaction
    await promisePool.query('COMMIT');
    
    // Return success response
    res.json({
      success: true,
      message: 'Order placed successfully',
      orderId: orderId
    });
  } catch (error) {
    // Rollback transaction in case of error
    console.error('Error occurred, rolling back transaction');
    try {
      await promisePool.query('ROLLBACK');
    } catch (rollbackError) {
      console.error('Error during rollback:', rollbackError);
    }
    
    console.error('Error creating order:', error);
    console.error('Error stack:', error.stack);
    
    // Check if it's a database error
    if (error.code && error.sqlMessage) {
      console.error('SQL Error:', error.code, error.sqlMessage);
      
      // Send more specific error message for database errors
      res.status(500).json({
        success: false,
        message: `Database error: ${error.code} - ${error.sqlMessage}`
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'An error occurred while processing your order'
      });
    }
  }
});

// Catch-all route for 404 errors with proper CSP headers
app.use((req, res, next) => {
  res.status(404);
  res.set({
    'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://code.jquery.com https://cdnjs.cloudflare.com https://cdn.jsdelivr.net; style-src 'self' 'unsafe-inline' https://cdnjs.cloudflare.com https://cdn.jsdelivr.net; img-src 'self' data: http://localhost:3000 https://* http://*; font-src 'self' https://cdnjs.cloudflare.com https://cdn.jsdelivr.net data:; connect-src 'self' http://localhost:3000;"
  });
  
  // Check if the request accepts HTML
  if (req.accepts('html')) {
    res.sendFile(path.join(__dirname, 'login.html'));
    return;
  }
  
  // If JSON is requested, send JSON response
  if (req.accepts('json')) {
    res.json({ error: 'Not found' });
    return;
  }
  
  // Plain text fallback
  res.type('txt').send('Not found');
});

// Start the server
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});
