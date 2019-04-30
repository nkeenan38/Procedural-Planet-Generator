import {vec3} from 'gl-matrix';
import Drawable from '../rendering/gl/Drawable';
import {gl} from '../globals';
import Edge from './Edge';
import TectonicPlate from '../components/TectonicPlate';

export enum Biome
{
    SnowyMountain,
    RockyMountain,
    Desert,
    Tundra,
    Grassland,
    Jungle,
    Forest,
    Water,
    Tropics,
}

class Face
{
    private static count = 0;

    readonly id : number;
    plate: TectonicPlate;
    elevation: number = 0;
    temperature: number = 0;
    precipitation: number = 0;
    biome: Biome;
    color : vec3;
    edge : Edge;
    tile: boolean; // effectively, is this face a top face or side face?

    constructor(color?: vec3)
    {
        this.id = Face.count++;
        if (color)
        {
            this.color = color;
        }
    }

    centroid(): vec3
    {
        let edge: Edge = this.edge;
        let centroid: vec3 = vec3.create();
        let count: number = 0;
        do
        {
            vec3.add(centroid, centroid, edge.vertex.position);
            count++;
        }
        while ((edge = edge.next) != this.edge);
        vec3.scale(centroid, centroid, 1/count);
        return centroid;
    }

    neighbors(): Face[]
    {
        let edge: Edge = this.edge;
        let neighbors: Set<Face> = new Set<Face>();
        do
        {
            neighbors.add(edge.sym.face);
        }
        while((edge = edge.next) != this.edge);
        return Array.from(neighbors);
    }

    // used for the hexagonal tiles
    // colors the sides to be the same color
    setColor(top: vec3, sides?: vec3): void
    {
        this.color = top;
        if (!sides) sides = top;
        if (!this.plate) return;
        let edge: Edge = this.edge;
        do
        {
            let side: Face = edge.sym.face;
            side.color = sides;
            side.biome = this.biome;
        }
        while ((edge = edge.next) != this.edge);
    }
}

export default Face;