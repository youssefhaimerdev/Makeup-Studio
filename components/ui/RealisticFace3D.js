"use client";
import { useEffect, useRef } from "react";

const SKIN_TONES = {
  fair:"#f5dcc8", light:"#e8c4a0", medium:"#d4a070",
  tan:"#c08050", deep:"#8c5830", rich:"#5a3018",
};
const EYE_COLORS = {
  brown:"#6b3a2a", dark_brown:"#2e1a0e", hazel:"#8b7030",
  green:"#3a7050", blue:"#3a60a0", grey:"#708090", amber:"#c07030",
};
const HAIR_COLORS = {
  black:"#0a0805", dark_brown:"#2a1508", medium_brown:"#5a2e10",
  light_brown:"#8a5020", dirty_blonde:"#c49048", blonde:"#d4a040",
  red:"#8a2010", grey:"#909088", platinum:"#e0d8c8", coloured:"#6030a0",
};

export default function RealisticFace3D({
  width=380, height=460, className="",
  profile={}, palette={}, animated=true,
}) {
  const mountRef = useRef(null);
  const skinHex  = profile.skinToneHex || SKIN_TONES[profile.skinTone]  || "#e0b888";
  const irisHex  = EYE_COLORS[profile.eyeColour]  || "#5c3d1e";
  const hairHex  = HAIR_COLORS[profile.hairColour] || "#2a1508";
  const lipHex   = palette.lip   || "#c04060";
  const blushHex = palette.blush || "#e08070";

  useEffect(() => {
    const el = mountRef.current;
    if (!el || typeof window === "undefined") return;

    let renderer, animId;

    // Dynamic import so Three.js never runs on the server
    import("three").then((THREE) => {
      renderer = new THREE.WebGLRenderer({ antialias:true, alpha:true });
      renderer.setSize(width, height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = THREE.PCFSoftShadowMap;
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.1;
      el.appendChild(renderer.domElement);

      const scene  = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(38, width/height, 0.1, 100);
      camera.position.set(0, 0.1, 3.2);
      camera.lookAt(0, 0.1, 0);

      // ── Lighting ──────────────────────────────────────────────────
      const keyLight = new THREE.DirectionalLight(0xfff8f0, 1.6);
      keyLight.position.set(-1.5, 2.5, 3);
      keyLight.castShadow = true;
      keyLight.shadow.mapSize.width = keyLight.shadow.mapSize.height = 2048;
      keyLight.shadow.bias = -0.0005;
      scene.add(keyLight);
      const fillLight = new THREE.DirectionalLight(0xe8f0ff, 0.5);
      fillLight.position.set(2, 0.5, 2); scene.add(fillLight);
      const rimLight = new THREE.DirectionalLight(0xfff0e8, 0.4);
      rimLight.position.set(0, 1, -3); scene.add(rimLight);
      scene.add(new THREE.AmbientLight(0xfff5e8, 0.45));
      const sssLight = new THREE.PointLight(0xff9060, 0.18, 4);
      sssLight.position.set(0, 0, 1.2); scene.add(sssLight);

      // ── Head geometry ─────────────────────────────────────────────
      const headGeo = new THREE.SphereGeometry(1, 128, 128);
      const pos = headGeo.attributes.position;
      for (let i=0; i<pos.count; i++) {
        let x=pos.getX(i), y=pos.getY(i), z=pos.getZ(i);
        x*=0.80; z*=0.88;
        if(z<0) z*=0.72;
        if(y<-0.3){ const t=Math.min(1,(-y-0.3)/0.8); const n=1-t*0.45; x*=n; z*=n; if(y<-0.85&&Math.abs(x)<0.25) z+=t*0.08; }
        if(y>0.1&&y<0.35&&Math.abs(x)<0.5){ const bT=1-Math.abs(y-0.22)/0.13; if(bT>0) z-=bT*0.04; }
        if(y>-0.15&&y<0.15&&Math.abs(x)>0.55){ const cT=(1-Math.abs(y)/0.15)*((Math.abs(x)-0.55)/0.25); z+=cT*0.05; }
        if(Math.abs(x)<0.12&&y>-0.15&&y<0.25&&z>0.7){ const nT=1-Math.abs(x)/0.12; z+=nT*0.06; }
        if(y>-0.62&&y<-0.38&&Math.abs(x)<0.35&&z>0.5){ const lT=(1-Math.abs(y+0.5)/0.12)*(1-Math.abs(x)/0.35); z+=Math.max(0,lT)*0.07; }
        pos.setXYZ(i,x,y,z);
      }
      pos.needsUpdate=true; headGeo.computeVertexNormals();

      const skinColor = new THREE.Color(skinHex);
      const headMat = new THREE.MeshStandardMaterial({ color:skinColor, roughness:0.82, metalness:0.0 });
      const head = new THREE.Mesh(headGeo, headMat);
      head.castShadow=true; head.receiveShadow=true; head.position.y=0.1;
      scene.add(head);

      // ── Neck ──────────────────────────────────────────────────────
      const neck = new THREE.Mesh(
        new THREE.CylinderGeometry(0.26,0.30,0.55,32),
        new THREE.MeshStandardMaterial({ color:skinColor, roughness:0.85 })
      );
      neck.position.y=-0.85; scene.add(neck);

      // ── Hair ──────────────────────────────────────────────────────
      const hairColor = new THREE.Color(hairHex);
      const hairMat = new THREE.MeshStandardMaterial({ color:hairColor, roughness:0.9, metalness:0.03 });
      const hairCapGeo = new THREE.SphereGeometry(1.01,64,64);
      const hcp = hairCapGeo.attributes.position;
      for(let i=0;i<hcp.count;i++){
        let x=hcp.getX(i),y=hcp.getY(i),z=hcp.getZ(i);
        x*=0.83; z*=0.9; if(z<0)z*=0.75;
        if(y<-0.3){const t=Math.min(1,(-y-0.3)/0.8);const n=1-t*0.45;x*=n;z*=n;}
        hcp.setXYZ(i,x,y,z);
      }
      hcp.needsUpdate=true; hairCapGeo.computeVertexNormals();
      const hairCap = new THREE.Mesh(hairCapGeo, hairMat);
      hairCap.position.y=0.1; hairCap.scale.setScalar(1.02); scene.add(hairCap);
      [-1,1].forEach(side=>{
        const sm=new THREE.Mesh(new THREE.SphereGeometry(0.5,32,32),hairMat);
        sm.scale.set(0.55,1.1,0.65); sm.position.set(side*0.82,-0.18,-0.1); sm.rotation.z=side*0.15; scene.add(sm);
      });

      // ── Eyes ──────────────────────────────────────────────────────
      const irisColor = new THREE.Color(irisHex);
      [[-0.28,0.20],[0.28,0.20]].forEach(([ex,ey])=>{
        const ez=0.73;
        // Socket
        const sock=new THREE.Mesh(new THREE.SphereGeometry(0.155,32,32),new THREE.MeshStandardMaterial({color:skinColor.clone().lerp(new THREE.Color(0),0.12),roughness:0.9}));
        sock.position.set(ex,ey+0.1,ez-0.01); sock.scale.set(1,0.7,0.7); scene.add(sock);
        // Eyeball
        const eyeball=new THREE.Mesh(new THREE.SphereGeometry(0.125,32,32),new THREE.MeshStandardMaterial({color:0xf8f5f2,roughness:0.15}));
        eyeball.position.set(ex,ey,ez+0.01); scene.add(eyeball);
        // Iris
        const iris=new THREE.Mesh(new THREE.CircleGeometry(0.075,64),new THREE.MeshStandardMaterial({color:irisColor,roughness:0.4,metalness:0.05}));
        iris.position.set(ex,ey,ez+0.122); scene.add(iris);
        // Limbal ring
        const ring=new THREE.Mesh(new THREE.RingGeometry(0.068,0.075,64),new THREE.MeshStandardMaterial({color:new THREE.Color(irisHex).lerp(new THREE.Color(0),0.7),roughness:0.3,side:THREE.DoubleSide}));
        ring.position.set(ex,ey,ez+0.123); scene.add(ring);
        // Pupil
        const pupil=new THREE.Mesh(new THREE.CircleGeometry(0.038,32),new THREE.MeshStandardMaterial({color:0x050200}));
        pupil.position.set(ex,ey,ez+0.124); scene.add(pupil);
        // Catchlight
        const cl=new THREE.Mesh(new THREE.CircleGeometry(0.014,16),new THREE.MeshStandardMaterial({color:0xffffff}));
        cl.position.set(ex-0.022,ey+0.022,ez+0.125); scene.add(cl);
        // Lash line
        const ll=new THREE.Mesh(new THREE.TorusGeometry(0.128,0.008,8,32,Math.PI*1.1),new THREE.MeshStandardMaterial({color:0x080300}));
        ll.position.set(ex,ey+0.008,ez+0.025); ll.rotation.x=Math.PI*0.5; scene.add(ll);
        // Individual lashes
        for(let l=0;l<14;l++){
          const t=(l/13)-0.5, a=t*Math.PI*0.85, len=0.055+Math.abs(Math.sin(a*1.5))*0.02;
          const lash=new THREE.Mesh(new THREE.CylinderGeometry(0.003,0.001,len,6),new THREE.MeshStandardMaterial({color:0x050200}));
          lash.position.set(ex+Math.sin(a)*0.122,ey+Math.cos(a)*0.013+0.01+len*0.5,ez+0.026);
          lash.rotation.z=-a*0.4; lash.rotation.x=-0.3; scene.add(lash);
        }
      });

      // ── Brows ─────────────────────────────────────────────────────
      const browColor = new THREE.Color(hairHex).lerp(new THREE.Color(skinHex),0.15);
      [-0.28,0.28].forEach((bx,si)=>{
        for(let h=0;h<24;h++){
          const t=h/23, flip=si===0?-1:1;
          const hm=new THREE.Mesh(new THREE.CylinderGeometry(0.0025,0.001,0.032+Math.random()*0.01,4),new THREE.MeshStandardMaterial({color:browColor,roughness:0.95}));
          const bXoff=flip*(t-0.5)*0.32, bYoff=-Math.pow((t-0.35)*2,2)*0.05+0.06;
          hm.position.set(bx+bXoff,0.38+bYoff+0.1,0.72); hm.rotation.x=-0.35; hm.rotation.z=flip*(t-0.5)*0.5; scene.add(hm);
        }
      });

      // ── Nose ──────────────────────────────────────────────────────
      const noseMat=new THREE.MeshStandardMaterial({color:skinColor.clone().lerp(new THREE.Color(0),0.04),roughness:0.85});
      const bridge=new THREE.Mesh(new THREE.SphereGeometry(0.055,16,16),noseMat);
      bridge.scale.set(0.7,2.5,0.9); bridge.position.set(0,0.02,0.79); scene.add(bridge);
      const tip=new THREE.Mesh(new THREE.SphereGeometry(0.08,24,24),noseMat);
      tip.scale.set(1.1,0.7,1.0); tip.position.set(0,-0.165,0.835); scene.add(tip);
      [-1,1].forEach(s=>{
        const n=new THREE.Mesh(new THREE.SphereGeometry(0.045,16,16),new THREE.MeshStandardMaterial({color:skinColor.clone().lerp(new THREE.Color(0),0.18),roughness:0.9}));
        n.scale.set(0.9,0.7,0.8); n.position.set(s*0.085,-0.195,0.82); scene.add(n);
      });

      // ── Lips ──────────────────────────────────────────────────────
      const lipColor=new THREE.Color(lipHex);
      const ul=new THREE.Mesh(new THREE.SphereGeometry(0.14,32,16,0,Math.PI*2,0,Math.PI*0.5),new THREE.MeshStandardMaterial({color:lipColor.clone().lerp(new THREE.Color(0),0.15),roughness:0.45,metalness:0.03}));
      ul.scale.set(1.55,0.55,0.75); ul.position.set(0,-0.365,0.82); ul.rotation.x=-0.2; scene.add(ul);
      const ll2=new THREE.Mesh(new THREE.SphereGeometry(0.14,32,16),new THREE.MeshStandardMaterial({color:lipColor.clone().lerp(new THREE.Color(0xffffff),0.08),roughness:0.4,metalness:0.03}));
      ll2.scale.set(1.5,0.6,0.8); ll2.position.set(0,-0.45,0.83); scene.add(ll2);
      const lhl=new THREE.Mesh(new THREE.SphereGeometry(0.06,16,16),new THREE.MeshStandardMaterial({color:0xffffff,roughness:0.3,transparent:true,opacity:0.22}));
      lhl.scale.set(1.8,0.5,0.8); lhl.position.set(-0.02,-0.44,0.885); scene.add(lhl);

      // ── Blush ─────────────────────────────────────────────────────
      const blushColor=new THREE.Color(blushHex);
      [-1,1].forEach(s=>{
        const bm=new THREE.Mesh(new THREE.SphereGeometry(0.22,16,16),new THREE.MeshStandardMaterial({color:blushColor,roughness:0.95,transparent:true,opacity:0.18,depthWrite:false}));
        bm.scale.set(1,0.55,0.35); bm.position.set(s*0.52,0.0,0.72); scene.add(bm);
      });

      // ── Animate ───────────────────────────────────────────────────
      const allMeshes = scene.children.filter(c => c.isMesh);
      let frame=0;
      function render(){
        animId=requestAnimationFrame(render);
        frame++;
        if(animated){
          const ry=Math.sin(frame*0.008)*0.06, rx=Math.sin(frame*0.005)*0.02-0.04;
          allMeshes.forEach(m=>{ m.rotation.y=ry; m.rotation.x=rx; });
          sssLight.intensity=0.15+Math.sin(frame*0.03)*0.04;
        }
        renderer.render(scene,camera);
      }
      animId=requestAnimationFrame(render);
    });

    return () => {
      if(animId) cancelAnimationFrame(animId);
      if(renderer){ renderer.dispose(); if(el.contains(renderer.domElement)) el.removeChild(renderer.domElement); }
    };
  }, [skinHex, irisHex, hairHex, lipHex, blushHex, width, height, animated]);

  return (
    <div ref={mountRef} className={className}
      style={{ width, height, maxWidth:"100%", display:"inline-block", overflow:"hidden", borderRadius:"50% 50% 50% 50% / 38% 38% 62% 62%" }}
      aria-label="3D face illustration"/>
  );
}

export function ProfileFace({ profile={}, palette={}, width=380, height=460, animated=true, className="" }) {
  return <RealisticFace3D profile={profile} palette={palette} width={width} height={height} animated={animated} className={className}/>;
}
