// src/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Tus coordenadas mágicas de la foto
const firebaseConfig = {
  apiKey: "AIzaSyBDVWc_kSDywXSDsK5J11K669Gj6ldUWn4",
  authDomain: "app-finanzas-98783.firebaseapp.com",
  projectId: "app-finanzas-98783",
  storageBucket: "app-finanzas-98783.firebasestorage.app",
  messagingSenderId: "418302555630",
  appId: "1:418302555630:web:fdacd022af5135fd880aff",
  measurementId: "G-T5W2G13C64"
};

// 1. Encendemos el puente
const app = initializeApp(firebaseConfig);

// 2. Preparamos al guardia (para entrar con Google)
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// 3. Preparamos el archivero (donde guardaremos los gastos)
export const db = getFirestore(app);