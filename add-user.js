const { promisePool } = require('./db');
const bcrypt = require('bcrypt');

async function addUser() {
  try {
    // User details
    const fullName = 'Test User';
    const email = 'test@example.com';
    const phone = '1234567890';
    const password = 'password123';
    const role = 'Customer';
    
    // Hash the password
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);
    
    // Insert into Customers table
    const [result] = await promisePool.query(
      'INSERT INTO Customers (NAME, EMAIL, PHONE, ROLE, PASSWORD_HASH) VALUES (?, ?, ?, ?, ?)',
      [fullName, email, phone, role, passwordHash]
    );
    
    console.log(`✅ User added successfully with ID: ${result.insertId}`);
  } catch (error) {
    console.error('Error adding user:', error);
  } finally {
    process.exit();
  }
}

addUser();