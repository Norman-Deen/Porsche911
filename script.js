// Core Three.js imports
import * as THREE from './three/build/three.module.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from './three/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from './three/examples/jsm/loaders/DRACOLoader.js';
import { RGBELoader } from './three/examples/jsm/loaders/RGBELoader.js';

// إنشاء مشهد
const scene = new THREE.Scene();
window.scene = scene;




// ---- DRACO ----
const loadingScreen = document.getElementById('loading-screen');
const loadingText = document.getElementById('loading-text');

const manager = new THREE.LoadingManager(
  () => {
    // عند الانتهاء
    loadingScreen.style.display = 'none';
  },
  (url, loaded, total) => {
    // أثناء التحميل
    const percent = Math.round((loaded / total) * 100);
    loadingText.textContent = percent + "%";
  }
);

const loader = new GLTFLoader(manager);



const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath('https://www.gstatic.com/draco/v1/decoders/');
loader.setDRACOLoader(dracoLoader);




new RGBELoader().load("./src/MR_INT-005_WhiteNeons_NAD.hdr", (hdr) => {
  hdr.mapping = THREE.EquirectangularReflectionMapping;
  scene.environment = hdr;

  // بعدين حمّل الموديل
  loader.load('./src/assets/3d/scene-draco.glb', (gltf) => {
    const car = gltf.scene;
      car.position.y -= 0.09;
    scene.add(car);

    gltf.scene.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
        if (child.material) child.material.needsUpdate = true;
      }
    });
  });
});





// Point 1
const pointGeometry1 = new THREE.SphereGeometry(0.05, 16, 16);
const pointMaterial1 = new THREE.MeshBasicMaterial({ color: 0xff0000 }); // أحمر
const pointMesh1 = new THREE.Mesh(pointGeometry1, pointMaterial1);
pointMesh1.position.set(1, 1, 1);
scene.add(pointMesh1);

// Point 2
const pointGeometry2 = new THREE.SphereGeometry(0.05, 16, 30);
const pointMaterial2 = new THREE.MeshBasicMaterial({ color: 0xff0000  }); // أحمر
const pointMesh2 = new THREE.Mesh(pointGeometry2, pointMaterial2);
pointMesh2.position.set(0, 1.2, -2);
scene.add(pointMesh2);

// Point 3
const pointGeometry3 = new THREE.SphereGeometry(0.05, 16, 16);
const pointMaterial3 = new THREE.MeshBasicMaterial({ color: 0x0000ff }); // أزرق
const pointMesh3 = new THREE.Mesh(pointGeometry3, pointMaterial3);
pointMesh3.position.set(0, 0.7, 2.35);
scene.add(pointMesh3);


// إعداد الكاميرا
const aspect1 = { width: window.innerWidth, height: window.innerHeight };
const camera1 = new THREE.PerspectiveCamera(30, aspect1.width / aspect1.height, 0.1, 1000);
camera1.position.set(5.1, 4.6, 7.2);

scene.add(camera1);
window.camera1 = camera1; // ⬅️ هيك الكاميرا كمان متاحة

// Renderer
const canvas = document.querySelector(".canvas");
const renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true });
renderer.setSize(aspect1.width, aspect1.height);
renderer.setPixelRatio(window.devicePixelRatio || 1);

//
renderer.outputEncoding = THREE.sRGBEncoding;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 4;

// OrbitControls
const orbitControls = new OrbitControls(camera1, renderer.domElement);
orbitControls.enableDamping = true;

// Grid
const gridMain = new THREE.GridHelper();
scene.add(gridMain);

// ربط عناصر الـ HTML
const pulseEls = [
  { el: document.getElementById('pulse-point1'), mesh: pointMesh1 },
  { el: document.getElementById('pulse-point2'), mesh: pointMesh2 },
  { el: document.getElementById('pulse-point3'), mesh: pointMesh3 },
];

// function to update one pulse element position from a mesh
function updatePulseFor(el, mesh) {
  if (!el || !mesh) return;

  // تحويل إحداثيات الكرة 3D إلى 2D
  const vector = mesh.getWorldPosition(new THREE.Vector3()).project(camera1);

  // vector.x/y in NDC (-1..1)
  const x = (vector.x * 0.5 + 0.5) * window.innerWidth;
  const y = ( -vector.y * 0.5 + 0.5) * window.innerHeight;

  // إذا كانت النقطة خارج مجال الرؤية (خلف الكاميرا أو بعيد جداً) نخفي العنصر
  if (vector.z < -1 || vector.z > 1) {
    el.style.display = 'none';
    return;
  }

  el.style.display = 'block';
  el.style.left = `${x}px`;
  el.style.top = `${y}px`;
}

// Loop
function animate() {
  orbitControls.update();
  renderer.render(scene, camera1);
  requestAnimationFrame(animate);
 

  // حدّث كل الـ pulse points
  for (const item of pulseEls) {
    updatePulseFor(item.el, item.mesh);
  }
}

animate();


 renderer.setClearAlpha(0); // يترك خلفية الصفحة (CSS) تظهر

// اجعل المشهد يعيد التحجيم تلقائياً عند تغيير حجم النافذة
window.addEventListener('resize', () => {
  // حدّث أبعاد الكاميرا
  camera1.aspect = window.innerWidth / window.innerHeight;
  camera1.updateProjectionMatrix();

  // حدّث أبعاد الـ renderer
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(window.devicePixelRatio || 1);
});













// -------- Popup JS (final) --------

// صورة افتراضية واحدة
const DEFAULT_IMAGE = "./src/assets/img/911ClassicGreen.JPG";

// نصوص + صور كل نقطة
const POINTS_DATA = {
  'pulse-point1': {
    text: `1975 Porsche 911: Part of the G-Series with iconic impact bumpers. 
Powered by 2.7L flat-six engines (150–175 hp), or up to 210 hp in the Carrera 2.7.
First year of the legendary 911 Turbo (930) with 260 hp.`,
    image: './src/assets/img/911ClassicGreen.JPG'          // ← صورة عامة
  },

  'pulse-point2': {
    text: `1975 Porsche 911 engine: 2.7-liter air-cooled flat-six,
producing around 165–175 hp in standard models, and up to 210 hp in the Carrera 2.7.
Equipped with Bosch K-Jetronic fuel injection and paired with a 5-speed manual gearbox.`,
    image: './src/assets/img/911ClassicGreenEngine.jpg'        // ← صورة المحرك
  },

  'pulse-point3': {
    text: `The Porsche logo, introduced in 1952, combines Stuttgart’s horse
emblem with Württemberg’s state crest. It symbolizes the brand’s German roots and racing spirit.`,
    image: './src/assets/img/911ClassicGreenLogo.jpg'      // ← صورة الشعار
  }
};


// fallback
const facts = [
  "The Porsche 911 is renowned for its rear-engine layout.",
  "First introduced in 1964, the 911 became an icon of performance.",
  "Modern 911s use twin-turbo flat-six engines.",
  "The 911 balances daily usability with track capability.",
  "GT3 variants are naturally aspirated and rev to the moon."
];
const randomFact = () => facts[Math.floor(Math.random() * facts.length)];

// عناصر البوب-أب
const popup = document.getElementById('popup');
const popupContent = document.getElementById('popup-content');
const popupImage = document.getElementById('popup-image');
const closeBtn = popup.querySelector('.close-btn');

// مساعد: انتظر فريم رسم واحد
const nextFrame = () => new Promise(r => requestAnimationFrame(r));

// إظهار البوب-أب عند (x,y) بدون قفزة
// clamp مساعد
const clamp = (v, min, max) => Math.min(Math.max(v, min), max);

// إظهار البوب-أب متموضع مسبقًا بدون أي قفزة/تصحيح بصري
async function showPopupAt(x, y, data) {
  const text = data?.text ?? randomFact();
  popupContent.textContent = text;

  // --- (A) جهّز الصورة أولاً ---
  if (popupImage) {
    const imgSrc = data?.image || DEFAULT_IMAGE;
    const srcChanged = popupImage.getAttribute('src') !== imgSrc;

    popupImage.style.display = 'block';
    // ثبّت الحجم لتفادي تغيّر الارتفاع لاحقًا (عدّل القياس حسب تصميمك)
    popupImage.style.maxWidth = 'auto';
    popupImage.style.height = 'auto';
    popupImage.loading = 'eager';
    popupImage.decoding = 'sync';

    if (srcChanged) popupImage.src = imgSrc;

    // انتظر جاهزية الصورة إن كانت تغيّرت
    try {
      if (srcChanged && popupImage.decode) await popupImage.decode();
    } catch (_) { /* تجاهل */ }
  }

  // --- (B) حضّر للقياس بدون ظهور/انتقالات ---
  const prevTransition = popup.style.transition;
  popup.style.transition = 'none';
  popup.style.visibility = 'hidden';
  popup.style.pointerEvents = 'none';
  popup.style.display = 'flex';
  popup.style.left = '-99999px';
  popup.style.top  = '-99999px';
  popup.style.transform = 'none';
  popup.removeAttribute('data-placement');
  popup.style.setProperty('--arrow-x', '50%');

  // فريم للمتصفح ليحسِب الأبعاد
  await new Promise(r => requestAnimationFrame(r));
  let rect = popup.getBoundingClientRect();
  const margin = 12;

  // --- (C) حدّد الاتجاه مبدئيًا استنادًا لارتفاع فعلي بعد الصورة ---
  const placeBottom = (y - (rect.height + 16) < margin);
  popup.dataset.placement = placeBottom ? 'bottom' : 'top';

  // ملاحظة مهمة: تغيير data-placement قد يغيّر حدود/سهم الكارد → أعد القياس
  await new Promise(r => requestAnimationFrame(r));
  rect = popup.getBoundingClientRect();

  // --- (D) احسب الإحداثيات النهائية (كلَمب كامل) ---
  const clamp = (v, min, max) => Math.min(Math.max(v, min), max);

  // X مركز مكلَمب
  const idealLeft = x - rect.width / 2;
  const clampedLeft = clamp(idealLeft, margin, window.innerWidth - rect.width - margin);
  const leftCenter = Math.round(clampedLeft + rect.width / 2);

  // السهم يتبع النقطة حتى لو انضغطنا عند الحافة
  const arrowPercent = clamp(((x - clampedLeft) / rect.width) * 100, 8, 92);
  popup.style.setProperty('--arrow-x', `${arrowPercent}%`);

  // Y نهائي
  let top = placeBottom ? (y + 20) : (y - 16);
  if (placeBottom) {
    const maxTop = window.innerHeight - rect.height - margin;
    top = clamp(top, margin, maxTop);
  } else {
    top = Math.max(top, rect.height + margin);
  }
  top = Math.round(top);

  // --- (E) ثبّت الموضع النهائي ثم اظهر فورًا بدون أي تصحيح لاحق ---
  popup.style.left = `${leftCenter}px`;
  popup.style.top  = `${top}px`;
  popup.style.transform = placeBottom ? 'translate(-50%, 0%)' : 'translate(-50%, -100%)';
  popup.style.setProperty('--origin-y', placeBottom ? '0%' : '100%');

  // reflow ثم اظهر
  void popup.offsetWidth;
  popup.style.visibility = 'visible';
  popup.style.pointerEvents = '';
  popup.style.transition = prevTransition || '';
}





// إغلاق
function hidePopup() {
  popup.style.display = 'none';
  popup.style.visibility = ''; // reset
}

// زر الإغلاق
if (closeBtn) {
  closeBtn.addEventListener('click', (e) => { e.stopPropagation(); hidePopup(); });
}

// ربط الأحداث بالنقاط
pulseEls.forEach(({ el }) => {
  el.addEventListener('click', (e) => {
    e.stopPropagation();
    const r = el.getBoundingClientRect();
    const x = r.left + r.width  / 2;
    const y = r.top  + r.height / 2;   // ← بدل r.top فقط
    const data = POINTS_DATA[el.id] || null;
    showPopupAt(x, y, data);
  });
});


// إغلاق عند الضغط خارج
document.addEventListener('click', (e) => {
  if (popup.style.display !== 'none' && !popup.contains(e.target)) hidePopup();
});

// إغلاق عند ESC
window.addEventListener('keydown', (e) => { if (e.key === 'Escape') hidePopup(); });

// -------- /Popup JS --------
