// app/(tabs)/home.tsx
import React, { useEffect, useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    Image,
    TextInput,
    TouchableOpacity,
    FlatList,
    ActivityIndicator,
} from "react-native";
import { Feather, Ionicons } from "@expo/vector-icons";
import { apiClient } from "@/lib/apiClient";

type Figurine = {
    id: string;
    name: string;
    price: number;
    image_url: string | null;
    description: string | null;
};

export default function HomeScreen() {
    const [figures, setFigures] = useState<Figurine[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadFigures = async () => {
            try {
                // axios call to your backend
                const response = await apiClient.get<Figurine[]>("/figurines");
                setFigures(response.data);
            } catch (error) {
                console.error("Error loading figurines:", error);
            } finally {
                setLoading(false);
            }
        };

        loadFigures();
    }, []);

    if (loading) {
        return (
            <View style={styles.center}>
                <ActivityIndicator />
                <Text style={{ marginTop: 8 }}>Loading figurines...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {/* Top content */}
            <View style={styles.topContent}>
                {/* Logo + cart */}
                <View style={styles.headerRow}>
                    <Image
                        source={require("../../assets/logo.png")} // your logo path
                        style={styles.logo}
                        resizeMode="contain"
                    />
                    <TouchableOpacity onPress={() => {}}>
                        <Ionicons name="cart-outline" size={26} />
                    </TouchableOpacity>
                </View>

                {/* Search bar */}
                <View style={styles.searchBar}>
                    <Feather name="search" size={20} style={styles.searchIcon} />
                    <TextInput
                        placeholder="Search"
                        style={styles.searchInput}
                        placeholderTextColor="#777"
                    />
                </View>

                {/* Section title */}
                <View style={styles.sectionHeader}>
                    <View style={{ flex: 1 }}>
                        <Text style={styles.sectionTitle}>New Figures</Text>
                        <View style={styles.sectionUnderline} />
                    </View>
                    <TouchableOpacity>
                        <Text style={styles.viewAll}>View All</Text>
                    </TouchableOpacity>
                </View>
            </View>

            {/* Figurines list */}
            <FlatList
                contentContainerStyle={{
                    paddingHorizontal: 20,
                    paddingBottom: 120, // space for bottom nav
                }}
                data={figures}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                    <View style={styles.figureCard}>
                        {item.image_url ? (
                            <Image
                                source={{ uri: item.image_url }}
                                style={styles.figureImage}
                                resizeMode="contain"
                            />
                        ) : (
                            <View style={[styles.figureImage, styles.placeholderImage]}>
                                <Text>No Image</Text>
                            </View>
                        )}

                        <Text style={styles.figureTitle}>{item.name}</Text>
                        {item.description ? (
                            <Text style={styles.figureDescription}>{item.description}</Text>
                        ) : null}
                        <Text style={styles.price}>{item.price?.toFixed(2)} EUR</Text>
                    </View>
                )}
            />
        </View>
    );
}

const ORANGE = "#FF8A00";

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#FFFFFF",
    },
    topContent: {
        paddingTop: 50,
        paddingHorizontal: 20,
    },
    headerRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 20,
    },
    logo: {
        width: 160,
        height: 50,
    },
    searchBar: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#E5E5E5",
        borderRadius: 25,
        paddingHorizontal: 16,
        paddingVertical: 8,
        marginBottom: 25,
    },
    searchIcon: {
        marginRight: 8,
    },
    searchInput: {
        flex: 1,
        fontSize: 16,
    },
    sectionHeader: {
        flexDirection: "row",
        alignItems: "flex-end",
        justifyContent: "space-between",
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 22,
        color: ORANGE,
        textAlign: "center",
        fontWeight: "600",
    },
    sectionUnderline: {
        marginTop: 4,
        height: 1,
        backgroundColor: ORANGE,
    },
    viewAll: {
        backgroundColor: ORANGE,
        color: "#FFF",
        paddingVertical: 4,
        paddingHorizontal: 12,
        borderRadius: 16,
        fontSize: 12,
    },
    figureCard: {
        alignItems: "center",
        marginBottom: 30,
    },
    figureImage: {
        width: 230,
        height: 230,
        marginBottom: 10,
    },
    placeholderImage: {
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#EEE",
    },
    figureTitle: {
        textAlign: "center",
        fontSize: 14,
        fontWeight: "600",
    },
    figureDescription: {
        textAlign: "center",
        fontSize: 12,
        marginTop: 4,
    },
    price: {
        fontSize: 16,
        fontWeight: "600",
        marginTop: 4,
    },
    center: { flex: 1, justifyContent: "center", alignItems: "center" },
});
