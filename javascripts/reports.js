// reports.js
import { 
  getFirestore, doc, getDoc, collection, addDoc 
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-auth.js";

const db = getFirestore();
const auth = getAuth();
const form = document.getElementById("giving-form");


const successModal = document.getElementById("success-modal");
const closeModalBtn = document.getElementById("close-modal");

if (closeModalBtn) {
  closeModalBtn.addEventListener("click", () => {
    successModal.style.display = "none";
  });
}

onAuthStateChanged(auth, async (user) => {
  if (!user) {
    window.location.href = "index.html";
    return;
  }

  // Load user profile
  const userSnap = await getDoc(doc(db, "users", user.uid));
  if (!userSnap.exists()) {
    console.error("User profile not found in Firestore.");
    return;
  }
  const userData = userSnap.data();

  // Submit handler
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const date = document.getElementById("giving-date").value;
    const service = document.getElementById("church-service").value;
    const payment = document.getElementById("payment-method").value;

    if (!date || !service || !payment) {
      alert("Please fill in all required fields.");
      return;
    }

    const submitBtn = form.querySelector("button[type='submit']");
    submitBtn.disabled = true;

    // Collect givings (ignore zero amounts)
    const rows = document.querySelectorAll(".givings-table tbody tr");
    const givings = {};
    let total = 0;

    rows.forEach(row => {
      const type = row.querySelector("td:first-child").textContent.trim();
      const amt = parseFloat(row.querySelector(".giving-amount").value || "0") || 0;
      if (amt > 0) {
        givings[type] = amt;
        total += amt;
      }
    });

    const reportData = {
      uid: user.uid,
      submittedBy: `${userData.firstName?.trim() || ""} ${userData.surname?.trim() || ""}`.trim(),
      church: userData.church || "",
      group: userData.group || "",
      zone: userData.zone || "",
      role: userData.role || "",
      date,                      // yyyy-mm-dd
      serviceType: service,
      paymentMethod: payment,
      givings,
      totalAmount: total,
      createdAt: new Date().toISOString()
    };

    try {
      await addDoc(collection(db, "reports"), reportData);

      // Show success modal and reset form
      successModal.style.display = "flex";
      form.reset();
    } catch (err) {
      console.error("Error saving report:", err);
      alert("An error occurred while submitting the report. Please try again.");
    } finally {
      submitBtn.disabled = false;
    }
  });
});
