// React
import React, { useEffect, useState } from "react";
import MapView, { Marker, Polyline } from "react-native-maps";
import Svg, { Circle, Text as SvgText } from "react-native-svg";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Pressable, StyleSheet, View, Image, ActivityIndicator, Alert, ScrollView } from "react-native";

// Expo
import { useRouter } from "expo-router";
import * as Location from "expo-location";

// UI
import { Box } from "@/components/ui/box";
import { Text } from "@/components/ui/text";
import { ArrowBackIcon, PencilIcon, TrashIcon } from "@/components/ui/material-icons";
import { Button, ButtonText } from "@/components/ui/button";

// Hooks
import { useActivityTracker } from "@/hooks/useActivityTracker";

// Helpers
import {
  loadFromStorage,
  removeSelectedRoute,
  setSelectedLandmark as setSelectedLandmarkStorage,
} from "@/helpers/storage-helper";
import { STORAGE_KEYS } from "@/helpers/storage-keys";
import { API_ENDPOINTS } from "@/helpers/api-helper";

// Types
import { SelectedLandmark } from "@/types/SelectedLandmark";
type LatLng = { latitude: number; longitude: number };

type RouteSegment = {
  coordinates: LatLng[];
  color: string;
};

// Other
import { mapsApi } from "../config";

const DEFAULT_IMAGE = require("@/screens/home/assets/SOUNDTREK_LOGO_LIGHT.png");

const colors = [
  "#003300", "#0B4410", "#145C1A", "#1E7524", "#278D2E",
  "#3ABE42", "#44D74C", "#62FF69", "#76FF7D", "#9EFFA5",
  "#B2FFB9", "#C6FFCD", "#DAFFE1", "#EEFFF5", "#003300",
  "#0B4410", "#145C1A", "#1E7524", "#278D2E", "#3ABE42",
  "#9EFFA5", "#B2FFB9", "#C6FFCD", "#DAFFE1", "#EEFFF5",
];

const NumberedMarker = ({ number, listened }: { number: number; listened?: boolean }) => (
  <Svg height="40" width="40">
    <Circle cx="20" cy="20" r="18" stroke="white" strokeWidth="3" fill={listened ? "#999" : "black"} />
    <SvgText x="20" y="26" fontSize="16" fill="white" textAnchor="middle" fontWeight="bold">
      {number}
    </SvgText>
  </Svg>
);

const locationToLandmark = (loc: Location.LocationObject): SelectedLandmark => ({
  pageId: "current-location",
  title: "Current Location",
  lat: loc.coords.latitude,
  lon: loc.coords.longitude,
});

const getORSRoute = async (
  origin: SelectedLandmark,
  destination: SelectedLandmark
): Promise<LatLng[]> => {
  const url = "https://api.openrouteservice.org/v2/directions/foot-walking/geojson";
  const body = {
    coordinates: [
      [origin.lon, origin.lat],
      [destination.lon, destination.lat]
    ]
  };

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Authorization": mapsApi,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(body)
  });

  const data = await response.json();

  if (!data.features || !data.features[0]?.geometry?.coordinates) {
    console.warn("Failed to get ORS route data");
    return [];
  }

  return data.features[0].geometry.coordinates.map(
    ([lon, lat]: [number, number]) => ({
      latitude: lat,
      longitude: lon,
    })
  );
};

type RecommendedStop = {
  pageId: string;
  stopNumber: number;
};

export default function RecommendedRouteScreen() {
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [allLandmarks, setAllLandmarks] = useState<SelectedLandmark[]>([]);
  const [recommendedRoute, setRecommendedRoute] = useState<RecommendedStop[] | null>(null);
  const [selectedPoints, setSelectedPoints] = useState<SelectedLandmark[]>([]);
  const [selectedLandmark, setSelectedLandmark] = useState<SelectedLandmark | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [routeSegments, setRouteSegments] = useState<RouteSegment[]>([]);
  const router = useRouter();
  const [activeSource, setActiveSource] = useState<"saved" | "original" | null>(null);

  useActivityTracker();

  const saveSelectedLandmark = async (landmark: SelectedLandmark | null) => {
    try {
      if (landmark) {
        await AsyncStorage.setItem(STORAGE_KEYS.SelectedLandmark, JSON.stringify(landmark));
      } else {
        await AsyncStorage.removeItem(STORAGE_KEYS.SelectedLandmark);
      }
    } catch (e) {
      console.error("Failed to save selected landmark", e);
    }
  };

  // Load route (RecommendedStop arrays)
  useEffect(() => {
    (async () => {
      try {
        const savedStops = await loadFromStorage<RecommendedStop[]>(STORAGE_KEYS.SavedRecommendedRoute);
        const originalStops = await loadFromStorage<RecommendedStop[]>(STORAGE_KEYS.RecommendedRoute);

        console.log("Loaded saved recommended stops:", savedStops);
        console.log("Loaded original recommended stops:", originalStops);

        if (Array.isArray(savedStops) && savedStops.length > 0 && Array.isArray(originalStops) && originalStops.length > 0) {
          Alert.alert(
            "Choose Route",
            "You have a custom version of the recommended route. Which route would you like to see?",
            [
              { text: "My Edited Route", onPress: () => { setRecommendedRoute(savedStops); setActiveSource("saved"); } },
              { text: "Original Route", onPress: () => { setRecommendedRoute(originalStops); setActiveSource("original"); } },
            ],
            { cancelable: false }
          );
        } else if (Array.isArray(savedStops) && savedStops.length > 0) {
          setRecommendedRoute(savedStops);
          setActiveSource("saved");
        } else if (Array.isArray(originalStops) && originalStops.length > 0) {
          setRecommendedRoute(originalStops);
          setActiveSource("original");
        } else {
          setRecommendedRoute(null);
        }
      } catch (e) {
        console.error("Error loading recommended route", e);
        setRecommendedRoute(null);
      }
    })();
  }, []);

  // Load NearbyLandmarks
  useEffect(() => {
    (async () => {
      try {
        const storedLandmarks = await loadFromStorage(STORAGE_KEYS.NearbyLandmarks);
        if (storedLandmarks && Array.isArray(storedLandmarks)) {
          setAllLandmarks(storedLandmarks as SelectedLandmark[]);
        } else {
          setAllLandmarks([]);
        }
      } catch (e) {
        console.error("Error loading landmarks from storage", e);
        setAllLandmarks([]);
      }
    })();
  }, []);

  // Combine RecommendedStop with NearbyLandmarks
  useEffect(() => {
    if (!recommendedRoute || allLandmarks.length === 0) return;

    const sortedStops = [...recommendedRoute].sort((a, b) => a.stopNumber - b.stopNumber);

    const fullRoute = sortedStops
      .map(stop => allLandmarks.find(lm => lm.pageId === stop.pageId))
      .filter(Boolean) as SelectedLandmark[];

    setSelectedPoints(fullRoute);
  }, [recommendedRoute, allLandmarks]);

  // Build segments
  useEffect(() => {
    (async () => {
      if (!location) return;

      if (selectedPoints.length === 0) {
        setRouteSegments([]);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        const segments: RouteSegment[] = [];

        const fromCurrent = await getORSRoute(
          locationToLandmark(location),
          selectedPoints[0]
        );
        segments.push({
          coordinates: fromCurrent,
          color: colors[0],
        });

        for (let i = 0; i < selectedPoints.length - 1; i++) {
          const segmentCoordinates = await getORSRoute(selectedPoints[i], selectedPoints[i + 1]);
          segments.push({
            coordinates: segmentCoordinates,
            color: colors[i % colors.length],
          });
        }

        setRouteSegments(segments);
      } catch (err) {
        console.error("[RecommendedRouteScreen] Error creating route segments:", err);
      } finally {
        setIsLoading(false);
      }
    })();
  }, [selectedPoints, location]);

  // Get user location
  useEffect(() => {
    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") {
          console.warn("Location permission not granted");
          setIsLoading(false);
          return;
        }

        const loc = await Location.getCurrentPositionAsync({});
        setLocation(loc);
      } catch (err) {
        console.error("Failed to get location", err);
        setIsLoading(false);
      }
    })();
  }, []);

  const handleMarkerPress = async (landmark: SelectedLandmark) => {
    if (selectedLandmark?.pageId === landmark.pageId) {
      setSelectedLandmark(null);
      await saveSelectedLandmark(null);
    } else {
      setSelectedLandmark(landmark);
      await saveSelectedLandmark(landmark);
    }
  };

  const handleDeleteRoute = async () => {
    await removeSelectedRoute(STORAGE_KEYS.SavedRecommendedRoute);
    setSelectedPoints([]);
    setSelectedLandmark(null);
    setRouteSegments([]);
  };

  const handleListen = async (landmark: SelectedLandmark) => {
    try {
      const response = await fetch(API_ENDPOINTS.getLandmarkFullDescription(landmark.pageId));
      if (!response.ok) throw new Error("Failed to fetch full description");

      const data = await response.json();
      if (!data.description) {
        alert("No description available for this landmark.");
        return;
      }

      const updatedLandmark: SelectedLandmark = {
        ...landmark,
        fullDescription: data.description,
      };

      setSelectedLandmark(updatedLandmark);
      await saveSelectedLandmark(updatedLandmark);

      if (activeSource === "original") {
        await AsyncStorage.setItem(STORAGE_KEYS.FromRecommendedOriginal, "true");
        await AsyncStorage.setItem(STORAGE_KEYS.FromRecommendedRoute, "true");
        // Save the original route
        const original = await loadFromStorage(STORAGE_KEYS.RecommendedRoute);
      if (original) {
        await AsyncStorage.setItem(
          STORAGE_KEYS.RecommendedRoute,
          JSON.stringify(original)
        );
      }
    } else {
      await AsyncStorage.setItem(STORAGE_KEYS.FromRecommendedRoute, "true");

      // Save edited route
      const saved = await loadFromStorage(STORAGE_KEYS.SavedRecommendedRoute);
      if (saved) {
        await AsyncStorage.setItem(
          STORAGE_KEYS.SavedRecommendedRoute,
          JSON.stringify(saved)
        );
      }
    }

    await AsyncStorage.setItem(STORAGE_KEYS.SelectedLandmark, JSON.stringify(updatedLandmark));
    router.replace("/home/language");
    } catch (err) {
      console.error("[RecommendedRouteScreen] Failed to fetch full description:", err);
      alert("Something went wrong loading the landmark details.");
    }
  };

  if (isLoading || !location) {
    return (
      <Box className="flex-1 justify-center items-center bg-white">
        <Text className="text-gray-500 mb-4">Loading your recommended route...</Text>
        <ActivityIndicator size="large" color="#999" />
      </Box>
    );
  }

  return (
    <Box className="flex-1 relative">
      <MapView
        style={{ position: "absolute", top: 0, bottom: 0, left: 0, right: 0, zIndex: 0 }}
        showsUserLocation
        showsPointsOfInterest={false}
        showsBuildings={false}
        toolbarEnabled={false}
        region={{
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        }}
      >
        {selectedPoints.map((p, index) => (
          <Marker
            key={p.pageId}
            coordinate={{ latitude: p.lat, longitude: p.lon }}
            onPress={() => handleMarkerPress(p)}
          >
            <NumberedMarker number={index + 1} listened={p.listened} />
          </Marker>
        ))}

        {routeSegments.map((segment, index) => (
          <Polyline
            key={`route-segment-${index}`}
            coordinates={segment.coordinates}
            strokeColor={segment.color}
            strokeWidth={5}
          />
        ))}
      </MapView>

      {selectedLandmark && (
        <View style={styles.popup} className="gap-4">
          <Pressable
            onPress={() => setSelectedLandmark(null)}
            style={{
              position: "absolute",
              top: 8,
              right: 8,
              zIndex: 10,
              width: 30,
              height: 30,
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Text style={{ fontSize: 24, fontWeight: "bold" }}>×</Text>
          </Pressable>
          {"imageUrl" in selectedLandmark && selectedLandmark.imageUrl && (
            <Image
              source={{ uri: selectedLandmark.imageUrl }}
              style={styles.popupImage}
              defaultSource={DEFAULT_IMAGE}
            />
          )}
          <Text style={styles.popupTitle}>{selectedLandmark.title}</Text>
          <View style={styles.descriptionContainer}>
            <ScrollView showsVerticalScrollIndicator={false} nestedScrollEnabled={true}>
              <Text style={styles.descriptionText}>
                {selectedLandmark.shortDescription}
              </Text>
            </ScrollView>
          </View>
          <Button onPress={() => handleListen(selectedLandmark)}>
            <ButtonText>Listen Now</ButtonText>
          </Button>
        </View>
      )}

      <Pressable
        onPress={() => router.replace("/itinerary/map")}
        className="absolute top-20 left-8 z-20 bg-white rounded-full p-2 shadow-md"
      >
        <ArrowBackIcon size={22} />
      </Pressable>

      <Pressable
        onPress={() =>
          router.replace({
            pathname: "/itinerary/edit",
            params: {
              routeType: "recommended",
              source: activeSource || "original",
            },
          })
        }
        className="absolute top-20 right-8 z-20 bg-white rounded-full p-2 shadow-md"
      >
        <PencilIcon size={22} />
      </Pressable>

      <Pressable
        onPress={handleDeleteRoute}
        disabled={selectedPoints.length === 0}
        className={`absolute top-36 right-8 z-20 rounded-full p-2 shadow-md ${
          selectedPoints.length === 0 ? "bg-gray-200" : "bg-white"
        }`}
      >
        <TrashIcon size={22} color={selectedPoints.length === 0 ? "#aaa" : "#000"} />
      </Pressable>
    </Box>
  );
}

const styles = StyleSheet.create({
  popup: {
    position: "absolute",
    bottom: 100,
    left: 50,
    right: 50,
    backgroundColor: "white",
    borderRadius: 16,
    padding: 12,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 5,
    maxHeight: 400,
    minHeight: 200,
  },
  popupImage: {
    width: 150,
    height: 150,
    borderRadius: 12,
    marginBottom: 6,
  },
  popupTitle: {
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 6,
  },
  descriptionContainer: {
    flexGrow: 0,
    maxHeight: 100,
    width: "100%",
    marginBottom: 6,
  },
  descriptionText: {
    textAlign: "center",
    paddingHorizontal: 8,
  },
});