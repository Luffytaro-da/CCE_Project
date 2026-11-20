/**
 * =============================================================================
 * TaskFlow - Dashboard Analytics & Navigation Engine
 * =============================================================================
 * Features:
 *  1. Dynamic metric counter recalculation
 *  2. Productivity Velocity progress ring/bar calculation
 *  3. Real task-driven notification bell popup generator
 *  4. Single-Page Application (SPA) view switching (Dashboard, Tasks, Calendar, Settings)
 * =============================================================================
 */

(function () {
    window.TaskFlowDashboard = {
        init: function () {
            this.bindNavigation();
            this.bindNotificationPanel();
        },

        updateDashboard: function (tasks) {
            const total = tasks.length;
            const completed = tasks.filter(t => t.completed).length;
            const pending = total - completed;
            const highPriority = tasks.filter(t => t.priority === 'High' && !t.completed).length;

            // Stat Cards
            const statTotal = document.getElementById('statTotal');
            const statCompleted = document.getElementById('statCompleted');
            const statPending = document.getElementById('statPending');
            const statHighPriority = document.getElementById('statHighPriority');

            if (statTotal) statTotal.textContent = total;
            if (statCompleted) statCompleted.textContent = completed;
            if (statPending) statPending.textContent = pending;
            if (statHighPriority) statHighPriority.textContent = highPriority;

            // Sidebar & Filter Badges
            const sidebarPendingCount = document.getElementById('sidebarPendingCount');
            if (sidebarPendingCount) sidebarPendingCount.textContent = pending;

            const countAll = document.getElementById('countAll');
            const countPending = document.getElementById('countPending');
            const countCompleted = document.getElementById('countCompleted');
            const countHighPriority = document.getElementById('countHighPriority');

            if (countAll) countAll.textContent = total;
            if (countPending) countPending.textContent = pending;
            if (countCompleted) countCompleted.textContent = completed;
            if (countHighPriority) countHighPriority.textContent = tasks.filter(t => t.priority === 'High').length;

            // Productivity Velocity Calculation
            const percent = total > 0 ? Math.round((completed / total) * 100) : 0;
            
            const completedPercentBadge = document.getElementById('completedPercentBadge');
            const prodPercentText = document.getElementById('prodPercentText');
            const progressBarFill = document.getElementById('progressBarFill');
            const prodCompletedCount = document.getElementById('prodCompletedCount');
            const prodRemainingCount = document.getElementById('prodRemainingCount');
            const prodEncouragement = document.getElementById('prodEncouragement');

            if (completedPercentBadge) completedPercentBadge.textContent = `${percent}% Done`;
            if (prodPercentText) prodPercentText.textContent = `${percent}%`;
            if (progressBarFill) progressBarFill.style.width = `${percent}%`;
            if (prodCompletedCount) prodCompletedCount.textContent = completed;
            if (prodRemainingCount) prodRemainingCount.textContent = pending;

            if (prodEncouragement) {
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

            // Generate Notifications
            this.generateNotifications(tasks);
        },

        generateNotifications: function (tasks) {
            const notifList = document.getElementById('notifList');
            const notifDot = document.getElementById('notificationDot');
            const notifBadgeCount = document.getElementById('notifBadgeCount');
            if (!notifList) return;

            const notifications = [];
            const todayStr = new Date().toISOString().split('T')[0];

            // 1. Due Today or Overdue tasks
            const dueTodayOrOverdue = tasks.filter(t => !t.completed && t.dueDate <= todayStr);
            dueTodayOrOverdue.forEach(t => {
                const isOverdue = t.dueDate < todayStr;
                notifications.push({
                    taskId: t.id,
                    type: 'danger',
                    icon: 'alert-circle',
                    title: `${isOverdue ? 'Overdue Task' : 'Due Today'}: ${t.title}`,
                    text: `${t.subject} • Priority: ${t.priority}`
                });
            });

            // 2. High Priority pending tasks (not already added in due today)
            const highPending = tasks.filter(t => !t.completed && t.priority === 'High' && t.dueDate > todayStr);
            highPending.forEach(t => {
                notifications.push({
                    taskId: t.id,
                    type: 'warning',
                    icon: 'flame',
                    title: `High Priority: ${t.title}`,
                    text: `${t.subject} • Due ${window.TaskFlowTasks ? window.TaskFlowTasks.formatDateDisplay(t.dueDate) : t.dueDate}`
                });
            });

            // 3. Recently Completed tasks
            const recentCompleted = tasks.filter(t => t.completed).slice(0, 3);
            recentCompleted.forEach(t => {
                notifications.push({
                    taskId: t.id,
                    type: 'success',
                    icon: 'check-circle-2',
                    title: `Completed: ${t.title}`,
                    text: `${t.subject} • Task checked off 🎉`
                });
            });

            // Render Notifications
            notifList.innerHTML = '';
            if (notifications.length === 0) {
                notifList.innerHTML = `<div class="notif-empty">No new notifications</div>`;
                if (notifDot) notifDot.classList.add('hidden');
                if (notifBadgeCount) notifBadgeCount.textContent = '0';
            } else {
                if (notifDot) notifDot.classList.remove('hidden');
                if (notifBadgeCount) notifBadgeCount.textContent = notifications.length.toString();

                notifications.forEach(item => {
                    const el = document.createElement('div');
                    el.className = `notif-item notif-${item.type}`;
                    el.dataset.taskId = item.taskId;
                    el.title = "Click to view task details";
                    el.innerHTML = `
                        <i data-lucide="${item.icon}"></i>
                        <div>
                            <div class="notif-item-title">${item.title}</div>
                            <div class="notif-item-text">${item.text}</div>
                        </div>
                    `;

                    el.addEventListener('click', (e) => {
                        e.stopPropagation();
                        const notifPanel = document.getElementById('notificationPanel');
                        if (notifPanel) notifPanel.classList.add('hidden');

                        if (window.TaskFlowTasks && item.taskId) {
                            window.TaskFlowTasks.openTaskDetails(item.taskId);
                        }
                    });

                    notifList.appendChild(el);
                });
            }

            if (window.lucide) lucide.createIcons();
        },

        bindNotificationPanel: function () {
            const notifBtn = document.getElementById('notificationBtn');
            const notifPanel = document.getElementById('notificationPanel');

            if (notifBtn && notifPanel) {
                notifBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    notifPanel.classList.toggle('hidden');
                });

                document.addEventListener('click', (e) => {
                    if (!notifPanel.contains(e.target) && e.target !== notifBtn) {
                        notifPanel.classList.add('hidden');
                    }
                });
            }
        },

        bindNavigation: function () {
            const navItems = document.querySelectorAll('.nav-item');
            const viewDashboard = document.getElementById('viewDashboard');
            const viewTasks = document.getElementById('viewTasks');
            const viewCalendar = document.getElementById('viewCalendar');
            const viewSettings = document.getElementById('viewSettings');

            const viewTitleHeader = document.getElementById('viewSectionTitle');
            const viewSubtitleHeader = document.getElementById('viewSectionSubtitle');

            const switchView = (targetView) => {
                navItems.forEach(n => n.classList.remove('active'));
                const activeNav = document.querySelector(`.nav-item[data-view-target="${targetView}"]`);
                if (activeNav) activeNav.classList.add('active');

                // Hide all view sections
                if (viewDashboard) viewDashboard.classList.add('hidden');
                if (viewTasks) viewTasks.classList.add('hidden');
                if (viewCalendar) viewCalendar.classList.add('hidden');
                if (viewSettings) viewSettings.classList.add('hidden');

                if (targetView === 'dashboard') {
                    if (viewDashboard) viewDashboard.classList.remove('hidden');
                    if (viewTasks) viewTasks.classList.remove('hidden');
                    if (viewTitleHeader) viewTitleHeader.textContent = 'Recent Tasks';
                    if (viewSubtitleHeader) viewSubtitleHeader.textContent = 'Active assignments and submission deadlines';
                    if (window.TaskFlowTasks) window.TaskFlowTasks.currentFilter = 'all';
                } else if (targetView === 'tasks') {
                    if (viewTasks) viewTasks.classList.remove('hidden');
                    if (viewTitleHeader) viewTitleHeader.textContent = 'My Tasks';
                    if (viewSubtitleHeader) viewSubtitleHeader.textContent = 'Complete task list across all subjects';
                    if (window.TaskFlowTasks) window.TaskFlowTasks.currentFilter = 'all';
                } else if (targetView === 'completed') {
                    if (viewTasks) viewTasks.classList.remove('hidden');
                    if (viewTitleHeader) viewTitleHeader.textContent = 'Completed Log';
                    if (viewSubtitleHeader) viewSubtitleHeader.textContent = 'Review completed assignments and un-complete if necessary';
                    if (window.TaskFlowTasks) {
                        window.TaskFlowTasks.currentFilter = 'completed';
                        const tabComp = document.getElementById('tabCompleted');
                        if (tabComp) {
                            document.querySelectorAll('.tab-btn').forEach(t => t.classList.remove('active'));
                            tabComp.classList.add('active');
                        }
                    }
                } else if (targetView === 'calendar') {
                    if (viewCalendar) viewCalendar.classList.remove('hidden');
                    if (window.TaskFlowCalendar && window.TaskFlowTasks) {
                        window.TaskFlowCalendar.renderCalendar(window.TaskFlowTasks.tasks);
                    }
                } else if (targetView === 'settings') {
                    if (viewSettings) viewSettings.classList.remove('hidden');
                    if (window.TaskFlowSettings) window.TaskFlowSettings.populateSettings();
                }

                if (window.TaskFlowTasks) window.TaskFlowTasks.renderTasksGrid();
                if (window.lucide) lucide.createIcons();
            };

            navItems.forEach(item => {
                item.addEventListener('click', (e) => {
                    e.preventDefault();
                    const target = item.dataset.viewTarget;
                    switchView(target);
                });
            });

            // Route handler on page load
            const path = window.location.pathname;
            if (path === '/calendar') switchView('calendar');
            else if (path === '/completed') switchView('completed');
            else if (path === '/my-tasks') switchView('tasks');
            else if (path === '/settings') switchView('settings');
            else switchView('dashboard');
        }
    };

    document.addEventListener('DOMContentLoaded', () => {
        window.TaskFlowDashboard.init();
    });
})();
