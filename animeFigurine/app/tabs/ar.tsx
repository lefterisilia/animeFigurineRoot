// app/(tabs)/ar.tsx
import React, { useState, useEffect } from "react";
import { View, StyleSheet, ActivityIndicator, Text } from "react-native";
import { useLocalSearchParams } from "expo-router";

export default function ARScreen() {
    const { glb } = useLocalSearchParams();
    const [ARComponent, setARComponent] = useState<React.ComponentType<any> | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let mounted = true;

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
        };
    }, []);

    if (error) {
        return (
            <View style={styles.container}>
                <Text style={styles.errorText}>{error}</Text>
            </View>
        );
    }

    if (isLoading || !ARComponent) {
        return (
            <View style={styles.container}>
                <ActivityIndicator size="large" color="#FF8A00" />
                <Text style={styles.loadingText}>Initializing AR...</Text>
            </View>
        );
    }

    return <ARComponent glbFileName={glb as string} />;
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#000",
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
