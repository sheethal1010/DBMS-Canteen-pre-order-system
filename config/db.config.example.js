/**
 * Database configuration template for the Canteen Management System
 * 
 * Instructions:
 * 1. Copy this file to db.config.js
 * 2. Update the values with your actual database credentials
 * 3. Use environment variables with a .env file for security
 */

require('dotenv').config();

module.exports = {
  db: {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'your_username',
    password: process.env.DB_PASSWORD || 'your_password',
    database: process.env.DB_NAME || 'CollegeCanteen',
    waitForConnections: true,
    connectionLimit: parseInt(process.env.DB_CONNECTION_LIMIT) || 10,
    queueLimit: parseInt(process.env.DB_QUEUE_LIMIT) || 0
  },
  
  // Server configuration
  server: {
    port: process.env.PORT || 3000,
    environment: process.env.NODE_ENV || 'development'
  },
  
  // Session configuration
  session: {
    secret: process.env.SESSION_SECRET || 'change-this-secret-key'
  },
  
  // File upload configuration
  upload: {
    maxFileSize: parseInt(process.env.MAX_FILE_SIZE) || 5242880, // 5MB
    uploadPath: process.env.UPLOAD_PATH || './public/uploads'
  }
};
