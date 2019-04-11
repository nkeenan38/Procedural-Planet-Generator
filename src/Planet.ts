import Face from "./geometry/Face";
import Edge from "./geometry/Edge";
import Vertex from "./geometry/Vertex";
import Drawable from "./rendering/gl/Drawable";
import { vec3, vec4, vec2 } from "gl-matrix";
import { gl, readTextFile, randColor, mix } from "./globals";
import Geometry from "./geometry/Geometry";
import TectonicPlate, {Crust} from "./components/TectonicPlate";
import Temperature from "./components/Temperature";

class Planet extends Geometry
{   
    private tectonicPlates: Set<TectonicPlate> = new Set<TectonicPlate>()

    constructor()
    {
        super();
    }

    setTileColors(tileType: string)
    {
        switch (tileType)
        {
            case "Terrain":
            {
                for (let plate of this.tectonicPlates)
                {
                    if (plate.oceanic())
                    {
                        for (let face of plate.faces)
                        {
                            if (face.elevation > 0) face.setColor(vec3.fromValues(200/255, 200/255, 100/255));
                            else 
                            {
                                let color = vec3.fromValues(0, 0.1, 0.9);
                                vec3.scale(color, color, face.elevation + TectonicPlate.seaLevel);
                                face.setColor(color);
                            }
                        }
                    }
                    else
                    {
                        for (let face of plate.faces)
                        {
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
                for (let plate of this.tectonicPlates)
                {
                    for (let face of plate.faces)
                    {
                        face.setColor(plate.color);
                    }
                }
                break;
            }
            case "Temperature":
            {
                for (let plate of this.tectonicPlates)
                {
                    for (let face of plate.faces)
                    {
                        face.setColor(mix(vec3.fromValues(0, 0, 1), vec3.fromValues(1, 0, 0), face.temperature));
                    }
                }
                break;
            }
            case "Precipitation":
            {
                break;
            }
        }
    }

    createTectonicPlates(numPlates: number): void
    {
        let origins: Set<Face> = new Set<Face>();
        while (this.tectonicPlates.size < numPlates)
        {
            let index: number = Math.floor(Math.random() * this.faces.length);
            let face: Face = this.faces[index];
            if (!origins.has(face))
            {
                origins.add(face);
                let plate: TectonicPlate = new TectonicPlate();
                this.tectonicPlates.add(plate);
                plate.addFace(face);
            }
        }
        let queue: Face[] = Array.from(origins);
        let toAdd: Face[] = [];
        while (true)
        {
            let current: Face = queue.pop();
            let plate: TectonicPlate = current.plate;
            for (let face of current.neighbors())
            {
                if (face.plate) continue;
                plate.addFace(face);
                toAdd.push(face);
                // face.color = current.color;
            }
            if (queue.length == 0)
            {
                if (toAdd.length == 0) break;
                queue = toAdd;
                toAdd = [];
            }
        }
    }

    fixEdges()
    {
        for (let face of this.faces)
        {
            let otherPlates = face.neighbors().filter(n => n.plate !== face.plate);
            if (otherPlates.length >= 4)
            {
                face.plate.removeFace(face);
                otherPlates.pop().plate.addFace(face);
            }
        }
    }

    extrudeFaces()
    {
        let existing: Face[] = Array.from(this.faces);
        for (let face of existing)
        {
            this.extrude(face, face.elevation * 0.1);
        }
    }

    computePlateBoundaries()
    {
        for (let plate of this.tectonicPlates)
        {
            let v1: vec2 = plate.velocity;
            for (let face of plate.boundary())
            {
                let p1: vec3 = face.centroid();
                // the collisions aren't always consistent dur othe geometry, so juse use the most common one
                // sliding: 0, diverge: 1, land->land: 2, ocean->land: 3, ocean->ocean: 4, 
                let pressure: number = 0;
                let count: number = 0;
                let otherPlate: TectonicPlate;
                for (let neighbor of face.neighbors())
                {
                    if (neighbor.plate === plate) continue;
                    otherPlate = neighbor.plate;
                    let p2: vec3 = neighbor.centroid();
                    let v2: vec2 = neighbor.plate.velocity;
                    let posDiff: vec2 = vec2.create();
                    vec2.subtract(posDiff, vec2.fromValues(p1[0], p1[1]), vec2.fromValues(p2[0], p2[1]));
                    let posNorm: vec2 = vec2.create();
                    vec2.normalize(posNorm, posDiff);
                    pressure += this.calculateStress(v1, v2, posDiff, posNorm);
                    count++;
                }
                pressure = pressure / count;
                let elevation: number = 0;
                if (pressure > 0.3)
                {
                    if (plate.continental() && otherPlate.continental())
                    {
                        elevation = Math.max(plate.elevation, otherPlate.elevation) + pressure*2;
                    }
                    else if (plate.continental() && otherPlate.oceanic())
                    {
                        elevation = Math.max(plate.elevation, otherPlate.elevation) + pressure;
                    }
                    else if (plate.oceanic() && otherPlate.continental())
                    {
                        // elevation = (plate.elevation + otherPlate.elevation) / 2;
                        elevation = Math.min(plate.elevation, otherPlate.elevation) - pressure;
                    }
                    else if (plate.oceanic() && otherPlate.oceanic())
                    {
                        // elevation = (plate.elevation + otherPlate.elevation) / 2;
                        elevation = Math.max(plate.elevation, otherPlate.elevation) + pressure/2;
                    }
                }
                else if (pressure < -0.3)
                {
                    elevation = Math.max(plate.elevation, otherPlate.elevation) - Math.exp(pressure/4);
                }
                else
                {
                    elevation = (plate.elevation + otherPlate.elevation) / 2;
                }
                elevation = Math.max(elevation, plate.continental() ? TectonicPlate.seaLevel * 1.1 : 0.0);
                face.elevation = elevation;
            }
        }
    }

    setElevation()
    {
        for (let plate of this.tectonicPlates)
        {
            plate.setElevations();
            for (let face of plate.faces)
            {
                face.elevation -= TectonicPlate.seaLevel;
            }
        }
    }
        
    calculateStress(thisVelocity: vec2, thatVelocity: vec2, positionDiff: vec2, positionNormal: vec2)
    {
        let relativeMovement: vec2 = vec2.create();
        vec2.subtract(relativeMovement, thisVelocity, thatVelocity);
        let pressureVector = vec2.create();
        vec2.scale(pressureVector, positionNormal, vec2.dot(relativeMovement, positionNormal));
        let pressure = vec2.length(pressureVector);
        if (vec2.dot(pressureVector, positionNormal) > 0) 
        {
            pressure = -pressure;
        }
        // let shear: vec2 = vec2.create();
        // vec2.scale(shear, positionDiff, vec2.dot(relativeMovement, positionDiff));
        // return { pressure: 2 / (1 + Math.exp(-pressure / 30)) - 1, shear: 2 / (1 + Math.exp(-shear / 30)) - 1 };
        // return pressure;
        return  2 / (1 + Math.exp(-pressure)) - 1;
    }

    setPlanetTemperature()
    {
        for (let face of this.faces)
        {
            Temperature.setSurfaceTemperature(face);
        }
    }
}

export default Planet;