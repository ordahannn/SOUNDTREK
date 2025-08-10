// React
import { useEffect } from "react";
import { AppState, AppStateStatus } from "react-native";

// Expo
import { router } from "expo-router";

// Services
import { clearSession, updateLastActiveTime, isSessionValid } from "@/services/sessionService";

export const useActivityTracker = () => {
  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout> | null = null;

    const logoutUser = async () => {
      await clearSession();
      router.replace("/auth/splash-screen");
    };

    const resetTimer = async () => {
      if (timeoutId) clearTimeout(timeoutId);
      const valid = await isSessionValid();
      if (!valid) {
        logoutUser();
        return;
      }
      await updateLastActiveTime();
      
      timeoutId = setTimeout(logoutUser, 24 * 60 * 60 * 1000);
    };

    const subscription = AppState.addEventListener("change", (nextAppState: AppStateStatus) => {
      if (nextAppState === "active") {
        resetTimer();
      } else if (timeoutId) {
        clearTimeout(timeoutId);
      }
    });

    resetTimer();

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
      subscription.remove();
    };
  }, []);
};