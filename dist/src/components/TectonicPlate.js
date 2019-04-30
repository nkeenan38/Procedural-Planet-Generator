import { Biome } from "../geometry/Face";
import { vec2, vec3 } from "gl-matrix";
import { randColor } from "../globals";
export var Crust;
(function (Crust) {
    Crust[Crust["Oceanic"] = 0] = "Oceanic";
    Crust[Crust["Continental"] = 1] = "Continental";
})(Crust || (Crust = {}));
class TectonicPlate {
    constructor() {
        this.faces = [];
        this.id = TectonicPlate.count++;
        this.elevation = Math.random();
        this.velocity = vec2.fromValues((Math.random() - 0.5) * 2, (Math.random() - 0.5) * 2);
        this.color = randColor();
        vec3.scale(this.color, this.color, (Math.random() / 2 + 0.5));
    }
    addFace(face) {
        this.faces.push(face);
        face.plate = this;
        face.elevation = this.elevation;
        face.color = this.color;
    }
    removeFace(face) {
        this.faces = this.faces.filter(f => f !== face);
        face.plate = null;
    }
    crust() {
        return (this.elevation > TectonicPlate.seaLevel) ? Crust.Continental : Crust.Oceanic;
    }
    oceanic() {
        return this.crust() === Crust.Oceanic;
    }
    continental() {
        return this.crust() === Crust.Continental;
    }
    boundary() {
        let boundary = [];
        for (let face of this.faces) {
            for (let neighbor of face.neighbors()) {
                if (neighbor.plate !== this) {
                    boundary.push(face);
                }
            }
        }
        return boundary;
    }
    lakes() {
        return this.faces.filter(f => f.biome === Biome.Water);
    }
    setElevations() {
        if (this.continental()) {
            let boundary = this.boundary();
            let visited = new Set(boundary);
            // iterate layer by layer towards the center of the plate
            // each layer's face's height is the weighted average of its height and the heights of its neighbors in the previous layer
            let queue = [];
            for (let face of boundary) {
                queue = queue.concat(face.neighbors().filter(neighbor => neighbor.plate === this && !visited.has(neighbor)));
            }
            let toAdd = [];
            while (true) {
                for (let face of queue) {
                    let count = 0;
                    let elevation = 0;
                    for (let neighbor of face.neighbors()) {
                        if (visited.has(neighbor)) {
                            count++;
                            elevation += neighbor.elevation;
                        }
                        else {
                            toAdd.push(neighbor);
                        }
                    }
                    face.elevation = 0.8 * face.elevation + 0.2 * (elevation / count);
                }
                for (let face of queue) {
                    visited.add(face);
                }
                queue = toAdd.filter(f => !visited.has(f));
                toAdd = [];
                if (queue.length == 0) {
                    break;
                }
            }
        }
        else {
            for (let face of this.faces) {
                if (face.elevation > TectonicPlate.seaLevel) {
                    face.biome = Biome.Tropics;
                    face.color = vec3.fromValues(200 / 255, 200 / 255, 100 / 255);
                }
                else {
                    face.biome = Biome.Water;
                    face.elevation = TectonicPlate.seaLevel;
                }
            }
        }
    }
}
TectonicPlate.count = 0;
TectonicPlate.seaLevel = 0.5;
export default TectonicPlate;
//# sourceMappingURL=TectonicPlate.js.map