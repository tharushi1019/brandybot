import { useState, useEffect, useRef, Suspense, lazy } from "react";
import { Link, useLocation } from "react-router-dom";
import { useLogo } from "../context/LogoContext";
import api from "../services/api";
import JSZip from "jszip";

// Lazy load 3D component to keep initial load light
const ThreeDViewer = lazy(() => import("../components/ThreeDViewer"));

// ─── 2D Template Definitions ──────────────────────────────────────
// Each template has a canvas renderer function + display metadata
const TEMPLATES = [
  {
    id: "business_card",
    type: "Business Card",
    emoji: "💼",
    bgColor: "#1a1a2e",
    description: "Professional business card",
    width: 700,
    height: 400,
  },
  {
    id: "tshirt",
    type: "T-Shirt",
    emoji: "👕",
    bgColor: "#2d2d2d",
    description: "Branded merchandise T-shirt",
    width: 520,
    height: 600,
  },
  {
    id: "instagram",
    type: "Instagram Post",
    emoji: "📸",
    bgColor: "gradient",
    description: "Social media post",
    width: 520,
    height: 520,
  },
  {
    id: "mug",
    type: "Coffee Mug",
    emoji: "☕",
    bgColor: "#f5f0eb",
    description: "Branded merchandise mug",
    width: 540,
    height: 420,
  },
  {
    id: "billboard",
    type: "Billboard",
    emoji: "🏙️",
    bgColor: "#0f172a",
    description: "Outdoor advertising billboard",
    width: 700,
    height: 380,
  },
  {
    id: "notebook",
    type: "Notebook",
    emoji: "📓",
    bgColor: "#1e293b",
    description: "Branded notebook cover",
    width: 420,
    height: 560,
  },
];

// ─── Canvas Renderers ─────────────────────────────────────────────

const drawBusinessCard = (ctx, logoImg, brandName, W, H) => {
  // Dark gradient background
  const bg = ctx.createLinearGradient(0, 0, W, H);
  bg.addColorStop(0, "#0f0c29");
  bg.addColorStop(0.5, "#302b63");
  bg.addColorStop(1, "#24243e");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);

  // White card area
  const cardX = 24, cardY = 24, cardW = W - 48, cardH = H - 48, radius = 16;
  ctx.fillStyle = "#ffffff";
  ctx.beginPath();
  if (ctx.roundRect) {
    ctx.roundRect(cardX, cardY, cardW, cardH, radius);
  } else {
    ctx.rect(cardX, cardY, cardW, cardH);
  }
  ctx.fill();

  // Purple accent stripe (right side)
  const stripeX = cardX + cardW - 80;
  ctx.fillStyle = "rgba(124,58,237,0.95)";
  ctx.beginPath();
  if (ctx.roundRect) {
    ctx.roundRect(stripeX, cardY, 80, cardH, [0, radius, radius, 0]);
  } else {
    ctx.fillRect(stripeX, cardY, 80, cardH);
  }
  ctx.fill();

  // Logo on left half
  const logoSize = Math.min(cardH - 80, 160);
  const logoX = cardX + 50;
  const logoY = cardY + (cardH - logoSize) / 2;

  // White circle behind logo
  ctx.save();
  ctx.shadowColor = "rgba(0,0,0,0.12)";
  ctx.shadowBlur = 20;
  ctx.fillStyle = "#f8f8ff";
  ctx.beginPath();
  ctx.arc(logoX + logoSize / 2, logoY + logoSize / 2, logoSize / 2 + 14, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  ctx.drawImage(logoImg, logoX, logoY, logoSize, logoSize);

  // Brand name + tagline (center area)
  const textX = logoX + logoSize + 36;
  ctx.fillStyle = "#1a1a2e";
  ctx.font = "bold 26px Inter, Arial, sans-serif";
  ctx.textAlign = "left";
  ctx.fillText(brandName || "Your Brand", textX, cardY + cardH / 2 - 18);

  ctx.fillStyle = "#6b7280";
  ctx.font = "13px Inter, Arial, sans-serif";
  ctx.fillText("Creative Director", textX, cardY + cardH / 2 + 10);

  ctx.fillStyle = "#9ca3af";
  ctx.font = "12px Inter, Arial, sans-serif";
  ctx.fillText("hello@yourbrand.com", textX, cardY + cardH / 2 + 32);
  ctx.fillText("+1 (555) 000-0000", textX, cardY + cardH / 2 + 52);

  // White stripe decorative pattern
  ctx.fillStyle = "rgba(255,255,255,0.35)";
  for (let i = 0; i < 4; i++) {
    ctx.fillRect(stripeX + 20, cardY + 30 + i * 60, 40, 3);
  }
};

const drawTShirt = (ctx, logoImg, brandName, W, H) => {
  // 1. Studio backdrop: deep navy-purple vignette
  const bgGrad = ctx.createRadialGradient(W / 2, H / 2 - 20, 50, W / 2, H / 2, 380);
  bgGrad.addColorStop(0, "#1e1b2e");
  bgGrad.addColorStop(1, "#0f0d1a");
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, W, H);

  // Subtle studio grid / soft floor gradient
  const floorGrad = ctx.createLinearGradient(0, H - 120, 0, H);
  floorGrad.addColorStop(0, "rgba(0,0,0,0)");
  floorGrad.addColorStop(1, "rgba(0,0,0,0.35)");
  ctx.fillStyle = floorGrad;
  ctx.fillRect(0, H - 120, W, 120);

  // 2. Realistic Garment Soft Cast / Drop Shadow onto background
  ctx.save();
  ctx.shadowColor = "rgba(0, 0, 0, 0.45)";
  ctx.shadowBlur = 32;
  ctx.shadowOffsetY = 14;

  // Path of the T-Shirt silhouette (natural curves, realistic drape, sleeve cuffs, curved hem)
  const drawShirtPath = () => {
    ctx.beginPath();
    ctx.moveTo(195, 88);
    // Left shoulder slope
    ctx.bezierCurveTo(155, 92, 100, 115, 62, 138);
    // Left outer sleeve
    ctx.bezierCurveTo(45, 148, 24, 185, 12, 222);
    // Left sleeve cuff / opening
    ctx.bezierCurveTo(28, 236, 52, 248, 68, 252);
    // Left underarm / armpit curve
    ctx.bezierCurveTo(82, 230, 92, 210, 96, 228);
    // Left body side (subtle waist contour)
    ctx.bezierCurveTo(94, 290, 98, 420, 92, 545);
    // Bottom hem curve (natural gentle downward curve)
    ctx.bezierCurveTo(180, 560, 340, 560, 428, 545);
    // Right body side
    ctx.bezierCurveTo(422, 420, 426, 290, 424, 228);
    // Right underarm / armpit curve
    ctx.bezierCurveTo(428, 210, 438, 230, 452, 252);
    // Right sleeve cuff
    ctx.bezierCurveTo(468, 248, 492, 236, 508, 222);
    // Right outer sleeve
    ctx.bezierCurveTo(496, 185, 475, 148, 458, 138);
    // Right shoulder slope
    ctx.bezierCurveTo(420, 115, 365, 92, 325, 88);
    // Front collar dip
    ctx.bezierCurveTo(295, 138, 225, 138, 195, 88);
    ctx.closePath();
  };

  // Base fabric fill with shadow
  ctx.fillStyle = "#22242a";
  drawShirtPath();
  ctx.fill();
  ctx.restore();

  // 3. Inner Collar Back & Brand Size Tag
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(195, 88);
  ctx.bezierCurveTo(225, 62, 295, 62, 325, 88);
  ctx.bezierCurveTo(295, 122, 225, 122, 195, 88);
  ctx.closePath();
  const innerGrad = ctx.createLinearGradient(0, 60, 0, 120);
  innerGrad.addColorStop(0, "#111215");
  innerGrad.addColorStop(1, "#1c1d23");
  ctx.fillStyle = innerGrad;
  ctx.fill();

  // Premium inside woven/printed apparel label tag
  ctx.fillStyle = "rgba(255, 255, 255, 0.28)";
  ctx.font = "bold 9px Inter, Arial, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText((brandName || "BRANDYBOT").toUpperCase(), 260, 84);
  ctx.font = "7px Inter, Arial, sans-serif";
  ctx.fillStyle = "rgba(255, 255, 255, 0.18)";
  ctx.fillText("100% COMBED COTTON • M", 260, 94);
  ctx.restore();

  // 4. Fabric Shading & Natural Volume (Chest Highlight & Drape Folds)
  ctx.save();
  drawShirtPath();
  ctx.clip();

  // 4a. Overall 3D Body Lighting (Soft studio key light from top-left)
  const bodyLight = ctx.createLinearGradient(100, 100, 420, 500);
  bodyLight.addColorStop(0, "#333742");
  bodyLight.addColorStop(0.35, "#252830");
  bodyLight.addColorStop(0.7, "#1e2026");
  bodyLight.addColorStop(1, "#16171c");
  ctx.fillStyle = bodyLight;
  ctx.fill();

  // 4b. Chest Volume Highlight
  const chestLight = ctx.createRadialGradient(260, 270, 20, 260, 270, 160);
  chestLight.addColorStop(0, "rgba(255, 255, 255, 0.08)");
  chestLight.addColorStop(0.6, "rgba(255, 255, 255, 0.02)");
  chestLight.addColorStop(1, "rgba(0, 0, 0, 0)");
  ctx.fillStyle = chestLight;
  ctx.fillRect(0, 0, W, H);

  // 4c. Soft Fold Creases / Drape Shadows
  const foldL = ctx.createLinearGradient(70, 230, 160, 310);
  foldL.addColorStop(0, "rgba(0, 0, 0, 0.35)");
  foldL.addColorStop(1, "rgba(0, 0, 0, 0)");
  ctx.fillStyle = foldL;
  ctx.beginPath();
  ctx.moveTo(96, 228);
  ctx.bezierCurveTo(120, 260, 150, 300, 165, 330);
  ctx.bezierCurveTo(150, 315, 120, 275, 96, 228);
  ctx.fill();

  const foldR = ctx.createLinearGradient(450, 230, 360, 310);
  foldR.addColorStop(0, "rgba(0, 0, 0, 0.35)");
  foldR.addColorStop(1, "rgba(0, 0, 0, 0)");
  ctx.fillStyle = foldR;
  ctx.beginPath();
  ctx.moveTo(424, 228);
  ctx.bezierCurveTo(400, 260, 370, 300, 355, 330);
  ctx.bezierCurveTo(370, 315, 400, 275, 424, 228);
  ctx.fill();

  // Side flank shadow gradients
  const flankL = ctx.createLinearGradient(92, 0, 150, 0);
  flankL.addColorStop(0, "rgba(0, 0, 0, 0.3)");
  flankL.addColorStop(1, "rgba(0, 0, 0, 0)");
  ctx.fillStyle = flankL;
  ctx.fillRect(92, 220, 60, 340);

  const flankR = ctx.createLinearGradient(428, 0, 370, 0);
  flankR.addColorStop(0, "rgba(0, 0, 0, 0.3)");
  flankR.addColorStop(1, "rgba(0, 0, 0, 0)");
  ctx.fillStyle = flankR;
  ctx.fillRect(368, 220, 60, 340);

  // Sleeve Seams & Hem Creases
  ctx.strokeStyle = "rgba(255, 255, 255, 0.05)";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(115, 105);
  ctx.bezierCurveTo(100, 150, 95, 190, 96, 228);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(405, 105);
  ctx.bezierCurveTo(420, 150, 425, 190, 424, 228);
  ctx.stroke();

  // Sleeve hem stitch lines
  ctx.strokeStyle = "rgba(255, 255, 255, 0.07)";
  ctx.setLineDash([3, 2]);
  ctx.beginPath();
  ctx.moveTo(22, 218);
  ctx.lineTo(60, 240);
  ctx.moveTo(498, 218);
  ctx.lineTo(460, 240);
  // Bottom hem double stitch
  ctx.moveTo(98, 536);
  ctx.bezierCurveTo(180, 551, 340, 551, 422, 536);
  ctx.moveTo(98, 541);
  ctx.bezierCurveTo(180, 556, 340, 556, 422, 541);
  ctx.stroke();
  ctx.setLineDash([]);

  // Fine fabric weave texture
  ctx.globalAlpha = 0.035;
  ctx.fillStyle = "#ffffff";
  for (let y = 100; y < 560; y += 4) {
    ctx.fillRect(90, y, 340, 1);
  }
  ctx.globalAlpha = 1.0;

  ctx.restore();

  // 5. Ribbed Crewneck Collar Band (Outer)
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(195, 88);
  ctx.bezierCurveTo(225, 138, 295, 138, 325, 88);
  ctx.bezierCurveTo(300, 148, 220, 148, 195, 88);
  ctx.closePath();
  const collarGrad = ctx.createLinearGradient(195, 88, 325, 148);
  collarGrad.addColorStop(0, "#3a3e4b");
  collarGrad.addColorStop(0.5, "#2a2d36");
  collarGrad.addColorStop(1, "#21232b");
  ctx.fillStyle = collarGrad;
  ctx.fill();
  ctx.strokeStyle = "rgba(255, 255, 255, 0.12)";
  ctx.lineWidth = 1;
  ctx.stroke();
  ctx.restore();

  // 6. Direct-to-Garment Printed Logo & Brand Name
  const cx = W / 2;
  const cy = 295;
  const logoSize = 145;
  const lx = cx - logoSize / 2;
  const ly = cy - logoSize / 2;

  if (logoImg) {
    ctx.save();
    ctx.shadowColor = "rgba(0, 0, 0, 0.4)";
    ctx.shadowBlur = 10;
    ctx.shadowOffsetY = 3;
    ctx.drawImage(logoImg, lx, ly, logoSize, logoSize);
    ctx.restore();
  }

  // Brand Name
  ctx.save();
  ctx.shadowColor = "rgba(0, 0, 0, 0.5)";
  ctx.shadowBlur = 6;
  ctx.shadowOffsetY = 2;
  ctx.fillStyle = "rgba(241, 245, 249, 0.95)";
  ctx.font = "bold 18px Inter, Arial, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText(brandName || "Your Brand", cx, ly + logoSize + 28);

  ctx.fillStyle = "rgba(148, 163, 184, 0.75)";
  ctx.font = "500 11px Inter, Arial, sans-serif";
  ctx.fillText("PREMIUM APPAREL", cx, ly + logoSize + 46);
  ctx.restore();
};

const drawInstagram = (ctx, logoImg, brandName, W, H) => {
  // Gradient background
  const grad = ctx.createLinearGradient(0, 0, W, H);
  grad.addColorStop(0, "#667eea");
  grad.addColorStop(0.5, "#764ba2");
  grad.addColorStop(1, "#f093fb");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, W, H);

  // Decorative circles
  ctx.globalAlpha = 0.12;
  ctx.fillStyle = "#ffffff";
  ctx.beginPath();
  ctx.arc(W - 60, 60, 120, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(60, H - 60, 90, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 1;

  // Grid dots pattern
  ctx.globalAlpha = 0.08;
  ctx.fillStyle = "#ffffff";
  for (let x = 20; x < W; x += 30) {
    for (let y = 20; y < H; y += 30) {
      ctx.beginPath();
      ctx.arc(x, y, 2, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  ctx.globalAlpha = 1;

  // White glass card for logo
  const cardSize = 200, cardX = (W - cardSize) / 2, cardY = 90;
  ctx.save();
  ctx.shadowColor = "rgba(0,0,0,0.3)";
  ctx.shadowBlur = 30;
  ctx.fillStyle = "rgba(255,255,255,0.22)";
  ctx.beginPath();
  if (ctx.roundRect) ctx.roundRect(cardX, cardY, cardSize, cardSize, 24);
  else ctx.rect(cardX, cardY, cardSize, cardSize);
  ctx.fill();
  ctx.strokeStyle = "rgba(255,255,255,0.5)";
  ctx.lineWidth = 1.5;
  ctx.stroke();
  ctx.restore();

  // Logo
  const logoSize = 150;
  ctx.save();
  ctx.shadowColor = "rgba(0,0,0,0.2)";
  ctx.shadowBlur = 10;
  ctx.drawImage(logoImg, cardX + (cardSize - logoSize) / 2, cardY + (cardSize - logoSize) / 2, logoSize, logoSize);
  ctx.restore();

  // Brand name
  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 28px Inter, Arial, sans-serif";
  ctx.textAlign = "center";
  ctx.shadowColor = "rgba(0,0,0,0.3)";
  ctx.shadowBlur = 10;
  ctx.fillText(brandName || "Your Brand", W / 2, cardY + cardSize + 50);

  // Tagline
  ctx.fillStyle = "rgba(255,255,255,0.8)";
  ctx.font = "14px Inter, Arial, sans-serif";
  ctx.shadowBlur = 0;
  ctx.fillText("Built with ✨ BrandyBot AI", W / 2, cardY + cardSize + 78);
};

const drawMug = (ctx, logoImg, brandName, W, H) => {
  // 1. Studio backdrop: dark premium product studio (brand-unified)
  const bgGrad = ctx.createLinearGradient(0, 0, 0, H);
  bgGrad.addColorStop(0, "#0f0c29");
  bgGrad.addColorStop(0.55, "#16103a");
  bgGrad.addColorStop(1, "#0b0921");
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, W, H);

  // Dark surface with subtle purple reflection
  const tableY = 285;
  const tableGrad = ctx.createLinearGradient(0, tableY, 0, H);
  tableGrad.addColorStop(0, "rgba(124, 58, 237, 0.06)");
  tableGrad.addColorStop(0.2, "rgba(90, 40, 180, 0.04)");
  tableGrad.addColorStop(1, "rgba(40, 15, 80, 0.1)");
  ctx.fillStyle = tableGrad;
  ctx.fillRect(0, tableY, W, H - tableY);

  // Purple studio spotlight glow behind mug
  const spotGrad = ctx.createRadialGradient(232, 215, 30, 232, 215, 210);
  spotGrad.addColorStop(0, "rgba(124, 58, 237, 0.22)");
  spotGrad.addColorStop(0.5, "rgba(90, 40, 180, 0.08)");
  spotGrad.addColorStop(1, "rgba(124, 58, 237, 0)");
  ctx.fillStyle = spotGrad;
  ctx.fillRect(0, 0, W, H);

  // Mug Geometry Setup
  const mugX = 130;       // left edge of cylinder
  const mugW = 205;       // width of cylinder
  const mugRight = mugX + mugW; // 335
  const mugTop = 100;     // top rim center Y
  const mugBottom = 330;  // bottom base center Y
  const rimRx = mugW / 2; // 102.5
  const rimRy = 22;       // vertical radius of rim ellipse
  const cx = mugX + rimRx;// 232.5

  // 2. Realistic Multi-layered Shadows on dark tabletop
  ctx.save();
  const castGrad = ctx.createRadialGradient(cx + 40, mugBottom + 12, 10, cx + 55, mugBottom + 12, 140);
  castGrad.addColorStop(0, "rgba(0, 0, 0, 0.55)");
  castGrad.addColorStop(0.5, "rgba(0, 0, 0, 0.22)");
  castGrad.addColorStop(1, "rgba(0, 0, 0, 0)");
  ctx.fillStyle = castGrad;
  ctx.beginPath();
  ctx.ellipse(cx + 50, mugBottom + 14, 130, 24, 0.05, 0, Math.PI * 2);
  ctx.fill();

  // Tight dark contact shadow under base
  ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
  ctx.beginPath();
  ctx.ellipse(cx, mugBottom + 2, rimRx - 8, 9, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // 3. Ceramic C-Handle (drawn behind cylinder edge, looping out to right)
  const hTop = 135;
  const hBottom = 285;
  const hOuterX = 425;
  const hInnerX = 385;

  ctx.save();
  ctx.shadowColor = "rgba(0, 0, 0, 0.15)";
  ctx.shadowBlur = 12;
  ctx.shadowOffsetX = 4;
  ctx.shadowOffsetY = 4;

  ctx.beginPath();
  ctx.moveTo(mugRight - 10, hTop);
  ctx.bezierCurveTo(mugRight + 70, hTop - 12, hOuterX, hTop + 35, hOuterX, (hTop + hBottom) / 2);
  ctx.bezierCurveTo(hOuterX, hBottom - 35, mugRight + 70, hBottom + 12, mugRight - 10, hBottom);
  ctx.bezierCurveTo(mugRight + 45, hBottom - 10, hInnerX, hBottom - 40, hInnerX, (hTop + hBottom) / 2);
  ctx.bezierCurveTo(hInnerX, hTop + 40, mugRight + 45, hTop + 10, mugRight - 10, hTop);
  ctx.closePath();

  const handleGrad = ctx.createLinearGradient(mugRight, hTop, hOuterX, hBottom);
  handleGrad.addColorStop(0, "#ffffff");
  handleGrad.addColorStop(0.2, "#f8f6f2");
  handleGrad.addColorStop(0.5, "#ece6dc");
  handleGrad.addColorStop(0.85, "#d6cdc0");
  handleGrad.addColorStop(1, "#f2ede5");
  ctx.fillStyle = handleGrad;
  ctx.fill();
  ctx.restore();

  // Handle subtle outer highlight line
  ctx.strokeStyle = "rgba(255, 255, 255, 0.8)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(mugRight + 10, hTop);
  ctx.bezierCurveTo(mugRight + 70, hTop - 10, hOuterX - 2, hTop + 35, hOuterX - 2, (hTop + hBottom) / 2);
  ctx.stroke();

  // 4. Mug Body (Cylindrical form)
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(mugX, mugTop);
  ctx.lineTo(mugX, mugBottom);
  ctx.bezierCurveTo(mugX, mugBottom + rimRy, mugRight, mugBottom + rimRy, mugRight, mugBottom);
  ctx.lineTo(mugRight, mugTop);
  ctx.bezierCurveTo(mugRight, mugTop - rimRy, mugX, mugTop - rimRy, mugX, mugTop);
  ctx.closePath();

  // High-gloss Ceramic Cylinder Shading
  const mugGrad = ctx.createLinearGradient(mugX, 0, mugRight, 0);
  mugGrad.addColorStop(0, "#dfdad0");
  mugGrad.addColorStop(0.08, "#f2eee7");
  mugGrad.addColorStop(0.22, "#ffffff");
  mugGrad.addColorStop(0.38, "#ffffff");
  mugGrad.addColorStop(0.65, "#f0ece4");
  mugGrad.addColorStop(0.88, "#d8d1c5");
  mugGrad.addColorStop(1, "#c8c0b2");
  ctx.fillStyle = mugGrad;
  ctx.fill();

  // Vertical glaze sheen streak
  const sheenGrad = ctx.createLinearGradient(mugX + 40, 0, mugX + 75, 0);
  sheenGrad.addColorStop(0, "rgba(255, 255, 255, 0)");
  sheenGrad.addColorStop(0.5, "rgba(255, 255, 255, 0.65)");
  sheenGrad.addColorStop(1, "rgba(255, 255, 255, 0)");
  ctx.fillStyle = sheenGrad;
  ctx.fillRect(mugX + 40, mugTop, 35, mugBottom - mugTop + rimRy);

  // Bottom base curve ceramic rim shadow
  const baseGrad = ctx.createLinearGradient(0, mugBottom - 10, 0, mugBottom + rimRy);
  baseGrad.addColorStop(0, "rgba(0, 0, 0, 0)");
  baseGrad.addColorStop(1, "rgba(0, 0, 0, 0.12)");
  ctx.fillStyle = baseGrad;
  ctx.beginPath();
  ctx.moveTo(mugX, mugBottom);
  ctx.bezierCurveTo(mugX, mugBottom + rimRy, mugRight, mugBottom + rimRy, mugRight, mugBottom);
  ctx.lineTo(mugRight, mugBottom - 8);
  ctx.bezierCurveTo(mugRight, mugBottom + rimRy - 8, mugX, mugBottom + rimRy - 8, mugX, mugBottom - 8);
  ctx.closePath();
  ctx.fill();

  ctx.restore();

  // 5. Mug Interior & Fresh Hot Coffee
  ctx.save();
  ctx.beginPath();
  ctx.ellipse(cx, mugTop, rimRx, rimRy, 0, 0, Math.PI * 2);
  ctx.fillStyle = "#ebe6de";
  ctx.fill();

  // Inner rim cavity (shadow inside mug)
  const innerRx = rimRx - 7;
  const innerRy = rimRy - 3.5;
  ctx.beginPath();
  ctx.ellipse(cx, mugTop + 2, innerRx, innerRy, 0, 0, Math.PI * 2);
  const innerWallGrad = ctx.createLinearGradient(0, mugTop - rimRy, 0, mugTop + rimRy + 10);
  innerWallGrad.addColorStop(0, "#736a5e");
  innerWallGrad.addColorStop(0.5, "#a89f92");
  innerWallGrad.addColorStop(1, "#dcd6cb");
  ctx.fillStyle = innerWallGrad;
  ctx.fill();

  // Liquid Coffee Surface
  const liquidY = mugTop + 6;
  const liquidRx = innerRx - 4;
  const liquidRy = innerRy - 3;
  ctx.beginPath();
  ctx.ellipse(cx, liquidY, liquidRx, liquidRy, 0, 0, Math.PI * 2);
  const coffeeGrad = ctx.createRadialGradient(cx - 20, liquidY - 2, 5, cx, liquidY, liquidRx);
  coffeeGrad.addColorStop(0, "#3d2112");
  coffeeGrad.addColorStop(0.65, "#25140b");
  coffeeGrad.addColorStop(0.92, "#180d07");
  coffeeGrad.addColorStop(1, "#7d4a25");
  ctx.fillStyle = coffeeGrad;
  ctx.fill();

  // Specular light reflection glint on coffee liquid surface
  ctx.fillStyle = "rgba(255, 255, 255, 0.4)";
  ctx.beginPath();
  ctx.ellipse(cx - 32, liquidY - 3, 14, 3, -0.2, 0, Math.PI * 2);
  ctx.fill();

  // Crisp porcelain front-rim highlight edge
  ctx.strokeStyle = "rgba(255, 255, 255, 0.95)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.ellipse(cx, mugTop + 1, rimRx - 1, rimRy - 1, 0, Math.PI * 0.1, Math.PI * 0.9);
  ctx.stroke();
  ctx.restore();

  // 6. Ceramic Decal Logo & Typography Printed on Mug Body
  const logoSize = 105;
  const logoCenterY = 222;
  const lx = cx - logoSize / 2;
  const ly = logoCenterY - logoSize / 2;

  ctx.save();
  ctx.beginPath();
  ctx.moveTo(mugX + 4, mugTop + 8);
  ctx.lineTo(mugX + 4, mugBottom - 2);
  ctx.bezierCurveTo(mugX + 4, mugBottom + rimRy - 2, mugRight - 4, mugBottom + rimRy - 2, mugRight - 4, mugBottom - 2);
  ctx.lineTo(mugRight - 4, mugTop + 8);
  ctx.bezierCurveTo(mugRight - 4, mugTop + rimRy, mugX + 4, mugTop + rimRy, mugX + 4, mugTop + 8);
  ctx.closePath();
  ctx.clip();

  if (logoImg) {
    ctx.save();
    ctx.shadowColor = "rgba(0, 0, 0, 0.1)";
    ctx.shadowBlur = 6;
    ctx.shadowOffsetY = 2;
    ctx.drawImage(logoImg, lx, ly, logoSize, logoSize);
    ctx.restore();
  }

  // Glaze shine overlay over logo
  const logoGloss = ctx.createLinearGradient(mugX + 40, 0, mugX + 75, 0);
  logoGloss.addColorStop(0, "rgba(255, 255, 255, 0)");
  logoGloss.addColorStop(0.5, "rgba(255, 255, 255, 0.28)");
  logoGloss.addColorStop(1, "rgba(255, 255, 255, 0)");
  ctx.fillStyle = logoGloss;
  ctx.fillRect(lx - 20, ly - 10, logoSize + 40, logoSize + 50);

  // Brand Name printed below logo (white on dark bg)
  ctx.fillStyle = "rgba(241, 245, 249, 0.95)";
  ctx.font = "bold 15px Inter, Arial, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText(brandName || "Your Brand", cx, ly + logoSize + 22);

  ctx.fillStyle = "rgba(148, 163, 184, 0.80)";
  ctx.font = "600 9px Inter, Arial, sans-serif";
  ctx.fillText("COFFEE & CO.", cx, ly + logoSize + 36);

  ctx.restore();

  // 7. Delicate Steam Wisps
  ctx.save();
  ctx.strokeStyle = "rgba(255, 255, 255, 0.25)";
  ctx.lineWidth = 3;
  ctx.lineCap = "round";
  ctx.shadowColor = "rgba(255, 255, 255, 0.4)";
  ctx.shadowBlur = 8;

  ctx.beginPath();
  ctx.moveTo(cx - 15, mugTop - 8);
  ctx.bezierCurveTo(cx - 30, mugTop - 35, cx + 5, mugTop - 55, cx - 10, mugTop - 85);
  ctx.stroke();

  ctx.lineWidth = 2;
  ctx.strokeStyle = "rgba(255, 255, 255, 0.18)";
  ctx.beginPath();
  ctx.moveTo(cx + 15, mugTop - 6);
  ctx.bezierCurveTo(cx + 35, mugTop - 32, cx + 5, mugTop - 50, cx + 22, mugTop - 75);
  ctx.stroke();
  ctx.restore();
};

const drawBillboard = (ctx, logoImg, brandName, W, H) => {
  // Night sky background
  const bg = ctx.createLinearGradient(0, 0, 0, H);
  bg.addColorStop(0, "#0f172a");
  bg.addColorStop(1, "#1e293b");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);

  // Stars
  ctx.fillStyle = "rgba(255,255,255,0.6)";
  for (let i = 0; i < 60; i++) {
    const sx = Math.random() * W;
    const sy = Math.random() * H * 0.5;
    ctx.beginPath();
    ctx.arc(sx, sy, Math.random() * 1.5, 0, Math.PI * 2);
    ctx.fill();
  }

  // Billboard frame (poles)
  ctx.fillStyle = "#374151";
  ctx.fillRect(W / 2 - 18, H * 0.5, 36, H * 0.5);

  // Billboard board
  const bX = 40, bY = 28, bW = W - 80, bH = H * 0.55;
  ctx.save();
  ctx.shadowColor = "rgba(0,0,0,0.5)";
  ctx.shadowBlur = 40;
  ctx.shadowOffsetY = 10;

  const boardGrad = ctx.createLinearGradient(bX, bY, bX + bW, bY + bH);
  boardGrad.addColorStop(0, "#1e1b4b");
  boardGrad.addColorStop(1, "#312e81");
  ctx.fillStyle = boardGrad;
  ctx.beginPath();
  if (ctx.roundRect) ctx.roundRect(bX, bY, bW, bH, 12);
  else ctx.rect(bX, bY, bW, bH);
  ctx.fill();
  ctx.restore();

  // Border glow
  ctx.strokeStyle = "#7C3AED";
  ctx.lineWidth = 3;
  ctx.beginPath();
  if (ctx.roundRect) ctx.roundRect(bX, bY, bW, bH, 12);
  else ctx.rect(bX, bY, bW, bH);
  ctx.stroke();

  // Logo left side of board
  const logoSize = Math.min(bH - 48, 160);
  const logoX = bX + 40;
  const logoY = bY + (bH - logoSize) / 2;

  ctx.save();
  ctx.shadowColor = "rgba(124,58,237,0.4)";
  ctx.shadowBlur = 20;
  ctx.fillStyle = "rgba(255,255,255,0.07)";
  ctx.beginPath();
  ctx.arc(logoX + logoSize / 2, logoY + logoSize / 2, logoSize / 2 + 16, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  ctx.drawImage(logoImg, logoX, logoY, logoSize, logoSize);

  // Text right side
  const textX = logoX + logoSize + 40;
  ctx.fillStyle = "#ffffff";
  ctx.font = `bold ${Math.min(30, bW * 0.05)}px Inter, Arial, sans-serif`;
  ctx.textAlign = "left";
  ctx.fillText(brandName || "Your Brand", textX, bY + bH / 2 - 20);

  ctx.fillStyle = "rgba(255,255,255,0.55)";
  ctx.font = "13px Inter, Arial, sans-serif";
  ctx.fillText("Where great brands begin.", textX, bY + bH / 2 + 8);

  // Neon underline
  ctx.strokeStyle = "#7C3AED";
  ctx.lineWidth = 2;
  ctx.shadowColor = "#7C3AED";
  ctx.shadowBlur = 10;
  ctx.beginPath();
  ctx.moveTo(textX, bY + bH / 2 + 18);
  ctx.lineTo(textX + 140, bY + bH / 2 + 18);
  ctx.stroke();
  ctx.shadowBlur = 0;
};

const drawNotebook = (ctx, logoImg, brandName, W, H) => {
  // Cover background
  const bg = ctx.createLinearGradient(0, 0, W, H);
  bg.addColorStop(0, "#1e293b");
  bg.addColorStop(1, "#0f172a");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);

  // Pages (right side offset shadow effect)
  ctx.fillStyle = "#e8e8e0";
  for (let i = 4; i >= 0; i--) {
    ctx.fillStyle = `rgba(240,240,230,${0.4 + i * 0.1})`;
    ctx.beginPath();
    if (ctx.roundRect) ctx.roundRect(22 + i * 2, 22 + i * 2, W - 44, H - 44, 8);
    else ctx.rect(22 + i * 2, 22 + i * 2, W - 44, H - 44);
    ctx.fill();
  }

  // Cover
  ctx.save();
  ctx.shadowColor = "rgba(0,0,0,0.4)";
  ctx.shadowBlur = 20;
  ctx.shadowOffsetX = -4;
  ctx.fillStyle = "#1e293b";
  ctx.beginPath();
  if (ctx.roundRect) ctx.roundRect(20, 20, W - 44, H - 40, 8);
  else ctx.rect(20, 20, W - 44, H - 40);
  ctx.fill();
  ctx.restore();

  // Subtle texture on cover
  ctx.globalAlpha = 0.04;
  ctx.fillStyle = "#ffffff";
  for (let y = 20; y < H - 20; y += 14) {
    ctx.fillRect(20, y, W - 44, 1);
  }
  ctx.globalAlpha = 1;

  // Purple top accent bar
  ctx.fillStyle = "#7C3AED";
  ctx.beginPath();
  if (ctx.roundRect) ctx.roundRect(20, 20, W - 44, 7, [8, 8, 0, 0]);
  else ctx.fillRect(20, 20, W - 44, 7);
  ctx.fill();

  // Logo center
  const logoSize = Math.min(W - 120, H * 0.35, 180);
  const logoX = 20 + (W - 44 - logoSize) / 2;
  const logoY = 20 + 40;

  ctx.save();
  ctx.shadowColor = "rgba(124,58,237,0.3)";
  ctx.shadowBlur = 20;
  ctx.fillStyle = "rgba(255,255,255,0.06)";
  ctx.beginPath();
  ctx.arc(logoX + logoSize / 2, logoY + logoSize / 2, logoSize / 2 + 18, 0, Math.PI * 2);
  ctx.fill();
  ctx.drawImage(logoImg, logoX, logoY, logoSize, logoSize);
  ctx.restore();

  // Brand name
  ctx.fillStyle = "#ffffff";
  ctx.font = `bold ${Math.min(22, W * 0.05)}px Inter, Arial, sans-serif`;
  ctx.textAlign = "center";
  ctx.fillText(brandName || "Your Brand", W / 2 - 12, logoY + logoSize + 42);

  // Tagline
  ctx.fillStyle = "rgba(255,255,255,0.45)";
  ctx.font = "11px Inter, Arial, sans-serif";
  ctx.fillText("brandybot.ai", W / 2 - 12, logoY + logoSize + 64);

  // Elastic strap line
  ctx.strokeStyle = "#7C3AED";
  ctx.lineWidth = 3;
  ctx.shadowColor = "#7C3AED";
  ctx.shadowBlur = 6;
  ctx.beginPath();
  ctx.moveTo(20, H / 2);
  ctx.lineTo(W - 24, H / 2);
  ctx.stroke();
  ctx.shadowBlur = 0;

  // Spiral dots on left spine
  ctx.fillStyle = "#4B5563";
  for (let y = 60; y < H - 60; y += 32) {
    ctx.beginPath();
    ctx.arc(34, y, 5, 0, Math.PI * 2);
    ctx.fill();
  }
};

// ─── Master canvas renderer ────────────────────────────────────
const RENDERERS = {
  business_card: drawBusinessCard,
  tshirt: drawTShirt,
  instagram: drawInstagram,
  mug: drawMug,
  billboard: drawBillboard,
  notebook: drawNotebook,
};

const generateMockupCanvas = (logoImg, template, brandName) => {
  const canvas = document.createElement("canvas");
  canvas.width = template.width;
  canvas.height = template.height;
  const ctx = canvas.getContext("2d");
  const renderer = RENDERERS[template.id];
  if (renderer) {
    renderer(ctx, logoImg, brandName, template.width, template.height);
  }
  // ── BrandyBot watermark (subtle, bottom-right) ──
  ctx.save();
  ctx.globalAlpha = 0.38;
  ctx.shadowColor = "rgba(0,0,0,0.6)";
  ctx.shadowBlur = 5;
  ctx.fillStyle = "#ffffff";
  ctx.font = `bold ${Math.round(template.height * 0.028)}px Inter, Arial, sans-serif`;
  ctx.textAlign = "right";
  ctx.fillText("⚡ brandybot.ai", template.width - 10, template.height - 8);
  ctx.restore();
  return canvas.toDataURL("image/png");
};

// ─── 3D product list (must match ThreeDViewer/MockupModels) ───────
const THREE_D_PRODUCTS = [
  { type: "Coffee Mug", emoji: "☕" },
  { type: "Business Card", emoji: "💼" },
  { type: "T-Shirt", emoji: "👕" },
  { type: "Hoodie", emoji: "🧥" },
  { type: "Notebook", emoji: "📓" },
  { type: "Water Bottle", emoji: "💧" },
];

// ─── Main Component ────────────────────────────────────────────────
export default function MockUpGenerator() {
  const location = useLocation();
  const { logoData } = useLogo();

  const passedLogoUrl = location.state?.logoUrl || logoData?.logoUrl;
  const passedBrandName = location.state?.brandName || logoData?.brandName;

  const [mockups, setMockups] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const logoImgRef = useRef(null);

  // 3D Studio state
  const [viewMode, setViewMode] = useState("2D");
  const [productColor, setProductColor] = useState("#ffffff");
  const [rotationSpeed, setRotationSpeed] = useState(1);
  const [activeTemplate, setActiveTemplate] = useState("Coffee Mug");
  const [logoX, setLogoX] = useState(0);
  const [logoY, setLogoY] = useState(0);
  const [logoScale, setLogoScale] = useState(1);

  // Background removal
  const [transparentLogoUrl, setTransparentLogoUrl] = useState(null);
  const [isRemovingBg, setIsRemovingBg] = useState(false);
  const [bgError, setBgError] = useState(null);

  useEffect(() => {
    if (!passedLogoUrl) return;
    setTransparentLogoUrl(null);
    setBgError(null);
    const fetchTransparentLogo = async () => {
      setIsRemovingBg(true);
      try {
        // Use the shared api instance (auto-attaches Firebase token)
        const res = await api.post("/utils/remove-bg", {
          imageUrl: passedLogoUrl,
        });
        if (res.data?.data?.transparentUrl) {
          setTransparentLogoUrl(res.data.data.transparentUrl);
        } else {
          setTransparentLogoUrl(passedLogoUrl);
        }
      } catch (err) {
        console.error("Failed to remove background:", err);
        setBgError("Could not remove background. Using original logo.");
        setTransparentLogoUrl(passedLogoUrl);
      } finally {
        setIsRemovingBg(false);
      }
    };
    fetchTransparentLogo();
  }, [passedLogoUrl]);

  useEffect(() => {
    if (transparentLogoUrl && !isRemovingBg) {
      generateAllMockups();
    }
  }, [transparentLogoUrl, isRemovingBg]);

  const generateAllMockups = () => {
    setIsGenerating(true);
    setMockups([]);
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      logoImgRef.current = img;
      const generated = TEMPLATES.map((template) => ({
        id: template.id,
        type: template.type,
        emoji: template.emoji,
        description: template.description,
        imageUrl: generateMockupCanvas(img, template, passedBrandName),
      }));
      setMockups(generated);
      setIsGenerating(false);
    };
    img.onerror = () => {
      console.error("Failed to load logo image for mockup canvas");
      setIsGenerating(false);
    };
    img.src = transparentLogoUrl;
  };

  const handleDownloadSingle = (mockup) => {
    const link = document.createElement("a");
    link.href = mockup.imageUrl;
    link.download = `${passedBrandName || "brand"}_${mockup.type.replace(/\s+/g, "_")}.png`;
    link.click();
  };

  const handleDownloadAll = async () => {
    const zip = new JSZip();
    mockups.forEach((mockup) => {
      const base64 = mockup.imageUrl.replace(/^data:image\/png;base64,/, "");
      zip.file(`${mockup.type.replace(/\s+/g, "_")}.png`, base64, { base64: true });
    });
    const zipBlob = await zip.generateAsync({ type: "blob" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(zipBlob);
    link.download = `${passedBrandName || "brand"}_mockups.zip`;
    link.click();
  };

  // ─── Status panels ────────────────────────────────────────────
  const LoadingPanel = ({ message }) => (
    <div className="flex flex-col items-center justify-center h-60 gap-4">
      <div className="relative w-14 h-14">
        <div className="absolute inset-0 rounded-full border-4 border-purple-100" />
        <div className="absolute inset-0 rounded-full border-4 border-t-[#7C3AED] animate-spin" />
      </div>
      <p className="text-sm font-medium text-gray-500">{message}</p>
    </div>
  );

  return (
    <div className="flex flex-col h-full w-full relative">
      {/* Top Bar */}
      <div className="flex items-center justify-between px-6 py-4 md:pl-20 border-b border-[var(--border-color)] bg-[var(--bg-secondary)] flex-shrink-0">
        <div>
          <h1 className="text-xl font-black text-[var(--text-primary)] tracking-tight">
            Mockup Studio
          </h1>
          <p className="text-sm text-[var(--text-muted)]">
            Preview your brand on real products — 2D &amp; 3D
          </p>
        </div>
        {passedLogoUrl && (
          <img
            src={passedLogoUrl}
            alt="Your logo"
            className="h-10 w-10 rounded-lg bg-white p-1 object-contain border border-[var(--border-color)] shadow-sm"
          />
        )}
      </div>

      {/* Mode Switcher */}
      <div className="flex justify-center mt-6 px-6">
        <div className="bg-[var(--bg-secondary)] p-1 rounded-2xl border border-[var(--border-color)] flex gap-1 shadow-sm">
          <button
            id="mode-2d"
            onClick={() => setViewMode("2D")}
            className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${
              viewMode === "2D"
                ? "bg-white text-[var(--text-primary)] shadow-sm"
                : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
            }`}
          >
            🖼️ 2D Canvas Grid
          </button>
          <button
            id="mode-3d"
            onClick={() => setViewMode("3D")}
            className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${
              viewMode === "3D"
                ? "bg-white text-[var(--text-primary)] shadow-sm"
                : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
            }`}
          >
            🧊 3D Studio
          </button>
        </div>
      </div>

      {/* No Logo State */}
      {!passedLogoUrl && (
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="bg-white rounded-3xl p-12 shadow-lg text-center border border-gray-100 max-w-md">
            <span className="text-5xl mb-4 block">🎨</span>
            <h2 className="text-2xl font-bold text-gray-800 mb-3">No Logo Yet</h2>
            <p className="text-gray-500 mb-6">
              Create a logo first, then come back here to see how it looks on
              real products.
            </p>
            <Link
              to="/logo-agent"
              className="px-6 py-3 text-white rounded-xl font-semibold text-sm inline-block hover:opacity-90 transition"
              style={{ background: "linear-gradient(90deg, #7C3AED, #3B82F6)" }}
            >
              Go to Logo Agent
            </Link>
          </div>
        </div>
      )}

      {/* Content */}
      {passedLogoUrl && (
        <div
          className={`flex-1 max-w-6xl mx-auto w-full px-6 py-6 ${
            viewMode === "2D" ? "pb-28" : "pb-6"
          }`}
        >

          {/* Status banners */}
          {bgError && (
            <div className="mb-4 px-4 py-2 bg-amber-50 border border-amber-200 text-amber-700 text-sm rounded-xl">
              ⚠️ {bgError}
            </div>
          )}

          {/* ── 2D Grid ── */}
          {viewMode === "2D" && (
            <>
              {isRemovingBg && (
                <LoadingPanel message="Removing background from logo..." />
              )}
              {isGenerating && !isRemovingBg && (
                <LoadingPanel message="Rendering mockup templates..." />
              )}

              {!isGenerating && !isRemovingBg && mockups.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {mockups.map((mockup) => (
                    <div
                      key={mockup.id}
                      className="bg-white rounded-3xl shadow-md border border-gray-100 overflow-hidden hover:shadow-xl transition-shadow group"
                    >
                      {/* Card header */}
                      <div className="bg-gradient-to-r from-purple-50 to-blue-50 px-5 py-3 border-b border-gray-100 flex items-center gap-3">
                        <span className="text-2xl">{mockup.emoji}</span>
                        <div>
                          <h3 className="font-bold text-gray-900 text-sm">
                            {mockup.type}
                          </h3>
                          <p className="text-xs text-gray-400">
                            {mockup.description}
                          </p>
                        </div>
                      </div>

                      {/* Preview */}
                      <div className="p-4">
                        <div className="rounded-2xl overflow-hidden bg-gray-50 border border-gray-100 flex items-center justify-center min-h-[200px]">
                          <img
                            src={mockup.imageUrl}
                            alt={mockup.type}
                            className="w-full object-contain"
                            style={{ maxHeight: "280px" }}
                          />
                        </div>
                        <button
                          id={`download-${mockup.id}`}
                          onClick={() => handleDownloadSingle(mockup)}
                          className="mt-3 w-full py-2.5 text-white rounded-xl text-sm font-semibold hover:opacity-90 transition"
                          style={{
                            background:
                              "linear-gradient(90deg, #7C3AED, #3B82F6)",
                          }}
                        >
                          ⬇ Download PNG
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {/* ── 3D Studio ── */}
          {viewMode === "3D" && (
            <div className="flex flex-col gap-4">
              {/* Horizontal Product Selector */}
              <div className="bg-[var(--bg-card)] p-2.5 rounded-2xl border border-[var(--border-color)] shadow-sm">
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
                  {THREE_D_PRODUCTS.map((p) => {
                    const isActive = activeTemplate === p.type;
                    return (
                      <button
                        key={p.type}
                        id={`3d-product-${p.type.toLowerCase().replace(/\s+/g, "-")}`}
                        onClick={() => setActiveTemplate(p.type)}
                        className={`flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl border text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                          isActive
                            ? "border-[#7C3AED] bg-[#7C3AED]/15 text-[#7C3AED] shadow-sm ring-1 ring-[#7C3AED]/30"
                            : "border-[var(--border-color)] bg-[var(--bg-secondary)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[#7C3AED]/40 hover:bg-[var(--bg-card-hover)]"
                        }`}
                      >
                        <span className="text-lg leading-none">{p.emoji}</span>
                        <span className="truncate">{p.type}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Main 3D Canvas + Controls Row */}
              <div className="flex flex-col lg:flex-row gap-5 items-start">
                {/* Viewer */}
                <div className="flex-1 w-full min-w-0">
                  <Suspense
                    fallback={
                      <div className="h-[500px] w-full flex items-center justify-center bg-[var(--bg-secondary)] rounded-3xl border border-dashed border-[var(--border-color)]">
                        <p className="text-[var(--text-muted)] text-sm font-medium animate-pulse">
                          Loading 3D Engine...
                        </p>
                      </div>
                    }
                  >
                    <ThreeDViewer
                      templateType={activeTemplate}
                      logoUrl={transparentLogoUrl}
                      brandName={passedBrandName}
                      productColor={productColor}
                      rotationSpeed={rotationSpeed}
                      logoX={logoX}
                      logoY={logoY}
                      logoScale={logoScale}
                    />
                  </Suspense>
                </div>

                {/* 3D Controls sidebar */}
                <div className="w-full lg:w-80 flex flex-col gap-3 shrink-0">
                  <div className="bg-[var(--bg-card)] rounded-3xl p-5 shadow-lg border border-[var(--border-color)] flex flex-col gap-4">
                    <div className="flex items-center justify-between pb-3 border-b border-[var(--border-color)]">
                      <h3 className="font-extrabold text-[var(--text-primary)] flex items-center gap-2 text-sm tracking-wide">
                        <span>🔧</span> Studio Controls
                      </h3>
                      <span className="text-[10px] font-bold text-[#7C3AED] bg-[#7C3AED]/10 px-2 py-0.5 rounded-full border border-[#7C3AED]/20">
                        Live 3D
                      </span>
                    </div>

                    {/* Color Picker */}
                    <div>
                      <label className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-wider mb-2 block">
                        Product Color
                      </label>
                      <div className="flex flex-wrap gap-2 items-center">
                        {[
                          "#ffffff",
                          "#1a1a1a",
                          "#7C3AED",
                          "#3B82F6",
                          "#EF4444",
                          "#10B981",
                          "#F59E0B",
                          "#EC4899",
                        ].map((c) => (
                          <button
                            key={c}
                            onClick={() => setProductColor(c)}
                            className={`w-7 h-7 rounded-full border-2 transition-all cursor-pointer ${
                              productColor === c
                                ? "border-white scale-110 shadow-md ring-2 ring-[#7C3AED]"
                                : "border-transparent opacity-80 hover:opacity-100 hover:scale-105"
                            }`}
                            style={{ backgroundColor: c }}
                            title={c}
                          />
                        ))}
                      </div>
                    </div>

                    {/* Logo Adjustments */}
                    <div className="border-t border-[var(--border-color)] pt-3 flex flex-col gap-3">
                      <div className="flex items-center justify-between">
                        <label className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-wider">
                          📐 Logo Placement
                        </label>
                        <button
                          onClick={() => {
                            setLogoX(0);
                            setLogoY(0);
                            setLogoScale(1);
                          }}
                          className="text-[10px] font-bold text-[#7C3AED] hover:underline cursor-pointer transition"
                        >
                          Reset
                        </button>
                      </div>

                      {/* Position Y Slider */}
                      <div>
                        <div className="flex justify-between text-[11px] font-semibold text-[var(--text-secondary)] mb-1">
                          <span>Vertical</span>
                          <span className="text-[#7C3AED] font-mono">
                            {logoY > 0 ? `+${logoY.toFixed(2)}` : logoY.toFixed(2)}
                          </span>
                        </div>
                        <input
                          type="range"
                          min="-1"
                          max="1"
                          step="0.05"
                          value={logoY}
                          onChange={(e) => setLogoY(parseFloat(e.target.value))}
                          className="w-full h-1.5 bg-[var(--bg-secondary)] rounded-lg appearance-none cursor-pointer accent-[#7C3AED]"
                        />
                      </div>

                      {/* Position X Slider */}
                      <div>
                        <div className="flex justify-between text-[11px] font-semibold text-[var(--text-secondary)] mb-1">
                          <span>Horizontal</span>
                          <span className="text-[#7C3AED] font-mono">
                            {logoX > 0 ? `+${logoX.toFixed(2)}` : logoX.toFixed(2)}
                          </span>
                        </div>
                        <input
                          type="range"
                          min="-1"
                          max="1"
                          step="0.05"
                          value={logoX}
                          onChange={(e) => setLogoX(parseFloat(e.target.value))}
                          className="w-full h-1.5 bg-[var(--bg-secondary)] rounded-lg appearance-none cursor-pointer accent-[#7C3AED]"
                        />
                      </div>

                      {/* Scale Slider */}
                      <div>
                        <div className="flex justify-between text-[11px] font-semibold text-[var(--text-secondary)] mb-1">
                          <span>Logo Size</span>
                          <span className="text-[#7C3AED] font-mono">
                            {logoScale.toFixed(2)}×
                          </span>
                        </div>
                        <input
                          type="range"
                          min="0.5"
                          max="2"
                          step="0.05"
                          value={logoScale}
                          onChange={(e) => setLogoScale(parseFloat(e.target.value))}
                          className="w-full h-1.5 bg-[var(--bg-secondary)] rounded-lg appearance-none cursor-pointer accent-[#7C3AED]"
                        />
                      </div>
                    </div>

                    {/* Rotation Speed */}
                    <div className="border-t border-[var(--border-color)] pt-3">
                      <div className="flex justify-between text-[11px] font-semibold text-[var(--text-secondary)] mb-1">
                        <span className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-wider">
                          Rotation Speed
                        </span>
                        <span className="text-[#3B82F6] font-mono font-bold">
                          {rotationSpeed}×
                        </span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="5"
                        step="0.5"
                        value={rotationSpeed}
                        onChange={(e) => setRotationSpeed(parseFloat(e.target.value))}
                        className="w-full h-1.5 bg-[var(--bg-secondary)] rounded-lg appearance-none cursor-pointer accent-[#7C3AED]"
                      />
                      <div className="flex justify-between text-[10px] text-[var(--text-muted)] mt-1 font-medium">
                        <span>Pause</span>
                        <span>Fast</span>
                      </div>
                    </div>

                    {/* Interactive Hint */}
                    <div className="pt-2 border-t border-[var(--border-color)] flex items-start gap-2 text-[10px] text-[var(--text-muted)] leading-relaxed">
                      <span className="text-xs">🎮</span>
                      <span>
                        Drag to rotate · Scroll to zoom · Canvas controls to pause &amp; save.
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Download All */}
          {viewMode === "2D" && mockups.length > 0 && (
            <div className="mt-8 text-center pb-20">
              <button
                id="download-all-zip"
                onClick={handleDownloadAll}
                className="px-8 py-3 bg-gray-900 text-white rounded-xl font-bold shadow-lg hover:bg-black transition flex items-center justify-center gap-2 mx-auto"
              >
                📦 Download All Mockups (.ZIP)
              </button>
            </div>
          )}
        </div>
      )}

      {/* Sticky Footer (2D Mockups only) */}
      {viewMode === "2D" && mockups.length > 0 && (
        <footer className="sticky bottom-0 left-0 right-0 bg-[var(--bg-secondary)] border-t border-[var(--border-color)] mt-auto z-10 w-full">
          <div className="max-w-6xl mx-auto px-6 py-4 flex gap-3 justify-end">
            <button
              onClick={generateAllMockups}
              className="px-5 py-2 text-[var(--text-primary)] border border-[var(--border-color)] bg-[var(--bg-card)] rounded-xl text-sm font-medium hover:bg-[var(--bg-card-hover)] transition"
            >
              🔄 Regenerate
            </button>
            <button
              onClick={handleDownloadAll}
              className="px-5 py-2 text-white rounded-xl text-sm font-semibold hover:opacity-90 transition"
              style={{ background: "linear-gradient(90deg, #7C3AED, #3B82F6)" }}
            >
              ⬇ Download All (ZIP)
            </button>
          </div>
        </footer>
      )}
    </div>
  );
}
