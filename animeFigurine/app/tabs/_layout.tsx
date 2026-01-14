// app/(tabs)/_layout.tsx
import React from "react";
import {
    View,
    TouchableOpacity,
    StyleSheet,
    useWindowDimensions,
} from "react-native";
import { Tabs, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function TabsLayout() {
    const router = useRouter();
    const { width } = useWindowDimensions();
    const insets = useSafeAreaInsets();

    // Responsive values
    const TAB_HEIGHT = Math.max(70, width * 0.18);
    const ICON_SIZE = Math.min(30, width * 0.075);

    return (
        <Tabs
            screenOptions={{ headerShown: false }}
            tabBar={({ state }) => {
                const currentRoute = state.routes[state.index].name;

                return (
                    <View
                        style={[
                            styles.bar,
                            {
                                height: TAB_HEIGHT + insets.bottom,
                                paddingBottom: insets.bottom,
                            },
                        ]}
                    >
                        <TabIcon
                            icon="storefront-outline"
                            isActive={currentRoute === "home"}
                            size={ICON_SIZE}
                            onPress={() => router.push("/tabs/home")}
                        />
                        <TabIcon
                            icon="cart-outline"
                            isActive={currentRoute === "basket"}
                            size={ICON_SIZE}
                            onPress={() => router.push("/tabs/basket")}

                        />
                        <TabIcon
                            icon="camera-outline"
                            isActive={currentRoute === "ar"}
                            size={ICON_SIZE}
                            onPress={() => router.push("/tabs/ar")}
                        />
                        <TabIcon
                            icon="person-outline"
                            isActive={currentRoute === "profile"}
                            size={ICON_SIZE}
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
    size: number;
    onPress: () => void;
};

function TabIcon({ icon, isActive, size, onPress }: TabIconProps) {
    return (
        <TouchableOpacity
            style={styles.iconWrapper}
            activeOpacity={1.6}
            onPress={onPress}
        >
            <Ionicons
                name={icon}
                size={size}
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
        backgroundColor: ORANGE,
        borderTopLeftRadius: 28,
        borderTopRightRadius: 28,
        flexDirection: "row",
        justifyContent: "space-evenly",
        alignItems: "center",
    },
    iconWrapper: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
    },
});
