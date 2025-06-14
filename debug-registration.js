const { promisePool } = require('./db');
const bcrypt = require('bcrypt');

async function debugRegistration() {
  try {
    console.log('Debugging registration process...');
    
    // Check if tables exist
    const [tables] = await promisePool.query(`
      SELECT TABLE_NAME 
      FROM information_schema.TABLES 
      WHERE TABLE_SCHEMA = 'CollegeCanteen'
    `);
    
    console.log('Tables in database:');
    tables.forEach(table => {
      console.log(`- ${table.TABLE_NAME}`);
    });
    
    // Check Customers table structure
    const [customersColumns] = await promisePool.query(`
      SHOW COLUMNS FROM Customers
    `);
    
    console.log('\nCustomers table structure:');
    customersColumns.forEach(column => {
      console.log(`- ${column.Field}: ${column.Type} ${column.Null === 'NO' ? 'NOT NULL' : ''} ${column.Key}`);
    });
    
    // Check Employees table structure
    const [employeesColumns] = await promisePool.query(`
      SHOW COLUMNS FROM Employees
    `);
    
    console.log('\nEmployees table structure:');
    employeesColumns.forEach(column => {
      console.log(`- ${column.Field}: ${column.Type} ${column.Null === 'NO' ? 'NOT NULL' : ''} ${column.Key}`);
    });
    
    // Test password hashing
    const testPassword = 'password123';
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(testPassword, saltRounds);
    
    console.log('\nPassword hashing test:');
    console.log(`- Original password: ${testPassword}`);
    console.log(`- Hashed password: ${passwordHash}`);
    console.log(`- Hash length: ${passwordHash.length}`);
    
    // Verify password hash
    const isMatch = await bcrypt.compare(testPassword, passwordHash);
    console.log(`- Password verification: ${isMatch ? 'Success' : 'Failed'}`);
    
    console.log('\nDebug complete!');
  } catch (error) {
    console.error('Error during debugging:', error);
  } finally {
    process.exit();
  }
}

debugRegistration();