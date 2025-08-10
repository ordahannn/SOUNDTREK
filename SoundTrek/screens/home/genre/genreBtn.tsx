// React
import React, { useState } from "react";
import { useRouter } from "expo-router";

// UI
import { Pressable } from "@/components/ui/pressable";
import { View } from "@/components/ui/view";
import { Text } from "@/components/ui/text";
import { Image } from "@/components/ui/image";

// Screens
import { sendToAI } from "@/screens/home/genre/AiRender";

// Helpers
import { getSelectedLandmark, setSelectedLandmark } from "@/helpers/storage-helper";

// Types
import { SelectedLandmark } from "@/types/SelectedLandmark";

interface Props {
  fullDescription: string | null;
  genreName: string;
  genreImageUrl: string;
  language: string;
}

const GenreButton: React.FC<Props> = ({ fullDescription, genreName, genreImageUrl, language }) => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    try {
      setLoading(true); // Start loading

      if(fullDescription == '' || !fullDescription){
        router.replace("/home");
        return;
      }
      
      // Step 1: Send text to AI to receive processed text
      const result = await sendToAI(fullDescription, genreName, language);
      const processedText = typeof result === "string" ? result : JSON.stringify(result);
     // console.log("[handleGenerate] processedText:", processedText); // log

      // Step 2: Retrieving the selected landmark object from memory
      const storedLandmark = await getSelectedLandmark();
      
      if (!storedLandmark || !storedLandmark.pageId) {
        throw new Error("Selected landmark is missing or invalid");
      }

      // Step 3: Update `selectedGenre`, `processedText` fields
      const updatedLandmark: SelectedLandmark = {
        ...storedLandmark,
        selectedGenre: genreName,
        processedText: processedText,
      };

      // Step 4: Saving back to memory - using storage helper 
      await setSelectedLandmark(updatedLandmark);
      console.log("[handleGenerate] Saved to storage:", updatedLandmark.processedText); // log

      // Step 5: Go to the next page
      // router.replace("/auth/afterGenre");
      router.replace("/home/player");
      
    } catch (err) {
      console.error("Failed to send to AI or save result:", err);
    } finally {
      setLoading(false); // Finish loading (if you want to stay on the screen)
    }
  };

  return (
    // <Pressable
    //   onPress={handleGenerate}
    //   className="w-full h-full"
    //   disabled={loading} // Cannot be clicked again
    // >
    //   <View
    //     className="absolute z-[1] flex-row items-center gap-1 mt-1 p-1 left-1 px-3"
    //     style={{
    //       borderRadius: 13,
    //       backgroundColor: "rgba(0, 0, 0, 0.5)",
    //       borderWidth: 1,
    //       borderColor: "1px solid rgba(255, 255, 255, 0.5)",
    //     }}
    //   >
    //     <Icon style={{ color: "white" }} as={PlayIcon} />
    //     <Text className="text-lg text-white">
    //       {genreName}
    //     </Text>
    //   </View>

    //   <Center>
    //     <Image
    //       className="w-full h-full opacity-90"
    //       size="md"
    //       borderRadius={14}
    //       source={{ uri: genreImageUrl }}
    //       alt={genreName}
    //     />
    //     {loading && (
    //       <View className="absolute">
    //         <Text className="text-white font-bold text-xl">Loading...</Text>
    //       </View>
    //     )}
    //   </Center>
    // </Pressable>

    <Pressable
      onPress={handleGenerate}
      className="w-full h-full rounded-2xl overflow-hidden"
      disabled={loading}
    >
      <View className="w-full h-full relative">
        {/* Image */}
        <Image
          className="w-full h-full"
          size="md"
          source={{ uri: genreImageUrl }}
          alt={genreName}
        />

        {/* Genre Name at the Bottom */}
        <View
          className="absolute bottom-0 left-0 right-0 px-2 py-1"
          style={{
            backgroundColor: "rgba(0,0,0,0.5)",
            borderBottomLeftRadius: 14,
            borderBottomRightRadius: 14,
          }}
        >
          <Text className="text-white text-base font-semibold text-center">
            {genreName}
          </Text>
        </View>

        {/* Optional loading overlay */}
        {loading && (
          <View className="absolute inset-0 items-center justify-center">
            <Text className="text-white font-bold text-xl">Loading...</Text>
          </View>
        )}
      </View>
    </Pressable>
  );
};

export default GenreButton;
