
import * as THREE from './three/build/three.module.js';
import { OrbitControls } from './three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from './three/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from './three/examples/jsm/loaders/DRACOLoader.js';
import { RGBELoader } from './three/examples/jsm/loaders/RGBELoader.js';
import { bootAudio } from './animate.js';



// ---- DRACO ----
const loadingScreen = document.getElementById('loading-screen');
const loadingText = document.getElementById('loading-text');

// Create a scene
const scene = new THREE.Scene();
window.scene = scene;

// ---- Helpers ----
const clamp = (v, min, max) => Math.min(Math.max(v, min), max);


//#region Loading (Progress + Manager + Loaders)

// ---- Smooth Loader (fake progress) ----
let disp = 0, target = 0, rafId = null;
const lerp = (a,b,t)=>a+(b-a)*t;

function tick() {
  if (target < 85) target += 0.25; // drift until ~85%
  disp = lerp(disp, target, 0.12);
  const shown = Math.min(99, Math.floor(disp));
  loadingText.textContent = shown + "%";
  rafId = requestAnimationFrame(tick);
}
rafId = requestAnimationFrame(tick);


// ---- Loading Manager ----
const manager = new THREE.LoadingManager(
  () => { // onLoad
    target = 100;
    setTimeout(() => {
      cancelAnimationFrame(rafId); rafId = null;
      loadingText.style.display = 'none';
      const startBtn = document.getElementById('startBtn');
      if (startBtn) startBtn.style.display = 'inline-block';
    }, 500);
  },
  (url, loaded, total) => { // onProgress
    const percent = Math.round((loaded / total) * 100);
    target = Math.max(target, Math.min(99, percent * 0.98));
  }
);


// ---- GLTF / DRACO Loaders ----
const loader = new GLTFLoader(manager);

const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath('https://www.gstatic.com/draco/v1/decoders/');
loader.setDRACOLoader(dracoLoader);

//#endregion


//#region Camera / Renderer / Controls

//Camera / Renderer / Controls 
const aspect1 = { width: window.innerWidth, height: window.innerHeight };
const camera = new THREE.PerspectiveCamera(30, aspect1.width / aspect1.height, 0.1, 1000);
camera.position.set(5.1, 4.6, 7.2);
scene.add(camera);
window.camera = camera;

const canvas = document.querySelector(".canvas");
const renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true });
renderer.setSize(aspect1.width, aspect1.height);
renderer.setPixelRatio(window.devicePixelRatio || 1);

renderer.outputEncoding = THREE.sRGBEncoding;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 4;

const orbitControls = new OrbitControls(camera, renderer.domElement);
orbitControls.minDistance = 4;
orbitControls.maxDistance = 20;
orbitControls.enableDamping = true;
window.orbitControls = orbitControls;

orbitControls.minPolarAngle = 0;
orbitControls.maxPolarAngle = Math.PI / 2 - 0.05;

if (window.innerWidth <= 768) {
  camera.position.set(10.2, 9.2, 14.4);
  orbitControls.target.set(0, 0, 0);
  orbitControls.update();
}

//#endregion



//#region Points 
// Point 1
const pointGeometry1 = new THREE.SphereGeometry(0.05, 3, 3);
const pointMaterial1 = new THREE.MeshBasicMaterial({ color: 0xff0000 }); 
const pointMesh1 = new THREE.Mesh(pointGeometry1, pointMaterial1);
pointMesh1.position.set(1, 1, 1);
scene.add(pointMesh1);

// Point 2
const pointGeometry2 = new THREE.SphereGeometry(0.05, 3, 3);
const pointMaterial2 = new THREE.MeshBasicMaterial({ color: 0xff0000  }); 
const pointMesh2 = new THREE.Mesh(pointGeometry2, pointMaterial2);
pointMesh2.position.set(0, 1.2, -2);
scene.add(pointMesh2);

// Point 3
const pointGeometry3 = new THREE.SphereGeometry(0.05, 3, 3);
const pointMaterial3 = new THREE.MeshBasicMaterial({ color: 0xff0000 }); 
const pointMesh3 = new THREE.Mesh(pointGeometry3, pointMaterial3);
pointMesh3.position.set(0, 0.7, 2.35);
scene.add(pointMesh3);

pointMesh1.visible = false;
pointMesh2.visible = false;
pointMesh3.visible = false;
//#endregion



//#region Environment & Model (HDRI → GLTF)

// HDRI then GLTF model 
new RGBELoader().load("./src/assets/img/MR_INT-005_WhiteNeons_NAD2K.hdr", (hdr) => {
  hdr.mapping = THREE.EquirectangularReflectionMapping;
  scene.environment = hdr;

  loader.load('./src/assets/3d/scene-draco.glb', (gltf) => {
    const car = gltf.scene;
    car.position.y -= 0.09;
    scene.add(car);

    //#region Paint Materials (collect & UI bindings)
    //Paint Materials 
    const paintMats = [];
    car.traverse((obj) => {
      if (!obj.isMesh || !obj.material) return;
      const m = obj.material;
      const name = (m.name || obj.name || "").toLowerCase();
      const looksLikePaint =
        name.includes("body") || name.includes("paint") || name.includes("carpaint");

      if (m.metalness !== undefined && m.roughness !== undefined && looksLikePaint) {
        m.userData._origColor = m.color.clone();
        m.userData._origMetal = m.metalness;
        m.userData._origRough = m.roughness;
        m.userData._origClear = ("clearcoat" in m) ? m.clearcoat : undefined;
        m.userData._origClearR = ("clearcoatRoughness" in m) ? m.clearcoatRoughness : undefined;
        m.userData._origTransparent = m.transparent;
        m.userData._origOpacity = m.opacity;
        paintMats.push(m);
      }
    });
    window.paintMats = paintMats;

    function setHexWithAlpha(material, hex) {
      if (hex.length === 9) {
        const rgb = hex.slice(0, 7);
        const alpha = parseInt(hex.slice(7, 9), 16) / 255;
        material.color.set(rgb);
        material.transparent = true;
        material.opacity = alpha;
      } else {
        material.color.set(hex);
        material.transparent = material.userData._origTransparent;
        material.opacity = material.userData._origOpacity;
      }
      material.needsUpdate = true;
    }

    const colorInput = document.getElementById('paintColor');
    const resetBtn   = document.getElementById('resetPaint');

    if (colorInput && paintMats.length) {
      const c = paintMats[0].color;
      const toHex = v => ('0' + Math.round(v * 255).toString(16)).slice(-2);
      colorInput.value = `#${toHex(c.r)}${toHex(c.g)}${toHex(c.b)}`;
    }

    colorInput?.addEventListener('input', () => {
      const hex = colorInput.value;
      paintMats.forEach((m) => {
        setHexWithAlpha(m, hex);
        m.metalness = 0.95;
        m.roughness = 0.18;
        if ("clearcoat" in m) {
          m.clearcoat = 0.1;
          m.clearcoatRoughness = 0.1;
        }
      });
    });

    const toHex2 = v => ('0' + Math.round(v * 255).toString(16)).slice(-2);
    const colorToHex = (c) => `#${toHex2(c.r)}${toHex2(c.g)}${toHex2(c.b)}`;

    resetBtn?.addEventListener('click', () => {
      paintMats.forEach((m) => {
        if (m.userData._origColor) m.color.copy(m.userData._origColor);
        if (m.userData._origMetal !== undefined)   m.metalness = m.userData._origMetal;
        if (m.userData._origRough !== undefined)   m.roughness = m.userData._origRough;
        if (m.userData._origClear !== undefined)   m.clearcoat = m.userData._origClear;
        if (m.userData._origClearR !== undefined)  m.clearcoatRoughness = m.userData._origClearR;
        m.transparent = m.userData._origTransparent;
        m.opacity     = m.userData._origOpacity;
        m.needsUpdate = true;
      });
      if (colorInput && paintMats[0]?.userData?._origColor) {
        colorInput.value = colorToHex(paintMats[0].userData._origColor);
      }
    });
   
    //#endregion

    gltf.scene.traverse((child) => {
      if (child.isMesh) {
        if (child.material) child.material.needsUpdate = true;
      }
    });
  });
});

//#endregion





//#region UI Pulses

//UI Pulses 
const pulseEls = [
  { el: document.getElementById('pulse-point1'), mesh: pointMesh1 },
  { el: document.getElementById('pulse-point2'), mesh: pointMesh2 },
  { el: document.getElementById('pulse-point3'), mesh: pointMesh3 },
];

function updatePulseFor(el, mesh) {
  if (!el || !mesh) return;
  const vector = mesh.getWorldPosition(new THREE.Vector3()).project(camera);
  const x = (vector.x * 0.5 + 0.5) * window.innerWidth;
  const y = ( -vector.y * 0.5 + 0.5) * window.innerHeight;
  if (vector.z < -1 || vector.z > 1) {
    el.style.display = 'none';
    return;
  }
  el.style.display = 'block';
  el.style.left = `${x}px`;
  el.style.top = `${y}px`;
}

//#endregion



//#region Popup 

const DEFAULT_IMAGE = "./src/assets/img/911ClassicGreen.JPG"; //loading img

const POINTS_DATA = {  //Popup 01
  'pulse-point1': {
    text: `1975 Porsche 911: Part of the G-Series with iconic impact bumpers. 
Powered by 2.7L flat-six engines (150–175 hp), or up to 210 hp in the Carrera 2.7.
First year of the legendary 911 Turbo (930) with 260 hp.`,
    image: './src/assets/img/911ClassicGreen.JPG'          
  },

  'pulse-point2': {  //Popup 02
    text: `1975 Porsche 911 engine: 2.7-liter air-cooled flat-six,
producing around 165–175 hp in standard models, and up to 210 hp in the Carrera 2.7.
Equipped with Bosch K-Jetronic fuel injection and paired with a 5-speed manual gearbox.`,
    image: './src/assets/img/911ClassicGreenEngine.jpg'        
  },

  'pulse-point3': {  //Popup 03
    text: `The Porsche logo, introduced in 1952, combines Stuttgart’s horse
emblem with Württemberg’s state crest. It symbolizes the brand’s German roots and racing spirit.`,
    image: './src/assets/img/911ClassicGreenLogo.jpg'      
  }
};


// Popup DOM elements
const popup = document.getElementById('popup');
const popupContent = document.getElementById('popup-content');
const popupImage = document.getElementById('popup-image');
const closeBtn = popup.querySelector('.close-btn');



// Show popup at given (x, y) without visual jump/glitch
async function showPopupAt(x, y, data) {
  const text = data?.text ?? ""; 
  popupContent.innerHTML = text;



// --- (A) Prepare image first ---
if (popupImage) {
  const imgSrc = data?.image || DEFAULT_IMAGE;
  const srcChanged = popupImage.getAttribute('src') !== imgSrc;

  popupImage.style.display = 'block';

  if (srcChanged) popupImage.src = imgSrc;

  // Wait until image is ready (only if source changed)
  try {
    if (srcChanged && popupImage.decode) await popupImage.decode();
  } catch (_) { /* ignore decode errors */ }
}

// --- (B) Prepare popup for measurement (off-screen, no transitions) ---
const prevTransition = popup.style.transition;
popup.style.transition = 'none';       // disable CSS animations
popup.style.visibility = 'hidden';     // hide visually
popup.style.pointerEvents = 'none';    // disable interactions
popup.style.display = 'flex';          // ensure layout is active
popup.style.left = '-99999px';         // move off-screen
popup.style.top  = '-99999px';
popup.style.transform = 'none';        // reset transform
popup.removeAttribute('data-placement'); // clear previous placement
popup.style.setProperty('--arrow-x', '50%'); // reset arrow position


// --- (C) Force browser to calculate popup size ---
await new Promise(r => requestAnimationFrame(r)); // wait 1 frame for layout
let rect = popup.getBoundingClientRect();          // measure popup dimensions
const margin = 12;                                 // safe margin from edges


// --- (C) Decide placement (top or bottom) based on available space ---
const placeBottom = (y - (rect.height + 16) < margin);
popup.dataset.placement = placeBottom ? 'bottom' : 'top';

// NOTE: changing data-placement may affect popup size (CSS arrow/border)
// → measure again after browser applies styles
await new Promise(r => requestAnimationFrame(r));
rect = popup.getBoundingClientRect();

// --- (D) Final position calculation ---
// X (centered, clamped to viewport)
const idealLeft = x - rect.width / 2;
const clampedLeft = clamp(idealLeft, margin, window.innerWidth - rect.width - margin);
const leftCenter = Math.round(clampedLeft + rect.width / 2);

// Arrow follows the click point (clamped to 8–92% range)
const arrowPercent = clamp(((x - clampedLeft) / rect.width) * 100, 8, 92);
popup.style.setProperty('--arrow-x', `${arrowPercent}%`);

// Y (above or below depending on placement)
let top = placeBottom ? (y + 20) : (y - 16);
if (placeBottom) {
  const maxTop = window.innerHeight - rect.height - margin;
  top = clamp(top, margin, maxTop);
} else {
  top = Math.max(top, rect.height + margin);
}
top = Math.round(top);

// --- (E) Apply final position & reveal popup ---
popup.style.left = `${leftCenter}px`;
popup.style.top  = `${top}px`;
popup.style.transform = placeBottom ? 'translate(-50%, 0%)' : 'translate(-50%, -100%)';
popup.style.setProperty('--origin-y', placeBottom ? '0%' : '100%');

// Force reflow, then reveal with transitions enabled
void popup.offsetWidth;
popup.style.visibility = 'visible';
popup.style.pointerEvents = '';
popup.style.transition = prevTransition || '';

}

// --- Popup helpers ---
const isPopupOpen = () => popup.style.display !== 'none';

// Close popup
function hidePopup() {
  popup.style.display = 'none';
  popup.style.visibility = '';      // reset to CSS defaults
  popup.style.pointerEvents = '';
  popup.style.transition = '';
  popup.style.left = '';
  popup.style.top = '';
  popup.style.transform = '';
  popup.removeAttribute('data-placement');
}

// Close button
if (closeBtn) {
  closeBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    hidePopup();
  });
}

// Bind pulse points
pulseEls.forEach(({ el }) => {
  el.addEventListener('click', (e) => {
    e.stopPropagation();
    const r = el.getBoundingClientRect();
    const x = r.left + r.width  / 2;  // center X
    const y = r.top  + r.height / 2;  // center Y
    const data = POINTS_DATA[el.id] || null;
    showPopupAt(x, y, data);
  });
});

// Close on outside click
document.addEventListener('click', (e) => {
  if (isPopupOpen() && !popup.contains(e.target)) hidePopup();
});

// Close on ESC
window.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') hidePopup();
});


//#endregion




//#region Main Loop

// Main Loop 
function animate() {
  orbitControls.update();
  renderer.render(scene, camera);
  requestAnimationFrame(animate);
  for (const item of pulseEls) {
    updatePulseFor(item.el, item.mesh);
  }
}
animate();

//#endregion


//#region Misc / Resize / Debug

//Misc / Resize / Debug 
renderer.setClearAlpha(0);

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(window.devicePixelRatio || 1);
});

function logCameraInfo() {
  console.log("Keyframe:", {
    pos: { x: camera.position.x, y: camera.position.y, z: camera.position.z },
    target: { x: orbitControls.target.x, y: orbitControls.target.y, z: orbitControls.target.z }
  });
}
window.logCameraInfo = logCameraInfo;

//#endregion




//#region btn

// UI refs
const startBtn   = document.getElementById("startBtn");
const controlsDiv = document.querySelector(".controls");

// Wake Lock (prevent mobile screen sleep)
let wakeLock = null;
async function requestWakeLock() {
  try {
    wakeLock = await navigator.wakeLock.request("screen");
    // Info only (optional)
    wakeLock.addEventListener("release", () => {
      console.log("Wake Lock released");
    });
  } catch (err) {
    console.error("Wake Lock error:", err);
  }
}

// Reacquire Wake Lock when tab becomes visible again
document.addEventListener("visibilitychange", () => {
  if (document.visibilityState === "visible" && "wakeLock" in navigator) {
    requestWakeLock();
  }
});

// Start button: gate audio/autoplay + reveal controls
if (startBtn) {
  startBtn.addEventListener("click", async () => {
    await bootAudio();                    // user-gesture: comply with autoplay policies
    loadingScreen.style.display = "none"; // hide loading UI
    controlsDiv.style.display = "flex";   // show controls only after start
    document.getElementById("startAnimBtn")?.click(); // auto-start intro

    // Request Wake Lock after first user interaction
    if ("wakeLock" in navigator) {
      requestWakeLock();
    }
  });
}

// === About popup content ===
const ABOUT_DATA = {
  text: `
    <strong>Porsche 911 Three.js Demo</strong><br><br>
    Developed by <a href="https://pure-art.co" target="_blank" rel="noopener noreferrer">Pure-Art.co</a><br><br>
    Vehicle design © Porsche AG<br>
    3D model by Lionsharp<br>
    License: CC BY 4.0<br><br>
    Background music: "The Last Point (Beat Electronic Digital)" © Pixabay<br>
  `,
  image: './src/assets/img/Loading.jpg'
};

// "About" button: reuse same popup centered on screen
document.getElementById('abouttn')?.addEventListener('click', (e) => {
  e.stopPropagation();
  const x = Math.round(window.innerWidth / 2);
  const y = Math.round(window.innerHeight * 0.2); // small offset from top
  showPopupAt(x, y, ABOUT_DATA);
});

//#endregion


