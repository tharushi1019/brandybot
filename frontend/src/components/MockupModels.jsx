import React, { useRef } from "react";
import { useTexture, Decal, Float, Text } from "@react-three/drei";
import * as THREE from "three";

/**
 * Procedural 3D Mug Component
 */
export function Mug({ logoUrl, color = "#ffffff", ...props }) {
  const meshRef = useRef();
  
  // Load texture if available, otherwise use a placeholder or null
  const logoTexture = logoUrl ? useTexture(logoUrl) : null;

  return (
    <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
      <group {...props}>
        {/* Mug Body */}
        <mesh castShadow receiveShadow>
          <cylinderGeometry args={[0.5, 0.45, 1.2, 32]} />
          <meshStandardMaterial color={color} roughness={0.1} metalness={0.1} />
          
          {/* Logo Decal */}
          {logoTexture && (
            <Decal
              position={[0, 0, 0.48]} // Side of the mug
              rotation={[0, 0, 0]}
              scale={[0.4, 0.4, 1]}
            >
              <meshBasicMaterial
                map={logoTexture}
                transparent
                polygonOffset
                polygonOffsetFactor={-10}
              />
            </Decal>
          )}
        </mesh>

        {/* Mug Handle */}
        <mesh position={[0.55, 0, 0]} rotation={[0, 0, 0]} castShadow>
          <torusGeometry args={[0.3, 0.08, 16, 32, Math.PI]} />
          <meshStandardMaterial color={color} roughness={0.1} metalness={0.1} />
        </mesh>
      </group>
    </Float>
  );
}

/**
 * Procedural 3D Business Card Component
 */
export function BusinessCard({ logoUrl, brandName, color = "#ffffff", ...props }) {
  const logoTexture = logoUrl ? useTexture(logoUrl) : null;

  return (
    <Float speed={1.5} rotationIntensity={0.3} floatIntensity={0.5}>
      <group {...props}>
        {/* Card base */}
        <mesh castShadow receiveShadow>
          <boxGeometry args={[3.5, 2, 0.05]} />
          <meshStandardMaterial color={color} roughness={0.3} metalness={0.05} />
          
          {/* Logo Decal */}
          {logoTexture && (
            <Decal
              position={[-0.9, 0, 0.03]} // Top left-ish
              rotation={[0, 0, 0]}
              scale={[0.8, 0.8, 1]}
            >
              <meshBasicMaterial
                map={logoTexture}
                transparent
                polygonOffset
                polygonOffsetFactor={-10}
              />
            </Decal>
          )}
        </mesh>

        {/* Brand Name Text */}
        <Text
          position={[0.5, 0, 0.04]}
          fontSize={0.25}
          color="#333333"
          font="https://fonts.gstatic.com/s/robotoslab/v7/Kg99apapp9H9JL6p8L5J6p8L5J6pwI.woff"
          anchorX="left"
          anchorY="middle"
        >
          {brandName || "Your Brand"}
        </Text>
      </group>
    </Float>
  );
}

/**
 * Improved 3D Shirt (Using a custom shape for better silhouette)
 */
export function SimpleShirt({ logoUrl, color = "#222222", ...props }) {
    const logoTexture = logoUrl ? useTexture(logoUrl) : null;
    
    // Create a simple shirt-like shape
    const shirtShape = React.useMemo(() => {
      const shape = new THREE.Shape();
      shape.moveTo(-1, -1.2);
      shape.lineTo(1, -1.2);
      shape.lineTo(1, 0.5);
      shape.lineTo(1.5, 0.2);
      shape.lineTo(1.8, 0.8);
      shape.lineTo(1, 1.3);
      shape.lineTo(0.3, 1.3);
      shape.quadraticCurveTo(0, 1.1, -0.3, 1.3); // Neckline
      shape.lineTo(-1, 1.3);
      shape.lineTo(-1.8, 0.8);
      shape.lineTo(-1.5, 0.2);
      shape.lineTo(-1, 0.5);
      shape.lineTo(-1, -1.2);
      return shape;
    }, []);

    const extrudeSettings = { depth: 0.2, bevelEnabled: true, bevelThickness: 0.05, bevelSize: 0.05, bevelSegments: 3 };
  
    return (
      <Float speed={1} rotationIntensity={0.2} floatIntensity={0.4}>
        <group {...props}>
          <mesh castShadow receiveShadow rotation={[0, 0, 0]}>
            <extrudeGeometry args={[shirtShape, extrudeSettings]} />
            <meshStandardMaterial color={color} roughness={0.7} metalness={0} />
            
            {/* Logo Decal on Chest */}
            {logoTexture && (
              <Decal
                position={[0, 0.3, 0.21]} 
                rotation={[0, 0, 0]}
                scale={[0.7, 0.7, 1]}
              >
                <meshBasicMaterial
                  map={logoTexture}
                  transparent
                  polygonOffset
                  polygonOffsetFactor={-10}
                />
              </Decal>
            )}
          </mesh>
        </group>
      </Float>
    );
  }
