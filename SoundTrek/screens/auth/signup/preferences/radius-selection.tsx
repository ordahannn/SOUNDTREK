// React
import React, { useEffect, useState } from "react";
import { ScrollView } from "react-native";
import { Slider } from "@react-native-assets/slider";

// Expo
import { useRouter } from "expo-router";

// UI
import { VStack } from "@/components/ui/vstack";
import { Text } from "@/components/ui/text";
import { Button, ButtonText } from "@/components/ui/button";
import { Pressable } from "@/components/ui/pressable";
import { AuthLayout } from "@/screens/auth/layout";
import { Header } from "@/components/ui/header-back";

// Services
import { getUser } from "@/services/sessionService";
import { updateSearchRadius } from "@/services/userPreferencesService";

export default function RadiusSelectionScreen() {
  const router = useRouter();
  const [radius, setRadius] = useState<number>(5000); // Default
  const [userId, setUserId] = useState<number | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      const user = await getUser();
      if (user) {
        setUserId(user.userId);
        setRadius(user.searchRadiusMeters || 5000);
      }
    };
    fetchUser();
  }, []);

  // Handle confirm radius selection
  const handleConfirm = async () => {
    if (!userId || radius < 2000 || radius > 10000) return;

    try {
      console.log("Sending radius update:", { userId, radius });
      await updateSearchRadius(userId, radius);
      console.log("Radius updated!");
      router.replace("/auth/interests-selection");
    } catch (err: any) {
      console.error("Failed to update radius:", err.message || err);
    }
  };

  // handle skip selection
  const handleSkip = () => {
    router.replace("/auth/interests-selection");
  };

  return (
    <AuthLayout>
      <Header title="Radius" />
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <VStack className="p-6 space-y-6">
          <Text size="2xl" className="font-bold text-center">
            How far do you want to explore?
          </Text>

          <Text className="text-center text-lg text-gray-600">
            Select your search radius (in meters)
          </Text>

          <Text className="text-center font-bold text-xl text-primary-600">
            {radius} meters
          </Text>

          <Slider
            minimumValue={2000}
            maximumValue={10000}
            step={100}
            value={radius}
            onValueChange={(val) => setRadius(val)}
            minimumTrackTintColor="#2563eb"
            maximumTrackTintColor="#d1d5db"
            thumbTintColor="#2563eb"
          />

          <VStack className="mt-10 space-y-4">
            <Button onPress={handleConfirm}>
              <ButtonText className="font-bold">Confirm</ButtonText>
            </Button>

            <Pressable onPress={handleSkip}>
              <Text className="text-center text-primary-700 underline">Skip</Text>
            </Pressable>
          </VStack>
        </VStack>
      </ScrollView>
    </AuthLayout>
  );
}