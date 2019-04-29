import { mat4 } from 'gl-matrix';
import { gl } from '../../globals';
var activeProgram = null;
export class Shader {
    constructor(type, source) {
        this.shader = gl.createShader(type);
        gl.shaderSource(this.shader, source);
        gl.compileShader(this.shader);
        if (!gl.getShaderParameter(this.shader, gl.COMPILE_STATUS)) {
            throw gl.getShaderInfoLog(this.shader);
        }
    }
}
;
class ShaderProgram {
    constructor(shaders) {
        this.time = 0.0;
        this.prog = gl.createProgram();
        for (let shader of shaders) {
            gl.attachShader(this.prog, shader.shader);
        }
        gl.linkProgram(this.prog);
        if (!gl.getProgramParameter(this.prog, gl.LINK_STATUS)) {
            throw gl.getProgramInfoLog(this.prog);
        }
        this.attrPos = gl.getAttribLocation(this.prog, "vs_Pos");
        this.attrNor = gl.getAttribLocation(this.prog, "vs_Nor");
        this.attrCol = gl.getAttribLocation(this.prog, "vs_Col");
        this.attrUV = gl.getAttribLocation(this.prog, "vs_UV");
        this.attrBiome = gl.getAttribLocation(this.prog, "vs_Biome");
        this.attrCol1 = gl.getAttribLocation(this.prog, "vs_Col1");
        this.attrCol2 = gl.getAttribLocation(this.prog, "vs_Col2");
        this.attrCol3 = gl.getAttribLocation(this.prog, "vs_Col3");
        this.attrCol4 = gl.getAttribLocation(this.prog, "vs_Col4");
        this.unifModel = gl.getUniformLocation(this.prog, "u_Model");
        this.unifModelInvTr = gl.getUniformLocation(this.prog, "u_ModelInvTr");
        this.unifViewProj = gl.getUniformLocation(this.prog, "u_ViewProj");
        this.unifLightSpaceMatrix = gl.getUniformLocation(this.prog, "u_LightSpaceMatrix");
        this.unifLightPosition = gl.getUniformLocation(this.prog, "u_LightPos");
        this.unifCameraPosition = gl.getUniformLocation(this.prog, "u_CameraPosition");
        this.unifTileType = gl.getUniformLocation(this.prog, "u_TileType");
        this.unifLightingEnabled = gl.getUniformLocation(this.prog, "u_LightingEnabled");
        gl.enable(gl.BLEND);
        gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    }
    use() {
        if (activeProgram !== this.prog) {
            gl.useProgram(this.prog);
            activeProgram = this.prog;
        }
    }
    setModelMatrix(model) {
        this.use();
        if (this.unifModel !== -1) {
            gl.uniformMatrix4fv(this.unifModel, false, model);
        }
        if (this.unifModelInvTr !== -1) {
            let modelinvtr = mat4.create();
            mat4.transpose(modelinvtr, model);
            mat4.invert(modelinvtr, modelinvtr);
            gl.uniformMatrix4fv(this.unifModelInvTr, false, modelinvtr);
        }
    }
    setViewProjMatrix(vp) {
        this.use();
        if (this.unifViewProj !== -1) {
            gl.uniformMatrix4fv(this.unifViewProj, false, vp);
        }
    }
    setLightSpaceMatrix(m) {
        this.use();
        if (this.unifLightSpaceMatrix !== -1) {
            gl.uniformMatrix4fv(this.unifLightSpaceMatrix, false, m);
        }
    }
    setLightPosition(p) {
        this.use();
        if (this.unifLightPosition !== -1) {
            gl.uniform3fv(this.unifLightPosition, p);
        }
    }
    setTileType(t) {
        this.use();
        if (this.unifTileType !== -1) {
            gl.uniform1i(this.unifTileType, t);
        }
    }
    setLightingEnabled(t) {
        this.use();
        if (this.unifLightingEnabled !== -1) {
            gl.uniform1i(this.unifLightingEnabled, t);
        }
    }
    setCameraPosition(p) {
        this.use();
        if (this.unifCameraPosition !== -1) {
            gl.uniform3fv(this.unifCameraPosition, p);
        }
    }
    draw(d) {
        this.use();
        if (this.attrPos !== -1 && d.bindPos()) {
            gl.enableVertexAttribArray(this.attrPos);
            gl.vertexAttribPointer(this.attrPos, 4, gl.FLOAT, false, 0, 0);
            gl.vertexAttribDivisor(this.attrPos, 0);
        }
        if (this.attrNor !== -1 && d.bindNor()) {
            gl.enableVertexAttribArray(this.attrNor);
            gl.vertexAttribPointer(this.attrNor, 4, gl.FLOAT, false, 0, 0);
            gl.vertexAttribDivisor(this.attrNor, 0);
        }
        if (this.attrCol !== -1 && d.bindCol()) {
            gl.enableVertexAttribArray(this.attrCol);
            gl.vertexAttribPointer(this.attrCol, 4, gl.FLOAT, false, 0, 0);
            gl.vertexAttribDivisor(this.attrCol, 0);
        }
        if (this.attrUV !== -1 && d.bindUV()) {
            gl.enableVertexAttribArray(this.attrUV);
            gl.vertexAttribPointer(this.attrUV, 2, gl.FLOAT, false, 0, 0);
            gl.vertexAttribDivisor(this.attrUV, 0);
        }
        if (this.attrBiome !== -1 && d.bindBiome()) {
            gl.enableVertexAttribArray(this.attrBiome);
            gl.vertexAttribIPointer(this.attrBiome, 1, gl.UNSIGNED_INT, 0, 0);
            gl.vertexAttribDivisor(this.attrBiome, 0);
        }
        if (this.attrCol1 != -1 && d.bindCol1()) {
            gl.enableVertexAttribArray(this.attrCol1);
            gl.vertexAttribPointer(this.attrCol1, 4, gl.FLOAT, false, 0, 0);
            gl.vertexAttribDivisor(this.attrCol1, 1); // Advance 1 index in col VBO for each drawn instance
        }
        if (this.attrCol2 != -1 && d.bindCol2()) {
            gl.enableVertexAttribArray(this.attrCol2);
            gl.vertexAttribPointer(this.attrCol2, 4, gl.FLOAT, false, 0, 0);
            gl.vertexAttribDivisor(this.attrCol2, 1); // Advance 1 index in col VBO for each drawn instance
        }
        if (this.attrCol3 != -1 && d.bindCol3()) {
            gl.enableVertexAttribArray(this.attrCol3);
            gl.vertexAttribPointer(this.attrCol3, 4, gl.FLOAT, false, 0, 0);
            gl.vertexAttribDivisor(this.attrCol3, 1); // Advance 1 index in col VBO for each drawn instance
        }
        if (this.attrCol4 != -1 && d.bindCol4()) {
            gl.enableVertexAttribArray(this.attrCol4);
            gl.vertexAttribPointer(this.attrCol4, 4, gl.FLOAT, false, 0, 0);
            gl.vertexAttribDivisor(this.attrCol4, 1); // Advance 1 index in col VBO for each drawn instance
        }
        d.bindIdx();
        gl.drawElementsInstanced(d.drawMode(), d.elemCount(), gl.UNSIGNED_INT, 0, d.numInstances);
        if (this.attrPos !== -1)
            gl.disableVertexAttribArray(this.attrPos);
        if (this.attrNor !== -1)
            gl.disableVertexAttribArray(this.attrNor);
        if (this.attrCol !== -1)
            gl.disableVertexAttribArray(this.attrCol);
        if (this.attrUV !== -1)
            gl.disableVertexAttribArray(this.attrUV);
        if (this.attrBiome !== -1)
            gl.disableVertexAttribArray(this.attrBiome);
        if (this.attrCol1 != -1)
            gl.disableVertexAttribArray(this.attrCol1);
        if (this.attrCol2 != -1)
            gl.disableVertexAttribArray(this.attrCol2);
        if (this.attrCol3 != -1)
            gl.disableVertexAttribArray(this.attrCol3);
        if (this.attrCol4 != -1)
            gl.disableVertexAttribArray(this.attrCol4);
    }
}
;
export default ShaderProgram;
//# sourceMappingURL=ShaderProgram.js.map