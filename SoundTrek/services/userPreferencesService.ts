// Helpers
import { API_ENDPOINTS } from "@/helpers/api-helper";

// Types
import { Language } from "@/types/Language";
import { Interest } from "@/types/Interest";

/**
  Fetch all available languages from the server.
**/
export const fetchLanguages = async(): Promise<Language[]> => {
    const response = await fetch(API_ENDPOINTS.getAllLanguages);

    if (!response.ok) 
        throw new Error("Failed to fetch languages");

    return response.json();
};

/**
  Update user's preferred language

  @param userId - User's ID
  @param languageName - New preferred language (e.g., "French")
**/
export const updatePreferredLanguage = async (
  userId: number,
  languageName: string
): Promise<void> => {
  const response = await fetch(API_ENDPOINTS.updatePreferredLanguage, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId, languageName }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Failed to update language: ${text}`);
  }
};

/**
  Update user's search radius
  
  @param userId - User's ID
  @param radius - Radius in meters (between 2000–10000)
**/
export const updateSearchRadius = async (
  userId: number,
  radius: number
): Promise<void> => {
  const response = await fetch(API_ENDPOINTS.updateSearchRadius, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId, radius }),
  });

  const text = await response.text();

  if (!response.ok) {
    console.error("Server response:", text);
    throw new Error(`Failed to update search radius: ${text}`);
  }

  console.log("Search radius updated:", text);
};


/**
  Fetch all available languages from the server.

  @returns A promise resolving to an array of Interest objects
**/
export const fetchInterests = async (): Promise<Interest[]> => {
  const response = await fetch(API_ENDPOINTS.getAllInterests);
  if (!response.ok) throw new Error("Failed to fetch interests");
  return response.json();
};

/**
  Add a single interest for a user.

  @param userId - The user's ID
  @param interestId - The interest ID to add
  @returns A promise resolving when the interest is added
**/
export const addUserInterest = async (userId: number, interestId: number): Promise<void> => {
  const response = await fetch(API_ENDPOINTS.addUserInterest, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId, interestId }),
  });

  if (!response.ok) throw new Error("Failed to add interest");
};

/**
  Remove a single interest from a user.

  @param userId - The user's ID
  @param interestId - The interest ID to add
  @returns A promise resolving when the interest is removed
**/
export const removeUserInterest = async (userId: number, interestId: number): Promise<void> => {
  const response = await fetch(API_ENDPOINTS.removeUserInterest, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId, interestId }),
  });

  if (!response.ok) throw new Error("Failed to remove interest");
};

/**
  Set the full list of selected interests for a user.
 
  @param userId The user's ID
  @param interestIds Array of selected interest IDs (must be 3–5 elements)
  @returns A promise resolving when the update is complete
  @throws Error if the server call fails
**/
export const updateUserInterests = async (
  userId: number,
  interestIds: number[]
): Promise<void> => {
  if (interestIds.length < 3 || interestIds.length > 5) {
    throw new Error("You must select between 3 to 5 interests");
  }

  const response = await fetch(API_ENDPOINTS.updateUserInterests, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId, interestIds }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Failed to update user interests: ${text}`);
  }
};