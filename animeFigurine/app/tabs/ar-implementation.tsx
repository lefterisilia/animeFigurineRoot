import React, { useCallback, useMemo, useState } from "react";
import { View, Text, Pressable, StyleSheet, PanResponder } from "react-native";
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

// Map GLB filenames to their require paths
function getGLBSource(fileName: string) {
    const glbMap: { [key: string]: any } = {
        "saitama.glb": require("../../assets/saitama.glb"),
        "dio.glb": require("../../assets/dio.glb"),
        "dog.glb": require("../../assets/dog.glb"),
        "genos.glb": require("../../assets/genos.glb"),
        "jotaro.glb": require("../../assets/jotaro.glb"),
        "makima.glb": require("../../assets/makima.glb"),
        "new_no_draco.glb": require("../../assets/new_no_draco.glb"),
    };

    return glbMap[fileName] || glbMap["saitama.glb"];
}

function ARScene(props: any) {
    const appProps = props?.sceneNavigator?.viroAppProps;

    const locked: boolean = appProps?.locked ?? false;
    const lockedWorldPos: Vec3 = appProps?.lockedWorldPos ?? [0, -0.5, -1];
    const followCamPos: Vec3 = appProps?.followCamPos ?? [0, 0, 0];
    const followCamFwd: Vec3 = appProps?.followCamFwd ?? [0, 0, -1];
    const glbFileName: string = appProps?.glbFileName ?? "saitama.glb";
    const scale: Vec3 = appProps?.scale ?? [0.55, 0.55, 0.55];
    const rotation: number = appProps?.rotation ?? 0;

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
                key={glbFileName}
                source={getGLBSource(glbFileName)}
                position={objectPosition}
                scale={scale}
                rotation={[0, rotation, 0]}
                type="GLB"
                onLoadStart={() => console.log(`--- Loading ${glbFileName} ---`)}
                onLoadEnd={() => console.log(`--- ${glbFileName} loaded successfully! ---`)}
                onError={(event) => console.error("GLB Error:", event.nativeEvent.error)}
            />
        </ViroARScene>
    );
}

interface ARImplementationProps {
    glbFileName?: string;
}

export default function ARImplementation({ glbFileName }: ARImplementationProps) {
    const [locked, setLocked] = useState(false);
    const [scale, setScale] = useState<Vec3>([0.55, 0.55, 0.55]);
    const [sliderPosition, setSliderPosition] = useState(0.5); // 0 to 1, where 0.5 is middle
    const [rotation, setRotation] = useState(0); // rotation in degrees (0 to 360)
    const [rotationSliderPosition, setRotationSliderPosition] = useState(0.5); // 0 to 1, where 0.5 is middle (180 degrees)

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

    // PanResponder for vertical slider (scale)
    const panResponder = useMemo(
        () =>
            PanResponder.create({
                onStartShouldSetPanResponder: () => true,
                onMoveShouldSetPanResponder: () => true,
                onPanResponderMove: (evt, gestureState) => {
                    // Get the touch Y position relative to the slider track
                    const sliderHeight = 400; // Height of the slider track
                    const touchY = gestureState.moveY - 100; // Adjust for top offset

                    // Calculate position (0 at top, 1 at bottom)
                    let position = touchY / sliderHeight;
                    position = Math.max(0, Math.min(1, position)); // Clamp between 0 and 1

                    setSliderPosition(position);

                    // Map position to scale: top (0) = large, bottom (1) = small
                    // Scale range: 0.2 to 1.5
                    const minScale = 0.2;
                    const maxScale = 1.5;
                    const scaleValue = maxScale - position * (maxScale - minScale);

                    setScale([scaleValue, scaleValue, scaleValue]);
                },
            }),
        []
    );

    // PanResponder for horizontal slider (rotation)
    const rotationPanResponder = useMemo(
        () =>
            PanResponder.create({
                onStartShouldSetPanResponder: () => true,
                onMoveShouldSetPanResponder: () => true,
                onPanResponderMove: (evt, gestureState) => {
                    // Get the touch X position relative to the slider track
                    const sliderWidth = 300; // Width of the slider track
                    const touchX = gestureState.moveX - 50; // Adjust for left offset

                    // Calculate position (0 at left, 1 at right)
                    let position = touchX / sliderWidth;
                    position = Math.max(0, Math.min(1, position)); // Clamp between 0 and 1

                    setRotationSliderPosition(position);

                    // Map position to rotation: 0 = 0°, 0.5 = 180°, 1 = 360°
                    const rotationValue = position * 360;

                    setRotation(rotationValue);
                },
            }),
        []
    );

    const viroAppProps = useMemo(
        () => ({
            locked,
            lockedWorldPos,
            followCamPos,
            followCamFwd,
            setCameraPose,
            glbFileName,
            scale,
            rotation,
        }),
        [locked, lockedWorldPos, followCamPos, followCamFwd, setCameraPose, glbFileName, scale, rotation]
    );

    return (
        <View style={{ flex: 1 }}>
            <ViroARSceneNavigator
                key={glbFileName}
                autofocus
                initialScene={{ scene: ARScene as any }}
                viroAppProps={viroAppProps}
                style={{ flex: 1 }}
            />

            {/* Vertical Slider on the Left */}
            <View style={styles.sliderContainer} {...panResponder.panHandlers}>
                <View style={styles.sliderTrack}>
                    <View
                        style={[
                            styles.sliderThumb,
                            { top: `${sliderPosition * 100}%` },
                        ]}
                    />
                </View>
            </View>

            {/* Horizontal Slider at the Bottom for Rotation */}
            <View style={styles.rotationSliderContainer} {...rotationPanResponder.panHandlers}>
                <View style={styles.rotationSliderTrack}>
                    <View
                        style={[
                            styles.rotationSliderThumb,
                            { left: `${rotationSliderPosition * 100}%` },
                        ]}
                    />
                </View>
            </View>

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
    sliderContainer: {
        position: "absolute",
        left: 20,
        top: 140,
        width: 60,
        height: 400,
        justifyContent: "center",
        alignItems: "center",
    },
    sliderTrack: {
        width: 6,
        height: "100%",
        backgroundColor: "rgba(255, 255, 255, 0.5)",
        borderRadius: 3,
        position: "relative",
    },
    sliderThumb: {
        position: "absolute",
        left: -12,
        width: 30,
        height: 30,
        backgroundColor: "#FF8A00",
        borderRadius: 15,
        borderWidth: 3,
        borderColor: "#FFFFFF",
        marginTop: -15, // Center the thumb on the track
    },
    overlay: {
        position: "absolute",
        left: 0,
        right: 0,
        bottom: 170, // above your custom tab bar
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
    rotationSliderContainer: {
        position: "absolute",
        bottom: 120,
        left: 50,
        right: 50,
        height: 60,
        justifyContent: "center",
        alignItems: "center",
    },
    rotationSliderTrack: {
        height: 6,
        width: "100%",
        backgroundColor: "rgba(255, 255, 255, 0.5)",
        borderRadius: 3,
        position: "relative",
    },
    rotationSliderThumb: {
        position: "absolute",
        top: -12,
        width: 30,
        height: 30,
        backgroundColor: "#FF8A00",
        borderRadius: 15,
        borderWidth: 3,
        borderColor: "#FFFFFF",
        marginLeft: -15, // Center the thumb on the track
    },
});
