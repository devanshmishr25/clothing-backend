# 🛍 Clothing E-Commerce Backend API
```
Backend service for a clothing e-commerce platform providing REST APIs for authentication, products, cart, orders, payments, and user management.
This backend supports scalable multi-user operations and integrates image uploads and online payments.
```
---

## 🌐 Live API
```
Backend deployed on Render: https://clothing-backend-8u4o.onrender.com
Health check endpoint: GET /health
```

---

## 🚀 Features

### 👤 User Features
- User registration & login using JWT authentication
- Profile management
- Address management
- Product browsing & filtering
- Cart management
- Wishlist support
- Cash on Delivery (COD) order placement
- Order cancellation
- Product reviews & ratings

### 🛠 Admin Features
- Product management APIs
- Category management
- Order status management
- User management
- Dashboard statistics

### ⚡ Additional Features
- Image upload using Cloudinary
- Razorpay payment integration
- Swagger API documentation
- Role-based authorization
- Stock validation & management
- Production-ready deployment

---

## 🧱 Tech Stack

### Backend
- Node.js
- Express.js
- MongoDB & Mongoose
- JWT Authentication
- REST API architecture

### Integrations
- Cloudinary (image storage)
- Razorpay (payment gateway)
- Swagger (API documentation)

### Deployment
- Render
- MongoDB Atlas

---

## 📁 Project Structure
```
src/
│
├── config/ # Database & service configuration
│ └── db.js
│
├── controllers/ # Business logic
│
├── middleware/ # Authentication & error middleware
│
├── models/ # MongoDB schemas
│
├── routes/ # API routes
│
├── app.js # Express app configuration
└── server.js # Application entry point
```

---

## 🔐 Authentication

```Authentication is handled using JWT tokens.
Protected routes require: Authorization: Bearer <token>```

---

## ⚙️ Environment Variables

Create a `.env` file in project root:
```
PORT=5000
MONGO_URI=your_mongodb_uri
JWT_SECRET=your_secret_key

CLOUDINARY_CLOUD_NAME=xxx
CLOUDINARY_API_KEY=xxx
CLOUDINARY_API_SECRET=xxx

RAZORPAY_KEY_ID=xxx
RAZORPAY_KEY_SECRET=xxx
```

---

## 📘 API Documentation
```
Swagger documentation is available at: /docs
Example: http://localhost:5000/docs
```

---

## 🔒 Security Features

- JWT authentication
- Role-based authorization
- Input validation
- Error handling middleware
- Secure environment configuration

---

## 👨‍💻 Author

**Devansh Mishra**  

---

## 📄 License

This project is developed for learning and portfolio demonstration purposes.