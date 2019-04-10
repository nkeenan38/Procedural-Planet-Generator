import Edge from "./Edge";
import { vec3 } from "gl-matrix";

class Vertex
{
    private static count : number = 0;

    readonly id: number;
    edge: Edge;
    position: vec3;

    constructor()
    {
        this.id = Vertex.count++;
    }
}

export default Vertex;