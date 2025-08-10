// React
import React, { useEffect, useState } from "react";
import { ScrollView } from "react-native";

// Expo
import { useRouter } from "expo-router";

// UI
import { VStack } from "@/components/ui/vstack";
import { Button, ButtonText } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { Spinner } from "@/components/ui/spinner";
import { Pressable } from "@/components/ui/pressable";
import { AuthLayout } from "@/screens/auth/layout";
import { Header } from "@/components/ui/header-back";

// Services
import { fetchLanguages, updatePreferredLanguage } from "@/services/userPreferencesService";
import { getUser } from "@/services/sessionService";

// Types
import { Language } from "@/types/Language";

export default function LanguageSelectionScreen() {
  const router = useRouter();
  const [languages, setLanguages] = useState<Language[]>([]);
  const [selectedLanguageName, setSelectedLanguageName] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [userId, setUserId] = useState<number | null>(null);
  const [initialLanguage, setInitialLanguage] = useState<string>("");

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const user = await getUser();
        if (user) {
          setUserId(user.userId);
          const userLang = user.preferredLanguage || "";
          setSelectedLanguageName(userLang);
          setInitialLanguage(userLang);
        }

        const langs = await fetchLanguages();
        setLanguages(langs.filter((lang) => !!lang.name));
      } catch (error) {
        console.error("Error loading data", error);
      } finally {
        setLoading(false);
      }
    };

    loadInitialData();
  }, []);

  // Handle confirm langiage selection
  const handleConfirm = async () => {
    if (!userId || !selectedLanguageName) return;

    try {
      await updatePreferredLanguage(userId, selectedLanguageName);
      router.replace("/auth/radius-selection");
    } catch (err) {
      console.error("Failed to update preferred language", err);
    }
  };

  // Handle skip selection
  const handleSkip = () => {
    router.replace("/auth/radius-selection");
  };

  return (
    <AuthLayout>
      <Header title="Language" />
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <VStack className="p-6 space-y-6">
          <Text size="2xl" className="font-bold text-center">
            Choose your preferred language
          </Text>

          {loading ? (
            <Spinner size="large" />
          ) : (
            <VStack space="md">
              {languages.map((lang, index) => {
                const isSelected = selectedLanguageName === lang.name;

                return (
                  <Pressable
                    key={`lang-${lang.name}-${index}`}
                    onPress={() => setSelectedLanguageName(lang.name)}
                    className={`p-4 rounded-xl border ${
                      isSelected
                        ? "bg-primary-600 border-primary-600"
                        : "border-gray-300 bg-gray-100 opacity-70"
                    }`}
                  >
                    <Text
                      className={`text-lg text-center ${
                        isSelected ? "text-white font-bold" : "text-gray-600"
                      }`}
                    >
                      {lang.name}
                    </Text>
                  </Pressable>
                );
              })}
            </VStack>
          )}

          <VStack className="mt-10 space-y-4">
            <Button
              onPress={handleConfirm}
              isDisabled={
                !selectedLanguageName || selectedLanguageName === initialLanguage
              }
            >
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