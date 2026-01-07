// app/(tabs)/ar-implementation.tsx
import React from "react";
import { ViroARScene, ViroAmbientLight, Viro3DObject, ViroARSceneNavigator } from "@reactvision/react-viro";

export default function ARImplementation() {
    return (
        <ViroARSceneNavigator
            autofocus={true}
            initialScene={{
                scene: () => (
                    <ViroARScene>
                        <ViroAmbientLight color="#ffffff" />
                        <Viro3DObject
                            source={require("../../assets/dog.glb")}
                            position={[0, -0.5, -1]}
                            scale={[0.55, 0.55, 0.55]}
                            type="GLB"
                        />
                    </ViroARScene>
                ),
            }}
            style={{ flex: 1 }}
        />
    );
}

