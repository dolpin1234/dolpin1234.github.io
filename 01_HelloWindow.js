// Global constants
const canvas = document.getElementById('glCanvas'); // Get the canvas element 
const gl = canvas.getContext('webgl2'); // Get the WebGL2 context

if (!gl) {
    console.error('WebGL 2 is not supported by your browser.');
}

// Set canvas size: 현재 window 전체를 canvas로 사용
canvas.width = 500;
canvas.height = 500;


// Initialize WebGL settings: viewport and clear color
gl.viewport(0, 0, canvas.width, canvas.height);
gl.clearColor(0.1, 0.2, 0.3, 1.0);

// Start rendering
render();

// Render loop
function render() {
    gl.clear(gl.COLOR_BUFFER_BIT);  
    // Draw something here
    gl.enable(gl.SCISSOR_TEST);

    gl.scissor(canvas.width / 2, canvas.height / 2, canvas.width / 2, canvas.height / 2);
    gl.clearColor(0.0,0.7,0.0,1.0)
    gl.clear(gl.COLOR_BUFFER_BIT);

    gl.scissor(0, canvas.height / 2, canvas.width / 2, canvas.height / 2);
    gl.clearColor(1.0,0.0,0.0,1.0)
    gl.clear(gl.COLOR_BUFFER_BIT);

    gl.scissor(0, 0, canvas.width / 2, canvas.height / 2);
    gl.clearColor(0.0,0.4,0.6,1.0)
    gl.clear(gl.COLOR_BUFFER_BIT);

    gl.scissor(canvas.width / 2, 0, canvas.width / 2, canvas.height / 2);
    gl.clearColor(1.0,1.0,0.0,1.0)
    gl.clear(gl.COLOR_BUFFER_BIT);

    gl.disable(gl.SCISSOR_TEST);

}

// Resize viewport when window size changes
window.addEventListener('resize', () => {
    const canvas_size = Math.min(window.innerWidth, window.innerHeight);
    canvas.width = canvas_size;
    canvas.height = canvas_size;
    gl.viewport(0, 0, canvas.width, canvas.height);
    render();
});

