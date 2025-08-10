import { useEffect, useState } from "react";
import { getUser, isSessionValid } from "@/services/sessionService";
import { AppUser } from "@/types/AppUser";

/**
 * useSessionRestore - Loads the current user from storage if session is valid.
 *
 * @returns { user, loading } - The AppUser and loading flag
 */
export function useSessionRestore(): { user: AppUser | null; loading: boolean } {
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const restore = async () => {
      const valid = await isSessionValid();
      if (valid) {
        const storedUser = await getUser();
        setUser(storedUser);
      } else {
        setUser(null);
      }
      setLoading(false);
    };

    restore();
  }, []);

  return { user, loading };
}