// React
import AsyncStorage from "@react-native-async-storage/async-storage";

// Expo
import { router } from "expo-router";

// Services
import { clearSession, getUser } from "@/services/sessionService";

// Helpers
import { clearAllStorageData } from "@/helpers/storage-helper";

/**
    handleLogout - Logs out the user by clearing session data and redirecting to splash screen.
**/
export const handleLogout = async () => {
  const user = await getUser();

  if (user) {
    // console.log("[Logged out User]:", user);
  } else {
    // console.log("No user was logged in.");
  }

  // Clear session (token + user)
  await clearSession();

  // Clear additional local data
  await clearAllStorageData();

  await AsyncStorage.clear();

  // Navigate to splash screen
  router.replace("/auth/splash-screen");
};