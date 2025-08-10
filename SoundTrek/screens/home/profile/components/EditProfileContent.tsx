// React
import React from 'react';

// UI
import { VStack } from '@/components/ui/vstack';
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
import { Input, InputField } from "@/components/ui/input"
import { AlertCircleIcon } from "@/components/ui/icon"

// Other
import { ProfilePictureInput } from './ProfilePictureInput';

export const EditProfileContent = ({
  firstName, setFirstName, isInvalidFirstName,
  lastName, setLastName, isInvalidLastName,
  password, setPassword, isInvalidPassword,
  repeatPassword, setRepeatPassword, isInvalidRepeatPassword,
  imageUri, setImageUri, imageError, setImageError
}: {
  firstName: string,
  setFirstName: (t: string) => void,
  isInvalidFirstName: boolean,
  lastName: string,
  setLastName: (t: string) => void,
  isInvalidLastName: boolean,
  password: string,
  setPassword: (t: string) => void,
  isInvalidPassword: boolean,
  repeatPassword: string,
  setRepeatPassword: (t: string) => void,
  isInvalidRepeatPassword: boolean,
  imageUri: string | null,
  setImageUri: (t: string | null) => void,
  imageError: boolean,
  setImageError: (b: boolean) => void,
}) => (
  <VStack className="w-full max-w-[300px] rounded-md  p-4 gap-y-4">
    {/* First Name */}
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
    {/* Last Name */}
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
    {/* Password */}
    <FormControl isInvalid={isInvalidPassword} size="md">
      <FormControlLabel>
        <FormControlLabelText>Password</FormControlLabelText>
      </FormControlLabel>
      <Input className="my-1" >
        <InputField
          type="password"
          placeholder="password"
          value={password}
          onChangeText={setPassword}
        />
      </Input>
      <FormControlHelper>
        <FormControlHelperText>
          Must be at least 6 characters.
        </FormControlHelperText>
      </FormControlHelper>
      <FormControlError>
        <FormControlErrorIcon as={AlertCircleIcon} />
        <FormControlErrorText>
          At least 6 characters are required.
        </FormControlErrorText>
      </FormControlError>
    </FormControl>
    {/* Repeat Password */}
    <FormControl isInvalid={isInvalidRepeatPassword} size="md">
      <FormControlLabel>
        <FormControlLabelText>Repeat Password</FormControlLabelText>
      </FormControlLabel>
      <Input className="my-1" >
        <InputField
          type="password"
          placeholder="repeatPassword"
          value={repeatPassword}
          onChangeText={setRepeatPassword}
        />
      </Input>
      <FormControlHelper>
        <FormControlHelperText>
          Must match the password.
        </FormControlHelperText>
      </FormControlHelper>
      <FormControlError>
        <FormControlErrorIcon as={AlertCircleIcon} />
        <FormControlErrorText>
          Passwords do not match.
        </FormControlErrorText>
      </FormControlError>
    </FormControl>

    {/* Profile Picture */}
    <ProfilePictureInput
      imageUri={imageUri}
      setImageUri={setImageUri}
      imageError={imageError}
      setImageError={setImageError}
    />
  </VStack>
);