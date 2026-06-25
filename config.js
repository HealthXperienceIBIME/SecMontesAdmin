// src/firebase/config.js
// ⚠️ Reemplaza estos valores con los de tu proyecto Firebase
import { initializeApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: "TU_API_KEY",
  authDomain: "TU_PROJECT.firebaseapp.com",
  projectId: "TU_PROJECT_ID",
  storageBucket: "TU_PROJECT.appspot.com",
  messagingSenderId: "TU_SENDER_ID",
  appId: "TU_APP_ID"
}

const app = initializeApp(firebaseConfig)
export const db = getFirestore(app)
export default app
