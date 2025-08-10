// React
import { useColorScheme } from "nativewind";
import { Image } from "react-native";

// Expo
import { useRouter } from "expo-router";

// UI
import { VStack } from "@/components/ui/vstack";
import { Button, ButtonText } from "@/components/ui/button";
import { AuthLayout } from "../layout";

const Splash = () => {
    const router = useRouter();
    const { colorScheme } = useColorScheme();

    return (
        <VStack className="w-full h-full items-center py-20 px-14" space="3xl">
            {/* Logo */}
            {colorScheme === "dark" ? (
                <Image source={require("@/assets/auth/SOUNDTREK_LOGO_DARK_NAME.png")} style={{ width: 200, height: 200 }} className="mb-8 mt-8" />
            ) : (
                <Image source={require("@/assets/auth/SOUNDTREK_LOGO_LIGHT_NAME.png")} style={{ width: 200, height: 200 }} className="mb-8 mt-8" />
            )}

            {/* Sign in/up buttons */}
            <VStack className="w-full mt-8" space="2xl">
                <Button className="w-full" onPress={() =>
                    router.replace("/auth/signin")
                }
                >
                    <ButtonText className="font-bold text-lg">
                        Sign in
                    </ButtonText>
                </Button>
                <Button className="w-full" onPress={() => {
                    router.replace("/auth/signup")
                }}
                >
                    <ButtonText className="font-bold text-lg">
                        Sign up
                    </ButtonText>
                </Button>

            </VStack>
        </VStack>
    );
};

export const SplashScreen = () => {
    return (
        <AuthLayout>
            <Splash />
        </AuthLayout>
    );
};