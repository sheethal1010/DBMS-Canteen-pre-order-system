const { pool, promisePool } = require('./db');

async function addCustomerNameColumn() {
  try {
    console.log('Adding CUSTOMER_NAME column to Orders table...');
    
    // Check if column already exists
    const [columns] = await promisePool.execute(`
      SHOW COLUMNS FROM Orders LIKE 'CUSTOMER_NAME'
    `);
    
    if (columns.length > 0) {
      console.log('CUSTOMER_NAME column already exists in Orders table');
    } else {
      // Add the column
      await promisePool.execute(`
        ALTER TABLE Orders ADD COLUMN CUSTOMER_NAME VARCHAR(100) AFTER USER_ID
      `);
      console.log('CUSTOMER_NAME column added to Orders table successfully');
    }
    
    console.log('Done!');
    process.exit(0);
  } catch (error) {
    console.error('Error adding column:', error);
    process.exit(1);
  }
}

addCustomerNameColumn();