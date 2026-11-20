/**
 * =============================================================================
 * TaskFlow - Firebase Configuration & Initialization Module
 * =============================================================================
 * Instructions:
 *  1. Create a project at https://console.firebase.google.com/
 *  2. Enable "Authentication" -> "Email/Password" login provider.
 *  3. Create a "Cloud Firestore Database" in test mode or production mode.
 *  4. Copy your web app configuration credentials into the firebaseConfig object below.
 * =============================================================================
 */

// Firebase Web App Configuration Object
const firebaseConfig = {
    // -------------------------------------------------------------------------
    // REPLACE THESE PLACEHOLDERS WITH YOUR FIREBASE CONSOLE CREDENTIALS
    // -------------------------------------------------------------------------
    apiKey: "YOUR_FIREBASE_API_KEY",
    authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_PROJECT_ID.appspot.com",
    messagingSenderId: "123456789012",
    appId: "1:123456789012:web:abcdef1234567890"
    // -------------------------------------------------------------------------
};

// Global TaskFlow Firebase Bridge
window.TaskFlowFirebase = {
    config: firebaseConfig,
    isRealFirebaseConfigured: function() {
        return this.config.apiKey && 
               this.config.apiKey !== "YOUR_FIREBASE_API_KEY" && 
               !this.config.apiKey.includes("YOUR_");
    }
};

console.log(`[TaskFlow Firebase] Status: ${window.TaskFlowFirebase.isRealFirebaseConfigured() ? "Live Firebase Connected" : "Demo Mode / Waiting for Firebase Console Keys"}`);
