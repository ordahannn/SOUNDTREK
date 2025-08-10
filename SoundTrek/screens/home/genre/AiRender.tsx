import { API_ENDPOINTS } from "@/helpers/api-helper";

 const SERVER_URL = 'http://192.168.1.192:7109/api';
// const SERVER_URL = "http://192.168.1.156:7109/api";
//const SERVER_URL = "http://192.168.1.107:7109/api";

/**
 * Sends the landmark description, selected genre and language to the AI rendering API.
 * @param description - Original Wikipedia full description
 * @param genre - Genre style selected by the user
 * @param language - Language for the result (e.g. 'English')
 * @returns Adapted to genre AI-generated text
 */
export const sendToAI = async (
  description: string,
  genre: string,
  language: string
) => {
  try {
    const body = [description, genre, language]; // TODO: adapt to Server-side after controller update
   
    const response = await fetch(API_ENDPOINTS.adaptTextToGenre, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(body)
    });

    if (!response.ok) {
      throw new Error(`Failed to send data to AI endpoint. Status: ${response.status}`);
    }

    const result = await response.text(); // TODO: replace to .json() if server returns JSON
    return result;
  } catch (error) {
    console.error("API POST error:", error);
    throw error;
  }
};
