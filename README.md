# 🌍 TripCrafter — Full-Stack Travel Booking Platform

<p align="center">
  <img src="https://img.shields.io/badge/React-18-blue?logo=react" />
  <img src="https://img.shields.io/badge/Node.js-22-green?logo=nodedotjs" />
  <img src="https://img.shields.io/badge/MongoDB-Atlas-success?logo=mongodb" />
  <img src="https://img.shields.io/badge/Razorpay-Payment-blueviolet" />
</p>

> A production-grade MERN stack travel platform with hotel/bus bookings, Razorpay payments, admin analytics, email notifications, and more.

---

## ✨ Features

| Category | Features |
|---|---|
| 🏨 **Hotels** | Search by city/name, filter by price & rating, date picker, real-time price |
| 🚌 **Buses** | Search origin → destination, date filter, live seat availability |
| 💳 **Payments** | Full Razorpay integration with signature verification |
| 🧾 **Receipts** | Booking receipt page with PDF/Print support |
| 👤 **Profile** | Edit name, change password, view booking/wishlist stats |
| 📊 **Admin Panel** | Analytics dashboard with revenue & bookings charts (Recharts) |
| 🔐 **Security** | Helmet, rate limiting (10 auth / 100 API req per 15min), JWT, bcrypt |
| 📧 **Email** | Booking confirmation + forgot password emails via Nodemailer |
| 🔔 **Notifications** | Navbar badges for active bookings & wishlist, react-hot-toast |
| 📱 **Mobile** | Fully responsive with hamburger navigation |
| 💀 **Skeletons** | Shimmer skeleton cards for all loading states |

---

## 🛠 Tech Stack

**Frontend:** React 18, Vite, React Router v6, Axios, Recharts, react-hot-toast, Tailwind CSS  
**Backend:** Node.js, Express, Mongoose (MongoDB), JWT, bcrypt, Razorpay, Nodemailer  
**Database:** MongoDB Atlas  
**Deploy:** Vercel (frontend) + Render (backend)

---

## 🚀 Getting Started

### 1. Clone the repo
```bash
git clone https://github.com/YOUR_USERNAME/trip-crafter.git
cd trip-crafter
```

### 2. Setup Backend
```bash
cd backend
npm install
# create .env with values below
npm run dev
```

### 3. Setup Frontend
```bash
cd frontend
npm install
npm run dev
```

---

## 🔑 Environment Variables

### `backend/.env`
```env
PORT=4000
MONGODB_URI=mongodb+srv://...
JWT_SECRET=your_super_secret

RAZORPAY_KEY_ID=rzp_test_...
RAZORPAY_KEY_SECRET=...

EMAIL_USER=your@gmail.com
EMAIL_PASS=xxxx xxxx xxxx xxxx

FRONTEND_URL=http://localhost:5173
```

---

## 📦 Deployment

### Backend → [Render.com](https://render.com)
- Root Directory: `backend`
- Build: `npm install` | Start: `node server.js`
- Add all env vars from `render.yaml`

### Frontend → [Vercel.com](https://vercel.com)
- Root Directory: `frontend`
- Build: `npm run build` | Output: `dist`
- Add `VITE_RAZORPAY_KEY_ID` env var

---

## 🙋 Author

Built with by [Nirdesh Yadav](https://github.com/YOUR_USERNAME)
