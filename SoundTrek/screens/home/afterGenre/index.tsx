// React
import React, { useEffect, useState } from "react";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";

//UI 
import { Text } from "@/components/ui/text";
import { Button } from "@/components/ui/button";
import { VStack } from "@/components/ui/vstack";
import { ScrollView } from "@/components/ui/scroll-view";
import { AuthLayout } from "../../auth/layout";

// Hooks
import { useSessionGuard } from "@/hooks/useSessionGuard";
import { useActivityTracker } from "@/hooks/useActivityTracker";

const AfterGenre = () => {

  const router = useRouter();
  const [aiResult, setAiResult] = useState<string>("Loading...");

  useEffect(() => {
    const loadAIResult = async () => {
      try {
        const saved = await AsyncStorage.getItem("ai_result");
        if (saved !== null) {
          setAiResult(saved);
        } else {
          setAiResult("No data found.");
        }
      } catch (err) {
        console.error("Error loading from storage:", err);
        setAiResult("Error loading result.");
      }
    };

    loadAIResult();
  }, []);

  return (
    <VStack space="md" className="p-4">
      <Text className="text-lg font-medium">{aiResult}</Text>
      <Button onPress={() => router.push("/auth/splash-screen")}>
        <Text className={`text-black`}>Go Back</Text>
      </Button>
    </VStack>
  );
};

export const AfterGenreScreen = () => {
  useSessionGuard();
  useActivityTracker();

  return (
    <ScrollView>
      <AuthLayout>
        <AfterGenre />
      </AuthLayout>
    </ScrollView>
  );
};
