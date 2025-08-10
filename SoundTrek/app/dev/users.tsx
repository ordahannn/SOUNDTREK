import { useEffect, useState } from "react";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import { HStack } from "@/components/ui/hstack";
import { User, getAllUsers } from "@/services/authService";
import { SafeAreaView } from "@/components/ui/safe-area-view";
import { useRouter } from "expo-router";
import { Heading } from "@/components/ui/heading";
import { TouchableOpacity } from 'react-native';
import { ArrowBackIcon } from '@/components/ui/material-icons';

export default function UsersDebugScreen() {
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    (async () => {
      const list = await getAllUsers();
    //   console.log("Local users:", list);
      setUsers(list);
    })();
  }, []);

   const router = useRouter();

  return (
    <SafeAreaView className="flex-1 bg-background-0">
        <VStack className="w-full h-full bg-background-0 flex-grow justify-center">
            <VStack className="md:items-center md:justify-center flex-1 w-full  p-9 md:gap-10 gap-16 md:m-auto md:w-1/2 h-full">
                <VStack className="flex-1 justify-between w-full" >
                    <HStack className="justify-between w-full items-center">
                        {/* Temporary back to splash screen */}
                        <TouchableOpacity onPress={() => { router.replace("/auth/splash-screen"); }}>
                            <ArrowBackIcon size={25} />
                        </TouchableOpacity>
                    </HStack>
                    <VStack className="w-full p-6 items-center absolute">
                        <VStack className="py-10">
                            <Heading className="md:text-center" size="3xl" style={{ textAlign: "center" }}>
                                Registered Users
                            </Heading>
                        </VStack>
                        <VStack className="gap-2">
                            {users.map((user, i) => (
                                <Text key={i}>• {user.email}</Text>
                            ))}
                        </VStack>
                    </VStack>
                </VStack>
            </VStack>
        </VStack>
    </SafeAreaView>
  );
}
