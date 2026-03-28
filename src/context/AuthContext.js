import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithCredential,
} from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { auth, db, storage } from '../config/firebase';

// 🔴 Pon aquí tu UID de admin (lo encuentras en Firebase Auth después de crear tu cuenta)
const ADMIN_UID = '7YinpY5QzFbjxTXdfLHYjTB4Jhk1';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);       // datos de Firebase Auth
  const [profile, setProfile] = useState(null); // datos de Firestore
  const [loading, setLoading] = useState(true);

  const isAdmin = user?.uid === ADMIN_UID;

  // Escuchar cambios de sesión
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        await loadProfile(firebaseUser.uid);
      } else {
        setUser(null);
        setProfile(null);
      }
      setLoading(false);
    });
    return unsub;
  }, []);

  async function loadProfile(uid) {
    const snap = await getDoc(doc(db, 'users', uid));
    if (snap.exists()) setProfile(snap.data());
  }

  // Registro con email
  async function register({ email, password, nombre, apellidos, edad }) {
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    const uid = cred.user.uid;
    const profileData = {
      uid,
      email,
      nombre,
      apellidos,
      edad,
      photoURL: '',
      createdAt: serverTimestamp(),
    };
    await setDoc(doc(db, 'users', uid), profileData);
    setProfile(profileData);
    return cred.user;
  }

  // Login con email
  async function login(email, password) {
    const cred = await signInWithEmailAndPassword(auth, email, password);
    await loadProfile(cred.user.uid);
    return cred.user;
  }

  // Login con Google (usa expo-auth-session)
  async function loginWithGoogle(idToken) {
    const credential = GoogleAuthProvider.credential(idToken);
    const cred = await signInWithCredential(auth, credential);
    const uid = cred.user.uid;

    // Si es la primera vez, crear perfil con datos de Google
    const snap = await getDoc(doc(db, 'users', uid));
    if (!snap.exists()) {
      const [nombre, ...rest] = (cred.user.displayName || 'Usuario').split(' ');
      const profileData = {
        uid,
        email: cred.user.email,
        nombre: nombre || '',
        apellidos: rest.join(' ') || '',
        edad: '',
        photoURL: cred.user.photoURL || '',
        createdAt: serverTimestamp(),
      };
      await setDoc(doc(db, 'users', uid), profileData);
      setProfile(profileData);
    } else {
      setProfile(snap.data());
    }
    return cred.user;
  }

  // Cerrar sesión
  async function logout() {
    await signOut(auth);
  }

  // Subir foto de perfil
  async function uploadProfilePhoto(uri) {
    const uid = user.uid;
    const response = await fetch(uri);
    const blob = await response.blob();
    const storageRef = ref(storage, `profiles/${uid}.jpg`);
    await uploadBytes(storageRef, blob);
    const url = await getDownloadURL(storageRef);
    await updateDoc(doc(db, 'users', uid), { photoURL: url });
    setProfile((prev) => ({ ...prev, photoURL: url }));
    return url;
  }

  // Actualizar datos del perfil
  async function updateProfile(data) {
    await updateDoc(doc(db, 'users', user.uid), data);
    setProfile((prev) => ({ ...prev, ...data }));
  }

  return (
    <AuthContext.Provider value={{
      user, profile, loading, isAdmin,
      register, login, loginWithGoogle, logout,
      uploadProfilePhoto, updateProfile,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}