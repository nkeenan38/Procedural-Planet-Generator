import { gl } from '../../globals';
class Drawable {
    constructor() {
        this.count = 0;
        this.idxGenerated = false;
        this.posGenerated = false;
        this.norGenerated = false;
        this.colGenerated = false;
        this.uvGenerated = false;
        this.numInstances = 0; // How many instances of this Drawable the shader program should draw
    }
    destory() {
        gl.deleteBuffer(this.bufIdx);
        gl.deleteBuffer(this.bufPos);
        gl.deleteBuffer(this.bufNor);
        gl.deleteBuffer(this.bufCol);
        gl.deleteBuffer(this.bufRotate);
        gl.deleteBuffer(this.bufUV);
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