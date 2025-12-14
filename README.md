# Resource Management System

A full-stack web application for managing learning resources with role-based access control, built with React and Node.js.

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- MySQL database

### Local Development

1. **Clone and setup the project**
   ```bash
   git clone <repository-url>
   cd resource-management-system
   ```

2. **Backend Setup**
   ```bash
   cd Backend
   npm install
   
   # Configure environment variables
   cp .env.example .env
   # Edit .env with your database credentials (MySQL/PostgreSQL)
   
   # Start the backend server (includes auto-restart with nodemon)
   npm start
   ```

3. **Frontend Setup**
   ```bash
   cd Frontend
   npm install
   
   # Configure environment variables
   cp .env.example .env
   # Edit .env with your API endpoint (default: http://localhost:3000/api)
   
   # Start the frontend development server
   npm run dev
   ```

4. **Access the application**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:3000
   - API Documentation: http://localhost:3000/api-docs

### Test Credentials
- **Content Manager**: `test@example.com` / `password123`
- **Viewer**: `viewer@example.com` / `password123`

## 🐳 Docker Setup (If Available)

```bash
# Build and run with Docker Compose
docker-compose up --build

# Access the application
# Frontend: http://localhost:3000
# Backend API: http://localhost:3001
```

## 🛠 Tech Stack

### Frontend
- **React 18** - Modern UI library with hooks
- **TypeScript** - Type safety and better developer experience
- **Vite** - Fast build tool and development server
- **Tailwind CSS** - Utility-first CSS framework
- **React Router** - Client-side routing
- **TanStack Query** - Server state management and caching
- **Axios** - HTTP client for API requests

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web application framework
- **Sequelize** - ORM for database operations
- **PostgreSQL/MySQL** - Relational database support
- **JWT** - Authentication tokens
- **Bcrypt** - Password hashing
- **Swagger** - API documentation
- **Jest + Supertest** - Testing framework with HTTP testing
- **Fast-check** - Property-based testing

### Development Tools
- **ESLint** - Code linting
- **Prettier** - Code formatting
- **Nodemon** - Auto-restart development server
- **Vitest** - Frontend testing

## 🏗 Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        Frontend (React SPA)                     │
├─────────────────────────────────────────────────────────────────┤
│  Components  │  Pages  │  Hooks  │  Services  │  State Mgmt    │
│  - Layout    │ - Login │ - Auth  │ - API      │ - TanStack     │
│  - Resource  │ - List  │ - CRUD  │ - HTTP     │   Query        │
│  - UI        │ - Detail│ - Form  │ - Auth     │ - Context      │
└─────────────────────────────────────────────────────────────────┘
                                    │
                              HTTP/REST API
                                    │
┌─────────────────────────────────────────────────────────────────┐
│                       Backend (Express.js)                      │
├─────────────────────────────────────────────────────────────────┤
│  Controllers │ Services │ Middleware │   DAL    │   Models      │
│  - Auth      │ - Auth   │ - JWT      │ - User   │ - User        │
│  - Resource  │ - CRUD   │ - CORS     │ - Resource│ - Resource   │
│  - Activity  │ - Log    │ - Activity │ - Activity│ - Activity   │
└─────────────────────────────────────────────────────────────────┘
                                    │
                              Sequelize ORM
                                    │
┌─────────────────────────────────────────────────────────────────┐
│                    Database (PostgreSQL/MySQL)                  │
├─────────────────────────────────────────────────────────────────┤
│     Users     │    Resources    │    Activities    │  Sessions  │
│  - id         │  - id           │  - id            │  - tokens  │
│  - email      │  - title        │  - user_id       │  - refresh │
│  - role       │  - type         │  - action        │  - expiry  │
│  - password   │  - status       │  - timestamp     │            │
└─────────────────────────────────────────────────────────────────┘
```

### Key Components
- **Authentication**: JWT-based with role-based access control
- **State Management**: TanStack Query for server state, React hooks for local state
- **Database**: Sequelize ORM with MySQL for data persistence
- **API Design**: RESTful endpoints with consistent response format
- **UI/UX**: Responsive design with Tailwind CSS

## 🎯 Major Decisions & Trade-offs

### Frontend Decisions
1. **TanStack Query over Redux**
   - **Why**: Better caching, optimistic updates, and server state management
   - **Trade-off**: Learning curve for developers familiar with Redux

2. **Tailwind CSS over styled-components**
   - **Why**: Faster development, consistent design system, smaller bundle size
   - **Trade-off**: HTML can become verbose with utility classes

3. **Vite over Create React App**
   - **Why**: Faster build times, better development experience
   - **Trade-off**: Newer tool with potentially less community resources

### Backend Decisions
1. **Sequelize ORM over raw SQL**
   - **Why**: Type safety, migrations, easier database operations
   - **Trade-off**: Performance overhead, abstraction complexity

2. **JWT over session-based auth**
   - **Why**: Stateless, scalable, works well with SPAs
   - **Trade-off**: Token management complexity, logout challenges

3. **Soft delete over hard delete**
   - **Why**: Data recovery, audit trails, safer operations
   - **Trade-off**: Database storage overhead, query complexity

## 📋 Current Features

### Authentication & Authorization
- ✅ JWT-based authentication
- ✅ Role-based access control (Content Manager, Viewer)
- ✅ Protected routes and API endpoints
- ✅ Automatic token refresh handling

### Resource Management
- ✅ CRUD operations for learning resources
- ✅ Resource types: Article, Video, Tutorial
- ✅ Status management: Draft, Published, Archived
- ✅ Tag-based categorization
- ✅ Soft delete (archiving) functionality

### User Interface
- ✅ Responsive design for mobile and desktop
- ✅ Search and filtering capabilities
- ✅ Pagination for large datasets
- ✅ Loading states and error handling
- ✅ Optimistic updates for better UX
- ✅ Confirmation modals for destructive actions

### Data & Performance
- ✅ Optimistic updates with rollback on error
- ✅ Query caching and invalidation
- ✅ Database indexing for performance
- ✅ Input validation and sanitization

## 🚧 Known Limitations

1. **File Upload**: No support for file attachments or media uploads
2. **Real-time Updates**: No WebSocket support for live collaboration
3. **Advanced Search**: Basic text search only, no full-text search
4. **Bulk Operations**: No bulk edit/delete functionality
5. **Activity Logging**: Basic activity tracking without detailed analytics
6. **Email Notifications**: No email system for user notifications
7. **API Rate Limiting**: No rate limiting implemented
8. **Internationalization**: English only, no multi-language support

## ✨ Easy Wins & Quick Improvements

These are features that could be implemented quickly with minimal effort:

### 🚀 30-Minute Improvements
1. **Dark Mode Toggle**
   - Add theme context and toggle button
   - Update Tailwind config for dark mode classes
   - Store preference in localStorage

2. **Resource Sorting**
   - Add sort dropdown (by date, title, type)
   - Update API to accept sort parameters
   - Minimal backend changes required

3. **Export to CSV**
   - Add export button to resource list
   - Use existing data, no new API needed
   - Simple CSV generation on frontend

### 🛠 1-Hour Improvements
4. **Resource Duplication**
   - Add "Duplicate" button to resource cards
   - Copy resource data with new title
   - Reuse existing create resource flow

5. **Keyboard Shortcuts**
   - Add hotkeys for common actions (Ctrl+N for new resource)
   - Use existing navigation, just add event listeners
   - Improve accessibility and power user experience

6. **Resource Preview Modal**
   - Quick preview without navigation
   - Reuse existing resource detail components
   - Modal overlay with resource information

### 📊 2-Hour Improvements
7. **Basic Analytics Dashboard**
   - Count resources by type/status
   - Use existing data, add simple charts
   - Display on main dashboard

8. **Recent Activity Widget**
   - Show last 5 activities on dashboard
   - Use existing activity API
   - Simple list component

9. **Resource Templates**
   - Predefined resource templates for common types
   - Store templates in localStorage or database
   - Speed up resource creation

## 🔮 What I'd Do Next (Priority Order)

### High Priority (Next Sprint)
1. **File Upload System**
   - Add support for resource thumbnails and attachments
   - Implement cloud storage integration (AWS S3, Cloudinary)
   - Add file type validation and size limits

2. **Enhanced Search & Filtering**
   - Implement full-text search with Elasticsearch
   - Add advanced filters (date ranges, multiple tags)
   - Search result highlighting and suggestions

3. **Bulk Operations**
   - Multi-select functionality for resources
   - Bulk edit, delete, and status changes
   - Batch import/export capabilities

### Medium Priority (Next Month)
4. **Real-time Features**
   - WebSocket integration for live updates
   - Real-time notifications for resource changes
   - Collaborative editing indicators

5. **Advanced Analytics**
   - Resource usage analytics and reporting
   - User activity dashboards
   - Performance metrics and insights

6. **Enhanced Security**
   - API rate limiting and throttling
   - Advanced input validation and sanitization
   - Security headers and CSRF protection

### Low Priority (Future Releases)
7. **User Experience Improvements**
   - Dark mode support
   - Keyboard shortcuts and accessibility
   - Progressive Web App (PWA) features

8. **Integration & Extensibility**
   - REST API versioning
   - Webhook system for third-party integrations
   - Plugin architecture for custom features

9. **DevOps & Monitoring**
   - Docker containerization
   - CI/CD pipeline setup
   - Application monitoring and logging

## 📚 API Documentation

The API documentation is available at `/api-docs` when running the backend server locally.

### Key Endpoints
- `POST /auth/login` - User authentication
- `GET /resource/list` - Get paginated resources with filtering
- `GET /resource/:id` - Get single resource details
- `POST /resource/add` - Create new resource
- `PUT /resource/:id` - Update existing resource
- `DELETE /resource/:id` - Archive resource (soft delete)

### Response Format
```json
{
  "status": 1,
  "message": "Success message",
  "data": {
    // Response data
  }
}
```

## 🧪 Testing

### Test Coverage & Quality

**Backend Coverage: 59.3%** (Target achieved)
- **Statements**: 59.3% ✅
- **Branches**: 62.17% ✅ 
- **Functions**: 51.92% ✅
- **Lines**: 59.3% ✅

**Testing Approach:**
- **Unit Tests**: Core business logic (Services, Middleware, Controllers)
- **Integration Tests**: End-to-end API testing with Supertest
- **Property-Based Tests**: Input validation with Fast-check (30-50 iterations)
- **Comprehensive Mocking**: Database layer isolation for reliable tests

### Frontend Testing
```bash
cd Frontend
npm run test          # Run all tests once
npm run test:watch    # Run tests in watch mode
npm run test:coverage # Run tests with coverage report
npm run lint          # Check code linting
npm run format        # Format code with Prettier
```

### Backend Testing
```bash
cd Backend
npm test              # Run all tests with coverage
npm run test:unit     # Run unit tests only
npm run test:integration # Run integration tests only
npm run test:watch    # Run tests in watch mode
```

### Test Quality Features
- **Property-based testing** for comprehensive input validation
- **Optimistic update testing** with rollback scenarios
- **Authentication flow testing** with JWT lifecycle
- **Error handling coverage** for all failure scenarios
- **Database operation mocking** for fast, reliable tests

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Troubleshooting

### Common Issues

1. **Database Connection Error**
   ```bash
   # Check if database is running
   # For PostgreSQL: pg_isready
   # For MySQL: mysqladmin ping
   
   # Verify credentials in Backend/.env
   DB_HOST=localhost
   DB_PORT=5432  # or 3306 for MySQL
   DB_NAME=your_database
   DB_USER=your_username
   DB_PASS=your_password
   ```

2. **Frontend Build Errors**
   ```bash
   # Clear cache and reinstall
   cd Frontend
   rm -rf node_modules package-lock.json
   npm install
   
   # Check Node.js version (requires 16+)
   node --version
   ```

3. **CORS Issues**
   ```bash
   # Verify environment variables
   # Frontend/.env
   VITE_API_BASE_URL=http://localhost:3000/api
   
   # Backend should allow frontend origin
   # Check CORS configuration in Backend/index.js
   ```

4. **Authentication Issues**
   ```bash
   # Clear browser storage
   # Open DevTools > Application > Storage > Clear All
   
   # Verify JWT configuration in Backend/.env
   JWT_SECRET=your-secret-key
   JWT_EXPIRES_IN=24h
   ```

5. **Port Already in Use**
   ```bash
   # Kill process on port 3000 (Backend)
   npx kill-port 3000
   
   # Kill process on port 5173 (Frontend)
   npx kill-port 5173
   ```

### Getting Help
- Check the [Issues](../../issues) page for known problems
- Create a new issue with detailed error information
- Include environment details and steps to reproduce