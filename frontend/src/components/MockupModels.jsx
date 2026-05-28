import React, { useRef, useMemo } from "react";
import { useTexture, Decal, Float, Text } from "@react-three/drei";
import * as THREE from "three";

// ─────────────────────────────────────────────────────────────────
// IMPORTANT: All hooks MUST be called unconditionally (Rules of Hooks).
// We always load a texture — if no logoUrl is provided we use a 1x1 
// transparent fallback so the hook is always called.
// ─────────────────────────────────────────────────────────────────

const TRANSPARENT_PIXEL =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==";

/**
 * Procedural 3D Mug — premium ceramic cup
 */
export function Mug({ logoUrl, color = "#ffffff", logoX = 0, logoY = 0, logoScale = 1, ...props }) {
  const logoTexture = useTexture(logoUrl || TRANSPARENT_PIXEL);
  const hasLogo = !!logoUrl;

  return (
    <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
      <group {...props}>
        {/* Mug Body */}
        <mesh castShadow receiveShadow>
          <cylinderGeometry args={[0.5, 0.45, 1.2, 64]} />
          <meshStandardMaterial
            color={color}
            roughness={0.12}
            metalness={0.08}
          />
          {hasLogo && (
            <Decal
              position={[0 + logoX * 0.28, 0 + logoY * 0.45, 0.49]}
              rotation={[0, 0, 0]}
              scale={[0.42 * logoScale, 0.42 * logoScale, 1]}
            >
              <meshBasicMaterial
                map={logoTexture}
                transparent
                polygonOffset
                polygonOffsetFactor={-10}
                depthWrite={false}
              />
            </Decal>
          )}
        </mesh>

        {/* Mug Handle */}
        <mesh position={[0.58, 0, 0]} castShadow>
          <torusGeometry args={[0.28, 0.07, 16, 32, Math.PI]} />
          <meshStandardMaterial color={color} roughness={0.12} metalness={0.08} />
        </mesh>
      </group>
    </Float>
  );
}

/**
 * Procedural 3D Business Card — foil-like premium finish
 */
export function BusinessCard({ logoUrl, brandName, color = "#ffffff", logoX = 0, logoY = 0, logoScale = 1, ...props }) {
  const logoTexture = useTexture(logoUrl || TRANSPARENT_PIXEL);
  const hasLogo = !!logoUrl;

  return (
    <Float speed={1.5} rotationIntensity={0.3} floatIntensity={0.5}>
      <group {...props}>
        {/* Card base */}
        <mesh castShadow receiveShadow>
          <boxGeometry args={[3.5, 2, 0.04]} />
          <meshPhysicalMaterial
            color={color}
            roughness={0.2}
            metalness={0.1}
            clearcoat={0.8}
            clearcoatRoughness={0.1}
          />
          {hasLogo && (
            <Decal
              position={[-0.9 + logoX * 0.6, 0.2 + logoY * 0.6, 0.025]}
              rotation={[0, 0, 0]}
              scale={[0.75 * logoScale, 0.75 * logoScale, 1]}
            >
              <meshBasicMaterial
                map={logoTexture}
                transparent
                polygonOffset
                polygonOffsetFactor={-10}
                depthWrite={false}
              />
            </Decal>
          )}
        </mesh>

        {/* Accent stripe */}
        <mesh position={[1.4, 0, 0.022]}>
          <boxGeometry args={[0.7, 2, 0.005]} />
          <meshPhysicalMaterial
            color="#7C3AED"
            roughness={0.1}
            metalness={0.3}
            clearcoat={1}
          />
        </mesh>

        {/* Brand Name Text */}
        <Text
          position={[0.3, -0.1, 0.03]}
          fontSize={0.22}
          color="#222222"
          anchorX="left"
          anchorY="middle"
          maxWidth={1.5}
        >
          {brandName || "Your Brand"}
        </Text>
        <Text
          position={[0.3, -0.45, 0.03]}
          fontSize={0.12}
          color="#888888"
          anchorX="left"
          anchorY="middle"
        >
          hello@yourbrand.com
        </Text>
      </group>
    </Float>
  );
}

/**
 * Highly Realistic 3D T-Shirt — crew collar, hem lines & sleeve cuffs
 */
export function SimpleShirt({ logoUrl, color = "#222222", logoX = 0, logoY = 0, logoScale = 1, ...props }) {
  const logoTexture = useTexture(logoUrl || TRANSPARENT_PIXEL);
  const hasLogo = !!logoUrl;

  const shirtShape = useMemo(() => {
    const shape = new THREE.Shape();
    shape.moveTo(-1, -1.5);
    shape.lineTo(1, -1.5);
    shape.lineTo(1, 0.4);
    shape.lineTo(1.6, 0.1);
    shape.lineTo(1.9, 0.9);
    shape.lineTo(1.05, 1.4);
    shape.lineTo(0.35, 1.4);
    shape.quadraticCurveTo(0, 1.15, -0.35, 1.4);
    shape.lineTo(-1.05, 1.4);
    shape.lineTo(-1.9, 0.9);
    shape.lineTo(-1.6, 0.1);
    shape.lineTo(-1, 0.4);
    shape.lineTo(-1, -1.5);
    return shape;
  }, []);

  const extrudeSettings = useMemo(
    () => ({
      depth: 0.18,
      bevelEnabled: true,
      bevelThickness: 0.04,
      bevelSize: 0.04,
      bevelSegments: 4,
    }),
    []
  );

  return (
    <Float speed={1} rotationIntensity={0.2} floatIntensity={0.4}>
      <group {...props}>
        {/* Extruded Shirt Body */}
        <mesh castShadow receiveShadow>
          <extrudeGeometry args={[shirtShape, extrudeSettings]} />
          <meshStandardMaterial color={color} roughness={0.82} metalness={0} />
          {hasLogo && (
            <Decal
              position={[0 + logoX * 0.6, 0.25 + logoY * 0.7, 0.19]}
              rotation={[0, 0, 0]}
              scale={[0.65 * logoScale, 0.65 * logoScale, 1]}
            >
              <meshBasicMaterial
                map={logoTexture}
                transparent
                polygonOffset
                polygonOffsetFactor={-10}
                depthWrite={false}
              />
            </Decal>
          )}
        </mesh>

        {/* Realistic 3D Crew Neck Collar */}
        <mesh position={[0, 1.35, 0.09]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.3, 0.05, 16, 32]} />
          <meshStandardMaterial color={color} roughness={0.8} />
        </mesh>

        {/* 3D Sleeve cuffs detail */}
        <mesh position={[-1.48, 0.65, 0.09]} rotation={[0, 0, -Math.PI / 6]}>
          <boxGeometry args={[0.1, 0.46, 0.22]} />
          <meshStandardMaterial color={color} roughness={0.8} />
        </mesh>
        <mesh position={[1.48, 0.65, 0.09]} rotation={[0, 0, Math.PI / 6]}>
          <boxGeometry args={[0.1, 0.46, 0.22]} />
          <meshStandardMaterial color={color} roughness={0.8} />
        </mesh>
      </group>
    </Float>
  );
}

/**
 * Highly Realistic 3D Hoodie — pullover hoodie with pouch, cuffs & drawstrings
 */
export function Hoodie({ logoUrl, color = "#333333", logoX = 0, logoY = 0, logoScale = 1, ...props }) {
  const logoTexture = useTexture(logoUrl || TRANSPARENT_PIXEL);
  const hasLogo = !!logoUrl;

  const hoodieShape = useMemo(() => {
    const shape = new THREE.Shape();
    // Body
    shape.moveTo(-1.1, -1.6);
    shape.lineTo(1.1, -1.6);
    shape.lineTo(1.1, 0.3);
    // Right arm
    shape.lineTo(1.7, 0.1);
    shape.lineTo(2.0, -0.5);
    shape.lineTo(1.75, -0.55);
    shape.lineTo(1.45, 0.05);
    // Right shoulder
    shape.lineTo(1.1, 0.5);
    // Hood right
    shape.lineTo(0.4, 1.5);
    shape.quadraticCurveTo(0, 1.85, -0.4, 1.5);
    // Hood left
    shape.lineTo(-1.1, 0.5);
    shape.lineTo(-1.45, 0.05);
    shape.lineTo(-1.75, -0.55);
    shape.lineTo(-2.0, -0.5);
    shape.lineTo(-1.7, 0.1);
    shape.lineTo(-1.1, 0.3);
    shape.lineTo(-1.1, -1.6);
    return shape;
  }, []);

  const extrudeSettings = useMemo(
    () => ({
      depth: 0.2,
      bevelEnabled: true,
      bevelThickness: 0.04,
      bevelSize: 0.04,
      bevelSegments: 4,
    }),
    []
  );

  return (
    <Float speed={1.2} rotationIntensity={0.25} floatIntensity={0.4}>
      <group {...props}>
        {/* Extruded body */}
        <mesh castShadow receiveShadow>
          <extrudeGeometry args={[hoodieShape, extrudeSettings]} />
          <meshStandardMaterial color={color} roughness={0.85} metalness={0} />
          {hasLogo && (
            <Decal
              position={[0 + logoX * 0.6, 0.1 + logoY * 0.7, 0.22]}
              rotation={[0, 0, 0]}
              scale={[0.6 * logoScale, 0.6 * logoScale, 1]}
            >
              <meshBasicMaterial
                map={logoTexture}
                transparent
                polygonOffset
                polygonOffsetFactor={-10}
                depthWrite={false}
              />
            </Decal>
          )}
        </mesh>

        {/* kangaroo front pocket */}
        <mesh position={[0, -0.72, 0.16]} castShadow>
          <boxGeometry args={[0.9, 0.48, 0.09]} />
          <meshStandardMaterial color={color} roughness={0.85} />
        </mesh>

        {/* Bottom hem ribbing */}
        <mesh position={[0, -1.6, 0.1]}>
          <boxGeometry args={[2.24, 0.15, 0.22]} />
          <meshStandardMaterial color={color} roughness={0.88} />
        </mesh>

        {/* Sleeve cuffs ribbing */}
        <mesh position={[-1.75, -0.45, 0.1]} rotation={[0, 0, Math.PI / 8]}>
          <boxGeometry args={[0.26, 0.12, 0.24]} />
          <meshStandardMaterial color={color} roughness={0.88} />
        </mesh>
        <mesh position={[1.75, -0.45, 0.1]} rotation={[0, 0, -Math.PI / 8]}>
          <boxGeometry args={[0.26, 0.12, 0.24]} />
          <meshStandardMaterial color={color} roughness={0.88} />
        </mesh>

        {/* Drawstrings */}
        <mesh position={[-0.15, 1.15, 0.12]}>
          <cylinderGeometry args={[0.02, 0.02, 0.65, 8]} />
          <meshStandardMaterial color={color} roughness={0.9} />
        </mesh>
        <mesh position={[0.15, 1.15, 0.12]}>
          <cylinderGeometry args={[0.02, 0.02, 0.65, 8]} />
          <meshStandardMaterial color={color} roughness={0.9} />
        </mesh>
      </group>
    </Float>
  );
}

/**
 * Procedural 3D Notebook / Journal — hardcover book
 */
export function Notebook({ logoUrl, color = "#1a1a2e", logoX = 0, logoY = 0, logoScale = 1, ...props }) {
  const logoTexture = useTexture(logoUrl || TRANSPARENT_PIXEL);
  const hasLogo = !!logoUrl;

  return (
    <Float speed={1.8} rotationIntensity={0.4} floatIntensity={0.5}>
      <group {...props} rotation={[0.3, -0.3, 0]}>
        {/* Cover */}
        <mesh castShadow receiveShadow>
          <boxGeometry args={[2.2, 3, 0.15]} />
          <meshStandardMaterial color={color} roughness={0.6} metalness={0.05} />
          {hasLogo && (
            <Decal
              position={[0 + logoX * 0.6, 0.3 + logoY * 0.9, 0.08]}
              rotation={[0, 0, 0]}
              scale={[1.0 * logoScale, 1.0 * logoScale, 1]}
            >
              <meshBasicMaterial
                map={logoTexture}
                transparent
                polygonOffset
                polygonOffsetFactor={-10}
                depthWrite={false}
              />
            </Decal>
          )}
        </mesh>

        {/* Pages block */}
        <mesh position={[0, 0, -0.16]}>
          <boxGeometry args={[2.1, 2.92, 0.22]} />
          <meshStandardMaterial color="#f5f5f0" roughness={0.95} />
        </mesh>

        {/* Spine */}
        <mesh position={[-1.18, 0, -0.08]}>
          <boxGeometry args={[0.08, 3, 0.38]} />
          <meshStandardMaterial color={color} roughness={0.5} metalness={0.1} />
        </mesh>

        {/* Elastic strap */}
        <mesh position={[0, 0, 0.09]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.03, 0.03, 2.1, 8]} />
          <meshStandardMaterial color="#7C3AED" roughness={0.4} />
        </mesh>
      </group>
    </Float>
  );
}

/**
 * Procedural 3D Water Bottle — slim premium metal hydro flask
 */
export function WaterBottle({ logoUrl, color = "#2d3748", logoX = 0, logoY = 0, logoScale = 1, ...props }) {
  const logoTexture = useTexture(logoUrl || TRANSPARENT_PIXEL);
  const hasLogo = !!logoUrl;

  return (
    <Float speed={2} rotationIntensity={0.3} floatIntensity={0.6}>
      <group {...props}>
        {/* Bottle body */}
        <mesh castShadow receiveShadow position={[0, -0.1, 0]}>
          <cylinderGeometry args={[0.38, 0.38, 2.2, 64]} />
          <meshPhysicalMaterial
            color={color}
            roughness={0.15}
            metalness={0.7}
            clearcoat={0.9}
            clearcoatRoughness={0.15}
          />
          {hasLogo && (
            <Decal
              position={[0 + logoX * 0.25, 0 + logoY * 0.7, 0.39]}
              rotation={[0, 0, 0]}
              scale={[0.4 * logoScale, 0.55 * logoScale, 1]}
            >
              <meshBasicMaterial
                map={logoTexture}
                transparent
                polygonOffset
                polygonOffsetFactor={-10}
                depthWrite={false}
              />
            </Decal>
          )}
        </mesh>

        {/* Cap */}
        <mesh position={[0, 1.25, 0]} castShadow>
          <cylinderGeometry args={[0.22, 0.38, 0.3, 32]} />
          <meshStandardMaterial color="#7C3AED" roughness={0.3} metalness={0.2} />
        </mesh>

        {/* Nozzle */}
        <mesh position={[0, 1.42, 0]}>
          <cylinderGeometry args={[0.1, 0.12, 0.1, 16]} />
          <meshStandardMaterial color="#5b21b6" roughness={0.3} />
        </mesh>
      </group>
    </Float>
  );
}
