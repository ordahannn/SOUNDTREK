/**
 * Keys used for saving and loading data from AsyncStorage.
 * This ensures all keys are centralized and consistent across the app.
**/
export const STORAGE_KEYS = {
  //Routes
  RecommendedRoute: "RecommendedRoute",
  SavedCustomRoute: "SavedCustomRoute",
  SavedRecommendedRoute: "SavedRecommendedRoute",
  SelectedRouteType: "SelectedRouteType",
  
  // Locations and Landmarks
  UserLastLocation: "UserLastLocationCoords",
  NearbyLandmarks: "LastNearbyLandmarks",
  SelectedLandmark: "SelectedLandmark",
  RecommendedLandmarks: "RecommendedLandmarks",
  SelectedLandmarks: "SelectedLandmarks",
  ListenedLandmarks: "ListenedLandmarks",

  // Flags
  FromCustomRoute: "FromCustomRoute",
  FromProfile: "FromProfile",
  FromRecommendedRoute: "FromRecommendedRoute",
  FromRecommendedOriginal: "FromRecommendedOriginal",

  // User Authentication
  UserToken: "userToken",
  LastActiveTime: "lastActiveTime",
  UserData: "userData",
} as const;