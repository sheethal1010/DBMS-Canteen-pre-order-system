const { promisePool } = require('./db');

async function findUsersTables() {
  try {
    console.log('Searching for user-related tables in the database...');
    
    // Get all tables in the database
    const [tables] = await promisePool.query(`
      SELECT TABLE_NAME 
      FROM information_schema.TABLES 
      WHERE TABLE_SCHEMA = 'CollegeCanteen'
    `);
    
    console.log(`Found ${tables.length} tables in the database:`);
    tables.forEach(table => {
      console.log(`- ${table.TABLE_NAME}`);
    });
    
    // Look for tables that might contain user information
    const userRelatedTables = tables.filter(table => {
      const tableName = table.TABLE_NAME.toLowerCase();
      return (
        tableName.includes('user') || 
        tableName.includes('customer') || 
        tableName.includes('employee') || 
        tableName.includes('staff') || 
        tableName.includes('admin') || 
        tableName.includes('account') || 
        tableName.includes('auth')
      );
    });
    
    console.log(`\nFound ${userRelatedTables.length} potential user-related tables:`);
    
    // For each potential user table, show its structure
    for (const table of userRelatedTables) {
      console.log(`\nTable: ${table.TABLE_NAME}`);
      
      // Get columns
      const [columns] = await promisePool.query(`
        SHOW COLUMNS FROM ${table.TABLE_NAME}
      `);
      
      console.log('Columns:');
      columns.forEach(column => {
        console.log(`- ${column.Field}: ${column.Type} ${column.Null === 'NO' ? 'NOT NULL' : ''} ${column.Key}`);
      });
      
      // Count rows
      const [countResult] = await promisePool.query(`
        SELECT COUNT(*) as count FROM ${table.TABLE_NAME}
      `);
      
      console.log(`Total rows: ${countResult[0].count}`);
      
      // Show sample data (first 5 rows)
      if (countResult[0].count > 0) {
        const [sampleData] = await promisePool.query(`
          SELECT * FROM ${table.TABLE_NAME} LIMIT 5
        `);
        
        console.log('Sample data:');
        sampleData.forEach((row, index) => {
          console.log(`Row ${index + 1}:`, row);
        });
      }
    }
    
  } catch (error) {
    console.error('Error finding user tables:', error);
  } finally {
    process.exit();
  }
}

findUsersTables();