// React
import React, { useEffect, useState } from 'react';
import { Languages } from 'lucide-react-native';
import { useColorScheme } from "nativewind";
import { Alert } from "react-native";

// UI
import { VStack } from '@/components/ui/vstack';
import { HStack } from '@/components/ui/hstack';
import { Box } from '@/components/ui/box';
import { Icon, CircleIcon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { Button, ButtonText } from '@/components/ui/button';
import { Modal, ModalBackdrop, ModalContent, ModalHeader, ModalBody, ModalFooter } from '@/components/ui/modal';
import { Heading } from '@/components/ui/heading';
import { RadioGroup, Radio, RadioIndicator, RadioLabel, RadioIcon } from '@/components/ui/radio';
import { View } from '@/components/ui/view';
import { Pressable } from '@/components/ui/pressable';
import { PencilIcon } from '@/components/ui/material-icons';

// Helpers
import { API_ENDPOINTS } from '@/helpers/api-helper';
import { fetchDataUser, sendDataUser } from '../helpers/api';
import { useUserId } from '../helpers/api';

type Language = { name: string };

export const ProfileLanguage = () => {
  // Get userId from custom hook
  const userId = useUserId();

  // State declarations
  const [allLanguages, setAllLanguages] = useState<Language[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLanguage, setSelectedLanguage] = useState<string>('English');
  const [initialLanguage, setInitialLanguage] = useState<string>('English');
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);

  // Theme-related classes
  const { colorScheme } = useColorScheme();
  const bgClass = colorScheme === "dark" ? "bg-white" : "bg-[#F1FFE8]";
  const borderClass = colorScheme === "dark" ? "border-gray-600" : "border-[#a5d6a7]";
  
  // Fetch languages and user's preferred language on mount or userId change
  useEffect(() => {
    if (!userId) return;
    (async () => {
      try {
        const langs = await fetchDataUser<Language[]>(API_ENDPOINTS.getAllLanguages);
        setAllLanguages(langs);
        const user = await fetchDataUser<{ preferredLanguage: string }>(API_ENDPOINTS.getUserById(Number(userId)));
        setSelectedLanguage(user.preferredLanguage || 'English');
        setInitialLanguage(user.preferredLanguage || 'English');
      } catch (e) {
        setAllLanguages([{ name: "English" }]);
      } finally {
        setLoading(false);
      }
    })();
  }, [userId]);

  // RadioGroup for language selection
  const LanguageRadio = () => {
    if (loading) return <Text>Loading...</Text>;
    return (
      <RadioGroup value={selectedLanguage} onChange={setSelectedLanguage}>
        <VStack space="sm">
          {allLanguages.map((language) => (
            <Radio key={language.name} value={language.name}>
              <RadioIndicator>
                <RadioIcon as={CircleIcon} />
              </RadioIndicator>
              <RadioLabel>{language.name}</RadioLabel>
            </Radio>
          ))}
        </VStack>
      </RadioGroup>
    );
  };

  // Handle saving the new preferred language
  const handleApply = async () => {
    setSaving(true);
    try {
      console.log(selectedLanguage)
      await sendDataUser(API_ENDPOINTS.updatePreferredLanguage, { userId: userId ,languageName: selectedLanguage }, 'PUT');
      setInitialLanguage(selectedLanguage);
      setShowModal(false);
      // Alert.alert(
      //   "Restart Required",
      //   "Please log in again to apply your changes."
      // );
    } catch (e) {
    } finally {
      setSaving(false);
    }
  };

  // Render component
  return (
    <HStack className={`justify-between items-center mx-4 p-3 rounded-2xl ${bgClass} ${borderClass}`} space="lg">
      <View className='flex-row items-center gap-2'>
        <Icon as={Languages} className="text-typography-900" />
        <Text className='font-bold text-2xl'>Language</Text>
      </View>
      <View className='flex-row items-center gap-4'>
        <Text>{initialLanguage}</Text>
        <Pressable
          onPress={() => setShowModal(true)}
          className=" shadow-md"
        >
          <PencilIcon size={20} />
        </Pressable>
        <Modal
          isOpen={showModal}
          onClose={() => {
            setShowModal(false);
            setSelectedLanguage(initialLanguage);
          }}
        >
          <ModalBackdrop />
          <ModalContent className="max-w-[305px]">
            <ModalHeader>
              <VStack className="items-center">
                <Box className={`w-[56px] h-[56px] rounded-full ${bgClass} items-center justify-center`}>
                  <Icon as={Languages} size="xl" />
                </Box>
                <Heading size="md" className="text-typography-950 mb-2 text-center">
                  Choose Your Language
                </Heading>
                <Text size="sm" className="text-typography-500 text-center pb-2">
                  Select the language for listening to audio guides at landmarks.
                </Text>
              </VStack>
            </ModalHeader>
            <ModalBody className="mt-0 mb-4 ">
              <LanguageRadio />
            </ModalBody>
            <ModalFooter className="w-full">
              <Button
                variant="outline"
                action="secondary"
                size="sm"
                onPress={() => {
                  setShowModal(false);
                  setSelectedLanguage(initialLanguage);
                }}
                className="flex-grow"
              >
                <ButtonText>Cancel</ButtonText>
              </Button>
              <Button
                onPress={handleApply}
                size="sm"
                className="flex-grow"
                disabled={saving}
              >
                <ButtonText>{saving ? "Saving..." : "Apply"}</ButtonText>
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </View>
    </HStack>
  );
};