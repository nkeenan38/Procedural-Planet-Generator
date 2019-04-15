import { vec3 } from 'gl-matrix';
import * as Stats from 'stats-js';
import * as DAT from 'dat-gui';
import OpenGLRenderer from './rendering/gl/OpenGLRenderer';
import Camera from './Camera';
import { setGL } from './globals';
import ShaderProgram, { Shader } from './rendering/gl/ShaderProgram';
import Planet from './Planet';
let prevScale = 5.0;
let prevSharpness = 0.2;
// Define an object with application parameters and button callbacks
// This will be referred to by dat.GUI's functions that add GUI elements.
const controls = {
    'Load Scene': loadScene,
    'Subdivsions': 4,
    'Plates': 10,
    'Tile': 'Terrain'
};
let tileType = controls.Tile;
let subdivisions = controls.Subdivsions;
let plateCount = controls.Plates;
let planet;
let wPressed;
let aPressed;
let sPressed;
let dPressed;
function loadScene() {
    planet = new Planet();
    planet.readObjFromFile();
    for (let i = 0; i < subdivisions; i++) {
        planet.subdividePolyhedron();
    }
    planet.dualPolyhedron();
    planet.createTectonicPlates(plateCount);
    planet.fixEdges();
    planet.computePlateBoundaries();
    planet.setElevation();
    planet.setPlanetTemperature();
    planet.setPrecipitation();
    planet.blendTemperatureAndPrecipitation();
    planet.determineBiomes();
    planet.extrudeFaces();
    planet.setTileColors(tileType);
    planet.create();
    wPressed = false;
    aPressed = false;
    sPressed = false;
    dPressed = false;
}
function main() {
    window.addEventListener('keypress', function (e) {
        // console.log(e.key);
        switch (e.key) {
            case 'w':
                wPressed = true;
                break;
            case 'a':
                aPressed = true;
                break;
            case 's':
                sPressed = true;
                break;
            case 'd':
                dPressed = true;
                break;
        }
    }, false);
    window.addEventListener('keyup', function (e) {
        switch (e.key) {
            case 'w':
                wPressed = false;
                break;
            case 'a':
                aPressed = false;
                break;
            case 's':
                sPressed = false;
                break;
            case 'd':
                dPressed = false;
                break;
        }
    }, false);
    // Initial display for framerate
    const stats = Stats();
    stats.setMode(0);
    stats.domElement.style.position = 'absolute';
    stats.domElement.style.left = '0px';
    stats.domElement.style.top = '0px';
    document.body.appendChild(stats.domElement);
    // Add controls to the gui
    const gui = new DAT.GUI();
    gui.add(controls, 'Load Scene');
    gui.add(controls, 'Subdivsions', 3, 5).step(1);
    gui.add(controls, 'Plates', 4, 20).step(1);
    gui.add(controls, 'Tile', ['Terrain', 'Tectonic Plates', 'Temperature', 'Precipitation']);
    // get canvas and webgl context
    const canvas = document.getElementById('canvas');
    const gl = canvas.getContext('webgl2');
    if (!gl) {
        alert('WebGL 2 not supported!');
    }
    // `setGL` is a function imported above which sets the value of `gl` in the `globals.ts` module.
    // Later, we can import `gl` from `globals.ts` to access it
    setGL(gl);
    // Initial call to load scene
    loadScene();
    const camera = new Camera(vec3.fromValues(0, 0, 5), vec3.fromValues(0, 0, 0));
    const renderer = new OpenGLRenderer(canvas);
    renderer.setClearColor(164.0 / 255.0, 233.0 / 255.0, 1.0, 1);
    gl.enable(gl.DEPTH_TEST);
    const lambert = new ShaderProgram([
        new Shader(gl.VERTEX_SHADER, require('./shaders/lambert-vert.glsl')),
        new Shader(gl.FRAGMENT_SHADER, require('./shaders/lambert-frag.glsl')),
    ]);
    function processKeyPresses() {
        let velocity = vec3.fromValues(0, 0, 0);
        if (wPressed) {
            velocity[1] += 1.0;
        }
        if (aPressed) {
            velocity[0] += 1.0;
        }
        if (sPressed) {
            velocity[1] -= 1.0;
        }
        if (dPressed) {
            velocity[0] -= 1.0;
        }
        vec3.add(camera.position, camera.position, velocity);
    }
    // This function will be called every frame
    function tick() {
        if (tileType !== controls.Tile) {
            tileType = controls.Tile;
            planet.setTileColors(tileType);
            planet.destory();
            planet.create();
        }
        if (subdivisions !== controls.Subdivsions) {
            subdivisions = controls.Subdivsions;
        }
        if (plateCount !== controls.Plates) {
            plateCount = controls.Plates;
        }
        camera.update();
        stats.begin();
        gl.viewport(0, 0, window.innerWidth, window.innerHeight);
        renderer.clear();
        processKeyPresses();
        renderer.render(camera, lambert, [
            planet
        ]);
        stats.end();
        // Tell the browser to call `tick` again whenever it renders a new frame
        requestAnimationFrame(tick);
    }
    window.addEventListener('resize', function () {
        renderer.setSize(window.innerWidth, window.innerHeight);
        camera.setAspectRatio(window.innerWidth / window.innerHeight);
        camera.updateProjectionMatrix();
    }, false);
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.setAspectRatio(window.innerWidth / window.innerHeight);
    camera.updateProjectionMatrix();
    // Start the render loop
    tick();
}
main();
//# sourceMappingURL=main.js.map