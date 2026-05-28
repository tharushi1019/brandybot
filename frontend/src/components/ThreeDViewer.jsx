import React, { Suspense, useState } from "react";
import { Canvas } from "@react-three/fiber";
import {
  OrbitControls,
  Stage,
  PerspectiveCamera,
  Environment,
} from "@react-three/drei";
import {
  Mug,
  BusinessCard,
  SimpleShirt,
  Hoodie,
  Notebook,
  WaterBottle,
} from "./MockupModels";

// Environment presets available in @react-three/drei
const ENVIRONMENTS = ["city", "studio", "sunset", "dawn", "night"];

/**
 * Main 3D Viewer Component
 * BUG-11 FIX: Removed conflicting `camera` prop from <Canvas>.
 * A single <PerspectiveCamera makeDefault> inside is the source of truth.
 */
export default function ThreeDViewer({
  templateType = "Coffee Mug",
  logoUrl,
  brandName,
  productColor = "#ffffff",
  rotationSpeed = 1,
  logoX = 0,
  logoY = 0,
  logoScale = 1,
}) {
  const [envIndex, setEnvIndex] = useState(0);
  const [autoRotate, setAutoRotate] = useState(true);

  const env = ENVIRONMENTS[envIndex];

  // Map template types to components
  const renderModel = () => {
    switch (templateType) {
      case "business_card":
      case "Business Card":
        return (
          <BusinessCard
            logoUrl={logoUrl}
            brandName={brandName}
            color={productColor}
            logoX={logoX}
            logoY={logoY}
            logoScale={logoScale}
          />
        );
      case "tshirt":
      case "T-Shirt":
        return (
          <SimpleShirt
            logoUrl={logoUrl}
            color={productColor}
            logoX={logoX}
            logoY={logoY}
            logoScale={logoScale}
          />
        );
      case "hoodie":
      case "Hoodie":
        return (
          <Hoodie
            logoUrl={logoUrl}
            color={productColor}
            logoX={logoX}
            logoY={logoY}
            logoScale={logoScale}
          />
        );
      case "notebook":
      case "Notebook":
        return (
          <Notebook
            logoUrl={logoUrl}
            color={productColor}
            logoX={logoX}
            logoY={logoY}
            logoScale={logoScale}
          />
        );
      case "water_bottle":
      case "Water Bottle":
        return (
          <WaterBottle
            logoUrl={logoUrl}
            color={productColor}
            logoX={logoX}
            logoY={logoY}
            logoScale={logoScale}
          />
        );
      case "mug":
      case "Coffee Mug":
      default:
        return (
          <Mug
            logoUrl={logoUrl}
            color={productColor}
            logoX={logoX}
            logoY={logoY}
            logoScale={logoScale}
          />
        );
    }
  };

  // Screenshot handler
  const handleScreenshot = () => {
    const canvas = document.querySelector("#threed-canvas canvas");
    if (!canvas) return;
    const link = document.createElement("a");
    link.href = canvas.toDataURL("image/png");
    link.download = `${brandName || "brandybot"}_3d_mockup.png`;
    link.click();
  };

  return (
    <div className="w-full h-[500px] relative" id="threed-canvas">
      {/* Canvas — no camera prop here; PerspectiveCamera inside is the single source */}
      <Canvas
        shadows
        dpr={[1, 2]}
        gl={{ preserveDrawingBuffer: true }} // needed for screenshot
        style={{ borderRadius: "1.5rem", background: "transparent" }}
        className="bg-gradient-to-b from-gray-50 to-gray-200 rounded-3xl overflow-hidden border border-gray-100 shadow-inner"
      >
        <Suspense fallback={null}>
          <PerspectiveCamera makeDefault position={[0, 0, 8]} fov={42} />

          <Stage
            environment={env}
            intensity={0.6}
            contactShadow={{ opacity: 0.5, blur: 3 }}
          >
            {renderModel()}
          </Stage>
        </Suspense>

        <OrbitControls
          makeDefault
          autoRotate={autoRotate}
          autoRotateSpeed={rotationSpeed * 2}
          enableZoom={true}
          enablePan={false}
          minPolarAngle={Math.PI / 5}
          maxPolarAngle={Math.PI / 1.4}
        />

        <Environment preset={env} background={false} />
      </Canvas>

      {/* 3D Label Overlay */}
      <div className="absolute top-4 left-4 pointer-events-none">
        <span className="px-3 py-1 bg-white/80 backdrop-blur-md rounded-full text-[10px] font-black uppercase tracking-widest text-gray-500 shadow-sm border border-white/50">
          3D Interactive Studio
        </span>
      </div>

      {/* Controls */}
      <div className="absolute top-4 right-4 flex gap-2">
        {/* Pause / Play */}
        <button
          onClick={() => setAutoRotate((v) => !v)}
          title={autoRotate ? "Pause rotation" : "Resume rotation"}
          className="px-3 py-1.5 bg-white/80 backdrop-blur-md rounded-full text-[11px] font-bold text-gray-600 shadow-sm border border-white/50 hover:bg-white transition"
        >
          {autoRotate ? "⏸ Pause" : "▶ Rotate"}
        </button>

        {/* Environment Switcher */}
        <button
          onClick={() => setEnvIndex((i) => (i + 1) % ENVIRONMENTS.length)}
          title="Switch environment lighting"
          className="px-3 py-1.5 bg-white/80 backdrop-blur-md rounded-full text-[11px] font-bold text-gray-600 shadow-sm border border-white/50 hover:bg-white transition capitalize"
        >
          💡 {env}
        </button>

        {/* Screenshot */}
        <button
          onClick={handleScreenshot}
          title="Download 3D screenshot"
          className="px-3 py-1.5 bg-white/80 backdrop-blur-md rounded-full text-[11px] font-bold text-gray-600 shadow-sm border border-white/50 hover:bg-white transition"
        >
          📸 Save
        </button>
      </div>
    </div>
  );
}
