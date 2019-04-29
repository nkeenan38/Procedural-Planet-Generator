import { vec3 } from 'gl-matrix';
export var Biome;
(function (Biome) {
    Biome[Biome["SnowyMountain"] = 0] = "SnowyMountain";
    Biome[Biome["RockyMountain"] = 1] = "RockyMountain";
    Biome[Biome["Desert"] = 2] = "Desert";
    Biome[Biome["Tundra"] = 3] = "Tundra";
    Biome[Biome["Grassland"] = 4] = "Grassland";
    Biome[Biome["Jungle"] = 5] = "Jungle";
    Biome[Biome["Forest"] = 6] = "Forest";
    Biome[Biome["Lake"] = 7] = "Lake";
    Biome[Biome["Ocean"] = 8] = "Ocean";
    Biome[Biome["Tropics"] = 9] = "Tropics";
    Biome[Biome["Surface"] = 10] = "Surface";
})(Biome || (Biome = {}));
class Face {
    constructor(color) {
        this.elevation = 0;
        this.temperature = 0;
        this.precipitation = 0;
        this.id = Face.count++;
        if (color) {
            this.color = color;
        }
    }
    centroid() {
        let edge = this.edge;
        let centroid = vec3.create();
        let count = 0;
        do {
            vec3.add(centroid, centroid, edge.vertex.position);
            count++;
        } while ((edge = edge.next) != this.edge);
        vec3.scale(centroid, centroid, 1 / count);
        return centroid;
    }
    neighbors() {
        let edge = this.edge;
        let neighbors = new Set();
        do {
            neighbors.add(edge.sym.face);
        } while ((edge = edge.next) != this.edge);
        return Array.from(neighbors);
    }
    // used for the hexagonal tiles
    // colors the sides to be the same color
    setColor(top, sides) {
        this.color = top;
        if (!sides)
            sides = top;
        if (!this.plate)
            return;
        let edge = this.edge;
        do {
            let side = edge.sym.face;
            side.color = sides;
            side.biome = this.biome;
        } while ((edge = edge.next) != this.edge);
    }
}
Face.count = 0;
export default Face;
//# sourceMappingURL=Face.js.map