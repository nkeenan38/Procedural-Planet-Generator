import {vec3} from 'gl-matrix';
import Drawable from '../rendering/gl/Drawable';
import {gl} from '../globals';
import Edge from './Edge';

enum Biome
{
    Grassland,
    Ranforest,
    Desert,
    SnowyMountain,
    RockyMountain,
    Tundra,
    Water
}

class Face
{
    private static count = 0;

    readonly id : number;
    biome: Biome;
    color : vec3;
    edge : Edge;

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
}

export default Face;