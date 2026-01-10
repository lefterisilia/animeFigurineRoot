import React, { useState } from "react";
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    Alert,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { apiClient } from "@/lib/apiClient";
import { AxiosError } from "axios";

export default function NewPassword() {
    const { userEmail } = useLocalSearchParams<{ userEmail: string }>();
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handleResetPassword = async () => {
        if (isLoading) return;

        if (!newPassword || !confirmPassword) {
            Alert.alert("Missing Info", "Please fill in all fields.");
            return;
        }

        if (newPassword !== confirmPassword) {
            Alert.alert("Password Mismatch", "Passwords do not match.");
            return;
        }

        if (newPassword.length < 6) {
            Alert.alert("Weak Password", "Password must be at least 6 characters.");
            return;
        }

        if (!userEmail) {
            Alert.alert("Error", "Email not found. Please try again.");
            return;
        }

        setIsLoading(true);

        try {
            const response = await apiClient.post("/ResetPassword", {
                email: userEmail,
                newPassword: newPassword,
            });

            if (response.status === 200) {
                router.push("/password-updated");
            }
        } catch (err) {
            const error = err as AxiosError<{ message?: string; error?: string }>;
            const fromServer =
                (error.response?.data as any)?.error ||
                (error.response?.data as any)?.message;
            const message = fromServer || error.message || "Unknown error";

            Alert.alert("Reset Failed", message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
                <Text style={styles.backArrow}>←</Text>
            </TouchableOpacity>

            <View style={styles.lockContainer}>
                <Text style={styles.lockIcon}>🔒</Text>
            </View>

            <Text style={styles.titleOrange}>New</Text>
            <Text style={styles.titleOrange}>Password</Text>

            <Text style={styles.subtitle}>
                Enter your new password
            </Text>

            <View style={styles.inputContainer}>
                <Text style={styles.icon}>🔑</Text>
                <TextInput
                    style={styles.input}
                    placeholder="New Password"
                    secureTextEntry
                    value={newPassword}
                    onChangeText={setNewPassword}
                />
            </View>

            <View style={styles.inputContainer}>
                <Text style={styles.icon}>🔑</Text>
                <TextInput
                    style={styles.input}
                    placeholder="Confirm Password"
                    secureTextEntry
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                />
            </View>

            <TouchableOpacity
                style={styles.resetButton}
                onPress={handleResetPassword}
                disabled={isLoading}
            >
                <Text style={styles.resetText}>
                    {isLoading ? "Resetting..." : "Reset Password"}
                </Text>
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
        marginBottom: 20,
    },
    inputContainer: {
        flexDirection: "row",
        alignItems: "center",
        marginTop: 20,
        borderRadius: 18,
        borderWidth: 1,
        borderColor: "#999",
        paddingHorizontal: 14,
        paddingVertical: 10,
    },
    icon: {
        fontSize: 20,
        marginRight: 8,
    },
    input: {
        flex: 1,
        fontSize: 16,
    },
    resetButton: {
        marginTop: 30,
        borderRadius: 18,
        borderWidth: 1.5,
        borderColor: ORANGE,
        paddingVertical: 12,
        alignItems: "center",
    },
    resetText: {
        color: ORANGE,
        fontSize: 18,
        fontWeight: "500",
    },
});
