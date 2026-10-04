import React, { useMemo, useState, useEffect } from "react";
import { Decal, Float, Text, useGLTF } from "@react-three/drei";
import * as THREE from "three";

// ─────────────────────────────────────────────────────────────────
// Safe Texture Loader Hook
// Loads texture with CORS support and graceful error handling.
// Avoids breaking React Suspense or unmounting Canvas on network/CORS issues.
// ─────────────────────────────────────────────────────────────────
const textureCache = new Map();

export function useSafeTexture(url) {
  const [texture, setTexture] = useState(() => (url ? textureCache.get(url) || null : null));

  useEffect(() => {
    if (!url) {
      setTexture(null);
      return;
    }

    if (textureCache.has(url)) {
      setTexture(textureCache.get(url));
      return;
    }

    let isMounted = true;
    const loader = new THREE.TextureLoader();
    loader.setCrossOrigin("anonymous");

    loader.load(
      url,
      (loadedTexture) => {
        loadedTexture.colorSpace = THREE.SRGBColorSpace;
        loadedTexture.needsUpdate = true;
        textureCache.set(url, loadedTexture);
        if (isMounted) {
          setTexture(loadedTexture);
        }
      },
      undefined,
      (err) => {
        console.warn("Could not load 3D texture:", err);
        if (isMounted) {
          setTexture(null);
        }
      }
    );

    return () => {
      isMounted = false;
    };
  }, [url]);

  return texture;
}

/**
 * Procedural 3D Mug — premium ceramic cup
 */
export function Mug({ logoUrl, color = "#ffffff", logoX = 0, logoY = 0, logoScale = 1, ...props }) {
  const logoTexture = useSafeTexture(logoUrl);
  const hasLogo = Boolean(logoUrl && logoTexture);

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
        <mesh position={[0.46, 0, 0]} scale={[0.9, 1.2, 1]} castShadow receiveShadow>
          <torusGeometry args={[0.3, 0.065, 24, 48]} />
          <meshStandardMaterial color={color} roughness={0.12} metalness={0.08} />
        </mesh>
      </group>
    </Float>
  );
}

/**
 * Procedural 3D Business Card — premium foil-stamped luxury cardstock
 */
export function BusinessCard({ logoUrl, brandName, color = "#ffffff", logoX = 0, logoY = 0, logoScale = 1, ...props }) {
  const logoTexture = useSafeTexture(logoUrl);
  const hasLogo = Boolean(logoUrl && logoTexture);

  // Dynamic theme & accent calculation for realistic contrast
  const { stripeColor, textPrimary, textSecondary } = useMemo(() => {
    const c = new THREE.Color(color);
    const luminance = 0.2126 * c.r + 0.7152 * c.g + 0.0722 * c.b;
    const isDark = luminance < 0.45;

    // Metallic foil accent coordinating with the chosen palette
    const stripe = isDark
      ? c.clone().offsetHSL(0, 0.15, 0.22)
      : c.clone().multiplyScalar(0.72);

    return {
      stripeColor: stripe,
      textPrimary: isDark ? "#ffffff" : "#1a1a2e",
      textSecondary: isDark ? "#cbd5e1" : "#64748b",
    };
  }, [color]);

  return (
    <Float speed={1.5} rotationIntensity={0.3} floatIntensity={0.5}>
      <group {...props}>
        {/* Card base — premium heavyweight cardstock */}
        <mesh castShadow receiveShadow>
          <boxGeometry args={[3.5, 2, 0.04]} />
          <meshPhysicalMaterial
            color={color}
            roughness={0.35}
            metalness={0.05}
            clearcoat={0.3}
            clearcoatRoughness={0.2}
          />
          {hasLogo && (
            <Decal
              position={[-0.9 + logoX * 0.6, 0.15 + logoY * 0.6, 0.025]}
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

        {/* Dynamic Metallic Foil Accent Stripe (Right Side) */}
        <mesh position={[1.45, 0, 0.022]}>
          <boxGeometry args={[0.6, 2, 0.005]} />
          <meshPhysicalMaterial
            color={stripeColor}
            roughness={0.15}
            metalness={0.85}
            clearcoat={1}
            clearcoatRoughness={0.1}
          />
        </mesh>

        {/* Subtle Decorative Foil Hairline */}
        <mesh position={[0.25, -0.18, 0.023]}>
          <boxGeometry args={[1.5, 0.008, 0.002]} />
          <meshStandardMaterial color={stripeColor} metalness={0.9} roughness={0.2} />
        </mesh>

        {/* Brand Name Text */}
        <Text
          position={[0.25, 0.08, 0.03]}
          fontSize={0.22}
          color={textPrimary}
          anchorX="left"
          anchorY="middle"
          maxWidth={1.6}
        >
          {brandName || "Your Brand"}
        </Text>

        {/* Subtitle / Contact Information */}
        <Text
          position={[0.25, -0.36, 0.03]}
          fontSize={0.11}
          color={textSecondary}
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
  const logoTexture = useSafeTexture(logoUrl);
  const hasLogo = Boolean(logoUrl && logoTexture);

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

// Preload the Hoodie GLB
useGLTF.preload("/hoodie.glb");

/**
 * 3D Realistic Hoodie — loaded from glb with surface-aligned chest logo
 */
export function Hoodie({ logoUrl, color = "#333333", logoX = 0, logoY = 0, logoScale = 1, ...props }) {
  const { scene } = useGLTF("/hoodie.glb");
  const logoTexture = useSafeTexture(logoUrl);
  const hasLogo = Boolean(logoUrl && logoTexture);

  const clonedScene = useMemo(() => {
    const clone = scene.clone(true);
    clone.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
        if (child.material) {
          child.material = child.material.clone();
          child.material.color = new THREE.Color(color);
          child.material.roughness = 0.85;
          child.material.metalness = 0.05;
        }
      }
    });
    return clone;
  }, [scene, color]);

  return (
    <Float speed={1.2} rotationIntensity={0.25} floatIntensity={0.4}>
      <group {...props}>
        <primitive object={clonedScene} scale={1.8} position={[0, -2.44, 0]} />
        {hasLogo && (
          <mesh
            position={[0 + logoX * 0.45, 0.14 + logoY * 0.45, 0.295]}
            rotation={[-0.18, 0, 0]}
            renderOrder={10}
          >
            <planeGeometry args={[0.52 * logoScale, 0.52 * logoScale]} />
            <meshBasicMaterial
              map={logoTexture}
              transparent
              depthWrite={false}
              polygonOffset
              polygonOffsetFactor={-10}
            />
          </mesh>
        )}
      </group>
    </Float>
  );
}


/**
 * Procedural 3D Notebook / Journal — hardcover book with vertical strap & ribbon bookmark
 */
export function Notebook({ logoUrl, color = "#1a1a2e", logoX = 0, logoY = 0, logoScale = 1, ...props }) {
  const logoTexture = useSafeTexture(logoUrl);
  const hasLogo = Boolean(logoUrl && logoTexture);

  // Dynamic strap and ribbon bookmark colors matching the selected palette
  const { strapColor, bookmarkColor } = useMemo(() => {
    const c = new THREE.Color(color);
    const strap = c.clone().multiplyScalar(0.5);
    const bookmark = c.clone().offsetHSL(0, 0.2, 0.15);
    return { strapColor: strap, bookmarkColor: bookmark };
  }, [color]);

  return (
    <Float speed={1.8} rotationIntensity={0.4} floatIntensity={0.5}>
      <group {...props} rotation={[0.3, -0.3, 0]}>
        {/* Hardcover Front */}
        <mesh castShadow receiveShadow>
          <boxGeometry args={[2.2, 3.0, 0.08]} />
          <meshPhysicalMaterial
            color={color}
            roughness={0.4}
            metalness={0.05}
            clearcoat={0.25}
            clearcoatRoughness={0.3}
          />
          {hasLogo && (
            <Decal
              position={[0 + logoX * 0.5, 0.35 + logoY * 0.7, 0.045]}
              rotation={[0, 0, 0]}
              scale={[0.9 * logoScale, 0.9 * logoScale, 1]}
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

        {/* Hardcover Back */}
        <mesh position={[0, 0, -0.22]} castShadow receiveShadow>
          <boxGeometry args={[2.2, 3.0, 0.08]} />
          <meshPhysicalMaterial
            color={color}
            roughness={0.4}
            metalness={0.05}
            clearcoat={0.25}
          />
        </mesh>

        {/* Inner Pages Block */}
        <mesh position={[0.02, 0, -0.11]}>
          <boxGeometry args={[2.08, 2.9, 0.18]} />
          <meshStandardMaterial color="#f8f6f0" roughness={0.9} />
        </mesh>

        {/* Curved Leather Spine */}
        <mesh position={[-1.1, 0, -0.11]} castShadow>
          <cylinderGeometry args={[0.13, 0.13, 3.0, 16, 1, false, Math.PI / 2, Math.PI]} />
          <meshPhysicalMaterial
            color={color}
            roughness={0.4}
            metalness={0.05}
            clearcoat={0.25}
          />
        </mesh>

        {/* Vertical Moleskine-style Elastic Closure Strap (Right edge) */}
        <mesh position={[0.75, 0, 0.055]} castShadow>
          <boxGeometry args={[0.12, 3.02, 0.015]} />
          <meshStandardMaterial color={strapColor} roughness={0.8} />
        </mesh>

        {/* Ribbon Bookmark Tail (Draping below pages) */}
        <mesh position={[0.2, -1.6, -0.11]} rotation={[0.1, 0, -0.1]}>
          <boxGeometry args={[0.08, 0.35, 0.01]} />
          <meshStandardMaterial color={bookmarkColor} roughness={0.3} metalness={0.2} />
        </mesh>
      </group>
    </Float>
  );
}

/**
 * Procedural 3D Water Bottle — slim premium metal hydro flask
 */
export function WaterBottle({ logoUrl, color = "#2d3748", logoX = 0, logoY = 0, logoScale = 1, ...props }) {
  const logoTexture = useSafeTexture(logoUrl);
  const hasLogo = Boolean(logoUrl && logoTexture);

  // Compute complementary lighter body shade and darker cap/nozzle shades
  const { bodyColor, capColor, nozzleColor } = useMemo(() => {
    const base = new THREE.Color(color);
    const bColor = base.clone().offsetHSL(0, 0, 0.04);
    const cColor = base.clone().multiplyScalar(0.65);
    const nColor = base.clone().multiplyScalar(0.45);
    return {
      bodyColor: bColor,
      capColor: cColor,
      nozzleColor: nColor,
    };
  }, [color]);

  return (
    <Float speed={2} rotationIntensity={0.3} floatIntensity={0.6}>
      <group {...props}>
        {/* Bottle body */}
        <mesh castShadow receiveShadow position={[0, -0.1, 0]}>
          <cylinderGeometry args={[0.38, 0.38, 2.2, 64]} />
          <meshPhysicalMaterial
            color={bodyColor}
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

        {/* Dynamic Darker Cap */}
        <mesh position={[0, 1.12, 0]} castShadow>
          <cylinderGeometry args={[0.22, 0.38, 0.28, 32]} />
          <meshStandardMaterial color={capColor} roughness={0.3} metalness={0.25} />
        </mesh>

        {/* Dynamic Deep Accent Nozzle */}
        <mesh position={[0, 1.30, 0]}>
          <cylinderGeometry args={[0.1, 0.12, 0.12, 16]} />
          <meshStandardMaterial color={nozzleColor} roughness={0.3} metalness={0.3} />
        </mesh>
      </group>
    </Float>
  );
}
