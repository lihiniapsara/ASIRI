// userService.ts
import type {User} from "../types/User.ts";
import { db } from "../../firebase";
import { collection, addDoc, getDocs } from "firebase/firestore";

const usersCollectionRef = collection(db, 'users');

export const registerUser = async (user: User) => {
  try {
    const docRef = await addDoc(usersCollectionRef, {
      ...user,
      createdAt: new Date().toISOString(),
    });
    console.log('User registered with ID: ', docRef.id);
    localStorage.setItem('user', JSON.stringify(user));
    return { success: true, userId: docRef.id };
  } catch (error) {
    console.error('Error adding user: ', error);
    return { success: false, error };
  }
};

export const getUsers = async () => {
  try {
    const querySnapshot = await getDocs(usersCollectionRef);
    const users = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    return { success: true, data: users };
  } catch (error) {
    console.error('Error getting users: ', error);
    return { success: false, error };
  }
};