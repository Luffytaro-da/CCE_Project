"""
=============================================================================
Student Task Manager (TaskFlow) - Flask Backend Application
=============================================================================
Course Project: CCE Lab / College Mini-Project
Target Platform: Google Cloud App Engine (Standard Environment)

Description:
    Core Python Flask web server serving single-page application routes,
    login/signup authentication views, and API health endpoints.
=============================================================================
"""

import os
from flask import Flask, render_template, jsonify, redirect, url_for

app = Flask(__name__)

# Route: Main Root / Redirects to Dashboard
@app.route('/')
def root():
    return render_template('index.html')

# Route: Dashboard Single Page View
@app.route('/dashboard')
def dashboard():
    return render_template('index.html')

# Route: Login Portal View
@app.route('/login')
def login():
    return render_template('login.html')

# Route: Signup Portal View
@app.route('/signup')
def signup():
    return render_template('signup.html')

# Route: My Tasks View Shortcut
@app.route('/my-tasks')
def my_tasks():
    return render_template('index.html')

# Route: Calendar View Shortcut
@app.route('/calendar')
def calendar():
    return render_template('index.html')

# Route: Completed Tasks View Shortcut
@app.route('/completed')
def completed():
    return render_template('index.html')

# Route: Settings View Shortcut
@app.route('/settings')
def settings():
    return render_template('index.html')

# Route: Health Check Endpoint for App Engine Monitoring
@app.route('/api/health')
def health_check():
    return jsonify({
        "status": "healthy",
        "service": "TaskFlow Student Manager",
        "auth": "Firebase Authentication",
        "database": "Cloud Firestore",
        "version": "2.0.0"
    }), 200

# Route: Initial Starter Task Samples for Demo Users
@app.route('/api/demo-tasks')
def get_demo_tasks():
    sample_tasks = [
        {
            "id": "task-101",
            "title": "Complete Cloud Computing Lab Project Report",
            "description": "Build and deploy TaskFlow on Google Cloud App Engine Standard using Python Flask.",
            "dueDate": "2026-09-15",
            "priority": "High",
            "subject": "Cloud Computing",
            "completed": False,
            "createdAt": "2026-09-01T10:00:00.000Z"
        },
        {
            "id": "task-102",
            "title": "Data Structures Seminar Presentation",
            "description": "Create slides explaining Graph algorithms (Dijkstra and A* Search).",
            "dueDate": "2026-09-18",
            "priority": "Medium",
            "subject": "Data Structures",
            "completed": False,
            "createdAt": "2026-09-02T11:00:00.000Z"
        },
        {
            "id": "task-103",
            "title": "Submit DBMS Project Abstract",
            "description": "Finalize topic for DBMS mini-project and get approval from professor.",
            "dueDate": "2026-09-10",
            "priority": "High",
            "subject": "Database Systems",
            "completed": True,
            "createdAt": "2026-08-28T09:00:00.000Z"
        }
    ]
    return jsonify(sample_tasks), 200

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 8080))
    app.run(host='0.0.0.0', port=port, debug=True)
