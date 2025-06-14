const express = require('express');
const router = express.Router();
const { promisePool } = require('../db');

/**
 * GET /api/images/canteens
 * Fetch all canteen images from the database
 */
router.get('/canteens', async (req, res) => {
  try {
    const [rows] = await promisePool.query(`
      SELECT 
        item_id,
        category,
        image_path,
        description
      FROM 
        images
      WHERE 
        category = 'canteen'
    `);

    if (rows.length === 0) {
      return res.json({
        success: false,
        message: 'No canteen images found'
      });
    }

    // Format the response
    const images = rows.map(row => ({
      id: row.item_id,
      category: row.category,
      src: row.image_path,
      alt: row.description || row.item_id
    }));

    res.json({
      success: true,
      images: images
    });
  } catch (error) {
    console.error('Error fetching canteen images:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred while fetching canteen images'
    });
  }
});

/**
 * GET /api/images/carousel
 * Fetch all carousel images from the database
 */
router.get('/carousel', async (req, res) => {
  try {
    const [rows] = await promisePool.query(`
      SELECT 
        item_id,
        category,
        image_path,
        description
      FROM 
        images
      WHERE 
        category = 'carousel'
    `);

    if (rows.length === 0) {
      return res.json({
        success: false,
        message: 'No carousel images found'
      });
    }

    // Format the response
    const images = rows.map(row => ({
      src: row.image_path,
      alt: row.description || row.item_id
    }));

    res.json({
      success: true,
      images: images
    });
  } catch (error) {
    console.error('Error fetching carousel images:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred while fetching carousel images'
    });
  }
});

/**
 * GET /api/images/:category/:itemId
 * Fetch a specific image by category and item_id
 */
router.get('/:category/:itemId', async (req, res) => {
  const { category, itemId } = req.params;
  
  try {
    const [rows] = await promisePool.query(`
      SELECT 
        item_id,
        category,
        image_path,
        description
      FROM 
        images
      WHERE 
        category = ? AND item_id = ?
    `, [category, itemId]);

    if (rows.length === 0) {
      return res.json({
        success: false,
        message: 'Image not found'
      });
    }

    // Return the image data
    res.json({
      success: true,
      image: {
        id: rows[0].item_id,
        category: rows[0].category,
        src: rows[0].image_path,
        alt: rows[0].description || rows[0].item_id
      }
    });
  } catch (error) {
    console.error(`Error fetching image (${category}/${itemId}):`, error);
    res.status(500).json({
      success: false,
      message: 'An error occurred while fetching the image'
    });
  }
});

module.exports = router;