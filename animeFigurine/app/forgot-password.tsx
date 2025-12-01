import React from "react";
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
} from "react-native";
import { router } from "expo-router";
// dadad
export default function ForgotPassword() {
    return (
        <View style={styles.container}>
            <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
                <Text style={styles.backArrow}>←</Text>
            </TouchableOpacity>

            <View style={styles.lockContainer}>
                <Text style={styles.lockIcon}>🔒</Text>
            </View>

            <Text style={styles.titleOrange}>Forgot</Text>
            <Text style={styles.titleOrange}>Password</Text>

            <Text style={styles.subtitle}>
                Provide your account’s email for which you want{"\n"}
                to reset the password
            </Text>

            <View style={styles.inputContainer}>
                <Text style={styles.mailIcon}>✉️</Text>
                <TextInput
                    style={styles.input}
                    placeholder="Email"
                    keyboardType="email-address"
                />
            </View>

            <TouchableOpacity
                style={styles.sendButton}
                onPress={() => router.push("/verify-code")}
            >
                <Text style={styles.sendText}>Send</Text>
            </TouchableOpacity>
        </View>
    );
}

const ORANGE = "#FF8A00";

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#FFFFFF",
        paddingHorizontal: 24,
        paddingTop: 60,
    },
    backButton: {
        marginBottom: 20,
    },
    backArrow: {
        fontSize: 26,
    },
    lockContainer: {
        alignSelf: "center",
        marginBottom: 20,
    },
    lockIcon: {
        fontSize: 90,
    },
    titleOrange: {
        color: ORANGE,
        fontSize: 32,
        textAlign: "center",
        fontWeight: "600",
        lineHeight: 36,
    },
    subtitle: {
        marginTop: 12,
        textAlign: "center",
        fontSize: 14,
        color: "#222",
    },
    inputContainer: {
        flexDirection: "row",
        alignItems: "center",
        marginTop: 40,
        borderRadius: 18,
        borderWidth: 1,
        borderColor: "#999",
        paddingHorizontal: 14,
        paddingVertical: 10,
    },
    mailIcon: {
        fontSize: 20,
        marginRight: 8,
    },
    input: {
        flex: 1,
        fontSize: 16,
    },
    sendButton: {
        marginTop: 30,
        borderRadius: 18,
        borderWidth: 1.5,
        borderColor: ORANGE,
        paddingVertical: 12,
        alignItems: "center",
    },
    sendText: {
        color: ORANGE,
        fontSize: 18,
        fontWeight: "500",
    },
});
