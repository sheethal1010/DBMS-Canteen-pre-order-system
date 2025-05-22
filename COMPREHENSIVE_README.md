# Campus Canteen Pre-Order System

Welcome to the Campus Canteen Pre-Order System! This comprehensive web application allows students and staff to pre-order food from campus canteens, reducing wait times and improving the dining experience.

## System Overview

The Campus Canteen Pre-Order System is designed to streamline the food ordering process in educational institutions. Key features include:

- User registration and authentication
- Role-based access control (customer/staff)
- Menu browsing with images
- Order placement and tracking
- Staff dashboard for order management
- Canteen and menu item management

## Documentation

This project includes comprehensive documentation to help users, administrators, and developers understand and use the system effectively:

### For Users

- [User Guide](USER_GUIDE.md) - Comprehensive guide for end users
- [FAQ](FAQ.md) - Frequently asked questions about using the system

### For Administrators

- [Setup Guide](SETUP_GUIDE.md) - Step-by-step instructions for setting up the system
- [Admin Guide](ADMIN_GUIDE.md) - Guide for system administrators
- [Database Schema](DATABASE_SCHEMA.md) - Overview of the database structure

### For Developers

- [System Guide](SYSTEM_GUIDE.md) - Overview of the entire system architecture
- [Developer Guide](DEVELOPER_GUIDE.md) - Technical guide for developers
- [Image System Guide](IMAGE_SYSTEM_GUIDE.md) - Details about the image handling system
- [API Documentation](API_DOCS.md) - Documentation for the system's API endpoints

## Quick Start

### Prerequisites

- XAMPP (or equivalent with Apache, MySQL, PHP)
- Web browser (Chrome, Firefox, Edge recommended)
- 2GB+ free disk space

### Installation

1. Install XAMPP from [apachefriends.org](https://www.apachefriends.org/)
2. Start Apache and MySQL services
3. Clone this repository to `c:/xampp/htdocs/dbms-canteen`
4. Open your browser and navigate to `http://localhost/dbms-canteen/fix_permissions.php`
5. Next, navigate to `http://localhost/dbms-canteen/setup_db.php`
6. Verify installation by visiting `http://localhost/dbms-canteen/direct_db_test.php`

For detailed setup instructions, see the [Setup Guide](SETUP_GUIDE.md).

### First Login

1. Navigate to `http://localhost/dbms-canteen/hdbms/h.html`
2. Register a new account or use the test account:
   - Email: `test@example.com`
   - Password: `password123`

## System Architecture

The Campus Canteen Pre-Order System is built using the following technologies:

- **Frontend**: HTML, CSS, JavaScript
- **Backend**: PHP
- **Database**: MySQL
- **Server**: Apache (via XAMPP)

The system follows a simple MVC-like architecture:

- **Models**: Database interaction and business logic
- **Views**: HTML templates and UI components
- **Controllers**: PHP scripts handling requests and responses

## Authentication System

The system uses a custom authentication system with the following features:

- Secure password hashing using PHP's `password_hash()`
- Session-based authentication
- Role-based access control
- Optional email or phone number for registration
- Staff verification code for staff accounts

## Database Structure

The system uses a MySQL database with the following main tables:

- `users` - User accounts and authentication
- `menu_items` - Food items available for ordering
- `orders` - Customer orders
- `order_items` - Individual items within orders
- `canteens` - Information about campus canteens
- `images` - Metadata for images used in the system

For a complete database schema, see the [Database Schema](DATABASE_SCHEMA.md) documentation.

## Image Handling

The system includes a comprehensive image handling system:

- Images stored in the file system
- Database references to image paths
- Dynamic image loading on the frontend
- Image caching for performance
- Support for different image categories

For details about the image system, see the [Image System Guide](IMAGE_SYSTEM_GUIDE.md).

## Security Considerations

The system implements several security measures:

- Password hashing using PHP's `password_hash()`
- Prepared statements to prevent SQL injection
- Input validation and sanitization
- Session management
- CSRF protection

## Contributing

Contributions to the Campus Canteen Pre-Order System are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- XAMPP for the development environment
- Bootstrap for UI components
- Font Awesome for icons
- All contributors who have helped improve this system

---

For any questions or support, please contact the system administrator or refer to the appropriate documentation.