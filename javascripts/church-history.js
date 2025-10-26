// church-history.js
import { getFirestore, collection, getDocs, query, orderBy } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-auth.js";

const db = getFirestore();
const auth = getAuth();
const churchTableDiv = document.getElementById("church-history-table");
const downloadBtn = document.getElementById("download-btn");

function convertToCSV(rows) {
  if (!rows.length) return "";
  const headers = Object.keys(rows[0]);
  const csv = [
    headers.join(","),
    ...rows.map(row => headers.map(h => `"${row[h] ?? ""}"`).join(","))
  ].join("\n");
  return csv;
}

function downloadCSV(csv, filename = "church-givings.csv") {
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

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

    const allGivings = [];
    snapshot.forEach(doc => {
      const data = doc.data();
      allGivings.push({
        submittedBy: data.submittedBy,
        date: data.date,
        paymentMethod: data.paymentMethod,
        serviceType: data.serviceType,
        totalAmount: data.totalAmount
      });
    });

    if (!allGivings.length) {
      churchTableDiv.innerHTML = "<p>no records found for this church.</p>";
      return;
    }

    let html = "<table><thead><tr>";
    Object.keys(allGivings[0]).forEach(key => {
      html += `<th>${key}</th>`;
    });
    html += "</tr></thead><tbody>";

    allGivings.forEach(row => {
      html += "<tr>";
      Object.values(row).forEach(val => {
        html += `<td>${val}</td>`;
      });
      html += "</tr>";
    });
    html += "</tbody></table>";

    churchTableDiv.innerHTML = html;

    if (downloadBtn) {
      downloadBtn.addEventListener("click", () => {
        const csv = convertToCSV(allGivings);
        downloadCSV(csv, `church-givings-${churchName}.csv`);
      });
    }

  } catch (error) {
    console.error("error loading church givings:", error);
    alert("error loading church givings. check console for details.");
  }
});
