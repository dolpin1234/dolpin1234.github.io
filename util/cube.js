/*-----------------------------------------------------------------------------
class Cube

아래 있는 것들은 vertex attribute로 들어갈 것들. 지금까진 position, color 밖에 없었는데 texture, normal 등 여럿 존재

1) Vertex positions
    A cube has 6 faces and each face has 4 vertices
    The total number of vertices is 24 (6 faces * 4 verts)
    So, vertices need 72 floats (24 * 3 (x, y, z)) in the vertices array (x,y,z 좌표라 * 3)

2) Vertex indices
    Vertex indices of the unit cube is as follows:
     v6----- v5
     /|      /|
    v1------v0|
    | |     | |
    | v7----|-v4
    |/      |/
    v2------v3

    이때, 사각형을 만들 때 삼각형 끼리는 인덱스를 공유하게 했는데, v0 같이 앞, 위, 오른쪽 면을 가진것도
    인덱스로 3개 면에 공통되게 처리하면, 후에 lighthin 할 때, 각 면의 normal vector이 다르기에 3개의 normal vector을 갖는 격이므로
    어려움이 있음. 

    The order of faces and their vertex indices is as follows:
    각각의 vertex index, (0,1,2,3) 은 (v0,v1,v2,v3)을 의미. 즉, 앞면
        front (0,1,2,3), right (0,3,4,5), top (0,5,6,1), 
        left (1,6,7,2), bottom (7,4,3,2), back (4,7,6,5)
    이때 잘보면 시계반대방향으로 돌고있음. 4,7,6,5의 경우 뒤에서 보면 시계반대방향으로 돔
    
    Note that each face has two triangles, 
    so the total number of triangles is 12 (6 faces * 2 triangles)
    And, we need to maintain the order of vertices for each triangle as 
    counterclockwise (when we see the face from the outside of the cube):
    하나의 face는 삼각형 2개로 이루어짐. 그에 따른 인덱스. 이것도 시계반대방향향
        front [(0,1,2), (2,3,0)]
        right [(0,3,4), (4,5,0)]
        top [(0,5,6), (6,1,0)]
        left [(1,6,7), (7,2,1)]
        bottom [(7,4,3), (3,2,7)]
        back [(4,7,6), (6,5,4)]

3) Vertex normals
    Each vertex in the same face has the same normal vector (flat shading)
    The normal vector is the same as the face normal vector
    front face: (0,0,1), right face: (1,0,0), top face: (0,1,0), 
    left face: (-1,0,0), bottom face: (0,-1,0), back face: (0,0,-1) 

4) Vertex colors
    Each vertex in the same face has the same color 
    (flat shading -> 각도에 따라 면의 밝기를 똑같이 나타내는거. 그냥 명암없이 빛 내리쬔다고 생각)
    (vertex normal은 face normal과 같음. 즉, vertex의 normal 벡터가 그 면의 노말벡터와 동일)
    (즉, front face의 경우 (x,y,z) = (0,0,1)이 됨. z축방향으로 normal vector이 있으니. 즉 v0의 normal도 0,0,1)

    The color is the same as the face color 6면 다 색깔 다르게.
    front face: red (1,0,0,1), right face: yellow (1,1,0,1), top face: green (0,1,0,1), 
    left face: cyan (0,1,1,1), bottom face: blue (0,0,1,1), back face: magenta (1,0,1,1) 

5) Vertex texture coordinates 후에 다룰듯.
    Each vertex in the same face has the same texture coordinates (flat shading)
    The texture coordinates are the same as the face texture coordinates
    front face: v0(1,1), v1(0,1), v2(0,0), v3(1,0)
    right face: v0(0,1), v3(0,0), v4(1,0), v5(1,1)
    top face: v0(1,0), v5(0,0), v6(0,1), v1(1,1)
    left face: v1(1,0), v6(0,0), v7(0,1), v2(1,1)
    bottom face: v7(0,0), v4(0,1), v3(1,1), v2(1,0)
    back face: v4(0,0), v7(0,1), v6(1,1), v5(1,0)

6) Parameters:
    1] gl: WebGLRenderingContext
    2] options:
        1> color: array of 4 floats (default: [0.8, 0.8, 0.8, 1.0 ]) -> 처음 생성시, 색깔을 주고 만들 수 있음.
           in this case, all vertices have the same given color 이러면 모든 면이 같은 색깔
           즉, const cube = new Cube(gl, {color:[1,0,0,1]}) 이러면 모든 면이 빨강.

7) Vertex shader: the location (0: position attrib (vec3), 1: normal attrib (vec3),
                            2: color attrib (vec4), and 3: texture coordinate attrib (vec2))
8) Fragment shader: should catch the vertex color from the vertex shader
-----------------------------------------------------------------------------*/

export class Cube {
    constructor(gl, options = {}) {
        this.gl = gl;
        
        // Creating VAO and buffers
        this.vao = gl.createVertexArray();
        this.vbo = gl.createBuffer();
        this.ebo = gl.createBuffer(); //인덱스 버퍼

        // Initializing data
        this.vertices = new Float32Array([
            // 왼쪽 앞 
            0.0, 1.0,  0.0, -0.5,  0.0,  0.5,  0.5, 0.0,  0.5,   0.0, 1.0,  0.0,
            // 오른쪽 앞  
            0.0, 1.0,  0.0, 0.5, 0.0,  0.5,   0.5, 0.0, -0.5,   0.0,  1.0, 0.0,
            // 오른쪽 뒤    
            0.0, 1.0,  0.0, 0.5,  0.0, -0.5,  -0.5,  0.0, -0.5,  0.0,  1.0,  0.0,
            // 왼쪽 뒤   
            0.0, 1.0,  0.0, -0.5,  0.0, -0.5,  -0.5, 0.0, 0.5,  0.0, 1.0,  0.0,
            // 바닥 사각형 
            -0.5, 0.0,  0.5, 0.5, 0.0, 0.5,   0.5, 0.0,  -0.5,  -0.5, 0.0,  -0.5,
        ]);

        this.normals = new Float32Array([ // 보면 다 normal 벡터가 같음. 후에 vbo로 넘겨줄것임.
            // front face (v0,v1,v2,v3)
            0, 0, 1,   0, 0, 1,   0, 0, 1,   0, 0, 1,
            // right face (v0,v3,v4,v5)
            1, 0, 0,   1, 0, 0,   1, 0, 0,   1, 0, 0,
            // top face (v0,v5,v6,v1)
            0, 1, 0,   0, 1, 0,   0, 1, 0,   0, 1, 0,
            // left face (v1,v6,v7,v2)
            -1, 0, 0,  -1, 0, 0,  -1, 0, 0,  -1, 0, 0,
            // bottom face (v7,v4,v3,v2)
            0, -1, 0,   0, -1, 0,   0, -1, 0,   0, -1, 0,
        ]);

        // if color is provided, set all vertices' color to the given color
        if (options.color) { // 색깔을 다 똑같이 만들어주는거.
            for (let i = 0; i < 24 * 4; i += 4) {
                this.colors[i] = options.color[0];
                this.colors[i+1] = options.color[1];
                this.colors[i+2] = options.color[2];
                this.colors[i+3] = options.color[3];
            }
        }
        else {
            this.colors = new Float32Array([
                // front face (v0,v1,v2,v3) - red
                1, 0, 0, 1,   1, 0, 0, 1,   1, 0, 0, 1,   1, 0, 0, 1,
                // right face (v0,v3,v4,v5) - yellow
                1, 1, 0, 1,   1, 1, 0, 1,   1, 1, 0, 1,   1, 1, 0, 1,
                // top face (v0,v5,v6,v1) - green
                0, 1, 0, 1,   0, 1, 0, 1,   0, 1, 0, 1,   0, 1, 0, 1,
                // left face (v1,v6,v7,v2) - cyan
                0, 1, 1, 1,   0, 1, 1, 1,   0, 1, 1, 1,   0, 1, 1, 1,
                // bottom face (v7,v4,v3,v2) - blue
                0, 0, 1, 1,   0, 0, 1, 1,   0, 0, 1, 1,   0, 0, 1, 1,
            ]);
        }

        this.texCoords = new Float32Array([ //텍스쳐, 후에 다룸
            // front face (v0,v1,v2,v3)
            1, 1,   0, 1,   0, 0,   1, 0,
            // right face (v0,v3,v4,v5)
            0, 1,   0, 0,   1, 0,   1, 1,
            // top face (v0,v5,v6,v1)
            1, 0,   1, 1,   0, 1,   0, 0,
            // left face (v1,v6,v7,v2)
            1, 1,   0, 1,   0, 0,   1, 0,
            // bottom face (v7,v4,v3,v2)
            1, 1,   0, 1,   0, 0,   1, 0,
        ]);

        this.indices = new Uint16Array([ //시계 반대 방향, 2개 만들어져 한 면에 총 6개 인덱스 (삼각형 2개)
            // front face
            0, 1, 2,      // v0-v1-v2, v2-v3-v0
            // right face
            4, 5, 6,      // v0-v3-v4, v4-v5-v0
            // top face
            8, 9, 10,    // v0-v5-v6, v6-v1-v0
            // left face
            12, 13, 14, // v1-v6-v7, v7-v2-v1
            // bottom face
            16, 17, 18,  18, 19, 16, // v7-v4-v3, v3-v2-v7
        ]);

        this.sameVertices = new Uint16Array([ //같은 vertex를 나타내는거, v0이 앞, 오른쪽, 
        // 위 3개 면에 공통되었는데, 그런거 적어둔거.
        // 후에 같은 vertex 따라다니면서 데이터 업데이트 할 때 쓰임.
            0, 4, 8,    // indices of the same vertices as v0
            1, 14, 16,  // indices of the same vertices as v0'
            2, 15, 19,  // indices of the same vertices as v0''
            3, 5, 18,   // indices of the same vertices as v0'''
            6, 17, 20,  // indices of the same vertices as v1
            7, 9, 23,   // indices of the same vertices as v2
            10, 13, 22, // indices of the same vertices as v3
            14, 16, 21  // indices of the same vertices as v4
        ]);
        //밑의 3개는 lignting
        this.vertexNormals = new Float32Array(72);
        this.faceNormals = new Float32Array(72);
        this.faceNormals.set(this.normals);

        // compute vertex normals 
        for (let i = 0; i < 24; i += 3) {

            let vn_x = (this.normals[this.sameVertices[i]*3] + 
                       this.normals[this.sameVertices[i+1]*3] + 
                       this.normals[this.sameVertices[i+2]*3]) / 3; 
            let vn_y = (this.normals[this.sameVertices[i]*3 + 1] + 
                       this.normals[this.sameVertices[i+1]*3 + 1] + 
                       this.normals[this.sameVertices[i+2]*3 + 1]) / 3; 
            let vn_z = (this.normals[this.sameVertices[i]*3 + 2] + 
                       this.normals[this.sameVertices[i+1]*3 + 2] + 
                       this.normals[this.sameVertices[i+2]*3 + 2]) / 3; 

            this.vertexNormals[this.sameVertices[i]*3] = vn_x;
            this.vertexNormals[this.sameVertices[i+1]*3] = vn_x;
            this.vertexNormals[this.sameVertices[i+2]*3] = vn_x;
            this.vertexNormals[this.sameVertices[i]*3 + 1] = vn_y;
            this.vertexNormals[this.sameVertices[i+1]*3 + 1] = vn_y;
            this.vertexNormals[this.sameVertices[i+2]*3 + 1] = vn_y;
            this.vertexNormals[this.sameVertices[i]*3 + 2] = vn_z;
            this.vertexNormals[this.sameVertices[i+1]*3 + 2] = vn_z;
            this.vertexNormals[this.sameVertices[i+2]*3 + 2] = vn_z;
        }

        this.initBuffers();
    }

    copyVertexNormalsToNormals() {
        this.normals.set(this.vertexNormals);
    }

    copyFaceNormalsToNormals() {
        this.normals.set(this.faceNormals);
    }
    // 여기부터 시작, 위에는 다 lighting
    initBuffers() {
        const gl = this.gl;

        // 버퍼 크기 계산
        const vSize = this.vertices.byteLength;
        const nSize = this.normals.byteLength;
        const cSize = this.colors.byteLength;
        const tSize = this.texCoords.byteLength;
        const totalSize = vSize + nSize + cSize + tSize;

        gl.bindVertexArray(this.vao);

        // VBO에 데이터 복사
        // gl.bufferSubData(target, offset, data) : target buffer의
        // offset 위치부터 data를 copy (즉, data를 buffer의 일부에만 copy) 약간 array 처럼 offset 만큼 이동 후 데이터 넣음.
        // vertex 하나당 normal, color, postion 등등을 하는게 아니라, 포지션에 대해 모두 카피하고,
        // 그 후에 normal 카피하고 이렇게 전체를 넣는방식
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vbo); //vbo 바인드
        gl.bufferData(gl.ARRAY_BUFFER, totalSize, gl.STATIC_DRAW);
        gl.bufferSubData(gl.ARRAY_BUFFER, 0, this.vertices);
        gl.bufferSubData(gl.ARRAY_BUFFER, vSize, this.normals);
        gl.bufferSubData(gl.ARRAY_BUFFER, vSize + nSize, this.colors);
        gl.bufferSubData(gl.ARRAY_BUFFER, vSize + nSize + cSize, this.texCoords);
        //vertex -> normal -> color -> textcoords 순서로 데이터가 구성됨. 덩어리채로.

        // EBO에 인덱스 데이터 복사
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.ebo);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, this.indices, gl.STATIC_DRAW);//아까만든 인덱스 버퍼 카피

        // vertex attributes 설정 -> 데이터들이 어디 있는지 알려주는격.
        gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 0, 0);  // position (vertex의 location, (x,y,z) 3개짜리, 타입, .. .. , offset)
        gl.vertexAttribPointer(1, 3, gl.FLOAT, false, 0, vSize);  // normal
        gl.vertexAttribPointer(2, 4, gl.FLOAT, false, 0, vSize + nSize);  // color
        gl.vertexAttribPointer(3, 2, gl.FLOAT, false, 0, vSize + nSize + cSize);  // texCoord

        // vertex attributes 활성화
        gl.enableVertexAttribArray(0);
        gl.enableVertexAttribArray(1);
        gl.enableVertexAttribArray(2);
        gl.enableVertexAttribArray(3);

        // 버퍼 바인딩 해제
        gl.bindBuffer(gl.ARRAY_BUFFER, null);
        gl.bindVertexArray(null);
    }
    //lightin이라, 생략
    updateNormals() {
        const gl = this.gl;
        const vSize = this.vertices.byteLength;

        gl.bindVertexArray(this.vao);
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vbo);
        
        // normals 데이터만 업데이트
        gl.bufferSubData(gl.ARRAY_BUFFER, vSize, this.normals);
        
        gl.bindBuffer(gl.ARRAY_BUFFER, null);
        gl.bindVertexArray(null);
    }
    // 쉐이더를 사용하여 drawelement로 그림.
    draw(shader) {

        const gl = this.gl;
        shader.use();
        gl.bindVertexArray(this.vao);
        gl.drawElements(gl.TRIANGLES, 18, gl.UNSIGNED_SHORT, 0); 
        gl.bindVertexArray(null);
    }

    delete() {
        const gl = this.gl;
        gl.deleteBuffer(this.vbo);
        gl.deleteBuffer(this.ebo);
        gl.deleteVertexArray(this.vao);
    }
} 