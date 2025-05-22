# Campus Canteen Pre-Order System: Database Schema Guide

This guide provides a comprehensive overview of the database schema used in the Campus Canteen Pre-Order System.

## Table of Contents

1. [Database Overview](#database-overview)
2. [Table Structures](#table-structures)
   - [Users Table](#users-table)
   - [Menu Items Table](#menu-items-table)
   - [Orders Table](#orders-table)
   - [Order Items Table](#order-items-table)
   - [Canteens Table](#canteens-table)
   - [Images Table](#images-table)
3. [Relationships](#relationships)
4. [Indexes and Performance](#indexes-and-performance)
5. [Database Maintenance](#database-maintenance)

## Database Overview

The Campus Canteen Pre-Order System uses a MySQL database named `CollegeCanteen`. The database follows a relational model with several interconnected tables to store user information, menu items, orders, and other system data.

Key design principles:
- Normalization to reduce data redundancy
- Foreign key constraints to maintain data integrity
- Appropriate indexing for performance optimization
- Use of transactions for critical operations

## Table Structures

### Users Table

The `users` table stores information about system users, including customers and staff members.

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

**Fields:**
- `id`: Unique identifier for each user (auto-incrementing)
- `full_name`: User's full name
- `email`: User's email address (optional if phone is provided)
- `phone`: User's phone number (optional if email is provided)
- `password`: Hashed password using PHP's `password_hash()` function
- `account_type`: User role - either 'customer' or 'staff'
- `created_at`: Timestamp when the user account was created

**Constraints:**
- Primary key on `id`
- Unique constraints on `email` and `phone` to prevent duplicate accounts
- Either `email` or `phone` must be provided (enforced at application level)

### Menu Items Table

The `menu_items` table stores information about food items available for ordering.

```sql
CREATE TABLE menu_items (
    id INT(11) AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    category VARCHAR(50) NOT NULL,
    image_id INT(11),
    is_available BOOLEAN DEFAULT TRUE,
    canteen_id INT(11) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (canteen_id) REFERENCES canteens(id),
    FOREIGN KEY (image_id) REFERENCES images(id)
)
```

**Fields:**
- `id`: Unique identifier for each menu item
- `name`: Name of the food item
- `description`: Detailed description of the food item
- `price`: Price of the item
- `category`: Category of the food item (e.g., breakfast, lunch, dinner, snacks)
- `image_id`: Reference to the image of the food item
- `is_available`: Boolean indicating if the item is currently available
- `canteen_id`: Reference to the canteen that offers this item
- `created_at`: Timestamp when the item was added
- `updated_at`: Timestamp when the item was last updated

**Constraints:**
- Primary key on `id`
- Foreign key to `canteens` table
- Foreign key to `images` table

### Orders Table

The `orders` table stores information about customer orders.

```sql
CREATE TABLE orders (
    id INT(11) AUTO_INCREMENT PRIMARY KEY,
    user_id INT(11) NOT NULL,
    order_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    pickup_time DATETIME NOT NULL,
    status ENUM('received', 'preparing', 'ready', 'completed', 'cancelled') DEFAULT 'received',
    total_amount DECIMAL(10,2) NOT NULL,
    special_instructions TEXT,
    canteen_id INT(11) NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (canteen_id) REFERENCES canteens(id)
)
```

**Fields:**
- `id`: Unique identifier for each order
- `user_id`: Reference to the user who placed the order
- `order_date`: Timestamp when the order was placed
- `pickup_time`: Scheduled time for order pickup
- `status`: Current status of the order
- `total_amount`: Total cost of the order
- `special_instructions`: Any special instructions for the order
- `canteen_id`: Reference to the canteen where the order was placed
- `updated_at`: Timestamp when the order was last updated

**Constraints:**
- Primary key on `id`
- Foreign key to `users` table
- Foreign key to `canteens` table

### Order Items Table

The `order_items` table stores the individual items within each order.

```sql
CREATE TABLE order_items (
    id INT(11) AUTO_INCREMENT PRIMARY KEY,
    order_id INT(11) NOT NULL,
    menu_item_id INT(11) NOT NULL,
    quantity INT(11) NOT NULL,
    item_price DECIMAL(10,2) NOT NULL,
    special_requests TEXT,
    FOREIGN KEY (order_id) REFERENCES orders(id),
    FOREIGN KEY (menu_item_id) REFERENCES menu_items(id)
)
```

**Fields:**
- `id`: Unique identifier for each order item
- `order_id`: Reference to the parent order
- `menu_item_id`: Reference to the menu item
- `quantity`: Number of this item ordered
- `item_price`: Price of the item at the time of ordering
- `special_requests`: Any special requests for this specific item

**Constraints:**
- Primary key on `id`
- Foreign key to `orders` table
- Foreign key to `menu_items` table

### Canteens Table

The `canteens` table stores information about different canteens in the campus.

```sql
CREATE TABLE canteens (
    id INT(11) AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    location VARCHAR(100) NOT NULL,
    description TEXT,
    opening_time TIME NOT NULL,
    closing_time TIME NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    image_id INT(11),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (image_id) REFERENCES images(id)
)
```

**Fields:**
- `id`: Unique identifier for each canteen
- `name`: Name of the canteen
- `location`: Physical location of the canteen
- `description`: Detailed description of the canteen
- `opening_time`: Daily opening time
- `closing_time`: Daily closing time
- `is_active`: Boolean indicating if the canteen is currently active
- `image_id`: Reference to the image of the canteen
- `created_at`: Timestamp when the canteen was added
- `updated_at`: Timestamp when the canteen information was last updated

**Constraints:**
- Primary key on `id`
- Foreign key to `images` table

### Images Table

The `images` table stores metadata about images used in the system.

```sql
CREATE TABLE images (
    id INT(11) AUTO_INCREMENT PRIMARY KEY,
    category VARCHAR(50) NOT NULL,
    path VARCHAR(255) NOT NULL,
    title VARCHAR(100),
    description TEXT,
    uploaded_by INT(11),
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (uploaded_by) REFERENCES users(id)
)
```

**Fields:**
- `id`: Unique identifier for each image
- `category`: Category of the image (e.g., food, canteen, hero)
- `path`: File path to the image
- `title`: Title or caption for the image
- `description`: Detailed description of the image
- `uploaded_by`: Reference to the user who uploaded the image
- `uploaded_at`: Timestamp when the image was uploaded

**Constraints:**
- Primary key on `id`
- Foreign key to `users` table

## Relationships

The database schema includes several relationships between tables:

1. **Users to Orders (One-to-Many)**
   - One user can place many orders
   - Each order belongs to exactly one user

2. **Orders to Order Items (One-to-Many)**
   - One order can contain many order items
   - Each order item belongs to exactly one order

3. **Menu Items to Order Items (One-to-Many)**
   - One menu item can be included in many order items
   - Each order item references exactly one menu item

4. **Canteens to Menu Items (One-to-Many)**
   - One canteen can offer many menu items
   - Each menu item belongs to exactly one canteen

5. **Canteens to Orders (One-to-Many)**
   - One canteen can receive many orders
   - Each order is placed at exactly one canteen

6. **Images to Menu Items/Canteens (One-to-Many)**
   - One image can be used for one menu item or canteen
   - Each menu item or canteen can have one image

## Indexes and Performance

The database schema includes several indexes to optimize query performance:

1. **Primary Keys**
   - All tables have auto-incrementing primary keys

2. **Foreign Keys**
   - Foreign keys are indexed to speed up join operations

3. **Unique Constraints**
   - `email` and `phone` in the `users` table have unique indexes

4. **Additional Indexes**
   - `category` in the `menu_items` table for faster category-based queries
   - `status` in the `orders` table for faster status-based filtering
   - `order_date` in the `orders` table for date-range queries

## Database Maintenance

To maintain the database in optimal condition:

1. **Regular Backups**
   - Daily backups of the entire database
   - Transaction log backups for point-in-time recovery

2. **Index Optimization**
   - Periodic rebuilding of indexes to reduce fragmentation
   - Monitoring index usage to identify missing or unused indexes

3. **Data Archiving**
   - Archiving old orders and order items to maintain performance
   - Implementing a data retention policy

4. **Performance Monitoring**
   - Monitoring query performance to identify slow queries
   - Optimizing problematic queries with proper indexing or restructuring

---

This guide provides a comprehensive overview of the database schema used in the Campus Canteen Pre-Order System. Understanding this structure is essential for developers working on the system and for database administrators responsible for its maintenance.