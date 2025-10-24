// navbar.js
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-auth.js";
import { getFirestore, doc, getDoc } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";

const auth = getAuth();
const db = getFirestore();

const logoutBtn = document.getElementById("logout-btn");

logoutBtn.addEventListener("click", async () => {
    await signOut(auth);
    window.location.href = "index.html";
});

// Hide admin links by default
const adminLinks = document.querySelectorAll(".admin-only");
adminLinks.forEach(link => link.style.display = "none");

onAuthStateChanged(auth, async (user) => {
    if (!user) {
        window.location.href = "index.html";
        return;
    }

    try {
        const userRef = doc(db, "users", user.uid);
        const userSnap = await getDoc(userRef);

        if (!userSnap.exists()) return;

        const userData = userSnap.data();

        // Show admin links if user role is Admin
        if (userData.role === "Admin") {
            adminLinks.forEach(link => link.style.display = "block");
        }
    } catch (error) {
        console.error("Error fetching user role:", error);
    }
});
