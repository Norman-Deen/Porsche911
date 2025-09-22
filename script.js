// Core Three.js imports
import * as THREE from './three/build/three.module.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from './three/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from './three/examples/jsm/loaders/DRACOLoader.js';
import { RGBELoader } from './three/examples/jsm/loaders/RGBELoader.js';


// إنشاء مشهد
const scene = new THREE.Scene();
window.scene = scene; // ⬅️ هيك صار متاح بالـ Console

// حضّر GLTFLoader أولاً ثم اضبط مسار الخامات
const gltfLoader = new GLTFLoader();
gltfLoader.setResourcePath("./src/assets/3d/");

const rgbeLoader = new RGBELoader();


// حمّل الـ HDR واضبط البيئة (لو عندك ملف HDR)
rgbeLoader.load("./src/MR_INT-005_WhiteNeons_NAD.hdr", function (texture) {
  texture.mapping = THREE.EquirectangularReflectionMapping;
  scene.environment = texture;

  // بعدين حمّل الموديل
  gltfLoader.load(
    "./src/assets/3d/scene.gltf",
    (gltf) => {
      const car = gltf.scene;
      scene.add(car);

      // 🔹 حرّك السيارة شوي (move فقط)
      car.position.set(0, -0.09, 0);

      window.car = car;
    },
    undefined,
    (error) => {
      console.error("❌ Error loading model:", error);
    }
  );
}); // ⬅️ مهم: إغلاق استدعاء rgbeLoader.load



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
  renderer.setClearAlpha(0); // يترك خلفية الصفحة (CSS) تظهر

  // حدّث كل الـ pulse points
  for (const item of pulseEls) {
    updatePulseFor(item.el, item.mesh);
  }
}

animate();


// اجعل المشهد يعيد التحجيم تلقائياً عند تغيير حجم النافذة
window.addEventListener('resize', () => {
  // حدّث أبعاد الكاميرا
  camera1.aspect = window.innerWidth / window.innerHeight;
  camera1.updateProjectionMatrix();

  // حدّث أبعاد الـ renderer
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(window.devicePixelRatio || 1);
});
