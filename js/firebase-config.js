// Copy the Firebase config object from Firebase Console > Project settings > Your apps.
// These public web app values identify the Firebase project; Security Rules control access.
export const firebaseConfig = {
  apiKey: "AIzaSyCVk4z3Gh9Q5PDiXm5WMzSVn3Hl8gRYLdg",
  authDomain: "shield-ent.firebaseapp.com",
  projectId: "shield-ent",
  storageBucket: "shield-ent.firebasestorage.app",
  messagingSenderId: "36980301310",
  appId: "1:36980301310:web:a43de6780809a90c52b4af",
  measurementId: "G-2RFHJLHWFT"
};

export const firebaseReady = !Object.values(firebaseConfig).some(value => value.startsWith("REPLACE_"));
