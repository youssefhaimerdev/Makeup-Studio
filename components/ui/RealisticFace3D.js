"use client";
import { useEffect, useRef } from "react";
import * as THREE from "three";

const SKIN_TONES = {
  fair:   "#f5dcc8", light:  "#e8c4a0", medium: "#d4a070",
  tan:    "#c08050", deep:   "#8c5830", rich:   "#5a3018",
};
const EYE_COLORS = {
  brown:"#6b3a2a", dark_brown:"#2e1a0e", hazel:"#8b7030",
  green:"#3a7050", blue:"#3a60a0", grey:"#708090", amber:"#c07030",
};
const HAIR_COLORS = {
  black:"#0a0805", dark_brown:"#2a1508", medium_brown:"#5a2e10",
  light_brown:"#8a5020", blonde:"#d4a040", red:"#8a2010",
  grey:"#909088", platinum:"#e0d8c8", coloured:"#6030a0",
};

export default function RealisticFace3D({
  width = 380, height = 460, className = "",
  profile = {}, palette = {}, animated = true,
}) {
  const mountRef = useRef(null);
  const sceneRef = useRef(null);

  const skinHex  = profile.skinToneHex || SKIN_TONES[profile.skinTone]  || "#e0b888";
  const irisHex  = EYE_COLORS[profile.eyeColour]  || "#5c3d1e";
  const hairHex  = HAIR_COLORS[profile.hairColour] || "#2a1508";
  const lipHex   = palette.lip   || "#c04060";
  const blushHex = palette.blush || "#e08070";

  useEffect(() => {
    const el = mountRef.current;
    if (!el) return;

    // ── Renderer ────────────────────────────────────────────────────
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;
    el.appendChild(renderer.domElement);

    // ── Scene ────────────────────────────────────────────────────────
    const scene = new THREE.Scene();
    scene.background = null;

    // ── Camera ───────────────────────────────────────────────────────
    const camera = new THREE.PerspectiveCamera(38, width / height, 0.1, 100);
    camera.position.set(0, 0.1, 3.2);
    camera.lookAt(0, 0.1, 0);

    // ── Lighting — 3-point professional setup ────────────────────────
    // Key light (warm, upper-left, main illumination)
    const keyLight = new THREE.DirectionalLight(0xfff8f0, 1.6);
    keyLight.position.set(-1.5, 2.5, 3);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.width  = 2048;
    keyLight.shadow.mapSize.height = 2048;
    keyLight.shadow.camera.near = 0.5;
    keyLight.shadow.camera.far  = 20;
    keyLight.shadow.bias = -0.0005;
    scene.add(keyLight);

    // Fill light (cool, right, softens shadows)
    const fillLight = new THREE.DirectionalLight(0xe8f0ff, 0.5);
    fillLight.position.set(2, 0.5, 2);
    scene.add(fillLight);

    // Rim light (behind, separates head from background)
    const rimLight = new THREE.DirectionalLight(0xfff0e8, 0.4);
    rimLight.position.set(0, 1, -3);
    scene.add(rimLight);

    // Ambient (prevents pure black shadows)
    const ambient = new THREE.AmbientLight(0xfff5e8, 0.45);
    scene.add(ambient);

    // Subsurface scatter sim — soft pink point inside the face
    const sssLight = new THREE.PointLight(0xff9060, 0.18, 4);
    sssLight.position.set(0, 0, 1.2);
    scene.add(sssLight);

    // ── HEAD GEOMETRY ─────────────────────────────────────────────────
    const headGeo = new THREE.SphereGeometry(1, 128, 128);
    const pos = headGeo.attributes.position;

    for (let i = 0; i < pos.count; i++) {
      let x = pos.getX(i), y = pos.getY(i), z = pos.getZ(i);

      // 1. Overall head shape: taller than wide
      x *= 0.80;
      z *= 0.88;

      // 2. Flatten back of head
      if (z < 0) z *= 0.72;

      // 3. Jaw narrows toward chin
      if (y < -0.3) {
        const t = Math.min(1, (-y - 0.3) / 0.8);
        const narrow = 1 - t * 0.45;
        x *= narrow; z *= narrow;
        // Chin forward
        if (y < -0.85 && Math.abs(x) < 0.25) z += t * 0.08;
      }

      // 4. Forehead slight brow-ridge indent
      if (y > 0.1 && y < 0.35 && Math.abs(x) < 0.5) {
        const browT = 1 - Math.abs(y - 0.22) / 0.13;
        if (browT > 0) z -= browT * 0.04;
      }

      // 5. Cheekbone prominence
      if (y > -0.15 && y < 0.15 && Math.abs(x) > 0.55) {
        const cT = (1 - Math.abs(y) / 0.15) * ((Math.abs(x) - 0.55) / 0.25);
        z += cT * 0.05;
      }

      // 6. Nose bridge ridge
      if (Math.abs(x) < 0.12 && y > -0.15 && y < 0.25 && z > 0.7) {
        const nT = 1 - Math.abs(x) / 0.12;
        z += nT * 0.06;
      }

      // 7. Lip area forward
      if (y > -0.62 && y < -0.38 && Math.abs(x) < 0.35 && z > 0.5) {
        const lT = (1 - Math.abs(y + 0.5) / 0.12) * (1 - Math.abs(x) / 0.35);
        z += Math.max(0, lT) * 0.07;
      }

      pos.setXYZ(i, x, y, z);
    }
    pos.needsUpdate = true;
    headGeo.computeVertexNormals();

    // Head material — physically-based skin
    const skinColor = new THREE.Color(skinHex);
    const headMat = new THREE.MeshStandardMaterial({
      color: skinColor,
      roughness: 0.82,
      metalness: 0.0,
    });
    const head = new THREE.Mesh(headGeo, headMat);
    head.castShadow = true;
    head.receiveShadow = true;
    head.position.y = 0.1;
    scene.add(head);

    // ── NECK ─────────────────────────────────────────────────────────
    const neckGeo = new THREE.CylinderGeometry(0.26, 0.30, 0.55, 32);
    const neckMat = new THREE.MeshStandardMaterial({ color: skinColor, roughness: 0.85 });
    const neck = new THREE.Mesh(neckGeo, neckMat);
    neck.position.y = -0.85;
    scene.add(neck);

    // ── HAIR ─────────────────────────────────────────────────────────
    const hairColor = new THREE.Color(hairHex);

    // Main hair cap
    const hairCapGeo = new THREE.SphereGeometry(1.01, 64, 64);
    const hairCapPos = hairCapGeo.attributes.position;
    for (let i = 0; i < hairCapPos.count; i++) {
      let x = hairCapPos.getX(i), y = hairCapPos.getY(i), z = hairCapPos.getZ(i);
      x *= 0.83; z *= 0.9;
      if (z < 0) z *= 0.75;
      if (y < -0.3) { const t = Math.min(1, (-y - 0.3) / 0.8); const n = 1 - t * 0.45; x *= n; z *= n; }
      hairCapPos.setXYZ(i, x, y, z);
    }
    hairCapPos.needsUpdate = true; hairCapGeo.computeVertexNormals();
    const hairMat = new THREE.MeshStandardMaterial({ color: hairColor, roughness: 0.9, metalness: 0.03, side: THREE.FrontSide });

    // Clip hair to only top/sides
    const hairCap = new THREE.Mesh(hairCapGeo, hairMat);
    hairCap.position.y = 0.1;
    hairCap.scale.setScalar(1.02);

    // Mask out front/bottom of hair cap via custom clipping
    const hairGroup = new THREE.Group();
    hairGroup.add(hairCap);
    scene.add(hairGroup);

    // Side hair volumes
    [-1, 1].forEach(side => {
      const sideGeo = new THREE.SphereGeometry(0.5, 32, 32);
      const sideMesh = new THREE.Mesh(sideGeo, hairMat);
      sideMesh.scale.set(0.55, 1.1, 0.65);
      sideMesh.position.set(side * 0.82, -0.18, -0.1);
      sideMesh.rotation.z = side * 0.15;
      scene.add(sideMesh);
    });

    // Hair highlight strand (lighter sheen)
    const sheen = new THREE.MeshStandardMaterial({
      color: new THREE.Color(hairHex).lerp(new THREE.Color(0xffffff), 0.25),
      roughness: 0.4, metalness: 0.05, transparent: true, opacity: 0.55,
    });
    const sheenGeo = new THREE.SphereGeometry(0.95, 32, 16, -0.3, 0.6, 0.3, 0.8);
    const sheenMesh = new THREE.Mesh(sheenGeo, sheen);
    sheenMesh.position.set(-0.12, 0.55, 0.1);
    sheenMesh.rotation.set(0.2, -0.3, 0.1);
    scene.add(sheenMesh);

    // ── EYES ─────────────────────────────────────────────────────────
    const eyePositions = [[-0.28, 0.20], [0.28, 0.20]];
    const irisColor = new THREE.Color(irisHex);

    eyePositions.forEach(([ex, ey]) => {
      const eyeZ = 0.73;

      // Eye socket indent (slightly darker)
      const socketGeo = new THREE.SphereGeometry(0.155, 32, 32);
      const socketMat = new THREE.MeshStandardMaterial({
        color: skinColor.clone().lerp(new THREE.Color(0x000000), 0.12),
        roughness: 0.9,
      });
      const socket = new THREE.Mesh(socketGeo, socketMat);
      socket.position.set(ex, ey + 0.1, eyeZ - 0.01);
      socket.scale.set(1, 0.7, 0.7);
      scene.add(socket);

      // Eyeball (white)
      const eyeballGeo = new THREE.SphereGeometry(0.125, 32, 32);
      const eyeballMat = new THREE.MeshStandardMaterial({ color: 0xf8f5f2, roughness: 0.15, metalness: 0.0 });
      const eyeball = new THREE.Mesh(eyeballGeo, eyeballMat);
      eyeball.position.set(ex, ey, eyeZ + 0.01);
      scene.add(eyeball);

      // Iris
      const irisGeo = new THREE.CircleGeometry(0.075, 64);
      const irisMat = new THREE.MeshStandardMaterial({ color: irisColor, roughness: 0.4, metalness: 0.05 });
      const iris = new THREE.Mesh(irisGeo, irisMat);
      iris.position.set(ex, ey, eyeZ + 0.122);
      scene.add(iris);

      // Iris ring (darker outer limbal ring)
      const ringGeo = new THREE.RingGeometry(0.068, 0.075, 64);
      const ringMat = new THREE.MeshStandardMaterial({ color: new THREE.Color(irisHex).lerp(new THREE.Color(0), 0.7), roughness: 0.3, side: THREE.DoubleSide });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.position.set(ex, ey, eyeZ + 0.123);
      scene.add(ring);

      // Pupil
      const pupilGeo = new THREE.CircleGeometry(0.038, 32);
      const pupilMat = new THREE.MeshStandardMaterial({ color: 0x050200, roughness: 0.1 });
      const pupil = new THREE.Mesh(pupilGeo, pupilMat);
      pupil.position.set(ex, ey, eyeZ + 0.124);
      scene.add(pupil);

      // Catchlight
      const catchGeo = new THREE.CircleGeometry(0.014, 16);
      const catchMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.0 });
      const catchlight = new THREE.Mesh(catchGeo, catchMat);
      catchlight.position.set(ex - 0.022, ey + 0.022, eyeZ + 0.125);
      scene.add(catchlight);

      // Upper eyelid (skin-tone crescent)
      const lidGeo = new THREE.SphereGeometry(0.132, 32, 32, 0, Math.PI * 2, 0, Math.PI * 0.5);
      const lidMat = new THREE.MeshStandardMaterial({ color: skinColor.clone().lerp(new THREE.Color(0), 0.05), roughness: 0.85 });
      const lid = new THREE.Mesh(lidGeo, lidMat);
      lid.position.set(ex, ey + 0.003, eyeZ + 0.015);
      lid.rotation.x = Math.PI;
      scene.add(lid);

      // Eyelid crease shadow
      const creaseGeo = new THREE.TorusGeometry(0.12, 0.012, 8, 32, Math.PI);
      const creaseMat = new THREE.MeshStandardMaterial({ color: skinColor.clone().lerp(new THREE.Color(0), 0.2), roughness: 0.9, transparent: true, opacity: 0.6 });
      const crease = new THREE.Mesh(creaseGeo, creaseMat);
      crease.position.set(ex, ey + 0.115, eyeZ + 0.02);
      crease.rotation.x = Math.PI * 0.5;
      scene.add(crease);

      // Upper lash line (dark thin strip)
      const lashLineGeo = new THREE.TorusGeometry(0.128, 0.008, 8, 32, Math.PI * 1.1);
      const lashMat = new THREE.MeshStandardMaterial({ color: 0x080300, roughness: 0.9 });
      const lashLine = new THREE.Mesh(lashLineGeo, lashMat);
      lashLine.position.set(ex, ey + 0.008, eyeZ + 0.025);
      lashLine.rotation.x = Math.PI * 0.5;
      scene.add(lashLine);

      // Individual lashes (cylinders fanning upward)
      const numLashes = 14;
      for (let l = 0; l < numLashes; l++) {
        const t = (l / (numLashes - 1)) - 0.5;
        const lAngle = t * Math.PI * 0.85;
        const lashLen = 0.055 + Math.abs(Math.sin(lAngle * 1.5)) * 0.02;
        const lashGeo = new THREE.CylinderGeometry(0.003, 0.001, lashLen, 6);
        const lashMesh = new THREE.Mesh(lashGeo, new THREE.MeshStandardMaterial({ color: 0x050200 }));
        const lx = ex + Math.sin(lAngle) * 0.122;
        const ly = ey + Math.cos(lAngle) * 0.013 + 0.01;
        lashMesh.position.set(lx, ly + lashLen * 0.5, eyeZ + 0.026);
        lashMesh.rotation.z = -lAngle * 0.4;
        lashMesh.rotation.x = -0.3;
        scene.add(lashMesh);
      }
    });

    // ── EYEBROWS ─────────────────────────────────────────────────────
    const browColor = new THREE.Color(hairHex).lerp(new THREE.Color(skinHex), 0.15);
    [-0.28, 0.28].forEach((bx, side) => {
      const numHairs = 24;
      for (let h = 0; h < numHairs; h++) {
        const t = h / (numHairs - 1);
        const flip = side === 0 ? -1 : 1;
        const bXoff = flip * (t - 0.5) * 0.32;
        const bYoff = -Math.pow((t - 0.35) * 2, 2) * 0.05 + 0.06;
        const hairGeo = new THREE.CylinderGeometry(0.0025, 0.001, 0.035 + Math.random() * 0.008, 4);
        const hairMesh2 = new THREE.Mesh(hairGeo, new THREE.MeshStandardMaterial({ color: browColor, roughness: 0.95 }));
        hairMesh2.position.set(bx + bXoff, 0.38 + bYoff + 0.1, 0.72);
        hairMesh2.rotation.x = -0.35;
        hairMesh2.rotation.z = flip * (t - 0.5) * 0.5;
        scene.add(hairMesh2);
      }
    });

    // ── NOSE ─────────────────────────────────────────────────────────
    // Bridge
    const bridgeGeo = new THREE.SphereGeometry(0.055, 16, 16);
    const noseMat = new THREE.MeshStandardMaterial({ color: skinColor.clone().lerp(new THREE.Color(0), 0.04), roughness: 0.85 });
    const bridge = new THREE.Mesh(bridgeGeo, noseMat);
    bridge.scale.set(0.7, 2.5, 0.9);
    bridge.position.set(0, 0.02, 0.79);
    scene.add(bridge);

    // Nose tip
    const tipGeo = new THREE.SphereGeometry(0.08, 24, 24);
    const tip = new THREE.Mesh(tipGeo, noseMat);
    tip.scale.set(1.1, 0.7, 1.0);
    tip.position.set(0, -0.165, 0.835);
    scene.add(tip);

    // Nostrils
    [-1, 1].forEach(side => {
      const nostrilGeo = new THREE.SphereGeometry(0.045, 16, 16);
      const nostrilMat = new THREE.MeshStandardMaterial({ color: skinColor.clone().lerp(new THREE.Color(0), 0.18), roughness: 0.9 });
      const nostril = new THREE.Mesh(nostrilGeo, nostrilMat);
      nostril.scale.set(0.9, 0.7, 0.8);
      nostril.position.set(side * 0.085, -0.195, 0.82);
      scene.add(nostril);
    });

    // ── LIPS ─────────────────────────────────────────────────────────
    const lipColor = new THREE.Color(lipHex);
    const lipMatTop = new THREE.MeshStandardMaterial({ color: lipColor.clone().lerp(new THREE.Color(0), 0.15), roughness: 0.45, metalness: 0.03 });
    const lipMatBot = new THREE.MeshStandardMaterial({ color: lipColor.clone().lerp(new THREE.Color(0xffffff), 0.08), roughness: 0.4, metalness: 0.03 });

    // Upper lip
    const upperLipGeo = new THREE.SphereGeometry(0.14, 32, 16, 0, Math.PI * 2, 0, Math.PI * 0.5);
    const upperLip = new THREE.Mesh(upperLipGeo, lipMatTop);
    upperLip.scale.set(1.55, 0.55, 0.75);
    upperLip.position.set(0, -0.365, 0.82);
    upperLip.rotation.x = -0.2;
    scene.add(upperLip);

    // Lower lip (fuller)
    const lowerLipGeo = new THREE.SphereGeometry(0.14, 32, 16);
    const lowerLip = new THREE.Mesh(lowerLipGeo, lipMatBot);
    lowerLip.scale.set(1.5, 0.6, 0.8);
    lowerLip.position.set(0, -0.45, 0.83);
    scene.add(lowerLip);

    // Lip volume highlight
    const lipHlGeo = new THREE.SphereGeometry(0.06, 16, 16);
    const lipHlMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.3, transparent: true, opacity: 0.22 });
    const lipHl = new THREE.Mesh(lipHlGeo, lipHlMat);
    lipHl.scale.set(1.8, 0.5, 0.8);
    lipHl.position.set(-0.02, -0.44, 0.885);
    scene.add(lipHl);

    // ── BLUSH ─────────────────────────────────────────────────────────
    const blushColor = new THREE.Color(blushHex);
    [-1, 1].forEach(side => {
      const blushGeo = new THREE.SphereGeometry(0.22, 16, 16);
      const blushMat = new THREE.MeshStandardMaterial({
        color: blushColor, roughness: 0.95,
        transparent: true, opacity: 0.18, depthWrite: false,
      });
      const blush = new THREE.Mesh(blushGeo, blushMat);
      blush.scale.set(1, 0.55, 0.35);
      blush.position.set(side * 0.52, 0.0, 0.72);
      scene.add(blush);
    });

    // ── STORE for cleanup ─────────────────────────────────────────────
    sceneRef.current = { renderer, scene, camera };

    // ── RENDER LOOP ───────────────────────────────────────────────────
    let frame = 0;
    let animId;
    function render() {
      animId = requestAnimationFrame(render);
      frame++;
      if (animated) {
        // Subtle idle animation: gentle tilt
        head.rotation.y = Math.sin(frame * 0.008) * 0.06;
        head.rotation.x = Math.sin(frame * 0.005) * 0.02 - 0.04;
        neck.rotation.copy(head.rotation);
        hairGroup.rotation.copy(head.rotation);
        hairCap.rotation.copy(head.rotation);
        // Rotate hair pieces too
        scene.children.forEach(child => {
          if (child !== head && child !== neck && child !== hairGroup && child !== ambient && child !== keyLight && child !== fillLight && child !== rimLight && child !== sssLight) {
            child.rotation.y = head.rotation.y;
            child.rotation.x = head.rotation.x;
          }
        });
        // Subtle blush pulse
        sssLight.intensity = 0.15 + Math.sin(frame * 0.03) * 0.04;
      }
      renderer.render(scene, camera);
    }
    animId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animId);
      renderer.dispose();
      if (el.contains(renderer.domElement)) el.removeChild(renderer.domElement);
    };
  }, [skinHex, irisHex, hairHex, lipHex, blushHex, width, height, animated]);

  return (
    <div
      ref={mountRef}
      className={className}
      style={{ width, height, maxWidth: "100%", display: "inline-block", overflow: "hidden", borderRadius: "50% 50% 50% 50% / 38% 38% 62% 62%" }}
      aria-label="3D face illustration"
    />
  );
}

export function ProfileFace({ profile = {}, palette = {}, width = 380, height = 460, animated = true, className = "" }) {
  return <RealisticFace3D profile={profile} palette={palette} width={width} height={height} animated={animated} className={className} />;
}
