import { db, analytics } from "./firebase";
import { doc, setDoc, getDoc, collection } from "firebase/firestore";
import { logEvent } from "firebase/analytics";

export interface SessionData {
  quizScore?: number;
  checklistCompletion?: number[];
  certificateMeta?: {
    name: string;
    date: string;
  };
  voterType?: 'first' | 'returning';
}

const LOCAL_STORAGE_KEY = "civic_assistant_session";
const CACHE_USER_KEY = "civic_assistant_user_cache";

/**
 * Tracks custom analytics events to Firebase.
 * @param eventName Name of the event to track.
 * @param params Additional metadata for the event.
 */
export const trackEvent = async (eventName: string, params?: object) => {
  const a = await analytics;
  if (a) {
    logEvent(a, eventName, params);
  }
  console.log(`[Analytics] ${eventName}`, params);
};

// Get local data
export const getLocalData = (): SessionData => {
  if (typeof window === "undefined") return {};
  const data = localStorage.getItem(LOCAL_STORAGE_KEY);
  return data ? JSON.parse(data) : {};
};

// Save local data
export const saveLocalData = (data: Partial<SessionData>) => {
  if (typeof window === "undefined") return;
  const current = getLocalData();
  const updated = { ...current, ...data };
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
  return updated;
};

/**
 * Merges local session data with Firestore remote data.
 * Uses 'Smart Merge': Max score for quizzes, Union for checklist IDs.
 * @param uid The authenticated user ID.
 * @returns Object indicating if this is a returning user.
 */
export const syncDataToFirestore = async (uid: string): Promise<{ isReturning: boolean }> => {
  if (!db) return { isReturning: false };
  const localData = getLocalData();
  let isReturning = false;
  
  try {
    const userDoc = doc(db, "users", uid);
    const sessionDoc = doc(collection(userDoc, "sessions"), "default");
    const snap = await getDoc(sessionDoc);
    
    let mergedData = localData;
    if (snap.exists()) {
      isReturning = true;
      const remoteData = snap.data() as SessionData;
      // Smart Merge: Checklist (Union), Scores (Max)
      mergedData = {
        ...remoteData,
        ...localData,
        checklistCompletion: Array.from(new Set([...(remoteData.checklistCompletion || []), ...(localData.checklistCompletion || [])])),
        quizScore: Math.max(remoteData.quizScore || 0, localData.quizScore || 0),
        voterType: localData.voterType || remoteData.voterType
      };
    }

    await setDoc(sessionDoc, mergedData, { merge: true });
    saveLocalData(mergedData); // Update local cache with merged results
    console.log("Data synced and merged to Firestore");
    return { isReturning };
  } catch (error) {
    console.error("Sync failed:", error);
    return { isReturning: false };
  }
};

// Load data from Firestore or Local
export const loadSession = async (uid?: string): Promise<SessionData> => {
  if (uid && db) {
    try {
      const userDoc = doc(db, "users", uid);
      const sessionDoc = doc(collection(userDoc, "sessions"), "default");
      const snap = await getDoc(sessionDoc);
      if (snap.exists()) {
        const remoteData = snap.data() as SessionData;
        saveLocalData(remoteData);
        return remoteData;
      }
    } catch (error: unknown) {
      console.error("Firestore load failed, using local fallback:", error);
    }
  }
  return getLocalData();
};

// Save session (handles both local and remote)
export const saveSession = async (data: Partial<SessionData>, uid?: string) => {
  saveLocalData(data);
  if (uid && db) {
    try {
      const userDoc = doc(db, "users", uid);
      const sessionDoc = doc(collection(userDoc, "sessions"), "default");
      await setDoc(sessionDoc, data, { merge: true });
      trackEvent("data_saved_remote", { uid });
    } catch (error) {
      console.error("Firestore save failed:", error);
    }
  }
};

// User info caching for fast reload
export const cacheUserInfo = (user: { uid: string, displayName: string | null, photoURL: string | null } | null) => {
  if (typeof window === "undefined") return;
  if (user) {
    localStorage.setItem(CACHE_USER_KEY, JSON.stringify(user));
  } else {
    localStorage.removeItem(CACHE_USER_KEY);
  }
};

export const getCachedUser = () => {
  if (typeof window === "undefined") return null;
  const data = localStorage.getItem(CACHE_USER_KEY);
  return data ? JSON.parse(data) : null;
};
