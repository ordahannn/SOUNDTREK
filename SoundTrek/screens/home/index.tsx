// React
import React, { useEffect, useState } from "react";

// Expo
import * as Location from "expo-location";
import { useRouter } from "expo-router";

// UI
import { ScrollView } from "@/components/ui/scroll-view";
import { HStack } from "@/components/ui/hstack";
import { View } from "@/components/ui/view";
import { Text } from "@/components/ui/text";
import { Spinner } from "@/components/ui/spinner";
import { Pressable } from "@/components/ui/pressable";
import { LandmarkCard } from "@/components/landmark-card";
import { HomeLayout } from "./layout";

// Helpers
import { useUserId } from "./profile/helpers/api";
import { STORAGE_KEYS } from "@/helpers/storage-keys";
import { loadFromStorage, saveToStorage } from "@/helpers/storage-helper";
import { API_ENDPOINTS } from "@/helpers/api-helper";

// Types
import { WikipediaLandmark } from "@/types/WikipediaLandmark";
import { SelectedLandmark } from "@/types/SelectedLandmark";

// Hooks
import { useSessionGuard } from "@/hooks/useSessionGuard";
import { useActivityTracker } from "@/hooks/useActivityTracker";
import { fetchDataUser } from "./profile/helpers/api";

// Other
import { useSearchRadius } from "../../app/SearchRadiusContext"

const fetchNearbyLandmarks = async (lat: number, lon: number, userRadius: number): Promise<WikipediaLandmark[]> => {
  userRadius = 10000; // Ignore current radius selection, and filter later
  const response = await fetch(API_ENDPOINTS.getNearbyLandmarks(lat, lon, userRadius));
  if (!response.ok) throw new Error("Failed to fetch nearby landmarks");
  return await response.json();
};

type RecommendedLandmarksResponse = {
  recommendedLandmarks: WikipediaLandmark[];
  recommendedRoute: { stopNumber: number; pageId: string }[];
};

const fetchRecommendedLandmarks = async (
  userId: number,
  lat: number,
  lon: number,
  nearbyLandmarks: WikipediaLandmark[]
): Promise<RecommendedLandmarksResponse> => {
  const url = API_ENDPOINTS.getRecommendedLandmarks;

  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      userId,
      userLat: lat,
      userLon: lon,
      nearbyLandmarks,
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    console.error("Failed response text:", text);
    throw new Error(`Failed to fetch recommended landmarks: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  console.log(JSON.stringify(data, null, 2));
  return data as RecommendedLandmarksResponse;
};

const Home = ({ setLocationTitle }: { setLocationTitle: (title: string) => void }) => {

  const [userLon, setUserLon] = useState<number>();
  const [userLat, setUserLat] = useState<number>();



  useEffect(() => {
    (async () => {
      const currentLocation = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = currentLocation.coords;
      const locationObj = { latitude, longitude };
      setCurrentCoords(locationObj);
      setUserLon(longitude)
      setUserLat(latitude)
      const places = await Location.reverseGeocodeAsync(locationObj);
      const currentPlace = places?.[0];

      const resolvedName =
        currentPlace?.city ||
        currentPlace?.district ||
        currentPlace?.region ||
        currentPlace?.country ||
        "Your Location";

      setLocationTitle(resolvedName);
    })();
  }, []);

  const router = useRouter();
  const userId = useUserId();

  const [currentCoords, setCurrentCoords] = useState<{ latitude: number; longitude: number } | null>(null);
  const [loadingNearby, setLoadingNearby] = useState(true);
  const [loadingRecommended, setLoadingRecommended] = useState(false);
  const [error, setError] = useState("");
  const [nearbyLandmarks, setNearbyLandmarks] = useState<WikipediaLandmark[]>([]);
  const [recommendedLandmarks, setRecommendedLandmarks] = useState<WikipediaLandmark[]>([]);
  const [selectedTab, setSelectedTab] = useState<"all" | "recommended">("all");
  const { radius, setRadius } = useSearchRadius();
  useEffect(() => {
    if (!userId) return;

    (async () => {
      try {
        const user = await fetchDataUser<{ searchRadiusMeters: number }>(API_ENDPOINTS.getUserById(Number(userId)));
        const savedLocation = (await loadFromStorage(STORAGE_KEYS.UserLastLocation)) as { latitude: number; longitude: number } | null;
        const savedNearby = (await loadFromStorage(STORAGE_KEYS.NearbyLandmarks)) as WikipediaLandmark[] | null;
        const savedRecommended = (await loadFromStorage(STORAGE_KEYS.RecommendedLandmarks)) as WikipediaLandmark[] | null;
        if (savedLocation && savedNearby) {
          setCurrentCoords(savedLocation);
          setNearbyLandmarks(savedNearby);
          setLoadingNearby(false);
          if (savedRecommended) {
            setRecommendedLandmarks(savedRecommended);

          } else {
            setLoadingRecommended(true);
            const recData = await fetchRecommendedLandmarks(Number(userId), savedLocation.latitude, savedLocation.longitude, savedNearby);
            const rec = recData.recommendedLandmarks;
            const recRoute = recData.recommendedRoute;
            await saveToStorage(STORAGE_KEYS.RecommendedRoute, recRoute);
            setRecommendedLandmarks(rec);

            await saveToStorage(STORAGE_KEYS.RecommendedLandmarks, rec);
            setLoadingRecommended(false);
            setRadius(user.searchRadiusMeters);
          }
          return;
        }

        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") {
          setError("Permission to access location was denied");
          setLoadingNearby(false);
          return;
        }

        const currentLocation = await Location.getCurrentPositionAsync({});
        const { latitude, longitude } = currentLocation.coords;
        setCurrentCoords({ latitude, longitude });

        setLoadingNearby(true);
        const nearby = await fetchNearbyLandmarks(latitude, longitude, user.searchRadiusMeters);
        setNearbyLandmarks(nearby);
        await saveToStorage(STORAGE_KEYS.NearbyLandmarks, nearby);
        await saveToStorage(STORAGE_KEYS.UserLastLocation, { latitude, longitude });
        setLoadingNearby(false);

        setLoadingRecommended(true);
        const recommendedData = await fetchRecommendedLandmarks(Number(userId), latitude, longitude, nearby);
        const recommended = recommendedData.recommendedLandmarks;
        const recommendedRoute = recommendedData.recommendedRoute;
        await saveToStorage(STORAGE_KEYS.RecommendedRoute, recommendedRoute);
        console.log("\n\nhi!:\n",recommendedRoute,"\n\n")
        
        setRecommendedLandmarks(recommended);
        await saveToStorage(STORAGE_KEYS.RecommendedLandmarks, recommended);
        setLoadingRecommended(false);

      } catch (err) {
        console.error("Error loading data:", err);
        setError("Error loading data");
        setLoadingNearby(false);
        setLoadingRecommended(false);
      }
    })();
  }, [userId]);

  const handleLandmarkCardPress = async (landmark: WikipediaLandmark) => {
    const selectedLandmark: SelectedLandmark = {
      pageId: landmark.pageId,
      title: landmark.title,
      lat: landmark.lat,
      lon: landmark.lon,
      imageUrl: landmark.imageUrl,
      shortDescription: landmark.shortDescription || "",
      fullDescription: "",
      selectedGenre: "",
      processedText: "",
    };

    await saveToStorage(STORAGE_KEYS.SelectedLandmark, selectedLandmark);
    router.push({ pathname: "/home/details", params: { pageId: landmark.pageId } });
  };

  const toRad = (value: number): number => {
    return (value * Math.PI) / 180;
  };

  const distanceCalc = (
    landmarkLon: number,
    landmarkLat: number
  ): boolean => {
    if (userLat === undefined || userLon === undefined) return true;
    const R = 6371000; // Earth's radius in meters
    const dLat = toRad(landmarkLat - userLat);
    const dLon = toRad(landmarkLon - userLon);
    const lat1 = toRad(userLat);
    const lat2 = toRad(landmarkLat);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c; // In meters

    return distance <= radius;
  };

  const displayedLandmarks = selectedTab === "all" ? nearbyLandmarks : recommendedLandmarks;

  if (loadingNearby || (selectedTab === "recommended" && loadingRecommended)) {
    return (

      <ScrollView showsVerticalScrollIndicator={false} className="flex-1 px-4">
        <HStack className="justify-around pr-12 pl-12 mb-6">
          {["all", "recommended"].map((tab) => (
            <Pressable key={tab} onPress={() => setSelectedTab(tab as "all" | "recommended")}>
              <Text
                className={`text-lg ${selectedTab === tab ? "font-bold text-primary-800" : "text-background-800"
                  }`}
              >
                {tab === "all" ? "All" : "Recommended"}
              </Text>
            </Pressable>
          ))}
        </HStack>
        <View className="justify-center items-center p-10 flex-row gap-2">
          {selectedTab === "recommended" && <Text>Loading Reccomended Landmarks</Text>}
          {selectedTab === "all" && <Text>Loading Nearby Landmarks</Text>}

          <Spinner />
        </View>
      </ScrollView>

    );
  }

  if (error) {
    return (
      <ScrollView className="flex-1 px-4 pt-4">
        <View className="flex-1 items-center justify-center mt-24">
          <Text className="text-red-600">{error}</Text>
        </View>
      </ScrollView>
    );
  }

  return (
    <ScrollView showsVerticalScrollIndicator={false} className="flex-1 px-4">
      <HStack className="justify-around pr-12 pl-12 mb-6">
        {["all", "recommended"].map((tab) => (
          <Pressable key={tab} onPress={() => setSelectedTab(tab as "all" | "recommended")}>
            <Text
              className={`text-lg ${selectedTab === tab ? "font-bold text-primary-800 " : "text-background-800"
                }`}
            >
              {tab === "all" ? "All" : "Recommended"}
            </Text>
          </Pressable>
        ))}
      </HStack>

      <View className="flex-row flex-wrap justify-between pb-6">
        {displayedLandmarks.length === 0 ? (
          <Text className="text-gray-500 text-center w-full mt-4">No attractions found.</Text>
        ) : (
          displayedLandmarks.map((landmark) => (

            distanceCalc(landmark.lon, landmark.lat) ? (<LandmarkCard
              key={landmark.pageId}
              landmark={landmark}
              onPress={() => handleLandmarkCardPress(landmark)}
            />) : null

          ))
        )}
      </View>
    </ScrollView>
  );
};

export const HomeScreen = () => {
  useSessionGuard();
  useActivityTracker();

  const [locationTitle, setLocationTitle] = useState("");

  return (
    <HomeLayout headerTitle={locationTitle}>
      <Home setLocationTitle={setLocationTitle} />
    </HomeLayout>
  );
};

export default HomeScreen;