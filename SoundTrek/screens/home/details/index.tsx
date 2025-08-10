// React
import React, { useEffect, useState } from "react";
import { useRouter } from "expo-router";
import { ImageBackground, StyleSheet } from "react-native";

// Helpers
import { getLandmarkImageOrDefault } from "@/helpers/image-helper";
import { setSelectedLandmark, getSelectedLandmark } from "@/helpers/storage-helper";
import { API_ENDPOINTS } from "@/helpers/api-helper";
import { getReadableLocation } from "@/helpers/location-helper";
import { fetchDataUser, useUserId, sendDataUser } from "../profile/helpers/api";

//Hooks
import { useSessionGuard } from "@/hooks/useSessionGuard";
import { useActivityTracker } from "@/hooks/useActivityTracker";

// UI
import { VStack } from "@/components/ui/vstack";
import { Heading } from "@/components/ui/heading";
import { Text } from "@/components/ui/text";
import { Spinner } from "@/components/ui/spinner";
import { Button, ButtonText } from "@/components/ui/button";
import { Pressable } from "@/components/ui/pressable";
import { Icon, FavouriteIcon } from "@/components/ui/icon";
import { ScrollView } from "@/components/ui/scroll-view";
import { View } from "@/components/ui/view";
import { HStack } from "@/components/ui/hstack";
import { ArrowBackIcon } from "@/components/ui/material-icons";

// Types
import { SelectedLandmark } from "@/types/SelectedLandmark";

const LandmarkDetails = () => {
  const userId = useUserId();
  const router = useRouter();

  const [landmark, setLandmark] = useState<SelectedLandmark | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [loadingDescription, setLoadingDescription] = useState(false);
  const [location, setLocation] = useState("");

  const [liked, setLiked] = useState(false);

  useEffect(() => {
    if (!userId) return; // Wait for right userId

    const loadData = async () => {
      setLoading(true);
      try {
        const storedLandmark = await getSelectedLandmark();
        if (!storedLandmark || !storedLandmark.pageId) {
          setError("No valid landmark found.");
          router.replace("/home");
          return;
        }
        setLandmark(storedLandmark);

        // Fetch user's liked landmarks
        const likedLandmarks = await fetchDataUser<{ pageId: string }[]>(
          `${API_ENDPOINTS.getLikedLandmarks}?userId=${encodeURIComponent(userId)}`
        );

        // Map the array to a pageId type array
        const likedPageIds = likedLandmarks
          .map(lm => lm.pageId?.trim().toLowerCase() || "");

        const isLiked = likedPageIds.includes(storedLandmark.pageId.trim().toLowerCase());

        setLiked(isLiked);

        if (storedLandmark.lat && storedLandmark.lon) {
          const loc = await getReadableLocation(storedLandmark.lat, storedLandmark.lon);
          setLocation(loc);
        }
      } catch (e) {
        console.error("Error loading landmark or liked state:", e);
        setError("Failed to load landmark or liked state.");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [userId, router]);

  // Handle like click
  const toggleLike = async () => {
    if (!landmark || !userId) return;
    try {
      const newLiked = !liked;
      setLiked(newLiked);

      if (newLiked) {
        await sendDataUser(API_ENDPOINTS.updateLikedLandmark, { userId, landmark }, "POST");
      } else {
        await sendDataUser(
          `${API_ENDPOINTS.removeLikedLandmark}?userId=${encodeURIComponent(userId)}&landmarkPageId=${encodeURIComponent(landmark.pageId)}`,
          {},
          "DELETE"
        );
      }
    } catch (err) {
      console.error("Failed to update like status:", err);
      setLiked((prev) => !prev); // Abort change in case of an error
    }
  };

  // Handle listen now click
  const handleListenPress = async () => {
    if (!landmark || !landmark.pageId) return;
    try {
      setLoadingDescription(true);

      const response = await fetch(API_ENDPOINTS.getLandmarkFullDescription(landmark.pageId));
      if (!response.ok) throw new Error("Failed to fetch full description");

      const data = await response.json();

      if (!data.description) {
        alert("No description available for this landmark.");
        return;
      }

      const updatedLandmark: SelectedLandmark = { ...landmark, fullDescription: data.description };
      await setSelectedLandmark(updatedLandmark);

      router.push({ pathname: "/home/language", params: { pageId: landmark.pageId } });
    } catch (err) {
      console.error("Error loading full description:", err);
      alert("Failed to load full description. Please try again.");
    } finally {
      setLoadingDescription(false);
    }
  };

  if (!userId || loading || !landmark) {
    return (
      <VStack className="flex-1 justify-center items-center px-6">
        <Spinner />
      </VStack>
    );
  }

  return (
    <VStack className="flex-1 bg-background-0">
      <ImageBackground
        source={getLandmarkImageOrDefault(landmark.imageUrl)}
        style={{
          width: "100%",
          height: 350,
          justifyContent: "flex-start",
          overflow: "hidden",
          borderBottomLeftRadius: 0,
          borderBottomRightRadius: 0,
        }}
        imageStyle={{ resizeMode: "cover" }}
      >
        <View style={{ ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(255,255,255,0.4)" }} />
        <VStack className="px-8 py-24">
          <Pressable onPress={router.back} style={{ width: 56 }}>
            <ArrowBackIcon color="black" />
          </Pressable>
        </VStack>
      </ImageBackground>

      <View
        style={{
          marginTop: -50,
          borderTopLeftRadius: 50,
          borderTopRightRadius: 50,
          overflow: "hidden",
          backgroundColor: "white",
          flex: 1,
        }}
      >
        <VStack className="px-6" style={{ flex: 1 }}>
          <View style={{ height: 100, justifyContent: "center" }}>
            <Heading
              size="2xl"
              className="text-center mt-2"
              numberOfLines={2}
              ellipsizeMode="tail"
              style={{ textAlign: "center" }}
            >
              {landmark.title}
            </Heading>
          </View>

          {location && (
            <HStack className="flex-row items-center mt-3 justify-between">
              <Text className="text-center text-muted text-lg pr-2">📍 {location}</Text>
              <Pressable
                onPress={toggleLike}
                className={`rounded-full border ${liked ? "bg-red-600 border-red-600" : "bg-transparent border-red-600"}`}
                style={{
                  width: 28,
                  height: 28,
                  justifyContent: "center",
                  alignItems: "center",
                  padding: 0,
                  marginLeft: 4,
                }}
              >
                <Icon as={FavouriteIcon} className={liked ? "text-white" : "text-red-600"} size="lg" />
              </Pressable>
            </HStack>
          )}

          {/* Description area with default height */}
          <View style={{ flexGrow: 0, height: 310, marginTop: 20, marginBottom: 20 }}>
            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: 12 }}
            >
              <Text className="text-lg text-center leading-relaxed">
                {landmark.shortDescription || "No description available."}
              </Text>
            </ScrollView>
          </View>

          <Button onPress={handleListenPress} isDisabled={loadingDescription}>
            {loadingDescription ? <Spinner color="white" /> : <ButtonText>Listen Now</ButtonText>}
          </Button>
        </VStack>
      </View>
    </VStack>
  );
};

export const LandmarkDetailsScreen = () => {
  useSessionGuard();
  useActivityTracker();

  return <LandmarkDetails />;
};

export default LandmarkDetailsScreen;