// Import Firebase functions
import {
    initializeApp
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-app.js";
import {
    getAnalytics
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-analytics.js";
import {
    getAuth,
    setPersistence,
    browserLocalPersistence,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    updateProfile,
    onAuthStateChanged,
    signOut,
    GoogleAuthProvider,
    signInWithPopup,
    OAuthProvider
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-auth.js";

// Your Firebase config
const firebaseConfig = {
    apiKey: "AIzaSyDKGHkuy3BssxINilas---1CHiyD-ivfaA",
    authDomain: "church-reporting-f932f.firebaseapp.com",
    projectId: "church-reporting-f932f",
    storageBucket: "church-reporting-f932f.appspot.com",
    messagingSenderId: "78377270291",
    appId: "1:78377270291:web:d606356331343859b013e6",
    measurementId: "G-E01QJ1NG2T"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);

// Set persistence (keep user logged in after refresh/close)
setPersistence(auth, browserLocalPersistence)
    .then(() => console.log("Persistence set to local"))
    .catch((error) => console.error("Persistence error:", error));

// Signup (Email/Password)
document.querySelector('#signup-form form').addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('signup-name').value;
    const email = document.getElementById('signup-email').value;
    const password = document.getElementById('signup-password').value;

    createUserWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
            return updateProfile(userCredential.user, { displayName: name });
        })
        .then(() => {
            alert('Signup successful!');
            showLogin();
        })
        .catch((error) => {
            alert(error.message);
        });
});

// Login (Email/Password)
document.querySelector('#login-form form').addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;

    signInWithEmailAndPassword(auth, email, password)
        .then(() => {
            alert('Login successful!');
        })
        .catch((error) => {
            alert(error.message);
        });
});

// Google Sign-In
document.getElementById('google-login').addEventListener('click', () => {
    const provider = new GoogleAuthProvider();
    signInWithPopup(auth, provider)
        .then((result) => {
            const user = result.user;
            alert(`Welcome, ${user.displayName}`);
        })
        .catch((error) => {
            alert(error.message);
        });
});

// Apple Sign-In
document.getElementById('apple-login').addEventListener('click', () => {
    const provider = new OAuthProvider('apple.com');
    signInWithPopup(auth, provider)
        .then((result) => {
            const user = result.user;
            alert(`Welcome, ${user.displayName || user.email}`);
        })
        .catch((error) => {
            alert(error.message);
        });
});

// Detect auth state changes
onAuthStateChanged(auth, (user) => {
    if (user) {
        document.getElementById('auth-section').style.display = 'none';
        document.getElementById('dashboard').style.display = 'block';
        document.getElementById('welcome').textContent = `Welcome, ${user.displayName || user.email}`;
    } else {
        document.getElementById('auth-section').style.display = 'block';
        document.getElementById('dashboard').style.display = 'none';
    }
});

// Logout
document.getElementById('logout-btn').addEventListener('click', () => {
    signOut(auth).then(() => {
        alert("Logged out!");
    }).catch((error) => {
        console.error("Logout error:", error);
    });
});

// Show/hide forms
window.showSignup = function () {
    document.getElementById('login-form').style.display = 'none';
    document.getElementById('signup-form').style.display = 'block';
}
window.showLogin = function () {
    window.showLogin = function () {
        document.getElementById('signup-form').style.display = 'none';
        document.getElementById('login-form').style.display = 'block';
    }
}
