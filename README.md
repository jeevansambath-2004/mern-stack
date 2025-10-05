# 🚀 MERN Stack Todo Application

A beautiful, feature-rich todo application built with the MERN stack (MongoDB, Express.js, React, Node.js) with TypeScript support.

## ✨ Features

### 🔐 Authentication
- User registration and login
- JWT token-based authentication
- Secure password hashing with bcrypt
- Protected routes

### 📝 Todo Management
- Create, read, update, and delete todos
- Mark todos as complete/incomplete
- Priority levels (Low, Medium, High, Urgent)
- Categories and tags
- Due dates with overdue detection
- Rich text descriptions and notes
- Drag and drop reordering

### 🎨 User Interface
- Modern, responsive design
- Dark/light theme toggle
- Beautiful animations with Framer Motion
- Real-time search and filtering
- Statistics dashboard
- Toast notifications

### 🔍 Advanced Features
- Real-time search across titles, descriptions, and tags
- Filter by completion status, priority, and category
- Sort by various criteria
- Statistics and progress tracking
- Responsive design for all devices
- **Email Notifications**: Automatic email notifications for todo completion/incompletion

## 🛠️ Tech Stack

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM for MongoDB
- **JWT** - Authentication
- **bcryptjs** - Password hashing
- **express-validator** - Input validation
- **cors** - Cross-origin resource sharing
- **helmet** - Security headers
- **morgan** - HTTP request logger
- **compression** - Response compression
- **nodemailer** - Email notifications

### Frontend
- **React 18** - UI library
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Framer Motion** - Animations
- **React Router** - Navigation
- **React Hook Form** - Form handling
- **Axios** - HTTP client
- **React Hot Toast** - Notifications
- **Lucide React** - Icons
- **React Beautiful DnD** - Drag and drop
- **React DatePicker** - Date selection

## 🚀 Getting Started

### Prerequisites
- MongoDB (local or Atlas)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/jeevansambath-2004/mern-stack.git
   cd mern-stack
   ```

2. **Install dependencies**
   ```bash
   
   # Install backend dependencies
   cd backend
   npm install
   
   # Install frontend dependencies
   cd ../frontend
   npm install
   ```

3. **Environment Setup**
   
   Create a `config.env` file in the backend directory:
   ```env
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/todo-app
   JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
   NODE_ENV=development
   GMAIL_USER=your-gmail-address@gmail.com
   GMAIL_APP_PASSWORD=your-gmail-app-password
   ```
   
   **For Email Notifications:**
   - Set your Gmail address in `GMAIL_USER`
   - Generate a Gmail App Password at: Google Account > Security > 2-Step Verification > App passwords
   - Set the app password in `GMAIL_APP_PASSWORD`

4. **Start MongoDB**
   ```bash
   # If using local MongoDB
   mongod
   ```

5. **Run the application**
   ```bash
   # From the root directory
   npm run dev
   ```

   This will start both the backend (port 5000) and frontend (port 3000) concurrently.

### Alternative: Run separately

**Backend:**
```bash
cd backend
npm run dev
```

**Frontend:**
```bash
cd frontend
npm start
```

## 📁 Project Structure

```
mern-todo-app/
├── backend/
│   ├── config.env          # Environment variables
│   ├── server.js           # Express server
│   ├── package.json        # Backend dependencies
│   ├── models/
│   │   ├── User.js         # User model
│   │   └── Todo.js         # Todo model
│   ├── routes/
│   │   ├── auth.js         # Authentication routes
│   │   └── todos.js        # Todo routes
│   └── middleware/
│       └── auth.js         # Authentication middleware
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── auth/       # Authentication components
│   │   │   ├── dashboard/  # Dashboard components
│   │   │   └── ui/         # Reusable UI components
│   │   ├── contexts/       # React contexts
│   │   ├── services/       # API services
│   │   ├── types/          # TypeScript types
│   │   ├── App.tsx         # Main app component
│   │   └── index.css       # Global styles
│   ├── package.json        # Frontend dependencies
│   ├── tailwind.config.js  # Tailwind configuration
│   └── postcss.config.js   # PostCSS configuration
├── package.json            # Root package.json
└── README.md              # This file
```

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user profile
- `PUT /api/auth/profile` - Update user profile

### Todos
- `GET /api/todos` - Get all todos (with filters)
- `POST /api/todos` - Create a new todo
- `GET /api/todos/:id` - Get a specific todo
- `PUT /api/todos/:id` - Update a todo
- `PATCH /api/todos/:id/toggle` - Toggle todo completion
- `DELETE /api/todos/:id` - Delete a todo
- `GET /api/todos/stats/overview` - Get todo statistics
- `GET /api/todos/categories` - Get all categories

## 🎯 Features in Detail

### Todo Management
- **Rich Todo Creation**: Add titles, descriptions, priorities, categories, tags, due dates, and notes
- **Smart Filtering**: Filter by completion status, priority, category, and search terms
- **Priority System**: Four priority levels with color coding
- **Due Date Tracking**: Automatic overdue detection
- **Category Organization**: Group todos by categories
- **Tag System**: Add multiple tags to todos
- **Drag & Drop**: Reorder todos with drag and drop functionality

### User Experience
- **Responsive Design**: Works perfectly on desktop, tablet, and mobile
- **Dark/Light Theme**: Toggle between themes with persistent storage
- **Smooth Animations**: Beautiful transitions and micro-interactions
- **Real-time Search**: Instant search across all todo fields
- **Statistics Dashboard**: Visual progress tracking
- **Toast Notifications**: User-friendly feedback messages

### Security
- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: Bcrypt for secure password storage
- **Input Validation**: Comprehensive server-side validation
- **CORS Protection**: Configured for production use
- **Security Headers**: Helmet for additional security

## 🚀 Deployment

### Option 1: Render (Recommended - Free Tier Available)

#### Backend Deployment on Render:
1. **Create a Render account** at [render.com](https://render.com)
2. **Connect your GitHub repository**
3. **Create a new Web Service**:
   - **Root Directory**: `backend`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
4. **Set Environment Variables**:
   ```env
   PORT=5000
   MONGODB_URI=your-mongodb-atlas-uri
   JWT_SECRET=your-production-jwt-secret
   NODE_ENV=production
   GMAIL_USER=your-gmail-address@gmail.com
   GMAIL_APP_PASSWORD=your-gmail-app-password
   ```

#### Frontend Deployment on Render:
1. **Create a new Static Site**
2. **Settings**:
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Publish Directory**: `build`
3. **Update API URL** in frontend to point to your backend service

### Option 2: Vercel + Railway

#### Backend on Railway:
1. **Connect GitHub repository** to [Railway](https://railway.app)
2. **Deploy from `backend` folder**
3. **Set environment variables** in Railway dashboard

#### Frontend on Vercel:
1. **Import project** from GitHub to [Vercel](https://vercel.com)
2. **Set Root Directory** to `frontend`
3. **Deploy automatically**

### Option 3: Netlify + Heroku

#### Backend on Heroku:
1. **Create Heroku app**
2. **Set buildpack** to Node.js
3. **Configure environment variables**
4. **Deploy from GitHub**

#### Frontend on Netlify:
1. **Connect GitHub repository** to [Netlify](https://netlify.com)
2. **Build settings**:
   - **Base directory**: `frontend`
   - **Build command**: `npm run build`
   - **Publish directory**: `frontend/build`

### Database Setup (MongoDB Atlas)
1. **Create account** at [MongoDB Atlas](https://www.mongodb.com/atlas)
2. **Create a cluster** (free tier available)
3. **Get connection string** and add to `MONGODB_URI`
4. **Whitelist your deployment platform's IP** or use `0.0.0.0/0` for all IPs

### Environment Variables for Production
```env
PORT=5000
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/todoapp
JWT_SECRET=your-super-secure-production-jwt-secret-at-least-32-characters
NODE_ENV=production
GMAIL_USER=your-gmail-address@gmail.com
GMAIL_APP_PASSWORD=your-gmail-app-password
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit your changes: `git commit -am 'Add feature'`
4. Push to the branch: `git push origin feature-name`
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- Icons by [Lucide React](https://lucide.dev/)
- Animations by [Framer Motion](https://www.framer.com/motion/)
- Styling with [Tailwind CSS](https://tailwindcss.com/)

## 📞 Support

If you have any questions or need help, please open an issue in the repository.

---

**Happy coding! 🎉** 