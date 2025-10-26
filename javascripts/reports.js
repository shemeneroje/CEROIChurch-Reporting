// report.js
import { getFirestore, doc, getDoc, collection, addDoc } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";
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

  const userSnap = await getDoc(doc(db, "users", user.uid));
  if (!userSnap.exists()) {
    console.error("user profile not found in firestore");
    return;
  }
  const userData = userSnap.data();

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const date = document.getElementById("giving-date").value;
    const service = document.getElementById("church-service").value;
    const payment = document.getElementById("payment-method").value;

    if (!date || !service || !payment) {
      alert("please fill in all required fields");
      return;
    }

    const submitBtn = form.querySelector("button[type='submit']");
    submitBtn.disabled = true;

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
      date,
      serviceType: service,
      paymentMethod: payment,
      givings,
      totalAmount: total,
      createdAt: new Date().toISOString()
    };

    try {
      // save inside the user's church
      await addDoc(collection(db, "churches", userData.church, "givings"), reportData);

      successModal.style.display = "flex";
      form.reset();
    } catch (err) {
      console.error("error saving report:", err);
      alert("an error occurred while submitting the report. please try again.");
    } finally {
      submitBtn.disabled = false;
    }
  });
});
