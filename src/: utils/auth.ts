import { collection, doc, getDocs, setDoc, deleteDoc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase/config';

const PASSWORD_KEY = 'sahil_master_password';
const CURRENT_USER_KEY = 'sahil_master_current_user';
const CURRENT_ROLE_KEY = 'sahil_master_current_role';

export interface AppUser {
  id: string;
  username: string;
  password?: string;
  isActive: boolean;
  createdAt: string;
}

export const getPassword = () => {
  return localStorage.getItem(PASSWORD_KEY) || 'admin123';
};

export const setPassword = (newPassword: string) => {
  localStorage.setItem(PASSWORD_KEY, newPassword);
};

export const checkPassword = (password: string) => {
  return password === getPassword();
};

export const getUsers = async (): Promise<AppUser[]> => {
  try {
    const snap = await getDocs(collection(db, 'users'));
    const users: AppUser[] = [];
    snap.forEach(doc => users.push(doc.data() as AppUser));
    return users;
  } catch (error) {
    console.error('Error fetching users:', error);
    return [];
  }
};

export const addUser = async (username: string, password?: string): Promise<AppUser> => {
  const users = await getUsers();
  if (users.find(u => u.username.toLowerCase() === username.toLowerCase())) {
    throw new Error('User already exists');
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
