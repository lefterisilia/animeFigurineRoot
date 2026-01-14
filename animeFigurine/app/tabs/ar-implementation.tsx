import React, { useCallback, useMemo, useState } from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import {
    ViroARScene,
    ViroAmbientLight,
    Viro3DObject,
    ViroARSceneNavigator,
} from "@reactvision/react-viro";

type Vec3 = [number, number, number];

// model distance in front of camera when FOLLOWING (meters)
const FOLLOW_DISTANCE = 3.0;
const FOLLOW_OFFSET_Y = -0.3;

function add(a: Vec3, b: Vec3): Vec3 {
    return [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
}

function mul(a: Vec3, s: number): Vec3 {
    return [a[0] * s, a[1] * s, a[2] * s];
}

function norm(v: Vec3): Vec3 {
    const len = Math.sqrt(v[0] * v[0] + v[1] * v[1] + v[2] * v[2]) || 1;
    return [v[0] / len, v[1] / len, v[2] / len];
}

/**
 * Convert camera forward vector from transform.
 * Viro camera transform usually provides:
 *  - position: [x,y,z]
 *  - forward: [x,y,z]  (often available)
 *  - rotation / orientation (varies)
 *
 * We'll support the common "forward" field if present.
 */
function getForwardFromCameraTransform(t: any): Vec3 {
    if (t?.forward && Array.isArray(t.forward) && t.forward.length >= 3) {
        return norm([Number(t.forward[0]), Number(t.forward[1]), Number(t.forward[2])]);
    }

    // Fallback: if forward not present, assume looking down -Z
    return [0, 0, -1];
}

function getPositionFromCameraTransform(t: any): Vec3 {
    if (t?.position && Array.isArray(t.position) && t.position.length >= 3) {
        return [Number(t.position[0]), Number(t.position[1]), Number(t.position[2])];
    }
    return [0, 0, 0];
}

function ARScene(props: any) {
    const appProps = props?.sceneNavigator?.viroAppProps;

    const locked: boolean = appProps?.locked ?? false;
    const lockedWorldPos: Vec3 = appProps?.lockedWorldPos ?? [0, -0.5, -1];
    const followCamPos: Vec3 = appProps?.followCamPos ?? [0, 0, 0];
    const followCamFwd: Vec3 = appProps?.followCamFwd ?? [0, 0, -1];

    const setCameraPose: ((p: Vec3, f: Vec3) => void) | undefined = appProps?.setCameraPose;

    const onCameraTransformUpdate = useCallback(
        (t: any) => {
            if (!setCameraPose) return;
            const camPos = getPositionFromCameraTransform(t);
            const camFwd = getForwardFromCameraTransform(t);
            setCameraPose(camPos, camFwd);
        },
        [setCameraPose]
    );

    // While not locked: keep it in front of camera (camera space feeling)
    // While locked: keep it in the world position stored when STOP was pressed
    const objectPosition: Vec3 = useMemo(() => {
        if (locked) return lockedWorldPos;

        // "Follow" position = camera position + forward * distance + small Y offset
        const ahead = mul(followCamFwd, FOLLOW_DISTANCE);
        return add(add(followCamPos, ahead), [0, FOLLOW_OFFSET_Y, 0]);
    }, [locked, lockedWorldPos, followCamPos, followCamFwd]);

    return (
        <ViroARScene onCameraTransformUpdate={onCameraTransformUpdate}>
            <ViroAmbientLight color="#ffffff" />

            <Viro3DObject
                source={require("../../assets/jorato/tripo_convert_157789a6-34d6-43b8-819a-7dd1e039b5f4.obj")}
                resources={[
                    require("../../assets/jorato/tripo_convert_157789a6-34d6-43b8-819a-7dd1e039b5f4.mtl"),
                    require("../../assets/jorato/jorato_basecolor.JPEG"),
                    require("../../assets/jorato/jorato_metallic.JPEG"),
                    require("../../assets/jorato/jorato_normal.JPEG"),
                    require("../../assets/jorato/jorato_roughness.JPEG"),
                ]}
                position={[0, -0.2, -1]}
                scale={[0.05, 0.05, 0.05]}
                type="OBJ"
            />

        </ViroARScene>
    );
}

export default function ARImplementation() {
    const [locked, setLocked] = useState(false);

    // continuously updated camera pose
    const [followCamPos, setFollowCamPos] = useState<Vec3>([0, 0, 0]);
    const [followCamFwd, setFollowCamFwd] = useState<Vec3>([0, 0, -1]);

    // world position saved at STOP
    const [lockedWorldPos, setLockedWorldPos] = useState<Vec3>([0, -0.5, -1]);

    const setCameraPose = useCallback((pos: Vec3, fwd: Vec3) => {
        setFollowCamPos(pos);
        setFollowCamFwd(fwd);
    }, []);

    const stopAndPlace = useCallback(() => {
        // freeze at "in front of camera" position at the moment you press STOP
        const ahead = mul(followCamFwd, FOLLOW_DISTANCE);
        const placePos = add(add(followCamPos, ahead), [0, FOLLOW_OFFSET_Y, 0]);
        setLockedWorldPos(placePos);
        setLocked(true);
    }, [followCamPos, followCamFwd]);

    const moveAgain = useCallback(() => {
        setLocked(false);
    }, []);

    const replaceModel = useCallback(() => {
        // replace = unlock and continue following camera
        setLocked(false);
    }, []);

    const viroAppProps = useMemo(
        () => ({
            locked,
            lockedWorldPos,
            followCamPos,
            followCamFwd,
            setCameraPose,
        }),
        [locked, lockedWorldPos, followCamPos, followCamFwd, setCameraPose]
    );

    return (
        <View style={{ flex: 1 }}>
            <ViroARSceneNavigator
                autofocus
                initialScene={{ scene: ARScene as any }}
                viroAppProps={viroAppProps}
                style={{ flex: 1 }}
            />

            <View style={styles.overlay} pointerEvents="box-none">
                {!locked ? (
                    <Pressable style={styles.button} onPress={stopAndPlace}>
                        <Text style={styles.buttonText}>STOP (PLACE)</Text>
                    </Pressable>
                ) : (
                    <>
                        <View style={[styles.button, styles.lockedButton]}>
                            <Text style={styles.buttonText}>PLACED</Text>
                        </View>

                        <Pressable style={styles.secondaryButton} onPress={moveAgain}>
                            <Text style={styles.secondaryText}>Move again</Text>
                        </Pressable>

                        <Pressable style={styles.replaceButton} onPress={replaceModel}>
                            <Text style={styles.replaceText}>REPLACE</Text>
                        </Pressable>
                    </>
                )}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    overlay: {
        position: "absolute",
        left: 0,
        right: 0,
        bottom: 140, // above your custom tab bar
        alignItems: "center",
        gap: 12,
    },
    button: {
        backgroundColor: "#111",
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderRadius: 14,
    },
    lockedButton: {
        opacity: 0.75,
    },
    buttonText: {
        color: "#fff",
        fontSize: 14,
        fontWeight: "800",
    },
    secondaryButton: {
        backgroundColor: "rgba(0,0,0,0.35)",
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderRadius: 14,
    },
    secondaryText: {
        color: "#fff",
        fontSize: 14,
        fontWeight: "700",
    },
    replaceButton: {
        backgroundColor: "#FF8A00",
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderRadius: 14,
    },
    replaceText: {
        color: "#000",
        fontSize: 14,
        fontWeight: "900",
    },
});
