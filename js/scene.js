const NORMAL = 0;
const ASCII = 1;
const OUTLINE = 2;
const PIXEL = 3;
const GLITCH = 4;

import { createBox, createPlane, createLight, createSphere, createMesh } from './objects.js'
import { AsciiEffect } from './effects/AsciiEffect.js';
import { EffectComposer } from './postprocessing/EffectComposer.js';
import { RenderPass } from './postprocessing/RenderPass.js';
import { ShaderPass } from './postprocessing/ShaderPass.js';
import { OutlinePass } from './postprocessing/OutlinePass.js';
import { PixelShader } from './shaders/PixelShader.js';
import { GlitchPass } from './postprocessing/GlitchPass.js';

import Stats from './libs/stats.module.js';

let stats;

var renderer;
var scene;
var camera;
var clock;
var cameraControl;
var ascii_effect;

var composer;
var pixelPass, outlinePass, glitchPass;
var params

let gravity = 200;
let velocity = 0;

let mode = NORMAL;

let game_begin = false;
let game_paused = false;
let game_over = false;

let init_bomb = false;
let points = 0;

function init(){
    scene = new THREE.Scene();

    clock = new THREE.Clock();

    createRenderer();
    createCamera();


    ascii_effect = new AsciiEffect( renderer, ' .:-+*=%@#', { invert: true } );
    ascii_effect.setSize( window.innerWidth, window.innerHeight );
    ascii_effect.domElement.style.color = 'white';
    ascii_effect.domElement.style.backgroundColor = 'black';


    createObjects();

    switch(mode){
        case ASCII:
            document.getElementsByTagName('main')[0].appendChild(ascii_effect.domElement);
            break;
        default:
            document.getElementsByTagName('main')[0].appendChild(renderer.domElement);
            break;
    }

    composer = new EffectComposer( renderer );
    composer.addPass( new RenderPass( scene, camera ) );

    switch(mode){
        case OUTLINE:
            params = {
				edgeStrength: 3.0,
				edgeGlow: 0.0,
				edgeThickness: 1.0,
				pulsePeriod: 0,
				rotate: false,
				usePatternTexture: false
			};
            outlinePass = new OutlinePass( new THREE.Vector2( window.innerWidth, window.innerHeight ), scene, camera );
			composer.addPass( outlinePass );
            break;
        case PIXEL:
            params = {
                pixelSize: 8,
                postprocessing: true
            };
            pixelPass = new ShaderPass( PixelShader );
            pixelPass.uniforms[ 'resolution' ].value = new THREE.Vector2( window.innerWidth, window.innerHeight );
            pixelPass.uniforms[ 'resolution' ].value.multiplyScalar( window.devicePixelRatio );
            pixelPass.uniforms[ 'pixelSize' ].value = params.pixelSize;
            composer.addPass( pixelPass );
            break;
        case GLITCH:
            glitchPass = new GlitchPass();
            glitchPass.goWild = false;
			composer.addPass( glitchPass );
            break;
    }

    stats = new Stats();
    //document.getElementsByTagName('main')[0].appendChild( stats.dom );

    render();
}

function createRenderer(){
    renderer = new THREE.WebGLRenderer();
    renderer.setClearColor(0x000000, 1.0);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
}

function createCamera(){
    camera = new THREE.OrthographicCamera(
        -window.innerWidth/8, window.innerWidth/8,
        window.innerHeight/8, -window.innerHeight/8,
        0.1, 1000
    );
    camera.position.z = 100

    cameraControl = new THREE.CameraHelper( camera );
}

function createObjects(){
    //createBox(scene);
    createLight(scene);
    if(mode != ASCII)createPlane(scene, 'assets/background.jpg')
    createMesh(scene, "submarine", "assets/submarine/Submarine Low-poly.fbx", "assets/submarine/Submarine__BaseColor.png", "assets/submarine/Submarine__Normal.png");
    createMesh(scene, 'mine', 'assets/mine/sea mine export.fbx', 'assets/mine/lambert1_Base_Color.png', 'assets/mine/lambert1_Normal_OpenGL.png');
}

function render(){
    stats.update();
    cameraControl.update();

    if(scene.getObjectByName('mine') != undefined){
        scene.getObjectByName('mine').scale.set(25, 25, 25);
        
        if (!init_bomb) {
            scene.getObjectByName('mine').position.y = Math.random() * (90 + 90) - 90;
            scene.getObjectByName('mine').position.x = 270;
            init_bomb = true;
        }
    }

    if(scene.getObjectByName('submarine') != undefined){
        scene.getObjectByName('submarine').scale.set(25, 25, 25);
        scene.getObjectByName('submarine').rotation.y = 0.5 * Math.PI;
    }
    if(!game_over && game_begin && !game_paused){
        if(scene.getObjectByName('submarine') != undefined && scene.getObjectByName('mine') != undefined){
            let delta = clock.getDelta();
            velocity -= gravity * delta;
            scene.getObjectByName('submarine').position.y += velocity * delta;

            scene.getObjectByName('mine').position.x -= 100 * delta;
            scene.getObjectByName('mine').rotation.y += 1 * delta;
    
            if(scene.getObjectByName('submarine').position.y < -window.innerHeight/8 || scene.getObjectByName('submarine').position.y > window.innerHeight/8 || intersects()){
                game_over = true;
                document.getElementById('over').classList = [];
            }

            if(scene.getObjectByName('mine').position.x < -270){
                init_bomb = false;
                points++;
                document.getElementById('points').innerHTML = points;
            }
        }
    }

    switch(mode){
        case ASCII:
            ascii_effect.render(scene, camera);
            break;
        case OUTLINE:
            if(scene.getObjectByName('submarine') != undefined && scene.getObjectByName('mine') != undefined){
                let selectedObjects = [];
                selectedObjects.push(scene.getObjectByName('submarine'));
                selectedObjects.push(scene.getObjectByName('mine'));
                outlinePass.selectedObjects = selectedObjects;
            }
        case GLITCH:
        case PIXEL:
            composer.render();
            break;
        default:
            renderer.render(scene, camera);
            break;
    }

    if(scene.getObjectByName('submarine') != undefined && scene.getObjectByName('mine')){
        intersects();
    }
    
    requestAnimationFrame( render );
}

init();

window.addEventListener('keydown', (e)=>{
    switch(e.key){
        case 'Escape':
            game_paused = !game_paused;
            clock.start()
            let el = document.getElementById('pause');
            if(el.classList.length > 0){
                el.classList = [];
            } else {
                el.classList.add("hidden");
            }
            break;
    }
});

document.getElementById('jump').addEventListener('click', (e)=>{
    if(game_begin){
        velocity = 200;
    }
});

document.getElementById('play').addEventListener('click', (e)=>{
    let el = document.getElementById('play');
    let ele = document.getElementById('point-wrapper');
    let elem = document.getElementsByTagName('h1')[0];
    let eleme = document.getElementById('instructions');
    if(!game_begin){
        el.classList.add("hidden");
        ele.classList = [];
        elem.classList.add("hidden");
        eleme.classList.add('hidden');
        velocity = 0;
        setTimeout(()=>{game_begin = true;}, 100)
    }
});

document.getElementById('normal').addEventListener('click', (e)=>{
    mode = NORMAL;
    reset();
});

document.getElementById('ascii').addEventListener('click', (e)=>{
    mode = ASCII;
    reset();
});

document.getElementById('outline').addEventListener('click', (e)=>{
    mode = OUTLINE;
    reset();
});

document.getElementById('pixellated').addEventListener('click', (e)=>{
    mode = PIXEL;
    reset();
});

document.getElementById('glitch').addEventListener('click', (e)=>{
    mode = GLITCH;
    reset();
});

function reset(){
    game_over = false;
    game_begin = false;
    game_paused = false;
    init_bomb = false;
    points = 0;
    document.getElementsByTagName('main')[0].innerHTML = '';
    document.getElementById('play').classList = [];
    document.getElementById('over').classList.add('hidden');
    document.getElementById('pause').classList.add('hidden');
    document.getElementById('point-wrapper').classList.add('hidden');
    document.getElementsByTagName('h1')[0].classList = [];
    document.getElementById('instructions').classList = [];
    init();
}

function intersects(){
    let sub = scene.getObjectByName('submarine');
    let mine = scene.getObjectByName('mine');

    if(sub.position.distanceTo(mine.position) <= 35){
        return true;
    }

    return false;
}