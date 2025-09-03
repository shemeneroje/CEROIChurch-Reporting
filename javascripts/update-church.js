// import the necessary Firebase functions
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-app.js";
import { getFirestore, collection, getDocs, updateDoc, doc } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";

// Your Firebase config
const firebaseConfig = {
    apiKey: "AIzaSyDKGHkuy3BssxINilas---1CHiyD-ivfaA",
    authDomain: "church-reporting-f932f.firebaseapp.com",
    projectId: "church-reporting-f932f",
    storageBucket: "church-reporting-f932f.appspot.com",
    messagingSenderId: "78377270291",
    appId: "1:78377270291:web:d606356331343859b013e6",
    measurementId: "G-E01QJ1NG2T"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const defaultChurch = "ChristEmbassy"; 

async function updateUsersChurch() {
    try {
        const usersCol = collection(db, "users");
        const userSnapshot = await getDocs(usersCol);

        const updates = [];

        userSnapshot.forEach(userDoc => {
            const data = userDoc.data();
            if (!data.church) {
                // Add church field if it doesn't exist
                updates.push(updateDoc(doc(db, "users", userDoc.id), {
                    church: defaultChurch
                }));
            }
        });

        await Promise.all(updates);
        console.log("All users updated with default church.");
    } catch (err) {
        console.error("Error updating users:", err);
    }
}

// Run the update
updateUsersChurch();
