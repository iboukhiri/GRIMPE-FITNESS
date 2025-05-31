# GRIMPE - Fitness Tracking Application

A modern, full-stack fitness tracking application built with React, Node.js, and MongoDB. GRIMPE helps users track their workouts, visualize progress, and achieve their fitness goals.

## 🚀 Features

- **Workout Logging**: Track 6 different workout types with detailed metrics
- **Progress Analytics**: Comprehensive charts and statistics
- **Dark/Light Mode**: Seamless theme switching
- **Responsive Design**: Optimized for desktop and mobile
- **User Authentication**: Secure JWT-based authentication
- **Weekly Goals**: Track progress against weekly targets
- **Data Visualization**: Interactive charts using Recharts
- **Export Functionality**: PDF export for workout summaries

## 🛠️ Tech Stack

### Frontend
- **React 18** with Vite
- **Tailwind CSS** for styling
- **Recharts** for data visualization
- **React Router** for navigation
- **React Icons** for UI icons

### Backend
- **Node.js** with Express
- **MongoDB** with Mongoose
- **JWT** for authentication
- **bcrypt** for password hashing
- **CORS** for cross-origin requests

## 📋 Workout Types

1. **Entraînement** - General training sessions
2. **Musculation** - Strength training
3. **Cardio** - Cardiovascular exercises
4. **Yoga** - Yoga and flexibility
5. **Course** - Running activities
6. **Autre** - Other fitness activities

## 🚦 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or cloud)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone [repository-url]
   cd grimpe-project
   ```

2. **Install server dependencies**
   ```bash
   cd server
   npm install
   ```

3. **Install client dependencies**
   ```bash
   cd ../client
   npm install
   ```

4. **Environment Setup**
   
   Create a `.env` file in the server directory:
   ```env
   MONGODB_URI=mongodb://localhost:27017/grimpe-fitness
   JWT_SECRET=your-secret-key-here
   PORT=5000
   ```

5. **Start MongoDB**
   - Local: `mongod`
   - Or use MongoDB Atlas cloud service

6. **Generate Demo Data (Optional)**
   ```bash
   cd server
   node src/scripts/createTestData.js
   ```

7. **Start the Application**
   
   **Terminal 1 - Backend:**
   ```bash
   cd server
   npm run dev
   ```
   
   **Terminal 2 - Frontend:**
   ```bash
   cd client
   npm run dev
   ```

8. **Access the Application**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:5000

## 🔐 Demo Account

If you've run the demo data script, you can use:
- **Email**: demo@grimpe.com
- **Password**: demo123

This account comes with 18+ months of realistic workout data for testing.

## 📊 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login

### Workouts
- `GET /api/workouts` - Get user workouts (with filtering)
- `POST /api/workouts` - Create new workout
- `PUT /api/workouts/:id` - Update workout
- `DELETE /api/workouts/:id` - Delete workout

### Statistics
- `GET /api/workouts/stats/overview` - Dashboard overview stats
- `GET /api/workouts/stats/trends` - Workout trends over time
- `GET /api/workouts/stats/types` - Workout type distribution
- `GET /api/workouts/stats/records` - Personal records

## 🎨 Design Features

- **Modern UI**: Clean, gradient-based design
- **Responsive**: Mobile-first approach
- **Accessibility**: ARIA labels and keyboard navigation
- **Performance**: Optimized animations and loading states
- **Theme Support**: Light and dark mode with smooth transitions

## 📱 Mobile Support

The application is fully responsive and includes:
- Mobile-optimized navigation
- Touch-friendly interface
- Responsive charts and tables
- Mobile menu system

## 🔧 Development

### Available Scripts

**Server:**
- `npm run dev` - Start development server with nodemon
- `npm start` - Start production server

**Client:**
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

### Project Structure

```
grimpe-project/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   ├── pages/         # Page components
│   │   ├── services/      # API services
│   │   ├── contexts/      # React contexts
│   │   └── utils/         # Utility functions
│   └── ...
├── server/                # Node.js backend
│   ├── src/
│   │   ├── controllers/   # Route controllers
│   │   ├── models/        # MongoDB models
│   │   ├── routes/        # API routes
│   │   ├── middleware/    # Express middleware
│   │   └── scripts/       # Utility scripts
│   └── ...
└── README.md
```

## 🚀 Deployment

### Frontend (Vercel/Netlify)
1. Build the client: `npm run build`
2. Deploy the `dist` folder

### Backend (Heroku/Railway)
1. Set environment variables
2. Deploy from the `server` directory

### Database
- Use MongoDB Atlas for cloud hosting
- Update `MONGODB_URI` in environment variables

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- Icons by React Icons
- Charts by Recharts
- Styling by Tailwind CSS
- Authentication inspiration from various fitness apps

---

**Built with ❤️ for fitness enthusiasts** 