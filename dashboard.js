// dashboard.js

import { auth, db } from "./firebase-config.js";
import { lessonOrder, lessons } from "./data.js";
import {
  requireLogin,
  renderLayout,
  setLoggedUserName,
  getProgress
} from "./main.js";
import {
  doc,
  getDoc
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";

renderLayout("dashboard");

requireLogin(async (user, profile) => {
  setLoggedUserName(profile);

  const content = document.getElementById("content");

  let completedCount = 0;
  let lessonCards = "";

  for (const lessonId of lessonOrder) {
    const progress = await getProgress(user.uid, lessonId);

    if (progress.completed) {
      completedCount++;
    }

    let badge = `<span class="badge locked">Incomplete</span>`;

    if (progress.completed) {
      badge = `<span class="badge done">Completed</span>`;
    } else if (progress.taskAnswer && progress.miniQuizPassed) {
      badge = `<span class="badge ready">Ready to Complete</span>`;
    }

    lessonCards += `
      <a class="lesson-item" href="lessons.html?id=${lessonId}">
        <strong>${lessons[lessonId].title}</strong>
        ${badge}
      </a>
    `;
  }

  const percent = Math.round((completedCount / lessonOrder.length) * 100);

  const scoreRef = doc(db, "finalScores", user.uid);
  const scoreSnap = await getDoc(scoreRef);
  const scoreData = scoreSnap.exists() ? scoreSnap.data() : null;

  content.innerHTML = `
    <header class="hero">
      <p class="tag">Firebase Backend</p>
      <h2>Welcome, ${profile?.name || "Student"}</h2>
      <p>Your lesson progress and final quiz score are saved in Firebase Firestore.</p>
    </header>

    <div class="grid">
      <div class="card">
        <h3>Lesson Progress</h3>
        <div class="progress-bar">
          <span style="width:${percent}%"></span>
        </div>
        <p><strong>${completedCount}/${lessonOrder.length}</strong> lessons completed</p>
      </div>

      <div class="card">
        <h3>Final Quiz Battle</h3>
        ${
          scoreData
            ? `
              <p>Score: <strong>${scoreData.score}/${scoreData.total}</strong></p>
              <a class="btn" href="final_quiz.html">View Review</a>
              ${scoreData.score === scoreData.total ? `<a class="btn success" href="certificate.html">View Certificate</a>` : ""}
            `
            : `
              <p>No final quiz submission yet.</p>
              <a class="btn" href="final_quiz.html">Take Final Quiz</a>
            `
        }
      </div>
    </div>

    <div class="card">
      <h3>Lessons</h3>
      <div class="lesson-list">
        ${lessonCards}
      </div>
    </div>
  `;
});
