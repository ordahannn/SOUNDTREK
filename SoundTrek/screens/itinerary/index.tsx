// React
import React, { useEffect, useState } from "react";
import MapView, { PROVIDER_DEFAULT } from "react-native-maps";

// Expo
import * as Location from "expo-location";
import { useRouter } from "expo-router";

// UI
import { Box } from "@/components/ui/box";
import { VStack } from "@/components/ui/vstack";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { ItineraryLayout } from "@/screens/itinerary/layout";

// Helpers
import { loadFromStorage } from "@/helpers/storage-helper";
import { STORAGE_KEYS } from "@/helpers/storage-keys";

// Hooks
import { useActivityTracker } from "@/hooks/useActivityTracker";

export default function ItineraryMapScreen() {
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const router = useRouter();

  useActivityTracker(); 

  type RecommendedStop = {
    pageId: string;
    stopNumber: number;
  };
  const [recommendedRoute, setRecommendedRoute] = useState<RecommendedStop[] | null>(null);
  useEffect(() => {
    const intervalId = setInterval(async () => {
      try {
        const savedRoute = await loadFromStorage(STORAGE_KEYS.RecommendedRoute);
        if (Array.isArray(savedRoute)) {
          setRecommendedRoute(savedRoute as RecommendedStop[]);
        } else {
          setRecommendedRoute(null);
        }
      } catch (e) {
        console.error("Error loading recommended route from storage", e);
        setRecommendedRoute(null);
      }
    }, 1000);

    return () => clearInterval(intervalId);
  }, []);

  // Get user location
  useEffect(() => {
    const fetchLocation = async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") return;

      const loc = await Location.getCurrentPositionAsync({});
      setLocation(loc);
    };
    fetchLocation();
  }, []);

  // Custom route planning
  const goToCustomlPlan = () => {
    router.push("/itinerary/custom-route?fromEdit=true");
  };

  // Recommended route planning
  const goToRecommendedPlan = () => {
    router.push("/itinerary/recommended-route");
  };

  
  return (
    <ItineraryLayout showHeader={false} showTabBar={true}>
      <Box className="flex-1 relative absolute top-0 bottom-0 left-0 right-0">
        <MapView
          style={{ position: "absolute", top: 0, bottom: 0, left: 0, right: 0 }}
          provider={PROVIDER_DEFAULT}
          showsUserLocation={true}
          showsPointsOfInterest={false}
          showsBuildings={false}
          showsIndoors={false}
          showsCompass={false}
          showsTraffic={false}
          toolbarEnabled={false}
          region={
            location
              ? {
                latitude: location.coords.latitude,
                longitude: location.coords.longitude,
                latitudeDelta: 0.01,
                longitudeDelta: 0.01,
              }
              : undefined
          }
        />

        <Box className="absolute bottom-[12px] left-0 right-0 px-4 z-10">
          <Box className="bg-white p-4 rounded-2xl shadow-lg">
            <VStack className="gap-4 items-center">
              <Button onPress={goToCustomlPlan} className="w-full">
                <Text className="text-white font-bold">Build Your Own Route</Text>
              </Button>

              {recommendedRoute && recommendedRoute.length > 0 && (
                <Button onPress={goToRecommendedPlan} className="w-full">
                  <Text className="text-white font-bold">Recommended Route</Text>
                </Button>
              )}
            </VStack>
          </Box>
        </Box>
      </Box>
    </ItineraryLayout>
  );
}