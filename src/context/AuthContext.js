import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithCredential,
} from 'firebase/auth';
import {
  doc, setDoc, getDoc, updateDoc, serverTimestamp,
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { auth, db, storage } from '../config/firebase';

// 🔴 Pon aquí tu UID de admin
const ADMIN_UID = 'TU_UID_DE_ADMIN';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const isAdmin = user?.uid === ADMIN_UID;

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        // Intentar cargar perfil — si Firestore falla no rompe la app
        try {
          await loadProfile(firebaseUser.uid);
        } catch (e) {
          console.warn('No se pudo cargar el perfil:', e.message);
        }
      } else {
        // Limpiar estado ANTES de cualquier otra cosa
        setUser(null);
        setProfile(null);
      }
      setLoading(false);
    });

    return () => unsub(); // cancelar listener al desmontar
  }, []);

  async function loadProfile(uid) {
    const snap = await getDoc(doc(db, 'users', uid));
    if (snap.exists()) setProfile(snap.data());
  }

  // ── Registro con email ───────────────────────────────────────────────────
  async function register({ email, password, nombre, apellidos, edad }) {
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    const uid  = cred.user.uid;
    const profileData = {
      uid, email, nombre, apellidos, edad,
      photoURL: '',
      createdAt: serverTimestamp(),
    };
    await setDoc(doc(db, 'users', uid), profileData);
    setProfile(profileData);
    return cred.user;
  }

  // ── Login con email ──────────────────────────────────────────────────────
  async function login(email, password) {
    const cred = await signInWithEmailAndPassword(auth, email, password);
    try {
      await loadProfile(cred.user.uid);
    } catch (e) {
      console.warn('Perfil no disponible aún:', e.message);
    }
    return cred.user;
  }

  // ── Login con Google ─────────────────────────────────────────────────────
  async function loginWithGoogle(idToken) {
    const credential = GoogleAuthProvider.credential(idToken);
    const cred = await signInWithCredential(auth, credential);
    const uid  = cred.user.uid;

    try {
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
    } catch (e) {
      console.warn('Error guardando perfil de Google:', e.message);
    }

    return cred.user;
  }

  // ── Cerrar sesión ────────────────────────────────────────────────────────
  async function logout() {
    // Limpiar estado local PRIMERO para que ningún listener
    // intente acceder a Firestore con sesión cerrada
    setProfile(null);
    setUser(null);
    try {
      await signOut(auth);
    } catch (e) {
      console.warn('Error al cerrar sesión:', e.message);
    }
  }

  // ── Subir foto de perfil ─────────────────────────────────────────────────
  async function uploadProfilePhoto(uri) {
    if (!user) return;
    const uid      = user.uid;
    const response = await fetch(uri);
    const blob     = await response.blob();
    const sRef     = ref(storage, `profiles/${uid}.jpg`);
    await uploadBytes(sRef, blob);
    const url = await getDownloadURL(sRef);
    await updateDoc(doc(db, 'users', uid), { photoURL: url });
    setProfile((prev) => ({ ...prev, photoURL: url }));
    return url;
  }

  // ── Actualizar datos del perfil ──────────────────────────────────────────
  async function updateProfile(data) {
    if (!user) return;
    await updateDoc(doc(db, 'users', user.uid), data);
    setProfile((prev) => ({ ...prev, ...data }));
  }

  return (
    <AuthContext.Provider value={{
      user, profile, loading, isAdmin,
      register, login, loginWithGoogle,
      logout, uploadProfilePhoto, updateProfile,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth debe usarse dentro de AuthProvider');
  return ctx;
}