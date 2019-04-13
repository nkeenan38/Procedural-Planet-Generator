class Precipitation {
    static setPrecipitation(tectonicPlates) {
        for (let plate of tectonicPlates.filter(p => p.oceanic())) {
            for (let face of plate.faces) {
                face.precipitation = 1.0;
            }
            for (let boundary of plate.boundary()) {
                let queue = boundary.neighbors().filter(n => n.plate !== plate && n.plate.continental());
                let precipitation = 1.0;
                let visited = new Set();
                let toAdd = [];
                while (queue.length > 0) {
                    let face = queue.pop();
                    visited.add(face);
                    if (precipitation > face.precipitation) {
                        face.precipitation = precipitation;
                        if (face.elevation <= 0.8)
                            toAdd = toAdd.concat(face.neighbors().filter(n => n.plate.continental() && !visited.has(n)));
                    }
                    if (queue.length == 0) {
                        precipitation -= .05;
                        if (precipitation <= 0)
                            break;
                        queue = toAdd;
                        toAdd = [];
                    }
                }
            }
        }
    }
}
export default Precipitation;
//# sourceMappingURL=Precipitation.js.map