import {mat4, vec3, vec4} from 'gl-matrix';
import Drawable from './Drawable';
import Camera from '../../Camera';
import {gl} from '../../globals';
import ShaderProgram from './ShaderProgram';

// In this file, `gl` is accessible because it is imported above
class OpenGLRenderer {
  constructor(public canvas: HTMLCanvasElement) {
  }

  setClearColor(r: number, g: number, b: number, a: number) {
    gl.clearColor(r, g, b, a);
  }

  setSize(width: number, height: number) {
    this.canvas.width = width;
    this.canvas.height = height;
  }

  clear() {
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  }

  render(camera: Camera, lightPos: vec3, prog: ShaderProgram, drawables: Array<Drawable>) {
    let model = mat4.create();
    let viewProj = mat4.create();

    mat4.identity(model);
    mat4.multiply(viewProj, camera.projectionMatrix, camera.viewMatrix);
    prog.setModelMatrix(model);
    prog.setViewProjMatrix(viewProj);

    let nearPlane: number = 0.1;
    let farPlane: number = 5.0;
    let lightProjection: mat4 = mat4.create();
    mat4.ortho(lightProjection, -10.0, 10.0, -10.0, 10.0, nearPlane, farPlane);  
    let lightView: mat4 = mat4.create();
    mat4.lookAt(lightView, lightPos, 
                           vec3.fromValues(0.0, 0.0, 0.0), 
                           vec3.fromValues(0.0, 1.0, 0.0));
    let lightSpaceMatrix: mat4 = mat4.create();
    mat4.multiply(lightSpaceMatrix, lightProjection, lightView);
    prog.setLightSpaceMatrix(lightSpaceMatrix); 
    prog.setLightPosition(lightPos);
    prog.setCameraPosition(camera.position);

    for (let drawable of drawables) {
      prog.draw(drawable);
    }
  }
};

export default OpenGLRenderer;
