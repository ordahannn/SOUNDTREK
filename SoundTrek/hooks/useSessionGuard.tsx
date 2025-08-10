// React
import { useEffect } from "react";

// Expo
import { useRouter } from "expo-router";

// Services 
import { getUser } from "@/services/sessionService";

export function useSessionGuard() {
  const router = useRouter();

  useEffect(() => {
    async function checkSession() {
      const user = await getUser();
      if (!user) {
        console.log("[SessionGuard] No user session found. Redirecting to signin.");
        router.replace("/auth/signin");
      } else {
      }
    }
    checkSession();
  }, []);
}
