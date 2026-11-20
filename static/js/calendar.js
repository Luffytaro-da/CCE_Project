/**
 * =============================================================================
 * TaskFlow - Interactive Calendar Module
 * =============================================================================
 * Features:
 *  1. Monthly calendar grid calculation
 *  2. Real task placement under their actual Firestore due dates
 *  3. Month navigation (Previous & Next month)
 * =============================================================================
 */

(function () {
    window.TaskFlowCalendar = {
        currentYear: new Date().getFullYear(),
        currentMonth: new Date().getMonth(), // 0-indexed

        init: function () {
            this.bindControls();
        },

        bindControls: function () {
            const prevBtn = document.getElementById('calPrevMonth');
            const nextBtn = document.getElementById('calNextMonth');

            if (prevBtn) {
                prevBtn.addEventListener('click', () => {
                    this.currentMonth--;
                    if (this.currentMonth < 0) {
                        this.currentMonth = 11;
                        this.currentYear--;
                    }
                    if (window.TaskFlowTasks) {
                        this.renderCalendar(window.TaskFlowTasks.tasks);
                    }
                });
            }

            if (nextBtn) {
                nextBtn.addEventListener('click', () => {
                    this.currentMonth++;
                    if (this.currentMonth > 11) {
                        this.currentMonth = 0;
                        this.currentYear++;
                    }
                    if (window.TaskFlowTasks) {
                        this.renderCalendar(window.TaskFlowTasks.tasks);
                    }
                });
            }
        },

        renderCalendar: function (tasks) {
            const calMonthTitle = document.getElementById('calMonthTitle');
            const daysGrid = document.getElementById('calendarDaysGrid');
            if (!daysGrid) return;

            const monthNames = ["January", "February", "March", "April", "May", "June", 
                                "July", "August", "September", "October", "November", "December"];

            if (calMonthTitle) {
                calMonthTitle.textContent = `${monthNames[this.currentMonth]} ${this.currentYear}`;
            }

            daysGrid.innerHTML = '';

            const firstDayIndex = new Date(this.currentYear, this.currentMonth, 1).getDay();
            const totalDays = new Date(this.currentYear, this.currentMonth + 1, 0).getDate();
            const todayStr = new Date().toISOString().split('T')[0];

            // Blank padding cells for days before the 1st
            for (let i = 0; i < firstDayIndex; i++) {
                const blank = document.createElement('div');
                blank.className = 'cal-day cal-day-empty';
                daysGrid.appendChild(blank);
            }

            // Render day cells
            for (let day = 1; day <= totalDays; day++) {
                const monthStr = String(this.currentMonth + 1).padStart(2, '0');
                const dayStr = String(day).padStart(2, '0');
                const dateKey = `${this.currentYear}-${monthStr}-${dayStr}`;

                const dayCell = document.createElement('div');
                dayCell.className = `cal-day ${dateKey === todayStr ? 'cal-day-today' : ''}`;
                
                dayCell.innerHTML = `<div class="cal-day-num">${day}</div><div class="cal-day-tasks"></div>`;
                const tasksContainer = dayCell.querySelector('.cal-day-tasks');

                // Filter tasks matching this date key
                const dayTasks = tasks.filter(t => t.dueDate === dateKey);
                dayTasks.forEach(t => {
                    const badge = document.createElement('div');
                    badge.className = `cal-task-pill cal-priority-${t.priority.toLowerCase()} ${t.completed ? 'is-completed' : ''}`;
                    badge.title = `${t.title} (${t.subject})`;
                    badge.textContent = t.title;
                    tasksContainer.appendChild(badge);
                });

                daysGrid.appendChild(dayCell);
            }

            if (window.lucide) lucide.createIcons();
        }
    };

    document.addEventListener('DOMContentLoaded', () => {
        window.TaskFlowCalendar.init();
    });
})();
