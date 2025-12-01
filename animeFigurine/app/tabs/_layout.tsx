// app/(tabs)/_layout.tsx
import React from "react";
import { View, TouchableOpacity, StyleSheet } from "react-native";
import { Tabs, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

export default function TabsLayout() {
    const router = useRouter();

    return (
        <Tabs
            screenOptions={{
                headerShown: false,
            }}
            tabBar={({ state }) => {
                const currentRoute = state.routes[state.index].name;

                return (
                    <View style={styles.bar}>
                        <TabIcon
                            icon="cart-outline"
                            isActive={currentRoute === "home"}
                            onPress={() => router.push("/tabs/home")}
                        />
                        <TabIcon
                            icon="camera-outline"
                            isActive={currentRoute === "ar"}
                            onPress={() => router.push("/tabs/ar")}
                        />
                        <TabIcon
                            icon="person-outline"
                            isActive={currentRoute === "profile"}
                            onPress={() => router.push("/tabs/profile")}
                        />
                    </View>
                );
            }}
        >
            <Tabs.Screen name="home" />
            <Tabs.Screen name="ar" />
            <Tabs.Screen name="profile" />
        </Tabs>
    );
}

type TabIconProps = {
    icon: keyof typeof Ionicons.glyphMap;
    isActive: boolean;
    onPress: () => void;
};

function TabIcon({ icon, isActive, onPress }: TabIconProps) {
    return (
        <TouchableOpacity style={styles.iconWrapper} onPress={onPress}>
            <Ionicons
                name={icon}
                size={28}
                color={isActive ? "#000000" : "#333333"}
            />
        </TouchableOpacity>
    );
}

const ORANGE = "#FF8A00";

const styles = StyleSheet.create({
    bar: {
        position: "absolute",
        left: 0,
        right: 0,
        bottom: 0,
        height: 80,
        backgroundColor: ORANGE,
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30,
        flexDirection: "row",
        justifyContent: "space-around",
        alignItems: "center",
        paddingHorizontal: 40,
    },
    iconWrapper: {
        alignItems: "center",
        justifyContent: "center",
    },
});
