# 🌍 Voyage Mate

> A full-stack travel planning platform for discovering destinations, managing trips, and creating personalized itineraries.

## 🚀 Live Demo

**Frontend:**  
https://voyagemate.onrender.com

**Backend API:**  
https://voyagemate-api.onrender.com

## 📌 About the Project

Voyage Mate is a full-stack travel planning web application designed to make trip planning simple and organized.

Users can create an account, explore destinations, create trips, manage itineraries, and manage their profile from one platform.

## ✨ Features

### 🔐 Authentication

- User registration
- User login
- Logout
- JWT-based authentication
- Protected routes
- Forgot password
- Password reset through email
- Change password
- Profile management
- Account deletion

### 🗺️ Travel Planning

- Explore destinations
- Create trips
- View trip details
- Manage trips
- Create and manage itineraries

### 👤 Profile

- View profile
- Update name
- Update email
- Update avatar
- Change password
- Delete account

## 🛠️ Tech Stack

### Frontend

- React
- Vite
- React Router
- Axios
- Lucide React
- JavaScript
- CSS

### Backend

- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT
- bcryptjs
- Nodemailer
- CORS
- dotenv

### Deployment

- Render
- MongoDB Atlas
- GitHub

## 🏗️ Project Structure

```text
VoyageMate/
│
├── backend/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── utils/
│   └── server.js
│
├── public/
│
├── src/
│   ├── components/
│   ├── context/
│   ├── layouts/
│   ├── pages/
│   └── App.jsx
│
├── index.html
├── package.json
└── README.md

## 🔐 Authentication Flow

### 📝 User Registration

```text
Register
   ↓
Create account
   ↓
Password hashed with bcrypt
   ↓
User stored in MongoDB
   ↓
JWT token generated
   ↓
Authenticated user

🔑 User Login
Email + Password
       ↓
Backend validates credentials
       ↓
JWT generated
       ↓
User authenticated
       ↓
Protected pages accessible

🔄 Forgot Password
Forgot Password
       ↓
Enter registered email
       ↓
Reset email sent
       ↓
Open reset link
       ↓
Create new password
       ↓
Login with new password


🛡️ Protected Routes
User opens protected page
       ↓
ProtectedRoute checks authentication
       ↓
Authenticated?
   ↙          ↘
 YES           NO
  ↓             ↓
Show page    Redirect to Login


## 🌐 API Endpoints

### Authentication

| Method | Endpoint | Description | Authentication |
|--------|----------|-------------|----------------|
| POST | `/api/auth/register` | Create a new account | Public |
| POST | `/api/auth/login` | Login to account | Public |
| POST | `/api/auth/forgot-password` | Request password reset | Public |
| POST | `/api/auth/reset-password/:token` | Reset password | Public |
| GET | `/api/auth/profile` | Get user profile | Protected |
| PUT | `/api/auth/profile` | Update user profile | Protected |
| PUT | `/api/auth/change-password` | Change password | Protected |
| DELETE | `/api/auth/account` | Delete account | Protected |

### Trips

Trip management APIs are available under:

```text
/api/trips

Itineraries

Itinerary management APIs are available under:

/api/itinerary

## ⚙️ Getting Started

Follow the steps below to run Voyage Mate locally.

### 1. Clone the Repository

```bash
git clone https://github.com/Krishna9192/VoyageMate.git
cd VoyageMate

## 🔐 Environment Variables

The backend requires environment variables for database access, authentication, email services, and frontend configuration.

Create a `.env` file inside the `backend` folder:

```env
PORT=5000

MONGODB_URI=your_mongodb_connection_string

JWT_SECRET=your_jwt_secret

EMAIL_USER=your_email_address

EMAIL_APP_PASSWORD=your_email_app_password

FRONTEND_URL=http://localhost:5173


## 🚀 Deployment

Voyage Mate is deployed using Render.

### Frontend

```text
React + Vite
      ↓
GitHub
      ↓
Render Static Site
      ↓
https://voyagemate.onrender.com

Backend
Node.js + Express
      ↓
GitHub
      ↓
Render Web Service
      ↓
https://voyagemate-api.onrender.com

Database
MongoDB Atlas

🧪 Testing Checklist
Authentication
 Register a new account
 Login with registered account
 Logout
 Login with incorrect credentials
 Access protected pages while logged out
 Access protected pages while logged in
Password Recovery
 Open Forgot Password
 Enter registered email
 Receive reset email
 Open reset link
 Set a new password
 Login using the new password
 Verify the old password no longer works
Profile
 View profile
 Update profile
 Change password
 Delete account
Trips & Itineraries
 Create a trip
 View trips
 Open trip details
 Create/manage itinerary

 ## 🔮 Future Improvements

Some features planned for future versions of Voyage Mate include:

- 🤖 AI-powered itinerary generation
- 🗺️ Interactive maps and route planning
- 🌦️ Weather information for destinations
- ✈️ Flight and hotel search integration
- 💰 Trip expense tracking
- 👥 Collaborative trip planning
- 📤 Trip sharing
- 🔔 Travel reminders and notifications
- 📸 Destination and trip image uploads

---

## 💡 Key Learning Outcomes

Building Voyage Mate provided hands-on experience with:

- React application architecture
- React Router and protected routes
- Context API for authentication state
- REST API development
- Node.js and Express.js
- MongoDB and Mongoose
- JWT authentication
- Password hashing with bcrypt
- Password recovery workflows
- Axios API integration
- CORS configuration
- Environment variable management
- Git and GitHub
- Cloud deployment with Render

---

## 👨‍💻 Author

### Krishna

GitHub:  
https://github.com/Krishna9192

---

## ⭐ Support

If you found Voyage Mate useful or interesting, consider giving the repository a ⭐ on GitHub.

---

## 📄 License

This project was developed for educational and portfolio purposes.