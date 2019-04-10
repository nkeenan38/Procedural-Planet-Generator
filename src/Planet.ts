import Face from "./geometry/Face";
import Edge from "./geometry/Edge";
import Vertex from "./geometry/Vertex";
import Drawable from "./rendering/gl/Drawable";
import { vec3, vec4, vec2 } from "gl-matrix";
import { gl, readTextFile, randColor } from "./globals";
import Geometry from "./geometry/Geometry";

class Planet extends Geometry
{   
    constructor()
    {
        super();
    }
}

export default Planet;