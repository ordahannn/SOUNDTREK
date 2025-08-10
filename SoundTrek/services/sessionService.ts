// React
import AsyncStorage from "@react-native-async-storage/async-storage";

// Helpers
import { STORAGE_KEYS } from "@/helpers/storage-keys";

// Keys used to store session data in AsyncStorage
const TOKEN_KEY = STORAGE_KEYS.UserToken; // JWT token
const USER_DATA = STORAGE_KEYS.UserData; // Last activity timestamp
const LAST_ACTIVE_KEY = STORAGE_KEYS.LastActiveTime; // User object

/**
    Stores the user's session information (token, user object, timestamp).
    This function saves all relevant login session data to AsyncStorage.
 
    * @param token JWT token received from server
    * @param user User object received from server
**/
export async function storeSession(token: string, user: any): Promise<void> {
    await AsyncStorage.setItem(TOKEN_KEY, token);
    await AsyncStorage.setItem(USER_DATA, JSON.stringify(user));
    await AsyncStorage.setItem(LAST_ACTIVE_KEY, Date.now().toString());
}

/**
    Retrieves the saved token from AsyncStorage.

    * @returns The JWT token string or null if not found
**/
export async function getToken(): Promise<string | null> {
    return await AsyncStorage.getItem(TOKEN_KEY);
}

/**
    Retrieves the saved user object from AsyncStorage.

    * @returns The parsed user object or null if not found
**/
export async function getUser(): Promise<any | null> {
    const userStr = await AsyncStorage.getItem(USER_DATA);
    return userStr ? JSON.parse(userStr) : null;
}

/**
    Clears all session-related data from AsyncStorage.
    This function should be called on logout.
**/
export async function clearSession(): Promise<void> {
    await AsyncStorage.multiRemove([TOKEN_KEY, USER_DATA, LAST_ACTIVE_KEY]); // multiRemove to delete number of values at the same time
}

/**
    Checks whether the session is still valid.
    A session is considered valid if the last activity was within the last 5 minutes.

    * @returns True if session is valid, false otherwise
**/
export async function isSessionValid(): Promise<boolean> {
    const last = await AsyncStorage.getItem(LAST_ACTIVE_KEY);
    if (!last) return false;
  
    const elapsed = Date.now() - parseInt(last); // Difference in ms
     // 24 hours in milliseconds
    return elapsed < 24 * 60 * 60 * 1000;
}

/**
    Update last time user was active.
**/
export async function updateLastActiveTime(): Promise<void> {
  await AsyncStorage.setItem("lastActiveTime", Date.now().toString());
}