/**
 * =============================================================================
 * Student Task Manager - SaaS Engine (Vanilla JS)
 * =============================================================================
 * Features:
 *  1. Dual Theme System (Dark / Light Mode)
 *  2. Lucide Icons Dynamic Renderer
 *  3. Mobile Sidebar Drawer Engine
 *  4. Time-based Dynamic Greeting
 *  5. Real-time Productivity Velocity Calculator & Progress Bar
 *  6. Task CRUD with LocalStorage Persistence
 * =============================================================================
 */

document.addEventListener('DOMContentLoaded', () => {

    // -------------------------------------------------------------------------
    // 1. APPLICATION STATE
    // -------------------------------------------------------------------------
    let tasks = [];
    let currentFilter = 'all';
    let searchQuery = '';
    let currentSort = 'dueDate';

    const STORAGE_KEY = 'student_task_manager_tasks_v1';
    const THEME_KEY = 'student_task_manager_theme';

    // -------------------------------------------------------------------------
    // 2. DOM ELEMENTS SELECTION
    // -------------------------------------------------------------------------
    const tasksGrid = document.getElementById('tasksGrid');
    const emptyState = document.getElementById('emptyState');
    const emptyStateTitle = document.getElementById('emptyStateTitle');
    const emptyStateMessage = document.getElementById('emptyStateMessage');

    // Sidebar & Navigation Elements
    const appSidebar = document.getElementById('appSidebar');
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const closeSidebarBtn = document.getElementById('closeSidebarBtn');
    const sidebarBackdrop = document.getElementById('sidebarBackdrop');
    const navItems = document.querySelectorAll('.nav-item');
    const sidebarPendingCount = document.getElementById('sidebarPendingCount');

    // Theme Elements
    const themeToggleBtn = document.getElementById('themeToggleBtn');
    const themeIconSun = document.getElementById('themeIconSun');
    const themeIconMoon = document.getElementById('themeIconMoon');

    // Header & Greeting Elements
    const welcomeGreeting = document.getElementById('welcomeGreeting');
    const currentDateDisplay = document.getElementById('currentDateDisplay');

    // Dashboard Metric Elements
    const statTotal = document.getElementById('statTotal');
    const statCompleted = document.getElementById('statCompleted');
    const statPending = document.getElementById('statPending');
    const statHighPriority = document.getElementById('statHighPriority');
    const completedPercentBadge = document.getElementById('completedPercentBadge');

    // Productivity Card Elements
    const prodPercentText = document.getElementById('prodPercentText');
    const progressBarFill = document.getElementById('progressBarFill');
    const prodCompletedCount = document.getElementById('prodCompletedCount');
    const prodRemainingCount = document.getElementById('prodRemainingCount');
    const prodEncouragement = document.getElementById('prodEncouragement');

    // Controls Elements
    const searchInput = document.getElementById('searchInput');
    const sortBySelect = document.getElementById('sortBySelect');
    const filterTabs = document.querySelectorAll('.tab-btn');

    const countAll = document.getElementById('countAll');
    const countPending = document.getElementById('countPending');
    const countCompleted = document.getElementById('countCompleted');
    const countHighPriority = document.getElementById('countHighPriority');

    // Modal & Form Elements
    const openAddTaskBtn = document.getElementById('openAddTaskBtn');
    const emptyStateAddBtn = document.getElementById('emptyStateAddBtn');
    const closeModalBtn = document.getElementById('closeModalBtn');
    const cancelTaskBtn = document.getElementById('cancelTaskBtn');
    const taskModalBackdrop = document.getElementById('taskModalBackdrop');
    const taskForm = document.getElementById('taskForm');
    
    const taskTitleInput = document.getElementById('taskTitle');
    const taskSubjectInput = document.getElementById('taskSubject');
    const taskPriorityInput = document.getElementById('taskPriority');
    const taskDueDateInput = document.getElementById('taskDueDate');
    const taskDescInput = document.getElementById('taskDescription');

    const toastContainer = document.getElementById('toastContainer');

    // -------------------------------------------------------------------------
    // 3. INITIALIZATION
    // -------------------------------------------------------------------------
    function initApp() {
        initTheme();
        renderGreetingAndDate();
        loadTasksFromStorage();
        setupEventListeners();
        refreshLucideIcons();
    }

    function refreshLucideIcons() {
        if (window.lucide) {
            lucide.createIcons();
        }
    }

    // -------------------------------------------------------------------------
    // 4. THEME SWITCHER (DARK / LIGHT MODE)
    // -------------------------------------------------------------------------
    function initTheme() {
        const savedTheme = localStorage.getItem(THEME_KEY) || 'dark';
        applyTheme(savedTheme);
    }

    function applyTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem(THEME_KEY, theme);

        if (theme === 'light') {
            themeIconSun.classList.add('hidden');
            themeIconMoon.classList.remove('hidden');
        } else {
            themeIconSun.classList.remove('hidden');
            themeIconMoon.classList.add('hidden');
        }
        refreshLucideIcons();
    }

    function toggleTheme() {
        const currentTheme = document.documentElement.getAttribute('data-theme') || 'dark';
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        applyTheme(newTheme);
        showToast(`Switched to ${newTheme.toUpperCase()} mode`, 'info');
    }

    // -------------------------------------------------------------------------
    // 5. GREETING & DATE DISPLAY
    // -------------------------------------------------------------------------
    function renderGreetingAndDate() {
        const hour = new Date().getHours();
        let greetingStr = 'Good morning, Student 👋';
        if (hour >= 12 && hour < 17) {
            greetingStr = 'Good afternoon, Student 👋';
        } else if (hour >= 17) {
            greetingStr = 'Good evening, Student 👋';
        }
        welcomeGreeting.textContent = greetingStr;

        const options = { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' };
        currentDateDisplay.textContent = new Date().toLocaleDateString('en-US', options);
    }

    // -------------------------------------------------------------------------
    // 6. DATA LOADING & STORAGE
    // -------------------------------------------------------------------------
    async function loadTasksFromStorage() {
        const savedData = localStorage.getItem(STORAGE_KEY);
        if (savedData) {
            try {
                tasks = JSON.parse(savedData);
            } catch (e) {
                console.error("Failed to parse localStorage tasks:", e);
                tasks = [];
            }
        }

        if (!tasks || tasks.length === 0) {
            try {
                const response = await fetch('/api/demo-tasks');
                if (response.ok) {
                    tasks = await response.json();
                    saveTasksToStorage();
                } else {
                    useFallbackDemoTasks();
                }
            } catch (err) {
                useFallbackDemoTasks();
            }
        }

        renderApp();
    }

    function useFallbackDemoTasks() {
        tasks = [
            {
                id: 'task-' + Date.now() + '-1',
                title: 'Deploy Student Task Manager to App Engine',
                description: 'Verify gunicorn entrypoint and app.yaml config before submitting lab report.',
                dueDate: getFutureDateStr(2),
                priority: 'High',
                subject: 'Cloud Computing',
                completed: false
            },
            {
                id: 'task-' + Date.now() + '-2',
                title: 'Data Structures Seminar Slides',
                description: 'Prepare presentation explaining Dijkstra graph search and A* algorithms.',
                dueDate: getFutureDateStr(5),
                priority: 'Medium',
                subject: 'Data Structures',
                completed: false
            },
            {
                id: 'task-' + Date.now() + '-3',
                title: 'Submit DBMS Assignment 2',
                description: 'Complete SQL queries for relational join operations and indexing.',
                dueDate: getFutureDateStr(-1),
                priority: 'High',
                subject: 'Database Systems',
                completed: true
            }
        ];
        saveTasksToStorage();
    }

    function getFutureDateStr(daysAhead) {
        const d = new Date();
        d.setDate(d.getDate() + daysAhead);
        return d.toISOString().split('T')[0];
    }

    function saveTasksToStorage() {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
    }

    // -------------------------------------------------------------------------
    // 7. RENDER ENGINE & PRODUCTIVITY CALCULATOR
    // -------------------------------------------------------------------------
    function renderApp() {
        updateMetricsAndProductivity();
        const filteredTasks = filterAndSortTasks();
        renderTasksGrid(filteredTasks);
        refreshLucideIcons();
    }

    function updateMetricsAndProductivity() {
        const total = tasks.length;
        const completed = tasks.filter(t => t.completed).length;
        const pending = total - completed;
        const highPriority = tasks.filter(t => t.priority === 'High' && !t.completed).length;

        // Stat Cards
        statTotal.textContent = total;
        statCompleted.textContent = completed;
        statPending.textContent = pending;
        statHighPriority.textContent = highPriority;

        // Sidebar Badge Count
        sidebarPendingCount.textContent = pending;

        // Tab Badges
        countAll.textContent = total;
        countPending.textContent = pending;
        countCompleted.textContent = completed;
        countHighPriority.textContent = tasks.filter(t => t.priority === 'High').length;

        // Completion Percentage calculation
        const percent = total > 0 ? Math.round((completed / total) * 100) : 0;
        completedPercentBadge.textContent = `${percent}% Done`;
        prodPercentText.textContent = `${percent}%`;

        // Progress Bar
        progressBarFill.style.width = `${percent}%`;
        prodCompletedCount.textContent = completed;
        prodRemainingCount.textContent = pending;

        // Encouragement text
        if (total === 0) {
            prodEncouragement.textContent = "Add your academic goals to start tracking! 🎯";
        } else if (percent === 100) {
            prodEncouragement.textContent = "All tasks completed! Magnificent work 🎉";
        } else if (percent >= 50) {
            prodEncouragement.textContent = "Keep up the great momentum! 🚀";
        } else {
            prodEncouragement.textContent = "Focus on your top pending tasks today! 💪";
        }
    }

    function filterAndSortTasks() {
        return tasks.filter(task => {
            // Filter Tab
            if (currentFilter === 'pending' && task.completed) return false;
            if (currentFilter === 'completed' && !task.completed) return false;
            if (currentFilter === 'high-priority' && task.priority !== 'High') return false;

            // Search Filter
            if (searchQuery.trim() !== '') {
                const q = searchQuery.toLowerCase();
                const titleMatch = task.title.toLowerCase().includes(q);
                const subjectMatch = task.subject.toLowerCase().includes(q);
                const descMatch = (task.description || '').toLowerCase().includes(q);
                if (!titleMatch && !subjectMatch && !descMatch) return false;
            }

            return true;
        }).sort((a, b) => {
            if (currentSort === 'dueDate') {
                return new Date(a.dueDate) - new Date(b.dueDate);
            } else if (currentSort === 'priority') {
                const weights = { 'High': 3, 'Medium': 2, 'Low': 1 };
                return weights[b.priority] - weights[a.priority];
            } else if (currentSort === 'title') {
                return a.title.localeCompare(b.title);
            }
            return 0;
        });
    }

    function renderTasksGrid(taskList) {
        tasksGrid.innerHTML = '';

        if (taskList.length === 0) {
            tasksGrid.classList.add('hidden');
            emptyState.classList.remove('hidden');

            if (searchQuery) {
                emptyStateTitle.textContent = "No matching search results";
                emptyStateMessage.textContent = `No tasks found matching "${searchQuery}". Try clearing your search string.`;
            } else if (currentFilter === 'pending') {
                emptyStateTitle.textContent = "You're all caught up! 🎉";
                emptyStateMessage.textContent = "No pending tasks. Enjoy your free time or relax!";
            } else if (currentFilter === 'completed') {
                emptyStateTitle.textContent = "No completed tasks yet";
                emptyStateMessage.textContent = "Finish your tasks and check them off to build your accomplishment log!";
            } else if (currentFilter === 'high-priority') {
                emptyStateTitle.textContent = "No high priority tasks";
                emptyStateMessage.textContent = "You don't have any urgent high-priority assignments right now.";
            } else {
                emptyStateTitle.textContent = "Your Task Scope is Empty";
                emptyStateMessage.textContent = "Add your assignments, lab reports, and study targets to get started.";
            }
            return;
        }

        tasksGrid.classList.remove('hidden');
        emptyState.classList.add('hidden');

        taskList.forEach(task => {
            const card = document.createElement('article');
            card.className = `task-card ${task.completed ? 'is-completed' : ''}`;
            card.dataset.id = task.id;

            const isOverdue = !task.completed && new Date(task.dueDate) < new Date().setHours(0,0,0,0);
            const formattedDate = formatDateDisplay(task.dueDate);

            card.innerHTML = `
                <div class="task-header">
                    <span class="subject-badge">${escapeHtml(task.subject)}</span>
                    <span class="priority-pill priority-${task.priority.toLowerCase()}">${task.priority}</span>
                </div>
                <div class="task-body">
                    <h3 class="task-title">${escapeHtml(task.title)}</h3>
                    <p class="task-desc">${escapeHtml(task.description || 'No additional notes provided.')}</p>
                </div>
                <div class="task-footer">
                    <div class="due-chip ${isOverdue ? 'is-overdue' : ''}">
                        <i data-lucide="calendar"></i>
                        <span>${isOverdue ? 'Overdue: ' : 'Due: '}${formattedDate}</span>
                    </div>
                    <div class="task-actions">
                        <button class="action-icon-btn complete-btn" aria-label="Toggle Complete" title="${task.completed ? 'Mark as Pending' : 'Mark as Complete'}">
                            <i data-lucide="${task.completed ? 'check-circle' : 'circle'}"></i>
                        </button>
                        <button class="action-icon-btn delete-btn" aria-label="Delete Task" title="Delete Task">
                            <i data-lucide="trash-2"></i>
                        </button>
                    </div>
                </div>
            `;

            const completeBtn = card.querySelector('.complete-btn');
            completeBtn.addEventListener('click', () => toggleTaskComplete(task.id));

            const delBtn = card.querySelector('.delete-btn');
            delBtn.addEventListener('click', () => deleteTask(task.id));

            tasksGrid.appendChild(card);
        });
    }

    // -------------------------------------------------------------------------
    // 8. TASK CRUD ACTIONS
    // -------------------------------------------------------------------------
    function addNewTask(title, subject, priority, dueDate, description) {
        const newTask = {
            id: 'task-' + Date.now(),
            title: title.trim(),
            subject: subject.trim(),
            priority: priority,
            dueDate: dueDate,
            description: description.trim(),
            completed: false,
            createdAt: new Date().toISOString()
        };

        tasks.unshift(newTask);
        saveTasksToStorage();
        renderApp();
        showToast('Task added successfully!', 'success');
    }

    function toggleTaskComplete(taskId) {
        const task = tasks.find(t => t.id === taskId);
        if (task) {
            task.completed = !task.completed;
            saveTasksToStorage();
            renderApp();
            showToast(task.completed ? 'Task completed! 🎉' : 'Task marked as pending.', 'info');
        }
    }

    function deleteTask(taskId) {
        const index = tasks.findIndex(t => t.id === taskId);
        if (index !== -1) {
            const removedTitle = tasks[index].title;
            tasks.splice(index, 1);
            saveTasksToStorage();
            renderApp();
            showToast(`Deleted "${removedTitle}"`, 'danger');
        }
    }

    // -------------------------------------------------------------------------
    // 9. EVENT LISTENERS
    // -------------------------------------------------------------------------
    function setupEventListeners() {
        // Theme Toggle
        themeToggleBtn.addEventListener('click', toggleTheme);

        // Sidebar Mobile Drawer Controls
        const toggleSidebar = (open) => {
            if (open) {
                appSidebar.classList.add('open');
                sidebarBackdrop.classList.remove('hidden');
            } else {
                appSidebar.classList.remove('open');
                sidebarBackdrop.classList.add('hidden');
            }
        };

        mobileMenuBtn.addEventListener('click', () => toggleSidebar(true));
        closeSidebarBtn.addEventListener('click', () => toggleSidebar(false));
        sidebarBackdrop.addEventListener('click', () => toggleSidebar(false));

        // Nav Item Clicks
        navItems.forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                navItems.forEach(n => n.classList.remove('active'));
                item.classList.add('active');
                
                const navTarget = item.dataset.nav;
                if (navTarget === 'completed') {
                    currentFilter = 'completed';
                    activateTab('tabCompleted');
                } else if (navTarget === 'tasks' || navTarget === 'dashboard') {
                    currentFilter = 'all';
                    activateTab('tabAll');
                }
                toggleSidebar(false);
                renderApp();
            });
        });

        function activateTab(tabId) {
            filterTabs.forEach(t => t.classList.remove('active'));
            const targetTab = document.getElementById(tabId);
            if (targetTab) targetTab.classList.add('active');
        }

        // Filter Tabs
        filterTabs.forEach(tab => {
            tab.addEventListener('click', () => {
                filterTabs.forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                currentFilter = tab.dataset.filter;
                renderApp();
            });
        });

        // Search Input
        searchInput.addEventListener('input', (e) => {
            searchQuery = e.target.value;
            renderApp();
        });

        // Sort Select
        sortBySelect.addEventListener('change', (e) => {
            currentSort = e.target.value;
            renderApp();
        });

        // Modal Controls
        const openModal = () => {
            resetTaskForm();
            taskDueDateInput.value = getFutureDateStr(1);
            taskModalBackdrop.classList.remove('hidden');
            taskTitleInput.focus();
            refreshLucideIcons();
        };

        const closeModal = () => {
            taskModalBackdrop.classList.add('hidden');
            resetTaskForm();
        };

        openAddTaskBtn.addEventListener('click', openModal);
        emptyStateAddBtn.addEventListener('click', openModal);
        closeModalBtn.addEventListener('click', closeModal);
        cancelTaskBtn.addEventListener('click', closeModal);

        taskModalBackdrop.addEventListener('click', (e) => {
            if (e.target === taskModalBackdrop) closeModal();
        });

        // Form Submit
        taskForm.addEventListener('submit', (e) => {
            e.preventDefault();
            if (validateForm()) {
                addNewTask(
                    taskTitleInput.value,
                    taskSubjectInput.value,
                    taskPriorityInput.value,
                    taskDueDateInput.value,
                    taskDescInput.value
                );
                closeModal();
            }
        });
    }

    // -------------------------------------------------------------------------
    // 10. FORM VALIDATION & UTILS
    // -------------------------------------------------------------------------
    function validateForm() {
        let isValid = true;
        document.querySelectorAll('.form-group').forEach(fg => fg.classList.remove('has-error'));

        if (!taskTitleInput.value.trim()) {
            taskTitleInput.closest('.form-group').classList.add('has-error');
            isValid = false;
        }

        if (!taskSubjectInput.value.trim()) {
            taskSubjectInput.closest('.form-group').classList.add('has-error');
            isValid = false;
        }

        if (!taskDueDateInput.value) {
            taskDueDateInput.closest('.form-group').classList.add('has-error');
            isValid = false;
        }

        return isValid;
    }

    function resetTaskForm() {
        taskForm.reset();
        document.querySelectorAll('.form-group').forEach(fg => fg.classList.remove('has-error'));
        taskPriorityInput.value = 'Medium';
    }

    function showToast(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        
        let iconName = 'info';
        if (type === 'success') iconName = 'check-circle';
        if (type === 'danger') iconName = 'alert-circle';

        toast.innerHTML = `<i data-lucide="${iconName}"></i> <span>${escapeHtml(message)}</span>`;
        toastContainer.appendChild(toast);
        refreshLucideIcons();

        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateY(10px)';
            toast.style.transition = 'all 0.3s ease';
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }

    function formatDateDisplay(dateStr) {
        if (!dateStr) return '';
        const parts = dateStr.split('-');
        if (parts.length !== 3) return dateStr;
        const d = new Date(parts[0], parts[1] - 1, parts[2]);
        return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    }

    function escapeHtml(str) {
        if (!str) return '';
        return str.replace(/[&<>"']/g, (m) => {
            return {
                '&': '&amp;',
                '<': '&lt;',
                '>': '&gt;',
                '"': '&quot;',
                "'": '&#039;'
            }[m];
        });
    }

    // Launch Application
    initApp();
});
