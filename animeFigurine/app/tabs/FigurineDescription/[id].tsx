import React, { useEffect, useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    Image,
    ActivityIndicator,
    ScrollView,
    TouchableOpacity,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { apiClient } from "@/lib/apiClient";
import { useCart } from "@/hooks/useCart"; // Import the hook


type Figurine = {
    id: string;
    name: string;
    price: number;
    description: string | null;
    image_url: string | null;
};

export default function FigurineDescription() {
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const [figure, setFigure] = useState<Figurine | null>(null);
    const [loading, setLoading] = useState(true);
    const { addToCart } = useCart(); // Use the hook

    useEffect(() => {
        const fetchDetail = async () => {
            try {
                const response = await apiClient.get<Figurine>(`/figurines/${id}`);
                setFigure(response.data);
            } catch (error) {
                console.error("Error loading figurine details:", error);
            } finally {
                setLoading(false);
            }
        };

        if (id) fetchDetail();
    }, [id]);

    if (loading) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" color="#FF8A00" />
            </View>
        );
    }

    if (!figure) {
        return (
            <View style={styles.center}>
                <Text>Figurine not found.</Text>
            </View>
        );
    }

    return (
        <ScrollView style={styles.container}>
            {/* Custom Header with Back Button */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="black" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Details</Text>
                <View style={{ width: 24 }} />
            </View>

            {/* Image Section */}
            <View style={styles.imageContainer}>
                {figure.image_url ? (
                    <Image
                        source={{ uri: figure.image_url }}
                        style={styles.image}
                        resizeMode="contain"
                    />
                ) : (
                    <View style={[styles.image, styles.placeholder]}>
                        <Text>No Image Available</Text>
                    </View>
                )}
            </View>

            {/* Content Section */}
            <View style={styles.detailsBox}>
                <Text style={styles.name}>{figure.name}</Text>
                <Text style={styles.price}>{figure.price} EUR</Text>

                <View style={styles.divider} />

                <Text style={styles.descriptionTitle}>Description</Text>
                <Text style={styles.descriptionText}>
                    {figure.description || "No description provided for this figurine."}
                </Text>

                <TouchableOpacity
                    style={styles.buyButton}
                    onPress={() => {
                        addToCart(figure);
                        router.push("/tabs/basket");
                    }}
                >
                    <Text style={styles.buyButtonText}>Add to Cart</Text>
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
}

const ORANGE = "#FF8A00";

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#fff" },
    center: { flex: 1, justifyContent: "center", alignItems: "center" },
    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingTop: 60,
        paddingHorizontal: 20,
        paddingBottom: 20,
    },
    backButton: { padding: 5 },
    headerTitle: { fontSize: 18, fontWeight: "600" },
    imageContainer: {
        width: "100%",
        height: 350,
        backgroundColor: "#f9f9f9",
        justifyContent: "center",
        alignItems: "center",
    },
    image: { width: "90%", height: "90%" },
    placeholder: { justifyContent: "center", alignItems: "center", backgroundColor: "#eee" },
    detailsBox: {
        padding: 25,
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30,
        marginTop: -30,
        backgroundColor: "#fff",
        flex: 1,
    },
    name: { fontSize: 24, fontWeight: "bold", color: "#333" },
    price: { fontSize: 20, color: ORANGE, fontWeight: "700", marginTop: 8 },
    divider: { height: 1, backgroundColor: "#eee", marginVertical: 20 },
    descriptionTitle: { fontSize: 18, fontWeight: "600", marginBottom: 10 },
    descriptionText: { fontSize: 15, color: "#666", lineHeight: 22 },
    buyButton: {
        backgroundColor: ORANGE,
        paddingVertical: 15,
        borderRadius: 15,
        alignItems: "center",
        marginTop: 30,
    },
    buyButtonText: { color: "#fff", fontSize: 18, fontWeight: "bold" },
});
