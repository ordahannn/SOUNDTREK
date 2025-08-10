// React
import React, { useState, useEffect, useCallback } from 'react';
import { Platform, View as RNView } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Cake } from 'lucide-react-native';
import { useColorScheme } from "nativewind";

// UI
import { HStack } from '@/components/ui/hstack';
import { View } from '@/components/ui/view';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { Button, ButtonText } from '@/components/ui/button';
import { Modal, ModalBackdrop, ModalContent, ModalHeader, ModalBody, ModalFooter } from '@/components/ui/modal';
import { VStack } from '@/components/ui/vstack';
import { Box } from '@/components/ui/box';
import { Heading } from '@/components/ui/heading';
import { Pressable } from '@/components/ui/pressable';
import { PencilIcon } from '@/components/ui/material-icons';

// Helpers
import { fetchDataUser, sendDataUser } from '../helpers/api';
import { API_ENDPOINTS } from '@/helpers/api-helper';
import { useUserId } from '../helpers/api';

const BirthdayPicker: React.FC<{
  value: Date;
  onChange: (date: Date) => void;
}> = ({ value, onChange }) => {
  const [show, setShow] = useState(Platform.OS === 'ios');

  const handleChange = (_: any, selectedDate?: Date) => {
    setShow(Platform.OS === 'ios');
    if (selectedDate) {
      onChange(selectedDate);
    }
  };

  return (
    <RNView>
      {Platform.OS === 'android' && !show && (
        <Button size="sm" onPress={() => setShow(true)} className="mb-3">
          <ButtonText>Choose Date</ButtonText>
        </Button>
      )}

      {show && (
        <DateTimePicker
          value={value}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={handleChange}
          maximumDate={new Date()} // cannot select future date
        />
      )}
    </RNView>
  );
};

export const ProfileBirthday = () => {
  const userId = useUserId();
  const { colorScheme } = useColorScheme();

  const bgClass = colorScheme === "dark" ? "text-primary-500" : "text-primary-0";
  const borderClass = colorScheme === "dark" ? "text-primary-700" : "text-primary-100";

  const [showModal, setShowModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date(2000, 0, 1)); // default date
  const [draftDate, setDraftDate] = useState<Date>(selectedDate);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch birthday from server
  const fetchBirthday = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    try {
      // Assuming API_ENDPOINTS.getUserBirthday returns a date string, e.g. "1990-05-10"
      const birthdayStr = await fetchDataUser<string>(`${API_ENDPOINTS.getUserBirthday}?userId=${userId}`);
      if (birthdayStr) {
        setSelectedDate(new Date(birthdayStr));
      }
      setError(null);
    } catch (e) {
      setError('Failed to load birthday');
    }
    setLoading(false);
  }, [userId]);

  useEffect(() => {
    fetchBirthday();
  }, [fetchBirthday]);

  const handleApply = async () => {
    if (!userId) return;
    setError(null);
    try {
      // Format date as ISO string (only date part)
      const pad = (n: number) => n.toString().padStart(2, '0');
      const birthdayStr = `${draftDate.getFullYear()}-${pad(draftDate.getMonth() + 1)}-${pad(draftDate.getDate())}`;
      await sendDataUser(`${API_ENDPOINTS.updateUserBirthday}`, { userId, BirthDate: birthdayStr }, 'PUT');
      setSelectedDate(draftDate);
      setShowModal(false);
    } catch {
      setError('Failed to save birthday');
    }
  };

  return (
    <HStack className={`justify-between items-center p-3 rounded-2xl ${bgClass}`} space="lg">
      <View className='flex-row items-center gap-2'>
        <Icon as={Cake} className="text-typography-900" />
        <Text className='font-bold text-2xl'>Birthday</Text>
      </View>
      <View className='flex-row items-center gap-4'>
        {loading ? (
          <Text>Loading...</Text>
        ) : (
          <Text>{selectedDate.toLocaleDateString()}</Text>
        )}
        <Pressable
          onPress={() => {
            setDraftDate(selectedDate);
            setShowModal(true);
          }}
          className=" shadow-md"
        >
          <PencilIcon size={20} />
        </Pressable>

        <Modal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
        >
          <ModalBackdrop />
          <ModalContent className="max-w-[340px]">
            <ModalHeader className='justify-center'>
              <VStack className="items-center">
                <Box className={`w-[56px] h-[56px] rounded-full ${bgClass} items-center justify-center`}>
                  <Icon as={Cake} size="xl" />
                </Box>
                <Heading size="md" className="text-typography-950 mb-4 text-center">
                  Select Your Birthday
                </Heading>
              </VStack>
            </ModalHeader>
            <ModalBody className="mt-0 mb-4">
              <BirthdayPicker value={draftDate} onChange={setDraftDate} />
              {error && <Text style={{ color: 'red', marginTop: 8, textAlign: 'center' }}>{error}</Text>}
            </ModalBody>
            <ModalFooter className="w-full">
              <Button
                variant="outline"
                action="secondary"
                size="sm"
                onPress={() => setShowModal(false)}
                className="flex-grow"
              >
                <ButtonText>Cancel</ButtonText>
              </Button>
              <Button
                onPress={handleApply}
                size="sm"
                className="flex-grow"
              >
                <ButtonText>Apply</ButtonText>
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </View>
    </HStack>
  );
};