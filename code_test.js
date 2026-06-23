// code_test.js

import { db } from "./firebase-config.js";
import { lessonOrder, lessons } from "./data.js";
import {
  requireLogin,
  renderLayout,
  setLoggedUserName,
  getProgress,
  escapeHTML
} from "./main.js";

import {
  doc,
  getDoc,
  setDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";

const PYODIDE_BASE_URL = "https://cdn.jsdelivr.net/pyodide/v0.26.4/full/";

let pyodide = null;

function formatText(text) {
  return escapeHTML(text).replace(/\n/g, "<br>");
}

const codeChallenges = [
  {
    id: "if_else_grade",
    title: "Scenario 1: Grade Checker using If-Else",
    scenario: `Create a Python program that checks if a student passed or failed.

Instructions:
1. Create a variable named grade.
2. Assign any grade value.
3. If grade is 75 or above, print "Passed".
4. Otherwise, print "Failed".`,
    starter: `# Type your answer here
`,
    checks: ["grade", "if", ">=", "75", "else", "print("],
    outputMustContainAny: ["Passed", "Failed"],
    sampleAnswer: `grade = 80

if grade >= 75:
    print("Passed")
else:
    print("Failed")`
  },

  {
    id: "loop_numbers",
    title: "Scenario 2: Print Numbers using Loop",
    scenario: `Create a Python program that prints numbers from 1 to 5.

Instructions:
1. Use a for loop.
2. Use range().
3. Print each number from 1 to 5.`,
    starter: `# Type your answer here
`,
    checks: ["for", "range", "print("],
    outputMustContain: ["1", "2", "3", "4", "5"],
    sampleAnswer: `for number in range(1, 6):
    print(number)`
  },

  {
    id: "loop_if_else_grades",
    title: "Scenario 3: Multiple Grade Checker using Loop and If-Else",
    scenario: `Create a Python program that checks multiple grades.

Instructions:
1. Create a list named grades.
2. Put at least 3 grade values inside the list.
3. Use a loop to check each grade.
4. If the grade is 75 or above, print "Passed".
5. Otherwise, print "Failed".`,
    starter: `# Type your answer here
`,
    checks: ["grades", "for", "if", ">=", "75", "else", "print("],
    outputMustContain: ["Passed", "Failed"],
    sampleAnswer: `grades = [90, 74, 88, 60, 75]

for grade in grades:
    if grade >= 75:
        print("Passed")
    else:
        print("Failed")`
  },

  {
    id: "function_greeting",
    title: "Scenario 4: Function Greeting",
    scenario: `Create a Python program that uses a function to greet a user.

Instructions:
1. Create a function named greet.
2. Inside the function, print "Hello, Student".
3. Call the function.`,
    starter: `# Type your answer here
`,
    checks: ["def", "greet", "print(", "greet()"],
    outputMustContain: ["Hello", "Student"],
    sampleAnswer: `def greet():
    print("Hello, Student")

greet()`
  },

  {
    id: "even_odd_loop",
    title: "Scenario 5: Even or Odd Checker using Loop and If-Else",
    scenario: `Create a Python program that checks if numbers are even or odd.

Instructions:
1. Create a list named numbers.
2. Put number values inside the list.
3. Use a loop to check each number.
4. If the number is divisible by 2, print "Even".
5. Otherwise, print "Odd".`,
    starter: `# Type your answer here
`,
    checks: ["numbers", "for", "if", "%", "2", "else", "print("],
    outputMustContain: ["Even", "Odd"],
    sampleAnswer: `numbers = [1, 2, 3, 4, 5]

for number in numbers:
    if number % 2 == 0:
        print("Even")
    else:
        print("Odd")`
  }
];

renderLayout("code_test");

requireLogin(async (user, profile) => {
  setLoggedUserName(profile);

  const incompleteLessonId = await getFirstIncompleteLesson(user.uid);

  if (incompleteLessonId) {
    renderLockedCodeTest(incompleteLessonId);
    return;
  }

  await renderCodeTest(user, profile);
});

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

async function getFirstIncompleteLesson(userId) {
  for (const lessonId of lessonOrder) {
    const progress = await getProgress(userId, lessonId);

    if (!progress.completed) {
      return lessonId;
    }
  }

  return null;
}

function renderLockedCodeTest(incompleteLessonId) {
  const content = document.getElementById("content");
  const incompleteLesson = lessons[incompleteLessonId];

  content.innerHTML = `
    <header class="hero">
      <p class="tag">Locked</p>
      <h2>Code Test Locked</h2>
      <p>You need to complete all lessons before taking the code test.</p>
    </header>

    <div class="card">
      <h2>Complete Your Lessons First</h2>

      <p class="lesson-description">
        Before taking the Code Test, you must complete this lesson first:
      </p>

      <h3>${escapeHTML(incompleteLesson.title)}</h3>

      <a class="btn" href="lessons.html?id=${incompleteLessonId}">
        Go to ${escapeHTML(incompleteLesson.title)}
      </a>
    </div>
  `;
}

async function renderCodeTest(user, profile) {
  const content = document.getElementById("content");

  const codeTestRef = doc(db, "codeTests", user.uid);
  const codeTestSnap = await getDoc(codeTestRef);

  const existingData = codeTestSnap.exists() ? codeTestSnap.data() : null;
  const isCompleted = existingData?.completed === true;

  const challengeHTML = codeChallenges.map((challenge, index) => {
    const savedAnswer = existingData?.answers?.[challenge.id]?.code || challenge.starter;
    const savedOutput = existingData?.answers?.[challenge.id]?.output || "Click Run Code to see the output.";
    const savedCorrect = existingData?.answers?.[challenge.id]?.correct;

    let resultBadge = "";

    if (savedCorrect === true) {
      resultBadge = `<span class="badge done">Correct</span>`;
    } else if (savedCorrect === false) {
      resultBadge = `<span class="badge locked">Wrong</span>`;
    }

    return `
      <div class="code-challenge-box">
        <div class="challenge-header">
          <h3>${index + 1}. ${escapeHTML(challenge.title)}</h3>
          ${resultBadge}
        </div>

        <p class="lesson-description">${formatText(challenge.scenario)}</p>

        <textarea 
          id="code_${challenge.id}" 
          class="challenge-code-area"
          autocomplete="off"
          autocorrect="off"
          autocapitalize="off"
          spellcheck="false"
          ${isCompleted ? "disabled" : ""}
        >${escapeHTML(savedAnswer)}</textarea>

        ${
          isCompleted
            ? ""
            : `
              <div class="practice-buttons">
                <button 
                  class="btn orange runChallengeBtn" 
                  type="button" 
                  data-id="${challenge.id}"
                >
                  Run Code
                </button>
              </div>
            `
        }

        <h4>Output</h4>
        <pre id="output_${challenge.id}" class="code-output">${escapeHTML(savedOutput)}</pre>

        ${
          savedCorrect === false
            ? `
              <div class="answer-key-box">
                <h4>Correct Answer</h4>
                <pre><code>${escapeHTML(challenge.sampleAnswer)}</code></pre>
              </div>
            `
            : ""
        }
      </div>
    `;
  }).join("");

  content.innerHTML = `
    <header class="hero">
      <p class="tag">Before Final Quiz</p>
      <h2>Python Code Test</h2>
      <p>
        Complete this coding test before proceeding to the Final Quiz Battle.
      </p>
    </header>

    <div class="card">
      <h2>Code Test Instructions</h2>

      <p class="lesson-description">
        Read each scenario carefully and write the correct Python code.<br>
        You can use the Run Code button to check the output of your answer.<br>
        You need to pass all 5 scenarios before you can proceed to the Final Quiz.<br><br>
        <strong>Note:</strong> Copy-paste is disabled. Students must type their code manually.
      </p>

      ${
        existingData
          ? `
            <div class="lesson-status">
              <p><strong>Current Score:</strong> ${existingData.score}/${existingData.total}</p>
              ${
                isCompleted
                  ? `<span class="badge done">Code Test Passed</span>`
                  : `<span class="badge locked">Code Test Not Yet Passed</span>`
              }
            </div>
          `
          : ""
      }

      ${challengeHTML}

      ${
        isCompleted
          ? `
            <div class="lesson-status">
              <span class="badge done">Completed</span>
              <p>You passed the Code Test. You may now proceed to the Final Quiz.</p>
            </div>

            <a class="btn" href="final_quiz.html">Proceed to Final Quiz</a>
          `
          : `
            <button class="btn success" id="submitCodeTestBtn" type="button">
              Submit Code Test
            </button>
          `
      }
    </div>
  `;

  setupNoCopyPaste();
  setupRunButtons();
  setupSubmitButton(user, profile);
}

function setupNoCopyPaste() {
  const codeAreas = document.querySelectorAll(".challenge-code-area");

  let lastAlertTime = 0;

  function blockAction(event, message) {
    event.preventDefault();

    const now = Date.now();

    if (now - lastAlertTime > 800) {
      alert(message);
      lastAlertTime = now;
    }
  }

  codeAreas.forEach((textarea) => {
    textarea.addEventListener("paste", (event) => {
      blockAction(event, "Copy-paste is disabled. Please type your code manually.");
    });

    textarea.addEventListener("copy", (event) => {
      blockAction(event, "Copying is disabled during the Code Test.");
    });

    textarea.addEventListener("cut", (event) => {
      blockAction(event, "Cut is disabled during the Code Test.");
    });

    textarea.addEventListener("drop", (event) => {
      blockAction(event, "Drag and drop is disabled. Please type your code manually.");
    });

    textarea.addEventListener("dragover", (event) => {
      event.preventDefault();
    });

    textarea.addEventListener("contextmenu", (event) => {
      event.preventDefault();
    });

    textarea.addEventListener("beforeinput", (event) => {
      if (
        event.inputType === "insertFromPaste" ||
        event.inputType === "insertFromDrop"
      ) {
        blockAction(event, "Paste and drag-drop are disabled. Please type your code manually.");
      }
    });

    textarea.addEventListener("keydown", (event) => {
      const key = event.key.toLowerCase();

      if ((event.ctrlKey || event.metaKey) && ["v", "c", "x"].includes(key)) {
        blockAction(event, "Copy, paste, and cut shortcuts are disabled during the Code Test.");
      }
    });
  });
}

function setupRunButtons() {
  const runButtons = document.querySelectorAll(".runChallengeBtn");

  runButtons.forEach((button) => {
    button.addEventListener("click", async () => {
      const challengeId = button.dataset.id;
      const textarea = document.getElementById(`code_${challengeId}`);
      const outputBox = document.getElementById(`output_${challengeId}`);

      const code = textarea.value.trim();

      if (!code) {
        alert("Please type your Python code first.");
        return;
      }

      try {
        button.disabled = true;
        button.textContent = "Running...";
        outputBox.textContent = "Loading Python runner. Please wait...";

        const output = await runPythonCode(code);
        outputBox.textContent = output;

      } catch (error) {
        console.error(error);
        outputBox.textContent = error.message;

      } finally {
        button.disabled = false;
        button.textContent = "Run Code";
      }
    });
  });
}

function setupSubmitButton(user, profile) {
  const submitButton = document.getElementById("submitCodeTestBtn");

  if (!submitButton) return;

  submitButton.addEventListener("click", async () => {
    try {
      submitButton.disabled = true;
      submitButton.textContent = "Checking...";

      let score = 0;
      const total = codeChallenges.length;
      const answers = {};

      for (const challenge of codeChallenges) {
        const textarea = document.getElementById(`code_${challenge.id}`);
        const outputBox = document.getElementById(`output_${challenge.id}`);

        const code = textarea.value.trim();

        if (!code) {
          answers[challenge.id] = {
            title: challenge.title,
            scenario: challenge.scenario,
            code: "",
            output: "No answer.",
            correct: false
          };

          outputBox.textContent = "No answer.";
          continue;
        }

        outputBox.textContent = "Running and checking...";
        const output = await runPythonCode(code);

        const correct = checkAnswer(challenge, code, output);

        if (correct) {
          score++;
        }

        answers[challenge.id] = {
          title: challenge.title,
          scenario: challenge.scenario,
          code,
          output,
          correct
        };

        outputBox.textContent = output;
      }

      const completed = score === total;

      await setDoc(doc(db, "codeTests", user.uid), {
        userId: user.uid,
        userName: profile?.name || user.displayName || user.email,
        email: user.email,
        score,
        total,
        completed,
        answers,
        updatedAt: serverTimestamp()
      }, { merge: true });

      if (completed) {
        alert(`Code Test passed. Score: ${score}/${total}`);
      } else {
        alert(`Code Test not yet passed. Score: ${score}/${total}. Please review your answers.`);
      }

      await renderCodeTest(user, profile);

    } catch (error) {
      console.error(error);
      alert(error.message);

    } finally {
      submitButton.disabled = false;
      submitButton.textContent = "Submit Code Test";
    }
  });
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

  if (challenge.outputMustContainAny) {
    outputCorrect = challenge.outputMustContainAny.some((word) => {
      return normalizedOutput.includes(word.toLowerCase());
    });
  }

  return hasRequiredCode && outputCorrect;
}