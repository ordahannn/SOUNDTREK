// React
import React from "react";

// UI
import { VStack } from "@/components/ui/vstack";
import { SafeAreaView } from "@/components/ui/safe-area-view";
import { Header } from "@/components/ui/header-back";
import { BottomNavBar } from "@/components/ui/BottomNavBar";

// Hooks
import { useActivityTracker } from "@/hooks/useActivityTracker";
import { useSessionGuard } from "@/hooks/useSessionGuard";

type HomeLayoutProps = {
  children: React.ReactNode;
  showHeader?: boolean;
  headerTitle?: string;
  showBack?: boolean;
  onBack?: () => void;
  showLogout?: boolean;
  showTabBar?: boolean;
};

export const HomeLayout = ({
  children,
  showHeader = true,
  headerTitle = "",
  showBack = false,
  onBack,
  showLogout = false,
  showTabBar = true,
}: HomeLayoutProps) => {
  useSessionGuard(); // Redirect if not logged in
  useActivityTracker();

  return (
    <SafeAreaView className="flex-1 bg-background-0 edges={['bottom', 'left', 'right']}">
      <VStack className="flex-1 justify-between w-full">
        
        {/* Optional Header */}
        {showHeader && (
          <Header title={headerTitle} showBack={showBack} onBack={onBack} showLogout={showLogout}/>
        )}

        {/* Main Content */}
        <VStack className="flex-1 w-full gap-2 px-4">
          {children}
        </VStack>

        {/* Optional Bottom Navigation Bar */}
        {showTabBar && <BottomNavBar />}
      </VStack>
    </SafeAreaView>
  );
};
