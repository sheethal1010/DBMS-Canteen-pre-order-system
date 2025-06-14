const { promisePool } = require('./db');

async function setupImagesTable() {
  try {
    console.log('Setting up Images table...');
    
    // Check if Images table exists
    const [tables] = await promisePool.query(`
      SELECT TABLE_NAME 
      FROM information_schema.TABLES 
      WHERE TABLE_SCHEMA = 'CollegeCanteen' AND TABLE_NAME = 'Images'
    `);
    
    if (tables.length === 0) {
      // Create Images table
      await promisePool.query(`
        CREATE TABLE Images (
          IMAGE_ID INT AUTO_INCREMENT PRIMARY KEY,
          FILENAME VARCHAR(255) NOT NULL,
          ORIGINAL_NAME VARCHAR(255) NOT NULL,
          MIME_TYPE VARCHAR(100) NOT NULL,
          SIZE INT NOT NULL,
          UPLOAD_DATE TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          CATEGORY ENUM('menu', 'canteen', 'profile', 'other') DEFAULT 'other',
          RELATED_ID INT,
          DESCRIPTION TEXT
        )
      `);
      
      console.log('✅ Images table created successfully');
    } else {
      console.log('Images table already exists');
      
      // Check if we need to add any new columns
      const [columns] = await promisePool.query(`
        SHOW COLUMNS FROM Images
      `);
      
      const columnNames = columns.map(col => col.Field);
      
      if (!columnNames.includes('CATEGORY')) {
        await promisePool.query(`
          ALTER TABLE Images 
          ADD COLUMN CATEGORY ENUM('menu', 'canteen', 'profile', 'other') DEFAULT 'other'
        `);
        console.log('✅ Added CATEGORY column to Images table');
      }
      
      if (!columnNames.includes('RELATED_ID')) {
        await promisePool.query(`
          ALTER TABLE Images 
          ADD COLUMN RELATED_ID INT
        `);
        console.log('✅ Added RELATED_ID column to Images table');
      }
      
      if (!columnNames.includes('DESCRIPTION')) {
        await promisePool.query(`
          ALTER TABLE Images 
          ADD COLUMN DESCRIPTION TEXT
        `);
        console.log('✅ Added DESCRIPTION column to Images table');
      }
    }
    
    console.log('Images table setup complete!');
  } catch (error) {
    console.error('Error setting up Images table:', error);
  } finally {
    process.exit();
  }
}

setupImagesTable();