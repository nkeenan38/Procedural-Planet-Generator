import Vertex from "./Vertex";
import Face from "./Face";

class Edge
{
    private static count: number = 0;

    readonly id: number;
    vertex: Vertex;
    face: Face;
    next: Edge;
    sym: Edge;

    constructor(face?: Face, vertex?: Vertex)
    {
        this.id = Edge.count++;
        if (face)
        {
            this.face = face;
        }
        if (vertex)
        {
            this.vertex = vertex;
        }
    }
}

export default Edge;