import React, { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Stage, PerspectiveCamera, Environment, ContactShadows } from "@react-three/drei";
import { Mug, BusinessCard, SimpleShirt } from "./MockupModels";

/**
 * Main 3D Viewer Component
 */
export default function ThreeDViewer({ 
  templateType = "mug", 
  logoUrl, 
  brandName, 
  productColor = "#ffffff",
  rotationSpeed = 1 
}) {
  
  // Map template types to components
  const Model = () => {
    switch (templateType) {
      case "business_card":
      case "Business Card":
        return <BusinessCard logoUrl={logoUrl} brandName={brandName} color={productColor} />;
      case "tshirt":
      case "T-Shirt":
        return <SimpleShirt logoUrl={logoUrl} color={productColor} />;
      case "mug":
      case "Coffee Mug":
      default:
        return <Mug logoUrl={logoUrl} color={productColor} />;
    }
  };

  return (
    <div className="w-full h-[500px] bg-gradient-to-b from-gray-50 to-gray-200 rounded-3xl overflow-hidden border border-gray-100 shadow-inner relative">
      <Canvas shadows dpr={[1, 2]} camera={{ position: [0, 0, 5], fov: 45 }}>
        <Suspense fallback={null}>
          <Stage environment="city" intensity={0.5} contactShadow={{ opacity: 0.4, blur: 2 }}>
            <Model />
          </Stage>
        </Suspense>

        <OrbitControls 
          makeDefault 
          autoRotate 
          autoRotateSpeed={rotationSpeed * 2} // Scale speed for better feel
          enableZoom={true}
          minPolarAngle={Math.PI / 4}
          maxPolarAngle={Math.PI / 1.5}
        />
        
        <PerspectiveCamera makeDefault position={[0, 0, 8]} />
      </Canvas>
      
      {/* 3D Label Overlay */}
      <div className="absolute top-4 left-4 pointer-events-none">
        <span className="px-3 py-1 bg-white/80 backdrop-blur-md rounded-full text-[10px] font-black uppercase tracking-widest text-gray-500 shadow-sm border border-white/50">
          3D Interactive Studio
        </span>
      </div>
    </div>
  );
}
