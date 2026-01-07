import React from "react";
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity } from "react-native";
import { useCart } from "@/hooks/useCart";
import { Ionicons } from "@expo/vector-icons";

export default function BasketScreen() {
    const { items, removeFromCart } = useCart();

    const totalPrice = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    const renderItem = ({ item }: { item: any }) => (
        <View style={styles.cartItem}>
            <Image source={{ uri: item.image_url }} style={styles.itemImage} resizeMode="contain" />
            <View style={styles.itemDetails}>
                <Text style={styles.itemName}>{item.name}</Text>
                <Text style={styles.itemPrice}>{item.price} EUR x {item.quantity}</Text>
            </View>
            <TouchableOpacity onPress={() => removeFromCart(item.id)}>
                <Ionicons name="trash-outline" size={24} color="red" />
            </TouchableOpacity>
        </View>
    );

    return (
        <View style={styles.container}>
            <Text style={styles.title}>My Basket</Text>

            {items.length === 0 ? (
                <View style={styles.emptyContainer}>
                    <Ionicons name="cart-outline" size={80} color="#ccc" />
                    <Text style={styles.emptyText}>Your basket is empty</Text>
                </View>
            ) : (
                <>
                    <FlatList
                        data={items}
                        keyExtractor={(item) => item.id}
                        renderItem={renderItem}
                        contentContainerStyle={styles.listContent}
                    />
                    <View style={styles.footer}>
                        <View style={styles.totalRow}>
                            <Text style={styles.totalLabel}>Total:</Text>
                            <Text style={styles.totalValue}>{totalPrice.toFixed(2)} EUR</Text>
                        </View>
                        <TouchableOpacity style={styles.checkoutButton}>
                            <Text style={styles.checkoutText}>Checkout</Text>
                        </TouchableOpacity>
                    </View>
                </>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#fff", paddingTop: 60 },
    title: { fontSize: 24, fontWeight: "bold", textAlign: "center", marginBottom: 20 },
    listContent: { paddingHorizontal: 20, paddingBottom: 100 },
    cartItem: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#f9f9f9",
        padding: 15,
        borderRadius: 15,
        marginBottom: 15,
    },
    itemImage: { width: 60, height: 60, borderRadius: 10 },
    itemDetails: { flex: 1, marginLeft: 15 },
    itemName: { fontSize: 16, fontWeight: "600" },
    itemPrice: { fontSize: 14, color: "#666", marginTop: 4 },
    emptyContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
    emptyText: { fontSize: 18, color: "#999", marginTop: 10 },
    footer: {
        padding: 20,
        borderTopWidth: 1,
        borderColor: "#eee",
        backgroundColor: "#fff",
        paddingBottom: 120, // Space for custom tab bar
    },
    totalRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 20 },
    totalLabel: { fontSize: 18, fontWeight: "600" },
    totalValue: { fontSize: 20, fontWeight: "bold", color: "#FF8A00" },
    checkoutButton: {
        backgroundColor: "#FF8A00",
        paddingVertical: 15,
        borderRadius: 15,
        alignItems: "center",
    },
    checkoutText: { color: "#fff", fontSize: 18, fontWeight: "bold" },
});
