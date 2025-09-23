import * as THREE from './three/build/three.module.js';
import gsap from "https://cdn.skypack.dev/gsap";

// مفاتيح الحركة (بداية/نهاية) — Position + Target
const START = {
  pos:   { x: 0.7420866978954554, y: 3.508718714652253,  z: 3.3472833556694024 },
  target:{ x: -0.3817941262649274, y: -0.6204300014502186, z: 1.6331051877463603 }
};

const END = {
  pos:   { x: 0.728548155924551,  y: 2.906627302161003,  z: 4.806490302403214 },
  target:{ x: -0.39533266823583185, y: -1.2225214139414684, z: 3.0923121344801716 }
};

export function playCameraMove(camera, controls) {
  // إعداد البداية
  camera.position.set(START.pos.x, START.pos.y, START.pos.z);

  if (controls) {
    controls.target.set(START.target.x, START.target.y, START.target.z);
    controls.enabled = false;
    controls.update();
  } else {
    camera.lookAt(START.target.x, START.target.y, START.target.z);
  }

  // حرّك الموضع والـ target معًا
const tl = gsap.timeline({
  defaults: { duration: 6, ease: "sine.inOut" }, // ⬅️ زمن أطول + easing أنعم
  onUpdate: () => {
    if (controls) controls.update();
    else camera.lookAt(END.target.x, END.target.y, END.target.z);
  },
  onComplete: () => { if (controls) controls.enabled = true; }
});


  // position
  tl.to(camera.position, {
    x: END.pos.x, y: END.pos.y, z: END.pos.z
  }, 0);

  // target (لو في OrbitControls نحرك target مباشرة)
  if (controls) {
    tl.to(controls.target, {
      x: END.target.x, y: END.target.y, z: END.target.z
    }, 0);
  } else {
    // بديل بدون Controls: حرك متجه وسيط ثم lookAt عليه
    const t = new THREE.Vector3(START.target.x, START.target.y, START.target.z);
    tl.to(t, {
      x: END.target.x, y: END.target.y, z: END.target.z,
      onUpdate: () => camera.lookAt(t)
    }, 0);
  }
}
