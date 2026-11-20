# 🎓 Student Task Manager (TaskFlow SaaS) - Google Cloud App Engine Project

A modern, commercial-grade SaaS student productivity dashboard designed for students to track daily academic tasks, assignments, project deadlines, and semester completion velocity.

This project is built using **Python Flask, HTML5, CSS3 (CSS Variables for Dark & Light Themes), Vanilla JavaScript (ES6), and Lucide Icons**, configured specifically for deployment on **Google Cloud App Engine Standard Environment**.

---

## ✨ Features Highlight

- 🎨 **Dual Theme Engine**: Seamless toggle between **Dark Mode** and **Light Mode** with `localStorage` persistence.
- 📌 **Sidebar Navigation**: Fixed/collapsible sidebar featuring Navigation links, Task Badges, and Student Profile avatar (`Alex Morgan`).
- 🔍 **Top Navigation Bar**: Global Live Search, Notification Bell, Theme Switcher, and `+ New Task` modal button.
- 👋 **Dynamic Greeting**: Time-aware greeting (`Good morning`, `Good afternoon`, `Good evening`) with real-time date indicator.
- 📊 **Productivity Velocity Progress Card**: Real-time progress bar computing semester task completion percentage.
- 🏷️ **Task Management**: Subject tagging, Priority Badges (High, Medium, Low), Due Date indicators with overdue alerts, completion toggles, and deletion.
- 🔔 **Toast Notification System**: Floating feedback alerts on task creation, completion, deletion, and theme switching.
- 📱 **Mobile Responsiveness**: Off-canvas mobile navigation drawer with touch-friendly controls.
- ☁️ **App Engine Ready**: Fully compatible with `app.yaml`, Python 3.11 runtime, and Gunicorn WSGI server.

---

## 📁 1. Project Directory Structure

```text
CCE_Project/
│
├── app.py              # Python Flask web server & API endpoints
├── app.yaml            # Google App Engine standard environment deployment configuration
├── requirements.txt    # Python dependencies for production WSGI server
├── README.md           # Project documentation, deployment guide & report
│
├── templates/
│   └── index.html      # Modern SaaS single-page HTML5 dashboard layout
│
└── static/
    ├── style.css       # CSS3 design system with Dark/Light theme variables
    └── script.js       # Vanilla JS SaaS engine, theme switcher & localStorage
```

---

## 🛠️ 2. Technology Stack

| Component | Technology | Purpose |
| :--- | :--- | :--- |
| **Backend** | Python 3.11 + Flask 3.0.3 | Web server & template renderer |
| **Production WSGI** | Gunicorn 22.0 | HTTP WSGI server for App Engine Standard |
| **Cloud Hosting** | Google Cloud App Engine | Serverless PaaS application deployment |
| **Iconography** | Lucide Icons CDN | Modern SVG icons across sidebar, cards & buttons |
| **Frontend Styling** | CSS3 Custom Properties | Dual Dark/Light theme system, glassmorphism, responsive grid |
| **State & Storage** | Vanilla JavaScript + LocalStorage | Zero-latency client persistence without paid database fees |

---

## 📄 3. Detailed File-by-File Code Breakdown

### 🔹 `app.py`
- **Purpose**: Core WSGI entry point for Flask. Serves `index.html`, provides `/api/health` for cloud health checks, and returns sample starter tasks via `/api/demo-tasks`. Binds dynamically to environment `$PORT` (default 8080).

### 🔹 `app.yaml`
- **Purpose**: Defines Google App Engine standard configuration (`runtime: python311`, `instance_class: F1`, `entrypoint: gunicorn -b :$PORT app:app`). Routes `/static` directly through App Engine web servers.

### 🔹 `templates/index.html`
- **Purpose**: Semantic HTML5 document containing the Sidebar Navigation, Top Header, Welcome Banner, Dashboard Stat Cards, Productivity Progress Velocity Card, Filter Tabs, Task Grid, and Task Modal Form.

### 🔹 `static/style.css`
- **Purpose**: Centralized design system with `:root` / `[data-theme="dark"]` and `[data-theme="light"]` variables for background canvas, surface cards, borders, primary indigo accents, and priority badges.

### 🔹 `static/script.js`
- **Purpose**: Modular JS engine handling Lucide icon rendering (`lucide.createIcons()`), theme switching, dynamic greeting generation, productivity progress bar calculations, task filtering/sorting, form validation, and `localStorage` synchronization.

---

## 🚀 4. Running the Application Locally

1. Open PowerShell or Terminal in the project directory:
   ```bash
   cd "CCE_Project"
   ```
2. Activate Virtual Environment and install dependencies:
   ```bash
   py -3 -m venv .venv
   .\.venv\Scripts\Activate.ps1
   pip install -r requirements.txt
   ```
3. Run the Flask Web Application:
   ```bash
   python app.py
   ```
4. Open your web browser at:
   ```text
   http://127.0.0.1:8080
   ```

The checked-in Firebase configuration contains placeholders only. Configure Firebase
in your local working copy before enabling live authentication; do not commit API
keys or other credentials. Browser Firebase API keys are not a substitute for
Firestore security rules, so keep `firestore.rules` deployed and reviewed.

---

## ☁️ 5. Deploying to Google Cloud App Engine Standard Environment

1. Authenticate with Google Cloud CLI:
   ```bash
   gcloud auth login
   ```
2. Set your active Google Cloud Project ID:
   ```bash
   gcloud config set project YOUR_PROJECT_ID
   ```
3. Create App Engine App (e.g. in `us-central` or `asia-south1`):
   ```bash
   gcloud app create --region=us-central
   ```
4. Deploy the application:
   ```bash
   gcloud app deploy
   ```
5. Open your live hosted web application:
   ```bash
   gcloud app browse
   ```

---

## 🎓 6. Presentation / Viva Q&A Points

- **Q1: How is theme state persisted across browser refreshes?**
  - *Answer*: When the user clicks the Theme Toggle button, JavaScript updates `document.documentElement.setAttribute('data-theme', 'light')` and saves the string in `localStorage.setItem('student_task_manager_theme', 'light')`. Upon page load, `initTheme()` retrieves this value to apply the preferred style immediately.

- **Q2: How does the Productivity Velocity card calculate progress?**
  - *Answer*: It dynamically computes the formula `(completedTasks / totalTasks) * 100%`, sets the percentage text, and smoothly animates the CSS width of `.progress-bar-fill`.

---
*Developed for College CCE Lab Mini-Project Demonstration.*
