# SkillBridge

SkillBridge is a peer-to-peer platform where users can post, accept, and complete help requests, featuring real-time messaging and email notifications. Built with a modern Node.js/Express backend and a React frontend.

---

## 🚀 Features
- **Help Requests:** Create, browse, accept, and complete help requests.
- **Real-time Messaging:** Chat instantly with other users on accepted requests.
- **Email Notifications:** Get notified when requests are created, accepted, completed, or when you receive a new message.
- **User Authentication:** Secure login and registration with JWT.
- **Category System:** Organize requests by category.
- **Modern UI:** Responsive, accessible, and user-friendly interface.

---

## 🛠️ Tech Stack
- **Frontend:** React, TypeScript, Vite, Tailwind CSS, ShadCN, Socket.IO Client
- **Backend:** Node.js, Express, MongoDB, Mongoose, Socket.IO, Nodemailer

---

## 📦 Getting Started

### 1. Backend Setup
```bash
cd backend
npm install
```
Create a `.env` file with:
```env
MONGODB_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_gmail_app_password
```
Start the backend:
```bash
npm start
```

### 2. Frontend Setup
```bash
cd frontend
npm install
```
Set the backend URL in `.env` or `vite.config.ts`:
```env
VITE_BACKEND_URL=http://localhost:3001/api
```
Start the frontend:
```bash
npm run dev
```

- Backend runs on `http://localhost:3001`
- Frontend runs on `http://localhost:5173`

---

## 📁 Project Structure
```
SkillBridge/
├── backend/
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   ├── utils/
│   └── server.js
└── frontend/
    ├── src/
    │   ├── components/
    │   ├── pages/
    │   ├── services/
    │   ├── hooks/
    │   ├── contexts/
    │   └── utils/
    └── index.html
```

---

## 👥 Team
- [Anuj Shrivastav] - Team Lead
- [Divyansh Agrawal]

---

**Built with ❤️ by HackUnite Team**
