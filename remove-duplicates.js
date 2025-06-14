const { promisePool } = require('./db');

async function removeDuplicateUsers() {
  try {
    console.log('Checking for duplicate users...');
    
    // Find duplicate emails
    const [duplicateEmails] = await promisePool.query(`
      SELECT EMAIL, COUNT(*) as count
      FROM Customers
      WHERE EMAIL IS NOT NULL AND EMAIL != ''
      GROUP BY EMAIL
      HAVING COUNT(*) > 1
    `);
    
    console.log(`Found ${duplicateEmails.length} duplicate email addresses`);
    
    // Find duplicate phone numbers
    const [duplicatePhones] = await promisePool.query(`
      SELECT PHONE, COUNT(*) as count
      FROM Customers
      WHERE PHONE IS NOT NULL AND PHONE != ''
      GROUP BY PHONE
      HAVING COUNT(*) > 1
    `);
    
    console.log(`Found ${duplicatePhones.length} duplicate phone numbers`);
    
    // Begin transaction if there are duplicates to remove
    if (duplicateEmails.length > 0 || duplicatePhones.length > 0) {
      await promisePool.query('START TRANSACTION');
      
      // Process duplicate emails
      for (const dup of duplicateEmails) {
        console.log(`Processing duplicate email: ${dup.EMAIL}`);
        
        // Get all users with this email
        const [users] = await promisePool.query(`
          SELECT USER_ID, NAME, EMAIL, PHONE, REGISTRATION_DATE
          FROM Customers
          WHERE EMAIL = ?
          ORDER BY REGISTRATION_DATE DESC, USER_ID DESC
        `, [dup.EMAIL]);
        
        // Keep the newest record, delete the rest
        console.log(`Keeping user ID ${users[0].USER_ID} (${users[0].NAME})`);
        
        for (let i = 1; i < users.length; i++) {
          console.log(`Deleting duplicate user ID ${users[i].USER_ID} (${users[i].NAME})`);
          
          // Check if user is an employee
          const [empCheck] = await promisePool.query(`
            SELECT EMPLOYEE_ID FROM Employees WHERE USER_ID = ?
          `, [users[i].USER_ID]);
          
          // Delete from Employees table first if needed
          if (empCheck.length > 0) {
            await promisePool.query(`
              DELETE FROM Employees WHERE USER_ID = ?
            `, [users[i].USER_ID]);
            console.log(`Deleted employee record for user ID ${users[i].USER_ID}`);
          }
          
          // Delete from Customers table
          await promisePool.query(`
            DELETE FROM Customers WHERE USER_ID = ?
          `, [users[i].USER_ID]);
        }
      }
      
      // Process duplicate phone numbers
      for (const dup of duplicatePhones) {
        console.log(`Processing duplicate phone: ${dup.PHONE}`);
        
        // Get all users with this phone
        const [users] = await promisePool.query(`
          SELECT USER_ID, NAME, EMAIL, PHONE, REGISTRATION_DATE
          FROM Customers
          WHERE PHONE = ?
          ORDER BY REGISTRATION_DATE DESC, USER_ID DESC
        `, [dup.PHONE]);
        
        // Keep the newest record, delete the rest
        console.log(`Keeping user ID ${users[0].USER_ID} (${users[0].NAME})`);
        
        for (let i = 1; i < users.length; i++) {
          console.log(`Deleting duplicate user ID ${users[i].USER_ID} (${users[i].NAME})`);
          
          // Check if user is an employee
          const [empCheck] = await promisePool.query(`
            SELECT EMPLOYEE_ID FROM Employees WHERE USER_ID = ?
          `, [users[i].USER_ID]);
          
          // Delete from Employees table first if needed
          if (empCheck.length > 0) {
            await promisePool.query(`
              DELETE FROM Employees WHERE USER_ID = ?
            `, [users[i].USER_ID]);
            console.log(`Deleted employee record for user ID ${users[i].USER_ID}`);
          }
          
          // Delete from Customers table
          await promisePool.query(`
            DELETE FROM Customers WHERE USER_ID = ?
          `, [users[i].USER_ID]);
        }
      }
      
      // Commit transaction
      await promisePool.query('COMMIT');
      console.log('Duplicate removal completed successfully');
    } else {
      console.log('No duplicates found, no action needed');
    }
    
  } catch (error) {
    // Rollback transaction on error
    await promisePool.query('ROLLBACK');
    console.error('Error removing duplicates:', error);
  } finally {
    process.exit();
  }
}

removeDuplicateUsers();