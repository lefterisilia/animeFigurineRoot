import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { router } from "expo-router";

export default function PasswordUpdated() {
    return (
        <View style={styles.container}>

            {/* Big checkmark circle */}
            <View style={styles.checkCircle}>
                <Text style={styles.checkIcon}>✔</Text>
            </View>

            <Text style={styles.title}>Password{"\n"}Updated</Text>

            <Text style={styles.subtitle}>Your password has been updated!</Text>

            {/* Login button */}
            <TouchableOpacity
                style={styles.loginButton}
                onPress={() => router.push("/login")}
            >
                <Text style={styles.loginText}>Login</Text>
            </TouchableOpacity>

        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#FFF",
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: 20,
    },
    checkCircle: {
        width: 170,
        height: 170,
        borderRadius: 85,
        backgroundColor: "black",
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 30,
    },
    checkIcon: {
        fontSize: 90,
        color: "white",
    },
    title: {
        color: "#FF8A00",
        fontSize: 34,
        fontWeight: "bold",
        textAlign: "center",
        lineHeight: 36,
        marginBottom: 15,
    },
    subtitle: {
        color: "#444",
        fontSize: 16,
        marginBottom: 50,
        textAlign: "center",
    },
    loginButton: {
        width: "70%",
        paddingVertical: 14,
        borderRadius: 20,
        borderWidth: 1.5,
        borderColor: "#FF8A00",
        alignItems: "center",
    },
    loginText: {
        fontSize: 18,
        color: "#FF8A00",
        fontWeight: "500",
    },
});
