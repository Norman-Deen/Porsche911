import * as THREE from './three/build/three.module.js';
import gsap from "https://cdn.skypack.dev/gsap";



/////////////////////////////////////////////////
//intro film
/* ===== إحداثيات اللقطات ===== */
const CUT1_START = {
  pos:{x:0.7420866978954554,y:3.508718714652253,z:3.3472833556694024},
  target:{x:-0.3817941262649274,y:-0.6204300014502186,z:1.6331051877463603}
};
const CUT1_END = {
  pos:{x:0.728548155924551,y:2.906627302161003,z:4.806490302403214},
  target:{x:-0.39533266823583185,y:-1.2225214139414684,z:3.0923121344801716}
};

const CUT2_START = {
  pos:{x:-1.7953070248178058,y:1.3540966143566253,z:-2.581464349788588},
  target:{x:0.3089545836265888,y:0.3118991964712425,z:1.6650802198454795}
};
const CUT2_END = {
  pos:{x:-1.9746715248494922,y:0.37089401782305476,z:-2.7338850686618557},
  target:{x:0.12959008359490237,y:-0.671303400062328,z:1.5126595009722115}
};

 const CUT3_START = {
  pos:{x:-1.6644496392585963,y:1.4860051212014778,z:2.3935451067811746},
  target:{x:-0.6880367468319307,y:0.37098565223109997,z:1.482800504290591}
};
 const CUT3_END = {
  pos:{x:-2.346276895187177,y:0.7262979832285679,z:1.0953743287817383},
  target:{x:-0.6880367468319307,y:0.37098565223109997,z:1.482800504290591}
};

const CUT4_START = {
  pos:{ x: -1.1597256582427025, y: 4.174415311431447, z: -1.7809393054842053 },
  target:{ x: 0.46655885284059995, y: 0.5056061216287363, z: -0.027539210221630615 }
};

const CUT4_END = {
  pos:{ x: 1.654070096269885, y: 4.503867654846975, z: -1.3628653258031198 },
  target:{ x: 0.4665588528405999, y: 0.5056061216287363, z: -0.027539210221630615 }
};


const MAIN_CAM = {
  pos:    { x: 5.1, y: 4.6, z: 7.2 },
  target: { x: 0,   y: 0,   z: 0   }
};



/* ===== طبقة الفيد (مع ستايل كامل) ===== */
function ensureFadeLayer() {
  let el = document.getElementById('fade');
  if (!el) {
    el = document.createElement('div');
    el.id = 'fade';
    Object.assign(el.style, {
      position: 'fixed',
      inset: '0',
      opacity: '0',
      pointerEvents: 'none',
      zIndex: '9999',
      transition: 'none' // نتولى الأنيميشن عبر GSAP
    });
    document.body.appendChild(el);
  }
  return el;
}




/* ===== تحريك كاميرا (position + target) ===== */
function tweenCut(camera, controls, START, END, { duration=6, ease="sine.inOut", trim=-2 } = {}) {
  const trimmedDuration = Math.max(0, duration - 2 * trim); // نقص نص ثانية من كل طرف
  const tl = gsap.timeline({ defaults: { duration: trimmedDuration, ease } });

  // بداية من زمن مقصوص
  camera.position.set(START.pos.x, START.pos.y, START.pos.z);
  if (controls) {
    controls.target.set(START.target.x, START.target.y, START.target.z);
    controls.update();
  } else {
    camera.lookAt(START.target.x, START.target.y, START.target.z);
  }

  // الانتقال مع قطع البداية والنهاية
  tl.to(camera.position, { x: END.pos.x, y: END.pos.y, z: END.pos.z }, trim);
  if (controls) {
    tl.to(controls.target, { x: END.target.x, y: END.target.y, z: END.target.z }, trim);
  } else {
    const t = new THREE.Vector3(START.target.x, START.target.y, START.target.z);
    tl.to(t, { x: END.target.x, y: END.target.y, z: END.target.z, onUpdate: () => camera.lookAt(t) }, trim);
  }

  return tl;
}








/* ===== فيد مع نداء منتصف ===== */
function fadeCut({ color="#000", inDur=0.7, hold=0.25, outDur=0.7, onMid=()=>{} } = {}) {
  const el = ensureFadeLayer();
  el.style.background = color;

  const tl = gsap.timeline();
  tl.to(el, { duration: inDur, opacity: 1, ease: "sine.inOut" })
    .add(() => onMid && onMid())
    .to(el, { duration: outDur, opacity: 0, ease: "sine.inOut" }, "+=" + hold);
  return tl;
}



//playCameraMove  التشغيل الدائم لكل اللقطات
export function playCameraMove(
  camera, controls,
  {
    cut1Duration=6,
    cut2Duration=8,
    cut3Duration=6,
    cut4Duration=6,

    ease="sine.inOut",
    fadeColor="#000",
    fadeIn=0.7,
    fadeHold=0.25,
    fadeOut=0.7
  }={}
) {
 if (controls) controls.enabled = false;

// أوقف أي توينات شغالة
gsap.killTweensOf([camera.position, controls?.target]);

// ثبّت الكاميرا فورًا على بداية Cut1
camera.position.set(CUT1_START.pos.x, CUT1_START.pos.y, CUT1_START.pos.z);
if (controls) {
  controls.target.set(CUT1_START.target.x, CUT1_START.target.y, CUT1_START.target.z);
  controls.update();
} else {
  camera.lookAt(CUT1_START.target.x, CUT1_START.target.y, CUT1_START.target.z);
}


  const master = gsap.timeline({
    onComplete: () => { if (controls) controls.enabled = true; }
  });

// Cut1
// Fade -> jump to CUT1_START

master.add( fadeCut({
  color: fadeColor, inDur: 0, hold: fadeHold, outDur: fadeOut,   // ⬅️ inDur:0
  onMid: () => {
    // (تقدر تترك onMid كما هو أو حتى تشيله لأننا سبَق وثبّتْنا الوضع)
    camera.position.set(CUT1_START.pos.x, CUT1_START.pos.y, CUT1_START.pos.z);
    if (controls) {
      controls.target.set(CUT1_START.target.x, CUT1_START.target.y, CUT1_START.target.z);
      controls.update();
    } else {
      camera.lookAt(CUT1_START.target.x, CUT1_START.target.y, CUT1_START.target.z);
    }
  }
}) );


// Cut1
master.add( tweenCut(camera, controls, CUT1_START, CUT1_END, { duration: cut1Duration, ease }), ">" );


  // Fade -> jump to CUT2_START
  master.add( fadeCut({
    color: fadeColor, inDur: fadeIn, hold: fadeHold, outDur: fadeOut,
    onMid: () => {
      camera.position.set(CUT2_START.pos.x, CUT2_START.pos.y, CUT2_START.pos.z);
      if (controls) {
        controls.target.set(CUT2_START.target.x, CUT2_START.target.y, CUT2_START.target.z);
        controls.update();
      } else {
        camera.lookAt(CUT2_START.target.x, CUT2_START.target.y, CUT2_START.target.z);
      }
    }
  }) );

  // Cut2
  master.add( tweenCut(camera, controls, CUT2_START, CUT2_END, { duration: cut2Duration, ease }), ">" );

  // Fade -> jump to CUT3_START
  master.add( fadeCut({
    color: fadeColor, inDur: fadeIn, hold: fadeHold, outDur: fadeOut,
    onMid: () => {
      camera.position.set(CUT3_START.pos.x, CUT3_START.pos.y, CUT3_START.pos.z);
      if (controls) {
        controls.target.set(CUT3_START.target.x, CUT3_START.target.y, CUT3_START.target.z);
        controls.update();
      } else {
        camera.lookAt(CUT3_START.target.x, CUT3_START.target.y, CUT3_START.target.z);
      }
    }
  }) );

  // Cut3
  master.add( tweenCut(camera, controls, CUT3_START, CUT3_END, { duration: cut3Duration, ease }), ">" );

  // Fade -> jump to CUT4_START   ⬅️ جديد
  master.add( fadeCut({
    color: fadeColor, inDur: fadeIn, hold: fadeHold, outDur: fadeOut,
    onMid: () => {
      camera.position.set(CUT4_START.pos.x, CUT4_START.pos.y, CUT4_START.pos.z);
      if (controls) {
        controls.target.set(CUT4_START.target.x, CUT4_START.target.y, CUT4_START.target.z);
        controls.update();
      } else {
        camera.lookAt(CUT4_START.target.x, CUT4_START.target.y, CUT4_START.target.z);
      }
    }
  }) );

  // Cut4  ⬅️ جديد
  master.add( tweenCut(camera, controls, CUT4_START, CUT4_END, { duration: cut4Duration, ease }), ">" );


  // Fade -> jump back to MAIN_CAM  ⬅️ جديد
master.add( fadeCut({
  color: fadeColor, inDur: fadeIn, hold: fadeHold, outDur: fadeOut,
  onMid: () => {
    camera.position.set(MAIN_CAM.pos.x, MAIN_CAM.pos.y, MAIN_CAM.pos.z);
    if (controls) {
      controls.target.set(MAIN_CAM.target.x, MAIN_CAM.target.y, MAIN_CAM.target.z);
      controls.update();
    } else {
      camera.lookAt(MAIN_CAM.target.x, MAIN_CAM.target.y, MAIN_CAM.target.z);
    }
  }
}) );

  return master;
}
///////////////////////////////////////////////////////////








/////////////////////////////////////////////////
// playDemoCamera
// ===== Demo Camera Loop (one file) =====
// حالة بسيطة
let currentCamTL = null, isDemoRunning = false;


const stopAll = (cam, ctr) => {
  isDemoRunning = false;
  currentCamTL?.kill(); 
  currentCamTL = null;

  // أوقف أي توينات
  gsap.killTweensOf([cam.position, ctr?.target]);

  // نظّف مؤقت المحرك الصحيح
  if (engineTimer) {
    clearInterval(engineTimer);
    engineTimer = null;
  }

  // رجّع الكنترولز
  if (ctr) { ctr.enabled = true; }
};



// مسار الكاميرا (أبقِ القيم كما هي)
const FRAMES = [
  {pos:{x:5.6218,y:8.2005,z:0.5332},target:{x:-0.0729,y:0.0430,z:0.3454}},     // cut1
  {pos:{x:3.7774,y:9.1366,z:0.4416},target:{x:-0.1346,y:0.0268,z:0.3126}},     // cut2
  {pos:{x:1.9329,y:10.0726,z:0.3501},target:{x:-0.1963,y:0.0105,z:0.2799}},    // cut3
  {pos:{x:0.0885,y:11.0087,z:0.2585},target:{x:-0.2580,y:-0.0057,z:0.2471}},   // cut4
  {pos:{x:0.4350,y:10.9978,z:0.2699},target:{x:-0.2580,y:-0.0057,z:0.2471}},   // cut5
  {pos:{x:0.2689,y:10.9925,z:0.6857},target:{x:-0.0721,y:-0.0059,z:0.2534}},   // cut6
  {pos:{x:0.1027,y:10.9871,z:1.1014},target:{x:0.1138,y:-0.0060,z:0.2596}},    // cut7
  {pos:{x:0.1083,y:11.0032,z:0.6805},target:{x:0.1138,y:-0.0060,z:0.2596}},    // cut8
  {pos:{x:0.1138,y:11.0193,z:0.2596},target:{x:0.1138,y:-0.0060,z:0.2596}},    // cut9

// cutD
{pos:{x:0.2938,y:10.5858,z:0.8002}, target:{x:0.3019,y:-0.0180,z:0.2737}},

// cutC
{pos:{x:1.1114,y:10.5545,z:1.4196}, target:{x:1.1108,y:-0.0404,z:0.7378}},

// cutB
{pos:{x:1.3883,y:10.5494,z:1.4411}, target:{x:1.1108,y:-0.0404,z:0.7378}},

// cutA
{pos:{x:2.3969,y:10.4252,z:1.9761}, target:{x:1.1108,y:-0.0404,z:0.7378}},




  {pos:{x:3.9193,y:10.1046,z:2.1190},target:{x:1.1108,y:-0.0404,z:0.7378}},    // cut12
  {pos:{x:6.1840,y:9.2430,z:3.8424},target:{x:1.1109,y:-0.0404,z:0.7378}},    // cut13
  {pos:{x:4.2400,y:8.8948,z:4.8689},target:{x:1.1109,y:-0.0404,z:0.7378}},    // cut14
  {pos:{x:2.2959,y:8.5466,z:5.8954},target:{x:1.1109,y:-0.0404,z:0.7378}},    // cut15
  {pos:{x:0.3519,y:8.1984,z:6.9218},target:{x:1.1109,y:-0.0404,z:0.7378}},    // cut16
  {pos:{x:-1.5921,y:7.8501,z:7.9483},target:{x:1.1109,y:-0.0404,z:0.7378}},   // cut17
  {pos:{x:-2.1823,y:8.3577,z:6.3542},target:{x:0.6874,y:-0.1793,z:0.7804}},   // cut18
  {pos:{x:-2.7725,y:8.8653,z:4.7601},target:{x:0.2639,y:-0.3182,z:0.8230}},   // cut19
  {pos:{x:-3.9528,y:9.8806,z:1.5720},target:{x:-0.5830,y:-0.5960,z:0.9081}},  // cut20
  {pos:{x:-0.5835,y:10.1543,z:1.2401},target:{x:-0.5835,y:-0.5962,z:0.9082}}, // cut21
  {pos:{x:-0.5835,y:10.4291,z:0.9082},target:{x:-0.5835,y:-0.5962,z:0.9082}}, // cut22
  {pos:{x:-0.4374,y:10.3963,z:0.6828},target:{x:-0.4374,y:-0.6289,z:0.6828}}, // cut23
  {pos:{x:-0.2913,y:10.3636,z:0.4574},target:{x:-0.2913,y:-0.6616,z:0.4574}}, // cut24
 
];


FRAMES.push(JSON.parse(JSON.stringify(FRAMES[0]))); // إغلاق حلقي




//playDemoCamera 4
export function playDemoCamera(camera, controls, { ease="sine.inOut", seg=4 } = {}) {
  stopAll(camera, controls); isDemoRunning = true;
  document.body.classList.add('ui-hide-pulses');
  document.body.classList.add('demo-mode');

  const hadDamping = controls?.enableDamping;
  if (controls) { controls.enabled = false; controls.enableDamping = true; }

  const s = FRAMES[0];
  camera.position.set(s.pos.x, s.pos.y, s.pos.z);
  controls ? (controls.target.set(s.target.x, s.target.y, s.target.z), controls.update())
           : camera.lookAt(s.target.x, s.target.y, s.target.z);

  const intro = fadeCut({ color:"#000", inDur:0, hold:0.1, outDur:0.7 });

  const tl = gsap.timeline({
    repeat:-1,
    paused:true,
    defaults:{ ease },
    onUpdate: () => controls?.update(),
    onKill: () => {
      isDemoRunning = false;
      clearTimeout(autoPaintTimer); autoPaintTimer = null;
      if (window.paintMats?.length) gsap.killTweensOf(window.paintMats.map(m => m.color));
      if (controls) { controls.enabled = true; controls.enableDamping = hadDamping; }
      document.body.classList.remove('demo-mode');
      document.body.classList.remove('ui-hide-pulses');
    }
  });

  for (let i = 0; i < FRAMES.length - 1; i++) {
    const a = FRAMES[i];
    const b = FRAMES[i + 1];

    // Log قبل كل cut في الديمو
    tl.call(() => {
      console.log(`DEMO cut ${i+1} → ${i+2}`, {
        from: a.pos, to: b.pos,
        targetFrom: a.target, targetTo: b.target
      });
    });

    tl.to(camera.position, { duration: seg, x: b.pos.x, y: b.pos.y, z: b.pos.z, immediateRender: false });
    if (controls) {
      tl.to(controls.target, { duration: seg, x: b.target.x, y: b.target.y, z: b.target.z, immediateRender: false }, "<");
    } else {
      tl.add(() => camera.lookAt(b.target.x, b.target.y, b.target.z), "<");
    }
  }

  intro.eventCallback("onComplete", () => {
    tl.play();
    autoPaintCycle(window.paintMats);
  });

  currentCamTL = tl;
  currentCamTL.timeScale(1);  //speed demo
  return tl;
}




// endDemo
export function endDemo(camera, controls, { color="#000", inDur=0.4, outDur=0.4 } = {}) {
  // أوقف الديمو فورًا
  if (currentCamTL && typeof currentCamTL.kill === "function") {
    currentCamTL.kill();
    currentCamTL = null;
  }

  const el = ensureFadeLayer(); 
  el.style.background = color;

  gsap.timeline()
    .to(el, { duration: inDur, opacity: 1, ease: "sine.inOut" })
    .add(() => {
      // ارجع للكاميرا الأساسية + فعّل الكنترولز الآن
      camera.position.set(MAIN_CAM.pos.x, MAIN_CAM.pos.y, MAIN_CAM.pos.z);
      if (controls) {
        controls.target.set(MAIN_CAM.target.x, MAIN_CAM.target.y, MAIN_CAM.target.z);
        controls.enabled = true;          // ✅ لا نستخدم hadEnabled
        controls.enableDamping = true;    // (اختياري) رجّع الـdamping
        controls.update();
      } else {
        camera.lookAt(MAIN_CAM.target.x, MAIN_CAM.target.y, MAIN_CAM.target.z);
      }
    })
    .to(el, { duration: outDur, opacity: 0, ease: "sine.inOut" })
    .add(() => {
      document.body.classList.remove('ui-hide-pulses'); // ✅ رجوع النِّقَاط بعد الديمو
       document.body.classList.remove('demo-mode');
       clearTimeout(autoPaintTimer); autoPaintTimer = null;
if (window.paintMats?.length) gsap.killTweensOf(window.paintMats.map(m => m.color));

    });
}








// زر بسيط (اختياري)
// --- Demo toggle ---
const demoBtn = document.getElementById("demoBtn");
let isDemoPlaying = false;


//cleanupDemo
function cleanupDemo() {
  isDemoPlaying = false;
  demoBtn.textContent = "Demo";
}

demoBtn.addEventListener("click", () => {
  const cam = window.camera, ctr = window.orbitControls;
  if (!isDemoPlaying) {
    playDemoCamera(cam, ctr, { ease: "sine.inOut", seg: 4 });
    isDemoPlaying = true;
    demoBtn.textContent = "Stop Demo";
  } else {
    endDemo(cam, ctr);
    cleanupDemo();
  }
});










///////////////////////////////////////////////////////
// Sound + Start/Skip toggle
const animBtn = document.getElementById("startAnimBtn");
const audio = new Audio("./src/assets/audio/the-last-point-beat-electronic-digital-394291.mp3");
audio.loop = true; audio.volume = 0.6;

const engineSfx = new Audio("./src/assets/audio/car-engine-372477.mp3");
engineSfx.preload = "auto"; engineSfx.volume = 0.7; engineSfx.loop = false;

export async function bootAudio() {
  // يبدأ الصوت عند زر Start الرئيسي فقط
  audio.play();
  try { await engineSfx.play(); } catch(_) {}
  engineSfx.pause();
  engineSfx.currentTime = 0;
}

let engineTimer = null;
let currentTL = null;
let isPlaying = false;

function setBtn(label){ animBtn.textContent = label; animBtn.disabled = false; }


//cleanup
function cleanup(){
  clearInterval(engineTimer); engineTimer = null;
  engineSfx.pause();
  currentTL = null; isPlaying = false;
  if (window.orbitControls) window.orbitControls.enabled = true; // ✅ رجّع الكنترولز
  document.body.classList.remove('ui-hide-pulses');
  document.body.classList.remove('intro-mode');

  setBtn("Intro");
}

//
async function startRun(){
  if (isPlaying) return;
  isPlaying = true;
  setBtn("Skip");
  document.body.classList.add('ui-hide-pulses');
  document.body.classList.add('intro-mode');



  // لا تشغيل صوت هنا — الصوت صار في bootAudio() ويُنادى من زر Start الرئيسي
  currentTL = playCameraMove(camera, orbitControls, {}) || null;

  if (!currentTL || typeof currentTL.kill !== "function") {
    cleanup();
    return;
  }

  // محرك كل 6 ثوانٍ + رجّة
  engineTimer = setInterval(() => {
    engineSfx.currentTime = 0;
    engineSfx.play();
    shakeCamera(camera, 0.002, 0.5, 20);
  }, 6000);

  currentTL.eventCallback("onComplete", cleanup);
}


// skipRun
function skipRun(){
  if (currentTL && typeof currentTL.kill === "function") {
    try { currentTL.progress(1); currentTL.kill(); } catch(_) {}
  }
  document.body.classList.remove('intro-mode'); // ← رجّع الأزرار
  cleanup();
}


animBtn.addEventListener("click", () => {
  if (!isPlaying) startRun();
  else skipRun();
});

// ميوت 🔇
const muteBtn = document.getElementById("muteBtn");
muteBtn.addEventListener("click", () => {
  const m = !audio.muted;
  audio.muted = m; engineSfx.muted = m;
  muteBtn.textContent = m ? "🔇" : "🔊";
});







/////////////////////////////////////////
//shakeCamera
function shakeCamera(camera, intensity = 0.05, duration = 0.5, frequency = 25) {
  let elapsed = 0;
  const step = 1000 / 60; // ~60fps

  const interval = setInterval(() => {
    elapsed += step / 1000;
    const t = elapsed * frequency;

    // خذ الوضع الحالي من الكاميرا مباشرة
    const baseX = camera.position.x;
    const baseY = camera.position.y;
    const baseZ = camera.position.z;

    const offsetX = Math.sin(t * 2) * intensity;
    const offsetY = Math.cos(t * 3) * intensity * 0.5;

    camera.position.set(baseX + offsetX, baseY + offsetY, baseZ);

    if (elapsed >= duration) {
      clearInterval(interval);
      // ما نرجّعش لـbase ثابت، نترك الكاميرا حيث وصلت بالأنيميشن
    }
  }, step);
}




// === Auto Paint Changer (لـ Demo فقط) ===
let autoPaintTimer = null;

function autoPaintCycle(materials) {
  if (!materials?.length || !isDemoRunning) return;

const darkColors = [
  "#570e0e", // أحمر غامق (مو كحلي)
  "#111111", // أسود غامق
  "#222831", // رمادي غرافيتي
  "#2c3e50", // أزرق كربوني
  "#4b3621", // بني شوكولا غامق
  "#1b4026", // أخضر غامق
  "#401b1b"  // أحمر غامق
];

  let i = 0;

  function next() {
    if (!isDemoRunning) return;  // ← أوقف لو انتهى الديمو
    const c = new THREE.Color(darkColors[i % darkColors.length]);
    materials.forEach(m => {
      gsap.to(m.color, {
        duration: 6,   // ← الرقم هون يتحكم بسرعة الانتقال (كل ما كبر كان أبطأ)
        r: c.r,
        g: c.g,
        b: c.b,
        ease: "sine.inOut",
        overwrite: true,
        onUpdate: () => { m.needsUpdate = true; }
      });
    });
    i++;
    autoPaintTimer = setTimeout(next, 6000); // ← بعد 6 ثواني ينتقل للون التالي
  }

  next();
}

// للتنظيف عند إيقاف الديمو
function stopAutoPaint() {
  clearTimeout(autoPaintTimer);
  autoPaintTimer = null;
  if (window.paintMats?.length) {
    gsap.killTweensOf(window.paintMats.map(m => m.color));
  }
}
