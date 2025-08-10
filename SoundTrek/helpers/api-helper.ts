// api-helper.ts
export const SERVER_URL = "Fill you server URL";

// API endpoint definitions used across the app - Prefer using these for consistency.
export const API_ENDPOINTS = {
  getNearbyLandmarks: (lat: number, lon: number, radius: number = 5000) =>
    `${SERVER_URL}/Landmarks/nearby?lat=${lat}&lon=${lon}&radius=${radius}`,

  getRecommendedLandmarks: `${SERVER_URL}/User/recommendations`,

  getLandmarkFullDescription: (pageId: string) =>
    `${SERVER_URL}/Landmarks/description?pageId=${pageId}`,

  getAllLanguages: `${SERVER_URL}/Languages`,

  getAllGenres: `${SERVER_URL}/Genres`,

  //adaptTextToGenre: `${SERVER_URL}/ai-genre-adapt`, // TODO: replace "adaptTextToGenre" to this
  adaptTextToGenre: `${SERVER_URL}/Attractions/ai`,

  // Authentication
  registerUser: `${SERVER_URL}/Authentication/register`,
  loginUser: `${SERVER_URL}/Authentication/login`,
  checkEmail: (email: string) => `${SERVER_URL}/Authentication/check-email?email=${encodeURIComponent(email)}`,
  getUserById: (userId: number) => `${SERVER_URL}/Authentication/get-user-data?userId=${userId}`,

  // User Preferences
  updatePreferredLanguage: `${SERVER_URL}/User/preferred-language`,
  updateSearchRadius: `${SERVER_URL}/User/radius`,
  addUserInterest: `${SERVER_URL}/User/interest`,
  removeUserInterest: `${SERVER_URL}/User/interest`, // Same endpoint, DELETE method
  updateUserInterests: `${SERVER_URL}/User/update-interests`,
  updateUserProfile: `${SERVER_URL}/User/profile`,
  getAllInterests: `${SERVER_URL}/Interests`,
  getUserInterests: (userId: number) => `${SERVER_URL}/User/interest?userId=${userId}`,
  getLikedLandmarks: `${SERVER_URL}/User/liked-landmarks`,
  removeLikedLandmark: `${SERVER_URL}/User/liked-landmark`,
  getUserBirthday: `${SERVER_URL}/User/birthday`,        // GET עם ?userId=...
  updateUserBirthday: `${SERVER_URL}/User/birthday`,
  updateLikedLandmark: `${SERVER_URL}/User/liked-landmarks`,
};


/**
 * getNearby: Builds the URL to get nearby landmarks based on lat/lon.
 * @param lat Latitude , @param lon Longitude , @param radius Search radius in meters (default: 5000)
**/

/**
 * getDescription: Builds the URL to get a full Wikipedia description by pageId.
 * @param pageId Wikipedia page ID
**/