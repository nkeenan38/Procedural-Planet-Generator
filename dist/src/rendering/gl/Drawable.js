import { gl } from '../../globals';
class Drawable {
    constructor() {
        this.SHADOW_WIDTH = 16384;
        this.SHADOW_HEIGHT = 16384;
        this.count = 0;
        this.idxGenerated = false;
        this.posGenerated = false;
        this.norGenerated = false;
        this.colGenerated = false;
        this.uvGenerated = false;
        this.biomeGenerated = false;
        this.col1Generated = false;
        this.col2Generated = false;
        this.col3Generated = false;
        this.col4Generated = false;
        this.depthGenerated = false;
        this.depthMapGenerated = false;
        this.numInstances = 0; // How many instances of this Drawable the shader program should draw
    }
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
    generateBiome() {
        this.biomeGenerated = true;
        this.bufBiome = gl.createBuffer();
    }
    generateColumns() {
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
    generateDepth() {
        this.depthGenerated = true;
        this.bufDepth = gl.createFramebuffer();
    }
    generateDepthMap() {
        this.depthMapGenerated = true;
        this.depthMap = gl.createTexture();
    }
    bindIdx() {
        if (this.idxGenerated) {
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.bufIdx);
        }
        return this.idxGenerated;
    }
    bindPos() {
        if (this.posGenerated) {
            gl.bindBuffer(gl.ARRAY_BUFFER, this.bufPos);
        }
        return this.posGenerated;
    }
    bindNor() {
        if (this.norGenerated) {
            gl.bindBuffer(gl.ARRAY_BUFFER, this.bufNor);
        }
        return this.norGenerated;
    }
    bindCol() {
        if (this.colGenerated) {
            gl.bindBuffer(gl.ARRAY_BUFFER, this.bufCol);
        }
        return this.colGenerated;
    }
    bindUV() {
        if (this.uvGenerated) {
            gl.bindBuffer(gl.ARRAY_BUFFER, this.bufUV);
        }
        return this.uvGenerated;
    }
    bindBiome() {
        if (this.biomeGenerated) {
            gl.bindBuffer(gl.ARRAY_BUFFER, this.bufBiome);
        }
        return this.biomeGenerated;
    }
    bindCol1() {
        if (this.col1Generated) {
            gl.bindBuffer(gl.ARRAY_BUFFER, this.bufCol1);
        }
        return this.colGenerated;
    }
    bindCol2() {
        if (this.col2Generated) {
            gl.bindBuffer(gl.ARRAY_BUFFER, this.bufCol2);
        }
        return this.colGenerated;
    }
    bindCol3() {
        if (this.col3Generated) {
            gl.bindBuffer(gl.ARRAY_BUFFER, this.bufCol3);
        }
        return this.colGenerated;
    }
    bindCol4() {
        if (this.col4Generated) {
            gl.bindBuffer(gl.ARRAY_BUFFER, this.bufCol4);
        }
        return this.colGenerated;
    }
    bindDepth() {
        if (this.depthGenerated) {
            gl.bindFramebuffer(gl.FRAMEBUFFER, this.bufDepth);
            gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.TEXTURE_2D, this.depthMap, 0);
            gl.drawBuffers([gl.NONE]);
            gl.readBuffer(gl.NONE);
            gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        }
        return this.depthGenerated;
    }
    bindDepthMap() {
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
    elemCount() {
        return this.count;
    }
    drawMode() {
        return gl.TRIANGLES;
    }
    setNumInstances(num) {
        this.numInstances = num;
    }
}
;
export default Drawable;
//# sourceMappingURL=Drawable.js.map