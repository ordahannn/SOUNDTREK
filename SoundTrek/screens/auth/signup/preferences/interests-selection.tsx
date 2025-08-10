// React
import React, { useEffect, useState } from "react";
import { ScrollView } from "react-native";

// Expo
import { useRouter } from "expo-router";

// UI
import { VStack } from "@/components/ui/vstack";
import { Button, ButtonText } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { Pressable } from "@/components/ui/pressable";
import { Spinner } from "@/components/ui/spinner";
import { Header } from "@/components/ui/header-back";
import { AuthLayout } from "@/screens/auth/layout";

// Services
import { getUser } from "@/services/sessionService";
import { fetchInterests, updateUserInterests } from "@/services/userPreferencesService";

// Types
import { Interest } from "@/types/Interest";

export default function InterestsSelectionScreen() {
  const router = useRouter();
  const [interests, setInterests] = useState<Interest[]>([]);
  const [selectedInterests, setSelectedInterests] = useState<number[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [userId, setUserId] = useState<number | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const user = await getUser();
        if (user) setUserId(user.userId);

        const result = await fetchInterests();

        // Filter out the "Other" interest (case-insensitive)
        const filtered = result.filter(
          (interest) => interest.interestName.toLowerCase() !== "other"
        );
        setInterests(filtered);
      } catch (err) {
        console.error("Failed to load interests", err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Show interests to choose from
  const toggleInterest = (id: number) => {
    setSelectedInterests((prev) => {
      if (prev.includes(id)) {
        return prev.filter((i) => i !== id);
      } else if (prev.length < 5) {
        return [...prev, id];
      } else {
        return prev;
      }
    });
  };

  // Handle confirm interests selection
  const handleConfirm = async () => {
    if (userId === null || selectedInterests.length < 3) {
        console.warn("Invalid selection or missing userId");
        return;
    }

    try {
        console.log("Submitting interests:", selectedInterests);
        console.log("For user: ", userId);
        await updateUserInterests(userId, selectedInterests);
        router.replace("/home");
    } catch (err) {
        console.error("Failed to update interests", err);
    }
    };

  return (
    <AuthLayout>
      <Header title="Interests" />
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <VStack className="p-6 space-y-6">
          <Text size="2xl" className="font-bold text-center">
            Select at least 3 interests (up to 5)
          </Text>

          {loading ? (
            <Spinner size="large" />
          ) : (
            <VStack space="md">
              {interests.map((interest) => {
                const isSelected = selectedInterests.includes(interest.interestId);
                const isDisabled = !isSelected && selectedInterests.length >= 5;

                return (
                  <Pressable
                    key={`interest-${interest.interestId || interest.interestName}`}
                    onPress={() => toggleInterest(interest.interestId)}
                    disabled={isDisabled}
                    className={`p-4 rounded-xl border ${
                      isSelected
                        ? "bg-primary-600 border-primary-600"
                        : "border-gray-300 bg-gray-100"
                    } ${isDisabled ? "opacity-50" : ""}`}
                  >
                    <Text
                      className={`text-lg text-center ${
                        isSelected ? "text-white font-bold" : "text-gray-700"
                      }`}
                    >
                      {interest.interestName}
                    </Text>
                  </Pressable>
                );
              })}
            </VStack>
          )}

          <VStack className="mt-10 space-y-4">
            <Button
              onPress={handleConfirm}
              isDisabled={selectedInterests.length < 3}
            >
              <ButtonText className="font-bold">Confirm</ButtonText>
            </Button>
          </VStack>
        </VStack>
      </ScrollView>
    </AuthLayout>
  );
}