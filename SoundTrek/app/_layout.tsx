import FontAwesome from "@expo/vector-icons/FontAwesome";
import {
  // DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import { GluestackUIProvider } from "@/components/ui/gluestack-ui-provider";
import "../global.css";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { clearAllStorageData } from "@/helpers/storage-helper";
import {SearchRadiusProvider } from "./SearchRadiusContext"
import AsyncStorage from "@react-native-async-storage/async-storage";

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from "expo-router";

export const unstable_settings = {
  // Ensure that reloading on `/modal` keeps a back button present.
  initialRouteName: "auth/splash-screen",
};

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
    ...FontAwesome.font,
  });

  // Clear all AsyncStorage once when app starts
  useEffect(() => {
    const clearStorageOnFirstLoad = async () => {
      await AsyncStorage.clear();
      await clearAllStorageData();
    };
    clearStorageOnFirstLoad();
  }, []);
  
  // Expo Router uses Error Boundaries to catch errors in the navigation tree.
  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return <RootLayoutNav />;
}

function RootLayoutNav() {
  // always light - until we'll define the dark theme colors
  const colorScheme = "light";

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <GluestackUIProvider mode={(colorScheme ?? "light") as "light" | "dark"}>
        {/* <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}> */}
        <ThemeProvider value={DefaultTheme}>
            <SearchRadiusProvider>
          <Stack screenOptions={{ headerShown: false , animation: "none" }}>
            <Stack.Screen name="auth/signin" />
            <Stack.Screen name="auth/signup" />
            <Stack.Screen name="auth/interests-selection" />
            <Stack.Screen name="auth/language-selection" />
            <Stack.Screen name="auth/radius-selection" />
            <Stack.Screen name="home/details" />
            <Stack.Screen name="home/genre" />
            <Stack.Screen name="home/language" />
            <Stack.Screen name="home/search" />
            <Stack.Screen name="itinerary/map" />
            <Stack.Screen name="itinerary/edit" />
            <Stack.Screen name="itinerary/custom-route" />
            <Stack.Screen name="itinerary/recommended-route" />
          </Stack>
          </SearchRadiusProvider>
        </ThemeProvider>
      </GluestackUIProvider>
    </GestureHandlerRootView>
  );
}
