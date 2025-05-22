# College Canteen Management System

This is a web-based College Canteen Management System that allows users to register, login, and interact with the canteen services.

## Table of Contents
- [Setup Instructions](#setup-instructions)
- [Features](#features)
- [User Guide](#user-guide)
- [File Structure](#file-structure)
- [Database Structure](#database-structure)
- [Troubleshooting](#troubleshooting)

## Setup Instructions

### Prerequisites
- XAMPP (or any other AMP stack) installed on your computer
- Web browser (Chrome, Firefox, Edge, etc.)

### Installation Steps
1. **Start XAMPP Services**
   - Start Apache and MySQL services from the XAMPP Control Panel

2. **Database Setup**
   - The application will automatically create the required database tables when you first register a user
   - If you want to manually set up the database:
     - Open phpMyAdmin (http://localhost/phpmyadmin)
     - Create a database named `CollegeCanteen` if it doesn't exist
     - Import the SQL file (if available) or let the application create tables automatically

3. **Access the Application**
   - Open your web browser and navigate to: http://localhost/dbms-canteen/hdbms/h.html
   - This will take you to the login/registration page

## Features

### User Authentication
- User registration with validation
- Secure login with password hashing
- Session management
- User roles (customer and staff)

### User Interface
- Responsive design for mobile and desktop
- Intuitive navigation
- Form validation

## User Guide

### Registration
1. Navigate to http://localhost/dbms-canteen/hdbms/h.html
2. Click on the "Register" tab
3. Fill in the required information:
   - Full Name
   - Email or Phone Number (at least one is required)
   - Password (minimum 6 characters)
   - Confirm Password
   - Account Type (Customer or Staff)
   - Staff Code (required only for staff accounts, use "1234" for testing)
4. Click "Register" button
5. Upon successful registration, you'll be redirected to the main page

### Login
1. Navigate to http://localhost/dbms-canteen/hdbms/h.html
2. Enter your email or phone number
3. Enter your password
4. Click "Login" button
5. Upon successful login, you'll be redirected to the main page

### Logout
1. Click on the logout button or navigate to logout.php
2. You'll be logged out and the session will be destroyed

## File Structure

### Main Files
- `hdbms/h.html` - Main login/registration page
- `hdbms/h.js` - JavaScript for the login/registration functionality
- `hdbms/h.css` - Styling for the login/registration page
- `Main.html` - Main application page after login

### Backend Files
- `db_connection.php` - Database connection and query execution functions
- `hdbms/register.php` - Handles user registration
- `hdbms/login.php` - Handles user login
- `hdbms/logout.php` - Handles user logout
- `hdbms/check_session.php` - Checks if a user is logged in

## Database Structure

### Users Table
- `id` - Auto-incremented user ID
- `full_name` - User's full name
- `email` - User's email address (unique, can be null if phone is provided)
- `phone` - User's phone number (unique, can be null if email is provided)
- `password` - Hashed password
- `account_type` - User role ('customer' or 'staff')
- `created_at` - Timestamp of account creation

## Troubleshooting

### Common Issues

#### Database Connection Issues
- Ensure MySQL service is running in XAMPP
- Check database credentials in `db_connection.php`
- Default credentials are:
  - Server: localhost
  - Username: root
  - Password: system
  - Database: CollegeCanteen

#### Registration/Login Issues
- Make sure you're providing valid information
- For staff registration, use staff code "1234"
- If you forget your password, you'll need to reset it in the database directly (feature not implemented yet)

#### Session Issues
- Ensure cookies are enabled in your browser
- Check if session storage is working properly

### Getting Help
If you encounter any issues not covered here, please contact the system administrator or developer.

---

## Development Notes

### Authentication Flow
1. User submits registration/login form
2. Data is validated on client-side
3. Request is sent to server
4. Server validates data and performs database operations
5. Server creates a session and returns response
6. Client stores user data in localStorage and redirects to main page

### Security Measures
- Passwords are hashed using PHP's password_hash() function
- Prepared statements are used to prevent SQL injection
- Input validation on both client and server sides
- Session management for secure authentication
