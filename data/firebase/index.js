import { initializeApp, getApps } from "firebase/app";
import {
  getFirestore,
  setDoc,
  doc,
  addDoc,
  collection,
} from "firebase/firestore";

initializeApp({
  apiKey: "AIzaSyCy0qPEwKu_jKuhLZZcP3lr8Y1opE0IZU0",
  authDomain: "sofiapulse-3d637.firebaseapp.com",
  projectId: "sofiapulse-3d637",
  storageBucket: "sofiapulse-3d637.appspot.com",
  messagingSenderId: "454506256823",
  appId: "1:454506256823:web:9dca2dd6d7153e1a257032",
});

const db = getFirestore();

export const addUserProducts = (userId, products) => {
  return setDoc(doc(db, "products", userId.toString()), {
    products,
    userId,
  });
};
