import React, {useCallback, useState} from "react";
import {View, Text, TextInput, TouchableOpacity, Image, StyleSheet, Alert} from "react-native";
import { router } from "expo-router"; // add this at the top
import { apiClient} from "@/lib/apiClient";
import MaskedView from "@react-native-masked-view/masked-view";
import {AxiosError} from "axios";


export default function Login() {
    const [showPassword, setShowPassword] = useState(false);
    // const [remember, setRemember] = useState(false);
    const [email, setEmail] = useState("");       // <-- bound to Gmail input
    const [password, setPassword] = useState(""); // <-- bound to Password input
    const [isLoading, setIsLoading] = useState(false);

    const [serverMessage, setServerMessage] = useState<string | null>(null);
    const [serverMessageType, setServerMessageType] = useState<'error' | 'success' | null>(null);

    const handleLogin = useCallback(async (): Promise<void> => {
        if (isLoading) return;
        if (!email || !password) {
            Alert.alert("Missing info", "Please enter both email and password.");
            return;
        }
        setIsLoading(true);

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
    }, [email, isLoading, password]);


    return (
        <View style={styles.container}>

            {/* Top orange header */}
            <View style={styles.header}>
                <Image
                    source={require("../assets/logo.png")} // <-- put your logo in assets/logo.png
                    style={styles.logo}
                    resizeMode="contain"
                />
            </View>

            {/* White card */}
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
                    {/*<TouchableOpacity>*/}
                    {/*    <Text style={styles.remember}>◯ Remember me</Text>*/}
                    {/*</TouchableOpacity>*/}
                    <TouchableOpacity onPress={() => router.push("/forgot-password")}>
                        <Text style={styles.forgot}>Forgot password?</Text>
                    </TouchableOpacity>
                </View>
                {serverMessage ? (
                    <View style={[
                        styles.messageBox,
                        serverMessageType === 'error' ? styles.messageError : styles.messageSuccess,
                    ]}>
                        <Text style={styles.messageText}>{serverMessage}</Text>
                    </View>
                ) : null}
                <TouchableOpacity
                    style={styles.loginButton}
                    onPress={handleLogin}
                    disabled={isLoading}
                >
                    <MaskedView maskElement={<Text style={styles.btnTextMask}>{isLoading ? "Loading..." : "Login"}</Text>}>
                        <Text style={[styles.loginButtonText]}>{isLoading ? "Loading..." : "Login"}</Text>
                    </MaskedView>
                </TouchableOpacity>




            </View>
            {/* Server message */}



            <Text style={styles.footer}>Developed by ACSC423 students</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: "center",
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
        backgroundColor: "#fff",
        flex: 1,
        width: "100%",
        marginTop: -40,
        borderRadius: 25,
        padding: 50,
        alignItems: "center",
        elevation: 5,
    },
    loginTitle: {
        fontSize: 32,
        fontWeight: "bold",
        marginBottom: 20,
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
        flexDirection: "row",
        justifyContent: "space-between",
        marginVertical: 10,
    },
    remember: {
        color: "#FF8A00",
        fontSize: 14,
    },
    forgot: {
        color: "#FF8A00",
        fontSize: 14,
    },
    loginButton: {
        marginTop: 15,
        width: "90%",
        paddingVertical: 12,
        borderRadius: 15,
        borderWidth: 2,
        borderColor: "#FF8A00",
        alignItems: "center",
    },
    loginButtonText: {
        fontSize: 20,
        color: "#FF8A00",
        fontWeight: "600",
    },
    footer: {
        position: "absolute",
        bottom: 25,
        color: "#ccc",
    },
    messageBox: {
        marginTop: 8,
        marginBottom: 8,
        borderRadius: 8,
        paddingVertical: 10,
        paddingHorizontal: 12,
        borderWidth: 1,
    },
    messageError: {
        backgroundColor: '#fde7e7',
        borderColor: '#f5b5b5',
    },
    messageSuccess: {
        backgroundColor: '#e9f7ef',
        borderColor: '#b9e6cd',
    },
    messageText: {
        color: '#333',
        fontSize: 13,
    },
    btnTextMask: { fontSize: 20, fontWeight: "700", textAlign: "center" },
});
