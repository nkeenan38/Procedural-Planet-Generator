import Edge from "./Edge";
import { vec3, vec2 } from "gl-matrix";

class Vertex
{
    private static count : number = 0;

    readonly id: number;
    edge: Edge;
    position: vec3;
    bottom: boolean;    // used later to determine UV coordinates

    constructor(position?: vec3)
    {
        this.id = Vertex.count++;
        if (position)
        {
            this.position = position;
        }
    }
}

export default Vertex;