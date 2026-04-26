import { auth, db, analytics } from "./firebase";
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

// Helper to track events
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

// Sync local data to Firestore (Merging)
export const syncDataToFirestore = async (uid: string) => {
  if (!db) return;
  const localData = getLocalData();
  
  try {
    const userDoc = doc(db, "users", uid);
    const sessionDoc = doc(collection(userDoc, "sessions"), "default");
    const snap = await getDoc(sessionDoc);
    
    let mergedData = localData;
    if (snap.exists()) {
      const remoteData = snap.data() as SessionData;
      // Smart Merge: Checklist (Union), Scores (Max)
      mergedData = {
        ...remoteData,
        ...localData,
        checklistCompletion: Array.from(new Set([...(remoteData.checklistCompletion || []), ...(localData.checklistCompletion || [])])),
        quizScore: Math.max(remoteData.quizScore || 0, localData.quizScore || 0),
        // Prefer local voter type if just set, otherwise keep remote
        voterType: localData.voterType || remoteData.voterType
      };
    }

    await setDoc(sessionDoc, mergedData, { merge: true });
    saveLocalData(mergedData); // Update local cache with merged results
    console.log("Data synced and merged to Firestore");
  } catch (error) {
    console.error("Sync failed:", error);
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
    } catch (error) {
      console.error("Firestore load failed, using local fallback:", error);
    }
  }
  return getLocalData();
};

// Save session (handles both local and remote)
export const saveSession = async (data: Partial<SessionData>, uid?: string) => {
  const updated = saveLocalData(data);
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
