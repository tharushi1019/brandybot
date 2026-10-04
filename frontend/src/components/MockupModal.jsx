import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const TRANSPARENT_PIXEL =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==";

const TEMPLATES = [
  { id: 'business_card', label: 'Business Card', icon: '💼', desc: '3.5" × 2" standard card', width: 700, height: 400 },
  { id: 'tshirt',        label: 'T-Shirt',       icon: '👕', desc: 'Chest logo placement', width: 520, height: 600 },
  { id: 'mug',           label: 'Mug',            icon: '☕', desc: '11oz classic mug', width: 540, height: 420 },
  { id: 'website_hero',  label: 'Website Hero',   icon: '🖥️', desc: '1200px website header', width: 700, height: 380 },
  { id: 'social_banner', label: 'Social Banner',  icon: '📱', desc: '1080×1080 social media', width: 520, height: 520 },
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

const drawWebsiteHero = (ctx, logoImg, brandName, W, H) => {
  // Beautiful gradient background
  const bg = ctx.createLinearGradient(0, 0, W, H);
  bg.addColorStop(0, "#0f172a");
  bg.addColorStop(1, "#1e293b");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);

  // Grid dots pattern
  ctx.globalAlpha = 0.15;
  ctx.fillStyle = "#38bdf8";
  for (let x = 20; x < W; x += 30) {
    for (let y = 20; y < H; y += 30) {
      ctx.beginPath();
      ctx.arc(x, y, 1.5, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  ctx.globalAlpha = 1;

  // Browser frame area
  const bX = 40, bY = 30, bW = W - 80, bH = H - 60, radius = 12;
  ctx.save();
  ctx.shadowColor = "rgba(0, 0, 0, 0.4)";
  ctx.shadowBlur = 30;
  ctx.shadowOffsetY = 10;
  ctx.fillStyle = "#ffffff";
  ctx.beginPath();
  if (ctx.roundRect) ctx.roundRect(bX, bY, bW, bH, radius);
  else ctx.rect(bX, bY, bW, bH);
  ctx.fill();
  ctx.restore();

  // Browser top bar
  ctx.fillStyle = "#f1f5f9";
  ctx.beginPath();
  if (ctx.roundRect) ctx.roundRect(bX, bY, bW, 36, [radius, radius, 0, 0]);
  else ctx.fillRect(bX, bY, bW, 36);
  ctx.fill();

  // Browser control dots (red, yellow, green)
  const dotColors = ["#ef4444", "#eab308", "#22c55e"];
  dotColors.forEach((color, idx) => {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(bX + 20 + idx * 16, bY + 18, 5, 0, Math.PI * 2);
    ctx.fill();
  });

  // Browser URL bar
  ctx.fillStyle = "#ffffff";
  ctx.beginPath();
  if (ctx.roundRect) ctx.roundRect(bX + 80, bY + 8, bW - 160, 20, 6);
  else ctx.fillRect(bX + 80, bY + 8, bW - 160, 20);
  ctx.fill();
  ctx.strokeStyle = "#e2e8f0";
  ctx.lineWidth = 1;
  ctx.stroke();

  ctx.fillStyle = "#94a3b8";
  ctx.font = "10px sans-serif";
  ctx.textAlign = "center";
  ctx.fillText(`https://www.${(brandName || "yourbrand").toLowerCase().replace(/\s+/g, "")}.com`, bX + bW / 2, bY + 22);

  // Navbar
  const navY = bY + 36;
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(bX, navY, bW, 40);
  ctx.strokeStyle = "#f1f5f9";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(bX, navY + 40);
  ctx.lineTo(bX + bW, navY + 40);
  ctx.stroke();

  // Logo in Navbar
  const navLogoSize = 24;
  ctx.drawImage(logoImg, bX + 20, navY + 8, navLogoSize, navLogoSize);

  ctx.fillStyle = "#0f172a";
  ctx.font = "bold 12px Inter, sans-serif";
  ctx.textAlign = "left";
  ctx.fillText(brandName || "Brand", bX + 20 + navLogoSize + 8, navY + 24);

  // Nav links
  ctx.fillStyle = "#64748b";
  ctx.font = "500 11px sans-serif";
  ctx.textAlign = "right";
  ctx.fillText("Products   Services   About   Contact", bX + bW - 20, navY + 24);

  // Hero section content
  const heroY = navY + 40;
  const heroH = bH - 76;

  // Background gradient for hero area
  const heroBg = ctx.createLinearGradient(bX, heroY, bX + bW, heroY + heroH);
  heroBg.addColorStop(0, "#f8fafc");
  heroBg.addColorStop(1, "#f1f5f9");
  ctx.fillStyle = heroBg;
  ctx.beginPath();
  if (ctx.roundRect) ctx.roundRect(bX, heroY, bW, heroH, [0, 0, radius, radius]);
  else ctx.fillRect(bX, heroY, bW, heroH);
  ctx.fill();

  // Large brand logo centered
  const largeLogoSize = Math.min(heroH - 60, 110);
  const logoL = bX + 40;
  const logoT = heroY + (heroH - largeLogoSize) / 2;
  ctx.drawImage(logoImg, logoL, logoT, largeLogoSize, largeLogoSize);

  // Hero text right side
  const heroTextX = logoL + largeLogoSize + 30;
  ctx.fillStyle = "#0f172a";
  ctx.font = "bold 24px Inter, sans-serif";
  ctx.textAlign = "left";
  ctx.fillText("Welcome to the Future", heroTextX, heroY + heroH / 2 - 20);

  ctx.fillStyle = "#475569";
  ctx.font = "12px sans-serif";
  ctx.fillText(`Experience innovation tailored for ${brandName || "your business"}.`, heroTextX, heroY + heroH / 2 + 5);

  // Button
  ctx.fillStyle = "#7C3AED";
  ctx.beginPath();
  if (ctx.roundRect) ctx.roundRect(heroTextX, heroY + heroH / 2 + 20, 100, 28, 6);
  else ctx.fillRect(heroTextX, heroY + heroH / 2 + 20, 100, 28);
  ctx.fill();

  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 10px sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("Get Started", heroTextX + 50, heroY + heroH / 2 + 37);
};

// ─── Master canvas renderer ────────────────────────────────────
const RENDERERS = {
  business_card: drawBusinessCard,
  tshirt: drawTShirt,
  mug: drawMug,
  website_hero: drawWebsiteHero,
  social_banner: drawInstagram,
};

const generateMockupCanvas = (logoImg, template, brandName, renderer) => {
  const canvas = document.createElement("canvas");
  canvas.width = template.width;
  canvas.height = template.height;
  const ctx = canvas.getContext("2d");
  if (renderer) {
    renderer(ctx, logoImg, brandName, template.width, template.height);
  }
  return canvas.toDataURL("image/png");
};

// ─── Main Component ────────────────────────────────────────────────

const MockupModal = ({ logo, onClose }) => {
  const navigate = useNavigate();
  // Map of template id → { url, loading, error }
  const [mockups, setMockups] = useState(() =>
    Object.fromEntries(TEMPLATES.map(t => [t.id, { url: null, loading: true, error: null }]))
  );
  const [selected, setSelected] = useState('business_card');
  const [zipLoading, setZipLoading] = useState(false);
  const [transparentLogoUrl, setTransparentLogoUrl] = useState(null);
  const [isRemovingBg, setIsRemovingBg] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [bgError, setBgError] = useState(null);

  // Step 1: Remove background on mount
  useEffect(() => {
    if (!logo?.logo_url) return;

    const fetchTransparentLogo = async () => {
      setIsRemovingBg(true);
      try {
        const res = await api.post("/utils/remove-bg", {
          imageUrl: logo.logo_url,
        });
        if (res.data?.data?.transparentUrl) {
          setTransparentLogoUrl(res.data.data.transparentUrl);
        } else {
          setTransparentLogoUrl(logo.logo_url);
        }
      } catch (err) {
        console.error("Failed to remove background in modal:", err);
        setBgError("Could not remove background. Using original logo.");
        setTransparentLogoUrl(logo.logo_url);
      } finally {
        setIsRemovingBg(false);
      }
    };
    fetchTransparentLogo();
  }, [logo?.logo_url]);

  // Step 2: Pre-generate all templates when transparentLogoUrl is ready
  useEffect(() => {
    if (!transparentLogoUrl || isRemovingBg) return;

    setIsGenerating(true);
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const generated = {};
      TEMPLATES.forEach(t => {
        try {
          const renderer = RENDERERS[t.id];
          const dataUrl = generateMockupCanvas(img, t, logo?.brand_name, renderer);
          generated[t.id] = { url: dataUrl, loading: false, error: null };
        } catch (err) {
          console.error(`Failed to render canvas template ${t.id}:`, err);
          generated[t.id] = { url: null, loading: false, error: "Render failed" };
        }
      });
      setMockups(generated);
      setIsGenerating(false);
    };
    img.onerror = () => {
      console.error("Failed to load logo image in modal canvas");
      const errorState = {};
      TEMPLATES.forEach(t => {
        errorState[t.id] = { url: null, loading: false, error: "Image load failed" };
      });
      setMockups(errorState);
      setIsGenerating(false);
    };
    img.src = transparentLogoUrl;
  }, [transparentLogoUrl, isRemovingBg, logo?.brand_name]);

  const handleDownloadOne = () => {
    const url = mockups[selected]?.url;
    if (!url) return;
    const a = document.createElement('a');
    a.href = url;
    a.download = `${logo?.brand_name || 'mockup'}-${selected}.png`;
    a.click();
  };

  const handleDownloadAll = async () => {
    const ready = TEMPLATES.filter(t => mockups[t.id]?.url);
    if (!ready.length) return;
    setZipLoading(true);
    try {
      const [{ default: JSZip }, { default: saveAs }] = await Promise.all([
        import('jszip'),
        import('file-saver')
      ]);
      const zip = new JSZip();
      const folder = zip.folder(`${logo?.brand_name || 'brand'}_mockups`);

      await Promise.all(ready.map(async t => {
        const url = mockups[t.id].url;
        try {
          const resp = await fetch(url);
          const blob = await resp.blob();
          folder.file(`${t.id}.png`, blob);
        } catch (_) { /* skip failed */ }
      }));

      const content = await zip.generateAsync({ type: 'blob' });
      saveAs(content, `${(logo?.brand_name || 'brand').replace(/\s+/g, '_')}_mockups.zip`);
    } catch (err) {
      console.error('ZIP generation failed:', err);
      alert('ZIP download failed. Please try individual downloads instead.');
    } finally {
      setZipLoading(false);
    }
  };

  const current = mockups[selected] || { url: null, loading: true, error: null };
  const completedCount = TEMPLATES.filter(t => mockups[t.id]?.url).length;

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-panel" style={{ maxWidth: 720 }}>
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-[var(--border-color)] brand-gradient flex-shrink-0">
          <div>
            <h2 className="text-xl font-bold text-white">Mockup Studio</h2>
            <p className="text-sm text-purple-200 mt-0.5">{logo?.brand_name} · {completedCount}/{TEMPLATES.length} generated</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                navigate('/mockup_generator', { state: { logoUrl: logo?.logo_url, brandName: logo?.brand_name } });
                onClose();
              }}
              className="px-3 py-2 text-xs font-semibold rounded-xl bg-purple-500 text-white hover:bg-purple-600 transition flex items-center gap-1.5 shadow-lg"
            >
              🧊 Open in 3D Studio
            </button>
            <button
              onClick={handleDownloadAll}
              disabled={completedCount === 0 || zipLoading}
              className="px-3 py-2 text-xs font-semibold rounded-xl bg-white/20 text-white hover:bg-white/30 transition disabled:opacity-40 flex items-center gap-1.5"
            >
              {zipLoading
                ? <><span className="w-3 h-3 border-2 border-white/60 border-t-white rounded-full animate-spin" />Zipping...</>
                : '📦 Download All ZIP'
              }
            </button>
            <button onClick={onClose} className="w-9 h-9 flex items-center justify-center rounded-xl bg-white/20 text-white hover:bg-white/30 transition-colors text-lg">×</button>
          </div>
        </div>

        <div className="p-5 flex gap-5" style={{ minHeight: 340 }}>
          {/* Template Sidebar */}
          <div className="w-44 flex-shrink-0 space-y-1.5">
            <p className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] mb-3">Templates</p>
            {TEMPLATES.map(t => {
              const m = mockups[t.id] || { url: null, loading: true, error: null };
              let badge = null;
              if (isRemovingBg || isGenerating || m.loading) badge = <span className="text-[10px] text-yellow-400">⏳</span>;
              else if (m.url)     badge = <span className="text-[10px] text-green-400">✓</span>;
              else if (m.error)   badge = <span className="text-[10px] text-red-400">✗</span>;

              return (
                <button
                  key={t.id}
                  onClick={() => setSelected(t.id)}
                  className={`w-full text-left p-3 rounded-xl transition-all ${
                    selected === t.id
                      ? 'brand-gradient text-white shadow-lg'
                      : 'hover:bg-[var(--bg-card-hover)] text-[var(--text-secondary)]'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-base">{t.icon}</span>
                    {badge}
                  </div>
                  <p className="text-sm font-semibold mt-1">{t.label}</p>
                  <p className={`text-xs mt-0.5 ${selected === t.id ? 'text-purple-200' : 'text-[var(--text-muted)]'}`}>{t.desc}</p>
                </button>
              );
            })}
          </div>

          {/* Preview Panel */}
          <div className="flex-1 flex flex-col items-center justify-center min-h-64 rounded-2xl glass-card relative overflow-hidden bg-gray-50 border border-gray-100 p-4">
            {isRemovingBg && (
              <div className="flex flex-col items-center gap-3">
                <div className="w-10 h-10 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
                <p className="text-sm text-[var(--text-muted)] font-medium">Removing logo background...</p>
              </div>
            )}
            {isGenerating && !isRemovingBg && (
              <div className="flex flex-col items-center gap-3">
                <div className="w-10 h-10 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
                <p className="text-sm text-[var(--text-muted)] font-medium">Compositing mockup...</p>
              </div>
            )}
            {!isRemovingBg && !isGenerating && current.error && (
              <div className="text-center p-6">
                <p className="text-3xl mb-3">🚧</p>
                <p className="text-[var(--text-secondary)] text-sm mb-1 font-semibold">Render Error</p>
                <p className="text-xs text-[var(--text-muted)]">{current.error}</p>
              </div>
            )}
            {!isRemovingBg && !isGenerating && current.url && (
              <div className="w-full h-full flex items-center justify-center">
                <img
                  src={current.url}
                  alt="Mockup preview"
                  className="max-w-full max-h-72 object-contain rounded-xl shadow-lg border border-gray-100"
                />
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        {!isRemovingBg && !isGenerating && current.url && (
          <div className="p-4 border-t border-[var(--border-color)] flex justify-end gap-3 flex-shrink-0">
            <button
              onClick={() => window.open(current.url, '_blank')}
              className="px-5 py-2 rounded-xl bg-white/5 border border-white/10 text-gray-600 font-semibold text-sm hover:bg-gray-100 transition"
            >
              🔗 Open in New Tab
            </button>
            <button
              onClick={handleDownloadOne}
              className="px-5 py-2 rounded-xl brand-gradient text-white font-semibold text-sm hover:opacity-90 transition"
            >
              ⬇ Download {TEMPLATES.find(t => t.id === selected)?.label}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default MockupModal;
