import { resizeAspectRatio, setupText, updateText, Axes } from '../util/util.js';
import { Shader, readShaderFile } from '../util/shader.js';
import { Pyramid } from './squarePyramid.js';

const canvas = document.getElementById('glCanvas');
const gl = canvas.getContext('webgl2');
let shader;
let startTime;
let lastFrameTime;

let isInitialized = false;

let viewMatrix = mat4.create();
let projMatrix = mat4.create();
let modelMatrix = mat4.create(); 
const cameraCircleRadius = 3.0;
const cameraCircleHeight = 2.0;
const cameraCircleSpeed = 90.0; //1초에 90도
const cameraHeightSpeed = 45.0; // 1초에 45도
const pyramid = new Pyramid(gl);
const axes = new Axes(gl, 1.8);

document.addEventListener('DOMContentLoaded', () => {
    if (isInitialized) {
        console.log("Already initialized");
        return;
    }

    main().then(success => {
        if (!success) {
            console.log('program terminated');
            return;
        }
        isInitialized = true;
    }).catch(error => {
        console.error('program terminated with error:', error);
    });
});

function initWebGL() {
    if (!gl) {
        console.error('WebGL 2 is not supported by your browser.');
        return false;
    }

    canvas.width = 700;
    canvas.height = 700;
    resizeAspectRatio(gl, canvas);
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(0.7, 0.8, 0.9, 1.0);
    
    return true;
}

async function initShader() {
    const vertexShaderSource = await readShaderFile('shVert.glsl');
    const fragmentShaderSource = await readShaderFile('shFrag.glsl');
    return new Shader(gl, vertexShaderSource, fragmentShaderSource);
}

function render() {
    const currentTime = Date.now();
    // deltaTime: elapsed time from the last frame
    const deltaTime = (currentTime - lastFrameTime) / 1000.0; // convert to second
    // elapsed time from the start time
    const elapsedTime = (currentTime - startTime) / 1000.0; // convert to second
    lastFrameTime = currentTime;

    // Clear canvas
    gl.clearColor(0.1, 0.2, 0.3, 1.0); //이 줄은 없어도 됨. 애초에 clear 할거라
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.enable(gl.DEPTH_TEST);

    let camX = cameraCircleRadius * Math.sin(glMatrix.toRadian(cameraCircleSpeed * elapsedTime));
    let camZ = cameraCircleRadius * Math.cos(glMatrix.toRadian(cameraCircleSpeed * elapsedTime));
    let camY = 5 + 5 * Math.sin(glMatrix.toRadian(cameraHeightSpeed * elapsedTime)); // 0 ~ 10 사이의 값을 가짐.
    mat4.lookAt(viewMatrix, 
        vec3.fromValues(camX, camY, camZ), 
        vec3.fromValues(0, 0, 0), 
        vec3.fromValues(0, 1, 0)); 

    shader.use();  
    shader.setMat4('u_model', modelMatrix);
    shader.setMat4('u_view', viewMatrix);
    shader.setMat4('u_projection', projMatrix);
    pyramid.draw(shader);

    axes.draw(viewMatrix, projMatrix);

    requestAnimationFrame(render);
}

async function main() {
    try {
        if (!initWebGL()) {
            throw new Error('WebGL initialization failed');
        }
        
        shader = await initShader();

        // Projection transformation matrix
        mat4.perspective(
            projMatrix,
            glMatrix.toRadian(60),  // field of view (fov, degree)
            canvas.width / canvas.height, // aspect ratio
            0.1, // near
            100.0 // far
        );
        //단, 윈도우 사이즈 변경시 위 프로젝션 메트릭스는 유효하지 않음.
        //util에 있는거 수정하면 가능하다 하는데... 흠...

        // starting time (global variable) for animation
        startTime = lastFrameTime = Date.now();

        // call the render function the first time for animation
        requestAnimationFrame(render);

        return true;
    } catch (error) {
        console.error('Failed to initialize program:', error);
        alert('Failed to initialize program');
        return false;
    }
}
