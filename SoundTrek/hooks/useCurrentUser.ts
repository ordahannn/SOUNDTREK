// React
import { useEffect, useState } from "react";

// Types
import { AppUser } from "@/types/AppUser";

// Services
import { getUser, isSessionValid } from "@/services/sessionService";

/**
    useCurrentUser - Retrieves and returns the currently signed-in user, if session is still valid.
 
    * @returns An object with { user: AppUser | null, loading: boolean, isLoggedIn: boolean }
**/
export function useCurrentUser(): {
  user: AppUser | null;
  loading: boolean;
  isLoggedIn: boolean;
} {
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const loadUser = async () => {
      const valid = await isSessionValid();
      if (valid) {
        const storedUser = await getUser();
        setUser(storedUser);
        setIsLoggedIn(true);
      } else {
        setUser(null);
        setIsLoggedIn(false);
      }
      setLoading(false);
    };

    loadUser();
  }, []);

  return { user, loading, isLoggedIn };
}
