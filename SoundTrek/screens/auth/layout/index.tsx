// React
import React from "react";

// UI
import { VStack } from "@/components/ui/vstack";
import { SafeAreaView } from "@/components/ui/safe-area-view";
import { Header } from "@/components/ui/header-back";

// Types
type AuthLayoutProps = {
  children: React.ReactNode;
  showHeader?: boolean;
  headerTitle?: string;
  showBack?: boolean;
  onBack?: () => void;
  showLogout?: boolean;
};

export const AuthLayout = ({
  children,
  showHeader = false,
  headerTitle = "",
  showBack = false,
  onBack,
  showLogout = false,
}: AuthLayoutProps) => {
  return (
    <SafeAreaView className="flex-1 bg-background-0">
      <VStack className="w-full h-full bg-background-0 flex-1 px-4 pt-8">
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
        <VStack className="flex-1 w-full gap-6">
          {children}
        </VStack>
      </VStack>
    </SafeAreaView>
  );
};