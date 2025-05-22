-- College Canteen Database Schema
-- This SQL file creates the complete database schema for the College Canteen system

-- Drop database if it exists and create a new one
DROP DATABASE IF EXISTS CollegeCanteen;
CREATE DATABASE CollegeCanteen;
USE CollegeCanteen;

-- 1️⃣ Customers Table (Stores Students and Customers)
CREATE TABLE Customers (
    USER_ID INT AUTO_INCREMENT PRIMARY KEY,
    NAME VARCHAR(100) NOT NULL,
    EMAIL VARCHAR(100) UNIQUE NOT NULL,
    PHONE VARCHAR(15) UNIQUE NOT NULL,
    ROLL_NUMBER VARCHAR(20) UNIQUE, -- Only for students
    ROLE ENUM('Customer') NOT NULL,
    PASSWORD_HASH VARCHAR(255) NOT NULL, 
    REGISTRATION_DATE TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    DATE_OF_BIRTH DATE NOT NULL
);

-- 2️⃣ Employee Table (For Kitchen Staff & Admins)
CREATE TABLE Employees (
    EMPLOYEE_ID INT AUTO_INCREMENT PRIMARY KEY,
    USER_ID INT UNIQUE NOT NULL,
    ROLE ENUM('KitchenStaff', 'Admin') NOT NULL,
    SALARY DECIMAL(10,2) NOT NULL,
    SHIFT_TIMINGS VARCHAR(50),
    FOREIGN KEY (USER_ID) REFERENCES Customers(USER_ID) ON DELETE CASCADE
);

-- 3️⃣ Multi-Valued Attribute: User Contacts (A user can have multiple contact numbers)
CREATE TABLE UserContacts (
    USER_ID INT,
    CONTACT_NUMBER VARCHAR(15),
    PRIMARY KEY (USER_ID, CONTACT_NUMBER),
    FOREIGN KEY (USER_ID) REFERENCES Customers(USER_ID) ON DELETE CASCADE
);

-- 4️⃣ Canteens Table (Stores different canteens)
CREATE TABLE Canteens (
    Canteen_ID INT AUTO_INCREMENT PRIMARY KEY,
    NAME VARCHAR(100) NOT NULL UNIQUE,
    LOCATION VARCHAR(255) NOT NULL,
    CONTACT VARCHAR(15) UNIQUE,
    OPENING_HOURS VARCHAR(50),
    CREATED_AT TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 5️⃣ Inventory Table (Stock Management for Kitchen Staff)
CREATE TABLE Inventory (
    INVENTORY_ID INT AUTO_INCREMENT PRIMARY KEY,
    Canteen_ID INT NOT NULL,
    ITEM_NAME VARCHAR(100) NOT NULL,
    QUANTITY INT NOT NULL CHECK (QUANTITY >= 0),
    UNIT VARCHAR(20) NOT NULL,
    LAST_UPDATED TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (Canteen_ID) REFERENCES Canteens(Canteen_ID) ON DELETE CASCADE
);

-- 6️⃣ Menu Table (Different menus for different canteens)
CREATE TABLE Menu (
    ITEM_ID INT AUTO_INCREMENT PRIMARY KEY,
    Canteen_ID INT NOT NULL,
    ITEM_NAME VARCHAR(100) NOT NULL,
    PRICE DECIMAL(8,2) NOT NULL CHECK (PRICE > 0),
    DESCRIPTION TEXT,
    CATEGORY ENUM('Snacks', 'Beverages', 'Meals', 'Desserts') NOT NULL,
    AVAILABLE BOOLEAN DEFAULT TRUE,
    INVENTORY_ID INT,
    IMAGE_URL VARCHAR(500), -- ✅ Added to store image path/URL
    CREATED_AT TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (Canteen_ID) REFERENCES Canteens(Canteen_ID) ON DELETE CASCADE,
    FOREIGN KEY (INVENTORY_ID) REFERENCES Inventory(INVENTORY_ID) ON DELETE SET NULL
);

-- 7️⃣ Cart Table (Stores items added to cart before final checkout)
CREATE TABLE Cart (
    USER_ID INT,
    ITEM_ID INT,
    QUANTITY INT NOT NULL CHECK (QUANTITY > 0),
    PRIMARY KEY (USER_ID, ITEM_ID),
    FOREIGN KEY (USER_ID) REFERENCES Customers(USER_ID) ON DELETE CASCADE,
    FOREIGN KEY (ITEM_ID) REFERENCES Menu(ITEM_ID) ON DELETE CASCADE
);

-- 8️⃣ Orders Table (Stores orders placed by users)
CREATE TABLE Orders (
    ORDER_ID INT AUTO_INCREMENT PRIMARY KEY,
    USER_ID INT NOT NULL,
    Canteen_ID INT NOT NULL,
    ORDER_DATE TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    SCHEDULED_TIME DATETIME NOT NULL,
    PICKUP_COUNTER VARCHAR(10) NOT NULL,
    STATUS ENUM('Pending', 'Preparing', 'Ready', 'Collected', 'Not Picked Up', 'Cancelled') DEFAULT 'Pending',
    TOTAL_AMOUNT DECIMAL(8,2) NOT NULL CHECK (TOTAL_AMOUNT > 0),
    FOREIGN KEY (USER_ID) REFERENCES Customers(USER_ID) ON DELETE CASCADE,
    FOREIGN KEY (Canteen_ID) REFERENCES Canteens(Canteen_ID) ON DELETE CASCADE
);

-- 9️⃣ OrderItems Table (Tracks items in each order)
CREATE TABLE OrderItems (
    ORDER_ITEM_ID INT AUTO_INCREMENT PRIMARY KEY,
    ORDER_ID INT NOT NULL,
    ITEM_ID INT NOT NULL,
    QUANTITY INT NOT NULL CHECK (QUANTITY > 0),
    SUBTOTAL DECIMAL(8,2) NOT NULL CHECK (SUBTOTAL > 0),
    FOREIGN KEY (ORDER_ID) REFERENCES Orders(ORDER_ID) ON DELETE CASCADE,
    FOREIGN KEY (ITEM_ID) REFERENCES Menu(ITEM_ID) ON DELETE CASCADE
);

-- 🔟 OrderHistory Table (Tracks completed/cancelled orders)
CREATE TABLE OrderHistory (
    HISTORY_ID INT AUTO_INCREMENT PRIMARY KEY,
    ORDER_ID INT UNIQUE NOT NULL,
    USER_ID INT NOT NULL,
    CANTEEN_ID INT NOT NULL,
    ORDER_DATE TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    TOTAL_AMOUNT DECIMAL(8,2) NOT NULL,
    STATUS ENUM('Picked Up', 'Not Picked Up', 'Cancelled') NOT NULL,
    FOREIGN KEY (ORDER_ID) REFERENCES Orders(ORDER_ID) ON DELETE CASCADE,
    FOREIGN KEY (USER_ID) REFERENCES Customers(USER_ID) ON DELETE CASCADE,
    FOREIGN KEY (CANTEEN_ID) REFERENCES Canteens(Canteen_ID) ON DELETE CASCADE
);

-- 1️⃣1️⃣ Reviews Table (Customers can rate menu items)
CREATE TABLE Reviews (
    REVIEW_ID INT AUTO_INCREMENT PRIMARY KEY,
    USER_ID INT NOT NULL,
    ITEM_ID INT NOT NULL,
    RATING INT CHECK (RATING BETWEEN 1 AND 5),
    REVIEW_TEXT TEXT,
    REVIEW_DATE TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (USER_ID) REFERENCES Customers(USER_ID) ON DELETE CASCADE,
    FOREIGN KEY (ITEM_ID) REFERENCES Menu(ITEM_ID) ON DELETE CASCADE
);

-- 1️⃣2️⃣ PickupSlots Table (Schedules order pickups)
CREATE TABLE PickupSlots (
    SLOT_ID INT AUTO_INCREMENT PRIMARY KEY,
    ORDER_ID INT NOT NULL,
    PICKUP_DATE DATE NOT NULL,
    SLOT_TIME TIME NOT NULL,
    STATUS ENUM('Scheduled', 'Completed', 'Missed') DEFAULT 'Scheduled',
    CREATED_AT TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (ORDER_ID) REFERENCES Orders(ORDER_ID) ON DELETE CASCADE
);

-- 1️⃣3️⃣ Images Table (Stores images for various entities)
CREATE TABLE images (
    id INT AUTO_INCREMENT PRIMARY KEY,
    category VARCHAR(50) NOT NULL,
    item_id VARCHAR(100) NOT NULL,
    image_path VARCHAR(255) NOT NULL,
    alt_text VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY (category, item_id)
);

-- 1️⃣4️⃣ Payments Table (Tracks payment information for orders)
CREATE TABLE Payments (
    PAYMENT_ID INT AUTO_INCREMENT PRIMARY KEY,
    ORDER_ID INT NOT NULL,
    USER_ID INT NOT NULL,
    PAYMENT_METHOD ENUM('Credit Card', 'Debit Card', 'UPI', 'Cash', 'Wallet') NOT NULL,
    PAYMENT_STATUS ENUM('Pending', 'Completed', 'Failed', 'Refunded') NOT NULL DEFAULT 'Pending',
    AMOUNT DECIMAL(8,2) NOT NULL CHECK (AMOUNT > 0),
    TRANSACTION_ID VARCHAR(100),
    PAYMENT_DATE TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (ORDER_ID) REFERENCES Orders(ORDER_ID) ON DELETE CASCADE,
    FOREIGN KEY (USER_ID) REFERENCES Customers(USER_ID) ON DELETE CASCADE
);

-- Insert sample data

-- Insert sample canteens
INSERT INTO Canteens (NAME, LOCATION, CONTACT, OPENING_HOURS) VALUES
('BIG MINGOES', 'Main Campus, Building A', '1234567890', '8:00 AM - 8:00 PM'),
('MINI MINGOES', 'Science Block, Building B', '1234567891', '9:00 AM - 6:00 PM'),
('M M FOODS', 'Engineering Block, Building C', '1234567892', '8:30 AM - 7:30 PM');

-- Insert sample menu items
INSERT INTO Menu (Canteen_ID, ITEM_NAME, PRICE, DESCRIPTION, CATEGORY, AVAILABLE, IMAGE_URL) VALUES
(1, 'Paneer Roll', 60.00, 'Delicious paneer roll', 'Snacks', TRUE, 'images/food/paneer_roll.jpg'),
(1, 'Veg Sandwich', 40.00, 'Fresh sandwich with veggies', 'Snacks', TRUE, 'images/food/veg_sandwich.jpg'),
(2, 'Masala Dosa', 50.00, 'South Indian specialty', 'Meals', TRUE, 'images/food/masala_dosa.jpg'),
(2, 'Idli Sambar', 40.00, 'Soft idlis with sambar', 'Meals', TRUE, 'images/food/idli_sambar.jpg'),
(3, 'Veg Fried Rice', 70.00, 'Chinese style fried rice', 'Meals', TRUE, 'images/food/veg_fried_rice.jpg'),
(3, 'Veg Noodles', 65.00, 'Stir fried noodles with vegetables', 'Meals', TRUE, 'images/food/veg_noodles.jpg');

-- Insert hero images
INSERT INTO images (category, item_id, image_path, alt_text) VALUES
('hero', 'slide1', 'images/hero/hero_slide1.jpg', 'Delicious Food'),
('hero', 'slide2', 'images/hero/hero_slide2.jpg', 'Campus Food'),
('hero', 'slide3', 'images/hero/hero_slide3.jpg', 'Fresh Food');

-- Insert canteen images
INSERT INTO images (category, item_id, image_path, alt_text) VALUES
('canteen', 'big_mingoes', 'images/canteens/big_mingoes.jpg', 'BIG MINGOES'),
('canteen', 'mini_mingoes', 'images/canteens/mini_mingoes.jpg', 'MINI MINGOES'),
('canteen', 'mm_foods', 'images/canteens/mm_foods.jpg', 'M M FOODS');

-- Insert North Indian food images
INSERT INTO images (category, item_id, image_path, alt_text) VALUES
('food', 'north_indian_full_meals', 'images/food/north_indian_full_meals.jpg', 'North Indian Full Meals'),
('food', 'north_indian_mini_meals', 'images/food/north_indian_mini_meals.jpg', 'North Indian Mini Meals'),
('food', 'butter_naan', 'images/food/butter_naan.jpg', 'Butter Naan'),
('food', 'paneer_butter_masala', 'images/food/paneer_butter_masala.jpg', 'Paneer Butter Masala');

-- Insert South Indian food images
INSERT INTO images (category, item_id, image_path, alt_text) VALUES
('food', 'south_indian_meals', 'images/food/south_indian_meals.jpg', 'South Indian Meals'),
('food', 'idli_sambar', 'images/food/idli_sambar.jpg', 'Idli Sambar'),
('food', 'masala_dosa', 'images/food/masala_dosa.jpg', 'Masala Dosa'),
('food', 'vada', 'images/food/vada.jpg', 'Vada');

-- Insert Chinese food images
INSERT INTO images (category, item_id, image_path, alt_text) VALUES
('food', 'veg_fried_rice', 'images/food/veg_fried_rice.jpg', 'Veg Fried Rice'),
('food', 'veg_noodles', 'images/food/veg_noodles.jpg', 'Veg Noodles'),
('food', 'veg_manchurian', 'images/food/veg_manchurian.jpg', 'Veg Manchurian'),
('food', 'gobi_manchurian', 'images/food/gobi_manchurian.jpg', 'Gobi Manchurian');

-- Insert a test admin user
INSERT INTO Customers (NAME, EMAIL, PHONE, ROLE, PASSWORD_HASH, DATE_OF_BIRTH) VALUES
('Admin User', 'admin@example.com', '9876543210', 'Customer', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '1990-01-01');

-- Insert sample orders
INSERT INTO Orders (USER_ID, Canteen_ID, SCHEDULED_TIME, PICKUP_COUNTER, STATUS, TOTAL_AMOUNT) VALUES
(1, 1, DATE_ADD(NOW(), INTERVAL 1 HOUR), 'Counter 1', 'Pending', 100.00),
(1, 2, DATE_ADD(NOW(), INTERVAL 2 HOUR), 'Counter 2', 'Preparing', 150.00),
(1, 3, DATE_ADD(NOW(), INTERVAL 3 HOUR), 'Counter 3', 'Ready', 200.00),
(1, 1, DATE_ADD(NOW(), INTERVAL 4 HOUR), 'Counter 4', 'Collected', 120.00),
(1, 2, DATE_ADD(NOW(), INTERVAL 5 HOUR), 'Counter 5', 'Cancelled', 180.00);

-- Insert sample order items
INSERT INTO OrderItems (ORDER_ID, ITEM_ID, QUANTITY, SUBTOTAL) VALUES
(1, 1, 1, 60.00),
(1, 2, 1, 40.00),
(2, 3, 3, 150.00),
(3, 4, 2, 80.00),
(3, 5, 1, 70.00),
(3, 6, 1, 65.00),
(4, 1, 2, 120.00),
(5, 3, 2, 100.00),
(5, 4, 2, 80.00);

-- Insert sample payments
INSERT INTO Payments (ORDER_ID, USER_ID, PAYMENT_METHOD, PAYMENT_STATUS, AMOUNT) VALUES
(1, 1, 'UPI', 'Completed', 100.00),
(2, 1, 'Credit Card', 'Completed', 150.00),
(3, 1, 'Debit Card', 'Completed', 200.00),
(4, 1, 'Cash', 'Completed', 120.00),
(5, 1, 'Wallet', 'Refunded', 180.00);

-- Grant all privileges to the root user
GRANT ALL PRIVILEGES ON CollegeCanteen.* TO 'root'@'localhost';
FLUSH PRIVILEGES;