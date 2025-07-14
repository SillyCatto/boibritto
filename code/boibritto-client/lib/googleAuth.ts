import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDGIF4FWUdcMg2XYiGdYI9_YSfocdjF7pI",
  authDomain: "boibritto-a27da.firebaseapp.com",
  projectId: "boibritto-a27da",
  storageBucket: "boibritto-a27da.appspot.com",
  messagingSenderId: "284940441348",
  appId: "1:284940441348:web:0b904bca389f897b7b6251"
};

// if (!getApps().length) {
//   initializeApp(firebaseConfig);
// }
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

export function initFirebase() {
  if (!getApps().length) {
    initializeApp(firebaseConfig);
  }
}
export async function googleSignInPopup() {
  const auth = getAuth();
  const provider = new GoogleAuthProvider();
  const result = await signInWithPopup(auth, provider);
  const idToken = await result.user.getIdToken();
  return { user: result.user, idToken };
}

export const auth = getAuth(app);
export default app;