# ⚜️ Chidambaram Gold Covering - Full-Stack E-Commerce Platform

A production-ready full-stack e-commerce platform designed for **1-Gram Micro Gold Plated (Gold Covering) Chains and Bridal Rental Jewellery**.

Inspired by:
- **chidambaramgoldcovering.com** (traditional product listing, authentic South Indian temple chains, mugappu motifs, and bridal sets)
- **lenskart.com** (interactive product page featuring dual **[Try on]** and **[360° / 3D]** buttons, with in-browser webcam neck try-on)

---

## 🏗️ Architecture & Project Structure

```
covering/
├── /server                 # Express.js REST API + MongoDB (Mongoose)
│   ├── src/
│   │   ├── config/         # Database connection (supports embedded fallback & MongoDB Atlas)
│   │   ├── models/         # Product, Order, RentalBooking, Category, Banner, Settings, Admin
│   │   ├── controllers/    # API business logic
│   │   ├── routes/         # REST API endpoints
│   │   ├── middleware/     # JWT Auth & Multer storage
│   │   └── utils/          # Auto seed runner with real WhatsApp chain assets
│   ├── public/uploads/     # Static storage for chain photos, 3D glb files, and try-on PNGs
│   ├── seed.js             # Seeding script
│   └── .env.example
│
├── /client                 # User Storefront (React 19 + Vite + Tailwind CSS)
│   ├── src/
│   │   ├── components/
│   │   │   ├── tryon/      # VirtualTryOnModal with real-time video overlay and calibration
│   │   │   ├── viewer3d/   # Product3DViewerModal with Three.js / R3F gold PBR simulation & 360 spin
│   │   │   └── common/     # Navbar, Footer, ProductCard
│   │   ├── pages/          # Home, Shop, Rent, ProductDetails, Cart, Checkout, About, Contact, Wishlist
│   │   ├── store/          # Zustand store with persisted cart & wishlist
│   │   └── utils/          # WhatsApp formatted message generator with auto Order ID
│   └── public/images/      # 15 WhatsApp chain assets
│
└── /admin                  # Store Admin Portal (React 19 + Vite + Tailwind CSS)
    ├── src/
    │   ├── pages/          # Dashboard (Recharts), Products CRUD, WhatsApp Orders, Rentals, Categories, Banners, Settings
    │   ├── context/        # Admin JWT Auth Context
    │   └── services/       # Admin API client with Axios
    └── .env.example
```

---

## 🌟 Key Features

### 1. User Website
- **Home Page**: Hero banners, shop by category, festival discount offers, customer favorites, and bridal rental spotlight.
- **Product Listing (Shop & Rent)**:
  - Instant toggle between **Buy** and **Rent** models.
  - Filter by style (*Rope, Box, Mugappu, Figaro, Traditional, Curb, Spiga, Singapore*), category, and price.
  - Strikethrough pricing with **"% OFF"** badge only for items with active discounts.
- **Product Details Page (Lenskart Inspired)**:
  - High-resolution gallery with zoom.
  - **[ Try on (Camera) ]** and **[ 360° / 3D ]** action buttons.
  - Buy vs Rent switcher with dynamic date range selector and automatic conflict validation.
  - Optional custom name/initial pendant engraving with live font preview.
- **Virtual Neck Try-On**:
  - Live front/back webcam feed directly in the browser (zero server upload for privacy).
  - Chain overlay accurately positioned on the collarbone/neck area.
  - Live adjustment sliders for scaling, vertical offset, and horizontal positioning.
  - Photo snapshot and download feature.
  - Fallback photo upload mode for devices without camera permissions.
- **3D & 360° Inspection**:
  - Interactive Three.js WebGL canvas with realistic gold PBR material (metalness: 0.95, roughness: 0.12).
  - OrbitControls for smooth drag-to-rotate and zoom.
  - Automatic fallback to 360° multi-angle image spinner when no 3D `.glb` file is uploaded.
- **WhatsApp Checkout (Zero Gateways Needed)**:
  - Customer completes their name, phone, address, and delivery choice.
  - Generates an auto-incremented Order ID (e.g. `GC-2026-0001`) saved in MongoDB with status `Pending`.
  - Opens WhatsApp (`wa.me/<STORE_NUMBER>`) with a pre-filled, itemized order receipt.

### 2. Admin Management Portal
- **Secure JWT Authentication**: Auto session expiry, password change.
- **Real-time Dashboard**: Total chain inventory, active rental bookings, orders today, and daily sales charts (Recharts).
- **Product Management (CRUD)**:
  - Full control over pricing, festival offers, rental fees, and stock levels.
  - Upload chain images, 3D `.glb` files, and transparent try-on silhouettes.
  - Every update instantly reflects on the User Storefront.
- **Order Management**:
  - Review WhatsApp checkout records.
  - Update status (`Pending`, `Confirmed`, `Dispatched`, `Delivered`, `Cancelled`).
  - Print invoices.
- **Rental Tracking**:
  - Monitors upcoming return dates and flags overdue rentals.
  - 100% refundable security deposit accounting.
- **Store Settings**:
  - Update owner WhatsApp receiving phone number, shop address, and announcements anytime.

---

## 🚀 Quick Start & Local Run

### Prerequisites
- Node.js v18+ (tested on Node v24)
- npm v9+

### 1. Install Dependencies
```bash
# In the root folder:
npm run install:all
```
*(Or navigate into `/server`, `/client`, and `/admin` individually and run `npm install`)*

### 2. Start Backend API
```bash
cd server
npm run dev
```
- API will start on **http://localhost:5000**
- *Note:* If local MongoDB is not running, the server automatically starts an embedded memory database and seeds the 15 authentic chain products!

### 3. Start User Storefront
```bash
cd client
npm run dev
```
- Opens at **http://localhost:5173**

### 4. Start Admin Portal
```bash
cd admin
npm run dev
```
- Opens at **http://localhost:5174**
- **Default Admin Credentials**:
  - Email: `admin@goldcoveringshop.com`
  - Password: `admin123@Password`

---

## 📦 Deployment Guide

### Backend (Render / Railway / VPS)
1. Push the `/server` folder to GitHub.
2. In **Render** or **Railway**, create a new Web Service.
3. Set Environment Variables:
   - `PORT`: `5000`
   - `MONGODB_URI`: Your MongoDB Atlas connection string (`mongodb+srv://...`)
   - `JWT_SECRET`: Any 32-character random string
   - `CLIENT_URL`: Your deployed client URL
   - `ADMIN_URL`: Your deployed admin URL

### Frontend (Vercel / Netlify)
1. **User Client**: Set root directory to `client`. Build command: `npm run build`. Output directory: `dist`.
2. **Admin Portal**: Set root directory to `admin`. Build command: `npm run build`. Output directory: `dist`.
3. In both apps, set the environment variable:
   - `VITE_API_URL`: Your deployed backend URL.

---

## 💎 Uploading 3D Models (.glb) & Try-On Assets
1. Log in to the Admin Portal at `http://localhost:5174`.
2. Go to **Products Management** ➔ Click **Edit** or **Add New Chain**.
3. Under **Files & Try-On Calibration**:
   - Upload any standard `.glb` or `.gltf` 3D model (e.g. from Blender or Sketchfab).
   - Upload a transparent `.png` with the chain centered for optimal camera try-on draping.
4. Click **Save Product** — it immediately goes live on the storefront!

