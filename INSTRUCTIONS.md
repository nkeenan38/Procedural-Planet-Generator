Procedural Planet Generator
=====================================

Planet Geometry
------
To create the tiled sphere, I started with an icosahedron. The plan was to subdivide this icosahedron and get the dual polyhedron from that. A dual of a polyhedron is one where the vertices of one correspond to the faces of the other and the edges between pairs of vertices of one correspond to the edges between pairs of faces of the other. The dual of an icosahedron is a dodecahedron, but the dual of higher subdivisions create tiled spheres that consist mostly of hexagons.
