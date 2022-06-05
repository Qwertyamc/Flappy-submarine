import { OBJLoader } from "../OBJLoader.js";
import { FBXLoader } from "../FBXLoader.js";

export default class Mesh {
    constructor(scene, name, obj, texture, normal, specular){
        //this.material = new THREE.MeshPhongMaterial();
        this.material = this.createMaterial(texture, normal, specular);
        var loader = new FBXLoader();


        loader.load(obj, (object)=>{
            object.traverse((child)=>{
                if (child.isMesh){
                    child.material = this.material;
                    child.receiveShadow = true;
                    child.castShadow = true;
                }
            });

            object.name = name;

            scene.add(object);
        });
    }

    createMaterial(textureName, normal, specular){
        var texture = new THREE.Texture();
        var normalMap = new THREE.Texture();
        var specularMap = new THREE.Texture();
        var material = new THREE.MeshPhongMaterial();

        var loader = new THREE.ImageLoader();
        loader.load(textureName, (image)=>{
            texture.image = image;
            texture.needsUpdate = true;
        });
        material.map = texture;
        material.transparent = true;

        if(normal != undefined){
            loader.load(normal, (image)=>{
                normalMap.image = image;
                normalMap.needsUpdate = true;
            });
            material.normalMap = normalMap;
            material.normalScale = new THREE.Vector2(1.0, 1.0);
        }

        if(specular != undefined) {
            loader.load(specular, (image)=>{
                specularMap.image = image;
                specularMap.needsUpdate = true;
            });
            material.specularMap = specularMap;
            material.specular = new THREE.Color(0x262626);
        }

        return material;   
    }
}