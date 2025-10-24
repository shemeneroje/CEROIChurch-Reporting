// Import Firebase functions
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-analytics.js";
import {
    getAuth,
    setPersistence,
    browserLocalPersistence,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    updateProfile,
    sendEmailVerification,
    signOut,
    GoogleAuthProvider,
    signInWithPopup,
    OAuthProvider,
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-auth.js";
import { getFirestore, doc, setDoc, getDoc } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";

// Firebase config
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
const db = getFirestore(app);

// Keep user logged in after refresh
setPersistence(auth, browserLocalPersistence)
    .then(() => console.log("Persistence set to local"))
    .catch((error) => console.error("Persistence error:", error));

// ------------------- SIGNUP -------------------
const signupForm = document.querySelector('#signup-form form');
if (signupForm) {
    signupForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const title = document.getElementById('signup-title').value;
        const firstName = document.getElementById('signup-firstname').value;
        const surname = document.getElementById('signup-surname').value;
        const email = document.getElementById('signup-email').value;
        const password = document.getElementById('signup-password').value;
        const countryCode = document.getElementById('signup-country-code').value;
        const phone = document.getElementById('signup-phone').value;
        const zone = document.getElementById('signup-zone').value;
        const group = document.getElementById('signup-group').value;
        const role = document.getElementById('signup-role').value;
        const church = document.getElementById('signup-church').value;
        const designationEls = document.querySelectorAll('#signup-designation input[type="checkbox"]:checked');
        const designations = Array.from(designationEls).map(el => el.value);
        const fullPhone = `${countryCode}${phone}`;

        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);

            await updateProfile(userCredential.user, {
                displayName: `${title} ${firstName} ${surname}`
            });

            // Save additional info to Firestore
            await setDoc(doc(db, "users", userCredential.user.uid), {
                uid: userCredential.user.uid,
                title,
                firstName,
                surname,
                email,
                phone: fullPhone,
                zone,
                group,
                church,
                role,
                designations,
                createdAt: new Date().toISOString()
            });

            // Send verification email
            await sendEmailVerification(userCredential.user);

            alert('Signup successful! Please check your email to verify your account.');
            window.location.href = 'index.html'; // Redirect to login page

        } catch (error) {
            alert(error.message);
        }
    });
}

// ------------------- LOGIN -------------------
const loginForm = document.querySelector('#login-form form');
if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;

        signInWithEmailAndPassword(auth, email, password)
            .then(() => {
                alert('Login successful!');
                window.location.href = 'home.html'; // Redirect to home page
            })
            .catch((error) => {
                alert('Login failed: ' + error.message);
            });
    });
}

// ------------------- GOOGLE SIGN-IN -------------------
const googleLoginBtn = document.getElementById('google-login');
if (googleLoginBtn) {
    googleLoginBtn.addEventListener('click', () => {
        const provider = new GoogleAuthProvider();
        signInWithPopup(auth, provider)
            .then((result) => {
                alert(`Welcome, ${result.user.displayName || result.user.email}`);
                window.location.href = 'home.html';
            })
            .catch((error) => alert(error.message));
    });
}

// ------------------- APPLE SIGN-IN -------------------
const appleLoginBtn = document.getElementById('apple-login');
if (appleLoginBtn) {
    appleLoginBtn.addEventListener('click', () => {
        const provider = new OAuthProvider('apple.com');
        signInWithPopup(auth, provider)
            .then((result) => {
                alert(`Welcome, ${result.user.displayName || result.user.email}`);
                window.location.href = 'home.html';
            })
            .catch((error) => alert(error.message));
    });
}

// ------------------- LOGOUT -------------------
const logoutBtn = document.getElementById('logout-btn');
if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
        signOut(auth)
            .then(() => {
                alert('Logged out successfully!');
                window.location.href = 'index.html';
            })
            .catch((error) => alert('Logout failed: ' + error.message));
    });
}

// ------------------- SHOW/HIDE FORMS -------------------
window.showSignup = function () {
    const loginFormDiv = document.getElementById('login-form');
    const signupFormDiv = document.getElementById('signup-form');
    if (loginFormDiv && signupFormDiv) {
        loginFormDiv.style.display = 'none';
        signupFormDiv.style.display = 'block';
    }
}

window.showLogin = function () {
    const loginFormDiv = document.getElementById('login-form');
    const signupFormDiv = document.getElementById('signup-form');
    if (loginFormDiv && signupFormDiv) {
        signupFormDiv.style.display = 'none';
        loginFormDiv.style.display = 'block';
    }
}

// ------------------- AUTH STATE CHANGE -------------------
if (window.location.pathname.endsWith('home.html')) {
    onAuthStateChanged(auth, async (user) => {
        if (user) {
            const userDoc = await getDoc(doc(db, "users", user.uid));
            if (userDoc.exists()) {
                const data = userDoc.data();
                const greeting = document.getElementById('greeting');
                if (greeting) {
                    greeting.textContent = `Greetings ${data.title} ${data.firstName} ${data.surname}! Use the menu above to view reports or update your settings and profile.`;
                }
            }
        } else {
            // Not logged in, redirect to login
            window.location.href = 'index.html';
        }
    });
}


