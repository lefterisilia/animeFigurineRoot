// app/order-history.tsx
import React, { useEffect, useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    ActivityIndicator,
    Image,
    TouchableOpacity,
} from "react-native";
import { router } from "expo-router";
import { getUser } from "@/lib/authStorage";

const API_URL = "http://192.168.1.6:4000";

interface Product {
    order_product_id: number;
    productid: number;
    name: string;
    price: number;
    image_url: string;
    description: string;
}

interface Order {
    id: number;
    userid: number;
    date: string;
    status: string;
    total: number;
    address: string;
    city: string;
    postalcode: string;
    notes: string;
    products: Product[];
}

export default function OrderHistoryScreen() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        try {
            setLoading(true);
            setError(null);

            const user = await getUser();
            if (!user || !user.id) {
                setError("User not found. Please log in.");
                setLoading(false);
                return;
            }

            const response = await fetch(`${API_URL}/orders/${user.id}`);
            const data = await response.json();

            if (response.ok) {
                setOrders(data.orders || []);
            } else {
                setError(data.error || "Failed to fetch orders");
            }
        } catch (err) {
            console.error("Error fetching orders:", err);
            setError("Failed to load orders. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
        });
    };

    const formatPrice = (price: number) => {
        return `$${price.toFixed(2)}`;
    };

    if (loading) {
        return (
            <View style={styles.centerContainer}>
                <ActivityIndicator size="large" color="#FF8A00" />
                <Text style={styles.loadingText}>Loading orders...</Text>
            </View>
        );
    }

    if (error) {
        return (
            <View style={styles.centerContainer}>
                <Text style={styles.errorText}>{error}</Text>
                <TouchableOpacity
                    style={styles.retryButton}
                    onPress={fetchOrders}
                >
                    <Text style={styles.retryButtonText}>Retry</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity
                    onPress={() => router.back()}
                    style={styles.backButton}
                >
                    <Text style={styles.backButtonText}>← Back</Text>
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Order History</Text>
            </View>

            <ScrollView style={styles.scrollView}>
                {orders.length === 0 ? (
                    <View style={styles.emptyContainer}>
                        <Text style={styles.emptyText}>No orders yet</Text>
                        <Text style={styles.emptySubtext}>
                            Your order history will appear here
                        </Text>
                    </View>
                ) : (
                    orders.map((order) => (
                        <View key={order.id} style={styles.orderCard}>
                            {/* Order Header */}
                            <View style={styles.orderHeader}>
                                <View>
                                    <Text style={styles.orderIdText}>
                                        Order #{order.id}
                                    </Text>
                                    <Text style={styles.orderDateText}>
                                        {formatDate(order.date)}
                                    </Text>
                                </View>
                                <View style={styles.statusBadge}>
                                    <Text style={styles.statusText}>
                                        {order.status}
                                    </Text>
                                </View>
                            </View>

                            {/* Shipping Address */}
                            <View style={styles.addressSection}>
                                <Text style={styles.sectionLabel}>
                                    Shipping Address:
                                </Text>
                                <Text style={styles.addressText}>
                                    {order.address}
                                </Text>
                                <Text style={styles.addressText}>
                                    {order.city}, {order.postalcode}
                                </Text>
                                {order.notes && (
                                    <Text style={styles.notesText}>
                                        Note: {order.notes}
                                    </Text>
                                )}
                            </View>

                            {/* Products */}
                            <View style={styles.productsSection}>
                                <Text style={styles.sectionLabel}>Items:</Text>
                                {order.products.map((product) => (
                                    <View
                                        key={product.order_product_id}
                                        style={styles.productItem}
                                    >
                                        <Image
                                            source={{ uri: product.image_url }}
                                            style={styles.productImage}
                                        />
                                        <View style={styles.productInfo}>
                                            <Text style={styles.productName}>
                                                {product.name}
                                            </Text>
                                            <Text style={styles.productPrice}>
                                                {formatPrice(product.price)}
                                            </Text>
                                        </View>
                                    </View>
                                ))}
                            </View>

                            {/* Order Total */}
                            <View style={styles.totalSection}>
                                <Text style={styles.totalLabel}>Total:</Text>
                                <Text style={styles.totalAmount}>
                                    {formatPrice(order.total)}
                                </Text>
                            </View>
                        </View>
                    ))
                )}
            </ScrollView>
        </View>
    );
}

const ORANGE = "#FF8A00";

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#F5F5F5",
    },
    centerContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#F5F5F5",
        padding: 20,
    },
    header: {
        backgroundColor: "#FFFFFF",
        paddingTop: 50,
        paddingBottom: 15,
        paddingHorizontal: 20,
        borderBottomWidth: 1,
        borderBottomColor: "#E0E0E0",
        flexDirection: "row",
        alignItems: "center",
    },
    backButton: {
        marginRight: 15,
    },
    backButtonText: {
        fontSize: 16,
        color: ORANGE,
        fontWeight: "600",
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: "700",
        color: "#000",
    },
    scrollView: {
        flex: 1,
        padding: 15,
    },
    loadingText: {
        marginTop: 10,
        fontSize: 16,
        color: "#666",
    },
    errorText: {
        fontSize: 16,
        color: "#FF4444",
        textAlign: "center",
        marginBottom: 20,
    },
    retryButton: {
        backgroundColor: ORANGE,
        paddingVertical: 12,
        paddingHorizontal: 30,
        borderRadius: 8,
    },
    retryButtonText: {
        color: "#000",
        fontSize: 16,
        fontWeight: "600",
    },
    emptyContainer: {
        alignItems: "center",
        marginTop: 60,
    },
    emptyText: {
        fontSize: 18,
        fontWeight: "600",
        color: "#666",
        marginBottom: 8,
    },
    emptySubtext: {
        fontSize: 14,
        color: "#999",
    },
    orderCard: {
        backgroundColor: "#FFFFFF",
        borderRadius: 12,
        padding: 16,
        marginBottom: 15,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    orderHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "flex-start",
        marginBottom: 12,
        paddingBottom: 12,
        borderBottomWidth: 1,
        borderBottomColor: "#F0F0F0",
    },
    orderIdText: {
        fontSize: 16,
        fontWeight: "700",
        color: "#000",
        marginBottom: 4,
    },
    orderDateText: {
        fontSize: 13,
        color: "#666",
    },
    statusBadge: {
        backgroundColor: ORANGE,
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 6,
    },
    statusText: {
        fontSize: 12,
        fontWeight: "600",
        color: "#000",
        textTransform: "uppercase",
    },
    addressSection: {
        marginBottom: 12,
        paddingBottom: 12,
        borderBottomWidth: 1,
        borderBottomColor: "#F0F0F0",
    },
    sectionLabel: {
        fontSize: 13,
        fontWeight: "600",
        color: "#444",
        marginBottom: 6,
    },
    addressText: {
        fontSize: 14,
        color: "#666",
        marginBottom: 2,
    },
    notesText: {
        fontSize: 13,
        color: "#888",
        fontStyle: "italic",
        marginTop: 4,
    },
    productsSection: {
        marginBottom: 12,
    },
    productItem: {
        flexDirection: "row",
        alignItems: "center",
        marginTop: 8,
        padding: 8,
        backgroundColor: "#F9F9F9",
        borderRadius: 8,
    },
    productImage: {
        width: 60,
        height: 60,
        borderRadius: 8,
        backgroundColor: "#E0E0E0",
    },
    productInfo: {
        flex: 1,
        marginLeft: 12,
    },
    productName: {
        fontSize: 14,
        fontWeight: "600",
        color: "#000",
        marginBottom: 4,
    },
    productPrice: {
        fontSize: 14,
        color: ORANGE,
        fontWeight: "600",
    },
    totalSection: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: "#F0F0F0",
    },
    totalLabel: {
        fontSize: 16,
        fontWeight: "700",
        color: "#000",
    },
    totalAmount: {
        fontSize: 18,
        fontWeight: "700",
        color: ORANGE,
    },
});
