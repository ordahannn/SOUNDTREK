// React
import React from 'react';
import { useColorScheme } from "nativewind";
import { UserRoundPen } from 'lucide-react-native';

// Expo
import * as ImagePicker from 'expo-image-picker';

// UI
import { Box } from '@/components/ui/box';
import { VStack } from '@/components/ui/vstack';
import { Image } from '@/components/ui/image';
import { Text } from '@/components/ui/text';
import { Divider } from '@/components/ui/divider';
import { HStack } from '@/components/ui/hstack';
import { View } from '@/components/ui/view';
import { Icon } from '@/components/ui/icon';
import { Button, ButtonText } from '@/components/ui/button';
import { Modal, ModalBackdrop, ModalContent, ModalHeader, ModalBody, ModalFooter } from '@/components/ui/modal';
import { Heading } from '@/components/ui/heading';
import {
  FormControl,
  FormControlError,
  FormControlErrorText,
  FormControlErrorIcon,
  FormControlLabel,
  FormControlLabelText,
  FormControlHelper,
  FormControlHelperText,
} from "@/components/ui/form-control"
import { Input, InputField } from "@/components/ui/input"
import { AlertCircleIcon } from "@/components/ui/icon"

// Other
import { ProfileBirthday } from './birthday';

// First state befoe profile image showing
const ProfileImage = ({ imageUri, borderClass }: { imageUri: string | null, borderClass: string }) => (
  <Image
    className={`rounded-2xl border ${borderClass}`}
    size="lg"
    source={
      imageUri
        ? { uri: imageUri }
        : require("../assets/blank_profile_image.png")
    }
  />
);

// image input for the form
const ProfilePictureInput = ({
  imageUri,
  setImageUri,
  error,
  setError,
}: {
  imageUri: string | null,
  setImageUri: (uri: string | null) => void,
  error: boolean,
  setError: (e: boolean) => void,
}) => {
  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled && result.assets?.length > 0) {
      setImageUri(result.assets[0].uri);
      setError(false);
    } else {
      setError(true);
    }
  };

  return (
    <FormControl isInvalid={error} size="md">
      <FormControlLabel>
        <FormControlLabelText>Profile Picture</FormControlLabelText>
      </FormControlLabel>

      <Button onPress={pickImage} className="my-2">
        <ButtonText>Choose Image</ButtonText>
      </Button>

      {imageUri && (
        <Image
          source={{ uri: imageUri }}
          style={{ width: 120, height: 120, borderRadius: 60, marginVertical: 8 }}
        />
      )}

      {!imageUri && (
        <FormControlHelper>
          <FormControlHelperText>Recommended: square image (1:1 ratio)</FormControlHelperText>
        </FormControlHelper>
      )}

      {error && (
        <FormControlError>
          <FormControlErrorIcon as={AlertCircleIcon} />
          <FormControlErrorText>No picture was selected</FormControlErrorText>
        </FormControlError>
      )}
    </FormControl>
  );
};

// edit form
const EditProfileContent = ({
  firstName, setFirstName, isInvalidFirstName,
  lastName, setLastName, isInvalidLastName,
  password, setPassword, isInvalidPassword,
  repeatPassword, setRepeatPassword, isInvalidRepeatPassword,
  imageUri, setImageUri, imageError, setImageError,
}: any) => (
  <VStack className="w-full max-w-[300px] rounded-md  p-4 gap-y-4">
    <FormControl isInvalid={isInvalidFirstName} size="md">
      <FormControlLabel>
        <FormControlLabelText>First Name</FormControlLabelText>
      </FormControlLabel>
      <Input className="my-1" >
        <InputField
          placeholder="firstName"
          value={firstName}
          onChangeText={setFirstName}
        />
      </Input>
      <FormControlHelper>
        <FormControlHelperText>
          Must be at least 2 characters.
        </FormControlHelperText>
      </FormControlHelper>
      <FormControlError>
        <FormControlErrorIcon as={AlertCircleIcon} />
        <FormControlErrorText>
          At least 2 characters are required.
        </FormControlErrorText>
      </FormControlError>
    </FormControl>

    <FormControl isInvalid={isInvalidLastName} size="md">
      <FormControlLabel>
        <FormControlLabelText>Last Name</FormControlLabelText>
      </FormControlLabel>
      <Input className="my-1" >
        <InputField
          placeholder="lastName"
          value={lastName}
          onChangeText={setLastName}
        />
      </Input>
      <FormControlHelper>
        <FormControlHelperText>
          Must be at least 2 characters.
        </FormControlHelperText>
      </FormControlHelper>
      <FormControlError>
        <FormControlErrorIcon as={AlertCircleIcon} />
        <FormControlErrorText>
          At least 2 characters are required.
        </FormControlErrorText>
      </FormControlError>
    </FormControl>

    <ProfilePictureInput
      imageUri={imageUri}
      setImageUri={setImageUri}
      error={imageError}
      setError={setImageError}
    />
  </VStack>
);

// ProfileTitle
export const ProfileTitle = () => {
  const { colorScheme } = useColorScheme();
  const bgClass = colorScheme === "dark" ? "bg-primary-900" : "bg-primary-0";
  const borderClass = colorScheme === "dark" ? "border-primary-700" : "border-primary-100";

  // states of the showed values
  const [profile, setProfile] = React.useState({
    firstName: 'John',
    lastName: 'Doe',
    email: 'Email@example.com',
    imageUri: null as string | null,
  });

  // state for the edit form
  const [firstName, setFirstName] = React.useState(profile.firstName);
  const [lastName, setLastName] = React.useState(profile.lastName);
  const [imageUri, setImageUri] = React.useState<string | null>(profile.imageUri);
  const [isInvalidFirstName, setIsInvalidFirstName] = React.useState(false);
  const [isInvalidLastName, setIsInvalidLastName] = React.useState(false);
  const [imageError, setImageError] = React.useState(false);

  const [showModal, setShowModal] = React.useState(false);

  // reset of the edit form
  const openEditModal = () => {
    setFirstName(profile.firstName);
    setLastName(profile.lastName);
    setImageUri(profile.imageUri);
    setIsInvalidFirstName(false);
    setIsInvalidLastName(false);
    setImageError(false);
    setShowModal(true);
  };

  // save and validations
  const handleSubmit = () => {
    let valid = true;
    if (firstName.length < 2) {
      setIsInvalidFirstName(true);
      valid = false;
    } else setIsInvalidFirstName(false);

    if (lastName.length < 2) {
      setIsInvalidLastName(true);
      valid = false;
    } else setIsInvalidLastName(false);

    if (!imageUri) {
      setImageError(true);
      valid = false;
    } else setImageError(false);

    if (valid) {
      setProfile({
        ...profile,
        firstName,
        lastName,
        imageUri,
      });
      setShowModal(false);
    }
  };

  return (
    <VStack className={`mx-4 border rounded-2xl ${bgClass} ${borderClass}`}>
      <HStack className="p-3" space="lg">
        <ProfileImage imageUri={profile.imageUri} borderClass={borderClass} />
        <VStack className="justify-center flex-1">
          <View className="w-full pr-[20px]">
            <Text className='font-bold text-2xl'>
              {profile.firstName} {profile.lastName}
            </Text>
            <Divider orientation="horizontal" className={`h-[1px] ${borderClass} w-full`} />
            <View className='flex-row items-center gap-2 pt-2 justify-between'>
              <Text className='text-xl'>{profile.email}</Text>
              <Button size="sm" onPress={openEditModal}>
                <ButtonText>Edit</ButtonText>
              </Button>
            </View>
          </View>
        </VStack>
      </HStack>
      <View className='pr-3 pl-3'>
        <Divider orientation="horizontal" className={`h-[1px] ${borderClass} w-full`} />
      </View>
      <ProfileBirthday />

      {/* --- MODAL --- */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
      >
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
    </VStack>
  );
};