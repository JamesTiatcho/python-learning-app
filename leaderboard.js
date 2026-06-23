// leaderboard.js

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
  orderBy
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";

renderLayout("leaderboard");

requireLogin(async (user, profile) => {
  setLoggedUserName(profile);
  await loadLeaderboard();
});

async function loadLeaderboard() {
  const content = document.getElementById("content");

  const q = query(
    collection(db, "finalScores"),
    orderBy("score", "desc")
  );

  const snapshot = await getDocs(q);

  let rows = "";
  let rank = 1;

  snapshot.forEach((docSnap) => {
    const data = docSnap.data();

    rows += `
      <tr>
        <td>${rank}</td>
        <td>${data.userName || "Student"}</td>
        <td>${data.email || ""}</td>
        <td>${data.score}/${data.total}</td>
        <td>
          ${
            data.score === data.total
              ? `<span class="badge done">Perfect / Certificate</span>`
              : `<span class="badge ready">Submitted</span>`
          }
        </td>
      </tr>
    `;

    rank++;
  });

  if (!rows) {
    rows = `
      <tr>
        <td colspan="5">No submissions yet.</td>
      </tr>
    `;
  }

  content.innerHTML = `
    <header class="hero">
      <p class="tag">Scoreboard</p>
      <h2>Final Quiz Scoreboard</h2>
      <p>Scores are based on users who submitted the final quiz.</p>
    </header>

    <div class="card">
      <table>
        <tr>
          <th>Rank</th>
          <th>Name</th>
          <th>Email</th>
          <th>Score</th>
          <th>Status</th>
        </tr>
        ${rows}
      </table>
    </div>
  `;
}