class Vertex {
    constructor(position) {
        this.id = Vertex.count++;
        if (position) {
            this.position = position;
        }
    }
}
Vertex.count = 0;
export default Vertex;
//# sourceMappingURL=Vertex.js.map