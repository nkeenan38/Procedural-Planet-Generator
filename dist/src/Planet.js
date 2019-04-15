import { Biome } from "./geometry/Face";
import { vec3, vec2 } from "gl-matrix";
import { mix } from "./globals";
import Geometry from "./geometry/Geometry";
import TectonicPlate from "./components/TectonicPlate";
import Temperature from "./components/Temperature";
import Precipitation from "./components/Precipitation";
class Planet extends Geometry {
    constructor() {
        super();
        this.tectonicPlates = new Set();
    }
    determineBiomes() {
        // temperature  // precipitation    // elevation
        for (let plate of this.tectonicPlates) {
            for (let face of plate.faces.filter(f => !f.biome)) {
                if (face.elevation > 1.1) {
                    face.biome = Biome.SnowyMountain;
                }
                else if (face.elevation > 0.75) {
                    face.biome = Biome.RockyMountain;
                }
                else {
                    if (face.precipitation == 0.0) {
                        face.biome = face.temperature > 0.25 ? Biome.SandDesert : Biome.IceDesert;
                    }
                    face.biome = Biome.Pasture;
                }
            }
        }
    }
    setTileColors(tileType) {
        switch (tileType) {
            case "Terrain":
                {
                    for (let plate of this.tectonicPlates) {
                        if (plate.oceanic()) {
                            for (let face of plate.faces) {
                                if (face.elevation > 0)
                                    face.setColor(vec3.fromValues(200 / 255, 200 / 255, 100 / 255));
                                else {
                                    let color = vec3.fromValues(0, 0.1, 0.9);
                                    vec3.scale(color, color, face.elevation + TectonicPlate.seaLevel);
                                    face.setColor(color);
                                }
                            }
                        }
                        else {
                            for (let face of plate.faces) {
                                switch (face.biome) {
                                    case Biome.SnowyMountain:
                                        {
                                            let color = vec3.fromValues(0.9, 0.9, 0.9);
                                            face.setColor(color);
                                            break;
                                        }
                                    case Biome.RockyMountain:
                                        {
                                            let color = vec3.fromValues(150 / 255, 90 / 255, 20 / 255);
                                            face.setColor(color);
                                            break;
                                        }
                                    case Biome.Lake:
                                        {
                                            let color = vec3.fromValues(0, .2, .8);
                                            face.setColor(color);
                                            break;
                                        }
                                    case (Biome.SandDesert):
                                        {
                                            let color = vec3.fromValues(250 / 255, 200 / 255);
                                            face.setColor(color);
                                            break;
                                        }
                                    case (Biome.IceDesert):
                                        {
                                            break;
                                        }
                                }
                                if (face.biome == Biome.SnowyMountain) {
                                    let color = vec3.fromValues(0.9, 0.9, 0.9);
                                    face.setColor(color);
                                    continue;
                                }
                                else if (face.biome == Biome.RockyMountain) {
                                    let color = vec3.fromValues(150 / 255, 90 / 255, 20 / 255);
                                    face.setColor(color);
                                    continue;
                                }
                                else if (face.biome == Biome.Lake) {
                                    let color = vec3.fromValues(0, .2, .8);
                                    face.setColor(color);
                                    continue;
                                }
                                let color = vec3.fromValues(0.1, 0.9, 0.0);
                                vec3.scale(color, color, face.elevation + TectonicPlate.seaLevel);
                                face.setColor(color);
                            }
                        }
                    }
                    break;
                }
            case "Tectonic Plates":
                {
                    for (let plate of this.tectonicPlates) {
                        for (let face of plate.faces) {
                            face.setColor(plate.color);
                        }
                    }
                    break;
                }
            case "Temperature":
                {
                    for (let plate of this.tectonicPlates) {
                        for (let face of plate.faces) {
                            face.setColor(mix(vec3.fromValues(0, 0, 1), vec3.fromValues(1, 0, 0), face.temperature));
                        }
                    }
                    break;
                }
            case "Precipitation":
                {
                    for (let plate of this.tectonicPlates) {
                        for (let face of plate.faces) {
                            face.setColor(mix(vec3.fromValues(1, 0, 0), vec3.fromValues(0, 0, 1), face.precipitation));
                        }
                    }
                    break;
                }
        }
    }
    createTectonicPlates(numPlates) {
        let origins = new Set();
        while (this.tectonicPlates.size < numPlates) {
            let index = Math.floor(Math.random() * this.faces.length);
            let face = this.faces[index];
            if (!origins.has(face)) {
                origins.add(face);
                let plate = new TectonicPlate();
                this.tectonicPlates.add(plate);
                plate.addFace(face);
            }
        }
        let queue = Array.from(origins);
        let toAdd = [];
        while (true) {
            let current = queue.pop();
            let plate = current.plate;
            for (let face of current.neighbors()) {
                if (face.plate)
                    continue;
                plate.addFace(face);
                toAdd.push(face);
                // face.color = current.color;
            }
            if (queue.length == 0) {
                if (toAdd.length == 0)
                    break;
                queue = toAdd;
                toAdd = [];
            }
        }
    }
    fixEdges() {
        for (let face of this.faces) {
            let otherPlates = face.neighbors().filter(n => n.plate !== face.plate);
            if (otherPlates.length >= 4) {
                face.plate.removeFace(face);
                otherPlates.pop().plate.addFace(face);
            }
        }
    }
    extrudeFaces() {
        let existing = Array.from(this.faces);
        for (let face of existing) {
            this.extrude(face, face.elevation * 0.1);
        }
    }
    computePlateBoundaries() {
        for (let plate of this.tectonicPlates) {
            let v1 = plate.velocity;
            for (let face of plate.boundary()) {
                let p1 = face.centroid();
                // the collisions aren't always consistent due to the geometry, so juse use the most common one
                // sliding: 0, diverge: 1, land->land: 2, ocean->land: 3, ocean->ocean: 4, 
                let pressure = 0;
                let count = 0;
                let otherPlate;
                for (let neighbor of face.neighbors()) {
                    if (neighbor.plate === plate)
                        continue;
                    otherPlate = neighbor.plate;
                    let p2 = neighbor.centroid();
                    let v2 = neighbor.plate.velocity;
                    let posDiff = vec2.create();
                    vec2.subtract(posDiff, vec2.fromValues(p1[0], p1[1]), vec2.fromValues(p2[0], p2[1]));
                    let posNorm = vec2.create();
                    vec2.normalize(posNorm, posDiff);
                    pressure += this.calculateStress(v1, v2, posDiff, posNorm);
                    count++;
                }
                pressure = pressure / count;
                let elevation = 0;
                if (pressure > 0.3) {
                    if (plate.continental() && otherPlate.continental()) {
                        elevation = Math.max(plate.elevation, otherPlate.elevation) + pressure * 2;
                    }
                    else if (plate.continental() && otherPlate.oceanic()) {
                        elevation = Math.max(plate.elevation, otherPlate.elevation) + pressure;
                    }
                    else if (plate.oceanic() && otherPlate.continental()) {
                        // elevation = (plate.elevation + otherPlate.elevation) / 2;
                        elevation = Math.min(plate.elevation, otherPlate.elevation) - pressure;
                    }
                    else if (plate.oceanic() && otherPlate.oceanic()) {
                        // elevation = (plate.elevation + otherPlate.elevation) / 2;
                        elevation = Math.max(plate.elevation, otherPlate.elevation) + pressure / 2;
                    }
                }
                else if (pressure < -0.3) {
                    elevation = Math.max(plate.elevation, otherPlate.elevation) - Math.exp(pressure / 4);
                    if (plate.continental() && otherPlate.continental())
                        face.biome = Biome.Lake;
                }
                else {
                    elevation = (plate.elevation + otherPlate.elevation) / 2;
                }
                elevation = Math.max(elevation, plate.continental() ? TectonicPlate.seaLevel * 1.1 : 0.0);
                face.elevation = elevation;
            }
        }
    }
    setElevation() {
        for (let plate of this.tectonicPlates) {
            plate.setElevations();
            for (let face of plate.faces) {
                face.elevation -= TectonicPlate.seaLevel;
            }
        }
    }
    calculateStress(thisVelocity, thatVelocity, positionDiff, positionNormal) {
        let relativeMovement = vec2.create();
        vec2.subtract(relativeMovement, thisVelocity, thatVelocity);
        let pressureVector = vec2.create();
        vec2.scale(pressureVector, positionNormal, vec2.dot(relativeMovement, positionNormal));
        let pressure = vec2.length(pressureVector);
        if (vec2.dot(pressureVector, positionNormal) > 0) {
            pressure = -pressure;
        }
        return 2 / (1 + Math.exp(-pressure)) - 1;
    }
    setPlanetTemperature() {
        for (let face of this.faces) {
            Temperature.setSurfaceTemperature(face);
        }
    }
    setPrecipitation() {
        Precipitation.setPrecipitation(Array.from(this.tectonicPlates));
    }
    blendTemperatureAndPrecipitation() {
        for (let plate of this.tectonicPlates) {
            if (plate.continental()) {
                for (let face of plate.faces) {
                    let precipitation = face.precipitation;
                    let temperature = face.temperature;
                    face.precipitation = Math.max(precipitation * Math.pow(temperature, 0.5), 0.0);
                    face.temperature = Math.max(temperature * Math.pow(1.0 - precipitation * 0.5, 0.5), 0.0);
                }
            }
            else {
                for (let face of plate.faces) {
                    let temperature = face.temperature;
                    face.temperature = temperature * Math.pow(0.5, 0.5);
                }
            }
        }
    }
}
export default Planet;
//# sourceMappingURL=Planet.js.map