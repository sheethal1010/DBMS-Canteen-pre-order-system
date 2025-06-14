const { promisePool } = require('./db');
const bcrypt = require('bcrypt');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

async function updatePassword() {
  try {
    // Ask for user identifier
    rl.question('Enter user email or phone: ', async (identifier) => {
      // Find the user
      const [users] = await promisePool.query(`
        SELECT USER_ID, NAME, EMAIL, PHONE
        FROM Customers
        WHERE EMAIL = ? OR PHONE = ?
      `, [identifier, identifier]);
      
      if (users.length === 0) {
        console.log('❌ User not found');
        rl.close();
        return;
      }
      
      const user = users[0];
      console.log(`Found user: ${user.NAME} (ID: ${user.USER_ID})`);
      
      // Ask for new password
      rl.question('Enter new password: ', async (password) => {
        if (!password || password.length < 6) {
          console.log('❌ Password must be at least 6 characters');
          rl.close();
          return;
        }
        
        // Hash the password
        const saltRounds = 10;
        const passwordHash = await bcrypt.hash(password, saltRounds);
        
        // Update the password
        await promisePool.query(`
          UPDATE Customers
          SET PASSWORD_HASH = ?
          WHERE USER_ID = ?
        `, [passwordHash, user.USER_ID]);
        
        console.log(`✅ Password updated successfully for ${user.NAME}`);
        rl.close();
      });
    });
  } catch (error) {
    console.error('Error updating password:', error);
    rl.close();
  }
}

updatePassword();

// Handle readline close
rl.on('close', () => {
  process.exit();
});