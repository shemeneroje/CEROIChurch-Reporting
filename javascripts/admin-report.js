// admin-reports.js
import { 
  getFirestore, collection, getDocs, doc, getDoc 
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-auth.js";

const db = getFirestore();
const auth = getAuth();

onAuthStateChanged(auth, async (user) => {
  if (!user) {
    alert("You must be logged in as an admin.");
    window.location.href = "index.html";
    return;
  }

  // Fetch user profile
  const userDoc = await getDoc(doc(db, "users", user.uid));
  if (!userDoc.exists()) {
    alert("No user profile found.");
    return;
  }

  const userData = userDoc.data();
  const { church, role } = userData;

  if (role !== "admin") {
    alert("You are not authorized to view this page.");
    window.location.href = "home.html";
    return;
  }

  document.getElementById("church-name").innerText = "Church: " + church;

  // Fetch church givings
  const givingsRef = collection(db, "churches", church, "givings");
  const snapshot = await getDocs(givingsRef);

  const tbody = document.querySelector("#givings-table tbody");
  tbody.innerHTML = "";

  snapshot.forEach((docSnap) => {
    const data = docSnap.data();

    data.givings.forEach((g) => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${data.date}</td>
        <td>${data.serviceType}</td>
        <td>${data.paymentMethod}</td>
        <td>${g.type}</td>
        <td>€${g.amount}</td>
        <td>${g.comment || ""}</td>
        <td>${data.userId}</td>
      `;
      tbody.appendChild(row);
    });
  });
});
