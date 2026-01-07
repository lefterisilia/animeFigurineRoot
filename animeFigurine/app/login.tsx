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

export default function Login() {

    const [showPassword, setShowPassword] = useState(false);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const [serverMessage, setServerMessage] = useState<string | null>(null);
    const [serverMessageType, setServerMessageType] = useState<
        "error" | "success" | null
    >(null);

    const handleLogin = useCallback(async (): Promise<void> => {
        if (isLoading) return;

        if (!email || !password) {
            Alert.alert("Missing info", "Please enter both email and password.");
            return;
        }

        setIsLoading(true);
        setServerMessage(null);
        setServerMessageType(null);

        try {
            const response = await apiClient.post("/login", { email, password });
            console.log(response.data);

            setServerMessage("Login successful");
            setServerMessageType("success");

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
    }, [email, password, isLoading]);

    return (
        <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
            <View style={styles.container}>
                {/* Header */}
                <View style={styles.header}>
                    <Image
                        source={require("../assets/logo.png")}
                        style={styles.logo}
                        resizeMode="contain"
                    />
                </View>

                {/* Card now fills the rest */}
                <View style={styles.card}>
                    <Text style={styles.loginTitle}>Login</Text>

                    <TextInput
                        style={styles.input}
                        placeholder="Username"
                        placeholderTextColor="#666"
                        keyboardType="email-address"
                        value={email}
                        onChangeText={setEmail}
                        editable={!isLoading}
                    />

                    <View style={styles.passwordContainer}>
                        <TextInput
                            style={styles.passwordInput}
                            placeholder="Password"
                            placeholderTextColor="#666"
                            secureTextEntry={!showPassword}
                            value={password}
                            onChangeText={setPassword}
                            editable={!isLoading}
                            returnKeyType="done"
                            onSubmitEditing={handleLogin}
                        />
                        <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                            <Text style={styles.eye}>👁️</Text>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.optionsRow}>
                        <TouchableOpacity onPress={() => router.push("/forgot-password")}>
                            <Text>Forgot password?</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => router.push("/SignUp")}>
                            <Text style={styles.signupLink}>Dont have an account? Sign Up</Text>
                        </TouchableOpacity>
                    </View>


                    {serverMessage && (
                        <View
                            style={[
                                styles.messageBox,
                                serverMessageType === "error"
                                    ? styles.messageError
                                    : styles.messageSuccess,
                            ]}
                        >
                            <Text style={styles.messageText}>{serverMessage}</Text>
                        </View>
                    )}

                    <TouchableOpacity
                        style={styles.loginButton}
                        onPress={handleLogin}
                        disabled={isLoading}
                    >
                        <Text style={styles.loginButtonText}>
                            {isLoading ? "Loading..." : "Login"}
                        </Text>
                    </TouchableOpacity>

                    {/* Push signup to bottom */}
                </View>

                <Text style={styles.footer}>Developed by ACSC423 students</Text>
            </View>
        </KeyboardAvoidingView>
    );

}

const styles = StyleSheet.create({
    flex: { flex: 1 },
    flexGrow: { flexGrow: 1 },

    container: {
        flex: 1,
        alignItems: "center",
        backgroundColor: "#fff",
    },

    header: {
        backgroundColor: "#FF8A00",
        width: "100%",
        height: 260,
        alignItems: "center",
        justifyContent: "center",
        borderBottomLeftRadius: 40,
        borderBottomRightRadius: 40,
    },

    logo: {
        width: 200,
        height: 80,
    },

    card: {
        flex: 1,                // 🔑 fills remaining space
        width: "100%",
        backgroundColor: "#fff",
        borderTopLeftRadius: 25,
        borderTopRightRadius: 25,
        padding: 40,
        alignItems: "center",
        marginTop: -40,         // overlap header nicely
    },

    loginTitle: {
        fontSize: 32,
        fontWeight: "bold",
        marginBottom: 20,
    },
    loginTitleSmall: {
        fontSize: 28,
        marginBottom: 16,
    },

    input: {
        width: "100%",
        backgroundColor: "#ddd",
        borderRadius: 12,
        padding: 12,
        marginBottom: 12,
        fontSize: 16,
    },

    passwordContainer: {
        width: "100%",
        flexDirection: "row",
        backgroundColor: "#ddd",
        borderRadius: 12,
        paddingHorizontal: 12,
        alignItems: "center",
        marginBottom: 10,
    },
    passwordInput: {
        flex: 1,
        fontSize: 16,
        paddingVertical: 12,
    },
    eye: {
        fontSize: 20,
        color: "#555",
    },

    optionsRow: {
        width: "100%",
        justifyContent: "space-between",
        marginVertical: 25,

    },

    link: {
        color: "#FF8A00",
        fontSize: 14,
    },

    loginButton: {
        marginTop: 15,
        width: "100%",
        paddingVertical: 12,
        borderRadius: 15,
        borderWidth: 2,
        borderColor: "#FF8A00",
        alignItems: "center",
    },
    buttonDisabled: {
        opacity: 0.7,
    },
    loginButtonText: {
        fontSize: 20,
        color: "#FF8A00",
        fontWeight: "600",
    },
    btnTextMask: { fontSize: 20, fontWeight: "700", textAlign: "center" },

    messageBox: {
        width: "100%",
        marginTop: 8,
        marginBottom: 8,
        borderRadius: 8,
        paddingVertical: 10,
        paddingHorizontal: 12,
        borderWidth: 1,
    },
    messageError: {
        backgroundColor: "#fde7e7",
        borderColor: "#f5b5b5",
    },
    messageSuccess: {
        backgroundColor: "#e9f7ef",
        borderColor: "#b9e6cd",
    },
    messageText: {
        color: "#333",
        fontSize: 13,
    },

    signupRow: {
        flexDirection: "row",
        alignItems: "center",
        marginTop: 16,
    },
    signupText: {
        color: "#666",
        fontSize: 14,
    },
    signupLink: {
        color: "#9c9393",
        fontSize: 14,
        fontWeight: "700",
        marginTop: 10,
    },

    footer: {
        position: "absolute",
        bottom: 50,
        color: "#4a4747",
    },
});
