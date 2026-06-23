// lessons.js

import { db } from "./firebase-config.js";
import { lessons, lessonOrder } from "./data.js";
import {
  requireLogin,
  renderLayout,
  setLoggedUserName,
  getProgress,
  escapeHTML
} from "./main.js";
import {
  doc,
  setDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";

const PYODIDE_BASE_URL = "https://cdn.jsdelivr.net/pyodide/v0.26.4/full/";

let pyodide = null;

async function loadPythonRunner() {
  if (!pyodide) {
    if (typeof globalThis.loadPyodide !== "function") {
      throw new Error("Python runner failed to load. Please check your internet connection or lessons.html Pyodide script.");
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

const params = new URLSearchParams(window.location.search);
const lessonId = params.get("id") || "intro";
const lesson = lessons[lessonId];

renderLayout(lessonId);

requireLogin(async (user, profile) => {
  setLoggedUserName(profile);

  if (!lesson) {
    document.getElementById("content").innerHTML = `
      <div class="card">
        <h2>Lesson not found.</h2>
        <p>The lesson you are trying to open does not exist.</p>
        <a class="btn" href="dashboard.html">Back to Dashboard</a>
      </div>
    `;
    return;
  }

  const lockedLessonId = await getFirstIncompletePreviousLesson(user.uid, lessonId);

  if (lockedLessonId) {
    renderLockedLesson(lockedLessonId);
    return;
  }

  await renderLesson(user.uid);
});

function getPreviousLessonId(currentLessonId) {
  const currentIndex = lessonOrder.indexOf(currentLessonId);

  if (currentIndex <= 0) {
    return null;
  }

  return lessonOrder[currentIndex - 1];
}

function getNextLessonId(currentLessonId) {
  const currentIndex = lessonOrder.indexOf(currentLessonId);

  if (currentIndex === -1 || currentIndex >= lessonOrder.length - 1) {
    return null;
  }

  return lessonOrder[currentIndex + 1];
}

async function getFirstIncompletePreviousLesson(userId, currentLessonId) {
  const currentIndex = lessonOrder.indexOf(currentLessonId);

  if (currentIndex <= 0) {
    return null;
  }

  for (let i = 0; i < currentIndex; i++) {
    const previousLessonId = lessonOrder[i];
    const previousProgress = await getProgress(userId, previousLessonId);

    if (!previousProgress.completed) {
      return previousLessonId;
    }
  }

  return null;
}

function renderLockedLesson(lockedLessonId) {
  const content = document.getElementById("content");
  const lockedLesson = lessons[lockedLessonId];

  content.innerHTML = `
    <header class="hero">
      <p class="tag">Locked Lesson</p>
      <h2>${escapeHTML(lesson.title)}</h2>
      <p>You cannot proceed to this lesson yet.</p>
    </header>

    <div class="card">
      <h2>Lesson Locked</h2>
      <p>You need to complete this lesson first:</p>

      <h3>${escapeHTML(lockedLesson.title)}</h3>

      <p class="lesson-description">
        Finish the practice task, run your code to check the output, pass the mini quiz, and mark the lesson as complete before proceeding to the next lesson.
      </p>

      <a class="btn" href="lessons.html?id=${lockedLessonId}">
        Go to ${escapeHTML(lockedLesson.title)}
      </a>
    </div>
  `;
}

async function saveProgress(userId, data) {
  const progressId = userId + "_" + lessonId;

  await setDoc(doc(db, "lessonProgress", progressId), {
    userId,
    lessonId,
    ...data,
    updatedAt: serverTimestamp()
  }, { merge: true });
}

async function renderLesson(userId) {
  const progress = await getProgress(userId, lessonId);
  const content = document.getElementById("content");

  const previousLessonId = getPreviousLessonId(lessonId);
  const nextLessonId = getNextLessonId(lessonId);

  const quizHTML = lesson.quiz.map((q, index) => {
    return `
      <div class="question">
        <p><strong>${index + 1}. ${escapeHTML(q.question)}</strong></p>

        ${Object.entries(q.choices).map(([key, choice]) => `
          <label>
            <input 
              type="radio" 
              name="mini_q${index + 1}" 
              value="${key}" 
              ${progress.completed ? "disabled" : ""} 
              required
            >
            ${escapeHTML(choice)}
          </label>
        `).join("")}
      </div>
    `;
  }).join("");

  let statusHTML = `
    <span class="badge locked">Complete Locked</span>
    <p>You need to save the task and pass the mini quiz first.</p>
  `;

  if (progress.completed) {
    statusHTML = `
      <span class="badge done">Lesson Completed</span>
      <p>You have successfully completed this lesson.</p>
    `;
  } else if (progress.taskAnswer && progress.miniQuizPassed) {
    statusHTML = `
      <span class="badge ready">Ready to Complete</span>
      <p>You may now mark this lesson as complete.</p>
    `;
  }

  let navigationButtons = "";

  if (previousLessonId) {
    navigationButtons += `
      <a class="btn secondary" href="lessons.html?id=${previousLessonId}">
        Previous Lesson
      </a>
    `;
  }

  if (progress.completed && nextLessonId) {
    navigationButtons += `
      <a class="btn" href="lessons.html?id=${nextLessonId}">
        Next Lesson
      </a>
    `;
  }

  if (progress.completed && !nextLessonId) {
    navigationButtons += `
      <a class="btn" href="final_quiz.html">
        Proceed to Final Quiz
      </a>
    `;
  }

  content.innerHTML = `
    <header class="hero">
      <p class="tag">Lesson</p>
      <h2>${escapeHTML(lesson.title)}</h2>
      <p>${escapeHTML(lesson.subtitle)}</p>
    </header>

    <div class="card">
      <h3>${escapeHTML(lesson.title)}</h3>

      <p class="lesson-description">${escapeHTML(lesson.lesson)}</p>

      <h4>Code Example</h4>
      <pre><code>${escapeHTML(lesson.code)}</code></pre>

      <div class="example-box">
        <h4>Guided Example: ${escapeHTML(lesson.exampleTitle)}</h4>
        <p>
          Study the example below. This will help you understand how the lesson concept is used in an actual Python program.
        </p>

        <pre><code>${escapeHTML(lesson.exampleCode)}</code></pre>

        <p><strong>Output:</strong></p>
        <pre><code>${escapeHTML(lesson.exampleOutput)}</code></pre>
      </div>

      <div class="task-box">
        <h4>Practice Task</h4>
        <p>${escapeHTML(lesson.task)}</p>

        <textarea 
          id="taskAnswer" 
          ${progress.completed ? "disabled" : ""} 
          placeholder="Type your Python answer here..."
        >${escapeHTML(progress.taskAnswer || "")}</textarea>

        <br>

        ${
          progress.completed
            ? `
              <h4>Output</h4>
              <pre id="taskOutput" class="code-output">This lesson is already completed.</pre>
            `
            : `
              <div class="practice-buttons">
                <button class="btn orange" id="runTaskBtn" type="button">Run Code</button>
                <button class="btn success" id="saveTaskBtn" type="button">Save Task</button>
              </div>

              <h4>Output</h4>
              <pre id="taskOutput" class="code-output">Click Run Code to see the output.</pre>
            `
        }

        <details>
          <summary>Show Sample Answer</summary>
          <pre><code>${escapeHTML(lesson.sample)}</code></pre>
        </details>
      </div>

      <div class="quiz-box">
        <h4>Mini Quiz</h4>

        <p>
          Answer the mini quiz to check your understanding. You need a perfect score before you can mark this lesson as complete.
        </p>

        ${
          progress.miniQuizPassed
            ? `<p class="message success">Mini quiz passed. Score: ${progress.miniQuizScore}/${progress.miniQuizTotal}</p>`
            : ""
        }

        ${
          progress.completed
            ? ""
            : `
              <form id="miniQuizForm">
                ${quizHTML}
                <button type="submit" class="btn orange">Submit Mini Quiz</button>
              </form>
            `
        }
      </div>

      <div class="lesson-status">
        ${statusHTML}
      </div>

      ${
        progress.completed
          ? ""
          : `<button class="btn" id="completeLessonBtn" type="button">Mark Lesson as Complete</button>`
      }

      <div class="lesson-navigation">
        ${navigationButtons}
      </div>
    </div>
  `;

  const runTaskBtn = document.getElementById("runTaskBtn");

  if (runTaskBtn) {
    runTaskBtn.addEventListener("click", async () => {
      const code = document.getElementById("taskAnswer").value.trim();
      const outputBox = document.getElementById("taskOutput");

      if (!code) {
        alert("Please type Python code first.");
        return;
      }

      try {
        runTaskBtn.disabled = true;
        runTaskBtn.textContent = "Running...";
        outputBox.textContent = "Loading Python runner. Please wait...";

        const result = await runPythonCode(code);
        outputBox.textContent = result;

      } catch (error) {
        console.error(error);
        outputBox.textContent = error.message;
      } finally {
        runTaskBtn.disabled = false;
        runTaskBtn.textContent = "Run Code";
      }
    });
  }

  const saveTaskBtn = document.getElementById("saveTaskBtn");

  if (saveTaskBtn) {
    saveTaskBtn.addEventListener("click", async () => {
      const answer = document.getElementById("taskAnswer").value.trim();

      if (!answer) {
        alert("Please answer the task before saving.");
        return;
      }

      await saveProgress(userId, {
        taskAnswer: answer
      });

      alert("Task answer saved.");
      await renderLesson(userId);
    });
  }

  const miniQuizForm = document.getElementById("miniQuizForm");

  if (miniQuizForm) {
    miniQuizForm.addEventListener("submit", async (event) => {
      event.preventDefault();

      let score = 0;
      let total = lesson.quiz.length;

      lesson.quiz.forEach((q, index) => {
        const selected = document.querySelector(`input[name="mini_q${index + 1}"]:checked`);

        if (selected && selected.value === q.answer) {
          score++;
        }
      });

      const passed = score === total;

      await saveProgress(userId, {
        miniQuizScore: score,
        miniQuizTotal: total,
        miniQuizPassed: passed
      });

      if (passed) {
        alert(`Mini quiz passed. Score: ${score}/${total}`);
      } else {
        alert(`Mini quiz failed. Score: ${score}/${total}. Perfect score is required.`);
      }

      await renderLesson(userId);
    });
  }

  const completeLessonBtn = document.getElementById("completeLessonBtn");

  if (completeLessonBtn) {
    completeLessonBtn.addEventListener("click", async () => {
      const latest = await getProgress(userId, lessonId);

      if (!latest.taskAnswer || !latest.miniQuizPassed) {
        alert("You need to save the task and pass the mini quiz first.");
        return;
      }

      await saveProgress(userId, {
        completed: true
      });

      alert("Lesson completed.");
      await renderLesson(userId);
    });
  }
}