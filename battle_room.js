// battle_room.js

import { db } from "./firebase-config.js";
import {
  requireLogin,
  renderLayout,
  setLoggedUserName,
  escapeHTML
} from "./main.js";

import {
  doc,
  getDoc,
  updateDoc,
  onSnapshot,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";

const PYODIDE_BASE_URL = "https://cdn.jsdelivr.net/pyodide/v0.26.4/full/";

let pyodide = null;
let currentUser = null;
let currentProfile = null;
let currentRoom = null;
let roomId = null;
let currentChallengeIndex = 0;
let localMultiplier = 1;
let localHighestMultiplier = 1;
let localTimer = null;
let alreadyFinished = false;

const battleChallenges = [
  {
    id: "multiply_function",
    title: "Multiplier Function",
    scenario: `Create a Python function named multiply.

Instructions:
1. Create a function named multiply.
2. The function should accept two numbers.
3. Print the product of the two numbers.
4. Call the function using 5 and 3.

Expected Output:
15`,
    starter: `# Type your answer here
`,
    checks: ["def", "multiply", "*", "print(", "multiply("],
    outputMustContain: ["15"],
    sampleAnswer: `def multiply(a, b):
    print(a * b)

multiply(5, 3)`
  },

  {
    id: "even_odd_checker",
    title: "Even or Odd Checker",
    scenario: `Create a Python program that checks if a number is even or odd.

Instructions:
1. Create a variable named number.
2. Assign the value 4.
3. If the number is divisible by 2, print "Even".
4. Otherwise, print "Odd".

Expected Output:
Even`,
    starter: `# Type your answer here
`,
    checks: ["number", "if", "%", "2", "else", "print("],
    outputMustContain: ["Even"],
    sampleAnswer: `number = 4

if number % 2 == 0:
    print("Even")
else:
    print("Odd")`
  },

  {
    id: "loop_one_to_five",
    title: "Loop Numbers 1 to 5",
    scenario: `Create a Python program that prints numbers from 1 to 5.

Instructions:
1. Use a for loop.
2. Use range().
3. Print each number.

Expected Output:
1
2
3
4
5`,
    starter: `# Type your answer here
`,
    checks: ["for", "range", "print("],
    outputMustContain: ["1", "2", "3", "4", "5"],
    sampleAnswer: `for number in range(1, 6):
    print(number)`
  },

  {
    id: "grade_checker",
    title: "Grade Checker",
    scenario: `Create a Python program that checks if a grade is passed or failed.

Instructions:
1. Create a variable named grade.
2. Assign the value 82.
3. If grade is 75 or above, print "Passed".
4. Otherwise, print "Failed".

Expected Output:
Passed`,
    starter: `# Type your answer here
`,
    checks: ["grade", "if", ">=", "75", "else", "print("],
    outputMustContain: ["Passed"],
    sampleAnswer: `grade = 82

if grade >= 75:
    print("Passed")
else:
    print("Failed")`
  },

  {
    id: "sum_numbers_loop",
    title: "Sum Numbers using Loop",
    scenario: `Create a Python program that gets the total of numbers 1 to 5.

Instructions:
1. Create a variable named total with value 0.
2. Use a for loop with range().
3. Add each number to total.
4. Print total.

Expected Output:
15`,
    starter: `# Type your answer here
`,
    checks: ["total", "for", "range", "+", "print("],
    outputMustContain: ["15"],
    sampleAnswer: `total = 0

for number in range(1, 6):
    total = total + number

print(total)`
  }
];

renderLayout("battle_lobby");

requireLogin(async (user, profile) => {
  currentUser = user;
  currentProfile = profile;

  setLoggedUserName(profile);

  const params = new URLSearchParams(window.location.search);
  roomId = params.get("roomId");

  if (!roomId) {
    showRoomError("No battle room found.");
    return;
  }

  await loadBattleRoom();
});

function formatText(text) {
  return escapeHTML(text).replace(/\n/g, "<br>");
}

async function loadPythonRunner() {
  if (!pyodide) {
    if (typeof globalThis.loadPyodide !== "function") {
      throw new Error("Python runner failed to load. Please check your internet connection.");
    }

    pyodide = await globalThis.loadPyodide({
      indexURL: PYODIDE_BASE_URL
    });
  }

  return pyodide;
}

async function runPythonCode(code) {
  const runner = await loadPythonRunner();

  runner.globals.set("user_code", code);

  const output = await runner.runPythonAsync(`
import sys
import io
import traceback

old_stdout = sys.stdout
old_stderr = sys.stderr

sys.stdout = io.StringIO()
sys.stderr = io.StringIO()

try:
    exec(user_code)
    result = sys.stdout.getvalue()
    error_result = sys.stderr.getvalue()

    if error_result:
        result += error_result

except Exception:
    result = traceback.format_exc()

finally:
    sys.stdout = old_stdout
    sys.stderr = old_stderr

result
  `);

  return output || "No output.";
}

async function loadBattleRoom() {
  const roomRef = doc(db, "battleRooms", roomId);
  const roomSnap = await getDoc(roomRef);

  if (!roomSnap.exists()) {
    showRoomError("Battle room does not exist.");
    return;
  }

  currentRoom = roomSnap.data();

  const isPlayer =
    currentUser.uid === currentRoom.player1Id ||
    currentUser.uid === currentRoom.player2Id;

  if (!isPlayer) {
    showRoomError("You are not part of this battle room.");
    return;
  }

  renderBattleRoom(currentRoom);
  listenBattleRoom();
  startLocalTimer();
}

function listenBattleRoom() {
  const roomRef = doc(db, "battleRooms", roomId);

  onSnapshot(roomRef, (snapshot) => {
    if (!snapshot.exists()) {
      showRoomError("Battle room was deleted.");
      return;
    }

    currentRoom = snapshot.data();

    updateScoreDisplay(currentRoom);

    if (currentRoom.status === "finished") {
      showFinishedBattle(currentRoom);
    }
  });
}

function renderBattleRoom(room) {
  const content = document.getElementById("content");

  const myPlayerNumber = getMyPlayerNumber(room);
  const opponentName = myPlayerNumber === 1 ? room.player2Name : room.player1Name;

  content.innerHTML = `
    <header class="hero">
      <p class="tag">Live 1v1 Battle</p>
      <h2>Battle Room</h2>
      <p>
        You are battling against <strong>${escapeHTML(opponentName || "Opponent")}</strong>.
        Answer as many coding challenges as you can within 3 minutes.
      </p>
    </header>

    <div class="battle-timer-box">
      <p>Time Remaining</p>
      <strong id="battleTimer">03:00</strong>
    </div>

    <div class="battle-room-grid">
      <div class="player-score-card ${myPlayerNumber === 1 ? "active-player" : ""}">
        <h3>${escapeHTML(room.player1Name || "Player 1")}</h3>
        <strong id="player1Score">${room.player1Score || 0}</strong>
        <p>Correct: <span id="player1Correct">${room.player1Correct || 0}</span></p>
        <p>Wrong: <span id="player1Wrong">${room.player1Wrong || 0}</span></p>
      </div>

      <div class="player-score-card ${myPlayerNumber === 2 ? "active-player" : ""}">
        <h3>${escapeHTML(room.player2Name || "Player 2")}</h3>
        <strong id="player2Score">${room.player2Score || 0}</strong>
        <p>Correct: <span id="player2Correct">${room.player2Correct || 0}</span></p>
        <p>Wrong: <span id="player2Wrong">${room.player2Wrong || 0}</span></p>
      </div>
    </div>

    <div class="card">
      <div class="battle-stats">
        <div>
          <span>Your Multiplier</span>
          <strong id="localMultiplier">1x</strong>
        </div>

        <div>
          <span>Question</span>
          <strong id="questionNumber">1</strong>
        </div>

        <div>
          <span>Status</span>
          <strong id="battleStatus">Active</strong>
        </div>
      </div>
    </div>

    <div class="card" id="battleQuestionArea"></div>
  `;

  loadChallenge();
}

function getMyPlayerNumber(room) {
  if (currentUser.uid === room.player1Id) {
    return 1;
  }

  return 2;
}

function updateScoreDisplay(room) {
  const player1Score = document.getElementById("player1Score");
  const player2Score = document.getElementById("player2Score");
  const player1Correct = document.getElementById("player1Correct");
  const player2Correct = document.getElementById("player2Correct");
  const player1Wrong = document.getElementById("player1Wrong");
  const player2Wrong = document.getElementById("player2Wrong");

  if (player1Score) player1Score.textContent = room.player1Score || 0;
  if (player2Score) player2Score.textContent = room.player2Score || 0;
  if (player1Correct) player1Correct.textContent = room.player1Correct || 0;
  if (player2Correct) player2Correct.textContent = room.player2Correct || 0;
  if (player1Wrong) player1Wrong.textContent = room.player1Wrong || 0;
  if (player2Wrong) player2Wrong.textContent = room.player2Wrong || 0;
}

function startLocalTimer() {
  if (localTimer) {
    clearInterval(localTimer);
  }

  localTimer = setInterval(async () => {
    if (!currentRoom || alreadyFinished) return;

    const timeLeft = Math.max(0, currentRoom.endAtMs - Date.now());

    const timerEl = document.getElementById("battleTimer");

    if (timerEl) {
      const totalSeconds = Math.floor(timeLeft / 1000);
      const minutes = Math.floor(totalSeconds / 60);
      const seconds = totalSeconds % 60;

      timerEl.textContent =
        String(minutes).padStart(2, "0") + ":" + String(seconds).padStart(2, "0");
    }

    if (timeLeft <= 0 && currentRoom.status !== "finished") {
      await finishBattle();
    }
  }, 1000);
}

function getCurrentChallenge() {
  return battleChallenges[currentChallengeIndex % battleChallenges.length];
}

function loadChallenge() {
  const area = document.getElementById("battleQuestionArea");

  if (!area) return;

  const challenge = getCurrentChallenge();

  const questionNumber = document.getElementById("questionNumber");
  const localMultiplierEl = document.getElementById("localMultiplier");

  if (questionNumber) questionNumber.textContent = currentChallengeIndex + 1;
  if (localMultiplierEl) localMultiplierEl.textContent = localMultiplier + "x";

  area.innerHTML = `
    <div class="code-challenge-box">
      <div class="challenge-header">
        <h3>${escapeHTML(challenge.title)}</h3>
        <span class="badge ready">Multiplier: ${localMultiplier}x</span>
      </div>

      <p class="lesson-description">${formatText(challenge.scenario)}</p>

      <textarea
        id="battleCode"
        class="challenge-code-area"
        autocomplete="off"
        autocorrect="off"
        autocapitalize="off"
        spellcheck="false"
      >${escapeHTML(challenge.starter)}</textarea>

      <div class="practice-buttons">
        <button class="btn orange" id="runCodeBtn" type="button">Run Code</button>
        <button class="btn success" id="submitAnswerBtn" type="button">Submit Answer</button>
        <button class="btn secondary" id="skipBtn" type="button">Skip</button>
      </div>

      <h4>Output</h4>
      <pre id="battleOutput" class="code-output">Click Run Code to see output.</pre>

      <div id="battleFeedback"></div>
    </div>
  `;

  setupNoCopyPaste();
  setupButtons();
}

function setupButtons() {
  const runCodeBtn = document.getElementById("runCodeBtn");
  const submitAnswerBtn = document.getElementById("submitAnswerBtn");
  const skipBtn = document.getElementById("skipBtn");

  runCodeBtn.addEventListener("click", async () => {
    const code = document.getElementById("battleCode").value.trim();
    const outputBox = document.getElementById("battleOutput");

    if (!code) {
      alert("Please type your code first.");
      return;
    }

    try {
      runCodeBtn.disabled = true;
      runCodeBtn.textContent = "Running...";
      outputBox.textContent = "Loading Python runner. Please wait...";

      const output = await runPythonCode(code);
      outputBox.textContent = output;

    } catch (error) {
      outputBox.textContent = error.message;

    } finally {
      runCodeBtn.disabled = false;
      runCodeBtn.textContent = "Run Code";
    }
  });

  submitAnswerBtn.addEventListener("click", async () => {
    await submitAnswer();
  });

  skipBtn.addEventListener("click", async () => {
    localMultiplier = 1;
    await updateMyScore(false, 0);
    currentChallengeIndex++;
    loadChallenge();
  });
}

async function submitAnswer() {
  const code = document.getElementById("battleCode").value.trim();
  const outputBox = document.getElementById("battleOutput");
  const feedbackBox = document.getElementById("battleFeedback");

  if (!code) {
    alert("Please type your code first.");
    return;
  }

  const challenge = getCurrentChallenge();

  try {
    outputBox.textContent = "Running and checking...";

    const output = await runPythonCode(code);
    outputBox.textContent = output;

    const correct = checkAnswer(challenge, code, output);

    if (correct) {
      const earnedPoints = 10 * localMultiplier;

      feedbackBox.innerHTML = `
        <div class="battle-feedback correct">
          Correct! You earned ${earnedPoints} points.
        </div>
      `;

      await updateMyScore(true, earnedPoints);

      localMultiplier++;

      if (localMultiplier > localHighestMultiplier) {
        localHighestMultiplier = localMultiplier;
      }

      currentChallengeIndex++;

      setTimeout(() => {
        loadChallenge();
      }, 800);

    } else {
      feedbackBox.innerHTML = `
        <div class="battle-feedback wrong">
          Wrong answer. Multiplier reset to 1x.

          <div class="answer-key-box">
            <h4>Correct Answer</h4>
            <pre><code>${escapeHTML(challenge.sampleAnswer)}</code></pre>
          </div>
        </div>
      `;

      localMultiplier = 1;
      await updateMyScore(false, 0);

      currentChallengeIndex++;

      setTimeout(() => {
        loadChallenge();
      }, 2200);
    }

  } catch (error) {
    outputBox.textContent = error.message;
  }
}

function checkAnswer(challenge, code, output) {
  const normalizedCode = code.toLowerCase();
  const normalizedOutput = output.toLowerCase();

  const hasRequiredCode = challenge.checks.every((check) => {
    return normalizedCode.includes(check.toLowerCase());
  });

  const hasRequiredOutput = challenge.outputMustContain.every((text) => {
    return normalizedOutput.includes(text.toLowerCase());
  });

  return hasRequiredCode && hasRequiredOutput;
}

async function updateMyScore(isCorrect, earnedPoints) {
  const roomRef = doc(db, "battleRooms", roomId);
  const roomSnap = await getDoc(roomRef);

  if (!roomSnap.exists()) return;

  const room = roomSnap.data();
  const playerNumber = getMyPlayerNumber(room);

  if (playerNumber === 1) {
    await updateDoc(roomRef, {
      player1Score: (room.player1Score || 0) + earnedPoints,
      player1Correct: (room.player1Correct || 0) + (isCorrect ? 1 : 0),
      player1Wrong: (room.player1Wrong || 0) + (isCorrect ? 0 : 1),
      player1HighestMultiplier: Math.max(room.player1HighestMultiplier || 1, localHighestMultiplier),
      updatedAt: serverTimestamp()
    });
  } else {
    await updateDoc(roomRef, {
      player2Score: (room.player2Score || 0) + earnedPoints,
      player2Correct: (room.player2Correct || 0) + (isCorrect ? 1 : 0),
      player2Wrong: (room.player2Wrong || 0) + (isCorrect ? 0 : 1),
      player2HighestMultiplier: Math.max(room.player2HighestMultiplier || 1, localHighestMultiplier),
      updatedAt: serverTimestamp()
    });
  }
}

async function finishBattle() {
  if (alreadyFinished) return;

  alreadyFinished = true;

  const roomRef = doc(db, "battleRooms", roomId);
  const roomSnap = await getDoc(roomRef);

  if (!roomSnap.exists()) return;

  const room = roomSnap.data();

  let winner = "draw";

  if ((room.player1Score || 0) > (room.player2Score || 0)) {
    winner = room.player1Id;
  } else if ((room.player2Score || 0) > (room.player1Score || 0)) {
    winner = room.player2Id;
  }

  await updateDoc(roomRef, {
    status: "finished",
    winner,
    finishedAt: serverTimestamp()
  });
}

function showFinishedBattle(room) {
  clearInterval(localTimer);

  const area = document.getElementById("battleQuestionArea");
  const statusEl = document.getElementById("battleStatus");

  if (statusEl) {
    statusEl.textContent = "Finished";
  }

  if (!area) return;

  let resultClass = "draw";
  let resultText = "It's a draw!";

  if (room.winner === currentUser.uid) {
    resultClass = "win";
    resultText = "You Win!";
  } else if (room.winner && room.winner !== "draw") {
    resultClass = "lose";
    resultText = "You Lose!";
  }

  area.innerHTML = `
    <div class="battle-result-box ${resultClass}">
      <h2>${resultText}</h2>
      <p>
        ${escapeHTML(room.player1Name)} Score: <strong>${room.player1Score || 0}</strong>
        <br>
        ${escapeHTML(room.player2Name)} Score: <strong>${room.player2Score || 0}</strong>
      </p>

      <a class="btn" href="battle_lobby.html">Back to Lobby</a>
    </div>
  `;
}

function setupNoCopyPaste() {
  const codeArea = document.getElementById("battleCode");

  if (!codeArea) return;

  codeArea.addEventListener("paste", (event) => {
    event.preventDefault();
    alert("Copy-paste is disabled. Please type your code manually.");
  });

  codeArea.addEventListener("copy", (event) => {
    event.preventDefault();
  });

  codeArea.addEventListener("cut", (event) => {
    event.preventDefault();
  });

  codeArea.addEventListener("drop", (event) => {
    event.preventDefault();
  });

  codeArea.addEventListener("contextmenu", (event) => {
    event.preventDefault();
  });

  codeArea.addEventListener("keydown", (event) => {
    const key = event.key.toLowerCase();

    if ((event.ctrlKey || event.metaKey) && ["v", "c", "x"].includes(key)) {
      event.preventDefault();
      alert("Copy, paste, and cut shortcuts are disabled during battle.");
    }
  });
}

function showRoomError(message) {
  const content = document.getElementById("content");

  if (!content) return;

  content.innerHTML = `
    <div class="card">
      <h2>Battle Room Error</h2>
      <p>${escapeHTML(message)}</p>
      <a class="btn" href="battle_lobby.html">Back to Lobby</a>
    </div>
  `;
}
