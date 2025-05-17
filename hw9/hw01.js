// 01-getting-started.js
//-아래의 순서대로 개념들이 나온거.
// - import add-ons
// - default export vs named export
// - scene, background
// - camera, PerspectiveCamera
// - Setting a position
// - renderer: antialiasing, outputColorSpace, enabling shadowMap, shadowMap type, 
// - renderer: setting size, setting clearColor, append renderer to html document
// - stats object
// - orbitControls object: damping
// - GUI value input
// - resize event listener
// - axes Helper
// - ambient light
// - directional light, how to change the target of directional light, casting shadow
// - Mesh = geometry + material
// - cubeGeometry, torusKnotGeometry, planeGeometry, casting shadows, receiving shadows
// - MeshLambertMaterial, MeshPhongMaterial
// - rotation transformation
// - requestAnimationFrame

// main three.module.js library
import * as THREE from 'three'; //-html에서 three로 경로 지정한거 가져옴

// addons: OrbitControls (jsm/controls), Stats (jsm/libs), GUI (jsm/libs)
//
// module default export & import (library에서 export하는 것이 하나뿐인 경우):
//             export default function myFunction() { ... }
//             import myFunction from './myModule'; // 중괄호 없이 import
//
// module named export & import:
//             export myFunction() { ... };
//             export const myVariable = 42;
//             import { myFunction, myVariable } from './myModule'; // 중괄호 사용
//-아래는 addon으로 ui 같은거.  orbit...은 arcball같은거. stats는 fps같은거나타냄
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import Stats from 'three/addons/libs/stats.module.js';
import { GUI } from 'three/addons/libs/lil-gui.module.min.js';

// main scene
const scene = new THREE.Scene(); //-씬을 가져옴
scene.background = new THREE.Color(0x000000);

// Perspective camera: (fov, aspect ratio, near, far)
let camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const orthoCamera = new THREE.OrthographicCamera(window.innerWidth / -16, 
                window.innerWidth / 16, window.innerHeight / 16, window.innerHeight / -16, -200, 500);

// set camera position: camera.position.set(-3, 8, 2) 가 더 많이 사용됨 (표현의 차이, 약간 빠름))
camera.position.x = 0;
camera.position.y = 80;
camera.position.z = 150;
camera.lookAt(0, 0, 0);

orthoCamera.position.set(0, 80, 150);
orthoCamera.lookAt(0, 0, 0);



//텍스쳐
const textureLoader = new THREE.TextureLoader();
const earthTexture = textureLoader.load('./assets/textures/Earth.jpg');
const earthMaterial = new THREE.MeshStandardMaterial({
    map: earthTexture,
    roughness: 0.8,
    metalness: 0.2,
    color: "#3498db"
});

const marsTexture = textureLoader.load('./assets/textures/Mars.jpg');
const marsMaterial = new THREE.MeshStandardMaterial({
    map: marsTexture,
    roughness: 0.8,
    metalness: 0.2,
    color: "#c0392b"
});

const mercuryTexture = textureLoader.load('./assets/textures/Mercury.jpg');
const mercuryMaterial = new THREE.MeshStandardMaterial({
    map: mercuryTexture,
    roughness: 0.8,
    metalness: 0.2,
    color: "#a6a6a6"
});

const venusTexture = textureLoader.load('./assets/textures/Venus.jpg');
const venusMaterial = new THREE.MeshStandardMaterial({
    map: venusTexture,
    roughness: 0.8,
    metalness: 0.2,
    color: "#e39e1c"
});



// add camera to the scene 카메라를 씬에 추가
scene.add(camera);

// setup the renderer
//- renderer는 씬과 웹브라우저의 document를 연결하는 역할
// antialias = true: 렌더링 결과가 부드러워짐
const renderer = new THREE.WebGLRenderer({ antialias: true });

// outputColorSpace의 종류
// sRGBColorSpace: 보통 monitor에서 보이는 color로, 어두운 부분을 약간 밝게 보이게 Gamma correction을 함
// sRGBColorSpace는 PBR(Physically Based Rendering, 물리적원리 사용),HDR(High Dynamic Range,밝음과어두움 세밀히)에서는필수적으로 사용함
// LinearColorSpace: 모든 색상을 선형으로 보이게 함 -> 이걸 SRGBColorspace대신 사용할 수 있다는거.
//-rgb를 똑같이 주더라도, colorspace에 따라 색깔이 달라져버림. 모니터별로 보이는 색깔 다른 느낌. 모니터의 colorspace 달라서.
renderer.outputColorSpace = THREE.SRGBColorSpace;

renderer.shadowMap.enabled = true; // scene에서 shadow를 그려줌

// shadowMap의 종류
// BasicShadowMap: 가장 기본적인 shadow map, 쉽고 빠르지만 부드럽지 않음
// PCFShadowMap (default): Percentage-Closer Filtering, 주변의 색상을 평균내서 부드럽게 보이게 함
// PCFSoftShadowMap: 더 부드럽게 보이게 함
// VSMShadowMap: Variance Shadow Map, 더 자연스러운 블러 효과, GPU에서 더 많은 연산 필요
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

// 현재 열린 browser window의 width와 height에 맞게 renderer의 size를 설정
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor(0x000000);
// attach renderer to the body of the html page
//-웹문서에 넣는 느낌
document.body.appendChild(renderer.domElement);

// add Stats: 현재 FPS를 보여줌으로써 rendering 속도 표시
const stats = new Stats();
// attach Stats to the body of the html page
document.body.appendChild(stats.dom);


let orbitControls = new OrbitControls(camera, renderer.domElement);
orbitControls.enableDamping = true;

// add GUI: 간단한 user interface를 제작 가능
// 사용법은 https://lil-gui.georgealways.com/ 
// http://yoonbumtae.com/?p=942 참고

const gui = new GUI();

const controls = new function () {
    this.mercuryRotSpeed= 0.02;
    this.mercuryOrbitSpeed= 0.02;

    this.venusRotSpeed= 0.015;
    this.venusOrbitSpeed= 0.015;

    this.earthRotSpeed= 0.01;
    this.earthOrbitSpeed= 0.01;

    this.marsRotSpeed= 0.008;
    this.marsOrbitSpeed= 0.008;
    this.perspective = "Perspective"; //-카메라 설정
    this.switchCamera = function () {
        if (camera instanceof THREE.PerspectiveCamera) { //-현재 카메라가 perspective면 ortho그래픽으로
            scene.remove(camera);
            camera = null; // 기존의 camera 제거    
            // OrthographicCamera(left, right, top, bottom, near, far)
            camera = new THREE.OrthographicCamera(window.innerWidth / -16, 
                window.innerWidth / 16, window.innerHeight / 16, window.innerHeight / -16, -200, 500);
            camera.position.set(0, 80, 150);
            camera.lookAt(0, 0, 0);
            orbitControls.dispose(); // 기존의 orbitControls 제거, 새로운 orbitcontrol로.
            orbitControls = null;
            orbitControls = new OrbitControls(camera, renderer.domElement);
            orbitControls.enableDamping = true;
            this.perspective = "Orthographic";
        } else { //-지금이 orthographic 카메라 이라면.
            scene.remove(camera);
            camera = null; 
            camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
            camera.position.set(0, 80, 150);
            camera.lookAt(0, 0, 0);
            orbitControls.dispose(); // 기존의 orbitControls 제거
            orbitControls = null;
            orbitControls = new OrbitControls(camera, renderer.domElement);
            orbitControls.enableDamping = true;
            this.perspective = "Perspective";
        }
    };
};


const folder1 = gui.addFolder('Camera')
folder1.add(controls, 'switchCamera').name('Switch Camera Type');
folder1.add(controls, 'perspective').listen();

const folder2 = gui.addFolder('Mercury');
folder2.add(controls, 'mercuryRotSpeed', 0, 0.1, 0.001).name('Rotation Speed'); 
folder2.add(controls, 'mercuryOrbitSpeed', 0, 0.1, 0.001).name('Orbit Speed');

const folder3 = gui.addFolder('Venus');
folder3.add(controls, 'venusRotSpeed', 0, 0.1, 0.001).name('Rotation Speed'); 
folder3.add(controls, 'venusOrbitSpeed', 0, 0.1, 0.001).name('Orbit Speed');

const folder4 = gui.addFolder('Earth');
folder4.add(controls, 'earthRotSpeed', 0, 0.1, 0.001).name('Rotation Speed'); 
folder4.add(controls, 'earthOrbitSpeed', 0, 0.1, 0.001).name('Orbit Speed');

const folder5 = gui.addFolder('Mars');
folder5.add(controls, 'marsRotSpeed', 0, 0.1, 0.001).name('Rotation Speed'); 
folder5.add(controls, 'marsOrbitSpeed', 0, 0.1, 0.001).name('Orbit Speed');



// listen to the resize events 사이즈가 바뀌면 발동
window.addEventListener('resize', onResize, false);
function onResize() { // resize handler
    camera.aspect = window.innerWidth / window.innerHeight; //-카메라의 비율 유지. 즉, 창의 비율 그대로 유지
    camera.updateProjectionMatrix(); //-projmetrix도 새로 함.
    renderer.setSize(window.innerWidth, window.innerHeight); //-렌더러도 바꿈.
}

// axes helper: x, y, z 축을 보여줌
//-Helper는 실제 오브젝트는 아닌데 그림을 그릴 때 도움 받을 수 있는거.
const axesHelper = new THREE.AxesHelper(10); // 10 unit 길이의 축을 보여줌 -> 화면에서 축.
scene.add(axesHelper); //-씬에 add 안하면 안보임
//-
//- 원래 const gridHelper = new TGREE.GridHelper(10,7) : size =10, division=7 있었음.
// - scean.add(gridHelper)
//- 이는 xz plane에 grid를 보여줌.


// add ambient light
const ambientLight = new THREE.AmbientLight(0xffffff, 0.8); //-다른light가 안닿아서 어두운부분.
scene.add(ambientLight);

// add directional light 일단 깔음.
const dirLight = new THREE.DirectionalLight(0xffffff, 0.5);
dirLight.position.set(5, 12, 8); // 여기서 부터 (0, 0, 0) 방향으로 light ray 방향 (0,0,0)이 기본값이고, 후에 바꿀수있음
dirLight.castShadow = true;  // 이 light가 shadow를 만들어 낼 것임 즉, 그림자를 생기게 만든다.
scene.add(dirLight);

//----- Directional light의 target 위치를 바꾸기 ------------
//- 기본 위치는 (0,0,0)
//const light = new THREE.DirectionalLight(0xffffff, 1);
//light.position.set(10, 10, 10); // 광원이 있는 위치
//
// 타겟 객체 생성(더미), Mesh는 Object3D의 subclass
//const targetObject = new THREE.Object3D(); //-렌더링되는게 아니라 안보임. 그래도 존재
//targetObject.position.set(5, 0, 0); // 타겟 위치 지정
//scene.add(targetObject);
//
// 빛의 방향 지정
//light.target = targetObject;
//scene.add(light);

//-이렇게 빛의 방향 정했고, 또 camera의 방향도 바꿀 수 있음. 어떤 오브젝트를 따라가는 카메라를 만들려 할 때 사용

// create a cube and add it to the scene
// BoxGeometry: width, height, depth의 default는 1
//            : default center position = (0, 0, 0) => +0.5, -0.5로 위치 지정되어있음



//행성들
const circleGeometry = new THREE.SphereGeometry(10);
//material은 이미 위에서 texture와 함께 설정함.
const sunMaterial = new THREE.MeshBasicMaterial({ color: 0xffff33 });
const sun = new THREE.Mesh(circleGeometry, sunMaterial);
scene.add(sun);
//태양빛 추가가

const sunLight = new THREE.PointLight(0xffffff, 2, 300); // (색, 세기, 감쇠거리)
sunLight.position.copy(sun.position);
scene.add(sunLight);

const pivot_mercury = new THREE.Object3D();
scene.add(pivot_mercury)

const mercury = new THREE.Mesh(new THREE.SphereGeometry(1.5), mercuryMaterial);
mercury.position.set(20,0,0); //-처음 시작 위치
// cube.castShadow = true; 
pivot_mercury.add(mercury);

const pivot_venus = new THREE.Object3D();
scene.add(pivot_venus)

const venus = new THREE.Mesh(new THREE.SphereGeometry(3), venusMaterial);
venus.position.set(35,0,0); //-처음 시작 위치
// cube.castShadow = true; 
pivot_venus.add(venus);

const pivot_earth = new THREE.Object3D();
scene.add(pivot_earth)

const earth = new THREE.Mesh(new THREE.SphereGeometry(3.5), earthMaterial);
earth.position.set(50,0,0); //-처음 시작 위치
// cube.castShadow = true; 
pivot_earth.add(earth);

const pivot_mars = new THREE.Object3D();
scene.add(pivot_mars)

const mars = new THREE.Mesh(new THREE.SphereGeometry(2.5), marsMaterial);
mars.position.set(65,0,0); //-처음 시작 위치
// cube.castShadow = true; 
pivot_mars.add(mars);

let step = 0;


function animate() { //-혹은 render()

    // stats와 orbitControls는 매 frame마다 update 해줘야 함
    orbitControls.update();
    stats.update();

    step += 0.02; //-프레임마다 step은 0.2씩 증가, 원형으로 이동.
    // 공전
    pivot_mercury.rotation.y += controls.mercuryOrbitSpeed;
    pivot_venus.rotation.y += controls.venusOrbitSpeed;
    pivot_earth.rotation.y += controls.earthOrbitSpeed;
    pivot_mars.rotation.y += controls.marsOrbitSpeed;
    //자전
    //mercury.position.x = 20 * Math.cos(step); 
    //mercury.position.y = 20 * Math.sin(step);

    //venus.position.x = 35 * Math.cos(step); 
    //venus.position.y = 35 * Math.sin(step);  

    //earth.position.x = 50 * Math.cos(step); 
    //earth.position.y = 50 * Math.sin(step);  

    //mars.position.x = 65 * Math.cos(step); 
    //mars.position.y = 65 * Math.sin(step);
    
    mercury.rotation.y += controls.mercuryRotSpeed;
    venus.rotation.y += controls.venusRotSpeed;
    earth.rotation.y += controls.earthRotSpeed;
    mars.rotation.y += controls.marsRotSpeed;



    // 모든 transformation 적용 후, renderer에 렌더링을 한번 해 줘야 함
    renderer.render(scene, camera);

    // 다음 frame을 위해 requestAnimationFrame 호출 
    requestAnimationFrame(animate);
    
}

animate(); //- 마지막에 animate을 call






