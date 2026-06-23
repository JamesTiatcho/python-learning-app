// admin.js

import { db } from "./firebase-config.js";
import {
  requireLogin,
  renderLayout,
  setLoggedUserName
} from "./main.js";
import {
  collection,
  getDocs,
  query,
  orderBy,
  doc,
  deleteDoc,
  getDocs as getDocsAgain
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";

renderLayout("admin");

requireLogin(async (user, profile) => {
  setLoggedUserName(profile);

  if (!profile || profile.role !== "admin") {
    document.getElementById("content").innerHTML = `
      <div class="card">
        <h2>Admin only.</h2>
        <p>Your account role is not admin.</p>
      </div>
    `;
    return;
  }

  await loadAdmin();
});

async function loadAdmin() {
  const content = document.getElementById("content");

  const q = query(
    collection(db, "finalScores"),
    orderBy("score", "desc")
  );

  const snapshot = await getDocs(q);

  let rows = "";

  snapshot.forEach((docSnap) => {
    const data = docSnap.data();

    rows += `
      <tr>
        <td>${data.userName || "Student"}</td>
        <td>${data.email || ""}</td>
        <td>${data.score}/${data.total}</td>
        <td>
          <button class="btn orange unlock-btn" data-id="${docSnap.id}">Unlock Final Quiz</button>
        </td>
      </tr>
    `;
  });

  if (!rows) {
    rows = `<tr><td colspan="4">No final quiz submissions yet.</td></tr>`;
  }

  content.innerHTML = `
    <header class="hero">
      <p class="tag">Admin</p>
      <h2>Admin Control</h2>
      <p>Unlock final quiz retake by deleting the user's final score record.</p>
    </header>

    <div class="card">
      <h3>Final Quiz Submissions</h3>
      <table>
        <tr>
          <th>Name</th>
          <th>Email</th>
          <th>Score</th>
          <th>Action</th>
        </tr>
        ${rows}
      </table>
    </div>
  `;

  document.querySelectorAll(".unlock-btn").forEach(button => {
    button.addEventListener("click", async () => {
      const id = button.dataset.id;

      if (!confirm("Unlock this user's final quiz retake?")) {
        return;
      }

      await deleteDoc(doc(db, "finalScores", id));
      alert("Final quiz unlocked.");
      await loadAdmin();
    });
  });
}
