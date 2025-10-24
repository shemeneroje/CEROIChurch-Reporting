// church-history.js
import { 
  getFirestore, collection, getDocs, doc, query, orderBy, where, getDoc 
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-auth.js";

const db = getFirestore();
const auth = getAuth();

const historyTableDiv = document.getElementById("history-table");
const generateBtn = document.getElementById("generate-btn");
const startDateInput = document.getElementById("start-date");
const endDateInput = document.getElementById("end-date");
const logoutBtn = document.getElementById("logout-btn");

let currentReports = []; // store currently displayed reports

logoutBtn.addEventListener("click", async () => {
  await signOut(auth);
  window.location.href = "index.html";
});

// 🟩 ROLE-BASED REPORT FILTERING
onAuthStateChanged(auth, async (user) => {
  if (!user) {
    window.location.href = "index.html";
    return;
  }

  const userSnap = await getDoc(doc(db, "users", user.uid));
  if (!userSnap.exists()) {
    console.error("User not found in Firestore!");
    return;
  }

  const userData = userSnap.data();
  console.log("Logged in as:", userData.role);

  await loadReportsByRole(userData);
});

async function loadReportsByRole(userData) {
  const reportsRef = collection(db, "reports");
  let q;

  switch (userData.role.toLowerCase()) {
    case "zonal pastor":
      q = query(reportsRef, orderBy("createdAt", "desc"));
      break;

    case "group pastor":
      q = query(reportsRef, where("group", "==", userData.group), orderBy("createdAt", "desc"));
      break;

    case "admin":
    case "church pastor":
      q = query(reportsRef, where("church", "==", userData.church), orderBy("createdAt", "desc"));
      break;

    case "user":
    default:
      q = query(reportsRef, where("uid", "==", userData.uid), orderBy("createdAt", "desc"));
      break;
  }

  try {
    const snapshot = await getDocs(q);
    currentReports = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    displayReports(currentReports);
  } catch (error) {
    console.error("Error fetching reports:", error);
  }
}

function displayReports(reports) {
  if (!historyTableDiv) return;

  if (reports.length === 0) {
    historyTableDiv.innerHTML = "<p>No reports found.</p>";
    return;
  }

  let tableHTML = `
    <table class="reports-table">
      <thead>
        <tr>
          <th>Date</th>
          <th>Submitted By</th>
          <th>Church</th>
          <th>Group</th>
          <th>Zone</th>
          <th>Total (€)</th>
        </tr>
      </thead>
      <tbody>
  `;

  reports.forEach(r => {
    tableHTML += `
      <tr>
        <td>${new Date(r.createdAt).toLocaleDateString()}</td>
        <td>${r.submittedBy || "N/A"}</td>
        <td>${r.church || "N/A"}</td>
        <td>${r.group || "N/A"}</td>
        <td>${r.zone || "N/A"}</td>
        <td>${r.totalAmount || "0.00"}</td>
      </tr>
    `;
  });

  tableHTML += `</tbody></table>`;
  historyTableDiv.innerHTML = tableHTML;
}

// 🟨 CSV EXPORT FEATURE (includes all giving categories)
generateBtn.addEventListener("click", () => {
  if (currentReports.length === 0) {
    alert("No reports available to export.");
    return;
  }

  // Optional date range filtering
  const start = startDateInput.value ? new Date(startDateInput.value) : null;
  const end = endDateInput.value ? new Date(endDateInput.value) : null;

  const filtered = currentReports.filter(r => {
    const reportDate = new Date(r.createdAt);
    if (start && reportDate < start) return false;
    if (end && reportDate > end) return false;
    return true;
  });

  if (filtered.length === 0) {
    alert("No reports in the selected date range.");
    return;
  }

  // Identify all giving categories across reports
  const allCategories = new Set();
  filtered.forEach(r => {
    if (r.givings && typeof r.givings === "object") {
      Object.keys(r.givings).forEach(cat => allCategories.add(cat));
    }
  });

  const categories = Array.from(allCategories);
  const headers = [
    "Date", "Submitted By", "Church", "Group", "Zone",
    ...categories.map(cat => cat.replace(/([A-Z])/g, ' $1').trim()),
    "Total (€)"
  ];

  const rows = filtered.map(r => {
    const row = [
      new Date(r.createdAt).toLocaleDateString(),
      r.submittedBy || "",
      r.church || "",
      r.group || "",
      r.zone || ""
    ];

    // Fill in each giving category column
    categories.forEach(cat => {
      const amount = r.givings && r.givings[cat] ? r.givings[cat] : 0;
      row.push(amount);
    });

    row.push(r.totalAmount || "0.00");
    return row;
  });

  // Convert to CSV string
  const csvContent = "data:text/csv;charset=utf-8,"
    + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");

  // Download file
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", "church_reports_with_givings.csv");
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
});
