# 📚 BoiBritto - Complete Literary Community Platform

[![Next.js](https://img.shields.io/badge/Next.js-15.3.3-black?logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.0.0-blue?logo=react)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-Express-green?logo=node.js)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose-green?logo=mongodb)](https://mongodb.com/)
[![Firebase](https://img.shields.io/badge/Firebase-Auth-orange?logo=firebase)](https://firebase.google.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?logo=typescript)](https://typescriptlang.org/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-4.0-38B2AC?logo=tailwind-css)](https://tailwindcss.com/)

> 🌟 **A comprehensive literary platform** - Connecting book lovers, readers, and hobbyist writers in one unified ecosystem

## 🌟 Project Overview

**BoiBritto** is a modern, full-stack literary community platform that brings together book enthusiasts, aspiring writers, and passionate readers. The platform provides a comprehensive suite of tools for book discovery, collection management, reading tracking, community discussions, and creative writing - all wrapped in a beautiful, responsive interface.

### 🎯 The Problem We Solve

The literary community lacks a unified platform that addresses all aspects of the reading and writing experience:
- **Fragmented Tools**: Readers use multiple platforms for discovery, tracking, and discussion
- **Limited Social Features**: Most platforms lack meaningful community interaction
- **Poor Writing Support**: Aspiring writers have limited platforms for sharing and feedback
- **Inadequate Progress Tracking**: Reading progress and recommendations are often disconnected
- **No Creative Outlet**: Limited platforms for both consuming and creating literary content

### 💡 Our Solution

BoiBritto delivers a complete literary ecosystem with integrated features:

**📖 Smart Book Discovery**: Advanced search and filtering with Google Books API integration  
**📚 Personal Collections**: Curated book lists with privacy controls and social sharing  
**📊 Reading Tracker**: Comprehensive progress tracking with intelligent recommendations  
**✍️ Creative Writing**: Full-featured writing platform with chapter management  
**💬 Community Discussions**: Rich discussion forums with spoiler controls and moderation  
**📝 Literary Blogs**: Markdown-supported blogging with genre tagging  
**🔒 Advanced Privacy**: Granular visibility controls for all content types

---

## ✨ Key Features

### 📖 **Book Discovery & Management**
- **Google Books Integration**: Access to millions of books with rich metadata
- **Advanced Search**: Filter by genre, author, publication date, and more
- **Personal Collections**: Create and organize custom book collections
- **Smart Recommendations**: Suggestions based on reading history
- **Collection Sharing**: Public, friends-only, or private collection visibility

### 📊 **Reading Progress Tracking**
- **Status Management**: Track books as interested, reading, or completed
- **Date Validation**: Smart date controls preventing future dates and logical constraints
- **Progress Analytics**: Visual insights into reading habits and genre preferences
- **Reading Goals**: Set and track annual reading targets
- **Genre-Based Recommendations**: Top 5 most-read genres analysis

### ✍️ **Creative Writing Platform**
- **User Book Creation**: Full-featured book creation with metadata management
- **Chapter Management**: Organize content with chapter-by-chapter structure
- **Rich Text Editor**: Markdown support for formatted content
- **Visibility Controls**: Public, private, or friends-only publishing options
- **Like System**: Community engagement with like/unlike functionality
- **Word Count Tracking**: Automatic word count calculation and progress metrics

### 💬 **Community Discussions**
- **Rich Discussion Forums**: Create and participate in literary discussions
- **Hierarchical Comments**: Nested comment system with 1-level deep replies
- **Spoiler Controls**: Built-in spoiler alert system for sensitive content
- **Genre Tagging**: Categorize discussions by literary genres
- **Moderation Tools**: Community reporting and content flagging system

### 📝 **Literary Blogging**
- **Markdown Support**: Full markdown editing with live preview
- **Genre Classification**: Tag blogs with relevant literary genres
- **Visibility Management**: Control who can read your content
- **Spoiler Warnings**: Protect readers from unwanted spoilers
- **Social Sharing**: Share insights with the community

### 👥 **User Profiles & Social Features**
- **Rich Profiles**: Customizable profiles with bio, avatar, and interested genres
- **Activity Feeds**: See updates from followed users and community activity
- **Privacy Controls**: Granular control over profile and content visibility
- **Follow System**: Build connections with other literary enthusiasts

### 🔒 **Security & Moderation**
- **Firebase Authentication**: Secure Google-based authentication
- **Content Reporting**: Comprehensive reporting system for inappropriate content
- **Moderation Tools**: Admin panel for content and user management
- **Privacy Controls**: User-controlled visibility settings for all content types

### 🛠️ **Admin Features**
- **AdminJS Integration**: Comprehensive backend administration interface
- **User Management**: Admin tools for user account management
- **Content Moderation**: Review and moderate discussions, blogs, and user content
- **Analytics Dashboard**: Platform usage and engagement metrics
- **Database Management**: Direct access to all data models and relationships

---

## 🛠️ Tech Stack

### **Frontend**
| Technology | Version | Purpose |
|------------|---------|---------|
| **Next.js** | 15.3.3 | React framework with SSR/SSG and App Router |
| **React** | 19.0.0 | Modern UI component library |
| **TypeScript** | 5.0 | Type-safe JavaScript development |
| **TailwindCSS** | 4.0 | Utility-first CSS framework |
| **Lucide React** | 0.511.0 | Modern icon library |
| **Axios** | 1.10.0 | HTTP client for API communication |

### **Backend**
| Technology | Version | Purpose |
|------------|---------|---------|
| **Node.js** | Latest | JavaScript runtime environment |
| **Express.js** | 5.1.0 | Web application framework |
| **MongoDB** | Latest | NoSQL database for flexible data storage |
| **Mongoose** | 8.15.0 | MongoDB object modeling and validation |
| **Firebase Admin** | 13.4.0 | Authentication and user management |

### **APIs & Services**
| Service | Purpose |
|---------|---------|
| **Google Books API** | Book data, metadata, and cover images |
| **Firebase Auth** | User authentication and session management |
| **MongoDB Atlas** | Cloud database hosting and management |

### **Development & Testing**
| Tool | Purpose |
|------|---------|
| **Vitest** | Modern testing framework |
| **ESLint** | Code linting and style enforcement |
| **Prettier** | Code formatting |
| **AdminJS** | Backend administration interface |

---

## 🚀 Getting Started

### Prerequisites
- **Node.js** (v18 or higher)
- **npm** or **yarn**
- **MongoDB** database (local or Atlas)
- **Firebase** project with Authentication enabled
- **Google Books API** key

### 1. Clone the Repository
```bash
git clone https://github.com/your-username/boibritto.git
cd boibritto
```

### 2. Backend Setup
```bash
cd code/boibritto-server
npm install

# Create environment file
cp .env.example .env
```

**Configure Environment Variables (.env):**
```env
# Database
MONGODB_URL=your_mongodb_connection_string

# Firebase Configuration
FIREBASE_PROJECT_ID=your_firebase_project_id
FIREBASE_CLIENT_EMAIL=your_firebase_client_email
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"

# API Keys
WEB_API_KEY=your_google_books_api_key

# Server Configuration
PORT=5000
FRONTEND_URL=http://localhost:3000
```

### 3. Frontend Setup
```bash
cd ../boibritto-client
npm install

# Create environment file
cp .env.local.example .env.local
```

**Configure Frontend Environment (.env.local):**
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_web_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_firebase_project_id
```

### 4. Run the Application

#### Start Backend Server
```bash
cd code/boibritto-server
npm run dev
# Server runs on http://localhost:5000
```

#### Start Frontend Development Server
```bash
cd code/boibritto-client
npm run dev
# Application runs on http://localhost:3000
```

### 5. Access the Application
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000/api
- **Admin Panel**: http://localhost:5000/admin

---

## 🏗️ Project Architecture

```
boibritto/
├── code/
│   ├── boibritto-client/          # Next.js React frontend
│   │   ├── app/                   # App router pages
│   │   │   ├── explore/          # Book discovery and search
│   │   │   ├── collections/      # User collections management
│   │   │   ├── readingitems/     # Reading list and progress tracking
│   │   │   ├── discussions/      # Community discussion forums
│   │   │   ├── blogs/            # Literary blogging platform
│   │   │   ├── book/             # Individual book pages
│   │   │   ├── profile/          # User profiles and settings
│   │   │   └── ...              # Authentication and other pages
│   │   ├── components/            # Reusable UI components
│   │   │   ├── home/             # Landing page components
│   │   │   ├── book/             # Book-related components
│   │   │   ├── profile/          # Profile and user components
│   │   │   ├── layout/           # Navigation and layout
│   │   │   └── ui/               # Base UI components
│   │   ├── lib/                   # Utility functions & configs
│   │   └── public/                # Static assets
│   └── boibritto-server/          # Express.js backend API
│       ├── api/                   # Main application logic
│       │   ├── controllers/       # Request handlers
│       │   │   ├── auth.controller.js      # Authentication
│       │   │   ├── collection.controller.js # Collections management
│       │   │   ├── readingList.controller.js # Reading progress
│       │   │   ├── blog.controller.js      # Blogging system
│       │   │   ├── discussion.controller.js # Discussion forums
│       │   │   ├── comment.controller.js   # Comment system
│       │   │   ├── userBook.controller.js  # User-created books
│       │   │   ├── chapter.controller.js   # Book chapters
│       │   │   └── report.controller.js    # Content reporting
│       │   ├── models/           # Database schemas
│       │   ├── routes/           # API endpoints
│       │   ├── middlewares/      # Custom middleware
│       │   └── utils/            # Helper functions
│       ├── tests/                # Comprehensive test suites
│       └── components/           # Admin panel components
└── README.md                     # Project documentation
```

---

## 🔗 API Overview & Documentation

<div align="center">

### 📚 **Comprehensive API Documentation**

[![API Documentation](https://img.shields.io/badge/📖_Complete_API_Docs-Available-blue?style=for-the-badge)](./code/boibritto-server/api-doc.md)

</div>

> 📖 **For detailed API documentation, request/response examples, authentication flows, and testing guides, check the [API Documentation](./code/boibritto-server/api-doc.md)**

### 🚀 **Quick API Reference**

Our RESTful API provides comprehensive endpoints for all platform features:

#### **🔐 Authentication & User Management**
```http
GET  /api/auth/login          # Firebase token authentication
POST /api/auth/signup         # New user registration
GET  /api/profile/me          # Get current user profile
PATCH /api/profile/me         # Update user information
GET  /api/profile/:userID     # Get public user profile
```

#### **📚 Collections & Library Management**
```http
GET    /api/collections       # List collections (with filtering)
POST   /api/collections       # Create new collection
GET    /api/collections/:id   # Get specific collection
PATCH  /api/collections/:id   # Update collection
DELETE /api/collections/:id   # Delete collection
```

#### **📖 Reading Lists & Progress Tracking**
```http
GET    /api/reading-list/me           # Get user's reading list
GET    /api/reading-list/:userID      # Get public reading list
POST   /api/reading-list              # Add book to reading list
PATCH  /api/reading-list/:id          # Update reading progress
DELETE /api/reading-list/:id          # Remove from reading list
GET    /api/reading-list/recommendations # Get genre recommendations
```

#### **✍️ User Books & Creative Writing**
```http
GET    /api/user-books               # List user-created books
POST   /api/user-books               # Create new book
GET    /api/user-books/:id           # Get book details
PATCH  /api/user-books/:id           # Update book
DELETE /api/user-books/:id           # Delete book
POST   /api/user-books/:id/like      # Like/unlike book
```

#### **📝 Chapter Management**
```http
GET    /api/user-books/:bookId/chapters # Get book chapters
GET    /api/chapters/:id                # Get specific chapter
POST   /api/chapters                    # Create new chapter
PATCH  /api/chapters/:id                # Update chapter
DELETE /api/chapters/:id                # Delete chapter
POST   /api/chapters/:id/like           # Like/unlike chapter
```

#### **💬 Discussion Forums**
```http
GET    /api/discussions       # List discussions (with filtering)
POST   /api/discussions       # Create new discussion
GET    /api/discussions/:id   # Get specific discussion
PATCH  /api/discussions/:id   # Update discussion
DELETE /api/discussions/:id   # Delete discussion
```

#### **💭 Comment System**
```http
GET    /api/comments/:discussionId # Get discussion comments
POST   /api/comments               # Create comment
PATCH  /api/comments/:id           # Update comment
DELETE /api/comments/:id           # Delete comment
```

#### **📝 Literary Blogging**
```http
GET    /api/blogs            # List blogs (with filtering)
POST   /api/blogs            # Create new blog
GET    /api/blogs/:id        # Get specific blog
PATCH  /api/blogs/:id        # Update blog
DELETE /api/blogs/:id        # Delete blog
```

#### **🛡️ Content Reporting & Moderation**
```http
POST /api/reports            # Submit content report
GET  /api/reports/my-reports # Get user's submitted reports
```

### 📋 **API Response Format**
All API responses follow this consistent structure:
```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    // Response data here
  }
}
```

### 🔒 **Authentication & Security**
- **Firebase JWT Tokens**: Secure authentication with Google Integration
- **Protected Routes**: All user-specific endpoints require authentication
- **Data Validation**: Comprehensive input validation and sanitization
- **Privacy Controls**: User-defined visibility settings for all content
- **Content Moderation**: Built-in reporting and flagging system

---

## 🧪 Testing

### Run Backend Tests
```bash
cd code/boibritto-server
npm test
```

### Test Coverage
Our comprehensive test suite covers:
- **Unit Tests**: Model validation and utility functions
- **Integration Tests**: API endpoint functionality  
- **Authentication Tests**: Firebase token verification
- **Database Tests**: CRUD operations and data integrity
- **Feature Tests**: Collections, reading lists, blogs, discussions, and user books

### Available Test Suites
```bash
# Run all tests
npm test

# Run specific test files
npm test blog.test.mjs
npm test collections.test.mjs
npm test readingList.test.mjs
npm test discussion.test.mjs
npm test comment.test.mjs
npm test userBook.test.mjs
npm test chapter.test.mjs
```

---

## 🚀 Deployment

### Backend Deployment
The backend is configured for deployment on platforms like Vercel, Railway, or any Node.js hosting service.

```bash
# Build for production
npm run build

# Start production server
npm start
```

### Frontend Deployment
The Next.js frontend can be deployed on Vercel, Netlify, or any static hosting service.

```bash
# Build for production
npm run build

# Start production server
npm start
```

### Environment Configuration
Ensure all environment variables are properly configured in your deployment platform:
- Database connection strings
- Firebase configuration
- API keys and secrets
- CORS settings for production domains

---

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- **Firebase** for robust authentication services
- **MongoDB** for flexible data storage
- **Google Books API** for comprehensive book data
- **Next.js** for powerful React framework capabilities
- **TailwindCSS** for beautiful, responsive design
- **AdminJS** for comprehensive backend administration
- The open-source community for amazing tools and libraries

---

## 📞 Contact & Links

<div align="center">

### 🚀 **Project Resources**

[![API Documentation](https://img.shields.io/badge/🔗_API_Docs-Explore_API-orange?style=for-the-badge)](./code/boibritto-server/api-doc.md)
[![GitHub Issues](https://img.shields.io/badge/🐛_Issues-Report_Bug-red?style=for-the-badge&logo=github)](https://github.com/your-username/boibritto/issues)

</div>

---


<div align="center">

### 👥 **Meet the Development Team**

*Four passionate developers combining literature with cutting-edge technology*

</div>

<table align="center">
<tr>

<td align="center" width="25%">

<img src="https://github.com/SillyCatto.png" width="120" height="120" style="border-radius: 50%; border: 3px solid #8c6545;" alt="Raiyan Muhtasim">

**Raiyan Muhtasim**  

*Full-Stack Developer & Backend Lead*

[![GitHub](https://img.shields.io/badge/GitHub-SillyCatto-181717?style=for-the-badge&logo=github)](https://github.com/SillyCatto)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-Connect-0A66C2?style=for-the-badge&logo=linkedin)](https://www.linkedin.com/in/raiyan-muhtasim-427a06358)

</td>
<td align="center" width="25%">

<img src="https://github.com/musaddiq-rafi.png" width="120" height="120" style="border-radius: 50%; border: 3px solid #d36d12;" alt="Abdullah Al Musaddiq Rafi">

**Abdullah Al Musaddiq Rafi**  

*Full-Stack Developer & Frontend Lead*

[![GitHub](https://img.shields.io/badge/GitHub-musaddiq--rafi-181717?style=for-the-badge&logo=github)](https://github.com/musaddiq-rafi)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-Connect-0A66C2?style=for-the-badge&logo=linkedin)](https://www.linkedin.com/in/musaddiq-rafi)

</td>
<td align="center" width="25%">

<img src="https://github.com/Dr-Lepic.png" width="120" height="120" style="border-radius: 50%; border: 3px solid #b5d2df;" alt="Mahbub Rahman">

**Md. Mahbub Ur Rahman**

*Backend Developer & AI Enthusiast*

[![GitHub](https://img.shields.io/badge/GitHub-Dr--Lepic-181717?style=for-the-badge&logo=github)](https://github.com/Dr-Lepic)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-Connect-0A66C2?style=for-the-badge&logo=linkedin)](https://www.linkedin.com/in/mahbubrahman48/)

</td>
<td align="center" width="25%">

<img src="https://github.com/saadthenexus.png" width="120" height="120" style="border-radius: 50%; border: 3px solid #69bfcf;" alt="Team Member 4">

**Hasibul Karim**

*Frontend Developer*

[![GitHub](https://img.shields.io/badge/GitHub-saadthenexus-181717?style=for-the-badge&logo=github)](https://github.com/saadthenexus)
[![LinkedIn](https://img.shields.io/badge/Mail-0A66C2?style=for-the-badge&logo=gmail)](https://www.linkedin.com/in/your-profile)

</td>


</tr>
</table>

---


<div align="center">

**Built with ❤️ for book lovers, readers, and literary communities**

*"Connecting readers, inspiring writers, building communities"*

[![Made with Love](https://img.shields.io/badge/Made%20with-❤️-red.svg)](https://github.com/your-username/boibritto)
[![Literary Platform](https://img.shields.io/badge/Literary-Platform-amber.svg)](https://github.com/your-username/boibritto)

</div>

---
