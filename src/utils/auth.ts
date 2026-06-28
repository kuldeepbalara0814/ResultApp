import { collection, doc, getDocs, setDoc, deleteDoc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase/config';

const CURRENT_USER_KEY = 'sahil_master_current_user';
const CURRENT_ROLE_KEY = 'sahil_master_current_role';

export interface AppUser {
  id: string;
  username: string;
  password?: string;
  isActive: boolean;
  createdAt: string;
}

// -----------------------------------------------------
// 1. ADMIN PASSWORD MANAGEMENT (100% FIREBASE LIVE)
// -----------------------------------------------------
export const getAdminPassword = async (): Promise<string> => {
  try {
    const docRef = doc(db, 'settings', 'admin');
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      return snap.data().password;
    } else {
      // अगर डेटाबेस में पासवर्ड नहीं है, तो डिफ़ॉल्ट 'admin123' सेट करें
      await setDoc(docRef, { password: 'admin123' });
      return 'admin123';
    }
  } catch (error) {
    console.error('एडमिन पासवर्ड निकालने में एरर:', error);
    return 'admin123';
  }
};

export const updateAdminPassword = async (newPassword: string) => {
  try {
    const docRef = doc(db, 'settings', 'admin');
    await setDoc(docRef, { password: newPassword }, { merge: true });
    return true;
  } catch (error) {
    console.error('एडमिन पासवर्ड अपडेट करने में एरर:', error);
    throw error;
  }
};

export const checkAdminPassword = async (password: string): Promise<boolean> => {
  const currentPassword = await getAdminPassword();
  return password === currentPassword;
};


// -----------------------------------------------------
// 2. USER MANAGEMENT (100% FIREBASE LIVE)
// -----------------------------------------------------
export const getUsers = async (): Promise<AppUser[]> => {
  try {
    const snap = await getDocs(collection(db, 'users'));
    const users: AppUser[] = [];
    snap.forEach(document => users.push(document.data() as AppUser));
    return users;
  } catch (error) {
    console.error('यूज़र्स निकालने में एरर:', error);
    return [];
  }
};

export const addUser = async (username: string, password?: string): Promise<AppUser> => {
  const users = await getUsers();
  if (users.find(u => u.username.toLowerCase() === username.toLowerCase())) {
    throw new Error('यह यूज़र पहले से मौजूद है');
  }

  const id = Date.now().toString();
  const newUser: AppUser = {
    id,
    username,
    password,
    isActive: true,
    createdAt: new Date().toISOString()
  };
  
  await setDoc(doc(db, 'users', id), newUser);
  return newUser;
};

export const toggleUserAccess = async (id: string) => {
  try {
    const userRef = doc(db, 'users', id);
    const snap = await getDoc(userRef);
    if (snap.exists()) {
      await updateDoc(userRef, { isActive: !snap.data().isActive });
    }
  } catch (e) {
    console.error(e);
  }
};

export const deleteUser = async (id: string) => {
  try {
    await deleteDoc(doc(db, 'users', id));
  } catch (e) {
    console.error(e);
  }
};

// नया फंक्शन: यूज़र का पासवर्ड Firebase में लाइव अपडेट करने के लिए
export const updateUserPassword = async (id: string, newPassword: string) => {
  try {
    const userRef = doc(db, 'users', id);
    await updateDoc(userRef, { password: newPassword });
    return true;
  } catch (error) {
    console.error("यूज़र पासवर्ड अपडेट करने में एरर:", error);
    throw error;
  }
};

export const checkUserLogin = async (username: string, password?: string): Promise<boolean | 'inactive' | 'not_found'> => {
  try {
    const users = await getUsers();
    const user = users.find(u => u.username.toLowerCase() === username.toLowerCase());
    
    if (!user) return 'not_found';
    if (!user.isActive) return 'inactive';
    if (user.password && user.password !== password) return false;
    
    return true;
  } catch (error) {
    console.error(error);
    return 'not_found';
  }
};


// -----------------------------------------------------
// 3. SESSION MANAGEMENT (LOCAL)
// -----------------------------------------------------
export const loginUser = (name: string, role: 'admin' | 'user' | 'guest') => {
  sessionStorage.setItem(CURRENT_USER_KEY, name);
  sessionStorage.setItem(CURRENT_ROLE_KEY, role);
  sessionStorage.setItem('is_auth', 'true');
};

export const logoutUser = () => {
  sessionStorage.removeItem(CURRENT_USER_KEY);
  sessionStorage.removeItem(CURRENT_ROLE_KEY);
  sessionStorage.removeItem('is_auth');
};

export const getCurrentUser = () => sessionStorage.getItem(CURRENT_USER_KEY) || 'Guest';
export const getCurrentRole = () => sessionStorage.getItem(CURRENT_ROLE_KEY) || 'guest';
