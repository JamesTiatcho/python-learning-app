// auth.js

import { auth, db } from "./firebase-config.js";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";

import {
  doc,
  setDoc,
  getDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";

const registerForm = document.getElementById("registerForm");
const loginForm = document.getElementById("loginForm");
const messageBox = document.getElementById("message");

function showMessage(message, type = "error") {
  if (!messageBox) return;

  messageBox.textContent = message;
  messageBox.className = type === "success" ? "message success" : "message error";
}

if (registerForm) {
  registerForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const name = document.getElementById("name").value.trim();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;

    if (!name || !email || !password) {
      showMessage("Please complete all fields.");
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      await updateProfile(user, {
        displayName: name
      });

      await setDoc(doc(db, "users", user.uid), {
        name: name,
        email: email,
        role: "student",
        createdAt: serverTimestamp()
      });

      showMessage("Account created successfully. Redirecting to login...", "success");

      setTimeout(() => {
        window.location.href = "login.html";
      }, 1000);

    } catch (error) {
      console.error(error);
      showMessage(error.message);
    }
  });
}

if (loginForm) {
  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;

    if (!email || !password) {
      showMessage("Please enter email and password.");
      return;
    }

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      const userRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        await setDoc(userRef, {
          name: user.displayName || email.split("@")[0],
          email: user.email,
          role: "student",
          createdAt: serverTimestamp()
        });
      }

      window.location.href = "dashboard.html";

    } catch (error) {
      console.error(error);
      showMessage("Invalid email or password.");
    }
  });
}