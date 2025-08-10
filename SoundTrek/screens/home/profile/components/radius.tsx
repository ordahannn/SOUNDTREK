// React
import React, { useEffect, useState } from 'react';
import { Radius } from 'lucide-react-native';
import { useColorScheme } from "nativewind";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from "react-native";

// Expo
import * as Location from 'expo-location';

// UI
import { VStack } from '@/components/ui/vstack';
import { HStack } from '@/components/ui/hstack';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { Divider } from '@/components/ui/divider';
import { View } from '@/components/ui/view';
import { Slider, SliderTrack, SliderFilledTrack, SliderThumb } from '@/components/ui/slider';
import { Pressable } from '@/components/ui/pressable';
import { CheckIcon } from "@/components/ui/material-icons";

// Helpers
import { API_ENDPOINTS } from '@/helpers/api-helper';
import { fetchDataUser, sendDataUser } from '../helpers/api';
import { useUserId } from '../helpers/api';
import { STORAGE_KEYS } from '@/helpers/storage-keys';

// Other
import { useSearchRadius } from "../../../../app/SearchRadiusContext"

export const ProfileRadius = () => {
  // Get userId from custom hook
  const userId = useUserId();

  // State declarations
  const [sliderValue, setSliderValue] = useState<number>(4000);
  const [initialValue, setInitialValue] = useState<number>(4000);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { setRadius } = useSearchRadius();

  // Theme-related classes
  const { colorScheme } = useColorScheme();
const bgClass = colorScheme === "dark" ? "bg-white" : "bg-[#F1FFE8]";
const borderClass = colorScheme === "dark" ? "border-gray-600" : "border-[#a5d6a7]";

  // Load current user radius on mount or userId change
  useEffect(() => {
    if (!userId) return;
    (async () => {
      try {
        // Pass userId as string (do not cast to Number)
        const user = await fetchDataUser<{ searchRadiusMeters: number }>(API_ENDPOINTS.getUserById(Number(userId)));
        console.log(user)
        setSliderValue(user.searchRadiusMeters || 4000);
        setInitialValue(user.searchRadiusMeters || 4000);
      } catch {
        setSliderValue(4000);
        setInitialValue(4000);
      } finally {
        setLoading(false);
      }
    })();
  }, [userId]);

  // Fetch landmarks by location & radius
  const fetchAndStoreNearbyLandmarks = async (radius: number) => {
    try {
      const location = await Location.getCurrentPositionAsync({});
      const url = API_ENDPOINTS.getNearbyLandmarks(location.coords.latitude, location.coords.longitude, radius);
      const response = await fetch(url);
      if (!response.ok) throw new Error("Failed to fetch landmarks");
      const landmarks = await response.json();
      await AsyncStorage.setItem(STORAGE_KEYS.NearbyLandmarks, JSON.stringify(landmarks));
      console.log("[Profile-radius] Nearby landmarks updated after radius change.");
    } catch (err) {
      console.error("[Profile-radius] Failed to fetch landmarks:", err);
    }
  };

  // Handle applying the new radius to the server
  const handleApply = async () => {
    setSaving(true);
    try {
      await sendDataUser(API_ENDPOINTS.updateSearchRadius, { userId, radius: sliderValue }, 'PUT');
      setInitialValue(sliderValue);
      setRadius(sliderValue);

      // Fetch and store updated landmarks based on new radius
      await fetchAndStoreNearbyLandmarks(sliderValue);

      // Alert.alert(
      //   "Restart Required",
      //   "Please log in again to apply your changes."
      // );
    } catch (e) {
      console.error("[Profile-radius] Failed to update radius:", e);
    } finally {
      setSaving(false);
    }
  };

  return (
    <VStack className={`justify-between items-center mx-4 p-3 rounded-2xl ${bgClass} ${borderClass}`} space="lg">
      <HStack className='w-full'>
        <View className='flex-row items-center gap-2 justify-between w-full'>
          <View className='flex-row items-center gap-2'>
            <Icon as={Radius} className="text-typography-900" />
            <Text className='font-bold text-2xl'>Preferred Search Radius</Text>
          </View>
            <Pressable onPress={handleApply}>
            {saving ? (
              <Text style={{ fontSize: 20 }}>...</Text>
            ) : (
              <CheckIcon size={22} />
            )}
          </Pressable>
        </View>
      </HStack>
      <View className="w-full">
        <Divider
          orientation="horizontal"
          className="h-[1px] bg-gray-300 w-full"
        />
      </View>
      <HStack className='gap-4 items-center w-full'>
        <Slider
          className='flex-1 m-3'
          minValue={1000}
          maxValue={10000}
          value={sliderValue}
          step={1000}
          isDisabled={loading}
          onChange={(value) => setSliderValue(value)}
        >
          <SliderTrack>
            <SliderFilledTrack />
          </SliderTrack>
          <SliderThumb />
        </Slider>
        <Text>{sliderValue / 1000}km</Text>
      </HStack>
    </VStack>
  );
};