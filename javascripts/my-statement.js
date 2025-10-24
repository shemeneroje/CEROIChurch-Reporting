import { getFirestore, collection, getDocs, query, where, orderBy } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-auth.js";

const db = getFirestore();
const auth = getAuth();

const generateBtn = document.getElementById('generate-btn');
const statementTable = document.getElementById('statement-table');

document.getElementById('logout-btn').addEventListener('click', async () => {
    await signOut(auth);
    window.location.href = "index.html";
});

onAuthStateChanged(auth, async (user) => {
    if (!user) {
        window.location.href = "index.html";
        return;
    }

    generateBtn.addEventListener('click', async () => {
        const startDate = document.getElementById('start-date').value;
        const endDate = document.getElementById('end-date').value;

        if (!startDate || !endDate) {
            alert("Please select both start and end dates.");
            return;
        }

        // Convert to ISO strings for comparison
        const startISO = new Date(startDate).toISOString();
        const endISO = new Date(endDate).toISOString();

        const q = query(collection(db, "givings"), 
                        where("userId", "==", user.uid), 
                        orderBy("createdAt", "asc"));
        const snapshot = await getDocs(q);

        const filteredGivings = snapshot.docs
            .map(doc => doc.data())
            .filter(g => g.createdAt >= startISO && g.createdAt <= endISO);

        if (!filteredGivings.length) {
            alert("No givings found in this date range.");
            return;
        }

        downloadCSV(filteredGivings);
        displayGivings(filteredGivings);
    });
});

function displayGivings(givings) {
    let html = `<table>
        <thead>
            <tr>
                <th>Date</th>
                <th>Service</th>
                <th>Payment Method</th>
                <th>Church</th>
                <th>Giving Type</th>
                <th>Amount (€)</th>
                <th>Comment</th>
            </tr>
        </thead>
        <tbody>`;

    givings.forEach(g => {
        g.givings.forEach(item => {
            html += `<tr>
                <td>${g.date}</td>
                <td>${g.serviceType}</td>
                <td>${g.paymentMethod}</td>
                <td>${g.church}</td>
                <td>${item.type}</td>
                <td>${item.amount}</td>
                <td>${item.comment}</td>
            </tr>`;
        });
    });

    html += `</tbody></table>`;
    statementTable.innerHTML = html;
}

function downloadCSV(givings) {
    let csv = "Date,Service,Payment Method,Church,Giving Type,Amount,Comment\n";
    givings.forEach(g => {
        g.givings.forEach(item => {
            csv += `"${g.date}","${g.serviceType}","${g.paymentMethod}","${g.church}","${item.type}","${item.amount}","${item.comment}"\n`;
        });
    });

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = "my_statement.csv";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
}
