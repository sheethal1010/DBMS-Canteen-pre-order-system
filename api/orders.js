const express = require('express');
const router = express.Router();
const { pool, promisePool } = require('../db');

// Get dashboard statistics for admin
router.get('/stats/:canteenId', async (req, res) => {
  try {
    const canteenId = req.params.canteenId;
    console.log(`Fetching dashboard stats for canteen ID: ${canteenId}`);
    
    // First check if the canteen exists
    const canteenQuery = `SELECT * FROM Canteens WHERE Canteen_ID = ?`;
    const [canteens] = await promisePool.execute(canteenQuery, [canteenId]);
    
    if (canteens.length === 0) {
      console.log(`Canteen with ID ${canteenId} not found`);
      return res.status(404).json({
        success: false,
        message: 'Canteen not found'
      });
    }
    
    console.log(`Canteen found: ${canteens[0].NAME}`);
    
    // Get today's date in YYYY-MM-DD format
    const today = new Date().toISOString().split('T')[0];
    console.log(`Getting stats for today: ${today}`);
    
    // Initialize stats with default values
    let stats = {
      orderCount: 0,
      revenue: 0,
      menuCount: 0,
      userCount: 0
    };
    
    try {
      // Get today's orders count
      const ordersQuery = `
        SELECT COUNT(*) AS orderCount, IFNULL(SUM(TOTAL_AMOUNT), 0) AS totalRevenue
        FROM Orders
        WHERE Canteen_ID = ? 
        AND DATE(SCHEDULED_TIME) = ?
      `;
      
      const [ordersStats] = await promisePool.execute(ordersQuery, [canteenId, today]);
      console.log('Orders stats:', ordersStats);
      
      if (ordersStats && ordersStats.length > 0) {
        stats.orderCount = ordersStats[0].orderCount || 0;
        stats.revenue = ordersStats[0].totalRevenue || 0;
      }
    } catch (error) {
      console.error('Error fetching orders stats:', error);
      // Continue with other stats instead of failing completely
    }
    
    try {
      // Get total menu items count
      const menuQuery = `
        SELECT COUNT(*) AS menuCount
        FROM Menu
        WHERE Canteen_ID = ?
      `;
      
      const [menuStats] = await promisePool.execute(menuQuery, [canteenId]);
      console.log('Menu stats:', menuStats);
      
      if (menuStats && menuStats.length > 0) {
        stats.menuCount = menuStats[0].menuCount || 0;
      }
    } catch (error) {
      console.error('Error fetching menu stats:', error);
      // Continue with other stats instead of failing completely
    }
    
    try {
      // Get active users count (users who have placed orders with this canteen in the last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const thirtyDaysAgoStr = thirtyDaysAgo.toISOString().split('T')[0];
      console.log(`Getting active users since: ${thirtyDaysAgoStr}`);
      
      const usersQuery = `
        SELECT COUNT(DISTINCT USER_ID) AS userCount
        FROM Orders
        WHERE Canteen_ID = ?
        AND DATE(SCHEDULED_TIME) >= ?
      `;
      
      const [usersStats] = await promisePool.execute(usersQuery, [canteenId, thirtyDaysAgoStr]);
      console.log('Users stats:', usersStats);
      
      if (usersStats && usersStats.length > 0) {
        stats.userCount = usersStats[0].userCount || 0;
      }
    } catch (error) {
      console.error('Error fetching users stats:', error);
      // Continue with other stats instead of failing completely
    }
    
    console.log('Returning stats:', stats);
    res.json({
      success: true,
      stats: stats
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    
    // Provide more specific error messages based on the error type
    if (error.code && error.sqlMessage) {
      res.status(500).json({
        success: false,
        message: `Database error: ${error.code} - ${error.sqlMessage}`
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'An error occurred while fetching dashboard statistics: ' + error.message
      });
    }
  }
});

// Get recent orders for admin dashboard
router.get('/recent/:canteenId', async (req, res) => {
  try {
    const canteenId = req.params.canteenId;
    const limit = req.query.limit || 5; // Default to 5 recent orders
    
    console.log(`Fetching recent orders for canteen ID: ${canteenId}, limit: ${limit}`);
    
    // First check if the canteen exists
    const canteenQuery = `SELECT * FROM Canteens WHERE Canteen_ID = ?`;
    console.log('Canteen query:', canteenQuery);
    
    try {
      const [canteens] = await promisePool.execute(canteenQuery, [canteenId]);
      console.log('Canteen result:', canteens);
      
      if (canteens.length === 0) {
        console.log(`Canteen with ID ${canteenId} not found`);
        return res.status(404).json({
          success: false,
          message: 'Canteen not found'
        });
      }
      
      // Try a simpler query first to isolate the issue
      try {
        // Convert limit to integer and use directly in query
        const limitNum = parseInt(limit) || 5;
        
        const simpleQuery = `
          SELECT * FROM Orders 
          WHERE Canteen_ID = ? 
          ORDER BY SCHEDULED_TIME DESC 
          LIMIT ${limitNum}
        `;
        console.log('Simple orders query:', simpleQuery);
        
        const [simpleOrders] = await promisePool.execute(simpleQuery, [canteenId]);
        console.log('Simple orders result count:', simpleOrders.length);
        
        // Now try the full query with fixed LIMIT
        const fullQuery = `
          SELECT o.ORDER_ID, o.USER_ID, o.SCHEDULED_TIME, o.PICKUP_COUNTER, 
                 o.TOTAL_AMOUNT, o.STATUS, cu.NAME as CUSTOMER_NAME
          FROM Orders o
          LEFT JOIN Customers cu ON o.USER_ID = cu.USER_ID
          WHERE o.Canteen_ID = ?
          ORDER BY o.SCHEDULED_TIME DESC
          LIMIT ${limitNum}
        `;
        console.log('Full orders query:', fullQuery);
        
        const [orders] = await promisePool.execute(fullQuery, [canteenId]);
        console.log('Full orders result count:', orders.length);
        
        // Add item count one by one to avoid subquery issues
        for (let order of orders) {
          const countQuery = `SELECT COUNT(*) as count FROM OrderItems WHERE ORDER_ID = ?`;
          const [countResult] = await promisePool.execute(countQuery, [order.ORDER_ID]);
          order.ITEM_COUNT = countResult[0].count;
        }
        
        res.json({
          success: true,
          orders: orders
        });
      } catch (orderError) {
        console.error('Error in orders query:', orderError);
        throw orderError;
      }
    } catch (canteenError) {
      console.error('Error in canteen query:', canteenError);
      throw canteenError;
    }
  } catch (error) {
    console.error('Error fetching recent orders:', error);
    
    // Provide more specific error messages based on the error type
    if (error.code && error.sqlMessage) {
      res.status(500).json({
        success: false,
        message: `Database error: ${error.code} - ${error.sqlMessage}`
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'An error occurred while fetching recent orders: ' + error.message
      });
    }
  }
});

// Update order status
router.put('/status/:orderId', async (req, res) => {
  try {
    const orderId = req.params.orderId;
    const { status } = req.body;
    
    // Validate status
    const validStatuses = ['Pending', 'Preparing', 'Ready', 'Delivered', 'Cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Must be one of: ' + validStatuses.join(', ')
      });
    }
    
    const query = `
      UPDATE Orders
      SET STATUS = ?
      WHERE ORDER_ID = ?
    `;
    
    await promisePool.execute(query, [status, orderId]);
    
    res.json({
      success: true,
      message: `Order #${orderId} status updated to ${status}`
    });
  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred while updating order status'
    });
  }
});

// Get all orders for a canteen with filtering options
router.get('/all/:canteenId', async (req, res) => {
  try {
    const canteenId = req.params.canteenId;
    const { status, startDate, endDate, limit, offset } = req.query;
    
    let query = `
      SELECT o.ORDER_ID, o.USER_ID, o.SCHEDULED_TIME, o.PICKUP_COUNTER, 
             o.TOTAL_AMOUNT, o.STATUS, c.NAME as CUSTOMER_NAME,
             (SELECT COUNT(*) FROM OrderItems WHERE ORDER_ID = o.ORDER_ID) as ITEM_COUNT
      FROM Orders o
      LEFT JOIN Customers c ON o.USER_ID = c.USER_ID
      WHERE o.Canteen_ID = ?
    `;
    
    const params = [canteenId];
    
    // Add filters if provided
    if (status) {
      query += ` AND o.STATUS = ?`;
      params.push(status);
    }
    
    if (startDate) {
      query += ` AND DATE(o.SCHEDULED_TIME) >= ?`;
      params.push(startDate);
    }
    
    if (endDate) {
      query += ` AND DATE(o.SCHEDULED_TIME) <= ?`;
      params.push(endDate);
    }
    
    // Add ordering
    query += ` ORDER BY o.SCHEDULED_TIME DESC`;
    
    // Add pagination - directly insert values into query to avoid parameter issues
    if (limit) {
      const limitNum = parseInt(limit) || 10;
      
      if (offset) {
        const offsetNum = parseInt(offset) || 0;
        query += ` LIMIT ${limitNum} OFFSET ${offsetNum}`;
      } else {
        query += ` LIMIT ${limitNum}`;
      }
    }
    
    const [orders] = await promisePool.execute(query, params);
    
    // Get total count for pagination
    let countQuery = `
      SELECT COUNT(*) as total
      FROM Orders o
      WHERE o.Canteen_ID = ?
    `;
    
    const countParams = [canteenId];
    
    if (status) {
      countQuery += ` AND o.STATUS = ?`;
      countParams.push(status);
    }
    
    if (startDate) {
      countQuery += ` AND DATE(o.SCHEDULED_TIME) >= ?`;
      countParams.push(startDate);
    }
    
    if (endDate) {
      countQuery += ` AND DATE(o.SCHEDULED_TIME) <= ?`;
      countParams.push(endDate);
    }
    
    const [countResult] = await promisePool.execute(countQuery, countParams);
    
    res.json({
      success: true,
      orders: orders,
      total: countResult[0].total
    });
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred while fetching orders'
    });
  }
});

// Get details for a specific order
router.get('/:orderId', async (req, res) => {
  try {
    const orderId = req.params.orderId;
    
    // Get order header information
    const orderQuery = `
      SELECT o.ORDER_ID, o.USER_ID, o.SCHEDULED_TIME, o.PICKUP_COUNTER, 
             o.TOTAL_AMOUNT, o.STATUS, o.PAYMENT_METHOD, c.NAME as CUSTOMER_NAME,
             c.PHONE as CUSTOMER_PHONE, c.EMAIL as CUSTOMER_EMAIL
      FROM Orders o
      LEFT JOIN Customers c ON o.USER_ID = c.USER_ID
      WHERE o.ORDER_ID = ?
    `;
    
    const [orderDetails] = await promisePool.execute(orderQuery, [orderId]);
    
    if (orderDetails.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }
    
    // Get order items
    const itemsQuery = `
      SELECT oi.ITEM_ID, oi.QUANTITY, oi.SUBTOTAL, 
             m.ITEM_NAME, m.DESCRIPTION, m.PRICE, m.IMAGE_URL
      FROM OrderItems oi
      LEFT JOIN Menu m ON oi.ITEM_ID = m.ITEM_ID
      WHERE oi.ORDER_ID = ?
    `;
    
    const [orderItems] = await promisePool.execute(itemsQuery, [orderId]);
    
    res.json({
      success: true,
      orderDetails: orderDetails[0],
      orderItems: orderItems
    });
  } catch (error) {
    console.error('Error fetching order details:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred while fetching order details'
    });
  }
});

// Get cart items for a user
router.get('/cart/:userId', async (req, res) => {
  try {
    const userId = req.params.userId;
    
    const query = `
      SELECT c.USER_ID, c.ITEM_ID, c.ITEM_NAME, c.DESCRIPTION, 
             c.PRICE, c.QUANTITY, c.TOTAL, m.IMAGE_URL
      FROM Cart c
      LEFT JOIN Menu m ON c.ITEM_ID = m.ITEM_ID
      WHERE c.USER_ID = ?
    `;
    
    const [rows] = await promisePool.execute(query, [userId]);
    
    res.json({
      success: true,
      cartItems: rows
    });
  } catch (error) {
    console.error('Error fetching cart:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred while fetching cart items'
    });
  }
});

// Add item to cart
router.post('/cart', async (req, res) => {
  try {
    const { userId, itemId, quantity } = req.body;
    
    // Get menu item details
    const menuQuery = `
      SELECT ITEM_NAME, DESCRIPTION, PRICE
      FROM Menu
      WHERE ITEM_ID = ?
    `;
    
    const [menuItems] = await promisePool.execute(menuQuery, [itemId]);
    
    if (menuItems.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Menu item not found'
      });
    }
    
    const menuItem = menuItems[0];
    const total = menuItem.PRICE * quantity;
    
    // Check if item already exists in cart
    const checkQuery = `
      SELECT * FROM Cart
      WHERE USER_ID = ? AND ITEM_ID = ?
    `;
    
    const [existingItems] = await promisePool.execute(checkQuery, [userId, itemId]);
    
    if (existingItems.length > 0) {
      // Update existing cart item
      const updateQuery = `
        UPDATE Cart
        SET QUANTITY = ?, TOTAL = ?
        WHERE USER_ID = ? AND ITEM_ID = ?
      `;
      
      await promisePool.execute(updateQuery, [quantity, total, userId, itemId]);
    } else {
      // Insert new cart item
      const insertQuery = `
        INSERT INTO Cart (USER_ID, ITEM_ID, ITEM_NAME, DESCRIPTION, PRICE, QUANTITY, TOTAL)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `;
      
      await promisePool.execute(
        insertQuery, 
        [userId, itemId, menuItem.ITEM_NAME, menuItem.DESCRIPTION, menuItem.PRICE, quantity, total]
      );
    }
    
    res.json({
      success: true,
      message: 'Item added to cart successfully'
    });
  } catch (error) {
    console.error('Error adding to cart:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred while adding item to cart'
    });
  }
});

// Remove item from cart
router.delete('/cart/:userId/:itemId', async (req, res) => {
  try {
    const { userId, itemId } = req.params;
    
    const query = `
      DELETE FROM Cart
      WHERE USER_ID = ? AND ITEM_ID = ?
    `;
    
    await promisePool.execute(query, [userId, itemId]);
    
    res.json({
      success: true,
      message: 'Item removed from cart successfully'
    });
  } catch (error) {
    console.error('Error removing from cart:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred while removing item from cart'
    });
  }
});

// Place an order
router.post('/place', async (req, res) => {
  try {
    console.log('Received order request with body:', JSON.stringify(req.body, null, 2));
    
    const { userId, canteenId, scheduledTime: rawScheduledTime, pickupCounter, paymentMethod: rawPaymentMethod = 'Cash', cartItems: requestCartItems } = req.body;
    
    // Convert the scheduled time to a proper MySQL datetime format
    let scheduledTime;
    try {
      // Check if this is a time-only format like "10:52 pm"
      if (rawScheduledTime.toLowerCase().includes('am') || rawScheduledTime.toLowerCase().includes('pm')) {
        // Extract hours and minutes
        const timeRegex = /(\d+):(\d+)\s*(am|pm)/i;
        const match = rawScheduledTime.match(timeRegex);
        
        if (match) {
          let hours = parseInt(match[1]);
          const minutes = parseInt(match[2]);
          const period = match[3].toLowerCase();
          
          // Convert to 24-hour format
          if (period === 'pm' && hours < 12) {
            hours += 12;
          } else if (period === 'am' && hours === 12) {
            hours = 0;
          }
          
          // Create a full datetime string with today's date
          const today = new Date();
          const year = today.getFullYear();
          const month = String(today.getMonth() + 1).padStart(2, '0');
          const day = String(today.getDate()).padStart(2, '0');
          
          // Format time parts with leading zeros
          const hoursStr = String(hours).padStart(2, '0');
          const minutesStr = String(minutes).padStart(2, '0');
          
          scheduledTime = `${year}-${month}-${day} ${hoursStr}:${minutesStr}:00`;
          console.log(`Converted time from "${rawScheduledTime}" to "${scheduledTime}"`);
        } else {
          throw new Error(`Failed to parse time format: ${rawScheduledTime}`);
        }
      } else {
        // Assume it's already in a valid format
        scheduledTime = rawScheduledTime;
      }
    } catch (timeError) {
      console.error('Error parsing scheduled time:', timeError);
      // Default to 1 hour from now as a fallback
      const defaultTime = new Date();
      defaultTime.setHours(defaultTime.getHours() + 1);
      scheduledTime = defaultTime.toISOString().slice(0, 19).replace('T', ' ');
      console.log(`Using default scheduled time: ${scheduledTime}`);
    }
    
    // Map payment method to one of the allowed values in the database
    let paymentMethod;
    if (rawPaymentMethod.toLowerCase() === 'card') {
      paymentMethod = 'Credit Card/Debit Card';
    } else if (rawPaymentMethod.toLowerCase() === 'upi') {
      paymentMethod = 'UPI';
    } else {
      paymentMethod = 'Cash';
    }
    
    console.log(`Payment method mapped from "${rawPaymentMethod}" to "${paymentMethod}"`);
    
    console.log('Parsed request data:', {
      userId,
      canteenId,
      rawScheduledTime,
      scheduledTime, // Now converted to proper MySQL format
      pickupCounter,
      paymentMethod,
      cartItemsCount: requestCartItems ? requestCartItems.length : 0
    });
    
    let cartItems;
    
    // Check if cart items are provided in the request
    if (requestCartItems && requestCartItems.length > 0) {
      console.log('Using cart items from request');
      cartItems = requestCartItems;
    } else {
      console.log('Fetching cart items from database');
      // Get cart items from the database
      const cartQuery = `
        SELECT * FROM Cart
        WHERE USER_ID = ?
      `;
      
      const [dbCartItems] = await promisePool.execute(cartQuery, [userId]);
      
      if (dbCartItems.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Cart is empty'
        });
      }
      
      cartItems = dbCartItems;
    }
    
    // Get customer name from Customers table
    try {
      const userQuery = `
        SELECT NAME FROM Customers
        WHERE USER_ID = ?
      `;
      
      const [userRows] = await promisePool.execute(userQuery, [userId]);
      if (userRows.length === 0) {
        console.warn(`User with ID ${userId} not found in database. Using "Unknown Customer" as name.`);
      }
      
      // Continue with the order even if the user is not found
    } catch (userError) {
      console.error('Error fetching user name:', userError);
      // Continue with the order despite the error
    }
    
    // Calculate total amount
    let totalAmount;
    
    if (requestCartItems && requestCartItems.length > 0) {
      // If cart items came from the request, they may have a different structure
      totalAmount = cartItems.reduce((sum, item) => {
        // Check if we have price and quantity (from frontend) or PRICE and TOTAL (from database)
        if (item.price && item.quantity) {
          return sum + (item.price * item.quantity);
        } else if (item.TOTAL) {
          return sum + item.TOTAL;
        }
        return sum;
      }, 0);
    } else {
      // If cart items came from the database
      totalAmount = cartItems.reduce((sum, item) => sum + item.TOTAL, 0);
    }
    
    // Start transaction
    await promisePool.query('START TRANSACTION');
    
    // Get customer name from Customers table for the order
    let customerName = 'Unknown Customer';
    try {
      const nameQuery = `SELECT NAME FROM Customers WHERE USER_ID = ?`;
      const [nameResult] = await promisePool.execute(nameQuery, [userId]);
      if (nameResult && nameResult.length > 0) {
        customerName = nameResult[0].NAME;
        console.log(`Found customer name: ${customerName} for user ID: ${userId}`);
      }
    } catch (nameError) {
      console.warn(`Could not retrieve customer name for user ${userId}:`, nameError);
      // Continue with "Unknown Customer"
    }

    // Create order with customer name
    let orderQuery;
    let queryParams;
    
    // Try to include CUSTOMER_NAME if the column exists
    try {
      orderQuery = `
        INSERT INTO Orders (USER_ID, CUSTOMER_NAME, Canteen_ID, SCHEDULED_TIME, PICKUP_COUNTER, TOTAL_AMOUNT)
        VALUES (?, ?, ?, ?, ?, ?)
      `;
      queryParams = [userId, customerName, canteenId, scheduledTime, pickupCounter, totalAmount];
    } catch (error) {
      // If the column doesn't exist, fall back to the original query
      console.warn('CUSTOMER_NAME column might not exist, using fallback query:', error);
      orderQuery = `
        INSERT INTO Orders (USER_ID, Canteen_ID, SCHEDULED_TIME, PICKUP_COUNTER, TOTAL_AMOUNT)
        VALUES (?, ?, ?, ?, ?)
      `;
      queryParams = [userId, canteenId, scheduledTime, pickupCounter, totalAmount];
    }
    
    let orderId;
    try {
      const [orderResult] = await promisePool.execute(orderQuery, queryParams);
      
      if (!orderResult || !orderResult.insertId) {
        throw new Error('Failed to insert order - no insertId returned');
      }
      
      orderId = orderResult.insertId;
      console.log(`Successfully created order with ID: ${orderId}`);
    } catch (orderInsertError) {
      console.error('Error inserting order:', orderInsertError);
      throw orderInsertError; // Re-throw to be caught by the main try/catch
    }
    
    // Add order items
    let successfulItems = 0;
    for (const item of cartItems) {
      try {
        // Handle both frontend and database formats
        let itemId = item.ITEM_ID || item.itemId || item.id;
        console.log('Item data:', JSON.stringify(item));
        const quantity = item.QUANTITY || item.quantity || 1; // Default to 1 if no quantity specified
        let subtotal;
      
      if (item.TOTAL) {
        subtotal = item.TOTAL;
      } else if (item.price && item.quantity) {
        subtotal = item.price * item.quantity;
      } else {
        subtotal = 0; // Default fallback
      }
      
      // If itemId is missing but name is present, try to find the item in the menu
      if (!itemId && (item.name || item.ITEM_NAME)) {
        const itemName = item.name || item.ITEM_NAME;
        console.log(`Looking up item by name: "${itemName}"`);
        
        const findItemQuery = `
          SELECT ITEM_ID FROM Menu
          WHERE ITEM_NAME LIKE ?
          LIMIT 1
        `;
        
        const [menuItems] = await promisePool.execute(findItemQuery, [`%${itemName}%`]);
        if (menuItems.length > 0) {
          itemId = menuItems[0].ITEM_ID;
          console.log(`Found item ID ${itemId} for name "${itemName}"`);
        } else {
          console.error(`Could not find menu item with name: "${itemName}"`);
          // Try with a more relaxed search
          const relaxedQuery = `
            SELECT ITEM_ID, ITEM_NAME FROM Menu
            WHERE ITEM_NAME LIKE ?
            LIMIT 5
          `;
          
          const [relaxedResults] = await promisePool.execute(relaxedQuery, [`%${itemName.substring(0, 3)}%`]);
          console.log(`Relaxed search results for "${itemName}":`, relaxedResults);
          
          if (relaxedResults.length > 0) {
            itemId = relaxedResults[0].ITEM_ID;
            console.log(`Using closest match: ${relaxedResults[0].ITEM_NAME} (ID: ${itemId})`);
          } else {
            continue; // Skip this item if we can't find an ID
          }
        }
      }
      
      console.log('Processing item:', {
        itemId,
        name: item.name || item.ITEM_NAME,
        quantity,
        subtotal,
        originalItem: JSON.stringify(item)
      });
      
      if (!itemId) {
        console.error('Missing item ID, skipping item');
        continue;
      }
      
      const orderItemQuery = `
        INSERT INTO OrderItems (ORDER_ID, ITEM_ID, QUANTITY, SUBTOTAL)
        VALUES (?, ?, ?, ?)
      `;
      
      await promisePool.execute(
        orderItemQuery, 
        [orderId, itemId, quantity, subtotal]
      );
      
      successfulItems++;
    } catch (itemError) {
      console.error(`Error processing item:`, itemError);
      console.error(`Item data:`, JSON.stringify(item));
      // Continue with other items despite this error
    }
    }
    
    // Create payment record
    const paymentQuery = `
      INSERT INTO Payments (ORDER_ID, USER_ID, PAYMENT_METHOD, PAYMENT_STATUS, AMOUNT)
      VALUES (?, ?, ?, ?, ?)
    `;
    
    await promisePool.execute(
      paymentQuery, 
      [orderId, userId, paymentMethod, 'Completed', totalAmount]
    );
    
    // Clear cart
    const clearCartQuery = `
      DELETE FROM Cart
      WHERE USER_ID = ?
    `;
    
    await promisePool.execute(clearCartQuery, [userId]);
    
    // Check if any items were successfully added
    if (successfulItems === 0) {
      console.error('No items were successfully added to the order');
      await promisePool.query('ROLLBACK');
      return res.status(400).json({
        success: false,
        message: 'Failed to add any items to the order'
      });
    }
    
    // Commit transaction
    await promisePool.query('COMMIT');
    
    console.log(`Order ${orderId} completed successfully with ${successfulItems} items`);
    res.json({
      success: true,
      message: 'Order placed successfully',
      orderId: orderId
    });
  } catch (error) {
    // Rollback transaction
    await promisePool.query('ROLLBACK');
    
    console.error('Error placing order:', error);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    
    if (error.code) {
      console.error('SQL Error Code:', error.code);
      console.error('SQL Error Number:', error.errno);
      console.error('SQL Error SQLState:', error.sqlState);
      console.error('SQL Error SQLMessage:', error.sqlMessage);
    }
    
    res.status(500).json({
      success: false,
      message: 'An error occurred while placing the order',
      error: error.message // Include error message for debugging
    });
  }
});

// Get user orders
router.get('/user/:userId', async (req, res) => {
  try {
    const userId = req.params.userId;
    
    const query = `
      SELECT o.ORDER_ID, o.CUSTOMER_NAME, o.Canteen_ID, c.NAME as CANTEEN_NAME, 
             o.ORDER_DATE, o.SCHEDULED_TIME, o.PICKUP_COUNTER, 
             o.STATUS, o.TOTAL_AMOUNT
      FROM Orders o
      JOIN Canteens c ON o.Canteen_ID = c.Canteen_ID
      WHERE o.USER_ID = ?
      ORDER BY o.ORDER_DATE DESC
    `;
    
    const [rows] = await promisePool.execute(query, [userId]);
    
    res.json({
      success: true,
      orders: rows
    });
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred while fetching orders'
    });
  }
});

// Get order details
router.get('/:orderId', async (req, res) => {
  try {
    const orderId = req.params.orderId;
    
    // Get order details
    const orderQuery = `
      SELECT o.ORDER_ID, o.USER_ID, o.CUSTOMER_NAME, o.Canteen_ID, c.NAME as CANTEEN_NAME, 
             o.ORDER_DATE, o.SCHEDULED_TIME, o.PICKUP_COUNTER, 
             o.STATUS, o.TOTAL_AMOUNT
      FROM Orders o
      JOIN Canteens c ON o.Canteen_ID = c.Canteen_ID
      WHERE o.ORDER_ID = ?
    `;
    
    const [orders] = await promisePool.execute(orderQuery, [orderId]);
    
    if (orders.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }
    
    // Get order items
    const itemsQuery = `
      SELECT oi.ITEM_ID, m.ITEM_NAME, oi.QUANTITY, oi.SUBTOTAL, m.IMAGE_URL
      FROM OrderItems oi
      JOIN Menu m ON oi.ITEM_ID = m.ITEM_ID
      WHERE oi.ORDER_ID = ?
    `;
    
    const [items] = await promisePool.execute(itemsQuery, [orderId]);
    
    // Get payment details
    const paymentQuery = `
      SELECT PAYMENT_ID, PAYMENT_METHOD, PAYMENT_STATUS, AMOUNT, TRANSACTION_ID, PAYMENT_DATE
      FROM Payments
      WHERE ORDER_ID = ?
    `;
    
    const [payments] = await promisePool.execute(paymentQuery, [orderId]);
    
    res.json({
      success: true,
      order: orders[0],
      items: items,
      payment: payments.length > 0 ? payments[0] : null
    });
  } catch (error) {
    console.error('Error fetching order details:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred while fetching order details'
    });
  }
});

// Update order status
router.put('/status/:orderId', async (req, res) => {
  try {
    const orderId = req.params.orderId;
    const { status } = req.body;
    
    // Validate status
    const validOrderStatuses = ['Pending', 'Preparing', 'Ready', 'Collected', 'Not Picked Up', 'Cancelled'];
    const validHistoryStatuses = ['Picked Up', 'Not Picked Up', 'Cancelled'];
    
    if (!validOrderStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid order status'
      });
    }
    
    // Start transaction
    await promisePool.query('START TRANSACTION');
    
    // Update order status
    const updateOrderQuery = `
      UPDATE Orders
      SET STATUS = ?
      WHERE ORDER_ID = ?
    `;
    
    await promisePool.execute(updateOrderQuery, [status, orderId]);
    
    // Map Orders status to OrderHistory status
    let historyStatus;
    if (status === 'Collected') {
      historyStatus = 'Picked Up';
    } else if (status === 'Not Picked Up') {
      historyStatus = 'Not Picked Up';
    } else if (status === 'Cancelled') {
      historyStatus = 'Cancelled';
    }
    
    // If the status maps to a valid history status, update or insert into OrderHistory
    if (historyStatus) {
      // Check if order already exists in OrderHistory
      const checkHistoryQuery = `
        SELECT * FROM OrderHistory
        WHERE ORDER_ID = ?
      `;
      
      const [historyRecords] = await promisePool.execute(checkHistoryQuery, [orderId]);
      
      if (historyRecords.length > 0) {
        // Update existing history record
        const updateHistoryQuery = `
          UPDATE OrderHistory
          SET STATUS = ?
          WHERE ORDER_ID = ?
        `;
        
        await promisePool.execute(updateHistoryQuery, [historyStatus, orderId]);
      } else {
        // Get order details to insert into history
        const orderQuery = `
          SELECT USER_ID, CUSTOMER_NAME, Canteen_ID, TOTAL_AMOUNT
          FROM Orders
          WHERE ORDER_ID = ?
        `;
        
        const [orders] = await promisePool.execute(orderQuery, [orderId]);
        
        if (orders.length > 0) {
          const order = orders[0];
          
          // Insert into OrderHistory
          const insertHistoryQuery = `
            INSERT INTO OrderHistory (ORDER_ID, USER_ID, CUSTOMER_NAME, CANTEEN_ID, TOTAL_AMOUNT, STATUS)
            VALUES (?, ?, ?, ?, ?, ?)
          `;
          
          await promisePool.execute(
            insertHistoryQuery,
            [orderId, order.USER_ID, order.CUSTOMER_NAME, order.Canteen_ID, order.TOTAL_AMOUNT, historyStatus]
          );
        }
      }
    }
    
    // Commit transaction
    await promisePool.query('COMMIT');
    
    res.json({
      success: true,
      message: 'Order status updated successfully'
    });
  } catch (error) {
    // Rollback transaction
    await promisePool.query('ROLLBACK');
    
    console.error('Error updating order status:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred while updating order status'
    });
  }
});

// Migrate orders data to order history (one-time function to populate OrderHistory)
router.post('/migrate-to-history', async (req, res) => {
  try {
    // Start transaction
    await promisePool.query('START TRANSACTION');
    
    // Get all completed/cancelled orders that are not in OrderHistory yet
    const ordersQuery = `
      SELECT o.ORDER_ID, o.USER_ID, o.CUSTOMER_NAME, o.Canteen_ID, o.TOTAL_AMOUNT, 
             o.STATUS, o.ORDER_DATE, o.SCHEDULED_TIME
      FROM Orders o
      LEFT JOIN OrderHistory oh ON o.ORDER_ID = oh.ORDER_ID
      WHERE oh.ORDER_ID IS NULL 
      AND (o.STATUS = 'Collected' OR o.STATUS = 'Not Picked Up' OR o.STATUS = 'Cancelled')
    `;
    
    const [orders] = await promisePool.execute(ordersQuery);
    
    console.log(`Found ${orders.length} orders to migrate to history`);
    
    if (orders.length === 0) {
      await promisePool.query('COMMIT');
      return res.json({
        success: true,
        message: 'No orders to migrate',
        migratedCount: 0
      });
    }
    
    // Insert each order into OrderHistory
    let migratedCount = 0;
    
    for (const order of orders) {
      // Map Orders status to OrderHistory status
      let historyStatus;
      if (order.STATUS === 'Collected') {
        historyStatus = 'Picked Up';
      } else if (order.STATUS === 'Not Picked Up') {
        historyStatus = 'Not Picked Up';
      } else if (order.STATUS === 'Cancelled') {
        historyStatus = 'Cancelled';
      } else {
        // Skip orders with non-mappable statuses
        continue;
      }
      
      // Get order items as a comma-separated string for the items_name field
      const itemsQuery = `
        SELECT m.ITEM_NAME, oi.QUANTITY
        FROM OrderItems oi
        JOIN Menu m ON oi.ITEM_ID = m.ITEM_ID
        WHERE oi.ORDER_ID = ?
      `;
      
      const [items] = await promisePool.execute(itemsQuery, [order.ORDER_ID]);
      
      const itemsNameString = items.map(item => 
        `${item.ITEM_NAME} (x${item.QUANTITY})`
      ).join(', ');
      
      // Insert into OrderHistory
      const insertQuery = `
        INSERT INTO OrderHistory 
        (ORDER_ID, USER_ID, CUSTOMER_NAME, CANTEEN_ID, items_name, ORDER_DATE, TOTAL_AMOUNT, STATUS)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `;
      
      await promisePool.execute(
        insertQuery, 
        [
          order.ORDER_ID, 
          order.USER_ID, 
          order.CUSTOMER_NAME || 'Customer', 
          order.Canteen_ID, 
          itemsNameString,
          order.ORDER_DATE || new Date(),
          order.TOTAL_AMOUNT,
          historyStatus
        ]
      );
      
      migratedCount++;
    }
    
    // Commit transaction
    await promisePool.query('COMMIT');
    
    res.json({
      success: true,
      message: `Successfully migrated ${migratedCount} orders to history`,
      migratedCount
    });
  } catch (error) {
    // Rollback transaction
    await promisePool.query('ROLLBACK');
    
    console.error('Error migrating orders to history:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Get order history
router.get('/history/:userId', async (req, res) => {
  try {
    const userId = req.params.userId;
    
    // First get the basic order history info
    const orderQuery = `
      SELECT oh.HISTORY_ID, oh.ORDER_ID, oh.USER_ID, oh.CUSTOMER_NAME, oh.CANTEEN_ID, 
             c.NAME as CANTEEN_NAME, oh.ORDER_DATE, oh.TOTAL_AMOUNT, oh.STATUS,
             oh.items_name, o.SCHEDULED_TIME, o.PICKUP_COUNTER,
             p.PAYMENT_METHOD, p.PAYMENT_STATUS
      FROM OrderHistory oh
      JOIN Canteens c ON oh.CANTEEN_ID = c.Canteen_ID
      LEFT JOIN Orders o ON oh.ORDER_ID = o.ORDER_ID
      LEFT JOIN Payments p ON oh.ORDER_ID = p.ORDER_ID
      WHERE oh.USER_ID = ?
      ORDER BY oh.ORDER_DATE DESC
    `;
    
    const [orders] = await promisePool.execute(orderQuery, [userId]);
    
    // If no order history found, try to get some from Orders table
    if (orders.length === 0) {
      // Get orders for this user
      const activeOrdersQuery = `
        SELECT o.ORDER_ID, o.USER_ID, o.CUSTOMER_NAME, o.Canteen_ID, 
               c.NAME as CANTEEN_NAME, o.ORDER_DATE, o.SCHEDULED_TIME, o.PICKUP_COUNTER,
               o.TOTAL_AMOUNT, o.STATUS,
               p.PAYMENT_METHOD, p.PAYMENT_STATUS
        FROM Orders o
        JOIN Canteens c ON o.Canteen_ID = c.Canteen_ID
        LEFT JOIN Payments p ON o.ORDER_ID = p.ORDER_ID
        WHERE o.USER_ID = ?
        ORDER BY o.ORDER_DATE DESC
      `;
      
      const [activeOrders] = await promisePool.execute(activeOrdersQuery, [userId]);
      
      // Format active orders to match order history structure
      const formattedActiveOrders = await Promise.all(activeOrders.map(async (order) => {
        // Get order items
        const itemsQuery = `
          SELECT oi.ORDER_ID, oi.ITEM_ID, oi.QUANTITY, oi.SUBTOTAL,
                 m.ITEM_NAME, m.PRICE, m.CATEGORY, m.IMAGE_URL as image_path
          FROM OrderItems oi
          JOIN Menu m ON oi.ITEM_ID = m.ITEM_ID
          WHERE oi.ORDER_ID = ?
        `;
        
        const [items] = await promisePool.execute(itemsQuery, [order.ORDER_ID]);
        
        // Create items_name string
        const itemsNameString = items.map(item => 
          `${item.ITEM_NAME} (x${item.QUANTITY})`
        ).join(', ');
        
        return {
          HISTORY_ID: null,
          ORDER_ID: order.ORDER_ID,
          USER_ID: order.USER_ID,
          CUSTOMER_NAME: order.CUSTOMER_NAME,
          CANTEEN_ID: order.Canteen_ID,
          CANTEEN_NAME: order.CANTEEN_NAME,
          ORDER_DATE: order.ORDER_DATE,
          SCHEDULED_TIME: order.SCHEDULED_TIME,
          PICKUP_COUNTER: order.PICKUP_COUNTER,
          TOTAL_AMOUNT: order.TOTAL_AMOUNT,
          STATUS: order.STATUS,
          PAYMENT_METHOD: order.PAYMENT_METHOD,
          PAYMENT_STATUS: order.PAYMENT_STATUS,
          items_name: itemsNameString,
          items: items
        };
      }));
      
      return res.json({
        success: true,
        orderHistory: formattedActiveOrders
      });
    }
    
    // For completed orders in OrderHistory, get the ordered items if needed
    const ordersWithItems = await Promise.all(orders.map(async (order) => {
      // If we already have items_name, we can skip fetching items details
      if (order.items_name) {
        return {
          ...order,
          items: [] // Empty array since we have the items_name summary
        };
      }
      
      // Otherwise get details from OrderItems
      const itemsQuery = `
        SELECT oi.ORDER_ID, oi.ITEM_ID, oi.QUANTITY, oi.SUBTOTAL,
               m.ITEM_NAME, m.PRICE, m.CATEGORY, m.IMAGE_URL as image_path
        FROM OrderItems oi
        JOIN Menu m ON oi.ITEM_ID = m.ITEM_ID
        WHERE oi.ORDER_ID = ?
      `;
      
      try {
        const [items] = await promisePool.execute(itemsQuery, [order.ORDER_ID]);
        return {
          ...order,
          items: items
        };
      } catch (err) {
        console.error(`Error fetching items for order ${order.ORDER_ID}:`, err);
        return {
          ...order,
          items: []
        };
      }
    }));
    
    res.json({
      success: true,
      orderHistory: ordersWithItems
    });
  } catch (error) {
    console.error('Error fetching order history:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Update order status in OrderHistory
router.put('/history/:orderId/status', async (req, res) => {
  try {
    const orderId = req.params.orderId;
    const { status } = req.body;
    
    // Validate status
    const validStatuses = ['Picked Up', 'Not Picked Up', 'Cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`
      });
    }
    
    // Update status in OrderHistory
    const query = `
      UPDATE OrderHistory 
      SET STATUS = ?
      WHERE ORDER_ID = ?
    `;
    
    const [result] = await promisePool.execute(query, [status, orderId]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: `Order with ID ${orderId} not found in OrderHistory`
      });
    }
    
    // If order is marked as cancelled, also update the Orders table
    if (status === 'Cancelled') {
      const orderQuery = `
        UPDATE Orders
        SET STATUS = 'Cancelled'
        WHERE ORDER_ID = ?
      `;
      
      await promisePool.execute(orderQuery, [orderId]);
    }
    
    res.json({
      success: true,
      message: `Order status updated to ${status}`
    });
  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Get customer analysis (active vs inactive)
router.get('/customer-analysis/:canteenId', async (req, res) => {
  try {
    const canteenId = req.params.canteenId;
    
    // First check if the canteen exists
    const canteenQuery = `SELECT * FROM Canteens WHERE Canteen_ID = ?`;
    const [canteens] = await promisePool.execute(canteenQuery, [canteenId]);
    
    if (canteens.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Canteen not found'
      });
    }
    
    // Calculate date 30 days ago
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const thirtyDaysAgoStr = thirtyDaysAgo.toISOString().split('T')[0];
    
    // Get all customers
    const allCustomersQuery = `
      SELECT USER_ID, NAME, EMAIL, PHONE, REGISTRATION_DATE
      FROM Customers
      WHERE ROLE = 'Customer'
    `;
    
    const [allCustomers] = await promisePool.execute(allCustomersQuery);
    
    // Get active customers (ordered in last 30 days for this canteen)
    const activeCustomersQuery = `
      SELECT DISTINCT c.USER_ID, c.NAME, c.EMAIL, c.PHONE, c.REGISTRATION_DATE,
             (SELECT COUNT(*) FROM Orders WHERE USER_ID = c.USER_ID AND Canteen_ID = ?) as order_count,
             (SELECT MAX(SCHEDULED_TIME) FROM Orders WHERE USER_ID = c.USER_ID AND Canteen_ID = ?) as last_order_date
      FROM Customers c
      JOIN Orders o ON c.USER_ID = o.USER_ID
      WHERE o.Canteen_ID = ?
      AND DATE(o.SCHEDULED_TIME) >= ?
      AND c.ROLE = 'Customer'
    `;
    
    const [activeCustomers] = await promisePool.execute(activeCustomersQuery, [
      canteenId, canteenId, canteenId, thirtyDaysAgoStr
    ]);
    
    // Create a set of active customer IDs for easy lookup
    const activeCustomerIds = new Set(activeCustomers.map(customer => customer.USER_ID));
    
    // Filter inactive customers (all customers minus active customers)
    const inactiveCustomers = allCustomers.filter(customer => !activeCustomerIds.has(customer.USER_ID));
    
    // For inactive customers, get their last order if any
    for (const customer of inactiveCustomers) {
      const lastOrderQuery = `
        SELECT MAX(SCHEDULED_TIME) as last_order_date, COUNT(*) as order_count
        FROM Orders
        WHERE USER_ID = ? AND Canteen_ID = ?
      `;
      
      const [lastOrderResult] = await promisePool.execute(lastOrderQuery, [customer.USER_ID, canteenId]);
      customer.last_order_date = lastOrderResult[0].last_order_date;
      customer.order_count = lastOrderResult[0].order_count || 0;
    }
    
    // Summary statistics
    const summary = {
      total_customers: allCustomers.length,
      active_customers: activeCustomers.length,
      inactive_customers: inactiveCustomers.length,
      active_percentage: allCustomers.length > 0 ? (activeCustomers.length / allCustomers.length * 100).toFixed(2) : "0.00"
    };
    
    res.json({
      success: true,
      summary,
      active_customers: activeCustomers,
      inactive_customers: inactiveCustomers
    });
  } catch (error) {
    console.error('Error fetching customer analysis:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred while fetching customer analysis'
    });
  }
});

// Generate downloadable customer report
router.get('/customer-report/:canteenId', async (req, res) => {
  try {
    const canteenId = req.params.canteenId;
    
    // Calculate date 30 days ago
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const thirtyDaysAgoStr = thirtyDaysAgo.toISOString().split('T')[0];
    
    // Get canteen info
    const canteenQuery = `
      SELECT NAME FROM Canteens WHERE Canteen_ID = ?
    `;
    
    const [canteens] = await promisePool.execute(canteenQuery, [canteenId]);
    
    if (canteens.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Canteen not found'
      });
    }
    
    const canteenName = canteens[0].NAME;
    
    // Get all customers with their order status
    const customersQuery = `
      SELECT c.USER_ID, c.NAME, c.EMAIL, c.PHONE, c.REGISTRATION_DATE,
             (SELECT COUNT(*) FROM Orders WHERE USER_ID = c.USER_ID AND Canteen_ID = ?) as total_orders,
             (SELECT SUM(TOTAL_AMOUNT) FROM Orders WHERE USER_ID = c.USER_ID AND Canteen_ID = ?) as total_spent,
             (SELECT MAX(SCHEDULED_TIME) FROM Orders WHERE USER_ID = c.USER_ID AND Canteen_ID = ?) as last_order_date,
             CASE 
               WHEN EXISTS (
                 SELECT 1 FROM Orders 
                 WHERE USER_ID = c.USER_ID 
                 AND Canteen_ID = ? 
                 AND DATE(SCHEDULED_TIME) >= ?
               ) THEN 'Active' 
               ELSE 'Inactive' 
             END as status
      FROM Customers c
      WHERE c.ROLE = 'Customer'
      ORDER BY status, total_orders DESC
    `;
    
    const [customers] = await promisePool.execute(customersQuery, [
      canteenId, canteenId, canteenId, canteenId, thirtyDaysAgoStr
    ]);
    
    // Count active and inactive customers
    const activeCustomers = customers.filter(c => c.status === 'Active');
    const inactiveCustomers = customers.filter(c => c.status === 'Inactive');
    
    // Format dates for report
    customers.forEach(customer => {
      if (customer.last_order_date) {
        const date = new Date(customer.last_order_date);
        customer.last_order_date = date.toLocaleDateString();
      } else {
        customer.last_order_date = 'Never';
      }
      
      if (customer.REGISTRATION_DATE) {
        const date = new Date(customer.REGISTRATION_DATE);
        customer.REGISTRATION_DATE = date.toLocaleDateString();
      }
      
      // Format total_spent to currency
      if (customer.total_spent) {
        customer.total_spent = `$${parseFloat(customer.total_spent).toFixed(2)}`;
      } else {
        customer.total_spent = '$0.00';
      }
      
      // Default total_orders to 0 if null
      customer.total_orders = customer.total_orders || 0;
    });
    
    // Get current date for report
    const reportDate = new Date().toLocaleDateString();
    
    res.json({
      success: true,
      report: {
        title: `Customer Analysis Report - ${canteenName}`,
        generated_on: reportDate,
        summary: {
          total_customers: customers.length,
          active_customers: activeCustomers.length,
          inactive_customers: inactiveCustomers.length,
          active_percentage: (activeCustomers.length / customers.length * 100).toFixed(2)
        },
        customers
      }
    });
  } catch (error) {
    console.error('Error generating customer report:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred while generating customer report'
    });
  }
});

module.exports = router;