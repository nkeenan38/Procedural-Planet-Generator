import {gl} from '../../globals';

abstract class Drawable {
  readonly SHADOW_WIDTH: number = 16384;
  readonly SHADOW_HEIGHT: number = 16384;

  count: number = 0;

  bufIdx: WebGLBuffer;
  bufPos: WebGLBuffer;
  bufNor: WebGLBuffer;
  bufCol: WebGLBuffer;
  bufUV: WebGLBuffer;
  bufBiome: WebGLBuffer;
  bufCol1: WebGLBuffer;
  bufCol2: WebGLBuffer;
  bufCol3: WebGLBuffer;
  bufCol4: WebGLBuffer;
  bufDepth: WebGLFramebuffer;
  depthMap: WebGLTexture;

  idxGenerated: boolean = false;
  posGenerated: boolean = false;
  norGenerated: boolean = false;
  colGenerated: boolean = false;
  uvGenerated: boolean = false;
  biomeGenerated: boolean = false;
  col1Generated: boolean = false;
  col2Generated: boolean = false;
  col3Generated: boolean = false;
  col4Generated: boolean = false;
  depthGenerated: boolean = false;
  depthMapGenerated: boolean = false;

  numInstances: number = 0; // How many instances of this Drawable the shader program should draw

  abstract create() : void;

  destory() {
    gl.deleteBuffer(this.bufIdx);
    gl.deleteBuffer(this.bufPos);
    gl.deleteBuffer(this.bufNor);
    gl.deleteBuffer(this.bufCol);
    gl.deleteBuffer(this.bufUV);
    gl.deleteBuffer(this.bufBiome);
    gl.deleteBuffer(this.bufCol1);
    gl.deleteBuffer(this.bufCol2);
    gl.deleteBuffer(this.bufCol3);
    gl.deleteBuffer(this.bufCol4);
    gl.deleteFramebuffer(this.bufDepth);
    gl.deleteTexture(this.depthMap);
  }

  generateIdx() {
    this.idxGenerated = true;
    this.bufIdx = gl.createBuffer();
  }

  generatePos() {
    this.posGenerated = true;
    this.bufPos = gl.createBuffer();
  }

  generateNor() {
    this.norGenerated = true;
    this.bufNor = gl.createBuffer();
  }

  generateCol() {
    this.colGenerated = true;
    this.bufCol = gl.createBuffer();
  }

  generateUV() {
    this.uvGenerated = true;
    this.bufUV = gl.createBuffer();
  }

  generateBiome()
  {
    this.biomeGenerated = true;
    this.bufBiome = gl.createBuffer();
  }

  generateColumns()
  {
    this.generateCol1();
    this.generateCol2();
    this.generateCol3();
    this.generateCol4();
  }

  generateCol1() {
    this.col1Generated = true;
    this.bufCol1 = gl.createBuffer();
  }

  generateCol2() {
    this.col2Generated = true;
    this.bufCol2 = gl.createBuffer();
  }

  generateCol3() {
    this.col3Generated = true;
    this.bufCol3 = gl.createBuffer();
  }
  
  generateCol4() {
    this.col4Generated = true;
    this.bufCol4 = gl.createBuffer();
  }

  generateDepth()
  {
    this.depthGenerated = true;
    this.bufDepth = gl.createFramebuffer();
  }

  generateDepthMap()
  {
    this.depthMapGenerated = true;
    this.depthMap = gl.createTexture();
  }

  bindIdx(): boolean {
    if (this.idxGenerated) {
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.bufIdx);
    }
    return this.idxGenerated;
  }

  bindPos(): boolean {
    if (this.posGenerated) {
      gl.bindBuffer(gl.ARRAY_BUFFER, this.bufPos);
    }
    return this.posGenerated;
  }

  bindNor(): boolean {
    if (this.norGenerated) {
      gl.bindBuffer(gl.ARRAY_BUFFER, this.bufNor);
    }
    return this.norGenerated;
  }

  bindCol(): boolean {
    if (this.colGenerated) {
      gl.bindBuffer(gl.ARRAY_BUFFER, this.bufCol);
    }
    return this.colGenerated;
  }

  bindUV(): boolean {
    if (this.uvGenerated) {
      gl.bindBuffer(gl.ARRAY_BUFFER, this.bufUV);
    }
    return this.uvGenerated;
  }

  bindBiome(): boolean {
    if (this.biomeGenerated) {
      gl.bindBuffer(gl.ARRAY_BUFFER, this.bufBiome);
    }
    return this.biomeGenerated;
  }

  bindCol1(): boolean {
    if (this.col1Generated) {
      gl.bindBuffer(gl.ARRAY_BUFFER, this.bufCol1);
    }
    return this.colGenerated;
  }

  bindCol2(): boolean {
    if (this.col2Generated) {
      gl.bindBuffer(gl.ARRAY_BUFFER, this.bufCol2);
    }
    return this.colGenerated;
  }

  bindCol3(): boolean {
    if (this.col3Generated) {
      gl.bindBuffer(gl.ARRAY_BUFFER, this.bufCol3);
    }
    return this.colGenerated;
  }

  bindCol4(): boolean {
    if (this.col4Generated) {
      gl.bindBuffer(gl.ARRAY_BUFFER, this.bufCol4);
    }
    return this.colGenerated;
  }

  bindDepth(): boolean {
    if (this.depthGenerated) {
      gl.bindFramebuffer(gl.FRAMEBUFFER, this.bufDepth);
      gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.TEXTURE_2D, this.depthMap, 0);
      gl.drawBuffers([gl.NONE]);
      gl.readBuffer(gl.NONE);
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    }
    return this.depthGenerated;
  }

  bindDepthMap(): boolean {
    if (this.depthMapGenerated) {
      gl.bindTexture(gl.TEXTURE_2D, this.depthMap);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.DEPTH_COMPONENT32F, this.SHADOW_WIDTH, this.SHADOW_HEIGHT, 0, gl.DEPTH_COMPONENT, gl.FLOAT, null);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
    }
    return this.depthMapGenerated;
  }

  elemCount(): number {
    return this.count;
  }

  drawMode(): GLenum {
    return gl.TRIANGLES;
  }

  setNumInstances(num: number) {
    this.numInstances = num;
  }
};

export default Drawable;
