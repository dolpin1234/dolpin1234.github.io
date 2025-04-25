/*-----------------------------------------------------------------------------------
13_Texture.js

- Viewing a 3D unit cube at origin with perspective projection
- Rotating the cube by ArcBall interface (by left mouse button dragging)
- Applying image texture (../images/textures/woodWall2.png) to each face of the cube
-----------------------------------------------------------------------------------*/

// 이미지를 다 쓸 필요 없고, 0 ~ 1 사이에 4등분 하면 0, 0.25, 0.5, 0.75, 1 나오는데 사각형에서 윗변의 ()


///!!! 이미지에서 전체 영역 (-1 ~ 1) 사용 안하고, 0.25, 0.5 이렇게 사용. 0, 0.25, 0.5 ,0.75, 1 이렇게 5개 점이고, 각 삼각형은 3개 좌표씩. (0, 0.25, 0.5), (0.25, 0.5, 0.75) ...

import { resizeAspectRatio, Axes } from '../util/util.js';
import { Shader, readShaderFile } from '../util/shader.js';
import { RegularOctahedron } from './regularOctahedron.js';
import { Arcball } from '../util/arcball.js';
import { loadTexture } from '../util/texture.js';
const canvas = document.getElementById('glCanvas');
const gl = canvas.getContext('webgl2');
let shader;

let isInitialized = false;

let viewMatrix = mat4.create();
let projMatrix = mat4.create();
let modelMatrix = mat4.create();
const axes = new Axes(gl, 1.5); // create an Axes object with the length of axis 1.5
const texture = loadTexture(gl, true, '../images/textures/sunrise.jpg'); // 텍스처를 여기서 가져옴. true는 y축 대칭여부
const regularOctahedron = new RegularOctahedron(gl);

// Arcball object: initial distance 5.0, rotation sensitivity 2.0, zoom sensitivity 0.0005
// default of rotation sensitivity = 1.5, default of zoom sensitivity = 0.001
const arcball = new Arcball(canvas, 5.0, { rotation: 2.0, zoom: 0.0005 });

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

    // clear canvas
    gl.clearColor(0.1, 0.2, 0.3, 1.0); // 이부분은 지워도 무관. 여기부터 시작
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.enable(gl.DEPTH_TEST);

    // get view matrix from the arcball
    const viewMatrix = arcball.getViewMatrix(); //아크볼의 뷰 매트릭스 사용

    // drawing the cube, 이전에 다루었던것. 매트릭스 만들기
    shader.use();  // using the cube's shader
    shader.setMat4('u_model', modelMatrix);
    shader.setMat4('u_view', viewMatrix);
    shader.setMat4('u_projection', projMatrix);
    regularOctahedron.draw(shader);

    // drawing the axes (using the axes's shader: see util.js)
    axes.draw(viewMatrix, projMatrix);

    // call the render function the next time for animation
    requestAnimationFrame(render);
}

async function main() {
    try {
        if (!initWebGL()) {
            throw new Error('WebGL 초기화 실패');
        }
        
        shader = await initShader();

        // View transformation matrix (camera at (0,0,-3), invariant in the program)
        // 전체 월드가 z축으로 -3만큼 이동함. 즉, 멀어짐. 카메라는 여전히 (0,0,0)에 있음.
        mat4.translate(viewMatrix, viewMatrix, vec3.fromValues(0, 0, -3));

        // Projection transformation matrix (invariant in the program) 생략
        mat4.perspective(
            projMatrix,
            glMatrix.toRadian(60),  // field of view (fov, degree)
            canvas.width / canvas.height, // aspect ratio
            0.1, // near
            100.0 // far
        );

        // bind the texture to the shader
        // activate the texture unit 0, 0부터 시작해서 1234... 0부터 시작해서 1,2,3 이런거 쓸 수 있음.
        // 사실, active... 부분 코드는 생략해도 됨.
        // 우린 하나만 쓸거라 기본이 0에 있는거라, 불러올 필요가 없음. 여러개 있었으면 0 활성화, 1활성화화 ... 반복할거임.
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, texture); // 텍스처 바인드시킴.

        // pass the u_texture uniform variable to the shader
        //with the texture unit number

        shader.setInt('u_texture', 0); //여기서 0은 텍스처 unit의 숫자임.
        //이는 후에 다룰듯. 프라그 쉐이터터 뭐시기가 이 값을 쓴다고함

        // 애니메이션
        requestAnimationFrame(render);

        return true;

    } catch (error) {
        console.error('Failed to initialize program:', error);
        alert('Failed to initialize program');
        return false;
    }
}
//그리고 vertex shader에서 3개의 메트릭스 가져오고 v_texcoord를 frag 쉐이더로 넘김
// frag shader에서 in vec2 v_texCoord;로 vertex에서 가져온거 사용하고, 
// 여기서 u_texture이 텍스처의 unit 숫자. 그래서 fragColor = texture(u_texture, v_texCoord);로
// 해당 unit의 텍스처에 바인드된 이미지로 가서 v_texcoord 즉 텍스처 좌표에 해당하는 값을 읽어와서
// 그걸 리턴하는거임. (즉, 이미지의 색깔 가져오는듯.)
