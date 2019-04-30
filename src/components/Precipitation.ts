import TectonicPlate from "./TectonicPlate";
import Face, { Biome } from "../geometry/Face";

class Precipitation
{
    static setPrecipitation(tectonicPlates: TectonicPlate[])
    {
        for (let plate of tectonicPlates)
        {
            if (plate.oceanic())
            {
                for (let face of plate.faces)
                {
                    face.precipitation = 1.0;
                }
                for (let boundary of plate.boundary())
                {
                    let queue = boundary.neighbors().filter(n => n.plate !== plate && n.plate.continental());
                    let precipitation = 1.0;
                    let visited: Set<Face> = new Set<Face>();
                    let toAdd: Face[] = [];
                    while (queue.length > 0)
                    {
                        let face = queue.pop();
                        visited.add(face);
                        if (precipitation > face.precipitation)
                        {
                            face.precipitation = precipitation;
                            if (face.elevation <= 0.8)
                                toAdd = toAdd.concat(face.neighbors().filter(n => n.plate.continental() && !visited.has(n)));
                        }
                        if (queue.length == 0)
                        {
                            precipitation -= .05;
                            if (precipitation <= 0) break;
                            queue = toAdd;
                            toAdd = [];
                        }
                    }
                }
            }
            else
            {
                for (let lake of plate.lakes())
                {
                    lake.precipitation = 1.0;
                    let queue: Face[] = lake.neighbors().filter(n => n.biome !== Biome.Water);
                    let precipitation: number = 1.0;
                    let visited: Set<Face> = new Set<Face>();
                    let toAdd: Face[] = [];
                    while (queue.length > 0)
                    {
                        let face = queue.pop();
                        visited.add(face);
                        if (precipitation > face.precipitation)
                        {
                            face.precipitation = precipitation;
                            if (face.elevation <= 0.8)
                            {
                                toAdd = toAdd.concat(face.neighbors().filter(n => !visited.has(n)));
                            }
                        }
                        if (queue.length == 0)
                        {
                            precipitation -= 0.05;
                            if (precipitation <= 0) break;
                            queue = toAdd;
                            toAdd = [];
                        }
                    }
                }
            }
        }
    }
}

export default Precipitation;