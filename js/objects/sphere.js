export default class Sphere {
    constructor(scale, texture, normal, specular){
        this.sphereGeometry = new THREE.SphereGeometry(15*scale, 30*scale, 30*scale);
        this.sphereMaterial = this.createMaterial(scale, texture, normal, specular);
    }

    createMaterial(scale, textureName, normal, specular){
        var texture = new THREE.Texture();
        var normalMap = new THREE.Texture();
        var specularMap = new THREE.Texture();

        var loader = new THREE.ImageLoader();
        loader.load(textureName, (image)=>{
            texture.image = image;
            texture.needsUpdate = true;
        });
        var material = new THREE.MeshPhongMaterial();
        material.map = texture;
        material.transparent = true;

        if(normal != undefined){
            loader.load(normal, (image)=>{
                normalMap.image = image;
                normalMap.needsUpdate = true;
            });
            material.normalMap = normalMap;
            material.normalScale = new THREE.Vector2(scale, scale);
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

    isSkybox(texture){
        this.sphereGeometry = new THREE.SphereGeometry(90, 32, 32);
        this.sphereMaterial = new THREE.MeshBasicMaterial();
        this.sphereMaterial.map = THREE.ImageUtils.loadTexture(texture);
        this.sphereMaterial.side = THREE.BackSide;
    }

    getSphere(name){
        var sphere = new THREE.Mesh(this.sphereGeometry, this.sphereMaterial);
        sphere.name = name;
        return sphere;
    }
}