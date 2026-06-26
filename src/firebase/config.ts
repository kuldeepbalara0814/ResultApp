import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyC0JdILxLtX7QAwUizDxV2Imb96_sCpq88",
  authDomain: "zesty-case-12t1j.firebaseapp.com",
  projectId: "zesty-case-12t1j",
  storageBucket: "zesty-case-12t1j.firebasestorage.app",
  messagingSenderId: "1053905583961",
  appId: "1:1053905583961:web:4c31fe2c6ae8fe14bb5648",
  measurementId: ""
};

const app = initializeApp(firebaseConfig);

// यहाँ हमने आपका खास Database ID डाल दिया है, जिससे डेटाबेस सही से कनेक्ट होगा
export const db = getFirestore(app, "ai-studio-c7f160bc-3419-4bd9-9bf4-816c1c7b4581");
