// app/(tabs)/ar.tsx
import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, Image } from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";

export default function ARScreen() {
    const [permission, requestPermission] = useCameraPermissions();

    useEffect(() => {
        if (!permission?.granted) {
            requestPermission();
        }
    }, [permission]);

    if (!permission) {
        return <View />;
    }

    if (!permission.granted) {
        return (
            <View style={styles.center}>
                <Text>No access to camera</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {/* LIVE CAMERA FEED */}
            <CameraView style={styles.camera} facing="back">

                {/* TOP LOGO BAR */}
                <View style={styles.topOverlay}>
                    <Image
                        source={require("../../assets/logo.png")}
                        style={styles.logo}
                        resizeMode="contain"
                    />
                    <Text style={styles.modeText}>AR mode</Text>
                </View>

                {/* FIGURE & MEASUREMENTS OVERLAY */}
                <View style={styles.centerOverlay}>
                    {/*<Image*/}
                    {/*    source={require("../../assets/figures/gojo-3dr.png")} // transparent PNG*/}
                    {/*    style={styles.figure}*/}
                    {/*    resizeMode="contain"*/}
                    {/*/>*/}

                    {/* Measurement lines */}
                    <Text style={styles.labelTop}>20 cm</Text>
                    <Text style={styles.labelBottom}>5 cm</Text>
                </View>

            </CameraView>
        </View>
    );
}

const ORANGE = "#FF8A00";

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#000",
    },
    camera: {
        flex: 1,
    },
    topOverlay: {
        width: "100%",
        paddingTop: 40,
        paddingHorizontal: 20,
    },
    logo: {
        width: 150,
        height: 50,
    },
    modeText: {
        color: ORANGE,
        fontSize: 18,
        fontWeight: "600",
    },
    centerOverlay: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    figure: {
        width: 250,
        height: 350,
    },
    labelTop: {
        position: "absolute",
        top: 180,
        color: "#ffffff",
        fontSize: 20,
        fontWeight: "600",
    },
    labelBottom: {
        position: "absolute",
        bottom: 160,
        color: "#ffffff",
        fontSize: 20,
        fontWeight: "600",
    },
    center: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
});
