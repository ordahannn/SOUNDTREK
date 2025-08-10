import { useRouter } from "expo-router";
import { Keyboard } from "react-native";
import { useForm } from "react-hook-form";
import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";

import { signinSchema, SigninSchemaType } from "@/schemas/signinSchema";
import { useToast, Toast, ToastTitle } from "@/components/ui/toast";
import { signInUser } from "@/services/authService";
import { storeSession } from "@/services/sessionService";

/**
    useSignIn -> Custom hook to encapsulate the sign-in form logic.
    
    * Validation using zod + react-hook-form
    * Authentication via `signInUser`
    * Toast feedback
    * Redirect to /home if success
**/
export const useSignIn = () => {
  const router = useRouter();
  const toast = useToast();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<SigninSchemaType>({
    resolver: zodResolver(signinSchema),
    defaultValues: {
        email: "",
        password: "",
    },
  });

  const [validated, setValidated] = useState({
    emailValid: true,
    passwordValid: true,
  });

  const [showPassword, setShowPassword] = useState(false);
  const handlePasswordToggle = () => setShowPassword((prev) => !prev);

  const handleKeyPress = () => {
    Keyboard.dismiss();
    handleSubmit(onSubmit)();
  };

  const onSubmit = async (data: SigninSchemaType) => {
  try {
        const result = await signInUser(data.email, data.password);

        if (!result.token || !result.user) throw new Error("Invalid response");

        await storeSession(result.token, result.user);

        toast.show({
        placement: "top",
        render: ({ id }) => (
            <Toast nativeID={id} variant="solid" action="success">
            <ToastTitle>Signed in successfully</ToastTitle>
            </Toast>
        ),
        });

        router.replace("/home");
        } catch (err) {
            console.error("[SignIn Error]:", err);

            setValidated({ emailValid: false, passwordValid: false });

            toast.show({
                placement: "top",
                render: ({ id }) => (
                    <Toast nativeID={id} variant="solid" action="error">
                    <ToastTitle>Invalid credentials</ToastTitle>
                    </Toast>
                ),
            });
        }
    };

    return {
        control,
        errors,
        validated,
        showPassword,
        handlePasswordToggle,
        handleSubmit,
        handleKeyPress,
        onSubmit,
    };
};