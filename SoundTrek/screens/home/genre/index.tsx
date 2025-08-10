// React
import React, { useEffect, useState } from "react";
import { ScrollView, ActivityIndicator } from 'react-native';
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";

// UI
import { Grid, GridItem } from "@/components/ui/grid";
import { Center } from '@/components/ui/center';
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import { HomeLayout } from "../layout";

// Helpers
import { getSelectedLandmark } from "@/helpers/storage-helper";
import { STORAGE_KEYS } from "@/helpers/storage-keys";

// Types
import { SelectedLandmark } from "@/types/SelectedLandmark";

// Hooks
import { useSessionGuard } from "@/hooks/useSessionGuard";
import { useActivityTracker } from "@/hooks/useActivityTracker";

// Screens
import { fetchAllGenres } from "@/screens/home/genre/js/genreJs";
import GenreButton from "@/screens/home/genre/genreBtn";

interface Genre {
    genreID: number;
    genreName: string;
    genreImageUrl: string;
}
interface Language {
    name: string;
}

const Genre = () => {
    //For navigation between screens
    const router = useRouter();
    const [genres, setGenres] = useState<Genre[]>([]);
    const [languages, setLanguages] = useState<Language[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedLanguage, setSelectedLanguage] = useState<string>();

    const [landmark, setLandmark] = useState<SelectedLandmark | null>(null);
    // Error if there is a problem with location or request
    const [error, setError] = useState("");

    useEffect(() => {
        (async () => {
            try {
                // Step 1: Fetch selected landmark from AsyncStorage
                const storedLandmark = await getSelectedLandmark();

                if (!storedLandmark || !storedLandmark.pageId) {
                    setError("No valid landmark found.");
                    router.replace("/home");
                    return;
                }

                setLandmark(storedLandmark);

                // Step 2: Load selected language (from stored selected landmark)
                setSelectedLanguage(storedLandmark.selectedLanguage || "English"); // Selects "English" language as default

            } catch (err) {
                console.error("Failed to load landmark:", err);
                setError("Error loading landmark.");
            }
        })();

        // Step 3: Load genres (doesn't depend on language)
        const loadGenres = async () => {
            try {
                const data = await fetchAllGenres();
                setGenres(data);
            } catch (error) {
                console.error("Failed to load genres", error);
            } finally {
                setIsLoading(false); // Finishes loading anyway
            }
        };

        loadGenres();
    }, []);


    if (isLoading) {
        return (
            <Center className="flex-1 h-screen">
                <ActivityIndicator size="large" color="#000" />
                <Text className="mt-4 text-lg text-background-800">Loading genres...</Text>
            </Center>
        );
    }

    return (
        <VStack className="w-full gap-8 mt-8">
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 150 }}>
                <VStack className="w-full gap-8">
                    <Grid className="gap-8 items-center justify-center" _extra={{ className: "grid-cols-6" }}>
                        {genres.length > 0 ? (
                            genres.map((genre) => (
                                <GridItem
                                    key={genre.genreID}
                                    className="bg-background-50 text-center w-[150px] h-[150px]"
                                    style={{ borderRadius: 14 }}
                                    _extra={{ className: "col-span-2" }}
                                >
                                    <GenreButton
                                        fullDescription={landmark?.fullDescription || null}
                                        genreName={genre.genreName}
                                        genreImageUrl={genre.genreImageUrl}
                                        language={selectedLanguage || "English"}
                                    />
                                </GridItem>
                            ))
                        ) : (
                            <Center className="w-full h-full">
                                <Text className="text-lg text-background-800">The server is currently down :(</Text>
                            </Center>
                        )}
                    </Grid>
                </VStack>
            </ScrollView>
        </VStack>
    );
};

export const GenreScreen = () => {
  useSessionGuard();
  useActivityTracker();

  const [fromCustomRoute, setFromCustomRoute] = useState(false);
  const [fromProfile, setFromProfile] = useState(false);
  const [fromRecommendedRoute, setFromRecommendedRoute] = useState(false);
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
        headerTitle="Genre"
        showBack
        showLogout={false}
        showTabBar={false}
        onBack={handleBack} 
        >
        <Genre />
        </HomeLayout>
    );
};