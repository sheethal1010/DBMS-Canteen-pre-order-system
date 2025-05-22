# Image Loading System for Campus Canteen

This system allows you to store and load images from the backend database instead of using direct URLs in the HTML.

## Setup Instructions

1. **Run the setup script**:
   - Navigate to `http://localhost/dbms-canteen/setup.php` in your browser
   - This will:
     - Create the database if it doesn't exist
     - Create the necessary tables
     - Create image directories
     - Download images from the source URLs

2. **Database Configuration**:
   - If needed, modify the database connection parameters in:
     - `db_connection.php`
     - `get_image.php`
     - `setup.php`
     - `update_image.php`
     - `upload_image.php`
   - Default configuration:
     - Server: localhost
     - Username: root
     - Password: (empty)
     - Database: CollegeCanteen

3. **Verify Setup**:
   - Navigate to `http://localhost/dbms-canteen/check_db.php` to verify database setup
   - This will show if the database, tables, and image records exist

## How It Works

1. **Database Storage**:
   - Images are referenced in the `images` table with categories and item IDs
   - Physical image files are stored in the `images/` directory

2. **Image Retrieval**:
   - The `get_image.php` script handles image retrieval requests
   - It accepts parameters:
     - `category`: The image category (hero, canteen, food)
     - `item_id`: The specific item identifier

3. **Frontend Integration**:
   - The `image-loader.js` script handles loading images from the backend
   - It's automatically loaded when the page loads
   - Images in HTML use data attributes instead of direct URLs:
     ```html
     <img src="" alt="Image Description" data-category="food" data-item-id="item_name">
     ```

## Managing Images

### Method 1: Using the Image Management Tools

1. **Update Existing Images**:
   - Navigate to `http://localhost/dbms-canteen/update_image.php` in your browser
   - Select the image you want to update from the dropdown
   - Enter the new image path and alt text
   - Click "Update Image"

2. **Upload New Images**:
   - Navigate to `http://localhost/dbms-canteen/upload_image.php` in your browser
   - Select the category or create a new one
   - Enter the item ID and alt text
   - Select the image file from your computer
   - Click "Upload Image"

### Method 2: Manual Updates

To manually add or update images:

1. **Replace Existing Image Files**:
   - Simply replace the file in the appropriate directory (`images/hero/`, `images/canteens/`, or `images/food/`)
   - The database will continue to point to the same file path, but the image content will be updated

2. **Add New Images via SQL**:
   - Add entries to the `images.sql` file
   - Add the image URLs to `download_images.php`
   - Run the setup script again or manually download and place the images

## HTML Integration

1. **Hero Slideshow Images**:
   ```html
   <div class="hero-slide">
     <img src="" alt="Slide Description" data-category="hero" data-item-id="slide1">
   </div>
   ```

2. **Canteen Images**:
   ```html
   <div class="canteen-card">
     <img src="" alt="Canteen Name" data-category="canteen" data-item-id="canteen_id">
   </div>
   ```

3. **Food Menu Images**:
   ```html
   <div class="menu-item">
     <img src="" alt="Food Name" data-category="food" data-item-id="food_id">
   </div>
   ```

## Troubleshooting

- If images don't load, check the browser console for errors
- Run `http://localhost/dbms-canteen/check_db.php` to verify database setup
- Verify that the image paths in the database match the actual file locations
- Ensure the web server has permission to read the image files
- Check that the image format is supported (JPG, PNG, GIF)
- Verify the image file exists in the specified directory
- Make sure all database connection parameters match in all files

## File Structure

- `images.sql`: Database schema and initial data
- `get_image.php`: API endpoint for retrieving images
- `download_images.php`: Script to download images from URLs
- `update_image.php`: Web interface to update existing images
- `upload_image.php`: Web interface to upload new images
- `check_db.php`: Utility to verify database setup
- `db_connection.php`: Database connection utilities
- `setup.php`: Setup script to initialize the system
- `js/image-loader.js`: Frontend script to load images from the backend
- `images/`: Directory containing all downloaded images

## Recent Updates

1. **Enhanced Image Loading**:
   - Added support for data attributes in HTML for easier image integration
   - Improved error handling and debugging in image-loader.js
   - Added detailed logging in get_image.php

2. **New Tools**:
   - Added upload_image.php for uploading new images
   - Added update_image.php for updating existing images
   - Added check_db.php for verifying database setup

3. **Documentation**:
   - Updated README with detailed HTML integration examples
   - Added troubleshooting section with common issues and solutions
   - Included database configuration details