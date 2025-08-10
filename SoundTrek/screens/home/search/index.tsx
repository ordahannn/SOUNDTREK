// React
import React, { useEffect, useState } from "react";

// Expo
import { router } from "expo-router";

// UI
import { ScrollView } from "@/components/ui/scroll-view";
import { View } from "@/components/ui/view";
import { Text } from "@/components/ui/text";
import { Input, InputField } from "@/components/ui/input";
import { Pressable } from "@/components/ui/pressable";
import { LandmarkCard } from "@/components/landmark-card";
import { Spinner } from "@/components/ui/spinner";
import { VStack } from "@/components/ui/vstack";
import { HomeLayout } from "../layout";

// Helpers
import { loadFromStorage, saveToStorage } from "@/helpers/storage-helper";
import { STORAGE_KEYS } from "@/helpers/storage-keys";

// Hooks
import { useActivityTracker } from "@/hooks/useActivityTracker";
import { useSessionGuard } from "@/hooks/useSessionGuard";

// Typers
import { SelectedLandmark } from "@/types/SelectedLandmark";

type Category = {
  mainCategoryId: number;
  mainCategoryName: string;
};

const Search = () => {
  const [landmarks, setLandmarks] = useState<any[]>([]);
  const [filtered, setFiltered] = useState<any[]>([]);
  const [loadingLandmarks, setLoadingLandmarks] = useState<boolean>(true);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);

  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);

  // Fetch all landmarks
  const loadLandmarks = async () => {
    try {
      const nearby = (await loadFromStorage(STORAGE_KEYS.NearbyLandmarks)) as any[] || [];
      setLandmarks(nearby);
      setFiltered(nearby);

      const catsMap = new Map<number, string>();
      nearby.forEach(landmark => {
        if (Array.isArray(landmark.mainCategories)) {
          landmark.mainCategories.forEach((cat: Category) => {
            catsMap.set(cat.mainCategoryId, cat.mainCategoryName);
          });
        }
      });
      let catsArray = Array.from(catsMap.entries()).map(([mainCategoryId, mainCategoryName]) => ({
        mainCategoryId,
        mainCategoryName,
      }));
      catsArray = [{ mainCategoryId: 0, mainCategoryName: "All" }, ...catsArray];

      setCategories(catsArray);
      setSelectedCategory(catsArray[0]);
    } catch (error) {
      console.error("Failed to load landmarks from storage", error);
      setLandmarks([]);
      setFiltered([]);
      setCategories([]);
    } finally {
      setLoading(false);
      setLoadingLandmarks(false);
    }
  };

  // First call
  useEffect(() => {
    loadLandmarks();
  }, []);

  // Polling as long as no landmarks has been fetched
  useEffect(() => {
    if (landmarks.length > 0) return; // If the kandmarks exists stop polling

    const interval = setInterval(() => {
      loadLandmarks();
    }, 1000);

    return () => clearInterval(interval);
  }, [landmarks]);

  // Filter by category and query
  useEffect(() => {
    if (!query && (!selectedCategory || selectedCategory.mainCategoryId === 0)) {
      setFiltered(landmarks);
      return;
    }

    const lowerQuery = query.toLowerCase();

    let filteredList = landmarks;

    if (selectedCategory && selectedCategory.mainCategoryId !== 0) {
      filteredList = filteredList.filter(l =>
        Array.isArray(l.mainCategories) &&
        l.mainCategories.some((cat: Category) => cat.mainCategoryId === selectedCategory.mainCategoryId)
      );
    }

    if (query) {
      filteredList = filteredList.filter(l =>
        l.title?.toLowerCase().includes(lowerQuery)
      );
    }

    setFiltered(filteredList);
  }, [query, landmarks, selectedCategory]);

  // Go to landmark's details page
  const handleLandmarkCardPress = async (landmark: any) => {
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

  // Loading page
  if (landmarks.length === 0) {
    return (
      <ScrollView showsVerticalScrollIndicator={false} className="flex-1 px-4">
        <View className="justify-center items-center p-10 flex-row gap-2">
          <Text>Loading Nearby Landmarks</Text>
          <Spinner />
        </View>
      </ScrollView>
    );
  }

  // Landmark's serach page
  return (
    <ScrollView showsVerticalScrollIndicator={false} className="flex-1 px-4 pt-4">
      <VStack space="xs">
        <Text className="text-typography-500 mb-2 text-left">Search by name</Text>
        <Input className="flex-1 mb-8 rounded-xl px-4 py-3">
          <InputField
            placeholder="Search"
            value={query}
            onChangeText={setQuery}
            returnKeyType="search"
            style={{ paddingVertical: 10, fontSize: 16, minHeight: 72 }}
          />
        </Input>
      </VStack>

      <Text className="text-typography-500 mb-2 text-left">Search by category</Text>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        className="mb-8"
      >
        {loading ? (
          <Text>Loading categories...</Text>
        ) : categories.length === 0 ? (
          <Text>No categories found.</Text>
        ) : (
          categories
            // Filter other category from the categories
            .filter((cat) => cat.mainCategoryName.toLowerCase() !== "other")
            .map((category) => {
              const isSelected = selectedCategory?.mainCategoryId === category.mainCategoryId;
              return (
                <Pressable
                  key={category.mainCategoryId}
                  onPress={() => {
                    if (isSelected) {
                      setSelectedCategory(null);
                    } else {
                      setSelectedCategory(category);
                    }
                  }}
                  style={{
                    backgroundColor: isSelected ? "#002e04ff" : "#f0f0f0",
                    borderRadius: 20,
                    paddingHorizontal: 14,
                    paddingVertical: 8,
                    marginRight: 8,
                  }}
                >
                  <Text
                    style={{
                      textAlign: "center",
                      color: isSelected ? "white" : "black",
                      fontWeight: isSelected ? "700" : "400",
                    }}
                  >
                    {category.mainCategoryName}
                  </Text>
                </Pressable>
              );
            })
        )}
      </ScrollView>

      <Text className="text-lg font-bold mb-6">Results:</Text>
      {loading ? (
        <View className="flex-1 items-center justify-center mt-12 mb-20">
          <Spinner />
        </View>
      ) : (
        <View className="flex-row flex-wrap justify-between pb-6">
          {loading ? (
            <Text className="text-center w-full mt-4">Loading...</Text>
          ) : filtered.length === 0 ? (
            <Text className="text-gray-500 text-center w-full mt-4">No results found.</Text>
          ) : (
            filtered.map((landmark) => (
              <LandmarkCard
                key={landmark.pageId}
                landmark={landmark}
                onPress={() => handleLandmarkCardPress(landmark)}
              />
            ))
          )}
        </View>
      )}
    </ScrollView>
  );
};

export const SearchScreen = () => {
  useSessionGuard();
  useActivityTracker();

    return (
        <HomeLayout headerTitle={"Search"}>
            <Search />
        </HomeLayout>
    );
};

export default SearchScreen;