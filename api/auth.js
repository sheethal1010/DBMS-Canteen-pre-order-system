const express = require('express');
const router = express.Router();
const { pool, promisePool } = require('../db');

// Login endpoint
router.post('/login', async (req, res) => {
  const { identifier, password } = req.body;
  
  try {
    // For simplicity, we're comparing plain text passwords
    // In a production environment, you should use proper password hashing
    const query = `
      SELECT c.USER_ID, c.NAME, c.EMAIL, c.PHONE, 
             COALESCE(e.ROLE, 'Customer') as ROLE
      FROM Customers c
      LEFT JOIN Employees e ON c.USER_ID = e.USER_ID
      WHERE (c.EMAIL = ? OR c.PHONE = ?) AND c.PASSWORD_HASH LIKE ?
    `;
    
    // Note: In production, never use LIKE for password comparison
    // This is just for demonstration with the sample data
    console.log('Login attempt:', { identifier, password });
    
    // For testing purposes, let's make the password check more lenient
    // First try with exact match
    let [rows] = await promisePool.execute(
      `SELECT c.USER_ID, c.NAME, c.EMAIL, c.PHONE, COALESCE(e.ROLE, 'Customer') as ROLE
       FROM Customers c
       LEFT JOIN Employees e ON c.USER_ID = e.USER_ID
       WHERE (c.EMAIL = ? OR c.PHONE = ?) AND c.PASSWORD_HASH = ?`,
      [identifier, identifier, password]
    );
    
    // If no results, try with LIKE for testing
    if (rows.length === 0) {
      [rows] = await promisePool.execute(
        `SELECT c.USER_ID, c.NAME, c.EMAIL, c.PHONE, COALESCE(e.ROLE, 'Customer') as ROLE
         FROM Customers c
         LEFT JOIN Employees e ON c.USER_ID = e.USER_ID
         WHERE (c.EMAIL = ? OR c.PHONE = ?) AND c.PASSWORD_HASH LIKE ?`,
        [identifier, identifier, `%${password}%`]
      );
    }
    
    // Special test user for development
    if (rows.length === 0 && identifier === 'test@example.com' && password === 'test123') {
      rows = [{
        USER_ID: 999,
        NAME: 'Test User',
        EMAIL: 'test@example.com',
        PHONE: '9999999999',
        ROLE: 'Customer'
      }];
    }
    
    if (rows.length > 0) {
      // User found, return success
      const user = rows[0];
      res.json({
        success: true,
        user: {
          id: user.USER_ID,
          name: user.NAME,
          email: user.EMAIL,
          phone: user.PHONE,
          accountType: user.ROLE
        }
      });
    } else {
      // No user found with those credentials
      res.json({
        success: false,
        message: 'Invalid email/phone or password'
      });
    }
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred during login'
    });
  }
});

// Registration endpoint
router.post('/register', async (req, res) => {
  const { fullName, email, phone, password, accountType, staffCode, adminCode } = req.body;
  
  // Enhanced debugging
  console.log('Registration request received:', { 
    fullName, 
    email, 
    phone, 
    passwordLength: password ? password.length : 0,
    accountType, 
    hasStaffCode: !!staffCode, 
    hasAdminCode: !!adminCode 
  });
  
  // Map frontend account types to database roles
  let dbRole = 'Customer';
  if (accountType === 'staff' || accountType === 'KitchenStaff') {
    dbRole = 'KitchenStaff';
  } else if (accountType === 'admin' || accountType === 'Admin') {
    dbRole = 'Admin';
  }
  
  // Validate staff code if account type is staff
  if ((accountType === 'staff' || accountType === 'KitchenStaff') && staffCode !== '1234') {
    console.log('Invalid staff code provided:', staffCode);
    return res.json({
      success: false,
      message: 'Invalid staff verification code'
    });
  }
  
  // Validate admin code if account type is admin
  if ((accountType === 'admin' || accountType === 'Admin') && adminCode !== '6789') {
    console.log('Invalid admin code provided:', adminCode);
    return res.json({
      success: false,
      message: 'Invalid admin verification code'
    });
  }
  
  // Log the account type for debugging
  console.log('Registration account type:', { original: accountType, mapped: dbRole });
  
  try {
    // Check if user with this email or phone already exists
    const checkQuery = `
      SELECT USER_ID FROM Customers WHERE EMAIL = ? OR PHONE = ?
    `;
    console.log('Checking for existing user with email:', email, 'or phone:', phone);
    const [existingUsers] = await promisePool.execute(checkQuery, [email, phone]);
    
    if (existingUsers.length > 0) {
      console.log('User already exists with this email or phone');
      return res.json({
        success: false,
        message: 'A user with this email or phone number already exists'
      });
    }
    
    // Start a transaction
    console.log('Starting transaction');
    await promisePool.query('START TRANSACTION');
    
    // Insert new user into the Customers table
    const insertCustomerQuery = `
      INSERT INTO Customers (NAME, EMAIL, PHONE, ROLE, PASSWORD_HASH)
      VALUES (?, ?, ?, 'Customer', ?)
    `;
    
    console.log('Executing insert query for customer');
    const [result] = await promisePool.execute(
      insertCustomerQuery, 
      [fullName, email, phone, password]
    );
    
    const userId = result.insertId;
    console.log('New user inserted with ID:', userId);
    
    // If the account type is staff or admin, insert into Employees table
    if (dbRole === 'KitchenStaff' || dbRole === 'Admin') {
      const insertEmployeeQuery = `
        INSERT INTO Employees (USER_ID, ROLE, SALARY, SHIFT_TIMINGS)
        VALUES (?, ?, ?, ?)
      `;
      
      // Default values for demonstration
      const salary = dbRole === 'Admin' ? 50000.00 : 30000.00;
      const shiftTimings = dbRole === 'Admin' ? '9:00 AM - 5:00 PM' : '8:00 AM - 4:00 PM';
      
      console.log('Inserting employee record for user ID:', userId, 'with name:', fullName);
      await promisePool.execute(
        insertEmployeeQuery,
        [userId, dbRole, salary, shiftTimings]
      );
      
      // Verify the employee record was inserted with the correct name
      const [employeeRecord] = await promisePool.execute(`
        SELECT e.*, c.NAME 
        FROM Employees e
        JOIN Customers c ON e.USER_ID = c.USER_ID
        WHERE e.USER_ID = ?
      `, [userId]);
      
      console.log('Verified employee record with name:', employeeRecord[0]);
    }
    
    // Commit the transaction
    console.log('Committing transaction');
    await promisePool.query('COMMIT');
    
    // Verify the user was inserted
    const verifyQuery = `SELECT * FROM Customers WHERE USER_ID = ?`;
    const [verifyResult] = await promisePool.execute(verifyQuery, [userId]);
    console.log('Verification query result:', verifyResult);
    
    // Return success with the new user data
    res.json({
      success: true,
      message: 'Registration successful!',
      user: {
        id: userId,
        name: fullName,
        email: email,
        phone: phone,
        accountType: dbRole
      }
    });
  } catch (error) {
    // Rollback the transaction in case of error
    await promisePool.query('ROLLBACK');
    
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred during registration'
    });
  }
});

// Get all users endpoint
router.get('/users', async (req, res) => {
  try {
    // Query to get all users with their roles
    const [customers] = await promisePool.execute(`
      SELECT c.USER_ID, c.NAME, c.EMAIL, c.PHONE, c.PASSWORD_HASH, 
             COALESCE(e.ROLE, 'Customer') as ROLE,
             c.REGISTRATION_DATE
      FROM Customers c
      LEFT JOIN Employees e ON c.USER_ID = e.USER_ID
      ORDER BY c.USER_ID DESC
    `);
    
    // If there are employees, get them separately with their names from Customers table
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

// Check session endpoint
router.get('/check-session', (req, res) => {
  try {
    // Since we're using localStorage for authentication, we'll just return a simple response
    // In a real app with sessions, you would check the session data here
    res.json({
      loggedIn: true, // Always return true since actual auth happens on client-side
      user: {
        fullName: 'User', // This will be overridden by client-side data
        accountType: 'Customer' // This will be overridden by client-side data
      }
    });
  } catch (error) {
    console.error('Error checking session:', error);
    res.status(500).json({
      loggedIn: false,
      message: 'Error checking session'
    });
  }
});

module.exports = router;
