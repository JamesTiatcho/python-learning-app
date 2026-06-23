PYTHON LEARNING WEBSITE - FIREBASE VERSION

FILES INCLUDED:
- index.html
- login.html
- register.html
- dashboard.html
- lessons.html
- final_quiz.html
- leaderboard.html
- certificate.html
- admin.html
- firebase-config.js
- data.js
- main.js
- auth.js
- dashboard.js
- lessons.js
- final_quiz.js
- leaderboard.js
- certificate.js
- admin.js
- style.css
- firestore-rules.txt

PROCESS:

1. Firebase Console
   - Authentication > Sign-in method > Enable Email/Password
   - Firestore Database > Create database > Start in test mode muna

2. VS Code
   - Open this folder
   - Install Live Server extension
   - Right click login.html
   - Open with Live Server

3. Register student account
   - Go to register.html
   - Create account
   - It will create a document inside Firestore users collection.

4. Admin setup
   - Register your own admin email first using register.html
   - Go to Firebase Console > Firestore Database > users
   - Open your user document
   - Change role from "student" to "admin"
   - Then login again
   - Open admin.html

5. Firestore Rules
   - Copy firestore-rules.txt
   - Firebase Console > Firestore Database > Rules
   - Paste rules
   - Publish

NOTE:
Firebase config apiKey is okay to be visible in frontend.
Security is handled by Firestore Rules and Authentication.

FEATURES:
- Register/Login
- Lesson progress saved per user
- Task + mini quiz required before lesson completion
- Final quiz battle scoring saved in Firestore
- Scoreboard / leaderboard
- No retake unless admin unlocks
- Certificate if perfect score
- Admin can unlock final quiz by deleting final score record
