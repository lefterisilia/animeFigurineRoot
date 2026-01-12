// app/(tabs)/profile.tsx
import React, { useEffect, useState } from "react";
import {View, Text, StyleSheet, TouchableOpacity} from "react-native";
import { router } from "expo-router";
import { clearUser, getUser } from "@/lib/authStorage";

export default function ProfileScreen() {
    const [user, setUser] = useState<any>(null);

    useEffect(() => {
        const loadUser = async () => {
            const userData = await getUser();
            setUser(userData);
        };
        loadUser();
    }, []);

    const getInitials = (name: string) => {
        if (!name) return "??";
        const parts = name.trim().split(" ");
        if (parts.length >= 2) {
            return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
        }
        return name.substring(0, 2).toUpperCase();
    };


    if (!user) {
        return (
            <View style={styles.container}>
                <Text>Loading...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {/* Avatar circle */}
            <View style={styles.avatar}>
                <Text style={styles.avatarText}>{getInitials(user.username || "")}</Text>
            </View>

            <Text style={styles.name}>{user.username || "N/A"}</Text>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Personal Information</Text>

                <Field label="Name" value={user.username || "N/A"} />

                <Field label="Email" value={user.email || "N/A"} />
                <TouchableOpacity
                    onPress={async () => {
                        await clearUser();
                        router.replace("/login");
                    }}
                >
                    <Text>Logout</Text>
                </TouchableOpacity>
            </View>


        </View>
    );
}

type FieldProps = {
    label: string;
    value: string;
};

function Field({ label, value }: FieldProps) {
    return (
        <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>{label}</Text>
            <View style={styles.fieldBox}>
                <Text style={styles.fieldValue}>{value}</Text>
            </View>
        </View>
    );
}

const ORANGE = "#FF8A00";

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#FFFFFF",
        paddingTop: 60,
        paddingHorizontal: 24,
    },
    avatar: {
        width: 90,
        height: 90,
        borderRadius: 45,
        backgroundColor: ORANGE,
        alignSelf: "center",
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 12,
    },
    avatarText: {
        color: "#000",
        fontSize: 32,
        fontWeight: "600",
    },
    name: {
        fontSize: 18,
        fontWeight: "600",
        textAlign: "center",
        marginBottom: 30,
    },
    section: {
        flex: 1,
    },
    sectionTitle: {
        fontSize: 14,
        marginBottom: 12,
        color: "#444",
    },
    fieldContainer: {
        marginBottom: 12,
    },
    fieldLabel: {
        fontSize: 12,
        color: "#777",
        marginBottom: 4,
    },
    fieldBox: {
        backgroundColor: "#E5E5E5",
        borderRadius: 10,
        paddingHorizontal: 14,
        paddingVertical: 10,
    },
    fieldValue: {
        fontSize: 14,
    },
});
