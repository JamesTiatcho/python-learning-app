// final_quiz.js

import { auth, db } from "./firebase-config.js";
import { finalQuestions, codingQuestions, totalScore } from "./data.js";
import {
  requireLogin,
  renderLayout,
  setLoggedUserName,
  escapeHTML
} from "./main.js";
import {
  doc,
  getDoc,
  setDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";

renderLayout("final");

requireLogin(async (user, profile) => {
  setLoggedUserName(profile);
  await renderFinalQuiz(user, profile);
});

async function renderFinalQuiz(user, profile) {
  const content = document.getElementById("content");
  const scoreRef = doc(db, "finalScores", user.uid);
  const scoreSnap = await getDoc(scoreRef);

  if (scoreSnap.exists()) {
    const scoreData = scoreSnap.data();
    const review = scoreData.review || [];

    content.innerHTML = `
      <header class="hero">
        <p class="tag">Final Quiz Battle</p>
        <h2>Final Quiz Already Submitted</h2>
        <p>You cannot retake unless admin unlocks your account.</p>
      </header>

      <div class="card">
        <h3>Your Score</h3>
        <p><strong>${scoreData.score}/${scoreData.total}</strong></p>
        <a class="btn" href="leaderboard.html">View Scoreboard</a>
        ${scoreData.score === scoreData.total ? `<a class="btn success" href="certificate.html">View Certificate</a>` : ""}
      </div>

      <div class="card">
        <h3>Answer Review</h3>
        ${review.map(item => renderReviewItem(item)).join("")}
      </div>
    `;

    return;
  }

  const multipleHTML = Object.entries(finalQuestions).map(([key, q], index) => `
    <div class="question">
      <p><strong>${index + 1}. ${escapeHTML(q.question)}</strong></p>
      ${Object.entries(q.choices).map(([choiceKey, choice]) => `
        <label>
          <input type="radio" name="${key}" value="${choiceKey}" required>
          ${escapeHTML(choice)}
        </label>
      `).join("")}
    </div>
  `).join("");

  let number = Object.keys(finalQuestions).length + 1;

  const codingHTML = Object.entries(codingQuestions).map(([key, q]) => {
    const html = `
      <div class="coding-question">
        <p><strong>${number}. ${escapeHTML(q.question)}</strong></p>
        <textarea name="${key}" required placeholder="Write your Python code here..."></textarea>
      </div>
    `;
    number++;
    return html;
  }).join("");

  content.innerHTML = `
    <header class="hero">
      <p class="tag">Final Quiz Battle</p>
      <h2>Final Quiz Battle</h2>
      <p>Your score will be saved in Firebase and displayed on the scoreboard.</p>
    </header>

    <div class="card">
      <h3>Final Quiz</h3>
      <p>Once submitted, you cannot retake unless admin unlocks your account.</p>

      <form id="finalQuizForm">
        ${multipleHTML}

        <div class="coding-exam-box">
          <h3>Coding Exam</h3>
          <p>Each coding item is worth 1 point.</p>
          ${codingHTML}
        </div>

        <button type="submit" class="btn">Submit Final Quiz</button>
      </form>
    </div>
  `;

  document.getElementById("finalQuizForm").addEventListener("submit", async (event) => {
    event.preventDefault();

    let score = 0;
    let review = [];
    let qNumber = 1;

    Object.entries(finalQuestions).forEach(([key, q]) => {
      const selected = document.querySelector(`input[name="${key}"]:checked`);
      const selectedValue = selected ? selected.value : null;
      const isCorrect = selectedValue === q.correct;

      if (isCorrect) {
        score++;
      }

      review.push({
        number: qNumber,
        type: "multiple",
        question: q.question,
        selectedAnswer: selectedValue ? q.choices[selectedValue] : "No answer",
        correctAnswer: q.choices[q.correct],
        isCorrect
      });

      qNumber++;
    });

    Object.entries(codingQuestions).forEach(([key, q]) => {
      const textarea = document.querySelector(`textarea[name="${key}"]`);
      const answer = textarea ? textarea.value.trim() : "";
      const normalized = answer.toLowerCase();

      const isCorrect = q.checks.every(check => normalized.includes(check.toLowerCase()));

      if (isCorrect) {
        score++;
      }

      review.push({
        number: qNumber,
        type: "coding",
        question: q.question,
        selectedAnswer: answer || "No answer",
        correctAnswer: q.sample,
        isCorrect
      });

      qNumber++;
    });

    await setDoc(scoreRef, {
      userId: user.uid,
      userName: profile?.name || user.email,
      email: user.email,
      score,
      total: totalScore,
      review,
      submittedAt: serverTimestamp()
    });

    alert(`Final quiz submitted. Score: ${score}/${totalScore}`);
    window.location.href = "final_quiz.html";
  });
}

function renderReviewItem(item) {
  if (item.type === "coding") {
    return `
      <div class="review-box ${item.isCorrect ? "correct" : "wrong"}">
        <p><strong>${item.number}. ${escapeHTML(item.question)}</strong></p>
        <p>Your code:</p>
        <pre><code>${escapeHTML(item.selectedAnswer)}</code></pre>
        <p>Sample correct answer:</p>
        <pre><code>${escapeHTML(item.correctAnswer)}</code></pre>
        <p>${item.isCorrect ? "Correct ✅" : "Wrong ❌"}</p>
      </div>
    `;
  }

  return `
    <div class="review-box ${item.isCorrect ? "correct" : "wrong"}">
      <p><strong>${item.number}. ${escapeHTML(item.question)}</strong></p>
      <p>Your answer: ${escapeHTML(item.selectedAnswer)}</p>
      <p>Correct answer: ${escapeHTML(item.correctAnswer)}</p>
      <p>${item.isCorrect ? "Correct ✅" : "Wrong ❌"}</p>
    </div>
  `;
}
