import { vec3 } from "gl-matrix";
import Face from "../geometry/Face";
import { mix } from "../globals";

class Temperature
{
    static readonly sun : vec3 = vec3.fromValues(0, 0, 150);

    static setSurfaceTemperature(face: Face) : void
    {
        let surface: vec3 = face.centroid();
        face.temperature = 1.0 - Math.abs(surface[1]);
        // face.color = mix(vec3.fromValues(0, 0, 1), vec3.fromValues(1, 0, 0), face.temperature);
    }
}

export default Temperature;