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

export default function VerifyCode() {
    const { userEmail } = useLocalSearchParams<{ userEmail: string }>();
    const [code, setCode] = useState(["", "", "", ""]);
    const [isLoading, setIsLoading] = useState(false);

    const updateCode = (value: string, index: number) => {
        const newCode = [...code];
        newCode[index] = value;
        setCode(newCode);
    };

    const handleVerifyCode = async () => {
        if (isLoading) return;

        const fullCode = code.join("");
        if (fullCode.length !== 4) {
            Alert.alert("Invalid Code", "Please enter the 4-digit code.");
            return;
        }

        if (!userEmail) {
            Alert.alert("Error", "Email not found. Please try again.");
            return;
        }

        setIsLoading(true);

        try {
            const response = await apiClient.post("/VerifyPin", {
                email: userEmail,
                code: fullCode,
            });

            if (response.data.success) {
                router.push({
                    pathname: "/new-password",
                    params: { userEmail },
                });
            }
        } catch (err) {
            const error = err as AxiosError<{ message?: string; error?: string }>;
            const fromServer =
                (error.response?.data as any)?.error ||
                (error.response?.data as any)?.message;
            const message = fromServer || error.message || "Unknown error";

            Alert.alert("Verification Failed", message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            {/* Back button */}
            <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
                <Text style={styles.backArrow}>←</Text>
            </TouchableOpacity>

            {/* Lock Icon */}
            <View style={styles.lockContainer}>
                <Text style={styles.lockIcon}>🔒</Text>
            </View>

            {/* Title */}
            <Text style={styles.title}>
                Verify the code sent{"\n"}in your email
            </Text>

            {/* Code Input Boxes */}
            <View style={styles.codeRow}>
                {code.map((digit, index) => (
                    <TextInput
                        key={index}
                        value={digit}
                        style={styles.codeBox}
                        keyboardType="number-pad"
                        maxLength={1}
                        onChangeText={(v) => updateCode(v, index)}
                    />
                ))}
            </View>

            {/* Confirm Button */}
            <TouchableOpacity
                style={styles.confirmButton}
                onPress={handleVerifyCode}
                disabled={isLoading}
            >
                <Text style={styles.confirmText}>
                    {isLoading ? "Verifying..." : "Confirm"}
                </Text>
            </TouchableOpacity>

            <TouchableOpacity>
                <Text style={styles.resendText}>Resend code</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#FFFFFF",
        paddingHorizontal: 20,
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
    title: {
        textAlign: "center",
        color: "#FF8A00",
        fontSize: 26,
        fontWeight: "600",
        marginBottom: 40,
    },
    codeRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginHorizontal: 10,
        marginBottom: 40,
    },
    codeBox: {
        width: 55,
        height: 55,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: "#444",
        textAlign: "center",
        fontSize: 22,
    },
    confirmButton: {
        borderRadius: 18,
        borderWidth: 1.5,
        borderColor: "#FF8A00",
        paddingVertical: 12,
        alignItems: "center",
        marginBottom: 20,
    },
    confirmText: {
        color: "#FF8A00",
        fontSize: 18,
        fontWeight: "500",
    },
    resendText: {
        textAlign: "center",
        color: "#FF8A00",
        fontSize: 14,
    },
});
