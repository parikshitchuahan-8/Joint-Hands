# 🤝 JointHands

**JointHands** is a revolutionary, accessibility-first career empowerment ecosystem built to bridge the gap between inclusive employers and differently-abled (Divyangjan) talent. Designed with universal access in mind, JointHands completely bypasses traditional physical navigation by introducing **Touchless AI Controls** (Gestures & Voice) while providing an end-to-end ecosystem for inclusive jobs, mock interviews, mentorship, and integrated Government Schemes.

---

## 🌟 Key Features

- 🦾 **Touchless Navigation (No Mouse/Keyboard Required)**
  - Fully navigable using your webcam and **Hand Gestures** (Google MediaPipe).
  - Built-in continuous **Voice Commands** for navigating, typing, and posting.
- 🤖 **AI-Powered Mock Interviews**
  - Generates specialized interview questions based on targeted job roles.
  - Takes **spoken** answers via microphone and provides real-time AI grading and feedback.
- 💼 **Accessible Job Portal**
  - Recruiters and Students distinct roles.
  - Jobs are tagged with practical accessibility markers (e.g., *Wheelchair Accessible, ASL Support, Screen-Reader Friendly*).
- 🏛️ **Government Schemes (Yojanas) Mapping**
  - Connects users seamlessly to financial grants and schemes tailored to their specific disability profile.
- 🤝 **Community & Mentorship**
  - Interactive social feeds, peer-to-peer connections, and expert mentorship matching to guide users across their career trajectory.

---

## 🏗️ Architecture & Tech Stack

Our platform is a decoupled, highly-scalable **MERN** stack application.

- **Frontend:** React.js, Vite, TailwindCSS, Radix UI.
- **Backend:** Node.js, Express.js.
- **Database:** MongoDB (Cloud Atlas) & Mongoose.
- **Authentication:** Cross-Origin Secure HTTP-Only JWT Cookies (`bcryptjs`).
- **AI Engines:** Groq / OpenAI API (Language Processing), Google MediaPipe WebAssembly (Edge Computer Vision API).

---

## ⚙️ Local Development Setup

To run this project locally, you will need **Node.js** and **MongoDB** (Compass or Atlas) installed.

### 1. Clone the repository
```bash
git clone https://github.com/parikshitchuahan-8/Joint-Hands.git
cd Joint-Hands
```

### 2. Setup the Backend
Open a terminal, navigate to the `backend` folder, and install dependencies:
```bash
cd backend
npm install
```
Create a `.env` file in the `backend` folder and add the following keys:
```env
PORT=4000
MONGODB_URL=mongodb://127.0.0.1:27017/jointhands_db
CLIENT_URL=http://localhost:5173
SECRETKEY=your_super_secret_string
GROK_API_KEY=your_groq_or_openai_api_key
```
Start the backend server:
```bash
npm run dev
# OR: node index.js
```

### 3. Setup the Frontend
Open a new terminal, navigate to the `frontend` folder, and install dependencies:
```bash
cd frontend
npm install
```
Create a `.env` file in the `frontend` folder and add the API specific link:
```env
VITE_API_BASE_URL=http://localhost:4000
```
Start the Vite development server:
```bash
npm run dev
```

Your frontend should now be running at `http://localhost:5173` and connected to the backend. Enjoy exploring!

---

## 🔒 Security Notice
Please ensure your API keys and JWT Secrets remain perfectly safe. Never modify `.env.example` with raw keys; always create private `.env` files locally.

---
*Built with ❤️ for a more inclusive world.*
