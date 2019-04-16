# version 300 es
precision highp float;

// This is a fragment shader. If you've opened this file first, please
// open and read lambert.vert.glsl before reading on.
// Unlike the vertex shader, the fragment shader actually does compute
// the shading of geometry. For every pixel in your program's output
// screen, the fragment shader is run for every bit of geometry that
// particular pixel overlaps. By implicitly interpolating the position
// data passed into the fragment shader by the vertex shader, the fragment shader
// can compute what color to apply to its pixel based on things like vertex
// position, light position, and vertex color.

uniform vec4 u_Color; // The color with which to render this instance of geometry.

// These are the interpolated values out of the rasterizer, so you can't know
// their specific values without knowing the vertices that contributed to them
in vec4 fs_Pos;
in vec4 fs_Nor;
in vec4 fs_LightVec;
in vec4 fs_Col;
in vec2 fs_UV;
flat in uint fs_Biome;

out vec4 out_Col; // This is the final output color that you will see on your
                  // screen for the pixel that is currently being processed.

const float PI = 3.14159265359;
const float TWO_PI = 6.28318530718;
const float FOUR_PI = 12.5663706144;
const float EIGHT_PI = 25.1327412287;

const vec4 KEY_LIGHT = vec4(0.0, 0.0, 10000000.0, 1.0);

vec4 getColorFromBiome()
{
    switch (fs_Biome)
    {
        case uint(0):   // Snow Mountain
            if (sin(fs_UV.x * TWO_PI) * 0.05 + sin(fs_UV.x * FOUR_PI) * 0.05 + fs_UV.y > 0.7) 
                return fs_Col;
            return vec4(0.4, 0.35, 0.3, 1.0);
        case uint(1):   // Rocky Mountain
            if (sin(fs_UV.x * TWO_PI) * 0.05 + sin(fs_UV.x * FOUR_PI) * 0.05 + sin(fs_UV.x * EIGHT_PI) * 0.05 + fs_UV.y > 0.7) 
                return fs_Col;
            return vec4(0.4, 0.35, 0.3, 1.0);
        case uint(2):   // Desert
            return vec4(0.95, 0.85, 0.25, 1.0);
        case uint(4):   // Grassland
            if (sin(fs_UV.x * TWO_PI) * 0.05 + fs_UV.y > 0.6) 
                return fs_Col;
            return vec4(0.5, 0.35, 0.1, 1.0);
        case uint(5):   // Jungle
            if (sin(fs_UV.x * TWO_PI) * 0.05 + fs_UV.y > 0.6) 
                return fs_Col;
            return vec4(0.5, 0.35, 0.1, 1.0);
        case uint(6):   // Forest
            if (sin(fs_UV.x * TWO_PI) * 0.05 + fs_UV.y > 0.6) 
                return fs_Col;
            return vec4(0.5, 0.35, 0.1, 1.0);
    }
    return fs_Col;
}



void main()
{
    // Material base color (before shading)
    vec4 diffuseColor = getColorFromBiome();

    // Calculate the diffuse term for Lambert shading
    float diffuseTerm = dot(normalize(fs_Nor), normalize(KEY_LIGHT));
    // Avoid negative lighting values
    diffuseTerm = clamp(diffuseTerm, 0.0, 1.0);

    float ambientTerm = 0.2;

    float lightIntensity = clamp(diffuseTerm + ambientTerm, 0.0, 1.0);   //Add a small float value to the color multiplier
                                                        //to simulate ambient lighting. This ensures that faces that are not
                                                        //lit by our point light are not completely black.

    // Compute final shaded color
    out_Col = vec4(diffuseColor.rgb * lightIntensity, diffuseColor.a);
}
