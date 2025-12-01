// app/(tabs)/profile.tsx
import React from "react";
import { View, Text, StyleSheet } from "react-native";

export default function ProfileScreen() {
    return (
        <View style={styles.container}>
            {/* Avatar circle */}
            <View style={styles.avatar}>
                <Text style={styles.avatarText}>AC</Text>
            </View>

            <Text style={styles.name}>Andreas Constantinides</Text>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Personal Information</Text>

                <Field label="Name" value="Andreas Constantinides" />
                <Field label="Date of Birth" value="12 Apr 1994" />

                <Field
                    label="Residential address"
                    value={"Blue street 9\n0000 Limassol\nCyprus"}
                />

                <Field label="Phone number" value="+357 99 912354" />
                <Field label="Email" value="mdl@outlook.com" />
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
