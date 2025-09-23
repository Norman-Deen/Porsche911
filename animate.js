import * as THREE from './three/build/three.module.js';
import gsap from "https://cdn.skypack.dev/gsap";







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
function tweenCut(camera, controls, START, END, { duration=6, ease="sine.inOut" } = {}) {
  camera.position.set(START.pos.x, START.pos.y, START.pos.z);
  if (controls) {
    controls.enabled = false;
    controls.target.set(START.target.x, START.target.y, START.target.z);
    controls.update();
  } else {
    camera.lookAt(START.target.x, START.target.y, START.target.z);
  }

  const tl = gsap.timeline({
    defaults: { duration, ease },
    onUpdate: () => { controls ? controls.update() : camera.lookAt(END.target.x, END.target.y, END.target.z); }
  });

  tl.to(camera.position, { x: END.pos.x, y: END.pos.y, z: END.pos.z }, 0);

  if (controls) {
    tl.to(controls.target, { x: END.target.x, y: END.target.y, z: END.target.z }, 0);
  } else {
    const t = new THREE.Vector3(START.target.x, START.target.y, START.target.z);
    tl.to(t, { x: END.target.x, y: END.target.y, z: END.target.z, onUpdate: () => camera.lookAt(t) }, 0);
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



//playCameraMove
/* ===== التشغيل الدائم لكل اللقطات ===== */
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





















// Sound
const startBtn = document.getElementById("startAnimBtn");
const audio = new Audio("./src/assets/audio/the-last-point-beat-electronic-digital-394291.mp3"); // 🎵 موسيقى خلفية
audio.loop = true;
audio.volume = 0.6;

// مؤثر المحرك 🏎️
const engineSfx = new Audio("./src/assets/audio/car-engine-372477.mp3");
engineSfx.preload = "auto";
engineSfx.volume = 0.7;
engineSfx.loop = false;

let engineTimer = null;

startBtn.addEventListener("click", async () => {
  // شغّل الموسيقى
  audio.play();

  // شغّل الأنيميشن
  const tl = playCameraMove(camera, orbitControls, {});

  // تشغيل أولي للمحرك (لتجاوز سياسة المتصفح)
  try { await engineSfx.play(); } catch(_) {}
  engineSfx.pause();
  engineSfx.currentTime = 0;

  // كرر صوت المحرك كل 6 ثواني
  if (engineTimer) clearInterval(engineTimer);
  engineTimer = setInterval(() => {
    engineSfx.currentTime = 0;
    engineSfx.play();

    // shakeCamera(camera, intensity, duration, frequency)
    shakeCamera(camera, 0.002, 0.5, 20);

  }, 6000);

  // عند نهاية الأنيميشن أوقف الصوت المتكرر
  tl.eventCallback("onComplete", () => {
    clearInterval(engineTimer);
    engineTimer = null;
    engineSfx.pause();
  });
});

// زر ميوت 🔇
const muteBtn = document.getElementById("muteBtn");
muteBtn.addEventListener("click", () => {
  const newMuted = !audio.muted;
  audio.muted = newMuted;
  engineSfx.muted = newMuted; // كتم صوت المحرك كمان
  muteBtn.textContent = newMuted ? "🔇" : "🔊";
});


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
