# Trip Crafter ✈️

Trip Crafter is a modern web application designed to help users plan their perfect journeys with ease.

## Tech Stack

### Frontend
- **React 19** with **Vite** for fast development and building.
- **Tailwind CSS v4** for rapid, utility-first UI styling.
- **React Router v7** for seamless client-side navigation.
- **Axios** for making HTTP requests to the backend.
- **Context API** for global state management (Authentication).

### Backend
- **Node.js & Express.js** for the API server.
- **MongoDB & Mongoose** for the database and object modeling.
- **JSON Web Tokens (JWT)** & HTTP-only cookies for secure authentication.
- **bcryptjs** for secure password hashing.

---

## Features Implemented So Far

### 1. Backend Authentication System
- **User Model:** Secure Mongoose schema with pre-save hooks to hash passwords.
- **Auth Endpoints:** 
  - `POST /api/auth/register`: Create a new user.
  - `POST /api/auth/login`: Authenticate and issue an HTTP-only JWT cookie.
  - `POST /api/auth/logout`: Clear the authentication cookie.
- **Auth Middleware:** Protected routes using JWT verification.

### 2. Frontend User Interface
- **Pages:**
  - `Home`: A welcoming landing page with call-to-actions.
  - `Register`: A form to create a new Trip Crafter account.
  - `Login`: A form to securely log in.
  - `Dashboard`: A protected area where users can view and manage their upcoming trips.
- **Components:**
  - `Navbar`: A responsive, dynamic navigation bar that updates based on the user's login status.
  - `ProtectedRoute`: A React Router wrapper that ensures private pages (like the Dashboard) are only accessible to authenticated users.

### 3. Global Authentication State
- Implemented `AuthContext` to persist user sessions.
- Automatically checks local storage on initial load to keep users logged in.

---

## How to Run

### Backend
1. Open a terminal and navigate to the `backend` folder.
2. Ensure your `.env` file is set up with `PORT`, `MONGO_URI`, and `JWT_SECRET`.
3. Run `npm install`
4. Run `npm run dev` (or `npx nodemon server.js`) to start the server on `http://localhost:4000`.

### Frontend
1. Open a new terminal and navigate to the `frontend` folder.
2. Run `npm install`
3. Run `npm run dev` to start the Vite development server.
4. Visit `http://localhost:5173` in your browser.
