// battle_lobby.js

import { db } from "./firebase-config.js";
import {
  requireLogin,
  renderLayout,
  setLoggedUserName,
  escapeHTML
} from "./main.js";

import {
  doc,
  setDoc,
  deleteDoc,
  collection,
  addDoc,
  updateDoc,
  onSnapshot,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";

let currentUser = null;
let currentProfile = null;
let heartbeatTimer = null;
let alreadyRedirected = false;

renderLayout("battle_lobby");

requireLogin(async (user, profile) => {
  currentUser = user;
  currentProfile = profile;

  setLoggedUserName(profile);

  await markUserOnline();
  renderLobby();
  setupHeartbeat();
  listenOnlineUsers();
  listenBattleRequests();
});

function getDisplayName() {
  return currentProfile?.name || currentUser.displayName || currentUser.email;
}

async function markUserOnline() {
  await setDoc(doc(db, "onlineUsers", currentUser.uid), {
    userId: currentUser.uid,
    name: getDisplayName(),
    email: currentUser.email,
    status: "online",
    lastActiveMs: Date.now(),
    lastActiveAt: serverTimestamp()
  }, { merge: true });
}

function setupHeartbeat() {
  heartbeatTimer = setInterval(async () => {
    if (!currentUser) return;

    await setDoc(doc(db, "onlineUsers", currentUser.uid), {
      userId: currentUser.uid,
      name: getDisplayName(),
      email: currentUser.email,
      status: "online",
      lastActiveMs: Date.now(),
      lastActiveAt: serverTimestamp()
    }, { merge: true });
  }, 10000);

  window.addEventListener("beforeunload", () => {
    if (heartbeatTimer) {
      clearInterval(heartbeatTimer);
    }

    if (currentUser) {
      deleteDoc(doc(db, "onlineUsers", currentUser.uid));
    }
  });
}

function renderLobby() {
  const content = document.getElementById("content");

  content.innerHTML = `
    <header class="hero">
      <p class="tag">Online 1v1</p>
      <h2>Online Code Battle Lobby</h2>
      <p>
        Challenge an online student and compete in a live 3-minute Python coding battle.
      </p>
    </header>

    <div class="grid">
      <div class="card">
        <h2>Online Students</h2>
        <p class="lesson-description">
          Students who are currently online will appear here.
          Click Challenge to invite them to a 1v1 Code Battle.
        </p>

        <div id="onlineUsersList">
          Loading online users...
        </div>
      </div>

      <div class="card">
        <h2>Battle Requests</h2>
        <p class="lesson-description">
          Challenge requests sent to you will appear here.
        </p>

        <div id="battleRequestsList">
          Loading requests...
        </div>
      </div>
    </div>

    <div class="card">
      <h2>How it works</h2>
      <p class="lesson-description">
        1. Wait for another student to go online.<br>
        2. Click Challenge beside their name.<br>
        3. The other student must accept your challenge.<br>
        4. Both of you will enter the same Battle Room.<br>
        5. You will answer the same coding scenarios within 3 minutes.<br>
        6. The player with the higher score wins.
      </p>
    </div>
  `;
}

function listenOnlineUsers() {
  const onlineUsersRef = collection(db, "onlineUsers");

  onSnapshot(onlineUsersRef, (snapshot) => {
    const onlineUsersList = document.getElementById("onlineUsersList");

    if (!onlineUsersList) return;

    let html = "";
    const now = Date.now();

    snapshot.forEach((docSnap) => {
      const user = docSnap.data();

      if (user.userId === currentUser.uid) {
        return;
      }

      const isRecentlyActive = user.lastActiveMs && now - user.lastActiveMs <= 60000;

      if (user.status !== "online" || !isRecentlyActive) {
        return;
      }

      html += `
        <div class="online-user-card">
          <div>
            <h3>${escapeHTML(user.name || "Student")}</h3>
            <p>${escapeHTML(user.email || "")}</p>
          </div>

          <button 
            class="btn challengeBtn" 
            type="button"
            data-user-id="${escapeHTML(user.userId)}"
            data-name="${escapeHTML(user.name || "Student")}"
            data-email="${escapeHTML(user.email || "")}"
          >
            Challenge
          </button>
        </div>
      `;
    });

    if (!html) {
      html = `
        <p class="message">
          No other online students yet. Ask another student to open this page.
        </p>
      `;
    }

    onlineUsersList.innerHTML = html;
    setupChallengeButtons();
  });
}

function setupChallengeButtons() {
  const buttons = document.querySelectorAll(".challengeBtn");

  buttons.forEach((button) => {
    button.addEventListener("click", async () => {
      const toUserId = button.dataset.userId;
      const toName = button.dataset.name;
      const toEmail = button.dataset.email;

      button.disabled = true;
      button.textContent = "Sending...";

      await addDoc(collection(db, "battleRequests"), {
        fromUserId: currentUser.uid,
        fromName: getDisplayName(),
        fromEmail: currentUser.email,

        toUserId,
        toName,
        toEmail,

        status: "pending",
        roomId: "",
        createdAt: serverTimestamp(),
        createdAtMs: Date.now()
      });

      button.textContent = "Challenge Sent";
    });
  });
}

function listenBattleRequests() {
  const requestsRef = collection(db, "battleRequests");

  onSnapshot(requestsRef, (snapshot) => {
    const incomingRequests = [];
    const outgoingRequests = [];

    snapshot.forEach((docSnap) => {
      const request = {
        id: docSnap.id,
        ...docSnap.data()
      };

      if (
        request.toUserId === currentUser.uid &&
        request.status === "pending"
      ) {
        incomingRequests.push(request);
      }

      if (
        request.fromUserId === currentUser.uid &&
        request.status === "pending"
      ) {
        outgoingRequests.push(request);
      }

      if (
        request.fromUserId === currentUser.uid &&
        request.status === "accepted" &&
        request.roomId &&
        !alreadyRedirected &&
        !sessionStorage.getItem("leftBattleRoom_" + request.roomId)
      ) {
        alreadyRedirected = true;
        window.location.href = `battle_room.html?roomId=${request.roomId}`;
      }
    });

    renderRequests(incomingRequests, outgoingRequests);
  });
}

function renderRequests(incomingRequests, outgoingRequests) {
  const battleRequestsList = document.getElementById("battleRequestsList");

  if (!battleRequestsList) return;

  let html = "";

  if (incomingRequests.length > 0) {
    html += `<h3>Incoming Challenges</h3>`;

    incomingRequests.forEach((request) => {
      html += `
        <div class="request-card">
          <div>
            <h3>${escapeHTML(request.fromName || "Student")}</h3>
            <p>wants to battle with you.</p>
          </div>

          <div>
            <button 
              class="btn success acceptRequestBtn" 
              type="button"
              data-request-id="${escapeHTML(request.id)}"
              data-from-user-id="${escapeHTML(request.fromUserId)}"
              data-from-name="${escapeHTML(request.fromName || "Student")}"
              data-from-email="${escapeHTML(request.fromEmail || "")}"
            >
              Accept
            </button>

            <button 
              class="btn danger declineRequestBtn" 
              type="button"
              data-request-id="${escapeHTML(request.id)}"
            >
              Decline
            </button>
          </div>
        </div>
      `;
    });
  }

  if (outgoingRequests.length > 0) {
    html += `<h3>Sent Challenges</h3>`;

    outgoingRequests.forEach((request) => {
      html += `
        <div class="request-card">
          <div>
            <h3>${escapeHTML(request.toName || "Student")}</h3>
            <p>Waiting for response...</p>
          </div>

          <button 
            class="btn secondary cancelRequestBtn" 
            type="button"
            data-request-id="${escapeHTML(request.id)}"
          >
            Cancel
          </button>
        </div>
      `;
    });
  }

  if (!html) {
    html = `
      <p class="message">
        No battle requests yet.
      </p>
    `;
  }

  battleRequestsList.innerHTML = html;
  setupRequestButtons();
}

function setupRequestButtons() {
  const acceptButtons = document.querySelectorAll(".acceptRequestBtn");
  const declineButtons = document.querySelectorAll(".declineRequestBtn");
  const cancelButtons = document.querySelectorAll(".cancelRequestBtn");

  acceptButtons.forEach((button) => {
    button.addEventListener("click", async () => {
      const requestId = button.dataset.requestId;
      const fromUserId = button.dataset.fromUserId;
      const fromName = button.dataset.fromName;
      const fromEmail = button.dataset.fromEmail;

      button.disabled = true;
      button.textContent = "Accepting...";

      const roomId = "room_" + requestId;
      const startAtMs = Date.now() + 5000;
      const endAtMs = startAtMs + 180000;

      sessionStorage.removeItem("leftBattleRoom_" + roomId);

      await setDoc(doc(db, "battleRooms", roomId), {
        roomId,
        requestId,
        status: "active",

        player1Id: fromUserId,
        player1Name: fromName,
        player1Email: fromEmail,
        player1Score: 0,
        player1Correct: 0,
        player1Wrong: 0,
        player1HighestMultiplier: 1,

        player2Id: currentUser.uid,
        player2Name: getDisplayName(),
        player2Email: currentUser.email,
        player2Score: 0,
        player2Correct: 0,
        player2Wrong: 0,
        player2HighestMultiplier: 1,

        startAtMs,
        endAtMs,
        createdAt: serverTimestamp()
      });

      await updateDoc(doc(db, "battleRequests", requestId), {
        status: "accepted",
        roomId,
        acceptedAt: serverTimestamp()
      });

      window.location.href = `battle_room.html?roomId=${roomId}`;
    });
  });

  declineButtons.forEach((button) => {
    button.addEventListener("click", async () => {
      const requestId = button.dataset.requestId;

      await updateDoc(doc(db, "battleRequests", requestId), {
        status: "declined",
        declinedAt: serverTimestamp()
      });
    });
  });

  cancelButtons.forEach((button) => {
    button.addEventListener("click", async () => {
      const requestId = button.dataset.requestId;

      await updateDoc(doc(db, "battleRequests", requestId), {
        status: "cancelled",
        cancelledAt: serverTimestamp()
      });
    });
  });
}
