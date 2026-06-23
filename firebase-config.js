// firebase-config.js

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyBlZolpy10WVHtAwDIVgcDkVdh95fZ26rU",
  authDomain: "python-learning-app-7432d.firebaseapp.com",
  projectId: "python-learning-app-7432d",
  storageBucket: "python-learning-app-7432d.firebasestorage.app",
  messagingSenderId: "402118058729",
  appId: "1:402118058729:web:e0cb332a7f170fbd748678"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
