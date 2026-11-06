# 🍕 PizzaHub – Full-Stack Pizza Delivery Application

PizzaHub is a full-stack pizza delivery application that allows customers to explore pizzas, build custom pizzas, place orders, make online payments, and track deliveries in real time.

The platform includes separate interfaces and functionality for customers, administrators, and delivery agents.

## 🚀 Features

### 👤 Authentication
- User registration and login
- Email verification using OTP
- Forgot password and reset password
- JWT-based authentication
- Role-based access control

### 🍕 Pizza & Cart
- Browse available pizzas
- View pizza details
- Build custom pizzas
- Add pizzas to cart
- Update item quantities
- Calculate cart subtotal and total

### 💳 Payment
- Razorpay payment integration
- Server-side payment verification
- Payment success and failure handling

### 📦 Order Management
- Place pizza orders
- View personal order history
- View individual order details
- Track order status

### 🛠️ Admin Dashboard
- Manage pizzas
- Manage inventory
- View and manage customer orders
- Assign delivery agents
- Update order status
- Manage application settings

### 🛵 Delivery Agent
- Delivery agent authentication
- View assigned orders
- Confirm order pickup
- Update delivery status
- Share live GPS location
- Real-time delivery tracking

### ⚡ Real-Time Functionality
- Socket.IO integration
- Live delivery location updates
- Real-time order tracking

## 🧰 Tech Stack

**Frontend**
- React.js
- Vite
- Redux Toolkit
- React Router
- Tailwind CSS
- Axios

**Backend**
- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT Authentication
- Socket.IO

**Payment Integration**
- Razorpay

**API Testing**
- Postman

## 📁 Project Structure

```text
PizzaHub/
├── backend/
│   ├── config/
│   ├── controllers/
│   ├── jobs/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── utils/
│   ├── app.js
│   ├── server.js
│   └── package.json
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── assets/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── redux/
│   │   ├── routes/
│   │   └── services/
│   └── package.json
│
├── postman/
└── README.md
```

## ⚙️ Installation and Setup

### Prerequisites

Make sure you have installed:

- Node.js (LTS version)
- npm
- MongoDB
- Git

### 1. Clone the Repository

```bash
git clone https://github.com/JHA123ABHIlash/PizzaHub.git
cd PizzaHub
```

### 2. Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file inside the backend directory and configure the environment variables required by your application.

Example configuration (use the exact variable names from your backend code):

```env
PORT=4000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret

CLIENT_URL=your_frontend_url

RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret

# Add your email service credentials
# Add any other environment variables required by the backend
```

Start the backend using the script defined in `backend/package.json`.

For example:

```bash
npm run dev
```

### 3. Frontend Setup

Open another terminal:

```bash
cd frontend
npm install
```

Configure the frontend API URL in its environment configuration, using the variable name expected by your frontend code.

For example:

```env
VITE_API_URL=your_backend_api_url
```

Start the frontend:

```bash
npm run dev
```

The frontend development server will display its local URL in the terminal.

## 🔐 Security

- Sensitive credentials are stored in environment variables.
- JWT is used for authentication.
- Role-based authorization protects restricted functionality.
- Payment verification is performed on the backend.
- Environment files and dependencies are excluded from Git.

**Never commit real API keys, database credentials, JWT secrets, or payment secrets to GitHub.**

## 🧪 API Testing

Postman collections are included in the repository for testing the application's APIs.

Import the available collection and configure the required environment variables before testing the endpoints.

## 🎯 Project Objective

The objective of PizzaHub is to build a complete pizza delivery platform with customer ordering, online payments, inventory management, administrative controls, delivery agent functionality, and real-time order tracking.

## 👨‍💻 Developer

**Name:** Abhilash Kumar Jha

**Project:** PizzaHub – Full-Stack Pizza Delivery Application

**GitHub:** https://github.com/JHA123ABHIlash/PizzaHub

---

⭐ If you find this project useful, feel free to explore the repository and its features.