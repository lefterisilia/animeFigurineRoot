import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity, Modal, TextInput, Alert, ScrollView } from "react-native";
import { useCart } from "@/hooks/useCart";
import { Ionicons } from "@expo/vector-icons";
import { getUser } from "@/lib/authStorage";
import { apiClient } from "@/lib/apiClient";

export default function BasketScreen() {
    const { items, removeFromCart, clearCart, update } = useCart();
    const [showCheckoutModal, setShowCheckoutModal] = useState(false);
    const [showThankYouModal, setShowThankYouModal] = useState(false);
    const [user, setUser] = useState<any>(null);
    const [savedAddress, setSavedAddress] = useState<any>(null);
    const [address, setAddress] = useState("");
    const [city, setCity] = useState("");
    const [postalCode, setPostalCode] = useState("");
    const [notes, setNotes] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        const loadUser = async () => {
            const userData = await getUser();
            setUser(userData);
            
            // Load saved address if user exists
            if (userData?.id) {
                try {
                    const response = await apiClient.get(`/address/${userData.id}`);
                    if (response.data.address) {
                        setSavedAddress(response.data.address);
                    }
                } catch (error) {
                    console.error("Failed to load saved address:", error);
                }
            }
        };
        loadUser();
    }, []);

    useEffect(() => {
        const fetchCart = async () => {
            if (user?.id) {
                try {
                    const response = await apiClient.get(`/cart/${user.id}`);
                    const fetchedItems = response.data.items.map((item: any) => ({
                        id: item.id,
                        name: item.name,
                        price: item.price,
                        image_url: item.image_url,
                        quantity: 1
                    }));
                    update(fetchedItems);
                } catch (error) {
                    console.error("Failed to fetch cart from backend:", error);
                }
            }
        };
        fetchCart();
    }, [user]);

    const totalPrice = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    const handleCheckout = () => {
        if (!user) {
            Alert.alert("Error", "Please login to checkout");
            return;
        }
        setShowCheckoutModal(true);
    };

    const handleSubmitAddress = async () => {
        if (!address || !city || !postalCode) {
            Alert.alert("Error", "Please fill in all required fields");
            return;
        }

        setIsSubmitting(true);
        try {
            await apiClient.post("/order/create", {
                userid: user.id,
                address,
                city,
                postalcode: postalCode,
                notes,
                cartItems: items,
                total: totalPrice
            });

            // Clear the cart from frontend
            clearCart();
            
            setShowCheckoutModal(false);
            setShowThankYouModal(true);
            // Clear form
            setAddress("");
            setCity("");
            setPostalCode("");
            setNotes("");
        } catch (error) {
            console.error("Failed to create order:", error);
            Alert.alert("Error", "Failed to process order. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const loadSavedAddress = () => {
        if (savedAddress) {
            setAddress(savedAddress.address || "");
            setCity(savedAddress.city || "");
            setPostalCode(savedAddress.postalcode || "");
            setNotes(savedAddress.notes || "");
        }
    };

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
                        <TouchableOpacity style={styles.checkoutButton} onPress={handleCheckout}>
                            <Text style={styles.checkoutText}>Checkout</Text>
                        </TouchableOpacity>
                    </View>
                </>
            )}

            {/* Checkout Modal */}
            <Modal
                visible={showCheckoutModal}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setShowCheckoutModal(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Shipping Address</Text>
                            <TouchableOpacity onPress={() => setShowCheckoutModal(false)}>
                                <Ionicons name="close" size={28} color="#333" />
                            </TouchableOpacity>
                        </View>

                        <ScrollView style={styles.formContainer}>
                            {savedAddress && (
                                <View style={styles.savedAddressBox}>
                                    <View style={styles.savedAddressHeader}>
                                        <Text style={styles.savedAddressTitle}>Saved Address</Text>
                                        <TouchableOpacity 
                                            style={styles.useSavedButton}
                                            onPress={loadSavedAddress}
                                            disabled={isSubmitting}
                                        >
                                            <Text style={styles.useSavedButtonText}>Use This Address</Text>
                                        </TouchableOpacity>
                                    </View>
                                    <Text style={styles.savedAddressText}>{savedAddress.address}</Text>
                                    <Text style={styles.savedAddressText}>{savedAddress.city}, {savedAddress.postalcode}</Text>
                                    {savedAddress.notes && (
                                        <Text style={styles.savedAddressNotes}>Notes: {savedAddress.notes}</Text>
                                    )}
                                </View>
                            )}

                            <Text style={styles.label}>Address *</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Enter your address"
                                value={address}
                                onChangeText={setAddress}
                                editable={!isSubmitting}
                            />

                            <Text style={styles.label}>City *</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Enter your city"
                                value={city}
                                onChangeText={setCity}
                                editable={!isSubmitting}
                            />

                            <Text style={styles.label}>Postal Code *</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Enter postal code"
                                value={postalCode}
                                onChangeText={setPostalCode}
                                keyboardType="numeric"
                                editable={!isSubmitting}
                            />

                            <Text style={styles.label}>Notes (Optional)</Text>
                            <TextInput
                                style={[styles.input, styles.notesInput]}
                                placeholder="Add delivery notes"
                                value={notes}
                                onChangeText={setNotes}
                                multiline
                                numberOfLines={3}
                                editable={!isSubmitting}
                            />

                            <TouchableOpacity
                                style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]}
                                onPress={handleSubmitAddress}
                                disabled={isSubmitting}
                            >
                                <Text style={styles.submitButtonText}>
                                    {isSubmitting ? "Processing..." : "Proceed to Payment"}
                                </Text>
                            </TouchableOpacity>
                        </ScrollView>
                    </View>
                </View>
            </Modal>

            {/* Thank You Modal */}
            <Modal
                visible={showThankYouModal}
                animationType="fade"
                transparent={true}
                onRequestClose={() => setShowThankYouModal(false)}
            >
                <View style={styles.thankYouOverlay}>
                    <View style={styles.thankYouContent}>
                        <Ionicons name="checkmark-circle" size={80} color="#4CAF50" />
                        <Text style={styles.thankYouTitle}>Thank you for your order!</Text>
                        <Text style={styles.thankYouMessage}>
                            Your order has been placed successfully and will be shipped soon.
                        </Text>
                        <TouchableOpacity
                            style={styles.thankYouButton}
                            onPress={() => setShowThankYouModal(false)}
                        >
                            <Text style={styles.thankYouButtonText}>Continue Shopping</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
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
    modalOverlay: {
        flex: 1,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        justifyContent: "flex-end",
    },
    modalContent: {
        backgroundColor: "#fff",
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        paddingTop: 20,
        maxHeight: "90%",
    },
    modalHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingHorizontal: 20,
        paddingBottom: 15,
        borderBottomWidth: 1,
        borderBottomColor: "#eee",
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: "bold",
        color: "#333",
    },
    formContainer: {
        padding: 20,
    },
    savedAddressBox: {
        backgroundColor: "#f0f8ff",
        borderRadius: 12,
        padding: 15,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: "#d0e8ff",
    },
    savedAddressHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 10,
    },
    savedAddressTitle: {
        fontSize: 16,
        fontWeight: "bold",
        color: "#333",
    },
    useSavedButton: {
        backgroundColor: "#FF8A00",
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 8,
    },
    useSavedButtonText: {
        color: "#fff",
        fontSize: 12,
        fontWeight: "600",
    },
    savedAddressText: {
        fontSize: 14,
        color: "#555",
        marginBottom: 4,
    },
    savedAddressNotes: {
        fontSize: 13,
        color: "#777",
        fontStyle: "italic",
        marginTop: 6,
    },
    label: {
        fontSize: 14,
        fontWeight: "600",
        color: "#333",
        marginBottom: 8,
        marginTop: 12,
    },
    input: {
        backgroundColor: "#f5f5f5",
        borderRadius: 10,
        paddingHorizontal: 15,
        paddingVertical: 12,
        fontSize: 16,
        borderWidth: 1,
        borderColor: "#e0e0e0",
    },
    notesInput: {
        height: 80,
        textAlignVertical: "top",
    },
    submitButton: {
        backgroundColor: "#FF8A00",
        paddingVertical: 15,
        borderRadius: 15,
        alignItems: "center",
        marginTop: 20,
        marginBottom: 30,
    },
    submitButtonDisabled: {
        backgroundColor: "#ccc",
    },
    submitButtonText: {
        color: "#fff",
        fontSize: 18,
        fontWeight: "bold",
    },
    thankYouOverlay: {
        flex: 1,
        backgroundColor: "rgba(0, 0, 0, 0.7)",
        justifyContent: "center",
        alignItems: "center",
    },
    thankYouContent: {
        backgroundColor: "#fff",
        borderRadius: 20,
        padding: 40,
        alignItems: "center",
        width: "85%",
        maxWidth: 400,
    },
    thankYouTitle: {
        fontSize: 24,
        fontWeight: "bold",
        color: "#333",
        marginTop: 20,
        marginBottom: 10,
        textAlign: "center",
    },
    thankYouMessage: {
        fontSize: 16,
        color: "#666",
        textAlign: "center",
        marginBottom: 30,
        lineHeight: 24,
    },
    thankYouButton: {
        backgroundColor: "#FF8A00",
        paddingVertical: 15,
        paddingHorizontal: 40,
        borderRadius: 15,
        alignItems: "center",
    },
    thankYouButtonText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "bold",
    },
});
