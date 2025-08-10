// React
import React, { useEffect, useState } from "react";
import { ActivityIndicator } from 'react-native';
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";

// UI 
import { Grid, GridItem } from "@/components/ui/grid";
import { Center } from '@/components/ui/center';
import { Text } from "@/components/ui/text";
import { HomeLayout } from "../layout";
import { Button, ButtonText } from "@/components/ui/button";
import { VStack } from "@/components/ui/vstack";
import { Pressable } from "@/components/ui/pressable";

// Helpers
import { setSelectedLandmark, getSelectedLandmark } from "@/helpers/storage-helper";
import { useUserId } from '../profile/helpers/api';
import { API_ENDPOINTS } from "@/helpers/api-helper";
import { fetchDataUser } from "../profile/helpers/api";
import { STORAGE_KEYS } from "@/helpers/storage-keys";
import { languageMap } from "@/helpers/language-dict-helper";

// Types
import { SelectedLandmark } from "@/types/SelectedLandmark";

// Hooks
import { useSessionGuard } from "@/hooks/useSessionGuard";
import { useActivityTracker } from "@/hooks/useActivityTracker";

// Screens
import { fetchAllLanguages } from "@/screens/home/genre/js/genreJs";

interface Language {
  name: string;
}

const Language = () => {
  const router = useRouter();
  const [languages, setLanguages] = useState<Language[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loading, setLoading] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState<string>();
  const userId = useUserId();


  useEffect(() => {
  if (!userId) return;

  const loadLanguages = async () => {
    try {
      const data = await fetchAllLanguages();
      setLanguages(data);

      const user = await fetchDataUser<{ preferredLanguage: string }>(API_ENDPOINTS.getUserById(Number(userId)));
      setSelectedLanguage(user.preferredLanguage);
    } catch (error) {
      console.error("Failed to load languages", error);
    } finally {
      setIsLoading(false);
    }
  };

  loadLanguages();
}, [userId]);

  const handleLanguageSelect = (name: string) => {
    setSelectedLanguage(name);
  };

  const handleLanguage = async () => {
    try {
      setLoading(true);

      // Fetch selected landmark from AsyncStorage
      const storedLandmark = await getSelectedLandmark();

      if (!storedLandmark) {
        console.warn("No landmark found in storage.");
        return;
      }

      const getLanguageCode = (languageName: string | undefined): string => {
        if (!languageName) return "unknown";

        const codes = languageMap[languageName as keyof typeof languageMap];
        if (Array.isArray(codes)) {
          return codes[0];
        }
        return typeof codes === "string" ? codes : "unknown";
      };


      const selectedLanguageCode = getLanguageCode(selectedLanguage);

      const updatedLandmark: SelectedLandmark = {
        ...storedLandmark,
        selectedLanguageCode: selectedLanguageCode,
        selectedLanguage: selectedLanguage,
      };

      await setSelectedLandmark(updatedLandmark);
      console.log("[handleLanguage] Updated Landmark saved to storage:", updatedLandmark);
      router.replace("/home/genre");
    } catch (err) {
      console.error("Failed to save language:", err);
    } finally {
      setLoading(false);
    }
  };


  if (isLoading) {
    return (
      <Center className="flex-1 h-screen">
        <ActivityIndicator size="large" color="#000" />
        <Text className="mt-4 text-lg text-background-800">Loading Languages...</Text>
      </Center>
    );
  }

  return (
    <VStack className="w-full mt-8 gap-8">
      <VStack className="w-full gap-8">
        <Grid className="gap-x-6 gap-y-2 items-center justify-center" _extra={{ className: "grid-cols-6" }}>
          {languages.length > 0 ? (
            languages.map((language) => (
              <GridItem
                key={language.name}
                className=" text-center w-[150px] h-[50px]"
                style={{ borderRadius: 14, justifyContent: "center" }}
                _extra={{ className: "col-span-2" }}
              >
                <Center>
                  <Pressable
                    onPress={() => handleLanguageSelect(language.name)}
                    className={`w-full px-4 py-2 rounded-md ${selectedLanguage === language.name ? 'border-2 border-primary-900 bg-transparent' : 'bg-primary-800/50'
                      }`}
                  >
                    <Text className={`font-bold text-lg text-center ${selectedLanguage === language.name ? 'text-black' : 'text-black'
                      }`}>
                      {language.name}
                    </Text>
                  </Pressable>
                </Center>

              </GridItem>
            ))
          ) : (
            <Center className="w-full h-full">
              <Text className="text-lg text-background-800">The server is currently down :(</Text>
            </Center>
          )}
        </Grid>
      </VStack>
      <Center>
        <Button
          className={`w-[80%]`}
          onPress={() => {
            handleLanguage()
          }
          }
        >
          <ButtonText >
            Confirm
          </ButtonText>
        </Button>
      </Center>
    </VStack>
  );
};

export const LanguageScreen = () => {
  useSessionGuard(); // If there's no session -> redirect
  useActivityTracker();
  const [fromCustomRoute, setFromCustomRoute] = useState(false);
  const [fromRecommendedRoute, setFromRecommendedRoute] = useState(false);
  const [fromProfile, setFromProfile] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const load = async () => {
      const fromCustom = await AsyncStorage.getItem(STORAGE_KEYS.FromCustomRoute);
      if (fromCustom === "true") {
        setFromCustomRoute(true);
        // await AsyncStorage.removeItem(STORAGE_KEYS.FromCustomRoute);
      }

      const fromRecommended = await AsyncStorage.getItem(STORAGE_KEYS.FromRecommendedRoute);
        if (fromRecommended === "true") {
        setFromRecommendedRoute(true);
        // await AsyncStorage.removeItem(STORAGE_KEYS.FromRecommendedRoute);
      }

      const FromProfile = await AsyncStorage.getItem(STORAGE_KEYS.FromProfile);
      if (FromProfile === "true") {
        setFromProfile(true);
        // await AsyncStorage.removeItem(STORAGE_KEYS.FromProfile);
      }
    }
    load();
  }, []);

  const handleBack = () => {
    if (fromCustomRoute) {
        router.replace("/itinerary/custom-route"); // Back to custom route
    }
    else if (fromRecommendedRoute) {
        router.replace("/itinerary/recommended-route"); // Back to recommended route
    } else if (fromProfile) {
        router.replace("/home/profile"); // Back to home
    }
    else {
        router.back();
    }
  };

  return (
    <HomeLayout
      showHeader
      headerTitle="Language"
      showBack
      showTabBar={false}
      onBack={handleBack}
    >
      <Language />
    </HomeLayout>
  );
};
