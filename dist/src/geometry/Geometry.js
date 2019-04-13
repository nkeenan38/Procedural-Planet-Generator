import Face from "./Face";
import Edge from "./Edge";
import Vertex from "./Vertex";
import Drawable from "../rendering/gl/Drawable";
import { vec3, vec4 } from "gl-matrix";
import { gl, readTextFile, randColor } from "../globals";
class Geometry extends Drawable {
    constructor() {
        super();
        this.faces = [];
        this.edges = [];
        this.vertexes = [];
    }
    create() {
        let idxs = [];
        let vertPos = [];
        let vertNorm = [];
        let vertCol = [];
        for (let face of this.faces) {
            let edge = face.edge;
            let normal = vec4.create();
            do {
                let edge1 = vec3.create();
                vec3.subtract(edge1, edge.next.vertex.position, edge.vertex.position);
                let edge2 = vec3.create();
                vec3.subtract(edge2, edge.next.next.vertex.position, edge.vertex.position);
                let crossProd = vec3.create();
                vec3.cross(crossProd, edge1, edge2);
                if (crossProd == vec3.fromValues(0, 0, 0)) {
                    continue;
                }
                vec3.normalize(crossProd, crossProd);
                normal = vec4.fromValues(crossProd[0], crossProd[1], crossProd[2], 1.0);
                break;
            } while ((edge = edge.next) != face.edge);
            let meshColor = vec4.fromValues(face.color[0], face.color[1], face.color[2], 1);
            let first = face.edge;
            let current = first.next;
            let firstPos = vec4.fromValues(first.vertex.position[0], first.vertex.position[1], first.vertex.position[2], 1);
            let currentPos = vec4.fromValues(current.vertex.position[0], current.vertex.position[1], current.vertex.position[2], 1);
            // reset current half edge
            current = first.next;
            // push the first vertex position and normal to the VBO
            vertPos.push(firstPos);
            vertNorm.push(normal);
            vertCol.push(meshColor);
            vertPos.push(currentPos);
            vertNorm.push(normal);
            vertCol.push(meshColor);
            let firstPosIndex = vertPos.length - 2;
            // triangulate the face
            while (current.next != first) {
                let nextPos = vec4.fromValues(current.next.vertex.position[0], current.next.vertex.position[1], current.next.vertex.position[2], 1);
                vertPos.push(nextPos);
                vertNorm.push(normal);
                vertCol.push(meshColor);
                idxs.push(firstPosIndex);
                idxs.push(vertPos.length - 2);
                idxs.push(vertPos.length - 1);
                current = current.next;
                currentPos = nextPos;
            }
        }
        this.count = idxs.length;
        let vertexCount = vertPos.length;
        let positions = [];
        for (let pos of vertPos) {
            positions.push(pos[0], pos[1], pos[2], pos[3]);
        }
        let normals = [];
        for (let norm of vertNorm) {
            normals.push(norm[0], norm[1], norm[2], norm[3]);
        }
        let cols = [];
        for (let col of vertCol) {
            cols.push(col[0], col[1], col[2], col[3]);
        }
        this.indices = new Uint32Array(idxs);
        this.normals = new Float32Array(normals);
        this.positions = new Float32Array(positions);
        this.colors = new Float32Array(cols);
        this.generateIdx();
        this.generatePos();
        this.generateNor();
        this.generateCol();
        this.count = this.indices.length;
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.bufIdx);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, this.indices, gl.STATIC_DRAW);
        gl.bindBuffer(gl.ARRAY_BUFFER, this.bufPos);
        gl.bufferData(gl.ARRAY_BUFFER, this.positions, gl.STATIC_DRAW);
        gl.bindBuffer(gl.ARRAY_BUFFER, this.bufNor);
        gl.bufferData(gl.ARRAY_BUFFER, this.normals, gl.STATIC_DRAW);
        gl.bindBuffer(gl.ARRAY_BUFFER, this.bufCol);
        gl.bufferData(gl.ARRAY_BUFFER, this.colors, gl.STATIC_DRAW);
    }
    readObjFromFile() {
        let mesh = readTextFile('src/icosahedron.obj');
        let lines = mesh.split('\n');
        for (let line of lines) {
            let list = line.split(" ");
            if (list[0] == "v") {
                let position = vec3.create();
                position[0] = +list[1];
                position[1] = +list[2];
                position[2] = +list[3];
                let vertex = new Vertex();
                vertex.position = position;
                this.vertexes.push(vertex);
            }
            else if (list[0] == "f") {
                let color = randColor();
                let face = new Face(color);
                let index = +list[1].split("/")[0];
                let vertex = this.vertexes[index - 1];
                let prevedge = new Edge(face, vertex);
                vertex.edge = prevedge;
                face.edge = prevedge;
                this.edges.push(prevedge);
                let curredge;
                for (let i = 2; i < list.length; i++) {
                    let index = +list[i].split("/")[0];
                    vertex = this.vertexes[index - 1];
                    curredge = new Edge(face, vertex);
                    vertex.edge = curredge;
                    this.edges.push(curredge);
                    prevedge.next = curredge;
                    prevedge = curredge;
                }
                curredge.next = face.edge;
                this.faces.push(face);
            }
        }
        for (let face of this.faces) {
            let prev = face.edge;
            let curr = prev.next;
            do {
                for (let edge of this.edges) {
                    if (edge.vertex == curr.vertex && edge.next.vertex == prev.vertex) {
                        curr.sym = edge.next;
                        edge.next.sym = curr;
                        break;
                    }
                }
                prev = curr;
                curr = curr.next;
            } while (curr != face.edge);
            for (let edge of this.edges) {
                if (edge.vertex == curr.vertex && edge.next.vertex == prev.vertex) {
                    curr.sym = edge.next;
                    edge.next.sym = curr;
                    break;
                }
            }
        }
        let test = this.testStructure();
        if (test != 0) {
            console.log('ERROR CODE: ' + test);
        }
    }
    addMidpoint(edge) {
        if (edge == null)
            return;
        let edge2 = edge.sym;
        let temp = edge;
        while (temp.next != edge) {
            temp = temp.next;
        }
        let v1 = edge.vertex;
        let v2 = temp.vertex;
        // create a new midpoint vertex whose position is the average of v1 and v2
        let position = vec3.create();
        vec3.add(position, v1.position, v2.position);
        vec3.scale(position, position, 2.0);
        let midpoint = new Vertex();
        midpoint.position = position;
        this.vertexes.push(midpoint);
        // create the 2 new half edges needed to surround the midpoint
        let edgeB = new Edge(edge.face, v1);
        let edge2B = new Edge(edge2.face, v2);
        this.edges.push(edgeB);
        this.edges.push(edge2B);
        // set the new half edge next and vertex pointers
        edgeB.next = edge.next;
        v1.edge = edgeB;
        edge2B.next = edge2.next;
        v2.edge = edge2B;
        // change the original half edge next and vertex pointers
        edge.next = edgeB;
        edge2.next = edge2B;
        edge.vertex = edge2.vertex = midpoint;
        midpoint.edge = edge;
        // set the new syms
        edge.sym = edge2B;
        edge2B.sym = edge;
        edge2.sym = edgeB;
        edgeB.sym = edge2;
        // make the face point to the half edge that points to a midpoint
        // use this assumption when subdividing each face 
        edge.face.edge = edge;
        edge2.face.edge = edge2;
    }
    subdividePolyhedron() {
        let halfEdgesMidpointed = [];
        let uniqueHalfEdges = [];
        for (let edge of this.edges) {
            let found = false;
            for (let id of halfEdgesMidpointed) {
                if (edge.sym.id == id) {
                    found = true;
                    break;
                }
            }
            if (found)
                continue;
            halfEdgesMidpointed.push(edge.id);
            uniqueHalfEdges.push(edge);
        }
        for (let he of uniqueHalfEdges) {
            this.addMidpoint(he);
        }
        let size = this.faces.length;
        for (let i = 0; i < size; i++) {
            this.subdivideFace(this.faces[i]);
        }
        // normalize vertices
        for (let vertex of this.vertexes) {
            vec3.normalize(vertex.position, vertex.position);
        }
    }
    // assumes face is a triangle with two half edges and midpoint on each side
    // face's first half edge must point to a midpoint
    subdivideFace(face) {
        // create the three new faces
        let faceA = new Face(randColor());
        let faceB = new Face(randColor());
        let faceC = new Face(randColor());
        this.faces.push(faceA);
        this.faces.push(faceB);
        this.faces.push(faceC);
        // create the six new half edges
        // the three outer edges
        let heA = new Edge(faceA);
        faceA.edge = heA;
        let heB = new Edge(faceB);
        faceB.edge = heB;
        let heC = new Edge(faceC);
        faceC.edge = heC;
        // the three inner edges
        let heASym = new Edge(face);
        let heBSym = new Edge(face);
        let heCSym = new Edge(face);
        this.edges.push(heA);
        this.edges.push(heB);
        this.edges.push(heC);
        this.edges.push(heASym);
        this.edges.push(heBSym);
        this.edges.push(heCSym);
        // set syms
        heA.sym = heASym;
        heASym.sym = heA;
        heB.sym = heBSym;
        heBSym.sym = heB;
        heC.sym = heCSym;
        heCSym.sym = heC;
        let curr = face.edge;
        let m1 = curr.vertex;
        curr = curr.next;
        let v1 = curr.vertex;
        curr = curr.next;
        let m2 = curr.vertex;
        curr = curr.next;
        let v2 = curr.vertex;
        curr = curr.next;
        let m3 = curr.vertex;
        curr = curr.next;
        let v3 = curr.vertex;
        curr = curr.next;
        // set vertexes for new half edges
        heA.vertex = m3;
        heASym.vertex = m1;
        heB.vertex = m1;
        heBSym.vertex = m2;
        heC.vertex = m2;
        heCSym.vertex = m3;
        // connect half edges and set faces
        // triangle A
        curr = face.edge;
        let next = curr.next;
        curr.next = heA;
        curr.face = faceA;
        // TODO: set appropriate values for last edge in triangle
        curr = next;
        // traingle B
        heB.next = curr;
        curr.face = faceB;
        curr = curr.next;
        next = curr.next;
        curr.next = heB;
        curr.face = faceB;
        curr = next;
        // triangle C
        heC.next = curr;
        curr.face = faceC;
        curr = curr.next;
        next = curr.next;
        curr.face = faceC;
        curr.next = heC;
        curr = next;
        // finish up A
        curr.face = faceA;
        heA.next = curr;
        // center triangle
        heASym.next = heBSym;
        heBSym.next = heCSym;
        heCSym.next = heASym;
        face.edge = heASym;
    }
    dualPolyhedron() {
        let dualVertexes = [];
        let dualHalfEdges = [];
        let dualFaces = [];
        // map current face id's to a vertex of its centroid
        let centroids = new Map();
        let visited = new Map();
        for (let face of this.faces) {
            let vertex = new Vertex();
            vertex.position = face.centroid();
            centroids.set(face.id, vertex);
            dualVertexes.push(vertex);
            visited.set(face.id, false);
        }
        // for each face, connect its centroid to all neighboring face's centroids
        // maintain a list of faces that have already been visited
        for (let face of this.faces) {
            visited.set(face.id, true);
            // get centroids for each neighboring face
            let faceA = face.edge.sym.face;
            let faceB = face.edge.next.sym.face;
            let faceC = face.edge.next.next.sym.face;
            // create new halfedges and retrieve the existing ones
            let towardsA, towardsB, towardsC, awayA, awayB, awayC;
            // set the A half edges
            if (visited.get(faceA.id)) {
                for (let he of dualHalfEdges) {
                    if (he.vertex == centroids.get(face.id) && he.sym.vertex == centroids.get(faceA.id)) {
                        towardsA = he;
                        awayA = he.sym;
                    }
                }
            }
            else {
                towardsA = new Edge();
                towardsA.vertex = centroids.get(face.id);
                towardsA.vertex.edge = towardsA;
                awayA = new Edge();
                awayA.vertex = centroids.get(faceA.id);
                awayA.vertex.edge = awayA;
                towardsA.sym = awayA;
                awayA.sym = towardsA;
                dualHalfEdges.push(towardsA);
                dualHalfEdges.push(awayA);
            }
            // set the B half edges
            if (visited.get(faceB.id)) {
                for (let he of dualHalfEdges) {
                    if (he.vertex == centroids.get(face.id) && he.sym.vertex == centroids.get(faceB.id)) {
                        towardsB = he;
                        awayB = he.sym;
                    }
                }
            }
            else {
                towardsB = new Edge();
                towardsB.vertex = centroids.get(face.id);
                towardsB.vertex.edge = towardsB;
                awayB = new Edge();
                awayB.vertex = centroids.get(faceB.id);
                awayB.vertex.edge = awayB;
                towardsB.sym = awayB;
                awayB.sym = towardsB;
                dualHalfEdges.push(towardsB);
                dualHalfEdges.push(awayB);
            }
            // set the C half edges
            if (visited.get(faceC.id)) {
                for (let he of dualHalfEdges) {
                    if (he.vertex == centroids.get(face.id) && he.sym.vertex == centroids.get(faceC.id)) {
                        towardsC = he;
                        awayC = he.sym;
                    }
                }
            }
            else {
                towardsC = new Edge();
                towardsC.vertex = centroids.get(face.id);
                towardsC.vertex.edge = towardsC;
                awayC = new Edge();
                awayC.vertex = centroids.get(faceC.id);
                awayC.vertex.edge = awayC;
                towardsC.sym = awayC;
                awayC.sym = towardsC;
                dualHalfEdges.push(towardsC);
                dualHalfEdges.push(awayC);
            }
            // set vertexes and nexts for the half edges
            towardsA.next = awayC;
            towardsB.next = awayA;
            towardsC.next = awayB;
        }
        // fill in faces
        for (let he of dualHalfEdges) {
            if (he.face == null) {
                let face = new Face(randColor());
                face.edge = he;
                dualFaces.push(face);
                let curr = he;
                do {
                    curr.face = face;
                } while ((curr = curr.next) != he);
            }
        }
        this.vertexes = dualVertexes;
        this.edges = dualHalfEdges;
        this.faces = dualFaces;
    }
    extrude(face, dist) {
        if (!face)
            return;
        // extrude the face
        let heA = face.edge;
        let heB = heA.sym;
        let heC, heD, heE, heF, hePrevF; // Edges
        let v1 = heA.vertex;
        let v2 = heB.vertex;
        let v3;
        let position = vec3.create();
        let normal = vec3.create();
        normal = vec3.normalize(normal, v2.position); // face grows in direction of vector
        vec3.scaleAndAdd(position, v2.position, normal, dist);
        let v4 = new Vertex();
        v4.position = vec3.clone(position);
        this.vertexes.push(v4);
        let newFace;
        do {
            heB = heA.sym;
            newFace = new Face(face.color);
            heC = new Edge();
            heD = new Edge();
            heE = new Edge();
            heF = new Edge();
            v1 = heA.vertex;
            v2 = heB.vertex;
            normal = vec3.normalize(normal, v1.position); // face grows in direction of vector
            vec3.scaleAndAdd(position, v1.position, normal, dist);
            v3 = new Vertex();
            v3.position = vec3.clone(position);
            // connect elements
            heA.vertex = v3;
            v3.edge = heA;
            heA.sym = heC;
            heB.sym = heE;
            heC.vertex = v4;
            v4.edge = heC;
            newFace.edge = heC;
            heC.sym = heA;
            heC.face = newFace;
            heC.next = heD;
            heD.vertex = v2;
            v2.edge = heD;
            heD.sym = hePrevF;
            if (hePrevF) {
                hePrevF.sym = heD;
            }
            heD.face = newFace;
            heD.next = heE;
            heE.vertex = v1;
            v1.edge = heE;
            heE.sym = heB;
            heE.face = newFace;
            heE.next = heF;
            heF.vertex = v3;
            heF.face = newFace;
            heF.next = heC;
            // push elements onto vectors
            this.edges.push(heC);
            this.edges.push(heD);
            this.edges.push(heE);
            this.edges.push(heF);
            this.vertexes.push(v3);
            this.faces.push(newFace);
            // loop
            v4 = v3;
            heA = heA.next;
            hePrevF = heF;
        } while (heA.next != face.edge);
        // connect last side
        heB = heA.sym;
        newFace = new Face(face.color);
        heC = new Edge();
        heD = new Edge();
        heE = new Edge();
        heF = new Edge();
        v1 = heA.vertex;
        v2 = heB.vertex;
        v3 = face.edge.sym.vertex;
        // connect elements
        heA.vertex = v3;
        v3.edge = heA;
        heA.sym = heC;
        heB.sym = heE;
        heC.vertex = v4;
        v4.edge = heC;
        heC.sym = heA;
        heC.face = newFace;
        newFace.edge = heC;
        heC.next = heD;
        heD.vertex = v2;
        v2.edge = heD;
        heD.sym = hePrevF;
        if (hePrevF) {
            hePrevF.sym = heD;
        }
        heD.face = newFace;
        heD.next = heE;
        heE.vertex = v1;
        v1.edge = heE;
        heE.sym = heB;
        heE.face = newFace;
        heE.next = heF;
        heF.vertex = v3;
        heF.face = newFace;
        heF.next = heC;
        // push elements onto vectors
        this.edges.push(heC);
        this.edges.push(heD);
        this.edges.push(heE);
        this.edges.push(heF);
        this.faces.push(newFace);
        // connect missing halfEdge sym
        face.edge.sym.next.sym = heF;
        heF.sym = face.edge.sym.next;
    }
    testStructure() {
        for (let edge of this.edges) {
            if (edge.face == null)
                return 1;
            if (edge.next == null)
                return 2;
            if (edge.sym == null)
                return 3;
            if (edge.vertex == null)
                return 4;
        }
        for (let vertex of this.vertexes) {
            if (vertex.edge == null)
                return 5;
        }
        for (let face of this.faces) {
            if (face.edge == null)
                return 6;
        }
        return 0;
    }
}
export default Geometry;
//# sourceMappingURL=Geometry.js.map