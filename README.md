# Porsche911


//Get camera info
const currentCamera = scene.children.find(obj => obj.isCamera);
console.log(currentCamera.position);

logCameraInfo();






//convert to draco
npx gltf-pipeline -i ./src/assets/3d/scene.gltf -o ./src/assets/3d/scene-draco.glb --draco.compressionLevel=10




//
const cuts = {
  cut7:  { pos:{x:0.1027,y:10.9871,z:1.1014}, target:{x:0.1138,y:-0.0060,z:0.2596} },
  cut8:  { pos:{x:0.1083,y:11.0032,z:0.6805}, target:{x:0.1138,y:-0.0060,z:0.2596} },
  cut9:  { pos:{x:0.1138,y:11.0193,z:0.2596}, target:{x:0.1138,y:-0.0060,z:0.2596} },
  cut10: { pos:{x:0.8842,y:10.9928,z:0.3276}, target:{x:0.6123,y:-0.0232,z:0.4987} },
  cut11: { pos:{x:1.6547,y:10.9661,z:0.3956}, target:{x:1.1108,y:-0.0404,z:0.7378} },
  cut12: { pos:{x:3.9193,y:10.1046,z:2.1190}, target:{x:1.1108,y:-0.0404,z:0.7378} },
  cut13: { pos:{x:6.1840,y:9.2430,z:3.8424}, target:{x:1.1109,y:-0.0404,z:0.7378} },
};

// مثال: روح مباشرة على cut10
const c = cuts.cut10;
camera.position.set(c.pos.x, c.pos.y, c.pos.z);
orbitControls.target.set(c.target.x, c.target.y, c.target.z);
orbitControls.update();
