// Core Three.js imports
import * as THREE from './three/build/three.module.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from './three/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from './three/examples/jsm/loaders/DRACOLoader.js';
import { RGBELoader } from './three/examples/jsm/loaders/RGBELoader.js';


// إنشاء مشهد
const scene = new THREE.Scene();

// حضّر GLTFLoader أولاً ثم اضبط مسار الخامات
const gltfLoader = new GLTFLoader();
gltfLoader.setResourcePath("./src/assets/3d/");

const rgbeLoader = new RGBELoader();




// حمّل الـ HDR واضبط البيئة
rgbeLoader.load("./src/MR_INT-005_WhiteNeons_NAD.hdr", function (texture) {
  texture.mapping = THREE.EquirectangularReflectionMapping;
  scene.environment = texture;

  // بعدين حمّل الموديل
  gltfLoader.load(
    "./src/assets/3d/scene.gltf",
    (gltf) => {
      scene.add(gltf.scene);
    },
    undefined, // onProgress مو ضروري
    (error) => {
      console.error("❌ Error loading model:", error);
    }
  );
});



// إعداد الكاميرا
const aspect1 = { width: window.innerWidth, height: window.innerHeight };
const camera1 = new THREE.PerspectiveCamera(75, aspect1.width / aspect1.height, 0.1, 1000);
camera1.position.set(2, 2, 6);
scene.add(camera1);

// Renderer
const canvas = document.querySelector(".canvas");
const renderer = new THREE.WebGLRenderer({ canvas: canvas });
renderer.setSize(aspect1.width, aspect1.height);

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

// Loop
function animate() {
  orbitControls.update();
  renderer.render(scene, camera1);
  requestAnimationFrame(animate);
  renderer.setClearAlpha(0); // يترك خلفية الصفحة (CSS) تظهر

}






animate();
