import { vec4 } from 'gl-matrix';
import Drawable from '../rendering/gl/Drawable';
import { gl } from '../globals';
import * as Loader from 'webgl-obj-loader';
class Mesh extends Drawable {
    constructor(objString, center) {
        super(); // Call the constructor of the super class. This is required.
        this.center = vec4.fromValues(center[0], center[1], center[2], 1);
        this.objString = objString;
    }
    create(color) {
        let posTemp = [];
        let norTemp = [];
        let uvsTemp = [];
        let idxTemp = [];
        var loadedMesh = new Loader.Mesh(this.objString);
        //posTemp = loadedMesh.vertices;
        for (var i = 0; i < loadedMesh.vertices.length; i++) {
            posTemp.push(loadedMesh.vertices[i]);
            if (i % 3 == 2)
                posTemp.push(1.0);
        }
        for (var i = 0; i < loadedMesh.vertexNormals.length; i++) {
            norTemp.push(loadedMesh.vertexNormals[i]);
            if (i % 3 == 2)
                norTemp.push(0.0);
        }
        uvsTemp = loadedMesh.textures;
        idxTemp = loadedMesh.indices;
        this.colors = new Float32Array(posTemp.length);
        if (color) {
            for (let i = 0; i < posTemp.length; i++) {
                this.colors[i] = color[i % 4];
            }
        }
        else {
            for (let i = 0; i < posTemp.length; i++) {
                this.colors[i] = 1.0;
            }
        }
        this.indices = new Uint32Array(idxTemp);
        this.normals = new Float32Array(norTemp);
        this.positions = new Float32Array(posTemp);
        if (uvsTemp.length > 0)
            this.uvs = new Float32Array(uvsTemp);
        this.generateIdx();
        this.generatePos();
        this.generateNor();
        this.generateUV();
        this.generateCol();
        this.generateColumns();
        this.generateDepthMap();
        this.generateDepth();
        this.bindDepthMap();
        this.bindDepth();
        this.count = this.indices.length;
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.bufIdx);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, this.indices, gl.STATIC_DRAW);
        gl.bindBuffer(gl.ARRAY_BUFFER, this.bufNor);
        gl.bufferData(gl.ARRAY_BUFFER, this.normals, gl.STATIC_DRAW);
        gl.bindBuffer(gl.ARRAY_BUFFER, this.bufPos);
        gl.bufferData(gl.ARRAY_BUFFER, this.positions, gl.STATIC_DRAW);
        gl.bindBuffer(gl.ARRAY_BUFFER, this.bufCol);
        gl.bufferData(gl.ARRAY_BUFFER, this.colors, gl.STATIC_DRAW);
        if (uvsTemp.length > 0) {
            gl.bindBuffer(gl.ARRAY_BUFFER, this.bufUV);
            gl.bufferData(gl.ARRAY_BUFFER, this.uvs, gl.STATIC_DRAW);
        }
        console.log(`Created Mesh from OBJ`);
        this.objString = ""; // hacky clear
    }
    setInstanceVBOs(col1, col2, col3, col4) {
        gl.bindBuffer(gl.ARRAY_BUFFER, this.bufCol1);
        gl.bufferData(gl.ARRAY_BUFFER, col1, gl.STATIC_DRAW);
        gl.bindBuffer(gl.ARRAY_BUFFER, this.bufCol2);
        gl.bufferData(gl.ARRAY_BUFFER, col2, gl.STATIC_DRAW);
        gl.bindBuffer(gl.ARRAY_BUFFER, this.bufCol3);
        gl.bufferData(gl.ARRAY_BUFFER, col3, gl.STATIC_DRAW);
        gl.bindBuffer(gl.ARRAY_BUFFER, this.bufCol4);
        gl.bufferData(gl.ARRAY_BUFFER, col4, gl.STATIC_DRAW);
    }
}
;
export default Mesh;
//# sourceMappingURL=Mesh.js.map