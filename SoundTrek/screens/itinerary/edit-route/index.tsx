// React
import React, { useEffect, useState } from "react";
import { Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// Expo
import { router } from "expo-router";
import { useLocalSearchParams } from "expo-router";

// UI
import { View } from "@/components/ui/view";
import { ScrollView } from "@/components/ui/scroll-view";
import { Text } from "@/components/ui/text";
import { Spinner } from "@/components/ui/spinner";
import { Button } from "@/components/ui/button";
import { VStack } from "@/components/ui/vstack";
import { ArrowBackIcon, ChevronUpIcon, ChevronDownIcon } from "@/components/ui/material-icons";

// Hooks
import { useActivityTracker } from "@/hooks/useActivityTracker";

// Types
import { WikipediaLandmark } from "@/types/WikipediaLandmark";

// Helpers
import { STORAGE_KEYS } from "@/helpers/storage-keys";
import { loadFromStorage, saveToStorage } from "@/helpers/storage-helper";
import { API_ENDPOINTS } from "@/helpers/api-helper";

const EditRouteScreen = () => {
  const [allLandmarks, setAllLandmarks] = useState<WikipediaLandmark[]>([]);
  const [selectedRoute, setSelectedRoute] = useState<WikipediaLandmark[]>([]);
  const [loading, setLoading] = useState(true);
  const { routeType, source } = useLocalSearchParams();
  
  useActivityTracker(); 
  
  // Which storage key to use based on route type
  const routeKey = 
    routeType === "recommended" 
      ? STORAGE_KEYS.SavedRecommendedRoute 
      : STORAGE_KEYS.SavedCustomRoute;

  useEffect(() => {
    const fetchLandmarksIfNeeded = async () => {
      try {
        // Load last known location
        const location = await loadFromStorage<{ latitude: number; longitude: number }>(
          STORAGE_KEYS.UserLastLocation
        );
        if (!location) return;

        // Load nearby landmarks from storage or fetch if not available
        const stored = await loadFromStorage(STORAGE_KEYS.NearbyLandmarks);
        if (stored && Array.isArray(stored)) {
          setAllLandmarks(stored);
        } else {
          const res = await fetch(API_ENDPOINTS.getNearbyLandmarks(location.latitude, location.longitude));
          const data = await res.json();
          setAllLandmarks(data);
          await saveToStorage(STORAGE_KEYS.NearbyLandmarks, data);
        }

        // Load route for the correct type
        if (routeType === "recommended") {
          let storedRoute;
          if (source === "saved") {
            storedRoute = await loadFromStorage(STORAGE_KEYS.SavedRecommendedRoute);
          } else {
            storedRoute = await loadFromStorage(STORAGE_KEYS.RecommendedRoute);
          }

          if (storedRoute && Array.isArray(storedRoute)) {
            const sortedStops = [...storedRoute].sort((a, b) => a.stopNumber - b.stopNumber);
            const landmarks = (await loadFromStorage(STORAGE_KEYS.NearbyLandmarks) as WikipediaLandmark[]) || [];
            const fullRoute = sortedStops
              .map(stop => landmarks.find((lm: WikipediaLandmark) => lm.pageId === stop.pageId))
              .filter(Boolean) as WikipediaLandmark[];

            setSelectedRoute(fullRoute);
          }
        } else {
          const storedRoute = await loadFromStorage(STORAGE_KEYS.SavedCustomRoute);
          if (storedRoute && Array.isArray(storedRoute)) {
            setSelectedRoute(storedRoute);
          }
        }

      } catch (err) {
        console.error("[EditRouteScreen] Failed to load landmarks:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchLandmarksIfNeeded();
  }, []);

  // Add landmark to selected route
  const handleAddToRoute = (landmark: WikipediaLandmark) => {
    if (!selectedRoute.find((l) => l.pageId === landmark.pageId)) {
      setSelectedRoute((prev) => [...prev, landmark]);
    }
  };

  // Update the order after drag and drop.
  const handleRemoveFromRoute = (pageId: string) => {
    setSelectedRoute((prev) => prev.filter((l) => String(l.pageId) !== String(pageId)));
  };

  // Change item index if mooved
  const moveItem = (index: number, direction: -1 | 1) => {
    const newIndex = index + direction;
    if (newIndex < 0 || newIndex >= selectedRoute.length) return;
    const updated = [...selectedRoute];
    const temp = updated[index];
    updated[index] = updated[newIndex];
    updated[newIndex] = temp;
    setSelectedRoute(updated);
  };

  // Save the updated route and navigate back to the relevant map screen.
  const handleLetsGo = async () => {
    try {
      const target = routeType === "recommended" ? "/itinerary/recommended-route" : "/itinerary/custom-route";

      await saveToStorage(routeKey, selectedRoute);
      await saveToStorage(STORAGE_KEYS.SelectedRouteType, routeType);
      
      console.log("[EditRouteScreen] Saved route and type (custom) to AsyncStorage.");

      router.replace({ pathname: target, params: { fromEdit: "true" } });
    } catch (err) {
      console.error("[EditRouteScreen] Failed to save route:", err);
    }
  };

  // Loading spinner
  if (loading) {
    return (
      <View className="flex-1 justify-center items-center">
        <Spinner />
      </View>
    );
  }

  
  return (
    <SafeAreaView className="flex-1 w-full bg-white">
          <Pressable
            onPress={() => {
              const target =
                routeType === "recommended"
                  ? "/itinerary/recommended-route"
                  : "/itinerary/custom-route";

              router.replace({ pathname: target, params: { fromEdit: "true" } });
            }}
            className="absolute top-24 left-8 p-2"
          >
            <ArrowBackIcon size={22} />
          </Pressable>

          <VStack className="flex-1 p-4 mt-8 mr-6 ml-6">
            <Text className="text-xl font-bold mb-2 mt-12">All Landmarks</Text>
            <ScrollView showsVerticalScrollIndicator={false} className="max-h-[240px] mb-6">
              <View className="flex-row flex-wrap justify-center">
                {allLandmarks.map((landmark) => {
                  const isSelected = selectedRoute.some((l) => l.pageId === landmark.pageId);
                  return (
                    <Text
                      key={landmark.pageId}
                      onPress={!isSelected ? () => handleAddToRoute(landmark) : undefined}
                      className={`px-3 py-2 rounded-full mr-2 mb-2 ${
                        isSelected ? "bg-gray-300 text-gray-500" : "bg-gray-200 text-black"
                      }`}
                    >
                      {landmark.title}
                    </Text>
                  );
                })}
              </View>
            </ScrollView>

            <Text className="text-xl font-bold mb-2">Selected Route</Text>
            <ScrollView className="max-h-[360px] mb-6">
              {selectedRoute.map((item, index) => (
                <View
                  key={item.pageId}
                  style={{
                    backgroundColor: "#e5e5e5",
                    marginBottom: 8,
                    padding: 12,
                    borderRadius: 12,
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <Text>{`${index + 1}. ${item.title}`}</Text>

                  <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                    {/* Move up */}
                    <Pressable onPress={() => moveItem(index, -1)} disabled={index === 0}>
                      <ChevronUpIcon size={22} color={index === 0 ? "#aaa" : "#000"} />
                    </Pressable>

                    {/* Move down */}
                    <Pressable
                      onPress={() => moveItem(index, 1)}
                      disabled={index === selectedRoute.length - 1}
                    >
                      <ChevronDownIcon
                        size={22}
                        color={index === selectedRoute.length - 1 ? "#aaa" : "#000"}
                      />
                    </Pressable>

                    {/* Remove */}
                    <Pressable onPress={() => handleRemoveFromRoute(item.pageId)}>
                      <Text style={{ color: "red", fontWeight: "bold", fontSize: 16 }}>×</Text>
                    </Pressable>
                  </View>
                </View>
              ))}
            </ScrollView>

            {selectedRoute.length > 0 && (
              <View className="absolute bottom-6 left-0 right-0 px-6">
                <Button onPress={handleLetsGo}>
                  <Text className="text-white font-bold">Let's Go</Text>
                </Button>
              </View>
            )}
          </VStack>
        </SafeAreaView>
      );
    };

export default EditRouteScreen;