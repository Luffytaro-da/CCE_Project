/**
 * =============================================================================
 * TaskFlow - Authentication Module (Firebase Auth & Demo Fallback)
 * =============================================================================
 * Features:
 *  1. Firebase Email + Password Signup & Login
 *  2. Route protection & automatic auth state redirects
 *  3. Friendly error messages replacing raw Firebase code errors
 *  4. Fallback demo auth state for zero-config immediate testing
 *  5. Profile initials and display name generation
 * =============================================================================
 */

(function () {
    // Current Authenticated User Object State
    window.TaskFlowAuth = {
        currentUser: null,
        isDemo: false,

        // Initialize Auth Observers
        init: function () {
            const isRealFirebase = window.TaskFlowFirebase && window.TaskFlowFirebase.isRealFirebaseConfigured();
            
            if (isRealFirebase && typeof firebase !== 'undefined' && firebase.auth) {
                this.isDemo = false;
                firebase.auth().onAuthStateChanged((user) => {
                    if (user) {
                        this.currentUser = {
                            uid: user.uid,
                            displayName: user.displayName || user.email.split('@')[0],
                            email: user.email,
                            initials: this.getInitials(user.displayName || user.email)
                        };
                        this.handleAuthRouteRedirects(true);
                        this.updateProfileUI();
                        if (window.TaskFlowTasks) {
                            window.TaskFlowTasks.initUserTasks(user.uid);
                        }
                    } else {
                        this.currentUser = null;
                        this.handleAuthRouteRedirects(false);
                    }
                });
            } else {
                // Fallback Demo Auth Mode
                console.log("[TaskFlow Auth] Running in Demo Auth Mode");
                this.isDemo = true;
                const savedDemoUser = localStorage.getItem('taskflow_demo_user');
                if (savedDemoUser) {
                    try {
                        this.currentUser = JSON.parse(savedDemoUser);
                    } catch(e) {
                        this.currentUser = null;
                    }
                } else {
                    // Default starter demo profile
                    this.currentUser = {
                        uid: 'demo-student-101',
                        displayName: 'Alex Morgan',
                        email: 'alex.morgan@university.edu',
                        initials: 'AM'
                    };
                    localStorage.setItem('taskflow_demo_user', JSON.stringify(this.currentUser));
                }

                // Check route protection for demo mode
                const path = window.location.pathname;
                if ((path === '/login' || path === '/signup') && this.currentUser) {
                    // Stay on login if user explicitly wants to logout/switch
                } else if (!this.currentUser && path !== '/login' && path !== '/signup') {
                    window.location.href = '/login';
                } else {
                    this.updateProfileUI();
                    if (window.TaskFlowTasks && this.currentUser) {
                        window.TaskFlowTasks.initUserTasks(this.currentUser.uid);
                    }
                }
            }

            this.bindFormEvents();
        },

        getInitials: function (nameStr) {
            if (!nameStr) return 'ST';
            const parts = nameStr.trim().split(' ');
            if (parts.length >= 2) {
                return (parts[0][0] + parts[1][0]).toUpperCase();
            }
            return nameStr.substring(0, 2).toUpperCase();
        },

        handleAuthRouteRedirects: function (isAuthenticated) {
            const path = window.location.pathname;
            const isAuthPage = path === '/login' || path === '/signup';

            if (isAuthenticated && isAuthPage) {
                window.location.href = '/dashboard';
            } else if (!isAuthenticated && !isAuthPage && path !== '/') {
                window.location.href = '/login';
            }
        },

        updateProfileUI: function () {
            if (!this.currentUser) return;
            
            const name = this.currentUser.displayName || 'Student User';
            const initials = this.currentUser.initials || this.getInitials(name);
            const email = this.currentUser.email || '';

            // Update Sidebar / Profile elements
            document.querySelectorAll('.user-name').forEach(el => el.textContent = name);
            document.querySelectorAll('.avatar-circle span').forEach(el => el.textContent = initials);
            document.querySelectorAll('.user-role').forEach(el => {
                el.textContent = email ? email : 'Computer Science Student';
            });
        },

        // ---------------------------------------------------------------------
        // SIGNUP METHOD
        // ---------------------------------------------------------------------
        signup: async function (fullName, email, password, confirmPassword) {
            if (!fullName || !email || !password) {
                throw new Error("Please fill in all required fields.");
            }
            if (password !== confirmPassword) {
                throw new Error("Passwords do not match. Please re-enter.");
            }
            if (password.length < 6) {
                throw new Error("Password must be at least 6 characters long.");
            }

            if (!this.isDemo && typeof firebase !== 'undefined' && firebase.auth) {
                try {
                    const userCredential = await firebase.auth().createUserWithEmailAndPassword(email, password);
                    const user = userCredential.user;
                    await user.updateProfile({ displayName: fullName });
                    
                    // Create Firestore user document
                    if (firebase.firestore) {
                        await firebase.firestore().collection('users').doc(user.uid).set({
                            fullName: fullName,
                            email: email,
                            createdAt: firebase.firestore.FieldValue.serverTimestamp()
                        }, { merge: true });
                    }

                    return user;
                } catch (err) {
                    throw new Error(this.getFriendlyErrorMessage(err.code || err.message));
                }
            } else {
                // Demo Signup
                const demoUser = {
                    uid: 'demo-user-' + Date.now(),
                    displayName: fullName,
                    email: email,
                    initials: this.getInitials(fullName)
                };
                this.currentUser = demoUser;
                localStorage.setItem('taskflow_demo_user', JSON.stringify(demoUser));
                return demoUser;
            }
        },

        // ---------------------------------------------------------------------
        // LOGIN METHOD
        // ---------------------------------------------------------------------
        login: async function (email, password, rememberMe) {
            if (!email || !password) {
                throw new Error("Please enter both email and password.");
            }

            if (!this.isDemo && typeof firebase !== 'undefined' && firebase.auth) {
                try {
                    const persistence = rememberMe ? 
                        firebase.auth.Auth.Persistence.LOCAL : 
                        firebase.auth.Auth.Persistence.SESSION;
                    await firebase.auth().setPersistence(persistence);
                    const userCredential = await firebase.auth().signInWithEmailAndPassword(email, password);
                    return userCredential.user;
                } catch (err) {
                    throw new Error(this.getFriendlyErrorMessage(err.code || err.message));
                }
            } else {
                // Demo Login
                const demoUser = {
                    uid: 'demo-user-logged',
                    displayName: email.split('@')[0].replace('.', ' ').toUpperCase(),
                    email: email,
                    initials: this.getInitials(email)
                };
                this.currentUser = demoUser;
                localStorage.setItem('taskflow_demo_user', JSON.stringify(demoUser));
                return demoUser;
            }
        },

        // ---------------------------------------------------------------------
        // LOGOUT METHOD
        // ---------------------------------------------------------------------
        logout: async function () {
            if (!this.isDemo && typeof firebase !== 'undefined' && firebase.auth) {
                await firebase.auth().signOut();
            }
            this.currentUser = null;
            localStorage.removeItem('taskflow_demo_user');
            window.location.href = '/login';
        },

        // ---------------------------------------------------------------------
        // FORGOT PASSWORD
        // ---------------------------------------------------------------------
        forgotPassword: async function (email) {
            if (!email) {
                throw new Error("Please enter your email address first.");
            }
            if (!this.isDemo && typeof firebase !== 'undefined' && firebase.auth) {
                try {
                    await firebase.auth().sendPasswordResetEmail(email);
                    return "Password reset link sent to your email!";
                } catch (err) {
                    throw new Error(this.getFriendlyErrorMessage(err.code || err.message));
                }
            } else {
                return "Demo Mode: Password reset simulation email sent!";
            }
        },

        // ---------------------------------------------------------------------
        // FRIENDLY ERROR MESSAGES FOR FIREBASE CODES
        // ---------------------------------------------------------------------
        getFriendlyErrorMessage: function (errorCode) {
            switch (errorCode) {
                case 'auth/invalid-credential':
                case 'auth/user-not-found':
                case 'auth/wrong-password':
                    return 'Incorrect email or password.';
                case 'auth/email-already-in-use':
                    return 'This student email is already registered. Try logging in.';
                case 'auth/invalid-email':
                    return 'Please enter a valid email address.';
                case 'auth/weak-password':
                    return 'Password should be at least 6 characters long.';
                case 'auth/too-many-requests':
                    return 'Too many failed attempts. Please try again in a few minutes.';
                case 'auth/network-request-failed':
                    return 'Network error. Please check your internet connection.';
                default:
                    return errorCode || 'An error occurred during authentication.';
            }
        },

        // ---------------------------------------------------------------------
        // BIND FORM DOM EVENTS ON LOGIN / SIGNUP PAGES
        // ---------------------------------------------------------------------
        bindFormEvents: function () {
            const loginForm = document.getElementById('loginForm');
            const signupForm = document.getElementById('signupForm');
            const authAlert = document.getElementById('authAlert');
            const authAlertText = document.getElementById('authAlertText');
            const forgotPasswordBtn = document.getElementById('forgotPasswordBtn');

            const showAlert = (msg) => {
                if (authAlert && authAlertText) {
                    authAlertText.textContent = msg;
                    authAlert.classList.remove('hidden');
                }
            };

            const hideAlert = () => {
                if (authAlert) authAlert.classList.add('hidden');
            };

            // Login submit
            if (loginForm) {
                loginForm.addEventListener('submit', async (e) => {
                    e.preventDefault();
                    hideAlert();
                    const email = document.getElementById('loginEmail').value.trim();
                    const password = document.getElementById('loginPassword').value;
                    const rememberMe = document.getElementById('rememberMe') ? document.getElementById('rememberMe').checked : true;

                    const btn = document.getElementById('loginSubmitBtn');
                    const origHtml = btn ? btn.innerHTML : '';
                    if (btn) btn.innerHTML = '<span>Signing in...</span>';

                    try {
                        await this.login(email, password, rememberMe);
                        window.location.href = '/dashboard';
                    } catch (err) {
                        showAlert(err.message);
                        if (btn) btn.innerHTML = origHtml;
                    }
                });
            }

            // Signup submit
            if (signupForm) {
                signupForm.addEventListener('submit', async (e) => {
                    e.preventDefault();
                    hideAlert();
                    const fullName = document.getElementById('signupFullName').value.trim();
                    const email = document.getElementById('signupEmail').value.trim();
                    const password = document.getElementById('signupPassword').value;
                    const confirmPassword = document.getElementById('signupConfirmPassword').value;

                    const btn = document.getElementById('signupSubmitBtn');
                    const origHtml = btn ? btn.innerHTML : '';
                    if (btn) btn.innerHTML = '<span>Creating account...</span>';

                    try {
                        await this.signup(fullName, email, password, confirmPassword);
                        window.location.href = '/dashboard';
                    } catch (err) {
                        showAlert(err.message);
                        if (btn) btn.innerHTML = origHtml;
                    }
                });
            }

            // Forgot password
            if (forgotPasswordBtn) {
                forgotPasswordBtn.addEventListener('click', async (e) => {
                    e.preventDefault();
                    hideAlert();
                    const email = document.getElementById('loginEmail') ? document.getElementById('loginEmail').value.trim() : '';
                    try {
                        const msg = await this.forgotPassword(email);
                        alert(msg);
                    } catch (err) {
                        showAlert(err.message);
                    }
                });
            }
        }
    };

    // Initialize Auth on DOM Ready
    document.addEventListener('DOMContentLoaded', () => {
        window.TaskFlowAuth.init();
    });

})();
