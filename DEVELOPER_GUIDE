# Campus Cravings - Developer Guide

This comprehensive guide is designed for developers who want to understand, modify, extend, or contribute to the Campus Cravings project.

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Development Environment Setup](#development-environment-setup)
3. [Project Structure Deep Dive](#project-structure-deep-dive)
4. [API Documentation](#api-documentation)
5. [Database Schema](#database-schema)
6. [Frontend Architecture](#frontend-architecture)
7. [Backend Architecture](#backend-architecture)
8. [Security Implementation](#security-implementation)
9. [File Upload System](#file-upload-system)
10. [Authentication System](#authentication-system)
11. [Development Workflow](#development-workflow)
12. [Testing Guidelines](#testing-guidelines)
13. [Deployment Strategies](#deployment-strategies)
14. [Performance Optimization](#performance-optimization)
15. [Troubleshooting](#troubleshooting)
16. [Contributing Guidelines](#contributing-guidelines)

---

## Architecture Overview

### System Architecture

Campus Cravings follows a **3-tier architecture**:

```
┌─────────────────────────────────────────────────────────┐
│                    Presentation Layer                   │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────────────┐│
│  │   HTML5     │ │    CSS3     │ │    JavaScript       ││
│  │   Pages     │ │   Styling   │ │   (Client-side)     ││
│  └─────────────┘ └─────────────┘ └─────────────────────┘│
└─────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────┐
│                   Application Layer                     │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────────────┐│
│  │   Node.js   │ │  Express.js │ │    API Routes       ││
│  │   Runtime   │ │  Framework  │ │   & Middleware      ││
│  └─────────────┘ └─────────────┘ └─────────────────────┘│
└─────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────┐
│                     Data Layer                          │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────────────┐│
│  │    MySQL    │ │ File System │ │   Session Store     ││
│  │  Database   │ │   Storage   │ │                     ││
│  └─────────────┘ └─────────────┘ └─────────────────────┘│
└─────────────────────────────────────────────────────────┘
```

### Technology Stack

**Backend Technologies:**
- **Node.js v14+**: JavaScript runtime environment
- **Express.js v5+**: Web application framework
- **MySQL v8+**: Relational database management system
- **bcrypt**: Password hashing and security
- **Helmet**: Security middleware for Express
- **Multer**: File upload handling middleware
- **dotenv**: Environment variable management

**Frontend Technologies:**
- **HTML5**: Semantic markup and structure
- **CSS3**: Modern styling with Flexbox/Grid
- **JavaScript ES6+**: Modern client-side scripting
- **Bootstrap**: Responsive UI framework
- **jQuery**: DOM manipulation and AJAX

**Development Tools:**
- **Nodemon**: Development server with auto-restart
- **Git**: Version control system
- **npm**: Package manager

---

## Development Environment Setup

### Prerequisites Verification

```bash
# Check Node.js version
node --version  # Should be v14.0.0 or higher

# Check npm version
npm --version   # Should be v6.0.0 or higher

# Check MySQL version
mysql --version # Should be v8.0 or higher

# Check Git version
git --version   # Any recent version
```

### Environment Configuration

Create a comprehensive `.env` file:

```env
# Database Configuration
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_secure_password
DB_NAME=CollegeCanteen
DB_CONNECTION_LIMIT=10
DB_QUEUE_LIMIT=0

# Server Configuration
PORT=3000
NODE_ENV=development
HOST=localhost

# Session Configuration
SESSION_SECRET=your-super-secret-session-key-minimum-32-characters-long
SESSION_MAX_AGE=86400000

# File Upload Configuration
MAX_FILE_SIZE=5242880
UPLOAD_PATH=./public/uploads
ALLOWED_FILE_TYPES=jpg,jpeg,png,gif

# Security Configuration
BCRYPT_ROUNDS=12
RATE_LIMIT_WINDOW=900000
RATE_LIMIT_MAX=100

# Logging Configuration
LOG_LEVEL=debug
LOG_FILE=./logs/app.log
```

### Development Scripts

```json
{
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js --ignore public/",
    "start:db": "node db-server.js",
    "test": "npm run test:unit && npm run test:integration",
    "test:unit": "jest --testPathPattern=tests/unit",
    "test:integration": "jest --testPathPattern=tests/integration",
    "lint": "eslint .",
    "lint:fix": "eslint . --fix",
    "db:migrate": "node scripts/migrate.js",
    "db:seed": "node scripts/seed.js",
    "db:reset": "node scripts/reset-db.js"
  }
}
```

---

## Project Structure Deep Dive

```
dbms-canteen/
├── 📁 admin/                    # Admin panel static files
│   ├── dashboard.html           # Main admin dashboard
│   ├── edit-carousel.html       # Carousel management
│   └── manage-carousel.html     # Carousel administration
├── 📁 api/                      # API route handlers
│   ├── auth.js                  # Authentication endpoints
│   ├── canteens.js             # Canteen CRUD operations
│   ├── images.js               # Image upload/management
│   ├── index.js                # API router configuration
│   ├── menu.js                 # Menu item management
│   └── orders.js               # Order processing logic
├── 📁 config/                   # Configuration files
│   ├── db.config.js            # Database configuration
│   └── db.config.example.js    # Configuration template
├── 📁 images/                   # Static image assets
│   ├── canteens/               # Canteen images
│   ├── carousel/               # Promotional banners
│   ├── food/                   # Food item images
│   └── hero/                   # Hero section images
├── 📁 js/                       # Client-side JavaScript
│   ├── auth-handler.js         # Authentication logic
│   └── image-handler.js        # Image processing utilities
├── 📁 public/                   # Public static files
│   └── uploads/                # User uploaded files
├── 📁 routes/                   # Express route definitions
├── 📁 sql/                      # SQL scripts and migrations
├── 📁 utils/                    # Utility functions
├── 📁 tests/                    # Test files (create this)
│   ├── unit/                   # Unit tests
│   ├── integration/            # Integration tests
│   └── fixtures/               # Test data
├── 📁 logs/                     # Application logs (create this)
├── 📁 docs/                     # Documentation (create this)
├── server.js                    # Main application server
├── db.js                        # Database connection setup
├── package.json                 # Project dependencies
├── college_canteen_schema.sql   # Database schema
└── .env                         # Environment variables
```

### Key Files Explained

#### `server.js` - Main Application Server
```javascript
// Core responsibilities:
// 1. Express app configuration
// 2. Middleware setup (CORS, Helmet, Body parsing)
// 3. Route mounting
// 4. Error handling
// 5. Server startup
```

#### `db.js` - Database Connection Manager
```javascript
// Core responsibilities:
// 1. MySQL connection pool management
// 2. Connection configuration
// 3. Error handling for database connections
// 4. Promise-based database interface
```

#### `api/index.js` - API Router
```javascript
// Core responsibilities:
// 1. Route organization and mounting
// 2. API versioning structure
// 3. Middleware application for API routes
// 4. Error handling for API endpoints
```

---

## API Documentation

### Authentication Endpoints

#### POST `/api/auth/register`
Register a new user account.

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securePassword123",
  "phone": "1234567890",
  "accountType": "customer"
}
```

**Response:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "accountType": "customer"
  }
}
```

#### POST `/api/auth/login`
Authenticate user and create session.

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "securePassword123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "accountType": "customer",
    "isLoggedIn": true
  }
}
```

### Canteen Management Endpoints

#### GET `/api/canteens`
Retrieve all canteens.

**Query Parameters:**
- `active` (boolean): Filter by active status
- `limit` (number): Limit results
- `offset` (number): Pagination offset

**Response:**
```json
{
  "success": true,
  "canteens": [
    {
      "id": 1,
      "name": "Main Cafeteria",
      "description": "Primary dining facility",
      "location": "Building A, Ground Floor",
      "phone": "123-456-7890",
      "email": "main@canteen.edu",
      "operatingHours": "07:00-22:00",
      "isActive": true,
      "image": "canteen1.jpg"
    }
  ]
}
```

#### POST `/api/canteens`
Create a new canteen (Admin only).

**Request Body:**
```json
{
  "name": "New Canteen",
  "description": "Description of the canteen",
  "location": "Building B, First Floor",
  "phone": "098-765-4321",
  "email": "new@canteen.edu",
  "operatingHours": "08:00-20:00"
}
```

### Menu Management Endpoints

#### GET `/api/menu`
Retrieve menu items.

**Query Parameters:**
- `canteenId` (number): Filter by canteen
- `category` (string): Filter by category
- `available` (boolean): Filter by availability
- `search` (string): Search in name/description

**Response:**
```json
{
  "success": true,
  "menuItems": [
    {
      "id": 1,
      "name": "Chicken Burger",
      "description": "Grilled chicken with fresh vegetables",
      "price": 8.99,
      "category": "Main Course",
      "canteenId": 1,
      "isAvailable": true,
      "image": "burger.jpg",
      "preparationTime": 15
    }
  ]
}
```

#### POST `/api/menu`
Add new menu item (Staff/Admin only).

**Request Body:**
```json
{
  "name": "New Item",
  "description": "Item description",
  "price": 12.99,
  "category": "Appetizer",
  "canteenId": 1,
  "preparationTime": 10,
  "ingredients": ["ingredient1", "ingredient2"],
  "allergens": ["nuts", "dairy"]
}
```

### Order Management Endpoints

#### GET `/api/orders`
Retrieve user orders.

**Query Parameters:**
- `status` (string): Filter by order status
- `limit` (number): Limit results
- `startDate` (date): Filter from date
- `endDate` (date): Filter to date

**Response:**
```json
{
  "success": true,
  "orders": [
    {
      "id": 1,
      "customerId": 1,
      "canteenId": 1,
      "status": "preparing",
      "totalAmount": 25.98,
      "orderDate": "2024-01-15T10:30:00Z",
      "pickupTime": "2024-01-15T11:00:00Z",
      "items": [
        {
          "menuItemId": 1,
          "quantity": 2,
          "price": 8.99,
          "specialInstructions": "No onions"
        }
      ]
    }
  ]
}
```

#### POST `/api/orders`
Place a new order.

**Request Body:**
```json
{
  "canteenId": 1,
  "items": [
    {
      "menuItemId": 1,
      "quantity": 2,
      "specialInstructions": "Extra spicy"
    }
  ],
  "pickupTime": "2024-01-15T12:00:00Z",
  "paymentMethod": "cash"
}
```

### Image Upload Endpoints

#### POST `/api/images/upload`
Upload images for menu items or canteens.

**Request:** Multipart form data
- `image`: File upload
- `type`: "menu" | "canteen" | "carousel"
- `entityId`: ID of related entity

**Response:**
```json
{
  "success": true,
  "message": "Image uploaded successfully",
  "filename": "uploaded_image_123456789.jpg",
  "path": "/uploads/menu/uploaded_image_123456789.jpg"
}
```

---

## Database Schema

### Core Tables

#### Customers Table
```sql
CREATE TABLE Customers (
    CustomerID INT PRIMARY KEY AUTO_INCREMENT,
    Name VARCHAR(100) NOT NULL,
    Email VARCHAR(100) UNIQUE NOT NULL,
    PasswordHash VARCHAR(255) NOT NULL,
    Phone VARCHAR(15),
    AccountType ENUM('customer', 'staff', 'admin') DEFAULT 'customer',
    IsActive BOOLEAN DEFAULT TRUE,
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UpdatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (Email),
    INDEX idx_account_type (AccountType)
);
```

#### Canteens Table
```sql
CREATE TABLE Canteens (
    CanteenID INT PRIMARY KEY AUTO_INCREMENT,
    Name VARCHAR(100) NOT NULL,
    Description TEXT,
    Location VARCHAR(200),
    Phone VARCHAR(15),
    Email VARCHAR(100),
    OperatingHours VARCHAR(50),
    IsActive BOOLEAN DEFAULT TRUE,
    Image VARCHAR(255),
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UpdatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_active (IsActive)
);
```

#### MenuItems Table
```sql
CREATE TABLE MenuItems (
    MenuItemID INT PRIMARY KEY AUTO_INCREMENT,
    CanteenID INT NOT NULL,
    Name VARCHAR(100) NOT NULL,
    Description TEXT,
    Price DECIMAL(10,2) NOT NULL,
    Category VARCHAR(50),
    IsAvailable BOOLEAN DEFAULT TRUE,
    Image VARCHAR(255),
    PreparationTime INT DEFAULT 15,
    Ingredients JSON,
    Allergens JSON,
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UpdatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (CanteenID) REFERENCES Canteens(CanteenID) ON DELETE CASCADE,
    INDEX idx_canteen (CanteenID),
    INDEX idx_category (Category),
    INDEX idx_available (IsAvailable)
);
```

#### Orders Table
```sql
CREATE TABLE Orders (
    OrderID INT PRIMARY KEY AUTO_INCREMENT,
    CustomerID INT NOT NULL,
    CanteenID INT NOT NULL,
    Status ENUM('pending', 'confirmed', 'preparing', 'ready', 'completed', 'cancelled') DEFAULT 'pending',
    TotalAmount DECIMAL(10,2) NOT NULL,
    OrderDate TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PickupTime TIMESTAMP,
    PaymentMethod ENUM('cash', 'card', 'digital') DEFAULT 'cash',
    PaymentStatus ENUM('pending', 'paid', 'refunded') DEFAULT 'pending',
    SpecialInstructions TEXT,
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UpdatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (CustomerID) REFERENCES Customers(CustomerID),
    FOREIGN KEY (CanteenID) REFERENCES Canteens(CanteenID),
    INDEX idx_customer (CustomerID),
    INDEX idx_canteen (CanteenID),
    INDEX idx_status (Status),
    INDEX idx_order_date (OrderDate)
);
```

#### OrderItems Table
```sql
CREATE TABLE OrderItems (
    OrderItemID INT PRIMARY KEY AUTO_INCREMENT,
    OrderID INT NOT NULL,
    MenuItemID INT NOT NULL,
    Quantity INT NOT NULL DEFAULT 1,
    Price DECIMAL(10,2) NOT NULL,
    SpecialInstructions TEXT,
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (OrderID) REFERENCES Orders(OrderID) ON DELETE CASCADE,
    FOREIGN KEY (MenuItemID) REFERENCES MenuItems(MenuItemID),
    INDEX idx_order (OrderID),
    INDEX idx_menu_item (MenuItemID)
);
```

### Database Relationships

```
Customers (1) ──────── (M) Orders
    │                      │
    │                      │
    └── (M) Favorites      │
                           │
Canteens (1) ──────── (M) MenuItems
    │                      │
    │                      │
    └── (M) Orders ──── (M) OrderItems
```

### Database Indexes and Performance

```sql
-- Performance optimization indexes
CREATE INDEX idx_orders_customer_date ON Orders(CustomerID, OrderDate);
CREATE INDEX idx_menu_canteen_category ON MenuItems(CanteenID, Category);
CREATE INDEX idx_orders_status_pickup ON Orders(Status, PickupTime);

-- Full-text search indexes
ALTER TABLE MenuItems ADD FULLTEXT(Name, Description);
ALTER TABLE Canteens ADD FULLTEXT(Name, Description);
```

---

## Frontend Architecture

### Client-Side JavaScript Structure

#### Authentication Handler (`js/auth-handler.js`)
```javascript
class AuthHandler {
    constructor() {
        this.storageKey = 'canteenUserData';
        this.apiBase = '/api/auth';
    }

    // User authentication methods
    async login(credentials) { /* ... */ }
    async register(userData) { /* ... */ }
    async logout() { /* ... */ }
    
    // Session management
    isLoggedIn() { /* ... */ }
    getCurrentUser() { /* ... */ }
    updateUserData(data) { /* ... */ }
    
    // Role-based access control
    hasRole(role) { /* ... */ }
    redirectBasedOnRole() { /* ... */ }
}
```

#### Image Handler (`js/image-handler.js`)
```javascript
class ImageHandler {
    constructor() {
        this.allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
        this.maxSize = 5 * 1024 * 1024; // 5MB
    }

    // Image validation and upload
    validateImage(file) { /* ... */ }
    async uploadImage(file, type, entityId) { /* ... */ }
    
    // Image optimization
    resizeImage(file, maxWidth, maxHeight) { /* ... */ }
    compressImage(file, quality) { /* ... */ }
}
```

### CSS Architecture

#### CSS Custom Properties (Variables)
```css
:root {
    /* Color Palette */
    --primary-color: #FF6B35;
    --primary-light: #FF8C5A;
    --primary-dark: #E55A2B;
    --secondary-color: #F5BE71;
    --secondary-light: #FBE2A9;
    --secondary-dark: #B26F18;
    
    /* Typography */
    --font-primary: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    --font-size-base: 16px;
    --font-size-large: 1.25rem;
    --font-size-small: 0.875rem;
    
    /* Spacing */
    --spacing-xs: 0.25rem;
    --spacing-sm: 0.5rem;
    --spacing-md: 1rem;
    --spacing-lg: 1.5rem;
    --spacing-xl: 2rem;
    
    /* Breakpoints */
    --breakpoint-sm: 576px;
    --breakpoint-md: 768px;
    --breakpoint-lg: 992px;
    --breakpoint-xl: 1200px;
}
```

#### Responsive Design Patterns
```css
/* Mobile-first approach */
.container {
    width: 100%;
    padding: var(--spacing-md);
}

@media (min-width: 768px) {
    .container {
        max-width: 750px;
        margin: 0 auto;
    }
}

@media (min-width: 992px) {
    .container {
        max-width: 970px;
    }
}

@media (min-width: 1200px) {
    .container {
        max-width: 1170px;
    }
}
```

---

## Backend Architecture

### Express.js Application Structure

#### Middleware Stack
```javascript
// server.js middleware configuration
app.use(cors(corsOptions));           // CORS handling
app.use(helmet(helmetOptions));       // Security headers
app.use(express.json());              // JSON body parsing
app.use(express.urlencoded());        // URL-encoded body parsing
app.use(fileUpload(uploadOptions));   // File upload handling
app.use(session(sessionOptions));     // Session management
app.use(rateLimiter);                 // Rate limiting
app.use('/api', apiRoutes);           // API routes
app.use(express.static('public'));    // Static file serving
app.use(errorHandler);                // Global error handling
```

#### Database Connection Pool
```javascript
// db.js - Connection pool configuration
const mysql = require('mysql2');

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    connectionLimit: parseInt(process.env.DB_CONNECTION_LIMIT) || 10,
    queueLimit: parseInt(process.env.DB_QUEUE_LIMIT) || 0,
    acquireTimeout: 60000,
    timeout: 60000,
    reconnect: true
});

const promisePool = pool.promise();
module.exports = { pool, promisePool };
```

#### Error Handling Middleware
```javascript
// Global error handler
function errorHandler(err, req, res, next) {
    console.error('Error:', err);
    
    // Database errors
    if (err.code === 'ER_DUP_ENTRY') {
        return res.status(409).json({
            success: false,
            message: 'Duplicate entry error',
            error: process.env.NODE_ENV === 'development' ? err.message : 'Database constraint violation'
        });
    }
    
    // Validation errors
    if (err.name === 'ValidationError') {
        return res.status(400).json({
            success: false,
            message: 'Validation failed',
            errors: err.errors
        });
    }
    
    // Default error response
    res.status(err.status || 500).json({
        success: false,
        message: err.message || 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
}
```

---

## Security Implementation

### Password Security
```javascript
const bcrypt = require('bcrypt');

class PasswordManager {
    static async hashPassword(plainPassword) {
        const saltRounds = parseInt(process.env.BCRYPT_ROUNDS) || 12;
        return await bcrypt.hash(plainPassword, saltRounds);
    }
    
    static async verifyPassword(plainPassword, hashedPassword) {
        return await bcrypt.compare(plainPassword, hashedPassword);
    }
    
    static validatePasswordStrength(password) {
        const minLength = 8;
        const hasUpperCase = /[A-Z]/.test(password);
        const hasLowerCase = /[a-z]/.test(password);
        const hasNumbers = /\d/.test(password);
        const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
        
        return {
            isValid: password.length >= minLength && hasUpperCase && 
                    hasLowerCase && hasNumbers && hasSpecialChar,
            requirements: {
                minLength: password.length >= minLength,
                hasUpperCase,
                hasLowerCase,
                hasNumbers,
                hasSpecialChar
            }
        };
    }
}
```

### Input Validation and Sanitization
```javascript
const validator = require('validator');

class InputValidator {
    static validateEmail(email) {
        return validator.isEmail(email) && email.length <= 100;
    }
    
    static validatePhone(phone) {
        return validator.isMobilePhone(phone) && phone.length <= 15;
    }
    
    static sanitizeString(input, maxLength = 255) {
        if (typeof input !== 'string') return '';
        return validator.escape(input.trim()).substring(0, maxLength);
    }
    
    static validateMenuItemData(data) {
        const errors = [];
        
        if (!data.name || data.name.trim().length < 2) {
            errors.push('Name must be at least 2 characters long');
        }
        
        if (!data.price || isNaN(data.price) || data.price <= 0) {
            errors.push('Price must be a positive number');
        }
        
        if (data.category && !['Breakfast', 'Lunch', 'Dinner', 'Snacks', 'Beverages'].includes(data.category)) {
            errors.push('Invalid category');
        }
        
        return {
            isValid: errors.length === 0,
            errors
        };
    }
}
```

### SQL Injection Prevention
```javascript
// Always use parameterized queries
class DatabaseQueries {
    static async getUserByEmail(email) {
        const query = 'SELECT * FROM Customers WHERE Email = ?';
        const [rows] = await promisePool.execute(query, [email]);
        return rows[0];
    }
    
    static async createOrder(orderData) {
        const query = `
            INSERT INTO Orders (CustomerID, CanteenID, TotalAmount, PickupTime, PaymentMethod)
            VALUES (?, ?, ?, ?, ?)
        `;
        const values = [
            orderData.customerId,
            orderData.canteenId,
            orderData.totalAmount,
            orderData.pickupTime,
            orderData.paymentMethod
        ];
        
        const [result] = await promisePool.execute(query, values);
        return result.insertId;
    }
}
```

---

## File Upload System

### Upload Configuration
```javascript
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;

// Storage configuration
const storage = multer.diskStorage({
    destination: async (req, file, cb) => {
        const uploadPath = path.join(process.env.UPLOAD_PATH, file.fieldname);
        
        try {
            await fs.mkdir(uploadPath, { recursive: true });
            cb(null, uploadPath);
        } catch (error) {
            cb(error);
        }
    },
    
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const extension = path.extname(file.originalname);
        cb(null, file.fieldname + '-' + uniqueSuffix + extension);
    }
});

// File filter
const fileFilter = (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
    
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Invalid file type. Only JPEG, PNG, and GIF are allowed.'), false);
    }
};

const upload = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: parseInt(process.env.MAX_FILE_SIZE) || 5 * 1024 * 1024 // 5MB
    }
});
```

### Image Processing
```javascript
const sharp = require('sharp'); // Add this dependency

class ImageProcessor {
    static async processImage(inputPath, outputPath, options = {}) {
        const {
            width = 800,
            height = 600,
            quality = 80,
            format = 'jpeg'
        } = options;
        
        await sharp(inputPath)
            .resize(width, height, {
                fit: 'inside',
                withoutEnlargement: true
            })
            .jpeg({ quality })
            .toFile(outputPath);
    }
    
    static async createThumbnail(inputPath, outputPath, size = 200) {
        await sharp(inputPath)
            .resize(size, size, {
                fit: 'cover',
                position: 'center'
            })
            .jpeg({ quality: 70 })
            .toFile(outputPath);
    }
}
```

---

## Authentication System

### Session Management
```javascript
const session = require('express-session');
const MySQLStore = require('express-mysql-session')(session);

const sessionStore = new MySQLStore({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
});

const sessionConfig = {
    key: 'canteen_session',
    secret: process.env.SESSION_SECRET,
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: parseInt(process.env.SESSION_MAX_AGE) || 24 * 60 * 60 * 1000, // 24 hours
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production', // HTTPS only in production
        sameSite: 'strict'
    }
};
```

### Role-Based Access Control
```javascript
class AuthMiddleware {
    static requireAuth(req, res, next) {
        if (!req.session.user) {
            return res.status(401).json({
                success: false,
                message: 'Authentication required'
            });
        }
        next();
    }
    
    static requireRole(roles) {
        return (req, res, next) => {
            if (!req.session.user) {
                return res.status(401).json({
                    success: false,
                    message: 'Authentication required'
                });
            }
            
            const userRole = req.session.user.accountType;
            if (!roles.includes(userRole)) {
                return res.status(403).json({
                    success: false,
                    message: 'Insufficient permissions'
                });
            }
            
            next();
        };
    }
    
    static requireAdmin(req, res, next) {
        return AuthMiddleware.requireRole(['admin'])(req, res, next);
    }
    
    static requireStaffOrAdmin(req, res, next) {
        return AuthMiddleware.requireRole(['staff', 'admin'])(req, res, next);
    }
}
```

---

## Development Workflow

### Git Workflow

#### Branch Strategy
```bash
# Main branches
main          # Production-ready code
develop       # Integration branch for features

# Feature branches
feature/user-authentication
feature/order-management
feature/admin-dashboard

# Release branches
release/v1.1.0

# Hotfix branches
hotfix/critical-bug-fix
```

#### Commit Message Convention
```
type(scope): description

Types:
- feat: New feature
- fix: Bug fix
- docs: Documentation changes
- style: Code style changes
- refactor: Code refactoring
- test: Adding or updating tests
- chore: Maintenance tasks

Examples:
feat(auth): add password reset functionality
fix(orders): resolve duplicate order creation bug
docs(api): update authentication endpoint documentation
```

### Code Quality Standards

#### ESLint Configuration (`.eslintrc.js`)
```javascript
module.exports = {
    env: {
        node: true,
        es2021: true,
        browser: true
    },
    extends: [
        'eslint:recommended'
    ],
    parserOptions: {
        ecmaVersion: 12,
        sourceType: 'module'
    },
    rules: {
        'indent': ['error', 2],
        'linebreak-style': ['error', 'unix'],
        'quotes': ['error', 'single'],
        'semi': ['error', 'always'],
        'no-unused-vars': 'warn',
        'no-console': 'warn',
        'prefer-const': 'error',
        'no-var': 'error'
    }
};
```

#### Prettier Configuration (`.prettierrc`)
```json
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 80,
  "tabWidth": 2,
  "useTabs": false
}
```

---

## Testing Guidelines

### Unit Testing Setup

#### Jest Configuration (`jest.config.js`)
```javascript
module.exports = {
    testEnvironment: 'node',
    collectCoverageFrom: [
        'api/**/*.js',
        'utils/**/*.js',
        '!**/node_modules/**'
    ],
    coverageDirectory: 'coverage',
    coverageReporters: ['text', 'lcov', 'html'],
    testMatch: [
        '**/tests/**/*.test.js'
    ],
    setupFilesAfterEnv: ['<rootDir>/tests/setup.js']
};
```

#### Test Examples

**Authentication Tests (`tests/unit/auth.test.js`)**
```javascript
const bcrypt = require('bcrypt');
const { PasswordManager } = require('../../utils/password-manager');

describe('PasswordManager', () => {
    describe('hashPassword', () => {
        test('should hash password correctly', async () => {
            const password = 'testPassword123';
            const hash = await PasswordManager.hashPassword(password);
            
            expect(hash).toBeDefined();
            expect(hash).not.toBe(password);
            expect(await bcrypt.compare(password, hash)).toBe(true);
        });
    });
    
    describe('validatePasswordStrength', () => {
        test('should validate strong password', () => {
            const result = PasswordManager.validatePasswordStrength('StrongPass123!');
            expect(result.isValid).toBe(true);
        });
        
        test('should reject weak password', () => {
            const result = PasswordManager.validatePasswordStrength('weak');
            expect(result.isValid).toBe(false);
        });
    });
});
```

**API Integration Tests (`tests/integration/api.test.js`)**
```javascript
const request = require('supertest');
const app = require('../../server');

describe('Authentication API', () => {
    describe('POST /api/auth/register', () => {
        test('should register new user successfully', async () => {
            const userData = {
                name: 'Test User',
                email: 'test@example.com',
                password: 'TestPass123!',
                phone: '1234567890'
            };
            
            const response = await request(app)
                .post('/api/auth/register')
                .send(userData)
                .expect(201);
            
            expect(response.body.success).toBe(true);
            expect(response.body.user.email).toBe(userData.email);
        });
        
        test('should reject duplicate email', async () => {
            // First registration
            await request(app)
                .post('/api/auth/register')
                .send({
                    name: 'User One',
                    email: 'duplicate@example.com',
                    password: 'TestPass123!'
                });
            
            // Duplicate registration
            const response = await request(app)
                .post('/api/auth/register')
                .send({
                    name: 'User Two',
                    email: 'duplicate@example.com',
                    password: 'TestPass123!'
                })
                .expect(409);
            
            expect(response.body.success).toBe(false);
        });
    });
});
```

### Database Testing

#### Test Database Setup (`tests/setup.js`)
```javascript
const { promisePool } = require('../db');

beforeAll(async () => {
    // Create test database
    await promisePool.execute('CREATE DATABASE IF NOT EXISTS CollegeCanteen_Test');
    await promisePool.execute('USE CollegeCanteen_Test');
    
    // Run migrations
    const fs = require('fs');
    const schema = fs.readFileSync('./college_canteen_schema.sql', 'utf8');
    await promisePool.execute(schema);
});

afterAll(async () => {
    // Clean up test database
    await promisePool.execute('DROP DATABASE IF EXISTS CollegeCanteen_Test');
    await promisePool.end();
});

beforeEach(async () => {
    // Clear all tables before each test
    await promisePool.execute('SET FOREIGN_KEY_CHECKS = 0');
    const [tables] = await promisePool.execute('SHOW TABLES');
    
    for (const table of tables) {
        const tableName = Object.values(table)[0];
        await promisePool.execute(`TRUNCATE TABLE ${tableName}`);
    }
    
    await promisePool.execute('SET FOREIGN_KEY_CHECKS = 1');
});
```

---

## Deployment Strategies

### Production Environment Setup

#### Environment Variables for Production
```env
NODE_ENV=production
PORT=3000

# Database (Use separate production database)
DB_HOST=prod-db-server.example.com
DB_USER=canteen_prod_user
DB_PASSWORD=super_secure_production_password
DB_NAME=CollegeCanteen_Prod

# Security
SESSION_SECRET=cryptographically_strong_64_character_secret_key_for_production
BCRYPT_ROUNDS=12

# File Upload
MAX_FILE_SIZE=10485760
UPLOAD_PATH=/var/www/canteen/uploads

# Logging
LOG_LEVEL=info
LOG_FILE=/var/log/canteen/app.log
```

#### PM2 Configuration (`ecosystem.config.js`)
```javascript
module.exports = {
    apps: [{
        name: 'campus-cravings',
        script: './server.js',
        instances: 'max',
        exec_mode: 'cluster',
        env: {
            NODE_ENV: 'development'
        },
        env_production: {
            NODE_ENV: 'production',
            PORT: 3000
        },
        log_file: '/var/log/canteen/combined.log',
        out_file: '/var/log/canteen/out.log',
        error_file: '/var/log/canteen/error.log',
        log_date_format: 'YYYY-MM-DD HH:mm Z',
        merge_logs: true,
        max_memory_restart: '1G',
        node_args: '--max-old-space-size=1024'
    }]
};
```

#### Nginx Configuration
```nginx
server {
    listen 80;
    server_name your-domain.com;
    
    # Redirect HTTP to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name your-domain.com;
    
    # SSL Configuration
    ssl_certificate /path/to/ssl/certificate.crt;
    ssl_certificate_key /path/to/ssl/private.key;
    
    # Security headers
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
    add_header X-XSS-Protection "1; mode=block";
    
    # Static files
    location /uploads/ {
        alias /var/www/canteen/uploads/;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
    
    location /images/ {
        alias /var/www/canteen/images/;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
    
    # Proxy to Node.js application
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### Docker Deployment

#### Dockerfile
```dockerfile
FROM node:18-alpine

# Create app directory
WORKDIR /usr/src/app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy application code
COPY . .

# Create uploads directory
RUN mkdir -p public/uploads

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:3000/health || exit 1

# Start application
CMD ["npm", "start"]
```

#### Docker Compose (`docker-compose.yml`)
```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - DB_HOST=db
      - DB_USER=canteen_user
      - DB_PASSWORD=secure_password
      - DB_NAME=CollegeCanteen
    depends_on:
      - db
    volumes:
      - ./uploads:/usr/src/app/public/uploads
    restart: unless-stopped

  db:
    image: mysql:8.0
    environment:
      - MYSQL_ROOT_PASSWORD=root_password
      - MYSQL_DATABASE=CollegeCanteen
      - MYSQL_USER=canteen_user
      - MYSQL_PASSWORD=secure_password
    volumes:
      - mysql_data:/var/lib/mysql
      - ./college_canteen_schema.sql:/docker-entrypoint-initdb.d/schema.sql
    restart: unless-stopped

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/nginx/ssl
    depends_on:
      - app
    restart: unless-stopped

volumes:
  mysql_data:
```

---

## Performance Optimization

### Database Optimization

#### Query Optimization
```javascript
// Use indexes effectively
const getPopularMenuItems = async (canteenId, limit = 10) => {
    const query = `
        SELECT 
            mi.MenuItemID,
            mi.Name,
            mi.Price,
            mi.Image,
            COUNT(oi.OrderItemID) as OrderCount
        FROM MenuItems mi
        LEFT JOIN OrderItems oi ON mi.MenuItemID = oi.MenuItemID
        LEFT JOIN Orders o ON oi.OrderID = o.OrderID
        WHERE mi.CanteenID = ? 
        AND mi.IsAvailable = 1
        AND o.OrderDate >= DATE_SUB(NOW(), INTERVAL 30 DAY)
        GROUP BY mi.MenuItemID
        ORDER BY OrderCount DESC
        LIMIT ?
    `;
    
    const [rows] = await promisePool.execute(query, [canteenId, limit]);
    return rows;
};

// Use connection pooling effectively
const getOrdersWithPagination = async (customerId, page = 1, limit = 10) => {
    const offset = (page - 1) * limit;
    
    const query = `
        SELECT 
            o.*,
            c.Name as CanteenName,
            COUNT(oi.OrderItemID) as ItemCount
        FROM Orders o
        JOIN Canteens c ON o.CanteenID = c.CanteenID
        LEFT JOIN OrderItems oi ON o.OrderID = oi.OrderID
        WHERE o.CustomerID = ?
        GROUP BY o.OrderID
        ORDER BY o.OrderDate DESC
        LIMIT ? OFFSET ?
    `;
    
    const [rows] = await promisePool.execute(query, [customerId, limit, offset]);
    return rows;
};
```

#### Caching Strategy
```javascript
const NodeCache = require('node-cache');

// Create cache instances
const menuCache = new NodeCache({ stdTTL: 300 }); // 5 minutes
const canteenCache = new NodeCache({ stdTTL: 600 }); // 10 minutes

class CacheManager {
    static async getMenuItems(canteenId) {
        const cacheKey = `menu_${canteenId}`;
        let menuItems = menuCache.get(cacheKey);
        
        if (!menuItems) {
            // Fetch from database
            const query = 'SELECT * FROM MenuItems WHERE CanteenID = ? AND IsAvailable = 1';
            const [rows] = await promisePool.execute(query, [canteenId]);
            menuItems = rows;
            
            // Cache the result
            menuCache.set(cacheKey, menuItems);
        }
        
        return menuItems;
    }
    
    static invalidateMenuCache(canteenId) {
        const cacheKey = `menu_${canteenId}`;
        menuCache.del(cacheKey);
    }
    
    static async getCanteens() {
        const cacheKey = 'all_canteens';
        let canteens = canteenCache.get(cacheKey);
        
        if (!canteens) {
            const query = 'SELECT * FROM Canteens WHERE IsActive = 1';
            const [rows] = await promisePool.execute(query);
            canteens = rows;
            
            canteenCache.set(cacheKey, canteens);
        }
        
        return canteens;
    }
}
```

### Frontend Optimization

#### Image Optimization
```javascript
// Lazy loading implementation
class LazyLoader {
    constructor() {
        this.imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src;
                    img.classList.remove('lazy');
                    observer.unobserve(img);
                }
            });
        });
    }
    
    observe() {
        const lazyImages = document.querySelectorAll('img[data-src]');
        lazyImages.forEach(img => this.imageObserver.observe(img));
    }
}

// Initialize lazy loading
document.addEventListener('DOMContentLoaded', () => {
    const lazyLoader = new LazyLoader();
    lazyLoader.observe();
});
```

#### JavaScript Optimization
```javascript
// Debounce search functionality
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Optimized search implementation
const searchMenuItems = debounce(async (query) => {
    if (query.length < 2) return;
    
    try {
        const response = await fetch(`/api/menu/search?q=${encodeURIComponent(query)}`);
        const data = await response.json();
        
        if (data.success) {
            displaySearchResults(data.menuItems);
        }
    } catch (error) {
        console.error('Search error:', error);
    }
}, 300);
```

---

## Troubleshooting

### Common Development Issues

#### Database Connection Issues
```javascript
// Debug database connection
const testDatabaseConnection = async () => {
    try {
        const [rows] = await promisePool.execute('SELECT 1 as test');
        console.log('Database connection successful:', rows);
        return true;
    } catch (error) {
        console.error('Database connection failed:', error);
        
        // Common solutions:
        if (error.code === 'ECONNREFUSED') {
            console.log('Solution: Check if MySQL server is running');
        } else if (error.code === 'ER_ACCESS_DENIED_ERROR') {
            console.log('Solution: Check database credentials in .env file');
        } else if (error.code === 'ER_BAD_DB_ERROR') {
            console.log('Solution: Create the database or check database name');
        }
        
        return false;
    }
};
```

#### File Upload Issues
```javascript
// Debug file upload problems
const debugFileUpload = (req, res, next) => {
    console.log('File upload debug:');
    console.log('Files:', req.files);
    console.log('Body:', req.body);
    console.log('Headers:', req.headers);
    
    if (!req.files || Object.keys(req.files).length === 0) {
        console.log('No files uploaded');
        return res.status(400).json({
            success: false,
            message: 'No files uploaded',
            debug: {
                contentType: req.headers['content-type'],
                contentLength: req.headers['content-length']
            }
        });
    }
    
    next();
};
```

#### Session Issues
```javascript
// Debug session problems
const debugSession = (req, res, next) => {
    console.log('Session debug:');
    console.log('Session ID:', req.sessionID);
    console.log('Session data:', req.session);
    console.log('Cookies:', req.headers.cookie);
    
    if (!req.session) {
        console.log('No session found - check session middleware configuration');
    }
    
    next();
};
```

### Performance Debugging

#### Database Query Analysis
```sql
-- Enable query logging
SET GLOBAL general_log = 'ON';
SET GLOBAL general_log_file = '/var/log/mysql/queries.log';

-- Analyze slow queries
SHOW PROCESSLIST;
SHOW FULL PROCESSLIST;

-- Check table indexes
SHOW INDEX FROM MenuItems;
SHOW INDEX FROM Orders;

-- Analyze query performance
EXPLAIN SELECT * FROM Orders WHERE CustomerID = 1 ORDER BY OrderDate DESC;
```

#### Memory Usage Monitoring
```javascript
// Monitor memory usage
const monitorMemory = () => {
    const used = process.memoryUsage();
    console.log('Memory Usage:');
    for (let key in used) {
        console.log(`${key}: ${Math.round(used[key] / 1024 / 1024 * 100) / 100} MB`);
    }
};

// Run every 30 seconds in development
if (process.env.NODE_ENV === 'development') {
    setInterval(monitorMemory, 30000);
}
```

---

## Contributing Guidelines

### Code Style Guidelines

1. **Use consistent naming conventions**:
   - Variables and functions: `camelCase`
   - Constants: `UPPER_SNAKE_CASE`
   - Classes: `PascalCase`
   - Files: `kebab-case.js`

2. **Write meaningful comments**:
   ```javascript
   // Good
   // Calculate total price including tax and discounts
   const calculateTotalPrice = (items, taxRate, discount) => {
       // Implementation
   };
   
   // Bad
   // Calculate price
   const calc = (a, b, c) => {
       // Implementation
   };
   ```

3. **Handle errors properly**:
   ```javascript
   // Always handle async errors
   try {
       const result = await someAsyncOperation();
       return result;
   } catch (error) {
       console.error('Operation failed:', error);
       throw new Error('Failed to complete operation');
   }
   ```

### Pull Request Process

1. **Create feature branch**:
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make changes and test**:
   ```bash
   npm test
   npm run lint
   ```

3. **Commit with descriptive message**:
   ```bash
   git commit -m "feat(orders): add order cancellation functionality"
   ```

4. **Push and create PR**:
   ```bash
   git push origin feature/your-feature-name
   ```

5. **PR Requirements**:
   - Clear description of changes
   - Tests for new functionality
   - Documentation updates if needed
   - No linting errors
   - All tests passing

### Code Review Checklist

- [ ] Code follows project style guidelines
- [ ] All tests pass
- [ ] No security vulnerabilities introduced
- [ ] Performance impact considered
- [ ] Documentation updated
- [ ] Error handling implemented
- [ ] Input validation added
- [ ] Database queries optimized
- [ ] No hardcoded values
- [ ] Logging added for debugging

---

## Additional Resources

### Useful Commands

```bash
# Development
npm run dev                    # Start development server
npm test                      # Run all tests
npm run lint                  # Check code style
npm run lint:fix              # Fix linting issues

# Database
node check-db.js              # Test database connection
node show-users.js            # Display user accounts
node list-users.js            # List all users
mysql -u root -p CollegeCanteen < schema.sql  # Import schema

# Production
npm start                     # Start production server
pm2 start ecosystem.config.js # Start with PM2
pm2 logs campus-cravings      # View logs
pm2 restart campus-cravings   # Restart application
```

### External Documentation

- [Node.js Documentation](https://nodejs.org/docs/)
- [Express.js Guide](https://expressjs.com/guide/)
- [MySQL Documentation](https://dev.mysql.com/doc/)
- [Bootstrap Documentation](https://getbootstrap.com/docs/)
- [MDN Web Docs](https://developer.mozilla.org/)

### Community and Support

- **GitHub Issues**: Report bugs and request features
- **Stack Overflow**: Get help with specific problems
- **Node.js Community**: Join the Node.js community forums
- **MySQL Community**: MySQL community support

---

**Happy Coding!**

*This developer guide is a living document. Please keep it updated as the project evolves.*
