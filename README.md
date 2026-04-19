# 🔴 Donezo

**Donezo** is a full-stack, modern task management web application designed for ultimate productivity. Featuring a sleek, high-contrast **black-and-red** aesthetic, Donezo keeps you laser-focused on what matters: your tasks, habits, and goals — all securely persisted to a real backend database.

### 🌍 Live Deployments
- **Frontend (Vercel):** [https://your-vercel-app-url.vercel.app](https://your-vercel-app-url.vercel.app) *(Replace with your actual Vercel link!)*
- **Backend API (Render):** [https://donezo-af1z.onrender.com](https://donezo-af1z.onrender.com)

---


## ✨ Features

Donezo is built with a modular, view-based architecture to manage all aspects of your daily productivity:

* **📊 Dashboard**: Get a high-level overview of your daily progress, active tasks, and upcoming goals.
* **📝 Tasks Management**: Add, edit, filter, and complete tasks with sub-task support, priorities, categories, and recurring options.
* **🔄 Habit Tracker**: Build routines with daily habit tracking and streak counters to ensure consistency.
* **🎯 Goals**: Set long-term objectives and break them down into actionable, toggleable milestones.
* **📈 Analytics**: Review your productivity trends through insightful data overlays.
* **📅 Calendar**: Plan ahead and view tasks and events assigned to specific dates.
* **🔐 Authentication**: Secure registration and login with JWT-based sessions. Supports guest access.
* **📱 Mobile Responsive**: Beautifully optimized for seamless usage on both desktop browsers and mobile devices.

---

## 🎨 Design Philosophy

Donezo stands apart with its **premium aesthetic**:
* **Strict Black & Red Palette**: A bespoke color system built exclusively on deep blacks, grays, and striking blood-red accents (strictly no blues or generic colors), designed to convey urgency, focus, and a sleek modern vibe.
* **Minimalist Interface**: Clean typography and strategic use of negative space ensure the UI gets out of your way.
* **Dynamic Animations**: Smooth transitions and micro-animations provide an intuitive and tactile user experience.

---

## 🛠️ Technology Stack

### Frontend
| Technology | Purpose |
|---|---|
| React 19 | UI framework |
| React Context API | Global state management |
| Vanilla CSS + Custom Properties | Theming & component styling |
| React Testing Library & Jest | Unit & integration tests |
| Webpack (via CRA) | Build tool |

### Backend
| Technology | Purpose |
|---|---|
| Node.js + Express | REST API server |
| SQLite (via `sqlite` + `sqlite3`) | Persistent relational database (zero-config) |
| JSON Web Tokens (`jsonwebtoken`) | Stateless authentication |
| bcryptjs | Secure password hashing |
| uuid | Unique ID generation |
| CORS | Cross-origin request handling |

---

## 📂 Project Structure

```text
Donezo/
├── Backend/
│   ├── db/
│   │   └── database.js         # SQLite schema initialization
│   ├── middleware/
│   │   └── auth.js             # JWT authentication middleware
│   ├── routes/
│   │   ├── auth.js             # POST /register, POST /login, GET /me
│   │   ├── tasks.js            # Full CRUD + subtask & status toggles
│   │   ├── habits.js           # Full CRUD + toggle-today & history
│   │   ├── goals.js            # Full CRUD + milestone toggles
│   │   └── notifications.js    # CRUD + mark-read + clear-all
│   ├── .env                    # Environment variables (PORT, JWT_SECRET)
│   ├── package.json
│   └── server.js               # Express entry point
│
├── Frontend/
│   ├── public/                 # Static assets
│   └── src/
│       ├── components/         # Modular layout views & UI components
│       │   ├── Analytics/      # Productivity charts & overviews
│       │   ├── Calendar/       # Monthly/Weekly date views
│       │   ├── Dashboard/      # Main application landing page
│       │   ├── Goals/          # Long-term milestone tracker
│       │   ├── Habits/         # Daily routine builder
│       │   ├── Header/         # Top navigation and user info
│       │   ├── Login/          # Auth screen (Sign In / Create Account)
│       │   ├── Sidebar/        # App navigation & routing
│       │   └── Tasks/          # Core to-do list functionalities
│       ├── context/
│       │   └── AppContext.js   # Global state + async API action helpers
│       ├── data/
│       │   └── initialData.js  # Category, priority & status definitions
│       ├── services/
│       │   └── api.js          # Centralized fetch wrapper for all API calls
│       ├── App.js              # Application shell (orchestrates views)
│       ├── App.css             # Root application styling
│       ├── index.css           # Global theme variables & typography
│       └── index.js            # React entry point
│
└── README.md
```

---

## 🌐 API Reference

Base URL: `http://localhost:5000/api`

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/health` | ❌ | Server health check |
| `POST` | `/auth/register` | ❌ | Register a new user |
| `POST` | `/auth/login` | ❌ | Login and receive a JWT |
| `GET` | `/auth/me` | ✅ | Verify token & get user info |
| `GET` | `/tasks` | ✅ | Get all tasks for the user |
| `POST` | `/tasks` | ✅ | Create a new task |
| `PUT` | `/tasks/:id` | ✅ | Update a task |
| `PATCH` | `/tasks/:id/status` | ✅ | Toggle task status |
| `PATCH` | `/tasks/:id/subtasks/:subtaskId` | ✅ | Toggle a subtask |
| `DELETE` | `/tasks/:id` | ✅ | Delete a task |
| `GET` | `/habits` | ✅ | Get all habits |
| `POST` | `/habits` | ✅ | Create a habit |
| `PATCH` | `/habits/:id/toggle` | ✅ | Toggle completed-today |
| `PATCH` | `/habits/:id/history` | ✅ | Update a day in the week history |
| `DELETE` | `/habits/:id` | ✅ | Delete a habit |
| `GET` | `/goals` | ✅ | Get all goals |
| `POST` | `/goals` | ✅ | Create a goal |
| `PUT` | `/goals/:id` | ✅ | Update a goal or its progress |
| `PATCH` | `/goals/:id/milestones/:milestoneId` | ✅ | Toggle a milestone |
| `DELETE` | `/goals/:id` | ✅ | Delete a goal |
| `GET` | `/notifications` | ✅ | Get all notifications |
| `POST` | `/notifications` | ✅ | Create a notification |
| `PATCH` | `/notifications/:id/read` | ✅ | Mark one notification as read |
| `PATCH` | `/notifications/read-all` | ✅ | Mark all notifications as read |
| `DELETE` | `/notifications` | ✅ | Clear all notifications |

> ✅ = Requires `Authorization: Bearer <token>` header

---

## 🚀 Getting Started

### Prerequisites

Ensure you have [Node.js](https://nodejs.org/) (v16 or higher) installed on your system. No external database setup is required — SQLite runs embedded within the backend.

### 1. Clone the repository

```bash
git clone https://github.com/your-username/Donezo.git
cd Donezo
```

### 2. Start the Backend

```bash
cd Backend
npm install
npm start
```

The backend API will be available at `http://localhost:5000`.  
A `donezo.sqlite` database file will be auto-created in `Backend/db/` on first launch.

> **Environment Variables** (Backend `.env`):
> ```
> PORT=5000
> JWT_SECRET=your_secret_key_here
> ```

### 3. Start the Frontend

Open a **new terminal** and run:

```bash
cd Frontend
npm install
npm start
```

The app will open in your browser at `http://localhost:3000`.

---

## 📜 Available Scripts

### Backend (`cd Backend`)
| Script | Description |
|---|---|
| `npm start` | Starts the production server |
| `npm run dev` | Starts with nodemon (auto-reload on file changes) |

### Frontend (`cd Frontend`)
| Script | Description |
|---|---|
| `npm start` | Runs the app in development mode at port 3000 |
| `npm test` | Launches the test runner |
| `npm run build` | Builds the app for production |

---

## 💡 Future Enhancements

* OAuth integration (Google Sign-In).
* Push notification reminders for due tasks.
* Cloud database migration for cross-device sync.
* Year-in-review analytics summaries.
* Dark/Light theme toggle.

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome! Feel free to fork this project and submit a Pull Request.

---

## 📄 License

This project is licensed under the MIT License.
