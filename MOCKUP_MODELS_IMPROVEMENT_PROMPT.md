# Claude Code Prompt — MockupModels.jsx Improvements

> Paste everything below this line into Claude Code.

---

## Task

Improve the two 3D models — **Mug** and **Hoodie** — inside this file:

```
frontend/src/components/MockupModels.jsx
```

**Do not touch any other file.** `ThreeDViewer.jsx`, `MockupModal.jsx`, `MockupPreview.jsx`, and all other project files must remain unchanged.

Read the current `MockupModels.jsx` first so you understand the existing structure before making any edits. All six exports (`Mug`, `BusinessCard`, `SimpleShirt`, `Hoodie`, `Notebook`, `WaterBottle`) must still be exported after your changes. Only `Mug` and `Hoodie` are modified.

The existing import block at the top of the file is:

```js
import React, { useRef, useMemo } from "react";
import { useTexture, Decal, Float, Text } from "@react-three/drei";
import * as THREE from "three";
```

Add any additional drei imports you need (e.g. `useMemo` is already imported). Do not add any npm packages that aren't already installed — only use `three` and `@react-three/fiber` / `@react-three/drei` which are already in the project.

---

## Changes — implement in this exact order

---

### CHANGE 05 — Mug: Add Rim & Lip  *(High priority, ~20 min)*

**Problem:** The mug top is a raw flat cylinder cap — no lip or rim. It reads as a tin can.

**Fix:** Inside the `Mug` component, add two new `<mesh>` elements to the `<group>`:

1. **Top rim ring** — a `TorusGeometry` positioned at the top opening of the cylinder body:
   - position: `[0, 0.6, 0]` (top of the cylinder which has height 1.2, centered at y=0)
   - torusGeometry args: `[0.5, 0.045, 16, 64]` — matches the cylinder top radius of 0.5, tube radius 0.045
   - same `meshStandardMaterial` as the body, same `color` prop

2. **Foot ring** — a smaller `TorusGeometry` at the base:
   - position: `[0, -0.6, 0]`
   - torusGeometry args: `[0.42, 0.03, 12, 48]` — slightly inside the base radius
   - same material and `color` prop

---

### CHANGE 01 — Hoodie: Volumetric Hood  *(High priority, ~45 min)*

**Problem:** The hood is drawn as a `quadraticCurveTo` arc on the flat 2D `THREE.Shape`. It has zero volume — at any side angle it disappears into the extruded slab edge.

**Fix:** Inside the `Hoodie` component:

1. **Remove** the hood arc from the `hoodieShape` path. Change the shape so it ends at a flat shoulder line — replace this section of the shape definition:
   ```js
   // Hood right
   shape.lineTo(0.4, 1.5);
   shape.quadraticCurveTo(0, 1.85, -0.4, 1.5);
   // Hood left
   shape.lineTo(-1.1, 0.5);
   ```
   with a straight shoulder line:
   ```js
   // Flat collar (hood attached separately)
   shape.lineTo(0.35, 1.2);
   shape.lineTo(-0.35, 1.2);
   shape.lineTo(-1.1, 0.5);
   ```
   Keep all other shape points unchanged.

2. **Add a 3D hood dome** as a separate mesh inside the `<group>`, after the extruded body mesh:
   ```jsx
   {/* 3D Hood dome */}
   <mesh position={[0, 1.25, -0.06]} castShadow>
     <sphereGeometry args={[0.72, 32, 32, 0, Math.PI * 2, 0, Math.PI / 1.9]} />
     <meshStandardMaterial color={color} roughness={0.85} metalness={0} side={THREE.FrontSide} />
   </mesh>
   ```
   This creates a rounded dome sitting at the collar/shoulder, visible from all angles.

3. **Add a hood opening tunnel ring** (the ribbed cuff of the hood):
   ```jsx
   {/* Hood tunnel opening */}
   <mesh position={[0, 1.22, 0.18]} rotation={[Math.PI / 2.4, 0, 0]}>
     <torusGeometry args={[0.38, 0.055, 16, 48]} />
     <meshStandardMaterial color={color} roughness={0.88} />
   </mesh>
   ```

---

### CHANGE 06 — Mug: Welded Handle  *(High priority, ~30 min)*

**Problem:** The current handle is a half `TorusGeometry` at `position={[0.58, 0, 0]}`. The torus endpoints do not lie on the cylinder surface — there is a visible gap at both attachment points.

**Fix:** Replace the handle mesh entirely. Remove this existing code:

```jsx
{/* Mug Handle */}
<mesh position={[0.58, 0, 0]} castShadow>
  <torusGeometry args={[0.28, 0.07, 16, 32, Math.PI]} />
  <meshStandardMaterial color={color} roughness={0.12} metalness={0.08} />
</mesh>
```

Replace it with a handle built from a `TubeGeometry` threaded along a `QuadraticBezierCurve3`, plus two small sphere "weld" caps. Add this inside the `Mug` component's `<group>`, using a `useMemo` for the curve:

```jsx
{/* Welded Handle */}
{React.useMemo(() => {
  const curve = new THREE.QuadraticBezierCurve3(
    new THREE.Vector3(0.49, 0.32, 0),   // top attach — on cylinder surface (radius 0.5)
    new THREE.Vector3(0.95, 0, 0),       // control point — handle bow
    new THREE.Vector3(0.49, -0.32, 0)   // bottom attach — on cylinder surface
  );
  return (
    <group>
      <mesh castShadow>
        <tubeGeometry args={[curve, 20, 0.055, 10, false]} />
        <meshStandardMaterial color={color} roughness={0.28} metalness={0} clearcoat={0.6} clearcoatRoughness={0.3} />
      </mesh>
      {/* Weld caps */}
      <mesh position={[0.49, 0.32, 0]}>
        <sphereGeometry args={[0.055, 10, 10]} />
        <meshStandardMaterial color={color} roughness={0.28} metalness={0} />
      </mesh>
      <mesh position={[0.49, -0.32, 0]}>
        <sphereGeometry args={[0.055, 10, 10]} />
        <meshStandardMaterial color={color} roughness={0.28} metalness={0} />
      </mesh>
    </group>
  );
}, [color])}
```

Note: `THREE.QuadraticBezierCurve3` and `THREE.TubeGeometry` are available via the already-imported `import * as THREE from "three"`.

---

### CHANGE 08 — Mug: Ceramic Material  *(High priority, ~10 min)*

**Problem:** The mug body uses `meshStandardMaterial` with `roughness={0.12}` and `metalness={0.08}`. This reads as polished stone or plastic, not glazed ceramic.

**Fix:** In the `Mug` component, change the body mesh material from `meshStandardMaterial` to `meshPhysicalMaterial` with these values:

```jsx
<meshPhysicalMaterial
  color={color}
  roughness={0.28}
  metalness={0}
  clearcoat={0.65}
  clearcoatRoughness={0.3}
/>
```

Also adjust the `cylinderGeometry` args to give the mug a more natural taper. Change:
```jsx
<cylinderGeometry args={[0.5, 0.45, 1.2, 64]} />
```
to:
```jsx
<cylinderGeometry args={[0.47, 0.42, 1.2, 64]} />
```
(slightly narrower overall — less tin-can proportion)

Apply the same `meshPhysicalMaterial` values to the rim and foot ring meshes added in Change 05, and to the handle weld caps from Change 06. The Decal inside the body mesh stays exactly as-is.

---

### CHANGE 02 — Hoodie: Cylindrical Sleeves  *(Medium priority, ~1 hr)*

**Problem:** The hoodie sleeves are part of the flat extruded shape — they're rectangular slabs, not cylindrical tubes. From any side angle they look like cardboard wings.

**Fix:** Remove the sleeve arms from the `hoodieShape` path definition. The revised shape should only cover the main torso body (no jutting arm extensions). Change the shape so the shoulder line runs straight across without the arm bumps — replace these sections:

```js
shape.lineTo(1.1, 0.3);
// Right arm
shape.lineTo(1.7, 0.1);
shape.lineTo(2.0, -0.5);
shape.lineTo(1.75, -0.55);
shape.lineTo(1.45, 0.05);
// Right shoulder
shape.lineTo(1.1, 0.5);
```
with:
```js
shape.lineTo(1.1, 0.3);
shape.lineTo(1.1, 0.5);   // straight shoulder, no arm
```
Do the same mirror for the left side — remove the left arm jog and go straight from `(-1.1, 0.3)` to `(-1.1, 0.5)`.

Then **add two separate cylindrical sleeve meshes** inside the `<group>`:

```jsx
{/* Right sleeve — cylinder tube angled down-right */}
<mesh
  position={[1.45, 0.2, 0.1]}
  rotation={[0, 0, -Math.PI / 5]}
  castShadow
>
  <cylinderGeometry args={[0.28, 0.23, 1.05, 32]} />
  <meshStandardMaterial color={color} roughness={0.85} metalness={0} />
</mesh>

{/* Right sleeve cuff ribbing */}
<mesh position={[1.9, -0.26, 0.1]} rotation={[0, 0, -Math.PI / 5]}>
  <cylinderGeometry args={[0.24, 0.24, 0.14, 24]} />
  <meshStandardMaterial color={color} roughness={0.88} />
</mesh>

{/* Left sleeve */}
<mesh
  position={[-1.45, 0.2, 0.1]}
  rotation={[0, 0, Math.PI / 5]}
  castShadow
>
  <cylinderGeometry args={[0.28, 0.23, 1.05, 32]} />
  <meshStandardMaterial color={color} roughness={0.85} metalness={0} />
</mesh>

{/* Left sleeve cuff ribbing */}
<mesh position={[-1.9, -0.26, 0.1]} rotation={[0, 0, Math.PI / 5]}>
  <cylinderGeometry args={[0.24, 0.24, 0.14, 24]} />
  <meshStandardMaterial color={color} roughness={0.88} />
</mesh>
```

Remove the old sleeve cuff boxes (the two `BoxGeometry` cuffs at positions `[-1.75, -0.45, 0.1]` and `[1.75, -0.45, 0.1]`) since the new cylinders include integrated cuffs above.

---

### CHANGE 07 — Mug: Inner Cavity  *(Medium priority, ~20 min)*

**Problem:** The mug is solid — from above it looks like a filled cylinder cap. There is no visible inner well.

**Fix:** Add an inner cavity mesh inside the `Mug` component's `<group>`. This is a cylinder rendered with `THREE.BackSide` so its interior face is visible:

```jsx
{/* Inner cavity */}
<mesh position={[0, 0.05, 0]}>
  <cylinderGeometry args={[0.43, 0.43, 1.05, 48]} />
  <meshStandardMaterial
    color="#1a1212"
    roughness={0.95}
    metalness={0}
    side={THREE.BackSide}
  />
</mesh>
```

Position it slightly above center (`y: 0.05`) and slightly shorter than the body so the inner wall isn't clipping through the rim. The very dark color with high roughness simulates the matte, shadowed interior of a ceramic mug.

---

### CHANGE 03 — Hoodie: Curved Drawstrings  *(Low priority, ~30 min)*

**Problem:** The two drawstring cylinders are rigid, perfectly vertical posts. They look like antenna rods rather than flexible cord.

**Fix:** Replace both existing drawstring `CylinderGeometry` meshes with `TubeGeometry` meshes that curve forward and hang loosely. Add a small sphere aglet at the bottom of each.

Remove this existing code:
```jsx
{/* Drawstrings */}
<mesh position={[-0.15, 1.15, 0.12]}>
  <cylinderGeometry args={[0.02, 0.02, 0.65, 8]} />
  <meshStandardMaterial color={color} roughness={0.9} />
</mesh>
<mesh position={[0.15, 1.15, 0.12]}>
  <cylinderGeometry args={[0.02, 0.02, 0.65, 8]} />
  <meshStandardMaterial color={color} roughness={0.9} />
</mesh>
```

Replace with:

```jsx
{/* Left drawstring — curved hanging cord */}
{React.useMemo(() => {
  const leftCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-0.14, 1.3, 0.16),
    new THREE.Vector3(-0.18, 1.0, 0.22),
    new THREE.Vector3(-0.20, 0.6, 0.18),
    new THREE.Vector3(-0.19, 0.35, 0.14),
  ]);
  return (
    <group>
      <mesh>
        <tubeGeometry args={[leftCurve, 12, 0.018, 6, false]} />
        <meshStandardMaterial color={color} roughness={0.9} />
      </mesh>
      {/* Aglet */}
      <mesh position={[-0.19, 0.32, 0.14]}>
        <cylinderGeometry args={[0.024, 0.022, 0.07, 8]} />
        <meshStandardMaterial color="#888888" roughness={0.4} metalness={0.6} />
      </mesh>
    </group>
  );
}, [color])}

{/* Right drawstring */}
{React.useMemo(() => {
  const rightCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0.14, 1.3, 0.16),
    new THREE.Vector3(0.18, 1.0, 0.22),
    new THREE.Vector3(0.20, 0.6, 0.18),
    new THREE.Vector3(0.19, 0.35, 0.14),
  ]);
  return (
    <group>
      <mesh>
        <tubeGeometry args={[rightCurve, 12, 0.018, 6, false]} />
        <meshStandardMaterial color={color} roughness={0.9} />
      </mesh>
      {/* Aglet */}
      <mesh position={[0.19, 0.32, 0.14]}>
        <cylinderGeometry args={[0.024, 0.022, 0.07, 8]} />
        <meshStandardMaterial color="#888888" roughness={0.4} metalness={0.6} />
      </mesh>
    </group>
  );
}, [color])}
```

---

### CHANGE 04 — Hoodie: Fabric Material  *(Low priority, ~1 hr)*

**Problem:** The hoodie body uses `meshStandardMaterial` with `roughness={0.85}`. All parts (body, pocket, cuffs, hem) share the same values, giving no material differentiation. The surface reads as matte plastic.

**Fix:** Upgrade the hoodie body mesh material to `meshPhysicalMaterial` with a sheen that simulates cotton fleece fiber:

```jsx
<meshPhysicalMaterial
  color={color}
  roughness={0.92}
  metalness={0}
  sheen={0.4}
  sheenRoughness={0.8}
  sheenColor="#8899bb"
/>
```

For the kangaroo pocket, give it slightly higher roughness to differentiate the double-layer fabric:
```jsx
<meshPhysicalMaterial color={color} roughness={0.96} metalness={0} />
```

For the hem ribbing and sleeve cuff ribbing, use a slightly different roughness to represent the tighter rib knit:
```jsx
<meshStandardMaterial color={color} roughness={0.78} metalness={0} />
```

The 3D hood dome added in Change 01 should use the same `meshPhysicalMaterial` as the body (with sheen).

---

## Verification checklist

After completing all changes, verify:

- [ ] `Mug` export still accepts `{ logoUrl, color, logoX, logoY, logoScale }` props — no prop changes
- [ ] `Hoodie` export still accepts `{ logoUrl, color, logoX, logoY, logoScale }` props — no prop changes
- [ ] The `Decal` logo placement in `Mug` is unchanged (position, rotation, scale)
- [ ] The `Decal` logo placement in `Hoodie` is unchanged
- [ ] All four other exports (`BusinessCard`, `SimpleShirt`, `Notebook`, `WaterBottle`) are byte-for-byte unchanged
- [ ] `TRANSPARENT_PIXEL` constant at the top of the file is unchanged
- [ ] No new npm packages have been introduced — only `three`, `react`, `@react-three/drei` which are already installed
- [ ] The file has no syntax errors (no unclosed JSX tags, no missing commas in geometry args arrays)
