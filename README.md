# 🔴 Donezo

**Donezo** is a modern, minimalist task management web application designed for ultimate productivity. Featuring a sleek, high-contrast **black-and-red** aesthetic, Donezo keeps you laser-focused on what matters: your tasks, habits, and goals.

---

## ✨ Features

Donezo is built with a modular, view-based architecture to manage all aspects of your daily productivity:

* **📊 Dashboard**: Get a high-level overview of your daily progress, active tasks, and upcoming goals.
* **📝 Tasks Management**: Quickly add, edit, and check off items on your to-do list.
* **🔄 Habit Tracker**: Build routines with daily habit tracking, ensuring consistency without distraction.
* **🎯 Goals**: Set long-term objectives and break them down into actionable milestones.
* **📈 Analytics**: Review your productivity trends through insightful data overlays.
* **📅 Calendar**: Plan ahead and view tasks and events assigned to specific dates.
* **📱 Mobile Responsive**: Layouts are fully optimized for seamless usage on both desktop browsers and mobile devices.

---

## 🎨 Design Philosophy

Donezo stands apart with its **premium aesthetic**:
* **Strict Black & Red Palette**: Features a bespoke color system built exclusively on deep blacks, grays, and striking blood-red accents (strictly no blues or generic colors), designed to convey urgency, focus, and a sleek modern vibe.
* **Minimalist Interface**: Clean typography and strategic use of negative space ensure the UI gets out of your way.
* **Dynamic Animations**: Smooth transitions and micro-animations provide an intuitive and tactile user experience.

---

## 🛠️ Technology Stack

* **Frontend Framework**: React 19
* **State Management**: React Context API (`AppContext`)
* **Styling**: Vanilla CSS leveraging custom CSS properties for theme consistency
* **Testing**: React Testing Library & Jest
* **Build Tool**: Create React App scripts

---

## 📂 Project Structure

```text
Donezo/
├── public/                 # Static assets
├── src/
│   ├── components/         # Modular layout views & UI components
│   │   ├── Analytics/      # Productivity charts & overviews
│   │   ├── Calendar/       # Monthly/Weekly date views
│   │   ├── Dashboard/      # Main application landing page
│   │   ├── Goals/          # Long-term milestone tracker
│   │   ├── Habits/         # Daily routine builder
│   │   ├── Header/         # Top navigation and user info
│   │   ├── Sidebar/        # App navigation & routing
│   │   └── Tasks/          # Core to-do list functionalities
│   ├── context/            # Scalable global state management
│   │   └── AppContext.js
│   ├── App.js              # Application shell (orchestrates views)
│   ├── index.css           # Global theme variables & typography
│   └── index.js            # React entry point
├── package.json            # Project dependencies & scripts
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites

Ensure you have Node.js (version 16 or higher) installed on your system.

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/your-username/Donezo.git
   cd Donezo
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the development server:**
   ```bash
   npm start
   ```
   *The app will automatically open in your default browser at `http://localhost:3000`.*

### Available Scripts

In the project directory, you can run:

* `npm start`: Runs the app in the development mode.
* `npm test`: Launches the test runner in the interactive watch mode.
* `npm run build`: Builds the app for production to the `build` folder.

---

## 💡 Future Enhancements

* Implementing persistent cloud sync for cross-device usage.
* Adding customizable notification reminders.
* Expanding Analytics to show year-in-review summaries.

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome! Feel free to fork this project and submit a Pull Request.

---

## 📄 License

This project is licensed under the MIT License.
