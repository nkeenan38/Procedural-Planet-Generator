import {vec2, vec3, mat4, vec4} from 'gl-matrix';
import * as Stats from 'stats-js';
import * as DAT from 'dat-gui';
import OpenGLRenderer from './rendering/gl/OpenGLRenderer';
import Camera from './Camera';
import {setGL, readTextFile} from './globals';
import ShaderProgram, {Shader} from './rendering/gl/ShaderProgram';
import Planet from './Planet';
import Precipitation from './components/Precipitation';
import Mesh from './geometry/Mesh';

// Define an object with application parameters and button callbacks
// This will be referred to by dat.GUI's functions that add GUI elements.
const controls = {
  'Load Scene': loadScene, // A function pointer, essentially
  'Subdivsions': 4,
  'Plates': 10,
  'Tile': 'Terrain',
  'Time': 0,
  'Rotation Speed': 0.01,
  'Lighting': lighting
};
let lightingEnabled: boolean = true;
let switchLighting: boolean = false;
let tileType = controls.Tile;
let subdivisions = controls.Subdivsions;
let plateCount = controls.Plates;
let rotationSpeed = controls["Rotation Speed"];

let planet: Planet;
let palmTreeLeaves: Mesh;
let palmTreeTrunk: Mesh;
let firTreeLeaves: Mesh;
let firTreeTrunk: Mesh;
let snowTreeLeaves: Mesh;
let snowTreeTrunk: Mesh;
let cow: Mesh;
let wPressed: boolean;
let aPressed: boolean;
let sPressed: boolean;
let dPressed: boolean;

function lighting()
{
  lightingEnabled = !lightingEnabled;
  switchLighting = true;
}

function loadScene() 
{
  planet = new Planet();
  planet.readObjFromFile();
  for (let i = 0; i < subdivisions; i++)
  {
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

  let obj: string = readTextFile('src/palm-tree.obj');
  palmTreeLeaves = new Mesh(obj, vec3.create());
  palmTreeLeaves.create(vec4.fromValues(0.1, 0.8, 0.1, 1.0));

  obj = readTextFile('src/palm-tree-trunk.obj');
  palmTreeTrunk = new Mesh(obj, vec3.create());
  palmTreeTrunk.create(vec4.fromValues(0.5, 0.3, 0.05, 1.0));

  obj = readTextFile('src/fir-tree.obj');
  firTreeLeaves = new Mesh(obj, vec3.create());
  firTreeLeaves.create(vec4.fromValues(0.1, 0.8, 0.1, 1.0));

  obj = readTextFile('src/fir-tree-trunk.obj');
  firTreeTrunk = new Mesh(obj, vec3.create());
  firTreeTrunk.create(vec4.fromValues(0.5, 0.3, 0.05, 1.0));

  obj = readTextFile('src/fir-tree.obj');
  snowTreeLeaves = new Mesh(obj, vec3.create());
  snowTreeLeaves.create(vec4.fromValues(0.9, 0.9, 0.9, 1.0));

  obj = readTextFile('src/fir-tree-trunk.obj');
  snowTreeTrunk = new Mesh(obj, vec3.create());
  snowTreeTrunk.create(vec4.fromValues(0.5, 0.3, 0.05, 1.0));

  obj = readTextFile('src/cow.obj');
  cow = new Mesh(obj, vec3.create());
  cow.create(vec4.fromValues(0.78, 0.66, 0.4, 1.0));

  let assetScale = 0.04 / (subdivisions - 2);

  let col1Arr: number[] = [];
  let col2Arr: number[] = [];
  let col3Arr: number[] = [];
  let col4Arr: number[] = [];
  let instances = planet.getPalmTreePositions();
  for (let pos of instances)
  {
    let transformation: mat4 = mat4.create();
    mat4.translate(transformation, transformation, pos);
    mat4.scale(transformation, transformation, vec3.fromValues(assetScale, assetScale, assetScale));
    let cross = vec3.create();
    vec3.cross(cross, vec3.fromValues(0, 1, 0), pos);
    let theta = vec3.angle(vec3.fromValues(0, 1, 0), pos);
    mat4.rotate(transformation, transformation, theta, cross);
    col1Arr.push(transformation[0], transformation[1], transformation[2], transformation[3]);
    col2Arr.push(transformation[4], transformation[5], transformation[6], transformation[7]);
    col3Arr.push(transformation[8], transformation[9], transformation[10], transformation[11]);
    col4Arr.push(transformation[12], transformation[13], transformation[14], transformation[15]);
  }

  let col1 : Float32Array = new Float32Array(col1Arr);
  let col2 : Float32Array = new Float32Array(col2Arr);
  let col3 : Float32Array = new Float32Array(col3Arr);
  let col4 : Float32Array = new Float32Array(col4Arr);

  palmTreeLeaves.setNumInstances(instances.length);
  palmTreeLeaves.setInstanceVBOs(col1, col2, col3, col4);
  palmTreeTrunk.setNumInstances(instances.length);
  palmTreeTrunk.setInstanceVBOs(col1, col2, col3, col4);

  col1Arr = [];
  col2Arr = [];
  col3Arr = [];
  col4Arr = [];

  instances = planet.getFirTreePositions();
  for (let pos of instances)
  {
    let transformation: mat4 = mat4.create();
    mat4.translate(transformation, transformation, pos);
    mat4.scale(transformation, transformation, vec3.fromValues(assetScale, assetScale, assetScale));
    let cross = vec3.create();
    vec3.cross(cross, vec3.fromValues(0, 1, 0), pos);
    let theta = vec3.angle(vec3.fromValues(0, 1, 0), pos);
    mat4.rotate(transformation, transformation, theta, cross);
    col1Arr.push(transformation[0], transformation[1], transformation[2], transformation[3]);
    col2Arr.push(transformation[4], transformation[5], transformation[6], transformation[7]);
    col3Arr.push(transformation[8], transformation[9], transformation[10], transformation[11]);
    col4Arr.push(transformation[12], transformation[13], transformation[14], transformation[15]);
  }

  col1 = new Float32Array(col1Arr);
  col2 = new Float32Array(col2Arr);
  col3 = new Float32Array(col3Arr);
  col4 = new Float32Array(col4Arr);

  firTreeLeaves.setNumInstances(instances.length);
  firTreeLeaves.setInstanceVBOs(col1, col2, col3, col4);
  firTreeTrunk.setNumInstances(instances.length);
  firTreeTrunk.setInstanceVBOs(col1, col2, col3, col4);

  col1Arr = [];
  col2Arr = [];
  col3Arr = [];
  col4Arr = [];

  instances = planet.getSnowTreePositions();
  for (let pos of instances)
  {
    let transformation: mat4 = mat4.create();
    mat4.translate(transformation, transformation, pos);
    mat4.scale(transformation, transformation, vec3.fromValues(assetScale, assetScale, assetScale));
    let cross = vec3.create();
    vec3.cross(cross, vec3.fromValues(0, 1, 0), pos);
    let theta = vec3.angle(vec3.fromValues(0, 1, 0), pos);
    mat4.rotate(transformation, transformation, theta, cross);
    col1Arr.push(transformation[0], transformation[1], transformation[2], transformation[3]);
    col2Arr.push(transformation[4], transformation[5], transformation[6], transformation[7]);
    col3Arr.push(transformation[8], transformation[9], transformation[10], transformation[11]);
    col4Arr.push(transformation[12], transformation[13], transformation[14], transformation[15]);
  }

  col1 = new Float32Array(col1Arr);
  col2 = new Float32Array(col2Arr);
  col3 = new Float32Array(col3Arr);
  col4 = new Float32Array(col4Arr);

  snowTreeLeaves.setNumInstances(instances.length);
  snowTreeLeaves.setInstanceVBOs(col1, col2, col3, col4);
  snowTreeTrunk.setNumInstances(instances.length);
  snowTreeTrunk.setInstanceVBOs(col1, col2, col3, col4);

  col1Arr = [];
  col2Arr = [];
  col3Arr = [];
  col4Arr = [];

  instances = planet.getCowPositions();
  for (let pos of instances)
  {
    let transformation: mat4 = mat4.create();
    let scale = vec3.clone(pos);
    vec3.scale(scale, scale, 1.015);
    mat4.translate(transformation, transformation, scale);
    mat4.scale(transformation, transformation, vec3.fromValues(assetScale * 0.25, assetScale * 0.25, assetScale * 0.25));
    let cross = vec3.create();
    vec3.cross(cross, vec3.fromValues(0, 1, 0), pos);
    let theta = vec3.angle(vec3.fromValues(0, 1, 0), pos);
    mat4.rotate(transformation, transformation, theta, cross);
    col1Arr.push(transformation[0], transformation[1], transformation[2], transformation[3]);
    col2Arr.push(transformation[4], transformation[5], transformation[6], transformation[7]);
    col3Arr.push(transformation[8], transformation[9], transformation[10], transformation[11]);
    col4Arr.push(transformation[12], transformation[13], transformation[14], transformation[15]);
  }

  col1 = new Float32Array(col1Arr);
  col2 = new Float32Array(col2Arr);
  col3 = new Float32Array(col3Arr);
  col4 = new Float32Array(col4Arr);

  cow.setNumInstances(instances.length);
  cow.setInstanceVBOs(col1, col2, col3, col4);

  wPressed = false;
  aPressed = false;
  sPressed = false;
  dPressed = false;
}

function main() {
  window.addEventListener('keypress', function (e) {
    // console.log(e.key);
    switch(e.key) {
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
    switch(e.key) {
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
  gui.add(controls, 'Lighting');
  gui.add(controls, 'Subdivsions', 3, 5).step(1);
  gui.add(controls, 'Plates', 4, 20).step(1);
  gui.add(controls, 'Tile', [ 'Terrain', 'Tectonic Plates', 'Temperature', 'Precipitation' ]);
  gui.add(controls, 'Time', 0, 24).listen();
  gui.add(controls, 'Rotation Speed', 0, 0.1);


  // get canvas and webgl context
  const canvas = <HTMLCanvasElement> document.getElementById('canvas');
  const gl = <WebGL2RenderingContext> canvas.getContext('webgl2');
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
  // renderer.setClearColor(0, 0, 0, 1);
  gl.enable(gl.DEPTH_TEST);

  const depth = new ShaderProgram([
    new Shader(gl.VERTEX_SHADER, require('./shaders/depth-vert.glsl')),
    new Shader(gl.FRAGMENT_SHADER, require('./shaders/depth-frag.glsl'))
  ]);
  const depthInstanced = new ShaderProgram([
    new Shader(gl.VERTEX_SHADER, require('./shaders/depth-instanced-vert.glsl')),
    new Shader(gl.FRAGMENT_SHADER, require('./shaders/depth-instanced-frag.glsl'))
  ]);
  const lambert = new ShaderProgram([
    new Shader(gl.VERTEX_SHADER, require('./shaders/lambert-vert.glsl')),
    new Shader(gl.FRAGMENT_SHADER, require('./shaders/lambert-frag.glsl')),
  ]);
  const assets = new ShaderProgram([
    new Shader(gl.VERTEX_SHADER, require('./shaders/assets-vert.glsl')),
    new Shader(gl.FRAGMENT_SHADER, require('./shaders/assets-frag.glsl'))
  ]);

  function processKeyPresses() {
    let velocity: vec3 = vec3.fromValues(0,0,0);
    if(wPressed) {
      velocity[1] += 1.0;
    }
    if(aPressed) {
      velocity[0] += 1.0;
    }
    if(sPressed) {
      velocity[1] -= 1.0;
    }
    if(dPressed) {
      velocity[0] -= 1.0;
    }
    vec3.add(camera.position, camera.position, velocity);
  }

  // This function will be called every frame
  function tick() {
    if (tileType !== controls.Tile)
    {
        tileType = controls.Tile;
        lambert.setTileType(tileType === "Terrain" ? 0 : 1);
        planet.setTileColors(tileType);
        planet.destory();
        planet.create();
    }
    if (subdivisions !== controls.Subdivsions)
    {
      subdivisions = controls.Subdivsions;
    }
    if (plateCount !== controls.Plates)
    {
      plateCount = controls.Plates;
    }
    if (rotationSpeed !== controls["Rotation Speed"])
    {
      rotationSpeed = controls["Rotation Speed"];
    }
    if (switchLighting)
    {
      switchLighting = false;
      lambert.setLightingEnabled(lightingEnabled ? 1 : 0);
      assets.setLightingEnabled(lightingEnabled ? 1 : 0);
    }
    controls.Time = (controls.Time + rotationSpeed) % 24;
    camera.update();
    stats.begin();
    let time = (controls.Time / 12.0) * Math.PI;
    let lightPos = vec3.fromValues(-Math.sin(time), 0, Math.cos(time));
    vec3.scale(lightPos, lightPos, 3.0);
    // 1. first render to depth map
    gl.viewport(0, 0, planet.SHADOW_WIDTH, planet.SHADOW_HEIGHT);
    gl.bindFramebuffer(gl.FRAMEBUFFER, planet.bufDepth);
    gl.clear(gl.DEPTH_BUFFER_BIT);
    // get the depth from the planet
    renderer.render(camera, lightPos, depth, [planet]);
    // get the depth from the palm trees
    renderer.render(camera, lightPos, depthInstanced, [palmTreeLeaves, palmTreeTrunk, firTreeLeaves, firTreeTrunk, snowTreeLeaves, snowTreeTrunk, cow]);

    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    // 2. then render the scene as normal with shadow mapping
    gl.viewport(0, 0, window.innerWidth, window.innerHeight);
    renderer.clear();
    processKeyPresses();

    // gl.bindTexture(gl.TEXTURE_2D, palmTree.depthMap);
    gl.bindTexture(gl.TEXTURE_2D, planet.depthMap);

    renderer.render(camera, lightPos, lambert, [planet]);
    renderer.render(camera, lightPos, assets, [palmTreeLeaves, palmTreeTrunk, firTreeLeaves, firTreeTrunk, snowTreeLeaves, snowTreeTrunk, cow]);
    stats.end();

    // Tell the browser to call `tick` again whenever it renders a new frame
    requestAnimationFrame(tick);
  }

  window.addEventListener('resize', function() {
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
