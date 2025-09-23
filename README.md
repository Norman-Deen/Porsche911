# Porsche911


//Get camera info
const currentCamera = scene.children.find(obj => obj.isCamera);
console.log(currentCamera.position);





//convert to draco
npx gltf-pipeline -i ./src/assets/3d/scene.gltf -o ./src/assets/3d/scene-draco.glb --draco.compressionLevel=10
