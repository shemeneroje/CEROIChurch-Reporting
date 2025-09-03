import { getFirestore, collection, getDocs, query, where, orderBy } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-auth.js";

const db = getFirestore();
const auth = getAuth();

const historyTable = document.getElementById('history-table');
const downloadBtn = document.getElementById('download-btn');

// Logout
document.getElementById('logout-btn').addEventListener('click', async () => {
    await signOut(auth);
    window.location.href = "index.html";
});

// Load user's givings
onAuthStateChanged(auth, async (user) => {
    if (!user) {
        window.location.href = "index.html";
        return;
    }

    const q = query(collection(db, "givings"), where("userId", "==", user.uid), orderBy("createdAt", "desc"));
    const snapshot = await getDocs(q);

    const givings = snapshot.docs.map(doc => doc.data());
    displayGivings(givings);

    downloadBtn.addEventListener('click', () => downloadCSV(givings));
});

function displayGivings(givings) {
    if (!givings.length) {
        historyTable.innerHTML = "<p>No givings found.</p>";
        return;
    }

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

    givings.forEach(giving => {
        giving.givings.forEach(item => {
            html += `<tr>
                <td>${giving.date}</td>
                <td>${giving.serviceType}</td>
                <td>${giving.paymentMethod}</td>
                <td>${giving.church}</td>
                <td>${item.type}</td>
                <td>${item.amount}</td>
                <td>${item.comment}</td>
            </tr>`;
        });
    });

    html += `</tbody></table>`;
    historyTable.innerHTML = html;
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
    a.download = "my_giving_history.csv";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
}
