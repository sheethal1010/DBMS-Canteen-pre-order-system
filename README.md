# Campus Cravings - College Canteen Management System

**Campus Cravings** is a comprehensive web-based canteen management system designed for college campuses. It provides a smart solution for effortless campus dining, allowing students to pre-order meals and skip the queue while providing administrators with powerful management tools.

## Features

### For Students/Customers
- **User Authentication** - Secure registration and login system
- **Menu Browsing** - View available food items from different canteens
- **Shopping Cart** - Add items to cart and manage orders
- **Online Ordering** - Place orders in advance to skip queues
- **Responsive Design** - Works seamlessly on desktop and mobile devices
- **Favorites** - Save favorite food items for quick reordering
- **Order History** - Track past orders and reorder easily
- **Profile Management** - Update personal information and preferences

### For Staff/Administrators
- **Admin Dashboard** - Comprehensive management interface
- **Canteen Management** - Manage multiple canteens and their details
- **Menu Management** - Add, edit, and remove food items
- **Image Management** - Upload and manage food item images
- **Carousel Management** - Manage promotional banners and images
- **Order Management** - View and process customer orders
- **User Management** - Manage customer accounts and staff

### Technical Features
- **Security** - Password hashing, input validation, and CSRF protection
- **File Upload** - Secure image upload for menu items
- **Database Management** - MySQL database with proper relationships
- **RESTful API** - Well-structured API endpoints
- **Mobile Responsive** - Bootstrap-based responsive design

## Technology Stack

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web application framework
- **MySQL** - Database management system
- **bcrypt** - Password hashing
- **Helmet** - Security middleware
- **Multer** - File upload handling
- **dotenv** - Environment variable management

### Frontend
- **HTML5** - Markup language
- **CSS3** - Styling and animations
- **JavaScript (ES6+)** - Client-side functionality
- **Bootstrap** - Responsive UI framework
- **jQuery** - DOM manipulation and AJAX

### Database
- **MySQL 2** - Primary database driver
- **Connection Pooling** - Efficient database connections
- **Prepared Statements** - SQL injection prevention

## Prerequisites

Before running this application, make sure you have the following installed:

- **Node.js** (v14.0.0 or higher)
- **npm** (v6.0.0 or higher)
- **MySQL** (v8.0 or higher)
- **Git** (for cloning the repository)

## Installation & Setup

### 1. Clone the Repository
```bash
git clone https://github.com/sheethal1010/dbms-canteen.git
cd dbms-canteen
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Database Setup

#### Create Database
```sql
CREATE DATABASE CollegeCanteen;
```

#### Import Schema
```bash
mysql -u root -p CollegeCanteen < college_canteen_schema.sql
```

### 4. Environment Configuration

Create a `.env` file in the root directory:
```env
# Database Configuration
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=CollegeCanteen
DB_CONNECTION_LIMIT=10
DB_QUEUE_LIMIT=0

# Server Configuration
PORT=3000
NODE_ENV=development

# Session Configuration
SESSION_SECRET=your-super-secret-session-key-change-this-in-production

# File Upload Configuration
MAX_FILE_SIZE=5242880
UPLOAD_PATH=./public/uploads
```

### 5. Start the Application

#### Development Mode (with auto-restart)
```bash
npm run dev
```

#### Production Mode
```bash
npm start
```

#### Database Server Only
```bash
npm run start:db
```

The application will be available at `http://localhost:3000`

## Project Structure

```
dbms-canteen/
├── admin/                       # Admin panel HTML files
│   ├── dashboard.html
│   ├── edit-carousel.html
│   └── manage-carousel.html
├── api/                         # API route handlers
│   ├── auth.js                  # Authentication endpoints
│   ├── canteens.js             # Canteen management
│   ├── images.js               # Image upload/management
│   ├── index.js                # API router
│   ├── menu.js                 # Menu management
│   └── orders.js               # Order processing
├── config/                      # Configuration files
│   ├── db.config.js            # Database configuration
│   └── db.config.example.js    # Configuration template
├── images/                      # Static image assets
│   ├── canteens/
│   ├── carousel/
│   ├── food/
│   └── hero/
├── js/                          # Client-side JavaScript
│   ├── auth-handler.js         # Authentication handling
│   └── image-handler.js        # Image processing
├── public/                      # Public static files
│   └── uploads/                # User uploaded files
├── routes/                      # Express route definitions
├── sql/                         # SQL scripts and migrations
├── utils/                       # Utility functions
├── server.js                    # Main application server
├── db.js                        # Database connection
├── package.json                 # Project dependencies
├── college_canteen_schema.sql   # Database schema
└── .env                         # Environment variables (create this)
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout

### Canteens
- `GET /api/canteens` - Get all canteens
- `POST /api/canteens` - Create new canteen
- `PUT /api/canteens/:id` - Update canteen
- `DELETE /api/canteens/:id` - Delete canteen

### Menu
- `GET /api/menu` - Get menu items
- `POST /api/menu` - Add menu item
- `PUT /api/menu/:id` - Update menu item
- `DELETE /api/menu/:id` - Delete menu item

### Orders
- `GET /api/orders` - Get user orders
- `POST /api/orders` - Place new order
- `PUT /api/orders/:id` - Update order status

### Images
- `POST /api/images/upload` - Upload images
- `GET /api/images/:filename` - Get image file

## Database Schema

The system uses a well-structured MySQL database with the following main tables:

- **Customers** - User account information
- **Employees** - Staff and admin accounts
- **Canteens** - Canteen locations and details
- **MenuItems** - Food items and pricing
- **Orders** - Customer orders and status
- **OrderItems** - Individual items in orders
- **Images** - File upload tracking
- **UserContacts** - Multi-valued contact information

## Security Features

- **Password Hashing** - bcrypt for secure password storage
- **Input Validation** - Server-side validation for all inputs
- **SQL Injection Prevention** - Prepared statements and parameterized queries
- **CSRF Protection** - Cross-site request forgery prevention
- **File Upload Security** - File type and size validation
- **Environment Variables** - Sensitive data stored securely
- **Helmet.js** - Security headers and CSP

## User Interface

The application features a modern, responsive design with:

- **Clean Navigation** - Intuitive menu structure
- **Mobile-First Design** - Optimized for all screen sizes
- **Interactive Elements** - Smooth animations and transitions
- **Accessibility** - WCAG compliant design principles
- **Fast Loading** - Optimized images and assets

## Testing

### Manual Testing
1. Start the application in development mode
2. Test user registration and login
3. Browse menu items and add to cart
4. Place test orders
5. Access admin panel with staff credentials

### Database Testing
```bash
node check-db.js          # Test database connection
node show-users.js         # View registered users
node list-users.js         # List all users
```

## Deployment

### Production Checklist
- [ ] Set `NODE_ENV=production` in `.env`
- [ ] Use strong passwords and session secrets
- [ ] Configure proper MySQL user permissions
- [ ] Set up SSL/HTTPS
- [ ] Configure reverse proxy (nginx/Apache)
- [ ] Set up process manager (PM2)
- [ ] Configure backup strategy
- [ ] Monitor application logs

### Environment Variables for Production
```env
NODE_ENV=production
DB_HOST=your-production-db-host
DB_USER=limited-permissions-user
DB_PASSWORD=strong-production-password
SESSION_SECRET=cryptographically-strong-secret
PORT=3000
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the ISC License - see the [LICENSE](LICENSE) file for details.

## Authors

- **Sheethal** - *Initial work* - [sheethal1010](https://github.com/sheethal1010)

## Acknowledgments

- Thanks to all contributors who helped build this system
- Inspired by modern food delivery applications
- Built with love for the college community

## Support

If you encounter any issues or have questions:

1. Check the [SETUP.md](SETUP.md) file for detailed setup instructions
2. Review the troubleshooting section in the setup guide
3. Create an issue on GitHub with detailed error information
4. Contact the development team

## Version History

- **v1.0.0** - Initial release with core functionality
  - User authentication system
  - Menu browsing and ordering
  - Admin panel for management
  - Responsive web design
  - MySQL database integration

---

**Made with dedication for college students who love good food and hate long queues!**
