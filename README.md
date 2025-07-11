# 🏠 Lodge Booking Web Application

A full-stack web platform designed to streamline the lodge search, discovery, and management process for students and landlords. Built by a dedicated team of Mechatronics Engineering students, this project addresses real-world housing challenges around student campuses with an intuitive interface, efficient backend, and scalable architecture.

---

## 🚀 Features Overview

### 👨‍💼 Landlord Features

- Secure registration and login
- Upload and manage lodge listings with images
- Edit lodge details and delete lodges
- View personal profile with listed lodges
- Real-time feedback from tenants
- Image upload with deletion before submission

### 🧟‍♂️ Tenant Features

- Search lodges by name, price, area, and room count
- View lodge details with reviews and landlord information
- Save favorite lodges and remove them later
- Read-only view of landlord profiles
- Submit reviews and feedback

### 🛠️ Admin Features

- Admin dashboard to manage all users and lodges
- View submitted feedback and respond accordingly
- Moderate reviews and maintain platform integrity

---

## ⚙️ Tech Stack

| Layer | Technology |
| ----- | ---------- |
|       |            |

| **Frontend** | HTML, Tailwind CSS, JavaScript                                   |
| ------------ | ---------------------------------------------------------------- |
| **Backend**  | Node.js, Express.js                                              |
| **Database** | PostgreSQL (via Supabase)                                        |
| **Hosting**  | Render (for backend), GitHub Pages / Netlify / Custom (frontend) |
| **Storage**  | Cloudinary (for lodge images)                                    |

---

## 📦 Project Structure

```
├── backend/
│   ├── controllers/
│   ├── routes/
│   ├── db/
│   ├── middleware/
│   ├── utils/
│   └── server.js
├── frontend/
│   ├── css/
│   ├── js/
│   ├── landlord.html
│   ├── tenant.html
│   └── index.html
└── README.md
```

---

## 🧠 How It Works

### 🔐 Authentication

- Landlords and tenants register using distinct forms.
- User roles are identified and stored using `localStorage`.
- Auth is email-based, stored and verified via Supabase.

### 🏨 Lodge Management

- Lodges can be created, edited, or deleted by landlords.
- Each lodge can have multiple images.
- Images are stored in Cloudinary; references are saved in the DB.
- Tenant homepage fetches only **verified** lodges.

### 🔍 Search & Filter

- Tenant and landlord profile pages support dynamic filtering:
  - By **name**, **price**, **room count**, or **area**
  - Area list is dynamically fetched from the database
- UI adapts input type based on filter selected

### 🗂️ Reviews & Favorites

- Tenants can review lodges they've viewed
- Reviews are shown on lodge detail pages
- Favorite lodges are stored per tenant, with add/remove capability

### 📨 Feedback

- All users can send feedback to the admin
- Feedback is viewable by admin for further action

---

## ⚖️ Maintenance Guide

### 1. **Environment Variables**

Ensure the following variables are set:

```
SUPABASE_URL=
SUPABASE_ANON_KEY=
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
RENDER_URL=  # If needed for deployed backend API
```

### 2. **Dependencies**

In `backend/`:

```
npm install
```

### 3. **Run Locally**

Start backend:

```
cd backend
node server.js
```

Open frontend: Open `frontend/index.html` directly or host it via a local server.

### 4. **Database Management**

- Use Supabase dashboard to manage tables:
  - `users`, `lodges`, `favorites`, `reviews`, `feedbacks`, `areas`
- Regularly backup the database from Supabase

### 5. **Image Cleanup**

- When lodges are edited or deleted, removed images are also deleted from Cloudinary
- Ensure Cloudinary API credentials are kept secure

---

## 📌 Way Forward

### 🔜 Upcoming Improvements

- Booking functionality with notifications
- Pagination and advanced filtering
- Admin analytics dashboard (lodges per area, popular searches)
- Lodging verification via document upload
- Tenant authentication via school email or ID
- PWA (Progressive Web App) upgrade for offline capability

### 🧪 Testing

- More unit and integration testing with tools like Jest or Mocha
- Frontend UI testing with Cypress or Playwright

### 🔐 Security

- Harden Supabase RLS (Row-Level Security) policies
- Add rate-limiting middleware to prevent abuse
- Encrypt sensitive data on the backend

---

## 🧑‍💻 Contributing

1. Fork the repo
2. Create a new branch
3. Commit changes with proper messages
4. Submit a pull request

---

## 📟 License

This project is developed for educational purposes and currently runs under an open development model. For any commercial use or redistribution, please contact the maintainers.

---

## 🤝 Acknowledgements

- Supabase team for managed PostgreSQL and auth
- Cloudinary for fast image delivery
- Railway for easy backend deployment
- Tailwind CSS for UI flexibility
- All contributors and testers
