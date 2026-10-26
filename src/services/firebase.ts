import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  signInWithPopup, 
  GoogleAuthProvider, 
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User
} from 'firebase/auth';

export { onAuthStateChanged, type User };
import { 
  getFirestore, 
  doc, 
  getDocFromServer, 
  setDoc, 
  getDoc,
  collection, 
  onSnapshot,
  query,
  deleteDoc,
  getDocs
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import { TaskCard, UserProfile, DenemeRecord } from '../types';

// Initialize Firebase App
const app = initializeApp(firebaseConfig);

// Initialize Firestore with specific firestoreDatabaseId (CRITICAL)
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

// Initialize Auth
export const auth = getAuth(app);

// Google Auth Provider
export const googleProvider = new GoogleAuthProvider();

// Error Handling Specification
export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Mandatory testConnection function
export async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error("Please check your Firebase configuration.");
    }
  }
}
testConnection();

// Authentication Helpers
export async function signInWithGoogle() {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (error) {
    console.error("Google sign-in error:", error);
    throw error;
  }
}

export async function logOut() {
  try {
    await firebaseSignOut(auth);
  } catch (error) {
    console.error("Logout error:", error);
    throw error;
  }
}

// ---------------------------------------------------------------------------
// FIRESTORE SYNC HELPERS (Two-way synchronization between Firestore and local state)
// ---------------------------------------------------------------------------

// 1. Sync User Profile
export async function syncUserProfileToFirestore(userId: string, profile: UserProfile) {
  const path = `users/${userId}`;
  try {
    await setDoc(doc(db, 'users', userId), {
      uid: userId,
      name: profile.name,
      email: auth.currentUser?.email || '',
      targetGoal: profile.targetGoal || '',
      targetExamRank: profile.targetExamRank || '',
      targetDepartment: profile.targetDepartment || '',
      yksField: profile.yksField || 'Sayısal',
      totalFocusMinutes: profile.totalFocusMinutes || 0,
      treePoints: profile.treePoints || 0,
      roomCode: profile.roomCode || '',
      themeMode: profile.themeMode || 'dark',
      updatedAt: new Date().toISOString()
    }, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function fetchUserProfileFromFirestore(userId: string): Promise<Partial<UserProfile> | null> {
  const path = `users/${userId}`;
  try {
    const snap = await getDoc(doc(db, 'users', userId));
    if (snap.exists()) {
      return snap.data() as Partial<UserProfile>;
    }
    return null;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
  }
}

// 2. Sync Task
export async function syncTaskToFirestore(userId: string, task: TaskCard) {
  const path = `users/${userId}/tasks/${task.id}`;
  try {
    await setDoc(doc(db, 'users', userId, 'tasks', task.id), {
      ...task,
      ownerId: userId
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function deleteTaskFromFirestore(userId: string, taskId: string) {
  const path = `users/${userId}/tasks/${taskId}`;
  try {
    await deleteDoc(doc(db, 'users', userId, 'tasks', taskId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

// 3. Sync Deneme
export async function syncDenemeToFirestore(userId: string, deneme: DenemeRecord) {
  const path = `users/${userId}/denemeler/${deneme.id}`;
  try {
    await setDoc(doc(db, 'users', userId, 'denemeler', deneme.id), {
      ...deneme,
      ownerId: userId
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function deleteDenemeFromFirestore(userId: string, denemeId: string) {
  const path = `users/${userId}/denemeler/${denemeId}`;
  try {
    await deleteDoc(doc(db, 'users', userId, 'denemeler', denemeId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}
