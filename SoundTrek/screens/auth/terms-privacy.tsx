// React
import React from "react";
import { Modal, SafeAreaView } from "react-native";

// UI
import { ScrollView } from "@/components/ui/scroll-view";
import { Text } from "@/components/ui/text";
import { Button, ButtonText } from "@/components/ui/button";
import { VStack } from "@/components/ui/vstack";
import { HStack } from "@/components/ui/hstack";

// Interfaces
interface TermsPrivacyModalProps {
    visible: boolean;
    onClose: () => void;
}

const TermsPrivacyModal: React.FC<TermsPrivacyModalProps> = ({ visible, onClose }) => {

    return (
        <Modal visible={visible} transparent>
            <SafeAreaView className="flex-1">
                <VStack className="flex-1 justify-between px-6 py-4 bg-typography-0">
                    <ScrollView
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={{ paddingBottom: 80 }}
                    >
                        <VStack className="gap-3 py-12 items-center">
                            <Text className="font-bold text-3xl text-center" style={{ textAlign: "center" }}>
                                Terms of Use & Privacy Policy
                            </Text>
                            
                            <Text className="text-lg font-semibold text-center mb-3 p-2" style={{ textAlign: "center" }}>
                                By using SoundTrek, you agree to the following:
                            </Text>

                            {/* Terms */}
                            <VStack space="md" className="w-full mt-2">
                                <Text className="text-lg font-bold">Terms of Use</Text> 

                                <HStack className="gap-2">
                                    <Text className="font-bold text-md">
                                        1.
                                    </Text>
                                    <Text className="text-md">
                                        SoundTrek provides personalized audio experiences. You agree not to isuse, copy, or distribute content without permission.
                                    </Text>
                                </HStack>
                                <HStack className="gap-2">
                                    <Text className="font-bold text-md">
                                        2.
                                    </Text>
                                    <Text className="text-md">
                                        You must provide accurate information when  {'\n'}signing up and comply with all applicable laws and regulations.
                                    </Text>
                                </HStack>
                                <HStack className="gap-2">
                                    <Text className="font-bold text-md">
                                        3.
                                    </Text>
                                    <Text className="text-md">
                                        You are responsible for maintaining the  {'\n'}confidentiality of your login credentials and  {'\n'}ensuring account security.
                                    </Text>
                                </HStack>
                                <HStack className="gap-2">
                                    <Text className="font-bold text-md">
                                        4.
                                    </Text>
                                    <VStack>
                                        <HStack className="gap-2 p-1">
                                            <Text className="font-bold text-md">
                                                -
                                            </Text>
                                            <Text className="text-md">
                                                Unauthorized access or attempts to hack the  {'\n'}platform are strictly prohibited.
                                            </Text>
                                        </HStack>
                                        <HStack className="gap-2 p-1">
                                            <Text className="font-bold text-md">
                                                -
                                            </Text>
                                            <Text className="text-md">
                                                The distribution of harmful or malicious software  {'\n'}is not allowed.
                                            </Text>
                                        </HStack>
                                        <HStack className="gap-2 p-1">
                                            <Text className="font-bold text-md">
                                                -
                                            </Text>
                                            <Text className="text-md">
                                                Users must refrain from sharing offensive, illegal,  {'\n'}or inappropriate content.
                                            </Text>
                                        </HStack>
                                    </VStack>
                                </HStack>
                                <HStack className="gap-2">
                                    <Text className="font-bold text-md">
                                        5.
                                    </Text>
                                    <Text className="text-md">
                                        SoundTrek reserves the right to modify, suspend,  {'\n'}or terminate services at any time, with or without{'\n'}notice.
                                    </Text>
                                </HStack>
                                
                                {/* Privacy */}
                                <VStack>
                                    <Text className="text-lg font-bold">
                                        Privacy Policy
                                    </Text>

                                    <Text className="text-md">
                                        SoundTrek values your privacy.
                                    </Text>
                                </VStack>
                                
                                <VStack>
                                    <HStack className="gap-2 p-1">
                                        <Text className="font-bold text-md">
                                            -
                                        </Text>
                                        <Text className="text-md">
                                            We collect your email, name, and location (if allowed) for personalization.
                                        </Text>
                                    </HStack>
                                    <HStack className="gap-2 p-1">
                                        <Text className="font-bold text-md">
                                            -
                                        </Text>
                                        <Text className="text-md">
                                            We do NOT sell your data to third parties.
                                        </Text>
                                    </HStack>
                                    <HStack className="gap-2 p-1">
                                        <Text className="font-bold text-md">
                                            -
                                        </Text>
                                        <Text className="text-md">
                                            You can request data deletion by contacting support.
                                        </Text>
                                    </HStack>
                                </VStack>
                            </VStack>
                        </VStack>
                    </ScrollView>
                    
                    {/* Close button */}
                    <Button onPress={onClose} className="w-full rounded-lg">
                            <ButtonText className="font-bold text-lg">Close</ButtonText>
                    </Button>
                </VStack>
            </SafeAreaView>
        </Modal>
    );
};

export default TermsPrivacyModal;