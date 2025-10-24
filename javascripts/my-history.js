// my-history.js
import { getFirestore, collection, getDocs, query, orderBy, where } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-auth.js";

const db = getFirestore();
const auth = getAuth();

const historyTableDiv = document.getElementById("history-table");
const downloadBtn = document.getElementById("download-btn");
const logoutBtn = document.getElementById("logout-btn");

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
function downloadCSV(csv, filename = "my-giving-history.csv") {
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
        // Get the user's church
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

        const churchName = userData.church;

        // Fetch all givings for this user
        const givingsRef = collection(db, "churches", churchName, "givings");
        const q = query(givingsRef, orderBy("date"));
        const snapshot = await getDocs(q);

        const userGivings = [];
        snapshot.forEach(doc => {
            const data = doc.data();
            if (data.userId === user.uid) {
                userGivings.push({
                    date: data.date,
                    serviceType: data.serviceType,
                    paymentMethod: data.paymentMethod,
                    givings: JSON.stringify(data.givings)
                });
            }
        });

        if (!userGivings.length) {
            historyTableDiv.innerHTML = "<p>No giving records found.</p>";
            return;
        }

        // Generate table
        let html = "<table><thead><tr>";
        Object.keys(userGivings[0]).forEach(key => {
            html += `<th>${key}</th>`;
        });
        html += "</tr></thead><tbody>";
        userGivings.forEach(row => {
            html += "<tr>";
            Object.values(row).forEach(val => {
                html += `<td>${val}</td>`;
            });
            html += "</tr>";
        });
        html += "</tbody></table>";
        historyTableDiv.innerHTML = html;

        // Download button
        downloadBtn.addEventListener("click", () => {
            const csv = convertToCSV(userGivings);
            downloadCSV(csv, `my-giving-history-${churchName}.csv`);
        });

    } catch (error) {
        console.error("Error fetching givings:", error);
        alert("Error fetching givings. Check console for details.");
    }
});
