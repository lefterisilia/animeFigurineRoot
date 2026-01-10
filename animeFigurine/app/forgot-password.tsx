import React, {useCallback, useState} from "react";
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet, Alert,
} from "react-native";
import { router } from "expo-router";
import {apiClient} from "@/lib/apiClient";
import {AxiosError} from "axios";




export default function ForgotPassword() {
    const [isLoading, setIsLoading] = useState(false);
    const [serverMessage, setServerMessage] = useState<string | null>(null);
    const [serverMessageType, setServerMessageType] = useState<"error" | "success" | null>(null);
    const [email, setEmail] = useState("");


    const handleSendPin = useCallback(async (): Promise<void> => {
        if (isLoading) return;

        if (!email) {
            Alert.alert("Missing info", "Please enter both email and password.");
            return;
        }

        setIsLoading(true);
        setServerMessage(null);
        setServerMessageType(null);

        try {
            const response = await apiClient.post("/SendPin", { email });
            console.log(response.data);

            setServerMessage("Login successful");
            setServerMessageType("success");

            router.push({
                pathname: "/verify-code",
                params: { userEmail: email },
            });
        } catch (err) {
            const error = err as AxiosError<{ message?: string; error?: string }>;
            const fromServer =
                (error.response?.data as any)?.error ||
                (error.response?.data as any)?.message;
            const message = fromServer || error.message || "Unknown error";

            setServerMessage(message);
            setServerMessageType("error");
        } finally {
            setIsLoading(false);
        }
    }, [email, isLoading]);

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
                    value={email}
                    onChangeText={setEmail}
                />
            </View>

            <TouchableOpacity
                style={styles.sendButton}
                onPress={handleSendPin}
                disabled={isLoading}
            >
                <Text style={styles.sendText}>
                    {isLoading ? "Sending..." : "Send"}
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
