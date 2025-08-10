import React from "react";
import { useRouter } from "expo-router";
import { handleLogout } from "@/helpers/logout-helper";
import { Button, ButtonText } from "@/components/ui/button";
import { HStack } from "@/components/ui/hstack";
import { Pressable } from "@/components/ui/pressable"
import { ArrowBackIcon } from "@/components/ui/material-icons";
import { Heading } from "@/components/ui/heading"

interface HeaderProps {
    title: string;
    showBackButton?: boolean;
}

export const Header = ({ title, showBackButton = true }: HeaderProps) => {
    const router = useRouter();

    return (
        <HStack  className="justify-between items-center py-4 px-8">
            {showBackButton ? (
                <Pressable onPress={() => router.back()}
                >
                    <ArrowBackIcon size={20}/>
                </Pressable>
            ) : ( 
                <Pressable disabled style={{ width: 20 }} />
            )}
            <Heading className="text-center" size="3xl">
                {title}
            </Heading>
            <Button variant="link" onPress={async () => await handleLogout()}>
                <ButtonText className="font-bold text-lg">
                    Logout
                </ButtonText>
            </Button>
        </HStack>
    )
}