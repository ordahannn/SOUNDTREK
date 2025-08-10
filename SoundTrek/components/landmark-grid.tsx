// Router
import React from "react";
import { FlatList } from "react-native";

// UI components
import { VStack } from "@/components/ui/vstack";
import { Heading } from "@/components/ui/heading";
import { LandmarkCard } from "./landmark-card";

// Types
import { WikipediaLandmark } from "@/types/WikipediaLandmark";

type Props = {
  title: string;
  data: WikipediaLandmark[];
  onLandmarkCardPress?: (landmark: WikipediaLandmark) => void;
};

export const LandmarkGrid = ({ title, data, onLandmarkCardPress }: Props) => {
  return (
    <VStack className="flex-1" style={{ paddingBottom: 0, marginBottom: 0 }}>
      {/* Section Title */}
      <Heading size="xl">
        {title}
      </Heading>
      <FlatList
        data={data}
        numColumns={2}
        keyExtractor={(item) => item.pageId.toString()}
        showsVerticalScrollIndicator={false}
        
        contentContainerStyle={{
          paddingBottom: 16,
          paddingHorizontal: 0,
          marginTop: 4,
        }}

        columnWrapperStyle={{
          justifyContent: "space-between", 
          marginBottom: 16,
        }}

        renderItem={({ item }) => (
          <LandmarkCard
            landmark={item}
            onPress={() => {
              onLandmarkCardPress?.(item);
            }}
          />
        )}
      />
    </VStack>
  );
};
