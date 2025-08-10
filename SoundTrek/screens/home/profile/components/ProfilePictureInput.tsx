// React
import React from 'react';
import { Image, View } from 'react-native'; 

// Expo
import * as ImagePicker from 'expo-image-picker';

// UI
import {
  FormControl,
  FormControlLabel,
  FormControlLabelText,
  FormControlHelper,
  FormControlHelperText,
  FormControlError,
  FormControlErrorIcon,
  FormControlErrorText,
} from "@/components/ui/form-control"
import { Button, ButtonText } from '@/components/ui/button'
import { AlertCircleIcon } from "@/components/ui/icon"

export const ProfilePictureInput = ({
  imageUri,
  setImageUri,
  imageError,
  setImageError,
}: {
  imageUri: string | null,
  setImageUri: (uri: string | null) => void,
  imageError: boolean,
  setImageError: (e: boolean) => void,
}) => {

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });

    if (!result.canceled && result.assets?.length > 0) {
      setImageUri(result.assets[0].uri);
      setImageError(false);
    } else {
    }
  };

  return (
    <FormControl isInvalid={imageError} size="md">
      <FormControlLabel>
        <FormControlLabelText>Profile Picture</FormControlLabelText>
      </FormControlLabel>

      <Button onPress={pickImage} className="my-2">
        <ButtonText>Choose Image</ButtonText>
      </Button>

      <View style={{ alignItems: 'center', width: '100%' }}>
        {imageUri && (
          <Image
            source={{ uri: imageUri }}
            style={{ width: 120, height: 120, borderRadius: 16, marginVertical: 8 }}
          />
        )}
      </View>

      {!imageUri && (
        <FormControlHelper>
          <FormControlHelperText>Recommended: square image (1:1 ratio)</FormControlHelperText>
        </FormControlHelper>
      )}

      {imageError && (
        <FormControlError>
          <FormControlErrorIcon as={AlertCircleIcon} />
          <FormControlErrorText>No picture was selected</FormControlErrorText>
        </FormControlError>
      )}
    </FormControl>
  );
};