// chatbot.js

(function () {
    const quickQuestions = [
      "Ano ang Python?",
      "Paano gamitin ang print?",
      "Ano ang variable?",
      "Ano ang if else?",
      "Halimbawa ng for loop",
      "Ano ang function?",
      "Bakit may indentation error?"
    ];
  
    const lessons = [
      {
        topic: "python",
        keywords: [
          "python", "ano ang python", "what is python", "para saan ang python",
          "ibig sabihin ng python", "ano gamit ng python"
        ],
        answer: `Ang Python ay isang beginner-friendly programming language.
  
  Ginagamit ito sa:
  - paggawa ng website
  - automation
  - data analysis
  - artificial intelligence
  - simple programs
  
  Example:
  print("Hello Python")`
      },
  
      {
        topic: "print",
        keywords: [
          "print", "output", "display", "ipakita", "magpakita", "palabasin",
          "paano mag print", "paano gamitin ang print", "ano ang print"
        ],
        answer: `Ang print() ay ginagamit para magpakita ng output sa Python.
  
  Example:
  print("Hello World")
  
  Output:
  Hello World`
      },
  
      {
        topic: "variable",
        keywords: [
          "variable", "variables", "bariable", "lagayan", "store data",
          "ano ang variable", "paano gumawa ng variable", "paano mag declare",
          "gumawa ng variable"
        ],
        answer: `Ang variable ay lalagyan ng value or data.
  
  Example:
  name = "James"
  age = 20
  
  print(name)
  print(age)
  
  Output:
  James
  20`
      },
  
      {
        topic: "string",
        keywords: [
          "string", "text", "letters", "salita", "pangalan",
          "ano ang string", "str"
        ],
        answer: `Ang string ay text data sa Python. Nilalagay ito sa quotation marks.
  
  Example:
  name = "James"
  message = "Hello"
  
  print(name)
  print(message)`
      },
  
      {
        topic: "integer",
        keywords: [
          "integer", "int", "whole number", "buong numero", "number",
          "ano ang integer"
        ],
        answer: `Ang integer ay whole number or buong numero.
  
  Example:
  age = 20
  score = 100
  
  print(age)
  print(score)`
      },
  
      {
        topic: "float",
        keywords: [
          "float", "decimal", "may decimal", "point", "presyo",
          "ano ang float"
        ],
        answer: `Ang float ay number na may decimal point.
  
  Example:
  price = 99.50
  grade = 95.75
  
  print(price)
  print(grade)`
      },
  
      {
        topic: "boolean",
        keywords: [
          "boolean", "bool", "true", "false", "tama", "mali",
          "ano ang boolean"
        ],
        answer: `Ang boolean ay may dalawang possible values lang:
  
  True or False
  
  Example:
  is_passed = True
  is_failed = False
  
  print(is_passed)`
      },
  
      {
        topic: "data types",
        keywords: [
          "data type", "datatype", "data types", "uri ng data",
          "ano ang data type", "mga data type"
        ],
        answer: `Common data types sa Python:
  
  String - text
  Integer - whole number
  Float - decimal number
  Boolean - True or False
  List - collection of values
  
  Example:
  name = "James"
  age = 20
  grade = 95.5
  passed = True`
      },
  
      {
        topic: "operators",
        keywords: [
          "operator", "operators", "addition", "subtraction", "multiplication",
          "division", "plus", "minus", "multiply", "divide",
          "ano ang operator", "paano mag add", "paano mag subtract",
          "paano mag multiply", "paano mag divide", "+", "-", "*", "/", "%"
        ],
        answer: `Ang operators ay ginagamit para mag-compute.
  
  Common operators:
  + addition
  - subtraction
  * multiplication
  / division
  % remainder or modulo
  
  Example:
  a = 10
  b = 3
  
  print(a + b)
  print(a - b)
  print(a * b)
  print(a / b)
  print(a % b)`
      },
  
      {
        topic: "if else",
        keywords: [
          "if", "else", "if else", "condition", "conditional",
          "kapag", "kung", "decision", "passed failed",
          "ano ang if else", "paano gamitin ang if", "paano gamitin ang else"
        ],
        answer: `Ang if else ay ginagamit kapag may condition or decision.
  
  Example:
  grade = 80
  
  if grade >= 75:
      print("Passed")
  else:
      print("Failed")
  
  Output:
  Passed`
      },
  
      {
        topic: "for loop",
        keywords: [
          "loop", "for loop", "for", "ulit", "paulit ulit", "repeat",
          "repetition", "paano mag loop", "ano ang loop", "halimbawa ng loop"
        ],
        answer: `Ang for loop ay ginagamit para ulitin ang code.
  
  Example:
  for number in range(1, 6):
      print(number)
  
  Output:
  1
  2
  3
  4
  5`
      },
  
      {
        topic: "while loop",
        keywords: [
          "while", "while loop", "ano ang while", "paano gamitin while"
        ],
        answer: `Ang while loop ay inuulit ang code habang True ang condition.
  
  Example:
  count = 1
  
  while count <= 5:
      print(count)
      count = count + 1`
      },
  
      {
        topic: "range",
        keywords: [
          "range", "ano ang range", "paano gamitin ang range"
        ],
        answer: `Ang range() ay ginagamit madalas sa for loop.
  
  Example:
  for number in range(1, 6):
      print(number)
  
  Meaning:
  Magsisimula sa 1 hanggang 5.
  
  Output:
  1
  2
  3
  4
  5`
      },
  
      {
        topic: "function",
        keywords: [
          "function", "functions", "def", "method",
          "ano ang function", "paano gumawa ng function",
          "paano gamitin ang def"
        ],
        answer: `Ang function ay reusable block of code.
  
  Ginagamit ang def para gumawa ng function.
  
  Example:
  def greet():
      print("Hello")
  
  greet()
  
  Output:
  Hello`
      },
  
      {
        topic: "parameter",
        keywords: [
          "parameter", "argument", "parameters", "arguments",
          "ano ang parameter", "ano ang argument"
        ],
        answer: `Ang parameter ay variable sa loob ng function.
  
  Example:
  def greet(name):
      print("Hello " + name)
  
  greet("James")
  
  Output:
  Hello James`
      },
  
      {
        topic: "list",
        keywords: [
          "list", "array", "collection", "maraming value",
          "ano ang list", "paano gumawa ng list"
        ],
        answer: `Ang list ay ginagamit para mag-store ng maraming values.
  
  Example:
  fruits = ["Apple", "Banana", "Mango"]
  
  for fruit in fruits:
      print(fruit)
  
  Output:
  Apple
  Banana
  Mango`
      },
  
      {
        topic: "input",
        keywords: [
          "input", "user input", "mag input", "type user",
          "paano kumuha ng input", "paano mag input"
        ],
        answer: `Ang input() ay ginagamit para kumuha ng sagot mula sa user.
  
  Example:
  name = input("Enter your name: ")
  print("Hello " + name)`
      },
  
      {
        topic: "comment",
        keywords: [
          "comment", "comments", "note", "notes",
          "ano ang comment", "paano mag comment"
        ],
        answer: `Ang comment ay note sa code. Hindi ito nirurun ni Python.
  
  Example:
  # This is a comment
  print("Hello")`
      },
  
      {
        topic: "indentation",
        keywords: [
          "indentation", "indent", "space", "tab", "tab error",
          "indentation error", "bakit may indentation error",
          "bakit error ang space", "ayaw dahil sa space"
        ],
        answer: `Ang indentation ay spacing sa Python.
  
  Important ito sa:
  - if else
  - loops
  - functions
  
  Correct:
  if grade >= 75:
      print("Passed")
  
  Wrong:
  if grade >= 75:
  print("Passed")
  
  Dapat naka-indent ang code sa loob ng if, loop, or function.`
      },
  
      {
        topic: "syntax error",
        keywords: [
          "syntax error", "error", "bug", "mali code", "ayaw gumana",
          "bakit ayaw", "bakit error", "ano mali", "hindi gumagana"
        ],
        answer: `Kapag may error sa Python, common causes ay:
  
  1. Missing quotation mark
  2. Missing colon :
  3. Wrong indentation
  4. Wrong spelling
  5. Missing parenthesis
  
  Example correct:
  print("Hello")
  
  Example if else correct:
  grade = 80
  
  if grade >= 75:
      print("Passed")
  else:
      print("Failed")`
      },
  
      {
        topic: "even odd",
        keywords: [
          "even", "odd", "modulo", "remainder", "divisible",
          "paano malaman kung even", "paano malaman kung odd",
          "paano gamitin modulo"
        ],
        answer: `Para malaman kung even or odd, gamitin ang modulo %.
  
  Example:
  number = 4
  
  if number % 2 == 0:
      print("Even")
  else:
      print("Odd")
  
  Output:
  Even`
      },
  
      {
        topic: "grade checker",
        keywords: [
          "grade", "passed", "failed", "pasado", "bagsak",
          "grade checker", "paano gumawa ng grade checker"
        ],
        answer: `Example ng grade checker:
  
  grade = 82
  
  if grade >= 75:
      print("Passed")
  else:
      print("Failed")
  
  Output:
  Passed`
      },
  
      {
        topic: "multiply function",
        keywords: [
          "multiply function", "multiplication function",
          "function multiply", "gumawa ng multiply",
          "paano gumawa ng multiply function"
        ],
        answer: `Example ng multiply function:
  
  def multiply(a, b):
      print(a * b)
  
  multiply(5, 3)
  
  Output:
  15`
      }
    ];
  
    function createChatbot() {
      if (document.getElementById("chatbotToggle")) {
        return;
      }
  
      const chatbotHTML = `
        <button id="chatbotToggle" class="chatbot-toggle" type="button">
          💬
        </button>
  
        <div id="chatbotBox" class="chatbot-box">
          <div class="chatbot-header">
            <div>
              <strong>Python Assistant</strong>
              <span>Ask in English or Tagalog</span>
            </div>
  
            <button id="chatbotClose" type="button">×</button>
          </div>
  
          <div id="chatbotMessages" class="chatbot-messages">
            <div class="bot-message">
              Hi! Pwede kang magtanong about Basic Python kahit Tagalog, English, or Taglish.
              
              Example:
              - Ano ang variable?
              - Paano gumawa ng loop?
              - Bakit may indentation error?
              - Example ng if else
            </div>
          </div>
  
          <div class="chatbot-quick">
            ${quickQuestions.map(question => `
              <button type="button" class="quick-question">${question}</button>
            `).join("")}
          </div>
  
          <form id="chatbotForm" class="chatbot-form">
            <input 
              type="text" 
              id="chatbotInput" 
              placeholder="Magtanong about Basic Python..." 
              autocomplete="off"
            >
            <button type="submit">Send</button>
          </form>
        </div>
      `;
  
      document.body.insertAdjacentHTML("beforeend", chatbotHTML);
      setupChatbotEvents();
    }
  
    function setupChatbotEvents() {
      const chatbotToggle = document.getElementById("chatbotToggle");
      const chatbotBox = document.getElementById("chatbotBox");
      const chatbotClose = document.getElementById("chatbotClose");
      const chatbotForm = document.getElementById("chatbotForm");
      const chatbotInput = document.getElementById("chatbotInput");
      const quickButtons = document.querySelectorAll(".quick-question");
  
      chatbotToggle.addEventListener("click", () => {
        chatbotBox.classList.toggle("show");
      });
  
      chatbotClose.addEventListener("click", () => {
        chatbotBox.classList.remove("show");
      });
  
      chatbotForm.addEventListener("submit", (event) => {
        event.preventDefault();
  
        const question = chatbotInput.value.trim();
  
        if (!question) return;
  
        sendQuestion(question);
        chatbotInput.value = "";
      });
  
      quickButtons.forEach((button) => {
        button.addEventListener("click", () => {
          const question = button.textContent.trim();
          sendQuestion(question);
        });
      });
    }
  
    function sendQuestion(question) {
      addMessage(question, "user-message");
  
      const typingMessage = addMessage("Typing...", "bot-message");
  
      setTimeout(() => {
        typingMessage.remove();
  
        const answer = getBotAnswer(question);
        addMessage(answer, "bot-message");
      }, 450);
    }
  
    function addMessage(text, className) {
      const messages = document.getElementById("chatbotMessages");
  
      const messageDiv = document.createElement("div");
      messageDiv.className = className;
      messageDiv.textContent = text;
  
      messages.appendChild(messageDiv);
      messages.scrollTop = messages.scrollHeight;
  
      return messageDiv;
    }
  
    function normalizeText(text) {
      return text
        .toLowerCase()
        .replace(/[?.!,]/g, " ")
        .replace(/\s+/g, " ")
        .trim();
    }
  
    function getBotAnswer(question) {
      const normalizedQuestion = normalizeText(question);
  
      const directAnswer = findBestAnswer(normalizedQuestion);
  
      if (directAnswer) {
        return directAnswer;
      }
  
      if (isAskingForExample(normalizedQuestion)) {
        return `Pwede kang humingi ng example sa Basic Python.
  
  Try mo itanong:
  - Example ng variable
  - Example ng if else
  - Example ng for loop
  - Example ng function
  - Example ng list`;
      }
  
      if (isAskingForMeaning(normalizedQuestion)) {
        return `Pwede kita tulungan magpaliwanag ng Basic Python terms.
  
  Try mo itanong:
  - Ano ang variable?
  - Ano ang loop?
  - Ano ang function?
  - Ano ang data type?
  - Ano ang indentation?`;
      }
  
      return `Sorry, Basic Python topics muna ang kaya kong sagutin.
  
  Pwede mong itanong:
  - Ano ang Python?
  - Paano gamitin ang print?
  - Ano ang variable?
  - Ano ang data type?
  - Ano ang if else?
  - Paano gumawa ng loop?
  - Ano ang function?
  - Bakit may indentation error?
  - Paano gumawa ng grade checker?`;
    }
  
    function findBestAnswer(question) {
      let bestMatch = null;
      let bestScore = 0;
  
      for (const lesson of lessons) {
        let score = 0;
  
        for (const keyword of lesson.keywords) {
          const normalizedKeyword = normalizeText(keyword);
  
          if (question.includes(normalizedKeyword)) {
            score += normalizedKeyword.length;
          }
  
          const keywordWords = normalizedKeyword.split(" ");
  
          for (const word of keywordWords) {
            if (word.length > 2 && question.includes(word)) {
              score += 2;
            }
          }
        }
  
        if (score > bestScore) {
          bestScore = score;
          bestMatch = lesson;
        }
      }
  
      if (bestMatch && bestScore >= 4) {
        return bestMatch.answer;
      }
  
      return null;
    }
  
    function isAskingForExample(question) {
      const exampleWords = [
        "example", "sample", "halimbawa", "sample code",
        "give example", "bigay halimbawa", "pakita code",
        "gawa code", "gumawa code"
      ];
  
      return exampleWords.some(word => question.includes(word));
    }
  
    function isAskingForMeaning(question) {
      const meaningWords = [
        "ano ang", "ano yung", "ibig sabihin", "meaning",
        "explain", "paliwanag", "pakipaliwanag"
      ];
  
      return meaningWords.some(word => question.includes(word));
    }
  
    document.addEventListener("DOMContentLoaded", createChatbot);
  })();