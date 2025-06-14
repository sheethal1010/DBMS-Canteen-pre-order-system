# College Canteen Database Integration

This document provides instructions on how to set up and use the MySQL database with the College Canteen application.

## Setup Instructions

1. **Import the Database Schema**

   Use MySQL Workbench to import the schema from `college_canteen_schema.sql`:
   
   ```
   mysql -u root -p < college_canteen_schema.sql
   ```
   
   Or open MySQL Workbench, create a new query tab, paste the contents of the file, and execute.

2. **Configure Database Connection**

   The database connection is configured in `db.js`. Make sure to update the credentials if needed:
   
   ```javascript
   const pool = mysql.createPool({
     host: 'localhost',
     user: 'root',
     password: 'system',
     database: 'CollegeCanteen',
     waitForConnections: true,
     connectionLimit: 10,
     queueLimit: 0
   });
   ```

3. **Run the Database-Enabled Server**

   ```
   npm run start:db
   ```

## API Endpoints

The application provides the following API endpoints:

### Authentication

- **Login**: `POST /api/v1/auth/login`
  ```json
  {
    "identifier": "admin@example.com",
    "password": "password123"
  }
  ```

- **Register**: `POST /api/v1/auth/register`
  ```json
  {
    "fullName": "New User",
    "email": "newuser@example.com",
    "phone": "9876543213",
    "password": "password123",
    "accountType": "Customer"
  }
  ```

### Menu and Canteens

- **Get All Menu Items**: `GET /api/v1/menu/items`
- **Get Menu Items by Canteen**: `GET /api/v1/menu/items?canteenId=1`
- **Get Menu Item by ID**: `GET /api/v1/menu/items/1`
- **Get All Canteens**: `GET /api/v1/menu/canteens`
- **Get Canteen by ID**: `GET /api/v1/menu/canteens/1`

### Cart and Orders

- **Get Cart Items**: `GET /api/v1/orders/cart/1`
- **Add Item to Cart**: `POST /api/v1/orders/cart`
  ```json
  {
    "userId": 1,
    "itemId": 1,
    "quantity": 2
  }
  ```
- **Remove Item from Cart**: `DELETE /api/v1/orders/cart/1/1`
- **Place Order**: `POST /api/v1/orders/place`
  ```json
  {
    "userId": 1,
    "canteenId": 1,
    "scheduledTime": "2023-05-25T15:00:00",
    "pickupCounter": "Counter 1"
  }
  ```
- **Get User Orders**: `GET /api/v1/orders/user/1`
- **Get Order Details**: `GET /api/v1/orders/1`

## Database Schema

The database schema includes the following tables:

1. **Customers** - Stores user information
2. **Employees** - Stores staff and admin information
3. **UserContacts** - Stores additional contact information
4. **Canteens** - Stores canteen information
5. **Inventory** - Manages stock for kitchen staff
6. **Menu** - Stores menu items for different canteens
7. **Cart** - Stores items added to cart before checkout
8. **Orders** - Stores order information
9. **OrderHistory** - Tracks completed/cancelled orders
10. **Reviews** - Stores customer ratings for menu items
11. **Images** - Stores images for various entities
12. **Payments** - Tracks payment information
13. **OrderItems** - Stores items in each order

For more details, refer to the `college_canteen_schema.sql` file.