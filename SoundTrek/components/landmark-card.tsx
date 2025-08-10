// React
import React from "react";

// UI 
import { Text } from "@/components/ui/text";
import { Image } from "@/components/ui/image";
import { Pressable } from "@/components/ui/pressable";
import { View } from "@/components/ui/view";

// Helpers
import { getLandmarkImageOrDefault } from "@/helpers/image-helper";
import { BlurView } from "expo-blur";

// Types
import { WikipediaLandmark } from "@/types/WikipediaLandmark";

type Props = {
  landmark: WikipediaLandmark
  onPress?: () => void;
};

export const LandmarkCard = ({ landmark, onPress }: Props) => {
  return (
    <Pressable onPress={onPress} className="w-[47%] mb-6">
      {/* Shadow container */}
      <View
        className=""
        style={{
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.3,
          shadowRadius: 10,
          elevation: 6,
          borderRadius: 16,
          backgroundColor: "#fff",
        }}
      >
        {/* Inner container with rounded corners and overflow */}
        <View style={{ borderRadius: 16, overflow: "hidden" }}>
          {/* Image */}
          <Image
            source={getLandmarkImageOrDefault(landmark.imageUrl)}
            alt={landmark.title}
            className="w-full h-[160px]"
            resizeMode="cover"
          />

          {/* Blurred tag */}
          <View className="absolute bottom-2 self-center w-[130px] rounded-3xl overflow-hidden">
            <BlurView
              intensity={50}
              tint="dark"
              className="items-center justify-center px-2 py-1"
            >
              <Text className="text-white text-sm font-semibold text-center">
                {landmark.title}
              </Text>
            </BlurView>
          </View>
        </View>
      </View>
    </Pressable>
  );
};