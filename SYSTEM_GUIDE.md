# Campus Canteen Pre-Order System: Comprehensive Guide

This guide provides a detailed explanation of how the Campus Canteen Pre-Order System works, covering both frontend and backend components.

## Table of Contents

1. [System Overview](#system-overview)
2. [Database Structure](#database-structure)
3. [Authentication System](#authentication-system)
   - [Registration Process](#registration-process)
   - [Login Process](#login-process)
   - [Session Management](#session-management)
4. [Frontend Components](#frontend-components)
   - [Login/Registration Page](#loginregistration-page)
   - [Main Application Page](#main-application-page)
5. [Backend Components](#backend-components)
   - [Database Connection](#database-connection)
   - [API Endpoints](#api-endpoints)
   - [Image Handling](#image-handling)
6. [System Flow](#system-flow)
7. [Troubleshooting](#troubleshooting)

## System Overview

The Campus Canteen Pre-Order System is a web application that allows students and staff to pre-order food from the campus canteen. The system features user authentication, menu browsing, order placement, and order tracking.

Key features include:
- User registration and login
- Role-based access (customer vs. staff)
- Menu browsing with images
- Order placement and tracking
- Admin panel for staff

## Database Structure

The system uses a MySQL database named `CollegeCanteen` with the following main tables:

### Users Table

The `users` table stores user authentication and profile information:

```sql
CREATE TABLE users (
    id INT(11) AUTO_INCREMENT PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NULL,
    phone VARCHAR(20) NULL,
    password VARCHAR(255) NOT NULL,
    account_type ENUM('customer', 'staff') NOT NULL DEFAULT 'customer',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unique_email (email),
    UNIQUE KEY unique_phone (phone)
)
```

Key points:
- `id`: Auto-incrementing unique identifier
- `full_name`: User's full name (required)
- `email`: User's email address (optional if phone is provided)
- `phone`: User's phone number (optional if email is provided)
- `password`: Hashed password using PHP's `password_hash()` function
- `account_type`: Either 'customer' or 'staff'
- `created_at`: Timestamp when the user registered

### Other Tables

The system also includes other tables for menu items, orders, and canteen information (not detailed in this guide).

## Authentication System

### Registration Process

The registration process allows new users to create an account with the following steps:

1. User fills out the registration form on the frontend (`h.html`)
2. JavaScript validates the form data:
   - Full name is required
   - Either email or phone number is required
   - Password must be at least 6 characters
   - Staff accounts require a valid staff code (1234)
3. Form data is sent to `simple_register.php` via AJAX
4. Backend validates the data again and checks for existing users
5. If validation passes, the user is added to the database
6. A success response is sent back to the frontend
7. User is automatically logged in and redirected to the main page

#### Backend Registration Flow

```
Frontend Form → JavaScript Validation → AJAX Request → simple_register.php
→ Database Validation → User Creation → Session Creation → Response to Frontend
```

### Login Process

The login process allows existing users to authenticate:

1. User enters their email or phone number and password on the login form
2. JavaScript validates that both fields are filled
3. Form data is sent to `login.php` via AJAX
4. Backend checks if the identifier (email or phone) exists in the database
5. If found, the password is verified using `password_verify()`
6. If authentication is successful, a session is created
7. User data is sent back to the frontend and stored in localStorage
8. User is redirected to the main application page

#### Backend Login Flow

```
Frontend Form → JavaScript Validation → AJAX Request → login.php
→ User Lookup → Password Verification → Session Creation → Response to Frontend
```

### Session Management

The system uses both PHP sessions and browser localStorage for session management:

- PHP sessions (`$_SESSION`) store user data on the server side
- localStorage stores user data on the client side for persistent login
- When a user logs out, both the PHP session and localStorage are cleared

## Frontend Components

### Login/Registration Page

The login/registration page (`h.html`) provides the interface for users to authenticate:

- **Login Tab**: Allows existing users to log in with email/phone and password
- **Register Tab**: Allows new users to create an account
- **Form Validation**: Client-side validation using JavaScript
- **AJAX Requests**: Asynchronous communication with the backend
- **Responsive Design**: Works on both desktop and mobile devices

#### Key JavaScript Functions

- `validateEmail()`: Validates email format
- `validatePhone()`: Validates phone number format
- `showError()` / `hideError()`: Display or hide validation errors
- Form submission handlers for login and registration

### Main Application Page

The main application page (`Main.html`) is the entry point for authenticated users:

- **Authentication Check**: Verifies if the user is logged in
- **Menu Display**: Shows available food items with images
- **Order Interface**: Allows users to place orders
- **User Profile**: Displays user information
- **Staff Interface**: Additional features for staff accounts

## Backend Components

### Database Connection

The database connection is managed through `db_connection.php`:

```php
// Database connection parameters
$servername = "localhost";
$username = "root";
$password = "system";
$dbname = "CollegeCanteen";

// Create connection
$conn = new mysqli($servername, $username, $password, $dbname);

// Check connection
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

// Set character set
$conn->set_charset("utf8mb4");
```

The system also includes a helper function `executeQuery()` for safely executing SQL queries with parameter binding.

### API Endpoints

The system provides several API endpoints for frontend-backend communication:

#### Authentication Endpoints

- `login.php`: Authenticates users and creates sessions
- `register.php`: Creates new user accounts
- `simple_register.php`: Simplified registration endpoint
- `logout.php`: Ends user sessions

#### Data Endpoints

- `get_image.php`: Retrieves images from the server
- Various other endpoints for menu items, orders, etc.

### Image Handling

The system handles images for food items and canteen information:

- Images are stored in the `images/` directory
- The `get_image.php` script serves images to the frontend
- The `upload_image.php` script allows staff to upload new images
- The `js/image-loader.js` script handles image loading and caching

## System Flow

### New User Flow

1. User visits the login/registration page (`h.html`)
2. User clicks on the "Register" tab
3. User fills out the registration form
4. System validates the form data
5. User account is created in the database
6. User is automatically logged in
7. User is redirected to the main application page (`Main.html`)
8. User can browse the menu and place orders

### Existing User Flow

1. User visits the login/registration page (`h.html`)
2. User enters their email/phone and password
3. System authenticates the user
4. User is redirected to the main application page (`Main.html`)
5. User can browse the menu and place orders

### Staff User Flow

1. Staff member logs in with their credentials and staff code
2. Staff is redirected to the main application page with staff privileges
3. Staff can manage menu items, view orders, and perform administrative tasks

## Troubleshooting

### Common Issues

1. **Database Connection Errors**
   - Ensure MySQL is running in XAMPP
   - Check database credentials in `db_connection.php`
   - Verify the database and tables exist

2. **Registration Issues**
   - Check for duplicate email or phone entries
   - Ensure password meets minimum requirements
   - Verify staff code for staff accounts

3. **Login Issues**
   - Confirm email/phone and password are correct
   - Check if the user exists in the database
   - Clear browser cache and cookies

### Debugging Tools

The system includes several debugging tools:

- `debug_log()` function writes to `debug_log.txt`
- `check_table.php` displays database table structure
- `direct_db_test.php` tests database connection and operations
- `fix_permissions.php` ensures correct database permissions

### Error Logging

Errors are logged in several locations:

- PHP errors in the XAMPP error log
- Application-specific errors in `debug_log.txt`
- JavaScript errors in the browser console

## Conclusion

The Campus Canteen Pre-Order System provides a comprehensive solution for managing food orders in a campus environment. The system's modular design allows for easy maintenance and future enhancements.