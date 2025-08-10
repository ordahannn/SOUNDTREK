// React
import React from "react";
import { SafeAreaView } from 'react-native-safe-area-context';

// UI
import { VStack } from "@/components/ui/vstack";
import { Header } from "@/components/ui/header-back";
import { BottomNavBar } from "@/components/ui/BottomNavBar";

// Hooks
import { useSessionGuard } from "@/hooks/useSessionGuard";
import { useActivityTracker } from "@/hooks/useActivityTracker";

// Types
type ItineraryLayoutProps = {
  children: React.ReactNode;
  showHeader?: boolean;
  headerTitle?: string;
  showBack?: boolean;
  onBack?: () => void;
  showLogout?: boolean;
  showTabBar?: boolean;
};

export const ItineraryLayout = ({
  children,
  showHeader = true,
  headerTitle = "",
  showBack = false,
  onBack,
  showLogout = false,
  showTabBar = true,
}: ItineraryLayoutProps) => {
  useSessionGuard();
  useActivityTracker();

  return (
    <SafeAreaView edges={['left', 'right', 'bottom']} className="flex-1 bg-background-0">
      <VStack className="flex-1 justify-between w-full">
        {/* Optional Header */}
        {showHeader && (
          <Header
            title={headerTitle}
            showBack={showBack}
            onBack={onBack}
            showLogout={showLogout}
          />
        )}

        {/* Main Content */}
        <VStack className="flex-1 w-full gap-2 px-4">{children}</VStack>

        {/* Optional Bottom Navigation Bar */}
        {showTabBar && <BottomNavBar />}
      </VStack>
    </SafeAreaView>
  );
};