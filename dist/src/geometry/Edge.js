class Edge {
    constructor(face, vertex) {
        this.id = Edge.count++;
        if (face) {
            this.face = face;
        }
        if (vertex) {
            this.vertex = vertex;
        }
    }
}
Edge.count = 0;
export default Edge;
//# sourceMappingURL=Edge.js.map