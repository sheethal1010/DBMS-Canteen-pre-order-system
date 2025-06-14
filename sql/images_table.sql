-- Create images table if it doesn't exist
CREATE TABLE IF NOT EXISTS images (
    id INT AUTO_INCREMENT PRIMARY KEY,
    category VARCHAR(50) NOT NULL,
    item_id VARCHAR(100) NOT NULL,
    image_path VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY unique_image (category, item_id)
);

-- Add description column if it doesn't exist
SET @dbname = 'CollegeCanteen';
SET @tablename = 'images';
SET @columnname = 'description';
SET @preparedStatement = (SELECT IF(
  (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
    WHERE
      TABLE_SCHEMA = @dbname
      AND TABLE_NAME = @tablename
      AND COLUMN_NAME = @columnname
  ) > 0,
  'SELECT 1',
  'ALTER TABLE images ADD COLUMN description VARCHAR(255) AFTER image_path'
));
PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;

-- Insert canteen images if they don't exist
INSERT IGNORE INTO images (category, item_id, image_path, description)
VALUES 
    ('canteen', 'big_mingoes', 'images/canteens/big_mingoes.jpg', 'BIG MINGOES Canteen'),
    ('canteen', 'mini_mingoes', 'images/canteens/mini_mingoes.jpg', 'MINI MINGOES Canteen'),
    ('canteen', 'mm_foods', 'images/canteens/mm_foods.jpg', 'M M FOODS Canteen');

-- Insert carousel images if they don't exist
INSERT IGNORE INTO images (category, item_id, image_path, description)
VALUES 
    ('carousel', 'carousel_1', 'images/carousel/abt_1.jpg', 'Delicious Food 1'),
    ('carousel', 'carousel_2', 'images/carousel/abt_2.jpg', 'Delicious Food 2'),
    ('carousel', 'carousel_3', 'images/carousel/abt_3.jpg', 'Delicious Food 3');
