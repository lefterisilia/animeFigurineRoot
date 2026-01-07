import React, { useCallback, useState } from "react";
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    Image,
    StyleSheet,
    Alert,
    KeyboardAvoidingView,
    Platform,
} from "react-native";
import { router } from "expo-router";
import { apiClient } from "@/lib/apiClient";
import { AxiosError } from "axios";

export default function SignUp() {
    const [showPassword, setShowPassword] = useState(false);
    const [fullName, setFullName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const [serverMessage, setServerMessage] = useState<string | null>(null);
    const [serverMessageType, setServerMessageType] = useState<"error" | "success" | null>(null);

    const handleSignUp = useCallback(async (): Promise<void> => {
        if (isLoading) return;

        if (!fullName || !email || !password || !confirmPassword) {
            Alert.alert("Missing info", "Please fill all fields.");
            return;
        }

        if (password !== confirmPassword) {
            Alert.alert("Password mismatch", "Passwords do not match.");
            return;
        }

        setIsLoading(true);
        setServerMessage(null);
        setServerMessageType(null);

        try {
            const response = await apiClient.post("/signup", {
                name: fullName,
                email,
                password,
            });

            setServerMessage("Account created successfully.");
            setServerMessageType("success");

            // Navigate to main area (or login) after success
            router.push("/tabs/home");
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
    }, [fullName, email, password, confirmPassword, isLoading]);

    return (
        <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
            <View style={styles.appWrap}>
                <View style={styles.topHeader}>
                    <Image
                        source={require("../assets/logo.png")}
                        style={styles.logo}
                        resizeMode="contain"
                    />
                </View>

                <View style={styles.panel}>
                    <Text style={styles.title}>Create account</Text>

                    <TextInput
                        style={styles.input}
                        placeholder="Full name"
                        placeholderTextColor="#666"
                        value={fullName}
                        onChangeText={setFullName}
                        editable={!isLoading}
                    />

                    <TextInput
                        style={styles.input}
                        placeholder="Email"
                        placeholderTextColor="#666"
                        keyboardType="email-address"
                        value={email}
                        onChangeText={setEmail}
                        editable={!isLoading}
                    />

                    <View style={styles.passwordRow}>
                        <TextInput
                            style={styles.passwordField}
                            placeholder="Password"
                            placeholderTextColor="#666"
                            secureTextEntry={!showPassword}
                            value={password}
                            onChangeText={setPassword}
                            editable={!isLoading}
                            returnKeyType="next"
                        />
                        <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                            <Text style={styles.eye}>👁️</Text>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.passwordRow}>
                        <TextInput
                            style={styles.passwordField}
                            placeholder="Confirm password"
                            placeholderTextColor="#666"
                            secureTextEntry={!showPassword}
                            value={confirmPassword}
                            onChangeText={setConfirmPassword}
                            editable={!isLoading}
                            returnKeyType="done"
                            onSubmitEditing={handleSignUp}
                        />
                    </View>

                    <View style={styles.linksRow}>
                        <TouchableOpacity onPress={() => router.push("/login")}>
                            <Text style={styles.linkText}>Already have an account? Log in</Text>
                        </TouchableOpacity>
                    </View>

                    {serverMessage && (
                        <View
                            style={[
                                styles.message,
                                serverMessageType === "error" ? styles.msgError : styles.msgSuccess,
                            ]}
                        >
                            <Text style={styles.messageText}>{serverMessage}</Text>
                        </View>
                    )}

                    <TouchableOpacity
                        style={[styles.actionBtn, isLoading && styles.disabledBtn]}
                        onPress={handleSignUp}
                        disabled={isLoading}
                    >
                        <Text style={styles.actionText}>{isLoading ? "Creating..." : "Sign Up"}</Text>
                    </TouchableOpacity>
                </View>

                <Text style={styles.footer}>Developed by ACSC423 students</Text>
            </View>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    appWrap: {
        flex: 1,
        backgroundColor: "#fff",
        alignItems: "center",
    },
    topHeader: {
        backgroundColor: "#FF8A00",
        width: "100%",
        height: 250,
        alignItems: "center",
        justifyContent: "center",
        borderBottomLeftRadius: 36,
        borderBottomRightRadius: 36,
    },
    logo: {
        width: 200,
        height: 80,
    },
    panel: {
        flex: 1,
        width: "100%",
        backgroundColor: "#fff",
        borderTopLeftRadius: 22,
        borderTopRightRadius: 22,
        padding: 36,
        alignItems: "center",
        marginTop: -36,
    },
    title: {
        fontSize: 30,
        fontWeight: "700",
        marginBottom: 18,
    },
    input: {
        width: "100%",
        backgroundColor: "#eee",
        borderRadius: 12,
        padding: 12,
        marginBottom: 12,
        fontSize: 16,
    },
    passwordRow: {
        width: "100%",
        flexDirection: "row",
        backgroundColor: "#eee",
        borderRadius: 12,
        paddingHorizontal: 12,
        alignItems: "center",
        marginBottom: 10,
    },
    passwordField: {
        flex: 1,
        fontSize: 16,
        paddingVertical: 12,
    },
    eye: {
        fontSize: 20,
        color: "#555",
    },
    linksRow: {
        width: "100%",
        alignItems: "flex-end",
        marginVertical: 18,
    },
    linkText: {
        color: "#9c9393",
        fontSize: 14,
        fontWeight: "600",
    },
    actionBtn: {
        marginTop: 6,
        width: "100%",
        paddingVertical: 12,
        borderRadius: 14,
        borderWidth: 2,
        borderColor: "#FF8A00",
        alignItems: "center",
    },
    disabledBtn: {
        opacity: 0.7,
    },
    actionText: {
        fontSize: 18,
        color: "#FF8A00",
        fontWeight: "700",
    },
    message: {
        width: "100%",
        marginTop: 8,
        marginBottom: 8,
        borderRadius: 8,
        paddingVertical: 10,
        paddingHorizontal: 12,
        borderWidth: 1,
    },
    msgError: {
        backgroundColor: "#fde7e7",
        borderColor: "#f5b5b5",
    },
    msgSuccess: {
        backgroundColor: "#e9f7ef",
        borderColor: "#b9e6cd",
    },
    messageText: {
        color: "#333",
        fontSize: 13,
    },
    footer: {
        position: "absolute",
        bottom: 50,
        color: "#000",
    },
});
