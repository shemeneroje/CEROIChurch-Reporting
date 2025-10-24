import { getFirestore, doc, getDoc } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-auth.js";

const db = getFirestore();
const auth = getAuth();

onAuthStateChanged(auth, async (user) => {
  if (!user) {
    window.location.href = "index.html";
    return;
  }

  const userDoc = await getDoc(doc(db, "users", user.uid));
  if (!userDoc.exists()) {
    console.error("User not found in Firestore");
    return;
  }

  const userData = userDoc.data();
  const role = userData.role?.trim() || "Member";

  console.log("Logged in as:", role);

  // Hide all restricted sections by default
  document.querySelectorAll(".admin-only, .group-only, .zonal-only").forEach(el => el.style.display = "none");

  // Then show based on the user's role
  switch (role) {
    case "Admin":
    case "Church Pastor":
      document.querySelectorAll(".admin-only").forEach(el => el.style.display = "block");
      break;

    case "Group Pastor":
      document.querySelectorAll(".group-only").forEach(el => el.style.display = "block");
      break;

    case "Zonal Pastor":
      document.querySelectorAll(".zonal-only, .group-only, .admin-only").forEach(el => el.style.display = "block");
      break;

    default:
      // Member — sees only their own reports
      break;
  }
});
