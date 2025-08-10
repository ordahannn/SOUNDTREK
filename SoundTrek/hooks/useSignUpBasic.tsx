import { useRouter } from "expo-router";
import { Keyboard } from "react-native";
import { useForm } from "react-hook-form";
import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Text } from "react-native";

import { signupBasicSchema, SignupBasicSchemaType } from "@/schemas/signupBasicSchema";
import { useToast, Toast, ToastTitle } from "@/components/ui/toast";
import { registerUser } from "@/services/authService";
import { storeSession } from "@/services/sessionService";

/**
  useSignUp -> Handles initial user sign-up logic.

  * Includes only basic info + default values for language/radius
**/
export const useSignUpBasic = () => {
  const toast = useToast();
  const router = useRouter();

  const {
    control,
    handleSubmit,
    formState: { errors },
    getValues,
  } = useForm<SignupBasicSchemaType>({
    resolver: zodResolver(signupBasicSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      birthDate: "",
      email: "",
      password: "",
      confirmpassword: "",
      termsandprivacy: false,
    },
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);

  const handleTogglePassword = () => setShowPassword(!showPassword);
  const handleToggleConfirmPassword = () => setShowConfirmPassword(!showConfirmPassword);

  const handleKeyPress = () => {
    // optional: handle enter key
  };

  const formatDateForServer = (date: string): string => {
    // date === "2000-01-18"
    const [year, month, day] = date.split("-");
    return `${year}-${month}-${day}`;
  };

  const onSubmit = async (data: SignupBasicSchemaType) => {
    try {
      const response = await registerUser({
        ...data,
        birthDate: formatDateForServer(data.birthDate),
        preferredLanguage: "English",
        searchRadiusMeters: 5000,
      });

      await storeSession(response.token, response.user);
      router.replace("/auth/language-selection");
    } catch (error: any) {
      console.error("Registration error:", error);
      toast.show({
        placement: "top",
        render: ({ id }) => (
          <Toast nativeID={id} action="error">
            <Text>Sign-up failed. Please try again.</Text>
          </Toast>
        ),
      });
    }
  };

  return {
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
  };
};