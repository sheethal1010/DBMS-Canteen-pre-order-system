/**
 * Canteens API - Provides endpoints for canteen data
 */

const express = require('express');
const router = express.Router();
const { promisePool } = require('../db'); // Use the existing database connection

/**
 * GET /api/canteens
 * Returns all canteens with their images
 */
router.get('/', async (req, res) => {
    try {
        // Query to get canteens with their images
        const query = `
            SELECT c.Canteen_ID, c.NAME, c.LOCATION, c.CONTACT, c.OPENING_HOURS, 
                   i.image_path, i.alt_text
            FROM Canteens c
            LEFT JOIN images i ON i.category = 'canteen' AND 
                                 (i.item_id = LOWER(REPLACE(c.NAME, ' ', '_')) OR 
                                  i.item_id = c.Canteen_ID)
            ORDER BY c.Canteen_ID
        `;
        
        // Execute the query using the promise pool
        const [rows] = await promisePool.query(query);
        
        // Send the canteens data as JSON
        res.json(rows);
    } catch (error) {
        console.error('Error fetching canteens:', error);
        res.status(500).json({ 
            error: 'Failed to fetch canteens',
            details: error.message 
        });
    }
});

/**
 * GET /api/canteens/:id
 * Returns a specific canteen by ID
 */
router.get('/:id', async (req, res) => {
    try {
        const canteenId = req.params.id;
        
        // Query to get a specific canteen with its image
        const query = `
            SELECT c.Canteen_ID, c.NAME, c.LOCATION, c.CONTACT, c.OPENING_HOURS, 
                   i.image_path, i.alt_text
            FROM Canteens c
            LEFT JOIN images i ON i.category = 'canteen' AND 
                                 (i.item_id = LOWER(REPLACE(c.NAME, ' ', '_')) OR 
                                  i.item_id = c.Canteen_ID)
            WHERE c.Canteen_ID = ?
        `;
        
        // Execute the query with the canteen ID using the promise pool
        const [rows] = await promisePool.query(query, [canteenId]);
        
        // If no canteen found with this ID
        if (rows.length === 0) {
            return res.status(404).json({ error: 'Canteen not found' });
        }
        
        // Send the canteen data as JSON
        res.json(rows[0]);
    } catch (error) {
        console.error(`Error fetching canteen ${req.params.id}:`, error);
        res.status(500).json({ 
            error: 'Failed to fetch canteen',
            details: error.message 
        });
    }
});

module.exports = router;