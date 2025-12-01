import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Image, StyleSheet } from "react-native";
import { router } from "expo-router"; // add this at the top

export default function Login() {
    const [showPassword, setShowPassword] = useState(false);

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

                <TextInput style={styles.input} placeholder="Username" placeholderTextColor="#666" />
                <View style={styles.passwordContainer}>
                    <TextInput
                        style={styles.passwordInput}
                        placeholder="Password"
                        placeholderTextColor="#666"
                        secureTextEntry={!showPassword}
                    />
                    <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                        <Text style={styles.eye}>👁️</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.optionsRow}>
                    <TouchableOpacity>
                        <Text style={styles.remember}>◯ Remember me</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => router.push("/forgot-password")}>
                        <Text style={styles.forgot}>Forgot password?</Text>
                    </TouchableOpacity>
                </View>

                <TouchableOpacity
                    style={styles.loginButton}
                    onPress={() => router.push("/tabs/home")}
                >
                    <Text style={styles.loginButtonText}>Login</Text>
                </TouchableOpacity>
            </View>

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
        flex: 1,                      // 🔥 fills entire remaining height
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
});
