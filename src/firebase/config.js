// src/firebase/config.js
// ⚠️ Reemplaza estos valores con los de tu proyecto Firebase
import { initializeApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: "AIzaSyBEUpsucKmzE6VMCt3vYjH6pbkF15EOarE",
  authDomain: "healthxperience-ibime.firebaseapp.com",
  projectId: "healthxperience-ibime",
  storageBucket: "healthxperience-ibime.firebasestorage.app",
  messagingSenderId: "433639387896",
  appId: "1:433639387896:web:b4f8babd7664e6c8a5c10d"
}

const app = initializeApp(firebaseConfig)
export const db = getFirestore(app)
export default app
