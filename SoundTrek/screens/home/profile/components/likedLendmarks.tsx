// React
import React, { useEffect, useState } from 'react';
import { useColorScheme } from "nativewind";
import { Landmark } from 'lucide-react-native';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Pressable } from 'react-native-gesture-handler';

// Expo
import { useRouter } from "expo-router";

// UI
import { VStack } from '@/components/ui/vstack';
import { Text } from '@/components/ui/text';
import { HStack } from '@/components/ui/hstack';
import { View } from '@/components/ui/view';
import { Icon } from '@/components/ui/icon';
import { Button, ButtonText } from '@/components/ui/button';
import { Modal, ModalBackdrop, ModalContent, ModalHeader, ModalBody, ModalFooter } from '@/components/ui/modal';
import { Image } from '@/components/ui/image';
import { Heading } from '@/components/ui/heading';
import { Box } from '@/components/ui/box';
import { PencilIcon } from '@/components/ui/material-icons';

// Types
import { SelectedLandmark } from "@/types/SelectedLandmark";

// Helpers
import { STORAGE_KEYS } from "@/helpers/storage-keys";
import { setSelectedLandmark } from "@/helpers/storage-helper";
import { fetchDataUser, sendDataUser } from '../helpers/api';
import { API_ENDPOINTS } from '@/helpers/api-helper';
import { useUserId } from '../helpers/api';

type LandmarkItem = {
  pageId: string;
  title: string;
  lat: number;
  lon: number;
  imageUrl?: string;
  shortDescription?: string;
};

export const ProfileLikedLandmarks = () => {
  const userId = useUserId();
  const { colorScheme } = useColorScheme();
const bgClass = colorScheme === "dark" ? "bg-white" : "bg-[#F1FFE8]";
const borderClass = colorScheme === "dark" ? "border-gray-600" : "border-[#a5d6a7]";

  const [showModal, setShowModal] = useState(false);
  const [landmarks, setLandmarks] = useState<LandmarkItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch user's liked landmarks
  const fetchLikedLandmarks = async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const data = await fetchDataUser<LandmarkItem[]>(`${API_ENDPOINTS.getLikedLandmarks}?userId=${userId}`);
      setLandmarks(data);
      setError(null);
    } catch (e) {
      setError('Failed to load liked landmarks');
      setLandmarks([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchLikedLandmarks();
  }, [userId]);

  // Handle remove liked landmark
  const handleRemove = async (landmarkPageId: string) => {
    if (!userId) return;
    try {
      await sendDataUser(`${API_ENDPOINTS.removeLikedLandmark}?userId=${userId}&landmarkPageId=${encodeURIComponent(landmarkPageId)}`, {}, 'DELETE');
      // Update local state after removal
      setLandmarks(prev => prev.filter(lm => lm.pageId !== landmarkPageId));
    } catch {
      alert('Failed to remove landmark');
    }
  };

  const router = useRouter();

  const handleListen = async (landmark: LandmarkItem) => {
    try {
      const response = await fetch(API_ENDPOINTS.getLandmarkFullDescription(landmark.pageId));
      if (!response.ok) throw new Error("Failed to fetch full description");

      const data = await response.json();
      console.log(data)
      if (!data.description) {
        alert("No description available for this landmark.");
        return;
      }

      const updatedLandmark: SelectedLandmark = {
        pageId: landmark.pageId,
        title: landmark.title,
        lat: landmark.lat,
        lon: landmark.lon,
        imageUrl: landmark.imageUrl,
        shortDescription: landmark.shortDescription,
        fullDescription: data.description,
        selectedLanguage: "",
        selectedLanguageCode: "",
        selectedGenre: "",
        processedText: "",
        listened: false, // For the routes
      };

      await setSelectedLandmark(updatedLandmark);
      await AsyncStorage.setItem(STORAGE_KEYS.FromProfile, "true");
      router.replace("/home/language");
    } catch (err) {
      console.error("[CustomRouteScreen] Failed to fetch full description:", err);
      alert("Something went wrong loading the landmark details.");
    }
  };

  return (
    <>
      <HStack className={`justify-between items-center mx-4 p-3 rounded-2xl ${bgClass} ${borderClass}`} space="lg">
        <View className='flex-row items-center gap-2'>
          <Icon as={Landmark} className="text-typography-900" />
          <Text className='font-bold text-2xl'>Liked Landmarks</Text>
        </View>
        <View className='flex-row items-center gap-4'>
          <Text>{landmarks.length > 50 ? "50+" : landmarks.length} places</Text>
          <Pressable
            onPress={() => setShowModal(true)}
            className="bg-white rounded-full p-2 shadow-md"
          >
            <PencilIcon size={20} />
          </Pressable>
        </View>
      </HStack>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)}>
        <ModalBackdrop />
        <ModalContent className="max-w-[370px]">
          <ModalHeader>
            <VStack className="items-center">
              <Box className={`w-[56px] h-[56px] rounded-full ${bgClass} items-center justify-center`}>
                <Icon as={Landmark} size="xl" />
              </Box>
              <Heading size="md" className="text-typography-950 mb-2 text-center">
                Edit Your Liked Landmarks
              </Heading>
              <Text size="sm" className="text-typography-500 text-center pb-2">
                Manage your favorite places and quickly access the ones you love most.
              </Text>
            </VStack>
          </ModalHeader>
          <ModalBody>
            {loading ? (
              <Text>Loading...</Text>
            ) : landmarks.length === 0 ? (
              <Text className="text-typography-500 italic text-center">No liked landmarks yet.</Text>
            ) : (
              <VStack space="md">
                {landmarks.map((lm) => (
                  <HStack key={lm.pageId} className="items-center gap-3 bg-gray-100 rounded-tl-[16px] rounded-bl-[16px] rounded-tr-[4px] rounded-br-[4px]">
                    <View style={{ width: 64, height: 64, borderRadius: 16, overflow: 'hidden', backgroundColor: '#ddd' }}>
                      <Image
                        source={{ uri: lm.imageUrl || undefined }}
                        style={{ width: 64, height: 64 }}
                      />
                    </View>
                    <VStack className="flex-1 justify-center">
                      <Text className="font-bold text-base">{lm.title}</Text>
                    </VStack>
                    <VStack space="xs" className="justify-center items-center">
                      <Button
                        size="xs"
                        variant="outline"
                        style={{ width: 76, marginBottom: 5, backgroundColor: "white" }}
                        onPress={() => handleListen(lm)}
                      >
                        <ButtonText>View</ButtonText>
                      </Button>
                      <Button
                        size="xs"
                        variant="solid"
                        style={{ width: 76 }}
                        onPress={() => handleRemove(lm.pageId)}
                      >
                        <ButtonText style={{ color: '#fff' }}>Remove</ButtonText>
                      </Button>
                    </VStack>
                  </HStack>
                ))}
              </VStack>
            )}
          </ModalBody>
          <ModalFooter>
            <Button onPress={() => setShowModal(false)} className="flex-grow">
              <ButtonText>Close</ButtonText>
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};