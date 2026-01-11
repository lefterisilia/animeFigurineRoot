import React, { useEffect } from "react";
import { View, ActivityIndicator } from "react-native";
import { router } from "expo-router";
import { getUser } from "@/lib/authStorage";

export default function Index() {
    useEffect(() => {
        const checkAuth = async () => {
            const user = await getUser();

            if (user) {
                router.replace("/tabs/home");
            } else {
                router.replace("/login");
            }
        };

        checkAuth();
    }, []);

    return (
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
            <ActivityIndicator size="large" />
        </View>
    );
}
