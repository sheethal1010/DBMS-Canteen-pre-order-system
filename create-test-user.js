const { promisePool } = require('./db');
const bcrypt = require('bcrypt');

async function createTestUser() {
  try {
    // User details
    const fullName = 'Test Admin';
    const email = 'admin@test.com';
    const phone = '9876543210';
    const password = 'admin123';
    const role = 'Customer'; // Default role for Customers table
    
    // Hash the password
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);
    
    // Begin transaction
    await promisePool.query('START TRANSACTION');
    
    // Insert into Customers table
    const [customerResult] = await promisePool.query(
      'INSERT INTO Customers (NAME, EMAIL, PHONE, ROLE, PASSWORD_HASH) VALUES (?, ?, ?, ?, ?)',
      [fullName, email, phone, role, passwordHash]
    );
    
    const userId = customerResult.insertId;
    
    // Insert into Employees table as Admin
    await promisePool.query(
      'INSERT INTO Employees (USER_ID, ROLE, SALARY, SHIFT_TIMINGS) VALUES (?, ?, ?, ?)',
      [userId, 'Admin', 50000, '9AM-5PM']
    );
    
    // Commit transaction
    await promisePool.query('COMMIT');
    
    console.log(`✅ Test admin user created successfully with ID: ${userId}`);
  } catch (error) {
    // Rollback transaction on error
    await promisePool.query('ROLLBACK');
    console.error('Error creating test user:', error);
  } finally {
    process.exit();
  }
}

createTestUser();