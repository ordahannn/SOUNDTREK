import React from "react";
import { useRouter } from "expo-router";
import { HStack } from "@/components/ui/hstack";
import { Pressable } from "@/components/ui/pressable";
import { ArrowBackIcon } from "@/components/ui/material-icons";
import { Heading } from "@/components/ui/heading";
import { View } from "@/components/ui/view";
import { VStack } from "@/components/ui/vstack";
import { Text } from "@/components/ui/text";
import { handleLogout } from "@/helpers/logout-helper"; // You should already have this

interface HeaderProps {
  title: string;
  showBack?: boolean;
  onBack?: () => void;
  showLogout?: boolean; // 👈 NEW
}

export const Header = ({ title, showBack = false, onBack, showLogout = false }: HeaderProps) => {
  const router = useRouter();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      router.replace("/auth/splash-screen");
    }
  };

  return (
    <VStack className="px-8 py-4">
      <HStack className="relative w-full items-center justify-between">
        {/* Left: Back button or placeholder */}
        {showBack ? (
        <Pressable onPress={handleBack} style={{ width: 56 }}>
            <ArrowBackIcon size={20} />
        </Pressable>
        ) : (
          <View style={{ width: 48 }} />
        )}

        {/* Center: Title */}
        <Heading className="text-center" size="3xl">
          {title}
        </Heading>

        {/* Right: Logout button or placeholder */}
        {showLogout ? (
          <Pressable onPress={handleLogout} style={{ width: 56 }}>
            <Text className="text-md font-bold text-primary-800 text-right">Logout</Text>
          </Pressable>
        ) : (
          <View style={{ width: 48 }} />
        )}
      </HStack>
    </VStack>
  );
};