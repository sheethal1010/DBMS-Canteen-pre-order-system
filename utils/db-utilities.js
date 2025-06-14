const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');
const { promisePool } = require('../db');

/**
 * Database utility functions for the College Canteen application
 * This file consolidates various database utility scripts into a single module
 */

// Database connection configuration
const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 'system',
  database: 'CollegeCanteen'
};

/**
 * Show recently registered users and employee details
 */
async function showUsers() {
  try {
    // Query to get all users with their roles
    const [customers] = await promisePool.execute(`
      SELECT c.USER_ID, c.NAME, c.EMAIL, c.PHONE, c.PASSWORD_HASH, 
             COALESCE(e.ROLE, 'Customer') as ROLE,
             c.REGISTRATION_DATE
      FROM Customers c
      LEFT JOIN Employees e ON c.USER_ID = e.USER_ID
      ORDER BY c.USER_ID DESC
      LIMIT 10
    `);
    
    console.log('\n===== RECENTLY REGISTERED USERS =====');
    customers.forEach(user => {
      console.log(`\nUser ID: ${user.USER_ID}`);
      console.log(`Name: ${user.NAME}`);
      console.log(`Email: ${user.EMAIL}`);
      console.log(`Phone: ${user.PHONE}`);
      console.log(`Role: ${user.ROLE}`);
      console.log(`Registration Date: ${user.REGISTRATION_DATE}`);
      console.log('----------------------------------------');
    });
    
    // If there are employees, show them separately
    const [employees] = await promisePool.execute(`
      SELECT e.EMPLOYEE_ID, e.USER_ID, e.ROLE, e.SALARY, e.SHIFT_TIMINGS, c.NAME
      FROM Employees e
      JOIN Customers c ON e.USER_ID = c.USER_ID
      ORDER BY e.EMPLOYEE_ID DESC
      LIMIT 10
    `);
    
    if (employees.length > 0) {
      console.log('\n===== EMPLOYEE DETAILS =====');
      employees.forEach(emp => {
        console.log(`\nEmployee ID: ${emp.EMPLOYEE_ID}`);
        console.log(`User ID: ${emp.USER_ID}`);
        console.log(`Name: ${emp.NAME}`);
        console.log(`Role: ${emp.ROLE}`);
        console.log(`Salary: ${emp.SALARY}`);
        console.log(`Shift Timings: ${emp.SHIFT_TIMINGS}`);
        console.log('----------------------------------------');
      });
    }
    
  } catch (error) {
    console.error('Error fetching users:', error);
  }
}

/**
 * List all users with detailed information
 */
async function listUsers() {
  const connection = await mysql.createConnection(dbConfig);
  
  try {
    // Get all users
    const [rows] = await connection.execute(`
      SELECT 
        c.USER_ID, 
        c.NAME, 
        c.EMAIL, 
        c.PHONE, 
        c.ROLE as CUSTOMER_ROLE,
        e.ROLE as EMPLOYEE_ROLE,
        SUBSTRING(c.PASSWORD_HASH, 1, 20) as PASSWORD_PREVIEW,
        LENGTH(c.PASSWORD_HASH) as PASSWORD_LENGTH,
        c.REGISTRATION_DATE
      FROM Customers c
      LEFT JOIN Employees e ON c.USER_ID = e.USER_ID
      ORDER BY c.USER_ID
    `);
    
    console.log('Total users:', rows.length);
    console.log('Users:');
    
    rows.forEach(user => {
      console.log(`
ID: ${user.USER_ID}
Name: ${user.NAME}
Email: ${user.EMAIL || 'N/A'}
Phone: ${user.PHONE || 'N/A'}
Role: ${user.CUSTOMER_ROLE}${user.EMPLOYEE_ROLE ? ' / ' + user.EMPLOYEE_ROLE : ''}
Password: ${user.PASSWORD_PREVIEW}... (${user.PASSWORD_LENGTH} chars)
Registration: ${user.REGISTRATION_DATE}
-----------------------------------`);
    });
  } catch (error) {
    console.error('Error listing users:', error);
  } finally {
    // Close the connection
    await connection.end();
  }
}

/**
 * Add a new user to the database
 */
async function addUser(userData = null) {
  // Default user data if none provided
  const defaultUser = {
    name: 'Test User',
    email: 'testuser@example.com',
    phone: '9876543210',
    password: '123456',
    role: 'Customer'
  };
  
  const user = userData || defaultUser;
  
  // Create a connection
  const connection = await mysql.createConnection(dbConfig);
  
  try {
    // Hash the password
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(user.password, saltRounds);
    
    // Insert the new user
    const [result] = await connection.execute(
      'INSERT INTO Customers (NAME, EMAIL, PHONE, ROLE, PASSWORD_HASH) VALUES (?, ?, ?, ?, ?)',
      [user.name, user.email, user.phone, user.role, passwordHash]
    );
    
    console.log('User added successfully');
    console.log('User ID:', result.insertId);
    
    // Verify the insert
    const [rows] = await connection.execute(
      'SELECT USER_ID, NAME, EMAIL, PHONE, PASSWORD_HASH FROM Customers WHERE EMAIL = ?',
      [user.email]
    );
    
    console.log('Added user:', rows[0]);
    return rows[0];
  } catch (error) {
    console.error('Error adding user:', error);
    throw error;
  } finally {
    // Close the connection
    await connection.end();
  }
}

/**
 * Update a user's password
 */
async function updatePassword(identifier, newPassword) {
  // Create a connection
  const connection = await mysql.createConnection(dbConfig);
  
  try {
    // Hash the password
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(newPassword, saltRounds);
    
    // Determine if identifier is email or phone
    let whereClause = '';
    if (identifier.includes('@')) {
      whereClause = 'EMAIL = ?';
    } else {
      whereClause = 'PHONE = ?';
    }
    
    // Update the user
    const [result] = await connection.execute(
      `UPDATE Customers SET PASSWORD_HASH = ? WHERE ${whereClause}`,
      [passwordHash, identifier]
    );
    
    console.log('Password updated successfully');
    console.log('Affected rows:', result.affectedRows);
    
    // Verify the update
    const [rows] = await connection.execute(
      `SELECT USER_ID, NAME, EMAIL, PHONE FROM Customers WHERE ${whereClause}`,
      [identifier]
    );
    
    console.log('Updated user:', rows[0]);
    return result.affectedRows > 0;
  } catch (error) {
    console.error('Error updating password:', error);
    throw error;
  } finally {
    // Close the connection
    await connection.end();
  }
}

/**
 * Find tables related to users in the database
 */
async function findUsersTables() {
  // Create a connection without specifying a database
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'system'
  });
  
  try {
    // Find all tables related to users
    const [results] = await connection.query(`
      SELECT table_schema, table_name 
      FROM information_schema.tables 
      WHERE table_name LIKE '%user%' OR table_name LIKE '%customer%'
    `);
    
    console.log('Tables related to users:');
    results.forEach(table => {
      console.log(`- ${table.TABLE_SCHEMA}.${table.TABLE_NAME}`);
    });
    
    return results;
  } catch (error) {
    console.error('Error finding user tables:', error);
    throw error;
  } finally {
    // Close the connection
    await connection.end();
  }
}

/**
 * Remove duplicate users from the database
 */
async function removeDuplicates() {
  // Create a connection
  const connection = await mysql.createConnection(dbConfig);
  
  try {
    console.log('Finding duplicate users...');
    
    // Find duplicate emails
    const [emailDuplicates] = await connection.query(`
      SELECT EMAIL, COUNT(*) as count, GROUP_CONCAT(USER_ID) as user_ids
      FROM Customers
      WHERE EMAIL IS NOT NULL AND EMAIL != ''
      GROUP BY EMAIL
      HAVING COUNT(*) > 1
    `);
    
    console.log(`Found ${emailDuplicates.length} duplicate email entries`);
    
    // Find duplicate phones
    const [phoneDuplicates] = await connection.query(`
      SELECT PHONE, COUNT(*) as count, GROUP_CONCAT(USER_ID) as user_ids
      FROM Customers
      WHERE PHONE IS NOT NULL AND PHONE != ''
      GROUP BY PHONE
      HAVING COUNT(*) > 1
    `);
    
    console.log(`Found ${phoneDuplicates.length} duplicate phone entries`);
    
    // Process email duplicates
    for (const dup of emailDuplicates) {
      console.log(`\nProcessing duplicate email: ${dup.EMAIL}`);
      console.log(`Found ${dup.count} users with this email: ${dup.user_ids}`);
      
      // Get the user IDs as an array
      const userIds = dup.user_ids.split(',').map(id => parseInt(id));
      
      // Keep the lowest ID (oldest record) and delete the rest
      const keepId = Math.min(...userIds);
      const deleteIds = userIds.filter(id => id !== keepId);
      
      console.log(`Keeping user ID ${keepId} and deleting IDs: ${deleteIds.join(', ')}`);
      
      // Delete the duplicate records
      if (deleteIds.length > 0) {
        const [result] = await connection.query(
          'DELETE FROM Customers WHERE USER_ID IN (?)',
          [deleteIds]
        );
        
        console.log(`Deleted ${result.affectedRows} duplicate records`);
      }
    }
    
    // Process phone duplicates
    for (const dup of phoneDuplicates) {
      console.log(`\nProcessing duplicate phone: ${dup.PHONE}`);
      console.log(`Found ${dup.count} users with this phone: ${dup.user_ids}`);
      
      // Get the user IDs as an array
      const userIds = dup.user_ids.split(',').map(id => parseInt(id));
      
      // Keep the lowest ID (oldest record) and delete the rest
      const keepId = Math.min(...userIds);
      const deleteIds = userIds.filter(id => id !== keepId);
      
      console.log(`Keeping user ID ${keepId} and deleting IDs: ${deleteIds.join(', ')}`);
      
      // Delete the duplicate records
      if (deleteIds.length > 0) {
        const [result] = await connection.query(
          'DELETE FROM Customers WHERE USER_ID IN (?)',
          [deleteIds]
        );
        
        console.log(`Deleted ${result.affectedRows} duplicate records`);
      }
    }
    
    // Show the current users
    const [users] = await connection.query(`
      SELECT USER_ID, NAME, EMAIL, PHONE
      FROM Customers
      ORDER BY USER_ID
    `);
    
    console.log('\nCurrent users after cleanup:');
    console.table(users);
    
    return { emailDuplicatesRemoved: emailDuplicates.length, phoneDuplicatesRemoved: phoneDuplicates.length };
  } catch (error) {
    console.error('Error removing duplicates:', error);
    throw error;
  } finally {
    // Close the connection
    await connection.end();
  }
}

/**
 * Add unique constraints to the Customers table
 */
async function addUniqueConstraints() {
  // Create a connection
  const connection = await mysql.createConnection(dbConfig);
  
  try {
    console.log('Adding unique constraints to Customers table...');
    
    // First check if the constraints already exist
    const [indexes] = await connection.query(`
      SHOW INDEX FROM Customers 
      WHERE Key_name = 'unique_email' OR Key_name = 'unique_phone'
    `);
    
    if (indexes.length > 0) {
      console.log('Constraints already exist:', indexes.map(idx => idx.Key_name));
    } else {
      // Add unique constraint for email (allowing NULL values)
      await connection.query(`
        ALTER TABLE Customers 
        ADD CONSTRAINT unique_email UNIQUE (EMAIL)
      `);
      console.log('Added unique constraint for EMAIL');
      
      // Add unique constraint for phone (allowing NULL values)
      await connection.query(`
        ALTER TABLE Customers 
        ADD CONSTRAINT unique_phone UNIQUE (PHONE)
      `);
      console.log('Added unique constraint for PHONE');
    }
    
    // Show the updated table structure
    const [tableInfo] = await connection.query('SHOW CREATE TABLE Customers');
    console.log('\nUpdated table structure:');
    console.log(tableInfo[0]['Create Table']);
    
    return { constraintsAdded: indexes.length === 0 };
  } catch (error) {
    console.error('Error adding unique constraints:', error);
    throw error;
  } finally {
    // Close the connection
    await connection.end();
  }
}

/**
 * Debug registration process
 */
async function debugRegistration() {
  try {
    // Test user data
    const testUser = {
      fullName: 'Test Debug User',
      email: 'testdebug@example.com',
      phone: '9876543299',
      password: 'test123',
      accountType: 'Customer'
    };
    
    console.log('Starting registration debug process...');
    
    // Check if user already exists
    const checkQuery = `
      SELECT USER_ID FROM Customers WHERE EMAIL = ? OR PHONE = ?
    `;
    const [existingUsers] = await promisePool.execute(checkQuery, [testUser.email, testUser.phone]);
    
    if (existingUsers.length > 0) {
      console.log('User already exists:', existingUsers);
      return;
    }
    
    console.log('User does not exist, proceeding with registration...');
    
    // Start a transaction
    await promisePool.query('START TRANSACTION');
    console.log('Transaction started');
    
    // Insert new user
    const insertCustomerQuery = `
      INSERT INTO Customers (NAME, EMAIL, PHONE, ROLE, PASSWORD_HASH)
      VALUES (?, ?, ?, 'Customer', ?)
    `;
    
    console.log('Executing insert query with values:', [testUser.fullName, testUser.email, testUser.phone, testUser.password]);
    
    const [result] = await promisePool.execute(
      insertCustomerQuery, 
      [testUser.fullName, testUser.email, testUser.phone, testUser.password]
    );
    
    console.log('Insert result:', result);
    const userId = result.insertId;
    console.log('New user ID:', userId);
    
    // Commit the transaction
    await promisePool.query('COMMIT');
    console.log('Transaction committed');
    
    // Verify the user was added
    const verifyQuery = `
      SELECT * FROM Customers WHERE USER_ID = ?
    `;
    const [newUsers] = await promisePool.execute(verifyQuery, [userId]);
    console.log('Verification query result:', newUsers);
    
    console.log('Registration debug process completed successfully');
    
    return { success: true, userId };
  } catch (error) {
    console.error('Error during registration debug:', error);
    try {
      // Rollback the transaction in case of error
      await promisePool.query('ROLLBACK');
      console.log('Transaction rolled back due to error');
    } catch (rollbackError) {
      console.error('Error during rollback:', rollbackError);
    }
    return { success: false, error: error.message };
  }
}

// Export all utility functions
module.exports = {
  showUsers,
  listUsers,
  addUser,
  updatePassword,
  findUsersTables,
  removeDuplicates,
  addUniqueConstraints,
  debugRegistration
};

// Command-line interface
if (require.main === module) {
  // This file is being run directly from the command line
  const args = process.argv.slice(2);
  const command = args[0];
  
  // Execute the requested function
  switch (command) {
    case 'show-users':
      showUsers().finally(() => process.exit(0));
      break;
    case 'list-users':
      listUsers().finally(() => process.exit(0));
      break;
    case 'add-user':
      const userData = args[1] ? JSON.parse(args[1]) : null;
      addUser(userData).finally(() => process.exit(0));
      break;
    case 'update-password':
      const identifier = args[1];
      const newPassword = args[2];
      if (!identifier || !newPassword) {
        console.error('Usage: node db-utilities.js update-password <email|phone> <new-password>');
        process.exit(1);
      }
      updatePassword(identifier, newPassword).finally(() => process.exit(0));
      break;
    case 'find-users-tables':
      findUsersTables().finally(() => process.exit(0));
      break;
    case 'remove-duplicates':
      removeDuplicates().finally(() => process.exit(0));
      break;
    case 'add-unique-constraints':
      addUniqueConstraints().finally(() => process.exit(0));
      break;
    case 'debug-registration':
      debugRegistration().finally(() => process.exit(0));
      break;
    default:
      console.log(`
Available commands:
  show-users             - Show recently registered users
  list-users             - List all users with details
  add-user [userData]    - Add a new user (optional JSON user data)
  update-password <id> <pw> - Update a user's password
  find-users-tables      - Find tables related to users
  remove-duplicates      - Remove duplicate users
  add-unique-constraints - Add unique constraints to Customers table
  debug-registration     - Debug the registration process
      `);
      process.exit(0);
  }
}
