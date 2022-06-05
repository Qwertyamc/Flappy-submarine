import Sphere from './objects/sphere.js'
import Mesh from './objects/mesh.js';

export function createBox(scene){
    var boxGeometry = new THREE.BoxGeometry(6, 4, 6);
    var boxMaterial = new THREE.MeshPhongMaterial({
        color:'red'
    });
    var box = new THREE.Mesh(boxGeometry, boxMaterial);
    box.castShadow = true;
    scene.add(box);
}

export function createPlane(scene, texture) {
    var planeGeometry = new THREE.PlaneGeometry(20, 20);

    var textureMap = new THREE.Texture();
    var loader = new THREE.ImageLoader();
        loader.load(texture, (image)=>{
            textureMap.image = image;
            textureMap.needsUpdate = true;
        });

    var planeMaterial = new THREE.MeshPhongMaterial();
    planeMaterial.map = textureMap;
    planeMaterial.transparent = true;

    var plane = new THREE.Mesh(planeGeometry, planeMaterial);
    plane.receiveShadow = true;
    //plane.rotation.x = -0.5 * Math.PI;
    plane.position.z = -50;
    plane.scale.set(24, 15, 20)
    plane.name = 'background';
    scene.add(plane);
}

export function createLight(scene){

    var directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(-25, 50, 50);
    directionalLight.name = 'directional';
    scene.add(directionalLight);

    var ambientLight = new THREE.AmbientLight(0x111111);
    scene.add(ambientLight);
}

export function createSphere(scene, scale, name, texture, normal, specular){
    var sphere = new Sphere(scale, texture, normal, specular);
    if(scale == null) sphere.isSkybox(texture);
    scene.add(sphere.getSphere(name));
}

export function createMesh(scene, name, obj, texture, normal, specular){
    var mesh = new Mesh(scene, name, obj, texture, normal, specular);
}