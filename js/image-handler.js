/**
 * Image Handler for College Canteen Pre-Order System
 * Handles loading and management of all images across the site
 * Combines functionality from image-loader.js and carousel-config.js
 */

document.addEventListener('DOMContentLoaded', function() {
    // Initialize image loading
    loadFoodImages();
    loadCanteenImages();
    loadStaticCanteenImages();
    
    // Fetch carousel images from the database
    fetchCarouselImages();
    
    console.log("Image handler initialized");
});

/**
 * Load food images for the menu
 */
function loadFoodImages() {
    const foodContainer = document.querySelector('.food-items-container');
    if (!foodContainer) return;
    
    // Fetch food images from the server
    fetch('/api/menu')
        .then(response => response.json())
        .then(data => {
            if (data.success && data.items && data.items.length > 0) {
                // Clear existing items
                foodContainer.innerHTML = '';
                
                // Create items for each food
                data.items.forEach(item => {
                    const foodItem = document.createElement('div');
                    foodItem.className = 'food-item';
                    foodItem.dataset.id = item.id;
                    foodItem.dataset.category = item.category;
                    
                    foodItem.innerHTML = `
                        <div class="food-image">
                            <img src="${item.image || 'images/food/placeholder.jpg'}" alt="${item.name}">
                        </div>
                        <div class="food-info">
                            <h3>${item.name}</h3>
                            <p class="food-description">${item.description || ''}</p>
                            <div class="food-price-actions">
                                <p class="food-price">₹${item.price.toFixed(2)}</p>
                                <button class="add-to-cart-btn" data-id="${item.id}">Add to Cart</button>
                            </div>
                        </div>
                    `;
                    
                    foodContainer.appendChild(foodItem);
                });
                
                // Add event listeners to the add to cart buttons
                const addToCartButtons = document.querySelectorAll('.add-to-cart-btn');
                addToCartButtons.forEach(button => {
                    button.addEventListener('click', function() {
                        const itemId = this.dataset.id;
                        addToCart(itemId);
                    });
                });
            }
        })
        .catch(error => {
            console.error('Error loading food images:', error);
        });
}

/**
 * Load canteen images
 */
function loadCanteenImages() {
    const canteenContainer = document.querySelector('.canteen-cards');
    if (!canteenContainer) return;
    
    // Fetch canteen images from the server
    fetch('/api/canteens')
        .then(response => response.json())
        .then(data => {
            if (data.success && data.canteens && data.canteens.length > 0) {
                // Clear existing items
                canteenContainer.innerHTML = '';
                
                // Create items for each canteen
                data.canteens.forEach(canteen => {
                    const canteenCard = document.createElement('div');
                    canteenCard.className = 'canteen-card';
                    canteenCard.dataset.id = canteen.id;
                    
                    canteenCard.innerHTML = `
                        <div class="canteen-image">
                            <img src="${canteen.image || 'images/canteens/placeholder.jpg'}" alt="${canteen.name}">
                        </div>
                        <div class="canteen-info">
                            <h3>${canteen.name}</h3>
                            <p class="canteen-location">${canteen.location || ''}</p>
                            <p class="canteen-hours">${canteen.hours || ''}</p>
                            <button class="view-menu-btn" data-id="${canteen.id}">View Menu</button>
                        </div>
                    `;
                    
                    canteenContainer.appendChild(canteenCard);
                });
                
                // Add event listeners to the view menu buttons
                const viewMenuButtons = document.querySelectorAll('.view-menu-btn');
                viewMenuButtons.forEach(button => {
                    button.addEventListener('click', function() {
                        const canteenId = this.dataset.id;
                        viewCanteenMenu(canteenId);
                    });
                });
            }
        })
        .catch(error => {
            console.error('Error loading canteen images:', error);
        });
}

/**
 * Add an item to the cart
 * @param {string} itemId - The ID of the item to add
 */
function addToCart(itemId) {
    // Check if the user is logged in
    const userData = localStorage.getItem('canteenUserData');
    if (!userData || !JSON.parse(userData).isLoggedIn) {
        alert('Please log in to add items to your cart.');
        window.location.href = 'login.html';
        return;
    }
    
    // Add the item to the cart
    fetch('/api/cart/add', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            itemId,
            userId: JSON.parse(userData).id,
            quantity: 1
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            alert('Item added to cart!');
            // Update cart count if needed
            updateCartCount();
        } else {
            alert(data.message || 'Failed to add item to cart.');
        }
    })
    .catch(error => {
        console.error('Error adding item to cart:', error);
        alert('An error occurred while adding the item to your cart.');
    });
}

/**
 * View a canteen's menu
 * @param {string} canteenId - The ID of the canteen
 */
function viewCanteenMenu(canteenId) {
    // Redirect to the menu page with the canteen ID
    window.location.href = `menu.html?canteen=${canteenId}`;
}

/**
 * Update the cart count in the UI
 */
function updateCartCount() {
    const cartCountElement = document.querySelector('.cart-count');
    if (!cartCountElement) return;
    
    // Check if the user is logged in
    const userData = localStorage.getItem('canteenUserData');
    if (!userData || !JSON.parse(userData).isLoggedIn) {
        cartCountElement.textContent = '0';
        return;
    }
    
    // Fetch the cart count from the server
    fetch(`/api/cart/count?userId=${JSON.parse(userData).id}`)
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                cartCountElement.textContent = data.count;
            }
        })
        .catch(error => {
            console.error('Error updating cart count:', error);
        });
}

// About Section Vertical Carousel Configuration
let aboutCarouselImages = [
    // Default images that will be replaced with data from the API
    {
        src: "images/carousel/abt_1.jpg",
        alt: "food1"
    },
    {
        src: "images/carousel/abt_2.jpg",
        alt: "food2"
    },
    {
        src: "images/carousel/abt_3.jpg",
        alt: "food3"
    }
];

// Fetch carousel images from the API
async function fetchCarouselImages() {
    try {
        const response = await fetch('/api/images/carousel');
        const data = await response.json();
        
        if (data.success && data.images && data.images.length > 0) {
            console.log("Received " + data.images.length + " carousel images from database");
            aboutCarouselImages = data.images;
            // Update the carousel with the new images
            updateAboutCarousel();
        } else {
            console.log("No carousel images found in database or API call failed, using default images");
        }
    } catch (error) {
        console.error('Error fetching carousel images:', error);
        console.log("Using default carousel images due to error");
        // Keep using the default images if there's an error
    }
}

// Function to update the about carousel with configured images
function updateAboutCarousel() {
    const container = document.querySelector('.vertical-slideshow-container');
    if (!container) return;
    
    // Clear existing slides
    container.innerHTML = '';
    
    // Add slides from configuration
    aboutCarouselImages.forEach((image, index) => {
        const slide = document.createElement('div');
        slide.className = 'about-slide fade';
        if (index === 0) slide.classList.add('active');
        
        const img = document.createElement('img');
        img.src = image.src;
        img.alt = image.alt;
        img.className = 'about-image-slide';
        
        slide.appendChild(img);
        container.appendChild(slide);
    });
    
    // Add navigation dots
    const dotsContainer = document.createElement('div');
    dotsContainer.className = 'vertical-slideshow-dots';
    dotsContainer.setAttribute('role', 'tablist');
    
    aboutCarouselImages.forEach((image, index) => {
        const dot = document.createElement('span');
        dot.className = 'v-dot';
        if (index === 0) dot.classList.add('active');
        dot.setAttribute('onclick', `currentVerticalSlide(${index + 1})`);
        dot.setAttribute('role', 'tab');
        dot.setAttribute('aria-selected', index === 0 ? 'true' : 'false');
        dot.setAttribute('aria-label', `Slide ${index + 1}`);
        
        dotsContainer.appendChild(dot);
    });
    
    container.appendChild(dotsContainer);
    
    // Add overlay with improved positioning and transparency
    const overlay = document.createElement('div');
    overlay.className = 'about-image-overlay';
    overlay.style.pointerEvents = 'none'; // Make overlay non-blocking for clicks
    
    const overlayContent = document.createElement('div');
    overlayContent.className = 'overlay-content';
    overlayContent.style.backgroundColor = 'rgba(0, 0, 0, 0.5)'; // Semi-transparent background
    overlayContent.style.padding = '8px 12px';
    overlayContent.style.borderRadius = '4px';
    overlayContent.style.position = 'absolute';
    overlayContent.style.bottom = '20px';
    overlayContent.style.left = '50%';
    overlayContent.style.transform = 'translateX(-50%)';
    
    const icon = document.createElement('i');
    icon.className = 'fas fa-heart';
    icon.style.marginRight = '8px';
    
    const span = document.createElement('span');
    span.textContent = 'Food that you\'ll love';
    
    overlayContent.appendChild(icon);
    overlayContent.appendChild(span);
    overlay.appendChild(overlayContent);
    
    container.appendChild(overlay);
}

// Function to initialize the about carousel
function initAboutCarousel() {
    // This function will be called from Main.html
    let verticalSlideIndex = 0;
    showVerticalSlides();
    
    function showVerticalSlides() {
        let i;
        let slides = document.getElementsByClassName("about-slide");
        let dots = document.getElementsByClassName("v-dot");
        
        if (!slides.length || !dots.length) return;
        
        for (i = 0; i < slides.length; i++) {
            slides[i].style.display = "none";
            slides[i].classList.remove("active");
            dots[i].classList.remove("active");
            dots[i].setAttribute('aria-selected', 'false');
        }
        
        verticalSlideIndex++;
        if (verticalSlideIndex > slides.length) {verticalSlideIndex = 1}
        
        slides[verticalSlideIndex-1].style.display = "block";
        slides[verticalSlideIndex-1].classList.add("active");
        dots[verticalSlideIndex-1].classList.add("active");
        dots[verticalSlideIndex-1].setAttribute('aria-selected', 'true');
        
        setTimeout(showVerticalSlides, 4000);
    }
    
    // Make the function available globally
    window.currentVerticalSlide = function(n) {
        let slides = document.getElementsByClassName("about-slide");
        let dots = document.getElementsByClassName("v-dot");
        
        if (!slides.length || !dots.length) return;
        
        for (let i = 0; i < slides.length; i++) {
            slides[i].style.display = "none";
            slides[i].classList.remove("active");
            dots[i].classList.remove("active");
            dots[i].setAttribute('aria-selected', 'false');
        }
        
        verticalSlideIndex = n;
        slides[verticalSlideIndex-1].style.display = "block";
        slides[verticalSlideIndex-1].classList.add("active");
        dots[verticalSlideIndex-1].classList.add("active");
        dots[verticalSlideIndex-1].setAttribute('aria-selected', 'true');
    };
}

// Make the function available globally
window.initAboutCarousel = initAboutCarousel;

/**
 * Load canteen images from the database for the canteen selection section in Main.html
 */
function loadStaticCanteenImages() {
    // Find all canteen card images in the canteen selection section
    const canteenImages = document.querySelectorAll('.canteen-selection .canteen-card img');
    
    if (!canteenImages || canteenImages.length === 0) {
        console.log("No canteen images found in the canteen selection section");
        return;
    }
    
    console.log("Found " + canteenImages.length + " canteen images to load");
    
    // Fetch canteen images from the database
    fetch('/api/images/canteens')
        .then(response => response.json())
        .then(data => {
            if (data.success && data.images && data.images.length > 0) {
                console.log("Received " + data.images.length + " canteen images from database");
                
                // Create a map of item_id to image path
                const imageMap = {};
                data.images.forEach(image => {
                    imageMap[image.id] = image.src;
                });
                
                // Update each canteen image
                canteenImages.forEach(img => {
                    const itemId = img.getAttribute('data-item-id');
                    console.log("Loading image for canteen: " + itemId);
                    
                    if (itemId && imageMap[itemId]) {
                        img.src = imageMap[itemId];
                        console.log("Set image source from database: " + imageMap[itemId]);
                    } else {
                        // Use a placeholder if no specific image is found
                        img.src = 'images/canteens/placeholder.jpg';
                        console.log("Using placeholder image for: " + itemId);
                    }
                });
            } else {
                console.log("No canteen images found in database or API call failed");
                // Fall back to static images if database fetch fails
                const canteenImageSources = {
                    'big_mingoes': 'images/canteens/big_mingoes.jpg',
                    'mini_mingoes': 'images/canteens/mini_mingoes.jpg',
                    'mm_foods': 'images/canteens/mm_foods.jpg'
                };
                
                // Update each canteen image with static sources
                canteenImages.forEach(img => {
                    const itemId = img.getAttribute('data-item-id');
                    if (itemId && canteenImageSources[itemId]) {
                        img.src = canteenImageSources[itemId];
                        console.log("Set fallback image source: " + canteenImageSources[itemId]);
                    } else {
                        img.src = 'images/canteens/placeholder.jpg';
                        console.log("Using placeholder image for: " + itemId);
                    }
                });
            }
        })
        .catch(error => {
            console.error('Error loading canteen images from database:', error);
            // Fall back to static images if database fetch fails
            const canteenImageSources = {
                'big_mingoes': 'images/canteens/big_mingoes.jpg',
                'mini_mingoes': 'images/canteens/mini_mingoes.jpg',
                'mm_foods': 'images/canteens/mm_foods.jpg'
            };
            
            // Update each canteen image with static sources
            canteenImages.forEach(img => {
                const itemId = img.getAttribute('data-item-id');
                if (itemId && canteenImageSources[itemId]) {
                    img.src = canteenImageSources[itemId];
                    console.log("Set fallback image source: " + canteenImageSources[itemId]);
                } else {
                    img.src = 'images/canteens/placeholder.jpg';
                    console.log("Using placeholder image for: " + itemId);
                }
            });
        });
}