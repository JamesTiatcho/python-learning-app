// code_battle.js

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
  setDoc,
  collection,
  getDocs,
  query,
  orderBy,
  limit,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";

const PYODIDE_BASE_URL = "https://cdn.jsdelivr.net/pyodide/v0.26.4/full/";

let pyodide = null;

let battleState = {
  user: null,
  profile: null,
  started: false,
  finished: false,
  timeLeft: 180,
  timer: null,
  currentChallenge: null,
  score: 0,
  correctCount: 0,
  wrongCount: 0,
  multiplier: 1,
  highestMultiplier: 1
};

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
  },

  {
    id: "simple_greeting_function",
    title: "Greeting Function",
    scenario: `Create a Python function named greet.

Instructions:
1. Create a function named greet.
2. Inside the function, print "Hello, Python".
3. Call the function.

Expected Output:
Hello, Python`,
    starter: `# Type your answer here
`,
    checks: ["def", "greet", "print(", "greet()"],
    outputMustContain: ["Hello", "Python"],
    sampleAnswer: `def greet():
    print("Hello, Python")

greet()`
  },

  {
    id: "list_loop_fruits",
    title: "Print Items in a List",
    scenario: `Create a Python program that prints all fruits in a list.

Instructions:
1. Create a list named fruits.
2. Add "Apple", "Banana", and "Mango".
3. Use a for loop.
4. Print each fruit.

Expected Output:
Apple
Banana
Mango`,
    starter: `# Type your answer here
`,
    checks: ["fruits", "for", "print("],
    outputMustContain: ["Apple", "Banana", "Mango"],
    sampleAnswer: `fruits = ["Apple", "Banana", "Mango"]

for fruit in fruits:
    print(fruit)`
  },

  {
    id: "countdown_loop",
    title: "Countdown Loop",
    scenario: `Create a Python program that prints a countdown from 5 to 1.

Instructions:
1. Use a for loop.
2. Use range().
3. Print 5, 4, 3, 2, 1.

Expected Output:
5
4
3
2
1`,
    starter: `# Type your answer here
`,
    checks: ["for", "range", "print("],
    outputMustContain: ["5", "4", "3", "2", "1"],
    sampleAnswer: `for number in range(5, 0, -1):
    print(number)`
  }
];

renderLayout("code_battle");

requireLogin(async (user, profile) => {
  setLoggedUserName(profile);

  battleState.user = user;
  battleState.profile = profile;

  await renderCodeBattle();
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

async function renderCodeBattle() {
  const content = document.getElementById("content");

  const leaderboardHTML = await getBattleLeaderboardHTML();

  content.innerHTML = `
    <header class="hero">
      <p class="tag">Non-Bearing Activity</p>
      <h2>Python Code Battle</h2>
      <p>
        A 3-minute coding challenge where students compete for the highest score.
        This does not affect the Final Quiz or Certificate.
      </p>
    </header>

    <div class="grid">
      <div class="card">
        <h2>Battle Rules</h2>

        <p class="lesson-description">
          You will be given random Python coding scenarios.
          Run your code and submit your answer before the timer ends.

          Scoring:
          Correct answer = 10 points × multiplier
          Consecutive correct answers increase the multiplier.
          Wrong answers reset the multiplier to 1x.
        </p>

        <div class="battle-stats">
          <div>
            <span>Time</span>
            <strong id="battleTimer">03:00</strong>
          </div>

          <div>
            <span>Score</span>
            <strong id="battleScore">0</strong>
          </div>

          <div>
            <span>Multiplier</span>
            <strong id="battleMultiplier">1x</strong>
          </div>
        </div>

        <button class="btn success" id="startBattleBtn" type="button">
          Start Battle
        </button>
      </div>

      <div class="card">
        <h2>Battle Leaderboard</h2>
        ${leaderboardHTML}
      </div>
    </div>

    <div class="card" id="battleArea">
      <h2>Ready to Battle?</h2>
      <p>Click Start Battle to begin the 3-minute challenge.</p>
    </div>
  `;

  const startBattleBtn = document.getElementById("startBattleBtn");

  startBattleBtn.addEventListener("click", () => {
    startBattle();
  });
}

function startBattle() {
  battleState.started = true;
  battleState.finished = false;
  battleState.timeLeft = 180;
  battleState.score = 0;
  battleState.correctCount = 0;
  battleState.wrongCount = 0;
  battleState.multiplier = 1;
  battleState.highestMultiplier = 1;

  updateBattleStats();
  loadNextChallenge();

  const startBattleBtn = document.getElementById("startBattleBtn");
  startBattleBtn.disabled = true;
  startBattleBtn.textContent = "Battle Started";

  battleState.timer = setInterval(() => {
    battleState.timeLeft--;
    updateBattleStats();

    if (battleState.timeLeft <= 0) {
      finishBattle();
    }
  }, 1000);
}

function updateBattleStats() {
  const timerEl = document.getElementById("battleTimer");
  const scoreEl = document.getElementById("battleScore");
  const multiplierEl = document.getElementById("battleMultiplier");

  if (timerEl) {
    const minutes = Math.floor(battleState.timeLeft / 60);
    const seconds = battleState.timeLeft % 60;

    timerEl.textContent =
      String(minutes).padStart(2, "0") + ":" + String(seconds).padStart(2, "0");
  }

  if (scoreEl) {
    scoreEl.textContent = battleState.score;
  }

  if (multiplierEl) {
    multiplierEl.textContent = battleState.multiplier + "x";
  }
}

function getRandomChallenge() {
  const randomIndex = Math.floor(Math.random() * battleChallenges.length);
  return battleChallenges[randomIndex];
}

function loadNextChallenge() {
  if (battleState.finished) return;

  const challenge = getRandomChallenge();
  battleState.currentChallenge = challenge;

  const battleArea = document.getElementById("battleArea");

  battleArea.innerHTML = `
    <div class="code-challenge-box">
      <div class="challenge-header">
        <h3>${escapeHTML(challenge.title)}</h3>
        <span class="badge ready">Multiplier: ${battleState.multiplier}x</span>
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
        <button class="btn orange" id="runBattleCodeBtn" type="button">
          Run Code
        </button>

        <button class="btn success" id="submitBattleAnswerBtn" type="button">
          Submit Answer
        </button>

        <button class="btn secondary" id="skipBattleQuestionBtn" type="button">
          Skip
        </button>
      </div>

      <h4>Output</h4>
      <pre id="battleOutput" class="code-output">Click Run Code to see the output.</pre>

      <div id="battleFeedback"></div>
    </div>
  `;

  setupNoCopyPaste();
  setupBattleButtons();
}

function setupBattleButtons() {
  const runBtn = document.getElementById("runBattleCodeBtn");
  const submitBtn = document.getElementById("submitBattleAnswerBtn");
  const skipBtn = document.getElementById("skipBattleQuestionBtn");

  runBtn.addEventListener("click", async () => {
    const code = document.getElementById("battleCode").value.trim();
    const outputBox = document.getElementById("battleOutput");

    if (!code) {
      alert("Please type your Python code first.");
      return;
    }

    try {
      runBtn.disabled = true;
      runBtn.textContent = "Running...";
      outputBox.textContent = "Loading Python runner. Please wait...";

      const output = await runPythonCode(code);
      outputBox.textContent = output;

    } catch (error) {
      console.error(error);
      outputBox.textContent = error.message;

    } finally {
      runBtn.disabled = false;
      runBtn.textContent = "Run Code";
    }
  });

  submitBtn.addEventListener("click", async () => {
    await submitBattleAnswer();
  });

  skipBtn.addEventListener("click", () => {
    battleState.multiplier = 1;
    battleState.wrongCount++;
    updateBattleStats();
    loadNextChallenge();
  });
}

async function submitBattleAnswer() {
  const code = document.getElementById("battleCode").value.trim();
  const outputBox = document.getElementById("battleOutput");
  const feedbackBox = document.getElementById("battleFeedback");
  const challenge = battleState.currentChallenge;

  if (!code) {
    alert("Please type your Python code first.");
    return;
  }

  outputBox.textContent = "Running and checking...";

  try {
    const output = await runPythonCode(code);
    outputBox.textContent = output;

    const correct = checkAnswer(challenge, code, output);

    if (correct) {
      const earnedPoints = 10 * battleState.multiplier;

      battleState.score += earnedPoints;
      battleState.correctCount++;
      battleState.multiplier++;

      if (battleState.multiplier > battleState.highestMultiplier) {
        battleState.highestMultiplier = battleState.multiplier;
      }

      feedbackBox.innerHTML = `
        <div class="battle-feedback correct">
          Correct! You earned ${earnedPoints} points.
        </div>
      `;

      updateBattleStats();

      setTimeout(() => {
        loadNextChallenge();
      }, 900);

    } else {
      battleState.wrongCount++;
      battleState.multiplier = 1;

      feedbackBox.innerHTML = `
        <div class="battle-feedback wrong">
          Wrong answer. Multiplier reset to 1x.

          <div class="answer-key-box">
            <h4>Correct Answer</h4>
            <pre><code>${escapeHTML(challenge.sampleAnswer)}</code></pre>
          </div>
        </div>
      `;

      updateBattleStats();

      setTimeout(() => {
        loadNextChallenge();
      }, 2500);
    }

  } catch (error) {
    console.error(error);
    outputBox.textContent = error.message;
  }
}

function checkAnswer(challenge, code, output) {
  const normalizedCode = code.toLowerCase();
  const normalizedOutput = output.toLowerCase();

  const hasRequiredCode = challenge.checks.every((check) => {
    return normalizedCode.includes(check.toLowerCase());
  });

  let outputCorrect = true;

  if (challenge.outputMustContain) {
    outputCorrect = challenge.outputMustContain.every((word) => {
      return normalizedOutput.includes(word.toLowerCase());
    });
  }

  return hasRequiredCode && outputCorrect;
}

async function finishBattle() {
  if (battleState.finished) return;

  battleState.finished = true;
  clearInterval(battleState.timer);

  await saveBattleResult();

  const battleArea = document.getElementById("battleArea");

  battleArea.innerHTML = `
    <div class="card">
      <h2>Battle Finished</h2>

      <div class="battle-result-grid">
        <div>
          <span>Final Score</span>
          <strong>${battleState.score}</strong>
        </div>

        <div>
          <span>Correct</span>
          <strong>${battleState.correctCount}</strong>
        </div>

        <div>
          <span>Wrong / Skipped</span>
          <strong>${battleState.wrongCount}</strong>
        </div>

        <div>
          <span>Highest Multiplier</span>
          <strong>${battleState.highestMultiplier}x</strong>
        </div>
      </div>

      <p class="lesson-description">
        This Code Battle is non-bearing. It is only for practice and friendly competition.
      </p>

      <button class="btn" onclick="location.reload()" type="button">
        Play Again
      </button>
    </div>
  `;
}

async function saveBattleResult() {
  const user = battleState.user;
  const profile = battleState.profile;

  const battleRef = doc(db, "codeBattles", user.uid);
  const battleSnap = await getDoc(battleRef);
  const oldData = battleSnap.exists() ? battleSnap.data() : null;

  const oldBestScore = oldData?.bestScore || 0;
  const newBestScore = Math.max(oldBestScore, battleState.score);

  await setDoc(battleRef, {
    userId: user.uid,
    userName: profile?.name || user.displayName || user.email,
    email: user.email,
    bestScore: newBestScore,
    latestScore: battleState.score,
    correctCount: battleState.correctCount,
    wrongCount: battleState.wrongCount,
    highestMultiplier: battleState.highestMultiplier,
    attempts: (oldData?.attempts || 0) + 1,
    lastPlayedAt: serverTimestamp()
  }, { merge: true });
}

async function getBattleLeaderboardHTML() {
  const q = query(
    collection(db, "codeBattles"),
    orderBy("bestScore", "desc"),
    limit(10)
  );

  const snapshot = await getDocs(q);

  let rows = "";
  let rank = 1;

  snapshot.forEach((docSnap) => {
    const data = docSnap.data();

    rows += `
      <tr>
        <td>${rank}</td>
        <td>${escapeHTML(data.userName || "Student")}</td>
        <td>${data.bestScore || 0}</td>
        <td>${data.highestMultiplier || 1}x</td>
      </tr>
    `;

    rank++;
  });

  if (!rows) {
    rows = `
      <tr>
        <td colspan="4">No battle scores yet.</td>
      </tr>
    `;
  }

  return `
    <table>
      <tr>
        <th>Rank</th>
        <th>Name</th>
        <th>Best Score</th>
        <th>Best Multiplier</th>
      </tr>
      ${rows}
    </table>
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
    alert("Copying is disabled during Code Battle.");
  });

  codeArea.addEventListener("cut", (event) => {
    event.preventDefault();
    alert("Cut is disabled during Code Battle.");
  });

  codeArea.addEventListener("drop", (event) => {
    event.preventDefault();
    alert("Drag and drop is disabled.");
  });

  codeArea.addEventListener("contextmenu", (event) => {
    event.preventDefault();
  });

  codeArea.addEventListener("keydown", (event) => {
    const key = event.key.toLowerCase();

    if ((event.ctrlKey || event.metaKey) && ["v", "c", "x"].includes(key)) {
      event.preventDefault();
      alert("Copy, paste, and cut shortcuts are disabled during Code Battle.");
    }
  });
}