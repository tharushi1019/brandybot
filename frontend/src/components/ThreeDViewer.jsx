import React, { Suspense, useState, Component } from "react";
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
 * Robust 3D Error Boundary
 * Prevents canvas crashes from taking down the page or turning white
 */
class ThreeDErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ThreeDViewer WebGL Error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="w-full h-[500px] flex flex-col items-center justify-center bg-gray-50 rounded-3xl border border-dashed border-gray-300 p-6 text-center">
          <span className="text-4xl mb-3">⚠️</span>
          <h4 className="text-sm font-bold text-gray-800 mb-1">3D Viewer Encountered an Issue</h4>
          <p className="text-xs text-gray-500 mb-4 max-w-sm">
            Unable to render the 3D model with WebGL. You can try refreshing or use 2D previews.
          </p>
          <button
            onClick={() => this.setState({ hasError: false, error: null })}
            className="px-4 py-2 bg-[#7C3AED] text-white text-xs font-bold rounded-xl hover:opacity-90 transition"
          >
            Retry 3D Viewer
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

/**
 * Main 3D Viewer Component
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
    <ThreeDErrorBoundary>
      <div className="w-full h-[500px] relative" id="threed-canvas">
        <Canvas
          shadows
          dpr={[1, 2]}
          gl={{ preserveDrawingBuffer: true, antialias: true, alpha: true }}
          style={{ borderRadius: "1.5rem", background: "transparent" }}
          className="bg-[var(--bg-secondary)] rounded-3xl overflow-hidden border border-[var(--border-color)] shadow-xl"
        >
          {/* Stable Camera */}
          <PerspectiveCamera makeDefault position={[0, 0, 7.5]} fov={45} />

          {/* Fallback Native Studio Lighting: guarantees instant visibility even if CDN HDR is slow or offline */}
          <ambientLight intensity={0.7} />
          <directionalLight
            position={[5, 8, 5]}
            intensity={1.2}
            castShadow
            shadow-mapSize={[1024, 1024]}
            shadow-bias={-0.0001}
          />
          <directionalLight position={[-5, -2, -4]} intensity={0.4} />
          <pointLight position={[0, 4, 3]} intensity={0.5} />

          {/* Optional HDR Environment lighting loaded asynchronously without blocking scene */}
          <Suspense fallback={null}>
            <Environment preset={env} background={false} />
          </Suspense>

          {/* Model with soft contact shadows */}
          <Suspense fallback={null}>
            <Stage
              intensity={0.4}
              environment={null}
              adjustCamera={false}
              contactShadow={{ opacity: 0.4, blur: 2.5, position: [0, -1.8, 0] }}
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
        </Canvas>

        {/* 3D Label Overlay */}
        <div className="absolute top-4 left-4 pointer-events-none">
          <span className="px-3 py-1 bg-[var(--bg-card)]/90 backdrop-blur-md rounded-full text-[10px] font-black uppercase tracking-widest text-[var(--text-secondary)] shadow-sm border border-[var(--border-color)]">
            3D Interactive Studio
          </span>
        </div>

        {/* Attribution Badge (Option B) for Hoodie */}
        {templateType?.toLowerCase()?.includes("hoodie") && (
          <div className="absolute bottom-3 left-4 pointer-events-auto">
            <span className="px-2.5 py-1 bg-[var(--bg-card)]/90 backdrop-blur-md rounded-lg text-[10px] text-[var(--text-secondary)] border border-[var(--border-color)] shadow-sm">
              Model: Hoodie by <strong className="text-[var(--text-primary)]">ShoyoX</strong> (CC BY 4.0)
            </span>
          </div>
        )}

        {/* Controls */}
        <div className="absolute top-4 right-4 flex gap-2">
          {/* Pause / Play */}
          <button
            onClick={() => setAutoRotate((v) => !v)}
            title={autoRotate ? "Pause rotation" : "Resume rotation"}
            className="px-3 py-1.5 bg-[var(--bg-card)]/90 backdrop-blur-md rounded-full text-[11px] font-bold text-[var(--text-primary)] shadow-sm border border-[var(--border-color)] hover:bg-[var(--bg-card)] transition cursor-pointer"
          >
            {autoRotate ? "⏸ Pause" : "▶ Rotate"}
          </button>

          {/* Environment Switcher */}
          <button
            onClick={() => setEnvIndex((i) => (i + 1) % ENVIRONMENTS.length)}
            title="Switch environment lighting"
            className="px-3 py-1.5 bg-[var(--bg-card)]/90 backdrop-blur-md rounded-full text-[11px] font-bold text-[var(--text-primary)] shadow-sm border border-[var(--border-color)] hover:bg-[var(--bg-card)] transition capitalize cursor-pointer"
          >
            💡 {env}
          </button>

          {/* Screenshot */}
          <button
            onClick={handleScreenshot}
            title="Download 3D screenshot"
            className="px-3 py-1.5 bg-[var(--bg-card)]/90 backdrop-blur-md rounded-full text-[11px] font-bold text-[var(--text-primary)] shadow-sm border border-[var(--border-color)] hover:bg-[var(--bg-card)] transition cursor-pointer"
          >
            📸 Save
          </button>
        </div>
      </div>
    </ThreeDErrorBoundary>
  );
}
