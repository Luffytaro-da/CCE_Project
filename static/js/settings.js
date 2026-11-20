/**
 * =============================================================================
 * TaskFlow - Settings & Profile Management Module
 * =============================================================================
 * Features:
 *  1. Display Name & Student Email profile management
 *  2. Appearance Theme switcher segmented control (Dark / Light mode)
 *  3. Secure Logout trigger
 * =============================================================================
 */

(function () {
    window.TaskFlowSettings = {
        init: function () {
            this.bindEvents();
            this.updateThemeUI(document.documentElement.getAttribute('data-theme') || 'dark');
        },

        populateSettings: function () {
            const user = window.TaskFlowAuth ? window.TaskFlowAuth.currentUser : null;
            if (!user) return;

            const nameInput = document.getElementById('settingsNameInput');
            const emailInput = document.getElementById('settingsEmailInput');

            if (nameInput) nameInput.value = user.displayName || '';
            if (emailInput) emailInput.value = user.email || '';

            const currentTheme = document.documentElement.getAttribute('data-theme') || localStorage.getItem('student_task_manager_theme') || 'dark';
            this.updateThemeUI(currentTheme);
        },

        setTheme: function (theme) {
            document.documentElement.setAttribute('data-theme', theme);
            localStorage.setItem('student_task_manager_theme', theme);
            
            const sun = document.getElementById('themeIconSun');
            const moon = document.getElementById('themeIconMoon');
            if (theme === 'light') {
                if (sun) sun.classList.add('hidden');
                if (moon) moon.classList.remove('hidden');
            } else {
                if (sun) sun.classList.remove('hidden');
                if (moon) moon.classList.add('hidden');
            }

            this.updateThemeUI(theme);

            if (window.lucide) lucide.createIcons();
            if (window.TaskFlowTasks) {
                window.TaskFlowTasks.showToast(`Switched to ${theme === 'light' ? 'Light Mode ☀️' : 'Dark Mode 🌙'}`, "info");
            }
        },

        updateThemeUI: function (theme) {
            const btnDark = document.getElementById('themeBtnDark');
            const btnLight = document.getElementById('themeBtnLight');
            const themeSelect = document.getElementById('settingsThemeSelect');

            if (btnDark && btnLight) {
                if (theme === 'light') {
                    btnLight.classList.add('active');
                    btnDark.classList.remove('active');
                } else {
                    btnDark.classList.add('active');
                    btnLight.classList.remove('active');
                }
            }

            if (themeSelect) {
                themeSelect.value = theme;
            }
        },

        saveProfile: async function () {
            const nameInput = document.getElementById('settingsNameInput');
            if (!nameInput) return;

            const newName = nameInput.value.trim();
            if (!newName) {
                alert("Please enter a valid display name.");
                return;
            }

            const user = window.TaskFlowAuth ? window.TaskFlowAuth.currentUser : null;
            if (!user) return;

            user.displayName = newName;
            user.initials = window.TaskFlowAuth.getInitials(newName);

            // Update Firebase Auth & Firestore user document if real Firebase
            const isRealFirebase = window.TaskFlowFirebase && window.TaskFlowFirebase.isRealFirebaseConfigured();
            if (isRealFirebase && typeof firebase !== 'undefined' && firebase.auth && firebase.auth().currentUser) {
                const fbUser = firebase.auth().currentUser;
                await fbUser.updateProfile({ displayName: newName });
                if (firebase.firestore) {
                    await firebase.firestore().collection('users').doc(fbUser.uid).update({
                        displayName: newName,
                        updatedAt: new Date().toISOString()
                    });
                }
            } else {
                localStorage.setItem('taskflow_demo_user', JSON.stringify(user));
            }

            window.TaskFlowAuth.updateProfileUI();
            if (window.TaskFlowTasks) {
                window.TaskFlowTasks.showToast("Profile updated successfully!", "success");
            }
        },

        bindEvents: function () {
            const saveProfileBtn = document.getElementById('saveProfileBtn');
            const settingsLogoutBtn = document.getElementById('settingsLogoutBtn');
            const btnDark = document.getElementById('themeBtnDark');
            const btnLight = document.getElementById('themeBtnLight');
            const settingsThemeSelect = document.getElementById('settingsThemeSelect');

            if (saveProfileBtn) {
                saveProfileBtn.addEventListener('click', () => this.saveProfile());
            }

            if (settingsLogoutBtn) {
                settingsLogoutBtn.addEventListener('click', () => {
                    if (window.TaskFlowAuth) window.TaskFlowAuth.logout();
                });
            }

            if (btnDark) {
                btnDark.addEventListener('click', () => this.setTheme('dark'));
            }

            if (btnLight) {
                btnLight.addEventListener('click', () => this.setTheme('light'));
            }

            if (settingsThemeSelect) {
                settingsThemeSelect.addEventListener('change', (e) => {
                    this.setTheme(e.target.value);
                });
            }
        }
    };

    document.addEventListener('DOMContentLoaded', () => {
        window.TaskFlowSettings.init();
    });
})();

