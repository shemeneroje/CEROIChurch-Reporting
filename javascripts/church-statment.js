// church-history.js
import { getFirestore, collection, getDocs, query, where, orderBy } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-auth.js";

const db = getFirestore();
const auth = getAuth();

const logoutBtn = document.getElementById("logout-btn");
const generateBtn = document.getElementById("generate-btn");
const historyTableDiv = document.getElementById("history-table");

logoutBtn.addEventListener("click", async () => {
    await signOut(auth);
    window.location.href = "index.html";
});

// Convert data to CSV
function convertToCSV(rows) {
    if (!rows.length) return "";
    const headers = Object.keys(rows[0]);
    const csv = [
        headers.join(","),
        ...rows.map(row => headers.map(h => `"${row[h] ?? ""}"`).join(","))
    ].join("\n");
    return csv;
}

// Trigger CSV download
function downloadCSV(csv, filename = "church-giving-history.csv") {
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", filename);
    link.style.visibility = "hidden";
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
        // Get user profile
        const userDocRef = collection(db, "users");
        const userSnapshot = await getDocs(userDocRef);
        let userData = null;
        userSnapshot.forEach(doc => {
            if (doc.id === user.uid) userData = doc.data();
        });

        if (!userData) {
            alert("User profile not found.");
            return;
        }

        // Only admins can access church report history
        if (userData.role !== "Admin") {
            alert("Access denied. Only admins can view this page.");
            window.location.href = "home.html";
            return;
        }

        const churchName = userData.church;

        generateBtn.addEventListener("click", async () => {
            const startDate = document.getElementById("start-date").value;
            const endDate = document.getElementById("end-date").value;

            if (!startDate || !endDate) {
                alert("Please select both start and end dates.");
                return;
            }

            const givingsRef = collection(db, "churches", churchName, "givings");
            const snapshot = await getDocs(query(givingsRef, orderBy("date")));

            const filteredGivings = [];
            snapshot.forEach(doc => {
                const data = doc.data();
                if (data.date >= startDate && data.date <= endDate) {
                    filteredGivings.push({
                        date: data.date,
                        serviceType: data.serviceType,
                        paymentMethod: data.paymentMethod,
                        userId: data.userId,
                        givings: JSON.stringify(data.givings)
                    });
                }
            });

            if (!filteredGivings.length) {
                historyTableDiv.innerHTML = "<p>No givings found for the selected date range.</p>";
                return;
            }

            // Generate table
            let html = "<table><thead><tr>";
            Object.keys(filteredGivings[0]).forEach(key => {
                html += `<th>${key}</th>`;
            });
            html += "</tr></thead><tbody>";
            filteredGivings.forEach(row => {
                html += "<tr>";
                Object.values(row).forEach(val => {
                    html += `<td>${val}</td>`;
                });
                html += "</tr>";
            });
            html += "</tbody></table>";
            historyTableDiv.innerHTML = html;

            // Download CSV
            const csv = convertToCSV(filteredGivings);
            downloadCSV(csv, `church-giving-history-${churchName}.csv`);
        });

    } catch (error) {
        console.error("Error fetching church givings:", error);
        alert("Error fetching church givings. Check console for details.");
    }
});
