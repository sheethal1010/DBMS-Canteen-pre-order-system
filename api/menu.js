const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const { pool, promisePool } = require('../db');

// Get all menu items or filter by canteen
router.get('/items', async (req, res) => {
  try {
    const canteenId = req.query.canteenId;
    
    let query = `
      SELECT m.ITEM_ID, m.ITEM_NAME, m.PRICE, m.DESCRIPTION, m.CATEGORY, 
             m.AVAILABLE, m.IMAGE_URL, c.NAME as CANTEEN_NAME
      FROM Menu m
      JOIN Canteens c ON m.Canteen_ID = c.Canteen_ID
      WHERE m.AVAILABLE = TRUE
    `;
    
    const params = [];
    
    if (canteenId) {
      query += ' AND m.Canteen_ID = ?';
      params.push(canteenId);
    }
    
    const [rows] = await promisePool.execute(query, params);
    
    // Format the response to ensure consistent property names
    const formattedItems = rows.map(item => {
      console.log(`Menu item from database: ${item.ITEM_NAME}, Image URL: ${item.IMAGE_URL}`);
      
      // Check if the image URL is an uploaded image
      if (item.IMAGE_URL && item.IMAGE_URL.startsWith('/uploads/')) {
        // Check if the file exists
        const imagePath = path.join(__dirname, '..', 'public', item.IMAGE_URL.substring(1));
        const fileExists = fs.existsSync(imagePath);
        console.log(`Image path: ${imagePath}, File exists: ${fileExists}`);
        
        // If file doesn't exist, try to find a similar file
        if (!fileExists) {
          const directory = path.dirname(imagePath);
          if (fs.existsSync(directory)) {
            const files = fs.readdirSync(directory);
            console.log(`Files in directory: ${files.join(', ')}`);
            
            // Extract the base filename without timestamp
            const filenameWithTimestamp = path.basename(item.IMAGE_URL);
            const baseFilename = filenameWithTimestamp.split('_').slice(1).join('_');
            console.log(`Looking for files similar to: ${baseFilename}`);
            
            // Find files with similar names
            const similarFiles = files.filter(file => file.includes(baseFilename));
            if (similarFiles.length > 0) {
              console.log(`Found similar files: ${similarFiles.join(', ')}`);
              // Use the first similar file
              item.IMAGE_URL = `/uploads/menu/${similarFiles[0]}`;
              console.log(`Updated image URL to: ${item.IMAGE_URL}`);
            }
          }
        }
      }
      
      return {
        ITEM_ID: item.ITEM_ID,
        ITEM_NAME: item.ITEM_NAME,
        PRICE: item.PRICE,
        DESCRIPTION: item.DESCRIPTION,
        CATEGORY: item.CATEGORY,
        AVAILABLE: item.AVAILABLE,
        IMAGE_URL: item.IMAGE_URL,
        CANTEEN_NAME: item.CANTEEN_NAME
      };
    });
    
    res.json({
      success: true,
      menuItems: formattedItems
    });
  } catch (error) {
    console.error('Error fetching menu:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred while fetching menu items'
    });
  }
});

// Get menu item by ID
router.get('/items/:id', async (req, res) => {
  try {
    const itemId = req.params.id;
    
    const query = `
      SELECT m.ITEM_ID, m.ITEM_NAME, m.PRICE, m.DESCRIPTION, m.CATEGORY, 
             m.AVAILABLE, m.IMAGE_URL, c.NAME as CANTEEN_NAME
      FROM Menu m
      JOIN Canteens c ON m.Canteen_ID = c.Canteen_ID
      WHERE m.ITEM_ID = ?
    `;
    
    const [rows] = await promisePool.execute(query, [itemId]);
    
    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Menu item not found'
      });
    }
    
    res.json({
      success: true,
      menuItem: rows[0]
    });
  } catch (error) {
    console.error('Error fetching menu item:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred while fetching the menu item'
    });
  }
});

// Get all canteens
router.get('/canteens', async (req, res) => {
  try {
    const query = `
      SELECT c.Canteen_ID, c.NAME, c.LOCATION, c.CONTACT, c.OPENING_HOURS,
             i.image_path as IMAGE_URL
      FROM Canteens c
      LEFT JOIN images i ON i.category = 'canteen' AND i.item_id = LOWER(REPLACE(c.NAME, ' ', '_'))
    `;
    
    const [rows] = await promisePool.execute(query);
    
    res.json({
      success: true,
      canteens: rows
    });
  } catch (error) {
    console.error('Error fetching canteens:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred while fetching canteens'
    });
  }
});

// Get canteen by ID
router.get('/canteens/:id', async (req, res) => {
  try {
    const canteenId = req.params.id;
    
    const query = `
      SELECT c.Canteen_ID, c.NAME, c.LOCATION, c.CONTACT, c.OPENING_HOURS,
             i.image_path as IMAGE_URL
      FROM Canteens c
      LEFT JOIN images i ON i.category = 'canteen' AND i.item_id = LOWER(REPLACE(c.NAME, ' ', '_'))
      WHERE c.Canteen_ID = ?
    `;
    
    const [rows] = await promisePool.execute(query, [canteenId]);
    
    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Canteen not found'
      });
    }
    
    res.json({
      success: true,
      canteen: rows[0]
    });
  } catch (error) {
    console.error('Error fetching canteen:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred while fetching the canteen'
    });
  }
});

// Add a new menu item
router.post('/items', async (req, res) => {
  try {
    const { name, category, price, description, available, canteenId } = req.body;
    
    // Validate required fields
    if (!name || !category || !price || !canteenId) {
      return res.status(400).json({
        success: false,
        message: 'Name, category, price, and canteen ID are required'
      });
    }
    
    // Handle image - either from existing path or uploaded file
    let imageUrl = null;
    
    // Check if an existing image path was provided
    if (req.body.existingImagePath) {
      imageUrl = req.body.existingImagePath;
      console.log(`Using existing image path: ${imageUrl}`);
    }
    // Otherwise, check if a new image was uploaded
    else if (req.files && req.files.image) {
      const image = req.files.image;
      
      // Generate a clean filename - remove spaces and special characters
      const cleanedFilename = image.name.replace(/[^a-zA-Z0-9.]/g, '_').toLowerCase();
      
      // Use a single timestamp for both the file path and database URL
      const timestamp = Date.now();
      const filename = `${timestamp}_${cleanedFilename}`;
      const uploadPath = `./public/uploads/menu/${filename}`;
      
      console.log(`Saving image: ${filename} to path: ${uploadPath}`);
      
      try {
        // Move the file to the upload directory
        await image.mv(uploadPath);
        
        // Store the relative path in the database
        imageUrl = `/uploads/menu/${filename}`;
        console.log(`Image saved successfully. Database URL: ${imageUrl}`);
      } catch (error) {
        console.error(`Error saving image: ${error.message}`);
        // Continue without the image if there's an error
      }
    }
    
    // Insert the menu item into the database
    const query = `
      INSERT INTO Menu (ITEM_NAME, PRICE, DESCRIPTION, CATEGORY, AVAILABLE, IMAGE_URL, Canteen_ID)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
    
    const [result] = await promisePool.execute(query, [
      name,
      price,
      description || null,
      category,
      available === 'true' || available === true ? 1 : 0,
      imageUrl,
      canteenId
    ]);
    
    res.json({
      success: true,
      message: 'Menu item added successfully',
      itemId: result.insertId
    });
  } catch (error) {
    console.error('Error adding menu item:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred while adding the menu item'
    });
  }
});

// Update a menu item
router.put('/items/:id', async (req, res) => {
  try {
    const itemId = req.params.id;
    const { name, category, price, description, available, canteenId } = req.body;
    
    // Validate required fields
    if (!name || !category || !price || !canteenId) {
      return res.status(400).json({
        success: false,
        message: 'Name, category, price, and canteen ID are required'
      });
    }
    
    // Check if the menu item exists and belongs to the specified canteen
    const checkQuery = `
      SELECT * FROM Menu WHERE ITEM_ID = ? AND Canteen_ID = ?
    `;
    
    const [checkResult] = await promisePool.execute(checkQuery, [itemId, canteenId]);
    
    if (checkResult.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Menu item not found or does not belong to the specified canteen'
      });
    }
    
    // Handle image - either from existing path or uploaded file
    let imageUrl = checkResult[0].IMAGE_URL;
    
    // Check if an existing image path was provided
    if (req.body.existingImagePath) {
      imageUrl = req.body.existingImagePath;
      console.log(`Using existing image path: ${imageUrl}`);
    }
    // Otherwise, check if a new image was uploaded
    else if (req.files && req.files.image) {
      const image = req.files.image;
      
      // Generate a clean filename - remove spaces and special characters
      const cleanedFilename = image.name.replace(/[^a-zA-Z0-9.]/g, '_').toLowerCase();
      
      // Use a single timestamp for both the file path and database URL
      const timestamp = Date.now();
      const filename = `${timestamp}_${cleanedFilename}`;
      const uploadPath = `./public/uploads/menu/${filename}`;
      
      console.log(`Updating image: ${filename} to path: ${uploadPath}`);
      
      try {
        // Move the file to the upload directory
        await image.mv(uploadPath);
        
        // Store the relative path in the database
        imageUrl = `/uploads/menu/${filename}`;
        console.log(`Image updated successfully. Database URL: ${imageUrl}`);
        
        // Optionally: Delete the old image file if it exists and is not a default image
        if (checkResult[0].IMAGE_URL && checkResult[0].IMAGE_URL.startsWith('/uploads/')) {
          const oldImagePath = path.join(__dirname, '..', 'public', checkResult[0].IMAGE_URL.substring(1));
          if (fs.existsSync(oldImagePath)) {
            try {
              fs.unlinkSync(oldImagePath);
              console.log(`Deleted old image: ${oldImagePath}`);
            } catch (deleteError) {
              console.error(`Error deleting old image: ${deleteError.message}`);
            }
          }
        }
      } catch (error) {
        console.error(`Error updating image: ${error.message}`);
        // Continue with the old image if there's an error
      }
    }
    
    // Update the menu item in the database
    const updateQuery = `
      UPDATE Menu
      SET ITEM_NAME = ?, PRICE = ?, DESCRIPTION = ?, CATEGORY = ?, AVAILABLE = ?, IMAGE_URL = ?
      WHERE ITEM_ID = ? AND Canteen_ID = ?
    `;
    
    await promisePool.execute(updateQuery, [
      name,
      price,
      description || null,
      category,
      available === 'true' || available === true ? 1 : 0,
      imageUrl,
      itemId,
      canteenId
    ]);
    
    res.json({
      success: true,
      message: 'Menu item updated successfully'
    });
  } catch (error) {
    console.error('Error updating menu item:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred while updating the menu item'
    });
  }
});

// Delete a menu item
router.delete('/items/:id', async (req, res) => {
  try {
    const itemId = req.params.id;
    const canteenId = req.query.canteenId;
    
    if (!canteenId) {
      return res.status(400).json({
        success: false,
        message: 'Canteen ID is required'
      });
    }
    
    // Check if the menu item exists and belongs to the specified canteen
    const checkQuery = `
      SELECT * FROM Menu WHERE ITEM_ID = ? AND Canteen_ID = ?
    `;
    
    const [checkResult] = await promisePool.execute(checkQuery, [itemId, canteenId]);
    
    if (checkResult.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Menu item not found or does not belong to the specified canteen'
      });
    }
    
    // Delete the menu item from the database
    const deleteQuery = `
      DELETE FROM Menu WHERE ITEM_ID = ? AND Canteen_ID = ?
    `;
    
    await promisePool.execute(deleteQuery, [itemId, canteenId]);
    
    res.json({
      success: true,
      message: 'Menu item deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting menu item:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred while deleting the menu item'
    });
  }
});

module.exports = router;