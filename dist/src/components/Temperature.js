import { vec3 } from "gl-matrix";
class Temperature {
    static setSurfaceTemperature(face) {
        let surface = face.centroid();
        face.temperature = Math.max(1.0 - Math.abs(surface[1]), 0);
        face.temperature *= Math.min(1.5 - face.elevation, 1.0);
    }
}
Temperature.sun = vec3.fromValues(0, 0, 150);
export default Temperature;
//# sourceMappingURL=Temperature.js.map