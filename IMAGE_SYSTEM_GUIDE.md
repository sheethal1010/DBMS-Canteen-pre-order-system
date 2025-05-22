# Campus Canteen Pre-Order System: Image Handling Guide

This guide explains how the image handling system works in the Campus Canteen Pre-Order System, covering both frontend and backend components.

## Table of Contents

1. [Image System Overview](#image-system-overview)
2. [Image Directory Structure](#image-directory-structure)
3. [Backend Image Handling](#backend-image-handling)
   - [Image Storage](#image-storage)
   - [Image Retrieval](#image-retrieval)
   - [Image Upload](#image-upload)
4. [Frontend Image Loading](#frontend-image-loading)
   - [Image Loader Script](#image-loader-script)
   - [Image Display](#image-display)
5. [Image Optimization](#image-optimization)
6. [Troubleshooting](#troubleshooting)

## Image System Overview

The Campus Canteen Pre-Order System uses a comprehensive image handling system to manage and display images of food items, canteens, and hero banners. The system is designed to:

- Store images efficiently on the server
- Load images dynamically on the frontend
- Optimize image loading for performance
- Support different image categories
- Allow staff to upload and manage images

## Image Directory Structure

Images are organized in a structured directory hierarchy:

```
images/
├── canteens/       # Images of different canteens
├── food/           # Images of food items
│   ├── veg/        # veg items
│   ├── non-veg/      # non-veg items
│   ├── snacks/     # snack items
│   └── beverages/     # beverages
└── hero/           # Hero banner images for the main page
```

Each image is stored with a unique filename that includes a prefix indicating its category and a unique identifier.

## Backend Image Handling

### Image Storage

Images are stored directly in the file system rather than in the database. The database only stores the image paths, which improves database performance and makes image management more flexible.

The `upload_image.php` script handles image uploads:

```php
// Example from upload_image.php
$target_dir = "images/" . $category . "/";
$file_extension = strtolower(pathinfo($_FILES["image"]["name"], PATHINFO_EXTENSION));
$new_filename = $category . "_" . time() . "." . $file_extension;
$target_file = $target_dir . $new_filename;

// Move uploaded file to target directory
if (move_uploaded_file($_FILES["image"]["tmp_name"], $target_file)) {
    // Store the image path in the database
    $image_path = $target_file;
    $stmt = $conn->prepare("INSERT INTO images (category, path, title) VALUES (?, ?, ?)");
    $stmt->bind_param("sss", $category, $image_path, $title);
    $stmt->execute();
}
```

### Image Retrieval

The `get_image.php` script serves images to the frontend:

```php
// Example from get_image.php
$image_id = isset($_GET['id']) ? $_GET['id'] : null;
$category = isset($_GET['category']) ? $_GET['category'] : null;

if ($image_id) {
    // Get image by ID
    $stmt = $conn->prepare("SELECT path FROM images WHERE id = ?");
    $stmt->bind_param("i", $image_id);
} else if ($category) {
    // Get images by category
    $stmt = $conn->prepare("SELECT id, path, title FROM images WHERE category = ?");
    $stmt->bind_param("s", $category);
}

$stmt->execute();
$result = $stmt->get_result();

// Return image data as JSON
$images = [];
while ($row = $result->fetch_assoc()) {
    $images[] = $row;
}
echo json_encode($images);
```

### Image Upload

Staff members can upload new images through the admin interface:

1. The staff selects an image file and provides metadata (category, title, etc.)
2. The form submits to `upload_image.php`
3. The script validates the image (type, size, dimensions)
4. The image is saved to the appropriate directory
5. The image path and metadata are stored in the database

## Frontend Image Loading

### Image Loader Script

The `js/image-loader.js` script handles dynamic image loading:

```javascript
// Example from image-loader.js
class ImageLoader {
    constructor() {
        this.imageCache = {};
        this.loadingImages = {};
    }
    
    // Load an image by ID
    loadImage(imageId, callback) {
        // Check if image is already cached
        if (this.imageCache[imageId]) {
            callback(this.imageCache[imageId]);
            return;
        }
        
        // Check if image is already loading
        if (this.loadingImages[imageId]) {
            this.loadingImages[imageId].push(callback);
            return;
        }
        
        // Start loading the image
        this.loadingImages[imageId] = [callback];
        
        // Fetch image data from server
        fetch(`get_image.php?id=${imageId}`)
            .then(response => response.json())
            .then(data => {
                // Cache the image data
                this.imageCache[imageId] = data;
                
                // Notify all callbacks
                this.loadingImages[imageId].forEach(cb => cb(data));
                delete this.loadingImages[imageId];
            })
            .catch(error => {
                console.error('Error loading image:', error);
                this.loadingImages[imageId].forEach(cb => cb(null));
                delete this.loadingImages[imageId];
            });
    }
    
    // Load images by category
    loadImagesByCategory(category, callback) {
        fetch(`get_image.php?category=${category}`)
            .then(response => response.json())
            .then(data => {
                // Cache each image
                data.forEach(image => {
                    this.imageCache[image.id] = image;
                });
                
                callback(data);
            })
            .catch(error => {
                console.error('Error loading images:', error);
                callback([]);
            });
    }
}

// Create a global instance
window.imageLoader = new ImageLoader();
```

### Image Display

Images are displayed on the frontend using the ImageLoader:

```javascript
// Example of displaying food items with images
function displayFoodItems(category) {
    // Get container element
    const container = document.getElementById('food-items-container');
    container.innerHTML = '<p>Loading...</p>';
    
    // Load images for the category
    window.imageLoader.loadImagesByCategory(category, images => {
        // Clear container
        container.innerHTML = '';
        
        // Create elements for each image
        images.forEach(image => {
            const itemElement = document.createElement('div');
            itemElement.className = 'food-item';
            
            const imgElement = document.createElement('img');
            imgElement.src = image.path;
            imgElement.alt = image.title;
            
            const titleElement = document.createElement('h3');
            titleElement.textContent = image.title;
            
            // Add elements to container
            itemElement.appendChild(imgElement);
            itemElement.appendChild(titleElement);
            container.appendChild(itemElement);
        });
        
        // If no images found
        if (images.length === 0) {
            container.innerHTML = '<p>No items found in this category.</p>';
        }
    });
}
```

## Image Optimization

The system includes several optimizations for image handling:

1. **Image Caching**: Images are cached in the browser to reduce server requests
2. **Lazy Loading**: Images are loaded only when needed (e.g., when scrolling into view)
3. **Responsive Images**: Different image sizes are served based on the device screen size
4. **Image Compression**: Images are compressed before storage to reduce file size

Example of lazy loading implementation:

```javascript
// Example of lazy loading images
function setupLazyLoading() {
    const lazyImages = document.querySelectorAll('.lazy-image');
    
    // Create intersection observer
    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                const imageId = img.dataset.imageId;
                
                // Load the image
                window.imageLoader.loadImage(imageId, imageData => {
                    if (imageData) {
                        img.src = imageData.path;
                        img.classList.add('loaded');
                    }
                });
                
                // Stop observing the image
                observer.unobserve(img);
            }
        });
    });
    
    // Observe each lazy image
    lazyImages.forEach(img => {
        observer.observe(img);
    });
}
```

## Troubleshooting

### Common Image Issues

1. **Images Not Loading**
   - Check if the image file exists in the correct directory
   - Verify the image path in the database
   - Check browser console for JavaScript errors

2. **Slow Image Loading**
   - Check image file sizes (should be optimized)
   - Verify that lazy loading is working correctly
   - Check network conditions

3. **Image Upload Failures**
   - Check file size (may exceed upload limits)
   - Verify file type is allowed
   - Check server permissions on image directories

### Debugging Image Loading

To debug image loading issues:

1. Open the browser developer tools (F12)
2. Go to the Network tab
3. Filter by "img" or "image"
4. Reload the page and observe image requests
5. Check for any failed requests or errors

### Server-Side Image Debugging

To debug server-side image issues:

1. Check PHP error logs for upload or retrieval errors
2. Verify directory permissions (should be writable by the web server)
3. Test image paths directly in the browser to ensure they're accessible

---

This guide provides a comprehensive overview of the image handling system in the Campus Canteen Pre-Order System. By understanding how images are stored, retrieved, and displayed, you can effectively manage and troubleshoot the image components of the application.