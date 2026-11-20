/**
 * =============================================================================
 * TaskFlow - Firestore Tasks & State Management Module
 * =============================================================================
 * Features:
 *  1. Cloud Firestore collection path: users/{userId}/tasks/{taskId}
 *  2. Real-time snapshot listening for authenticated student
 *  3. Task CRUD (Create, Complete Toggle, Delete with Confirmation Modal)
 *  4. 5 Sorting Options (Due Date, Priority, Newest, Oldest, Alphabetical)
 *  5. Dynamic Live Search & Filter Tab logic
 * =============================================================================
 */

(function () {
    window.TaskFlowTasks = {
        tasks: [],
        currentUserId: null,
        currentFilter: 'all',
        searchQuery: '',
        currentSort: 'dueDate',
        pendingDeleteTaskId: null,
        unsubscribeSnapshot: null,
        eventsBound: false,

        initUserTasks: function (userId) {
            this.currentUserId = userId;
            const isRealFirebase = window.TaskFlowFirebase && window.TaskFlowFirebase.isRealFirebaseConfigured();

            if (isRealFirebase && typeof firebase !== 'undefined' && firebase.firestore) {
                const db = firebase.firestore();
                const tasksRef = db.collection('users').doc(userId).collection('tasks');
                
                if (this.unsubscribeSnapshot) this.unsubscribeSnapshot();

                this.unsubscribeSnapshot = tasksRef.onSnapshot((snapshot) => {
                    const loadedTasks = [];
                    snapshot.forEach((doc) => {
                        loadedTasks.push({ id: doc.id, ...doc.data() });
                    });
                    this.tasks = loadedTasks;
                    this.renderAllViews();
                }, (error) => {
                    console.error("Firestore snapshot error:", error);
                    this.useFallbackTasks();
                });
            } else {
                this.useFallbackTasks();
            }

            this.bindEvents();
        },

        useFallbackTasks: function () {
            const STORAGE_KEY = `taskflow_tasks_${this.currentUserId || 'demo'}`;
            const saved = localStorage.getItem(STORAGE_KEY);
            if (saved) {
                try {
                    this.tasks = JSON.parse(saved);
                } catch(e) {
                    this.tasks = [];
                }
            } else {
                this.tasks = [
                    {
                        id: 'task-101',
                        title: 'Deploy TaskFlow to App Engine Standard',
                        description: 'Verify gunicorn WSGI entrypoint and app.yaml runtime configuration.',
                        subject: 'Cloud Computing',
                        dueDate: this.getFutureDateStr(2),
                        priority: 'High',
                        completed: false,
                        createdAt: new Date().toISOString()
                    },
                    {
                        id: 'task-102',
                        title: 'Data Structures Seminar Slides',
                        description: 'Prepare presentation explaining Dijkstra graph search and A* algorithms.',
                        subject: 'Data Structures',
                        dueDate: this.getFutureDateStr(5),
                        priority: 'Medium',
                        completed: false,
                        createdAt: new Date().toISOString()
                    },
                    {
                        id: 'task-103',
                        title: 'Submit DBMS Assignment 2',
                        description: 'SQL queries for relational joins and query optimization.',
                        subject: 'Database Systems',
                        dueDate: this.getFutureDateStr(-1),
                        priority: 'High',
                        completed: true,
                        createdAt: new Date().toISOString()
                    }
                ];
                this.saveFallbackTasks();
            }
            this.renderAllViews();
        },

        saveFallbackTasks: function () {
            const STORAGE_KEY = `taskflow_tasks_${this.currentUserId || 'demo'}`;
            localStorage.setItem(STORAGE_KEY, JSON.stringify(this.tasks));
        },

        getFutureDateStr: function (daysAhead) {
            const d = new Date();
            d.setDate(d.getDate() + daysAhead);
            return d.toISOString().split('T')[0];
        },

        // ---------------------------------------------------------------------
        // FIRESTORE CRUD OPERATIONS
        // ---------------------------------------------------------------------
        createTask: async function (title, subject, priority, dueDate, description) {
            const isRealFirebase = window.TaskFlowFirebase && window.TaskFlowFirebase.isRealFirebaseConfigured();
            
            const taskData = {
                title: title.trim(),
                subject: subject.trim(),
                priority: priority,
                dueDate: dueDate,
                description: description.trim(),
                completed: false,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };

            if (isRealFirebase && this.currentUserId && typeof firebase !== 'undefined' && firebase.firestore) {
                const db = firebase.firestore();
                await db.collection('users').doc(this.currentUserId).collection('tasks').add(taskData);
            } else {
                taskData.id = 'task-' + Date.now();
                this.tasks.unshift(taskData);
                this.saveFallbackTasks();
                this.renderAllViews();
            }

            this.showToast('Task added successfully!', 'success');
        },

        toggleTaskComplete: async function (taskId) {
            const task = this.tasks.find(t => t.id === taskId);
            if (!task) return;

            const newCompletedState = !task.completed;
            const isRealFirebase = window.TaskFlowFirebase && window.TaskFlowFirebase.isRealFirebaseConfigured();

            if (isRealFirebase && this.currentUserId && typeof firebase !== 'undefined' && firebase.firestore) {
                const db = firebase.firestore();
                await db.collection('users').doc(this.currentUserId).collection('tasks').doc(taskId).update({
                    completed: newCompletedState,
                    updatedAt: new Date().toISOString()
                });
            } else {
                task.completed = newCompletedState;
                this.saveFallbackTasks();
                this.renderAllViews();
            }

            this.showToast(newCompletedState ? 'Task completed! 🎉' : 'Task marked as pending.', 'info');
        },

        deleteTask: async function (taskId) {
            const isRealFirebase = window.TaskFlowFirebase && window.TaskFlowFirebase.isRealFirebaseConfigured();

            if (isRealFirebase && this.currentUserId && typeof firebase !== 'undefined' && firebase.firestore) {
                const db = firebase.firestore();
                await db.collection('users').doc(this.currentUserId).collection('tasks').doc(taskId).delete();
            } else {
                this.tasks = this.tasks.filter(t => t.id !== taskId);
                this.saveFallbackTasks();
                this.renderAllViews();
            }

            this.showToast('Task deleted successfully.', 'danger');
        },

        openDeleteConfirmation: function (taskId) {
            const task = this.tasks.find(t => t.id === taskId);
            if (!task) return;

            this.pendingDeleteTaskId = taskId;
            const previewEl = document.getElementById('deleteTaskPreviewTitle');
            if (previewEl) previewEl.textContent = `"${task.title}" (${task.subject})`;

            const modal = document.getElementById('deleteConfirmModalBackdrop');
            if (modal) modal.classList.remove('hidden');
        },

        closeDeleteConfirmation: function () {
            this.pendingDeleteTaskId = null;
            const modal = document.getElementById('deleteConfirmModalBackdrop');
            if (modal) modal.classList.add('hidden');
        },

        openTaskDetails: function (taskId) {
            const task = this.tasks.find(t => t.id === taskId);
            if (!task) return;

            const modal = document.getElementById('taskDetailsModalBackdrop');
            if (!modal) return;

            const titleEl = document.getElementById('detailTaskTitle');
            const subjectEl = document.getElementById('detailSubject');
            const priorityPill = document.getElementById('detailPriorityPill');
            const dueDateText = document.getElementById('detailDueDateText');
            const dueDateChip = document.getElementById('detailDueDateChip');
            const statusBadge = document.getElementById('detailStatusBadge');
            const descText = document.getElementById('detailDescriptionText');
            const completeBtnText = document.getElementById('detailCompleteBtnText');
            const completeBtn = document.getElementById('detailCompleteBtn');
            const deleteBtn = document.getElementById('detailDeleteBtn');

            if (titleEl) titleEl.textContent = task.title;
            if (subjectEl) subjectEl.textContent = task.subject;

            if (priorityPill) {
                priorityPill.textContent = task.priority + ' Priority';
                priorityPill.className = `priority-pill priority-${task.priority.toLowerCase()}`;
            }

            const isOverdue = !task.completed && new Date(task.dueDate) < new Date().setHours(0,0,0,0);
            if (dueDateText) dueDateText.textContent = (isOverdue ? 'Overdue: ' : 'Due: ') + this.formatDateDisplay(task.dueDate);
            if (dueDateChip) {
                if (isOverdue) dueDateChip.classList.add('is-overdue');
                else dueDateChip.classList.remove('is-overdue');
            }

            if (statusBadge) {
                if (task.completed) {
                    statusBadge.textContent = 'Completed 🎉';
                    statusBadge.className = 'status-badge status-completed';
                } else {
                    statusBadge.textContent = 'Pending ⏳';
                    statusBadge.className = 'status-badge status-pending';
                }
            }

            if (descText) descText.textContent = task.description || 'No additional notes provided.';
            if (completeBtnText) completeBtnText.textContent = task.completed ? 'Mark as Pending' : 'Mark as Complete';

            if (completeBtn) {
                completeBtn.onclick = async () => {
                    await this.toggleTaskComplete(task.id);
                    this.closeTaskDetails();
                };
            }

            if (deleteBtn) {
                deleteBtn.onclick = () => {
                    this.closeTaskDetails();
                    this.openDeleteConfirmation(task.id);
                };
            }

            modal.classList.remove('hidden');
            if (window.lucide) lucide.createIcons();
        },

        closeTaskDetails: function () {
            const modal = document.getElementById('taskDetailsModalBackdrop');
            if (modal) modal.classList.add('hidden');
        },

        // ---------------------------------------------------------------------
        // FILTERING & SORTING ENGINE
        // ---------------------------------------------------------------------
        filterAndSortTasks: function (overrideFilter) {
            const filterToUse = overrideFilter || this.currentFilter;
            
            return this.tasks.filter(task => {
                // Filter Tab
                if (filterToUse === 'pending' && task.completed) return false;
                if (filterToUse === 'completed' && !task.completed) return false;
                if (filterToUse === 'high-priority' && task.priority !== 'High') return false;

                // Search Filter
                if (this.searchQuery.trim() !== '') {
                    const q = this.searchQuery.toLowerCase();
                    const titleMatch = task.title.toLowerCase().includes(q);
                    const subjectMatch = task.subject.toLowerCase().includes(q);
                    const descMatch = (task.description || '').toLowerCase().includes(q);
                    if (!titleMatch && !subjectMatch && !descMatch) return false;
                }

                return true;
            }).sort((a, b) => {
                if (this.currentSort === 'dueDate') {
                    return new Date(a.dueDate) - new Date(b.dueDate);
                } else if (this.currentSort === 'priority') {
                    const weights = { 'High': 3, 'Medium': 2, 'Low': 1 };
                    return weights[b.priority] - weights[a.priority];
                } else if (this.currentSort === 'newest') {
                    return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
                } else if (this.currentSort === 'oldest') {
                    return new Date(a.createdAt || 0) - new Date(b.createdAt || 0);
                } else if (this.currentSort === 'title') {
                    return a.title.localeCompare(b.title);
                }
                return 0;
            });
        },

        // ---------------------------------------------------------------------
        // VIEW RENDERER DISPATCHER
        // ---------------------------------------------------------------------
        renderAllViews: function () {
            // Update Dashboard metrics & Notifications
            if (window.TaskFlowDashboard) {
                window.TaskFlowDashboard.updateDashboard(this.tasks);
            }

            // Render Task Grid
            this.renderTasksGrid();

            // Update Calendar if visible
            if (window.TaskFlowCalendar) {
                window.TaskFlowCalendar.renderCalendar(this.tasks);
            }

            // Refresh icons
            if (window.lucide) {
                lucide.createIcons();
            }
        },

        renderTasksGrid: function () {
            const tasksGrid = document.getElementById('tasksGrid');
            const emptyState = document.getElementById('emptyState');
            if (!tasksGrid || !emptyState) return;

            const filteredTasks = this.filterAndSortTasks();
            tasksGrid.innerHTML = '';

            if (filteredTasks.length === 0) {
                tasksGrid.classList.add('hidden');
                emptyState.classList.remove('hidden');

                const titleEl = document.getElementById('emptyStateTitle');
                const msgEl = document.getElementById('emptyStateMessage');

                if (this.searchQuery) {
                    if (titleEl) titleEl.textContent = "No matching search results";
                    if (msgEl) msgEl.textContent = `No tasks found matching "${this.searchQuery}". Try clearing search string.`;
                } else if (this.currentFilter === 'pending') {
                    if (titleEl) titleEl.textContent = "You're all caught up! 🎉";
                    if (msgEl) msgEl.textContent = "No pending tasks. Enjoy your free time!";
                } else if (this.currentFilter === 'completed') {
                    if (titleEl) titleEl.textContent = "No completed tasks yet";
                    if (msgEl) msgEl.textContent = "Finish tasks and check them off to build your completion log!";
                } else if (this.currentFilter === 'high-priority') {
                    if (titleEl) titleEl.textContent = "No high priority tasks";
                    if (msgEl) msgEl.textContent = "No urgent high-priority assignments at the moment.";
                } else {
                    if (titleEl) titleEl.textContent = "Your Task List is Empty";
                    if (msgEl) msgEl.textContent = "Click '+ New Task' to add your assignments and study goals.";
                }
                return;
            }

            tasksGrid.classList.remove('hidden');
            emptyState.classList.add('hidden');

            filteredTasks.forEach(task => {
                const card = document.createElement('article');
                card.className = `task-card ${task.completed ? 'is-completed' : ''}`;
                card.dataset.id = task.id;

                const isOverdue = !task.completed && new Date(task.dueDate) < new Date().setHours(0,0,0,0);
                const formattedDate = this.formatDateDisplay(task.dueDate);

                card.innerHTML = `
                    <div class="task-header">
                        <span class="subject-badge">${this.escapeHtml(task.subject)}</span>
                        <span class="priority-pill priority-${task.priority.toLowerCase()}">${task.priority}</span>
                    </div>
                    <div class="task-body">
                        <h3 class="task-title">${this.escapeHtml(task.title)}</h3>
                        <p class="task-desc">${this.escapeHtml(task.description || 'No additional notes provided.')}</p>
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

                // Complete button handler
                card.querySelector('.complete-btn').addEventListener('click', () => {
                    this.toggleTaskComplete(task.id);
                });

                // Delete button handler
                card.querySelector('.delete-btn').addEventListener('click', () => {
                    this.openDeleteConfirmation(task.id);
                });

                tasksGrid.appendChild(card);
            });
        },

        // ---------------------------------------------------------------------
        // EVENT BINDINGS
        // ---------------------------------------------------------------------
        bindEvents: function () {
            if (this.eventsBound) return;
            this.eventsBound = true;

            // Global Search Input
            const globalSearchInput = document.getElementById('globalSearchInput');
            if (globalSearchInput) {
                globalSearchInput.addEventListener('input', (e) => {
                    this.searchQuery = e.target.value;
                    this.renderAllViews();
                });
            }

            // Sort Dropdown
            const sortBySelect = document.getElementById('sortBySelect');
            if (sortBySelect) {
                sortBySelect.addEventListener('change', (e) => {
                    this.currentSort = e.target.value;
                    this.renderAllViews();
                });
            }

            // Filter Tabs
            const filterTabs = document.querySelectorAll('.tab-btn');
            filterTabs.forEach(tab => {
                tab.addEventListener('click', () => {
                    filterTabs.forEach(t => t.classList.remove('active'));
                    tab.classList.add('active');
                    this.currentFilter = tab.dataset.filter;
                    this.renderAllViews();
                });
            });

            // Stat Cards Click-to-Filter Binding
            const statCards = document.querySelectorAll('.clickable-stat-card');
            statCards.forEach(card => {
                card.addEventListener('click', () => {
                    const filter = card.dataset.statFilter;
                    if (!filter) return;

                    this.currentFilter = filter;

                    // Update Tab active styling
                    filterTabs.forEach(tab => {
                        if (tab.dataset.filter === filter) {
                            tab.classList.add('active');
                        } else {
                            tab.classList.remove('active');
                        }
                    });

                    // Render task grid
                    this.renderAllViews();

                    // Smooth scroll down to tasks grid
                    const controlsSection = document.querySelector('.controls-section');
                    if (controlsSection) {
                        controlsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }
                });
            });

            // Modal Controls for Add Task
            const openAddTaskBtn = document.getElementById('openAddTaskBtn');
            const emptyStateAddBtn = document.getElementById('emptyStateAddBtn');
            const closeModalBtn = document.getElementById('closeModalBtn');
            const cancelTaskBtn = document.getElementById('cancelTaskBtn');
            const taskModalBackdrop = document.getElementById('taskModalBackdrop');
            const taskForm = document.getElementById('taskForm');

            const openModal = () => {
                if (taskForm) taskForm.reset();
                const dueDateInput = document.getElementById('taskDueDate');
                if (dueDateInput) dueDateInput.value = this.getFutureDateStr(1);
                if (taskModalBackdrop) taskModalBackdrop.classList.remove('hidden');
                if (window.lucide) lucide.createIcons();
            };

            const closeModal = () => {
                if (taskModalBackdrop) taskModalBackdrop.classList.add('hidden');
            };

            if (openAddTaskBtn) openAddTaskBtn.addEventListener('click', openModal);
            if (emptyStateAddBtn) emptyStateAddBtn.addEventListener('click', openModal);
            if (closeModalBtn) closeModalBtn.addEventListener('click', closeModal);
            if (cancelTaskBtn) cancelTaskBtn.addEventListener('click', closeModal);

            if (taskModalBackdrop) {
                taskModalBackdrop.addEventListener('click', (e) => {
                    if (e.target === taskModalBackdrop) closeModal();
                });
            }

            if (taskForm) {
                taskForm.addEventListener('submit', async (e) => {
                    e.preventDefault();
                    const title = document.getElementById('taskTitle').value;
                    const subject = document.getElementById('taskSubject').value;
                    const priority = document.getElementById('taskPriority').value;
                    const dueDate = document.getElementById('taskDueDate').value;
                    const desc = document.getElementById('taskDescription').value;

                    if (title.trim() && subject.trim() && dueDate) {
                        await this.createTask(title, subject, priority, dueDate, desc);
                        closeModal();
                    }
                });
            }

            // Delete Modal Confirmation Handlers
            const confirmDeleteBtn = document.getElementById('confirmDeleteBtn');
            const cancelDeleteBtn = document.getElementById('cancelDeleteBtn');
            const closeDeleteModalBtn = document.getElementById('closeDeleteModalBtn');

            if (confirmDeleteBtn) {
                confirmDeleteBtn.addEventListener('click', async () => {
                    if (this.pendingDeleteTaskId) {
                        await this.deleteTask(this.pendingDeleteTaskId);
                        this.closeDeleteConfirmation();
                    }
                });
            }

            if (cancelDeleteBtn) cancelDeleteBtn.addEventListener('click', () => this.closeDeleteConfirmation());
            if (closeDeleteModalBtn) closeDeleteModalBtn.addEventListener('click', () => this.closeDeleteConfirmation());

            // Task Details Modal Close Handlers
            const closeDetailsModalBtn = document.getElementById('closeDetailsModalBtn');
            const taskDetailsModalBackdrop = document.getElementById('taskDetailsModalBackdrop');

            if (closeDetailsModalBtn) closeDetailsModalBtn.addEventListener('click', () => this.closeTaskDetails());
            if (taskDetailsModalBackdrop) {
                taskDetailsModalBackdrop.addEventListener('click', (e) => {
                    if (e.target === taskDetailsModalBackdrop) this.closeTaskDetails();
                });
            }
        },

        // ---------------------------------------------------------------------
        // UTILS
        // ---------------------------------------------------------------------
        formatDateDisplay: function (dateStr) {
            if (!dateStr) return '';
            const parts = dateStr.split('-');
            if (parts.length !== 3) return dateStr;
            const d = new Date(parts[0], parts[1] - 1, parts[2]);
            return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
        },

        escapeHtml: function (str) {
            if (!str) return '';
            return str.replace(/[&<>"']/g, (m) => {
                return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' }[m];
            });
        },

        showToast: function (message, type = 'info') {
            const toastContainer = document.getElementById('toastContainer');
            if (!toastContainer) return;

            const toast = document.createElement('div');
            toast.className = `toast toast-${type}`;
            
            let iconName = 'info';
            if (type === 'success') iconName = 'check-circle';
            if (type === 'danger') iconName = 'alert-circle';

            toast.innerHTML = `<i data-lucide="${iconName}"></i> <span>${this.escapeHtml(message)}</span>`;
            toastContainer.appendChild(toast);
            if (window.lucide) lucide.createIcons();

            setTimeout(() => {
                toast.style.opacity = '0';
                toast.style.transform = 'translateY(10px)';
                toast.style.transition = 'all 0.3s ease';
                setTimeout(() => toast.remove(), 300);
            }, 3000);
        }
    };

    document.addEventListener('DOMContentLoaded', () => {
        window.TaskFlowTasks.bindEvents();
    });
})();

