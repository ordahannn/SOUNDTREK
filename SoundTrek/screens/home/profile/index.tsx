// React
import React from 'react';
import { useColorScheme } from "nativewind";

// UI
import { VStack } from "@/components/ui/vstack";
import { HomeLayout } from "../layout";

// Hooks
import { useActivityTracker } from '@/hooks/useActivityTracker';

// Other
import { ProfileTitle } from "./components/ProfileTitle";
import { ProfilePersonalInterests } from "./components/PersonalInterests";
import { ProfileRadius } from "./components/radius";
import { ProfileLanguage } from "./components/profileLanguage";
import { ProfileLikedLandmarks } from "./components/likedLendmarks";

const Profile = () => {
  useActivityTracker();
  
  return <>
    <VStack className='gap-4'>
      <ProfileTitle />
      <ProfileLanguage/>
      <ProfileRadius />
      <ProfileLikedLandmarks />
      <ProfilePersonalInterests />
    </VStack>
  </>
};

export const ProfileScreen = () => {
  return <HomeLayout showLogout headerTitle={"Profile"}>
      <Profile />
  </HomeLayout>;
};