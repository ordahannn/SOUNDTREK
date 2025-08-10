import { router, usePathname } from "expo-router";
import { HStack } from "@/components/ui/hstack";
import { Pressable } from "@/components/ui/pressable";
import { HomeIcon, MapIcon, SearchIcon, UserIcon } from "lucide-react-native";
import { Icon } from "@/components/ui/icon";
import { Text } from "@/components/ui/text";

export const BottomNavBar = () => {
  const pathname = usePathname();

  type NavRoute = "/home" | "/home/search" | "/itinerary/map" | "/home/profile";

  const navItems: { icon: any; label: string; route: NavRoute }[] = [
    { icon: HomeIcon, label: "Home", route: "/home" },
    { icon: SearchIcon, label: "Search", route: "/home/search" },
    { icon: MapIcon, label: "Itinerary", route: "/itinerary/map" },
    { icon: UserIcon, label: "Profile", route: "/home/profile" },
  ];

  return (
    <HStack className="justify-around px-4 py-3 bg-white border-t border-gray-300">
      {navItems.map(({ icon, label, route }) => {
        const isActive = pathname === route;
        return (
          <Pressable
            key={route}
            onPress={() => router.replace(route)}
            className="mt-2 items-center"
          >
            <Icon
              as={icon}
              size="lg"
              className={isActive ? "text-primary-400" : "text-primary-700"}
            />
            <Text className={`text-sm ${isActive ? "text-primary-400 font-bold" : "text-primary-700"}`}>
              {label}
            </Text>
          </Pressable>
        );
      })}
    </HStack>
  );
};