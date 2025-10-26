// admin-report.js
import { getFirestore, collection, getDocs, query, orderBy } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-auth.js";

const db = getFirestore();
const auth = getAuth();
const reportDiv = document.getElementById("admin-report");

onAuthStateChanged(auth, async (user) => {
  if (!user) {
    window.location.href = "index.html";
    return;
  }

  try {
    const userSnap = await getDocs(collection(db, "users"));
    let userData = null;
    userSnap.forEach(doc => {
      if (doc.id === user.uid) userData = doc.data();
    });

    if (!userData) {
      alert("user profile not found");
      return;
    }

    const churchName = userData.church;
    const givingsRef = collection(db, "churches", churchName, "givings");
    const q = query(givingsRef, orderBy("date"));
    const snapshot = await getDocs(q);

    const allReports = [];
    snapshot.forEach(doc => {
      const data = doc.data();
      allReports.push({
        submittedBy: data.submittedBy,
        church: data.church,
        serviceType: data.serviceType,
        date: data.date,
        totalAmount: data.totalAmount
      });
    });

    if (!allReports.length) {
      reportDiv.innerHTML = "<p>no reports found for this church.</p>";
      return;
    }

    let html = "<table><thead><tr>";
    Object.keys(allReports[0]).forEach(key => {
      html += `<th>${key}</th>`;
    });
    html += "</tr></thead><tbody>";

    allReports.forEach(row => {
      html += "<tr>";
      Object.values(row).forEach(val => {
        html += `<td>${val}</td>`;
      });
      html += "</tr>";
    });
    html += "</tbody></table>";

    reportDiv.innerHTML = html;

  } catch (error) {
    console.error("error loading admin report:", error);
    alert("error loading admin report. check console for details.");
  }
});
