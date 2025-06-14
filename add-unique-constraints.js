const { promisePool } = require('./db');

async function addUniqueConstraints() {
  try {
    console.log('Adding unique constraints to tables...');
    
    // Add unique constraint to Customers table for email and phone
    await promisePool.query(`
      ALTER TABLE Customers
      ADD CONSTRAINT unique_email UNIQUE (EMAIL),
      ADD CONSTRAINT unique_phone UNIQUE (PHONE)
    `);
    
    console.log('✅ Added unique constraints to Customers table');
    
    // Add any other unique constraints here
    
    console.log('✅ All unique constraints added successfully');
  } catch (error) {
    console.error('Error adding unique constraints:', error);
  } finally {
    process.exit();
  }
}

addUniqueConstraints();