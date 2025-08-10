// React
import React, { useEffect, useState, useCallback } from 'react';
import { ScrollView } from 'react-native';
import { useColorScheme } from "nativewind";
import { Alert } from "react-native";

// UI
import { VStack } from '@/components/ui/vstack';
import { HStack } from '@/components/ui/hstack';
import { Box } from '@/components/ui/box';
import { Icon, FavouriteIcon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { Button, ButtonText } from '@/components/ui/button';
import { Modal, ModalBackdrop, ModalContent, ModalHeader, ModalBody, ModalFooter } from '@/components/ui/modal';
import { Heading } from '@/components/ui/heading';
import { CheckboxGroup, Checkbox, CheckboxIndicator, CheckboxLabel, CheckboxIcon } from '@/components/ui/checkbox';
import { Divider } from '@/components/ui/divider';
import { View } from '@/components/ui/view';
import { Pressable } from '@/components/ui/pressable';
import { PencilIcon } from '@/components/ui/material-icons';

// Helpers
import { API_ENDPOINTS } from '@/helpers/api-helper';
import { fetchDataUser, sendDataUser } from '../helpers/api';
import { useUserId } from '../helpers/api';

type Interest = { interestId: number; interestName: string };

// Chunk for tags display
const chunkArray = <T,>(arr: T[], size: number): T[][] => {
  const chunks: T[][] = [];
  for (let i = 0; i < arr.length; i += size) {
    chunks.push(arr.slice(i, i + size));
  }
  return chunks;
};

const Tags: React.FC<{ interests: string[] }> = ({ interests }) => {
  const { colorScheme } = useColorScheme();
  const rows = chunkArray(interests, 3);
  const TAG_WIDTH = '31%';
  const TAG_HEIGHT = 55;

  if (interests.length === 0) {
    return <Text className="text-typography-500 italic">No interests selected yet.</Text>;
  }

  return (
    <VStack space="md">
      {rows.map((row, rowIndex) => (
        <HStack key={rowIndex} space="md" className="justify-start flex-row flex-wrap">
          {row.map((item) => (
            <View
              key={item}
              style={{
                width: TAG_WIDTH,
                height: TAG_HEIGHT,
                justifyContent: 'center',
                alignItems: 'center',
                borderRadius: 8,
                borderWidth: 1,
                borderColor: colorScheme === "dark" ? '#e0e0e0' : '#001c0bff',
                backgroundColor: colorScheme === "dark" ? '#fff' : '#001c0bff',
                marginBottom: 8,
              }}
            >
              <Text className='font-bold justify-center text-sm' style={{ textAlign: 'center', color: colorScheme === "dark" ? '#000' : '#fff' }}>
                {item}
              </Text>
            </View>
          ))}
        </HStack>
      ))}
    </VStack>
  );
};

export const ProfilePersonalInterests = () => {
  const userId = useUserId();
  const [allInterests, setAllInterests] = useState<Interest[]>([]);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const { colorScheme } = useColorScheme();
const bgClass = colorScheme === "dark" ? "bg-white" : "bg-[#F1FFE8]";
const borderClass = colorScheme === "dark" ? "border-gray-600" : "border-[#a5d6a7]";

  // Load all interests and user's selected interests
  const fetchInterests = useCallback(async () => {
    setLoading(true);
    try {
      const all = await fetchDataUser<Interest[]>(API_ENDPOINTS.getAllInterests);
      setAllInterests(all);

      const ids = await fetchDataUser<number[]>(API_ENDPOINTS.getUserInterests(Number(userId)));
      setSelectedIds(ids || []);
    } catch (err) {
      setAllInterests([]);
      setSelectedIds([]);
    }
    setLoading(false);
  }, [userId]);

  useEffect(() => {
    if (userId) fetchInterests();
  }, [fetchInterests, userId]);

  // Draft ids when modal opens
  const [draftIds, setDraftIds] = useState<number[]>([]);

  useEffect(() => {
    if (showModal) {
      setDraftIds(selectedIds);
      setError(null);
    }
  }, [showModal, selectedIds]);

  const handleCheckboxChange = (arr: string[]) => {
    const newSelected = arr.map(Number);
    setDraftIds(newSelected);
    if (newSelected.length < 3) {
      setError("Please select at least 3 interests.");
    } else {
      setError(null);
    }
  };

  const handleApply = async () => {
    if (draftIds.length < 3) {
      setError("Please select at least 3 interests.");
      return;
    }
    setError(null);
    await sendDataUser(API_ENDPOINTS.updateUserInterests, {
      userId,
      interestIds: draftIds
    }, 'POST');
    setShowModal(false);
    fetchInterests(); // Refresh UI
    Alert.alert(
      "Restart Required",
      "Please log in again to apply your changes."
    );
  };

  const InterestsCheckbox = () => (
    <CheckboxGroup value={draftIds.map(String)} onChange={handleCheckboxChange}>
      <VStack space="sm">
        {allInterests.map((interest) => (
          (interest.interestName != "Other" &&
          <Checkbox key={interest.interestId} value={interest.interestId.toString()}>
            <CheckboxIndicator>
              <CheckboxIcon as={FavouriteIcon} />
            </CheckboxIndicator>
            <CheckboxLabel>{interest.interestName}</CheckboxLabel>
          </Checkbox>
      )  ))}
      </VStack>
    </CheckboxGroup>
  );

  // Names for tag display
  const selectedInterestNames = allInterests
    .filter(i => selectedIds.includes(i.interestId))
    .map(i => i.interestName);

  return (
    <HStack className={`mx-4 p-3 rounded-2xl ${bgClass} ${borderClass}`} space="3xl">
      <VStack className="w-full justify-center">
        <HStack className="items-center gap-2 justify-between w-full pb-3">
          <View className='flex-row items-center gap-2'>
            <Icon as={FavouriteIcon} className="text-typography-900" />
            <Text className='font-bold text-2xl'>Personal Interests</Text>
          </View>
          <Pressable
            onPress={() => setShowModal(true)}
            className=" shadow-md"
          >
            <PencilIcon size={20} />
          </Pressable>
          <Modal
            isOpen={showModal}
            onClose={() => { setShowModal(false); setError(null); }}
          >
            <ModalBackdrop />
            <ModalContent className="max-w-[305px] ">
              <ModalHeader>
                <VStack className="items-center">
                  <Box className={`w-[56px] h-[56px] rounded-full ${bgClass} items-center justify-center`}>
                    <Icon as={FavouriteIcon} size="xl" />
                  </Box>
                  <Heading size="md" className="text-typography-950 mb-2 text-center">
                    Choose Your Personal Interests
                  </Heading>
                  <Text size="sm" className="text-typography-500 text-center pb-2">
                    Your selections help us match the best content for you.
                  </Text>
                </VStack>
              </ModalHeader>
              <ModalBody className="mt-0 mb-4 ">
                {loading ? (
                  <Text>Loading...</Text>
                ) : (
                  <>
                    <InterestsCheckbox />
                    {error && (
                      <Text
                        style={{
                          color: 'red',
                          fontWeight: 'bold',
                          marginTop: 10,
                          textAlign: 'center',
                        }}
                      >
                        {error}
                      </Text>
                    )}
                  </>
                )}
              </ModalBody>
              <ModalFooter className="w-full">
                <Button
                  variant="outline"
                  action="secondary"
                  size="sm"
                  onPress={() => { setShowModal(false); setError(null); }}
                  className="flex-grow"
                >
                  <ButtonText>Cancel</ButtonText>
                </Button>
                <Button
                  onPress={handleApply}
                  size="sm"
                  className="flex-grow"
                  disabled={draftIds.length < 3}
                >
                  <ButtonText>Apply</ButtonText>
                </Button>
              </ModalFooter>
            </ModalContent>
          </Modal>
        </HStack>
        <View className="w-full pb-4">
          <Divider
            orientation="horizontal"
            className="h-[1px] bg-gray-400 w-full"
          />
        </View>
        <ScrollView
          style={{ maxHeight: 140 }}
          contentContainerStyle={{ paddingVertical: 8 }}
          showsVerticalScrollIndicator={false}
        >
          <Tags interests={selectedInterestNames} />
        </ScrollView>
      </VStack>
    </HStack>
  );
};