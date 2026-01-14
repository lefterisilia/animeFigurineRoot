// app/(tabs)/ar.tsx
import React, { useState, useEffect } from "react";
import { View, StyleSheet, ActivityIndicator, Text, TouchableOpacity } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

export default function ARScreen() {
    const { glb } = useLocalSearchParams();
    const router = useRouter();
    const [ARComponent, setARComponent] = useState<React.ComponentType<any> | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let mounted = true;

        // Reset state when glb changes to force remount
        setIsLoading(true);
        setError(null);
        setARComponent(null);

        const loadARComponent = async () => {
            try {
                // Wait a bit to ensure native modules are ready
                await new Promise(resolve => setTimeout(resolve, 500));

                // Dynamically import the AR implementation
                const { default: ARImplementation } = await import("./ar-implementation");
                
                if (mounted) {
                    setARComponent(() => ARImplementation);
                    setIsLoading(false);
                }
            } catch (err) {
                console.error("Failed to load AR component:", err);
                if (mounted) {
                    setError("Failed to initialize AR. Please restart the app.");
                    setIsLoading(false);
                }
            }
        };

        loadARComponent();

        return () => {
            mounted = false;
            // Cleanup: unmount AR component when navigating away
            setARComponent(null);
            setIsLoading(true);
            setError(null);
        };
    }, [glb]);

    if (error) {
        return (
            <View style={styles.container}>
                <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
                    <Ionicons name="arrow-back" size={28} color="#FFFFFF" />
                </TouchableOpacity>
                <Text style={styles.errorText}>{error}</Text>
            </View>
        );
    }

    if (isLoading || !ARComponent) {
        return (
            <View style={styles.container}>
                <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
                    <Ionicons name="arrow-back" size={28} color="#FFFFFF" />
                </TouchableOpacity>
                <ActivityIndicator size="large" color="#FF8A00" />
                <Text style={styles.loadingText}>Initializing AR...</Text>
            </View>
        );
    }

    return (
        <View style={{ flex: 1 }}>
            <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
                <Ionicons name="arrow-back" size={28} color="#FFFFFF" />
            </TouchableOpacity>
            <ARComponent key={glb as string} glbFileName={glb as string} />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#000",
        justifyContent: "center",
        alignItems: "center",
    },
    backButton: {
        position: "absolute",
        top: 50,
        left: 20,
        zIndex: 1000,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        borderRadius: 25,
        width: 50,
        height: 50,
        justifyContent: "center",
        alignItems: "center",
    },
    arView: {
        flex: 1,
    },
    loadingText: {
        color: "#FF8A00",
        fontSize: 16,
        marginTop: 10,
    },
    errorText: {
        color: "#FF0000",
        fontSize: 16,
        textAlign: "center",
        paddingHorizontal: 20,
    },
});
