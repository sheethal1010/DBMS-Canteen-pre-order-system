# Campus Canteen Pre-Order System: Setup Guide

This guide provides step-by-step instructions for setting up the Campus Canteen Pre-Order System from scratch.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Installation](#installation)
   - [Setting Up XAMPP](#setting-up-xampp)
   - [Setting Up the Database](#setting-up-the-database)
   - [Configuring the Application](#configuring-the-application)
3. [Initial Configuration](#initial-configuration)
   - [Creating Admin Account](#creating-admin-account)
   - [Setting Up Canteens](#setting-up-canteens)
   - [Adding Menu Items](#adding-menu-items)
4. [Testing the System](#testing-the-system)
5. [Deployment Considerations](#deployment-considerations)
6. [Troubleshooting](#troubleshooting)

## Prerequisites

Before you begin, ensure you have the following:

- A computer with Windows, macOS, or Linux
- Administrative access to install software
- At least 2GB of free disk space
- Internet connection for downloading software and dependencies

## Installation

### Setting Up XAMPP

1. **Download XAMPP**
   - Visit the [XAMPP website](https://www.apachefriends.org/index.html)
   - Download the version appropriate for your operating system
   - XAMPP includes Apache, MySQL, PHP, and phpMyAdmin

2. **Install XAMPP**
   - Run the installer and follow the prompts
   - Select at least the following components:
     - Apache
     - MySQL
     - PHP
     - phpMyAdmin
   - Complete the installation

3. **Start XAMPP Services**
   - Open the XAMPP Control Panel
   - Start the Apache and MySQL services
   - Verify that both services are running (indicated by green status)

### Setting Up the Database

1. **Access phpMyAdmin**
   - Open your web browser
   - Navigate to `http://localhost/phpmyadmin/`
   - Log in with the default credentials (username: 'root', password: '')

2. **Create the Database**
   - Click on "New" in the left sidebar
   - Enter "CollegeCanteen" as the database name
   - Select "utf8mb4_general_ci" as the collation
   - Click "Create"

3. **Set Database Password**
   - Click on "User accounts" at the top
   - Find the 'root' user and click "Edit privileges"
   - Click on "Change password"
   - Enter "system" as the new password
   - Click "Go" to save changes

### Configuring the Application

1. **Clone or Download the Application**
   - If using Git:
     ```
     cd c:/xampp/htdocs/
     git clone [repository-url] dbms-canteen
     ```
   - If downloading manually:
     - Download the application files
     - Extract them to `c:/xampp/htdocs/dbms-canteen`

2. **Configure Database Connection**
   - Open `c:/xampp/htdocs/dbms-canteen/db_connection.php`
   - Verify the database connection parameters:
     ```php
     $servername = "localhost";
     $username = "root";
     $password = "system";
     $dbname = "CollegeCanteen";
     ```
   - Save the file if you made any changes

3. **Run Setup Scripts**
   - Open your web browser
   - Navigate to `http://localhost/dbms-canteen/fix_permissions.php`
   - This script will set up database permissions
   - Next, navigate to `http://localhost/dbms-canteen/setup_db.php`
   - This script will create the necessary tables

4. **Verify Installation**
   - Navigate to `http://localhost/dbms-canteen/direct_db_test.php`
   - This script will test the database connection and operations
   - Ensure all tests pass successfully

## Initial Configuration

### Creating Admin Account

1. **Register an Admin Account**
   - Navigate to `http://localhost/dbms-canteen/test_form.html`
   - Fill out the registration form:
     - Full Name: "System Administrator"
     - Email: "admin@example.com"
     - Phone: (optional)
     - Password: Choose a strong password
     - Account Type: "Staff"
     - Staff Code: "1234"
   - Click "Register"
   - Verify that the registration was successful

2. **Verify Admin Access**
   - Navigate to `http://localhost/dbms-canteen/hdbms/h.html`
   - Log in with the admin credentials
   - Verify that you have access to staff features

### Setting Up Canteens

1. **Access the Admin Panel**
   - Log in with your admin account
   - Navigate to the staff dashboard

2. **Add a Canteen**
   - Go to the "Canteen Management" section
   - Click "Add New Canteen"
   - Fill out the canteen details:
     - Name: e.g., "Main Campus Canteen"
     - Location: e.g., "Main Building, Ground Floor"
     - Description: Detailed description of the canteen
     - Opening Time: e.g., "08:00"
     - Closing Time: e.g., "18:00"
   - Upload a canteen image if available
   - Click "Save" to add the canteen

3. **Repeat for Additional Canteens**
   - Add more canteens if your campus has multiple locations

### Adding Menu Items

1. **Access the Menu Management**
   - Log in with your admin account
   - Navigate to the staff dashboard
   - Go to the "Menu Management" section

2. **Add Menu Categories**
   - Click "Add Category"
   - Create categories like "Breakfast", "Lunch", "Dinner", "Snacks"

3. **Add Menu Items**
   - Click "Add New Item"
   - Fill out the item details:
     - Name: e.g., "Vegetable Sandwich"
     - Description: Detailed description of the item
     - Price: e.g., "5.99"
     - Category: Select from your created categories
     - Canteen: Select the canteen that offers this item
   - Upload an image of the food item
   - Set availability status
   - Click "Save" to add the item

4. **Repeat for All Menu Items**
   - Add all the food items available in your canteens

## Testing the System

1. **Test User Registration**
   - Navigate to `http://localhost/dbms-canteen/hdbms/h.html`
   - Register a new customer account
   - Verify that you can log in with the new account

2. **Test Menu Browsing**
   - Log in with a customer account
   - Browse the menu categories
   - Verify that menu items and images load correctly

3. **Test Order Placement**
   - Add items to your cart
   - Proceed to checkout
   - Complete the order process
   - Verify that the order is recorded in the system

4. **Test Staff Features**
   - Log in with a staff account
   - Verify that you can view and manage orders
   - Test updating order status
   - Test adding/editing menu items

## Deployment Considerations

When deploying to a production environment, consider the following:

1. **Security**
   - Change default passwords
   - Implement HTTPS
   - Secure the database
   - Set proper file permissions

2. **Performance**
   - Optimize images
   - Configure caching
   - Consider a content delivery network (CDN) for images

3. **Backup**
   - Set up regular database backups
   - Back up application files
   - Test restoration procedures

4. **Monitoring**
   - Implement error logging
   - Set up performance monitoring
   - Create alerts for critical issues

## Troubleshooting

### Common Issues

1. **Database Connection Errors**
   - Verify that MySQL is running
   - Check database credentials in `db_connection.php`
   - Ensure the database exists
   - Check for proper permissions

2. **File Permission Issues**
   - Ensure the web server has read/write access to necessary directories
   - For image uploads, check permissions on the `images/` directory

3. **PHP Errors**
   - Check PHP error logs in XAMPP
   - Enable error reporting for debugging
   - Verify PHP version compatibility

4. **Image Loading Issues**
   - Check file paths
   - Verify image file permissions
   - Check for JavaScript errors in the console

### Getting Help

If you encounter issues not covered in this guide:

- Check the documentation in the `docs/` directory
- Review error logs in XAMPP
- Search for similar issues online
- Contact the system administrator or developer

---

This setup guide provides comprehensive instructions for installing and configuring the Campus Canteen Pre-Order System. Following these steps will help you get the system up and running quickly and efficiently.