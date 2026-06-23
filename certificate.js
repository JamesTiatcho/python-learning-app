// certificate.js

import { db } from "./firebase-config.js";
import {
  requireLogin,
  renderLayout,
  setLoggedUserName,
  escapeHTML
} from "./main.js";
import {
  doc,
  getDoc
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";

renderLayout("certificate");

function isEmail(value) {
  return typeof value === "string" && value.includes("@");
}

function getCertificateName(profile, scoreData) {
  if (profile?.name && !isEmail(profile.name)) {
    return profile.name;
  }

  if (profile?.fullName && !isEmail(profile.fullName)) {
    return profile.fullName;
  }

  if (scoreData?.userName && !isEmail(scoreData.userName)) {
    return scoreData.userName;
  }

  return "Student Name";
}

requireLogin(async (user, profile) => {
  setLoggedUserName(profile);

  const content = document.getElementById("content");

  const userRef = doc(db, "users", user.uid);
  const userSnap = await getDoc(userRef);

  let userProfile = profile;

  if (userSnap.exists()) {
    userProfile = userSnap.data();
  }

  const scoreRef = doc(db, "finalScores", user.uid);
  const scoreSnap = await getDoc(scoreRef);

  if (!scoreSnap.exists()) {
    content.innerHTML = `
      <div class="card">
        <h2>No certificate yet.</h2>
        <p>You need to take the final quiz first.</p>
        <a class="btn" href="final_quiz.html">Take Final Quiz</a>
      </div>
    `;
    return;
  }

  const scoreData = scoreSnap.data();

  if (scoreData.score !== scoreData.total) {
    content.innerHTML = `
      <div class="card">
        <h2>Certificate Locked</h2>
        <p>Certificate is only available for perfect score.</p>
        <p>Your score: <strong>${scoreData.score}/${scoreData.total}</strong></p>
        <a class="btn" href="final_quiz.html">View Review</a>
      </div>
    `;
    return;
  }

  const certificateName = getCertificateName(userProfile, scoreData);

  content.innerHTML = `
    <div class="certificate">
      <div class="cert-inner">
        <p class="cert-small">Certificate of Completion</p>
        <h1>Python Basics</h1>

        <p>This certificate is proudly presented to</p>
        <h2>${escapeHTML(certificateName)}</h2>

        <p>
          for achieving a perfect score of
          <strong>${scoreData.score}/${scoreData.total}</strong>
          in the Python Basics Final Quiz Battle.
        </p>

        <p class="cert-date">Date: ${new Date().toLocaleDateString()}</p>

        <div class="signature">
          <div class="sig-name">James Tiatcho</div>
          <div class="sig-line"></div>
          <p>Instructor / Admin Signature</p>
        </div>
      </div>
    </div>

    <button onclick="window.print()" class="btn print-btn">Print Certificate</button>
  `;
});