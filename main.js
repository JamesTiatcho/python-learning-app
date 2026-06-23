// main.js

import { auth, db } from "./firebase-config.js";
import { lessonOrder, lessons } from "./data.js";
import {
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";
import {
  doc,
  getDoc
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";

const savedTheme = localStorage.getItem("theme") || "light";
document.documentElement.setAttribute("data-theme", savedTheme);

export function escapeHTML(text) {
  return String(text)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

export function getPageName() {
  const path = window.location.pathname;
  return path.substring(path.lastIndexOf("/") + 1);
}

export function requireLogin(callback) {
  onAuthStateChanged(auth, async (user) => {
    if (!user) {
      window.location.href = "login.html";
      return;
    }

    const userDoc = await getDoc(doc(db, "users", user.uid));
    const profile = userDoc.exists() ? userDoc.data() : null;

    callback(user, profile);
  });
}

export function redirectIfLoggedIn() {
  onAuthStateChanged(auth, (user) => {
    if (user) {
      window.location.href = "dashboard.html";
    }
  });
}

export async function getUserProfile(uid) {
  const userDoc = await getDoc(doc(db, "users", uid));
  return userDoc.exists() ? userDoc.data() : null;
}

export function renderLayout(activePage = "") {
  const layout = document.getElementById("layout");

  if (!layout) {
    return;
  }

  layout.innerHTML = `
    <aside class="sidebar">
      <div class="brand">
        <div class="logo">Py</div>
        <div>
          <h1>Python Basics</h1>
          <p>By: James Tiatcho</p>
          <p class="small" id="loggedUserName">Loading...</p>
        </div>
      </div>

      <button id="themeToggleBtn" class="theme-toggle" type="button">
        Loading Theme...
      </button>

      <nav>
        <a 
          class="${activePage === "dashboard" ? "active" : ""}" 
          href="dashboard.html"
        >
          Dashboard
        </a>

        ${lessonOrder.map(id => `
          <a 
            class="${activePage === id ? "active" : ""}" 
            href="lessons.html?id=${id}"
          >
            ${lessons[id].title}
          </a>
        `).join("")}

        <a 
          class="${activePage === "code_test" ? "active" : ""}" 
          href="code_test.html"
        >
          Code Test
        </a>

        <a 
          class="${activePage === "final" ? "active" : ""}" 
          href="final_quiz.html"
        >
          Final Quiz Battle
        </a>

        <a 
          class="${activePage === "battle_lobby" ? "active" : ""}" 
          href="battle_lobby.html"
        >
          Online Code Battle
        </a>

        <a 
          class="${activePage === "code_battle" ? "active" : ""}" 
          href="code_battle.html"
        >
          Code Battle
        </a>

        <a 
          class="${activePage === "leaderboard" ? "active" : ""}" 
          href="leaderboard.html"
        >
          Scoreboard
        </a>

        <a 
          class="${activePage === "certificate" ? "active" : ""}" 
          href="certificate.html"
        >
          Certificate
        </a>

        <a 
          class="${activePage === "admin" ? "active" : ""}" 
          href="admin.html"
          id="adminNavLink"
        >
          Admin
        </a>

        <a href="#" id="logoutBtn">Logout</a>
      </nav>
    </aside>

    <main class="content" id="content"></main>
  `;

  setupThemeToggle();

  const logoutBtn = document.getElementById("logoutBtn");

  if (logoutBtn) {
    logoutBtn.addEventListener("click", async (event) => {
      event.preventDefault();
      await signOut(auth);
      window.location.href = "login.html";
    });
  }
}

function setupThemeToggle() {
  const themeToggleBtn = document.getElementById("themeToggleBtn");

  if (!themeToggleBtn) return;

  const currentTheme = localStorage.getItem("theme") || "light";
  document.documentElement.setAttribute("data-theme", currentTheme);
  updateThemeButtonText(currentTheme);

  themeToggleBtn.addEventListener("click", () => {
    const activeTheme = document.documentElement.getAttribute("data-theme");
    const newTheme = activeTheme === "dark" ? "light" : "dark";

    document.documentElement.setAttribute("data-theme", newTheme);
    localStorage.setItem("theme", newTheme);

    updateThemeButtonText(newTheme);
  });
}

function updateThemeButtonText(theme) {
  const themeToggleBtn = document.getElementById("themeToggleBtn");

  if (!themeToggleBtn) return;

  if (theme === "dark") {
    themeToggleBtn.textContent = "☀️ Light Mode";
  } else {
    themeToggleBtn.textContent = "🌙 Dark Mode";
  }
}

export function setLoggedUserName(profile) {
  const el = document.getElementById("loggedUserName");

  if (el) {
    el.textContent = profile ? "User: " + profile.name : "User";
  }

  const adminNavLink = document.getElementById("adminNavLink");

  if (adminNavLink && profile?.role !== "admin") {
    adminNavLink.style.display = "none";
  }
}

export async function getProgress(userId, lessonId) {
  const progressId = userId + "_" + lessonId;
  const progressRef = doc(db, "lessonProgress", progressId);
  const progressSnap = await getDoc(progressRef);

  if (progressSnap.exists()) {
    return progressSnap.data();
  }

  return {
    userId,
    lessonId,
    taskAnswer: "",
    miniQuizScore: 0,
    miniQuizTotal: 0,
    miniQuizPassed: false,
    completed: false
  };
}

export function showAlert(message) {
  alert(message);
}
