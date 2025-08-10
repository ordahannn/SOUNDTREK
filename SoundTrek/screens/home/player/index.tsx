// React
import React, { useState, useEffect, useRef } from "react";
import { ImageBackground, Image, Modal, ScrollView, TouchableOpacity, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Expo
import { BlurView } from "expo-blur";
import { useRouter } from "expo-router";
import * as Speech from "expo-speech";
import * as Location from "expo-location";

// UI
import { VStack } from "@/components/ui/vstack";
import { Box } from "@/components/ui/box";
import { Text } from "@/components/ui/text";
import { Heading } from "@/components/ui/heading";
import { Center } from "@/components/ui/center";
import { PauseIcon, PlayIcon, ChevronDownIcon, ArrowBackIcon, LyricsIcon } from "@/components/ui/material-icons";
import { HStack } from "@/components/ui/hstack";

// Helpers
import { getSelectedLandmark, loadFromStorage } from "@/helpers/storage-helper";
import { STORAGE_KEYS } from "@/helpers/storage-keys";

// Types
import { SelectedLandmark } from "@/types/SelectedLandmark";

// Hooks
import { useSessionGuard } from "@/hooks/useSessionGuard";
import { useActivityTracker } from "@/hooks/useActivityTracker";


const getReadableLocation = async (lat: number, lon: number): Promise<string> => {
  try {
    const places = await Location.reverseGeocodeAsync({ latitude: lat, longitude: lon });
    const place = places[0];
    if (place?.city) return `${place.city}, ${place.country}`;
    if (place?.district) return `${place.district}, ${place.country}`;
    if (place?.region) return `${place.region}, ${place.country}`;
    return place?.country || "Unknown location";
  } catch {
    return "Location not available";
  }
};

const Player = ({ landmark }: { landmark: SelectedLandmark }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [location, setLocation] = useState<string>("");
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const fetchLocation = async () => {
      if (landmark?.lat && landmark.lon) {
        const loc = await getReadableLocation(landmark.lat, landmark.lon);
        setLocation(loc);
      } else {
        setLocation("Location not available.");
      }
    };
    fetchLocation();

    return () => {
      Speech.stop();
      setIsPlaying(false);
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [landmark]);

  const play = () => {
    if (!isPlaying && landmark?.processedText) {
      setIsPlaying(true);
      Speech.speak(landmark.processedText, {
        language: landmark.selectedLanguageCode || "en-US",
        pitch: 1.1,
        rate: 0.8,
        onDone: () => setIsPlaying(false),
      });
    }
  };

  const pause = () => {
    Speech.stop();
    setIsPlaying(false);
  };

  return (
    <VStack className="flex-1 w-full mt-8 px-4">
      <VStack space="3xl" className="items-center w-full">
        <Image
          source={
            landmark.imageUrl
              ? { uri: landmark.imageUrl }
              : require("@/assets/player/Image_holder.png")
          }
          className="rounded-xl mb-10"
          style={{ width: 300, height: 300, borderRadius: 16 }}
          resizeMode="cover"
        />
        <VStack className="items-center w-full">
          <Text className="text-4xl font-bold text-center text-black mb-2">{landmark.title}</Text>
          <Text className="text-xl tracking-widest text-muted text-center uppercase text-black">{location}</Text>
        </VStack>
      </VStack>

      {/* Control buttons */}
      <VStack space="lg" className="w-full mt-8">
        <Center className="items-center w-full relative">
          <TouchableOpacity onPress={isPlaying ? pause : play} className="justify-center items-center">
            {isPlaying ? <PauseIcon size={75} color="black" /> : <PlayIcon size={75} color="black" />}
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setExpanded(!expanded)} className="absolute right-1/4 top-1/2 -translate-y-1/2">
            <LyricsIcon size={30} color="black" />
          </TouchableOpacity>
        </Center>
      </VStack>

      {/* Transcript Modal */}
      <Modal visible={expanded} animationType="slide" transparent>
        <BlurView intensity={80} tint="light" style={{ flex: 1 }}>
          <SafeAreaView style={{ flex: 1 }} edges={["top", "bottom"]}>
            <Box className="flex-1 px-4" style={{ paddingTop: 64, paddingBottom: 16 }}>
              <TouchableOpacity onPress={() => setExpanded(false)}>
                <Box className="w-full items-center mb-4">
                  <Box className="absolute left-0">
                    <ChevronDownIcon size={30} color="black" />
                  </Box>
                  <Heading className="text-5xl font-bold text-center text-black mb-8">Transcript</Heading>
                </Box>
              </TouchableOpacity>

              <ScrollView showsVerticalScrollIndicator={false}>
                <Text
                  className="text-black text-4xl text-center font-extrabold leading-8"
                  style={{
                    paddingHorizontal: 10,
                    lineHeight: 40,
                    letterSpacing: 2.5,
                  }}
                >
                  {landmark.processedText || "No transcript found. Please select a genre and try again."}
                </Text>
              </ScrollView>
            </Box>
          </SafeAreaView>
        </BlurView>
      </Modal>
    </VStack>
  );
};

export const PlayerScreen = () => {
  useSessionGuard();
  useActivityTracker();

  const router = useRouter();
  const [landmark, setLandmark] = useState<SelectedLandmark | null>(null);
  const [loading, setLoading] = useState(true);
  const [fromCustomRoute, setFromCustomRoute] = useState(false);
  const [fromRecommendedRoute, setFromRecommendedRoute] = useState(false);
  const [fromProfile, setFromProfile] = useState(false);


  useEffect(() => {
    const load = async () => {
      try {
        const stored = await getSelectedLandmark();
        console.log("[PlayerScreen] Loaded selected landmark:", stored);
        setLandmark(stored);

        // Flags
        const fromCustom = await AsyncStorage.getItem(STORAGE_KEYS.FromCustomRoute);
        const fromRecommended = await AsyncStorage.getItem(STORAGE_KEYS.FromRecommendedRoute);
        const fromRecommendedOriginal = await AsyncStorage.getItem(STORAGE_KEYS.FromRecommendedOriginal);
        const fromProfile = await AsyncStorage.getItem(STORAGE_KEYS.FromProfile);

        console.log("[PlayerScreen] Flags: ", { fromCustom, fromRecommended, fromProfile });

        const cameFromCustom = fromCustom === "true";
        const cameFromRecommended = fromRecommended === "true";
        const cameFromRecommendedOriginal = fromRecommendedOriginal === "true";
        const cameFromProfile = fromProfile === "true";

        setFromCustomRoute(cameFromCustom);
        setFromRecommendedRoute(cameFromRecommended);
        setFromProfile(cameFromProfile);

        if (stored?.pageId) {
          const updateListened = async (storageKey: string) => {
            const route = await loadFromStorage<SelectedLandmark[]>(storageKey);
            if (route) {
              const updatedRoute = route.map((lm) =>
                lm.pageId === stored.pageId ? { ...lm, listened: true } : lm
              );
              await AsyncStorage.setItem(storageKey, JSON.stringify(updatedRoute));
            }
          };

          // Update NearbyLandmarks as well
          const nearby = await loadFromStorage<SelectedLandmark[]>(STORAGE_KEYS.NearbyLandmarks);
          if (nearby) {
            const updatedNearby = nearby.map((lm) =>
              lm.pageId === stored.pageId ? { ...lm, listened: true } : lm
            );
            await AsyncStorage.setItem(STORAGE_KEYS.NearbyLandmarks, JSON.stringify(updatedNearby));
          }

          if (cameFromCustom) {
            await updateListened(STORAGE_KEYS.SavedCustomRoute);
          } 
          else if (cameFromRecommended || cameFromRecommendedOriginal) {
            // Update both
            await updateListened(STORAGE_KEYS.SavedRecommendedRoute);
            await updateListened(STORAGE_KEYS.RecommendedRoute);
          } 
          else {
            await updateListened("SelectedRoute");
          }
        }

        await AsyncStorage.multiRemove([
          STORAGE_KEYS.FromCustomRoute,
          STORAGE_KEYS.FromRecommendedRoute,
          STORAGE_KEYS.FromRecommendedOriginal,
          STORAGE_KEYS.FromProfile,
        ]);
      } catch (err) {
        console.error("[PlayerScreen] Failed to load landmark:", err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);


  useEffect(() => {
    if (!loading && (!landmark || !landmark.processedText)) {
      router.replace("/home");
    }
  }, [loading, landmark]);

  // Handle back click
  const handleBack = () => {
    console.log("[PlayerScreen] Back pressed. Flags:", { fromCustomRoute, fromRecommendedRoute, fromProfile });
    if (fromCustomRoute) {
      router.replace("/itinerary/custom-route");
    } else if (fromRecommendedRoute) {
      router.replace("/itinerary/recommended-route");
    } else if (fromProfile) {
      router.replace("/home/profile");
    } else {
      router.back();
    }
  };

  // Loading screen
  if (loading) {
    return (
      <Center className="flex-1">
        <Text className="text-black text-lg">Loading...</Text>
      </Center>
    );
  }

  if (!landmark || !landmark.processedText) return null;

  return (
    <ImageBackground
      source={
        landmark?.imageUrl
          ? { uri: landmark.imageUrl }
          : require("@/assets/player/Image_holder.png")
      }
      resizeMode="cover"
      style={{ flex: 1 }}
    >
      <BlurView intensity={80} tint="light" style={{ flex: 1 }}>
        <SafeAreaView style={{ flex: 1 }} edges={["top", "bottom"]}>
          <VStack className="px-8 py-6">
            <HStack className="relative w-full items-center justify-between">
              <Pressable onPress={handleBack} style={{ width: 56 }}>
                <ArrowBackIcon size={20} />
              </Pressable>
            </HStack>
          </VStack>
          <Player landmark={landmark} />
        </SafeAreaView>
      </BlurView>
    </ImageBackground>
  );
};