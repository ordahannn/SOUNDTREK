// Helpers
import { API_ENDPOINTS } from "@/helpers/api-helper";


// Fetch all genres from the server
export const fetchAllGenres = async () => {
  try {
    // const response = await fetch(`${SERVER_URL}/Genres`); // TODO: delete (old version)
    const response = await fetch(API_ENDPOINTS.getAllGenres);
    if (!response.ok) throw new Error('Failed to fetch genres');
    return await response.json();
  } catch (error) {
    console.error('API error:', error);
    throw error;
  }
};

// Fetch all supported languages from the server
export const fetchAllLanguages = async () => {
  try {
    //const response = await fetch(`${SERVER_URL}/Languages`); // TODO: delete (old version)
    const response = await fetch(API_ENDPOINTS.getAllLanguages);
    if (!response.ok) throw new Error('Failed to fetch languages');
    return await response.json();
  } catch (error) {
    console.error('API error:', error);
    throw error;
  }
};

