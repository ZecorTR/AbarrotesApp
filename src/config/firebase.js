import { initializeApp } from 'firebase/app';
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import AsyncStorage from '@react-native-async-storage/async-storage';

// 🔴 REEMPLAZA estos valores con los de tu proyecto Firebase
const firebaseConfig = {
  apiKey: "AIzaSyBDq7zEgWioaPYQzzs9nUeQAnJl3z8DyiM",
  authDomain: "abarrotes-app-e28b9.firebaseapp.com",
  projectId: "abarrotes-app-e28b9",
  storageBucket: "abarrotes-app-e28b9.firebasestorage.app",
  messagingSenderId: "729938513547",
  appId: "1:729938513547:web:ad924e4cfb0283916cce8e",
  measurementId: "G-MKVRGZPLDS"
};
const app = initializeApp(firebaseConfig);

// Auth con persistencia en AsyncStorage (para React Native)
export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage),
});

export const db = getFirestore(app);
export const storage = getStorage(app);