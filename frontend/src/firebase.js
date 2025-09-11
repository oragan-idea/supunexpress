import { initializeApp } from "firebase/app";
import {
  GoogleAuthProvider,
  getAuth,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail as firebaseSendPasswordResetEmail,
  signOut,
} from "firebase/auth";
import {
  getFirestore,
  query,
  getDocs,
  collection,
  where,
  addDoc,
} from "firebase/firestore";

// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyCoamvgAPhmChUsyGwbRlF6_Otibyrtfns",
  authDomain: "supunexpress-e0654.firebaseapp.com",
  projectId: "supunexpress-e0654",
  storageBucket: "supunexpress-e0654.firebasestorage.app",
  messagingSenderId: "137995043873",
  appId: "1:137995043873:web:5c2c472e7a53797adf0f60",
  measurementId: "G-GRGV4CX7LV",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const googleProvider = new GoogleAuthProvider();

// Google login
const signInWithGoogle = async () => {
  try {
    const response = await signInWithPopup(auth, googleProvider);
    const user = response.user;

    // Check if user exists in Firestore
    const q = query(collection(db, "users"), where("uid", "==", user.uid));
    const docs = await getDocs(q);

    if (docs.docs.length === 0) {
      // Add new user to Firestore
      await addDoc(collection(db, "users"), {
        uid: user.uid,
        name: user.displayName,
        authProvider: "google",
        email: user.email,
      });
    }
  } catch (error) {
    console.error("Google sign-in error:", error.message);
    alert(error.message);
  }
};

// Email/password login
const logInWithEmailAndPassword = async (email, password) => {
  try {
    return await signInWithEmailAndPassword(auth, email, password);
  } catch (error) {
    console.error("Login error:", error.message);
    throw error; // 🔴 re-throw so Login.jsx can catch it
  }
};


// Register new user with email/password
const registerWithEmailAndPassword = async (name, email, password) => {
  try {
    const response = await createUserWithEmailAndPassword(auth, email, password);
    const user = response.user;

    await addDoc(collection(db, "users"), {
      uid: user.uid,
      name,
      authProvider: "local",
      email,
    });
  } catch (error) {
    console.error("Registration error:", error.message);
  }
};

// Reset password
const sendPasswordReset = async (email) => {
  try {
    await firebaseSendPasswordResetEmail(auth, email);
    alert("Password reset email sent!");
  } catch (error) {
    console.error("Password reset error:", error.message);
  }
};

// Logout
const logOut = () => {
  signOut(auth);
};

// Exports
export {
  auth,
  db,
  logInWithEmailAndPassword,
  registerWithEmailAndPassword,
  signInWithGoogle,
  sendPasswordReset,
  logOut,
};
