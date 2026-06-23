// data.js

export const lessonOrder = [
  "intro",
  "variables",
  "datatypes",
  "operators",
  "conditionals",
  "loops",
  "functions"
];

export const lessons = {
  intro: {
    title: "Introduction to Python",
    subtitle: "Start learning Python from the basics.",
    lesson: `Python is a beginner-friendly programming language. It is used to create websites, automate tasks, analyze data, build games, and develop artificial intelligence applications.

Python is popular because its syntax is simple and easy to read. This means beginners can focus more on understanding programming logic instead of memorizing complicated symbols.

In this lesson, you will learn how to display text using the print() function. The print() function is one of the first things beginners learn because it allows you to see the result or output of your program.`,
    code: `print("Hello, World!")`,
    exampleTitle: "Display a simple message",
    exampleCode: `print("Welcome to Python!")`,
    exampleOutput: `Welcome to Python!`,
    task: "Write Python code that displays your name and your favorite subject.",
    sample: `print("My name is James")
print("My favorite subject is Programming")`,
    quiz: [
      {
        question: "What function is used to display output in Python?",
        choices: { a: "show()", b: "print()", c: "display()" },
        answer: "b"
      },
      {
        question: `What will print("Hi") display?`,
        choices: { a: "Hi", b: "print", c: "Error" },
        answer: "a"
      }
    ]
  },

  variables: {
    title: "Python Variables",
    subtitle: "Learn how to store values using variables.",
    lesson: `Variables are used to store values in a program. A variable can store text, numbers, or other types of data.

You can think of a variable as a container with a name. For example, if you create a variable called name, you can store a person's name inside it. If you create a variable called age, you can store a number inside it.

Variables make programs easier to understand because they allow us to reuse values instead of typing the same data many times.`,
    code: `name = "James"
age = 20

print(name)
print(age)`,
    exampleTitle: "Store and display information",
    exampleCode: `student_name = "Ana"
student_age = 18

print(student_name)
print(student_age)`,
    exampleOutput: `Ana
18`,
    task: "Create three variables: name, age, and school. Then print all of them.",
    sample: `name = "James"
age = 20
school = "ABC College"

print(name)
print(age)
print(school)`,
    quiz: [
      {
        question: "What is a variable used for?",
        choices: { a: "To store values", b: "To delete files", c: "To change keyboard" },
        answer: "a"
      },
      {
        question: "Which is a valid variable assignment?",
        choices: { a: `name == "Ana"`, b: `name = "Ana"`, c: "variable name Ana" },
        answer: "b"
      }
    ]
  },

  datatypes: {
    title: "Python Data Types",
    subtitle: "Understand strings, integers, floats, and booleans.",
    lesson: `Data types describe the kind of value stored in a variable. Python has different data types such as string, integer, float, and boolean.

A string is used for text, such as names or messages. An integer is used for whole numbers. A float is used for decimal numbers. A boolean is used for values that are either True or False.

Understanding data types is important because Python handles different kinds of values in different ways.`,
    code: `name = "Ana"
score = 95
average = 92.5
passed = True`,
    exampleTitle: "Create variables with different data types",
    exampleCode: `name = "Carlo"
age = 19
grade = 90.5
is_passed = True

print(name)
print(age)
print(grade)
print(is_passed)`,
    exampleOutput: `Carlo
19
90.5
True`,
    task: "Create one example each for string, integer, float, and boolean.",
    sample: `student = "Mark"
age = 18
grade = 91.5
passed = True`,
    quiz: [
      {
        question: "Which data type is used for text?",
        choices: { a: "String", b: "Integer", c: "Float" },
        answer: "a"
      },
      {
        question: "Which value is a float?",
        choices: { a: "10", b: "10.5", c: `"10"` },
        answer: "b"
      }
    ]
  },

  operators: {
    title: "Python Operators",
    subtitle: "Use operators to calculate and compare values.",
    lesson: `Operators are symbols used to perform operations on values and variables. They allow you to calculate numbers, compare values, and create logical conditions.

Common arithmetic operators include addition, subtraction, multiplication, division, and modulo. The modulo operator gives the remainder after division.

Operators are important because they allow programs to process information and produce results.`,
    code: `x = 10
y = 3

print(x + y)
print(x - y)
print(x * y)
print(x / y)
print(x % y)`,
    exampleTitle: "Calculate numbers",
    exampleCode: `num1 = 15
num2 = 5

print(num1 + num2)
print(num1 - num2)
print(num1 * num2)
print(num1 / num2)`,
    exampleOutput: `20
10
75
3.0`,
    task: "Create two numbers and print their sum, difference, product, and quotient.",
    sample: `a = 20
b = 5

print(a + b)
print(a - b)
print(a * b)
print(a / b)`,
    quiz: [
      {
        question: "Which operator is used for multiplication?",
        choices: { a: "x", b: "*", c: "%" },
        answer: "b"
      },
      {
        question: "What does % return?",
        choices: { a: "Total", b: "Product", c: "Remainder" },
        answer: "c"
      }
    ]
  },

  conditionals: {
    title: "Python If Statements",
    subtitle: "Make decisions using if, elif, and else.",
    lesson: `If statements allow a program to make decisions. A program can check a condition and run different code depending on whether the condition is True or False.

For example, a program can check if a student's grade is 75 or higher. If the condition is true, the program can display "Passed". Otherwise, it can display "Failed".

In Python, indentation is very important when using if statements. The indented code belongs to the condition above it.`,
    code: `age = 18

if age >= 18:
    print("You are allowed.")
else:
    print("You are not allowed.")`,
    exampleTitle: "Check if a person is allowed",
    exampleCode: `age = 20

if age >= 18:
    print("Allowed")
else:
    print("Not allowed")`,
    exampleOutput: `Allowed`,
    task: "Write a program that checks if a grade is passing. Passing grade is 75 and above.",
    sample: `grade = 80

if grade >= 75:
    print("Passed")
else:
    print("Failed")`,
    quiz: [
      {
        question: "Which keyword starts a condition?",
        choices: { a: "if", b: "for", c: "def" },
        answer: "a"
      },
      {
        question: "Is indentation important in Python?",
        choices: { a: "Yes", b: "No", c: "Only sometimes" },
        answer: "a"
      }
    ]
  },

  loops: {
    title: "Python Loops",
    subtitle: "Repeat code using for loops and while loops.",
    lesson: `Loops are used to repeat code multiple times. Instead of writing the same code again and again, you can use a loop to make your program repeat actions automatically.

A for loop is commonly used when you know how many times you want to repeat something. A while loop is used when you want to repeat code as long as a condition remains true.

Loops are useful for tasks such as counting numbers, displaying lists, and repeating instructions.`,
    code: `for number in range(1, 6):
    print(number)

count = 1
while count <= 5:
    print(count)
    count += 1`,
    exampleTitle: "Repeat a message using a loop",
    exampleCode: `for i in range(1, 4):
    print("Hello", i)`,
    exampleOutput: `Hello 1
Hello 2
Hello 3`,
    task: "Use a for loop to print numbers from 1 to 10.",
    sample: `for number in range(1, 11):
    print(number)`,
    quiz: [
      {
        question: "What is a loop used for?",
        choices: { a: "Deleting code", b: "Changing colors", c: "Repeating code" },
        answer: "c"
      },
      {
        question: "Which loop commonly uses range()?",
        choices: { a: "if statement", b: "for loop", c: "function" },
        answer: "b"
      }
    ]
  },

  functions: {
    title: "Python Functions",
    subtitle: "Create reusable blocks of code.",
    lesson: `Functions are reusable blocks of code. They help organize a program by grouping instructions into one named block.

A function is created using the def keyword. After creating a function, you can call it whenever you need to use the same code again.

Functions are important because they make programs cleaner, shorter, and easier to maintain.`,
    code: `def greet(name):
    print("Hello, " + name)

greet("James")`,
    exampleTitle: "Create and call a function",
    exampleCode: `def say_hello():
    print("Hello, student!")

say_hello()`,
    exampleOutput: `Hello, student!`,
    task: "Create a function called introduce that prints your name and age.",
    sample: `def introduce():
    print("My name is James")
    print("I am 20 years old")

introduce()`,
    quiz: [
      {
        question: "Which keyword creates a function?",
        choices: { a: "def", b: "make", c: "func" },
        answer: "a"
      },
      {
        question: "Why do we use functions?",
        choices: { a: "To erase code", b: "To reuse code", c: "To stop Python" },
        answer: "b"
      }
    ]
  }
};

export const finalQuestions = {
  q1: {
    correct: "b",
    question: "What function is used to display output in Python?",
    choices: { a: "show()", b: "print()", c: "display()" }
  },
  q2: {
    correct: "c",
    question: "Which one is a string?",
    choices: { a: "100", b: "True", c: `"Python"` }
  },
  q3: {
    correct: "a",
    question: "What keyword is used to create a function?",
    choices: { a: "def", b: "function", c: "create" }
  },
  q4: {
    correct: "b",
    question: "Which operator is used for multiplication?",
    choices: { a: "x", b: "*", c: "%" }
  },
  q5: {
    correct: "a",
    question: "What keyword starts a condition?",
    choices: { a: "if", b: "for", c: "def" }
  },
  q6: {
    correct: "c",
    question: "What is a loop used for?",
    choices: { a: "Deleting code", b: "Creating photos", c: "Repeating code" }
  },
  q7: {
    correct: "a",
    question: "Which value is a boolean?",
    choices: { a: "True", b: `"Hello"`, c: "99" }
  },
  q8: {
    correct: "b",
    question: "Which operator gives the remainder?",
    choices: { a: "/", b: "%", c: "*" }
  },
  q9: {
    correct: "c",
    question: "Which loop commonly uses range()?",
    choices: { a: "if statement", b: "function", c: "for loop" }
  },
  q10: {
    correct: "a",
    question: "Why do we use functions?",
    choices: { a: "To reuse code", b: "To delete Python", c: "To stop the website" }
  }
};

export const codingQuestions = {
  coding_q1: {
    question: "Print your name using Python.",
    sample: `print("James")`,
    checks: ["print("]
  },
  coding_q2: {
    question: "Create a variable called school and print it.",
    sample: `school = "ABC College"
print(school)`,
    checks: ["school", "=", "print("]
  },
  coding_q3: {
    question: "Create two numbers and print their sum.",
    sample: `a = 10
b = 5
print(a + b)`,
    checks: ["=", "+", "print("]
  },
  coding_q4: {
    question: "Write an if statement that checks if grade is 75 or above.",
    sample: `grade = 80
if grade >= 75:
    print("Passed")`,
    checks: ["if", "grade", ">=", "75"]
  },
  coding_q5: {
    question: "Create a function and call it.",
    sample: `def greet():
    print("Hello")

greet()`,
    checks: ["def", "print("]
  }
};

export const totalScore = Object.keys(finalQuestions).length + Object.keys(codingQuestions).length;