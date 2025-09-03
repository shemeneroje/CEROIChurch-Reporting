// reports.js
import { 
    getFirestore, doc, setDoc, collection, addDoc, getDoc, getDocs, query, where 
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-auth.js";

const db = getFirestore();
const auth = getAuth();

// Role-based link visibility
onAuthStateChanged(auth, async (user) => {
    if (!user) {
        window.location.href = "index.html";
        return;
    }

    const userSnap = await getDoc(doc(db, "users", user.uid));
    if (!userSnap.exists()) return;

    const userData = userSnap.data();
    if (userData.role !== "Admin") {
        document.querySelectorAll('.admin-only').forEach(link => link.style.display = 'none');
    }
});

// Logout button
const logoutBtn = document.getElementById('logout-btn');
if (logoutBtn) {
    logoutBtn.addEventListener('click', async () => {
        await signOut(auth);
        window.location.href = "index.html";
    });
}

// Handle Giving Form Submission
const givingForm = document.getElementById("giving-form");
if (givingForm) {
    givingForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        const date = document.getElementById("giving-date").value;
        const serviceType = document.getElementById("church-service").value;
        const paymentMethod = document.getElementById("payment-method").value;

        if (!date || !serviceType || !paymentMethod) {
            alert("Please fill in Date, Service Type, and Payment Method.");
            return;
        }

        // Collect givings from table
        const tableRows = document.querySelectorAll(".givings-table tbody tr");
        const givings = [];
        tableRows.forEach(row => {
            const type = row.querySelector("td:first-child").innerText;
            const amount = row.querySelector(".giving-amount").value;
            const comment = row.querySelector(".giving-comment").value;
            if (amount && parseFloat(amount) > 0) {
                givings.push({
                    type,
                    amount: parseFloat(amount),
                    comment: comment || ""
                });
            }
        });

        if (givings.length === 0) {
            alert("Please enter at least one giving amount.");
            return;
        }

        const user = auth.currentUser;
        if (!user) {
            alert("You must be logged in to submit a giving.");
            return;
        }

        try {
            const userSnap = await getDoc(doc(db, "users", user.uid));
            if (!userSnap.exists()) return;
            const userData = userSnap.data();

            // Save giving in central 'givings' collection
            await addDoc(collection(db, "givings"), {
                date,
                serviceType,
                paymentMethod,
                givings,
                userId: user.uid,
                userName: `${userData.title} ${userData.firstName} ${userData.surname}`,
                church: userData.church,
                createdAt: new Date().toISOString()
            });

            alert("Giving recorded successfully under " + userData.church);
            givingForm.reset();
        } catch (err) {
            console.error(err);
            alert("Error saving giving. Check console for details.");
        }
    });
}
