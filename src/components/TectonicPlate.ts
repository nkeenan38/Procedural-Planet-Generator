import Face, { Biome } from "../geometry/Face";
import { vec2, vec3 } from "gl-matrix";
import { randColor } from "../globals";

export enum Crust
{
    Oceanic,
    Continental
}


class TectonicPlate
{
    static count: number = 0;
    static readonly seaLevel: number = 0.5;

    faces: Face[] = [];
    readonly id: number;
    readonly velocity: vec2;
    readonly elevation: number;
    color: vec3;// tmp

    constructor()
    {
        this.id = TectonicPlate.count++;
        this.elevation = Math.random();
        this.velocity = vec2.fromValues((Math.random() - 0.5) * 2, (Math.random() - 0.5) * 2);
        this.color = randColor();
        vec3.scale(this.color, this.color, (Math.random()/2 + 0.5));
    }

    addFace(face: Face): void
    {
        this.faces.push(face);
        face.plate = this;
        face.elevation = this.elevation;
        face.color = this.color;
    }

    removeFace(face: Face): void
    {
        this.faces = this.faces.filter(f => f !== face);
        face.plate = null;
    }

    crust(): Crust
    {
        return (this.elevation > TectonicPlate.seaLevel) ? Crust.Continental : Crust.Oceanic;
    }

    oceanic(): boolean
    {
        return this.crust() === Crust.Oceanic;
    }

    continental(): boolean
    {
        return this.crust() === Crust.Continental;
    }

    boundary(): Face[]
    {
        let boundary: Face[] = [];
        for (let face of this.faces)
        {
            for (let neighbor of face.neighbors())
            {
                if (neighbor.plate !== this)
                {
                    boundary.push(face);
                }
            }
        }
        return boundary;
    }

    lakes() : Face[]
    {
        return this.faces.filter(f => f.biome === Biome.Lake);
    }

    setElevations()
    {
        if (this.continental())
        {
            let boundary = this.boundary();
            let visited = new Set(boundary);
            // iterate layer by layer towards the center of the plate
            // each layer's face's height is the weighted average of its height and the heights of its neighbors in the previous layer
            let queue: Face[] = [];
            for (let face of boundary)
            {
                queue = queue.concat(face.neighbors().filter(neighbor => neighbor.plate === this && !visited.has(neighbor)));
            }
            let toAdd: Face[] = [];
            while (true)
            {
                for (let face of queue)
                {
                    let count = 0;
                    let elevation = 0;
                    for (let neighbor of face.neighbors())
                    {
                        if (visited.has(neighbor))
                        {
                            count++;
                            elevation += neighbor.elevation;
                        }
                        else
                        {
                            toAdd.push(neighbor);
                        }
                    }
                    face.elevation = 0.8 * face.elevation + 0.2 * (elevation / count);
                }
                for (let face of queue)
                {
                    visited.add(face);
                }
                queue = toAdd.filter(f => !visited.has(f));
                toAdd = [];
                if (queue.length == 0)
                {
                    break;
                }
            }
        }
        else
        {
            for (let face of this.faces)
            {
                if (face.elevation > TectonicPlate.seaLevel)
                {
                    face.color = vec3.fromValues(200/ 255, 200 / 255, 100/ 255);
                }
                else
                {
                    face.elevation = TectonicPlate.seaLevel;
                }
            }
        }
    }
}

export default TectonicPlate;