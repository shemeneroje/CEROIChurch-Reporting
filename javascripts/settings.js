// settings.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-auth.js";
import { getFirestore, doc, getDoc } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";

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
const auth = getAuth(app);
const db = getFirestore(app);

// Logout
const logoutBtn = document.getElementById('logout-btn');
if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
        signOut(auth).then(() => {
            window.location.href = 'index.html';
        }).catch(err => alert(err.message));
    });
}

// Fetch and display user info when page loads
onAuthStateChanged(auth, async (user) => {
    if (!user) {
        // Not logged in → redirect
        window.location.href = 'index.html';
        return;
    }

    try {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (!userDoc.exists()) {
            console.error("User profile not found");
            return;
        }

        const data = userDoc.data();

        document.getElementById('profile-title').textContent = data.title || '';
        document.getElementById('profile-firstname').textContent = data.firstName || '';
        document.getElementById('profile-surname').textContent = data.surname || '';
        document.getElementById('profile-zone').textContent = data.zone || '';
        document.getElementById('profile-chapter').textContent = data.group || '';
        document.getElementById('profile-church').textContent = data.church || '';
        document.getElementById('profile-designation').textContent = data.designations?.join(', ') || '';
        document.getElementById('profile-email').textContent = data.email || user.email;
        document.getElementById('profile-phone').textContent = data.phone || '';
        document.getElementById('profile-role').textContent = data.role || '';

    } catch (err) {
        console.error("Error loading user data:", err);
    }
});
