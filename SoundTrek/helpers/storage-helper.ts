// React
import AsyncStorage from "@react-native-async-storage/async-storage";

// Types
import { SelectedLandmark } from "@/types/SelectedLandmark";

// Keys
import { STORAGE_KEYS } from "./storage-keys";

/**
 * Saves a generic object to AsyncStorage under the given key.
 * @template T - The type of the value to be saved
 * @param key - The key under which to store the value
 * @param value - The object to save
**/
export const saveToStorage = async <T>(key: string, value: T | null): Promise<void> => {
    try {
        const jsonValue = JSON.stringify(value);
        await AsyncStorage.setItem(key, jsonValue);
        
        // console.log(`[storageHelper] Saved to ${key}`);
    } catch (error) {
        // console.error(`[storageHelper] Failed to save to ${key}:`, error);
    }
};

/**
 * Loads a generic object from AsyncStorage by the given key.
 * @template T - The expected type of the returned value
 * @param key - The key to retrieve from AsyncStorage
 * @returns The parsed object, or null if not found
**/
export const loadFromStorage = async <T>(key: string): Promise<T | null> => {
    try {
        const jsonValue = await AsyncStorage.getItem(key);
        if (!jsonValue) {
            // console.log(`[storageHelper] No data found for key ${key}`); // log
            return null;
        }

        const parsedValue: T = JSON.parse(jsonValue);
        // console.log(`[storageHelper] Loaded from ${key}:`, parsedValue); // log
        return parsedValue;
    } catch (error) {
        console.error(`[storageHelper] Failed to load from ${key}:`, error); // log
        return null;
    }
};


/**
 * Saves the currently selected landmark to AsyncStorage.
 * @param landmark - The updated landmark object to save in AsyncStorage
**/
export const setSelectedLandmark = async (landmark: SelectedLandmark): Promise<void> => {
    await saveToStorage<SelectedLandmark>(STORAGE_KEYS.SelectedLandmark, landmark);
};


/**
 * Loads the currently selected landmark from AsyncStorage.
 * @returns The selected landmark object, or null if not found.
**/
export const getSelectedLandmark = async (): Promise<SelectedLandmark | null> => {
    return await loadFromStorage<SelectedLandmark>(STORAGE_KEYS.SelectedLandmark);
};


/**
 * Clear all relevant local storage keys on logout.
 */
export const clearAllStorageData = async (): Promise<void> => {
  const keysToRemove = [
    STORAGE_KEYS.SavedCustomRoute,
    STORAGE_KEYS.SavedRecommendedRoute,
    STORAGE_KEYS.SelectedRouteType,
    STORAGE_KEYS.SelectedLandmark,
    STORAGE_KEYS.SelectedLandmarks,
    STORAGE_KEYS.ListenedLandmarks,
    STORAGE_KEYS.FromCustomRoute,
    STORAGE_KEYS.FromRecommendedOriginal,
    STORAGE_KEYS.FromRecommendedRoute,
    STORAGE_KEYS.FromProfile,
    STORAGE_KEYS.UserToken,
    STORAGE_KEYS.LastActiveTime,
    STORAGE_KEYS.UserData,
    STORAGE_KEYS.NearbyLandmarks,
    STORAGE_KEYS.RecommendedLandmarks,
    STORAGE_KEYS.UserLastLocation,
  ];

  try {
    await AsyncStorage.multiRemove(keysToRemove);
    console.log("All relevant local storage keys cleared.");
  } catch (error) {
    console.error("Failed to clear storage keys:", error);
  }
};

/**
    Removes the selected route from AsyncStorage.

    @param key - the storage key to remove (e.g. STORAGE_KEYS.SavedCustomRoute or STORAGE_KEYS.SavedRecommendedRoute)
**/
export const removeSelectedRoute = async (key: string): Promise<void> => {
  try {
    await AsyncStorage.removeItem(key);
    console.log(`[storageHelper] Route removed for key: ${key}`);
  } catch (error) {
    console.error(`[storageHelper] Failed to remove route for key ${key}:`, error);
  }
};

export const markLandmarkAsListened = async (pageId: string): Promise<void> => {
  try {
    const existing = await AsyncStorage.getItem(STORAGE_KEYS.ListenedLandmarks);
    let listened: string[] = existing ? JSON.parse(existing) : [];

    if (!listened.includes(pageId)) {
      listened.push(pageId);
      await AsyncStorage.setItem(STORAGE_KEYS.ListenedLandmarks, JSON.stringify(listened));
    }
  } catch (error) {
    console.error("Failed to mark landmark as listened:", error);
  }
};
