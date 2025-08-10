// Reeact
import React, { useEffect, useState, useCallback } from 'react';
import { useColorScheme } from "nativewind";
import { UserRoundPen } from 'lucide-react-native';

// Expo
import * as FileSystem from 'expo-file-system';
import { Pressable } from 'react-native-gesture-handler';

// UI
import { VStack } from '@/components/ui/vstack';
import { HStack } from '@/components/ui/hstack';
import { Box } from '@/components/ui/box';
import { View } from '@/components/ui/view';
import { Image } from '@/components/ui/image';
import { Text } from '@/components/ui/text';
import { Divider } from '@/components/ui/divider';
import { Button, ButtonText } from '@/components/ui/button';
import { Modal, ModalBackdrop, ModalContent, ModalHeader, ModalBody, ModalFooter } from '@/components/ui/modal';
import { Icon } from '@/components/ui/icon';
import { Heading } from '@/components/ui/heading';
import { PencilIcon } from '@/components/ui/material-icons';

// Helpers
import { sendDataUser, fetchDataUser } from '../helpers/api';
import { API_ENDPOINTS } from '@/helpers/api-helper';
import { useUserId } from '../helpers/api';

// Other
import { EditProfileContent } from './EditProfileContent';
import { ProfileBirthday} from './birthday'

type ProfileData = {
  userId: number;
  firstName: string;
  lastName: string;
  email: string;
  profileImageUrl?: string | null;
};

const DUMMY_PASSWORD = '********';

const uriToBase64 = async (uri: string) => {
  if (!uri) return null;
  return await FileSystem.readAsStringAsync(uri, { encoding: FileSystem.EncodingType.Base64 });
};

export const ProfileTitle: React.FC = () => {
  const userId = useUserId();

  const [profile, setProfile] = useState<ProfileData | null>(null);

  // Modal state
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [password, setPassword] = useState(DUMMY_PASSWORD);
  const [repeatPassword, setRepeatPassword] = useState(DUMMY_PASSWORD);
  const [imageUri, setImageUri] = useState<string | null>(null);

  // Validation
  const [isInvalidFirstName, setIsInvalidFirstName] = useState(false);
  const [isInvalidLastName, setIsInvalidLastName] = useState(false);
  const [isInvalidPassword, setIsInvalidPassword] = useState(false);
  const [isInvalidRepeatPassword, setIsInvalidRepeatPassword] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const { colorScheme } = useColorScheme();
const bgClass = colorScheme === "dark" ? "bg-white" : "bg-[#F1FFE8]";
const borderClass = colorScheme === "dark" ? "border-gray-600" : "border-primary-700";

  // Fetch profile from server
  const fetchProfile = useCallback(async () => {
    if (!userId) return;
    try {
      const user = await fetchDataUser<ProfileData>(API_ENDPOINTS.getUserById(Number(userId)));
       console.log("PROFILE FROM API:", user);
      setProfile(user);
      setFirstName(user.firstName);
      setLastName(user.lastName);
      setPassword(DUMMY_PASSWORD);      // never show real password
      setRepeatPassword(DUMMY_PASSWORD);
      setImageUri(null); // Only used if user changes the image
    } catch (e) {
      setProfile(null);
    }
  }, [userId]);

  useEffect(() => { fetchProfile(); }, [fetchProfile]);

  // Open edit modal, set inputs to current profile
  const openEditModal = () => {
    if (!profile) return;
    setFirstName(profile.firstName);
    setLastName(profile.lastName);
    setPassword(DUMMY_PASSWORD);
    setRepeatPassword(DUMMY_PASSWORD);
    setImageUri(null);
    setIsInvalidFirstName(false);
    setIsInvalidLastName(false);
    setIsInvalidPassword(false);
    setIsInvalidRepeatPassword(false);
    setImageError(false);
    setShowModal(true);
  };

  // Check if password actually changed (user entered something חדש)
  const isPasswordChanged = () =>
    password !== DUMMY_PASSWORD && password.length > 0;

  const handleSubmit = async () => {
    let valid = true;
    if (firstName.trim().length < 2) {
      setIsInvalidFirstName(true); valid = false;
    } else setIsInvalidFirstName(false);
    if (lastName.trim().length < 2) {
      setIsInvalidLastName(true); valid = false;
    } else setIsInvalidLastName(false);
    if (isPasswordChanged() && password.length < 6) {
      setIsInvalidPassword(true); valid = false;
    } else setIsInvalidPassword(false);
    if (isPasswordChanged() && repeatPassword !== password) {
      setIsInvalidRepeatPassword(true); valid = false;
    } else setIsInvalidRepeatPassword(false);

    if (!valid || !profile) return;

    let imageBase64 = null;
    if (imageUri) imageBase64 = await uriToBase64(imageUri);

    // Build request, send password only if changed
    const req: any = {
      userId: profile.userId,
      firstName,
      lastName,
      imageBase64
    };
    if (isPasswordChanged()) req.password = password;
    else req.password = ""; // or don't include

    await sendDataUser(API_ENDPOINTS.updateUserProfile, req, 'PUT');
    setShowModal(false);
    await fetchProfile();
  };

  if (!profile) return <Text>Loading...</Text>;

  const imageSource = profile.profileImageUrl
  ? { uri: `data:image/jpeg;base64,${profile.profileImageUrl}` }
  : require('../assets/blank_profile_image.jpg');
  return (
    <VStack className={`mx-4 rounded-2xl ${bgClass} ${borderClass}`}>
      <HStack className="p-3 items-center" space="lg">
        <Image
          className={`rounded-full border ${borderClass}`}
          size="lg"
          source={imageSource}
        />
        <VStack className="justify-center flex-1">
          <View className="w-full pr-[20px]">
            <Text className='font-bold text-2xl'>
              {profile.firstName} {profile.lastName}
            </Text>
            <Divider orientation="horizontal" className="h-[1px] bg-gray-300 w-full" />
            <View className='flex-row items-center gap-2 pt-2 justify-between'>
              <Text className='text-xl'>{profile.email}</Text>
            </View>
          </View>
        </VStack>
        <Pressable
          onPress={openEditModal}
          className="bg-white rounded-full shadow-md"
        >
          <PencilIcon size={20} />
        </Pressable>
      </HStack>
      <View className='pr-3 pl-3'>
        <Divider orientation="horizontal" className="h-[1px] bg-gray-300 w-full" />
      </View>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)}>
        <ModalBackdrop />
        <ModalContent className="max-w-[305px]">
          <ModalHeader>
            <VStack className="items-center flex-1">
              <View className='items-center'>
                <Box className={`w-[56px] h-[56px] rounded-full ${bgClass} items-center justify-center`}>
                  <Icon as={UserRoundPen} className={``} size="xl" />
                </Box>
                <Heading size="md" className="text-typography-950 mb-2 text-center">
                  Edit Account Info
                </Heading>
              </View>
            </VStack>
          </ModalHeader>
          <ModalBody className="mt-0 mb-4">
            <EditProfileContent
              firstName={firstName} setFirstName={setFirstName} isInvalidFirstName={isInvalidFirstName}
              lastName={lastName} setLastName={setLastName} isInvalidLastName={isInvalidLastName}
              password={password} setPassword={setPassword} isInvalidPassword={isInvalidPassword}
              repeatPassword={repeatPassword} setRepeatPassword={setRepeatPassword} isInvalidRepeatPassword={isInvalidRepeatPassword}
              imageUri={imageUri} setImageUri={setImageUri} imageError={imageError} setImageError={setImageError}
            />
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
              onPress={handleSubmit}
              size="sm"
              className="flex-grow"
            >
              <ButtonText>Apply</ButtonText>
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
      <ProfileBirthday/>
    </VStack>
  );
};