
/////////////////////////////////////////////////
// playDemoCamera
// ===== Demo Camera Loop (one file) =====
// حالة بسيطة
let currentCamTL = null, isDemoRunning = false;
const stopAll = (cam, ctr) => {
  isDemoRunning = false;
  currentCamTL?.kill(); currentCamTL = null;
  gsap.killTweensOf([cam.position, ctr?.target]);
  if (window.engineTimer) { clearInterval(window.engineTimer); window.engineTimer = null; }
};

// مسار الكاميرا (أبقِ القيم كما هي)
const FRAMES = [
  {pos:{x:-0.2580,y:11.0196,z:0.2471}, target:{x:-0.2580,y:-0.0057,z:0.2471}},
  {pos:{x:0.0885,y:11.0087,z:0.2585}, target:{x:-0.2580,y:-0.0057,z:0.2471}},
  {pos:{x:0.4350,y:10.9978,z:0.2699}, target:{x:-0.2580,y:-0.0057,z:0.2471}},
  {pos:{x:0.2689,y:10.9925,z:0.6857}, target:{x:-0.0721,y:-0.0059,z:0.2534}},
  {pos:{x:0.1027,y:10.9871,z:1.1014}, target:{x:0.1138,y:-0.0060,z:0.2596}},
  {pos:{x:0.1083,y:11.0032,z:0.6805}, target:{x:0.1138,y:-0.0060,z:0.2596}},
  {pos:{x:0.1138,y:11.0193,z:0.2596}, target:{x:0.1138,y:-0.0060,z:0.2596}},
  {pos:{x:0.8842,y:10.9928,z:0.3276}, target:{x:0.6123,y:-0.0232,z:0.4987}},
  {pos:{x:1.6547,y:10.9661,z:0.3956}, target:{x:1.1108,y:-0.0404,z:0.7378}},
  {pos:{x:3.9193,y:10.1046,z:2.1190}, target:{x:1.1108,y:-0.0404,z:0.7378}},
  {pos:{x:6.1840,y:9.2430,z:3.8424}, target:{x:1.1109,y:-0.0404,z:0.7378}},
  {pos:{x:2.2959,y:8.5466,z:5.8954}, target:{x:1.1109,y:-0.0404,z:0.7378}},
  {pos:{x:-1.5921,y:7.8501,z:7.9483}, target:{x:1.1109,y:-0.0404,z:0.7378}},
  {pos:{x:-2.7725,y:8.8653,z:4.7601}, target:{x:0.2639,y:-0.3182,z:0.8230}},
  {pos:{x:-3.9528,y:9.8806,z:1.5720}, target:{x:-0.5830,y:-0.5960,z:0.9081}},
  {pos:{x:-0.5835,y:10.1543,z:1.2401}, target:{x:-0.5835,y:-0.5962,z:0.9082}},
  {pos:{x:-0.5835,y:10.4291,z:0.9082}, target:{x:-0.5835,y:-0.5962,z:0.9082}},
  {pos:{x:-0.4374,y:10.3963,z:0.6828}, target:{x:-0.4374,y:-0.6289,z:0.6828}},
  {pos:{x:-0.2913,y:10.3636,z:0.4574}, target:{x:-0.2913,y:-0.6616,z:0.4574}},
];
FRAMES.push(JSON.parse(JSON.stringify(FRAMES[0]))); // إغلاق حلقي

export function playDemoCamera(camera, controls, { ease="sine.inOut", seg=4 } = {}) {
  stopAll(camera, controls); isDemoRunning = true;

  const hadDamping = controls?.enableDamping;
  if (controls) { controls.enabled = false; controls.enableDamping = false; }

  const s = FRAMES[0];
  camera.position.set(s.pos.x, s.pos.y, s.pos.z);
  controls ? (controls.target.set(s.target.x, s.target.y, s.target.z), controls.update())
           : camera.lookAt(s.target.x, s.target.y, s.target.z);

  const intro = fadeCut({ color:"#000", inDur:0, hold:0.1, outDur:0.7 });

  const tl = gsap.timeline({
    repeat:-1, paused:true, defaults:{ ease },
    onUpdate: () => controls?.update(),
    onKill: () => { isDemoRunning = false; if (controls) controls.enableDamping = hadDamping; }
  });

  for (let i=0; i<FRAMES.length-1; i++) {
    const b = FRAMES[i+1];
    tl.to(camera.position, { duration:seg, x:b.pos.x, y:b.pos.y, z:b.pos.z, immediateRender:false });
    controls
      ? tl.to(controls.target, { duration:seg, x:b.target.x, y:b.target.y, z:b.target.z, immediateRender:false }, "<")
      : tl.add(() => camera.lookAt(b.target.x, b.target.y, b.target.z), "<");
  }

  intro.eventCallback("onComplete", () => tl.play());
  currentCamTL = tl;
  return tl;
}

export function endDemo(camera, controls, { color="#000", inDur=0.7 } = {}) {
  if (!isDemoRunning) return;
  const el = ensureFadeLayer(); el.style.background = color;
  gsap.to(el, { duration:inDur, opacity:1, ease:"sine.inOut", onComplete: () => stopAll(camera, controls) });
}

// زر بسيط (اختياري)
let demoBtn = document.getElementById("demoBtn");
if (!demoBtn) {
  demoBtn = Object.assign(document.body.appendChild(document.createElement("button")), {
    id:"demoBtn", textContent:"demo", style:"position:fixed;left:12px;bottom:12px;z-index:9999"
  });
}
demoBtn.onclick = () => {
  const cam = window.camera || camera, ctr = window.orbitControls || window.controls;
  playDemoCamera(cam, ctr, { ease:"sine.inOut", seg:4 });
};


