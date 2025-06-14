/**
 * Database configuration for the Canteen Management System
 * Uses environment variables for security
 */

require('dotenv').config();

module.exports = {
  db: {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'system',
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