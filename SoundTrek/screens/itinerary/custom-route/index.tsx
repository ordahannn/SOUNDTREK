// React
import React, { useEffect, useState } from "react";
import MapView, { Marker, Polyline } from "react-native-maps";
import Svg, { Circle, Text as SvgText } from "react-native-svg";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Pressable, StyleSheet, View, Image, ActivityIndicator, ScrollView } from "react-native";

// Expo
import { router, useRouter, useLocalSearchParams } from "expo-router";
import * as Location from "expo-location";

// UI
import { Box } from "@/components/ui/box";
import { Text } from "@/components/ui/text";
import { ArrowBackIcon, PencilIcon, TrashIcon } from "@/components/ui/material-icons";
import { Button, ButtonText } from "@/components/ui/button";

// Helpers
import {
  loadFromStorage,
  removeSelectedRoute,
  setSelectedLandmark,
} from "@/helpers/storage-helper";
import { STORAGE_KEYS } from "@/helpers/storage-keys";
import { API_ENDPOINTS } from "@/helpers/api-helper";

//Hooks
import { useActivityTracker } from "@/hooks/useActivityTracker";

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

// const colors = [
//   "#FF0000", "#FFA500", "#FFFF00", "#00FF00", "#00FFFF",
//   "#0000FF", "#FF00FF", "#800080", "#FF1493", "#00CED1",
//   "#7FFF00", "#DC143C", "#1E90FF", "#FFD700", "#FF4500",
//   "#32CD32", "#FF69B4", "#4B0082", "#00FA9A", "#FF6347"
// ];

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

    await setSelectedLandmark(updatedLandmark);
    await AsyncStorage.setItem(STORAGE_KEYS.FromCustomRoute, "true");
    router.replace("/home/language");
  } catch (err) {
    console.error("[CustomRouteScreen] Failed to fetch full description:", err);
    alert("Something went wrong loading the landmark details.");
  }
};

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

export default function CustomRouteScreen() {
  const { fromLastRoute, fromEdit } = useLocalSearchParams();
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [selectedPoints, setSelectedPoints] = useState<SelectedLandmark[]>([]);
  const [selectedLandmark, setSelectedLandmark] = useState<SelectedLandmark | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [routeSegments, setRouteSegments] = useState<RouteSegment[]>([]);
  const router = useRouter();

  useActivityTracker(); 
  
  useEffect(() => {
    (async () => {
      setIsLoading(true);
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") return;

        const loc = await Location.getCurrentPositionAsync({});
        setLocation(loc);

        const cached = await loadFromStorage(STORAGE_KEYS.SavedCustomRoute);
        if (cached && Array.isArray(cached)) {
          const landmarks = cached as SelectedLandmark[];
          setSelectedPoints(landmarks);

          const segments: RouteSegment[] = [];

          // Line from current location to the first landmark
          if (landmarks.length > 0 && loc) {
            const fromCurrent = await getORSRoute(
              locationToLandmark(loc),
              landmarks[0]
            );
            segments.push({
              coordinates: fromCurrent,
              color: colors[0],
              });
          }

          // Line segments between landmarks
          for (let i = 0; i < landmarks.length - 1; i++) {
            const segmentCoordinates = await getORSRoute(landmarks[i], landmarks[i + 1]);
            segments.push({
              coordinates: segmentCoordinates,
              color: colors[i % colors.length],
            });
          }

          setRouteSegments(segments);
        }
      } catch (err) {
        console.error("[CustomRouteScreen] Init error:", err);
      } finally {
        setIsLoading(false);
      }
    })();
  }, [fromLastRoute, fromEdit]);

  // Handle marker (location click) press to show landmark details
  const handleMarkerPress = (landmark: SelectedLandmark) => {
    setSelectedLandmark(prev => (prev?.pageId === landmark.pageId ? null : landmark));
  };

  // Handle deletion of the route
  const handleDeleteRoute = async () => {
    await removeSelectedRoute(STORAGE_KEYS.SavedCustomRoute);
    setSelectedPoints([]);
    setSelectedLandmark(null);
    setRouteSegments([]);
  };

  if (isLoading || !location) {
    return (
      <Box className="flex-1 justify-center items-center bg-white">
        <Text className="text-gray-500 mb-4">Loading your route...</Text>
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
            params: { routeType: "custom" },
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

// Styles for the popup
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
    maxHeight: 400, // Maximum height for popup
    minHeight: 200, // Minimum height for popup
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
    maxHeight: 100, // Maximum height for description
    width: "100%",
    marginBottom: 6,
  },
  descriptionText: {
    textAlign: "center",
    paddingHorizontal: 8,
  },
});