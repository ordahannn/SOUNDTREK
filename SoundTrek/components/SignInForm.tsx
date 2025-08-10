// React
import React from "react";
import { AlertTriangle, EyeIcon, EyeOffIcon } from "lucide-react-native";

// Expo
import { useRouter } from "expo-router";

// UI
import { VStack } from "@/components/ui/vstack";
import { Text } from "@/components/ui/text";
import { FormControl, FormControlError, FormControlErrorIcon, FormControlErrorText, FormControlLabel, FormControlLabelText } from "@/components/ui/form-control";
import { Input, InputField, InputIcon, InputSlot } from "@/components/ui/input";
import { Button, ButtonText } from "@/components/ui/button";
import { HStack } from "@/components/ui/hstack";
import { Pressable } from "@/components/ui/pressable";

// Hooks
import { Controller } from "react-hook-form";
import { useSignIn } from "@/hooks/useSignIn";

/**
    SignInForm - Handles all UI and form logic for sign in.
**/
export const SignInForm = () => {
  const router = useRouter();

  const {
    control,
    errors,
    validated,
    showPassword,
    handlePasswordToggle,
    handleSubmit,
    handleKeyPress,
    onSubmit,
  } = useSignIn();

  return (
    <VStack className="w-full px-8">
      <VStack className="gap-4 mt-6">
        <Text size="xl" style={{ textAlign: "center" }}>
          <Text className="font-bold" size="xl">
            Already explored with us?
          </Text>{" "}
            The world is full of untold stories, and your journey is far from over.
        </Text>
      </VStack>

      <VStack className="w-full p-6" space="3xl">
        <VStack className="w-full gap-4">
          {/* Email */}
          <FormControl isInvalid={!!errors?.email || !validated.emailValid} className="w-full gap-2">
            <FormControlLabel>
              <FormControlLabelText className="text-lg">Email</FormControlLabelText>
            </FormControlLabel>
            <Controller
              name="email"
              defaultValue=""
              control={control}
              render={({ field: { onChange, onBlur, value } }) => (
                <Input>
                  <InputField
                    className="text-md"
                    placeholder="Email"
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
              <FormControlErrorText>
                {errors?.email?.message || (!validated.emailValid && "Email not found")}
              </FormControlErrorText>
            </FormControlError>
          </FormControl>

          {/* Password */}
          <FormControl isInvalid={!!errors.password || !validated.passwordValid} className="w-full gap-2">
            <FormControlLabel>
              <FormControlLabelText className="text-lg">Password</FormControlLabelText>
            </FormControlLabel>
            <Controller
              defaultValue=""
              name="password"
              control={control}
              render={({ field: { onChange, onBlur, value } }) => (
                <Input>
                  <InputField
                    type={showPassword ? "text" : "password"}
                    className="text-md"
                    placeholder="Password"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    onSubmitEditing={handleKeyPress}
                    returnKeyType="done"
                  />
                  <InputSlot onPress={handlePasswordToggle} className="pr-3 p-3">
                    <InputIcon as={showPassword ? EyeIcon : EyeOffIcon} />
                  </InputSlot>
                </Input>
              )}
            />
            <FormControlError>
              <FormControlErrorIcon as={AlertTriangle} />
              <FormControlErrorText>
                {errors?.password?.message || (!validated.passwordValid && "Password is incorrect")}
              </FormControlErrorText>
            </FormControlError>
          </FormControl>
        </VStack>

        {/* Buttons */}
        <VStack className="w-full my-7" space="lg">
          <Button className="w-full" onPress={handleSubmit(onSubmit)}>
            <ButtonText className="font-bold">Sign in</ButtonText>
          </Button>
          <HStack className="self-center" space="sm">
            <Text size="md">Don't have an account?</Text>
            <Pressable onPress={() => router.replace("/auth/signup")}>
              <Text className="font-bold">Sign up!</Text>
            </Pressable>
          </HStack>
        </VStack>
      </VStack>
    </VStack>
  );
};