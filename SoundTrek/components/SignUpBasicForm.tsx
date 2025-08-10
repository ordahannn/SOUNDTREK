// React
import React from "react";
import { ScrollView } from "react-native";
import { AlertTriangle, EyeIcon, EyeOffIcon } from "lucide-react-native";

// Expo
import { useRouter } from "expo-router";

// UI
import { VStack } from "@/components/ui/vstack";
import { Text } from "@/components/ui/text";
import {
  FormControl,
  FormControlLabel,
  FormControlLabelText,
  FormControlError,
  FormControlErrorIcon,
  FormControlErrorText,
} from "@/components/ui/form-control";
import { Input, InputField, InputIcon, InputSlot } from "@/components/ui/input";
import { Button, ButtonText } from "@/components/ui/button";
import { HStack } from "@/components/ui/hstack";
import { Pressable } from "@/components/ui/pressable";
import { Checkbox, CheckboxIcon, CheckboxIndicator, CheckboxLabel } from "@/components/ui/checkbox";
import { CheckIcon } from "@/components/ui/icon";
import TermsPrivacyModal from "@/screens/auth/terms-privacy";

// Hooks
import { Controller } from "react-hook-form";
import { useSignUpBasic } from "@/hooks/useSignUpBasic";

export const SignUpBasicForm = () => {
  const router = useRouter();

  const {
    control,
    errors,
    getValues,
    showPassword,
    showConfirmPassword,
    handleTogglePassword,
    handleToggleConfirmPassword,
    handleSubmit,
    handleKeyPress,
    onSubmit,
    modalVisible,
    setModalVisible,
  } = useSignUpBasic();

  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
      <VStack className="w-full px-8">
        <VStack className="gap-4">
          <Text size="xl" style={{ textAlign: "center" }}>
            <Text className="font-bold" size="xl">
              New to SoundTrek?
            </Text>{" "}
            Unlock a world of immersive travel experiences with personalized audio guides.
          </Text>
        </VStack>

    <VStack className="w-full p-6" space="3xl">
      <VStack className="w-full gap-4">

        {/* First Name */}
        <FormControl isInvalid={!!errors.firstName} className="w-full gap-2">
          <FormControlLabel>
            <FormControlLabelText className="text-lg">First Name</FormControlLabelText>
          </FormControlLabel>
          <Controller
            name="firstName"
            control={control}
            defaultValue=""
            render={({ field: { onChange, onBlur, value } }) => (
              <Input>
                <InputField
                  className="text-md"
                  placeholder="First Name"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  onSubmitEditing={handleKeyPress}
                  returnKeyType="done"
                />
              </Input>
            )}
          />
          <FormControlError>
            <FormControlErrorIcon as={AlertTriangle} />
            <FormControlErrorText>{errors.firstName?.message}</FormControlErrorText>
          </FormControlError>
        </FormControl>

        {/* Last Name */}
        <FormControl isInvalid={!!errors.lastName} className="w-full gap-2">
          <FormControlLabel>
            <FormControlLabelText className="text-lg">Last Name</FormControlLabelText>
          </FormControlLabel>
          <Controller
            name="lastName"
            control={control}
            defaultValue=""
            render={({ field: { onChange, onBlur, value } }) => (
              <Input>
                <InputField
                  className="text-md"
                  placeholder="Last Name"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  onSubmitEditing={handleKeyPress}
                  returnKeyType="done"
                />
              </Input>
            )}
          />
          <FormControlError>
            <FormControlErrorIcon as={AlertTriangle} />
            <FormControlErrorText>{errors.lastName?.message}</FormControlErrorText>
          </FormControlError>
        </FormControl>

        {/* Date of Birth */}
        <FormControl isInvalid={!!errors.birthDate} className="w-full gap-2">
          <FormControlLabel>
            <FormControlLabelText className="text-lg">Date of Birth</FormControlLabelText>
          </FormControlLabel>
          <Controller
            name="birthDate"
            control={control}
            defaultValue=""
            render={({ field: { onChange, onBlur, value } }) => {
              // function to auto-insert hyphens
              const handleDateChange = (text: string) => {
                const digitsOnly = text.replace(/\D/g, "");
                let formatted = digitsOnly;

                if (digitsOnly.length > 4 && digitsOnly.length <= 6) {
                  formatted = `${digitsOnly.slice(0, 4)}-${digitsOnly.slice(4)}`;
                } else if (digitsOnly.length > 6) {
                  formatted = `${digitsOnly.slice(0, 4)}-${digitsOnly.slice(4, 6)}-${digitsOnly.slice(6, 8)}`;
                }

                onChange(formatted);
              };

              return (
                <Input>
                  <InputField
                    className="text-md"
                    placeholder="YYYY-MM-DD"
                    keyboardType="numeric"
                    value={value}
                    onChangeText={handleDateChange}
                    onBlur={onBlur}
                    maxLength={10}
                    returnKeyType="done"
                  />
                </Input>
              );
            }}
          />
          <FormControlError>
            <FormControlErrorIcon as={AlertTriangle} />
            <FormControlErrorText>{errors.birthDate?.message}</FormControlErrorText>
          </FormControlError>
        </FormControl>

        {/* Email */}
        <FormControl isInvalid={!!errors.email} className="w-full gap-2">
          <FormControlLabel>
            <FormControlLabelText className="text-lg">Email</FormControlLabelText>
          </FormControlLabel>
          <Controller
            name="email"
            control={control}
            defaultValue=""
            render={({ field: { onChange, onBlur, value } }) => (
              <Input>
                <InputField
                  className="text-md"
                  placeholder="Email"
                  autoCapitalize="none"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  onSubmitEditing={handleKeyPress}
                  returnKeyType="done"
                />
              </Input>
            )}
          />
          <FormControlError>
            <FormControlErrorIcon as={AlertTriangle} />
            <FormControlErrorText>{errors.email?.message}</FormControlErrorText>
          </FormControlError>
        </FormControl>

        {/* Password */}
        <FormControl isInvalid={!!errors.password} className="w-full gap-2">
          <FormControlLabel>
            <FormControlLabelText className="text-lg">Password</FormControlLabelText>
          </FormControlLabel>
          <Controller
            name="password"
            control={control}
            defaultValue=""
            render={({ field: { onChange, onBlur, value } }) => (
              <Input>
                <InputField
                  className="text-md"
                  placeholder="Password"
                  type={showPassword ? "text" : "password"}
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  onSubmitEditing={handleKeyPress}
                  returnKeyType="done"
                />
                <InputSlot onPress={handleTogglePassword} className="pr-3 p-3">
                  <InputIcon as={showPassword ? EyeIcon : EyeOffIcon} />
                </InputSlot>
              </Input>
            )}
          />
          <FormControlError>
            <FormControlErrorIcon as={AlertTriangle} />
            <FormControlErrorText>{errors.password?.message}</FormControlErrorText>
          </FormControlError>
        </FormControl>

        {/* Confirm Password */}
        <FormControl isInvalid={!!errors.confirmpassword} className="w-full gap-2">
          <FormControlLabel>
            <FormControlLabelText className="text-lg">Confirm Password</FormControlLabelText>
          </FormControlLabel>
          <Controller
            name="confirmpassword"
            control={control}
            defaultValue=""
            render={({ field: { onChange, onBlur, value } }) => (
              <Input>
                <InputField
                  className="text-md"
                  placeholder="Confirm Password"
                  type={showConfirmPassword ? "text" : "password"}
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  onSubmitEditing={handleKeyPress}
                  returnKeyType="done"
                />
                <InputSlot onPress={handleToggleConfirmPassword} className="pr-3 p-3">
                  <InputIcon as={showConfirmPassword ? EyeIcon : EyeOffIcon} />
                </InputSlot>
              </Input>
            )}
          />
          <FormControlError>
            <FormControlErrorIcon as={AlertTriangle} />
            <FormControlErrorText>{errors.confirmpassword?.message}</FormControlErrorText>
          </FormControlError>
        </FormControl>

        {/* Terms */}
        <FormControl isInvalid={!!errors.termsandprivacy}>
          <Controller
            name="termsandprivacy"
            control={control}
            defaultValue={false}
            render={({ field: { onChange, value } }) => (
              <Checkbox
                isChecked={value}
                onChange={onChange}
                value="termsandprivacy"
                aria-label="Accept Terms"
              >
                <CheckboxIndicator>
                  <CheckboxIcon as={CheckIcon} />
                </CheckboxIndicator>
                <CheckboxLabel>I accept the </CheckboxLabel>
                <Pressable onPress={() => setModalVisible(true)}>
                  <Text className="text-primary-800 underline">Terms & Privacy Policy</Text>
                </Pressable>
              </Checkbox>
            )}
          />
          <FormControlError>
            <FormControlErrorIcon as={AlertTriangle} />
            <FormControlErrorText>{errors.termsandprivacy?.message}</FormControlErrorText>
          </FormControlError>
        </FormControl>
      </VStack>

      {/* Buttons */}
      <VStack className="w-full my-7" space="lg">
        <Button className="w-full" onPress={handleSubmit(onSubmit)}>
          <ButtonText className="font-bold">Sign up</ButtonText>
        </Button>
        <HStack className="self-center" space="sm">
          <Text size="md">Already have an account?</Text>
          <Pressable onPress={() => router.replace("/auth/signin")}>
            <Text className="font-bold">Sign in!</Text>
          </Pressable>
        </HStack>
      </VStack>
    </VStack>

    {/* Modal */}
    <TermsPrivacyModal visible={modalVisible} onClose={() => setModalVisible(false)} />
  </VStack>
  </ScrollView>
  );
};